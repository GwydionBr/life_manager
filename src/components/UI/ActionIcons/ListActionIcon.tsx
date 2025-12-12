import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconList } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface ListActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
}

export default function ListActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  ...props
}: ListActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon variant="light" onClick={onClick} size="md" {...props}>
          <IconList size={iconSize} color={iconColor} />
      </ActionIcon>
    </DelayedTooltip>
  );
}
