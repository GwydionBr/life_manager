import { useIntl } from "@/hooks/useIntl";
import {
  useDeleteFinanceClientMutation,
  useFinanceClientQuery,
} from "@/utils/queries/finances/use-finance-client";

import { Group, Text } from "@mantine/core";
import { IconUserPlus, IconUsers } from "@tabler/icons-react";
import FinanceSettingsList from "@/components/Settings/Finances/FinanceSettingsList";
import FinanceClientForm from "@/components/Finances/FinanceClient/FinanceClientForm";
import { Tables } from "@/types/db.types";

export default function FinanceClientSettings() {
  const { getLocalizedText, getCurrencySymbol } = useIntl();
  const { data: financeClients = [], isPending: isFetchingFinanceClients } =
    useFinanceClientQuery();
  const { mutate: deleteFinanceClientsMutation } =
    useDeleteFinanceClientMutation();

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
      items={financeClients}
      isLoading={isFetchingFinanceClients}
      getId={(item) => item.id}
      getTitle={(item) => item.name}
      getDescription={(item) => item.description || undefined}
      renderRowContent={renderRowContent}
      renderEditForm={renderEditForm}
      renderAddForm={renderAddForm}
      onDelete={deleteFinanceClientsMutation}
      titleText={getLocalizedText("Finanz Kunden", "Finance Clients")}
      emptyText={getLocalizedText("Keine Kunden gefunden", "No clients found")}
      deleteTitle={getLocalizedText("Kunde löschen", "Delete Client")}
      deleteMessage={getLocalizedText(
        "Sind Sie sicher, dass Sie diese Kunden löschen möchten",
        "Are you sure you want to delete these clients"
      )}
      addText={getLocalizedText("Kunde hinzufügen", "Add Client")}
      editText={getLocalizedText("Kunde bearbeiten", "Edit client")}
      selectTooltip={getLocalizedText("Kunde auswählen", "Select client")}
      titleIcon={<IconUsers size={20} />}
      addIcon={<IconUserPlus />}
    />
  );
}
