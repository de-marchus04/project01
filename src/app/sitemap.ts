import { MetadataRoute } from 'next';
import { prisma } from '@/shared/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoga-platform-ruby.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/courses`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/courses-beginners`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/courses-meditation`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/courses-back`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/courses-women`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/consultations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/consultations-private`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/consultations-nutrition`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/consultations-mentorship`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/tours`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/blog-articles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/blog-videos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/blog-podcasts`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/blog-recipes`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const [courses, consultations, tours, articles] = await Promise.all([
      prisma.course.findMany({ select: { id: true, updatedAt: true } }),
      prisma.consultation.findMany({ select: { id: true, updatedAt: true } }),
      prisma.tour.findMany({ select: { id: true, updatedAt: true } }),
      prisma.article.findMany({ select: { id: true, updatedAt: true } }),
    ]);

    const dynamicRoutes: MetadataRoute.Sitemap = [
      ...courses.map((c) => ({
        url: `${BASE_URL}/courses/${c.id}`,
        lastModified: c.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...consultations.map((c) => ({
        url: `${BASE_URL}/consultations/${c.id}`,
        lastModified: c.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...tours.map((t) => ({
        url: `${BASE_URL}/tours/${t.id}`,
        lastModified: t.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...articles.map((a) => ({
        url: `${BASE_URL}/blog/${a.id}`,
        lastModified: a.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ];

    return [...staticRoutes, ...dynamicRoutes];
  } catch {
    return staticRoutes;
  }
}
