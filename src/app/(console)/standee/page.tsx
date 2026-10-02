import type { Metadata } from 'next';
import QRCode from 'qrcode';
import { PageHeader } from '@/components/page-header';
import { PrintButton } from '@/components/print-button';
import { Card } from '@/components/ui/display';
import { serverApi } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Standee' };

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? 'http://localhost:3000';

export default async function StandeePage() {
  const partner = await serverApi.request<{ code: string; name: string }>('/partner/profile');
  const link = `${STORE_URL.replace(/\/$/, '')}/studio?ref=${partner.code}`;
  const qr = await QRCode.toString(link, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });

  return (
    <>
      <PageHeader
        title="Standee"
        description="Print this for the counter, or open the link on a tablet in your store. Orders placed through it are yours."
      >
        <PrintButton />
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <section
          id="standee"
          className="rounded-3xl bg-gray-950 p-6 text-center text-white sm:p-8 print:rounded-none print:p-12"
        >
          <p className="font-display text-2xl font-bold tracking-wide">
            <span className="text-brand">NEON</span> ADDA
          </p>
          <p className="mt-2 text-lg">Design your own neon sign</p>
          <div
            className="mx-auto mt-6 w-full max-w-64 rounded-2xl bg-white p-3 [&_svg]:h-auto [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qr }}
          />
          <p className="mt-6 text-sm text-gray-300">
            Scan, design it, see the price and order. Pay on delivery.
          </p>
          <p className="mt-3 text-xs text-gray-500">
            {partner.name} · {partner.code}
          </p>
        </section>

        <div className="space-y-4 print:hidden">
          <Card title="Your link">
            <p className="font-mono text-sm break-all text-gray-900">{link}</p>
            <p className="mt-2 text-sm text-gray-500">
              Share it on WhatsApp or Instagram too. The code stays with the customer for 30 days, so an order
              they place later still counts.
            </p>
          </Card>
          <Card title="How it is credited">
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-600">
              <li>The order is assigned to you, wherever the customer lives.</li>
              <li>It earns your own-sourced commission rate, shown under Commission.</li>
              <li>It is marked as a standee order in your order list.</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
