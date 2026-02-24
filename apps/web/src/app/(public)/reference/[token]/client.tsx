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

interface ReferenceFormProps {
  token: string;
  applicantName: string;
}

interface RatingQuestionProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const RATING_QUESTIONS = [
  {
    key: 'paymentPunctuality',
    label: 'Wie puenktlich wurden Mietzahlungen geleistet?',
  },
  {
    key: 'propertyCondition',
    label: 'In welchem Zustand wurde die Wohnung hinterlassen?',
  },
  {
    key: 'neighborBehavior',
    label: 'Wie war das Verhalten gegenueber Nachbarn?',
  },
  {
    key: 'houseRulesCompliance',
    label: 'Wie gut wurde die Hausordnung eingehalten?',
  },
] as const;

function RatingQuestion({ label, value, onChange }: RatingQuestionProps) {
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
              aria-label={`${star} von 5 Sternen`}
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

export function ReferenceForm({ token, applicantName }: ReferenceFormProps) {
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
        err instanceof Error ? err.message : 'Fehler beim Senden';
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
            Vielen Dank fuer Ihre Rueckmeldung.
          </h2>
          <p className="text-muted-foreground">
            Ihre Referenz fuer {applicantName} wurde erfolgreich
            eingereicht.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Referenz fuer {applicantName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {RATING_QUESTIONS.map((q) => (
          <RatingQuestion
            key={q.key}
            label={q.label}
            value={ratings[q.key]}
            onChange={(val) => handleRatingChange(q.key, val)}
          />
        ))}

        <Separator />

        {/* Would rent again */}
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Wuerden Sie an diese Person erneut vermieten?
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={wouldRentAgain === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWouldRentAgain(true)}
            >
              Ja
            </Button>
            <Button
              type="button"
              variant={wouldRentAgain === false ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWouldRentAgain(false)}
            >
              Nein
            </Button>
          </div>
        </div>

        <Separator />

        {/* Optional comment */}
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Kommentar (optional)
          </p>
          <Textarea
            placeholder="Weitere Anmerkungen..."
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
          {submitting ? 'Wird gesendet...' : 'Referenz absenden'}
        </Button>
      </CardContent>
    </Card>
  );
}
