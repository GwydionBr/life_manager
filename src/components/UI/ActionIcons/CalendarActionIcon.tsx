import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconCalendarTime } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface CalendarActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
}

export default function CalendarActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  ...props
}: CalendarActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon onClick={onClick} size="md" variant="light" {...props}>
        <IconCalendarTime size={iconSize} color={iconColor} strokeWidth={1.5}/>
      </ActionIcon>
    </DelayedTooltip>
  );
}
