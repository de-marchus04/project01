"use client";

import { useState, useEffect, useRef } from "react";
import { modalService, ModalOptions } from "./modalService";

export const GlobalModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [callback, setCallback] = useState<((result: any) => void) | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalService.setListener((opts, cb) => {
      setOptions(opts);
      setCallback(() => cb);
      setInputValue(opts.placeholder || "");
      setIsOpen(true);
    });

    return () => {
      modalService.removeListener();
    };
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (callback) {
      if (options?.type === 'prompt') {
        callback(inputValue);
      } else {
        callback(true);
      }
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (callback) {
      if (options?.type === 'prompt') {
        callback(null);
      } else {
        callback(false);
      }
    }
  };

  // Focus trap + Escape key handler
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const el = dialogRef.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { handleCancel(); return; }
      if (e.key !== 'Tab') return;
      if (focusable.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen || !options) return null;

  return (
    <>
      <div 
        className="modal-backdrop fade show" 
        style={{ zIndex: 1050, backgroundColor: 'rgba(62, 66, 58, 0.5)', backdropFilter: 'blur(6px)', animation: 'modalFadeIn 0.25s ease' }}
      ></div>
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-modal-title"
        tabIndex={-1}
        ref={dialogRef}
        style={{ zIndex: 1055, animation: 'modalSlideIn 0.25s ease' }}
        onClick={handleCancel}
      >
        <div className="modal-dialog modal-dialog-centered modal-sm" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px', backgroundColor: 'var(--color-surface)', overflow: 'hidden' }}>
            <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex justify-content-center position-relative">
              <h5 id="global-modal-title" className="modal-title font-playfair fw-bold text-center w-100" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                {options.title || (options.type === 'alert' ? 'Внимание' : 'Подтверждение')}
              </h5>
              <button type="button" className="btn-close position-absolute end-0 me-3" aria-label="Закрыть" style={{ top: '1.2rem', opacity: 0.4, filter: 'var(--bs-btn-close-white-filter, none)' }} onClick={handleCancel}></button>
            </div>
            <div className="modal-body py-3 px-4 text-center">
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-muted)', lineHeight: '1.5', fontSize: '0.9rem' }}>{options.message}</p>
              
              {options.type === 'prompt' && (
                <div className="mt-3">
                  <input 
                    type="text" 
                    className="form-control rounded-pill px-4 py-2 shadow-sm text-center" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={options.placeholder}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirm();
                    }}
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.9rem' }}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer border-0 pt-0 pb-4 px-4 d-flex justify-content-center gap-2">
              {options.type !== 'alert' && (
                <button type="button" className="btn rounded-pill px-4 py-2" onClick={handleCancel} style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  {options.cancelText || 'Отмена'}
                </button>
              )}
              <button type="button" className="btn btn-primary-custom rounded-pill px-5 py-2" onClick={handleConfirm} style={{ fontSize: '0.85rem' }}>
                {options.confirmText || 'ОК'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
