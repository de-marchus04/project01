import { Metadata } from 'next';
import TermsPageClient from './TermsPageClient';

export const metadata: Metadata = {
  title: 'Условия использования | YOGA.LIFE',
  description:
    'Условия использования платформы YOGA.LIFE: правила доступа к курсам, правила поведения пользователей и ответственность сторон.',
};

export default function TermsPage() {
  return <TermsPageClient />;
}
