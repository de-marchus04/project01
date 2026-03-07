"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";

export interface PromoResult {
  valid: boolean;
  discountType?: 'PERCENT' | 'FIXED';
  discountValue?: number;
  finalPrice?: number;
  error?: string;
  codeId?: string;
}

export async function validatePromoCode(code: string, originalPrice: number): Promise<PromoResult> {
  if (!code.trim()) return { valid: false, error: 'Введите промокод' };

  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });

  if (!promo) return { valid: false, error: 'Промокод не найден' };
  if (!promo.isActive) return { valid: false, error: 'Промокод неактивен' };
  if (promo.expiresAt && promo.expiresAt < new Date()) return { valid: false, error: 'Срок действия промокода истёк' };
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) return { valid: false, error: 'Промокод исчерпан' };

  let finalPrice = originalPrice;
  if (promo.discountType === 'PERCENT') {
    finalPrice = originalPrice * (1 - promo.discountValue / 100);
  } else {
    finalPrice = Math.max(0, originalPrice - promo.discountValue);
  }
  finalPrice = Math.round(finalPrice * 100) / 100;

  return {
    valid: true,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    finalPrice,
    codeId: promo.id,
  };
}

export async function applyPromoCode(codeId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error('Необходима авторизация');

  // Re-validate the promo code is still active before incrementing
  const promo = await prisma.promoCode.findUnique({ where: { id: codeId } });
  if (!promo) throw new Error('Промокод не найден');
  if (!promo.isActive) throw new Error('Промокод неактивен');
  if (promo.expiresAt && promo.expiresAt < new Date()) throw new Error('Срок действия промокода истёк');
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) throw new Error('Промокод исчерпан');

  await prisma.promoCode.update({
    where: { id: codeId },
    data: { usedCount: { increment: 1 } }
  });
}

// Admin CRUD
export async function getPromoCodes() {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Нет доступа');
  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(codes));
}

export async function createPromoCode(data: {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  maxUses?: number;
  expiresAt?: string;
}) {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Нет доступа');
  const promo = await prisma.promoCode.create({
    data: {
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxUses: data.maxUses || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    }
  });
  return JSON.parse(JSON.stringify(promo));
}

export async function togglePromoCodeActive(id: string, isActive: boolean) {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Нет доступа');
  await prisma.promoCode.update({ where: { id }, data: { isActive } });
}

export async function deletePromoCode(id: string) {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Нет доступа');
  await prisma.promoCode.delete({ where: { id } });
}
