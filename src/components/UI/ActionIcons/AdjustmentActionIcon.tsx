import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconAdjustments } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface AdjustmentActionIconProps extends ActionIconProps {
  onClick: () => void;
  tooltipLabel?: string;
  iconSize?: number;
  iconColor?: string;
}

export default function AdjustmentActionIcon({
  onClick,
  tooltipLabel,
  iconSize,
  iconColor,
  ...props
}: AdjustmentActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon onClick={onClick} size="md" variant="subtle" {...props}>
        <IconAdjustments size={iconSize} color={iconColor} strokeWidth={1.5}/>
      </ActionIcon>
    </DelayedTooltip>
  );
}
