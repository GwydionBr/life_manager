import { useIntl } from "@/hooks/useIntl";
import { useCalendarStore } from "@/stores/calendarStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Group,
  ActionIcon,
  Text,
  Grid,
  SegmentedControl,
  Stack,
  ScrollArea,
} from "@mantine/core";
import { IconArrowsSort, IconCalendarPlus } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import CalendarLegendButton from "./CalendarLegendButton";

import { ViewMode } from "@/types/workCalendar.types";
import { WorkProject } from "@/types/work.types";
import Shortcut from "@/components/UI/Shortcut";

interface CalendarLegendProps {
  visibleProjects: WorkProject[];
  handleScrollToNow: () => void;
  onCreateAppointment?: () => void;
}

export default function CalendarLegend({
  visibleProjects,
  handleScrollToNow,
  onCreateAppointment,
}: CalendarLegendProps) {
  const { getLocalizedText } = useIntl();
  const { viewMode, setViewMode } = useCalendarStore();
  const { isAsideOpen } = useSettingsStore();

  return (
    <Grid
      p={5}
      style={{
        position: "fixed",
        bottom: 0,
        left: 50,
        right: isAsideOpen ? 300 : 50,
        zIndex: 100,
        background: "var(--mantine-color-body)",
        transition: "right 0.4s ease-in",
        borderTop:
          "1px solid light-dark(var(--mantine-color-gray-8), var(--mantine-color-dark-1))",
      }}
    >
      <Grid.Col span={{ base: 3, md: 2 }}>
        <Group justify="flex-start" pl="md" gap="xs">
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
          {onCreateAppointment && (
            <DelayedTooltip
              label={
                <Stack align="center">
                  <Text>
                    {getLocalizedText("Termin hinzufügen", "Add appointment")}
                  </Text>
                  <Shortcut keys={["mod", "Shift", "A"]} />
                </Stack>
              }
            >
              <ActionIcon
                variant="light"
                size="lg"
                radius="md"
                onClick={onCreateAppointment}
                color="blue"
              >
                <IconCalendarPlus />
              </ActionIcon>
            </DelayedTooltip>
          )}
        </Group>
      </Grid.Col>
      <Grid.Col span={{ base: 6, md: 8 }}>
        <ScrollArea.Autosize h="100%" type="never">
          {visibleProjects.length > 0 ? (
            <Group align="center" justify="center" wrap="nowrap" gap="xs" w="100%">
              {visibleProjects.map((p) => (
                <CalendarLegendButton key={p.id} p={p} />
              ))}
            </Group>
          ) : (
            <Text ta="center" size="sm" c="dimmed">
              {getLocalizedText("Keine Einträge gefunden", "No entries found")}
            </Text>
          )}
        </ScrollArea.Autosize>
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
