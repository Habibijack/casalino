'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Building2,
  Calendar,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '@casalino/ui';
import { Separator } from '@casalino/ui';

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Inserate', href: '/listings', icon: Building2 },
  { label: 'Bewerber', href: '/applicants', icon: Users },
  { label: 'Besichtigungen', href: '/viewings', icon: Calendar },
  { label: 'Vertraege', href: '/contracts', icon: FileText },
  { label: 'Insights', href: '/insights', icon: BarChart3 },
  { label: 'Einstellungen', href: '/settings', icon: Settings },
] as const;

interface SidebarProps {
  orgName: string;
  userName: string | null;
  userEmail: string;
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  return pathname.startsWith(href);
}

export function Sidebar({ orgName, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard" className="text-lg font-bold text-white">
          Casalino
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-white'
                  : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-accent" />

      <div className="px-4 py-4">
        <p className="truncate text-xs font-semibold text-white">
          {orgName}
        </p>
        <p className="mt-1 truncate text-xs text-sidebar-muted">
          {userName ?? userEmail}
        </p>
      </div>

      <div className="flex gap-3 px-4 pb-3 text-[10px] text-sidebar-muted">
        <a href="/impressum" target="_blank" rel="noopener noreferrer" className="hover:text-white">
          Impressum
        </a>
        <a href="/datenschutz" target="_blank" rel="noopener noreferrer" className="hover:text-white">
          Datenschutz
        </a>
      </div>
    </aside>
  );
}
