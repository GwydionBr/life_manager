import { useEffect, useState, useMemo } from "react";
import { db } from "@/db/powersync/db";
import { useIntl } from "@/hooks/useIntl";
import { useNetwork } from "@mantine/hooks";

import {
  Menu,
  Button,
  Text,
  Group,
  Stack,
  Badge,
  Box,
  Indicator,
  Divider,
  Progress,
  Card,
  ThemeIcon,
  Loader,
} from "@mantine/core";
import {
  IconDatabase,
  IconWifi,
  IconWifiOff,
  IconCloudCheck,
  IconCloudOff,
  IconDownload,
  IconUpload,
  IconPlug,
  IconPlugConnected,
  IconClock,
  IconBriefcase,
  IconCurrencyDollar,
  IconCalendar,
  IconSettings,
  IconUser,
  IconChecklist,
} from "@tabler/icons-react";

type TableStats = {
  tableName: string;
  count: number;
};

type AppModuleStats = {
  name: string;
  icon: React.ReactNode;
  color: string;
  tables: string[];
  totalRows: number;
  stats: TableStats[];
};

// TODO: Check if AI implementation is correct
export function DatabaseMenu({ isNavbar = true }: { isNavbar?: boolean }) {
  const { online } = useNetwork();
  const { getLocalizedText, formatDate } = useIntl();

  // Tap into hasSynced
  const [syncStatus, setSyncStatus] = useState(db.currentStatus || {});
  const [storageStats, setStorageStats] = useState<AppModuleStats[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Define table groups by app module
  const appModules = useMemo<Omit<AppModuleStats, "totalRows" | "stats">[]>(
    () => [
      {
        name: getLocalizedText("Work", "Work"),
        icon: <IconBriefcase size={16} />,
        color: "blue",
        tables: [
          "work_project",
          "work_project_tag",
          "work_folder",
          "work_time_entry",
        ],
      },
      {
        name: getLocalizedText("Finance", "Finance"),
        icon: <IconCurrencyDollar size={16} />,
        color: "green",
        tables: [
          "bank_account",
          "tag",
          "contact",
          "finance_project",
          "finance_project_adjustment",
          "finance_project_tag",
          "recurring_cashflow",
          "recurring_cashflow_tag",
          "single_cashflow",
          "single_cashflow_tag",
          "payout",
        ],
      },
      {
        name: getLocalizedText("Calendar", "Calendar"),
        icon: <IconCalendar size={16} />,
        color: "orange",
        tables: ["appointment"],
      },
      {
        name: getLocalizedText("Habit Tracker", "Habit Tracker"),
        icon: <IconChecklist size={16} />,
        color: "violet",
        tables: [],
      },
      {
        name: getLocalizedText("Settings", "Settings"),
        icon: <IconSettings size={16} />,
        color: "gray",
        tables: ["settings"],
      },
      {
        name: getLocalizedText("Profile", "Profile"),
        icon: <IconUser size={16} />,
        color: "cyan",
        tables: ["profiles"],
      },
    ],
    [getLocalizedText]
  );

  // Fetch storage statistics
  useEffect(() => {
    const fetchStorageStats = async () => {
      setIsLoadingStats(true);
      try {
        const statsPromises = appModules.map(async (module) => {
          const tableStats: TableStats[] = [];
          let totalRows = 0;

          for (const tableName of module.tables) {
            try {
              const result = await db.getAll<{ count: number }>(
                `SELECT COUNT(*) as count FROM ${tableName}`
              );
              const count = result[0]?.count ?? 0;
              tableStats.push({ tableName, count });
              totalRows += count;
            } catch (error) {
              console.warn(
                `Failed to get count for table ${tableName}:`,
                error
              );
              tableStats.push({ tableName, count: 0 });
            }
          }

          return {
            ...module,
            totalRows,
            stats: tableStats,
          };
        });

        const results = await Promise.all(statsPromises);
        setStorageStats(results);
      } catch (error) {
        console.error("Failed to fetch storage stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStorageStats();
  }, [appModules]); // Fetch when appModules changes

  useEffect(() => {
    return db.registerListener({
      statusChanged: (status) => {
        setSyncStatus(status);
      },
    });
  }, []);

  // Calculate time since last sync
  const timeSinceLastSync = useMemo(() => {
    if (!syncStatus?.lastSyncedAt) return null;
    const now = new Date().getTime();
    const lastSync = new Date(syncStatus.lastSyncedAt).getTime();
    const diff = now - lastSync;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  }, [syncStatus?.lastSyncedAt]);

  // Get download/upload progress
  // Note: Progress properties may vary based on PowerSync version
  const downloadProgress = useMemo(() => {
    if (!syncStatus?.downloadProgress) return null;

    const progress = syncStatus.downloadProgress;
    if (
      typeof progress === "object" &&
      progress !== null &&
      "bytesRemaining" in progress &&
      "totalBytes" in progress
    ) {
      const bytesRemaining =
        typeof progress.bytesRemaining === "number"
          ? progress.bytesRemaining
          : 0;
      const totalBytes =
        typeof progress.totalBytes === "number" ? progress.totalBytes : 0;

      if (totalBytes > 0) {
        return Math.max(
          0,
          Math.min(100, ((totalBytes - bytesRemaining) / totalBytes) * 100)
        );
      }
    }
    return null;
  }, [syncStatus?.downloadProgress]);

  const uploadProgress = null; // Upload progress may not be available in current PowerSync version

  const isSynced = syncStatus?.hasSynced ?? false;
  const isConnected = syncStatus?.connected ?? false;
  const isConnecting = syncStatus?.connecting ?? false;
  const isDownloading = syncStatus?.dataFlowStatus?.downloading ?? false;
  const isUploading = syncStatus?.dataFlowStatus?.uploading ?? false;

  // Overall status color
  const statusColor = useMemo(() => {
    if (!online) return "red";
    if (isConnecting) return "yellow";
    if (isConnected && isSynced) return "teal";
    if (isConnected) return "blue";
    return "gray";
  }, [online, isConnected, isSynced, isConnecting]);

  // Calculate total rows
  const totalRows = useMemo(
    () => storageStats.reduce((sum, module) => sum + module.totalRows, 0),
    [storageStats]
  );

  return (
    <Menu
      shadow="lg"
      width={420}
      position={isNavbar ? "right" : "bottom"}
      transitionProps={{
        transition: isNavbar ? "fade-right" : "fade-down",
        duration: 200,
      }}
      withArrow
    >
      <Menu.Target>
        <Indicator
          offset={10}
          position="top-end"
          color={statusColor}
          size={12}
          withBorder
        >
          <Button variant="transparent" style={{ padding: "0 8px" }}>
            <IconDatabase size={20} />
          </Button>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown p={0}>
        <Box p="md">
          {/* Header */}
          <Group gap="md" wrap="nowrap" mb="md">
            <ThemeIcon
              size={40}
              radius="md"
              variant="light"
              color={statusColor}
            >
              <IconDatabase size={24} />
            </ThemeIcon>
            <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
              <Text size="lg" fw={700}>
                {getLocalizedText("Datenbank Status", "Database Status")}
              </Text>
              <Group gap="xs">
                <Badge
                  size="sm"
                  color={online ? "teal" : "red"}
                  leftSection={
                    online ? <IconWifi size={12} /> : <IconWifiOff size={12} />
                  }
                  variant="light"
                >
                  {online
                    ? getLocalizedText("Online", "Online")
                    : getLocalizedText("Offline", "Offline")}
                </Badge>
                <Badge
                  size="sm"
                  color={statusColor}
                  leftSection={
                    isConnected ? (
                      <IconPlugConnected size={12} />
                    ) : (
                      <IconPlug size={12} />
                    )
                  }
                  variant="light"
                >
                  {isConnecting
                    ? getLocalizedText("Verbinde...", "Connecting...")
                    : isConnected
                      ? getLocalizedText("Verbunden", "Connected")
                      : getLocalizedText("Getrennt", "Disconnected")}
                </Badge>
              </Group>
            </Stack>
          </Group>

          <Divider mb="md" />

          {/* Sync Status Card */}
          <Card withBorder radius="md" p="sm" mb="md">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <ThemeIcon
                    size={24}
                    radius="md"
                    variant="light"
                    color={isSynced ? "teal" : "gray"}
                  >
                    {isSynced ? (
                      <IconCloudCheck size={16} />
                    ) : (
                      <IconCloudOff size={16} />
                    )}
                  </ThemeIcon>
                  <Text size="sm" fw={600}>
                    {getLocalizedText("Synchronisation", "Synchronization")}
                  </Text>
                </Group>
                <Badge
                  color={isSynced ? "teal" : "gray"}
                  variant={isSynced ? "light" : "dot"}
                >
                  {isSynced
                    ? getLocalizedText("Synchronisiert", "Synchronized")
                    : getLocalizedText("Ausstehend", "Pending")}
                </Badge>
              </Group>

              {syncStatus?.lastSyncedAt && (
                <Group gap="xs" mt="xs">
                  <IconClock size={14} style={{ opacity: 0.7 }} />
                  <Text size="xs" c="dimmed">
                    {getLocalizedText("Letzte Sync:", "Last sync:")}{" "}
                    {formatDate(new Date(syncStatus.lastSyncedAt))}
                    {timeSinceLastSync && (
                      <Text component="span" c="dimmed" ml={4}>
                        ({getLocalizedText("vor", "ago")} {timeSinceLastSync})
                      </Text>
                    )}
                  </Text>
                </Group>
              )}
            </Stack>
          </Card>

          {/* Data Flow Status */}
          {(isDownloading ||
            isUploading ||
            downloadProgress ||
            uploadProgress) && (
            <Card withBorder radius="md" p="sm" mb="md">
              <Stack gap="sm">
                <Text size="sm" fw={600} mb="xs">
                  {getLocalizedText("Datenübertragung", "Data Transfer")}
                </Text>

                {isDownloading && (
                  <Box>
                    <Group justify="space-between" mb={4}>
                      <Group gap="xs">
                        <IconDownload size={16} />
                        <Text size="xs" fw={500}>
                          {getLocalizedText("Herunterladen", "Downloading")}
                        </Text>
                      </Group>
                      {downloadProgress !== null && (
                        <Text size="xs" c="dimmed">
                          {Math.round(downloadProgress)}%
                        </Text>
                      )}
                    </Group>
                    {downloadProgress !== null ? (
                      <Progress
                        value={downloadProgress}
                        color="blue"
                        size="sm"
                        radius="xl"
                        animated
                      />
                    ) : (
                      <Progress
                        value={100}
                        color="blue"
                        size="sm"
                        radius="xl"
                        animated
                        striped
                      />
                    )}
                  </Box>
                )}

                {isUploading && (
                  <Box>
                    <Group justify="space-between" mb={4}>
                      <Group gap="xs">
                        <IconUpload size={16} />
                        <Text size="xs" fw={500}>
                          {getLocalizedText("Hochladen", "Uploading")}
                        </Text>
                      </Group>
                      {uploadProgress !== null && (
                        <Text size="xs" c="dimmed">
                          {Math.round(uploadProgress)}%
                        </Text>
                      )}
                    </Group>
                    {uploadProgress !== null ? (
                      <Progress
                        value={uploadProgress}
                        color="green"
                        size="sm"
                        radius="xl"
                        animated
                      />
                    ) : (
                      <Progress
                        value={100}
                        color="green"
                        size="sm"
                        radius="xl"
                        animated
                        striped
                      />
                    )}
                  </Box>
                )}
              </Stack>
            </Card>
          )}

          {/* Storage Statistics */}
          <Card withBorder radius="md" p="sm" mb="md">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text size="sm" fw={600}>
                  {getLocalizedText("Speichergröße", "Storage Size")}
                </Text>
                {isLoadingStats ? (
                  <Loader size="xs" />
                ) : (
                  <Badge size="sm" variant="light" color="blue">
                    {totalRows.toLocaleString()}{" "}
                    {getLocalizedText("Einträge", "Entries")}
                  </Badge>
                )}
              </Group>

              {isLoadingStats ? (
                <Box py="md">
                  <Loader size="sm" />
                </Box>
              ) : (
                <Stack gap="xs">
                  {storageStats
                    .filter((module) => module.totalRows > 0)
                    .map((module) => (
                      <Box key={module.name}>
                        <Group justify="space-between" mb={4}>
                          <Group gap="xs">
                            <ThemeIcon
                              size={20}
                              radius="sm"
                              variant="light"
                              color={module.color}
                            >
                              {module.icon}
                            </ThemeIcon>
                            <Text size="xs" fw={500}>
                              {module.name}
                            </Text>
                          </Group>
                          <Badge size="xs" variant="light" color={module.color}>
                            {module.totalRows.toLocaleString()}
                          </Badge>
                        </Group>
                        <Progress
                          value={
                            totalRows > 0
                              ? (module.totalRows / totalRows) * 100
                              : 0
                          }
                          color={module.color}
                          size="xs"
                          radius="xl"
                          style={{ opacity: 0.6 }}
                        />
                      </Box>
                    ))}
                  {storageStats.filter((module) => module.totalRows > 0)
                    .length === 0 && (
                    <Text size="xs" c="dimmed" ta="center" py="sm">
                      {getLocalizedText(
                        "Keine Daten vorhanden",
                        "No data available"
                      )}
                    </Text>
                  )}
                </Stack>
              )}
            </Stack>
          </Card>

          {/* Connection Details */}
          <Card withBorder radius="md" p="sm">
            <Stack gap="xs">
              <Text size="sm" fw={600} mb="xs">
                {getLocalizedText("Verbindungsdetails", "Connection Details")}
              </Text>

              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {getLocalizedText("Status", "Status")}
                </Text>
                <Badge
                  size="xs"
                  color={isConnecting ? "yellow" : isConnected ? "teal" : "red"}
                  variant="light"
                >
                  {isConnecting
                    ? getLocalizedText("Verbinde...", "Connecting...")
                    : isConnected
                      ? getLocalizedText("Aktiv", "Active")
                      : getLocalizedText("Inaktiv", "Inactive")}
                </Badge>
              </Group>

              {syncStatus?.clientImplementation && (
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    {getLocalizedText("Client", "Client")}
                  </Text>
                  <Text size="xs" fw={500}>
                    {syncStatus.clientImplementation}
                  </Text>
                </Group>
              )}
            </Stack>
          </Card>
        </Box>
      </Menu.Dropdown>
    </Menu>
  );
}
