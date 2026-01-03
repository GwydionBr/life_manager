import { useCallback, useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";
import { usePayoutMutations } from "@/db/collections/finance/payout/use-payout-mutations";

import {
  Stack,
  Collapse,
  Card,
  Group,
  Popover,
  ActionIcon,
  Space,
} from "@mantine/core";
import { IconClockPlus } from "@tabler/icons-react";
import FilterActionIcon from "@/components/UI/ActionIcons/FilterActionIcon";
import PayoutActionIcon from "@/components/UI/ActionIcons/PayoutActionIcon";
import ProjectFilter from "@/components/Work/Project/ProjectFilter";
import HourlyPayoutCard from "@/components/Finances/Payout/HourlyPayout/HourlyPayoutCard";
import ProjectPayoutCard from "@/components/Finances/Payout/ProjectPayout/ProjectPayoutCard";
import PayoutConversionModal from "@/components/Finances/Payout/PayoutConversionModal";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import NewSessionModal from "@/components/Work/Session/NewSessionModal";
import SessionSelector from "@/components/Work/Session/SessionSelector";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import { WorkProject, WorkTimeEntry } from "@/types/work.types";
import { Currency } from "@/types/settings.types";

interface ProjectToolbarProps {
  projectTimeEntries: WorkTimeEntry[];
  timeFilteredTimeEntries: WorkTimeEntry[];
  project: WorkProject;
}

export default function ProjectToolbar({
  projectTimeEntries,
  timeFilteredTimeEntries,
  project,
}: ProjectToolbarProps) {
  const { getLocalizedText, formatDate } = useIntl();
  const {
    filterOpened,
    newWorkTimeEntryFormOpened: sessionFormOpened,
    payoutOpened,
    payoutConversionOpened,
    filterTimeSpan,
    selectedModeActive,
    selectedTimeEntryIds,
    setSelectedTimeEntryIds,
    setFilterOpened,
    setNewWorkTimeEntryFormOpened: setSessionFormOpened,
    setPayoutOpened,
    setPayoutConversionOpened,
    setFilterTimeSpan,
    setSelectedModeActive,
    toggleFilterOpened,
    togglePayoutOpened,
    toggleSelectedModeActive,
  } = useWorkStore();
  const { addHourlyPayout } = usePayoutMutations();
  const { mainBackgroundColor } = useSettingsStore();
  const [payoutConvertionStartValues, setPayoutConvertionStartValues] =
    useState<{
      value: number;
      timeEntries: WorkTimeEntry[];
    }>({
      value: 0,
      timeEntries: [],
    });

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
  }, [
    selectedTimeEntryIds.length,
    timeFilteredTimeEntries,
    setSelectedTimeEntryIds,
  ]);

  const selectAllTimeEntries = useCallback(() => {
    setSelectedModeActive(true);
    setSelectedTimeEntryIds(
      timeFilteredTimeEntries
        .filter((timeEntry) => !timeEntry.single_cash_flow_id)
        .map((timeEntry) => timeEntry.id)
    );
  }, [timeFilteredTimeEntries, setSelectedTimeEntryIds, setSelectedModeActive]);

  const _handlePayoutToggle = () => {
    if (!payoutOpened) {
      setPayoutOpened(true);
      setFilterOpened(false);
    } else {
      setPayoutOpened(false);
    }
  };

  const _handleFilterToggle = () => {
    if (!filterOpened) {
      setFilterOpened(true);
      setPayoutOpened(false);
    } else {
      setFilterOpened(false);
    }
  };

  const _handleSelectionToggle = () => {
    if (selectedModeActive) {
      setSelectedTimeEntryIds([]);
    }
    toggleSelectedModeActive();
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
    setPayoutConversionOpened(true);
  };

  const handleSessionPayout = (
    timeEntries: WorkTimeEntry[],
    endCurrency?: Currency,
    endValue?: number
  ) => {
    if (!project) return;
    const title = `${getLocalizedText("Auszahlung", "Payout")} (${project.title}) ${formatDate(new Date())}`;

    addHourlyPayout(project, title, timeEntries, endCurrency, endValue);
    // setSelectedTimeEntryIds([]);
    setSelectedModeActive(false);
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
    <Stack
      style={{
        position: "sticky",
        top: 20,
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
              onClose={() => setFilterOpened(false)}
              onOpen={() => setFilterOpened(true)}
              transitionProps={{ transition: "fade-down", duration: 300 }}
              position="bottom-start"
              trapFocus
              returnFocus
            >
              <Popover.Target>
                <FilterActionIcon
                  disabled={timeFilteredTimeEntries.length === 0}
                  onClick={toggleFilterOpened}
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
              onClose={() => setPayoutOpened(false)}
              onOpen={() => setPayoutOpened(true)}
              transitionProps={{ transition: "fade-down", duration: 300 }}
              position="bottom-start"
              trapFocus
              returnFocus
            >
              <Popover.Target>
                <PayoutActionIcon
                  onClick={togglePayoutOpened}
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
              onClick={() => setSessionFormOpened(true)}
              size="md"
              variant="subtle"
            >
              <IconClockPlus />
            </ActionIcon>
          </DelayedTooltip>
          <NewSessionModal
            opened={sessionFormOpened}
            onClose={() => setSessionFormOpened(false)}
            project={project}
          />
          <Popover
            opened={selectedModeActive}
            onClose={() => setSelectedModeActive(false)}
            onOpen={() => setSelectedModeActive(true)}
            transitionProps={{ transition: "fade-down", duration: 300 }}
            position="bottom-end"
            trapFocus
            returnFocus
          >
            <Popover.Target>
              <SelectActionIcon
                disabled={selectableSessions.length === 0}
                onClick={toggleSelectedModeActive}
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
        handleClose={() => setPayoutConversionOpened(false)}
        startValue={payoutConvertionStartValues.value}
        startCurrency={project.currency}
        onSubmit={(values) => {
          handleSessionPayout(
            payoutConvertionStartValues.timeEntries,
            values.endCurrency,
            values.endValue
          );
          setPayoutConversionOpened(false);
        }}
        isProcessing={false}
      />
    </Stack>
  );
}
