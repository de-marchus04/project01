'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { getMessages, replyToMessage, deleteMessage, SupportMessage } from '@/shared/api/supportApi';
import { modalService } from '@/shared/ui/Modal/modalService';

type Props = { showToast: (msg: string, type?: 'success' | 'error') => void };

export default function SupportTab({ showToast }: Props) {
  const { t } = useLanguage();
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const loadMessages = async () => {
    try {
      setSupportMessages(await getMessages());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h3 className="h5 fw-bold mb-4" style={{ color: 'var(--color-text)' }}>
        {t.admin.supportMessages}
      </h3>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>{t.admin.colDate}</th>
              <th>{t.admin.colUser}</th>
              <th>{t.admin.colQuestion}</th>
              <th>{t.admin.colStatus}</th>
              <th>{t.admin.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {supportMessages
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((msg) => (
                <tr key={msg.id}>
                  <td>{new Date(msg.createdAt).toLocaleString()}</td>
                  <td>
                    <div>
                      <strong>{msg.userName}</strong>
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85em' }}>{msg.userEmail}</div>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <div className="fw-bold small text-primary mb-1">{msg.questionType}</div>
                    <div className="text-truncate" title={msg.message}>
                      {msg.message}
                    </div>
                    {msg.reply && (
                      <div
                        className="mt-2 p-2 rounded small"
                        style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)' }}
                      >
                        <strong>{t.admin.supportReplyLabel}</strong> {msg.reply}
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${msg.status === 'new' ? 'bg-danger' : msg.status === 'replied' ? 'bg-success' : 'bg-secondary'}`}
                    >
                      {msg.status === 'new'
                        ? t.admin.supportNewStatus
                        : msg.status === 'replied'
                          ? t.admin.supportRepliedStatus
                          : t.admin.supportBotStatus}
                    </span>
                  </td>
                  <td>
                    {msg.status === 'new' && (
                      <div className="d-flex flex-column gap-2">
                        <textarea
                          className="form-control form-control-sm"
                          rows={2}
                          placeholder={t.admin.supportReplyPlaceholder}
                          value={replyText[msg.id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                        />
                        <button
                          className="btn btn-sm rounded-pill"
                          style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }}
                          onClick={async () => {
                            if (!replyText[msg.id]) return;
                            await replyToMessage(msg.id, replyText[msg.id]);
                            setSupportMessages(await getMessages());
                            setReplyText({ ...replyText, [msg.id]: '' });
                          }}
                        >
                          {t.common.send}
                        </button>
                      </div>
                    )}
                    {msg.status !== 'new' && (
                      <button
                        className="btn btn-sm btn-outline-danger mt-2 w-100"
                        onClick={async () => {
                          const confirmed = await modalService.confirm(
                            t.admin.deleteMsgTitle,
                            t.admin.deleteMsgConfirm,
                            t.common.delete,
                            t.common.cancel,
                          );
                          if (confirmed) {
                            await deleteMessage(msg.id);
                            setSupportMessages(await getMessages());
                          }
                        }}
                      >
                        {t.common.delete}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            {supportMessages.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                  {t.admin.noMessages}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
