'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { getPromoCodes, createPromoCode, togglePromoCodeActive, deletePromoCode } from '@/shared/api/promoApi';
import { modalService } from '@/shared/ui/Modal/modalService';
import { formatPrice } from '@/shared/lib/formatPrice';

type Props = { showToast: (msg: string, type?: 'success' | 'error') => void };

const defaultForm = {
  code: '',
  discountType: 'PERCENT' as 'PERCENT' | 'FIXED',
  discountValue: 10,
  maxUses: '',
  expiresAt: '',
};

export default function PromoTab({ showToast }: Props) {
  const { lang, t } = useLanguage();
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [promoForm, setPromoForm] = useState(defaultForm);
  const [isPromoFormOpen, setIsPromoFormOpen] = useState(false);

  const loadPromoCodes = async () => {
    try {
      setPromoCodes(await getPromoCodes());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const handleCreate = async () => {
    if (!promoForm.code) return;
    await createPromoCode({
      code: promoForm.code,
      discountType: promoForm.discountType,
      discountValue: promoForm.discountValue,
      maxUses: promoForm.maxUses ? Number(promoForm.maxUses) : undefined,
      expiresAt: promoForm.expiresAt || undefined,
    });
    setPromoCodes(await getPromoCodes());
    setPromoForm(defaultForm);
    setIsPromoFormOpen(false);
    showToast(t.admin.itemSaved, 'success');
  };

  return (
    <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--color-text)' }}>
          {t.admin.promoTitle}
        </h3>
        <button
          className="btn btn-sm px-3 rounded-pill"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }}
          onClick={() => setIsPromoFormOpen(!isPromoFormOpen)}
        >
          <i className="bi bi-plus-lg me-1"></i>
          {t.admin.promoAddNew}
        </button>
      </div>

      {isPromoFormOpen && (
        <div
          className="card border-0 p-3 mb-4"
          style={{
            borderRadius: '12px',
            backgroundColor: 'var(--color-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-bold">{t.admin.promoCode}</label>
              <input
                type="text"
                className="form-control"
                placeholder="YOGA2024"
                value={promoForm.code}
                onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-bold">{t.admin.promoType}</label>
              <select
                className="form-select"
                value={promoForm.discountType}
                onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value as 'PERCENT' | 'FIXED' })}
              >
                <option value="PERCENT">{t.admin.promoPercent} (%)</option>
                <option value="FIXED">
                  {t.admin.promoFixed} ({lang === 'en' ? '$' : '₴'})
                </option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-bold">{t.admin.promoValue}</label>
              <input
                type="number"
                className="form-control"
                value={promoForm.discountValue}
                onChange={(e) => setPromoForm({ ...promoForm, discountValue: Number(e.target.value) })}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-bold">{t.admin.promoMaxUses}</label>
              <input
                type="number"
                className="form-control"
                placeholder={t.admin.promoUnlimited}
                value={promoForm.maxUses}
                onChange={(e) => setPromoForm({ ...promoForm, maxUses: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">{t.admin.promoExpires}</label>
              <input
                type="date"
                className="form-control"
                value={promoForm.expiresAt}
                onChange={(e) => setPromoForm({ ...promoForm, expiresAt: e.target.value })}
              />
            </div>
            <div className="col-12">
              <button
                className="btn btn-sm px-4 rounded-pill"
                style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }}
                onClick={handleCreate}
              >
                {t.admin.formSave}
              </button>
              <button
                className="btn btn-sm ms-2 px-4 rounded-pill"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                onClick={() => setIsPromoFormOpen(false)}
              >
                {t.admin.formCancel}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>{t.admin.promoCode}</th>
              <th>{t.admin.promoType}</th>
              <th>{t.admin.promoValue}</th>
              <th>{t.admin.promoUsed}</th>
              <th>{t.admin.promoExpires}</th>
              <th>{t.admin.promoActive}</th>
              <th className="text-end">{t.admin.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {promoCodes.map((promo) => (
              <tr key={promo.id}>
                <td>
                  <code style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{promo.code}</code>
                </td>
                <td>{promo.discountType === 'PERCENT' ? t.admin.promoPercent : t.admin.promoFixed}</td>
                <td>
                  {promo.discountType === 'PERCENT'
                    ? `${promo.discountValue}%`
                    : formatPrice(promo.discountValue, lang)}
                </td>
                <td>
                  {promo.usedCount}
                  {promo.maxUses ? ` / ${promo.maxUses}` : ''}
                </td>
                <td>{promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : t.admin.promoNoExpiry}</td>
                <td>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={promo.isActive}
                      onChange={async () => {
                        await togglePromoCodeActive(promo.id, !promo.isActive);
                        setPromoCodes(await getPromoCodes());
                      }}
                    />
                  </div>
                </td>
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-danger rounded-pill"
                    onClick={async () => {
                      if (!(await modalService.confirm('', t.admin.promoConfirmDel))) return;
                      await deletePromoCode(promo.id);
                      setPromoCodes(await getPromoCodes());
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {promoCodes.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                  {t.admin.promoNoData}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
