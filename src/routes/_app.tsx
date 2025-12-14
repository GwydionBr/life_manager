import { createFileRoute, redirect } from "@tanstack/react-router";
import { SettingsSync } from "@/components/Settings/SettingsSync";
import { settingsQueryOptions } from "@/queries/settings/use-settings";
import { profileQueryOptions } from "@/queries/profile/use-profile";
import { Shell } from "@/components/AppShell/Shell";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw redirect({ to: "/auth" });
    }
  },
  loader: async ({ context }) => {
    const { queryClient } = context;
    await queryClient.ensureQueryData(settingsQueryOptions);
    const profile = await queryClient.ensureQueryData(profileQueryOptions);
    if (!profile.initialized) {
      throw redirect({ to: "/new-user" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <>
      <SettingsSync />
      <Shell />
    </>
  );
}
