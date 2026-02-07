import { getSession } from '@/lib/auth/get-session';
import { redirect } from 'next/navigation';
import { ProfileForm } from './profile-form';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  return (
    <main className="max-w-lg mx-auto p-6">
      <ProfileForm session={session} locale={locale} />
    </main>
  );
}
