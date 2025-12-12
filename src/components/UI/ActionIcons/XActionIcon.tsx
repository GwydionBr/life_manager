import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface XActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconColor?: string;
  iconSize?: number;
  tooltipLabel?: string;
}

export default function XActionIcon({
  onClick,
  iconColor,
  iconSize,
  tooltipLabel,
  ...props
}: XActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon variant="outline" onClick={onClick} color="red" {...props}>
        <IconX
          color={
            iconColor ??
            "light-dark(var(--mantine-color-red-9), var(--mantine-color-red-4))"
          }
          size={iconSize ?? 20}
        />
      </ActionIcon>
    </DelayedTooltip>
  );
}
