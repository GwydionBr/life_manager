import { useForm } from "@mantine/form";
import { useIntl } from "@/hooks/useIntl";
import { useProfile } from "@/db/collections/profile/profile-collection";
import { useSettings } from "@/db/collections/settings/settings-collection";

import { Fieldset, Select, Stack, TextInput } from "@mantine/core";

import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import { Currency } from "@/types/settings.types";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import { contactsCollection } from "@/db/collections/finance/contacts/contact-collection";

import { Tables } from "@/types/db.types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.enum(
    currencies.map((currency) => currency.value) as [string, ...string[]]
  ),
});

interface FinanceClientFormProps {
  onClose?: () => void;
  onSuccess?: (client: Tables<"finance_client">) => void;
  client?: Tables<"finance_client">;
}

export default function FinanceClientForm({
  onClose,
  onSuccess,
  client,
}: FinanceClientFormProps) {
  const { getLocalizedText } = useIntl();
  const { data: profile } = useProfile();
  const { data: settings } = useSettings();

  const form = useForm({
    initialValues: {
      name: client?.name || "",
      description: client?.description || "",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
      currency: client?.currency || settings?.default_finance_currency || "USD",
    },
    validate: zodResolver(schema),
  });

  const handleClose = () => {
    form.reset();
    onClose?.();
  };

  function handleSubmit(values: z.infer<typeof schema>) {
    if (client) {
      const result = contactsCollection.update(client.id, (draft) => {
        draft.name = values.name;
        draft.description = values.description || null;
        draft.email = values.email || null;
        draft.phone = values.phone || null;
        draft.address = values.address || null;
        draft.currency = values.currency as Currency;
      });
      console.log(result);
    } else {
      const result = contactsCollection.insert({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        user_id: profile?.id || "",
        name: values.name,
        description: values.description || null,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
        currency: values.currency as Currency,
      });
      console.log(result);
    }
    handleClose();
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Fieldset legend={getLocalizedText("Kunden Details", "Client details")}>
          <Stack>
            <TextInput
              withAsterisk
              label={getLocalizedText("Name", "Name")}
              {...form.getInputProps("name")}
              data-autofocus
            />
            <TextInput
              label={getLocalizedText("Beschreibung", "Description")}
              {...form.getInputProps("description")}
            />
          </Stack>
        </Fieldset>
        <Fieldset legend={getLocalizedText("Kontakt", "Contact")}>
          <TextInput
            label={getLocalizedText("Email", "Email")}
            {...form.getInputProps("email")}
          />
          <TextInput
            label={getLocalizedText("Telefon", "Phone")}
            {...form.getInputProps("phone")}
          />
          <TextInput
            label={getLocalizedText("Adresse", "Address")}
            {...form.getInputProps("address")}
          />
        </Fieldset>
        <Fieldset legend={getLocalizedText("Finanzen", "Finances")}>
          <Select
            label={getLocalizedText("Währung", "Currency")}
            data={currencies}
            {...form.getInputProps("currency")}
          />
        </Fieldset>
        {client ? (
          <UpdateButton type="submit" onClick={form.onSubmit(handleSubmit)} />
        ) : (
          <CreateButton type="submit" onClick={form.onSubmit(handleSubmit)} />
        )}
        {onClose && <CancelButton onClick={handleClose} />}
      </Stack>
    </form>
  );
}
