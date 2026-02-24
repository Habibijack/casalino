import Link from 'next/link';
import {
  Building2,
  Users,
  BarChart3,
  FileText,
  Shield,
  Zap,
} from 'lucide-react';
import { Button, Card, CardContent } from '@casalino/ui';

const FEATURES = [
  {
    icon: Users,
    title: 'Bewerbermanagement',
    text: 'Alle Bewerbungen zentral verwalten, filtern und mit dem Team teilen.',
  },
  {
    icon: Zap,
    title: 'AI-Scoring',
    text: 'Automatische Bewertung nach Finanzen, Dossier und Matching-Kriterien.',
  },
  {
    icon: Building2,
    title: 'Inserate verwalten',
    text: 'Inserate erstellen, auf Portalen publizieren und Statistiken einsehen.',
  },
  {
    icon: FileText,
    title: 'Digitale Vertraege',
    text: 'Mietvertraege generieren, versenden und digital unterschreiben lassen.',
  },
  {
    icon: BarChart3,
    title: 'Insights & Analytics',
    text: 'Funnel-Analysen, Scoring-Verteilung und Trend-Daten auf einen Blick.',
  },
  {
    icon: Shield,
    title: 'Datenschutz',
    text: 'Hosting in der Schweiz, DSGVO-konform, diskriminierungsfreies Scoring.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12">
        <span className="font-heading text-2xl">Casalino</span>
        <Button variant="outline" size="sm" asChild>
          <Link href="/login">Einloggen</Link>
        </Button>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="font-heading text-5xl tracking-tight sm:text-6xl lg:text-7xl">
          Vermietung. <br className="hidden sm:block" />
          Intelligent vereinfacht.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Casalino ist das AI-gestuetzte Vermietungstool fuer Schweizer
          Immobilienverwaltungen. Von der Bewerbung bis zum Vertrag —
          alles in einer Plattform.
        </p>
        <div className="mt-8 flex gap-4">
          <Button size="lg" asChild>
            <Link href="/login">Kostenlos starten</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/40 px-6 py-20 lg:px-12">
        <h2 className="mb-12 text-center font-heading text-3xl">
          Alles was Sie brauchen
        </h2>
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardContent className="flex flex-col gap-3 py-6">
                  <Icon className="h-8 w-8 text-primary" />
                  <h3 className="font-heading text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.text}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center lg:px-12">
        <h2 className="font-heading text-3xl">
          Bereit, Ihre Vermietung zu digitalisieren?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Starten Sie kostenlos und aktivieren Sie Premium-Features,
          wenn Sie sie brauchen.
        </p>
        <Button className="mt-8" size="lg" asChild>
          <Link href="/login">Jetzt starten</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground lg:px-12">
        &copy; {new Date().getFullYear()} Casalino. Made in Switzerland.
      </footer>
    </div>
  );
}
