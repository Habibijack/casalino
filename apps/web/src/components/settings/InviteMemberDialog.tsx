'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@casalino/ui';

interface InviteMemberDialogProps {
  onSubmit: (data: { email: string; role: string }) => Promise<void>;
}

export function InviteMemberDialog({ onSubmit }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim()) {
      setError('E-Mail ist erforderlich');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({ email: email.trim(), role });
      setOpen(false);
      setEmail('');
      setRole('viewer');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fehler beim Einladen';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Mitglied einladen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team-Mitglied einladen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div>
            <Label>E-Mail-Adresse</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kollege@firma.ch"
            />
          </div>

          <div>
            <Label>Rolle</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Betrachter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? 'Wird eingeladen...' : 'Einladung senden'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
