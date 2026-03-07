import { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'Контакты | YOGA.LIFE',
  description: 'Свяжитесь с нами: задайте вопрос, запишитесь на консультацию или узнайте подробнее о наших курсах и турах по йоге.',
};

export default function ContactPage() {
  return <ContactPageClient />;
}
