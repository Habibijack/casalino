import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@casalino/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <div>
        <h1 className="font-heading text-4xl">404</h1>
        <p className="mt-2 text-muted-foreground">
          Diese Seite wurde nicht gefunden.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Zur Startseite</Link>
      </Button>
    </div>
  );
}
