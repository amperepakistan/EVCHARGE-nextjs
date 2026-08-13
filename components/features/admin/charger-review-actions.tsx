'use client';

import { useState, useTransition } from 'react';
import {
  approveSuggestedTerminalAction,
  dismissSuggestedTerminalAction,
} from '@/lib/auth/admin-actions';
import { Button } from '@/components/ui/button';

export function ChargerReviewActions({ terminalId }: { terminalId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                setError(null);
                await approveSuggestedTerminalAction(terminalId);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Approve failed');
              }
            })
          }
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="danger"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                setError(null);
                await dismissSuggestedTerminalAction(terminalId);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Dismiss failed');
              }
            })
          }
        >
          Dismiss
        </Button>
      </div>
      {error ? <p className="text-error text-xs">{error}</p> : null}
    </div>
  );
}
