import { ProfileForm } from '@/components/search-profiles/profile-form';
import { getTranslations } from 'next-intl/server';

export default async function NewProfilePage() {
  const t = await getTranslations('searchProfile');

  return (
    <main className="max-w-lg mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold font-heading">{t('create')}</h1>
      <ProfileForm />
    </main>
  );
}
