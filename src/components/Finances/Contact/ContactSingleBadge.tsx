import { useHover } from "@mantine/hooks";

import { Tables } from "@/types/db.types";
import { Badge, BadgeProps } from "@mantine/core";
import { IconUser, IconUserPlus } from "@tabler/icons-react";

interface FinanceClientSingleBadgeProps extends BadgeProps {
  client?: Tables<"finance_client">;
}

export default function FinanceClientSingleBadge({
  client,
  ...props
}: FinanceClientSingleBadgeProps) {
  const { hovered, ref } = useHover();

  if (!client) {
    return (
      <Badge
        ref={ref}
        color="blue"
        variant="light"
        leftSection={<IconUserPlus size={16} />}
        {...props}
        style={{
          cursor: "pointer",
          border: hovered
            ? "1px solid var(--mantine-color-blue-5)"
            : "1px solid transparent",
          ...props.style,
        }}
      />
    );
  }
  return (
    <Badge
      ref={ref}
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
  );
}
