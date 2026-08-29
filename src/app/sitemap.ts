import type { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';

const SITE_URL = 'https://jeffstudio.ir';

// Dynamic sitemap for better crawlability
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let categories: { slug: string; updatedAt: Date }[] = [];
  let projects: { slug: string; updatedAt: Date; categoryId: string; category: { slug: string } }[] = [];

  try {
    const prisma = new PrismaClient();
    categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { order: 'asc' },
    });
    projects = await prisma.project.findMany({
      select: {
        slug: true,
        updatedAt: true,
        categoryId: true,
        category: { select: { slug: true } },
      },
      orderBy: { order: 'asc' },
    });
    await prisma.$disconnect();
  } catch {
    // If DB fails, return static sitemap
  }

  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}?lang=fa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}?lang=en`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}?lang=en&view=category&cat=${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Project pages (deep links)
  const projectPages: MetadataRoute.Sitemap = projects.map((proj) => ({
    url: `${SITE_URL}?lang=en&view=project&cat=${proj.category.slug}&proj=${proj.slug}`,
    lastModified: proj.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...projectPages];
}