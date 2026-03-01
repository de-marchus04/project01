const fs = require('fs');

const file = 'src/app/courses-beginners/CoursesBeginnersClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/if \(isInitialLoad\)\s*\{\s*setIsInitialLoad\(false\);\s*return;\s*\/\/\s*Пропускаем.*?\n\s*\}/g, '');
// just replace the exact lines manually:
content = content.replace(/if \(isInitialLoad\) \{\s*setIsInitialLoad\(false\);\s*return;[^\n]*\n\s*\}/g, '');

fs.writeFileSync(file, content, 'utf8');
