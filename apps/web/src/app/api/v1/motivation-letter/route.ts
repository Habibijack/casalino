import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generateMotivationLetter } from '@/lib/ai/language-bridge';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('full_name, preferred_language')
      .eq('supabase_auth_id', user.id)
      .single();

    const body: unknown = await request.json();
    const { listingId, userMessage } = body as {
      listingId?: string;
      userMessage?: string;
    };

    if (!listingId || !userMessage) {
      return NextResponse.json(
        { error: 'listingId and userMessage required' },
        { status: 400 }
      );
    }

    const { data: listing } = await supabase
      .from('listings')
      .select(
        'title, city, rooms, price_chf, listing_language, description'
      )
      .eq('id', listingId)
      .single();

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    const letter = await generateMotivationLetter({
      userName: profile?.full_name ?? 'Bewerber',
      userLanguage: profile?.preferred_language ?? 'de',
      userMessage,
      listing: {
        title: listing.title,
        city: listing.city,
        rooms: listing.rooms,
        price: listing.price_chf,
        listingLanguage: listing.listing_language,
        description: listing.description,
      },
    });

    return NextResponse.json({ success: true, letter });
  } catch (err) {
    console.error('Motivation letter error:', err);
    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    );
  }
}
