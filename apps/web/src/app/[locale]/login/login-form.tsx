'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { signInWithMagicLink, signInWithGoogle } from '@/lib/auth/actions';

type LoginFormProps = {
  locale: string;
  error?: string;
  success?: string;
};

export function LoginForm({ locale, error, success }: LoginFormProps) {
  const t = useTranslations('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(!!success);
  const [formError, setFormError] = useState(error ?? '');

  async function handleMagicLink(formData: FormData) {
    setIsLoading(true);
    setFormError('');
    formData.append('locale', locale);

    const result = await signInWithMagicLink(formData);

    if (result.error) {
      setFormError(result.error);
    } else {
      setEmailSent(true);
    }

    setIsLoading(false);
  }

  async function handleGoogleLogin() {
    setIsLoading(true);
    setFormError('');
    await signInWithGoogle(locale);
  }

  if (emailSent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl mb-4">📧</div>
          <CardTitle className="text-2xl">{t('checkEmail')}</CardTitle>
          <CardDescription className="text-base mt-2">
            {t('checkEmailDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setEmailSent(false)}
          >
            {t('backToLogin')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <h1 className="text-3xl font-bold font-heading text-primary mb-2">
          Casalino
        </h1>
        <CardTitle className="text-xl">{t('welcomeTitle')}</CardTitle>
        <CardDescription>{t('welcomeSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Magic Link Form */}
        <form action={handleMagicLink} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              {t('email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder={t('emailPlaceholder')}
              className="w-full h-11 px-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              disabled={isLoading}
            />
          </div>

          {formError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {formError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '...' : t('sendMagicLink')}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              {t('orContinueWith')}
            </span>
          </div>
        </div>

        {/* Google OAuth */}
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          type="button"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {t('continueWithGoogle')}
        </Button>

        {/* Terms notice */}
        <p className="text-xs text-center text-muted-foreground">
          {t('termsNotice')}
        </p>

        {/* Language switcher */}
        <div className="flex gap-2 justify-center pt-2">
          <a
            href="/de/login"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            DE
          </a>
          <a
            href="/fr/login"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            FR
          </a>
          <a
            href="/it/login"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            IT
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
