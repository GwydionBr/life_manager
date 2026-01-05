import { useBankAccounts } from "@/db/collections/finance/bank-account/bank-account-collection";
import { useFinanceStore } from "@/stores/financeStore";

import { Select } from "@mantine/core";
import { IconBuildingBank } from "@tabler/icons-react";

export default function SelectBankAccount() {
  const { data: bankAccounts } = useBankAccounts();
  const { activeBankAccountId, setActiveBankAccountId } = useFinanceStore();

  return (
    <Select
      data={bankAccounts.map((bankAccount) => ({
        label: bankAccount.title,
        value: bankAccount.id,
      }))}
      w="100%"
      leftSection={<IconBuildingBank stroke={1.5} size={20} />}
      rightSection={null}
      styles={{
        input: {
          textAlign: "center",
          border: "none",
          textOverflow: "ellipsis",
          fontSize: "var(--mantine-font-size-md)",
        },
      }}
      value={activeBankAccountId}
      onChange={(value) => setActiveBankAccountId(value as string)}
    />
  );
}
