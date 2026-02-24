'use server';

import { revalidatePath } from 'next/cache';
import { createApiClient, type ListingRow } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

async function getClient() {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  return createApiClient(token);
}

export async function createListingAction(
  data: Record<string, unknown>,
): Promise<ActionResult<ListingRow>> {
  try {
    const client = await getClient();
    const listing = await client.listings.create(data);
    revalidatePath('/listings');
    return { success: true, data: listing };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fehler beim Erstellen';
    return { success: false, error: message };
  }
}

export async function updateListingAction(
  id: string,
  data: Record<string, unknown>,
): Promise<ActionResult<ListingRow>> {
  try {
    const client = await getClient();
    const listing = await client.listings.update(id, data);
    revalidatePath('/listings');
    revalidatePath(`/listings/${id}`);
    return { success: true, data: listing };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fehler beim Aktualisieren';
    return { success: false, error: message };
  }
}

export async function updateListingStatusAction(
  id: string,
  status: string,
): Promise<ActionResult<ListingRow>> {
  try {
    const client = await getClient();
    const listing = await client.listings.updateStatus(id, status);
    revalidatePath('/listings');
    revalidatePath(`/listings/${id}`);
    return { success: true, data: listing };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fehler beim Statuswechsel';
    return { success: false, error: message };
  }
}

export async function generateListingTextAction(
  id: string,
): Promise<ActionResult<ListingRow>> {
  try {
    const client = await getClient();
    const listing = await client.listings.generateText(id);
    revalidatePath('/listings');
    revalidatePath(`/listings/${id}`);
    return { success: true, data: listing };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fehler bei der Textgenerierung';
    return { success: false, error: message };
  }
}

export async function deleteListingAction(
  id: string,
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const client = await getClient();
    const result = await client.listings.delete(id);
    revalidatePath('/listings');
    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fehler beim Loeschen';
    return { success: false, error: message };
  }
}
