import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface InfoActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
}

export default function InfoActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  ...props
}: InfoActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon variant="transparent" onClick={onClick} size="md" {...props}>
          <IconInfoCircle size={iconSize} color={iconColor} strokeWidth={1.5}/>  
      </ActionIcon>
    </DelayedTooltip>
  );
}
