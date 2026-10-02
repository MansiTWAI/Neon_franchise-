import { redirect } from 'next/navigation';
import { ConsoleShell } from '@/components/console-shell';
import { serverApi } from '@/lib/server-api';

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const profile = await serverApi.profile();
  if (!profile) redirect('/login');

  return <ConsoleShell profile={profile}>{children}</ConsoleShell>;
}
