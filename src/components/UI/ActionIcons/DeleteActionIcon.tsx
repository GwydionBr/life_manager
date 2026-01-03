import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface DeleteActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
}

export default function DeleteActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  ...props
}: DeleteActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon
        onClick={onClick}
        color="red"
        size="md"
        variant="transparent"
        {...props}
      >
        <IconTrash size={iconSize} color={iconColor} strokeWidth={1.5}/>
      </ActionIcon>
    </DelayedTooltip>
  );
}
