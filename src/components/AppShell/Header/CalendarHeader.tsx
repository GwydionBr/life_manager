import dayjs from "dayjs";

import { useIntl } from "@/hooks/useIntl";
import { useCalendarStore } from "@/stores/calendarStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Grid,
  Group,
  Stack,
  Text,
  ActionIcon,
  useMantineTheme,
  getThemeColor,
  alpha,
  ThemeIcon,
  Title,
} from "@mantine/core";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import PrevActionIcon from "@/components/UI/ActionIcons/PrevActionIcon";
import NextActionIcon from "@/components/UI/ActionIcons/NextActionIcon";
import LocaleDatePickerInput from "@/components/UI/Locale/LocaleDatePickerInput";
import Shortcut from "@/components/UI/Shortcut";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar, IconMinus, IconPlus } from "@tabler/icons-react";

import { addDays, differenceInCalendarDays, isSameDay } from "date-fns";
import { useMemo } from "react";

const zoomLabels = ["1 h", "30 min", "15 min", "10 min", "5 min"];

export default function CalendarHeader() {
  const { getLocalizedText } = useIntl();
  const { calendarColor, primaryColor } = useSettingsStore();
  const {
    viewMode,
    dateRange,
    currentDateRange,
    addingMode,
    referenceDate,
    zoomIndex,
    setAddingMode,
    setDateRange,
    setCurrentDateRange,
    setReferenceDate,
    setViewMode,
    changeZoomIndex,
  } = useCalendarStore();
  const today = dayjs();
  const theme = useMantineTheme();

  const backgroundColor = useMemo(() => {
    const fromColor = getThemeColor(primaryColor, theme);
    const toColor = getThemeColor(calendarColor, theme);
    return `linear-gradient(135deg, ${alpha(fromColor, 0.4)} 0%, ${alpha(toColor, 0.4)} 100%)`;
  }, [primaryColor, calendarColor, theme]);

  function handleNextAndPrev(delta: number = 1) {
    if (viewMode === "day") {
      setReferenceDate(addDays(referenceDate, delta));
      return;
    }
    const [s, e] = dateRange;
    if (s && e) {
      const len = differenceInCalendarDays(e, s) + 1;
      const ns = addDays(s, delta * len);
      const ne = addDays(e, delta * len);
      setDateRange([ns, ne]);
      setCurrentDateRange([ns, ne]);
      setReferenceDate(ns);
    } else {
      setReferenceDate(addDays(referenceDate, delta * 7));
    }
  }

  function setRangeAndMaybeSwitch(start: Date | null, end: Date | null) {
    if (!start && !end) {
      setDateRange([currentDateRange[0], currentDateRange[1]]);
      return;
    }
    setDateRange([start ? new Date(start) : null, end ? new Date(end) : null]);
    if (start && end) {
      setCurrentDateRange([start, end]);
      if (isSameDay(start, end)) {
        setReferenceDate(new Date(start));
        setViewMode("day");
      } else {
        setReferenceDate(new Date(start));
        setViewMode("week");
      }
    }
  }

  return (
    <Grid
      columns={12}
      align="center"
      justify="center"
      w="100%"
      bg={backgroundColor}
    >
      <Grid.Col span={2}>
        <Group align="center" gap={0} justify="center">
          <ThemeIcon
            color="var(--mantine-color-text)"
            size="xl"
            variant="transparent"
          >
            <IconCalendar />
          </ThemeIcon>
          <Title order={2} c="var(--mantine-color-text)">
            {getLocalizedText("Kalender", "Calendar")}
          </Title>
        </Group>
      </Grid.Col>
      <Grid.Col span={1}>
        <Group justify="flex-start" ml="md" gap="xs">
          <PlusActionIcon
            tooltipLabel={
              <Stack align="center">
                <Text>
                  {addingMode
                    ? getLocalizedText(
                        "Einfüge-Modus deaktivieren",
                        "Disable entry mode"
                      )
                    : getLocalizedText(
                        "Einfüge-Modus aktivieren",
                        "Enable entry mode"
                      )}
                </Text>
                <Shortcut keys={addingMode ? ["Esc"] : ["mod", "Enter"]} />
              </Stack>
            }
            variant={addingMode ? "filled" : "light"}
            onClick={() => setAddingMode(!addingMode)}
          />
        </Group>
      </Grid.Col>
      <Grid.Col span={6}>
        <Group gap="xs" justify="center">
          <PrevActionIcon onClick={() => handleNextAndPrev(-1)} />
          {viewMode === "day" ? (
            <LocaleDatePickerInput
              value={referenceDate}
              onChange={(value) => {
                if (value) {
                  setReferenceDate(new Date(value));
                }
              }}
            />
          ) : (
            <DatePickerInput
              allowSingleDateInRange
              type="range"
              value={dateRange}
              valueFormat={getLocalizedText("DD. MMM YYYY", "MMM DD, YYYY")}
              onChange={(value) => {
                const [start, end] = value;
                const s = start ? new Date(start) : null;
                const e = end ? new Date(end) : null;
                setRangeAndMaybeSwitch(s, e);
              }}
              presets={[
                {
                  value: [
                    today.subtract(2, "day").format("YYYY-MM-DD"),
                    today.format("YYYY-MM-DD"),
                  ],
                  label: getLocalizedText("Letzte 2 Tage", "Last 2 days"),
                },
                {
                  value: [
                    today.subtract(7, "day").format("YYYY-MM-DD"),
                    today.format("YYYY-MM-DD"),
                  ],
                  label: getLocalizedText("Letzte 7 Tage", "Last 7 days"),
                },
                {
                  value: [
                    today.startOf("week").add(1, "day").format("YYYY-MM-DD"),
                    today.endOf("week").add(1, "day").format("YYYY-MM-DD"),
                  ],
                  label: getLocalizedText("Diese Woche", "This week"),
                },
                {
                  value: [
                    today
                      .startOf("week")
                      .subtract(1, "week")
                      .add(1, "day")
                      .format("YYYY-MM-DD"),
                    today
                      .endOf("week")
                      .subtract(1, "week")
                      .add(1, "day")
                      .format("YYYY-MM-DD"),
                  ],
                  label: getLocalizedText("Letzte Woche", "Last week"),
                },
                {
                  value: [
                    today.startOf("month").format("YYYY-MM-DD"),
                    today.endOf("month").format("YYYY-MM-DD"),
                  ],
                  label: getLocalizedText("Dieser Monat", "This month"),
                },
                {
                  value: [
                    today
                      .subtract(1, "month")
                      .startOf("month")
                      .format("YYYY-MM-DD"),
                    today
                      .subtract(1, "month")
                      .endOf("month")
                      .format("YYYY-MM-DD"),
                  ],
                  label: getLocalizedText("Letzter Monat", "Last month"),
                },
              ]}
            />
          )}
          <NextActionIcon onClick={() => handleNextAndPrev(1)} />
        </Group>
      </Grid.Col>
      <Grid.Col span={3} pr="md">
        <Group justify="flex-end" pr="md">
          <ActionIcon.Group>
            <ActionIcon
              color="red"
              size="lg"
              radius="md"
              onClick={() => {
                changeZoomIndex(-1);
              }}
              disabled={zoomIndex === 0}
            >
              <IconMinus />
            </ActionIcon>
            <ActionIcon.GroupSection
              variant="default"
              size="lg"
              bg="var(--mantine-color-body)"
              miw={85}
              ta="center"
              fw={600}
            >
              {zoomLabels[zoomIndex]}
            </ActionIcon.GroupSection>
            <ActionIcon
              size="lg"
              radius="md"
              onClick={() => {
                changeZoomIndex(1);
              }}
              disabled={zoomIndex === 4}
            >
              <IconPlus />
            </ActionIcon>
          </ActionIcon.Group>
        </Group>
      </Grid.Col>
    </Grid>
  );
}
