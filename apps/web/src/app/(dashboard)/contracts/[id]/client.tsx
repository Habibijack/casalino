'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ArrowLeft, Send, Check, ClipboardList } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '@casalino/ui';
import { CONTRACT_STATUSES } from '@casalino/shared';
import { updateContractDataAction, sendContractAction, updateHandoverAction } from '../actions';
import type { ContractDetail } from '@/lib/api/client';

const STATUS_VARIANT_MAP: Record<string, 'secondary' | 'info' | 'success'> = {
  draft: 'secondary',
  sent: 'info',
  signed: 'success',
};

function formatPrice(chf: number): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
  }).format(chf);
}

interface ContractDetailClientProps {
  contract: ContractDetail;
}

export function ContractDetailClient({ contract }: ContractDetailClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const statusInfo = CONTRACT_STATUSES[contract.status as keyof typeof CONTRACT_STATUSES];
  const variant = STATUS_VARIANT_MAP[contract.status] ?? 'secondary';

  const data = contract.contractData ?? {
    tenantName: '',
    tenantEmail: '',
    tenantAddress: '',
    rentAmount: 0,
    startDate: '',
  };

  const [tenantName, setTenantName] = useState(data.tenantName);
  const [tenantEmail, setTenantEmail] = useState(data.tenantEmail);
  const [tenantAddress, setTenantAddress] = useState(data.tenantAddress);
  const [rentAmount, setRentAmount] = useState(String(data.rentAmount));
  const [nkAmount, setNkAmount] = useState(String(data.nkAmount ?? ''));
  const [depositAmount, setDepositAmount] = useState(String(data.depositAmount ?? ''));
  const [startDate, setStartDate] = useState(data.startDate);
  const [endDate, setEndDate] = useState(data.endDate ?? '');
  const [specialClauses, setSpecialClauses] = useState(
    (data.specialClauses ?? []).join('\n'),
  );
  const [saving, setSaving] = useState(false);

  const isDraft = contract.status === 'draft';

  async function handleSave() {
    setSaving(true);
    const result = await updateContractDataAction(contract.id, {
      tenantName,
      tenantEmail,
      tenantAddress,
      rentAmount: Number(rentAmount) || 0,
      nkAmount: nkAmount ? Number(nkAmount) : undefined,
      depositAmount: depositAmount ? Number(depositAmount) : undefined,
      startDate,
      endDate: endDate || undefined,
      specialClauses: specialClauses
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setSaving(false);
    if (result.success) {
      startTransition(() => router.refresh());
    }
  }

  async function handleSend() {
    await handleSave();
    const result = await sendContractAction(contract.id);
    if (result.success) {
      startTransition(() => router.refresh());
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/contracts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-3xl">Mietvertrag</h1>
            <p className="text-muted-foreground">
              {contract.listingAddress}, {contract.listingCity} &middot;{' '}
              {contract.applicantName}
            </p>
          </div>
        </div>
        <Badge variant={variant} className="text-sm">
          {statusInfo?.label ?? contract.status}
        </Badge>
      </div>

      {contract.status === 'signed' && (
        <Card className="border-success">
          <CardContent className="flex items-center gap-3 py-4">
            <Check className="h-5 w-5 text-success" />
            <p className="font-medium text-success">
              Vertrag wurde unterschrieben am{' '}
              {contract.signedAt
                ? new Intl.DateTimeFormat('de-CH').format(new Date(contract.signedAt))
                : '-'}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contract Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vertragsdaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Mieter</Label>
              <Input value={tenantName} onChange={(e) => setTenantName(e.target.value)} disabled={!isDraft} />
            </div>
            <div>
              <Label>E-Mail Mieter</Label>
              <Input value={tenantEmail} onChange={(e) => setTenantEmail(e.target.value)} disabled={!isDraft} />
            </div>
            <div>
              <Label>Adresse Mieter</Label>
              <Input value={tenantAddress} onChange={(e) => setTenantAddress(e.target.value)} disabled={!isDraft} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Mietzins CHF</Label>
                <Input type="number" value={rentAmount} onChange={(e) => setRentAmount(e.target.value)} disabled={!isDraft} />
              </div>
              <div>
                <Label>NK CHF</Label>
                <Input type="number" value={nkAmount} onChange={(e) => setNkAmount(e.target.value)} disabled={!isDraft} />
              </div>
              <div>
                <Label>Depot CHF</Label>
                <Input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} disabled={!isDraft} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mietbeginn</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={!isDraft} />
              </div>
              <div>
                <Label>Mietende (optional)</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={!isDraft} />
              </div>
            </div>
            <div>
              <Label>Spezialklauseln (eine pro Zeile)</Label>
              <Textarea
                rows={4}
                value={specialClauses}
                onChange={(e) => setSpecialClauses(e.target.value)}
                disabled={!isDraft}
                placeholder="z.B. Haustiere erlaubt..."
              />
            </div>

            {isDraft && (
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving} variant="outline">
                  {saving ? 'Wird gespeichert...' : 'Speichern'}
                </Button>
                <Button onClick={handleSend}>
                  <Send className="mr-2 h-4 w-4" />
                  Zur Unterschrift senden
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vorschau</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-white p-6 text-sm">
              <h3 className="mb-4 text-center text-lg font-bold">MIETVERTRAG</h3>
              <div className="space-y-3">
                <p><strong>Vermieter:</strong> Ueber die Verwaltung</p>
                <p><strong>Mieter:</strong> {tenantName || '-'}</p>
                <p><strong>Mietobjekt:</strong> {contract.listingAddress}, {contract.listingCity}</p>
                <hr className="my-4" />
                <p><strong>Mietzins:</strong> {rentAmount ? formatPrice(Number(rentAmount)) : '-'} / Monat</p>
                {nkAmount && <p><strong>Nebenkosten:</strong> {formatPrice(Number(nkAmount))} / Monat</p>}
                {depositAmount && <p><strong>Kaution:</strong> {formatPrice(Number(depositAmount))}</p>}
                <hr className="my-4" />
                <p><strong>Mietbeginn:</strong> {startDate || '-'}</p>
                {endDate && <p><strong>Mietende:</strong> {endDate}</p>}
                {specialClauses.trim() && (
                  <>
                    <hr className="my-4" />
                    <p><strong>Besondere Vereinbarungen:</strong></p>
                    <ul className="ml-4 list-disc">
                      {specialClauses.split('\n').filter(Boolean).map((clause, i) => (
                        <li key={i}>{clause.trim()}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Handover Protocol — only for signed contracts */}
      {contract.status === 'signed' && (
        <HandoverProtocol contractId={contract.id} />
      )}
    </div>
  );
}

// ---------------------
// Handover Protocol sub-component
// ---------------------

const DEFAULT_ROOMS = [
  'Eingangsbereich', 'Wohnzimmer', 'Kueche', 'Schlafzimmer',
  'Badezimmer', 'Balkon/Terrasse',
];

type RoomCondition = 'einwandfrei' | 'maengel' | 'schaeden';

interface RoomEntry {
  room: string;
  condition: RoomCondition;
  notes: string;
}

function HandoverProtocol({ contractId }: { contractId: string }) {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomEntry[]>(
    DEFAULT_ROOMS.map((room) => ({ room, condition: 'einwandfrei', notes: '' })),
  );
  const [electricity, setElectricity] = useState('');
  const [water, setWater] = useState('');
  const [heating, setHeating] = useState('');
  const [keys, setKeys] = useState('3');
  const [generalNotes, setGeneralNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateRoom(index: number, field: keyof RoomEntry, value: string) {
    setRooms((prev) => {
      const updated = [...prev];
      const entry = updated[index];
      if (!entry) return prev;
      updated[index] = { ...entry, [field]: value };
      return updated;
    });
  }

  async function handleSaveHandover() {
    setSaving(true);
    const result = await updateHandoverAction(contractId, {
      handoverDate: new Date().toISOString().split('T')[0],
      rooms,
      meterReadings: {
        electricity: electricity ? Number(electricity) : undefined,
        water: water ? Number(water) : undefined,
        heating: heating ? Number(heating) : undefined,
      },
      keysHandedOver: Number(keys) || 0,
      tenantSignature: false,
      landlordSignature: false,
      generalNotes,
    });
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          <CardTitle className="text-lg">Uebergabeprotokoll</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rooms */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Raeume</Label>
          {rooms.map((room, i) => (
            <div key={room.room} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <span className="text-sm">{room.room}</span>
              <select
                className="rounded-md border px-2 py-1 text-sm"
                value={room.condition}
                onChange={(e) => updateRoom(i, 'condition', e.target.value)}
              >
                <option value="einwandfrei">Einwandfrei</option>
                <option value="maengel">Maengel</option>
                <option value="schaeden">Schaeden</option>
              </select>
              <Input
                placeholder="Bemerkungen"
                value={room.notes}
                onChange={(e) => updateRoom(i, 'notes', e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Meter Readings */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Zaehlerstaende</Label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Strom (kWh)</Label>
              <Input type="number" value={electricity} onChange={(e) => setElectricity(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Wasser (m³)</Label>
              <Input type="number" value={water} onChange={(e) => setWater(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Heizung</Label>
              <Input type="number" value={heating} onChange={(e) => setHeating(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Keys */}
        <div>
          <Label className="text-sm font-semibold">Schluessel uebergeben</Label>
          <Input type="number" className="mt-1 w-24" value={keys} onChange={(e) => setKeys(e.target.value)} />
        </div>

        {/* General Notes */}
        <div>
          <Label className="text-sm font-semibold">Allgemeine Bemerkungen</Label>
          <Textarea
            rows={3}
            className="mt-1"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="Weitere Anmerkungen zur Uebergabe..."
          />
        </div>

        <Button onClick={handleSaveHandover} disabled={saving}>
          {saving ? 'Wird gespeichert...' : saved ? 'Gespeichert' : 'Protokoll speichern'}
        </Button>
      </CardContent>
    </Card>
  );
}
