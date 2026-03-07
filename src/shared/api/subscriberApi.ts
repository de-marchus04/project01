"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const emailSchema = z.string().email("Некорректный формат email").max(254);

export async function subscribeEmail(email: string): Promise<{ success: boolean; alreadySubscribed?: boolean; error?: string }> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };
  try {
    await prisma.subscriber.create({ data: { email: parsed.data } });
    return { success: true };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { success: true, alreadySubscribed: true };
    }
    return { success: false };
  }
}

export async function unsubscribeEmail(email: string): Promise<{ success: boolean; error?: string }> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };
  try {
    await prisma.subscriber.delete({ where: { email: parsed.data } });
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
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Access denied');
  const subs = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  return JSON.parse(JSON.stringify(subs));
}

export async function deleteSubscriber(id: string): Promise<boolean> {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Access denied');
  try {
    await prisma.subscriber.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
