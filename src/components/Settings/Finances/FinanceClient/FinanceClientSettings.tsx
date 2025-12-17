import { useIntl } from "@/hooks/useIntl";
import {
  contactsCollection,
  useContacts,
} from "@/db/collections/finance/contacts/contact-collection";

import { Group, Text } from "@mantine/core";
import { IconUserPlus, IconUsers } from "@tabler/icons-react";
import FinanceSettingsList from "@/components/Settings/Finances/FinanceSettingsList";
import FinanceClientForm from "@/components/Finances/FinanceClient/FinanceClientForm";
import { Tables } from "@/types/db.types";

export default function FinanceClientSettings() {
  const { getLocalizedText, getCurrencySymbol } = useIntl();
  const { data: contacts } = useContacts();

  const renderRowContent = (client: Tables<"finance_client">) => (
    <>
      <Group>
        <Text fz="sm" fw={500}>
          {client.name}
        </Text>
        {client.currency && (
          <Text fz="xs" c="dimmed">
            {getCurrencySymbol(client.currency)}
          </Text>
        )}
      </Group>
      {client.description && (
        <Text fz="xs" c="dimmed">
          {client.description}
        </Text>
      )}
      {client.email && (
        <Text fz="xs" c="dimmed">
          {client.email}
        </Text>
      )}
      {client.phone && (
        <Text fz="xs" c="dimmed">
          {client.phone}
        </Text>
      )}
      {client.address && (
        <Text fz="xs" c="dimmed">
          {client.address}
        </Text>
      )}
    </>
  );

  const renderEditForm = (
    client: Tables<"finance_client">,
    onClose: () => void
  ) => <FinanceClientForm onClose={onClose} client={client} />;

  const renderAddForm = (onClose: () => void) => (
    <FinanceClientForm onClose={onClose} />
  );

  return (
    <FinanceSettingsList
      items={contacts}
      isLoading={false}
      getId={(item) => item.id}
      getTitle={(item) => item.name}
      getDescription={(item) => item.description || undefined}
      renderRowContent={renderRowContent}
      renderEditForm={renderEditForm}
      renderAddForm={renderAddForm}
      onDelete={(ids) => contactsCollection.delete(ids)}
      titleText={getLocalizedText("Kontakte", "Contacts")}
      emptyText={getLocalizedText(
        "Keine Kontakte gefunden",
        "No contacts found"
      )}
      deleteTitle={getLocalizedText("Kontakt löschen", "Delete Contact")}
      deleteMessage={getLocalizedText(
        "Sind Sie sicher, dass Sie diese Kontakte löschen möchten",
        "Are you sure you want to delete these contacts"
      )}
      addText={getLocalizedText("Kontakt hinzufügen", "Add Contact")}
      editText={getLocalizedText("Kontakt bearbeiten", "Edit Contact")}
      selectTooltip={getLocalizedText("Kontakt auswählen", "Select Contact")}
      titleIcon={<IconUsers size={20} />}
      addIcon={<IconUserPlus />}
    />
  );
}
