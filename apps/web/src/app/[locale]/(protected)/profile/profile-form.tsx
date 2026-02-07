'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { SessionUser } from '@/lib/auth/get-session';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type ProfileFormProps = {
  session: SessionUser;
  locale: string;
};

export function ProfileForm({ session, locale }: ProfileFormProps) {
  const t = useTranslations('profile');
  const router = useRouter();
  const [fullName, setFullName] = useState(session.fullName ?? '');
  const [language, setLanguage] = useState(session.preferredLanguage);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setSaved(false);

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        preferred_language: language,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    setIsSaving(false);

    if (!error) {
      setSaved(true);
      // If language changed, redirect to new locale
      if (language !== locale) {
        router.push(`/${language}/profile`);
      }
      setTimeout(() => setSaved(false), 3000);
    }
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  }

  const tierLabels: Record<string, string> = {
    free: t('free'),
    premium: t('premium'),
    turbo: t('turbo'),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-heading">{t('title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('personalInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('name')}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('namePlaceholder')}
              className="w-full h-11 px-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('email')}</label>
            <input
              type="email"
              value={session.email}
              disabled
              className="w-full h-11 px-4 rounded-lg border border-border bg-background text-muted-foreground cursor-not-allowed"
            />
          </div>

          {/* Language Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('language')}</label>
            <div className="flex gap-2">
              {[
                { code: 'de', label: 'Deutsch' },
                { code: 'fr', label: 'Français' },
                { code: 'it', label: 'Italiano' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                    language === lang.code
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-card text-foreground hover:bg-background'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subscription Tier */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('subscription')}</label>
            <div className="h-11 px-4 rounded-lg border border-border bg-background flex items-center">
              <span className="capitalize font-medium">
                {tierLabels[session.tier] ?? session.tier}
              </span>
              {session.tier === 'free' && (
                <span className="ml-auto text-xs text-primary font-medium">
                  Upgrade
                </span>
              )}
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? '...' : saved ? t('saved') : t('save')}
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="pt-6">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleLogout}
            type="button"
          >
            {t('logout')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
