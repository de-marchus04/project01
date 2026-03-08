/**
 * Tests for supportApi: sendMessage, getMessages, replyToMessage, deleteMessage.
 * Uses mocked Prisma client, auth, and rate limiting.
 */

jest.mock("@/shared/lib/prisma", () => ({
  prisma: {
    supportTicket: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("next/headers", () => ({
  headers: jest.fn().mockResolvedValue({ get: () => "127.0.0.1" }),
}));

jest.mock("@/shared/lib/rateLimit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("@/shared/api/emailService", () => ({
  emailService: { sendEmail: jest.fn().mockResolvedValue({}) },
}));

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";
import { rateLimit } from "@/shared/lib/rateLimit";
import { sendMessage, getMessages, replyToMessage, deleteMessage } from "@/shared/api/supportApi";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockAuth = auth as jest.Mock;
const mockRateLimit = rateLimit as jest.Mock;

describe("sendMessage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a support ticket with valid data", async () => {
    (mockPrisma.supportTicket.create as jest.Mock).mockResolvedValue({
      id: "t1", name: "John", email: "john@test.com",
      subject: "Question", message: "Hello", status: "NEW",
      createdAt: new Date(), readByUser: false,
    });
    const result = await sendMessage("John", "john@test.com", "Question", "Hello");
    expect(result.id).toBe("t1");
    expect(result.status).toBe("new");
  });

  it("throws RATE_LIMIT when rate limited", async () => {
    mockRateLimit.mockResolvedValueOnce({ success: false });
    await expect(sendMessage("X", "x@t.com", "Q", "M")).rejects.toThrow("RATE_LIMIT");
  });

  it("throws on invalid email", async () => {
    await expect(sendMessage("John", "not-email", "Q", "M")).rejects.toThrow();
  });

  it("throws on empty message", async () => {
    await expect(sendMessage("John", "j@t.com", "Q", "")).rejects.toThrow();
  });
});

describe("getMessages", () => {
  beforeEach(() => jest.clearAllMocks());

  it("throws ACCESS_DENIED for non-admin users", async () => {
    mockAuth.mockResolvedValue({ user: { role: "USER" } });
    await expect(getMessages()).rejects.toThrow("ACCESS_DENIED");
  });

  it("returns messages for admin", async () => {
    mockAuth.mockResolvedValue({ user: { role: "ADMIN" } });
    (mockPrisma.supportTicket.findMany as jest.Mock).mockResolvedValue([
      { id: "t1", name: "A", email: "a@t.com", subject: "S", message: "M", status: "NEW", createdAt: new Date(), readByUser: false },
    ]);
    const result = await getMessages();
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("new");
  });
});

describe("replyToMessage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("throws ACCESS_DENIED for non-admin", async () => {
    mockAuth.mockResolvedValue({ user: { role: "USER" } });
    await expect(replyToMessage("t1", "Reply")).rejects.toThrow("ACCESS_DENIED");
  });

  it("updates ticket for admin", async () => {
    mockAuth.mockResolvedValue({ user: { role: "ADMIN" } });
    (mockPrisma.supportTicket.update as jest.Mock).mockResolvedValue({});
    await replyToMessage("t1", "Your answer");
    expect(mockPrisma.supportTicket.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "CLOSED", reply: "Your answer" } })
    );
  });
});

describe("deleteMessage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("throws ACCESS_DENIED for non-admin", async () => {
    mockAuth.mockResolvedValue({ user: { role: "USER" } });
    await expect(deleteMessage("t1")).rejects.toThrow("ACCESS_DENIED");
  });

  it("deletes ticket for admin", async () => {
    mockAuth.mockResolvedValue({ user: { role: "ADMIN" } });
    (mockPrisma.supportTicket.delete as jest.Mock).mockResolvedValue({});
    await deleteMessage("t1");
    expect(mockPrisma.supportTicket.delete).toHaveBeenCalledWith({ where: { id: "t1" } });
  });
});
