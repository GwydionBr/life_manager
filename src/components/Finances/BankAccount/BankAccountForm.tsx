import { useForm } from "@mantine/form";
import { useIntl } from "@/hooks/useIntl";
import { bankAccountsCollection } from "@/db/collections/finance/bank-account/bank-account-collection";
import { useProfileStore } from "@/stores/profileStore";

import { Stack, Select, TextInput } from "@mantine/core";

import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";
import { Database, Tables } from "@/types/db.types";
import CustomNumberInput from "@/components/UI/CustomNumberInput";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import { useSettings } from "@/db/collections/settings/settings-collection";

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
  const { id: userId } = useProfileStore();

  const form = useForm({
    initialValues: {
      title: bankAccount?.title || "",
      description: bankAccount?.description || "",
      currency:
        bankAccount?.currency || settings?.default_finance_currency || "USD",
      saldo: bankAccount?.saldo || 0,
    },
    validate: zodResolver(schema),
  });

  const handleClose = () => {
    form.reset();
    onClose?.();
  };

  function handleSubmit(values: z.infer<typeof schema>) {
    if (bankAccount) {
      bankAccountsCollection.update(bankAccount.id, (draft) => {
        draft.title = values.title;
        draft.description = values.description || null;
        draft.currency =
          values.currency as Database["public"]["Enums"]["currency"];
        draft.saldo = values.saldo;
      });
    } else {
      bankAccountsCollection.insert({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        saldo_set_at: new Date().toISOString(),
        user_id: userId,
        title: values.title,
        description: values.description || null,
        currency: values.currency as Database["public"]["Enums"]["currency"],
        saldo: values.saldo,
      });
    }
    handleClose();
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
          />
        ) : (
          <CreateButton
            type="submit"
            onClick={form.onSubmit(handleSubmit)}
            title={getLocalizedText("Konto erstellen", "Create account")}
          />
        )}
        {onClose && <CancelButton onClick={handleClose} />}
      </Stack>
    </form>
  );
}
