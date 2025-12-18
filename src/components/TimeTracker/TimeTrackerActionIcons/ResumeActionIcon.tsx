import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";

interface ResumeActionIconProps extends ActionIconProps {
  resumeTimer: () => void;
}

export default function ResumeActionIcon({
  resumeTimer,
  ...props
}: ResumeActionIconProps) {
  return (
    <ActionIcon onClick={resumeTimer} size="md" color="blue" {...props}>
      <IconPlayerPlay />
    </ActionIcon>
  );
}
