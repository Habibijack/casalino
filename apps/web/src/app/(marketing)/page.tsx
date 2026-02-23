import Link from 'next/link';
import { Button } from '@casalino/ui';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-5xl tracking-tight sm:text-6xl">
        Casalino
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        AI-gestuetztes Vermietungstool fuer die Schweiz
      </p>
      <Button className="mt-8" size="lg" asChild>
        <Link href="/login">Jetzt einloggen</Link>
      </Button>
    </div>
  );
}
