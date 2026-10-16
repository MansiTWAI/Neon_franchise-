'use client';

import { ApiError } from '@neon-adda/shared/web/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/browser-api';
import { FormError, SubmitButton } from '../ui/form';

/** Puts all eligible commission into a new draft claim and opens it. */
export function StartClaim() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        try {
          const claim = await api.request<{ id: string }>('/partner/claims', {
            method: 'POST',
            body: JSON.stringify({}),
          });
          router.push(`/claims/${claim.id}`);
        } catch (err) {
          setError(err instanceof ApiError ? err.title : 'Could not start the claim. Try again.');
          setPending(false);
        }
      }}
    >
      <FormError message={error} />
      <SubmitButton pending={pending}>Start a claim</SubmitButton>
    </form>
  );
}
