'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@casalino/ui';
import { generateListingTextAction } from '../actions';

interface GenerateTextButtonProps {
  listingId: string;
  hasDescriptions: boolean;
}

export function GenerateTextButton({
  listingId,
  hasDescriptions,
}: GenerateTextButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await generateListingTextAction(listingId);
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <Button
      variant="outline"
      disabled={isPending}
      onClick={handleClick}
    >
      <Sparkles className="mr-2 h-4 w-4" />
      {isPending
        ? 'Wird generiert...'
        : hasDescriptions
          ? 'KI-Text neu generieren'
          : 'KI-Text generieren'}
    </Button>
  );
}
