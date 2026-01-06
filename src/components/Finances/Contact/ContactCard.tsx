import { Group, Stack, Text } from "@mantine/core";
import { Tables } from "@/types/db.types";
import { useIntl } from "@/hooks/useIntl";

interface ContactCardProps {
  contact: Tables<"contact">;
  ref?: React.RefObject<HTMLDivElement>;
}

export default function ContactCard({ contact, ref }: ContactCardProps) {
  const { getCurrencySymbol } = useIntl();
  return (
    <Stack gap="xs" w="100%" ref={ref}>
      <Group>
        <Text fz="sm" fw={500}>
          {contact.name}
        </Text>
        {contact.currency && (
          <Text fz="xs" c="dimmed">
            {getCurrencySymbol(contact.currency)}
          </Text>
        )}
      </Group>
      {contact.description && (
        <Text fz="xs" c="dimmed">
          {contact.description}
        </Text>
      )}
      {contact.email && (
        <Text fz="xs" c="dimmed">
          {contact.email}
        </Text>
      )}
      {contact.phone && (
        <Text fz="xs" c="dimmed">
          {contact.phone}
        </Text>
      )}
      {contact.address && (
        <Text fz="xs" c="dimmed">
          {contact.address}
        </Text>
      )}
    </Stack>
  );
}
