'use client';

import { useActionState, useState, useTransition } from 'react';
import {
  approveAccountDeletionAction,
  rejectAccountDeletionAction,
  type DeletionActionState,
} from '@/lib/auth/admin-actions';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';

const initialRejectState: DeletionActionState = { ok: false, message: '' };

export function DeletionRequestActions({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();
  const [approveError, setApproveError] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectAccountDeletionAction,
    initialRejectState,
  );

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={pending || rejectPending}
          onClick={() =>
            startTransition(async () => {
              try {
                setApproveError(null);
                await approveAccountDeletionAction(requestId);
              } catch (err) {
                setApproveError(err instanceof Error ? err.message : 'Approve failed');
              }
            })
          }
        >
          Approve delete
        </Button>
        <Button
          size="sm"
          variant="danger"
          disabled={pending || rejectPending}
          onClick={() => setShowReject((v) => !v)}
        >
          Reject
        </Button>
      </div>

      {showReject ? (
        <form action={rejectAction} className="border-border bg-surface w-full max-w-xs space-y-2 rounded-button border p-3">
          <input type="hidden" name="requestId" value={requestId} />
          <TextField
            label="Reason for rejection"
            name="adminNote"
            required
            placeholder="Short note for the record"
          />
          <Button type="submit" size="sm" variant="danger" disabled={rejectPending}>
            {rejectPending ? 'Rejecting…' : 'Confirm reject'}
          </Button>
          {rejectState.message ? (
            <p className={rejectState.ok ? 'text-available text-xs' : 'text-error text-xs'}>
              {rejectState.message}
            </p>
          ) : null}
        </form>
      ) : null}

      {approveError ? <p className="text-error text-xs">{approveError}</p> : null}
    </div>
  );
}
