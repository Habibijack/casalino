'use server';

import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';

export async function createContractAction(data: {
  listingId: string;
  applicationId: string;
}) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: 'Nicht authentifiziert' };

  try {
    const client = createApiClient(token);
    const contract = await client.contracts.create(data);
    return { success: true, data: contract };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return { success: false, error: message };
  }
}

export async function updateContractDataAction(
  id: string,
  contractData: Record<string, unknown>,
) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: 'Nicht authentifiziert' };

  try {
    const client = createApiClient(token);
    await client.contracts.updateData(id, contractData);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return { success: false, error: message };
  }
}

export async function sendContractAction(id: string) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: 'Nicht authentifiziert' };

  try {
    const client = createApiClient(token);
    await client.contracts.send(id);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return { success: false, error: message };
  }
}

export async function updateHandoverAction(
  id: string,
  handoverData: Record<string, unknown>,
) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: 'Nicht authentifiziert' };

  try {
    const client = createApiClient(token);
    await client.contracts.updateHandover(id, handoverData);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return { success: false, error: message };
  }
}
