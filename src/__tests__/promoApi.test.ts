/**
 * Tests for promoApi: validatePromoCode business logic.
 * Uses mocked Prisma client.
 */

jest.mock("@/shared/lib/prisma", () => ({
  prisma: {
    promoCode: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { role: "USER" } }),
}));

import { prisma } from "@/shared/lib/prisma";
import { validatePromoCode, applyPromoCode } from "@/shared/api/promoApi";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const basePromo = {
  id: "promo-1",
  code: "YOGA10",
  isActive: true,
  expiresAt: null,
  maxUses: null,
  usedCount: 0,
  discountType: "PERCENT" as const,
  discountValue: 10,
};

describe("validatePromoCode", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns invalid for empty code", async () => {
    const result = await validatePromoCode("  ", 100);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("PROMO_EMPTY");
  });

  it("returns invalid when promo not found", async () => {
    (mockPrisma.promoCode.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await validatePromoCode("UNKNOWN", 100);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("PROMO_NOT_FOUND");
  });

  it("returns invalid when promo is inactive", async () => {
    (mockPrisma.promoCode.findUnique as jest.Mock).mockResolvedValue({ ...basePromo, isActive: false });
    const result = await validatePromoCode("YOGA10", 100);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("PROMO_INACTIVE");
  });

  it("returns invalid when promo is expired", async () => {
    (mockPrisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
      ...basePromo,
      expiresAt: new Date("2000-01-01"),
    });
    const result = await validatePromoCode("YOGA10", 100);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("PROMO_EXPIRED");
  });

  it("returns invalid when maxUses exhausted", async () => {
    (mockPrisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
      ...basePromo,
      maxUses: 5,
      usedCount: 5,
    });
    const result = await validatePromoCode("YOGA10", 100);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("PROMO_EXHAUSTED");
  });

  it("calculates PERCENT discount correctly", async () => {
    (mockPrisma.promoCode.findUnique as jest.Mock).mockResolvedValue(basePromo);
    const result = await validatePromoCode("YOGA10", 200);
    expect(result.valid).toBe(true);
    expect(result.finalPrice).toBe(180);
    expect(result.discountType).toBe("PERCENT");
    expect(result.discountValue).toBe(10);
  });

  it("calculates FIXED discount correctly", async () => {
    (mockPrisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
      ...basePromo,
      discountType: "FIXED",
      discountValue: 50,
    });
    const result = await validatePromoCode("YOGA10", 200);
    expect(result.valid).toBe(true);
    expect(result.finalPrice).toBe(150);
  });

  it("clamps FIXED discount to 0 when discount exceeds price", async () => {
    (mockPrisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
      ...basePromo,
      discountType: "FIXED",
      discountValue: 999,
    });
    const result = await validatePromoCode("YOGA10", 50);
    expect(result.valid).toBe(true);
    expect(result.finalPrice).toBe(0);
  });
});

describe("applyPromoCode", () => {
  beforeEach(() => jest.clearAllMocks());

  it("increments usedCount on valid promo", async () => {
    (mockPrisma.promoCode.findUnique as jest.Mock).mockResolvedValue(basePromo);
    (mockPrisma.promoCode.update as jest.Mock).mockResolvedValue({});
    await applyPromoCode("promo-1");
    expect(mockPrisma.promoCode.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { usedCount: { increment: 1 } } })
    );
  });

  it("throws when promo not found", async () => {
    (mockPrisma.promoCode.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(applyPromoCode("bad-id")).rejects.toThrow("PROMO_NOT_FOUND");
  });

  it("throws when promo is inactive", async () => {
    (mockPrisma.promoCode.findUnique as jest.Mock).mockResolvedValue({ ...basePromo, isActive: false });
    await expect(applyPromoCode("promo-1")).rejects.toThrow("PROMO_INACTIVE");
  });
});
