"use server";

import { prisma } from "@/shared/lib/prisma";

export async function subscribeEmail(email: string): Promise<{ success: boolean; alreadySubscribed?: boolean }> {
  try {
    await prisma.subscriber.create({ data: { email } });
    return { success: true };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { success: true, alreadySubscribed: true };
    }
    return { success: false };
  }
}

export async function unsubscribeEmail(email: string): Promise<{ success: boolean }> {
  try {
    await prisma.subscriber.delete({ where: { email } });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function checkSubscription(email: string): Promise<boolean> {
  if (!email) return false;
  const sub = await prisma.subscriber.findUnique({ where: { email } });
  return !!sub;
}
