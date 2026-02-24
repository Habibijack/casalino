'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  FileText,
  UserCheck,
  Eye,
  Settings,
  UserPlus,
  UserMinus,
  Shield,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@casalino/ui';
import { createApiClient, type ActivityEntry } from '@/lib/api/client';
import { type LucideIcon } from 'lucide-react';

// ---------------------
// Action icon mapping
// ---------------------

const ACTION_ICONS: Record<string, LucideIcon> = {
  'listing.created': Building2,
  'listing.updated': Building2,
  'listing.published': Building2,
  'listing.deleted': Building2,
  'listing.status_changed': Building2,
  'application.status_updated': Users,
  'application.scored': Users,
  'application.created': Users,
  'contract.created': FileText,
  'contract.sent': FileText,
  'contract.signed': FileText,
  'contract.updated': FileText,
  'reference_check.created': UserCheck,
  'reference_check.completed': UserCheck,
  'viewing.created': Calendar,
  'viewing.updated': Calendar,
  'viewing.deleted': Calendar,
  'member.invited': UserPlus,
  'member.role_changed': Shield,
  'member.removed': UserMinus,
  'organization.updated': Settings,
};

// ---------------------
// German action labels
// ---------------------

const ACTION_LABELS: Record<string, string> = {
  'listing.created': 'Inserat erstellt',
  'listing.updated': 'Inserat aktualisiert',
  'listing.published': 'Inserat veroeffentlicht',
  'listing.deleted': 'Inserat geloescht',
  'listing.status_changed': 'Inserat-Status geaendert',
  'application.status_updated': 'Bewerbungsstatus geaendert',
  'application.scored': 'Bewerbung bewertet',
  'application.created': 'Bewerbung eingereicht',
  'contract.created': 'Vertrag erstellt',
  'contract.sent': 'Vertrag gesendet',
  'contract.signed': 'Vertrag unterschrieben',
  'contract.updated': 'Vertrag aktualisiert',
  'reference_check.created': 'Referenzpruefung angefragt',
  'reference_check.completed': 'Referenzpruefung abgeschlossen',
  'viewing.created': 'Besichtigung erstellt',
  'viewing.updated': 'Besichtigung aktualisiert',
  'viewing.deleted': 'Besichtigung geloescht',
  'member.invited': 'Mitglied eingeladen',
  'member.role_changed': 'Rolle geaendert',
  'member.removed': 'Mitglied entfernt',
  'organization.updated': 'Organisation aktualisiert',
};

// ---------------------
// Entity type labels
// ---------------------

const ENTITY_LABELS: Record<string, string> = {
  listing: 'Inserat',
  application: 'Bewerbung',
  contract: 'Vertrag',
  viewing: 'Besichtigung',
  member: 'Mitglied',
  organization: 'Organisation',
  reference_check: 'Referenzpruefung',
};

// ---------------------
// Relative time (German)
// ---------------------

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return 'gerade eben';
  if (diffMin < 60) return `vor ${diffMin} Minute${diffMin === 1 ? '' : 'n'}`;
  if (diffHrs < 24) return `vor ${diffHrs} Stunde${diffHrs === 1 ? '' : 'n'}`;
  if (diffDays < 30) return `vor ${diffDays} Tag${diffDays === 1 ? '' : 'en'}`;

  return new Intl.DateTimeFormat('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

// ---------------------
// Timeline item
// ---------------------

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  const Icon = ACTION_ICONS[entry.action] ?? Eye;
  const label = ACTION_LABELS[entry.action] ?? entry.action;
  const entityLabel = entry.entityType
    ? ENTITY_LABELS[entry.entityType] ?? entry.entityType
    : null;

  return (
    <div className="flex gap-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-medium leading-tight">{label}</p>
        <p className="text-xs text-muted-foreground">
          {entry.userName ?? 'System'}
          {entityLabel && (
            <span className="ml-1">
              <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0">
                {entityLabel}
              </Badge>
            </span>
          )}
        </p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
        {formatRelativeTime(entry.createdAt)}
      </span>
    </div>
  );
}

// ---------------------
// ActivityLog component
// ---------------------

interface ActivityLogProps {
  token: string;
}

export function ActivityLog({ token }: ActivityLogProps) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchActivity() {
      try {
        const client = createApiClient(token);
        const data = await client.members.activity(50);
        if (!cancelled) {
          setEntries(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Fehler beim Laden';
          setError(msg);
          setLoading(false);
        }
      }
    }

    void fetchActivity();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Aktivitaetsprotokoll</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 py-6 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        {!loading && !error && entries.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Noch keine Aktivitaeten vorhanden.
          </p>
        )}
        {!loading && !error && entries.length > 0 && (
          <div className="divide-y">
            {entries.map((entry) => (
              <ActivityItem key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
