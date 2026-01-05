import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface ExternalLinkActionIconProps extends ActionIconProps {
  onClick: () => void;
  tooltipLabel?: string;
  iconSize?: number;
  iconColor?: string;
}

export default function ExternalLinkActionIcon({
  onClick,
  tooltipLabel,
  iconSize,
  iconColor,
  ...props
}: ExternalLinkActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon onClick={onClick} size="md" variant="subtle" {...props}>
        <IconExternalLink size={iconSize} color={iconColor} strokeWidth={1.5} />
      </ActionIcon>
    </DelayedTooltip>
  );
}
