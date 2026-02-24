'use client';

import { Calendar, MapPin, User, Clock } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@casalino/ui';
import { VIEWING_STATUSES } from '@casalino/shared';
import type { ViewingRow } from '@/lib/api/client';

const STATUS_VARIANT_MAP: Record<string, 'info' | 'warning' | 'success' | 'destructive'> = {
  invited: 'warning',
  confirmed: 'success',
  noshow: 'destructive',
  appeared: 'info',
};

interface ViewingsListProps {
  viewings: ViewingRow[];
  onStatusChange?: (id: string, status: string) => void;
  onDelete?: (id: string) => void;
}

function formatDateTime(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }),
  };
}

export function ViewingsList({ viewings, onStatusChange, onDelete }: ViewingsListProps) {
  if (viewings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Keine Besichtigungen geplant.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {viewings.map((v) => {
        const start = formatDateTime(v.slotStart);
        const end = formatDateTime(v.slotEnd);
        const statusInfo = VIEWING_STATUSES[v.status as keyof typeof VIEWING_STATUSES];
        const variant = STATUS_VARIANT_MAP[v.status] ?? 'info';

        return (
          <Card key={v.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center text-center">
                  <Calendar className="mb-1 h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{start.date}</span>
                  <span className="text-xs text-muted-foreground">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {start.time} – {end.time}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {v.applicantName ?? 'Unbekannt'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {v.listingAddress}, {v.listingCity}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={variant}>
                  {statusInfo?.label ?? v.status}
                </Badge>
                {onStatusChange && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {v.status === 'invited' && (
                        <DropdownMenuItem onClick={() => onStatusChange(v.id, 'confirmed')}>
                          Bestaetigt
                        </DropdownMenuItem>
                      )}
                      {(v.status === 'invited' || v.status === 'confirmed') && (
                        <>
                          <DropdownMenuItem onClick={() => onStatusChange(v.id, 'appeared')}>
                            Erschienen
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(v.id, 'noshow')}>
                            No-Show
                          </DropdownMenuItem>
                        </>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(v.id)}
                          className="text-destructive"
                        >
                          Loeschen
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
