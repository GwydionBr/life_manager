import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface EditActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
}

export default function EditActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  ...props
}: EditActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon variant="light" onClick={onClick} size="md" {...props}>
        <IconEdit size={iconSize} color={iconColor} strokeWidth={1.5}/>
      </ActionIcon>
    </DelayedTooltip>
  );
}
