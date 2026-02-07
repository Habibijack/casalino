import { getSession } from '@/lib/auth/get-session';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const session = await getSession();
  if (!session) redirect(`/${locale}/login`);

  const supabase = await createSupabaseServerClient();

  const { count: listingCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, title, chat_type, updated_at')
    .eq('user_id', session.id)
    .order('updated_at', { ascending: false })
    .limit(5);

  const greeting: Record<string, string> = {
    de: 'Hallo',
    fr: 'Bonjour',
    it: 'Ciao',
  };

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-1 pt-2">
        <h1 className="text-2xl font-bold font-heading">
          {greeting[session.preferredLanguage] ?? greeting.de}, {session.fullName ?? session.email.split('@')[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          {session.preferredLanguage === 'fr'
            ? 'Trouvons ton appartement idéal.'
            : session.preferredLanguage === 'it'
              ? 'Troviamo il tuo appartamento ideale.'
              : 'Finden wir deine ideale Wohnung.'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-primary">{listingCount ?? 0}</div>
            <div className="text-xs text-muted-foreground">Aktive Inserate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{conversations?.length ?? 0}</div>
            <div className="text-xs text-muted-foreground">Chats</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schnellstart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <a
            href={`/${locale}/listings`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors"
          >
            <span className="text-xl">🔍</span>
            <div>
              <div className="text-sm font-medium">Inserate durchsuchen</div>
              <div className="text-xs text-muted-foreground">{listingCount} Wohnungen verfügbar</div>
            </div>
          </a>
          <div className="border-t border-border" />
          <a
            href={`/${locale}/dossier`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors"
          >
            <span className="text-xl">📄</span>
            <div>
              <div className="text-sm font-medium">Dossier erstellen</div>
              <div className="text-xs text-muted-foreground">Bewerbungsunterlagen vorbereiten</div>
            </div>
          </a>
        </CardContent>
      </Card>

      {/* Recent Chats */}
      {conversations && conversations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Letzte Chats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-background transition-colors"
              >
                <span className="text-lg">
                  {conv.chat_type === 'listing' ? '🏠' : '💬'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{conv.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(conv.updated_at).toLocaleDateString('de-CH')}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
