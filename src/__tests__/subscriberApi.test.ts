/**
 * Tests for subscriberApi logic (subscribe/unsubscribe/checkSubscription).
 * Uses mocked Prisma client.
 */

jest.mock("@/auth", () => ({ auth: jest.fn().mockResolvedValue(null) }));

jest.mock("@/shared/lib/prisma", () => ({
  prisma: {
    subscriber: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from "@/shared/lib/prisma";
import { subscribeEmail, unsubscribeEmail, checkSubscription } from "@/shared/api/subscriberApi";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("subscribeEmail", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns success: true on new subscription", async () => {
    (mockPrisma.subscriber.create as jest.Mock).mockResolvedValue({ id: "1", email: "test@test.com" });
    const result = await subscribeEmail("test@test.com");
    expect(result.success).toBe(true);
    expect(result.alreadySubscribed).toBeUndefined();
  });

  it("returns alreadySubscribed: true on P2002 (unique constraint)", async () => {
    (mockPrisma.subscriber.create as jest.Mock).mockRejectedValue({ code: "P2002" });
    const result = await subscribeEmail("existing@test.com");
    expect(result.success).toBe(true);
    expect(result.alreadySubscribed).toBe(true);
  });

  it("returns success: false on other errors", async () => {
    (mockPrisma.subscriber.create as jest.Mock).mockRejectedValue(new Error("DB error"));
    const result = await subscribeEmail("bad@test.com");
    expect(result.success).toBe(false);
  });
});

describe("unsubscribeEmail", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns success: true on successful deletion", async () => {
    (mockPrisma.subscriber.delete as jest.Mock).mockResolvedValue({});
    const result = await unsubscribeEmail("test@test.com");
    expect(result.success).toBe(true);
  });

  it("returns success: false if email not found", async () => {
    (mockPrisma.subscriber.delete as jest.Mock).mockRejectedValue(new Error("not found"));
    const result = await unsubscribeEmail("ghost@test.com");
    expect(result.success).toBe(false);
  });
});

describe("checkSubscription", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns true if subscriber exists", async () => {
    (mockPrisma.subscriber.findUnique as jest.Mock).mockResolvedValue({ id: "1", email: "sub@test.com" });
    expect(await checkSubscription("sub@test.com")).toBe(true);
  });

  it("returns false if subscriber does not exist", async () => {
    (mockPrisma.subscriber.findUnique as jest.Mock).mockResolvedValue(null);
    expect(await checkSubscription("no@test.com")).toBe(false);
  });

  it("returns false for empty email", async () => {
    expect(await checkSubscription("")).toBe(false);
  });
});
