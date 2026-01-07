import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";
import { useSingleCashflowMutations } from "@/db/collections/finance/single-cashflow/use-single-cashflow-mutations";
import { useTags } from "@/db/collections/finance/tags/use-tags-query";
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
  onOpenTagForm: () => void;
  tags: Tables<"tag">[];
  setTags: (tags: Tables<"tag">[]) => void;
}

export default function FinanceForm({
  onClose,
  isSingle = true,
  onOpenTagForm,
  tags,
  setTags,
}: FinanceFormProps) {
  const [type, setType] = useState<CashFlowType>("income");
  const [isRecurring, setIsRecurring] = useState<boolean>(!isSingle);
  const { data: settings } = useSettings();
  useSettingsStore();
  const { data: allTags } = useTags();
  const { getLocalizedText } = useIntl();
  const { addSingleCashflow } = useSingleCashflowMutations();
  const { addRecurringCashflow } = useRecurringCashflowMutations();

  async function handleSingleFinanceSubmit(values: SingleFinanceFormValues) {
    await addSingleCashflow({
      ...values,
      date: values.date.toISOString(),
      tags: tags,
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
      tags: tags,
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
            data={allTags?.map((tag) => ({
              label: tag.title,
              value: tag.id,
            }))}
            label={getLocalizedText("Tag", "Tag")}
            placeholder={getLocalizedText("Tag auswählen", "Select a tag")}
            value={tags.map((tag) => tag.id)}
            onChange={(value) =>
              setTags(value.map((id) => allTags.find((tag) => tag.id === id)!))
            }
            searchable
            clearable
            nothingFoundMessage={getLocalizedText(
              "Keine Tags gefunden",
              "No tags found"
            )}
            size="sm"
          />
          <Button
            mt={25}
            w={180}
            p={0}
            onClick={onOpenTagForm}
            fw={500}
            variant="subtle"
            size="xs"
            leftSection={<IconPlus size={20} />}
          >
            <Text fz="xs" c="dimmed">
              {getLocalizedText("Neues Tag", "Add Tag")}
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
