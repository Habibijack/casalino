'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@casalino/ui';
import { createApplicationSchema } from '@casalino/shared';
import { type Locale, DEFAULT_LOCALE } from '@/lib/i18n';
import { applyDictionary } from '@/lib/i18n/dictionaries/apply';

type AppLanguage = 'de' | 'fr' | 'it' | 'en';

function isAppLanguage(v: string): v is AppLanguage {
  return v === 'de' || v === 'fr' || v === 'it' || v === 'en';
}

interface ApplicationFormProps {
  listingId: string;
  listingAddress: string;
  listingCity: string;
  locale?: Locale;
}

function useApplyTranslation(locale: Locale): (key: string) => string {
  const dict = applyDictionary[locale] ?? applyDictionary[DEFAULT_LOCALE];
  const fallback = applyDictionary[DEFAULT_LOCALE];
  return (key: string) => dict[key] ?? fallback[key] ?? key;
}

export function ApplicationForm({
  listingId,
  listingAddress,
  listingCity,
  locale = DEFAULT_LOCALE,
}: ApplicationFormProps) {
  const t = useApplyTranslation(locale);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: {
      listingId,
      applicantLanguage: locale,
      hasPets: false,
      hasSwissResidence: true,
    },
  });

  useEffect(() => {
    setValue('applicantLanguage', locale);
  }, [locale, setValue]);

  const language = watch('applicantLanguage');

  async function onSubmit(data: Record<string, unknown>) {
    setSubmitting(true);
    setError(null);
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${API_BASE}/api/v1/public/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? t('submitError'));
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError(t('connectionError'));
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h2 className="mb-2 text-2xl font-bold text-success">
            {t('successTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('successMessage')} {listingAddress}, {listingCity}.{' '}
            {t('successNote')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register('listingId')} />

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('personalInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="applicantName">{t('fullName')} *</Label>
            <Input
              id="applicantName"
              {...register('applicantName')}
              placeholder={t('fullNamePlaceholder')}
            />
            {errors.applicantName && (
              <p className="mt-1 text-sm text-destructive">
                {String(errors.applicantName.message ?? '')}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="applicantEmail">{t('email')}</Label>
            <Input
              id="applicantEmail"
              type="email"
              {...register('applicantEmail')}
              placeholder={t('emailPlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="applicantPhone">{t('phone')}</Label>
            <Input
              id="applicantPhone"
              {...register('applicantPhone')}
              placeholder={t('phonePlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="applicantLanguage">{t('language')}</Label>
            <Select
              value={language ?? 'de'}
              onValueChange={(v) => {
                if (isAppLanguage(v)) {
                  setValue('applicantLanguage', v);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">{t('langDe')}</SelectItem>
                <SelectItem value="fr">{t('langFr')}</SelectItem>
                <SelectItem value="it">{t('langIt')}</SelectItem>
                <SelectItem value="en">{t('langEn')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('household')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="householdSize">{t('householdSize')}</Label>
            <Input
              id="householdSize"
              type="number"
              min={1}
              {...register('householdSize', { valueAsNumber: true })}
              placeholder="2"
            />
          </div>
          <div>
            <Label htmlFor="incomeChf">{t('income')}</Label>
            <Input
              id="incomeChf"
              type="number"
              {...register('incomeChf', { valueAsNumber: true })}
              placeholder="7500"
            />
          </div>
          <div>
            <Label htmlFor="employmentType">{t('employmentType')}</Label>
            <Input
              id="employmentType"
              {...register('employmentType')}
              placeholder={t('employmentPlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="desiredMoveDate">{t('moveDate')}</Label>
            <Input
              id="desiredMoveDate"
              type="date"
              {...register('desiredMoveDate')}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasSwissResidence"
              {...register('hasSwissResidence')}
              className="h-4 w-4"
            />
            <Label htmlFor="hasSwissResidence">{t('swissResidence')}</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasPets"
              {...register('hasPets')}
              className="h-4 w-4"
            />
            <Label htmlFor="hasPets">{t('pets')}</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('coverLetter')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('coverLetter')}
            rows={6}
            placeholder={t('coverLetterPlaceholder')}
          />
        </CardContent>
      </Card>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? t('submitting') : t('submitButton')}
      </Button>
    </form>
  );
}
