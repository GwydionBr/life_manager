import { Paper, PaperProps, Grid, Divider, Group } from "@mantine/core";

interface TimeTrackerRowProps extends PaperProps {
  icon: React.ReactNode;
  children?: React.ReactNode;
}

export default function TimeTrackerRow({
  icon,
  children,
  ...props
}: TimeTrackerRowProps) {
  return (
    <Paper w={200} radius="xl" withBorder {...props}>
      <Grid align="center" gutter={0} columns={10}>
        <Grid.Col span={2}>
          <Group wrap="nowrap" w="100%" gap="0">
            {icon}
            <Divider orientation="vertical" h={50} />
          </Group>
        </Grid.Col>
        <Grid.Col span={8}>{children}</Grid.Col>
      </Grid>
    </Paper>
  );
}
