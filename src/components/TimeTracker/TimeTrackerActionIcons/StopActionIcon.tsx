import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconPlayerStop } from "@tabler/icons-react";

interface StopActionIconProps extends ActionIconProps {
  stopTimer: () => void;
}

export default function StopActionIcon({
  stopTimer,
  ...props
}: StopActionIconProps) {
  return (
    <ActionIcon onClick={stopTimer} size="md" color="red" {...props}>
      <IconPlayerStop />
    </ActionIcon>
  );
}
