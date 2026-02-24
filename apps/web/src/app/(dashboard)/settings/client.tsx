'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@casalino/ui';
import { MembersTable } from '@/components/settings/MembersTable';
import { InviteMemberDialog } from '@/components/settings/InviteMemberDialog';
import {
  inviteMemberAction,
  updateMemberRoleAction,
  removeMemberAction,
  updateOrganizationAction,
} from './actions';
import type { MemberRow, OrganizationRow } from '@/lib/api/client';

interface SettingsPageClientProps {
  organization: OrganizationRow;
  members: MemberRow[];
  currentUserId: string;
  isAdmin: boolean;
}

export function SettingsPageClient({
  organization,
  members,
  currentUserId,
  isAdmin,
}: SettingsPageClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function handleInvite(data: { email: string; role: string }) {
    const result = await inviteMemberAction(data);
    if (result.success) {
      startTransition(() => router.refresh());
    } else {
      throw new Error(result.error);
    }
  }

  function handleRoleChange(memberId: string, role: string) {
    startTransition(async () => {
      const result = await updateMemberRoleAction(memberId, role);
      if (result.success) {
        router.refresh();
      }
    });
  }

  function handleRemove(memberId: string) {
    startTransition(async () => {
      const result = await removeMemberAction(memberId);
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">Einstellungen</h1>

      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="organization">Organisation</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              Team-Mitglieder ({members.length})
            </h2>
            {isAdmin && <InviteMemberDialog onSubmit={handleInvite} />}
          </div>
          <Card>
            <CardContent className="p-0">
              <MembersTable
                members={members}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onRoleChange={isAdmin ? handleRoleChange : undefined}
                onRemove={isAdmin ? handleRemove : undefined}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="mt-4">
          <OrgSettingsForm
            organization={organization}
            isAdmin={isAdmin}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------
// Org Settings Form
// ---------------------

function OrgSettingsForm({
  organization,
  isAdmin,
}: {
  organization: OrganizationRow;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(organization.name);
  const [contactEmail, setContactEmail] = useState(organization.contactEmail ?? '');
  const [contactPhone, setContactPhone] = useState(organization.contactPhone ?? '');
  const [website, setWebsite] = useState(organization.website ?? '');
  const [address, setAddress] = useState(organization.address ?? '');
  const [city, setCity] = useState(organization.city ?? '');
  const [postalCode, setPostalCode] = useState(organization.postalCode ?? '');

  async function handleSave() {
    setSaving(true);
    const result = await updateOrganizationAction({
      name,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
      website: website || undefined,
      address: address || undefined,
      city: city || undefined,
      postalCode: postalCode || undefined,
    });
    setSaving(false);
    if (result.success) {
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Organisation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!isAdmin} />
          </div>
          <div>
            <Label>Kontakt-E-Mail</Label>
            <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} disabled={!isAdmin} />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} disabled={!isAdmin} />
          </div>
          <div>
            <Label>Website</Label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} disabled={!isAdmin} />
          </div>
          <div>
            <Label>Adresse</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} disabled={!isAdmin} />
          </div>
          <div>
            <Label>Stadt</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} disabled={!isAdmin} />
          </div>
          <div>
            <Label>PLZ</Label>
            <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} disabled={!isAdmin} />
          </div>
        </div>

        {isAdmin && (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
