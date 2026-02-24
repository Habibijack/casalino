'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@casalino/ui';
import { LISTING_STATUSES } from '@casalino/shared';
import { ListingsTable } from './ListingsTable';
import type { ListingRow } from '@/lib/api/client';
import {
  deleteListingAction,
  updateListingStatusAction,
} from '@/app/(dashboard)/listings/actions';

interface ListingsPageClientProps {
  listings: ListingRow[];
}

type StatusTab = 'all' | keyof typeof LISTING_STATUSES;

export function ListingsPageClient({ listings: initial }: ListingsPageClientProps) {
  const [listings, setListings] = useState(initial);
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm('Inserat wirklich loeschen?')) return;
    startTransition(async () => {
      const result = await deleteListingAction(id);
      if (result.success) {
        setListings((prev) => prev.filter((l) => l.id !== id));
      }
    });
  }

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      const result = await updateListingStatusAction(id, status);
      if (result.success && result.data) {
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, ...result.data } : l)),
        );
      }
    });
  }

  const filtered =
    activeTab === 'all'
      ? listings
      : listings.filter((l) => l.status === activeTab);

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

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as StatusTab)}
      >
        <TabsList>
          <TabsTrigger value="all">
            Alle ({listings.length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Entwurf ({listings.filter((l) => l.status === 'draft').length})
          </TabsTrigger>
          <TabsTrigger value="live">
            Live ({listings.filter((l) => l.status === 'live').length})
          </TabsTrigger>
          <TabsTrigger value="viewing">
            Besichtigung ({listings.filter((l) => l.status === 'viewing').length})
          </TabsTrigger>
          <TabsTrigger value="assigned">
            Vergeben ({listings.filter((l) => l.status === 'assigned').length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archiviert ({listings.filter((l) => l.status === 'archived').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className={isPending ? 'opacity-50' : ''}>
          <ListingsTable
            listings={filtered}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
