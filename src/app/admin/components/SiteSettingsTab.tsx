"use client";

import { useState, useEffect } from "react";
import { getSiteSettings, updateSiteSettings } from "@/shared/api/siteSettingsApi";
import { useLanguage } from "@/shared/i18n/LanguageContext";

type Props = {
  showToast: (msg: string, type?: 'success' | 'error') => void;
};

export default function SiteSettingsTab({ showToast }: Props) {
  const { t } = useLanguage();
  const [addressLine, setAddressLine] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [telegram, setTelegram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [yearsExp, setYearsExp] = useState("5+");
  const [studentsCount, setStudentsCount] = useState("10k+");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteSettings().then(s => {
      setAddressLine(s.addressLine);
      setEmail(s.email);
      setPhone(s.phone);
      setInstagram(s.instagram);
      setTelegram(s.telegram);
      setYoutube(s.youtube);
      setYearsExp(s.yearsExp || "5+");
      setStudentsCount(s.studentsCount || "10k+");
    }).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateSiteSettings({ addressLine, email, phone, instagram, telegram, youtube, yearsExp, studentsCount });
      if (res.success) {
        showToast(t.admin.settingsSaved, 'success');
      } else {
        showToast(res.error || t.admin.settingsError, 'error');
      }
    } catch {
      showToast(t.admin.settingsError, 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { border: '1px solid var(--color-border)', borderRadius: '10px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' };

  return (
    <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h3 className="h5 fw-bold mb-4" style={{ color: 'var(--color-text)' }}>{t.admin.tabSettings}</h3>
      <form onSubmit={handleSave}>
        <div className="row g-3">
          <div className="col-12">
            <h6 className="fw-semibold text-muted text-uppercase small mb-3" style={{ letterSpacing: '1px' }}>{t.admin.settingsContactSection}</h6>
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold" style={{ color: 'var(--color-text-muted)' }}>{t.admin.settingsAddress}</label>
            <input type="text" className="form-control" style={inputStyle} value={addressLine} onChange={e => setAddressLine(e.target.value)} placeholder="г. Киев, ул. Примерная, 1" />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold" style={{ color: 'var(--color-text-muted)' }}>{t.admin.settingsEmail}</label>
            <input type="email" className="form-control" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@yoga.life" />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold" style={{ color: 'var(--color-text-muted)' }}>{t.admin.settingsPhone}</label>
            <input type="text" className="form-control" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+380 XX XXX XXXX" />
          </div>

          <div className="col-12 mt-2">
            <h6 className="fw-semibold text-muted text-uppercase small mb-3" style={{ letterSpacing: '1px' }}>{t.admin.settingsSocialSection}</h6>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold" style={{ color: 'var(--color-text-muted)' }}>Instagram URL</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-instagram"></i></span>
              <input type="url" className="form-control" style={inputStyle} value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold" style={{ color: 'var(--color-text-muted)' }}>Telegram URL</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-telegram"></i></span>
              <input type="url" className="form-control" style={inputStyle} value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="https://t.me/..." />
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold" style={{ color: 'var(--color-text-muted)' }}>YouTube URL</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-youtube"></i></span>
              <input type="url" className="form-control" style={inputStyle} value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="https://youtube.com/..." />
            </div>
          </div>

          <div className="col-12 mt-2">
            <h6 className="fw-semibold text-muted text-uppercase small mb-3" style={{ letterSpacing: '1px' }}>{t.admin.settingsAboutSection}</h6>
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold" style={{ color: 'var(--color-text-muted)' }}>{t.admin.settingsYearsExp}</label>
            <input type="text" className="form-control" style={inputStyle} value={yearsExp} onChange={e => setYearsExp(e.target.value)} placeholder="5+" />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold" style={{ color: 'var(--color-text-muted)' }}>{t.admin.settingsStudentsCount}</label>
            <input type="text" className="form-control" style={inputStyle} value={studentsCount} onChange={e => setStudentsCount(e.target.value)} placeholder="10k+" />
          </div>

          <div className="col-12 mt-3">
            <button type="submit" className="btn btn-primary-custom rounded-pill px-4 py-2 fw-semibold" disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>{t.common.loading}</> : t.admin.settingsSaveBtn}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
