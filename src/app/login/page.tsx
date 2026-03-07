import { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Вход | YOGA.LIFE',
  robots: { index: false },
};

export default function LoginPage() {
  return <LoginClient />;
}
