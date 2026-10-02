'use client';

import { ApiError, type SignInResult } from '@neon-adda/shared/web/client';
import { useState, type FormEvent } from 'react';
import { CodeInput, Field, FormError, SubmitButton, TextInput } from '@/components/ui/form';
import { api } from '@/lib/browser-api';

type Step = { kind: 'password' } | { kind: 'code'; challenge: string };

export function PasswordSignIn({ next }: { next: string }) {
  const [step, setStep] = useState<Step>({ kind: 'password' });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function finish() {
    // A full load, so nothing rendered for the previous session survives in the router cache.
    window.location.replace(next);
  }

  async function run(action: () => Promise<void>) {
    setPending(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.title : 'Could not reach the server. Check your connection.');
    } finally {
      setPending(false);
    }
  }

  function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(async () => {
      const result = await api.request<SignInResult>('/auth/franchise/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      if ('twoFactorRequired' in result) setStep({ kind: 'code', challenge: result.challenge });
      else finish();
    });
  }

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step.kind !== 'code') return;
    const code = new FormData(event.currentTarget).get('code');
    void run(async () => {
      await api.request('/auth/franchise/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ challenge: step.challenge, code }),
      });
      finish();
    });
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {step.kind === 'password' ? (
        <form onSubmit={submitPassword} className="space-y-4">
          <div>
            <h1 className="font-display text-xl font-bold text-gray-900">Sign in</h1>
            <p className="mt-1 text-sm text-gray-500">
              Use the email your Neon Adda account manager set up for you.
            </p>
          </div>
          <Field label="Email">
            <TextInput name="email" type="email" autoComplete="username" required autoFocus />
          </Field>
          <Field label="Password">
            <TextInput name="password" type="password" autoComplete="current-password" required />
          </Field>
          <FormError message={error} />
          <SubmitButton pending={pending}>Continue</SubmitButton>
        </form>
      ) : (
        <form onSubmit={submitCode} className="space-y-4">
          <div>
            <h1 className="font-display text-xl font-bold text-gray-900">Enter your code</h1>
            <p className="mt-1 text-sm text-gray-500">
              Open your authenticator app and enter the 6-digit code for Neon Adda.
            </p>
          </div>
          <CodeInput name="code" required autoFocus />
          <FormError message={error} />
          <SubmitButton pending={pending}>Verify</SubmitButton>
          <button
            type="button"
            onClick={() => {
              setStep({ kind: 'password' });
              setError(null);
            }}
            className="w-full text-sm text-gray-500 hover:text-gray-900"
          >
            Use a different account
          </button>
        </form>
      )}
    </div>
  );
}
