import { useState } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useForm } from "@mantine/form";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";

import { Currency } from "@/types/settings.types";
import {
  Button,
  Divider,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Alert,
} from "@mantine/core";
import { IconArrowDown, IconBrandCashapp } from "@tabler/icons-react";
import { currencies } from "@/constants/settings";
import { Tables } from "@/types/db.types";

interface ProjectModalFormProps {
  project: Tables<"timer_project">;
  handleClose: () => void;
  startValue: number;
  startCurrency: Currency;
  categoryId: string | null;
}

const schema = z.object({
  endValue: z.number().min(0, { message: "Value must be positive" }),
  endCurrency: z.string().min(1, { message: "Currency is required" }),
});

type ProjectPayoutFormValues = z.infer<typeof schema>;

export default function ProjectModalForm({
  project,
  handleClose,
  startValue,
  startCurrency,
  categoryId,
}: ProjectModalFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ProjectPayoutFormValues>({
    initialValues: {
      endValue: startValue,
      endCurrency: startCurrency,
    },
    validate: zodResolver(schema),
  });

  // const { payoutProjectSalary, updateProject } = useWorkStore();
  // const { addExistingSingleCashFlow } = useFinanceStore();
  const { getLocalizedText, formatMoney } = useIntl();

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsProcessing(true);
    // const payoutResult = await payoutProjectSalary(
    //   project.id,
    //   startValue,
    //   startCurrency,
    //   categoryId,
    //   values.endValue !== startValue ? values.endValue : null,
    //   values.endCurrency !== startCurrency
    //     ? (values.endCurrency as Currency)
    //     : null
    // );

    // if (payoutResult.success) {
    //   addExistingSingleCashFlow(payoutResult.data.cashFlow);
    //   updateProject({
    //     ...project,
    //     total_payout: startValue + project.total_payout,
    //   });
    //   handleClose();
    // } else {
    //   setError(
    //     locale === "de-DE"
    //       ? "Fehler beim Auszahlen"
    //       : "Failed to process payout"
    //   );
    //   setTimeout(() => {
    //     setError(null);
    //   }, 3000);
    // }
    setIsProcessing(false);
  }

  const startValueString = formatMoney(startValue ?? 0, startCurrency);

  return (
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
          placeholder={getLocalizedText("Währung auswählen", "Select currency")}
          data={currencies}
          value={form.values.endCurrency}
          onChange={(value) =>
            form.setFieldValue("endCurrency", value as Currency)
          }
          error={form.errors.endCurrency}
        />
        <Button
          type="submit"
          loading={isProcessing}
          leftSection={<IconBrandCashapp />}
        >
          {getLocalizedText("Auszahlen", "Payout")}
        </Button>
        <Alert
          title={getLocalizedText("Fehler", "Error")}
          color="red"
          hidden={!error}
        >
          {error}
        </Alert>
      </Stack>
    </form>
  );
}
