import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { TechnicianManager, type Technician } from '@/components/technician-manager';
import { serverApi } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Technicians' };

export default async function TechniciansPage() {
  const technicians = await serverApi.request<Technician[]>('/partner/technicians');

  return (
    <>
      <PageHeader
        title="Technicians"
        description="Your installers sign in to the technician app with the mobile number you add here."
      />
      <TechnicianManager initial={technicians} />
    </>
  );
}
