import { Group, Stack, Text } from "@mantine/core";
import { Tables } from "@/types/db.types";
import { useIntl } from "@/hooks/useIntl";

interface FinanceClientCardProps {
  client: Tables<"finance_client">;
  ref?: React.RefObject<HTMLDivElement>;
}

export default function FinanceClientCard({
  client,
  ref,
}: FinanceClientCardProps) {
  const { getCurrencySymbol } = useIntl();
  return (
    <Stack gap="xs" w="100%" ref={ref}>
      <Group>
        <Text fz="sm" fw={500}>
          {client.name}
        </Text>
        {client.currency && (
          <Text fz="xs" c="dimmed">
            {getCurrencySymbol(client.currency)}
          </Text>
        )}
      </Group>
      {client.description && (
        <Text fz="xs" c="dimmed">
          {client.description}
        </Text>
      )}
      {client.email && (
        <Text fz="xs" c="dimmed">
          {client.email}
        </Text>
      )}
      {client.phone && (
        <Text fz="xs" c="dimmed">
          {client.phone}
        </Text>
      )}
      {client.address && (
        <Text fz="xs" c="dimmed">
          {client.address}
        </Text>
      )}
    </Stack>
  );
}
