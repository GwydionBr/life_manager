import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface MoreActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
}

export default function MoreActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  ...props
}: MoreActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon variant="transparent" onClick={onClick} size="md" {...props}>
        <IconDots size={iconSize} color={iconColor} strokeWidth={1.5}/>
      </ActionIcon>
    </DelayedTooltip>
  );
}
