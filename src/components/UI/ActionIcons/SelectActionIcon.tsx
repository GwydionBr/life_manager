import { ActionIcon, ActionIconProps } from "@mantine/core";
import {
  IconSquareRounded,
  IconSquareRoundedCheck,
  IconListDetails,
  IconSquareRoundedMinusFilled,
} from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface SelectActionIconProps extends ActionIconProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
  mainControl?: boolean;
  selected?: boolean;
  partiallySelected?: boolean;
}

export default function SelectActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  mainControl,
  selected,
  partiallySelected,
  ...props
}: SelectActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon
        onClick={onClick}
        size="md"
        variant="transparent"
        color={selected ? "blue" : undefined}
        {...props}
      >
        {mainControl ? (
          <IconListDetails
            size={iconSize}
            color={iconColor}
            fill={selected ? "currentColor" : "none"}
          />
        ) : selected ? (
          <IconSquareRoundedCheck size={iconSize} color={iconColor} />
        ) : partiallySelected ? (
          <IconSquareRoundedMinusFilled size={iconSize} color={iconColor} />
        ) : (
          <IconSquareRounded size={iconSize} color={iconColor} />
        )}
      </ActionIcon>
    </DelayedTooltip>
  );
}
