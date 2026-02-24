'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@casalino/ui';
import { updateListingStatusAction } from '../actions';

interface ListingStatusActionsProps {
  listingId: string;
  currentStatus: string;
}

const STATUS_TRANSITIONS: Record<string, Array<{ status: string; label: string }>> = {
  draft: [{ status: 'live', label: 'Live schalten' }],
  live: [
    { status: 'viewing', label: 'Besichtigung starten' },
    { status: 'archived', label: 'Archivieren' },
  ],
  viewing: [
    { status: 'assigned', label: 'Vergeben' },
    { status: 'live', label: 'Zurueck zu Live' },
  ],
  assigned: [{ status: 'archived', label: 'Archivieren' }],
  archived: [{ status: 'draft', label: 'Reaktivieren' }],
};

export function ListingStatusActions({
  listingId,
  currentStatus,
}: ListingStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const transitions = STATUS_TRANSITIONS[currentStatus] ?? [];

  if (transitions.length === 0) return null;

  function handleChange(status: string) {
    startTransition(async () => {
      const result = await updateListingStatusAction(listingId, status);
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isPending}>
          {isPending ? 'Wird geaendert...' : 'Status aendern'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {transitions.map((t) => (
          <DropdownMenuItem key={t.status} onClick={() => handleChange(t.status)}>
            {t.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
