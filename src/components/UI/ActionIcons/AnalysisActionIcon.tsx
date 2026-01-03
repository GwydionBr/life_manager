import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconPresentationAnalytics } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface AnalysisActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
}

export default function AnalysisActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  ...props
}: AnalysisActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon onClick={onClick} size="md" variant="light" {...props}>
        <IconPresentationAnalytics size={iconSize} color={iconColor} strokeWidth={1.5}/>
      </ActionIcon>
    </DelayedTooltip>
  );
}
