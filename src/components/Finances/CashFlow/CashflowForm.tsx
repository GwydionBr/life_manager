import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";
import { useSingleCashflowMutations } from "@/db/collections/finance/single-cashflow/use-single-cashflow-mutations";
import { useTags } from "@/db/collections/finance/tags/tags-collection";
import { useRecurringCashflowMutations } from "@/db/collections/finance/recurring-cashflow/use-recurring-cashflow-mutations";
import { useSettings } from "@/db/collections/settings/settings-collection";

import {
  Stack,
  Text,
  SegmentedControl,
  Center,
  Switch,
  Group,
  MultiSelect,
  Button,
} from "@mantine/core";
import {
  IconMinus,
  IconPlus,
  IconReload,
  IconCircleDashedNumber1,
} from "@tabler/icons-react";
import SingleFinanceForm, {
  SingleFinanceFormValues,
} from "./Single/SingleFinanceForm";
import RecurringFinanceForm, {
  RecurringFinanceFormValues,
} from "./Recurring/RecurringFinanceForm";
import CancelButton from "@/components/UI/Buttons/CancelButton";

import { CashFlowType } from "@/types/settings.types";
import { Tables } from "@/types/db.types";

import classes from "@/components/UI/Switch.module.css";

interface FinanceFormProps {
  onClose: () => void;
  isSingle?: boolean;
  onOpenCategoryForm: () => void;
  categories: Tables<"finance_category">[];
  setCategories: (categories: Tables<"finance_category">[]) => void;
}

export default function FinanceForm({
  onClose,
  isSingle = true,
  onOpenCategoryForm,
  categories,
  setCategories,
}: FinanceFormProps) {
  const [type, setType] = useState<CashFlowType>("income");
  const [isRecurring, setIsRecurring] = useState<boolean>(!isSingle);
  const { data: settings } = useSettings();
  useSettingsStore();
  const { data: financeCategories } = useTags();
  const { getLocalizedText } = useIntl();
  const { addSingleCashflow } = useSingleCashflowMutations();
  const { addRecurringCashflow } = useRecurringCashflowMutations();

  async function handleSingleFinanceSubmit(values: SingleFinanceFormValues) {
    await addSingleCashflow({
      ...values,
      date: values.date.toISOString(),
      categories,
    });
    onClose();
  }

  async function handleRecurringFinanceSubmit(
    values: RecurringFinanceFormValues
  ) {
    // TODO: Optimize Add Recurring Cashflow Mutation
    addRecurringCashflow({
      ...values,
      end_date: values.end_date?.toISOString(),
      start_date: values.start_date.toISOString(),
      categories,
    });
    onClose();
  }

  return (
    <Stack>
      <SegmentedControl
        value={type}
        color={type === "income" ? "green" : "red"}
        onChange={(value) => setType(value as CashFlowType)}
        data={[
          {
            value: "income",
            label: (
              <Center style={{ gap: 10 }}>
                <IconPlus size={16} />
                <Text>{getLocalizedText("Einnahme", "Income")}</Text>
              </Center>
            ),
          },
          {
            value: "expense",
            label: (
              <Center style={{ gap: 10 }}>
                <IconMinus size={16} />
                <Text>{getLocalizedText("Ausgabe", "Expense")}</Text>
              </Center>
            ),
          },
        ]}
      />
      <Stack gap="xs">
        <Group justify="center">
          <Text>{getLocalizedText("Einmalig", "Single")}</Text>
          <IconCircleDashedNumber1 size={16} />
          <Switch
            checked={isRecurring}
            onChange={(event) => setIsRecurring(event.currentTarget.checked)}
            classNames={classes}
            size="md"
          />
          <IconReload size={16} />
          <Text>{getLocalizedText("Wiederkehrend", "Recurring")}</Text>
        </Group>
        <Group wrap="nowrap">
          <MultiSelect
            w="100%"
            data={financeCategories?.map((category) => ({
              label: category.title,
              value: category.id,
            }))}
            label={getLocalizedText("Kategorie", "Category")}
            placeholder={getLocalizedText(
              "Kategorie auswählen",
              "Select a category"
            )}
            value={categories.map((category) => category.id)}
            onChange={(value) =>
              setCategories(
                value.map(
                  (id) =>
                    financeCategories.find((category) => category.id === id)!
                )
              )
            }
            searchable
            clearable
            nothingFoundMessage={getLocalizedText(
              "Keine Kategorien gefunden",
              "No categories found"
            )}
            size="sm"
          />
          <Button
            mt={25}
            w={180}
            p={0}
            onClick={onOpenCategoryForm}
            fw={500}
            variant="subtle"
            size="xs"
            leftSection={<IconPlus size={20} />}
          >
            <Text fz="xs" c="dimmed">
              {getLocalizedText("Neue Kategorie", "Add Category")}
            </Text>
          </Button>
        </Group>
      </Stack>
      {isRecurring ? (
        <RecurringFinanceForm
          type={type}
          financeCurrency={settings?.default_finance_currency || "USD"}
          handleSubmit={handleRecurringFinanceSubmit}
          isLoading={false}
        />
      ) : (
        <SingleFinanceForm
          type={type}
          financeCurrency={settings?.default_finance_currency || "USD"}
          handleSubmit={handleSingleFinanceSubmit}
          isLoading={false}
        />
      )}
      <CancelButton onClick={onClose} />
    </Stack>
  );
}
