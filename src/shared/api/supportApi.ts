"use server";

import { prisma } from "@/lib/prisma";

export interface SupportMessage {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  questionType: string;
  message: string;
  status: 'new' | 'replied' | 'bot_answered';
  reply?: string;
  createdAt: string | Date;
  readByUser: boolean;
}

export async function getMessages(): Promise<SupportMessage[]> {
  if (process.env.NEXT_RUNTIME === 'edge') { throw new Error('EDGE RUNTIME DETECTED IN SERVER ACTION'); }
  const items = await prisma.supportTicket.findMany({ orderBy: { createdAt: 'desc' } });
  
  // Transform DB mapping
  return JSON.parse(JSON.stringify(items.map((i: any) => ({
    id: i.id,
    userName: i.name,
    userEmail: i.email,
    questionType: i.subject,
    message: i.message,
    status: i.status === 'NEW' ? 'new' : i.status === 'CLOSED' ? 'replied' : 'new',
    createdAt: i.createdAt,
    readByUser: i.readByUser ?? false
  }))));
}

export async function getUserMessages(email: string): Promise<SupportMessage[]> {
  const items = await prisma.supportTicket.findMany({
    where: { email },
    orderBy: { createdAt: 'desc' }
  });
  
  return JSON.parse(JSON.stringify(items.map((i: any) => ({
    id: i.id,
    userName: i.name,
    userEmail: i.email,
    questionType: i.subject,
    message: i.message,
    status: i.status === 'NEW' ? 'new' : i.status === 'CLOSED' ? 'replied' : 'new',
    createdAt: i.createdAt,
    readByUser: i.readByUser ?? false
  }))));
}

export async function sendMessage(
  userName: string, 
  userEmail: string, 
  questionType: string, 
  message: string,
  isBot: boolean = false
): Promise<SupportMessage> {
  const status = isBot ? 'CLOSED' : 'NEW';
  
  const newItem = await prisma.supportTicket.create({
    data: {
      name: userName,
      email: userEmail,
      subject: questionType,
      message: message,
      status: status
    }
  });

  return JSON.parse(JSON.stringify({
    id: newItem.id,
    userName: newItem.name,
    userEmail: newItem.email,
    questionType: newItem.subject,
    message: newItem.message,
    status: isBot ? 'bot_answered' : 'new',
    createdAt: newItem.createdAt,
    readByUser: false
  }));
}

export async function replyToMessage(id: string, replyText: string): Promise<void> {
  await prisma.supportTicket.update({
    where: { id },
    data: { status: 'CLOSED', reply: replyText }
  });
}

export async function markAsRead(id: string): Promise<void> {
  try {
    await prisma.supportTicket.update({
      where: { id },
      data: { readByUser: true }
    });
  } catch (e) {
    console.error('markAsRead error:', e);
  }
}

export async function deleteMessage(id: string): Promise<void> {
  try {
    await prisma.supportTicket.delete({ where: { id } });
  } catch (e) {
    console.error('deleteMessage error:', e);
  }
}
