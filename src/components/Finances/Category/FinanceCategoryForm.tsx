import { useForm } from "@mantine/form";
import { useIntl } from "@/hooks/useIntl";

import { TextInput, Stack, Textarea } from "@mantine/core";
import { z } from "zod";
import { zod4Resolver } from "mantine-form-zod-resolver";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import { Tables } from "@/types/db.types";
import {
  useAddFinanceCategoryMutation,
  useUpdateFinanceCategoryMutation,
} from "@/db/queries/finances/use-finance-category";

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
  const {
    mutate: addFinanceCategoryMutation,
    isPending: isAddingFinanceCategory,
  } = useAddFinanceCategoryMutation({
    onSuccess: (category) => {
      onSuccess?.(category);
      handleClose();
    },
  });
  const {
    mutate: updateFinanceCategoryMutation,
    isPending: isUpdatingFinanceCategory,
  } = useUpdateFinanceCategoryMutation({ onSuccess: () => handleClose() });

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
      updateFinanceCategoryMutation({
        id: category.id,
        title: values.title,
        description: values.description,
      });
    } else {
      addFinanceCategoryMutation({
        title: values.title,
        description: values.description,
      });
    }
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
            loading={isUpdatingFinanceCategory}
          />
        ) : (
          <CreateButton
            type="submit"
            onClick={form.onSubmit(handleFormSubmit)}
            loading={isAddingFinanceCategory}
          />
        )}
        {onClose && <CancelButton onClick={handleClose} />}
      </Stack>
    </form>
  );
}
