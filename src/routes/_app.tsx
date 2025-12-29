import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SettingsSync } from "@/components/Settings/SettingsSync";
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
