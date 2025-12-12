import { useIntl } from "@/hooks/useIntl";

import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import { Group, Modal, Text } from "@mantine/core";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";

interface FinanceSettingsHeaderProps {
  titleIcon?: React.ReactNode;
  titleText: string;
  onAdd?: () => void;
  addDisabled?: boolean;
  selectDisabled?: boolean;
  selectedModeActive?: boolean;
  toggleSelectedMode?: () => void;
  modalTitle?: React.ReactNode;
  modalOpened?: boolean;
  modalOnClose?: () => void;
  modalChildren?: React.ReactNode;
}

/**
 * @description - The Header Component for the Finance Settings
 * @param titleText - The text to display in the title (required)
 * @param titleIcon - The icon to display in the title (optional)
 * @param onAdd - The function to call when the add button is clicked (optional)
 * @param addDisabled - Whether the add button is disabled (optional)
 * @param selectDisabled - Whether the select button is disabled (optional)
 * @param selectedModeActive - Whether the selected mode is active (optional)
 * @param toggleSelectedMode - The function to call when the selected mode is toggled (optional)
 * @param modalTitle - The title to display in the modal (optional)
 * @param modalOpened - Whether the modal is opened (optional)
 * @param modalOnClose - The function to call when the modal is closed (optional)
 * @param modalChildren - The children to display in the modal (optional)
 */

export default function FinanceSettingsHeader({
  titleText,
  titleIcon,
  onAdd = () => {},
  addDisabled = false,
  selectDisabled = false,
  selectedModeActive = false,
  toggleSelectedMode = () => {},
  modalTitle = null,
  modalOpened = false,
  modalChildren = null,
  modalOnClose = () => {},
}: FinanceSettingsHeaderProps) {
  const { getLocalizedText } = useIntl();
  return (
    <Group justify="space-between" w="100%">
      <PlusActionIcon onClick={onAdd} disabled={addDisabled} />
      <Modal
        opened={modalOpened}
        onClose={modalOnClose}
        closeOnClickOutside
        withOverlay
        trapFocus
        returnFocus
        title={modalTitle}
        size="md"
        padding="md"
      >
        {modalChildren}
      </Modal>
      <Group
        align="center"
        gap="xs"
        mb="md"
        style={{
          borderBottom:
            "1px solid light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))",
        }}
      >
        <Group>
          {titleIcon}
          <Text fw={500} fz="lg">
            {titleText}
          </Text>
        </Group>
      </Group>
      <SelectActionIcon
        disabled={selectDisabled}
        tooltipLabel={getLocalizedText(
          "Aktiviere Mehrfachauswahl",
          "Activate bulk select"
        )}
        mainControl
        selected={selectedModeActive}
        onClick={toggleSelectedMode}
      />
    </Group>
  );
}
