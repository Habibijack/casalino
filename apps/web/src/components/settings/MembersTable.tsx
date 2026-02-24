'use client';

import { UserMinus } from 'lucide-react';
import {
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@casalino/ui';
import { ORG_ROLES } from '@casalino/shared';
import type { MemberRow } from '@/lib/api/client';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Betrachter',
};

const ROLE_VARIANTS: Record<string, 'success' | 'info' | 'secondary'> = {
  admin: 'success',
  editor: 'info',
  viewer: 'secondary',
};

interface MembersTableProps {
  members: MemberRow[];
  currentUserId: string;
  isAdmin: boolean;
  onRoleChange?: (memberId: string, role: string) => void;
  onRemove?: (memberId: string) => void;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('de-CH').format(new Date(dateStr));
}

export function MembersTable({
  members,
  currentUserId,
  isAdmin,
  onRoleChange,
  onRemove,
}: MembersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>E-Mail</TableHead>
          <TableHead>Rolle</TableHead>
          <TableHead>Beigetreten</TableHead>
          {isAdmin && <TableHead className="w-24" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const isSelf = member.userId === currentUserId;

          return (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                {member.fullName ?? '-'}
                {isSelf && (
                  <span className="ml-2 text-xs text-muted-foreground">(Sie)</span>
                )}
              </TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                {isAdmin && !isSelf && onRoleChange ? (
                  <Select
                    value={member.role}
                    onValueChange={(v) => onRoleChange(member.id, v)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORG_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role] ?? role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={ROLE_VARIANTS[member.role] ?? 'secondary'}>
                    {ROLE_LABELS[member.role] ?? member.role}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(member.joinedAt)}</TableCell>
              {isAdmin && (
                <TableCell>
                  {!isSelf && onRemove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(member.id)}
                    >
                      <UserMinus className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
