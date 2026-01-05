import { useDisclosure, useHover } from "@mantine/hooks";

import { Badge, Popover } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import FinanceClientCard from "@/components/Finances/Contact/ContactCard";

import { Tables } from "@/types/db.types";

interface FinanceClientBadgeProps {
  client: Tables<"finance_client">;
}

export default function FinanceClientBadge({
  client,
}: FinanceClientBadgeProps) {
  const [
    isClientPopoverOpen,
    { open: openClientPopover, close: closeClientPopover },
  ] = useDisclosure(false);
  const { hovered, ref } = useHover();

  return (
    <Popover
      onDismiss={closeClientPopover}
      opened={isClientPopoverOpen}
      onClose={closeClientPopover}
    >
      <Popover.Target>
        <Badge
          ref={ref}
          onClick={(e) => {
            e.stopPropagation();
            openClientPopover();
          }}
          color="blue"
          variant="light"
          leftSection={<IconUser size={12} />}
          style={{
            cursor: "pointer",
            border: hovered
              ? "1px solid var(--mantine-color-blue-5)"
              : "1px solid transparent",
          }}
        >
          {client.name}
        </Badge>
      </Popover.Target>
      <Popover.Dropdown>
        <FinanceClientCard client={client} />
      </Popover.Dropdown>
    </Popover>
  );
}
