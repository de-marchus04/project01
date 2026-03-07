import { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'Поиск | YOGA.LIFE',
  description: 'Поиск по всему каталогу YOGA.LIFE: быстро найдите курсы йоги, оздоровительные туры, консультации и статьи нашего блога.',
};

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  return <SearchClient initialQuery={searchParams.q} />;
}
