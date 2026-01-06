import { useEffect, useRef } from "react";
import { useForm } from "@mantine/form";
import { useIntl } from "@/hooks/useIntl";
import { bankAccountsCollection } from "@/db/collections/finance/bank-account/bank-account-collection";
import { useProfile } from "@/db/collections/profile/profile-collection";
import { useBankAccounts } from "@/db/collections/finance/bank-account/bank-account-collection";

import { Stack, Select, TextInput, Checkbox } from "@mantine/core";

import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";
import { Database } from "@/types/db.types";
import CustomNumberInput from "@/components/UI/CustomNumberInput";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import { useSettings } from "@/db/collections/settings/settings-collection";
import { BankAccount } from "@/types/finance.types";

const schema = z.object({
  title: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  currency: z.enum(
    currencies.map((currency) => currency.value) as [Currency, ...Currency[]]
  ),
  is_default: z.boolean(),
  saldo: z.number().min(0, "Saldo is required"),
});

interface BankAccountFormProps {
  onClose?: () => void;
  onSuccess?: (bankAccount: BankAccount) => void;
  bankAccount?: BankAccount;
}

export default function BankAccountForm({
  onClose,
  onSuccess: _onSuccess,
  bankAccount,
}: BankAccountFormProps) {
  const { getLocalizedText } = useIntl();
  const { data: bankAccounts } = useBankAccounts();
  const { data: settings } = useSettings();
  const { data: profile } = useProfile();

  const isDefaultSetRef = useRef(false);

  const form = useForm({
    initialValues: {
      title: bankAccount?.title || "",
      description: bankAccount?.description || "",
      currency:
        bankAccount?.currency || settings?.default_finance_currency || "USD",
      is_default:
        bankAccount?.is_default ||
        !bankAccounts?.some(
          (b) =>
            b.is_default && b.currency === settings?.default_finance_currency
        ),
      saldo: bankAccount?.saldo || 0,
    },
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (!isDefaultSetRef.current && !bankAccount && bankAccounts) {
      form.setFieldValue(
        "is_default",
        !bankAccounts.some(
          (b) =>
            b.is_default && b.currency === settings?.default_finance_currency
        )
      );
      isDefaultSetRef.current = true;
    }
  }, [bankAccounts, settings, form, bankAccount]);

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
        draft.is_default = values.is_default;
      });
    } else {
      bankAccountsCollection.insert({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        saldo_set_at: new Date().toISOString(),
        user_id: profile?.id || "",
        title: values.title,
        description: values.description || null,
        currency: values.currency as Database["public"]["Enums"]["currency"],
        saldo: values.saldo,
        is_default: values.is_default,
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
        <Checkbox
          label={getLocalizedText(
            "Standardkonto für die ausgewählte Währung",
            "Default account for the selected currency"
          )}
          {...form.getInputProps("is_default")}
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
