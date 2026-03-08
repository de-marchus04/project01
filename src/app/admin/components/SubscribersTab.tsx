'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { getAllSubscribers, deleteSubscriber } from '@/shared/api/subscriberApi';
import type { Subscriber } from '@/shared/api/subscriberApi';
import { modalService } from '@/shared/ui/Modal/modalService';

type Props = { showToast: (msg: string, type?: 'success' | 'error') => void };

export default function SubscribersTab({ showToast }: Props) {
  const { t } = useLanguage();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  const loadSubscribers = async () => {
    try {
      setSubscribers(await getAllSubscribers());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  return (
    <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--color-text)' }}>
          {t.admin.subsTitle}
        </h3>
        <span
          className="badge rounded-pill px-3 py-2"
          style={{
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-primary)',
            fontSize: '0.85rem',
            border: '1px solid var(--color-border)',
          }}
        >
          {t.admin.subsTotal}: {subscribers.length}
        </span>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>{t.admin.subsEmail}</th>
              <th>{t.admin.subsDate}</th>
              <th className="text-end">{t.admin.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub, idx) => (
              <tr key={sub.id}>
                <td>{idx + 1}</td>
                <td>{sub.email}</td>
                <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-danger rounded-pill"
                    onClick={async () => {
                      if (!(await modalService.confirm('', t.admin.subsConfirmDel))) return;
                      await deleteSubscriber(sub.id);
                      setSubscribers(await getAllSubscribers());
                    }}
                  >
                    <i className="bi bi-x-lg me-1"></i>
                    {t.admin.subsDelete}
                  </button>
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                  {t.admin.subsNoData}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
