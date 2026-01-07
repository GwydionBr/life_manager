import { useEffect, useState, useMemo } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useWorkProjectMutations } from "@/db/collections/work/work-project/use-work-project-mutations";
import { useIntl } from "@/hooks/useIntl";

import {
  Box,
  Drawer,
  Group,
  Stack,
  Text,
  useDrawersStack,
} from "@mantine/core";
import ProjectForm from "@/components/Work/Project/ProjectForm";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import { IconAlertTriangleFilled, IconCategoryPlus } from "@tabler/icons-react";
import FinanceTagForm from "@/components/Finances/Tag/TagForm";

interface EditProjectDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export default function EditProjectDrawer({
  opened,
  onClose,
}: EditProjectDrawerProps) {
  const { getLocalizedText } = useIntl();
  const { lastActiveProjectId } = useWorkStore();
  const { data: projects } = useWorkProjects();
  const { deleteWorkProject } = useWorkProjectMutations();

  const activeProject = useMemo(
    () => projects.find((p) => p.id === lastActiveProjectId),
    [projects, lastActiveProjectId]
  );

  const [tagIds, setTagIds] = useState<string[]>([]);
  const drawersStack = useDrawersStack([
    "edit-project",
    "delete-project",
    "tag-form",
  ]);

  useEffect(() => {
    if (activeProject) {
      if (activeProject.tags) {
        setTagIds(activeProject.tags.map((c) => c.id));
      }
    }
  }, [activeProject]);

  useEffect(() => {
    if (opened) {
      drawersStack.open("edit-project");
    } else {
      drawersStack.closeAll();
    }
  }, [opened]);

  async function handleDelete() {
    if (activeProject) {
      await deleteWorkProject(activeProject.id);
      onClose();
    }
  }

  if (!activeProject) {
    return null;
  }

  return (
    <Box>
      <Drawer.Stack>
        <Drawer
          {...drawersStack.register("edit-project")}
          onClose={onClose}
          title={
            <Group gap="xs">
              <DeleteActionIcon
                tooltipLabel={getLocalizedText(
                  "Projekt löschen",
                  "Delete Project"
                )}
                onClick={() => drawersStack.open("delete-project")}
              />
              <Text fw={600}>
                {getLocalizedText("Projekt bearbeiten", "Edit project")}
              </Text>
            </Group>
          }
          size="lg"
          padding="md"
        >
          <Stack justify="flex-start" gap="xl">
            <ProjectForm
              project={activeProject}
              onCancel={onClose}
              onSuccess={onClose}
              tagIds={tagIds}
              setTagIds={setTagIds}
              onOpenTagForm={() => drawersStack.open("tag-form")}
            />
          </Stack>
        </Drawer>
        <Drawer
          size="md"
          {...drawersStack.register("delete-project")}
          onClose={() => drawersStack.close("delete-project")}
          title={
            <Group>
              <IconAlertTriangleFilled size={25} color="red" />
              <Text>
                {getLocalizedText("Projekt löschen", "Delete Project")}
              </Text>
            </Group>
          }
        >
          <Text>
            {getLocalizedText(
              "Sind Sie sicher, dass Sie dieses Projekt löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
              "Are you sure you want to delete this project? This action cannot be undone."
            )}
          </Text>
          <Group mt="md" justify="flex-end" gap="sm">
            <CancelButton
              onClick={() => drawersStack.close("delete-project")}
              color="teal"
              tooltipLabel={getLocalizedText("Abbrechen", "Cancel")}
            />
            <DeleteButton
              onClick={handleDelete}
              color="red"
              tooltipLabel={getLocalizedText(
                "Projekt löschen",
                "Delete Project"
              )}
            />
          </Group>
        </Drawer>
        <Drawer
          size="md"
          {...drawersStack.register("tag-form")}
          onClose={() => drawersStack.close("tag-form")}
          title={
            <Group>
              <IconCategoryPlus />
              <Text>
                {getLocalizedText("Kategorie hinzufügen", "Add Category")}
              </Text>
            </Group>
          }
        >
          <FinanceTagForm
            onClose={() => drawersStack.close("tag-form")}
            onSuccess={(category) => setTagIds([...tagIds, category.id])}
          />
        </Drawer>
      </Drawer.Stack>
    </Box>
  );
}
