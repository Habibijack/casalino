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
import { updateApplicationStatusAction } from '../actions';

interface ApplicantStatusActionsProps {
  applicationId: string;
  currentStatus: string;
}

const STATUS_TRANSITIONS: Record<string, Array<{ status: string; label: string }>> = {
  new: [
    { status: 'screening', label: 'In Pruefung nehmen' },
    { status: 'rejected', label: 'Absagen' },
  ],
  screening: [
    { status: 'invited', label: 'Zur Besichtigung einladen' },
    { status: 'rejected', label: 'Absagen' },
  ],
  invited: [
    { status: 'confirmed', label: 'Zusagen' },
    { status: 'rejected', label: 'Absagen' },
  ],
  rejected: [
    { status: 'new', label: 'Reaktivieren' },
  ],
  confirmed: [],
};

export function ApplicantStatusActions({
  applicationId,
  currentStatus,
}: ApplicantStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const transitions = STATUS_TRANSITIONS[currentStatus] ?? [];

  if (transitions.length === 0) return null;

  function handleChange(status: string) {
    startTransition(async () => {
      const result = await updateApplicationStatusAction(applicationId, status);
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
