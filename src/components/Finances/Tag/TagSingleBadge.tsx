import { useHover } from "@mantine/hooks";

import { Tables } from "@/types/db.types";
import { Badge, BadgeProps } from "@mantine/core";
import { IconTag, IconTagPlus } from "@tabler/icons-react";

interface FinanceTagSingleBadgeProps extends BadgeProps {
  tag?: Tables<"tag">;
}

export default function FinanceTagSingleBadge({
  tag,
  ...props
}: FinanceTagSingleBadgeProps) {
  const { hovered, ref } = useHover();

  if (!tag) {
    return (
      <Badge
        ref={ref}
        color="grape"
        variant="light"
        leftSection={<IconTagPlus size={16} />}
        {...props}
        style={{
          cursor: "pointer",
          border: hovered
            ? "1px solid var(--mantine-color-grape-5)"
            : "1px solid transparent",
          ...props.style,
        }}
      />
    );
  }
  return (
    <Badge
      ref={ref}
      color="grape"
      variant="light"
      leftSection={<IconTag size={12} />}
      {...props}
      style={{
        cursor: "pointer",
        border: hovered
          ? "1px solid var(--mantine-color-grape-5)"
          : "1px solid transparent",
        ...props.style,
      }}
    >
      {tag.title}
    </Badge>
  );
}
