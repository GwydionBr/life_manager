import { useIntl } from "@/hooks/useIntl";
import { contactsCollection } from "@/db/collections/finance/contacts/contact-collection";
import { useContacts } from "@/db/collections/finance/contacts/use-contact-query";

import { Group, Text } from "@mantine/core";
import { IconUserPlus, IconUsers } from "@tabler/icons-react";
import FinanceSettingsList from "@/components/Settings/Finances/FinanceSettingsList";
import ContactsForm from "@/components/Finances/Contact/ContactForm";
import { Tables } from "@/types/db.types";

export default function FinanceContactSettings() {
  const { getLocalizedText, getCurrencySymbol } = useIntl();
  const { data: contacts } = useContacts();

  const renderRowContent = (contact: Tables<"contact">) => (
    <>
      <Group>
        <Text fz="sm" fw={500}>
          {contact.name}
        </Text>
        {contact.currency && (
          <Text fz="xs" c="dimmed">
            {getCurrencySymbol(contact.currency)}
          </Text>
        )}
      </Group>
      {contact.description && (
        <Text fz="xs" c="dimmed">
          {contact.description}
        </Text>
      )}
      {contact.email && (
        <Text fz="xs" c="dimmed">
          {contact.email}
        </Text>
      )}
      {contact.phone && (
        <Text fz="xs" c="dimmed">
          {contact.phone}
        </Text>
      )}
      {contact.address && (
        <Text fz="xs" c="dimmed">
          {contact.address}
        </Text>
      )}
    </>
  );

  const renderEditForm = (contact: Tables<"contact">, onClose: () => void) => (
    <ContactsForm onClose={onClose} contact={contact} />
  );

  const renderAddForm = (onClose: () => void) => (
    <ContactsForm onClose={onClose} />
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
