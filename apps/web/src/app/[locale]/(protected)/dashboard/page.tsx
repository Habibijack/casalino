import { getSession } from '@/lib/auth/get-session';
import { redirect } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { SignOutButton } from './sign-out-button';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const session = await getSession();
  if (!session) redirect(`/${locale}/login`);

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-heading">
          Hallo, {session.fullName || session.email} 👋
        </h1>
        <p className="text-muted-foreground">
          Willkommen zurück bei Casalino
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📧 E-Mail</CardTitle>
            <CardDescription>{session.email}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🌍 Sprache</CardTitle>
            <CardDescription>
              {session.preferredLanguage.toUpperCase()}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💳 Abo</CardTitle>
            <CardDescription className="capitalize">
              {session.tier}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">✅ Status</CardTitle>
            <CardDescription>Eingeloggt</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <SignOutButton locale={locale} />
    </main>
  );
}
