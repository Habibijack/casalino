'use client';

import { useState, useCallback } from 'react';
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';
import { StepCompanyProfile } from '@/components/onboarding/StepCompanyProfile';
import { StepTeamInvite } from '@/components/onboarding/StepTeamInvite';
import { StepGettingStarted } from '@/components/onboarding/StepGettingStarted';
import type { CompanyProfileData, TeamInvite } from '@/components/onboarding/types';

const INITIAL_PROFILE: CompanyProfileData = {
  name: '',
  contactEmail: '',
  phone: '',
  address: '',
  postalCode: '',
  city: '',
  canton: '',
};

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<CompanyProfileData>(INITIAL_PROFILE);
  const [invites, setInvites] = useState<TeamInvite[]>([{ email: '', role: 'viewer' }]);
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateOrg = useCallback(async () => {
    if (!profile.name.trim()) {
      setError('Firmenname ist erforderlich');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { getAccessToken } = await import('@/lib/api/get-access-token');
      const token = await getAccessToken();

      if (!token) {
        setError('Nicht authentifiziert. Bitte erneut anmelden.');
        setLoading(false);
        return;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${apiBase}/api/v1/onboarding/create-org`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildOrgPayload(profile)),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message ?? 'Fehler beim Erstellen der Organisation');
        setLoading(false);
        return;
      }

      setOrgName(profile.name.trim());
      setCurrentStep(2);
    } catch {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const handleInviteTeam = useCallback(async () => {
    const validInvites = invites.filter((inv) => inv.email.trim().length > 0);
    if (validInvites.length === 0) {
      setCurrentStep(3);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { getAccessToken } = await import('@/lib/api/get-access-token');
      const token = await getAccessToken();

      if (!token) {
        setError('Nicht authentifiziert. Bitte erneut anmelden.');
        setLoading(false);
        return;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${apiBase}/api/v1/onboarding/invite-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invites: validInvites }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message ?? 'Fehler beim Einladen');
        setLoading(false);
        return;
      }

      setCurrentStep(3);
    } catch {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  }, [invites]);

  const handleSkipInvite = useCallback(() => {
    setError(null);
    setCurrentStep(3);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg space-y-8">
        <OnboardingStepper currentStep={currentStep} />

        {currentStep === 1 && (
          <StepCompanyProfile
            data={profile}
            onChange={setProfile}
            onSubmit={handleCreateOrg}
            loading={loading}
            error={error}
          />
        )}

        {currentStep === 2 && (
          <StepTeamInvite
            invites={invites}
            onChange={setInvites}
            onSubmit={handleInviteTeam}
            onSkip={handleSkipInvite}
            loading={loading}
            error={error}
          />
        )}

        {currentStep === 3 && (
          <StepGettingStarted orgName={orgName} />
        )}
      </div>
    </div>
  );
}

function buildOrgPayload(data: CompanyProfileData): Record<string, string | undefined> {
  return {
    name: data.name.trim(),
    contactEmail: data.contactEmail.trim() || undefined,
    phone: data.phone.trim() || undefined,
    address: data.address.trim() || undefined,
    postalCode: data.postalCode.trim() || undefined,
    city: data.city.trim() || undefined,
    canton: data.canton || undefined,
  };
}
