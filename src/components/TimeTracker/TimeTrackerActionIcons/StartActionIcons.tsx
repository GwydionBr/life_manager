import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";

interface StartActionIconProps extends ActionIconProps {
  startTimer: () => void;
}

export default function StartActionIcon({
  startTimer,
  ...props
}: StartActionIconProps) {
  return (
    <ActionIcon onClick={startTimer} size="md" color="lime" {...props}>
      <IconPlayerPlay />
    </ActionIcon>
  );
}
