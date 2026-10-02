import type { OrderStatus } from '@neon-adda/shared';

export type Tone = 'gray' | 'blue' | 'amber' | 'green' | 'red' | 'violet';

const ist = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-IN', { ...options, timeZone: 'Asia/Kolkata' });

const dateFormat = ist({ day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFormat = ist({ day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const timeFormat = ist({ hour: 'numeric', minute: '2-digit' });

export const formatDate = (value: string | Date) => dateFormat.format(new Date(value));
export const formatDateTime = (value: string | Date) => dateTimeFormat.format(new Date(value));
export const formatTime = (value: string | Date) => timeFormat.format(new Date(value));

/** A `datetime-local` input value in India time. */
export function toLocalInput(value: string | null): string {
  if (!value) return '';
  const ist = new Date(new Date(value).getTime() + 5.5 * 3600_000);
  return ist.toISOString().slice(0, 16);
}

/** Reads a `datetime-local` value as India time. */
export function fromLocalInput(value: string): string | null {
  return value ? new Date(`${value}:00+05:30`).toISOString() : null;
}

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  PENDING_PAYMENT: { label: 'Awaiting confirmation', tone: 'amber' },
  EXPIRED: { label: 'Expired', tone: 'gray' },
  CONFIRMED: { label: 'Confirmed', tone: 'blue' },
  PROOF_PENDING: { label: 'Design proof', tone: 'blue' },
  PROOF_APPROVED: { label: 'Design approved', tone: 'blue' },
  IN_PRODUCTION: { label: 'In production', tone: 'violet' },
  QUALITY_CHECK: { label: 'Quality check', tone: 'violet' },
  READY_TO_DISPATCH: { label: 'Ready to dispatch', tone: 'violet' },
  SHIPPED: { label: 'Shipped', tone: 'blue' },
  DELIVERED: { label: 'Delivered', tone: 'green' },
  INSTALLED: { label: 'Installed', tone: 'green' },
  COMPLETED: { label: 'Completed', tone: 'green' },
  ON_HOLD: { label: 'On hold', tone: 'amber' },
  CANCELLED: { label: 'Cancelled', tone: 'red' },
};

export const JOB_STATUS: Record<string, { label: string; tone: Tone }> = {
  UNASSIGNED: { label: 'To schedule', tone: 'amber' },
  SCHEDULED: { label: 'Scheduled', tone: 'blue' },
  RESCHEDULED: { label: 'Rescheduled', tone: 'blue' },
  ACCEPTED: { label: 'Accepted', tone: 'blue' },
  ON_THE_WAY: { label: 'On the way', tone: 'violet' },
  REACHED: { label: 'Reached', tone: 'violet' },
  WORK_STARTED: { label: 'Work started', tone: 'violet' },
  COMPLETED: { label: 'Completed', tone: 'green' },
  FAILED: { label: 'Not completed', tone: 'red' },
  CANCELLED: { label: 'Cancelled', tone: 'gray' },
};

export const COMMISSION_STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: 'Pending', tone: 'amber' },
  ON_HOLD: { label: 'On hold', tone: 'amber' },
  ELIGIBLE: { label: 'Eligible', tone: 'blue' },
  APPROVED: { label: 'Approved', tone: 'blue' },
  PAID: { label: 'Paid', tone: 'green' },
  REVERSED: { label: 'Reversed', tone: 'gray' },
};

export const LEAD_STATUS: Record<string, { label: string; tone: Tone }> = {
  NEW: { label: 'New', tone: 'amber' },
  CONTACTED: { label: 'Contacted', tone: 'blue' },
  QUOTED: { label: 'Quoted', tone: 'violet' },
  WON: { label: 'Won', tone: 'green' },
  LOST: { label: 'Lost', tone: 'gray' },
};

export const SOURCE_LABEL: Record<string, string> = {
  SELF_SOURCED: 'Your standee',
  ASSIGNED: 'Your territory',
  NONE: 'Unassigned',
};
