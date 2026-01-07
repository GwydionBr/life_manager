import { useIntl } from "@/hooks/useIntl";
import { useTags } from "@/db/collections/finance/tags/use-tags-query";

import {
  Group,
  Text,
  Checkbox,
  Stack,
  Button,
  Select,
  Divider,
  Slider,
  Badge,
  Collapse,
  MultiSelect,
  Switch,
  Card,
} from "@mantine/core";

import type { Tables } from "@/types/db.types";
import type { TimePreset } from "@/types/workTimeEntry.types";
import type { FilterLogic } from "@/hooks/useTimeEntryFiltering";

interface TimeEntryFilterProps {
  unpaidTimeEntries: Tables<"work_time_entry">[];
  selectedTimeEntries: string[];
  projects?: Tables<"work_project">[];
  folders?: Tables<"work_folder">[];
  isOverview: boolean;
  timePresets: TimePreset[];
  selectedTimePreset: string | null;
  timeFilterDays: number;
  // New filter props
  filterState?: {
    selectedProjects: string[];
    selectedFolders: string[];
    selectedCategories: string[];
    filterLogic: FilterLogic;
  };
  onTimeEntriesChange: (timeEntries: string[]) => void;
  onTimePresetChange: (preset: string | null) => void;
  onCustomDaysChange: (days: number) => void;
  onSetDaysForPreset?: (days: number) => void;
  onProjectFilterChange?: (projectIds: string[]) => void;
  onFolderFilterChange?: (folderIds: string[]) => void;
  onCategoryFilterChange?: (categoryIds: string[]) => void;
  onFilterLogicChange?: (logic: FilterLogic) => void;
  onClearAllFilters?: () => void;
}

/**
 * Bulk selection controls for timer time entries with filtering capabilities
 * Allows users to select multiple time entries by various criteria (project, folder, time period)
 */
export default function TimeEntryFilter({
  unpaidTimeEntries,
  selectedTimeEntries,
  projects,
  folders,
  isOverview,
  timePresets,
  selectedTimePreset,
  timeFilterDays,
  filterState,
  onTimeEntriesChange,
  onTimePresetChange,
  onCustomDaysChange,
  onSetDaysForPreset,
  onProjectFilterChange,
  onFolderFilterChange,
  onCategoryFilterChange,
  onFilterLogicChange,
  onClearAllFilters,
}: TimeEntryFilterProps) {
  const { getLocalizedText } = useIntl();
  const { data: financeCategories } = useTags();

  // Toggle between selecting all time entries or none
  const handleSelectAll = () => {
    if (selectedTimeEntries.length === unpaidTimeEntries.length) {
      onTimeEntriesChange([]);
    } else {
      onTimeEntriesChange(unpaidTimeEntries.map((s) => s.id));
    }
  };

  // Handle time preset changes and update days accordingly
  const handleTimePresetChange = (preset: string | null) => {
    onTimeEntriesChange([]);
    onTimePresetChange(preset);
    if (preset && preset !== "custom") {
      const presetData = timePresets.find((p) => p.value === preset);
      if (presetData) {
        onSetDaysForPreset?.(presetData.days);
      }
    }
  };

  // Update custom days and set preset to custom
  const handleCustomDaysChange = (days: number) => {
    onCustomDaysChange(days);
    onTimePresetChange("custom");
  };

  const getProjects = () => {
    if (!projects) return [];

    return projects.map((project) => ({
      value: project.id,
      label: project.title,
    }));
  };

  const getCashFlowCategories = () => {
    if (!financeCategories) return [];

    return financeCategories.map((category) => ({
      value: category.id,
      label: category.title,
    }));
  };

  const getFolders = () => {
    if (!folders) return [];

    return folders.map((folder) => ({
      value: folder.id,
      label: folder.title,
    }));
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedTimePreset !== null ||
    (filterState &&
      (filterState.selectedProjects.length > 0 ||
        filterState.selectedFolders.length > 0 ||
        filterState.selectedCategories.length > 0));

  // Check if multiple filters are active
  const hasMultipleFilters =
    (selectedTimePreset !== null ? 1 : 0) +
      ((filterState?.selectedProjects?.length || 0) > 0 ? 1 : 0) +
      ((filterState?.selectedFolders?.length || 0) > 0 ? 1 : 0) +
      ((filterState?.selectedCategories?.length || 0) > 0 ? 1 : 0) >
    1;

  return (
    <Card
      withBorder
      radius="md"
      p="md"
      mb="md"
      shadow="md"
      maw={700}
      bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
    >
      <Stack gap="xs" style={{ flex: 1 }}>
        <Group>
          <Checkbox
            label={`${getLocalizedText("Alle auswählen", "Select All")} (${unpaidTimeEntries.length} ${getLocalizedText("unbezahlte Zeit-Einträge", "unpaid time entries")})`}
            checked={
              selectedTimeEntries.length === unpaidTimeEntries.length &&
              unpaidTimeEntries.length > 0
            }
            indeterminate={
              selectedTimeEntries.length > 0 &&
              selectedTimeEntries.length < unpaidTimeEntries.length
            }
            onChange={handleSelectAll}
            disabled={unpaidTimeEntries.length === 0}
          />
          <Stack gap="xs" align="flex-end">
            {unpaidTimeEntries.length > 0 && selectedTimeEntries.length > 0 && (
              <Text size="sm" c="dimmed">
                {selectedTimeEntries.length}{" "}
                {getLocalizedText("Zeit-Eintrag", "time entry")}
                {selectedTimeEntries.length > 1 ? "en" : ""}{" "}
                {getLocalizedText("ausgewählt", "selected")}
              </Text>
            )}
            {unpaidTimeEntries.length === 0 && (
              <Text size="sm" c="dimmed">
                {getLocalizedText(
                  "Alle Zeit-Einträge bezahlt",
                  "All time entries paid"
                )}
              </Text>
            )}
          </Stack>
        </Group>

        {/* Time Period Filtering - now available in both modes */}
        <Divider my="xs" />
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            {getLocalizedText(
              "Zeit-Einträge nach Zeitrahmen filtern",
              "Select Time Entries by Time Period"
            )}
          </Text>
          <Group gap="md" align="flex-end">
            <Select
              label={getLocalizedText("Zeitrahmen", "Time Period")}
              placeholder={getLocalizedText(
                "Zeitrahmen auswählen",
                "Select a time period"
              )}
              data={timePresets.map((preset) => ({
                value: preset.value,
                label: preset.label,
              }))}
              value={selectedTimePreset}
              onChange={handleTimePresetChange}
              clearable
              style={{ flex: 1 }}
            />
            {selectedTimePreset && !isOverview && (
              <Button size="sm" onClick={handleSelectAll} variant="light">
                {selectedTimeEntries.length === unpaidTimeEntries.length
                  ? getLocalizedText(
                      "Alle Zeit-Einträge abwählen",
                      "Deselect all Time Entries"
                    )
                  : getLocalizedText(
                      `Alle unbezahlten Zeit-Einträge auswählen (${unpaidTimeEntries.length})`,
                      `Select ${unpaidTimeEntries.length} unpaid time entries`
                    )}
              </Button>
            )}
          </Group>
          {selectedTimePreset === "custom" && (
            <Stack gap="xs">
              <Text size="sm">
                {getLocalizedText("Benutzerdefinierte Tage", "Custom Days")}:{" "}
                {timeFilterDays}
              </Text>
              <Slider
                value={timeFilterDays}
                onChange={handleCustomDaysChange}
                min={1}
                max={365}
                mb="xl"
                step={1}
                marks={[
                  { value: 1, label: "1" },
                  { value: 7, label: "7" },
                  { value: 30, label: "30" },
                  { value: 90, label: "90" },
                  { value: 365, label: "365" },
                ]}
              />
            </Stack>
          )}
          <Collapse in={selectedTimePreset !== null && !isOverview}>
            <Badge
              color={unpaidTimeEntries.length > 0 ? "blue" : "red"}
              variant="light"
            >
              {unpaidTimeEntries.length}{" "}
              {getLocalizedText(
                "unbezahlte Zeit-Einträge",
                "unpaid time entries"
              )}
              {getLocalizedText("in letzten", "in last")} {timeFilterDays}{" "}
              {getLocalizedText("Tagen", "days")}
            </Badge>
          </Collapse>
        </Stack>

        {/* Project-based filtering for overview mode */}
        {isOverview && projects && projects.length > 0 && (
          <>
            <Divider my="xs" />
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                {getLocalizedText(
                  "Zeit-Einträge nach Projektkriterien filtern",
                  "Filter Time Entries by Project Criteria"
                )}
              </Text>

              {/* Filter Controls */}
              <Group gap="md" align="flex-end">
                <MultiSelect
                  label={getLocalizedText(
                    "Nach Ordner filtern",
                    "Filter by Folders"
                  )}
                  placeholder={getLocalizedText(
                    "Ordner auswählen",
                    "Choose folders"
                  )}
                  data={getFolders()}
                  value={filterState?.selectedFolders || []}
                  onChange={onFolderFilterChange}
                  clearable
                  style={{ flex: 1 }}
                />
                <MultiSelect
                  label={getLocalizedText(
                    "Nach Projekt filtern",
                    "Filter by Projects"
                  )}
                  placeholder={getLocalizedText(
                    "Projekt auswählen",
                    "Choose projects"
                  )}
                  data={getProjects()}
                  value={filterState?.selectedProjects || []}
                  onChange={onProjectFilterChange}
                  clearable
                  style={{ flex: 1 }}
                />
                <MultiSelect
                  label={getLocalizedText(
                    "Nach Kategorie filtern",
                    "Filter by Categories"
                  )}
                  placeholder={getLocalizedText(
                    "Kategorie auswählen",
                    "Choose categories"
                  )}
                  data={getCashFlowCategories()}
                  value={filterState?.selectedCategories || []}
                  onChange={onCategoryFilterChange}
                  clearable
                  style={{ flex: 1 }}
                />
              </Group>

              {/* Elegant AND/OR Logic Selection - only show when multiple filters are active */}
              <Collapse in={hasMultipleFilters || false}>
                <Group gap="xs" align="center">
                  <Switch
                    size="sm"
                    checked={filterState?.filterLogic === "AND"}
                    onChange={(event) =>
                      onFilterLogicChange?.(
                        event.currentTarget.checked ? "AND" : "OR"
                      )
                    }
                    label={
                      <Text size="sm">
                        {filterState?.filterLogic === "AND"
                          ? getLocalizedText(
                              "Alle Filter müssen zutreffen (UND)",
                              "All filters must match (AND)"
                            )
                          : getLocalizedText(
                              "Ein Filter kann zutreffen (ODER)",
                              "Any filter can match (OR)"
                            )}
                      </Text>
                    }
                  />
                  <Text size="xs" c="dimmed">
                    {filterState?.filterLogic === "AND"
                      ? getLocalizedText(
                          "Zeit-Einträge müssen allen ausgewählten Kriterien entsprechen",
                          "Time entries must belong to ALL selected criteria"
                        )
                      : getLocalizedText(
                          "Zeit-Einträge können einem der ausgewählten Kriterien entsprechen",
                          "Time entries can belong to ANY selected criteria"
                        )}
                  </Text>
                </Group>
              </Collapse>
              <Collapse in={hasActiveFilters || false}>
                <Stack align="center">
                  <Badge
                    mt="md"
                    color={unpaidTimeEntries.length > 0 ? "blue" : "red"}
                    variant="light"
                  >
                    {unpaidTimeEntries.length}{" "}
                    {getLocalizedText(
                      "unbezahlte Zeit-Einträge",
                      "unpaid time entries"
                    )}
                    {getLocalizedText("in letzten", "in last")} {timeFilterDays}{" "}
                    {getLocalizedText("Tagen", "days")}
                  </Badge>
                </Stack>
              </Collapse>

              {/* Clear Filters Button */}
              <Collapse in={hasActiveFilters || false}>
                <Stack align="center">
                  <Stack mt="md" w="90%">
                    {isOverview && (
                      <Button
                        size="sm"
                        onClick={handleSelectAll}
                        variant="light"
                      >
                        {selectedTimeEntries.length === unpaidTimeEntries.length
                          ? getLocalizedText(
                              "Alle Zeit-Einträge abwählen",
                              "Deselect all Time Entries"
                            )
                          : getLocalizedText(
                              `Alle unbezahlten Zeit-Einträge auswählen (${unpaidTimeEntries.length})`,
                              `Select ${unpaidTimeEntries.length} unpaid time entries`
                            )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="light"
                      color="red"
                      onClick={onClearAllFilters}
                    >
                      {getLocalizedText(
                        "Alle Filter löschen",
                        "Clear All Filters"
                      )}
                    </Button>
                  </Stack>
                </Stack>
              </Collapse>
            </Stack>
          </>
        )}
      </Stack>
    </Card>
  );
}
