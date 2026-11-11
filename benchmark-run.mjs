import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const repositories = [
  'anthropics/skills', 'openai/skills', 'vercel-labs/agent-skills',
  'obra/superpowers', 'trailofbits/skills', 'hashicorp/agent-skills',
  'huggingface/skills', 'remotion-dev/skills', 'supabase/agent-skills', 'getsentry/skills',
];
const scannerRoot = path.resolve(process.env.SCANNER_ROOT || '_scanner');
const { scan } = await import(pathToFileURL(path.join(scannerRoot, 'preflight.mjs')));
const output = path.resolve('benchmark-results');
fs.mkdirSync(output, { recursive: true });
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'preflight-benchmark-'));
const git = (args, cwd) => {
  const result = spawnSync('git', ['-c', 'core.hooksPath=/dev/null', ...args], { cwd, encoding:'utf8', maxBuffer:1024*1024, timeout:120000, env:{...process.env,GIT_TERMINAL_PROMPT:'0'} });
  if (result.status !== 0) throw new Error(`git ${args[0]} failed (no source scripts executed).`);
  return result.stdout.trim();
};
const scannerCommit = git(['rev-parse','HEAD'],scannerRoot);
const report = { date:new Date().toISOString(), scannerCommit, scannerVersion:JSON.parse(fs.readFileSync(path.join(scannerRoot,'package.json'),'utf8')).version,
  method:'Convenience sample of ten public repositories. Full default-branch snapshots; all discovered SKILL.md files scanned. Repository scripts are never executed. Findings are hypotheses until manually reviewed.', repositories:[] };
const token = randomUUID();
process.stdout.write(`::stop-commands::${token}\n`);
try {
  for (const repo of repositories) {
    const root = path.join(scratch, repo.replace('/','--'));
    fs.mkdirSync(root);
    git(['init','--quiet'],root);
    git(['remote','add','origin',`https://github.com/${repo}.git`],root);
    git(['fetch','--quiet','--depth=1','origin','main'],root);
    git(['checkout','--quiet','--detach','FETCH_HEAD'],root);
    const commit = git(['rev-parse','HEAD'],root);
    const result = scan(root);
    const findings = result.findings.map((finding,index) => {
      const source = path.join(root,finding.file);
      let context = [];
      if (fs.existsSync(source) && fs.statSync(source).isFile()) {
        const lines = fs.readFileSync(source,'utf8').replace(/\r\n/g,'\n').split('\n');
        context = lines.slice(Math.max(0,finding.line-2),finding.line+1).map((text,i)=>({line:Math.max(1,finding.line-1)+i,text:text.slice(0,240)}));
      }
      return { id:`${repo}#${index+1}`, ...finding, source:`https://github.com/${repo}/blob/${commit}/${finding.file}#L${finding.line}`, context };
    });
    report.repositories.push({repo,commit,url:`https://github.com/${repo}/tree/${commit}`,skills:result.skills,errors:result.errors,warnings:result.warnings,findings});
    console.log(JSON.stringify({repo,commit,skills:result.skills,errors:result.errors,warnings:result.warnings}));
  }
  report.totals = report.repositories.reduce((total,r)=>({repositories:total.repositories+1,skills:total.skills+r.skills,errors:total.errors+r.errors,warnings:total.warnings+r.warnings}),{repositories:0,skills:0,errors:0,warnings:0});
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2)+'\n');
  const table = '# Skill Preflight benchmark\n\nRaw automated findings, not confirmed upstream bugs or customer adoption.\n\n| Repository | Commit | Skills | Errors | Warnings |\n|---|---|---:|---:|---:|\n'+report.repositories.map(r=>`| ${r.repo} | ${r.commit} | ${r.skills} | ${r.errors} | ${r.warnings} |`).join('\n')+'\n\n'+JSON.stringify(report.totals)+'\n';
  fs.writeFileSync(path.join(output,'summary.md'),table);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,table);
  console.log('BENCHMARK_TOTALS '+JSON.stringify(report.totals));
} finally {
  process.stdout.write(`::${token}::\n`);
  fs.rmSync(scratch,{recursive:true,force:true});
}
