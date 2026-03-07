import { Metadata } from 'next';
import BlogAllClient from './BlogAllClient';

export const metadata: Metadata = {
  title: 'Блог | YOGA.LIFE',
  description: 'Блог YOGA.LIFE: статьи, видео, подкасты и рецепты для развития вашей йога-практики, медитации и осознанного образа жизни.',
};

export default function BlogPage() {
  return <BlogAllClient />;
}
