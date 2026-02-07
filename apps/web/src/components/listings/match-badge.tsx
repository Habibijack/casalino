'use client';

import { getScoreLabel } from '@/lib/matching/score';

type MatchBadgeProps = {
  score: number;
  compact?: boolean;
};

export function MatchBadge({ score, compact }: MatchBadgeProps) {
  const { label, color } = getScoreLabel(score);

  if (compact) {
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${color}`}>
        {score}%
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}
    >
      <span>{score}%</span>
      <span className="hidden sm:inline">– {label}</span>
    </div>
  );
}
