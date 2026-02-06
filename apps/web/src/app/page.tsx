import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight font-heading text-foreground">
            Casalino
          </h1>
          <p className="text-xl text-muted-foreground font-body">
            Dein KI-Wohnungsassistent für die Schweiz
          </p>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Button>Wohnung suchen</Button>
          <Button variant="secondary">Mehr erfahren</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔍 KI-Suche</CardTitle>
              <CardDescription>
                Beschreibe was du suchst – die KI findet passende Wohnungen.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🌍 Mehrsprachig</CardTitle>
              <CardDescription>
                Schreibe in deiner Sprache – Bewerbungen in der Inserat-Sprache.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📄 Dossier</CardTitle>
              <CardDescription>
                Alle Dokumente an einem Ort. KI-generiertes Motivationsschreiben.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          <span className="px-3 py-1 rounded-full bg-success-light text-success text-xs font-medium">
            ✅ Next.js 15
          </span>
          <span className="px-3 py-1 rounded-full bg-success-light text-success text-xs font-medium">
            ✅ TypeScript Strict
          </span>
          <span className="px-3 py-1 rounded-full bg-success-light text-success text-xs font-medium">
            ✅ Tailwind v4
          </span>
          <span className="px-3 py-1 rounded-full bg-success-light text-success text-xs font-medium">
            ✅ shadcn/ui
          </span>
          <span className="px-3 py-1 rounded-full bg-info-light text-info text-xs font-medium">
            🔜 Supabase
          </span>
          <span className="px-3 py-1 rounded-full bg-info-light text-info text-xs font-medium">
            🔜 i18n
          </span>
        </div>
      </div>
    </main>
  );
}
