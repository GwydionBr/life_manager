import { useEffect } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { useSettings } from "@/db/collections/settings/use-settings-query";

import { z } from "zod";

import { Currency } from "@/types/settings.types";
import {
  Button,
  Divider,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Modal,
} from "@mantine/core";
import { IconArrowDown, IconCashBanknotePlus } from "@tabler/icons-react";
import { currencies } from "@/constants/settings";

interface PayoutConversionModalProps {
  opened: boolean;
  handleClose: () => void;
  startValue: number;
  startCurrency: Currency;
  onSubmit: (values: { endValue: number; endCurrency: Currency }) => void;
  isProcessing: boolean;
}

const schema = z.object({
  endValue: z.number().min(0, { message: "Value must be positive" }),
  endCurrency: z.string().min(1, { message: "Currency is required" }),
});

type PayoutConversionFormValues = z.infer<typeof schema>;

export default function PayoutConversionModal({
  opened,
  handleClose,
  startValue,
  startCurrency,
  onSubmit,
  isProcessing,
}: PayoutConversionModalProps) {
  const { data: settings } = useSettings();
  const { getLocalizedText, formatMoney } = useIntl();

  const form = useForm<PayoutConversionFormValues>({
    initialValues: {
      endValue: Math.round(startValue * 100) / 100,
      endCurrency: settings?.default_finance_currency || "USD",
    },
    validate: zodResolver(schema),
  });

  useEffect(() => {
    form.setFieldValue(
      "endCurrency",
      settings?.default_finance_currency || "USD"
    );
  }, [settings?.default_finance_currency]);

  useEffect(() => {
    form.setFieldValue("endValue", Math.round(startValue * 100) / 100);
  }, [startValue]);

  const startValueString = formatMoney(startValue ?? 0, startCurrency);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconCashBanknotePlus size={20} />
          <Text fw={600}>{getLocalizedText("Auszahlung", "Payout")}</Text>
        </Group>
      }
      styles={{
        title: {
          fontSize: "1.2rem",
          fontWeight: 600,
        },
        header: {
          borderBottom:
            "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-3))",
          paddingBottom: "1rem",
          marginBottom: "1rem",
        },
      }}
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <Text>
            {getLocalizedText("Startwert", "Start Value")}: {startValueString}
          </Text>
          <Divider />
          <Group justify="center">
            <IconArrowDown />
          </Group>
          <Divider />
          <NumberInput
            label={getLocalizedText("Endwert", "End Value")}
            {...form.getInputProps("endValue")}
          />
          <Select
            label={getLocalizedText("Endwährung", "End Currency")}
            placeholder={getLocalizedText(
              "Währung auswählen",
              "Select currency"
            )}
            data={currencies}
            value={form.values.endCurrency}
            onChange={(value) =>
              form.setFieldValue("endCurrency", value as Currency)
            }
            error={form.errors.endCurrency}
          />
          <Button
            color="violet"
            type="submit"
            loading={isProcessing}
            leftSection={<IconCashBanknotePlus />}
          >
            {getLocalizedText("Auszahlen", "Payout")}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
