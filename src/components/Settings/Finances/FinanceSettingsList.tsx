import { useDisclosure } from "@mantine/hooks";
import { useIntl } from "@/hooks/useIntl";
import { useSelectionManager } from "@/hooks/useSelectionManager";
import { useDeleteConfirmation } from "@/hooks/useDeleteConfirmation";

import { Stack, Text, Skeleton, Group, Collapse } from "@mantine/core";
import FinanceSettingsHeader from "@/components/Settings/Finances/FinanceSettingsHeader";
import FinanceSettingsRow from "@/components/Settings/Finances/FinanceSettingsRow";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";

interface FinanceSettingsListProps<T> {
  // Data
  items: T[];
  isLoading: boolean;

  // Configuration
  getId: (item: T) => string;
  getTitle: (item: T) => string;
  getDescription?: (item: T) => string | undefined;

  // Components
  renderRowContent: (item: T) => React.ReactNode;
  renderEditForm?: (item: T, onClose: () => void) => React.ReactNode;
  renderAddForm: (onClose: () => void) => React.ReactNode;

  // Actions
  onDelete: (ids: string[]) => void;

  // Localization
  titleText: string;
  emptyText: string;
  deleteTitle: string;
  deleteMessage: string;
  addText: string;
  editText: string;
  selectTooltip: string;

  // Icons
  titleIcon: React.ReactNode;
  addIcon: React.ReactNode;
}

export default function FinanceSettingsList<T>({
  items,
  isLoading,
  getId,
  getTitle,
  getDescription,
  renderRowContent,
  renderEditForm,
  renderAddForm,
  onDelete,
  titleText,
  emptyText,
  deleteTitle,
  deleteMessage,
  addText,
  editText,
  selectTooltip,
  titleIcon,
  addIcon,
}: FinanceSettingsListProps<T>) {
  const { getLocalizedText } = useIntl();
  const [isAddFormOpen, { open: openAddForm, close: closeAddForm }] =
    useDisclosure(false);
  const [selectedModeActive, { toggle: toggleSelectedMode }] =
    useDisclosure(false);

  const {
    selectedIds,
    itemIdList,
    toggleAll,
    toggleSelection,
    isAllSelected,
    isPartiallySelected,
  } = useSelectionManager({
    items,
    getId,
    selectedModeActive,
  });

  const { showDeleteModal } = useDeleteConfirmation({
    items,
    getId,
    getTitle,
    getDescription,
    deleteTitle,
    deleteMessage,
    onConfirm: onDelete,
  });

  const handleDelete = (ids: string[]) => {
    showDeleteModal(ids);
  };

  return (
    <Group w="100%">
      <Stack align="center" w="100%">
        <FinanceSettingsHeader
          onAdd={openAddForm}
          addDisabled={isLoading}
          selectDisabled={isLoading || items.length === 0}
          selectedModeActive={selectedModeActive}
          toggleSelectedMode={toggleSelectedMode}
          modalTitle={
            <Group>
              {addIcon}
              <Text>{addText}</Text>
            </Group>
          }
          modalChildren={renderAddForm(closeAddForm)}
          modalOpened={isAddFormOpen}
          modalOnClose={closeAddForm}
          titleIcon={titleIcon}
          titleText={titleText}
        />
        {!isLoading && items.length === 0 ? (
          <Text fz="sm" c="dimmed">
            {emptyText}
          </Text>
        ) : (
          <Stack gap={0} align="center" w="100%" maw={500}>
            <Collapse in={selectedModeActive} w="100%">
              <Group w="100%" justify="space-between">
                <Group onClick={toggleAll} style={{ cursor: "pointer" }}>
                  <SelectActionIcon
                    onClick={() => {}}
                    selected={isAllSelected}
                    partiallySelected={isPartiallySelected}
                  />
                  <Text fz="sm" c="dimmed">
                    {getLocalizedText("Alle", "All")}
                  </Text>
                </Group>
                <DeleteActionIcon
                  disabled={selectedIds.length === 0}
                  onClick={() => handleDelete(selectedIds)}
                />
              </Group>
            </Collapse>
            <Stack gap="xs" align="center" w="100%" pt="xs">
              {isLoading
                ? Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} w="100%" h={60} radius="md" maw={500} />
                  ))
                : items.map((item, index) => (
                    <FinanceSettingsRow
                      key={getId(item)}
                      item={item}
                      itemId={getId(item)}
                      selectedModeActive={selectedModeActive}
                      isSelected={selectedIds.includes(getId(item))}
                      onToggleSelected={(e) =>
                        toggleSelection(getId(item), index, e.shiftKey)
                      }
                      onDelete={handleDelete}
                      renderContent={renderRowContent}
                      renderEditForm={renderEditForm}
                      selectTooltip={selectTooltip}
                      editText={editText}
                    />
                  ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Group>
  );
}
