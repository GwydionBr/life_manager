import { useHover } from "@mantine/hooks";

import { Tables } from "@/types/db.types";
import { Badge, BadgeProps } from "@mantine/core";
import { IconUser, IconUserPlus } from "@tabler/icons-react";

interface ContactSingleBadgeProps extends BadgeProps {
  contact?: Tables<"contact">;
}

export default function ContactSingleBadge({
  contact,
  ...props
}: ContactSingleBadgeProps) {
  const { hovered, ref } = useHover();

  if (!contact) {
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
      {contact.name}
    </Badge>
  );
}
