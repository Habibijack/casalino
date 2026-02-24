'use client';

import Link from 'next/link';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
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
import { LISTING_STATUSES } from '@casalino/shared';
import type { ListingRow } from '@/lib/api/client';

interface ListingsTableProps {
  listings: ListingRow[];
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const STATUS_VARIANT_MAP: Record<string, 'secondary' | 'success' | 'info' | 'accent'> = {
  draft: 'secondary',
  live: 'success',
  viewing: 'info',
  assigned: 'accent',
  archived: 'secondary',
};

function formatPrice(chf: number): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(chf);
}

export function ListingsTable({
  listings,
  onDelete,
  onStatusChange,
}: ListingsTableProps) {
  if (listings.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Noch keine Inserate vorhanden.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Adresse</TableHead>
          <TableHead>PLZ / Ort</TableHead>
          <TableHead className="text-right">Zimmer</TableHead>
          <TableHead className="text-right">Miete</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Bewerbungen</TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {listings.map((listing) => {
          const statusInfo = LISTING_STATUSES[listing.status as keyof typeof LISTING_STATUSES];
          const variant = STATUS_VARIANT_MAP[listing.status] ?? 'secondary';

          return (
            <TableRow key={listing.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/listings/${listing.id}`}
                  className="hover:underline"
                >
                  {listing.address}
                </Link>
                {listing.referenceNumber && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    #{listing.referenceNumber}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {listing.plz} {listing.city}
              </TableCell>
              <TableCell className="text-right">
                {listing.rooms}
              </TableCell>
              <TableCell className="text-right">
                {formatPrice(listing.priceChf)}
              </TableCell>
              <TableCell>
                <Badge variant={variant}>
                  {statusInfo?.label ?? listing.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {listing.applicationCount}
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
                      <Link href={`/listings/${listing.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Anzeigen
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/listings/${listing.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Bearbeiten
                      </Link>
                    </DropdownMenuItem>
                    {listing.status === 'draft' && onStatusChange && (
                      <DropdownMenuItem
                        onClick={() => onStatusChange(listing.id, 'live')}
                      >
                        Live schalten
                      </DropdownMenuItem>
                    )}
                    {listing.status === 'live' && onStatusChange && (
                      <DropdownMenuItem
                        onClick={() => onStatusChange(listing.id, 'archived')}
                      >
                        Archivieren
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(listing.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Loeschen
                      </DropdownMenuItem>
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
