import { useHotkeys } from "@mantine/hooks";
import { useWorkCalendar } from "@/hooks/useWorkCalendar";

import { ScrollArea, Stack } from "@mantine/core";
import CalendarGrid from "./Calendar/CalendarGrid";
import EditTimeEntryDrawer from "@/components/Work/WorkTimeEntry/EditTimeEntryDrawer";
import CalendarLegend from "./Calendar/CalendarLegend";

export default function WorkCalendar() {
  const {
    // Data
    calendarDays,
    visibleProjects,

    // State
    drawerOpened,
    selectedSession,
    selectedProject,
    addingMode,
    rasterHeight,
    hourMultiplier,

    // Refs
    viewport,

    // Actions
    closeDrawer,
    handleReferenceDateChange,
    handleNextAndPrev,
    handleSessionClick,
    handleAppointmentClick,
    handleScrollToNow,
    setAddingMode,
  } = useWorkCalendar();

  useHotkeys([
    [
      "Escape",
      () => {
        if (addingMode) {
          setAddingMode(false);
        }
      },
    ],
    [
      "mod + Enter",
      () => {
        if (!addingMode) {
          setAddingMode(true);
        }
      },
    ],
  ]);

  return (
    <ScrollArea
      viewportRef={viewport}
      h="calc(100vh - 55px)"
      type="never"
      scrollbars="y"
    >
      <Stack>
        <CalendarGrid
          visibleProjects={visibleProjects}
          handleNextAndPrev={handleNextAndPrev}
          isFetching={false}
          days={calendarDays}
          setReferenceDate={handleReferenceDateChange}
          handleSessionClick={handleSessionClick}
          handleAppointmentClick={handleAppointmentClick}
          hourMultiplier={hourMultiplier}
          rasterHeight={rasterHeight}
        />
      </Stack>
      <CalendarLegend
        visibleProjects={visibleProjects}
        handleScrollToNow={handleScrollToNow}
      />
      {selectedSession && selectedProject && (
        <EditTimeEntryDrawer
          timeEntry={selectedSession}
          project={selectedProject}
          opened={drawerOpened}
          onClose={closeDrawer}
        />
      )}
    </ScrollArea>
  );
}
