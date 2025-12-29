// TODO: Implement delete user mutation
import { useIntl } from "@/hooks/useIntl";
// import { useDeleteUserMutation } from "@/utils/queries/auth/use-auth";

import { Button, ButtonProps } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { showDeleteConfirmationModal } from "@/lib/notificationFunctions";


export default function DeleteUserButton({ ...props }: ButtonProps) {
  // const { mutate: deleteUser, isPending } = useDeleteUserMutation();
  const { getLocalizedText } = useIntl();

  async function handleDelete() {
    showDeleteConfirmationModal(
      getLocalizedText("Konto löschen", "Delete Account"),
      getLocalizedText(
        "Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
        "Are you sure you want to delete your account? This action cannot be undone."
      ),
      async () => {
        // deleteUser();
        console.log("deleteUser");
      }
    );
  }

  return (
    <Button
      size="xs"
      leftSection={<IconTrash size={24} />}
      color="red"
      onClick={handleDelete}
      variant="filled"
      // loading={isPending}
      {...props}
    >
      {getLocalizedText("Konto löschen", "Delete Account")}
    </Button>
  );
}
