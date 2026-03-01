const fs = require('fs');
const path = './src/app/login/page.tsx';
let content = fs.readFileSync(path, 'utf-8');

// Fix Password Label
content = content.replace(
    /isForgotPasswordMode \? 'Новый пароль' : \(\(t as any\).auth \? \(t as any\).auth.passwordLabel : 'Пароль'\)/g,
    `isForgotPasswordMode ? 'Новый пароль' : ((t as any).auth ? (t as any).auth.passwordLabel : 'Пароль')`
);

fs.writeFileSync(path, content);
console.log('Login label fixed');
