"use client";

import { useState } from "react";
import { usePurchase } from "@/shared/hooks/usePurchase";
import { useLanguage } from "@/shared/i18n/LanguageContext";

interface BuyButtonProps {
  title: string;
  price: number;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const BuyButton = ({ title, price, label, className, style }: BuyButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { buyProduct } = usePurchase();
  const { tStr } = useLanguage() as any;

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await buyProduct(title, price);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={className ?? "btn btn-primary-custom w-100 rounded-pill py-3 fw-bold fs-5"}
      style={style}
    >
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {tStr("Загрузка...")}
        </>
      ) : (
        label ?? tStr("Записаться")
      )}
    </button>
  );
};
