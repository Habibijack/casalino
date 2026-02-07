import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { getChatModel } from '@/lib/ai';
import { getMainChatPrompt, getListingChatPrompt } from '@/lib/ai/prompts';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body: unknown = await request.json();
    const {
      messages,
      listingId,
      userLanguage = 'de',
    } = body as {
      messages: UIMessage[];
      listingId?: string;
      userLanguage?: string;
    };

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build system prompt
    let systemPrompt: string;

    if (listingId) {
      // Fetch listing context from DB
      const { data: listing } = await supabase
        .from('listings')
        .select(
          'title, description, city, rooms, price_chf, area_m2, address, features, listing_language'
        )
        .eq('id', listingId)
        .single();

      if (listing) {
        systemPrompt = getListingChatPrompt(userLanguage, {
          title: listing.title,
          description: listing.description,
          city: listing.city,
          rooms: listing.rooms,
          price: listing.price_chf,
          area: listing.area_m2,
          address: listing.address,
          features: listing.features ?? [],
          listingLanguage: listing.listing_language,
        });
      } else {
        systemPrompt = getMainChatPrompt(userLanguage);
      }
    } else {
      systemPrompt = getMainChatPrompt(userLanguage);
    }

    // Stream response
    const result = streamText({
      model: getChatModel(),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error('Chat API error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
