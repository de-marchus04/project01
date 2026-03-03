"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { getItemReviews, getUserReview, upsertReview, deleteReview, ReviewData, ReviewStats } from "@/shared/api/reviewApi";

interface ReviewSectionProps {
  itemId: string;
  itemType: 'COURSE' | 'TOUR' | 'CONSULTATION';
}

function StarRating({ value, onChange, readOnly = false, size = 'md' }: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hover, setHover] = useState(0);
  const fontSize = size === 'sm' ? '1rem' : size === 'lg' ? '1.8rem' : '1.4rem';

  return (
    <div className="d-flex gap-1" style={{ cursor: readOnly ? 'default' : 'pointer' }}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = (readOnly ? value : (hover || value)) >= star;
        return (
          <i
            key={star}
            className={`bi ${filled ? 'bi-star-fill' : 'bi-star'}`}
            style={{ fontSize, color: filled ? '#f5a623' : '#ccc', transition: 'color 0.1s' }}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && onChange && onChange(star)}
          ></i>
        );
      })}
    </div>
  );
}

export default function ReviewSection({ itemId, itemType }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [myReview, setMyReview] = useState<ReviewData | null>(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const loadReviews = () => {
    getItemReviews(itemId, itemType).then(({ reviews, stats }) => {
      setReviews(reviews);
      setStats(stats);
    });
  };

  useEffect(() => {
    loadReviews();
    if (session?.user) {
      getUserReview(itemId, itemType).then(r => {
        if (r) {
          setMyReview(r);
          setRating(r.rating);
          setText(r.text || '');
        }
      });
    }
  }, [itemId, itemType, session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await upsertReview(itemId, itemType, rating, text);
      if (res.success) {
        setShowForm(false);
        loadReviews();
        getUserReview(itemId, itemType).then(setMyReview);
      } else {
        setError(res.error || 'Ошибка');
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteReview(itemId, itemType);
      setMyReview(null);
      setRating(5);
      setText('');
      loadReviews();
    });
  };

  return (
    <section className="py-5 bg-light">
      <div className="container py-3">
        <h3 className="font-playfair fw-bold mb-4">Отзывы и оценки</h3>

        {/* Summary */}
        {stats.total > 0 && (
          <div className="row align-items-center mb-5 g-4">
            <div className="col-md-3 text-center">
              <div className="display-3 fw-bold" style={{ color: 'var(--color-primary)' }}>{stats.average}</div>
              <StarRating value={Math.round(stats.average)} readOnly size="lg" />
              <div className="text-muted mt-1">{stats.total} отзывов</div>
            </div>
            <div className="col-md-9">
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats.distribution[star] || 0;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={star} className="d-flex align-items-center gap-3 mb-2">
                    <span className="text-muted small" style={{ width: '20px' }}>{star}</span>
                    <i className="bi bi-star-fill" style={{ color: '#f5a623', fontSize: '0.8rem' }}></i>
                    <div className="flex-grow-1 bg-white rounded-pill overflow-hidden" style={{ height: '10px', border: '1px solid #ddd' }}>
                      <div className="rounded-pill" style={{ width: `${pct}%`, height: '100%', background: '#f5a623', transition: 'width 0.5s' }}></div>
                    </div>
                    <span className="text-muted small" style={{ width: '20px' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Leave a review */}
        {session?.user ? (
          <div className="mb-5">
            {myReview && !showForm ? (
              <div className="card border-0 shadow-sm rounded-3 p-4 mb-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong>Ваш отзыв</strong>
                    <div className="mt-1"><StarRating value={myReview.rating} readOnly size="sm" /></div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => setShowForm(true)}>Изменить</button>
                    <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={handleDelete} disabled={isPending}>Удалить</button>
                  </div>
                </div>
                {myReview.text && <p className="text-muted mb-0">{myReview.text}</p>}
              </div>
            ) : !showForm ? (
              <button className="btn btn-primary-custom rounded-pill px-4" onClick={() => setShowForm(true)}>
                <i className="bi bi-star me-2"></i>Оставить отзыв
              </button>
            ) : null}

            {showForm && (
              <form onSubmit={handleSubmit} className="card border-0 shadow-sm rounded-3 p-4">
                <h6 className="fw-bold mb-3">Ваша оценка</h6>
                <div className="mb-3">
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div className="mb-3">
                  <textarea
                    className="form-control rounded-3"
                    rows={3}
                    placeholder="Расскажите о своём опыте..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                </div>
                {error && <div className="alert alert-danger py-2 small">{error}</div>}
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary-custom rounded-pill px-4" disabled={isPending}>
                    {isPending ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                    {myReview ? 'Обновить' : 'Отправить'}
                  </button>
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowForm(false)}>Отмена</button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <p className="text-muted mb-4">
            <a href="/login" style={{ color: 'var(--color-primary)' }}>Войдите</a>, чтобы оставить отзыв
          </p>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <p className="text-muted">Отзывов пока нет. Будьте первым!</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {reviews.map(review => (
              <div key={review.id} className="card border-0 shadow-sm rounded-3 p-4">
                <div className="d-flex align-items-center gap-3 mb-2">
                  {review.avatar ? (
                    <img src={review.avatar} alt={review.username} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                      {review.username[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="fw-bold">{review.username}</div>
                    <div className="d-flex align-items-center gap-2">
                      <StarRating value={review.rating} readOnly size="sm" />
                      <small className="text-muted">{new Date(review.createdAt).toLocaleDateString('ru-RU')}</small>
                    </div>
                  </div>
                </div>
                {review.text && <p className="text-muted mb-0">{review.text}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
