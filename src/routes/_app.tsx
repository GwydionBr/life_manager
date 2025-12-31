import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { Shell } from "@/components/AppShell/Shell";
import { PowerSyncInitializer } from "@/components/PowerSyncInitializer";
import { RoutePrefetcher } from "@/components/RoutePrefetcher";
import { useProfile } from "@/db/collections/profile/profile-collection";

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
  const { data: profile, isReady } = useProfile();

  if (isReady && profile && !profile.initialized) {
    return <Navigate to="/new-user" />;
  }

  return (
    <>
      <PowerSyncInitializer />
      <RoutePrefetcher />
      <Shell>
        <Outlet />
      </Shell>
    </>
  );
}
