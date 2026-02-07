'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { ChatContainer } from './chat-container';
import { ChatFab } from './chat-fab';
import { getQuickSuggestions } from '@/lib/ai/prompts';

type ChatState = {
  isOpen: boolean;
  listingId: string | null;
  title: string;
  context: 'main' | 'listing';
};

type ChatContextType = {
  openChat: () => void;
  openListingChat: (listingId: string, listingTitle: string) => void;
  closeChat: () => void;
  isOpen: boolean;
};

const ChatContext = createContext<ChatContextType>({
  openChat: () => {},
  openListingChat: () => {},
  closeChat: () => {},
  isOpen: false,
});

export function useChatContext() {
  return useContext(ChatContext);
}

type ChatProviderProps = {
  children: ReactNode;
  userLanguage: string;
};

export function ChatProvider({ children, userLanguage }: ChatProviderProps) {
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    listingId: null,
    title: 'Casalino Chat',
    context: 'main',
  });

  const openChat = useCallback(() => {
    const titles: Record<string, string> = {
      de: 'Casalino Chat',
      fr: 'Chat Casalino',
      it: 'Chat Casalino',
    };
    setChatState({
      isOpen: true,
      listingId: null,
      title: titles[userLanguage] ?? titles.de,
      context: 'main',
    });
  }, [userLanguage]);

  const openListingChat = useCallback((listingId: string, listingTitle: string) => {
    setChatState({
      isOpen: true,
      listingId,
      title: listingTitle,
      context: 'listing',
    });
  }, []);

  const closeChat = useCallback(() => {
    setChatState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const suggestions = getQuickSuggestions(chatState.context, userLanguage);

  return (
    <ChatContext.Provider value={{ openChat, openListingChat, closeChat, isOpen: chatState.isOpen }}>
      {children}

      {/* FAB */}
      <ChatFab onClick={openChat} isOpen={chatState.isOpen} />

      {/* Chat Panel – key forces fresh useChat when context changes */}
      <ChatContainer
        key={chatState.listingId ?? 'main'}
        isOpen={chatState.isOpen}
        onClose={closeChat}
        title={chatState.title}
        listingId={chatState.listingId ?? undefined}
        userLanguage={userLanguage}
        suggestions={suggestions}
      />
    </ChatContext.Provider>
  );
}
