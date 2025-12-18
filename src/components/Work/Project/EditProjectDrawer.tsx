"use client";

import { useEffect, useState, useMemo } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { workProjectsCollection, useWorkProjects } from "@/db/collections/work/work-project/work-project-collection";
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
import FinanceCategoryForm from "@/components/Finances/Category/FinanceCategoryForm";

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
  const projects = useWorkProjects();

  const activeProject = useMemo(
    () => projects.find((p) => p.id === lastActiveProjectId),
    [projects, lastActiveProjectId]
  );

  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const drawersStack = useDrawersStack([
    "edit-project",
    "delete-project",
    "category-form",
  ]);

  useEffect(() => {
    if (activeProject) {
      if (activeProject.categories) {
        setCategoryIds(activeProject.categories.map((c) => c.id));
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

  function handleClose() {
    drawersStack.closeAll();
    onClose();
  }

  async function handleDelete() {
    if (activeProject) {
      workProjectsCollection.delete(activeProject.id);
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
          onClose={handleClose}
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
              onCancel={handleClose}
              onSuccess={handleClose}
              categoryIds={categoryIds}
              setCategoryIds={setCategoryIds}
              onOpenCategoryForm={() => drawersStack.open("category-form")}
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
              tooltipLabel={getLocalizedText("Projekt löschen", "Delete Project")}
            />
          </Group>
        </Drawer>
        <Drawer
          size="md"
          {...drawersStack.register("category-form")}
          onClose={() => drawersStack.close("category-form")}
          title={
            <Group>
              <IconCategoryPlus />
              <Text>
                {getLocalizedText("Kategorie hinzufügen", "Add Category")}
              </Text>
            </Group>
          }
        >
          <FinanceCategoryForm
            onClose={() => drawersStack.close("category-form")}
            onSuccess={(category) =>
              setCategoryIds([...categoryIds, category.id])
            }
          />
        </Drawer>
      </Drawer.Stack>
    </Box>
  );
}
