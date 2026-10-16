'use client';

import { RefreshCw } from 'lucide-react';

/**
 * Shown when a page cannot load, most often while the API is waking up or briefly unreachable,
 * instead of the framework's bare error screen. Trying again usually works within a minute.
 */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-xl font-bold text-gray-900">This page could not load</h1>
      <p className="mt-2 text-sm text-gray-500">
        The server may be starting up or briefly unreachable. Your work is safe; try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white"
      >
        <RefreshCw className="size-4" aria-hidden /> Try again
      </button>
    </main>
  );
}
