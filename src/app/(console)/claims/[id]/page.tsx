import { formatINR } from '@neon-adda/shared';
import { ApiError } from '@neon-adda/shared/web/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ClaimWorkspace, type ClaimDetail } from '@/components/claims/claim-workspace';
import { PageHeader } from '@/components/page-header';
import { Badge, Card, Table } from '@/components/ui/display';
import { CLAIM_STATUS, COMMISSION_STATUS, formatDate, formatDateTime } from '@/lib/format';
import { serverApi } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Claim' };

const ACTIONS: Record<string, string> = {
  'claim.drafted': 'Claim started',
  'claim.evidence-added': 'File added',
  'claim.evidence-removed': 'File removed',
  'claim.submitted': 'Submitted for review',
  'claim.resubmitted': 'Sent back with more evidence',
  'claim.disputed': 'Questioned by accounts',
  'claim.approved': 'Approved',
  'claim.rejected': 'Rejected',
};

export default async function ClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  let claim: ClaimDetail;
  try {
    claim = await serverApi.request<ClaimDetail>(`/partner/claims/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const status = CLAIM_STATUS[claim.status] ?? { label: claim.status, tone: 'gray' as const };

  return (
    <>
      <Link href="/claims" className="text-sm text-gray-500 hover:text-gray-900">
        Claims
      </Link>
      <PageHeader title={`Claim ${claim.claimNo}`} description={`Started ${formatDate(claim.createdAt)}`}>
        <Badge tone={status.tone}>{status.label}</Badge>
      </PageHeader>

      {claim.reviewNote && ['DISPUTED', 'REJECTED'].includes(claim.status) && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-semibold">From accounts:</span> {claim.reviewNote}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card title="Commission in this claim">
            <p className="mb-4 font-display text-3xl font-bold text-gray-900 tabular-nums">
              {formatINR(claim.amountPaise)}
            </p>
            <Table head={['Order', 'Order total', 'Paid by customer', 'Commission', 'Status']}>
              {claim.commissions.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/${c.order.orderNo}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {c.order.orderNo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatINR(c.order.totalPaise)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatINR(c.order.amountPaidPaise)}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{formatINR(c.amountPaise)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={COMMISSION_STATUS[c.status]?.tone ?? 'gray'}>
                      {COMMISSION_STATUS[c.status]?.label ?? c.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </Table>
          </Card>

          <Card title="History">
            <ol className="space-y-3 text-sm">
              {claim.history.map((entry, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>
                    <span className="font-medium text-gray-900">{ACTIONS[entry.action] ?? entry.action}</span>
                    {entry.by && <span className="text-gray-500"> · {entry.by}</span>}
                    {entry.note && <span className="block text-gray-600">{entry.note}</span>}
                  </span>
                  <span className="shrink-0 text-gray-500">{formatDateTime(entry.at)}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <ClaimWorkspace claim={claim} />
      </div>
    </>
  );
}
