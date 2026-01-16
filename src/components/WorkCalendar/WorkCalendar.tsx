import { useHotkeys } from "@mantine/hooks";
import { useWorkCalendar } from "@/hooks/useWorkCalendar";

import { ScrollArea, Stack } from "@mantine/core";
import CalendarGrid from "./Calendar/CalendarGrid";
import MonthCalendarGrid from "./Calendar/Month/MonthCalendarGrid";
import EditTimeEntryDrawer from "@/components/Work/WorkTimeEntry/EditTimeEntryDrawer";
import EditAppointmentDrawer from "./Appointment/EditAppointmentDrawer";
import NewCalendarEntryModal from "./CalendarEntry/NewCalendarEntryModal";
import CalendarLegend from "./Calendar/CalendarLegend";

export default function WorkCalendar() {
  const {
    // Data
    calendarDays,
    visibleProjects,

    // State
    drawerOpened,
    appointmentDrawerOpened,
    newAppointmentModalOpened,
    selectedSession,
    selectedAppointment,
    selectedProject,
    addingMode,
    viewMode,
    rasterHeight,
    hourMultiplier,
    clickedDate,

    // Refs
    viewport,

    // Actions
    closeDrawer,
    closeAppointmentDrawer,
    closeNewAppointmentModal,
    handleCreateAppointment,
    handleReferenceDateChange,
    handleNextAndPrev,
    handleTimeEntryClick: handleSessionClick,
    handleAppointmentClick,
    handleScrollToNow,
    setAddingMode,
    handleDayClick,
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
    [
      "mod + Shift + A",
      () => {
        handleCreateAppointment();
      },
    ],
  ]);

  return (
    <ScrollArea
      viewportRef={viewport}
      h="calc(100vh - 55px)"
      type="never"
      scrollbars={viewMode === "month" ? false : "y"}
    >
      <Stack>
        {viewMode === "month" ? (
          <MonthCalendarGrid
            handleNextAndPrev={handleNextAndPrev}
            days={calendarDays}
            handleSessionClick={handleSessionClick}
            handleAppointmentClick={handleAppointmentClick}
            handleDayClick={handleDayClick}
          />
        ) : (
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
        )}
      </Stack>
      <CalendarLegend
        visibleProjects={visibleProjects}
        handleScrollToNow={handleScrollToNow}
        onCreateAppointment={handleCreateAppointment}
      />
      {selectedSession && selectedProject && (
        <EditTimeEntryDrawer
          timeEntry={selectedSession}
          project={selectedProject}
          opened={drawerOpened}
          onClose={closeDrawer}
        />
      )}
      {selectedAppointment && (
        <EditAppointmentDrawer
          appointment={selectedAppointment}
          project={
            selectedAppointment.work_project_id
              ? visibleProjects.find(
                  (p) => p.id === selectedAppointment.work_project_id
                )
              : undefined
          }
          opened={appointmentDrawerOpened}
          onClose={closeAppointmentDrawer}
        />
      )}
      <NewCalendarEntryModal
        opened={newAppointmentModalOpened}
        onClose={closeNewAppointmentModal}
        initialStartDate={
          viewMode === "month" && clickedDate
            ? new Date(
                clickedDate.getFullYear(),
                clickedDate.getMonth(),
                clickedDate.getDate(),
                9,
                0
              )
            : undefined
        }
        initialEndDate={
          viewMode === "month" && clickedDate
            ? new Date(
                clickedDate.getFullYear(),
                clickedDate.getMonth(),
                clickedDate.getDate(),
                10,
                0
              )
            : undefined
        }
      />
    </ScrollArea>
  );
}
