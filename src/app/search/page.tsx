import { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'Поиск | YOGA.LIFE',
  description: 'Поиск по курсам, турам, консультациям и статьям',
};

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  return <SearchClient initialQuery={searchParams.q} />;
}
