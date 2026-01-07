import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { useFinanceProjectMutations } from "@/db/collections/finance/finance-project/use-finance-project-mutations";
import { useContacts } from "@/db/collections/finance/contacts/contact-collection";
import { useTags } from "@/db/collections/finance/tags/use-tags-query";

import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { useSettings } from "@/db/collections/settings/settings-collection";
import { useIntl } from "@/hooks/useIntl";
import {
  Group,
  Select,
  Stack,
  Button,
  TextInput,
  Text,
  MultiSelect,
} from "@mantine/core";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";
import LocaleDatePickerInput from "@/components/UI/Locale/LocaleDatePickerInput";
import { IconPlus } from "@tabler/icons-react";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import { FinanceProject } from "@/types/finance.types";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import { Tables } from "@/types/db.types";
import CustomNumberInput from "@/components/UI/CustomNumberInput";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  currency: z.enum(
    currencies.map((currency) => currency.value) as [Currency, ...Currency[]]
  ),
  start_amount: z.number().min(0, "Start amount is required"),
  due_date: z.string().nullable(),
  tag_ids: z.array(z.string()),
  contact_id: z.string().nullable(),
});

interface FinanceProjectFormProps {
  onClose: () => void;
  financeProject?: FinanceProject;
  contact: Tables<"contact"> | null;
  tags: Tables<"tag">[];
  onOpenContactForm: () => void;
  onOpenTagForm: () => void;
  onContactChange: (value: Tables<"contact"> | null) => void;
  onTagChange: (value: Tables<"tag">[]) => void;
}

export default function FinanceProjectForm({
  onClose,
  financeProject,
  contact,
  tags,
  onOpenContactForm,
  onOpenTagForm,
  onContactChange,
  onTagChange,
}: FinanceProjectFormProps) {
  const { data: settings } = useSettings();
  const { getLocalizedText } = useIntl();
  const { addFinanceProject, updateFinanceProject } =
    useFinanceProjectMutations();
  const { data: allTags } = useTags();
  const { data: contacts } = useContacts();
  const form = useForm<z.infer<typeof projectSchema>>({
    initialValues: financeProject
      ? {
          title: financeProject.title,
          description: financeProject.description || "",
          currency: financeProject.currency,
          start_amount: financeProject.start_amount,
          tag_ids: financeProject.tags.map((tag) => tag.id),
          contact_id: financeProject.contact_id,
          due_date: financeProject.due_date || null,
        }
      : {
          title: "",
          description: "",
          currency: settings?.default_finance_currency || "USD",
          start_amount: 0,
          tag_ids: [],
          contact_id: null,
          due_date: null,
        },
    validate: zodResolver(projectSchema),
  });

  useEffect(() => {
    if (contact) {
      form.setFieldValue("contact_id", contact.id);
    }
    if (tags) {
      form.setFieldValue(
        "tag_ids",
        tags.map((c) => c.id)
      );
    }
  }, [contact, tags]);

  const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
    if (financeProject) {
      const updateProject = {
        ...financeProject,
        title: values.title,
        description: values.description.length > 0 ? values.description : null,
        currency: values.currency,
        start_amount: values.start_amount,
        due_date: values.due_date || null,
        contact_id: values.contact_id,
        tags: allTags.filter((c) => values.tag_ids.includes(c.id)),
        contact: contacts.find((c) => c.id === values.contact_id) || null,
      };
      updateFinanceProject(financeProject.id, updateProject);
    } else {
      const insertProject = {
        title: values.title,
        description: values.description.length > 0 ? values.description : null,
        currency: values.currency,
        start_amount: values.start_amount,
        due_date: values.due_date || null,
        contact_id: values.contact_id,
        contact: contacts.find((c) => c.id === values.contact_id) || null,
        tags: allTags.filter((c) => values.tag_ids.includes(c.id)),
      };
      addFinanceProject(insertProject);
    }
    handleClose();
  };

  function handleClose() {
    onClose();
    form.reset();
  }

  const tagOptions = allTags.map((tag) => ({
    value: tag.id,
    label: tag.title,
  }));
  const contactOptions = contacts.map((contact) => ({
    value: contact.id,
    label: contact.name,
  }));

  const handleContactChange = (value: string | null) => {
    form.setFieldValue("contact_id", value);
    onContactChange(contacts.find((c) => c.id === value) || null);
  };

  const handleTagChange = (value: string[]) => {
    form.setFieldValue("tag_ids", value);
    onTagChange(allTags.filter((c) => value.includes(c.id)));
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label={getLocalizedText("Name", "Title")}
          placeholder={getLocalizedText(
            "Name des Projekts",
            "Enter project name"
          )}
          {...form.getInputProps("title")}
          data-autofocus
        />
        <TextInput
          label={getLocalizedText("Beschreibung", "Description")}
          placeholder={getLocalizedText(
            "Beschreibung eingeben",
            "Enter description"
          )}
          {...form.getInputProps("description")}
        />
        <CustomNumberInput
          withAsterisk
          allowLeadingZeros={false}
          label={getLocalizedText("Startbetrag", "Start amount")}
          {...form.getInputProps("start_amount")}
        />
        <Select
          data={currencies}
          withAsterisk
          label={getLocalizedText("Währung", "Currency")}
          placeholder={getLocalizedText("Währung auswählen", "Select currency")}
          {...form.getInputProps("currency")}
        />
        <LocaleDatePickerInput
          label={getLocalizedText("Fälligkeitsdatum", "Due date")}
          {...form.getInputProps("due_date")}
        />
        <Group wrap="nowrap">
          <MultiSelect
            w="100%"
            multiple
            data={tagOptions}
            searchable
            clearable
            nothingFoundMessage={getLocalizedText(
              "Keine Tags gefunden",
              "No tags found"
            )}
            label={getLocalizedText("Tags", "Tags")}
            placeholder={getLocalizedText("Tags auswählen", "Select tags")}
            value={form.values.tag_ids}
            onChange={handleTagChange}
            error={form.errors.tag_ids}
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
        <Group wrap="nowrap">
          <Select
            w="100%"
            data={contactOptions}
            searchable
            clearable
            nothingFoundMessage={getLocalizedText(
              "Keine Kontakte gefunden",
              "No contacts found"
            )}
            label={getLocalizedText("Kontakt", "Contact")}
            placeholder={getLocalizedText(
              "Kontakt auswählen",
              "Select contact"
            )}
            value={form.values.contact_id || null}
            onChange={handleContactChange}
            error={form.errors.contact_id}
          />
          <Button
            mt={25}
            w={180}
            p={0}
            onClick={onOpenContactForm}
            fw={500}
            variant="subtle"
            size="xs"
            leftSection={<IconPlus size={20} />}
          >
            <Text fz="xs" c="dimmed">
              {getLocalizedText("Neuer Kontakt", "Add Contact")}
            </Text>
          </Button>
        </Group>
        <Stack mt="md">
          {financeProject ? (
            <UpdateButton type="submit" onClick={form.onSubmit(handleSubmit)} />
          ) : (
            <CreateButton type="submit" onClick={form.onSubmit(handleSubmit)} />
          )}
          <CancelButton
            onClick={() => {
              form.reset();
              onClose();
            }}
          />
        </Stack>
      </Stack>
    </form>
  );
}
