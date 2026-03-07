import { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = {
  title: 'О нас | YOGA.LIFE',
  description: 'Узнайте о платформе YOGA.LIFE: наша миссия, ценности, команда опытных преподавателей и более 5 лет помощи в развитии практики йоги.',
};

export default function AboutPage() {
  return <AboutPageClient />;
}
