'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Download } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@casalino/ui';

export default function PortalSettingsPage() {
  const [flatfoxKey, setFlatfoxKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  // Load existing key on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const { getAccessToken } = await import('@/lib/api/get-access-token');
        const token = await getAccessToken();
        if (!token) return;

        const res = await fetch(`${API_BASE}/api/v1/members/organization`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && json.data?.settings?.flatfoxApiKey) {
          setFlatfoxKey('••••••••••••');
        }
      } catch {
        // Silently fail — just means no key is loaded
      }
    }
    loadSettings();
  }, [API_BASE]);

  async function handleSaveFlatfox() {
    if (!flatfoxKey || flatfoxKey === '••••••••••••') return;

    setSaving(true);
    setError(null);

    try {
      const { getAccessToken } = await import('@/lib/api/get-access-token');
      const token = await getAccessToken();
      if (!token) {
        setError('Nicht authentifiziert');
        setSaving(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/v1/members/organization`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          settings: { flatfoxApiKey: flatfoxKey },
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? 'Fehler beim Speichern');
        setSaving(false);
        return;
      }

      setSaving(false);
      setSaved(true);
      setFlatfoxKey('••••••••••••');
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Verbindungsfehler');
      setSaving(false);
    }
  }

  async function handleIdxDownload() {
    try {
      const { getAccessToken } = await import('@/lib/api/get-access-token');
      const token = await getAccessToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/v1/portals/idx-export`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setError('Export fehlgeschlagen');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'idx-export.xml';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export fehlgeschlagen');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">Portal-Integrationen</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Flatfox */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Flatfox</CardTitle>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Publizieren Sie Ihre Inserate direkt auf Flatfox.
              Tragen Sie Ihren API-Key ein, um die Integration zu aktivieren.
            </p>
            <div>
              <Label>API Key</Label>
              <Input
                type="password"
                value={flatfoxKey}
                onChange={(e) => setFlatfoxKey(e.target.value)}
                placeholder="Ihr Flatfox API Key"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={handleSaveFlatfox}
              disabled={saving || !flatfoxKey || flatfoxKey === '••••••••••••'}
            >
              {saving ? 'Wird gespeichert...' : saved ? 'Gespeichert' : 'API Key speichern'}
            </Button>
          </CardContent>
        </Card>

        {/* IDX Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">IDX 3.0 Export</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Laden Sie alle Ihre Live-Inserate als IDX 3.0 XML herunter.
              Diese Datei koennen Sie bei Homegate, ImmoScout24 und
              anderen Portalen importieren.
            </p>
            <Button variant="outline" onClick={handleIdxDownload}>
              <Download className="mr-2 h-4 w-4" />
              IDX Export herunterladen
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
