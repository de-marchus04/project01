import { Metadata } from 'next';
import { getArticleById } from '@/shared/api/blogApi';
import ArticleDetailClient from './ArticleDetailClient';

const BASE_URL = 'https://yoga-platform-9j65.vercel.app';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const article = await getArticleById(params.id);
    if (!article) return { title: 'Статья | YOGA.LIFE' };
    return {
      title: `${article.title} | YOGA.LIFE`,
      description: article.subtitle?.slice(0, 160) || article.title,
      openGraph: {
        title: article.title,
        description: article.subtitle?.slice(0, 160) || article.title,
        images: article.imageUrl ? [{ url: article.imageUrl }] : [],
        url: `${BASE_URL}/blog/${params.id}`,
        type: 'article',
      },
    };
  } catch {
    return { title: 'Статья | YOGA.LIFE' };
  }
}

export default function ArticlePage() {
  return <ArticleDetailClient />;
}
