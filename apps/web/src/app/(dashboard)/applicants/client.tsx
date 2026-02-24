'use client';

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@casalino/ui';
import { APPLICATION_STATUSES } from '@casalino/shared';
import { ApplicantsTable } from '@/components/applications/ApplicantsTable';
import type { ApplicationRow } from '@/lib/api/client';
import { updateApplicationStatusAction } from './actions';

interface ApplicantsPageClientProps {
  applications: ApplicationRow[];
}

type StatusTab = 'all' | keyof typeof APPLICATION_STATUSES;

export function ApplicantsPageClient({ applications: initial }: ApplicantsPageClientProps) {
  const [applications, setApplications] = useState(initial);
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      const result = await updateApplicationStatusAction(id, status);
      if (result.success && result.data) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: result.data.status } : a)),
        );
      }
    });
  }

  const filtered =
    activeTab === 'all'
      ? applications
      : applications.filter((a) => a.status === activeTab);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">Bewerber</h1>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as StatusTab)}
      >
        <TabsList>
          <TabsTrigger value="all">
            Alle ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="new">
            Neu ({applications.filter((a) => a.status === 'new').length})
          </TabsTrigger>
          <TabsTrigger value="screening">
            Pruefung ({applications.filter((a) => a.status === 'screening').length})
          </TabsTrigger>
          <TabsTrigger value="invited">
            Eingeladen ({applications.filter((a) => a.status === 'invited').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Abgesagt ({applications.filter((a) => a.status === 'rejected').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className={isPending ? 'opacity-50' : ''}>
          <ApplicantsTable
            applications={filtered}
            onStatusChange={handleStatusChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
