import { formatINR, type OrderStatus } from '@neon-adda/shared';
import { ClipboardList } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge, Pager, Table, Tabs } from '@/components/ui/display';
import { formatDateTime, ORDER_STATUS, SOURCE_LABEL } from '@/lib/format';
import { serverApi } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Orders' };

interface OrderRow {
  orderNo: string;
  status: OrderStatus;
  attributionSource: string;
  totalPaise: number;
  duePaise: number;
  installationRequired: boolean;
  createdAt: string;
  customerName: string;
  city: string;
  signs: number;
}

interface OrderPage {
  items: OrderRow[];
  page: number;
  pages: number;
}

const QUEUES = [
  ['open', 'Open'],
  ['installation', 'Needs installation'],
  ['cash-to-collect', 'Cash to collect'],
  ['closed', 'Closed'],
  ['all', 'All'],
] as const;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ queue?: string; page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const queue = QUEUES.some(([key]) => key === params.queue) ? params.queue! : 'open';
  const query = new URLSearchParams({
    queue,
    page: params.page ?? '1',
    ...(params.q ? { q: params.q } : {}),
  });
  const orders = await serverApi.request<OrderPage>(`/partner/orders?${query}`);

  return (
    <>
      <PageHeader
        title="Orders"
        description="Orders from your standee and from customers in your pincodes."
      />
      <Tabs
        current={queue}
        items={QUEUES.map(([key, label]) => ({ key, label, href: `/orders?queue=${key}` }))}
      />
      <form className="mb-4">
        <input type="hidden" name="queue" value={queue} />
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search by order number or customer"
          className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </form>

      {orders.items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders here"
          body="Orders appear as customers place them."
        />
      ) : (
        <Table head={['Order', 'Customer', 'Status', 'From', 'Total', 'Due', 'Placed']}>
          {orders.items.map((order) => (
            <tr key={order.orderNo}>
              <td className="px-4 py-3">
                <Link href={`/orders/${order.orderNo}`} className="font-medium text-gray-900 hover:underline">
                  {order.orderNo}
                </Link>
                <p className="text-xs text-gray-500">
                  {order.signs === 1 ? '1 sign' : `${order.signs} signs`}
                  {order.installationRequired && ' · installation'}
                </p>
              </td>
              <td className="px-4 py-3">
                {order.customerName}
                <p className="text-xs text-gray-500">{order.city}</p>
              </td>
              <td className="px-4 py-3">
                <Badge tone={ORDER_STATUS[order.status].tone}>{ORDER_STATUS[order.status].label}</Badge>
              </td>
              <td className="px-4 py-3 text-gray-600">{SOURCE_LABEL[order.attributionSource]}</td>
              <td className="px-4 py-3 tabular-nums">{formatINR(order.totalPaise)}</td>
              <td className="px-4 py-3 tabular-nums">
                {order.duePaise > 0 ? formatINR(order.duePaise) : <span className="text-gray-400">None</span>}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDateTime(order.createdAt)}</td>
            </tr>
          ))}
        </Table>
      )}
      <Pager
        page={orders.page}
        pages={orders.pages}
        href={(page) =>
          `/orders?${new URLSearchParams({ queue, page: String(page), ...(params.q ? { q: params.q } : {}) })}`
        }
      />
    </>
  );
}
