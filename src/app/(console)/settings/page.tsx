import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/display';
import { formatDate } from '@/lib/format';
import { serverApi } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Settings' };

interface Profile {
  code: string;
  name: string;
  city: string;
  status: string;
  phone: string | null;
  email: string | null;
  gstin: string | null;
  address: string | null;
  bankName: string | null;
  ifsc: string | null;
  kycVerifiedAt: string | null;
  tier: string | null;
  pincodes: number;
}

export default async function SettingsPage() {
  const profile = await serverApi.request<Profile>('/partner/profile');

  const rows = (entries: [string, string | number | null][]) => (
    <dl className="divide-y divide-gray-100 text-sm">
      {entries.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 py-2.5">
          <dt className="text-gray-500">{label}</dt>
          <dd className="text-right text-gray-900">
            {value ?? <span className="text-gray-400">Not on file</span>}
          </dd>
        </div>
      ))}
    </dl>
  );

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your details as Neon Adda has them. To change anything, contact your Neon Adda manager."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Business">
          {rows([
            ['Name', profile.name],
            ['Partner code', profile.code],
            ['City', profile.city],
            ['Address', profile.address],
            ['Phone', profile.phone],
            ['Email', profile.email],
            ['GSTIN', profile.gstin],
            ['Tier', profile.tier],
            ['Pincodes served', profile.pincodes],
          ])}
        </Card>
        <Card title="Payouts">
          {rows([
            ['Bank', profile.bankName],
            ['IFSC', profile.ifsc],
            ['KYC verified', profile.kycVerifiedAt ? formatDate(profile.kycVerifiedAt) : null],
          ])}
          <p className="mt-3 text-xs text-gray-500">
            Your account number is stored encrypted and is not shown here.
          </p>
        </Card>
      </div>
    </>
  );
}
