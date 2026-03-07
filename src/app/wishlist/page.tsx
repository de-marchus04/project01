import { Metadata } from 'next';
import WishlistPageClient from './WishlistPageClient';

export const metadata: Metadata = {
  title: 'Избранное | YOGA.LIFE',
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
