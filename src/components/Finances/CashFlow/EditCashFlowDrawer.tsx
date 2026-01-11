import { useState, useEffect } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useTags } from "@/db/collections/finance/tags/use-tags-query";
import { useSingleCashflowMutations } from "@/db/collections/finance/single-cashflow/use-single-cashflow-mutations";
import { useRecurringCashflowMutations } from "@/db/collections/finance/recurring-cashflow/use-recurring-cashflow-mutations";

import {
  Center,
  Drawer,
  Flex,
  SegmentedControl,
  Group,
  Text,
  useDrawersStack,
  Button,
  Stack,
  MultiSelect,
} from "@mantine/core";
import SingleCashFlowForm from "@/components/Finances/CashFlow/Single/SingleFinanceForm";
import RecurringCashFlowForm from "@/components/Finances/CashFlow/Recurring/RecurringFinanceForm";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";

import { Tables } from "@/types/db.types";
import {
  IconMinus,
  IconPlus,
  IconCashMove,
  IconAlertHexagonFilled,
  IconAlertTriangle,
  IconTagPlus,
} from "@tabler/icons-react";
import { CashFlowType } from "@/types/settings.types";
import CancelButton from "../../UI/Buttons/CancelButton";
import DeleteActionIcon from "../../UI/ActionIcons/DeleteActionIcon";
import FinanceTagForm from "../Tag/TagForm";
import { Radio } from "@mantine/core";
import {
  DeleteRecurringCashFlowMode,
  RecurringCashFlow,
  SingleCashFlow,
  UpdateRecurringCashFlow,
  UpdateSingleCashFlow,
} from "@/types/finance.types";

// Type guard to distinguish between single and recurring cash flows
function isSingleCashFlow(
  cashFlow: Tables<"single_cashflow"> | Tables<"recurring_cashflow">
): cashFlow is Tables<"single_cashflow"> {
  return "date" in cashFlow && !("interval" in cashFlow);
}

export default function EditCashFlowDrawer({
  cashFlow,
  opened,
  onClose,
}: {
  cashFlow: SingleCashFlow | RecurringCashFlow;
  opened: boolean;
  onClose: () => void;
}) {
  const { getLocalizedText } = useIntl();
  const [deleteMode, setDeleteMode] = useState<DeleteRecurringCashFlowMode>(
    DeleteRecurringCashFlowMode.delete_all
  );
  const [type, setType] = useState<CashFlowType>("income");
  const [tags, setTags] = useState<Tables<"tag">[]>(cashFlow.tags);
  const [pendingValues, setPendingValues] = useState<
    UpdateSingleCashFlow | UpdateRecurringCashFlow
  >(cashFlow);
  const { updateSingleCashflow, deleteSingleCashflow } =
    useSingleCashflowMutations();
  const { updateRecurringCashflow, deleteRecurringCashflow } =
    useRecurringCashflowMutations();
  const drawerStack = useDrawersStack([
    "edit-cash-flow",
    "delete-cash-flow",
    "delete-recurring-cash-flow",
    "update-cash-flow",
    "add-tag",
  ]);
  const { data: allTags } = useTags();

  useEffect(() => {
    if (cashFlow) {
      setType(cashFlow.amount > 0 ? "income" : "expense");
    }
  }, [cashFlow, opened]);

  useEffect(() => {
    if (opened) {
      drawerStack.open("edit-cash-flow");
    } else {
      drawerStack.closeAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  useEffect(() => {
    if (tags !== cashFlow.tags) {
      setTags(cashFlow.tags);
    }
  }, [cashFlow]);

  // TODO: Handle Type Safety
  async function handleSubmit(values: any) {
    if (isSingleCashFlow(cashFlow)) {
      await updateSingleCashflow(cashFlow.id, {
        ...values,
        date: values.date.toISOString(),
        tags: tags,
      });
      onClose();
    } else {
      console.log("update recurring cash flow", values);
      // For recurring cash flows, check if any fields that affect single cash flows have changed
      const hasChanges =
        values.title !== cashFlow.title ||
        values.amount !== cashFlow.amount ||
        values.currency !== cashFlow.currency ||
        tags !== cashFlow.tags;

      if (hasChanges) {
        console.log("has changes", hasChanges);
        // Store the values and show the update modal
        setPendingValues({
          id: cashFlow.id,
          tags: tags,
          ...values,
          end_date: values.end_date?.toISOString() ?? null,
          start_date: values.start_date.toISOString(),
        });
        drawerStack.open("update-cash-flow");
      } else {
        console.log("no changes", values);
        await updateRecurringCashflow(
          cashFlow.id,
          {
            ...values,
            tags: tags,
            end_date: values.end_date?.toISOString() ?? null,
            start_date: values.start_date.toISOString(),
          },
          true
        );
        onClose();
      }
    }
  }

  async function handleSingleDelete() {
    if (!isSingleCashFlow(cashFlow)) return;
    deleteSingleCashflow(cashFlow.id);
    onClose();
  }

  async function handleDeleteRecurringWithMode(
    mode: DeleteRecurringCashFlowMode
  ) {
    if (isSingleCashFlow(cashFlow)) return;
    deleteRecurringCashflow(cashFlow.id, mode);
    onClose();
  }

  async function handleDeactivateRecurring() {
    if (isSingleCashFlow(cashFlow)) return;
    updateRecurringCashflow(cashFlow.id, {
      end_date: new Date().toISOString(),
      tags: tags,
    });
    onClose();
  }

  async function handleUpdateAll() {
    if (!pendingValues) return;

    await updateRecurringCashflow(
      cashFlow.id,
      {
        ...pendingValues,
        tags: tags,
      },
      true
    );
    onClose();
  }

  async function handleUpdateRecurringOnly() {
    if (!pendingValues) return;

    await updateRecurringCashflow(cashFlow.id, {
      ...pendingValues,
      tags: tags,
    });
    onClose();
  }

  const handleAddTag = (tag: Tables<"tag">) => {
    setTags((prev) => [...prev, tag]);
  };

  return (
    <Drawer.Stack>
      <Drawer
        {...drawerStack.register("edit-cash-flow")}
        onClose={onClose}
        title={
          <Group>
            <DeleteActionIcon
              tooltipLabel={getLocalizedText(
                "Cashflow löschen",
                "Delete Cash Flow"
              )}
              onClick={() => drawerStack.open("delete-cash-flow")}
            />
            <Text>
              {getLocalizedText("Cashflow bearbeiten", "Edit Cash Flow")}
            </Text>
            <IconCashMove />
          </Group>
        }
        size="md"
        padding="md"
      >
        <Flex direction="column" gap="xl">
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
          <Group wrap="nowrap">
            <MultiSelect
              w="100%"
              data={allTags.map((tag) => ({
                label: tag.title,
                value: tag.id,
              }))}
              label={getLocalizedText("Tag", "Tag")}
              placeholder={getLocalizedText("Tag auswählen", "Select a tag")}
              value={tags.map((tag) => tag.id)}
              onChange={(value) =>
                setTags(value.map((tag) => allTags.find((c) => c.id === tag)!))
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
              onClick={() => drawerStack.open("add-tag")}
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
          {isSingleCashFlow(cashFlow) ? (
            <SingleCashFlowForm
              type={type}
              financeCurrency={cashFlow.currency}
              handleSubmit={handleSubmit}
              isLoading={false}
              cashFlow={cashFlow}
            />
          ) : (
            <RecurringCashFlowForm
              type={type}
              financeCurrency={cashFlow.currency}
              handleSubmit={handleSubmit}
              isLoading={false}
              cashFlow={cashFlow}
            />
          )}
          <CancelButton
            onClick={onClose}
            tooltipLabel={getLocalizedText("Abbrechen", "Cancel")}
          />
        </Flex>
      </Drawer>

      <Drawer
        {...drawerStack.register("delete-cash-flow")}
        onClose={() => drawerStack.close("delete-cash-flow")}
        title={
          <Group>
            <IconAlertHexagonFilled size={25} color="red" />
            <Text>
              {getLocalizedText("Cashflow löschen", "Delete Cash Flow")}
            </Text>
          </Group>
        }
      >
        <Text>
          {getLocalizedText(
            "Sind Sie sicher, dass Sie diesen Cashflow löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
            "Are you sure you want to delete this cash flow? This action cannot be undone."
          )}
        </Text>
        <Group mt="md" justify="flex-end" gap="sm">
          <CancelButton
            onClick={() => drawerStack.close("delete-cash-flow")}
            color="teal"
          />
          <DeleteButton
            loading={false}
            onClick={() => {
              if (isSingleCashFlow(cashFlow)) {
                handleSingleDelete();
              } else {
                drawerStack.open("delete-recurring-cash-flow");
              }
            }}
          />
        </Group>
      </Drawer>

      <Drawer
        {...drawerStack.register("delete-recurring-cash-flow")}
        onClose={() => {
          drawerStack.close("delete-cash-flow");
          drawerStack.close("delete-recurring-cash-flow");
        }}
        title={
          <Group>
            <IconAlertHexagonFilled size={25} color="red" />
            <Text>
              {getLocalizedText(
                "Wiederkehrender Cashflow löschen",
                "Delete Recurring Cash Flow"
              )}
            </Text>
          </Group>
        }
      >
        <Stack gap="md">
          <Text>
            {getLocalizedText(
              "Wie möchten Sie mit den verknüpften Einmal-Cashflows verfahren?",
              "How should linked single cash flows be handled?"
            )}
          </Text>
          <Radio.Group
            value={deleteMode}
            onChange={(v) => setDeleteMode(v as any)}
          >
            <Stack gap={6}>
              <Radio
                value={DeleteRecurringCashFlowMode.delete_all}
                label={getLocalizedText(
                  "Alle verknüpften Einmal-Cashflows ebenfalls löschen",
                  "Also delete all linked single cash flows"
                )}
              />
              <Radio
                value={DeleteRecurringCashFlowMode.keep_unlinked}
                label={getLocalizedText(
                  "Einmal-Cashflows behalten (Verknüpfung entfernen)",
                  "Keep single cash flows (unlink from recurring)"
                )}
              />
            </Stack>
          </Radio.Group>

          <Group justify="space-between" mt="sm">
            <Button
              variant="light"
              color="gray"
              onClick={handleDeactivateRecurring}
            >
              {getLocalizedText(
                "Stattdessen deaktivieren",
                "Deactivate instead"
              )}
            </Button>
            <Group gap="sm">
              <CancelButton
                onClick={() => {
                  drawerStack.close("delete-cash-flow");
                  drawerStack.close("delete-recurring-cash-flow");
                }}
                color="teal"
              />
              <DeleteButton
                onClick={() => handleDeleteRecurringWithMode(deleteMode)}
              />
            </Group>
          </Group>
        </Stack>
      </Drawer>

      <Drawer
        {...drawerStack.register("update-cash-flow")}
        onClose={() => drawerStack.close("update-cash-flow")}
        title={getLocalizedText(
          "Bestehende Cashflows aktualisieren",
          "Update Existing Cash Flows"
        )}
      >
        <Stack gap="md">
          <Group gap="sm">
            <IconAlertTriangle size={24} color="orange" />
            <Text size="sm" c="dimmed">
              {getLocalizedText(
                "Sie haben Änderungen an einem wiederkehrenden Cashflow vorgenommen. Möchten Sie alle bestehenden Einmalzahlungen, die aus diesem Wiederholungsmuster erstellt wurden, aktualisieren?",
                "You've made changes to a recurring cash flow. Would you like to update all existing single cash flows that were created from this recurring pattern?"
              )}
            </Text>
          </Group>

          <Text size="sm" c="dimmed">
            {getLocalizedText(
              "Dies wird den Titel, den Betrag, die Währung und die Tags aller vergangenen und aktuellen Cashflows aktualisieren, die aus diesem Wiederholungsmuster generiert wurden. Zukünftige Cashflows werden automatisch die neuen Einstellungen verwenden.",
              "This will update the title, amount, currency, and tags of all past and current cash flows that were generated from this recurring pattern. Future cash flows will automatically use the new settings."
            )}
          </Text>

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={handleUpdateRecurringOnly}>
              {getLocalizedText("Nein, beibehalten", "No, keep existing")}
            </Button>
            <Button color="blue" onClick={handleUpdateAll}>
              {getLocalizedText("Ja, aktualisieren", "Yes, update all")}
            </Button>
          </Group>
        </Stack>
      </Drawer>
      <Drawer
        {...drawerStack.register("add-tag")}
        onClose={() => drawerStack.close("add-tag")}
        title={
          <Group>
            <IconTagPlus />
            <Text>{getLocalizedText("Tag hinzufügen", "Add Tag")}</Text>
          </Group>
        }
      >
        <FinanceTagForm
          onClose={() => drawerStack.close("add-tag")}
          onSuccess={handleAddTag}
        />
      </Drawer>
    </Drawer.Stack>
  );
}
