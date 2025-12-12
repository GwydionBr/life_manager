import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconCashPlus } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface CashFlowActionIconProps extends ActionIconProps {
  onClick: () => void;
  tooltipLabel?: string | React.ReactNode;
  iconSize?: number;
  iconColor?: string;
}

export default function CashFlowActionIcon({
  onClick,
  tooltipLabel,
  iconSize,
  iconColor,
  ...props
}: CashFlowActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon onClick={onClick} size="md" variant="subtle" {...props}>
        <IconCashPlus size={iconSize} color={iconColor} />
      </ActionIcon>
    </DelayedTooltip>
  );
}
