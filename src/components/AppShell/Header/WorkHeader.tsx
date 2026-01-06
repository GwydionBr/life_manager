import { useMemo } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useSettingsStore } from "@/stores/settingsStore";
import { useWorkStore } from "@/stores/workManagerStore";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useWorkTimeEntries } from "@/db/collections/work/work-time-entry/use-work-time-entry-query";

import {
  Group,
  Title,
  ThemeIcon,
  alpha,
  getThemeColor,
  useMantineTheme,
  Grid,
  Loader,
  Text,
  Badge,
} from "@mantine/core";
import { IconBriefcase } from "@tabler/icons-react";
import AnalysisActionIcon from "@/components/UI/ActionIcons/AnalysisActionIcon";
import ListActionIcon from "@/components/UI/ActionIcons/ListActionIcon";
import EditActionIcon from "@/components/UI/ActionIcons/EditActionIcon";
import FinanceCategorySingleBadge from "@/components/Finances/Category/FinanceCategorySingleBadge";

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

  const {
    data: projects,
    isLoading: isProjectsLoading,
    isReady: isProjectsReady,
  } = useWorkProjects();
  const project = useMemo(() => {
    return projects?.find((project) => project.id === activeProjectId);
  }, [projects, activeProjectId]);

  const {
    data: timeEntriesData,
    isLoading: isTimeEntriesLoading,
    isReady: isTimeEntriesReady,
  } = useWorkTimeEntries();
  const timeEntries = useMemo(() => {
    return timeEntriesData?.filter(
      (timeEntry) => timeEntry.project_id === activeProjectId
    );
  }, [timeEntriesData, activeProjectId]);

  const fromColor = getThemeColor(primaryColor, theme);
  const toColor = getThemeColor(workColor, theme);

  // Loading state
  const isLoading = isProjectsLoading || isTimeEntriesLoading;
  const isReady = isProjectsReady && isTimeEntriesReady;

  // Project found calculations
  const salary = project
    ? formatMoney(project.salary, project.currency)
    : undefined;
  const totalActiveSeconds = project
    ? timeEntries.reduce(
        (total, timeEntry) => total + timeEntry.active_seconds,
        0
      )
    : 0;
  const hourlySalary = project
    ? formatMoney(
        project.hourly_payment
          ? project.salary
          : totalActiveSeconds > 0
            ? (project.salary / totalActiveSeconds) * 3600
            : 0,
        project.currency
      )
    : undefined;

  const rightSalary =
    project && project.salary === 0 ? undefined : hourlySalary;

  const leftSalary = project
    ? project.hourly_payment
      ? undefined
      : project.salary === 0
        ? "Hobby"
        : salary
    : undefined;

  const backgroundColor = useMemo(() => {
    return `linear-gradient(135deg, ${alpha(fromColor, 0.4)} 0%, ${alpha(toColor, 0.4)} 100%)`;
  }, [fromColor, toColor]);

  return (
    <Group h="100%" bg={backgroundColor} w="100%" wrap="nowrap">
      {isReady && !project ? null : (
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
      )}
      <Grid w="100%" align="center">
        <Grid.Col span={2}>
          {project?.tags.map((category) => (
            <FinanceCategorySingleBadge
              variant="filled"
              category={category}
              key={category.id}
            />
          ))}
        </Grid.Col>
        <Grid.Col span={8}>
          {isLoading ? (
            <Group
              align="center"
              justify="center"
              style={{ flex: 1, minWidth: 0 }}
            >
              <Loader />
            </Group>
          ) : !project ? (
            <Group
              align="center"
              justify="center"
              style={{ flex: 1, minWidth: 0 }}
            >
              <ThemeIcon size="xl" bg={backgroundColor} radius="lg">
                <IconBriefcase color="var(--mantine-color-text)" />
              </ThemeIcon>
              <Text fz={35} fw={700}>
                {getLocalizedText("Projekt-Management", "Project Management")}
              </Text>
            </Group>
          ) : (
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
                <Text
                  c={leftSalary ? "blue" : "red"}
                  fw={leftSalary ? 400 : 700}
                >
                  {rightSalary} / {getLocalizedText("Stunde", "Hour")}
                </Text>
              )}
            </Group>
          )}
        </Grid.Col>
        <Grid.Col span={2}>
          {project && (
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
          )}
        </Grid.Col>
      </Grid>
    </Group>
  );
}
