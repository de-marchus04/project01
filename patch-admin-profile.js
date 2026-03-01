const fs = require('fs');
const path = './src/app/admin/page.tsx';
let content = fs.readFileSync(path, 'utf-8');

if (!content.includes('import { changePassword }')) {
    content = content.replace(
        'import { bulkUpdateAuthor } from "@/shared/api/adminApi";',
        'import { bulkUpdateAuthor } from "@/shared/api/adminApi";\nimport { changePassword } from "@/shared/api/authActions";'
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
        'const handleProfileSave = async (e: React.FormEvent | React.MouseEvent) => {',
        `const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    
    const userJson = localStorage.getItem('yoga_user');
    const username = userJson ? JSON.parse(userJson).username : 'admin';
    
    const res = await changePassword(username, oldPassword, newPassword);
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

  const handleProfileSave = async (e: React.FormEvent | React.MouseEvent) => {`
    );
}

const adminPasswordUI = `
                <hr className="my-5" />
                <h5 className="fw-bold mb-4">Смена пароля администратора</h5>
                <form onSubmit={handlePasswordChange}>
                  <div className="row g-3">
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

const endOfProfilePane = `                  </div>
                </div>
              </div>
            </section>
          )}

        </main>
      </div>`;

if (content.includes('              </div>\n            </section>')) {
  // We'll replace the closing of that specific section. 
  // Let's do a reliable replacement around `1048`
  const exactEnd = `                  </div>
                </div>
              </div>
            </section>`;
            
  if (!content.includes('Смена пароля администратора')) {
    content = content.replace(exactEnd, adminPasswordUI + '\n' + exactEnd);
  }
}

fs.writeFileSync(path, content);
console.log('Admin Profile patched');
