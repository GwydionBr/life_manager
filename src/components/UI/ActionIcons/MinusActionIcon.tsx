import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconMinus } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface MinusActionIconProps extends ActionIconProps {
  onClick: () => void;
  tooltipLabel?: string;
  iconSize?: number;
  iconColor?: string;
}

export default function MinusActionIcon({
  onClick,
  tooltipLabel,
  iconSize,
  iconColor,
  ...props
}: MinusActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon onClick={onClick} size="md" variant="subtle" {...props}>
        <IconMinus size={iconSize} color={iconColor} strokeWidth={1.5}/>
      </ActionIcon>
    </DelayedTooltip>
  );
}
