import { Metadata } from 'next';
import FAQPageClient from './FAQPageClient';

export const metadata: Metadata = {
  title: 'Частые вопросы | YOGA.LIFE',
  description: 'Ответы на часто задаваемые вопросы о курсах, турах и консультациях YOGA.LIFE: как начать, как записаться, оплата и доступ к материалам.',
};

export default function FAQPage() {
  return <FAQPageClient />;
}
