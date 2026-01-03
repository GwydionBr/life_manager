import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useWorkTimeEntries } from "@/db/collections/work/work-time-entry/use-work-time-entry-query";
import { useState, useCallback, useMemo } from "react";
import { useProjectFiltering } from "@/hooks/useProjectFiltering";
import { useIntl } from "@/hooks/useIntl";
import { useWorkStore } from "@/stores/workManagerStore";
import { getRouteApi } from "@tanstack/react-router";

import { Box, Collapse, Loader, Stack, Text } from "@mantine/core";
import EditProjectDrawer from "@/components/Work/Project/EditProjectDrawer";
import Header from "@/components/Header/Header";
import WorkAnalysis from "@/components/Work/Analysis/WorkAnalysis";
import SessionHierarchy from "@/components/Work/Session/SessionHirarchy/SessionHierarchy";

import { groupSessions } from "@/lib/sessionHelperFunctions";
import ProjectToolbar from "./ProjectToolbar";

const route = getRouteApi("/_app/work");

export default function WorkProjectDetailsPage() {
  const { locale, getLocalizedText } = useIntl();
  const { projectId } = route.useSearch();
  const {
    filterTimeSpan,
    selectedModeActive,
    selectedTimeEntryIds,
    analysisOpened,
    editProjectOpened,
    setSelectedTimeEntryIds,
    setAnalysisOpened,
    setEditProjectOpened,
  } = useWorkStore();

  const { data: projects } = useWorkProjects();
  const { data: timeEntriesData } = useWorkTimeEntries();

  const projectTimeEntries = useMemo(() => {
    return timeEntriesData?.filter(
      (timeEntry) => timeEntry.project_id === projectId
    );
  }, [timeEntriesData, projectId]);

  const project = useMemo(() => {
    return projects?.find((project) => project.id === projectId);
  }, [projects, projectId]);

  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );

  // Use the custom hook for filtering logic
  const { timeFilteredTimeEntries } = useProjectFiltering(
    projectTimeEntries ?? [],
    filterTimeSpan
  );

  const toggleGroupSelection = useCallback(
    (timeEntryIds: string[]) => {
      const groupIds = timeEntryIds.filter((id) =>
        timeFilteredTimeEntries.some(
          (timeEntry) => timeEntry.id === id && !timeEntry.single_cash_flow_id
        )
      );
      const isAnySelected = groupIds.some((id) =>
        selectedTimeEntryIds.includes(id)
      );
      if (isAnySelected) {
        setSelectedTimeEntryIds(
          selectedTimeEntryIds.filter((id) => !groupIds.includes(id))
        );
      } else {
        setSelectedTimeEntryIds(
          Array.from(new Set([...selectedTimeEntryIds, ...groupIds]))
        );
      }
    },
    [timeFilteredTimeEntries, selectedTimeEntryIds, setSelectedTimeEntryIds]
  );

  const toggleTimeEntrySelection = useCallback(
    (timeEntryId: string, index: number, range: boolean) => {
      if (range && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = timeFilteredTimeEntries
          .slice(start, end + 1)
          .filter((timeEntry) => !timeEntry.single_cash_flow_id)
          .map((timeEntry) => timeEntry.id);
        setSelectedTimeEntryIds(
          Array.from(new Set([...selectedTimeEntryIds, ...rangeIds]))
        );
      } else {
        setSelectedTimeEntryIds(
          selectedTimeEntryIds.includes(timeEntryId)
            ? selectedTimeEntryIds.filter((id) => id !== timeEntryId)
            : [...selectedTimeEntryIds, timeEntryId]
        );
        setLastSelectedIndex(index);
      }
    },
    [
      timeFilteredTimeEntries,
      lastSelectedIndex,
      selectedTimeEntryIds,
      setSelectedTimeEntryIds,
    ]
  );

  if (!project || !projectTimeEntries) {
    return (
      <Stack align="center" w="100%" px="xl">
        <Header
          headerTitle={locale === "de-DE" ? "Arbeitsmanager" : "Work Manager"}
        />
        <Loader />
      </Stack>
    );
  }

  return (
    <Stack align="center" w="100%" px="xl" pb="xl" pt="xs">
      <Collapse in={!analysisOpened} transitionDuration={300} w="100%">
        <Text size="sm" fw={500} ta="center">
          {project.description}
        </Text>
        <ProjectToolbar
          projectTimeEntries={projectTimeEntries}
          timeFilteredTimeEntries={timeFilteredTimeEntries}
          project={project}
        />
        {projectTimeEntries.length > 0 ? (
          <Box w="100%" style={{ overflow: "hidden" }}>
            {/* Session Hierarchy */}
            {timeFilteredTimeEntries.length > 0 ? (
              <SessionHierarchy
                selectedModeActive={selectedModeActive}
                groupedSessions={groupSessions(
                  timeFilteredTimeEntries.sort(
                    (a, b) =>
                      new Date(b.start_time).getTime() -
                      new Date(a.start_time).getTime()
                  ),
                  locale
                )}
                selectedSessions={selectedTimeEntryIds}
                onSessionToggle={toggleTimeEntrySelection}
                onGroupToggle={toggleGroupSelection}
                selectableIdSet={
                  new Set(
                    timeFilteredTimeEntries
                      .filter((timeEntry) => !timeEntry.single_cash_flow_id)
                      .map((timeEntry) => timeEntry.id)
                  )
                }
                project={project}
                isOverview={false}
              />
            ) : (
              <Text size="lg" c="gray" ta="center">
                {getLocalizedText(
                  "Keine Sitzungen im ausgewählten Zeitraum",
                  "No time entries in the time period"
                )}
              </Text>
            )}
          </Box>
        ) : (
          <Text size="lg" c="gray" ta="center" mt="xl">
            {getLocalizedText(
              "Füge eine Sitzung hinzu, um sie hier zu sehen",
              "Add a time entry to see it here"
            )}
          </Text>
        )}
        <EditProjectDrawer
          opened={editProjectOpened}
          onClose={() => setEditProjectOpened(false)}
        />
      </Collapse>
      <Collapse in={analysisOpened} w="100%">
        <WorkAnalysis
          sessions={projectTimeEntries}
          isOverview={false}
          project={project}
          onClose={() => setAnalysisOpened(false)}
        />
      </Collapse>
    </Stack>
  );
}
