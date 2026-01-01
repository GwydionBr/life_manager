import { useIntl } from "@/hooks/useIntl";

import {
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Divider,
  ThemeIcon,
  Box,
} from "@mantine/core";
import {
  IconClock,
  IconClipboardList,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowRight,
} from "@tabler/icons-react";

import { Payout } from "@/types/finance.types";

interface PayoutRowCardProps {
  payout: Payout;
}

export default function PayoutRowCard({ payout }: PayoutRowCardProps) {
  const { getLocalizedText, formatDate, formatMoney } = useIntl();

  const getTotalSessionTime = () => {
    if (!payout.timer_sessions || payout.timer_sessions.length === 0)
      return null;

    const totalSeconds = payout.timer_sessions.reduce((acc, session) => {
      return acc + (session.active_seconds || 0);
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
  };

  const hasCurrencyConversion =
    payout.start_currency && payout.currency !== payout.start_currency;
  const hasValueChange =
    payout.start_value !== null && payout.start_value !== payout.value;
  const showExtendedInfo = hasCurrencyConversion || hasValueChange;
  const totalSessions = payout.timer_sessions?.length || 0;
  const totalTime = getTotalSessionTime();

  return (
    <Card
      withBorder
      radius="md"
      p="lg"
      shadow="sm"
      w="100%"
      bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))"
      style={{ transition: "all 0.2s ease" }}
    >
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Box style={{ flex: 1 }}>
            <Text size="lg" fw={600}>
              {payout.title}
            </Text>
            <Text size="sm" c="dimmed">
              {formatDate(new Date(payout.created_at))}
            </Text>
          </Box>

          <Group gap="xs">
            {totalSessions > 0 && totalTime && (
              <Group>
                <Badge
                  color="blue"
                  variant="light"
                  leftSection={<IconClock size={12} />}
                >
                  {totalSessions} Session{totalSessions !== 1 ? "s" : ""}
                </Badge>
                <Badge
                  color="orange"
                  variant="transparent"
                  leftSection={<IconClock size={12} />}
                >
                  {totalTime}
                </Badge>
              </Group>
            )}
            {totalSessions === 0 && !payout.timer_project && (
              <Badge
                color="red"
                variant="transparent"
                leftSection={<IconClock size={12} />}
              >
                {getLocalizedText(
                  "Keine bestehenden Sitzungen",
                  "No existing sessions"
                )}
              </Badge>
            )}
            {payout.timer_project && (
              <Group gap="xs" align="center">
                <Badge
                  color="violet"
                  variant="transparent"
                  leftSection={<IconClipboardList size={12} />}
                >
                  {payout.timer_project.title}
                </Badge>
              </Group>
            )}
          </Group>
        </Group>

        <Divider />

        {/* Financial Information */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Text size="sm" c="dimmed" fw={500}>
              {getLocalizedText("Auszahlungsbetrag", "Payout Amount")}
            </Text>
            <Group gap="xs" align="center">
              <Text size="lg" fw={700} c="green">
                {formatMoney(
                  payout.start_value ?? payout.value,
                  payout.start_currency ?? payout.currency,
                )}
              </Text>
            </Group>
          </Stack>

          {showExtendedInfo && (
            <>
              <ThemeIcon size="md" color="blue" variant="transparent">
                <IconArrowRight size={20} />
              </ThemeIcon>
              <Stack gap="xs" align="center">
                <Text size="sm" c="dimmed" fw={500}>
                  {hasCurrencyConversion
                    ? getLocalizedText("Nach Konvertierung", "After Conversion")
                    : getLocalizedText("Nach Anpassung", "After Adjustment")}
                </Text>
                <Group gap="xs" align="center">
                  <Text size="lg" fw={700} c="blue">
                    {formatMoney(payout.value!, payout.currency!)}
                  </Text>
                </Group>
              </Stack>
            </>
          )}
        </Group>

        {/* Conversion Rate or Value Difference (if applicable) */}
        {showExtendedInfo && (
          <Card
            p="sm"
            withBorder
            radius="md"
            shadow="sm"
            bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))"
          >
            <Group gap="xs" align="center">
              <ThemeIcon size="sm" color="blue" variant="light">
                {payout.value! > payout.start_value! ? (
                  <IconTrendingUp size={14} />
                ) : (
                  <IconTrendingDown size={14} />
                )}
              </ThemeIcon>
              {hasCurrencyConversion ? (
                <Text size="sm" c="blue" fw={500}>
                  {getLocalizedText("Konvertierungsrate", "Conversion Rate")}: 1{" "}
                  {payout.start_currency} ={" "}
                  {(payout.value! / payout.start_value!).toFixed(4)}{" "}
                  {payout.currency}
                </Text>
              ) : (
                <Group gap="xs" align="center">
                  <Text size="sm" c="blue" fw={500}>
                    {getLocalizedText("Differenz", "Difference")}:{" "}
                    {formatMoney(
                      payout.value! - payout.start_value!,
                      payout.currency!,
                    )}{" "}
                    (
                    {((payout.value! / payout.start_value! - 1) * 100).toFixed(
                      2
                    )}
                    %)
                  </Text>
                </Group>
              )}
            </Group>
          </Card>
        )}
      </Stack>
    </Card>
  );
}
