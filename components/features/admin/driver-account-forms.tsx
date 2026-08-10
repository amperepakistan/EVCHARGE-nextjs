'use client';

import { useActionState } from 'react';
import {
  resetDriverPasswordAction,
  updateDriverEmailAction,
  type DriverActionState,
} from '@/lib/auth/admin-actions';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const initial: DriverActionState = { ok: false, message: '' };

export function DriverAccountForms({
  driverId,
  currentEmail,
}: {
  driverId: string;
  currentEmail: string | null;
}) {
  const [passwordState, passwordAction, passwordPending] = useActionState(
    resetDriverPasswordAction,
    initial,
  );
  const [emailState, emailAction, emailPending] = useActionState(
    updateDriverEmailAction,
    initial,
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="font-heading text-base font-bold">Reset password</h2>
        <p className="text-text-secondary mt-1 text-sm">
          Sets a new password for this driver account immediately.
        </p>
        <form action={passwordAction} className="mt-4 space-y-4">
          <input type="hidden" name="driverId" value={driverId} />
          <TextField
            label="New password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            hint="At least 8 characters"
          />
          <Button type="submit" size="sm" disabled={passwordPending}>
            {passwordPending ? 'Saving…' : 'Update password'}
          </Button>
          {passwordState.message ? (
            <p
              className={
                passwordState.ok ? 'text-available text-xs' : 'text-error text-xs'
              }
            >
              {passwordState.message}
            </p>
          ) : null}
        </form>
      </Card>

      <Card>
        <h2 className="font-heading text-base font-bold">Update email</h2>
        <p className="text-text-secondary mt-1 text-sm">
          Changes the login email on both the user and driver records.
        </p>
        <form action={emailAction} className="mt-4 space-y-4">
          <input type="hidden" name="driverId" value={driverId} />
          <TextField
            label="Email"
            name="email"
            type="email"
            required
            defaultValue={currentEmail ?? ''}
            autoComplete="email"
          />
          <Button type="submit" size="sm" variant="outline" disabled={emailPending}>
            {emailPending ? 'Saving…' : 'Update email'}
          </Button>
          {emailState.message ? (
            <p
              className={emailState.ok ? 'text-available text-xs' : 'text-error text-xs'}
            >
              {emailState.message}
            </p>
          ) : null}
        </form>
      </Card>
    </div>
  );
}
