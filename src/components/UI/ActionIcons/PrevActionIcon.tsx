import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface PrevActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
}

export default function PrevActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  ...props
}: PrevActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon variant="transparent" onClick={onClick} size="md" {...props}>
        <IconChevronLeft size={iconSize} color={iconColor} strokeWidth={1.5} />
      </ActionIcon>
    </DelayedTooltip>
  );
}
