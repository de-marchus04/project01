"use client";

import { useState, useTransition } from "react";
import { validatePromoCode, PromoResult } from "@/shared/api/promoApi";
import { useLanguage } from "@/shared/i18n/LanguageContext";

interface PromoCodeInputProps {
  originalPrice: number;
  onApply: (finalPrice: number, codeId: string) => void;
  onClear: () => void;
}

export default function PromoCodeInput({ originalPrice, onApply, onClear }: PromoCodeInputProps) {
  const { tStr } = useLanguage();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<PromoResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleApply = () => {
    if (!code.trim()) return;
    startTransition(async () => {
      const res = await validatePromoCode(code, originalPrice);
      setResult(res);
      if (res.valid && res.finalPrice !== undefined && res.codeId) {
        onApply(res.finalPrice, res.codeId);
      }
    });
  };

  const handleClear = () => {
    setCode('');
    setResult(null);
    onClear();
  };

  return (
    <div className="mt-3">
      {!result?.valid ? (
        <div className="input-group input-group-sm">
          <input
            type="text"
            className="form-control rounded-start-pill"
            placeholder={tStr("Промокод")}
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            style={{ letterSpacing: '1px' }}
            onKeyDown={e => e.key === 'Enter' && handleApply()}
          />
          <button
            className="btn btn-outline-secondary rounded-end-pill"
            type="button"
            onClick={handleApply}
            disabled={isPending || !code.trim()}
          >
            {isPending ? <span className="spinner-border spinner-border-sm"></span> : tStr("Применить")}
          </button>
        </div>
      ) : (
        <div className="d-flex align-items-center justify-content-between bg-success bg-opacity-10 border border-success rounded-3 px-3 py-2">
          <div>
            <i className="bi bi-tag-fill text-success me-2"></i>
            <strong className="text-success">{code}</strong>
            <span className="text-muted small ms-2">
              {result.discountType === 'PERCENT'
                ? `−${result.discountValue}%`
                : `−${result.discountValue} ₴`}
            </span>
          </div>
          <button className="btn btn-sm btn-link text-danger p-0" onClick={handleClear}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      {result && !result.valid && (
        <div className="text-danger small mt-1">
          <i className="bi bi-exclamation-circle me-1"></i>{result.error}
        </div>
      )}
    </div>
  );
}
