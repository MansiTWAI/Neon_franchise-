'use client';

import { ApiError } from '@neon-adda/shared/web/client';
import { useState } from 'react';
import { api } from '@/lib/browser-api';
import { formatDateTime, fromLocalInput, LEAD_STATUS, toLocalInput } from '@/lib/format';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  pincode: string | null;
  message: string | null;
  source: string;
  status: string;
  followUpAt: string | null;
  createdAt: string;
}

export function LeadRow({ lead: initial }: { lead: Lead }) {
  const [lead, setLead] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  async function update(change: Partial<Pick<Lead, 'status' | 'followUpAt'>>) {
    const previous = lead;
    setLead({ ...lead, ...change });
    setError(null);
    try {
      await api.request(`/partner/leads/${lead.id}`, { method: 'PATCH', body: JSON.stringify(change) });
    } catch (err) {
      setLead(previous);
      setError(err instanceof ApiError ? err.title : 'Not saved');
    }
  }

  return (
    <tr>
      <td className="px-4 py-3">
        <p className="font-medium text-gray-900">{lead.name}</p>
        <a href={`tel:${lead.phone}`} className="text-xs text-brand tabular-nums">
          {lead.phone}
        </a>
        {lead.pincode && <p className="text-xs text-gray-500">{lead.pincode}</p>}
      </td>
      <td className="max-w-sm px-4 py-3 text-gray-600">
        {lead.message ?? <span className="text-gray-400">No message</span>}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDateTime(lead.createdAt)}</td>
      <td className="px-4 py-3">
        <select
          value={lead.status}
          onChange={(event) => update({ status: event.target.value })}
          aria-label={`Status of ${lead.name}`}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm"
        >
          {Object.entries(LEAD_STATUS).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </td>
      <td className="px-4 py-3">
        <input
          type="datetime-local"
          defaultValue={toLocalInput(lead.followUpAt)}
          onBlur={(event) => {
            const followUpAt = fromLocalInput(event.target.value);
            if (followUpAt !== lead.followUpAt) void update({ followUpAt });
          }}
          aria-label={`Follow-up for ${lead.name}`}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm"
        />
      </td>
    </tr>
  );
}
