'use client';

import { useState, useTransition } from 'react';
import { Button, Input, Label, Separator } from '@casalino/ui';
import { Mail } from 'lucide-react';
import { signInWithMagicLink, signInWithGoogle } from '@/lib/auth/actions';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleMagicLink() {
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.set('email', email);

    startTransition(async () => {
      const result = await signInWithMagicLink(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.success) {
        setMessage(result.message ?? 'Login-Link wurde gesendet!');
      }
    });
  }

  function handleGoogleLogin() {
    setError('');
    setMessage('');

    startTransition(async () => {
      const result = await signInWithGoogle();

      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@beispiel.ch"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
        />
      </div>

      <Button
        className="w-full"
        onClick={handleMagicLink}
        disabled={isPending || !email}
      >
        <Mail className="mr-2 h-4 w-4" />
        Magic Link senden
      </Button>

      {message && (
        <p className="text-sm text-green-600 text-center">{message}</p>
      )}

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          oder
        </span>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={isPending}
      >
        Mit Google anmelden
      </Button>
    </div>
  );
}
