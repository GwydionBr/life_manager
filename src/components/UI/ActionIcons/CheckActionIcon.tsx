import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface CheckActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconColor?: string;
  iconSize?: number;
  tooltipLabel?: string;
}

export default function CheckActionIcon({
  onClick,
  iconColor,
  iconSize,
  tooltipLabel,
  ...props
}: CheckActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon variant="outline" onClick={onClick} color="green" {...props}>
        <IconCheck
          color={
            iconColor ??
            "light-dark(var(--mantine-color-green-9), var(--mantine-color-green-4))"
          }
          size={iconSize ?? 20}
          strokeWidth={1.5}
        />
      </ActionIcon>
    </DelayedTooltip>
  );
}
