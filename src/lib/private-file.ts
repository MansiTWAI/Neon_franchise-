'use client';

import { api } from './browser-api';
import { API_URL } from './env';

/**
 * Opens a private file (claim evidence) in a new tab. It is fetched with the session cookies rather
 * than linked, so it never sits at an address that works without signing in.
 */
export async function openPrivateFile(path: string) {
  // Opened first, while the click still counts, so the browser does not block the new tab.
  const tab = window.open('', '_blank');
  const load = () => fetch(`${API_URL}/v1${path}`, { credentials: 'include' });
  let res = await load();
  if (res.status === 401) {
    // The short-lived session token may have run out: renew it, then try once more.
    await api.request(`/auth/franchise/me`).catch(() => undefined);
    res = await load();
  }
  if (!res.ok) {
    tab?.close();
    throw new Error('The file could not be opened. Try again.');
  }
  const url = URL.createObjectURL(await res.blob());
  if (tab) tab.location.href = url;
  else window.location.href = url;
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
