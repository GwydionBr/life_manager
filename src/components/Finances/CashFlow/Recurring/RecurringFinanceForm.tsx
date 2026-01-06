import { useEffect } from "react";
import { useForm } from "@mantine/form";
import { useIntl } from "@/hooks/useIntl";

import { TextInput, Select, Group, Stack } from "@mantine/core";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import LocaleDatePickerInput from "@/components/UI/Locale/LocaleDatePickerInput";

import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies, financeIntervals } from "@/constants/settings";

import {
  CashFlowType,
  Currency,
  FinanceInterval,
} from "@/types/settings.types";
import { Tables } from "@/types/db.types";
import CustomNumberInput from "@/components/UI/CustomNumberInput";

const schema = z.object({
  title: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  amount: z.number(),
  currency: z.enum(
    currencies.map((currency) => currency.value) as [string, ...string[]]
  ),
  start_date: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  end_date: z
    .string()
    .or(z.date())
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  interval: z.enum(
    financeIntervals.map((interval) => interval.value) as [string, ...string[]]
  ),
});

export interface RecurringFinanceFormValues {
  title: string;
  description: string;
  amount: number;
  currency: Currency;
  start_date: Date;
  end_date: Date | null;
  interval: FinanceInterval;
}

interface RecurringFinanceFormProps {
  type: CashFlowType;
  financeCurrency: Currency;
  handleSubmit: (values: RecurringFinanceFormValues) => void;
  isLoading: boolean;
  cashFlow?: Tables<"recurring_cashflow">;
}

export default function RecurringFinanceForm({
  type,
  financeCurrency,
  handleSubmit,
  isLoading,
  cashFlow,
}: RecurringFinanceFormProps) {
  const { getLocalizedText } = useIntl();
  const form = useForm<z.infer<typeof schema>>({
    initialValues: {
      title: cashFlow?.title ?? "",
      description: cashFlow?.description ?? "",
      amount: cashFlow?.amount ?? 0,
      currency: financeCurrency,
      start_date: cashFlow?.start_date
        ? new Date(cashFlow.start_date)
        : new Date(),
      end_date: cashFlow?.end_date ? new Date(cashFlow.end_date) : null,
      interval: cashFlow?.interval ?? "month",
    },
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (type === "expense") {
      form.setFieldValue("amount", -1 * Math.abs(form.values.amount));
    } else {
      form.setFieldValue("amount", Math.abs(form.values.amount));
    }
  }, [type]);

  function handleFormSubmit(values: RecurringFinanceFormValues) {
    handleSubmit({
      ...values,
      start_date: new Date(values.start_date),
      end_date: values.end_date ? new Date(values.end_date) : null,
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
        <TextInput
          label={getLocalizedText("Beschreibung", "Description")}
          {...form.getInputProps("description")}
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
        <Group grow>
          <LocaleDatePickerInput
            label={getLocalizedText("Startdatum", "Start Date")}
            withAsterisk
            {...form.getInputProps("start_date")}
          />
          <LocaleDatePickerInput
            label={getLocalizedText("Enddatum", "End Date")}
            clearable
            {...form.getInputProps("end_date")}
          />
        </Group>
        <Select
          withAsterisk
          label={getLocalizedText(
            "Wiederholungsintervall auswählen",
            "Select the repetition interval"
          )}
          placeholder={getLocalizedText(
            "Intervall auswählen",
            "Select interval"
          )}
          data={financeIntervals}
          {...form.getInputProps("interval")}
          mb="md"
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
