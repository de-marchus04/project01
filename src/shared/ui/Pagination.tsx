import React from 'react';
import { useLanguage } from '@/shared/i18n/LanguageContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Page navigation" className="mt-5">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}
          >
            {t.pagination.prev}
          </button>
        </li>
        
        {pages.map(page => (
          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(page)}
              style={{ 
                backgroundColor: currentPage === page ? 'var(--color-primary)' : 'transparent',
                borderColor: 'var(--color-border)',
                color: currentPage === page ? 'white' : 'var(--color-primary)'
              }}
            >
              {page}
            </button>
          </li>
        ))}

        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}
          >
            {t.pagination.next}
          </button>
        </li>
      </ul>
    </nav>
  );
};
