"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";

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

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export async function getAllSubscribers(): Promise<Subscriber[]> {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Access denied');
  const subs = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(subs));
}

export async function deleteSubscriber(id: string): Promise<boolean> {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Access denied');
  try {
    await prisma.subscriber.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
