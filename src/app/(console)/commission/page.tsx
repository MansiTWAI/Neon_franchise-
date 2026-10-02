import { formatINR } from '@neon-adda/shared';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Badge, Table } from '@/components/ui/display';
import { COMMISSION_STATUS, formatDate, SOURCE_LABEL } from '@/lib/format';
import { serverApi } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Commission' };

interface Ledger {
  entries: {
    id: string;
    orderNo: string;
    source: string;
    basePaise: number;
    amountPaise: number;
    status: string;
    eligibleAt: string | null;
    createdAt: string;
  }[];
  payouts: {
    id: string;
    periodStart: string;
    periodEnd: string;
    grossPaise: number;
    tdsPaise: number;
    netPaise: number;
    status: string;
    utr: string | null;
    paidAt: string | null;
  }[];
}

interface Rule {
  id: string;
  appliesTo: string;
  category: string;
  source: 'SELF_SOURCED' | 'ASSIGNED' | 'ANY';
  type: 'PERCENT' | 'FLAT';
  value: number;
  maxPerOrderPaise: number | null;
}

const SOURCE_LABELS: Record<Rule['source'], string> = {
  SELF_SOURCED: 'Orders you bring in',
  ASSIGNED: 'Orders assigned to you',
  ANY: 'All orders',
};

const STAGES = [
  ['Pending', 'The order is confirmed.'],
  ['Eligible', 'The order is complete and the return window has passed.'],
  ['Approved', 'Accounts has checked it.'],
  ['Paid', 'Transferred, with the bank reference shown.'],
];

export default async function CommissionPage() {
  const [rules, ledger] = await Promise.all([
    serverApi.request<Rule[]>('/partner/commission-rules'),
    serverApi.request<Ledger>('/partner/commission'),
  ]);

  return (
    <>
      <PageHeader
        title="Commission"
        description="Your rates, set by Neon Adda. Commission is calculated on the order value before GST, excluding installation."
      />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-5 py-3 font-medium">Orders</th>
              <th className="px-5 py-3 font-medium">Products</th>
              <th className="px-5 py-3 font-medium">Set for</th>
              <th className="px-5 py-3 text-right font-medium">Rate</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule, i) => (
              <tr key={rule.id} className="border-b border-gray-100 last:border-0">
                <td className="px-5 py-4 font-medium text-gray-900">
                  {SOURCE_LABELS[rule.source]}
                  {i === 0 && (
                    <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700">
                      Best match
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-600">{rule.category}</td>
                <td className="px-5 py-4 text-gray-600">{rule.appliesTo}</td>
                <td className="px-5 py-4 text-right font-semibold text-gray-900 tabular-nums">
                  {rule.type === 'PERCENT' ? `${rule.value}%` : `${formatINR(rule.value)} per order`}
                  {rule.maxPerOrderPaise != null && (
                    <span className="block text-xs font-normal text-gray-500">
                      up to {formatINR(rule.maxPerOrderPaise)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        When more than one rate fits an order, the most specific one is used: your franchise, then your tier,
        then the standard rate.
      </p>

      <section className="mt-8">
        <h2 className="font-semibold text-gray-900">How commission is paid</h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-4">
          {STAGES.map(([stage, detail], i) => (
            <li key={stage} className="rounded-xl border border-gray-200 bg-white p-4">
              <span className="text-xs font-semibold text-gray-400 tabular-nums">{i + 1}</span>
              <p className="mt-1 font-semibold text-gray-900">{stage}</p>
              <p className="mt-1 text-sm text-gray-500">{detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-semibold text-gray-900">Commission on your orders</h2>
        {ledger.entries.length === 0 ? (
          <p className="text-sm text-gray-500">
            Commission is added here when an order of yours is confirmed.
          </p>
        ) : (
          <Table head={['Order', 'From', 'Order value', 'Commission', 'Status', 'Added']}>
            {ledger.entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/orders/${entry.orderNo}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {entry.orderNo}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{SOURCE_LABEL[entry.source] ?? entry.source}</td>
                <td className="px-4 py-3 tabular-nums">{formatINR(entry.basePaise)}</td>
                <td className="px-4 py-3 font-semibold tabular-nums">{formatINR(entry.amountPaise)}</td>
                <td className="px-4 py-3">
                  <Badge tone={COMMISSION_STATUS[entry.status]?.tone ?? 'gray'}>
                    {COMMISSION_STATUS[entry.status]?.label ?? entry.status}
                  </Badge>
                  {entry.status === 'PENDING' && entry.eligibleAt && (
                    <p className="mt-1 text-xs text-gray-500">Eligible from {formatDate(entry.eligibleAt)}</p>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDate(entry.createdAt)}</td>
              </tr>
            ))}
          </Table>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-semibold text-gray-900">Payouts</h2>
        {ledger.payouts.length === 0 ? (
          <p className="text-sm text-gray-500">No payouts yet.</p>
        ) : (
          <Table head={['Period', 'Gross', 'TDS', 'Paid to you', 'Status', 'Bank reference']}>
            {ledger.payouts.map((payout) => (
              <tr key={payout.id}>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDate(payout.periodStart)} to {formatDate(payout.periodEnd)}
                </td>
                <td className="px-4 py-3 tabular-nums">{formatINR(payout.grossPaise)}</td>
                <td className="px-4 py-3 tabular-nums">{formatINR(payout.tdsPaise)}</td>
                <td className="px-4 py-3 font-semibold tabular-nums">{formatINR(payout.netPaise)}</td>
                <td className="px-4 py-3">
                  <Badge tone={payout.status === 'PAID' ? 'green' : 'amber'}>
                    {payout.status === 'PAID' ? 'Paid' : 'Being prepared'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {payout.utr ?? 'Pending'}
                  {payout.paidAt && <p className="text-xs text-gray-500">{formatDate(payout.paidAt)}</p>}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </section>
    </>
  );
}
