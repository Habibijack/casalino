'use server';

import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';

export async function createViewingAction(data: {
  listingId: string;
  applicationId: string;
  slotStart: string;
  slotEnd: string;
}) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: 'Nicht authentifiziert' };

  try {
    const client = createApiClient(token);
    const viewing = await client.viewings.create(data);
    return { success: true, data: viewing };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return { success: false, error: message };
  }
}

export async function updateViewingStatusAction(
  id: string,
  status: string,
) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: 'Nicht authentifiziert' };

  try {
    const client = createApiClient(token);
    const viewing = await client.viewings.update(id, { status });
    return { success: true, data: viewing };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return { success: false, error: message };
  }
}

export async function deleteViewingAction(id: string) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: 'Nicht authentifiziert' };

  try {
    const client = createApiClient(token);
    await client.viewings.delete(id);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return { success: false, error: message };
  }
}
