import { useIntl } from "@/hooks/useIntl";
import {
  tagsCollection,
  useTags,
} from "@/db/collections/finance/tags/tags-collection";

import { Text } from "@mantine/core";
import { IconTagPlus, IconTags } from "@tabler/icons-react";
import FinanceSettingsList from "@/components/Settings/Finances/FinanceSettingsList";
import FinanceTagForm from "@/components/Finances/Tag/TagForm";
import { Tables } from "@/types/db.types";

export default function TagSettings() {
  const { getLocalizedText } = useIntl();
  const { data: tags } = useTags();

  const renderRowContent = (tag: Tables<"tag">) => (
    <>
      <Text fz="sm" fw={500}>
        {tag.title}
      </Text>
      <Text fz="xs" c="dimmed">
        {tag.description}
      </Text>
    </>
  );

  const renderEditForm = (
    tag: Tables<"tag">,
    onClose: () => void
  ) => <FinanceTagForm onClose={onClose} tag={tag} />;

  const renderAddForm = (onClose: () => void) => (
    <FinanceTagForm onClose={onClose} />
  );

  return (
    <FinanceSettingsList
      items={tags}
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
