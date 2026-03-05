"use client";

import { useState, useEffect } from "react";
import { modalService, ModalOptions } from "./modalService";

export const GlobalModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [callback, setCallback] = useState<((result: any) => void) | null>(null);

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

  if (!isOpen || !options) return null;

  const handleConfirm = () => {
    setIsOpen(false);
    if (callback) {
      if (options.type === 'prompt') {
        callback(inputValue);
      } else {
        callback(true);
      }
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (callback) {
      if (options.type === 'prompt') {
        callback(null);
      } else {
        callback(false);
      }
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050, backgroundColor: 'rgba(26, 26, 26, 0.5)', backdropFilter: 'var(--glass-blur)' }}></div>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1055 }}
        onClick={handleCancel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content border-0" style={{ borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-bg-card)', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
            <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex justify-content-center position-relative">
              <h5 id="modal-title" className="modal-title font-playfair fw-bold text-center w-100" style={{ color: 'var(--color-primary)', fontSize: 'var(--text-xl)' }}>
                {options.title || (options.type === 'alert' ? 'Внимание' : 'Подтверждение')}
              </h5>
              <button
                type="button"
                className="btn-close position-absolute end-0 me-4"
                style={{ top: '1.5rem', opacity: 0.5 }}
                onClick={handleCancel}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body py-4 px-4 text-center">
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', fontSize: 'var(--text-lg)' }}>{options.message}</p>

              {options.type === 'prompt' && (
                <div className="mt-4">
                  <input
                    type="text"
                    className="form-control px-4 py-3 text-center"
                    style={{ fontSize: 'var(--text-lg)', borderRadius: 'var(--radius-full)' }}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={options.placeholder}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirm();
                    }}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer border-0 pt-0 pb-4 px-4 d-flex justify-content-center gap-3">
              {options.type !== 'alert' && (
                <button
                  type="button"
                  className="btn btn-outline-primary-custom px-5 py-2 fw-bold"
                  onClick={handleCancel}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {options.cancelText || 'Отмена'}
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary-custom px-5 py-2 fw-bold"
                onClick={handleConfirm}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {options.confirmText || 'ОК'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
