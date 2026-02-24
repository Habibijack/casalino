'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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

type AppLanguage = 'de' | 'fr' | 'it' | 'en';

function isAppLanguage(v: string): v is AppLanguage {
  return v === 'de' || v === 'fr' || v === 'it' || v === 'en';
}

interface ApplicationFormProps {
  listingId: string;
  listingAddress: string;
  listingCity: string;
}

export function ApplicationForm({
  listingId,
  listingAddress,
  listingCity,
}: ApplicationFormProps) {
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
      applicantLanguage: 'de',
      hasPets: false,
      hasSwissResidence: true,
    },
  });

  const language = watch('applicantLanguage');

  async function onSubmit(data: Record<string, unknown>) {
    setSubmitting(true);
    setError(null);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${API_BASE}/api/v1/public/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? 'Fehler beim Einreichen');
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Verbindungsfehler. Bitte versuchen Sie es spaeter erneut.');
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h2 className="mb-2 text-2xl font-bold text-success">Bewerbung eingereicht!</h2>
          <p className="text-muted-foreground">
            Vielen Dank fuer Ihre Bewerbung fuer {listingAddress}, {listingCity}.
            Die Verwaltung wird sich bei Ihnen melden.
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
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Persoenliche Angaben</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="applicantName">Vollstaendiger Name *</Label>
            <Input
              id="applicantName"
              {...register('applicantName')}
              placeholder="Max Mustermann"
            />
            {errors.applicantName && (
              <p className="mt-1 text-sm text-destructive">{String(errors.applicantName.message ?? '')}</p>
            )}
          </div>
          <div>
            <Label htmlFor="applicantEmail">E-Mail</Label>
            <Input
              id="applicantEmail"
              type="email"
              {...register('applicantEmail')}
              placeholder="max@example.com"
            />
          </div>
          <div>
            <Label htmlFor="applicantPhone">Telefon</Label>
            <Input
              id="applicantPhone"
              {...register('applicantPhone')}
              placeholder="+41 79 123 45 67"
            />
          </div>
          <div>
            <Label htmlFor="applicantLanguage">Sprache</Label>
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
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="fr">Franzoesisch</SelectItem>
                <SelectItem value="it">Italienisch</SelectItem>
                <SelectItem value="en">Englisch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Household */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Haushalt & Finanzen</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="householdSize">Haushaltgroesse</Label>
            <Input
              id="householdSize"
              type="number"
              min={1}
              {...register('householdSize', { valueAsNumber: true })}
              placeholder="2"
            />
          </div>
          <div>
            <Label htmlFor="incomeChf">Monatliches Einkommen CHF</Label>
            <Input
              id="incomeChf"
              type="number"
              {...register('incomeChf', { valueAsNumber: true })}
              placeholder="7500"
            />
          </div>
          <div>
            <Label htmlFor="employmentType">Beschaeftigungsart</Label>
            <Input
              id="employmentType"
              {...register('employmentType')}
              placeholder="Festanstellung"
            />
          </div>
          <div>
            <Label htmlFor="desiredMoveDate">Gewuenschtes Einzugsdatum</Label>
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
            <Label htmlFor="hasSwissResidence">Wohnsitz in der Schweiz</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasPets"
              {...register('hasPets')}
              className="h-4 w-4"
            />
            <Label htmlFor="hasPets">Haustiere</Label>
          </div>
        </CardContent>
      </Card>

      {/* Cover Letter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bewerbungsschreiben</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('coverLetter')}
            rows={6}
            placeholder="Erzaehlen Sie uns etwas ueber sich und warum Sie an dieser Wohnung interessiert sind..."
          />
        </CardContent>
      </Card>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Wird eingereicht...' : 'Bewerbung einreichen'}
      </Button>
    </form>
  );
}
