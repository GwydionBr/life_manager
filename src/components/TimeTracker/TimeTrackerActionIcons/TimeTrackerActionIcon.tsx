import { ActionIcon, ActionIconProps, Indicator } from "@mantine/core";
import { IconMaximize, IconMinimize } from "@tabler/icons-react";
import { TimerState } from "@/types/timeTracker.types";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface TimeTrackerActionIconProps extends ActionIconProps {
  action: () => void;
  indicatorLabel?: string;
  label: string;
  state: TimerState;
  getStatusColor: () => string;
  minimized?: boolean;
}

export default function TimeTrackerActionIcon({
  action,
  indicatorLabel,
  label,
  state,
  getStatusColor,
  minimized = false,
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
        <ActionIcon
          onClick={action}
          size="md"
          color={getStatusColor()}
          {...props}
        >
          {minimized ? <IconMaximize size={22} /> : <IconMinimize size={22} />}
        </ActionIcon>
      </Indicator>
    </DelayedTooltip>
  );
}
