'use client';

import { useState } from 'react';
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
import { Plus } from 'lucide-react';

interface ApplicationOption {
  id: string;
  applicantName: string;
  listingId: string;
  listingAddress: string;
}

interface CreateViewingDialogProps {
  applications: ApplicationOption[];
  onSubmit: (data: {
    listingId: string;
    applicationId: string;
    slotStart: string;
    slotEnd: string;
  }) => Promise<void>;
}

export function CreateViewingDialog({
  applications,
  onSubmit,
}: CreateViewingDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  async function handleSubmit() {
    if (!selectedApp || !date || !startTime || !endTime) {
      setError('Bitte alle Felder ausfuellen');
      return;
    }

    const slotStart = new Date(`${date}T${startTime}`).toISOString();
    const slotEnd = new Date(`${date}T${endTime}`).toISOString();

    if (slotEnd <= slotStart) {
      setError('Endzeit muss nach Startzeit liegen');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        listingId: selectedApp.listingId,
        applicationId: selectedApp.id,
        slotStart,
        slotEnd,
      });
      setOpen(false);
      resetForm();
    } catch {
      setError('Fehler beim Erstellen der Besichtigung');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSelectedAppId('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Besichtigung planen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Besichtigung</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div>
            <Label>Bewerber</Label>
            <Select value={selectedAppId} onValueChange={setSelectedAppId}>
              <SelectTrigger>
                <SelectValue placeholder="Bewerber waehlen..." />
              </SelectTrigger>
              <SelectContent>
                {applications.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.applicantName} – {app.listingAddress}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Datum</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Startzeit</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label>Endzeit</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? 'Wird erstellt...' : 'Besichtigung erstellen'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
