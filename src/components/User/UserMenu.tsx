import {
  Menu,
  Button,
  Text,
  Avatar,
  Group,
  Stack,
  Badge,
  Box,
  useMantineColorScheme,
} from "@mantine/core";
import { useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { profileQueryOptions } from "@/queries/profile/use-profile";
import { signOut } from "@/actions/auth/signOut";
import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";
import {
  IconSettings,
  IconLogout,
  IconDashboard,
  IconKeyboard,
  IconHelp,
  IconBriefcase,
  IconCurrencyDollar,
  IconCalendar,
  IconTarget,
} from "@tabler/icons-react";
import { DarkSchemeIcon } from "@/components/Scheme/DarkScheme";
import { LightSchemeIcon } from "@/components/Scheme/LightScheme";

export function UserMenu() {
  const router = useRouter();
  const { getLocalizedText, locale } = useIntl();
  const { setIsModalOpen } = useSettingsStore();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const { data: profile } = useQuery(profileQueryOptions);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.invalidate();
      router.navigate({ to: "/" });
    } catch (error) {
      console.error("Sign out error:", error);
      throw new Error("Sign out error");
    }
  };

  const formatMemberSince = (createdAt?: string) => {
    if (!createdAt) return "";
    const date = new Date(createdAt);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <Menu
      shadow="md"
      width={280}
      position="bottom-end"
      transitionProps={{ transition: "fade-down", duration: 200 }}
    >
      <Menu.Target>
        <Button variant="transparent" style={{ padding: "0 8px" }}>
          <Avatar
            src={profile?.avatar_url || undefined}
            color="violet"
            radius="xl"
            size="sm"
          >
            {profile?.full_name?.charAt(0).toUpperCase() || "U"}
          </Avatar>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {/* User Info Header */}
        <Box p="sm">
          <Group gap="md" wrap="nowrap">
            <Avatar
              src={profile?.avatar_url || undefined}
              color="violet"
              radius="xl"
              size="lg"
            >
              {profile?.full_name?.charAt(0).toUpperCase() || "U"}
            </Avatar>
            <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={600} truncate>
                {profile?.full_name || profile?.username || "User"}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {profile?.email}
              </Text>
              {profile?.created_at && (
                <Badge size="xs" variant="light" color="violet">
                  {getLocalizedText("Mitglied seit", "Member since")}{" "}
                  {formatMemberSince(profile.created_at)}
                </Badge>
              )}
            </Stack>
          </Group>
        </Box>

        <Menu.Divider />

        {/* Quick Navigation */}
        <Menu.Label>{getLocalizedText("Navigation", "Navigation")}</Menu.Label>
        <Menu.Item
          leftSection={<IconDashboard size={16} />}
          component="a"
          href="/dashboard"
        >
          {getLocalizedText("Dashboard", "Dashboard")}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconSettings size={16} />}
          onClick={() => setIsModalOpen(true)}
        >
          {getLocalizedText("Einstellungen", "Settings")}
        </Menu.Item>

        <Menu.Divider />

        {/* App Shortcuts */}
        <Menu.Label>
          {getLocalizedText("Schnellzugriff", "Quick Access")}
        </Menu.Label>
        <Menu.Item
          leftSection={<IconBriefcase size={16} />}
          component="a"
          href="/work"
          rightSection={
            <Text size="xs" c="dimmed">
              W
            </Text>
          }
        >
          {getLocalizedText("Arbeit", "Work")}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconCurrencyDollar size={16} />}
          component="a"
          href="/finance"
          rightSection={
            <Text size="xs" c="dimmed">
              F
            </Text>
          }
        >
          {getLocalizedText("Finanzen", "Finance")}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconCalendar size={16} />}
          component="a"
          href="/calendar"
          rightSection={
            <Text size="xs" c="dimmed">
              C
            </Text>
          }
        >
          {getLocalizedText("Kalender", "Calendar")}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconTarget size={16} />}
          component="a"
          href="/habbit-tracker"
          rightSection={
            <Text size="xs" c="dimmed">
              H
            </Text>
          }
        >
          {getLocalizedText("Gewohnheiten", "Habits")}
        </Menu.Item>

        <Menu.Divider />

        {/* Theme Toggle */}
        <Menu.Label>{getLocalizedText("Darstellung", "Appearance")}</Menu.Label>
        <Menu.Item
          leftSection={
            colorScheme === "dark" ? (
              <LightSchemeIcon size={16} color="var(--mantine-color-text)" />
            ) : (
              <DarkSchemeIcon size={16} color="var(--mantine-color-text)" />
            )
          }
          onClick={() => toggleColorScheme()}
          rightSection={
            <Text size="xs" c="dimmed">
              ⌘T
            </Text>
          }
        >
          {colorScheme === "dark"
            ? getLocalizedText("Helles Design", "Light Mode")
            : getLocalizedText("Dunkles Design", "Dark Mode")}
        </Menu.Item>

        <Menu.Divider />

        {/* Help & Support */}
        <Menu.Label>{getLocalizedText("Hilfe", "Help")}</Menu.Label>
        <Menu.Item
          leftSection={<IconKeyboard size={16} />}
          rightSection={
            <Text size="xs" c="dimmed">
              ?
            </Text>
          }
        >
          {getLocalizedText("Tastenkürzel", "Keyboard Shortcuts")}
        </Menu.Item>
        <Menu.Item leftSection={<IconHelp size={16} />}>
          {getLocalizedText("Hilfe & Dokumentation", "Help & Documentation")}
        </Menu.Item>

        <Menu.Divider />

        {/* Sign Out */}
        <Menu.Item
          color="red"
          leftSection={<IconLogout size={16} />}
          onClick={handleSignOut}
        >
          {getLocalizedText("Abmelden", "Sign out")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
