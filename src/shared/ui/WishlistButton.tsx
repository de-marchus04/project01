"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/shared/api/wishlistApi";

interface WishlistButtonProps {
  itemId: string;
  itemType: 'COURSE' | 'TOUR' | 'CONSULTATION';
  size?: 'sm' | 'md';
}

export function WishlistButton({ itemId, itemType, size = 'md' }: WishlistButtonProps) {
  const { data: session } = useSession();
  const [inWishlist, setInWishlist] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.user) return;
    isInWishlist(itemId, itemType).then(setInWishlist);
  }, [session, itemId, itemType]);

  if (!session?.user) return null;

  const toggle = () => {
    startTransition(async () => {
      if (inWishlist) {
        await removeFromWishlist(itemId, itemType);
        setInWishlist(false);
      } else {
        await addToWishlist(itemId, itemType);
        setInWishlist(true);
      }
    });
  };

  const iconSize = size === 'sm' ? '0.9rem' : '1.1rem';
  const btnSize = size === 'sm' ? '28px' : '34px';

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
      disabled={isPending}
      title={inWishlist ? 'Удалить из избранного' : 'Добавить в избранное'}
      style={{
        width: btnSize,
        height: btnSize,
        borderRadius: '50%',
        border: 'none',
        background: inWishlist ? 'rgba(220,53,69,0.12)' : 'rgba(0,0,0,0.08)',
        cursor: isPending ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: iconSize,
        color: inWishlist ? '#dc3545' : '#6c757d',
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}
    >
      <i className={`bi ${inWishlist ? 'bi-heart-fill' : 'bi-heart'}`}></i>
    </button>
  );
}
