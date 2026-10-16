'use client';

import { ApiError } from '@neon-adda/shared/web/client';
import { FileText, ImageIcon, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { api } from '@/lib/browser-api';
import { openPrivateFile } from '@/lib/private-file';
import { Card } from '../ui/display';
import { Field, FormError, SubmitButton } from '../ui/form';

export interface ClaimDetail {
  id: string;
  claimNo: string;
  status: string;
  amountPaise: number;
  createdAt: string;
  submittedAt: string | null;
  reviewNote: string | null;
  note: string | null;
  evidence: { id: string; fileName: string; mime: string; bytes: number; createdAt: string }[];
  commissions: {
    id: string;
    status: string;
    amountPaise: number;
    order: { orderNo: string; totalPaise: number; amountPaidPaise: number };
  }[];
  history: { action: string; at: string; by: string | null; note: string | null }[];
}

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp';

const size = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** Evidence and the actions open to the partner: add and remove files, submit, delete a draft. */
export function ClaimWorkspace({ claim }: { claim: ClaimDetail }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const editable = claim.status === 'DRAFT' || claim.status === 'DISPUTED';
  const base = `/partner/claims/${claim.id}`;

  async function run(key: string, action: () => Promise<unknown>) {
    setBusy(key);
    setError(null);
    try {
      await action();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.title : err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setBusy(null);
    }
  }

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (input.current) input.current.value = '';
    if (!file) return;
    if (file.size > MAX_BYTES)
      return setError('Files can be up to 5 MB. Split a long statement, or save it smaller.');
    const form = new FormData();
    form.append('file', file, file.name);
    await run('upload', () => api.request(`${base}/evidence`, { method: 'POST', body: form }));
  }

  return (
    <div className="space-y-6">
      <Card title={`Evidence (${claim.evidence.length} of ${MAX_FILES})`}>
        {claim.evidence.length === 0 ? (
          <p className="text-sm text-gray-500">
            Add the bank statement or receipts that show the customers’ payments for these orders.
          </p>
        ) : (
          <ul className="space-y-2">
            {claim.evidence.map((file) => {
              const Icon = file.mime === 'application/pdf' ? FileText : ImageIcon;
              return (
                <li
                  key={file.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <Icon className="size-4 shrink-0 text-gray-500" />
                  <button
                    type="button"
                    onClick={() =>
                      run(`open-${file.id}`, () => openPrivateFile(`${base}/evidence/${file.id}`))
                    }
                    className="min-w-0 flex-1 truncate text-left font-medium text-gray-900 hover:underline"
                  >
                    {file.fileName}
                  </button>
                  <span className="shrink-0 text-xs text-gray-500">{size(file.bytes)}</span>
                  {editable && (
                    <button
                      type="button"
                      aria-label={`Remove ${file.fileName}`}
                      disabled={busy !== null}
                      onClick={() =>
                        run(`remove-${file.id}`, () =>
                          api.request(`${base}/evidence/${file.id}`, { method: 'DELETE' }),
                        )
                      }
                      className="shrink-0 text-gray-400 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {editable && claim.evidence.length < MAX_FILES && (
          <>
            <input
              ref={input}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              id="evidence-file"
              onChange={(event) => void upload(event.target.files)}
            />
            <label
              htmlFor="evidence-file"
              className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm font-medium text-gray-700 hover:border-gray-400"
            >
              {busy === 'upload' ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Add a PDF or photo
            </label>
            <p className="mt-1.5 text-xs text-gray-500">
              PDF, JPG, PNG or WebP, up to 5 MB. Only you and the Neon Adda accounts team can open these.
            </p>
          </>
        )}
      </Card>

      {editable && (
        <Card title={claim.status === 'DISPUTED' ? 'Send it back' : 'Submit for review'}>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              const note = String(new FormData(event.currentTarget).get('note') ?? '').trim();
              void run('submit', () =>
                api.request(`${base}/submit`, {
                  method: 'POST',
                  body: JSON.stringify(note ? { note } : {}),
                }),
              );
            }}
          >
            <Field label="Note for accounts (optional)">
              <textarea
                name="note"
                rows={3}
                maxLength={1000}
                defaultValue={claim.note ?? ''}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </Field>
            <FormError message={error} />
            <SubmitButton pending={busy === 'submit'}>
              {claim.status === 'DISPUTED' ? 'Resubmit claim' : 'Submit claim'}
            </SubmitButton>
          </form>
          {claim.status === 'DRAFT' && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => {
                if (!window.confirm('Delete this draft? Its commission becomes claimable again.')) return;
                void run('discard', async () => {
                  await api.request(base, { method: 'DELETE' });
                  router.push('/claims');
                });
              }}
              className="mt-3 w-full text-center text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Delete draft
            </button>
          )}
        </Card>
      )}
      {!editable && <FormError message={error} />}
      {!editable && (
        <p className="text-sm text-gray-500">
          {claim.status === 'SUBMITTED'
            ? 'With the accounts team. You will see their decision here.'
            : claim.status === 'APPROVED'
              ? 'Approved. It will be paid in the next payout.'
              : claim.status === 'PAID'
                ? 'Paid. The bank reference is on the Commission page.'
                : 'This claim is closed.'}
        </p>
      )}
    </div>
  );
}
