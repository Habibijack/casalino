'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import {
  toggleSearchProfile,
  deleteSearchProfile,
} from '@/lib/search-profiles/actions';

type ProfileData = {
  id: string;
  name: string;
  cities: string[];
  min_rooms: number | null;
  max_rooms: number | null;
  min_price: number | null;
  max_price: number | null;
  keywords: string[];
  is_active: boolean;
  notify_email: boolean;
};

type Props = {
  profile: ProfileData;
  locale: string;
};

export function ProfileCard({ profile, locale }: Props) {
  const router = useRouter();
  const t = useTranslations('searchProfile');
  const [deleting, setDeleting] = useState(false);

  async function handleToggle() {
    await toggleSearchProfile(profile.id, !profile.is_active);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(t('deleteConfirm'))) return;
    setDeleting(true);
    await deleteSearchProfile(profile.id);
    router.refresh();
  }

  const cities = Array.isArray(profile.cities) ? profile.cities : [];
  const keywords = Array.isArray(profile.keywords) ? profile.keywords : [];

  return (
    <Card className={`${!profile.is_active ? 'opacity-60' : ''}`}>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{profile.name}</h3>
            {cities.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {cities.join(', ')}
              </p>
            )}
          </div>
          <button
            onClick={handleToggle}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              profile.is_active
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {profile.is_active ? `● ${t('active')}` : `○ ${t('paused')}`}
          </button>
        </div>

        {/* Criteria Summary */}
        <div className="flex flex-wrap gap-2 text-xs">
          {profile.min_rooms && profile.max_rooms && (
            <span className="px-2 py-0.5 bg-background rounded-full border border-border">
              {profile.min_rooms}–{profile.max_rooms} Zi.
            </span>
          )}
          {profile.max_price && (
            <span className="px-2 py-0.5 bg-background rounded-full border border-border">
              max. CHF {profile.max_price.toLocaleString('de-CH')}
            </span>
          )}
          {keywords.slice(0, 3).map((kw) => (
            <span
              key={kw}
              className="px-2 py-0.5 bg-primary/5 text-primary rounded-full border border-primary/20"
            >
              {kw}
            </span>
          ))}
          {profile.notify_email && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
              {t('notifyEmail')}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1 border-t border-border">
          <a
            href={`/${locale}/search-profiles/${profile.id}/edit`}
            className="flex-1"
          >
            <button className="w-full py-2 text-xs font-medium text-foreground hover:text-primary transition-colors">
              {t('edit')}
            </button>
          </a>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="py-2 px-4 text-xs font-medium text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50"
          >
            {deleting ? '...' : locale === 'fr' ? 'Supprimer' : locale === 'it' ? 'Elimina' : 'Löschen'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
