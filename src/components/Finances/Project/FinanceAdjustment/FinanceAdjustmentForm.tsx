import { useMemo } from "react";
import { useForm } from "@mantine/form";
import { useIntl } from "@/hooks/useIntl";
import { useProfile } from "@/db/collections/profile/profile-collection";

import { Group, NumberInput } from "@mantine/core";
import { TextInput } from "@mantine/core";
import CreateButton from "@/components/UI/Buttons/CreateButton";

import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { projectAdjustmentsCollection } from "@/db/collections/finance/project-adjustment/project-adjustment-collection";
import { useContacts } from "@/db/collections/finance/contacts/contact-collection";
import { useTags } from "@/db/collections/finance/tags/tags-collection";

const schema = z.object({
  amount: z.number(),
  description: z.string().optional(),
  client_id: z.string().optional(),
});

interface FinanceAdjustmentFormProps {
  onClose: () => void;
  onDropdownOpen?: () => void;
  onDropdownClose?: () => void;
  projectId: string;
}

export default function FinanceAdjustmentForm({
  onClose,
  onDropdownOpen,
  onDropdownClose,
  projectId,
}: FinanceAdjustmentFormProps) {
  const { getLocalizedText } = useIntl();
  const { data: profile } = useProfile();
  // const { mutate: addFinanceAdjustment, isPending: isAdding } =
  //   useCreateFinanceAdjustmentMutation({ onSuccess: () => handleClose() });
  const { data: contacts } = useContacts();
  const { data: financeCategories } = useTags();
  const form = useForm({
    initialValues: {
      amount: "",
      description: "",
      finance_client_id: "",
      finance_category_id: "",
    },
    validate: zodResolver(schema),
  });
  const handleSubmit = async (values: {
    amount: string;
    description: string;
    finance_client_id: string;
    finance_category_id: string;
  }) => {
    projectAdjustmentsCollection.insert({
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      user_id: profile?.id || "",
      amount: parseFloat(values.amount === "" ? "0" : values.amount),
      description: values.description || null,
      finance_client_id: values.finance_client_id || null,
      finance_category_id: values.finance_category_id || null,
      finance_project_id: projectId,
      single_cash_flow_id: null,
    });
    handleClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const clientOptions = useMemo(
    () =>
      contacts.map((client) => ({
        value: client.id,
        label: client.name,
      })),
    [contacts]
  );

  const categoryOptions = useMemo(
    () =>
      financeCategories.map((category) => ({
        value: category.id,
        label: category.title,
      })),
    [financeCategories]
  );

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Group wrap="wrap">
        <Group>
          <NumberInput
            withAsterisk
            allowLeadingZeros={false}
            label={getLocalizedText("Betrag", "Amount")}
            {...form.getInputProps("amount")}
            data-autofocus
          />
          <TextInput
            label={getLocalizedText("Beschreibung", "Description")}
            {...form.getInputProps("description")}
          />
        </Group>
        {/* <Group gap={5}>
          <Select
            allowDeselect
            searchable
            clearable
            label={getLocalizedText("Kunde", "Client")}
            onDropdownOpen={onDropdownOpen}
            onDropdownClose={onDropdownClose}
            {...form.getInputProps("finance_client_id")}
            data={clientOptions}
          />
          <Popover>
            <Popover.Target>
              <DelayedTooltip
                label={getLocalizedText("Kunde hinzuügen", "Add client")}
              >
                <Button mt={25} size="compact-sm" variant="subtle">
                  <Group gap="xs">
                    <IconUserPlus size={20} />
                    <Text c="dimmed" size="sm">
                      {getLocalizedText("Kunde", "Client")}
                    </Text>
                  </Group>
                </Button>
              </DelayedTooltip>
            </Popover.Target>
          </Popover>
        </Group>
        <Group>
          <Select
            allowDeselect
            searchable
            clearable
            label={getLocalizedText("Kategorie", "Category")}
            onDropdownOpen={onDropdownOpen}
            onDropdownClose={onDropdownClose}
            {...form.getInputProps("finance_category_id")}
            data={categoryOptions}
          />
          <Popover>
            <Popover.Target>
              <DelayedTooltip
                label={getLocalizedText("Kategorie hinzuügen", "Add category")}
              >
                <Button mt={25} size="compact-sm" variant="subtle">
                  <Group gap="xs">
                    <IconTagPlus size={20} />
                    <Text c="dimmed" size="sm">
                      {getLocalizedText("Kategorie", "Category")}
                    </Text>
                  </Group>
                </Button>
              </DelayedTooltip>
            </Popover.Target>
          </Popover>
        </Group> */}
        <CreateButton
          mt={25}
          type="submit"
          onClick={form.onSubmit(handleSubmit)}
        />
      </Group>
    </form>
  );
}
