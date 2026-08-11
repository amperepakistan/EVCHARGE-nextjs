import { PageHeader } from '@/components/ui/page-header';
import { requireAdminDashboard } from '@/lib/server/dashboard';
import * as appConfigService from '@/lib/server/modules/app-config/app-config.service';
import { MaintenanceForm, PlatformConfigForm } from '@/components/features/admin/app-config-forms';

export default async function AdminAppConfigPage() {
  const { ctx } = await requireAdminDashboard();
  const { configs, maintenance } = await appConfigService.getConsole(ctx);

  const ios = configs.find((c) => c.platform === 'ios');
  const android = configs.find((c) => c.platform === 'android');

  return (
    <div className="space-y-8">
      <PageHeader
        title="App config"
        description="Minimum supported version, force update, and maintenance mode for the driver app. See docs/VERSIONING.md for the rules behind these numbers."
      />

      <MaintenanceForm enabled={maintenance?.enabled ?? false} message={maintenance?.message ?? null} />

      <div className="grid gap-4 lg:grid-cols-2">
        {ios ? (
          <PlatformConfigForm
            platform="ios"
            minVersion={ios.min_version}
            minBuildNumber={ios.min_build_number}
            latestVersion={ios.latest_version}
            latestBuildNumber={ios.latest_build_number}
            forceUpdate={ios.force_update}
            storeUrl={ios.store_url}
          />
        ) : null}
        {android ? (
          <PlatformConfigForm
            platform="android"
            minVersion={android.min_version}
            minBuildNumber={android.min_build_number}
            latestVersion={android.latest_version}
            latestBuildNumber={android.latest_build_number}
            forceUpdate={android.force_update}
            storeUrl={android.store_url}
          />
        ) : null}
      </div>
    </div>
  );
}
