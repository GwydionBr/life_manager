import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconCashBanknotePlus } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface PayoutActionIconProps extends ActionIconProps {
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
  opened?: boolean;
}

export default function PayoutActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  opened,
  ...props
}: PayoutActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon
        variant="transparent"
        onClick={onClick}
        size="md"
        color={opened ? "violet" : "violet"}
        {...props}
      >
        <IconCashBanknotePlus
          size={iconSize}
          color={iconColor}
          fill={opened ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      </ActionIcon>
    </DelayedTooltip>
  );
}
