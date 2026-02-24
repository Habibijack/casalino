'use client';

import { ListingForm } from '@/components/listings/ListingForm';
import { createListingAction } from '../actions';

export function NewListingClient() {
  async function handleCreate(data: Record<string, unknown>) {
    const result = await createListingAction(data);
    if (!result.success) {
      throw new Error(result.error);
    }
  }

  return <ListingForm onSubmit={handleCreate} />;
}
