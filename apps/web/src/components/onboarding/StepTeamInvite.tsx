'use client';

import { Users, Plus, X } from 'lucide-react';
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
import type { TeamInvite } from './types';

const MAX_INVITES = 3;

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

interface StepTeamInviteProps {
  invites: TeamInvite[];
  onChange: (invites: TeamInvite[]) => void;
  onSubmit: () => void;
  onSkip: () => void;
  loading: boolean;
  error: string | null;
}

export function StepTeamInvite({
  invites,
  onChange,
  onSubmit,
  onSkip,
  loading,
  error,
}: StepTeamInviteProps) {
  function handleAddInvite() {
    if (invites.length >= MAX_INVITES) return;
    onChange([...invites, { email: '', role: 'viewer' }]);
  }

  function handleRemoveInvite(index: number) {
    onChange(invites.filter((_, i) => i !== index));
  }

  function handleUpdateInvite(
    index: number,
    field: keyof TeamInvite,
    value: string,
  ) {
    const updated = invites.map((invite, i) =>
      i === index ? { ...invite, [field]: value } : invite,
    );
    onChange(updated);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  const hasValidInvites = invites.some(
    (inv) => inv.email.trim().length > 0,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Users className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold">
          Team einladen
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Laden Sie Ihre Teammitglieder ein. Sie koennen dies auch spaeter tun.
        </p>
      </div>

      <div className="space-y-3">
        {invites.map((invite, index) => (
          <InviteRow
            key={index}
            invite={invite}
            index={index}
            onUpdate={handleUpdateInvite}
            onRemove={handleRemoveInvite}
          />
        ))}

        {invites.length < MAX_INVITES && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddInvite}
            className="w-full"
          >
            <Plus className="h-4 w-4" />
            Mitglied hinzufuegen
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onSkip}
          disabled={loading}
          className="flex-1"
        >
          Ueberspringen
        </Button>
        <Button
          type="submit"
          variant="accent"
          disabled={loading || !hasValidInvites}
          className="flex-1"
        >
          {loading ? 'Wird eingeladen...' : 'Einladen & Weiter'}
        </Button>
      </div>
    </form>
  );
}

interface InviteRowProps {
  invite: TeamInvite;
  index: number;
  onUpdate: (index: number, field: keyof TeamInvite, value: string) => void;
  onRemove: (index: number) => void;
}

function InviteRow({ invite, index, onUpdate, onRemove }: InviteRowProps) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Label htmlFor={`invite-email-${index}`} className="mb-1.5 block">
          E-Mail
        </Label>
        <Input
          id={`invite-email-${index}`}
          type="email"
          value={invite.email}
          onChange={(e) => onUpdate(index, 'email', e.target.value)}
          placeholder="kollege@firma.ch"
        />
      </div>
      <div className="w-32">
        <Label htmlFor={`invite-role-${index}`} className="mb-1.5 block">
          Rolle
        </Label>
        <Select
          value={invite.role}
          onValueChange={(val) => onUpdate(index, 'role', val)}
        >
          <SelectTrigger id={`invite-role-${index}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
