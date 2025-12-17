import { useIntl } from "@/hooks/useIntl";
import {
  bankAccountsCollection,
  useBankAccounts,
} from "@/db/collections/finance/bank-account/bank-account-collection";

import { Group, Text } from "@mantine/core";
import { IconBuildingBank, IconPlus } from "@tabler/icons-react";
import FinanceSettingsList from "@/components/Settings/Finances/FinanceSettingsList";
import BankAccountForm from "@/components/Finances/BankAccount/BankAccountForm";
import { BankAccount } from "@/types/finance.types";

export default function FinanceBankAccountSettings() {
  const { getLocalizedText, getCurrencySymbol } = useIntl();
  const { data: bankAccounts } = useBankAccounts();

  const renderRowContent = (bankAccount: BankAccount) => (
    <>
      <Text fz="sm" fw={500}>
        {bankAccount.title}
      </Text>
      <Group gap="xs">
        {bankAccount.description && (
          <Text fz="xs" c="dimmed">
            {bankAccount.description}
          </Text>
        )}
        <Text fz="xs" c="dimmed">
          {getCurrencySymbol(bankAccount.currency)} {bankAccount.saldo}
        </Text>
      </Group>
    </>
  );

  const renderEditForm = (bankAccount: BankAccount, onClose: () => void) => (
    <BankAccountForm onClose={onClose} bankAccount={bankAccount} />
  );

  const renderAddForm = (onClose: () => void) => (
    <BankAccountForm onClose={onClose} />
  );

  return (
    <FinanceSettingsList
      items={bankAccounts}
      isLoading={false}
      getId={(item) => item.id}
      getTitle={(item) => item.title}
      getDescription={(item) => item.description || undefined}
      renderRowContent={renderRowContent}
      renderEditForm={renderEditForm}
      renderAddForm={renderAddForm}
      onDelete={(ids) => bankAccountsCollection.delete(ids)}
      titleText={getLocalizedText("Bankkonten", "Bank Accounts")}
      emptyText={getLocalizedText("Keine Konten gefunden", "No accounts found")}
      deleteTitle={getLocalizedText("Konto löschen", "Delete Account")}
      deleteMessage={getLocalizedText(
        "Sind Sie sicher, dass Sie diese Konten löschen möchten",
        "Are you sure you want to delete these accounts?"
      )}
      addText={getLocalizedText("Konto hinzufügen", "Add account")}
      editText={getLocalizedText("Konto bearbeiten", "Edit account")}
      selectTooltip={getLocalizedText("Konto auswählen", "Select account")}
      titleIcon={<IconBuildingBank />}
      addIcon={
        <Group justify="center" align="center" gap={0}>
          <IconPlus size={20} color="teal" />
          <IconBuildingBank />
        </Group>
      }
    />
  );
}
