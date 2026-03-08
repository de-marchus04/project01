import { Metadata } from "next";
import { getArticleById } from "@/shared/api/blogApi";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const article = await getArticleById(resolvedParams.id);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoga-platform-ruby.vercel.app';
    
    if (!article) {
      return {
        title: "Статья не найдена | Блог YOGA.LIFE",
      };
    }

    return {
      title: `${article.title} | Блог YOGA.LIFE`,
      description: article.subtitle.substring(0, 160),
      alternates: {
        canonical: `${siteUrl}/blog/${resolvedParams.id}`,
      },
      openGraph: {
        title: article.title,
        description: article.subtitle.substring(0, 160),
        url: `${siteUrl}/blog/${resolvedParams.id}`,
        images: [article.imageUrl],
        type: "article",
      },
    };
  } catch (error) {
    return {
      title: "Статья | Блог YOGA.LIFE",
    };
  }
}

export default function BlogLayout({ children }: Props) {
  return <>{children}</>;
}