import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";
import { useMemo } from "react";

import {
  alpha,
  getThemeColor,
  Group,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconCurrencyDollar } from "@tabler/icons-react";

export default function FinanceHeader() {
  const { getLocalizedText } = useIntl();
  const { financeColor, primaryColor } = useSettingsStore();
  const theme = useMantineTheme();

  const backgroundColor = useMemo(() => {
    const fromColor = getThemeColor(primaryColor, theme);
    const toColor = getThemeColor(financeColor, theme);
    return `linear-gradient(135deg, ${alpha(fromColor, 0.4)} 0%, ${alpha(toColor, 0.4)} 100%)`;
  }, [primaryColor, financeColor, theme]);

  return (
    <Group h="100%" w="100%" bg={backgroundColor}>
      <Group align="center" gap={0} w={250} justify="center">
        <ThemeIcon
          color="var(--mantine-color-text)"
          size="xl"
          variant="transparent"
        >
          <IconCurrencyDollar />
        </ThemeIcon>
        <Title order={2} c="var(--mantine-color-text)">
          {getLocalizedText("Finanzen", "Finance")}
        </Title>
      </Group>
    </Group>
  );
}
