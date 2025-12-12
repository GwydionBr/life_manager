import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface NextActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
}

export default function NextActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  ...props
}: NextActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon variant="transparent" onClick={onClick} size="md" {...props}>
        <IconChevronRight size={iconSize} color={iconColor} />
      </ActionIcon>
    </DelayedTooltip>
  );
}
