/**
 * Tests for authActions: changePassword and updateMyProfile.
 * Uses mocked Prisma client.
 */

jest.mock("@/shared/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import { prisma } from "@/shared/lib/prisma";
import bcrypt from "bcryptjs";
import { changePassword, updateMyProfile } from "@/shared/api/authActions";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("changePassword", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns error if user not found", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await changePassword("ghost", "old", "new");
    expect(result.success).toBe(false);
    expect(result.error).toMatch("не найден");
  });

  it("returns error if old password doesn't match", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ username: "user", passwordHash: "hash" });
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);
    const result = await changePassword("user", "wrong", "new");
    expect(result.success).toBe(false);
    expect(result.error).toMatch("неверен");
  });

  it("returns success on valid password change", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ username: "user", passwordHash: "hash" });
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
    (mockBcrypt.hash as jest.Mock).mockResolvedValue("newHash");
    (mockPrisma.user.update as jest.Mock).mockResolvedValue({});
    const result = await changePassword("user", "correct", "newpass");
    expect(result.success).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { passwordHash: "newHash" } })
    );
  });
});

describe("updateMyProfile", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates name and email", async () => {
    (mockPrisma.user.update as jest.Mock).mockResolvedValue({});
    const result = await updateMyProfile("user", { name: "Иван", email: "ivan@test.com" });
    expect(result.success).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: "Иван", email: "ivan@test.com" }) })
    );
  });

  it("sets empty email as null", async () => {
    (mockPrisma.user.update as jest.Mock).mockResolvedValue({});
    const result = await updateMyProfile("user", { email: "" });
    expect(result.success).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ email: null }) })
    );
  });

  it("returns error on DB failure", async () => {
    (mockPrisma.user.update as jest.Mock).mockRejectedValue(new Error("DB error"));
    const result = await updateMyProfile("user", { name: "Test" });
    expect(result.success).toBe(false);
  });
});
