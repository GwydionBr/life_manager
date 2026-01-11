import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { useIntl } from "@/hooks/useIntl";

import { TextInput, Select, Stack } from "@mantine/core";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import LocaleDatePickerInput from "@/components/UI/Locale/LocaleDatePickerInput";

import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";

import { CashFlowType, Currency } from "@/types/settings.types";
import { Tables } from "@/types/db.types";
import CustomNumberInput from "@/components/UI/CustomNumberInput";

export interface SingleFinanceFormValues {
  title: string;
  amount: number;
  currency: Currency;
  date: Date;
}

interface SingleFinanceFormProps {
  type: CashFlowType;
  financeCurrency: Currency;
  handleSubmit: (values: SingleFinanceFormValues) => void;
  isLoading: boolean;
  cashFlow?: Tables<"single_cashflow">;
}

export default function SingleFinanceForm({
  type,
  financeCurrency,
  handleSubmit,
  isLoading,
  cashFlow,
}: SingleFinanceFormProps) {
  const { getLocalizedText } = useIntl();

  const schema = z.object({
    title: z
      .string()
      .min(
        2,
        getLocalizedText(
          "Name muss mindestens 2 Zeichen lang sein",
          "Name must be at least 2 characters"
        )
      ),
    amount: z.number().refine((val) => val !== 0, {
      message: getLocalizedText(
        "Betrag kann nicht 0 sein",
        "Amount cannot be 0"
      ),
    }),
    currency: z.enum(
      currencies.map((currency) => currency.value) as [string, ...string[]]
    ),
    date: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
  });

  const form = useForm<z.infer<typeof schema>>({
    initialValues: {
      title: cashFlow?.title ?? "",
      amount: cashFlow?.amount ?? 0,
      date: cashFlow?.date ? new Date(cashFlow.date) : new Date(),
      currency: financeCurrency,
    },
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (type === "expense") {
      form.setFieldValue("amount", -1 * Math.abs(form.values.amount));
    } else {
      form.setFieldValue("amount", Math.abs(form.values.amount));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function handleFormSubmit(values: SingleFinanceFormValues) {
    handleSubmit({
      ...values,
      date: new Date(values.date),
    });
  }

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label={getLocalizedText("Name", "Name")}
          {...form.getInputProps("title")}
          data-autofocus
        />
        <CustomNumberInput
          withAsterisk
          allowNegative={type === "expense"}
          allowLeadingZeros={false}
          label={getLocalizedText("Betrag", "Amount")}
          onChange={(value) => {
            form.setFieldValue(
              "amount",
              type === "expense"
                ? -1 * Math.abs(Number(value))
                : Math.abs(Number(value))
            );
          }}
          value={form.values.amount}
          error={form.errors.amount}
        />
        <Select
          withAsterisk
          label={getLocalizedText("Währung", "Currency")}
          placeholder={getLocalizedText("Währung auswählen", "Select currency")}
          data={currencies}
          {...form.getInputProps("currency")}
        />
        <LocaleDatePickerInput
          label={getLocalizedText("Datum", "Date")}
          withAsterisk
          mb="md"
          {...form.getInputProps("date")}
        />
        {cashFlow ? (
          <UpdateButton
            type="submit"
            onClick={form.onSubmit(handleFormSubmit)}
            loading={isLoading}
            variant="filled"
          />
        ) : (
          <CreateButton
            type="submit"
            onClick={form.onSubmit(handleFormSubmit)}
            loading={isLoading}
            variant="filled"
          />
        )}
      </Stack>
    </form>
  );
}
