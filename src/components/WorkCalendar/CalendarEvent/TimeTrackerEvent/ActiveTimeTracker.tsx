import { Box, Group, Stack, Text, Indicator } from "@mantine/core";
import { useIntl } from "@/hooks/useIntl";
import { TimerData } from "@/stores/timeTrackerManagerStore";

interface ActiveTimeTrackerProps {
  realHeight: number;
  height: number;
  top: number;
  bottom: number;
  activeTimer: TimerData;
  isYesterday: boolean | null;
  color: string;
  backgroundColor: string;
  title: string;
}

export default function ActiveTimeTracker({
  realHeight,
  height,
  top,
  bottom,
  activeTimer,
  isYesterday: _isYesterday,
  color,
  backgroundColor,
  title,
}: ActiveTimeTrackerProps) {
  const { formatDuration } = useIntl();
  return (
    <Box>
      <Box
        h={Math.max(height, title ? 40 : 20)}
        w="100%"
        style={{
          position: "absolute",
          top: bottom - Math.max(height, title ? 40 : 20),
          left: 0,
          right: 0,
          zIndex: 15,
          background:
            "light-dark(var(--mantine-color-white), var(--mantine-color-dark-9))",
        }}
      >
        <Stack
          h={Math.max(height, title ? 40 : 20)}
          w="100%"
          gap={0}
          p={0}
          bg={backgroundColor}
          justify="space-between"
          style={{
            borderTop: `1px solid ${color}`,
            borderLeft: `1px solid ${color}`,
            borderRight: `1px solid ${color}`,
            borderBottom: `3px solid red`,
            borderRadius: 5,
          }}
        >
          <Group justify="center" align="center" px="xs">
            <Indicator size={10} color="red" processing={true} />
            <Text size="xs" ta="center" fw={600}>
              {formatDuration(activeTimer.activeSeconds)}
            </Text>
          </Group>
          {title && (
            <Text size="xs" ta="center" fw={600}>
              {title}
            </Text>
          )}
        </Stack>
      </Box>
      <Box
        style={{
          position: "absolute",
          visibility: realHeight > 2 ? "visible" : "hidden",
          left: 0,
          top: top,
          width: 6,
          height: realHeight,
          background: color,
          borderRadius: 5,
          zIndex: 16,
        }}
      />
    </Box>
  );
}
