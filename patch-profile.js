const fs = require('fs');
const path = './src/app/profile/page.tsx';
let content = fs.readFileSync(path, 'utf-8');

if (!content.includes('import { changePassword }')) {
    content = content.replace(
        'import Image from "next/image";',
        'import Image from "next/image";\nimport { changePassword } from "@/shared/api/authActions";'
    );
}

if (!content.includes('const [oldPassword, setOldPassword] = useState')) {
    content = content.replace(
        'const [isProfileSaved, setIsProfileSaved] = useState(false);',
        'const [isProfileSaved, setIsProfileSaved] = useState(false);\n  const [oldPassword, setOldPassword] = useState("");\n  const [newPassword, setNewPassword] = useState("");\n  const [isPasswordChanged, setIsPasswordChanged] = useState(false);\n  const [passwordError, setPasswordError] = useState<string | null>(null);'
    );
}

if (!content.includes('const handlePasswordChange')) {
    content = content.replace(
        'const handleProfileSave = (e: React.FormEvent | React.MouseEvent) => {',
        `const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    
    // We assume the user's login is stored in user.username
    const userJson = localStorage.getItem('yoga_user');
    if (!userJson) return;
    const userData = JSON.parse(userJson);
    
    const res = await changePassword(userData.username, oldPassword, newPassword);
    if (res.success) {
      setIsPasswordChanged(true);
      setPasswordError(null);
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setIsPasswordChanged(false), 3000);
    } else {
      setPasswordError(res.error || "Ошибка смены пароля");
    }
  };

  const handleProfileSave = (e: React.FormEvent | React.MouseEvent) => {`
    );
}

const passwordUI = `
                            <hr className="my-5" />
                            <h5 className="font-playfair fw-bold mb-4">Смена пароля</h5>
                            <form onSubmit={handlePasswordChange}>
                              <div className="row g-4">
                                <div className="col-md-6">
                                  <label className="form-label fw-bold">Текущий пароль</label>
                                  <input type="password" className="form-control" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label fw-bold">Новый пароль</label>
                                  <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                </div>
                                <div className="col-12 mt-4 d-flex align-items-center gap-3">
                                  <button type="submit" className="btn btn-outline-dark rounded-pill px-4">Сменить пароль</button>
                                  {isPasswordChanged && (
                                    <div className="text-success fw-medium"><i className="bi bi-check-circle-fill me-2"></i>Пароль успешно изменён!</div>
                                  )}
                                  {passwordError && (
                                    <div className="text-danger fw-medium"><i className="bi bi-exclamation-circle-fill me-2"></i>{passwordError}</div>
                                  )}
                                </div>
                              </div>
                            </form>
`;

// Find where to insert it in `activeTab === 'settings'`. We'll just put it before the last closing `</div>` of settings tab content
const targetSettingEnd = `                            </div>
                          </div>
                        </div>
                      </div>
                    )}`;

if (content.includes(targetSettingEnd) && !content.includes('Смена пароля')) {
    content = content.replace(targetSettingEnd, passwordUI + '\n' + targetSettingEnd);
}

fs.writeFileSync(path, content);
console.log('Profile patched');
