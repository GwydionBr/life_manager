import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface CancelActionIconProps extends ActionIconProps {
  cancelTimer: () => void;
}

export default function CancelActionIcon({
  cancelTimer,
  ...props
}: CancelActionIconProps) {
  return (
    <ActionIcon onClick={cancelTimer} size="md" color="gray" {...props}>
      <IconX />
    </ActionIcon>
  );
}
