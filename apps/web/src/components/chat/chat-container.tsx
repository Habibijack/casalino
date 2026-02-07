'use client';

import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { useRef, useEffect, useState } from 'react';
import { ChatPanel } from './chat-panel';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { TypingIndicator } from './typing-indicator';

type ChatContainerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  listingId?: string;
  userLanguage: string;
  suggestions?: string[];
};

function getTextContent(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p) => p.type === 'text' && typeof p.text === 'string')
    .map((p) => p.text)
    .join('');
}

export function ChatContainer({
  isOpen,
  onClose,
  title,
  listingId,
  userLanguage,
  suggestions = [],
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const {
    messages,
    sendMessage,
    status,
    error,
    regenerate,
  } = useChat({
    transport: new TextStreamChatTransport({
      api: '/api/v1/chat',
      body: {
        listingId,
        userLanguage,
      },
    }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    sendMessage({ text: trimmed });
  }

  function handleSuggestionClick(suggestion: string) {
    if (isLoading) return;
    setInput('');
    sendMessage({ text: suggestion });
  }

  const placeholders: Record<string, string> = {
    de: 'Frag mich etwas über Wohnungen...',
    fr: 'Pose-moi une question sur les appartements...',
    it: 'Fammi una domanda sugli appartamenti...',
  };

  return (
    <ChatPanel isOpen={isOpen} onClose={onClose} title={title}>
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
      >
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-6">
            <div>
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="text-lg font-semibold font-heading">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {userLanguage === 'fr'
                  ? 'Je suis là pour t\'aider à trouver ton appartement idéal en Suisse.'
                  : userLanguage === 'it'
                    ? 'Sono qui per aiutarti a trovare il tuo appartamento ideale in Svizzera.'
                    : 'Ich helfe dir, deine ideale Wohnung in der Schweiz zu finden.'}
              </p>
            </div>

            {/* Suggestion Chips */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground hover:bg-primary/5 hover:border-primary/30 transition-colors text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => {
          const text = getTextContent(message.parts);
          const isLastAssistant =
            message.id === messages[messages.length - 1]?.id &&
            message.role === 'assistant';
          const isStreaming = status === 'streaming' && isLastAssistant;

          return (
            <MessageBubble
              key={message.id}
              role={message.role === 'user' ? 'user' : 'assistant'}
              content={text}
              isStreaming={isStreaming}
            />
          );
        })}

        {/* Typing Indicator */}
        {status === 'submitted' && messages[messages.length - 1]?.role === 'user' && (
          <TypingIndicator />
        )}

        {/* Error */}
        {error && (
          <div className="flex justify-center mb-3">
            <div className="bg-destructive/10 text-destructive text-xs px-4 py-2 rounded-lg">
              Fehler: {error.message}
              <button
                onClick={() => regenerate()}
                className="ml-2 underline hover:no-underline"
              >
                Nochmal versuchen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        placeholder={placeholders[userLanguage] ?? placeholders.de}
        isLoading={isLoading}
      />
    </ChatPanel>
  );
}
