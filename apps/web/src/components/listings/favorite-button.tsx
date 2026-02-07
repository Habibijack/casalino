'use client';

import { useState, useTransition } from 'react';
import { toggleFavorite } from '@/lib/favorites/actions';

type FavoriteButtonProps = {
  listingId: string;
  isFavorited: boolean;
};

export function FavoriteButton({ listingId, isFavorited: initialFav }: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(initialFav);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    setIsFav(!isFav);

    startTransition(async () => {
      const result = await toggleFavorite(listingId);
      if ('error' in result) {
        setIsFav(isFav);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        isFav
          ? 'bg-red-50 text-red-500 scale-110'
          : 'bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-red-400'
      } ${isPending ? 'opacity-50' : ''}`}
      aria-label={isFav ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={isFav ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
