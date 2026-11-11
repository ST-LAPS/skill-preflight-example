# اختبار Skill Preflight على عشرة مستودعات — 2026-11-11

**النتيجة الأهم: كشف الاختبار إنذارات خاطئة في أداتنا، ولم يثبت وجود أخطاء بنيوية فعلية في المستودعات المختبرة.** الإصدار المصحح يحافظ على كشف الملفات المفقودة الحقيقية في اختبارات الانحدار، ويقلل الاتهامات الخاطئة.

## النطاق والمنهج

- عينة قصدية متنوعة من عشرة مستودعات عامة، وليست عينة إحصائية ممثلة للسوق.
- فحص 278 ملف SKILL.md داخل نسخ مستودعات كاملة على Linux. لم تُشغّل سكربتات أو تعليمات هذه المستودعات.
- تثبيت commit لكل مستودع، والتأكد من تطابقه وعدد المهارات بين القياسين.
- الفحص الأول: v0.3.0 عند 7320cb943779d92e2e11c6df5d0180f705850130. الفحص المصحح: v0.3.1 عند fbf6cfbc6afa54d759110e8c5006f80ee36b1f80.
- المراجعة تصنيف محافظ لكل ملاحظة حسب القاعدة والسياق المبلغ عنه، مع فحص المصادر للحالات الخاطئة. ليست تدقيقًا كاملًا لكل الوثائق أو تشغيلًا سلوكيًا للمهارات.

## المقارنة

| المستودع — رابط النسخة الثابتة | ملفات المهارات | أخطاء قبل | أخطاء بعد | تحذيرات قبل | تحذيرات بعد |
|---|---:|---:|---:|---:|---:|
| [anthropics/skills](https://github.com/anthropics/skills/tree/2c5958ecac7cee2b583967a2c4981d0f4a75c579) | 20 | 1 | 0 | 8 | 9 |
| [openai/skills](https://github.com/openai/skills/tree/49f948faa9258a0c61caceaf225e179651397431) | 44 | 0 | 0 | 30 | 30 |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62) | 9 | 2 | 0 | 9 | 9 |
| [obra/superpowers](https://github.com/obra/superpowers/tree/22f0b463e7a5e579904dd6211a520321035526f7) | 15 | 0 | 0 | 4 | 4 |
| [trailofbits/skills](https://github.com/trailofbits/skills/tree/e4dd0bb5b15535f7c5a0834187dffba6ac37e4ff) | 98 | 34 | 0 | 82 | 81 |
| [hashicorp/agent-skills](https://github.com/hashicorp/agent-skills/tree/5e30fa5c867ba6777c37e4206babfd08049c396f) | 20 | 0 | 0 | 16 | 16 |
| [huggingface/skills](https://github.com/huggingface/skills/tree/25910b3d0ba31a2ba102f901cdc9e008c278a69c) | 26 | 0 | 0 | 12 | 12 |
| [remotion-dev/skills](https://github.com/remotion-dev/skills/tree/1fc074b74b95cfecf7b1e419132f2cfe23dafebe) | 13 | 0 | 0 | 6 | 6 |
| [supabase/agent-skills](https://github.com/supabase/agent-skills/tree/c9be0e931b7930f7d02126d04774d904c381e7d7) | 2 | 0 | 0 | 0 | 0 |
| [getsentry/skills](https://github.com/getsentry/skills/tree/e94f22214528d69899d09c627b3315ddc3544816) | 31 | 0 | 0 | 8 | 8 |
| الإجمالي | 278 | 37 | 0 | 175 | 175 |

تساوي عدد التحذيرات لا يعني تطابقها: أزيل تحذيران خاطئان، وأضيف تحذير لقالب URL التعليمي بدل الخطأ، ورُصد أمر POSIX إضافي. كل الملاحظات وروابط أسطر المصدر وتصنيفها محفوظة في [ملف البيانات](benchmark-2026-11-11.json).

## ما الذي أصلحناه؟

| النوع | العدد | الحكم والإجراء |
|---|---:|---|
| روابط تبدأ بـ {baseDir}/ | 34 | كانت أخطاء زائفة؛ حُلّت نسبةً إلى مجلد المهارة مع استمرار فحص الحدود، وتأكد وجود أهدافها على النسخ نفسها. |
| وصف YAML متعدد الأسطر بلا علامة كتلة | 2 | وصفان صحيحان في Vercel؛ أصلح المحلل وأضيفت اختبارات. |
| قالب [Title](URL) | 1 | مثال تعليمي؛ تحول من خطأ ملف مفقود إلى تحذير غير قابل للتحقق. |
| نص تعليمي وسجل مخرجات | 2 | كانا يُقرآن كأوامر POSIX؛ أصلح التعرف على بداية الأمر. |

هذه **39 ملاحظة أولية زائفة**: 37 خطأ وتحذيران. لا تُنسب كعيوب إلى أصحاب المستودعات. التغييرات موثقة في [CHANGELOG](https://github.com/ST-LAPS/skill-preflight/blob/main/CHANGELOG.md)، واجتازت [32 اختبارًا وفحوص Action على Windows وLinux](https://github.com/ST-LAPS/skill-preflight/actions/runs/43009123101).

## كيف نقرأ التحذيرات المتبقية؟

- **89 ملاحظة متطلبات غير مؤكدة:** عدم العثور على متطلب تحت عنوان معروف لا يثبت غيابه من بقية الوثائق أو بيئة المضيف. لم نعتبرها مشكلات مؤكدة.
- **85 ملاحظة توافق مشروطة:** أمثلة POSIX قابلة للمراجعة إذا كان دعم Windows مطلوبًا. قد يكون Linux أو macOS مقصودًا وموثقًا؛ لم نعتبرها أعطالًا.
- **تحذير قالب واحد:** رابط تعليمي لا يُفحص كملف فعلي.

صفر أخطاء في الفحص المصحح يخص القواعد المحدودة المدعومة فقط، ولا يعني أن المستودعات بلا عيوب. لم نقس recall أو الأداء السلوكي أو الأمان الشامل، ولم نثبت كل التحذيرات يدويًا كعيوب حقيقية.

## الأدلة وإعادة الاختبار

- [الفحص الأول](https://github.com/ST-LAPS/skill-preflight-example/actions/runs/43008060439).
- [الفحص المصحح على commits نفسها](https://github.com/ST-LAPS/skill-preflight-example/actions/runs/43009352045).
- [قائمة النسخ الثابتة](benchmark-manifest.json).
- [برنامج المقارنة](benchmark-run.mjs) و[سير العمل](.github/workflows/benchmark.yml).

لتكرار المقارنة، شغّل سير العمل على النسخ الثابتة واختر commit الفاحص المطلوب في خطوة checkout. لا تستخدم آخر نسخة متحركة للمصادر عند إجراء مقارنة قبل/بعد. تحتوي البيانات الدائمة على الملاحظات وتصنيفها وروابط المصدر؛ مخرجات Actions الخام المؤقتة ليست النسخة الوحيدة للسجل.

## القرار التجاري

هذا اختبار جودة داخلي من ناشر الأداة، وليس عشرة مستخدمين أو عشرة عملاء. لا توجد في هذه العينة أخطاء ملفات مؤكدة يمكن استخدامها كادعاء تسويقي. تحسن الاعتمادية مبرر لنشر التصحيح، لكنه لا يثبت الاستعداد للدفع. الخطوة التالية تجربة مع مالك مستودع فعلي وقياس فائدة الملاحظات والعودة للاستخدام قبل بناء الاشتراكات. لم نرسل رسائل أو نفتح Issues أو PRs في المستودعات الخارجية.

## English interpretation

Ten public repositories, 278 skills, identical source commits across both phases. All 37 baseline error-level findings were false positives: 34 baseDir references, two valid multiline plain descriptions, and one illustrative URL placeholder. Two portability false positives were removed. The corrected scanner reports zero errors and 175 review warnings (89 unconfirmed prerequisite hints, 85 conditional POSIX portability hints, one illustrative placeholder). No upstream runtime bugs, customer adoption, market demand, or willingness to pay were established. This convenience sample is not a precision/recall study, security audit, or representative market survey.
