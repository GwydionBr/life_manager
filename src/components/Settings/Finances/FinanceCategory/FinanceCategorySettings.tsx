import { useIntl } from "@/hooks/useIntl";
import {
  financeCategoriesCollection,
  useFinanceCategories,
} from "@/db/collections/finance/finance-category/finance-category-collection";

import { Text } from "@mantine/core";
import { IconCategoryPlus } from "@tabler/icons-react";
import FinanceSettingsList from "@/components/Settings/Finances/FinanceSettingsList";
import FinanceCategoryForm from "@/components/Finances/Category/FinanceCategoryForm";
import { Tables } from "@/types/db.types";

export default function FinanceCategorySettings() {
  const { getLocalizedText } = useIntl();
  const { data: financeCategories } = useFinanceCategories();

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
      onDelete={(ids) => financeCategoriesCollection.delete(ids)}
      titleText={getLocalizedText("Finanz Kategorien", "Finance Categories")}
      emptyText={getLocalizedText(
        "Keine Kategorien gefunden",
        "No categories found"
      )}
      deleteTitle={getLocalizedText("Kategorie löschen", "Delete Category")}
      deleteMessage={getLocalizedText(
        "Sind Sie sicher, dass Sie diese Kategorien löschen möchten",
        "Are you sure you want to delete these categories?"
      )}
      addText={getLocalizedText("Kategorie hinzufügen", "Add Category")}
      editText={getLocalizedText("Kategorie bearbeiten", "Edit category")}
      selectTooltip={getLocalizedText("Kategorie auswählen", "Select category")}
      titleIcon={<IconCategoryPlus />}
      addIcon={<IconCategoryPlus />}
    />
  );
}
