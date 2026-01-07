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
import { useContacts } from "@/db/collections/finance/contacts/use-contact-query";
import { useTags } from "@/db/collections/finance/tags/use-tags-query";

const schema = z.object({
  amount: z.number(),
  description: z.string().optional(),
  contact_id: z.string().optional(),
});

interface FinanceAdjustmentFormProps {
  onClose: () => void;
  onDropdownOpen?: () => void;
  onDropdownClose?: () => void;
  projectId: string;
}

export default function FinanceAdjustmentForm({
  onClose,
  onDropdownOpen: _onDropdownOpen,
  onDropdownClose: _onDropdownClose,
  projectId,
}: FinanceAdjustmentFormProps) {
  const { getLocalizedText } = useIntl();
  const { data: profile } = useProfile();
  // const { mutate: addFinanceAdjustment, isPending: isAdding } =
  //   useCreateFinanceAdjustmentMutation({ onSuccess: () => handleClose() });
  const { data: contacts } = useContacts();
  const { data: tags } = useTags();
  const form = useForm({
    initialValues: {
      amount: "",
      description: "",
      contact_id: "",
    },
    validate: zodResolver(schema),
  });
  const handleSubmit = async (values: {
    amount: string;
    description: string;
    contact_id: string;
    tag_id: string;
  }) => {
    projectAdjustmentsCollection.insert({
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      user_id: profile?.id || "",
      amount: parseFloat(values.amount === "" ? "0" : values.amount),
      description: values.description || null,
      contact_id: values.contact_id || null,
      finance_project_id: projectId,
      single_cashflow_id: null,
    });
    handleClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const _contactOptions = useMemo(
    () =>
      contacts.map((contact) => ({
        value: contact.id,
        label: contact.name,
      })),
    [contacts]
  );

  const _tagOptions = useMemo(
    () =>
      tags.map((tag) => ({
        value: tag.id,
        label: tag.title,
      })),
    [tags]
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
            label={getLocalizedText("Kontakt", "Contact")}
            onDropdownOpen={onDropdownOpen}
            onDropdownClose={onDropdownClose}
            {...form.getInputProps("contact_id")}
            data={_contactOptions}
          />
          <Popover>
            <Popover.Target>
              <DelayedTooltip
                label={getLocalizedText("Kontakt hinzuügen", "Add contact")}
              >
                <Button mt={25} size="compact-sm" variant="subtle">
                  <Group gap="xs">
                    <IconUserPlus size={20} />
                    <Text c="dimmed" size="sm">
                      {getLocalizedText("Kontakt", "Contact")}
                    </Text>
                  </Group>
                </Button>
              </DelayedTooltip>
            </Popover.Target>
          </Popover>
        </Group>*/}
        <CreateButton
          mt={25}
          type="submit"
          onClick={form.onSubmit(handleSubmit)}
        />
      </Group>
    </form>
  );
}
