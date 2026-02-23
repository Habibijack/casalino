import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent } from '@casalino/ui';

export default function NewListingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/listings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-heading text-3xl">Neues Inserat erstellen</h1>
      </div>

      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Inserat-Wizard wird in Phase 2 implementiert.
        </CardContent>
      </Card>
    </div>
  );
}
