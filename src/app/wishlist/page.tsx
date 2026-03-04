import { Metadata } from 'next';
import WishlistPageClient from './WishlistPageClient';

export const metadata: Metadata = {
  title: 'Избранное | YOGA.LIFE',
  description: 'Ваш список желаний — сохранённые курсы, консультации и туры',
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
