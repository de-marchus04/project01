"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Нет доступа");
}

export async function getPageSlidesAdmin(pageKey?: string) {
  await requireAdmin();
  return await prisma.pageSlide.findMany({
    where: pageKey ? { pageKey } : undefined,
    orderBy: [{ pageKey: "asc" }, { sortOrder: "asc" }],
  });
}

export async function createPageSlide(data: {
  pageKey: string;
  url: string;
  mediaType: "IMAGE" | "VIDEO";
  title?: string;
  sortOrder?: number;
}) {
  await requireAdmin();
  return await prisma.pageSlide.create({ data });
}

export async function updatePageSlide(
  id: string,
  data: {
    url?: string;
    mediaType?: "IMAGE" | "VIDEO";
    title?: string;
    sortOrder?: number;
    active?: boolean;
  }
) {
  await requireAdmin();
  return await prisma.pageSlide.update({ where: { id }, data });
}

export async function deletePageSlide(id: string) {
  await requireAdmin();
  return await prisma.pageSlide.delete({ where: { id } });
}
