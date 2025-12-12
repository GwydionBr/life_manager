import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface PlusActionIconProps extends ActionIconProps {
  onClick: () => void;
  tooltipLabel?: string | React.ReactNode;
  iconSize?: number;
  iconColor?: string;
}

export default function PlusActionIcon({
  onClick,
  tooltipLabel,
  iconSize,
  iconColor,
  ...props
}: PlusActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon onClick={onClick} size="md" variant="subtle" {...props}>
        <IconPlus size={iconSize} color={iconColor} />
      </ActionIcon>
    </DelayedTooltip>
  );
}
