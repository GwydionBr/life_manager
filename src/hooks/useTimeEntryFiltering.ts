import { useState } from "react";
import type { Tables } from "@/types/db.types";
import { startOfDay, endOfDay } from "date-fns";
import { WorkProject, WorkTimeEntry } from "@/types/work.types";

// Filter logic determines how multiple filters are combined
export type FilterLogic = "AND" | "OR";

// Unified state for all filters (time, projects, folders, categories)
export interface FilterState {
  // Time filter properties
  timeFilterDays: number;

  // Project/folder/category filter properties
  selectedProjects: string[];
  selectedFolders: string[];
  selectedCategories: string[];
  filterLogic: FilterLogic;
}

/**
 * Hook for filtering time entries by time period, projects, folders, and categories
 * @param timeEntry - Array of time entries to filter
 * @param timeSpan - Time span for the filter
 * @param projects - Optional array of projects for project-based filtering
 * @param folders - Optional array of folders for folder-based filtering
 * @param isOverview - Whether we're in overview mode (affects unpaid    filtering)
 */
export function useTimeEntryFiltering(
  timeEntry: WorkTimeEntry[],
  timeSpan: [Date | null, Date | null],
  projects?: WorkProject[],
  folders?: Tables<"work_folder">[],
  isOverview = false
) {
  // Unified filter state for all filters
  const [filterState, setFilterState] = useState<FilterState>({
    timeFilterDays: 7,
    selectedProjects: [],
    selectedFolders: [],
    selectedCategories: [],
    filterLogic: "AND",
  });

  /**
   * Filters time entries by selected time period
   * Returns all time entries if no time preset is selected
   */
  const getTimeFilteredTimeEntries = () => {
    if (!timeSpan[0] || !timeSpan[1]) {
      return timeEntry;
    }

    let startDate = startOfDay(new Date(timeSpan[0]));
    let endDate = endOfDay(new Date(timeSpan[1]));

    return timeEntry.filter((timeEntry) => {
      const timeEntryDate = new Date(timeEntry.start_time);
      return timeEntryDate >= startDate && timeEntryDate <= endDate;
    });
  };

  /**
   * Main filtering function that combines time and project filters
   * Handles different scenarios based on active filters and filter logic
   */
  const getFilteredTimeEntries = () => {
    // If no project filters are active, just return time-filtered time entries
    if (
      !isOverview ||
      (!filterState.selectedProjects.length &&
        !filterState.selectedFolders.length &&
        !filterState.selectedCategories.length)
    ) {
      return getTimeFilteredTimeEntries();
    }

    // If no time filter is active, just filter by project criteria
    if (!timeSpan[0] || !timeSpan[1]) {
      return timeEntry.filter((timeEntry) => {
        const timeEntryProject = projects?.find(
          (p) => p.id === timeEntry.work_project_id
        );
        if (!timeEntryProject) return false;

        const conditions: boolean[] = [];

        // Project filter
        if (filterState.selectedProjects.length > 0) {
          conditions.push(
            filterState.selectedProjects.includes(timeEntry.work_project_id)
          );
        }

        // Folder filter
        if (filterState.selectedFolders.length > 0) {
          const folder = folders?.find(
            (f) => f.id === timeEntryProject.work_folder_id
          );
          conditions.push(
            !!(folder && filterState.selectedFolders.includes(folder.id))
          );
        }

        // Category filter
        if (filterState.selectedCategories.length > 0) {
          conditions.push(
            filterState.selectedCategories.some((categoryId) =>
              timeEntryProject.tags.some(
                (category) => category.id === categoryId
              )
            )
          );
        }

        // If no conditions, include all time entries
        if (conditions.length === 0) return true;

        // Apply filter logic (AND: all conditions must be true, OR: at least one must be true)
        if (filterState.filterLogic === "AND") {
          return conditions.every(Boolean);
        } else {
          return conditions.some(Boolean);
        }
      });
    }

    // Both time and project filters are active - combine them based on logic
    const timeFilteredTimeEntries = getTimeFilteredTimeEntries();

    return timeEntry.filter((timeEntry) => {
      const timeEntryProject = projects?.find(
        (p) => p.id === timeEntry.work_project_id
      );
      if (!timeEntryProject) return false;

      // Check if time entry matches time filter
      const matchesTimeFilter = timeFilteredTimeEntries.some(
        (timeEntry) => timeEntry.id === timeEntry.id
      );

      // Check if time entry matches project filters
      const projectConditions: boolean[] = [];

      // Project filter
      if (filterState.selectedProjects.length > 0) {
        projectConditions.push(
          filterState.selectedProjects.includes(timeEntry.work_project_id)
        );
      }

      // Folder filter
      if (filterState.selectedFolders.length > 0) {
        const folder = folders?.find(
          (f) => f.id === timeEntryProject.work_folder_id
        );
        projectConditions.push(
          !!(folder && filterState.selectedFolders.includes(folder.id))
        );
      }

      // Category filter
      if (filterState.selectedCategories.length > 0) {
        projectConditions.push(
          filterState.selectedCategories.some((categoryId) =>
            timeEntryProject.tags.some((category) => category.id === categoryId)
          )
        );
      }

      const matchesProjectFilter =
        projectConditions.length === 0
          ? true
          : filterState.filterLogic === "AND"
            ? projectConditions.every(Boolean)
            : projectConditions.some(Boolean);

      // Combine time and project filters based on logic
      if (filterState.filterLogic === "AND") {
        // AND: Must match both time AND project filters
        return matchesTimeFilter && matchesProjectFilter;
      } else {
        // OR: Must match either time OR project filters
        return matchesTimeFilter || matchesProjectFilter;
      }
    });
  };

  const filteredTimeEntries = getFilteredTimeEntries();

  /**
   * Filters out paid time entries for selection
   * In overview mode, checks project hourly_payment setting
   */
  const unpaidTimeEntries = filteredTimeEntries.filter((timeEntry) => {
    if (isOverview) {
      // In overview mode, we need to find the project for each time entry
      const timeEntryProject = projects?.find(
        (p) => p.id === timeEntry.work_project_id
      );
      if (!timeEntryProject) return false;

      // For hourly payment projects, check if time entry is paid
      if (timeEntryProject.hourly_payment) {
        return !timeEntry.single_cashflow_id;
      }
      return false;
    }

    // Normal mode - just check time entry.payed
    return !timeEntry.single_cashflow_id;
  });

  const handleCustomDaysChange = (days: number) => {
    setFilterState((prev) => ({
      ...prev,
      timeFilterDays: days,
      selectedTimePreset: "custom",
    }));
  };

  const handleSetDaysForPreset = (days: number) => {
    setFilterState((prev) => ({
      ...prev,
      timeFilterDays: days,
    }));
  };

  // Project/folder/category filter handlers
  const handleProjectFilterChange = (projectIds: string[]) => {
    setFilterState((prev) => ({ ...prev, selectedProjects: projectIds }));
  };

  const handleFolderFilterChange = (folderIds: string[]) => {
    setFilterState((prev) => ({ ...prev, selectedFolders: folderIds }));
  };

  const handleCategoryFilterChange = (categoryIds: string[]) => {
    setFilterState((prev) => ({ ...prev, selectedCategories: categoryIds }));
  };

  const handleFilterLogicChange = (logic: FilterLogic) => {
    setFilterState((prev) => ({ ...prev, filterLogic: logic }));
  };

  // Reset all filters to default state
  const clearAllFilters = () => {
    setFilterState({
      timeFilterDays: 7,
      selectedProjects: [],
      selectedFolders: [],
      selectedCategories: [],
      filterLogic: "AND",
    });
  };

  return {
    timeFilterDays: filterState.timeFilterDays,
    filteredTimeEntries,
    unpaidTimeEntries,
    filterState,
    handleCustomDaysChange,
    handleSetDaysForPreset,
    handleProjectFilterChange,
    handleFolderFilterChange,
    handleCategoryFilterChange,
    handleFilterLogicChange,
    clearAllFilters,
  };
}
