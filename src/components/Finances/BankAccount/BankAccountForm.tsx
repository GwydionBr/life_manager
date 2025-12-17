import { useForm } from "@mantine/form";
import { useIntl } from "@/hooks/useIntl";
import {
  useAddBankAccountMutation,
  useUpdateBankAccountMutation,
} from "@/db/queries/finances/use-bank-account";

import { Stack, Select, TextInput } from "@mantine/core";

import { z } from "zod";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";
import { Tables } from "@/types/db.types";
import CustomNumberInput from "@/components/UI/CustomNumberInput";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import { useSettings } from "@/db/queries/settings/use-settings";

const schema = z.object({
  title: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  currency: z.enum(
    currencies.map((currency) => currency.value) as [Currency, ...Currency[]]
  ),
  saldo: z.number().min(0, "Saldo is required"),
});

interface BankAccountFormProps {
  onClose?: () => void;
  onSuccess?: (bankAccount: Tables<"bank_account">) => void;
  bankAccount?: Tables<"bank_account"> | null;
}

export default function BankAccountForm({
  onClose,
  onSuccess,
  bankAccount,
}: BankAccountFormProps) {
  const { getLocalizedText } = useIntl();
  const { data: settings } = useSettings();
  const { mutate: addBankAccountMutation, isPending: isAddingBankAccount } =
    useAddBankAccountMutation({
      onSuccess: (bankAccount) => {
        onSuccess?.(bankAccount);
        handleClose();
      },
    });
  const {
    mutate: updateBankAccountMutation,
    isPending: isUpdatingBankAccount,
  } = useUpdateBankAccountMutation({
    onSuccess: (bankAccount) => {
      onSuccess?.(bankAccount);
      handleClose();
    },
  });
  const form = useForm({
    initialValues: {
      title: bankAccount?.title || "",
      description: bankAccount?.description || "",
      currency:
        bankAccount?.currency || settings?.default_finance_currency || "USD",
      saldo: bankAccount?.saldo || 0,
    },
    validate: zod4Resolver(schema),
  });

  const handleClose = () => {
    form.reset();
    onClose?.();
  };

  function handleSubmit(values: z.infer<typeof schema>) {
    if (bankAccount) {
      updateBankAccountMutation({
        data: {
          id: bankAccount.id,
          ...values,
        },
      });
    } else {
      addBankAccountMutation({
        data: {
          ...values,
        },
      });
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label={getLocalizedText("Name", "Name")}
          {...form.getInputProps("title")}
          data-autofocus
        />
        <TextInput
          label={getLocalizedText("Beschreibung", "Description")}
          {...form.getInputProps("description")}
        />
        <Select
          label={getLocalizedText("Währung", "Currency")}
          data={currencies}
          {...form.getInputProps("currency")}
        />
        <CustomNumberInput
          withAsterisk
          label={getLocalizedText("Saldo", "Saldo")}
          allowNegative={false}
          {...form.getInputProps("saldo")}
        />
        {bankAccount ? (
          <UpdateButton
            type="submit"
            onClick={form.onSubmit(handleSubmit)}
            title={getLocalizedText("Konto aktualisieren", "Update account")}
            loading={isUpdatingBankAccount}
          />
        ) : (
          <CreateButton
            type="submit"
            onClick={form.onSubmit(handleSubmit)}
            loading={isAddingBankAccount}
            title={getLocalizedText("Konto erstellen", "Create account")}
          />
        )}
        {onClose && <CancelButton onClick={handleClose} />}
      </Stack>
    </form>
  );
}
