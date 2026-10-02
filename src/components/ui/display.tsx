import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Tone } from '@/lib/format';

const TONES: Record<Tone, string> = {
  gray: 'bg-gray-100 text-gray-600',
  blue: 'bg-sky-50 text-sky-700',
  amber: 'bg-amber-50 text-amber-700',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
  violet: 'bg-violet-50 text-violet-700',
};

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({
  title,
  action,
  children,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-semibold text-gray-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            {head.map((cell, i) => (
              <th key={i} className="px-4 py-3 font-medium whitespace-nowrap">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Tabs({
  items,
  current,
}: {
  items: { key: string; label: string; href: string }[];
  current: string;
}) {
  return (
    <nav className="mb-5 flex flex-wrap gap-1.5" aria-label="Filter">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.key === current ? 'page' : undefined}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            item.key === current
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:text-gray-900'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function Pager({
  page,
  pages,
  href,
}: {
  page: number;
  pages: number;
  href: (page: number) => string;
}) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-3 text-sm">
      {page > 1 && (
        <Link href={href(page - 1)} className="font-medium text-gray-700 hover:text-gray-900">
          Previous
        </Link>
      )}
      <span className="text-gray-500">
        Page {page} of {pages}
      </span>
      {page < pages && (
        <Link href={href(page + 1)} className="font-medium text-gray-700 hover:text-gray-900">
          Next
        </Link>
      )}
    </div>
  );
}
