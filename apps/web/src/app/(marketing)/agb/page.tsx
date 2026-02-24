import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AGB',
  description: 'Allgemeine Geschaeftsbedingungen der Casalino Vermietungsplattform fuer Schweizer Immobilienverwaltungen.',
  robots: { index: true, follow: true },
};

export default function AGBPage() {
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
        Allgemeine Geschaeftsbedingungen
      </h1>

      <section className="mt-10">
        <h2 className="font-heading text-xl">1. Geltungsbereich</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Diese Allgemeinen Geschaeftsbedingungen (AGB) gelten fuer saemtliche
          Leistungen, die von der SwissCreo GmbH (nachfolgend &quot;Anbieterin&quot;)
          ueber die Plattform Casalino (nachfolgend &quot;Plattform&quot;) erbracht
          werden. Mit der Registrierung und Nutzung der Plattform akzeptiert
          der Kunde (nachfolgend &quot;Kunde&quot;) diese AGB in ihrer jeweils
          gueltigen Fassung.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl">2. Leistungen</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Die Plattform bietet Schweizer Immobilienverwaltungen ein
          AI-gestuetztes Vermietungstool mit folgenden Kernfunktionen:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            Inserat-Erstellung mit AI-gestuetzter Textgenerierung und
            Preisvorschlaegen
          </li>
          <li>
            AI-Bewerber-Screening mit 100-Punkte-Bewertungssystem und
            Bonitaetspruefung
          </li>
          <li>
            Besichtigungs-Autopilot mit automatischer Terminplanung und
            Erinnerungen
          </li>
          <li>
            Digitale Mietvertraege mit vorausgefuellten Daten und digitaler
            Signatur
          </li>
        </ul>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Die Anbieterin behaelt sich das Recht vor, den Funktionsumfang
          jederzeit zu erweitern, zu aendern oder einzuschraenken.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl">3. Preise</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Die Nutzung der Grundfunktionen (Inserat-Erstellung) ist kostenlos.
          Fuer Premium-Funktionen gelten folgende Preise:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-2 text-muted-foreground">
          <li>AI-Bewerber-Screening: CHF 199 pro Inserat</li>
          <li>Besichtigungs-Autopilot: Im Screening-Paket inbegriffen</li>
          <li>Smart Mietvertrag: CHF 49 pro Vertrag</li>
        </ul>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Alle Preise verstehen sich exklusive Mehrwertsteuer (MwSt.), sofern
          anwendbar. Die Anbieterin behaelt sich Preisaenderungen vor, die
          dem Kunden mindestens 30 Tage im Voraus mitgeteilt werden.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl">4. Zahlungsbedingungen</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Die Abrechnung erfolgt auf Basis der tatsaechlich genutzten
          Leistungen. Zahlungen werden ueber den Zahlungsdienstleister
          Stripe abgewickelt. Rechnungen sind innert 30 Tagen nach
          Rechnungsstellung faellig. Bei Zahlungsverzug behaelt sich die
          Anbieterin das Recht vor, den Zugang zur Plattform einzuschraenken.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl">5. Datenschutz</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Die Anbieterin verpflichtet sich zur Einhaltung des Schweizer
          Datenschutzgesetzes (nDSG) sowie der anwendbaren
          Datenschutzbestimmungen. Detaillierte Informationen zur Datenverarbeitung
          finden Sie in unserer{' '}
          <Link
            href="/datenschutz"
            className="text-foreground underline underline-offset-4 hover:text-accent"
          >
            Datenschutzerklaerung
          </Link>
          .
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl">6. Haftung</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Die Anbieterin haftet ausschliesslich fuer direkte Schaeden, die
          auf grobe Fahrlaessigkeit oder Vorsatz zurueckzufuehren sind. Die
          Haftung fuer indirekte Schaeden, entgangenen Gewinn oder
          Datenverlust ist ausgeschlossen, soweit gesetzlich zulaessig. Die
          AI-gestuetzten Bewertungen und Empfehlungen der Plattform stellen
          keine rechtsverbindlichen Beratungen dar. Der Kunde ist fuer die
          endgueltige Entscheidungsfindung selbst verantwortlich.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl">7. Kuendigung</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Der Kunde kann sein Konto jederzeit kuendigen. Bei Kuendigung werden
          die Daten gemaess den gesetzlichen Aufbewahrungsfristen und der
          Datenschutzerklaerung behandelt. Die Anbieterin kann das
          Vertragsverhaeltnis bei schwerwiegenden Verstoessen gegen diese AGB
          fristlos kuendigen.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl">8. Anwendbares Recht</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Diese AGB unterstehen dem Schweizer Recht. Die Anwendbarkeit des
          UN-Kaufrechts (CISG) wird ausdruecklich ausgeschlossen.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl">9. Gerichtsstand</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Ausschliesslicher Gerichtsstand fuer saemtliche Streitigkeiten aus
          oder im Zusammenhang mit diesen AGB ist Zuerich, Schweiz. Zwingende
          gesetzliche Gerichtsstaende bleiben vorbehalten.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl">10. Salvatorische Klausel</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Sollte eine Bestimmung dieser AGB unwirksam oder undurchfuehrbar
          sein oder werden, so wird die Wirksamkeit der uebrigen Bestimmungen
          davon nicht beruehrt. Anstelle der unwirksamen Bestimmung tritt eine
          Regelung, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung
          am naechsten kommt.
        </p>
      </section>

      <p className="mt-12 text-sm text-muted-foreground">
        Stand: Februar 2026
      </p>
    </div>
  );
}
