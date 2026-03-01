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
      <div className="modal-backdrop fade show" style={{ zIndex: 1050, backgroundColor: 'rgba(62, 66, 58, 0.6)', backdropFilter: 'blur(8px)' }}></div>
      <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }} onClick={handleCancel}>
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content border-0 shadow" style={{ borderRadius: '24px', backgroundColor: '#fff', overflow: 'hidden' }}>
            <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex justify-content-center position-relative">
              <h5 className="modal-title font-playfair fw-bold fs-4 text-center w-100" style={{ color: 'var(--color-primary)' }}>
                {options.title || (options.type === 'alert' ? 'Внимание' : 'Подтверждение')}
              </h5>
              <button type="button" className="btn-close position-absolute end-0 me-4" style={{ top: '1.5rem', opacity: 0.5 }} onClick={handleCancel}></button>
            </div>
            <div className="modal-body py-4 px-4 text-center">
              <p className="mb-0 fs-5" style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text)', lineHeight: '1.6' }}>{options.message}</p>
              
              {options.type === 'prompt' && (
                <div className="mt-4">
                  <input 
                    type="text" 
                    className="form-control rounded-pill px-4 py-3 shadow-sm text-center fs-5" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={options.placeholder}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirm();
                    }}
                    style={{ borderColor: 'var(--color-secondary)', backgroundColor: '#fafafa', color: 'var(--color-primary)' }}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer border-0 pt-0 pb-4 px-4 d-flex justify-content-center gap-3">
              {options.type !== 'alert' && (
                <button type="button" className="btn btn-outline-dark rounded-pill px-5 py-2 fw-bold" onClick={handleCancel} style={{ transition: 'all 0.3s ease' }}>
                  {options.cancelText || 'Отмена'}
                </button>
              )}
              <button type="button" className="btn btn-primary-custom rounded-pill px-5 py-2 fw-bold shadow-sm" onClick={handleConfirm}>
                {options.confirmText || 'ОК'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
