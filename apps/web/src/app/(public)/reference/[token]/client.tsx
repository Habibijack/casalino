'use client';

import { useState, useCallback } from 'react';
import { Star, Check } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  Separator,
} from '@casalino/ui';
import { publicApiFetch } from '@/lib/api/client';
import { type Locale, DEFAULT_LOCALE } from '@/lib/i18n';
import { referenceDictionary } from '@/lib/i18n/dictionaries/reference';

interface ReferenceFormProps {
  token: string;
  applicantName: string;
  locale?: Locale;
}

interface RatingQuestionProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  starLabel: string;
}

function useRefTranslation(locale: Locale): (key: string) => string {
  const dict = referenceDictionary[locale] ?? referenceDictionary[DEFAULT_LOCALE];
  const fallback = referenceDictionary[DEFAULT_LOCALE];
  return (key: string) => dict[key] ?? fallback[key] ?? key;
}

function getRatingQuestions(t: (key: string) => string) {
  return [
    { key: 'paymentPunctuality', label: t('paymentPunctuality') },
    { key: 'propertyCondition', label: t('propertyCondition') },
    { key: 'neighborBehavior', label: t('neighborBehavior') },
    { key: 'houseRulesCompliance', label: t('houseRulesCompliance') },
  ];
}

function RatingQuestion({ label, value, onChange, starLabel }: RatingQuestionProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hovered || value);
          return (
            <button
              key={star}
              type="button"
              className="rounded p-1 transition-colors hover:bg-muted"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => onChange(star)}
              aria-label={starLabel.replace('{n}', String(star))}
            >
              <Star
                className={`h-6 w-6 ${
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ReferenceForm({
  token,
  applicantName,
  locale = DEFAULT_LOCALE,
}: ReferenceFormProps) {
  const t = useRefTranslation(locale);
  const ratingQuestions = getRatingQuestions(t);

  const [ratings, setRatings] = useState<Record<string, number>>({
    paymentPunctuality: 0,
    propertyCondition: 0,
    neighborBehavior: 0,
    houseRulesCompliance: 0,
  });
  const [wouldRentAgain, setWouldRentAgain] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRatingChange = useCallback((key: string, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isValid =
    ratings.paymentPunctuality > 0 &&
    ratings.propertyCondition > 0 &&
    ratings.neighborBehavior > 0 &&
    ratings.houseRulesCompliance > 0 &&
    wouldRentAgain !== null;

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);

    try {
      await publicApiFetch(`/reference/${token}/submit`, {
        method: 'POST',
        body: {
          paymentPunctuality: ratings.paymentPunctuality,
          propertyCondition: ratings.propertyCondition,
          neighborBehavior: ratings.neighborBehavior,
          houseRulesCompliance: ratings.houseRulesCompliance,
          wouldRentAgain,
          comment: comment.trim() || undefined,
        },
      });
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('submitError');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card className="border-success">
        <CardContent className="py-12 text-center">
          <Check className="mx-auto mb-4 h-12 w-12 text-success" />
          <h2 className="mb-2 text-2xl font-bold text-success">
            {t('successTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('successMessage').replace('{name}', applicantName)}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t('referenceFor')} {applicantName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {ratingQuestions.map((q) => (
          <RatingQuestion
            key={q.key}
            label={q.label}
            value={ratings[q.key]}
            onChange={(val) => handleRatingChange(q.key, val)}
            starLabel={t('starLabel')}
          />
        ))}

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">{t('wouldRentAgain')}</p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={wouldRentAgain === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWouldRentAgain(true)}
            >
              {locale === 'fr' ? 'Oui' : locale === 'it' ? 'Si' : 'Ja'}
            </Button>
            <Button
              type="button"
              variant={wouldRentAgain === false ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWouldRentAgain(false)}
            >
              {locale === 'fr' ? 'Non' : locale === 'it' ? 'No' : 'Nein'}
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">{t('comment')}</p>
          <Textarea
            placeholder={t('commentPlaceholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? t('submitting') : t('submitButton')}
        </Button>
      </CardContent>
    </Card>
  );
}
