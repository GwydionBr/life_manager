import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFormatter } from "@/hooks/useFormatter";

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
import { IconCash } from "@tabler/icons-react";
import FinanceForm from "@/components/Finances/CashFlow/CashflowForm";
import { SettingsTab } from "../Settings/SettingsModal";
import FinanceCategoryForm from "./Category/FinanceCategoryForm";
import { Tables } from "@/types/db.types";

export default function FinanceInitializer() {
  const [opened, { open, close }] = useDisclosure(false);
  const [categories, setCategories] = useState<Tables<"finance_category">[]>(
    []
  );
  const { getLocalizedText } = useFormatter();
  const { setIsModalOpen, setSelectedTab } = useSettingsStore();
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
              <IconCash size={40} />
            </ThemeIcon>
            <Title order={2} ta="center" fw={700}>
              {getLocalizedText("Finanzmanagement", "Financial Management")}
            </Title>
          </Stack>

          <Stack gap="md">
            <Text size="lg" ta="center" c="dimmed" fw={500}>
              {getLocalizedText(
                "Starten Sie das Verfolgen Ihrer Einnahmen und Ausgaben, um Ihre Finanzen effektiv zu verwalten",
                "Start tracking your income and expenses to manage your finances effectively"
              )}
            </Text>
            <Text size="sm" ta="center" c="dimmed">
              {getLocalizedText(
                "Fügen Sie Ihre erste finanzielle Eintragung hinzu, um Ihr Cashflow zu verfolgen. Sie können sowohl einmalige als auch wiederkehrende Transaktionen verfolgen.",
                "Add your first financial entry to begin monitoring your cash flow. You can track both one-time and recurring transactions."
              )}
            </Text>
            <Text size="sm" ta="center" c="dimmed">
              {getLocalizedText(
                "Möchten Sie Ihre finanziellen Einstellungen anpassen? Besuchen Sie die",
                "Want to customize your financial settings? Visit the"
              )}{" "}
              <Anchor
                component="button"
                onClick={() => {
                  setIsModalOpen(true);
                  setSelectedTab(SettingsTab.FINANCE);
                }}
                c="blue"
                fw={500}
                inline
              >
                {getLocalizedText("Finanz Einstellungen", "Finance Settings")}
              </Anchor>{" "}
              {getLocalizedText(
                "um Standardwährungen und andere Einstellungen zu konfigurieren.",
                "to configure default currencies and other preferences."
              )}
            </Text>
          </Stack>

          <Box maw={600} w="100%" mx="auto">
            <FinanceForm
              onClose={() => {}}
              onOpenCategoryForm={open}
              categories={categories}
              setCategories={setCategories}
            />
          </Box>
          <Modal
            opened={opened}
            onClose={close}
            title={getLocalizedText("Finanz Einstellungen", "Finance Settings")}
          >
            <FinanceCategoryForm
              onClose={close}
              onSuccess={(category) =>
                setCategories((prev) => [...prev, category])
              }
            />
          </Modal>
        </Stack>
      </Paper>
    </Container>
  );
}
