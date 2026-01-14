import { useCallback, useEffect, useMemo, useState } from "react";
import { useMounted } from "@mantine/hooks";
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useWorkStore } from "@/stores/workManagerStore";
import { useIntl } from "@/hooks/useIntl";

import {
  Alert,
  alpha,
  Group,
  Select,
  Stack,
  Text,
  Box,
  getThemeColor,
  useMantineTheme,
} from "@mantine/core";
import { TimerState } from "@/types/timeTracker.types";
import TimeTrackerInstance from "./TimeTrackerInstance";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import TimeTrackerActionIcon from "./TimeTrackerActionIcons/TimeTrackerActionIcon";
import { getStatusColor } from "@/lib/workHelperFunctions";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { WorkProject } from "@/types/work.types";
import classes from "./TimeTracker.module.css";

interface TimerManagerProps {
  isBig: boolean; // Whether to show timers in big or small mode
  isTimeTrackerMinimized: boolean; // Whether timers are minimized
  setIsTimeTrackerMinimized: (value: boolean) => void; // Callback to toggle minimized state
}

export default function TimerManager({
  isBig,
  isTimeTrackerMinimized,
  setIsTimeTrackerMinimized,
}: TimerManagerProps) {
  const theme = useMantineTheme();
  const isMounted = useMounted();
  // Error message state for displaying validation errors
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { getLocalizedText } = useIntl();

  const { data: projects, isReady: isProjectsReady } = useWorkProjects();

  const { currentAppColor } = useSettingsStore();
  const { activeProjectId } = useWorkStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  const { addTimer, timers, runningTimerCount } = useTimeTrackerManager();

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId),
    [projects, activeProjectId]
  );

  const projectsToAdd = useMemo(() => {
    return (
      projects
        .filter(
          (p) =>
            p.id !==
            Object.values(timers).find((t) => t.projectId === p.id)?.projectId
        )
        .map((p) => ({
          label: p.title,
          value: p.id,
        })) || []
    );
  }, [projects, timers]);

  const backgroundColor = useMemo(() => {
    return alpha(getThemeColor(currentAppColor, theme), 0.4);
  }, [currentAppColor, theme]);

  const handleAddTimer = useCallback(
    (project: WorkProject) => {
      // Attempt to add timer with default rounding settings
      const result = addTimer(project);

      // Handle errors with localized messages
      if ("error" in result) {
        setErrorMessage(
          result.error === "limit"
            ? getLocalizedText(
                "Maximale Anzahl an Timern erreicht",
                "Maximum number of timers reached"
              )
            : getLocalizedText(
                "Ein Timer für dieses Projekt existiert bereits",
                "A timer for this project already exists"
              )
        );
        // Auto-dismiss error after 4 seconds
        setTimeout(() => {
          setErrorMessage(null);
        }, 4000);
      }
      setSelectedProjectId(null);
    },
    [addTimer, getLocalizedText]
  );

  // Auto-create timer for active project if none exist
  useEffect(() => {
    if (Object.keys(timers).length === 0 && isProjectsReady) {
      if (activeProject) {
        handleAddTimer(activeProject);
      }
    }
  }, [timers, activeProject, isProjectsReady, handleAddTimer]);

  // Auto-select project if active project is not selected
  useEffect(() => {
    if (
      activeProject &&
      !Object.values(timers).some((t) => t.projectId === activeProject.id)
    ) {
      setSelectedProjectId(activeProject.id);
    }
  }, [activeProject, timers]);

  // Determine main status: Running > Stopped
  const mainTimerStatus = useMemo(
    () => (runningTimerCount > 0 ? TimerState.Running : TimerState.Stopped),
    [runningTimerCount]
  );

  if (!isMounted) {
    return (
      <Stack align="center" gap="md" mb="md">
        <PlusActionIcon onClick={() => {}} />
        <TimeTrackerActionIcon
          action={() => {}}
          label={getLocalizedText("Timer verkleinern", "Minimize Timer")}
          indicatorLabel="0"
          state={TimerState.Stopped}
          getStatusColor={() => getStatusColor(TimerState.Stopped)}
        />
      </Stack>
    );
  }

  return (
    <Stack align="center" gap="md" mb="md">
      <Box className={classes.toolbar}>
        <Group
          p="xs"
          align="center"
          justify="space-between"
          bg={backgroundColor}
        >
          {/* Summary icon showing timer count and aggregate status */}
          <TimeTrackerActionIcon
            action={() => setIsTimeTrackerMinimized(!isTimeTrackerMinimized)}
            minimized={isTimeTrackerMinimized}
            label={
              isTimeTrackerMinimized
                ? getLocalizedText("Timer vergrößern", "Expand Timer")
                : getLocalizedText("Timer verkleinern", "Minimize Timer")
            }
            indicatorLabel={runningTimerCount.toString()}
            state={mainTimerStatus}
            getStatusColor={() => getStatusColor(mainTimerStatus)}
          />
          {isBig && (
            <Select
              w={210}
              placeholder={getLocalizedText(
                "Projekt auswählen",
                "Select project"
              )}
              data={projectsToAdd}
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              searchable
              leftSection={
                <Text fz="xs" c="dimmed">
                  {Object.keys(timers).length}/10
                </Text>
              }
              rightSectionPointerEvents="auto"
              rightSection={
                <PlusActionIcon
                  onClick={() => {
                    if (!selectedProjectId) return;
                    const selectedProject = projects.find(
                      (p) => p.id === selectedProjectId
                    )!;
                    if (!selectedProject) return;
                    handleAddTimer(selectedProject);
                  }}
                />
              }
              styles={{
                input: {
                  textAlign: "center",
                  textOverflow: "ellipsis",
                  fontSize: "var(--mantine-font-size-md)",
                  backgroundColor: alpha("var(--mantine-color-body)", 0.5),
                  borderRadius: "var(--mantine-radius-lg)",
                  border: "none",
                },
              }}
            />
          )}
        </Group>
      </Box>

      {/* Error alert - shown when timer creation fails */}
      {errorMessage && (
        <Alert
          color="red"
          variant="filled"
          title={getLocalizedText("Fehler", "Error")}
          withCloseButton
          onClose={() => setErrorMessage(null)}
        >
          <Text>{errorMessage}</Text>
        </Alert>
      )}

      {/* Render all timer instances, sorted by creation date (newest first) */}
      {Object.values(timers)
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((timer) => (
          <TimeTrackerInstance
            key={timer.id}
            timer={timer}
            isBig={isBig}
            isTimeTrackerMinimized={isTimeTrackerMinimized}
            setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
          />
        ))}
    </Stack>
  );
}
