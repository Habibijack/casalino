import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Datenschutzerklaerung -- Casalino',
  description: 'Datenschutzerklaerung der Casalino Vermietungsplattform gemaess nDSG.',
};

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurueck zur Startseite
      </Link>

      <h1 className="font-heading text-4xl tracking-tight">
        Datenschutzerklaerung
      </h1>
      <p className="mt-4 text-muted-foreground">
        Gemaess dem Schweizer Datenschutzgesetz (nDSG) und der anwendbaren
        Datenschutzbestimmungen.
      </p>

      {/* 1. Verantwortliche Stelle */}
      <section className="mt-10">
        <h2 className="font-heading text-xl">1. Verantwortliche Stelle</h2>
        <div className="mt-3 space-y-1 text-muted-foreground">
          <p>SwissCreo GmbH</p>
          <p>Musterstrasse 1</p>
          <p>8001 Zuerich, Schweiz</p>
          <p>
            E-Mail:{' '}
            <a
              href="mailto:datenschutz@casalino.ch"
              className="text-foreground underline underline-offset-4 hover:text-accent"
            >
              datenschutz@casalino.ch
            </a>
          </p>
        </div>
      </section>

      {/* 2. Erhobene Daten */}
      <section className="mt-10">
        <h2 className="font-heading text-xl">2. Erhobene Daten</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Wir erheben folgende Kategorien personenbezogener Daten:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Registrierungsdaten:</strong>{' '}
            Name, E-Mail-Adresse, Firmenname, Rolle
          </li>
          <li>
            <strong className="text-foreground">Bewerbungsdaten:</strong>{' '}
            Personalien, Arbeitgeber, Einkommen, Dokumente (Betreibungsauszug,
            Lohnausweise, Ausweiskopie)
          </li>
          <li>
            <strong className="text-foreground">Nutzungsdaten:</strong>{' '}
            IP-Adresse, Browser-Typ, Zugriffszeiten, aufgerufene Seiten
          </li>
          <li>
            <strong className="text-foreground">Kommunikationsdaten:</strong>{' '}
            Nachrichten zwischen Verwaltung und Bewerbern ueber die Plattform
          </li>
          <li>
            <strong className="text-foreground">Vertragsdaten:</strong>{' '}
            Mietvertragsinformationen, digitale Signaturen
          </li>
        </ul>
      </section>

      {/* 3. Zweck der Verarbeitung */}
      <section className="mt-10">
        <h2 className="font-heading text-xl">3. Zweck der Verarbeitung</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Wir verarbeiten personenbezogene Daten fuer folgende Zwecke:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            Bereitstellung und Betrieb der Vermietungsmanagement-Plattform
          </li>
          <li>
            AI-gestuetztes Bewerber-Screening und Scoring (automatisierte
            Bewertung auf Basis objektiver Kriterien)
          </li>
          <li>
            Kommunikation zwischen Immobilienverwaltungen und Bewerbern
          </li>
          <li>Erstellung und Verwaltung digitaler Mietvertraege</li>
          <li>Terminplanung fuer Besichtigungen</li>
          <li>Bonitaetspruefungen ueber Drittanbieter (tilbago)</li>
          <li>Abrechnung und Rechnungsstellung</li>
          <li>
            Verbesserung der Plattform und Fehlerbehebung
          </li>
        </ul>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Das AI-Scoring berueckt ausschliesslich objektive Kriterien
          (Finanzen, Dokumentenvollstaendigkeit, Matching). Nationalitaet,
          Geschlecht, Alter, Religion oder sexuelle Orientierung fliessen
          nicht in die Bewertung ein.
        </p>
      </section>

      {/* 4. Drittanbieter */}
      <section className="mt-10">
        <h2 className="font-heading text-xl">4. Drittanbieter</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Zur Erbringung unserer Leistungen setzen wir folgende Drittanbieter
          ein:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Supabase Inc.</strong> --
            Datenbank und Authentifizierung (Serverstandort: EU)
          </li>
          <li>
            <strong className="text-foreground">Stripe Inc.</strong> --
            Zahlungsabwicklung (PCI-DSS-konform)
          </li>
          <li>
            <strong className="text-foreground">Anthropic PBC</strong> --
            AI-Analyse und Textgenerierung (keine Speicherung von
            Nutzerdaten durch Anthropic)
          </li>
          <li>
            <strong className="text-foreground">tilbago AG</strong> --
            Bonitaetspruefung und Betreibungsauskuenfte (Schweiz)
          </li>
          <li>
            <strong className="text-foreground">Resend Inc.</strong> --
            Transaktionaler E-Mail-Versand
          </li>
          <li>
            <strong className="text-foreground">Vercel Inc.</strong> --
            Hosting und Content Delivery (Edge-Netzwerk)
          </li>
        </ul>
      </section>

      {/* 5. Datenweitergabe */}
      <section className="mt-10">
        <h2 className="font-heading text-xl">5. Datenweitergabe</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Personenbezogene Daten werden nicht verkauft und nur an die unter
          Punkt 4 genannten Drittanbieter weitergegeben, soweit dies fuer die
          Erbringung der jeweiligen Leistung erforderlich ist. Eine
          Datenweitergabe an weitere Dritte erfolgt nur mit ausdruecklicher
          Einwilligung der betroffenen Person oder aufgrund gesetzlicher
          Verpflichtungen.
        </p>
      </section>

      {/* 6. Aufbewahrungsdauer */}
      <section className="mt-10">
        <h2 className="font-heading text-xl">6. Aufbewahrungsdauer</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Bewerbungsdaten:</strong>{' '}
            6 Monate nach Abschluss des Vermietungsverfahrens, danach
            automatische Loeschung
          </li>
          <li>
            <strong className="text-foreground">Vertragsdaten:</strong>{' '}
            10 Jahre gemaess den gesetzlichen Aufbewahrungspflichten (OR Art. 958f)
          </li>
          <li>
            <strong className="text-foreground">Nutzungsdaten:</strong>{' '}
            90 Tage fuer Sicherheits- und Analysezwecke
          </li>
          <li>
            <strong className="text-foreground">Kontodaten:</strong>{' '}
            Bis zur Loeschung des Kontos durch den Nutzer
          </li>
        </ul>
      </section>

      {/* 7. Rechte der Betroffenen */}
      <section className="mt-10">
        <h2 className="font-heading text-xl">7. Rechte der Betroffenen</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Gemaess dem Schweizer Datenschutzgesetz (nDSG) haben Sie folgende
          Rechte:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Auskunftsrecht:</strong>{' '}
            Sie koennen jederzeit Auskunft ueber Ihre gespeicherten
            personenbezogenen Daten verlangen.
          </li>
          <li>
            <strong className="text-foreground">Berichtigungsrecht:</strong>{' '}
            Sie koennen die Berichtigung unrichtiger oder unvollstaendiger
            Daten verlangen.
          </li>
          <li>
            <strong className="text-foreground">Loeschungsrecht:</strong>{' '}
            Sie koennen die Loeschung Ihrer personenbezogenen Daten verlangen,
            soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
          </li>
          <li>
            <strong className="text-foreground">Datenportabilitaet:</strong>{' '}
            Sie haben das Recht, Ihre Daten in einem gaengigen,
            maschinenlesbaren Format zu erhalten.
          </li>
          <li>
            <strong className="text-foreground">Widerspruchsrecht:</strong>{' '}
            Sie koennen der Verarbeitung Ihrer Daten jederzeit widersprechen.
          </li>
        </ul>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Zur Ausuebung Ihrer Rechte kontaktieren Sie uns bitte unter{' '}
          <a
            href="mailto:datenschutz@casalino.ch"
            className="text-foreground underline underline-offset-4 hover:text-accent"
          >
            datenschutz@casalino.ch
          </a>
          .
        </p>
      </section>

      {/* 8. Cookies */}
      <section className="mt-10">
        <h2 className="font-heading text-xl">8. Cookies</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Die Plattform verwendet ausschliesslich essenzielle
          Session-Cookies, die fuer die Authentifizierung und den Betrieb der
          Plattform zwingend erforderlich sind. Es werden keine
          Tracking-Cookies, Analyse-Cookies oder Werbe-Cookies eingesetzt.
          Die Session-Cookies werden nach dem Abmelden oder nach Ablauf der
          Sitzung automatisch geloescht.
        </p>
      </section>

      {/* 9. Kontakt */}
      <section className="mt-10">
        <h2 className="font-heading text-xl">
          9. Kontakt fuer Datenschutzanfragen
        </h2>
        <div className="mt-3 space-y-1 text-muted-foreground">
          <p>SwissCreo GmbH</p>
          <p>Datenschutzverantwortlicher</p>
          <p>Musterstrasse 1</p>
          <p>8001 Zuerich, Schweiz</p>
          <p>
            E-Mail:{' '}
            <a
              href="mailto:datenschutz@casalino.ch"
              className="text-foreground underline underline-offset-4 hover:text-accent"
            >
              datenschutz@casalino.ch
            </a>
          </p>
        </div>
      </section>

      <div className="mt-12 rounded-lg border border-border bg-muted/40 p-4">
        <p className="text-sm text-muted-foreground">
          Diese Datenschutzerklaerung wurde maschinell erstellt und muss von
          einem Anwalt geprueft werden.
        </p>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Stand: Februar 2026
      </p>
    </div>
  );
}
