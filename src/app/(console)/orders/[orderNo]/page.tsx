import { formatINR, type OrderStatus } from '@neon-adda/shared';
import { ApiError } from '@neon-adda/shared/web/client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { InstallationForm, type InstallationView } from '@/components/installation-form';
import { Badge, Card } from '@/components/ui/display';
import {
  COMMISSION_STATUS,
  formatDateTime,
  formatPhone,
  JOB_STATUS,
  ORDER_STATUS,
  SOURCE_LABEL,
} from '@/lib/format';
import { serverApi } from '@/lib/server-api';

interface PartnerOrder {
  orderNo: string;
  status: OrderStatus;
  paymentMode: string;
  attributionSource: string;
  placedAt: string;
  installationRequired: boolean;
  customer: { name: string; phone: string; city: string; pincode: string; address: string | null };
  items: {
    id: string;
    description: string;
    widthIn: number;
    heightIn: number;
    qty: number;
    amountPaise: number;
    previewUrl: string | null;
  }[];
  totals: { totalPaise: number; paidPaise: number; duePaise: number };
  history: { status: OrderStatus; note: string | null; at: string }[];
  installation:
    | (InstallationView & {
        technician: string | null;
        completedAt: string | null;
        failReason: string | null;
        photos: { id: string; stage: string; url: string }[];
      })
    | null;
  technicians: { id: string; name: string }[];
  commission: { status: string; amountPaise: number }[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}): Promise<Metadata> {
  return { title: `Order ${(await params).orderNo}` };
}

export default async function PartnerOrderPage({ params }: { params: Promise<{ orderNo: string }> }) {
  const { orderNo } = await params;
  let order: PartnerOrder;
  try {
    order = await serverApi.request<PartnerOrder>(`/partner/orders/${orderNo}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
  const status = ORDER_STATUS[order.status];
  const job = order.installation;
  const canSchedule =
    order.installationRequired &&
    !['PENDING_PAYMENT', 'CANCELLED', 'EXPIRED', 'COMPLETED', 'INSTALLED'].includes(order.status) &&
    !(job && ['ON_THE_WAY', 'REACHED', 'WORK_STARTED'].includes(job.status));

  return (
    <>
      <div className="mb-6">
        <Link href="/orders" className="text-sm text-gray-500 hover:text-gray-900">
          Orders
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-gray-900">{order.orderNo}</h1>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Placed {formatDateTime(order.placedAt)} · {SOURCE_LABEL[order.attributionSource]}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card title={order.items.length === 1 ? 'Sign' : `Signs (${order.items.length})`}>
            <ul className="-my-3 divide-y divide-gray-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-3">
                  {item.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="size-20 shrink-0 rounded-lg bg-gray-900 object-contain"
                    />
                  ) : (
                    <span className="size-20 shrink-0 rounded-lg bg-gray-900" />
                  )}
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-gray-900">{item.description}</p>
                    <p className="mt-1 text-gray-500">
                      {item.widthIn}″ × {item.heightIn}″ · Qty {item.qty}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums">{formatINR(item.amountPaise)}</span>
                </li>
              ))}
            </ul>
          </Card>

          {order.installationRequired && (
            <Card
              title="Installation"
              action={
                job && (
                  <Badge tone={JOB_STATUS[job.status]?.tone ?? 'gray'}>
                    {JOB_STATUS[job.status]?.label ?? job.status}
                  </Badge>
                )
              }
            >
              {job?.completedAt && (
                <p className="mb-3 text-sm">
                  Installed {formatDateTime(job.completedAt)}
                  {job.technician && ` by ${job.technician}`}.
                </p>
              )}
              {job?.status === 'FAILED' && job.failReason && (
                <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  Not completed: {job.failReason}. Book a new visit below.
                </p>
              )}
              {canSchedule ? (
                order.technicians.length ? (
                  <InstallationForm orderNo={order.orderNo} job={job} technicians={order.technicians} />
                ) : (
                  <p className="text-sm text-gray-500">
                    Add a technician under{' '}
                    <Link href="/technicians" className="font-medium text-brand">
                      Technicians
                    </Link>{' '}
                    to book this visit.
                  </p>
                )
              ) : (
                !job?.completedAt && (
                  <p className="text-sm text-gray-500">
                    {job && ['ON_THE_WAY', 'REACHED', 'WORK_STARTED'].includes(job.status)
                      ? `${job.technician ?? 'The technician'} is on this visit now.`
                      : 'Nothing to schedule for this order now.'}
                  </p>
                )
              )}
              {job && job.photos.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.photos.map((photo) => (
                    <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={`${photo.stage.toLowerCase()} photo`}
                        className="size-20 rounded-lg object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}
            </Card>
          )}

          <Card title="History">
            <ol className="space-y-3 text-sm">
              {order.history.map((entry, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>
                    <span className="font-medium text-gray-900">{ORDER_STATUS[entry.status].label}</span>
                    {entry.note && <span className="text-gray-500"> · {entry.note}</span>}
                  </span>
                  <span className="whitespace-nowrap text-gray-400">{formatDateTime(entry.at)}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Customer">
            <dl className="space-y-1.5 text-sm">
              <dd className="font-medium text-gray-900">{order.customer.name}</dd>
              <dd className="text-gray-600">{formatPhone(order.customer.phone)}</dd>
              <dd className="text-gray-600">
                {order.customer.address ?? `${order.customer.city} ${order.customer.pincode}`}
              </dd>
            </dl>
          </Card>
          <Card title="Payment">
            <dl className="space-y-1.5 text-sm">
              {[
                ['Total', order.totals.totalPaise],
                ['Paid', order.totals.paidPaise],
                ['Due', order.totals.duePaise],
              ].map(([label, amount]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="tabular-nums">{formatINR(amount as number)}</dd>
                </div>
              ))}
            </dl>
            {order.paymentMode === 'COD' && order.totals.duePaise > 0 && (
              <p className="mt-3 text-xs text-gray-500">Cash on delivery, collected at the door.</p>
            )}
          </Card>
          {order.commission.length > 0 && (
            <Card title="Your commission">
              {order.commission.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <Badge tone={COMMISSION_STATUS[c.status]?.tone ?? 'gray'}>
                    {COMMISSION_STATUS[c.status]?.label ?? c.status}
                  </Badge>
                  <span className="font-semibold tabular-nums">{formatINR(c.amountPaise)}</span>
                </div>
              ))}
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
