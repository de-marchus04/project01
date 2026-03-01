const fs = require('fs');
const authPath = 'src/app/api/auth/[...nextauth]/route.ts';

let content = fs.readFileSync(authPath, 'utf8');

if (!content.includes('export const dynamic = "force-dynamic"')) {
    content = 'export const dynamic = "force-dynamic";\n' + content;
    fs.writeFileSync(authPath, content, 'utf8');
}
