import { Metadata } from 'next';
import PrivacyPageClient from './PrivacyPageClient';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | YOGA.LIFE',
  description: 'Политика конфиденциальности YOGA.LIFE: как мы собираем, используем и защищаем ваши персональные данные при использовании нашей платформы.',
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
