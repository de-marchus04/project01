import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'Профиль | YOGA.LIFE',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
