'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/get-session';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export async function getOrCreateConversation(
  chatType: 'main' | 'listing',
  listingId?: string,
  title?: string
) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('conversations')
    .select('id, title')
    .eq('user_id', session.id)
    .eq('chat_type', chatType);

  if (listingId) {
    query = query.eq('listing_id', listingId);
  } else {
    query = query.is('listing_id', null);
  }

  const { data: existing } = await query
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    return existing;
  }

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({
      user_id: session.id,
      chat_type: chatType,
      listing_id: listingId ?? null,
      title: title ?? (chatType === 'main' ? 'Neuer Chat' : 'Inserat-Chat'),
    })
    .select('id, title')
    .single();

  if (error) throw new Error(error.message);
  return created;
}

export async function saveMessages(
  conversationId: string,
  messages: ChatMessage[]
) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from('messages').insert(
    messages.map((msg) => ({
      conversation_id: conversationId,
      role: msg.role,
      content: msg.content,
    }))
  );

  if (error) throw new Error(error.message);

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);
}

export async function loadConversationHistory(conversationId: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = await createSupabaseServerClient();

  const { data: messages, error } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return messages ?? [];
}

export async function listConversations() {
  const session = await getSession();
  if (!session) return [];

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('conversations')
    .select('id, title, chat_type, listing_id, updated_at')
    .eq('user_id', session.id)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) return [];
  return data ?? [];
}

export async function deleteConversation(conversationId: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = await createSupabaseServerClient();

  await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', conversationId);

  await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', session.id);
}
