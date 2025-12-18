import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconPlayerPause } from "@tabler/icons-react";

interface PauseActionIconProps extends ActionIconProps {
  pauseTimer: () => void;
}

export default function PauseActionIcon({
  pauseTimer,
  ...props
}: PauseActionIconProps) {
  return (
    <ActionIcon onClick={pauseTimer} size="md" color="yellow" {...props}>
      <IconPlayerPause />
    </ActionIcon>
  );
}
