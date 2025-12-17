import { useIntl } from "@/hooks/useIntl";
import { useCalendarStore } from "@/stores/calendarStore";

import { Group, ActionIcon, Text, Grid, SegmentedControl } from "@mantine/core";
import { IconArrowsSort } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import CalendarLegendButton from "./CalendarLegendButton";

import { ViewMode } from "@/types/workCalendar.types";
import { WorkProject } from "@/types/work.types";

interface CalendarLegendProps {
  visibleProjects: WorkProject[];
  handleScrollToNow: () => void;
}

export default function CalendarLegend({
  visibleProjects,
  handleScrollToNow,
}: CalendarLegendProps) {
  const { getLocalizedText } = useIntl();
  const { viewMode, setViewMode } = useCalendarStore();

  return (
    <Grid
      p={5}
      w="100%"
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 100,
        background: "var(--mantine-color-body)",
        borderTop:
          "1px solid light-dark(var(--mantine-color-gray-8), var(--mantine-color-dark-1))",
      }}
    >
      <Grid.Col span={{ base: 3, md: 2 }}>
        <Group justify="flex-start" pl="md">
          <DelayedTooltip
            label={getLocalizedText(
              "Springe zur aktuellen Zeit",
              "Scroll to current time"
            )}
          >
            <ActionIcon
              variant="light"
              size="lg"
              radius="md"
              onClick={handleScrollToNow}
            >
              <IconArrowsSort color="var(--mantine-color-teal-text)" />
            </ActionIcon>
          </DelayedTooltip>
        </Group>
      </Grid.Col>
      <Grid.Col span={{ base: 6, md: 8 }}>
        {visibleProjects.length > 0 ? (
          <Group justify="center" wrap="wrap" gap="xs" w="100%">
            {visibleProjects.map((p) => (
              <CalendarLegendButton key={p.id} p={p} />
            ))}
          </Group>
        ) : (
          <Text ta="center" size="sm" c="dimmed">
            {getLocalizedText("Keine Einträge gefunden", "No entries found")}
          </Text>
        )}
      </Grid.Col>

      <Grid.Col span={{ base: 3, md: 2 }}>
        <Group justify="flex-end" pr="md">
          <SegmentedControl
            color="teal"
            value={viewMode}
            onChange={(v) => setViewMode(v as ViewMode)}
            data={[
              { label: getLocalizedText("Tag", "Day"), value: "day" },
              {
                label: getLocalizedText("Woche", "Week"),
                value: "week",
              },
            ]}
          />
        </Group>
      </Grid.Col>
    </Grid>
  );
}
