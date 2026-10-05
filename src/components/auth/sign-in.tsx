'use client';

import { useState } from 'react';
import { PasswordSignIn } from './password-sign-in';
import { PhoneSignIn } from './phone-sign-in';

/** Owners sign in with the franchise's registered mobile number, or with their email and password. */
export function SignIn({ next }: { next: string }) {
  const [method, setMethod] = useState<'phone' | 'email'>('phone');

  const switchLink = (
    <button
      type="button"
      onClick={() => setMethod(method === 'phone' ? 'email' : 'phone')}
      className="mt-4 w-full text-sm text-gray-500 hover:text-gray-900"
    >
      {method === 'phone' ? 'Sign in with email and password' : 'Sign in with your mobile number'}
    </button>
  );

  if (method === 'email') {
    return (
      <>
        <PasswordSignIn next={next} />
        {switchLink}
      </>
    );
  }
  return (
    <>
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">Sign in</h1>
          <p className="mt-1 text-sm text-gray-500">Use the mobile number registered for your franchise.</p>
        </div>
        <PhoneSignIn next={next} />
      </div>
      {switchLink}
    </>
  );
}
