import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SettingsSync } from "@/components/Settings/SettingsSync";
import { settingsQueryOptions } from "@/db/queries/settings/use-settings";
import { profileQueryOptions } from "@/db/queries/profile/use-profile";
import { Shell } from "@/components/AppShell/Shell";
import { PowerSyncInitializer } from "@/components/PowerSyncInitializer";
import { RoutePrefetcher } from "@/components/RoutePrefetcher";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/auth" });
    }
  },
  loader: async ({ context }) => {
    const { queryClient } = context;

    const profile =
      await context.queryClient.ensureQueryData(profileQueryOptions);
    if (!profile.initialized) {
      throw redirect({ to: "/new-user" });
    }
    await queryClient.ensureQueryData(settingsQueryOptions);
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <>
      <PowerSyncInitializer />
      <SettingsSync />
      <RoutePrefetcher />
      <Shell>
        <Outlet />
      </Shell>
    </>
  );
}
