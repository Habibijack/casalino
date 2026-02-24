import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@casalino/ui';
import { NewListingClient } from './client';

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

      <NewListingClient />
    </div>
  );
}
