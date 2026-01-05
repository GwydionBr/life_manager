import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { useFinanceProjectMutations } from "@/db/collections/finance/finance-project/use-finance-project-mutations";
import { useContacts } from "@/db/collections/finance/contacts/contact-collection";
import { useTags } from "@/db/collections/finance/tags/tags-collection";

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
  finance_category_ids: z.array(z.string()),
  finance_client_id: z.string().nullable(),
});

interface FinanceProjectFormProps {
  onClose: () => void;
  financeProject?: FinanceProject;
  financeClient: Tables<"finance_client"> | null;
  categories: Tables<"finance_category">[];
  onOpenClientForm: () => void;
  onOpenCategoryForm: () => void;
  onClientChange: (value: Tables<"finance_client"> | null) => void;
  onCategoryChange: (value: Tables<"finance_category">[]) => void;
}

export default function FinanceProjectForm({
  onClose,
  financeProject,
  financeClient,
  categories,
  onOpenClientForm,
  onOpenCategoryForm,
  onClientChange,
  onCategoryChange,
}: FinanceProjectFormProps) {
  const { data: settings } = useSettings();
  const { getLocalizedText } = useIntl();
  const { addFinanceProject, updateFinanceProject } =
    useFinanceProjectMutations();
  // const {
  //   mutate: addFinanceProjectMutation,
  //   isPending: isAddingFinanceProject,
  // } = useCreateFinanceProjectMutation({ onSuccess: () => handleClose() });
  // const {
  //   mutate: updateFinanceProjectMutation,
  //   isPending: isUpdatingFinanceProject,
  // } = useUpdateFinanceProjectMutation({ onSuccess: () => handleClose() });
  const { data: financeCategories } = useTags();
  const { data: contacts } = useContacts();
  const form = useForm<z.infer<typeof projectSchema>>({
    initialValues: financeProject
      ? {
          title: financeProject.title,
          description: financeProject.description || "",
          currency: financeProject.currency,
          start_amount: financeProject.start_amount,
          finance_category_ids: financeProject.categories.map(
            (category) => category.id
          ),
          finance_client_id: financeProject.finance_client_id,
          due_date: financeProject.due_date || null,
        }
      : {
          title: "",
          description: "",
          currency: settings?.default_finance_currency || "USD",
          start_amount: 0,
          finance_category_ids: [],
          finance_client_id: null,
          due_date: null,
        },
    validate: zodResolver(projectSchema),
  });

  useEffect(() => {
    if (financeClient) {
      form.setFieldValue("finance_client_id", financeClient.id);
    }
    if (categories) {
      form.setFieldValue(
        "finance_category_ids",
        categories.map((c) => c.id)
      );
    }
  }, [financeClient, categories]);

  const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
    if (financeProject) {
      const updateProject = {
        ...financeProject,
        title: values.title,
        description: values.description.length > 0 ? values.description : null,
        currency: values.currency,
        start_amount: values.start_amount,
        due_date: values.due_date || null,
        finance_client_id: values.finance_client_id,
        categories: financeCategories.filter((c) =>
          values.finance_category_ids.includes(c.id)
        ),
        client: contacts.find((c) => c.id === values.finance_client_id) || null,
      };
      updateFinanceProject(financeProject.id, updateProject);
    } else {
      const insertProject = {
        title: values.title,
        description: values.description.length > 0 ? values.description : null,
        currency: values.currency,
        start_amount: values.start_amount,
        due_date: values.due_date || null,
        finance_client_id: values.finance_client_id,
        client: contacts.find((c) => c.id === values.finance_client_id) || null,
        categories: financeCategories.filter((c) =>
          values.finance_category_ids.includes(c.id)
        ),
      };
      addFinanceProject(insertProject);
    }
    handleClose();
  };

  function handleClose() {
    onClose();
    form.reset();
  }

  const categoryOptions = financeCategories.map((category) => ({
    value: category.id,
    label: category.title,
  }));
  const clientOptions = contacts.map((client) => ({
    value: client.id,
    label: client.name,
  }));

  const handleClientChange = (value: string | null) => {
    form.setFieldValue("finance_client_id", value);
    onClientChange(contacts.find((c) => c.id === value) || null);
  };

  const handleCategoryChange = (value: string[]) => {
    form.setFieldValue("finance_category_ids", value);
    onCategoryChange(financeCategories.filter((c) => value.includes(c.id)));
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
            data={categoryOptions}
            searchable
            clearable
            nothingFoundMessage={getLocalizedText(
              "Keine Kategorien gefunden",
              "No categories found"
            )}
            label={getLocalizedText("Finanzkategorie", "Finance category")}
            placeholder={getLocalizedText(
              "Finanzkategorie auswählen",
              "Select finance category"
            )}
            value={form.values.finance_category_ids}
            onChange={handleCategoryChange}
            error={form.errors.finance_category_ids}
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
        <Group wrap="nowrap">
          <Select
            w="100%"
            data={clientOptions}
            searchable
            clearable
            nothingFoundMessage={getLocalizedText(
              "Keine Kunden gefunden",
              "No clients found"
            )}
            label={getLocalizedText("Kunde", "Client")}
            placeholder={getLocalizedText("Kunde auswählen", "Select client")}
            value={form.values.finance_client_id || null}
            onChange={handleClientChange}
            error={form.errors.finance_client_id}
          />
          <Button
            mt={25}
            w={180}
            p={0}
            onClick={onOpenClientForm}
            fw={500}
            variant="subtle"
            size="xs"
            leftSection={<IconPlus size={20} />}
          >
            <Text fz="xs" c="dimmed">
              {getLocalizedText("Neuer Kunde", "Add Client")}
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
