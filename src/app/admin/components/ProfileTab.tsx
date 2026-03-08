'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { changePassword, getMyProfile, updateMyProfile } from '@/shared/api/authActions';
import { bulkUpdateAuthor } from '@/shared/api/adminApi';
import { uploadImageToCloud } from '@/shared/api/uploadApi';
import { modalService } from '@/shared/ui/Modal/modalService';

type AdminProfile = { name: string; email: string; phone: string; photoUrl: string };
type Props = {
  session: any;
  updateSession: () => Promise<any>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onProfileStatusChange: (saved: boolean, edited: boolean) => void;
  onProfileSaved: (profile: AdminProfile) => void;
  initialProfile: AdminProfile;
};

export default function ProfileTab({
  session,
  updateSession,
  showToast,
  onProfileStatusChange,
  onProfileSaved,
  initialProfile,
}: Props) {
  const { t } = useLanguage();
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(initialProfile);
  const [isProfileEdited, setIsProfileEdited] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Keep local profile in sync if initialProfile changes (e.g. on mount)
  useEffect(() => {
    setAdminProfile(initialProfile);
  }, [initialProfile]);

  const setEdited = (profile: AdminProfile) => {
    setAdminProfile(profile);
    setIsProfileEdited(true);
    onProfileStatusChange(false, true);
  };

  const handleProfileSave = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (
      !adminProfile.name ||
      !adminProfile.photoUrl ||
      adminProfile.name.trim() === '' ||
      adminProfile.photoUrl.trim() === ''
    ) {
      showToast(t.admin.reqFields, 'error');
      return;
    }
    try {
      const username = session?.user?.username || 'admin';
      const oldProfile = await getMyProfile(username);
      let oldAuthorName = 'Админ сайта';
      if (oldProfile?.name) oldAuthorName = `${oldProfile.name} (Админ сайта)`;

      await updateMyProfile(username, {
        name: adminProfile.name,
        email: adminProfile.email,
        phone: adminProfile.phone,
        avatar: adminProfile.photoUrl,
      });
      await updateSession();
      window.dispatchEvent(new CustomEvent('profile_updated'));

      const authorName = `${adminProfile.name} (Админ сайта)`;
      await bulkUpdateAuthor(authorName, adminProfile.photoUrl, oldAuthorName);

      setIsProfileEdited(false);
      setIsProfileSaved(true);
      onProfileStatusChange(true, false);
      onProfileSaved(adminProfile);
      setTimeout(() => {
        setIsProfileSaved(false);
        onProfileStatusChange(false, false);
      }, 3000);
      showToast(t.admin.profileSaved, 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast(t.admin.errSaveImg, 'error');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    const username = session?.user?.username || 'admin';
    const res = await changePassword(username, oldPassword, newPassword);
    if (res.success) {
      setIsPasswordChanged(true);
      setPasswordError(null);
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setIsPasswordChanged(false), 3000);
    } else {
      setPasswordError(res.error || t.admin.errPasswordChange);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        let w = img.width,
          h = img.height;
        if (w > h) {
          if (w > MAX) {
            h *= MAX / w;
            w = MAX;
          }
        } else {
          if (h > MAX) {
            w *= MAX / h;
            h = MAX;
          }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        uploadImageToCloud(dataUrl)
          .then((cloudUrl) => setEdited({ ...adminProfile, photoUrl: cloudUrl }))
          .catch((err) => {
            console.error('Cloudinary fallback', err);
            setEdited({ ...adminProfile, photoUrl: dataUrl });
          });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--color-text)' }}>
          {t.admin.profileManage}
        </h3>
      </div>
      <div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-bold">
              {t.admin.profileName} <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={adminProfile.name}
              onChange={(e) => setEdited({ ...adminProfile, name: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">{t.admin.profileEmail}</label>
            <input
              type="email"
              className="form-control"
              value={adminProfile.email}
              onChange={(e) => setEdited({ ...adminProfile, email: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">{t.admin.profilePhone}</label>
            <input
              type="tel"
              className="form-control"
              value={adminProfile.phone}
              onChange={(e) => setEdited({ ...adminProfile, phone: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">
              {t.admin.profilePhoto} <span className="text-danger">*</span>
            </label>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder={t.admin.profilePhotoPlaceholder}
                value={adminProfile.photoUrl}
                onChange={(e) => setEdited({ ...adminProfile, photoUrl: e.target.value })}
              />
              <label
                className="btn btn-outline-secondary text-nowrap d-flex align-items-center"
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-upload me-2"></i>
                {t.admin.profileFromPc}
                <input type="file" accept="image/*" className="d-none" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
          <div className="col-12 mt-4 d-flex align-items-center gap-3">
            <button
              type="button"
              onClick={handleProfileSave}
              className="btn px-4 rounded-pill"
              style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }}
            >
              {t.admin.btnSaveProfile}
            </button>
            {isProfileSaved && (
              <div
                className="d-flex align-items-center fw-medium"
                style={{ color: '#198754', animation: 'fadeIn 0.3s ease' }}
              >
                <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                {t.admin.profileChangesApplied}
              </div>
            )}

            <hr className="my-5 w-100" />
          </div>
        </div>

        <h5 className="fw-bold mb-4" style={{ color: 'var(--color-text)' }}>
          {t.admin.profileChangePassword}
        </h5>
        <form onSubmit={handlePasswordChange}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">{t.admin.profileCurrentPass}</label>
              <input
                type="password"
                className="form-control"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">{t.admin.profileNewPass}</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="col-12 mt-4 d-flex align-items-center gap-3">
              <button
                type="submit"
                className="btn rounded-pill px-4"
                style={{
                  border: '2px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                  backgroundColor: 'transparent',
                }}
              >
                {t.admin.profileChangeBtn}
              </button>
              {isPasswordChanged && (
                <div className="fw-medium" style={{ color: '#198754' }}>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {t.admin.profilePassChanged}
                </div>
              )}
              {passwordError && (
                <div className="fw-medium" style={{ color: '#dc3545' }}>
                  <i className="bi bi-exclamation-circle-fill me-2"></i>
                  {passwordError}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
