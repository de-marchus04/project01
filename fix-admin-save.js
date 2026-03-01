const fs = require('fs');
const path = './src/app/admin/page.tsx';
let content = fs.readFileSync(path, 'utf-8');

if (!content.includes('import { bulkUpdateAuthor }')) {
    content = content.replace(
        'import { formatPrice } from "@/shared/lib/formatPrice";',
        'import { formatPrice } from "@/shared/lib/formatPrice";\nimport { bulkUpdateAuthor } from "@/shared/api/adminApi";'
    );
}

content = content.replace(
    /const handleProfileSave = \(e: React\.FormEvent \| React\.MouseEvent\) => \{[\s\S]*?setIsProfileEdited\(false\);[\s\S]*?setIsProfileSaved\(true\);/,
    `const handleProfileSave = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    
    if (!adminProfile.name || !adminProfile.photoUrl || adminProfile.name.trim() === '' || adminProfile.photoUrl.trim() === '') {
      setToastMessage(t.admin.reqFields);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      const userJson = localStorage.getItem('yoga_user');
      const username = userJson ? JSON.parse(userJson).username : 'admin';
      
      const oldProfileJson = localStorage.getItem(\`profile_\${username}\`);
      let oldAuthorName = 'Админ сайта';
      if (oldProfileJson) {
        const oldProfile = JSON.parse(oldProfileJson);
        if (oldProfile.name) {
          oldAuthorName = \`\${oldProfile.name} (Админ сайта)\`;
        }
      }
      
      localStorage.setItem(\`profile_\${username}\`, JSON.stringify(adminProfile));
      
      const authorName = \`\${adminProfile.name} (Админ сайта)\`;
      
      // Вызываем серверный экшен для обновления всех статей, курсов БД
      await bulkUpdateAuthor(authorName, adminProfile.photoUrl, oldAuthorName);

      // Принудительно обновляем Header, вызывая событие storage
      window.dispatchEvent(new Event('storage'));

      setIsProfileEdited(false);
      setIsProfileSaved(true);`
);

fs.writeFileSync(path, content);
console.log('Fixed admin save');
