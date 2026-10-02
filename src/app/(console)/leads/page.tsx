import { Inbox } from 'lucide-react';
import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { LeadRow, type Lead } from '@/components/lead-row';
import { PageHeader } from '@/components/page-header';
import { Pager, Table, Tabs } from '@/components/ui/display';
import { LEAD_STATUS } from '@/lib/format';
import { serverApi } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Leads' };

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status && params.status in LEAD_STATUS ? params.status : '';
  const query = new URLSearchParams({ page: params.page ?? '1', ...(status ? { status } : {}) });
  const leads = await serverApi.request<{ items: Lead[]; page: number; pages: number }>(
    `/partner/leads?${query}`,
  );

  return (
    <>
      <PageHeader
        title="Leads"
        description="Enquiries from customers in your pincodes. Call them and keep the status up to date."
      />
      <Tabs
        current={status}
        items={[
          { key: '', label: 'All', href: '/leads' },
          ...Object.entries(LEAD_STATUS).map(([key, { label }]) => ({
            key,
            label,
            href: `/leads?status=${key}`,
          })),
        ]}
      />
      {leads.items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No leads here"
          body="Enquiries from your territory appear here as they come in."
        />
      ) : (
        <Table head={['Customer', 'Enquiry', 'Received', 'Status', 'Follow up']}>
          {leads.items.map((lead) => (
            <LeadRow key={lead.id} lead={lead} />
          ))}
        </Table>
      )}
      <Pager
        page={leads.page}
        pages={leads.pages}
        href={(page) =>
          `/leads?${new URLSearchParams({ page: String(page), ...(status ? { status } : {}) })}`
        }
      />
    </>
  );
}
