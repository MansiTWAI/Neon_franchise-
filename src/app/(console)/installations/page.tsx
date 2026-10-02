import { Hammer } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge, Table } from '@/components/ui/display';
import { formatDateTime, JOB_STATUS } from '@/lib/format';
import { serverApi } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Installations' };

interface Visit {
  id: string;
  status: string;
  scheduledStart: string | null;
  completedAt: string | null;
  technician: string | null;
  orderNo: string;
  customerName: string;
  city: string;
  pincode: string;
  photos: number;
  failReason: string | null;
}

const GROUPS: { title: string; statuses: string[] }[] = [
  { title: 'To schedule', statuses: ['UNASSIGNED', 'FAILED'] },
  { title: 'Booked', statuses: ['SCHEDULED', 'RESCHEDULED', 'ACCEPTED'] },
  { title: 'Under way', statuses: ['ON_THE_WAY', 'REACHED', 'WORK_STARTED'] },
  { title: 'Finished in the last 30 days', statuses: ['COMPLETED'] },
];

export default async function InstallationsPage() {
  const visits = await serverApi.request<Visit[]>('/partner/installations');

  return (
    <>
      <PageHeader
        title="Installations"
        description="Book each visit from its order. Technicians update the status and add photos from their app."
      />
      {visits.length === 0 ? (
        <EmptyState
          icon={Hammer}
          title="No installations yet"
          body="Orders with installation booked appear here once they are confirmed."
        />
      ) : (
        <div className="space-y-8">
          {GROUPS.map(({ title, statuses }) => {
            const rows = visits.filter((v) => statuses.includes(v.status));
            if (!rows.length) return null;
            return (
              <section key={title}>
                <h2 className="mb-3 font-semibold text-gray-900">
                  {title} <span className="text-gray-400">({rows.length})</span>
                </h2>
                <Table head={['Order', 'Customer', 'When', 'Technician', 'Status', 'Photos']}>
                  {rows.map((visit) => (
                    <tr key={visit.id}>
                      <td className="px-4 py-3">
                        <Link
                          href={`/orders/${visit.orderNo}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {visit.orderNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {visit.customerName}
                        <p className="text-xs text-gray-500">
                          {visit.city} {visit.pincode}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {visit.completedAt
                          ? formatDateTime(visit.completedAt)
                          : visit.scheduledStart
                            ? formatDateTime(visit.scheduledStart)
                            : 'Not booked'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{visit.technician ?? 'Not assigned'}</td>
                      <td className="px-4 py-3">
                        <Badge tone={JOB_STATUS[visit.status]?.tone ?? 'gray'}>
                          {JOB_STATUS[visit.status]?.label ?? visit.status}
                        </Badge>
                        {visit.failReason && visit.status === 'FAILED' && (
                          <p className="mt-1 max-w-xs text-xs text-red-600">{visit.failReason}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 tabular-nums">{visit.photos}</td>
                    </tr>
                  ))}
                </Table>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
