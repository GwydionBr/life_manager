import { Text, Card, Group, Divider } from "@mantine/core";

interface SettingsRowProps {
  title?: string;
  children?: React.ReactNode;
}

export default function SettingsRow({ title, children }: SettingsRowProps) {
  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-9))"
      p={0}
      h="100%"
    >
      <Group align="center" h="100%">
        <Group h="100%" w={150} p="md" justify="center">
          <Text ta="center">{title ?? ""}</Text>
        </Group>
        <Divider
          orientation="vertical"
          my="sm"
          color="light-dark(var(--mantine-color-dark-6), var(--mantine-color-blue-2))"
        />
        <Group ml="md" p="md" h="100%">
          {children}
        </Group>
      </Group>
    </Card>
  );
}
