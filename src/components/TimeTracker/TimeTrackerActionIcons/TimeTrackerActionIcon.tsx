import { ActionIcon, ActionIconProps, Indicator, Tooltip } from "@mantine/core";
import { IconStopwatch } from "@tabler/icons-react";
import { TimerState } from "@/types/timeTracker.types";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface TimeTrackerActionIconProps extends ActionIconProps {
  action: () => void;
  indicatorLabel?: string;
  label: string;
  state: TimerState;
  getStatusColor: () => string;
}

export default function TimeTrackerActionIcon({
  action,
  indicatorLabel,
  label,
  state,
  getStatusColor,
  ...props
}: TimeTrackerActionIconProps) {
  return (
    <DelayedTooltip label={label}>
      <Indicator
        label={indicatorLabel}
        color="red"
        size={16}
        processing={state === "running"}
        disabled={state === "stopped"}
      >
        <ActionIcon onClick={action} size="md" color={getStatusColor()}>
          <IconStopwatch />
        </ActionIcon>
      </Indicator>
    </DelayedTooltip>
  );
}
