'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { headers } from 'next/headers';
import { rateLimit } from '@/shared/lib/rateLimit';
import { emailService } from '@/shared/api/emailService';

export interface SupportMessage {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  questionType: string;
  message: string;
  status: 'new' | 'replied' | 'in_progress' | 'bot_answered';
  reply?: string;
  createdAt: string | Date;
  readByUser: boolean;
}

export async function getMessages(): Promise<SupportMessage[]> {
  if (process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION');
  }
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('ACCESS_DENIED');
  const items = await prisma.supportTicket.findMany({ orderBy: { createdAt: 'desc' } });

  // Transform DB mapping
  return JSON.parse(
    JSON.stringify(
      items.map((i: any) => ({
        id: i.id,
        userName: i.name,
        userEmail: i.email,
        questionType: i.subject,
        message: i.message,
        status:
          i.status === 'NEW'
            ? 'new'
            : i.status === 'CLOSED'
              ? 'replied'
              : i.status === 'IN_PROGRESS'
                ? 'in_progress'
                : 'new',
        createdAt: i.createdAt,
        readByUser: i.readByUser ?? false,
      })),
    ),
  );
}

export async function getUserMessages(email: string): Promise<SupportMessage[]> {
  const session = await auth();
  const sessionUser = session?.user;
  if (!session?.user) throw new Error('AUTH_REQUIRED');
  // Users may only read their own messages; admins may read any
  if (sessionUser?.role !== 'ADMIN' && sessionUser?.email !== email) throw new Error('ACCESS_DENIED');
  const items = await prisma.supportTicket.findMany({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });

  return JSON.parse(
    JSON.stringify(
      items.map((i: any) => ({
        id: i.id,
        userName: i.name,
        userEmail: i.email,
        questionType: i.subject,
        message: i.message,
        status:
          i.status === 'NEW'
            ? 'new'
            : i.status === 'CLOSED'
              ? 'replied'
              : i.status === 'IN_PROGRESS'
                ? 'in_progress'
                : 'new',
        createdAt: i.createdAt,
        readByUser: i.readByUser ?? false,
      })),
    ),
  );
}

const sendMessageSchema = z.object({
  userName: z.string().min(1).max(200),
  userEmail: z.string().email().max(254),
  questionType: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

export async function sendMessage(
  userName: string,
  userEmail: string,
  questionType: string,
  message: string,
  isBot: boolean = false,
): Promise<SupportMessage> {
  const h = await headers();
  const ip = h.get('x-forwarded-for') || 'unknown';
  const rl = await rateLimit(`support:${ip}`, { windowMs: 600_000, max: 10 });
  if (!rl.success) throw new Error('RATE_LIMIT');

  const parsed = sendMessageSchema.safeParse({ userName, userEmail, questionType, message });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'INVALID_DATA');

  const status = isBot ? 'CLOSED' : 'NEW';

  const newItem = await prisma.supportTicket.create({
    data: {
      name: parsed.data.userName,
      email: parsed.data.userEmail,
      subject: parsed.data.questionType,
      message: parsed.data.message,
      status: status,
    },
  });

  if (!isBot) {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
    if (adminEmail) {
      try {
        await emailService.sendEmail(
          adminEmail,
          `[YOGA.LIFE] Новое обращение в поддержку`,
          `Новое сообщение от ${parsed.data.userName} (${parsed.data.userEmail})\n\nТема: ${parsed.data.questionType}\n\n${parsed.data.message}`,
        );
      } catch {
        /* не блокируем основной поток */
      }
    }
  }

  return JSON.parse(
    JSON.stringify({
      id: newItem.id,
      userName: newItem.name,
      userEmail: newItem.email,
      questionType: newItem.subject,
      message: newItem.message,
      status: isBot ? 'bot_answered' : 'new',
      createdAt: newItem.createdAt,
      readByUser: false,
    }),
  );
}

export async function replyToMessage(id: string, replyText: string): Promise<void> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('ACCESS_DENIED');
  await prisma.supportTicket.update({
    where: { id },
    data: { status: 'CLOSED', reply: replyText },
  });
}

export async function markAsRead(id: string): Promise<void> {
  try {
    await prisma.supportTicket.update({
      where: { id },
      data: { readByUser: true },
    });
  } catch (e) {
    console.error('markAsRead error:', e);
  }
}

export async function deleteMessage(id: string): Promise<void> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('ACCESS_DENIED');
  try {
    await prisma.supportTicket.delete({ where: { id } });
  } catch (e) {
    console.error('deleteMessage error:', e);
  }
}
