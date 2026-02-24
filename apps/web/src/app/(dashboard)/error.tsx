'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button, Card, CardContent } from '@casalino/ui';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[dashboard] Error:', error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <h2 className="font-heading text-xl">
            Etwas ist schiefgelaufen
          </h2>
          <p className="text-sm text-muted-foreground">
            Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie
            es erneut.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Fehler-ID: {error.digest}
            </p>
          )}
          <Button onClick={reset}>Erneut versuchen</Button>
        </CardContent>
      </Card>
    </div>
  );
}
