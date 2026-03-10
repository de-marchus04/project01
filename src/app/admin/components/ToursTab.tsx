'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { getAllTours, addTour, updateTour, deleteTour } from '@/shared/api/tourApi';
import type { Tour } from '@/entities/tour/model/types';
import { modalService } from '@/shared/ui/Modal/modalService';
import { formatPrice } from '@/shared/lib/formatPrice';
import { translateObjectFields } from './translateUtils';
import { handleMainImageUpload } from './imageUploadUtils';

type AdminProfile = { name: string; photoUrl: string };
type Props = {
  adminProfile: AdminProfile;
  showToast: (msg: string, type?: 'success' | 'error') => void;
};

export default function ToursTab({ adminProfile, showToast }: Props) {
  const { lang, t } = useLanguage();
  const [tours, setTours] = useState<Tour[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      setTours(await getAllTours());
    } catch (e) {
      console.error(e);
    }
  };

  const openAddForm = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };
  const openEditForm = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };
  const closeForm = () => {
    setEditingItem(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!(await modalService.confirm('', t.admin.confirmDel))) return;
    try {
      await deleteTour(id);
      await loadTours();
    } catch (e) {
      console.error(e);
      await modalService.alert('', t.admin.errDel);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries()) as any;
    try {
      const authorName =
        data.authorName?.trim() || (adminProfile.name ? `${adminProfile.name} (Админ сайта)` : 'Админ сайта');
      const authorPhoto = data.authorPhotoUrl?.trim() || adminProfile.photoUrl || '';
      const featuresArray = data.features
        ? String(data.features)
            .split('\n')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];
      const tourData = await translateObjectFields({
        title: data.title,
        description: data.description,
        fullDescription: data.fullDescription,
        features: featuresArray,
        price: Number(data.price),
        imageUrl: data.imageUrl,
        date: data.date,
        location: data.location,
        author: authorName,
        authorPhoto,
        isActive: data.isActive === 'true',
      });
      if (editingItem) await updateTour(editingItem.id, tourData);
      else await addTour(tourData);
      await loadTours();
      showToast(t.admin.itemSaved, 'success');
      if (!editingItem) closeForm();
    } catch (e) {
      console.error(e);
      await modalService.alert('', t.admin.errSave);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isFormOpen && (
        <div
          className="card border-0 p-4 mb-4"
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--color-text)' }}>
              {editingItem ? t.admin.modeEdit : t.admin.modeAdd}
            </h3>
            <button type="button" className="btn-close" onClick={closeForm}></button>
          </div>
          <form onSubmit={handleSave}>
            <div className="row g-3">
              <div className="col-md-12">
                <label className="form-label">{t.admin.formTitleLabel}</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  required
                  defaultValue={editingItem?.title || ''}
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">{t.admin.formDesc}</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={3}
                  required
                  defaultValue={editingItem?.description || ''}
                ></textarea>
              </div>
              <div className="col-md-12">
                <label className="form-label">{t.admin.formFullDesc}</label>
                <textarea
                  name="fullDescription"
                  className="form-control"
                  rows={5}
                  defaultValue={editingItem?.fullDescription || ''}
                ></textarea>
              </div>
              <div className="col-md-12">
                <label className="form-label">{t.admin.formFeatures}</label>
                <textarea
                  name="features"
                  className="form-control"
                  rows={4}
                  defaultValue={
                    Array.isArray(editingItem?.features) ? editingItem.features.join('\n') : editingItem?.features || ''
                  }
                  placeholder={t.admin.formFeaturesPlaceholder}
                ></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  {t.admin.formPrice} ({lang === 'en' ? '$' : '₴'})
                </label>
                <input
                  type="number"
                  name="price"
                  className="form-control"
                  required
                  defaultValue={editingItem?.price || ''}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  {t.admin.formImageUrl} <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    id="mainImageUrlInput"
                    name="imageUrl"
                    className="form-control"
                    required
                    defaultValue={editingItem?.imageUrl || ''}
                  />
                  <label
                    className="btn btn-outline-secondary text-nowrap d-flex align-items-center"
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-upload me-2"></i>
                    {t.admin.formFromPc}
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={(e) => handleMainImageUpload(e, t.admin.uploading)}
                    />
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">{t.admin.formDates}</label>
                <input
                  type="text"
                  name="date"
                  className="form-control"
                  required
                  defaultValue={editingItem?.date || ''}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">{t.admin.formLocation}</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  required
                  defaultValue={editingItem?.location || ''}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">{t.admin.formAuthorName}</label>
                <input
                  type="text"
                  name="authorName"
                  className="form-control"
                  defaultValue={editingItem?.author || ''}
                  placeholder={adminProfile.name || ''}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">{t.admin.formAuthorPhoto}</label>
                <input
                  type="text"
                  name="authorPhotoUrl"
                  className="form-control"
                  defaultValue={editingItem?.authorPhoto || ''}
                  placeholder={adminProfile.photoUrl || ''}
                />
              </div>
              <div className="col-md-12">
                <div className="form-check form-switch mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="tourIsActive"
                    name="isActive"
                    value="true"
                    defaultChecked={editingItem ? editingItem.isActive !== false : true}
                  />
                  <label className="form-check-label" htmlFor="tourIsActive">
                    Активный тур (показывать на сайте)
                  </label>
                </div>
              </div>
              <div className="col-12 mt-4">
                <button
                  type="submit"
                  className="btn px-4 rounded-pill"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t.admin.formSaving : t.admin.formSave}
                </button>
                <button
                  type="button"
                  className="btn ms-2 px-4 rounded-pill"
                  style={{
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                    backgroundColor: 'transparent',
                  }}
                  onClick={closeForm}
                >
                  {t.admin.formCancel}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {!isFormOpen && (
        <section
          className="card border-0 p-4"
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--color-text)' }}>
              {t.admin.manage}
            </h3>
            <button
              className="btn btn-sm px-3 rounded-pill"
              style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }}
              onClick={openAddForm}
            >
              <i className="bi bi-plus-lg"></i> {t.admin.addBtn}
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>{t.admin.colTitle}</th>
                  <th>{t.admin.colDates}</th>
                  <th>{t.admin.colLocation}</th>
                  <th>{t.admin.colPrice}</th>
                  <th>Статус</th>
                  <th className="text-end">{t.admin.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((item) => (
                  <tr key={item.id} style={{ opacity: item.isActive === false ? 0.5 : 1 }}>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.date}</td>
                    <td>{item.location}</td>
                    <td>{formatPrice(item.price, lang)}</td>
                    <td>
                      <button
                        className={`badge border-0 rounded-pill px-2 py-1`}
                        style={{
                          backgroundColor:
                            item.isActive !== false ? 'var(--bs-success-bg-subtle)' : 'var(--bs-danger-bg-subtle)',
                          color:
                            item.isActive !== false
                              ? 'var(--bs-success-text-emphasis)'
                              : 'var(--bs-danger-text-emphasis)',
                          cursor: 'pointer',
                        }}
                        onClick={() => updateTour(item.id, { isActive: item.isActive === false }).then(loadTours)}
                        title="Нажмите для переключения"
                      >
                        {item.isActive !== false ? 'Активен' : 'Скрыт'}
                      </button>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditForm(item)}>
                        {t.admin.btnEdit}
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}>
                        {t.admin.btnDel}
                      </button>
                    </td>
                  </tr>
                ))}
                {tours.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                      {t.admin.noData}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
