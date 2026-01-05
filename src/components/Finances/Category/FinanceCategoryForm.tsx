import { useForm } from "@mantine/form";
import { useIntl } from "@/hooks/useIntl";
import { useProfile } from "@/db/collections/profile/profile-collection";

import { TextInput, Stack, Textarea } from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import { Tables } from "@/types/db.types";
import { tagsCollection } from "@/db/collections/finance/tags/tags-collection";

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
  const { data: profile } = useProfile();

  const form = useForm({
    initialValues: {
      title: category?.title || "",
      description: category?.description || "",
    },
    validate: zodResolver(schema),
  });

  const handleClose = () => {
    form.reset();
    onClose?.();
  };

  async function handleFormSubmit(values: z.infer<typeof schema>) {
    if (category) {
      const newTX = tagsCollection.update(category.id, (draft) => {
        draft.title = values.title;
        draft.description = values.description || null;
      });
      await newTX.isPersisted.promise;
      onSuccess?.(category);
    } else {
      const newId = crypto.randomUUID();
      const newCategory: Tables<"finance_category"> = {
        id: newId,
        created_at: new Date().toISOString(),
        user_id: profile?.id || "",
        title: values.title,
        description: values.description || null,
      };
      const newTX = tagsCollection.insert(newCategory);
      await newTX.isPersisted.promise;
      onSuccess?.(newCategory);
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
