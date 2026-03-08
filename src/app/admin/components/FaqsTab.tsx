'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { getFAQs, addFAQ, updateFAQ, deleteFAQ, FAQ } from '@/shared/api/faqApi';
import { modalService } from '@/shared/ui/Modal/modalService';
import { translateObjectFields } from './translateUtils';

type Props = { showToast: (msg: string, type?: 'success' | 'error') => void };

export default function FaqsTab({ showToast }: Props) {
  const { t } = useLanguage();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      setFaqs(await getFAQs());
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
      await deleteFAQ(id);
      await loadFaqs();
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
      const faqData = await translateObjectFields({ question: data.title, answer: data.description });
      if (editingItem) await updateFAQ(editingItem.id, faqData);
      else await addFAQ(faqData);
      await loadFaqs();
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
                <label className="form-label">{t.admin.formQuestion}</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  required
                  defaultValue={editingItem?.question || ''}
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">{t.admin.formAnswer}</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={3}
                  required
                  defaultValue={editingItem?.answer || ''}
                ></textarea>
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
                  <th>{t.admin.colQuestion}</th>
                  <th>{t.admin.colAnswer}</th>
                  <th className="text-end">{t.admin.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.question}</td>
                    <td className="text-truncate" style={{ maxWidth: '200px' }}>
                      {item.answer}
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
                {faqs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
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
