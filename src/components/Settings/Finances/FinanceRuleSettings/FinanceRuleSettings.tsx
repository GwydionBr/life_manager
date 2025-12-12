import { useIntl } from "@/hooks/useIntl";

import { Text } from "@mantine/core";

export default function FinanceRuleSettings() {
  const { getLocalizedText } = useIntl();
  return (
    <Text size="sm" fw={700}>
      {getLocalizedText("Regeln", "Rules")}
    </Text>
  );
}
