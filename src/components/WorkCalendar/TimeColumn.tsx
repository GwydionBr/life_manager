import { Box, Stack, Text } from "@mantine/core";
import { useIntl } from "@/hooks/useIntl";

interface TimeColumnProps {
  hourHeight: number;
  hourMultiplier: number;
  currentTime: Date;
  timeToY: (date: Date) => number;
}

export function TimeColumn({
  hourHeight,
  hourMultiplier,
  currentTime,
  timeToY,
}: TimeColumnProps) {
  // Berechne die Anzahl der Zeiteinheiten pro Stunde basierend auf dem Multiplier
  const timeUnitsPerHour = hourMultiplier;

  // Locale aus den Settings lesen
  const { formatDateTime } = useIntl();

  // Berechne die Gesamtanzahl der Zeiteinheiten für 24 Stunden
  const totalTimeUnits = 24 * timeUnitsPerHour;

  // Berechne die Höhe pro Zeiteinheit
  const timeUnitHeight = hourHeight;

  // Funktion zum Formatieren der Zeit basierend auf Locale
  const formatTime = (timeUnitIndex: number) => {
    const totalMinutes = (timeUnitIndex * 60) / timeUnitsPerHour;
    const normalizedTotalMinutes =
      ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const hours = Math.floor(normalizedTotalMinutes / 60);
    const minutes = Math.floor(normalizedTotalMinutes % 60);

    const date = new Date(1970, 0, 1, hours, minutes, 0, 0);
    return formatDateTime(date);
  };

  return (
    <Box w={42} style={{ flex: "0 0 auto" }}>
      <Stack gap="xs">
        <Box
          style={{
            position: "relative",
            height: totalTimeUnits * timeUnitHeight,
          }}
        >
          {Array.from({ length: totalTimeUnits + 1 }, (_, i) => (
            
            <Text
              key={i}
              size="xs"
              c="light-dark(var(--mantine-color-gray-9), var(--mantine-color-gray-0))"
              style={{
                position: "absolute",
                top: i * timeUnitHeight - 6,
                left: 2,
                width: "100%",
                textAlign: "right",
                paddingRight: 8,
              }}
            >
              {formatTime(i)}
            </Text>
          ))}
          {/* Current time indicator */}
          <Box
            style={{
              position: "absolute",
              top: timeToY(currentTime),
              left: 0,
              right: 0,
              height: 2,
              background: "var(--mantine-color-red-6)",
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
}
