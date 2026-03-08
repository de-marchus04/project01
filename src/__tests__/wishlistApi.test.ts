/**
 * Tests for wishlistApi: addToWishlist, removeFromWishlist, isInWishlist.
 * Uses mocked Prisma client and auth.
 */

jest.mock("@/shared/lib/prisma", () => ({
  prisma: {
    wishlist: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    course: { findMany: jest.fn().mockResolvedValue([]) },
    consultation: { findMany: jest.fn().mockResolvedValue([]) },
    tour: { findMany: jest.fn().mockResolvedValue([]) },
  },
}));

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";
import { addToWishlist, removeFromWishlist, isInWishlist, getUserWishlist } from "@/shared/api/wishlistApi";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockAuth = auth as jest.Mock;

describe("addToWishlist", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await addToWishlist("c1", "COURSE");
    expect(result.success).toBe(false);
  });

  it("adds item to wishlist successfully", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } });
    (mockPrisma.wishlist.create as jest.Mock).mockResolvedValue({});
    const result = await addToWishlist("c1", "COURSE");
    expect(result.success).toBe(true);
  });

  it("handles duplicate (already in wishlist)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } });
    (mockPrisma.wishlist.create as jest.Mock).mockRejectedValue(new Error("unique constraint"));
    const result = await addToWishlist("c1", "COURSE");
    expect(result.success).toBe(false);
  });
});

describe("removeFromWishlist", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns false when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await removeFromWishlist("c1", "COURSE");
    expect(result.success).toBe(false);
  });

  it("removes item successfully", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } });
    (mockPrisma.wishlist.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
    const result = await removeFromWishlist("c1", "COURSE");
    expect(result.success).toBe(true);
  });
});

describe("isInWishlist", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns false when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    expect(await isInWishlist("c1", "COURSE")).toBe(false);
  });

  it("returns true when item exists", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } });
    (mockPrisma.wishlist.findFirst as jest.Mock).mockResolvedValue({ id: "w1" });
    expect(await isInWishlist("c1", "COURSE")).toBe(true);
  });

  it("returns false when item not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } });
    (mockPrisma.wishlist.findFirst as jest.Mock).mockResolvedValue(null);
    expect(await isInWishlist("c1", "COURSE")).toBe(false);
  });
});

describe("getUserWishlist", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns empty array when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await getUserWishlist();
    expect(result).toEqual([]);
  });

  it("returns empty array when wishlist is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } });
    (mockPrisma.wishlist.findMany as jest.Mock).mockResolvedValue([]);
    const result = await getUserWishlist();
    expect(result).toEqual([]);
  });
});
