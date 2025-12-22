import { useIntl } from "@/hooks/useIntl";
import { useSettingsStore } from "@/stores/settingsStore";
import { useWorkStore } from "@/stores/workManagerStore";
import { useWorkProjectById } from "@/db/collections/work/work-project/work-project-collection";
import { useWorkTimeEntriesByProjectId } from "@/db/collections/work/work-time-entry/work-time-entry-collection";

import {
  Group,
  Title,
  ThemeIcon,
  alpha,
  getThemeColor,
  useMantineTheme,
  Box,
  Grid,
  Loader,
  Text,
} from "@mantine/core";
import { IconBriefcase } from "@tabler/icons-react";
import { getRouteApi } from "@tanstack/react-router";
import AnalysisActionIcon from "@/components/UI/ActionIcons/AnalysisActionIcon";
import ListActionIcon from "@/components/UI/ActionIcons/ListActionIcon";
import EditActionIcon from "@/components/UI/ActionIcons/EditActionIcon";

export default function WorkHeader() {
  const {
    setAnalysisOpened,
    toggleEditProjectOpened,
    analysisOpened,
    activeProjectId,
  } = useWorkStore();
  const { workColor, primaryColor } = useSettingsStore();
  const { getLocalizedText, formatMoney } = useIntl();
  const theme = useMantineTheme();

  if (!activeProjectId) return <Loader />;

  const project = useWorkProjectById(activeProjectId);
  const { data: timeEntries } = useWorkTimeEntriesByProjectId(activeProjectId);
  if (!project) return <Loader />;
  const salary = formatMoney(project.salary, project.currency);
  const totalActiveSeconds = timeEntries.reduce(
    (total, timeEntry) => total + timeEntry.active_seconds,
    0
  );
  const hourlySalary = formatMoney(
    project.hourly_payment
      ? project.salary
      : totalActiveSeconds > 0
        ? (project.salary / totalActiveSeconds) * 3600
        : 0,
    project.currency
  );

  const rightSalary = project.salary === 0 ? undefined : hourlySalary;

  const leftSalary = project.hourly_payment
    ? undefined
    : project.salary === 0
      ? "Hobby"
      : salary;

  const fromColor = getThemeColor(primaryColor, theme);
  const toColor = getThemeColor(workColor, theme);

  return (
    <Group
      h="100%"
      style={{
        background: `linear-gradient(135deg, ${alpha(fromColor, 0.4)} 0%, ${alpha(toColor, 0.4)} 100%)`,
      }}
      w="100%"
      wrap="nowrap"
    >
      <Group align="center" gap={0} w={250} justify="center">
        <ThemeIcon
          color="var(--mantine-color-text)"
          size="xl"
          variant="transparent"
        >
          <IconBriefcase />
        </ThemeIcon>
        <Title order={2} c="var(--mantine-color-text)">
          {getLocalizedText("Arbeit", "Work")}
        </Title>
      </Group>
      <Grid w="100%" align="center">
        <Grid.Col span={2}></Grid.Col>
        <Grid.Col span={8}>
          <Group
            align="center"
            justify="center"
            style={{ flex: 1, minWidth: 0 }}
          >
            {leftSalary && (
              <Text c="red" fw={700}>
                {leftSalary}
              </Text>
            )}
            <Title order={1} style={{ textAlign: "center" }}>
              {project.title}
            </Title>
            {rightSalary && (
              <Text c={leftSalary ? "blue" : "red"} fw={leftSalary ? 400 : 700}>
                {rightSalary} / {getLocalizedText("Stunde", "Hour")}
              </Text>
            )}
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group>
            {timeEntries.length > 0 &&
              (!analysisOpened ? (
                <AnalysisActionIcon
                  onClick={() => setAnalysisOpened(true)}
                  tooltipLabel={getLocalizedText(
                    "Analyse öffnen",
                    "Open Analysis"
                  )}
                  color="var(--mantine-color-text)"
                  variant="subtle"
                />
              ) : (
                <ListActionIcon
                  onClick={() => setAnalysisOpened(false)}
                  tooltipLabel={getLocalizedText(
                    "Analyse schließen",
                    "Close Analysis"
                  )}
                  color="var(--mantine-color-text)"
                  variant="subtle"
                />
              ))}
            <EditActionIcon
              onClick={toggleEditProjectOpened}
              tooltipLabel={getLocalizedText(
                "Projekt bearbeiten",
                "Edit Project"
              )}
              color="var(--mantine-color-text)"
              variant="subtle"
            />
          </Group>
        </Grid.Col>
      </Grid>
    </Group>
  );
}
