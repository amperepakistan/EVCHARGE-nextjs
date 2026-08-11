'use client';

import { useActionState } from 'react';
import {
  appConfigActionInitialState,
  updateMaintenanceAction,
  updatePlatformConfigAction,
} from '@/lib/auth/app-config-actions';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AppPlatform } from '@/types/database.types';

function ResultMessage({ state }: { state: { ok: boolean; message: string } }) {
  if (!state.message) return null;
  return (
    <p className={state.ok ? 'text-available text-xs' : 'text-error text-xs'}>
      {state.message}
    </p>
  );
}

export function PlatformConfigForm({
  platform,
  minVersion,
  minBuildNumber,
  latestVersion,
  latestBuildNumber,
  forceUpdate,
  storeUrl,
}: {
  platform: AppPlatform;
  minVersion: string;
  minBuildNumber: number;
  latestVersion: string;
  latestBuildNumber: number;
  forceUpdate: boolean;
  storeUrl: string | null;
}) {
  const [state, action, pending] = useActionState(
    updatePlatformConfigAction,
    appConfigActionInitialState,
  );

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-bold">
          {platform === 'ios' ? 'iOS' : 'Android'}
        </h2>
        <Badge tone={platform === 'ios' ? 'info' : 'success'}>
          gates on {platform === 'ios' ? 'version' : 'build number'}
        </Badge>
      </div>
      <form action={action} className="mt-4 space-y-4">
        <input type="hidden" name="platform" value={platform} />

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Min version"
            name="minVersion"
            defaultValue={minVersion}
            required
            hint="X.Y.Z — below this, app is blocked"
          />
          <TextField
            label="Min build number"
            name="minBuildNumber"
            type="number"
            min={1}
            defaultValue={minBuildNumber}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Latest version"
            name="latestVersion"
            defaultValue={latestVersion}
            required
            hint="Shown as a soft update nudge"
          />
          <TextField
            label="Latest build number"
            name="latestBuildNumber"
            type="number"
            min={1}
            defaultValue={latestBuildNumber}
            required
          />
        </div>

        <TextField
          label="Store URL"
          name="storeUrl"
          type="url"
          defaultValue={storeUrl ?? ''}
          placeholder="https://apps.apple.com/... or https://play.google.com/..."
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="forceUpdate"
            defaultChecked={forceUpdate}
            className="border-border size-4 rounded"
          />
          <span>
            <span className="font-semibold">Force update</span>
            <span className="text-text-secondary">
              {' '}
              — raise the floor to &quot;latest&quot; for everyone right now
            </span>
          </span>
        </label>

        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Saving…' : `Save ${platform === 'ios' ? 'iOS' : 'Android'} config`}
        </Button>
        <ResultMessage state={state} />
      </form>
    </Card>
  );
}

export function MaintenanceForm({
  enabled,
  message,
}: {
  enabled: boolean;
  message: string | null;
}) {
  const [state, action, pending] = useActionState(
    updateMaintenanceAction,
    appConfigActionInitialState,
  );

  return (
    <Card variant={enabled ? 'ink' : 'surface'}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-bold">Maintenance mode</h2>
        {enabled ? <Badge tone="danger">Active — app is blocked</Badge> : null}
      </div>
      <p className={enabled ? 'text-on-ink/70 mt-1 text-sm' : 'text-text-secondary mt-1 text-sm'}>
        Independent of version gating. When on, every driver sees a full-screen
        maintenance message instead of the app, regardless of their version.
      </p>
      <form action={action} className="mt-4 space-y-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={enabled}
            className="border-border size-4 rounded"
          />
          <span className="font-semibold">Enable maintenance mode</span>
        </label>
        <label className="block text-sm">
          <span
            className={
              enabled
                ? 'text-on-ink/70 mb-2 block text-xs font-semibold tracking-wider uppercase'
                : 'text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase'
            }
          >
            Message shown to drivers
          </span>
          <textarea
            name="message"
            defaultValue={message ?? ''}
            rows={3}
            className="rounded-button border-border bg-surface text-text-primary w-full border px-4 py-3.5 text-sm outline-none focus:border-primary-dark focus:ring-primary-light focus:ring-2"
            placeholder="We're upgrading our systems. Back shortly."
          />
        </label>
        <Button type="submit" size="sm" variant={enabled ? 'danger' : 'primary'} disabled={pending}>
          {pending ? 'Saving…' : enabled ? 'Update maintenance message' : 'Save'}
        </Button>
        <ResultMessage state={state} />
      </form>
    </Card>
  );
}
