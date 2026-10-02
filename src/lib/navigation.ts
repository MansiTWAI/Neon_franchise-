import {
  ClipboardList,
  Hammer,
  HardHat,
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
    summary: 'Visits to schedule, under way and finished, with the technician’s photos.',
  },
  {
    slug: 'technicians',
    label: 'Technicians',
    icon: HardHat,
    summary: 'The installers who work for you. They sign in to the technician app with their mobile number.',
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
