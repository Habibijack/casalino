'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
import { createListingSchema, SWISS_CANTONS, type SwissCanton } from '@casalino/shared';
import type { CreateListingInput } from '@casalino/shared';
import type { ListingRow } from '@/lib/api/client';

// Form input type: same as CreateListingInput but features is optional (has Zod default)
type FormInput = Omit<CreateListingInput, 'features'> & { features?: string[] };

function isSwissCanton(val: string | null | undefined): val is SwissCanton {
  if (!val) return false;
  return (SWISS_CANTONS as readonly string[]).includes(val);
}

interface ListingFormProps {
  listing?: ListingRow;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

export function ListingForm({ listing, onSubmit }: ListingFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(createListingSchema),
    defaultValues: listing
      ? {
          referenceNumber: listing.referenceNumber ?? undefined,
          address: listing.address,
          plz: listing.plz,
          city: listing.city,
          canton: isSwissCanton(listing.canton) ? listing.canton : undefined,
          rooms: Number(listing.rooms),
          areaSqm: listing.areaSqm ?? undefined,
          priceChf: listing.priceChf,
          nkChf: listing.nkChf ?? undefined,
          floor: listing.floor ?? undefined,
          availableFrom: listing.availableFrom ?? undefined,
          descriptionDe: listing.descriptionDe ?? undefined,
          descriptionFr: listing.descriptionFr ?? undefined,
          descriptionIt: listing.descriptionIt ?? undefined,
          features: listing.features ?? [],
        }
      : {
          features: [],
        },
  });

  const canton = watch('canton');

  async function handleFormSubmit(data: FormInput) {
    setSubmitting(true);
    try {
      await onSubmit(data);
      router.push('/listings');
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Address Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adresse & Lage</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="address">Strasse & Hausnummer *</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Bahnhofstrasse 12"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="plz">PLZ *</Label>
            <Input id="plz" {...register('plz')} placeholder="8001" />
            {errors.plz && (
              <p className="mt-1 text-sm text-destructive">{errors.plz.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="city">Ort *</Label>
            <Input id="city" {...register('city')} placeholder="Zuerich" />
            {errors.city && (
              <p className="mt-1 text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="canton">Kanton</Label>
            <Select
              value={canton ?? ''}
              onValueChange={(v) => {
                if (isSwissCanton(v)) {
                  setValue('canton', v, { shouldValidate: true });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kanton waehlen" />
              </SelectTrigger>
              <SelectContent>
                {SWISS_CANTONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="referenceNumber">Referenznummer</Label>
            <Input
              id="referenceNumber"
              {...register('referenceNumber')}
              placeholder="OBJ-2024-001"
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Objektdetails</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="rooms">Zimmer *</Label>
            <Input
              id="rooms"
              type="number"
              step="0.5"
              {...register('rooms', { valueAsNumber: true })}
              placeholder="3.5"
            />
            {errors.rooms && (
              <p className="mt-1 text-sm text-destructive">{errors.rooms.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="areaSqm">Flaeche (m2)</Label>
            <Input
              id="areaSqm"
              type="number"
              {...register('areaSqm', { valueAsNumber: true })}
              placeholder="75"
            />
          </div>
          <div>
            <Label htmlFor="floor">Stockwerk</Label>
            <Input
              id="floor"
              type="number"
              {...register('floor', { valueAsNumber: true })}
              placeholder="3"
            />
          </div>
          <div>
            <Label htmlFor="priceChf">Miete CHF *</Label>
            <Input
              id="priceChf"
              type="number"
              {...register('priceChf', { valueAsNumber: true })}
              placeholder="2100"
            />
            {errors.priceChf && (
              <p className="mt-1 text-sm text-destructive">{errors.priceChf.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="nkChf">Nebenkosten CHF</Label>
            <Input
              id="nkChf"
              type="number"
              {...register('nkChf', { valueAsNumber: true })}
              placeholder="250"
            />
          </div>
          <div>
            <Label htmlFor="availableFrom">Verfuegbar ab</Label>
            <Input
              id="availableFrom"
              type="date"
              {...register('availableFrom')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Beschreibung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="descriptionDe">Deutsch</Label>
            <Textarea
              id="descriptionDe"
              {...register('descriptionDe')}
              rows={4}
              placeholder="Beschreibung auf Deutsch..."
            />
          </div>
          <div>
            <Label htmlFor="descriptionFr">Franzoesisch</Label>
            <Textarea
              id="descriptionFr"
              {...register('descriptionFr')}
              rows={4}
              placeholder="Description en fran\u00e7ais..."
            />
          </div>
          <div>
            <Label htmlFor="descriptionIt">Italienisch</Label>
            <Textarea
              id="descriptionIt"
              {...register('descriptionIt')}
              rows={4}
              placeholder="Descrizione in italiano..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? 'Speichern...'
            : listing
              ? 'Aenderungen speichern'
              : 'Inserat erstellen'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/listings')}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
