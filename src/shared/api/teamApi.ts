"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";

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

export async function addTeamMember(data: {
  name: string;
  role: string;
  imageUrl?: string;
  sortOrder?: number;
}): Promise<TeamMember> {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Access denied');
  const member = await prisma.teamMember.create({
    data: {
      name: data.name,
      role: data.role,
      imageUrl: data.imageUrl || null,
      sortOrder: data.sortOrder ?? 0,
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
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Access denied');
  const member = await prisma.teamMember.update({
    where: { id },
    data,
  });
  return JSON.parse(JSON.stringify(member));
}

export async function deleteTeamMember(id: string): Promise<void> {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Access denied');
  await prisma.teamMember.delete({ where: { id } });
}
