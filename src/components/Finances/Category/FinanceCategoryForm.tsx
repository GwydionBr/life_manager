import { useForm } from "@mantine/form";
import { useIntl } from "@/hooks/useIntl";
import { useProfileStore } from "@/stores/profileStore";

import { TextInput, Stack, Textarea } from "@mantine/core";
import { z } from "zod";
import { zod4Resolver } from "mantine-form-zod-resolver";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import { Tables } from "@/types/db.types";
import { financeCategoriesCollection } from "@/db/collections/finance/finance-category/finance-category-collection";

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
});

interface FinanceCategoryFormProps {
  onClose?: () => void;
  onSuccess?: (category: Tables<"finance_category">) => void;
  category?: Tables<"finance_category"> | null;
}

export default function FinanceCategoryForm({
  onClose,
  onSuccess,
  category,
}: FinanceCategoryFormProps) {
  const { getLocalizedText } = useIntl();
  const { id: userId } = useProfileStore();

  const form = useForm({
    initialValues: {
      title: category?.title || "",
      description: category?.description || "",
    },
    validate: zod4Resolver(schema),
  });

  const handleClose = () => {
    form.reset();
    onClose?.();
  };

  function handleFormSubmit(values: z.infer<typeof schema>) {
    if (category) {
      const result = financeCategoriesCollection.update(
        category.id,
        (draft) => {
          draft.title = values.title;
          draft.description = values.description || null;
        }
      );
      console.log(result);
    } else {
      const result = financeCategoriesCollection.insert({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        user_id: userId,
        title: values.title,
        description: values.description || null,
      });
      console.log(result);
    }
    handleClose();
  }

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label={getLocalizedText("Name", "Name")}
          placeholder={getLocalizedText("Name eingeben", "Enter category name")}
          {...form.getInputProps("title")}
          data-autofocus
        />
        <Textarea
          label={getLocalizedText("Beschreibung", "Description")}
          placeholder={getLocalizedText(
            "Beschreibung eingeben",
            "Enter category description"
          )}
          {...form.getInputProps("description")}
        />
        {category ? (
          <UpdateButton
            type="submit"
            onClick={form.onSubmit(handleFormSubmit)}
          />
        ) : (
          <CreateButton
            type="submit"
            onClick={form.onSubmit(handleFormSubmit)}
          />
        )}
        {onClose && <CancelButton onClick={handleClose} />}
      </Stack>
    </form>
  );
}
