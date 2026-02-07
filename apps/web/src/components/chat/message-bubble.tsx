'use client';

type MessageBubbleProps = {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
};

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-white rounded-br-md'
            : 'bg-background text-foreground rounded-bl-md border border-border'
        }`}
      >
        {/* Render markdown-light (bold, links, line breaks) */}
        <div
          className="whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{
            __html: formatMessage(content),
          }}
        />
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-current opacity-50 animate-pulse ml-0.5 align-text-bottom" />
        )}
      </div>
    </div>
  );
}

// Simple markdown-like formatting (no external dependency)
function formatMessage(text: string): string {
  return text
    // Bold: **text** → <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text* → <em>text</em>
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Links: [text](url) → <a>text</a>
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline text-primary hover:opacity-80">$1</a>'
    )
    // Bullet points: - text → styled list
    .replace(/^- (.+)$/gm, '• $1');
}
