import { getUser } from '@/lib/auth/actions';
import { redirect } from 'next/navigation';
import { LoginForm } from './login-form';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { error, success } = await searchParams;

  // If already logged in, redirect to home
  const user = await getUser();
  if (user) {
    redirect(`/${locale}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <LoginForm locale={locale} error={error} success={success} />
    </main>
  );
}
