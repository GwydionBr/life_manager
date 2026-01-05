import { useIntl } from "@/hooks/useIntl";
import {
  tagsCollection,
  useTags,
} from "@/db/collections/finance/tags/tags-collection";

import { Text } from "@mantine/core";
import { IconCategoryPlus, IconTagPlus, IconTags } from "@tabler/icons-react";
import FinanceSettingsList from "@/components/Settings/Finances/FinanceSettingsList";
import FinanceCategoryForm from "@/components/Finances/Category/FinanceCategoryForm";
import { Tables } from "@/types/db.types";

export default function TagSettings() {
  const { getLocalizedText } = useIntl();
  const { data: financeCategories } = useTags();

  const renderRowContent = (category: Tables<"finance_category">) => (
    <>
      <Text fz="sm" fw={500}>
        {category.title}
      </Text>
      <Text fz="xs" c="dimmed">
        {category.description}
      </Text>
    </>
  );

  const renderEditForm = (
    category: Tables<"finance_category">,
    onClose: () => void
  ) => <FinanceCategoryForm onClose={onClose} category={category} />;

  const renderAddForm = (onClose: () => void) => (
    <FinanceCategoryForm onClose={onClose} />
  );

  return (
    <FinanceSettingsList
      items={financeCategories}
      isLoading={false}
      getId={(item) => item.id}
      getTitle={(item) => item.title}
      getDescription={(item) => item.description || undefined}
      renderRowContent={renderRowContent}
      renderEditForm={renderEditForm}
      renderAddForm={renderAddForm}
      onDelete={(ids) => tagsCollection.delete(ids)}
      titleText={getLocalizedText("Tags", "Tags")}
      emptyText={getLocalizedText("Keine Tags gefunden", "No tags found")}
      deleteTitle={getLocalizedText("Tag löschen", "Delete Tag")}
      deleteMessage={getLocalizedText(
        "Sind Sie sicher, dass Sie diese Tags löschen möchten",
        "Are you sure you want to delete these tags?"
      )}
      addText={getLocalizedText("Tag hinzufügen", "Add Tag")}
      editText={getLocalizedText("Tag bearbeiten", "Edit Tag")}
      selectTooltip={getLocalizedText("Tag auswählen", "Select Tag")}
      titleIcon={<IconTags />}
      addIcon={<IconTagPlus />}  
    />
  );
}
