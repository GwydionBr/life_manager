import { Group, GroupProps } from "@mantine/core";

interface HeaderLayoutProps extends GroupProps {
  backgroundColor?: string;
  leftHeader?: React.ReactNode;
  rightHeader?: React.ReactNode;
  centerHeader?: React.ReactNode;
}

export default function HeaderLayout({
  backgroundColor,
  leftHeader,
  rightHeader,
  centerHeader,
  ...props
}: HeaderLayoutProps) {
  return (
    <Group
      h="100%"
      bg={backgroundColor}
      w="100%"
      wrap="nowrap"
      justify="space-between"
      {...props}
    >
      {leftHeader}
      {centerHeader}
      {rightHeader}
    </Group>
  );
}
