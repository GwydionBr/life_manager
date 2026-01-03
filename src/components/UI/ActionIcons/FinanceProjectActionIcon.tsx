import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconMoneybagPlus } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface FinanceProjectActionIconProps extends ActionIconProps {
  onClick: () => void;
  tooltipLabel?: string | React.ReactNode;
  iconSize?: number;
  iconColor?: string;
}

export default function FinanceProjectActionIcon({
  onClick,
  tooltipLabel,
  iconSize,
  iconColor,
  ...props
}: FinanceProjectActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon onClick={onClick} size="md" variant="subtle" {...props}>
        <IconMoneybagPlus size={iconSize} color={iconColor} strokeWidth={1.5}/>
      </ActionIcon>
    </DelayedTooltip>
  );
}
