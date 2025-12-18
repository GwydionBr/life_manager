"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";

import {
  Stack,
  Text,
  Paper,
  Title,
  Container,
  ThemeIcon,
  Box,
  Anchor,
  Modal,
} from "@mantine/core";
import { IconBriefcase } from "@tabler/icons-react";
import ProjectForm from "./Project/ProjectForm";
import FinanceCategoryForm from "@/components/Finances/Category/FinanceCategoryForm";
import { SettingsTab } from "@/stores/settingsStore";

export default function WorkInitializer() {
  const { getLocalizedText } = useIntl();
  const { setIsModalOpen, setSelectedTab } = useSettingsStore();
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <Container size="md" py="xl">
      <Paper shadow="md" p="xl" radius="lg" withBorder>
        <Stack gap="xl">
          <Stack align="center" gap="md">
            <ThemeIcon
              size={80}
              radius="xl"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
            >
              <IconBriefcase size={40} />
            </ThemeIcon>
            <Title order={2} ta="center" fw={700}>
              {getLocalizedText("Projekt-Management", "Project Management")}
            </Title>
          </Stack>

          <Stack gap="md">
            <Text size="lg" ta="center" c="dimmed" fw={500}>
              {getLocalizedText(
                "Erstelle dein erstes Projekt, um deine Arbeit und Einkommen zu verfolgen",
                "Create your first project to start tracking your work and earnings"
              )}
            </Text>
            <Text size="sm" ta="center" c="dimmed">
              {getLocalizedText(
                "Richte dein Projekt jetzt ein, um deinen Fortschritt und finanzielle Ziele zu überwachen. Du kannst Projektdetails und Einstellungen jederzeit anpassen.",
                "Set up your project now to begin monitoring your progress and financial goals. You can customize project details and settings at any time."
              )}
            </Text>
            <Text size="sm" ta="center" c="dimmed">
              {getLocalizedText(
                "Möchtest du deinen Workflow optimieren? Konfiguriere Standardeinstellungen in",
                "Want to streamline your workflow? Configure default settings in the"
              )}{" "}
              <Anchor
                component="button"
                onClick={() => {
                  setIsModalOpen(true);
                  setSelectedTab(SettingsTab.WORK);
                }}
                c="blue"
                fw={500}
                inline
              >
                {getLocalizedText("Arbeits-Einstellungen", "Work Settings")}
              </Anchor>{" "}
              {getLocalizedText(
                "für schnellere Projekterstellung.",
                "for faster project creation."
              )}
            </Text>
          </Stack>

          <Box maw={600} w="100%" mx="auto">
            <ProjectForm
              categoryIds={categoryIds}
              setCategoryIds={setCategoryIds}
              onOpenCategoryForm={open}
            />
          </Box>
          <Modal
            opened={opened}
            onClose={close}
            title={
              getLocalizedText("Arbeits-Einstellungen", "Work Settings")
            }
          >
            <FinanceCategoryForm
              onClose={close}
              onSuccess={(category) =>
                setCategoryIds([...categoryIds, category.id])
              }
            />
          </Modal>
        </Stack>
      </Paper>
    </Container>
  );
}
