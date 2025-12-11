/**
 * Example component showing how to use the new Intl system.
 * This demonstrates the various formatting functions available.
 */
import { useIntl } from "@/hooks/useIntl";
import { useUpdateSettings } from "@/queries/settings/use-update-settings";
import { Stack, Text, Button, Group, Select } from "@mantine/core";
import { Locale } from "@/types/settings.types";

export function IntlExample() {
  const intl = useIntl();
  const updateSettings = useUpdateSettings();

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);
  const lastWeek = new Date(now.getTime() - 7 * 86400000);

  const locales: { value: Locale; label: string }[] = [
    { value: "en-US", label: "English (US)" },
    { value: "de-DE", label: "Deutsch" },
  ];

  const handleLocaleChange = (locale: Locale | null) => {
    if (locale) {
      updateSettings.mutate({ locale });
    }
  };

  const handleToggle24h = () => {
    updateSettings.mutate({ format_24h: !intl.format24h });
  };

  return (
    <Stack gap="md">
      <Text size="xl" fw={700}>
        Internationalization Examples
      </Text>

      {/* Settings Controls */}
      <Group>
        <Select
          label="Locale"
          data={locales}
          value={intl.locale}
          onChange={handleLocaleChange}
          w={200}
        />
        <Button onClick={handleToggle24h} variant="outline">
          {intl.format24h ? "Switch to 12h" : "Switch to 24h"}
        </Button>
      </Group>

      {/* Date & Time Examples */}
      <Stack gap="xs">
        <Text fw={600}>Date & Time:</Text>
        <Text>Current date: {intl.formatDate(now)}</Text>
        <Text>Current time: {intl.formatDateTime(now)}</Text>
        <Text>Time span: {intl.formatTimeSpan(now, tomorrow)}</Text>
        <Text>Date range: {intl.formatDateRange(now, tomorrow)}</Text>
        <Text>Relative: {intl.formatRelativeTime(lastWeek)}</Text>
        <Text>Month: {intl.formatMonth(12)}</Text>
        <Text>Weekday: {intl.getWeekdayName(1)}</Text>
      </Stack>

      {/* Money Examples */}
      <Stack gap="xs">
        <Text fw={600}>Money (using EUR: ):</Text>
        <Text>Amount: {intl.formatMoney(1234.56, "EUR")}</Text>
        <Text>Symbol: {intl.getCurrencySymbol("EUR")}</Text>
        <Text>EUR: {intl.formatMoney(9999.99, "EUR")}</Text>
        <Text>Finance: {intl.formatFinanceMoney(5000, "EUR")}</Text>
      </Stack>

      {/* Number Examples */}
      <Stack gap="xs">
        <Text fw={600}>Numbers:</Text>
        <Text>Number: {intl.formatNumber(1234567.89)}</Text>
        <Text>Percent: {intl.formatPercent(0.1234)}</Text>
      </Stack>

      {/* Duration Example */}
      <Stack gap="xs">
        <Text fw={600}>Duration:</Text>
        <Text>3665 seconds = {intl.formatDuration(3665)}</Text>
      </Stack>
    </Stack>
  );
}
