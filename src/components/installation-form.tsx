'use client';

import { ApiError } from '@neon-adda/shared/web/client';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api } from '@/lib/browser-api';
import { fromLocalInput, toLocalInput } from '@/lib/format';
import { Field, FormError, SubmitButton, TextInput } from './ui/form';

export interface InstallationView {
  status: string;
  technicianId: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  notes: string | null;
}

export function InstallationForm({
  orderNo,
  job,
  technicians,
}: {
  orderNo: string;
  job: InstallationView | null;
  technicians: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const hours =
    job?.scheduledStart && job.scheduledEnd
      ? (new Date(job.scheduledEnd).getTime() - new Date(job.scheduledStart).getTime()) / 3600_000
      : 2;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      await api.request(`/partner/orders/${orderNo}/installation`, {
        method: 'PUT',
        body: JSON.stringify({
          technicianId: String(form.get('technicianId') ?? '') || null,
          scheduledStart: fromLocalInput(String(form.get('scheduledStart') ?? '')),
          durationHours: Number(form.get('durationHours') ?? 2),
          notes: String(form.get('notes') ?? ''),
        }),
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.title : 'Could not save the visit. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Technician">
          <select
            name="technicianId"
            defaultValue={job?.technicianId ?? ''}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">Not assigned yet</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date and time">
          <TextInput
            name="scheduledStart"
            type="datetime-local"
            defaultValue={toLocalInput(job?.scheduledStart ?? null)}
          />
        </Field>
        <Field label="Hours on site">
          <TextInput name="durationHours" type="number" min={0.5} max={12} step={0.5} defaultValue={hours} />
        </Field>
        <Field label="Notes for the technician">
          <TextInput
            name="notes"
            maxLength={500}
            defaultValue={job?.notes ?? ''}
            placeholder="Floor, parking, wall type"
          />
        </Field>
      </div>
      <FormError message={error} />
      {saved && (
        <p className="text-sm text-emerald-700">Saved. The technician and customer have been told.</p>
      )}
      <div className="sm:w-48">
        <SubmitButton pending={pending}>{job?.scheduledStart ? 'Update visit' : 'Book visit'}</SubmitButton>
      </div>
    </form>
  );
}
