import { formatINR } from '@neon-adda/shared';
import { FileCheck2 } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { StartClaim } from '@/components/claims/start-claim';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge, Card, Table } from '@/components/ui/display';
import { CLAIM_STATUS, formatDate } from '@/lib/format';
import { serverApi } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Claims' };

export interface ClaimSummary {
  id: string;
  claimNo: string;
  status: string;
  amountPaise: number;
  commissions: number;
  evidenceFiles: number;
  createdAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
}

interface ClaimsView {
  claims: ClaimSummary[];
  claimable: {
    amountPaise: number;
    commissions: { id: string; orderNo: string; amountPaise: number; eligibleAt: string | null }[];
  };
}

const STEPS = [
  ['Start a claim', 'It gathers your eligible commission, so it cannot be claimed twice.'],
  [
    'Add evidence',
    'A bank statement or receipts showing the customer payments: PDF or photos, up to 5 MB each.',
  ],
  ['Submit', 'Accounts matches it against the bank and approves it, or asks you for more.'],
  ['Get paid', 'Approved claims go out in the next payout, with the bank reference shown.'],
];

export default async function ClaimsPage() {
  const { claims, claimable } = await serverApi.request<ClaimsView>('/partner/claims');

  return (
    <>
      <PageHeader
        title="Commission claims"
        description="Claim your eligible commission with proof of the payments, and follow it until it is paid."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card title="Ready to claim">
          {claimable.commissions.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nothing yet. Commission becomes claimable once an order is complete and its return window has
              passed.
            </p>
          ) : (
            <>
              <p className="font-display text-3xl font-bold text-gray-900 tabular-nums">
                {formatINR(claimable.amountPaise)}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                From {claimable.commissions.length} {claimable.commissions.length === 1 ? 'order' : 'orders'}:{' '}
                {claimable.commissions.map((c) => c.orderNo).join(', ')}
              </p>
              <div className="mt-4 max-w-xs">
                <StartClaim />
              </div>
            </>
          )}
        </Card>
        <Card title="How claims work">
          <ol className="space-y-3 text-sm">
            {STEPS.map(([step, detail], i) => (
              <li key={step} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 tabular-nums">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-medium text-gray-900">{step}</span>
                  <span className="text-gray-500">{detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-semibold text-gray-900">Your claims</h2>
        {claims.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="No claims yet"
            body="Claims you start appear here with their status."
          />
        ) : (
          <Table head={['Claim', 'Amount', 'Orders', 'Files', 'Status', 'Updated']}>
            {claims.map((claim) => {
              const status = CLAIM_STATUS[claim.status] ?? { label: claim.status, tone: 'gray' as const };
              return (
                <tr key={claim.id}>
                  <td className="px-4 py-3">
                    <Link href={`/claims/${claim.id}`} className="font-medium text-gray-900 hover:underline">
                      {claim.claimNo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{formatINR(claim.amountPaise)}</td>
                  <td className="px-4 py-3 tabular-nums">{claim.commissions}</td>
                  <td className="px-4 py-3 tabular-nums">{claim.evidenceFiles}</td>
                  <td className="px-4 py-3">
                    <Badge tone={status.tone}>{status.label}</Badge>
                    {claim.status === 'DISPUTED' && (
                      <span className="mt-1 block text-xs text-amber-700">Needs your attention</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(claim.reviewedAt ?? claim.submittedAt ?? claim.createdAt)}
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </section>
    </>
  );
}
