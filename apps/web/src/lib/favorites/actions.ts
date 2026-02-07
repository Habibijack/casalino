'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/get-session';
import { revalidatePath } from 'next/cache';

export async function toggleFavorite(listingId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', session.id)
    .eq('listing_id', listingId)
    .single();

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
    revalidatePath('/[locale]/listings', 'page');
    return { favorited: false };
  } else {
    const { error } = await supabase.from('favorites').insert({
      user_id: session.id,
      listing_id: listingId,
    });

    if (error) return { error: error.message };
    revalidatePath('/[locale]/listings', 'page');
    return { favorited: true };
  }
}

export async function getFavoriteIds(): Promise<string[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from('favorites')
    .select('listing_id')
    .eq('user_id', session.id);

  return data?.map((f) => f.listing_id) ?? [];
}

export async function getFavoriteListings() {
  const session = await getSession();
  if (!session) return [];

  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      note,
      listings (*)
    `)
    .eq('user_id', session.id)
    .order('created_at', { ascending: false });

  return data ?? [];
}
