import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useWorkTimeEntries } from "@/db/collections/work/work-time-entry/use-work-time-entry-query";
import { useState, useCallback, useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useProjectFiltering } from "@/hooks/useProjectFiltering";
import { useIntl } from "@/hooks/useIntl";
import { useWorkStore } from "@/stores/workManagerStore";
import { usePayoutMutations } from "@/db/collections/finance/payout/use-payout-mutations";
import { getRouteApi } from "@tanstack/react-router";

import {
  Box,
  Collapse,
  Group,
  Loader,
  Stack,
  Text,
  ActionIcon,
  Card,
  Popover,
} from "@mantine/core";
import EditProjectDrawer from "@/components/Work/Project/EditProjectDrawer";
import Header from "@/components/Header/Header";
import WorkAnalysis from "@/components/Work/Analysis/WorkAnalysis";
import FilterActionIcon from "@/components/UI/ActionIcons/FilterActionIcon";
import PayoutActionIcon from "@/components/UI/ActionIcons/PayoutActionIcon";
import SessionHierarchy from "@/components/Work/Session/SessionHirarchy/SessionHierarchy";
import ProjectFilter from "@/components/Work/Project/ProjectFilter";
import HourlyPayoutCard from "@/components/Finances/Payout/HourlyPayout/HourlyPayoutCard";
import ProjectPayoutCard from "@/components/Finances/Payout/ProjectPayout/ProjectPayoutCard";
import PayoutConversionModal from "@/components/Finances/Payout/PayoutConversionModal";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import NewSessionModal from "@/components/Work/Session/NewSessionModal";
import SessionSelector from "@/components/Work/Session/SessionSelector";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import { IconClockPlus } from "@tabler/icons-react";

import { formatDate } from "@/utils/intl";
import { groupSessions } from "@/lib/sessionHelperFunctions";

import { WorkTimeEntry } from "@/types/work.types";
import { Currency } from "@/types/settings.types";

const route = getRouteApi("/_app/work");

export default function WorkProjectDetailsPage() {
  const { locale, getLocalizedText } = useIntl();
  const { addHourlyPayout } = usePayoutMutations();
  const { projectId } = route.useSearch();
  const {
    setAnalysisOpened,
    setEditProjectOpened,
    analysisOpened,
    editProjectOpened,
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
  // const {
  //   mutate: payoutHourlyTimerProjectMutation,
  //   isPending: isProcessingPayout,
  // } = usePayoutHourlyTimerProjectMutation({
  //   onSuccess: () => {
  //     setSelectedTimeEntryIds([]);
  //     deactivateSelectedMode();
  //   },
  // });

  // State for filter time span
  const [filterTimeSpan, setFilterTimeSpan] = useState<
    [Date | null, Date | null]
  >([null, null]);
  const [selectedTimeEntryIds, setSelectedTimeEntryIds] = useState<string[]>(
    []
  );
  const [filterOpened, { open: openFilter, close: closeFilter }] =
    useDisclosure(false);
  const [payoutOpened, { open: openPayout, close: closePayout }] =
    useDisclosure(false);
  const [
    payoutConversionOpened,
    { open: openPayoutConversion, close: closePayoutConversion },
  ] = useDisclosure(false);
  const [payoutConvertionStartValues, setPayoutConvertionStartValues] =
    useState<{
      value: number;
      timeEntries: WorkTimeEntry[];
    }>({
      value: 0,
      timeEntries: [],
    });
  const [
    selectedModeActive,
    {
      close: deactivateSelectedMode,
      toggle: toggleSelectedMode,
      open: activateSelectedMode,
    },
  ] = useDisclosure(false);

  const [
    sessionFormOpened,
    { open: openSessionForm, close: closeSessionForm },
  ] = useDisclosure(false);

  // Use the custom hook for filtering logic
  const { timeFilteredTimeEntries } = useProjectFiltering(
    projectTimeEntries ?? [],
    filterTimeSpan
  );

  const toggleAllTimeEntries = useCallback(() => {
    if (selectedTimeEntryIds.length > 0) {
      setSelectedTimeEntryIds([]);
    } else {
      setSelectedTimeEntryIds(
        timeFilteredTimeEntries
          .filter((timeEntry) => !timeEntry.single_cash_flow_id)
          .map((timeEntry) => timeEntry.id)
      );
    }
  }, [selectedTimeEntryIds.length, timeFilteredTimeEntries]);

  const selectAllTimeEntries = useCallback(() => {
    activateSelectedMode();
    setSelectedTimeEntryIds(
      timeFilteredTimeEntries
        .filter((timeEntry) => !timeEntry.single_cash_flow_id)
        .map((timeEntry) => timeEntry.id)
    );
  }, [timeFilteredTimeEntries]);

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
        setSelectedTimeEntryIds((prev) =>
          prev.filter((id) => !groupIds.includes(id))
        );
      } else {
        setSelectedTimeEntryIds((prev) =>
          Array.from(new Set([...prev, ...groupIds]))
        );
      }
    },
    [timeFilteredTimeEntries, selectedTimeEntryIds]
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
        setSelectedTimeEntryIds((prev) =>
          Array.from(new Set([...prev, ...rangeIds]))
        );
      } else {
        setSelectedTimeEntryIds((prev) =>
          prev.includes(timeEntryId)
            ? prev.filter((id) => id !== timeEntryId)
            : [...prev, timeEntryId]
        );
        setLastSelectedIndex(index);
      }
    },
    [timeFilteredTimeEntries, lastSelectedIndex]
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

  const handlePayoutToggle = () => {
    if (!payoutOpened) {
      openPayout();
      closeFilter();
    } else {
      closePayout();
    }
  };

  const handleFilterToggle = () => {
    if (!filterOpened) {
      openFilter();
      closePayout();
    } else {
      closeFilter();
    }
  };

  const handleSelectionToggle = () => {
    if (selectedModeActive) {
      setSelectedTimeEntryIds([]);
    }
    toggleSelectedMode();
  };

  const handleSessionPayoutClick = (timeEntries: WorkTimeEntry[]) => {
    setPayoutConvertionStartValues({
      value:
        Math.round(
          timeEntries.reduce(
            (acc, timeEntry) =>
              acc + timeEntry.salary * (timeEntry.active_seconds / 3600),
            0
          ) * 100
        ) / 100,
      timeEntries,
    });
    openPayoutConversion();
  };

  const handleSessionPayout = (
    timeEntries: WorkTimeEntry[],
    endCurrency?: Currency,
    endValue?: number
  ) => {
    if (!project) return;
    const title = `${getLocalizedText("Auszahlung", "Payout")} (${project.title}) ${formatDate(new Date(), locale)}`;

    addHourlyPayout(project, title, timeEntries, endCurrency, endValue);
    setSelectedTimeEntryIds([]);
    deactivateSelectedMode();
  };

  const selectableSessions = timeFilteredTimeEntries.filter(
    (timeEntry) => !timeEntry.single_cash_flow_id
  );

  const isPayoutAvailable = project.hourly_payment
    ? timeFilteredTimeEntries.reduce(
        (acc, timeEntry) =>
          acc + timeEntry.salary * (timeEntry.active_seconds / 3600),
        0
      ) > 0
    : project.salary > project.total_payout;

  return (
    <Stack align="center" w="100%" px="xl" pb="xl" pt="xs">
      <Collapse in={!analysisOpened} transitionDuration={300} w="100%">
        <Text size="sm" fw={500} ta="center" mb="xs">
          {project.description}
        </Text>
        <Stack
          style={{
            position: "sticky",
            top: 10,
            zIndex: 10,
            left: 0,
          }}
          w="100%"
          gap="xs"
        >
          <Card withBorder radius="md" p={0}>
            <Group justify="space-between" p={5}>
              <Group>
                <Popover
                  opened={filterOpened}
                  onClose={closeFilter}
                  onOpen={openFilter}
                  transitionProps={{ transition: "fade-down", duration: 300 }}
                  position="bottom-start"
                  trapFocus
                  returnFocus
                >
                  <Popover.Target>
                    <FilterActionIcon
                      disabled={timeFilteredTimeEntries.length === 0}
                      onClick={handleFilterToggle}
                      tooltipLabel={getLocalizedText("Filter", "Filter")}
                      activeFilter={
                        filterTimeSpan[0] && filterTimeSpan[1] ? true : false
                      }
                      opened={filterOpened}
                    />
                  </Popover.Target>
                  <Popover.Dropdown p={0}>
                    <ProjectFilter
                      timeSpan={filterTimeSpan}
                      onTimeSpanChange={setFilterTimeSpan}
                      sessions={timeFilteredTimeEntries}
                      project={project}
                      isProcessingPayout={false}
                      onSelectAll={selectAllTimeEntries}
                      handleSessionPayoutClick={handleSessionPayoutClick}
                    />
                  </Popover.Dropdown>
                </Popover>
                <Popover
                  opened={payoutOpened}
                  onClose={closePayout}
                  onOpen={openPayout}
                  transitionProps={{ transition: "fade-down", duration: 300 }}
                  position="bottom-start"
                  trapFocus
                  returnFocus
                >
                  <Popover.Target>
                    <PayoutActionIcon
                      onClick={handlePayoutToggle}
                      tooltipLabel={getLocalizedText("Auszahlung", "Payout")}
                      disabled={!isPayoutAvailable}
                      opened={payoutOpened}
                    />
                  </Popover.Target>
                  <Popover.Dropdown p={0}>
                    {project.hourly_payment ? (
                      <HourlyPayoutCard
                        project={{
                          ...project,
                          timeEntries: projectTimeEntries,
                        }}
                        handlePayoutClick={handleSessionPayoutClick}
                        isProcessing={false}
                      />
                    ) : (
                      <ProjectPayoutCard project={project} />
                    )}
                  </Popover.Dropdown>
                </Popover>
              </Group>
              <DelayedTooltip
                label={getLocalizedText("Sitzung hinzufügen", "Add Session")}
              >
                <ActionIcon
                  onClick={openSessionForm}
                  size="md"
                  variant="subtle"
                >
                  <IconClockPlus />
                </ActionIcon>
              </DelayedTooltip>
              <NewSessionModal
                opened={sessionFormOpened}
                onClose={closeSessionForm}
                project={project}
              />
              <Popover
                opened={selectedModeActive}
                onClose={deactivateSelectedMode}
                onOpen={activateSelectedMode}
                transitionProps={{ transition: "fade-down", duration: 300 }}
                position="bottom-end"
                trapFocus
                returnFocus
              >
                <Popover.Target>
                  <SelectActionIcon
                    disabled={selectableSessions.length === 0}
                    onClick={handleSelectionToggle}
                    tooltipLabel={
                      selectedModeActive
                        ? getLocalizedText(
                            "Auswahlmodus deaktivieren",
                            "Deactivate selection mode"
                          )
                        : getLocalizedText(
                            "Auswahlmodus aktivieren",
                            "Activate selection mode"
                          )
                    }
                    size="md"
                    selected={selectedModeActive}
                    mainControl={true}
                  />
                </Popover.Target>
                <Popover.Dropdown p={0}>
                  <Collapse in={selectedModeActive}>
                    <SessionSelector
                      selectedSessions={selectedTimeEntryIds}
                      timeFilteredSessions={timeFilteredTimeEntries}
                      toggleAllSessions={toggleAllTimeEntries}
                      handleSessionPayoutClick={handleSessionPayoutClick}
                    />
                  </Collapse>
                </Popover.Dropdown>
              </Popover>
            </Group>
          </Card>

          <PayoutConversionModal
            opened={payoutConversionOpened}
            handleClose={closePayoutConversion}
            startValue={payoutConvertionStartValues.value}
            startCurrency={project.currency}
            onSubmit={(values) => {
              handleSessionPayout(
                payoutConvertionStartValues.timeEntries,
                values.endCurrency,
                values.endValue
              );
              closePayoutConversion();
            }}
            isProcessing={false}
          />
        </Stack>
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
