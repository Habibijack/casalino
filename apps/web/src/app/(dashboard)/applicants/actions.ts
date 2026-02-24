'use server';

import { revalidatePath } from 'next/cache';
import { createApiClient, type ApplicationRow } from '@/lib/api/client';
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

export async function updateApplicationStatusAction(
  id: string,
  status: string,
): Promise<ActionResult<ApplicationRow>> {
  try {
    const client = await getClient();
    const application = await client.applications.updateStatus(id, status);
    revalidatePath('/applicants');
    revalidatePath(`/applicants/${id}`);
    return { success: true, data: application };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fehler beim Statuswechsel';
    return { success: false, error: message };
  }
}
