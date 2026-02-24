'use client';

import Link from 'next/link';
import { MoreHorizontal, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@casalino/ui';
import { APPLICATION_STATUSES, SCORE_THRESHOLDS } from '@casalino/shared';
import type { ApplicationRow } from '@/lib/api/client';

interface ApplicantsTableProps {
  applications: ApplicationRow[];
  onStatusChange?: (id: string, status: string) => void;
}

const STATUS_VARIANT_MAP: Record<string, 'info' | 'warning' | 'success' | 'destructive' | 'accent'> = {
  new: 'info',
  screening: 'warning',
  invited: 'success',
  rejected: 'destructive',
  confirmed: 'accent',
};

function getScoreBadge(score: number | null): { label: string; variant: string } {
  if (score === null) return { label: 'Ausstehend', variant: 'secondary' };
  if (score >= SCORE_THRESHOLDS.top.min) return { label: SCORE_THRESHOLDS.top.label, variant: 'success' };
  if (score >= SCORE_THRESHOLDS.good.min) return { label: SCORE_THRESHOLDS.good.label, variant: 'info' };
  if (score >= SCORE_THRESHOLDS.average.min) return { label: SCORE_THRESHOLDS.average.label, variant: 'warning' };
  return { label: SCORE_THRESHOLDS.below.label, variant: 'destructive' };
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('de-CH').format(new Date(dateStr));
}

export function ApplicantsTable({
  applications,
  onStatusChange,
}: ApplicantsTableProps) {
  if (applications.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Noch keine Bewerbungen vorhanden.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Inserat</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Eingereicht</TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => {
          const statusInfo = APPLICATION_STATUSES[app.status as keyof typeof APPLICATION_STATUSES];
          const statusVariant = STATUS_VARIANT_MAP[app.status] ?? 'secondary';
          const scoreBadge = getScoreBadge(app.scoreTotal);

          return (
            <TableRow key={app.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/applicants/${app.id}`}
                  className="hover:underline"
                >
                  {app.applicantName}
                </Link>
                {app.applicantEmail && (
                  <p className="text-xs text-muted-foreground">{app.applicantEmail}</p>
                )}
              </TableCell>
              <TableCell>
                {app.listingAddress && (
                  <Link
                    href={`/listings/${app.listingId}`}
                    className="text-sm hover:underline"
                  >
                    {app.listingAddress}
                  </Link>
                )}
                {app.listingCity && (
                  <p className="text-xs text-muted-foreground">{app.listingCity}</p>
                )}
              </TableCell>
              <TableCell>
                {app.scoreTotal !== null ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{app.scoreTotal}</span>
                    <Badge variant={scoreBadge.variant as 'success' | 'info' | 'warning' | 'destructive'}>
                      {scoreBadge.label}
                    </Badge>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant}>
                  {statusInfo?.label ?? app.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {formatDate(app.createdAt)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/applicants/${app.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Details anzeigen
                      </Link>
                    </DropdownMenuItem>
                    {app.status === 'new' && onStatusChange && (
                      <DropdownMenuItem onClick={() => onStatusChange(app.id, 'screening')}>
                        In Pruefung nehmen
                      </DropdownMenuItem>
                    )}
                    {app.status === 'screening' && onStatusChange && (
                      <>
                        <DropdownMenuItem onClick={() => onStatusChange(app.id, 'invited')}>
                          Zur Besichtigung einladen
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onStatusChange(app.id, 'rejected')}
                        >
                          Absagen
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
