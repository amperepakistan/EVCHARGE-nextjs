'use client';

import { useActionState, useState } from 'react';
import {
  sendPushNotificationAction,
  type PushActionState,
} from '@/lib/auth/admin-actions';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

const initial: PushActionState = { ok: false, message: '' };

export type PushRecipientOption = {
  userId: string;
  fullName: string | null;
  email: string | null;
  deviceCount: number;
};

export function SendPushForm({ recipients }: { recipients: PushRecipientOption[] }) {
  const [state, action, pending] = useActionState(
    sendPushNotificationAction,
    initial,
  );
  const [audience, setAudience] = useState<'all' | 'selected'>('all');

  const withDevices = recipients.filter((r) => r.deviceCount > 0);

  return (
    <Card>
      <h2 className="font-heading text-base font-bold">Send push notification</h2>
      <p className="text-text-secondary mt-1 text-sm">
        Targets driver accounts. Each account receives the push on every device
        registered while logged into the app.
      </p>

      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="audience" value={audience} />

        <div>
          <span className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
            Audience
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAudience('all')}
              className={cn(
                'rounded-button border px-3.5 py-2 text-sm font-semibold transition-colors',
                audience === 'all'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-text-secondary hover:bg-surface-muted',
              )}
            >
              All drivers
            </button>
            <button
              type="button"
              onClick={() => setAudience('selected')}
              className={cn(
                'rounded-button border px-3.5 py-2 text-sm font-semibold transition-colors',
                audience === 'selected'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-text-secondary hover:bg-surface-muted',
              )}
            >
              Selected accounts
            </button>
          </div>
          <p className="text-text-secondary mt-2 text-xs">
            {withDevices.length} of {recipients.length} driver accounts have a
            registered device.
          </p>
          {withDevices.length === 0 ? (
            <p className="text-warning mt-1 text-xs">
              No devices yet. Ask drivers to open Ampere while signed in, then
              refresh this page.
            </p>
          ) : null}
        </div>

        {audience === 'selected' ? (
          <fieldset className="space-y-2">
            <legend className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
              Driver accounts
            </legend>
            <ul className="border-border divide-border max-h-64 divide-y overflow-y-auto rounded-lg border">
              {recipients.map((r) => (
                <li key={r.userId}>
                  <label
                    className={cn(
                      'flex cursor-pointer items-start gap-3 px-3 py-2.5',
                      r.deviceCount === 0 && 'opacity-50',
                    )}
                  >
                    <input
                      type="checkbox"
                      name="userIds"
                      value={r.userId}
                      disabled={r.deviceCount === 0}
                      className="border-border text-primary mt-1 size-4 rounded"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="text-text-primary block truncate text-sm font-semibold">
                        {r.fullName ?? 'Unnamed driver'}
                      </span>
                      <span className="text-text-secondary block truncate text-xs">
                        {r.email ?? 'No email'} · {r.deviceCount} device
                        {r.deviceCount === 1 ? '' : 's'}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
              {recipients.length === 0 ? (
                <li className="text-text-secondary p-3 text-sm">No drivers yet</li>
              ) : null}
            </ul>
          </fieldset>
        ) : null}

        <TextField
          label="Title"
          name="title"
          required
          maxLength={100}
          placeholder="Ampere alert"
        />

        <label className="block text-sm">
          <span className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
            Body
          </span>
          <textarea
            name="body"
            required
            rows={4}
            maxLength={500}
            placeholder="Notification message"
            className={cn(
              'rounded-button border-border bg-surface text-text-primary w-full border px-4 py-3.5 text-sm',
              'placeholder:text-text-secondary/70 outline-none transition-colors duration-150',
              'focus:border-primary-dark focus:ring-primary-light focus:ring-2',
            )}
          />
        </label>

        <Button type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Send notification'}
        </Button>

        {state.message ? (
          <p
            className={
              state.ok
                ? 'text-available text-xs'
                : 'text-error max-w-prose text-xs leading-5'
            }
          >
            {state.message}
          </p>
        ) : null}
      </form>
    </Card>
  );
}
