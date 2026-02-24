'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { ViewingsList } from '@/components/viewings/ViewingsList';
import { CreateViewingDialog } from '@/components/viewings/CreateViewingDialog';
import { createViewingAction, updateViewingStatusAction, deleteViewingAction } from './actions';
import type { ViewingRow } from '@/lib/api/client';

interface ApplicationOption {
  id: string;
  applicantName: string;
  listingId: string;
  listingAddress: string;
}

interface ViewingsPageClientProps {
  viewings: ViewingRow[];
  applications: ApplicationOption[];
}

export function ViewingsPageClient({
  viewings,
  applications,
}: ViewingsPageClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function handleCreate(data: {
    listingId: string;
    applicationId: string;
    slotStart: string;
    slotEnd: string;
  }) {
    const result = await createViewingAction(data);
    if (result.success) {
      startTransition(() => router.refresh());
    }
  }

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      const result = await updateViewingStatusAction(id, status);
      if (result.success) {
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteViewingAction(id);
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl">Besichtigungen</h1>
        {applications.length > 0 && (
          <CreateViewingDialog
            applications={applications}
            onSubmit={handleCreate}
          />
        )}
      </div>

      <ViewingsList
        viewings={viewings}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}
