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
import FinanceClientForm from "@/components/Finances/Contact/ContactForm";
import FinanceCategoryForm from "../Category/FinanceCategoryForm";
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
  const [financeClient, setFinanceClient] =
    useState<Tables<"finance_client"> | null>(financeProject.client);
  const [categories, setCategories] = useState<Tables<"finance_category">[]>(
    financeProject.categories
  );

  const drawerStack = useDrawersStack([
    "edit-finance-project",
    "delete-finance-project",
    "category-form",
    "client-form",
  ]);

  useEffect(() => {
    if (opened) {
      drawerStack.open("edit-finance-project");
      setCategories(
        financeProject.categories
      );
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
          financeClient={financeClient}
          categories={categories}
          onOpenClientForm={() => drawerStack.open("client-form")}
          onOpenCategoryForm={() => drawerStack.open("category-form")}
          onClientChange={setFinanceClient}
          onCategoryChange={setCategories}
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
        {...drawerStack.register("client-form")}
        onClose={() => drawerStack.close("client-form")}
        title={<Text>{getLocalizedText("Kunde", "Client")}</Text>}
      >
        <FinanceClientForm
          onClose={() => drawerStack.close("client-form")}
          onSuccess={(client) => setFinanceClient(client)}
        />
      </Drawer>
      <Drawer
        {...drawerStack.register("category-form")}
        onClose={() => drawerStack.close("category-form")}
        title={<Text>{getLocalizedText("Kategorie", "Category")}</Text>}
      >
        <FinanceCategoryForm
          onClose={() => drawerStack.close("category-form")}
          onSuccess={(category) => setCategories((prev) => [...prev, category])}
        />
      </Drawer>
    </Drawer.Stack>
  );
}
