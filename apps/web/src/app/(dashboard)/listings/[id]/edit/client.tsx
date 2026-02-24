'use client';

import { ListingForm } from '@/components/listings/ListingForm';
import { updateListingAction } from '../../actions';
import type { ListingRow } from '@/lib/api/client';

interface EditListingClientProps {
  listing: ListingRow;
}

export function EditListingClient({ listing }: EditListingClientProps) {
  async function handleUpdate(data: Record<string, unknown>) {
    const result = await updateListingAction(listing.id, data);
    if (!result.success) {
      throw new Error(result.error);
    }
  }

  return <ListingForm listing={listing} onSubmit={handleUpdate} />;
}
