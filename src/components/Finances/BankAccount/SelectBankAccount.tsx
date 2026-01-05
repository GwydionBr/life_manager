import { useBankAccounts } from "@/db/collections/finance/bank-account/bank-account-collection";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Select } from "@mantine/core";
import { IconBuildingBank } from "@tabler/icons-react";

export default function SelectBankAccount() {
  const { data: bankAccounts } = useBankAccounts();
  const { selectedBankAccountId, setSelectedBankAccountId } = useFinanceStore();
  const { financeColor } = useSettingsStore();

  return (
    <Select
      data={bankAccounts.map((bankAccount) => ({
        label: bankAccount.title,
        value: bankAccount.id,
      }))}
      w="100%"
      comboboxProps={{
        offset: 0,
        transitionProps: { transition: "scale-y" },
      }}
      leftSectionPointerEvents="none"
      leftSection={<IconBuildingBank stroke={1.5} size={20} />}
      rightSection={null}
      styles={{
        input: {
          textAlign: "center",
          border: "none",
          textOverflow: "ellipsis",
          fontSize: "var(--mantine-font-size-md)",
        },
        dropdown: {
          border: `1px solid light-dark(var(--mantine-color-${financeColor}-6), var(--mantine-color-${financeColor}-2))`,
        },
      }}
      value={selectedBankAccountId}
      onChange={(value) => setSelectedBankAccountId(value)}
    />
  );
}
