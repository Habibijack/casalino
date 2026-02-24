'use client';

import Link from 'next/link';
import { Rocket, FileText, Globe, Users } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
} from '@casalino/ui';

interface StepGettingStartedProps {
  orgName: string;
}

export function StepGettingStarted({ orgName }: StepGettingStartedProps) {
  return (
    <div className="space-y-6 text-center">
      <div>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8503E]">
          <Rocket className="h-6 w-6 text-white" />
        </div>
        <h1 className="font-heading text-2xl font-bold">
          Willkommen bei Casalino
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {orgName} ist bereit. Waehlen Sie einen naechsten Schritt.
        </p>
      </div>

      <div className="grid gap-4">
        <ActionCard
          icon={FileText}
          title="Erstes Inserat erstellen"
          description="Erstellen Sie Ihr erstes Mietinserat mit AI-Unterstuetzung."
          href="/listings/new"
        />
        <ActionCard
          icon={Globe}
          title="Portal verbinden"
          description="Verbinden Sie Ihre Immobilienportale fuer die Veroeffentlichung."
          href="/settings/portals"
        />
        <ActionCard
          icon={Users}
          title="Team verwalten"
          description="Verwalten Sie Rollen und Berechtigungen Ihres Teams."
          href="/settings"
        />
      </div>

      <Button variant="accent" className="w-full" asChild>
        <Link href="/dashboard">Zum Dashboard</Link>
      </Button>
    </div>
  );
}

interface ActionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
}

function ActionCard({ icon: Icon, title, description, href }: ActionCardProps) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer transition-colors hover:border-[#E8503E]/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-foreground" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
