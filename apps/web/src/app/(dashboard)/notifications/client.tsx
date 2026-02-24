'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import {
  Bell,
  FileText,
  Users,
  Calendar,
  CheckCircle2,
  UserPlus,
  Star,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
} from '@casalino/ui';
import { cn } from '@casalino/ui';
import type { NotificationRow } from '@/lib/api/client';
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from './actions';

interface NotificationsClientProps {
  notifications: NotificationRow[];
}

// ---------------------
// Icon mapping by notification type
// ---------------------

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  application_new: Users,
  viewing_confirmed: Calendar,
  contract_signed: FileText,
  reference_completed: Star,
  member_joined: UserPlus,
};

function getIcon(type: string) {
  return ICON_MAP[type] ?? Bell;
}

// ---------------------
// Entity link mapping
// ---------------------

function getEntityHref(
  entityType: string | null,
  entityId: string | null,
): string | null {
  if (!entityType || !entityId) return null;

  const routes: Record<string, string> = {
    listing: `/listings/${entityId}`,
    application: `/applicants/${entityId}`,
    viewing: `/viewings`,
    contract: `/contracts/${entityId}`,
    reference_check: `/applicants/${entityId}`,
  };

  return routes[entityType] ?? null;
}

// ---------------------
// Relative time formatter
// ---------------------

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'Gerade eben';
  if (diffMin < 60) return `Vor ${diffMin} Min.`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Vor ${diffHours} Std.`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Vor ${diffDays} Tagen`;

  return new Intl.DateTimeFormat('de-CH').format(new Date(dateStr));
}

// ---------------------
// Main component
// ---------------------

export function NotificationsClient({
  notifications,
}: NotificationsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick(notification: NotificationRow) {
    startTransition(async () => {
      if (!notification.read) {
        await markNotificationReadAction(notification.id);
      }
      const href = getEntityHref(
        notification.entityType,
        notification.entityId,
      );
      if (href) {
        router.push(href);
      } else {
        router.refresh();
      }
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      router.refresh();
    });
  }

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl">Benachrichtigungen</h1>
        {hasUnread && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Alle als gelesen markieren
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = getIcon(notification.type);

            return (
              <Card
                key={notification.id}
                className={cn(
                  'cursor-pointer transition-shadow hover:shadow-md',
                  !notification.read && 'border-l-4 border-l-accent',
                )}
                onClick={() => handleClick(notification)}
              >
                <CardContent className="flex items-start gap-4 py-3">
                  <div
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      notification.read
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-accent/10 text-accent',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm',
                        !notification.read && 'font-semibold',
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Keine Benachrichtigungen vorhanden.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
