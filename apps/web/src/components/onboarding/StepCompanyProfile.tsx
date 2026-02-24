'use client';

import { Building2 } from 'lucide-react';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@casalino/ui';
import { SWISS_CANTONS } from '@casalino/shared';
import type { CompanyProfileData } from './types';

interface StepCompanyProfileProps {
  data: CompanyProfileData;
  onChange: (data: CompanyProfileData) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export function StepCompanyProfile({
  data,
  onChange,
  onSubmit,
  loading,
  error,
}: StepCompanyProfileProps) {
  function handleFieldChange(field: keyof CompanyProfileData, value: string) {
    onChange({ ...data, [field]: value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Building2 className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold">
          Unternehmensprofil
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Erfassen Sie Ihre Firmendaten. Nur der Firmenname ist erforderlich.
        </p>
      </div>

      <div className="space-y-4">
        <FieldRow label="Firmenname" htmlFor="org-name" required>
          <Input
            id="org-name"
            value={data.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="z.B. Muster Immobilien AG"
            required
            minLength={2}
            maxLength={200}
            autoFocus
          />
        </FieldRow>

        <FieldRow label="Kontakt-Email" htmlFor="org-email">
          <Input
            id="org-email"
            type="email"
            value={data.contactEmail}
            onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
            placeholder="info@muster-immobilien.ch"
          />
        </FieldRow>

        <FieldRow label="Telefon" htmlFor="org-phone">
          <Input
            id="org-phone"
            type="tel"
            value={data.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            placeholder="+41 44 123 45 67"
          />
        </FieldRow>

        <FieldRow label="Adresse" htmlFor="org-address">
          <Input
            id="org-address"
            value={data.address}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            placeholder="Bahnhofstrasse 1"
          />
        </FieldRow>

        <div className="grid grid-cols-2 gap-4">
          <FieldRow label="PLZ" htmlFor="org-plz">
            <Input
              id="org-plz"
              value={data.postalCode}
              onChange={(e) => handleFieldChange('postalCode', e.target.value)}
              placeholder="8001"
              maxLength={10}
            />
          </FieldRow>

          <FieldRow label="Stadt" htmlFor="org-city">
            <Input
              id="org-city"
              value={data.city}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              placeholder="Zuerich"
            />
          </FieldRow>
        </div>

        <FieldRow label="Kanton" htmlFor="org-canton">
          <Select
            value={data.canton}
            onValueChange={(val) => handleFieldChange('canton', val)}
          >
            <SelectTrigger id="org-canton">
              <SelectValue placeholder="Kanton waehlen" />
            </SelectTrigger>
            <SelectContent>
              {SWISS_CANTONS.map((canton) => (
                <SelectItem key={canton} value={canton}>
                  {canton}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        disabled={loading || !data.name.trim()}
        className="w-full"
        variant="accent"
      >
        {loading ? 'Wird erstellt...' : 'Weiter'}
      </Button>
    </form>
  );
}

interface FieldRowProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}

function FieldRow({ label, htmlFor, required, children }: FieldRowProps) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5 block">
        {label}
        {!required && (
          <span className="ml-1 text-muted-foreground font-normal">
            (optional)
          </span>
        )}
      </Label>
      {children}
    </div>
  );
}
