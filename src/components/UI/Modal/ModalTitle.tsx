import { Group, ModalTitleProps, Text } from "@mantine/core";
import { ThemeIcon } from "@mantine/core";

interface NewModalTitleProps extends ModalTitleProps {
  icon: React.ReactNode;
  title: string;
}

export default function ModalTitle({ icon, title }: NewModalTitleProps) {
  return (
    <Group>
      <ThemeIcon variant="transparent">{icon}</ThemeIcon>
      <Text fw={600}>{title}</Text>
    </Group>
  );
}
