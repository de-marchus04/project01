"use server";
import { v2 as cloudinary } from 'cloudinary';
import { auth } from "@/auth";

// Configure explicitly or rely on CLOUDINARY_URL in .env
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadImageToCloud(base64Image: string): Promise<string> {
  const isConfigured = process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME;

  if (!isConfigured) {
    console.warn("⚠️ Настройте реквизиты Cloudinary (CLOUDINARY_URL) в .env! Пока что сохраняем Base64 в БД (не рекомендуется для продакшена).");
    return base64Image; // Fallback to storing base64 so dev mode doesn't break
  }

  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "yoga-platform",
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Failed to upload image to cloud storage");
  }
}

export interface CloudImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

export async function getCloudImages(): Promise<CloudImage[]> {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Access denied');

  const isConfigured = process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME;
  if (!isConfigured) return [];

  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'yoga-platform',
      max_results: 100,
      resource_type: 'image',
    });
    return (result.resources || []).map((r: any) => ({
      public_id: r.public_id,
      secure_url: r.secure_url,
      width: r.width,
      height: r.height,
      format: r.format,
      bytes: r.bytes,
      created_at: r.created_at,
    }));
  } catch (error) {
    console.error("Cloudinary list error:", error);
    return [];
  }
}

export async function deleteCloudImage(publicId: string): Promise<boolean> {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Access denied');

  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
}
