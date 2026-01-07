import { useDisclosure } from "@mantine/hooks";
import { useProfile } from "@/db/collections/profile/profile-collection";

import {
  Modal,
  TextInput,
  Group,
  Stack,
  ActionIcon,
  ActionIconProps,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { IconFolderPlus } from "@tabler/icons-react";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import { workFoldersCollection } from "@/db/collections/work/work-folder/work-folder-collection";

const folderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

export default function NewFolderButton({ ...props }: ActionIconProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const { data: profile } = useProfile();

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
    },
    validate: zodResolver(folderSchema),
  });

  async function handleSubmit(values: { title: string; description: string }) {
    workFoldersCollection.insert({
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      user_id: profile?.id || "",
      title: values.title,
      description: values.description,
      order_index: 0,
      parent_folder: null,
    });
    handleClose();
    form.reset();
  }

  function handleClose() {
    close();
    form.reset();
  }

  return (
    <Group align="center" justify="flex-end">
      <Modal
        opened={opened}
        onClose={handleClose}
        title="Add Folder"
        size="md"
        padding="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              data-autofocus
              label="Title"
              placeholder="Enter folder title"
              {...form.getInputProps("title")}
            />
            <TextInput
              label="Description"
              placeholder="Enter folder description (optional)"
              {...form.getInputProps("description")}
            />
            <Group justify="flex-end">
              <CancelButton onClick={handleClose} />
              <CreateButton
                type="submit"
                onClick={form.onSubmit(handleSubmit)}
                variant="filled"
                title="Create Folder"
              />
            </Group>
          </Stack>
        </form>
      </Modal>

      <DelayedTooltip label="Add folder">
        <ActionIcon
          aria-label="Add folder"
          onClick={open}
          variant="subtle"
          {...props}
        >
          <IconFolderPlus size={20} />
        </ActionIcon>
      </DelayedTooltip>
    </Group>
  );
}
