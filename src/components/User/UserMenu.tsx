import { useRouter } from "@tanstack/react-router";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import { useIntl } from "@/hooks/useIntl";
import { useSettingsStore } from "@/stores/settingsStore";

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
import {
  IconSettings,
  IconLogout,
  IconDashboard,
  IconKeyboard,
  IconHelp,
  IconFileText,
  IconShield,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { DarkSchemeIcon } from "@/components/Scheme/DarkScheme";
import { LightSchemeIcon } from "@/components/Scheme/LightScheme";

import { connector } from "@/db/powersync/db";
import { cleanupOnLogout } from "@/lib/cleanupOnLogout";

export function UserMenu() {
  const router = useRouter();
  const { getLocalizedText, locale } = useIntl();
  const { setIsModalOpen } = useSettingsStore();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const { data: profile } = useProfile();

  const handleSignOut = async () => {
    try {
      await connector.logout();
      await cleanupOnLogout();
      router.navigate({ to: "/" });
      router.invalidate();
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
          component={Link}
          to="/dashboard"
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
        <Menu.Sub openDelay={120} closeDelay={150}>
          <Menu.Sub.Target>
            <Menu.Sub.Item leftSection={<IconHelp size={16} />}>
              {getLocalizedText("Hilfe", "Help")}
            </Menu.Sub.Item>
          </Menu.Sub.Target>
          <Menu.Sub.Dropdown>
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
              {getLocalizedText(
                "Hilfe & Dokumentation",
                "Help & Documentation"
              )}
            </Menu.Item>
          </Menu.Sub.Dropdown>
        </Menu.Sub>

        {/* Legal */}
        <Menu.Sub openDelay={120} closeDelay={150}>
          <Menu.Sub.Target>
            <Menu.Sub.Item leftSection={<IconShield size={16} />}>
              {getLocalizedText("Rechtliches", "Legal")}
            </Menu.Sub.Item>
          </Menu.Sub.Target>
          <Menu.Sub.Dropdown>
            <Menu.Item
              leftSection={<IconFileText size={16} />}
              component={Link}
              to="/impressum"
            >
              {getLocalizedText("Impressum", "Imprint")}
            </Menu.Item>
            <Menu.Item
              leftSection={<IconShield size={16} />}
              component={Link}
              to="/datenschutz"
            >
              {getLocalizedText("Datenschutzerklärung", "Privacy Policy")}
            </Menu.Item>
          </Menu.Sub.Dropdown>
        </Menu.Sub>

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
