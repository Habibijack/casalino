'use server';

import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';

export async function inviteMemberAction(data: { email: string; role: string }) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: 'Nicht authentifiziert' };

  try {
    const client = createApiClient(token);
    await client.members.invite(data);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return { success: false, error: message };
  }
}

export async function updateMemberRoleAction(memberId: string, role: string) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: 'Nicht authentifiziert' };

  try {
    const client = createApiClient(token);
    await client.members.updateRole(memberId, role);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return { success: false, error: message };
  }
}

export async function removeMemberAction(memberId: string) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: 'Nicht authentifiziert' };

  try {
    const client = createApiClient(token);
    await client.members.remove(memberId);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return { success: false, error: message };
  }
}

export async function updateOrganizationAction(data: Record<string, unknown>) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: 'Nicht authentifiziert' };

  try {
    const client = createApiClient(token);
    await client.members.updateOrganization(data);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return { success: false, error: message };
  }
}
