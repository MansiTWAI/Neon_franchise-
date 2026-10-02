'use client';

import { ApiError } from '@neon-adda/shared/web/client';
import { HardHat } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { api } from '@/lib/browser-api';
import { formatPhone } from '@/lib/format';
import { EmptyState } from './empty-state';
import { Badge, Card, Table } from './ui/display';
import { Field, FormError, SubmitButton, TextInput } from './ui/form';

export interface Technician {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  completedJobs: number;
  openJobs: number;
}

export function TechnicianManager({ initial }: { initial: Technician[] }) {
  const [technicians, setTechnicians] = useState(initial);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(key: string, path: string, method: 'POST' | 'PUT', body: object) {
    setPending(key);
    setError(null);
    try {
      setTechnicians(await api.request<Technician[]>(path, { method, body: JSON.stringify(body) }));
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.title : 'Could not save. Try again.');
      return false;
    } finally {
      setPending(null);
    }
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const ok = await save('add', '/partner/technicians', 'POST', {
      name: form.get('name'),
      phone: form.get('phone'),
    });
    if (ok) formElement.reset();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        {technicians.length === 0 ? (
          <EmptyState
            icon={HardHat}
            title="No technicians yet"
            body="Add your first installer to start booking visits."
          />
        ) : (
          <Table head={['Name', 'Mobile', 'Open visits', 'Finished', 'Status', '']}>
            {technicians.map((t) => (
              <tr key={t.id} className={t.isActive ? '' : 'text-gray-400'}>
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">{formatPhone(t.phone)}</td>
                <td className="px-4 py-3 tabular-nums">{t.openJobs}</td>
                <td className="px-4 py-3 tabular-nums">{t.completedJobs}</td>
                <td className="px-4 py-3">
                  <Badge tone={t.isActive ? 'green' : 'gray'}>{t.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() =>
                      save(t.id, `/partner/technicians/${t.id}`, 'PUT', {
                        name: t.name,
                        phone: t.phone,
                        isActive: !t.isActive,
                      })
                    }
                    disabled={pending !== null}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    {t.isActive ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      <Card title="Add a technician">
        <form onSubmit={add} className="space-y-4">
          <Field label="Name">
            <TextInput name="name" required minLength={2} maxLength={80} />
          </Field>
          <Field label="Mobile number" hint="They sign in with a code sent to this number on WhatsApp.">
            <TextInput name="phone" type="tel" inputMode="numeric" required placeholder="98765 43210" />
          </Field>
          <FormError message={error} />
          <SubmitButton pending={pending === 'add'}>Add technician</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
