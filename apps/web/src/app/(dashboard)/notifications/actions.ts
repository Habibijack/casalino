'use server';

import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';

export async function markNotificationReadAction(id: string) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: 'Nicht authentifiziert' };

  try {
    const client = createApiClient(token);
    await client.notifications.markRead(id);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return { success: false, error: message };
  }
}

export async function markAllNotificationsReadAction() {
  const token = await getAccessToken();
  if (!token) return { success: false, error: 'Nicht authentifiziert' };

  try {
    const client = createApiClient(token);
    await client.notifications.markAllRead();
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return { success: false, error: message };
  }
}
