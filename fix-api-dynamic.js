const fs = require('fs');

const registerPath = 'src/app/api/auth/register/route.ts';
let content = fs.readFileSync(registerPath, 'utf8');

if (!content.includes('export const dynamic')) {
    content = 'export const dynamic = "force-dynamic";\n' + content;
    fs.writeFileSync(registerPath, content, 'utf8');
}
