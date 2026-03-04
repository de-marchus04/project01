import { Metadata } from 'next';
import BlogAllClient from './BlogAllClient';

export const metadata: Metadata = {
  title: 'Блог | YOGA.LIFE',
  description: 'Статьи, видео, подкасты и рецепты для вашей йога-практики',
};

export default function BlogPage() {
  return <BlogAllClient />;
}
