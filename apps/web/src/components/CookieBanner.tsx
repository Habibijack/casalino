'use client';

import { useEffect, useState } from 'react';
import { Button } from '@casalino/ui';

const COOKIE_CONSENT_KEY = 'cookie-consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent !== 'true') {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between gap-4 px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Diese Website verwendet essenzielle Cookies fuer die Anmeldung.
          Keine Tracking-Cookies.
        </p>
        <Button size="sm" onClick={handleAccept}>
          Verstanden
        </Button>
      </div>
    </div>
  );
}
