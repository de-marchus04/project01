'use client';

import { useState, useEffect, useTransition } from 'react';
import { getComments, addComment, Comment } from '@/shared/api/commentApi';

interface Props {
  articleId: string;
}

export default function CommentSection({ articleId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getComments(articleId).then(setComments).catch(console.error);
  }, [articleId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    startTransition(async () => {
      try {
        const comment = await addComment(articleId, name, text);
        setComments(prev => [...prev, comment]);
        setName('');
        setText('');
        setSuccess(true);
      } catch (err: any) {
        setError(err?.message || 'Ошибка отправки комментария');
      }
    });
  }

  return (
    <section className="mt-5">
      <h3 className="mb-4" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
        Комментарии ({comments.length})
      </h3>

      {comments.length === 0 && (
        <p className="text-muted mb-4">Будьте первым, кто оставит комментарий!</p>
      )}

      {comments.map(c => (
        <div key={c.id} className="card mb-3" style={{ border: '1px solid var(--color-border)' }}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong style={{ color: 'var(--color-primary)' }}>{c.name}</strong>
              <small className="text-muted">
                {new Date(c.createdAt).toLocaleDateString('ru-RU', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </small>
            </div>
            <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{c.text}</p>
          </div>
        </div>
      ))}

      <div className="card mt-4" style={{ border: '1px solid var(--color-border)' }}>
        <div className="card-body">
          <h5 className="mb-3">Оставить комментарий</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Ваше имя *</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                maxLength={100}
                disabled={isPending}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Комментарий *</label>
              <textarea
                className="form-control"
                rows={4}
                value={text}
                onChange={e => setText(e.target.value)}
                required
                maxLength={2000}
                disabled={isPending}
              />
            </div>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            {success && <div className="alert alert-success py-2">Комментарий добавлен!</div>}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending}
              style={{ background: 'var(--color-primary)', border: 'none' }}
            >
              {isPending ? 'Отправка...' : 'Отправить'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
