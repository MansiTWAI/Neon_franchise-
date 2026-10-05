'use client';

import { ApiError } from '@neon-adda/shared/web/client';
import { useEffect, useState, type FormEvent } from 'react';
import { CodeInput, Field, FormError, SubmitButton, TextInput } from '@/components/ui/form';
import { api } from '@/lib/browser-api';

interface OtpSent {
  resendInSeconds: number;
  /** Returned while WhatsApp is not connected yet. */
  previewCode?: string;
}

export function PhoneSignIn({ next }: { next: string }) {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState<OtpSent | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

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

  const requestCode = () =>
    run(async () => {
      const result = await api.request<OtpSent>('/auth/franchise/otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setSent(result);
      setResendIn(result.resendInSeconds);
    });

  function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = new FormData(event.currentTarget).get('code');
    void run(async () => {
      await api.request('/auth/franchise/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      });
      // A full load, so nothing rendered for the previous session survives in the router cache.
      window.location.replace(next);
    });
  }

  if (!sent) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void requestCode();
        }}
        className="space-y-4"
      >
        <Field label="Mobile number">
          <TextInput
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="98123 45678"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
            autoFocus
          />
        </Field>
        <FormError message={error} />
        <SubmitButton pending={pending}>Send code</SubmitButton>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="space-y-4">
      <Field
        label={`Code sent to ${phone}`}
        hint={
          sent.previewCode
            ? `WhatsApp is not connected yet, so use the code ${sent.previewCode}. We have filled it in for you.`
            : 'If this number is registered, the code will arrive on WhatsApp shortly.'
        }
      >
        <CodeInput
          key={sent.previewCode}
          name="code"
          pattern="\d{4,6}"
          defaultValue={sent.previewCode}
          required
          autoFocus
        />
      </Field>
      <FormError message={error} />
      <SubmitButton pending={pending}>Sign in</SubmitButton>
      <div className="flex justify-between text-sm">
        <button type="button" onClick={() => setSent(null)} className="text-gray-500 hover:text-gray-900">
          Change number
        </button>
        <button
          type="button"
          onClick={requestCode}
          disabled={resendIn > 0 || pending}
          className="font-medium text-brand disabled:text-gray-400"
        >
          {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
        </button>
      </div>
    </form>
  );
}
