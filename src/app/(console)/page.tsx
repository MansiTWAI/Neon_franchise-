import { formatINR } from '@neon-adda/shared';
import { Banknote, CalendarClock, ClipboardList, Hammer, Inbox, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Badge, Card } from '@/components/ui/display';
import { formatTime, JOB_STATUS } from '@/lib/format';
import { serverApi } from '@/lib/server-api';

interface PartnerProfile {
  code: string;
  name: string;
  city: string;
  tier: string | null;
  pincodes: number;
  technicians: number;
}

interface Overview {
  openOrders: number;
  toSchedule: number;
  newLeads: number;
  cashToCollect: { orders: number; amountPaise: number };
  commission: { pendingPaise: number; duePaise: number; paidPaise: number };
  visitsToday: {
    id: string;
    status: string;
    scheduledStart: string;
    technician: string | null;
    orderNo: string;
    city: string;
  }[];
}

export default async function OverviewPage() {
  const [partner, overview] = await Promise.all([
    serverApi.request<PartnerProfile>('/partner/profile'),
    serverApi.request<Overview>('/partner/overview'),
  ]);

  const tiles = [
    { icon: ClipboardList, label: 'Open orders', value: overview.openOrders, href: '/orders' },
    { icon: CalendarClock, label: 'Visits to schedule', value: overview.toSchedule, href: '/installations' },
    { icon: Inbox, label: 'New leads', value: overview.newLeads, href: '/leads?status=NEW' },
    {
      icon: Banknote,
      label: 'Cash to collect',
      value: formatINR(overview.cashToCollect.amountPaise),
      href: '/orders?queue=cash-to-collect',
    },
  ];

  return (
    <>
      <PageHeader title={partner.name} description={`${partner.city} · Partner code ${partner.code}`}>
        {partner.tier && (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            {partner.tier} partner
          </span>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ icon: Icon, label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300"
          >
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Icon className="size-4" /> {label}
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-gray-900 tabular-nums">{value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card
          title="Today’s installations"
          action={
            <Link href="/installations" className="text-sm font-medium text-brand">
              All visits
            </Link>
          }
        >
          {overview.visitsToday.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <Hammer className="size-4" /> No visits booked for today.
            </p>
          ) : (
            <ul className="-my-2 divide-y divide-gray-100">
              {overview.visitsToday.map((visit) => (
                <li key={visit.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div>
                    <Link
                      href={`/orders/${visit.orderNo}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {visit.orderNo}
                    </Link>
                    <p className="text-gray-500">
                      {formatTime(visit.scheduledStart)} · {visit.city}
                      {visit.technician && ` · ${visit.technician}`}
                    </p>
                  </div>
                  <Badge tone={JOB_STATUS[visit.status]?.tone ?? 'gray'}>
                    {JOB_STATUS[visit.status]?.label ?? visit.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Commission"
          action={
            <Link href="/commission" className="text-sm font-medium text-brand">
              Statement
            </Link>
          }
        >
          <dl className="space-y-2 text-sm">
            {[
              ['Pending, orders in progress', overview.commission.pendingPaise],
              ['Due to you', overview.commission.duePaise],
              ['Paid so far', overview.commission.paidPaise],
            ].map(([label, amount]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-semibold text-gray-900 tabular-nums">{formatINR(amount as number)}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex gap-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" /> {partner.pincodes} pincodes
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4" /> {partner.technicians} technicians
            </span>
          </div>
        </Card>
      </div>
    </>
  );
}
