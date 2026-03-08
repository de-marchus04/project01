import { Metadata } from 'next';
import BlogAllClient from './BlogAllClient';

export const metadata: Metadata = {
  title: 'Блог | YOGA.LIFE',
  description:
    'Блог YOGA.LIFE: статьи, видео, подкасты и рецепты для развития вашей йога-практики, медитации и осознанного образа жизни.',
  openGraph: {
    title: 'Блог | YOGA.LIFE',
    description: 'Статьи, видео, подкасты и рецепты для йога-практики.',
    type: 'website',
  },
};

export default function BlogPage() {
  return <BlogAllClient />;
}
