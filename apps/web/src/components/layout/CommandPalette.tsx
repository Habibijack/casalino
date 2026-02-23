'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Calendar,
  FileText,
  LayoutDashboard,
  Plus,
  Settings,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@casalino/ui';

interface CommandAction {
  readonly label: string;
  readonly href: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

const QUICK_ACTIONS: readonly CommandAction[] = [
  { label: 'Neues Inserat erstellen', href: '/listings/new', icon: Plus },
  { label: 'Einstellungen', href: '/settings', icon: Settings },
] as const;

const NAVIGATION_ITEMS: readonly CommandAction[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Inserate', href: '/listings', icon: Building2 },
  { label: 'Besichtigungen', href: '/viewings', icon: Calendar },
  { label: 'Vertraege', href: '/contracts', icon: FileText },
] as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Suchen..." />
      <CommandList>
        <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>
        <CommandGroup heading="Schnellaktionen">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem
                key={action.href}
                value={action.label}
                onSelect={() => handleSelect(action.href)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {action.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandGroup heading="Navigation">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                value={item.label}
                onSelect={() => handleSelect(item.href)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
