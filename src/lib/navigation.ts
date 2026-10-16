import {
  ClipboardList,
  Hammer,
  FileCheck2,
  Inbox,
  LayoutDashboard,
  QrCode,
  Settings,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface Section {
  slug: string;
  label: string;
  icon: LucideIcon;
  summary: string;
}

export const SECTIONS: Section[] = [
  {
    slug: '',
    label: 'Overview',
    icon: LayoutDashboard,
    summary: 'Your orders, commission and today’s installations at a glance.',
  },
  {
    slug: 'orders',
    label: 'Orders',
    icon: ClipboardList,
    summary: 'Orders from your standee and your territory.',
  },
  {
    slug: 'installations',
    label: 'Installations',
    icon: Hammer,
    summary: 'Installation visits for your orders, booked by Neon Adda, with the technician’s photos.',
  },
  {
    slug: 'leads',
    label: 'Leads',
    icon: Inbox,
    summary: 'Enquiries from customers in your pincodes, with follow-up dates.',
  },
  {
    slug: 'commission',
    label: 'Commission',
    icon: Wallet,
    summary: 'Your rates, commission earned on each order and every payout.',
  },
  {
    slug: 'claims',
    label: 'Claims',
    icon: FileCheck2,
    summary: 'Claim eligible commission with proof of payment, and follow it until it is paid.',
  },
  {
    slug: 'standee',
    label: 'Standee',
    icon: QrCode,
    summary: 'Your QR code. Orders placed through it earn your own-sourced commission rate.',
  },
  {
    slug: 'settings',
    label: 'Settings',
    icon: Settings,
    summary: 'Your business details as Neon Adda has them.',
  },
];

export function findSection(slug: string): Section | undefined {
  return SECTIONS.find((section) => section.slug === slug);
}
