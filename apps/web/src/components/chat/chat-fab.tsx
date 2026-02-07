'use client';

import { motion, AnimatePresence } from 'framer-motion';

type ChatFabProps = {
  onClick: () => void;
  isOpen: boolean;
  hasUnread?: boolean;
};

export function ChatFab({ onClick, isOpen, hasUnread }: ChatFabProps) {
  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={onClick}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
          aria-label="Chat öffnen"
        >
          {/* Chat Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>

          {/* Unread Badge */}
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full border-2 border-card" />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
