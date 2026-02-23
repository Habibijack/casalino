import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button, Card, CardContent } from '@casalino/ui';

export default function ListingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl">Inserate</h1>
        <Button asChild>
          <Link href="/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            Neues Inserat
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Noch keine Inserate erstellt.
        </CardContent>
      </Card>
    </div>
  );
}
