import { useIntl } from "@/hooks/useIntl";

import { Box, Stack, Text } from "@mantine/core";

export default function NewSessionEvent({
  start,
  y,
  yToTime,
}: {
  start: number;
  y: number;
  yToTime: (y: number) => Date;
}) {
  const { formatTimeSpan, getLocalizedText } = useIntl();
  const actualStart = Math.min(start, y);
  const actualEnd = Math.max(start, y);
  const isStartDynamic = start > y;

  return (
    <Box>
      <Stack
        justify={isStartDynamic ? "flex-start" : "flex-end"}
        style={{
          position: "absolute",
          top: actualStart,
          height: actualEnd - actualStart,
          left: 0,
          right: 0,
          background:
            "light-dark(var(--mantine-color-teal-6), var(--mantine-color-teal-8))",
          borderTop: "3px solid var(--mantine-color-teal-6)",
          zIndex: 12,
        }}
      >
        {!isStartDynamic ? (
          <Text ta="center">
            {getLocalizedText("Zeitraum auswählen", "Select timespan")}
          </Text>
        ) : null}
        <Text ta="center" fw={600}>
          {formatTimeSpan(yToTime(actualStart), yToTime(actualEnd))}
        </Text>
        {isStartDynamic ? (
          <Text ta="center">
            {getLocalizedText("Zeitraum auswählen", "Select timespan")}
          </Text>
        ) : null}
      </Stack>
    </Box>
  );
}
