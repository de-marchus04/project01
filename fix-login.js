const fs = require('fs');
const path = './src/app/login/page.tsx';
let content = fs.readFileSync(path, 'utf-8');

// Fix title
content = content.replace(
    /isForgotPasswordMode \? 'Сброс пароля' : \(isForgotPasswordMode \? 'Сброс пароля' : \(isRegisterMode \? \(\(t as any\).auth \? \(t as any\).auth.registerTitle : 'Регистрация'\) : \(\(t as any\).auth \? \(t as any\).auth.loginTitle : 'Вход'\)\)\)/g,
    `isForgotPasswordMode ? 'Сброс пароля' : (isRegisterMode ? ((t as any).auth ? (t as any).auth.registerTitle : 'Регистрация') : ((t as any).auth ? (t as any).auth.loginTitle : 'Вход'))`
);

// Fix subtitle
content = content.replace(
    /isForgotPasswordMode \? 'Придумайте новый пароль' : \(isForgotPasswordMode \? 'Придумайте новый пароль' : \(isRegisterMode \? \(\(t as any\).auth \? \(t as any\).auth.registerSubtitle : 'Добро пожаловать!'\) : \(\(t as any\).auth \? \(t as any\).auth.loginSubtitle : 'С возвращением!'\)\)\)/g,
    `isForgotPasswordMode ? 'Придумайте новый пароль' : (isRegisterMode ? ((t as any).auth ? (t as any).auth.registerSubtitle : 'Добро пожаловать!') : ((t as any).auth ? (t as any).auth.loginSubtitle : 'С возвращением!'))`
);

// Fix button
content = content.replace(
    /isForgotPasswordMode \? 'Сохранить пароль' : \(isForgotPasswordMode \? 'Сохранить пароль' : \(isRegisterMode \? \(\(t as any\).auth \? \(t as any\).auth.btnRegister : 'Создать аккаунт'\) : \(\(t as any\).auth \? \(t as any\).auth.btnLogin : 'Войти'\)\)\)/g,
    `isForgotPasswordMode ? 'Сохранить пароль' : (isRegisterMode ? ((t as any).auth ? (t as any).auth.btnRegister : 'Создать аккаунт') : ((t as any).auth ? (t as any).auth.btnLogin : 'Войти'))`
);

// Fix duplicated forgot password block
const duplicateBlockStr = `                    {!isForgotPasswordMode && !isRegisterMode && (
                      <div className="text-center mt-3">
                        <button type="button" className="btn btn-link text-muted small" onClick={() => {setIsForgotPasswordMode(true); setError(null);}}>
                          Забыли пароль?
                        </button>
                      </div>
                    )}`;

const firstIndex = content.indexOf(duplicateBlockStr);
if (firstIndex !== -1) {
    const secondIndex = content.indexOf(duplicateBlockStr, firstIndex + duplicateBlockStr.length);
    if (secondIndex !== -1) {
        content = content.slice(0, secondIndex) + content.slice(secondIndex + duplicateBlockStr.length);
    }
}

fs.writeFileSync(path, content);
console.log('Login component fixed');
