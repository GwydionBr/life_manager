import { useEffect, useState } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useFinanceProjectMutations } from "@/db/collections/finance/finance-project/use-finance-project-mutations";

import { Drawer, Group, Text, useDrawersStack } from "@mantine/core";
import { IconAlertTriangleFilled, IconMoneybag } from "@tabler/icons-react";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import { showDeleteConfirmationModal } from "@/lib/notificationFunctions";
import { FinanceProject } from "@/types/finance.types";
import FinanceProjectForm from "./FinanceProjectForm";
import ContactForm from "@/components/Finances/Contact/ContactForm";
import FinanceTagForm from "../Tag/TagForm";
import { Tables } from "@/types/db.types";

interface EditFinanceProjectDrawerProps {
  opened: boolean;
  onClose: () => void;
  financeProject: FinanceProject;
}

export default function EditFinanceProjectDrawer({
  opened,
  onClose,
  financeProject,
}: EditFinanceProjectDrawerProps) {
  const { getLocalizedText } = useIntl();
  const { deleteFinanceProject } = useFinanceProjectMutations();
  const [isLoading, setIsLoading] = useState(false);
  const [contact, setContact] = useState<Tables<"contact"> | null>(
    financeProject.contact
  );
  const [tags, setTags] = useState<Tables<"tag">[]>(financeProject.tags);

  const drawerStack = useDrawersStack([
    "edit-finance-project",
    "delete-finance-project",
    "tag-form",
    "contact-form",
  ]);

  useEffect(() => {
    if (opened) {
      drawerStack.open("edit-finance-project");
      setTags(financeProject.tags);
    } else {
      drawerStack.closeAll();
    }
  }, [opened]);

  const handleDelete = async () => {
    setIsLoading(true);
    showDeleteConfirmationModal(
      getLocalizedText("Finanzprojekt löschen", "Delete Finance Project"),
      getLocalizedText(
        "Bist du dir sicher, dass du dieses Finanzprojekt löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.",
        "Are you sure you want to delete this finance project? This action cannot be undone."
      ),
      () => {
        deleteFinanceProject(financeProject.id);
      }
    );
    setIsLoading(false);
  };

  return (
    <Drawer.Stack>
      <Drawer
        {...drawerStack.register("edit-finance-project")}
        onClose={onClose}
        title={
          <Group>
            <DeleteActionIcon
              tooltipLabel={getLocalizedText(
                "Finanzprojekt löschen",
                "Delete Finance Project"
              )}
              onClick={() => drawerStack.open("delete-finance-project")}
            />
            <Text>
              {getLocalizedText(
                "Finanzprojekt bearbeiten",
                "Edit Finance Project"
              )}
            </Text>
            <IconMoneybag />
          </Group>
        }
        size="md"
        padding="md"
      >
        <FinanceProjectForm
          onClose={onClose}
          financeProject={financeProject}
          contact={contact}
          tags={tags}
          onOpenContactForm={() => drawerStack.open("contact-form")}
          onOpenTagForm={() => drawerStack.open("tag-form")}
          onContactChange={setContact}
          onTagChange={setTags}
        />
      </Drawer>
      <Drawer
        {...drawerStack.register("delete-finance-project")}
        onClose={() => drawerStack.close("delete-finance-project")}
        title={
          <Group>
            <IconAlertTriangleFilled size={25} color="red" />
            <Text>
              {getLocalizedText(
                "Finanzprojekt löschen",
                "Delete Finance Project"
              )}
            </Text>
          </Group>
        }
        size="md"
      >
        <Text>
          {getLocalizedText(
            "Bist du dir sicher, dass du dieses Finanzprojekt löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.",
            "Are you sure you want to delete this finance project? This action cannot be undone."
          )}
        </Text>
        <Group mt="md" justify="flex-end" gap="sm">
          <CancelButton
            onClick={() => drawerStack.close("delete-finance-project")}
            color="teal"
          />
          <DeleteButton
            onClick={handleDelete}
            tooltipLabel={getLocalizedText(
              "Finanzprojekt löschen",
              "Delete Finance Project"
            )}
            loading={isLoading}
          />
        </Group>
      </Drawer>
      <Drawer
        {...drawerStack.register("contact-form")}
        onClose={() => drawerStack.close("contact-form")}
        title={<Text>{getLocalizedText("Kontakt", "Contact")}</Text>}
      >
        <ContactForm
          onClose={() => drawerStack.close("contact-form")}
          onSuccess={(client) => setContact(client)}
        />
      </Drawer>
      <Drawer
        {...drawerStack.register("tag-form")}
        onClose={() => drawerStack.close("tag-form")}
        title={<Text>{getLocalizedText("Tag", "Tag")}</Text>}
      >
        <FinanceTagForm
          onClose={() => drawerStack.close("tag-form")}
          onSuccess={(tag) => setTags((prev) => [...prev, tag])}
        />
      </Drawer>
    </Drawer.Stack>
  );
}
