const fs = require('fs');
const path = './src/app/login/page.tsx';
let content = fs.readFileSync(path, 'utf-8');

if (!content.includes('import { resetPassword }')) {
    content = content.replace(
        'import { authApi } from "@/shared/api/authApi";',
        'import { authApi } from "@/shared/api/authApi";\nimport { resetPassword } from "@/shared/api/authActions";'
    );
}

if (!content.includes('const [isForgotPasswordMode, setIsForgotPasswordMode]')) {
    content = content.replace(
        'const [isRegisterMode, setIsRegisterMode] = useState(false);',
        'const [isRegisterMode, setIsRegisterMode] = useState(false);\n  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);'
    );
}

// Add condition in handleAuth
if (!content.includes('if (isForgotPasswordMode) {')) {
    content = content.replace(
        '    try {\n      if (isRegisterMode) {',
        `    try {
      if (isForgotPasswordMode) {
        const res = await resetPassword(username, password);
        if (res.success) {
          setError(null);
          alert("Пароль успешно изменён! Теперь вы можете войти.");
          setIsForgotPasswordMode(false);
          setPassword("");
        } else {
          setError(res.error || "Ошибка смены пароля");
        }
        return;
      }
      if (isRegisterMode) {`
    );
}

// Add visual title
content = content.replace(
    `const { t, tStr } = useLanguage();`,
    `const { t, tStr } = useLanguage();`
);

// We need to carefully replace the title renderer
if (content.includes(`isRegisterMode ? ((t as any).auth ? (t as any).auth.registerTitle : 'Регистрация') : ((t as any).auth ? (t as any).auth.loginTitle : 'Вход')`)) {
    content = content.replace(
        `isRegisterMode ? ((t as any).auth ? (t as any).auth.registerTitle : 'Регистрация') : ((t as any).auth ? (t as any).auth.loginTitle : 'Вход')`,
        `isForgotPasswordMode ? 'Сброс пароля' : (isRegisterMode ? ((t as any).auth ? (t as any).auth.registerTitle : 'Регистрация') : ((t as any).auth ? (t as any).auth.loginTitle : 'Вход'))`
    );
}

if (content.includes(`isRegisterMode ? ((t as any).auth ? (t as any).auth.registerSubtitle : 'Добро пожаловать!') : ((t as any).auth ? (t as any).auth.loginSubtitle : 'С возвращением!')`)) {
    content = content.replace(
        `isRegisterMode ? ((t as any).auth ? (t as any).auth.registerSubtitle : 'Добро пожаловать!') : ((t as any).auth ? (t as any).auth.loginSubtitle : 'С возвращением!')`,
        `isForgotPasswordMode ? 'Придумайте новый пароль' : (isRegisterMode ? ((t as any).auth ? (t as any).auth.registerSubtitle : 'Добро пожаловать!') : ((t as any).auth ? (t as any).auth.loginSubtitle : 'С возвращением!'))`
    );
}

// Fix password label to "Новый пароль" if in forgot password mode
content = content.replace(
    `{(t as any).auth ? (t as any).auth.passwordLabel : 'Пароль'}`,
    `isForgotPasswordMode ? 'Новый пароль' : ((t as any).auth ? (t as any).auth.passwordLabel : 'Пароль')`
);

// Fix button text
content = content.replace(
    `isRegisterMode ? ((t as any).auth ? (t as any).auth.btnRegister : 'Создать аккаунт') : ((t as any).auth ? (t as any).auth.btnLogin : 'Войти')`,
    `isForgotPasswordMode ? 'Сохранить пароль' : (isRegisterMode ? ((t as any).auth ? (t as any).auth.btnRegister : 'Создать аккаунт') : ((t as any).auth ? (t as any).auth.btnLogin : 'Войти'))`
);

// Disable Forgot Password info texts below
const replaceStr = `                      {isRegisterMode ? ((t as any).auth ? (t as any).auth.linkToLogin : 'Уже есть аккаунт? Войти') : ((t as any).auth ? (t as any).auth.linkToRegister : 'Нет аккаунта? Зарегистрироваться')}`;
const toStr = `                      {isForgotPasswordMode ? 'Вернуться ко входу' : (isRegisterMode ? ((t as any).auth ? (t as any).auth.linkToLogin : 'Уже есть аккаунт? Войти') : ((t as any).auth ? (t as any).auth.linkToRegister : 'Нет аккаунта? Зарегистрироваться'))}`;
if (content.includes(replaceStr)) {
    content = content.replace(replaceStr, toStr);
}

// Add logic to swap modal view
const swapLogicReplace = `setIsRegisterMode(!isRegisterMode);
                        setError(null);
                        setAttempts(0);`;
const swapLogicTo = `if (isForgotPasswordMode) {
                          setIsForgotPasswordMode(false);
                        } else {
                          setIsRegisterMode(!isRegisterMode);
                        }
                        setError(null);
                        setAttempts(0);`;
if (content.includes(swapLogicReplace)) {
    content = content.replace(swapLogicReplace, swapLogicTo);
}

// Add the forget password link
const forgotPswdUI = `
                    {!isForgotPasswordMode && !isRegisterMode && (
                      <div className="text-center mt-3">
                        <button type="button" className="btn btn-link text-muted small" onClick={() => {setIsForgotPasswordMode(true); setError(null);}}>
                          Забыли пароль?
                        </button>
                      </div>
                    )}
`;
const insertionTarget = `                  <div className="text-center mt-4 pt-3 border-top">`;
if (content.includes(insertionTarget)) {
    content = content.replace(insertionTarget, forgotPswdUI + '\n' + insertionTarget);
}

fs.writeFileSync(path, content);
console.log('Login patched');
