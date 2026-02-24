import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Impressum der Casalino Vermietungsplattform – SwissCreo GmbH, Schweiz.',
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurueck zur Startseite
      </Link>

      <h1 className="font-heading text-4xl tracking-tight">Impressum</h1>

      <section className="mt-10">
        <h2 className="font-heading text-xl">Firma</h2>
        <div className="mt-3 space-y-1 text-muted-foreground">
          <p>SwissCreo GmbH</p>
          <p>Musterstrasse 1</p>
          <p>8001 Zuerich, Schweiz</p>
          <p>UID-Nummer: CHE-XXX.XXX.XXX</p>
          <p>Handelsregister: Kanton Zuerich</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl">Kontakt</h2>
        <div className="mt-3 space-y-1 text-muted-foreground">
          <p>
            E-Mail:{' '}
            <a
              href="mailto:info@casalino.ch"
              className="text-foreground underline underline-offset-4 hover:text-accent"
            >
              info@casalino.ch
            </a>
          </p>
          <p>
            Website:{' '}
            <a
              href="https://casalino.ch"
              className="text-foreground underline underline-offset-4 hover:text-accent"
            >
              casalino.ch
            </a>
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl">Haftungsausschluss</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Der Autor uebernimmt keinerlei Gewaehr hinsichtlich der
          inhaltlichen Richtigkeit, Genauigkeit, Aktualitaet,
          Zuverlaessigkeit und Vollstaendigkeit der Informationen. Haftungsansprueche
          gegen den Autor wegen Schaeden materieller oder immaterieller Art,
          welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der
          veroeffentlichten Informationen, durch Missbrauch der Verbindung oder
          durch technische Stoerungen entstanden sind, werden ausgeschlossen.
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Alle Angebote sind unverbindlich. Der Autor behaelt es sich
          ausdruecklich vor, Teile der Seiten oder das gesamte Angebot ohne
          gesonderte Ankuendigung zu veraendern, zu ergaenzen, zu loeschen
          oder die Veroeffentlichung zeitweise oder endgueltig einzustellen.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl">Haftung fuer Links</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres
          Verantwortungsbereichs. Es wird jegliche Verantwortung fuer solche
          Webseiten abgelehnt. Der Zugriff und die Nutzung solcher Webseiten
          erfolgen auf eigene Gefahr des Nutzers.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl">Urheberrecht</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos
          oder anderen Dateien auf der Website gehoeren ausschliesslich der
          SwissCreo GmbH oder den speziell genannten Rechtsinhabern. Fuer die
          Reproduktion jeglicher Elemente ist die schriftliche Zustimmung der
          Urheberrechtstraeger im Voraus einzuholen.
        </p>
      </section>
    </div>
  );
}
