'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError('Firmenname ist erforderlich');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { getAccessToken } = await import('@/lib/api/get-access-token');
      const token = await getAccessToken();

      if (!token) {
        setError('Nicht authentifiziert. Bitte erneut anmelden.');
        setLoading(false);
        return;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${apiBase}/api/v1/onboarding/create-org`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          contactEmail: email.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message ?? 'Fehler beim Erstellen der Organisation');
        setLoading(false);
        return;
      }

      // Refresh session and go to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold">
            Organisation erstellen
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Erstellen Sie Ihre Verwaltung um Casalino zu nutzen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="org-name"
              className="mb-1.5 block text-sm font-medium"
            >
              Firmenname
            </label>
            <input
              id="org-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Muster Immobilien AG"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
              minLength={2}
              maxLength={200}
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="org-email"
              className="mb-1.5 block text-sm font-medium"
            >
              Kontakt-Email
              <span className="ml-1 text-muted-foreground">(optional)</span>
            </label>
            <input
              id="org-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@muster-immobilien.ch"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Wird erstellt...' : 'Organisation erstellen'}
          </button>
        </form>
      </div>
    </div>
  );
}
