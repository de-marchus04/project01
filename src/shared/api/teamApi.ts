"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string | null;
  sortOrder: number;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const members = await prisma.teamMember.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return JSON.parse(JSON.stringify(members));
}

const addTeamMemberSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  sortOrder: z.number().int().min(0).optional(),
});

const updateTeamMemberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.string().min(1).max(100).optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  sortOrder: z.number().int().min(0).optional(),
});

export async function addTeamMember(data: {
  name: string;
  role: string;
  imageUrl?: string;
  sortOrder?: number;
}): Promise<TeamMember> {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Access denied');
  const parsed = addTeamMemberSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const member = await prisma.teamMember.create({
    data: {
      name: parsed.data.name,
      role: parsed.data.role,
      imageUrl: parsed.data.imageUrl || null,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });
  return JSON.parse(JSON.stringify(member));
}

export async function updateTeamMember(id: string, data: {
  name?: string;
  role?: string;
  imageUrl?: string;
  sortOrder?: number;
}): Promise<TeamMember> {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Access denied');
  const parsed = updateTeamMemberSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Некорректные данные');
  const member = await prisma.teamMember.update({
    where: { id },
    data: parsed.data,
  });
  return JSON.parse(JSON.stringify(member));
}

export async function deleteTeamMember(id: string): Promise<void> {
  const session = await auth();
  if ((session?.user)?.role !== 'ADMIN') throw new Error('Access denied');
  await prisma.teamMember.delete({ where: { id } });
}
