import { useForm } from "@mantine/form";
import { useIntl } from "@/hooks/useIntl";
import { useTagsMutations } from "@/db/collections/finance/tags/use-tags-mutations";

import { TextInput, Stack, Textarea } from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import { Tables } from "@/types/db.types";

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
});

interface FinanceTagFormProps {
  onClose?: () => void;
  onSuccess?: (tag: Tables<"tag">) => void;
  tag?: Tables<"tag"> | null;
}

export default function FinanceTagForm({
  onClose,
  onSuccess,
  tag,
}: FinanceTagFormProps) {
  const { getLocalizedText } = useIntl();
  const { addTag, updateTag } = useTagsMutations();
  const form = useForm({
    initialValues: {
      title: tag?.title || "",
      description: tag?.description || "",
    },
    validate: zodResolver(schema),
  });

  const handleClose = () => {
    form.reset();
    onClose?.();
  };

  async function handleFormSubmit(values: z.infer<typeof schema>) {
    if (tag) {
      const result = await updateTag(tag.id, values);
      if (result) {
        onSuccess?.({ ...tag, ...values });
        handleClose();
      }
    } else {
      const result = await addTag(values);
      if (result) {
        onSuccess?.(result);
        handleClose();
      }
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label={getLocalizedText("Name", "Name")}
          placeholder={getLocalizedText("Name eingeben", "Enter tag name")}
          {...form.getInputProps("title")}
          data-autofocus
        />
        <Textarea
          label={getLocalizedText("Beschreibung", "Description")}
          placeholder={getLocalizedText(
            "Beschreibung eingeben",
            "Enter tag description"
          )}
          {...form.getInputProps("description")}
        />
        {tag ? (
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
