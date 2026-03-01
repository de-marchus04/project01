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
    
    if (!article) {
      return {
        title: "Статья не найдена | Блог YOGA.LIFE",
      };
    }

    return {
      title: `${article.title} | Блог YOGA.LIFE`,
      description: article.subtitle.substring(0, 160),
      openGraph: {
        title: article.title,
        description: article.subtitle.substring(0, 160),
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