'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/get-session';
import { revalidatePath } from 'next/cache';

export type SearchProfileInput = {
  name: string;
  cities: string[];
  cantons?: string[];
  minRooms?: number | null;
  maxRooms?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minArea?: number | null;
  maxArea?: number | null;
  keywords?: string[];
  excludeKeywords?: string[];
  preferredFloor?: string;
  maxCommuteMinutes?: number | null;
  commuteDestination?: string;
  notifyEmail?: boolean;
  notifyFrequency?: string;
};

export async function createSearchProfile(input: SearchProfileInput) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const supabase = await createSupabaseServerClient();

  const { count } = await supabase
    .from('search_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.id);

  if ((count ?? 0) >= 5) {
    return { error: 'Maximum 5 Suchprofile erlaubt. Lösche ein bestehendes Profil.' };
  }

  const { data, error } = await supabase
    .from('search_profiles')
    .insert({
      user_id: session.id,
      name: input.name,
      cities: input.cities,
      cantons: input.cantons ?? [],
      min_rooms: input.minRooms,
      max_rooms: input.maxRooms,
      min_price: input.minPrice,
      max_price: input.maxPrice,
      min_area: input.minArea,
      max_area: input.maxArea,
      keywords: input.keywords ?? [],
      exclude_keywords: input.excludeKeywords ?? [],
      preferred_floor: input.preferredFloor ?? 'any',
      max_commute_minutes: input.maxCommuteMinutes,
      commute_destination: input.commuteDestination,
      notify_email: input.notifyEmail ?? true,
      notify_frequency: input.notifyFrequency ?? 'instant',
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/[locale]/search-profiles', 'page');
  return { data };
}

export async function updateSearchProfile(
  id: string,
  input: Partial<SearchProfileInput>
) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const supabase = await createSupabaseServerClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.cities !== undefined) updateData.cities = input.cities;
  if (input.cantons !== undefined) updateData.cantons = input.cantons;
  if (input.minRooms !== undefined) updateData.min_rooms = input.minRooms;
  if (input.maxRooms !== undefined) updateData.max_rooms = input.maxRooms;
  if (input.minPrice !== undefined) updateData.min_price = input.minPrice;
  if (input.maxPrice !== undefined) updateData.max_price = input.maxPrice;
  if (input.minArea !== undefined) updateData.min_area = input.minArea;
  if (input.maxArea !== undefined) updateData.max_area = input.maxArea;
  if (input.keywords !== undefined) updateData.keywords = input.keywords;
  if (input.excludeKeywords !== undefined) updateData.exclude_keywords = input.excludeKeywords;
  if (input.preferredFloor !== undefined) updateData.preferred_floor = input.preferredFloor;
  if (input.notifyEmail !== undefined) updateData.notify_email = input.notifyEmail;
  if (input.notifyFrequency !== undefined) updateData.notify_frequency = input.notifyFrequency;

  const { data, error } = await supabase
    .from('search_profiles')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', session.id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/[locale]/search-profiles', 'page');
  return { data };
}

export async function deleteSearchProfile(id: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('search_profiles')
    .delete()
    .eq('id', id)
    .eq('user_id', session.id);

  if (error) return { error: error.message };

  revalidatePath('/[locale]/search-profiles', 'page');
  return { success: true };
}

export async function toggleSearchProfile(id: string, isActive: boolean) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('search_profiles')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', session.id);

  if (error) return { error: error.message };

  revalidatePath('/[locale]/search-profiles', 'page');
  return { success: true };
}

export async function getSearchProfiles() {
  const session = await getSession();
  if (!session) return [];

  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from('search_profiles')
    .select('*')
    .eq('user_id', session.id)
    .order('created_at', { ascending: false });

  return data ?? [];
}
