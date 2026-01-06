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
import { IconCash } from "@tabler/icons-react";
import FinanceForm from "@/components/Finances/CashFlow/CashflowForm";
import { SettingsTab } from "@/stores/settingsStore";
import FinanceTagForm from "@/components/Finances/Tag/TagForm";
import { Tables } from "@/types/db.types";

export default function FinanceInitializer() {
  const [opened, { open, close }] = useDisclosure(false);
  const [tags, setTags] = useState<Tables<"tag">[]>([]);
  const { getLocalizedText } = useIntl();
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
              onOpenTagForm={open}
              tags={tags}
              setTags={setTags}
            />
          </Box>
          <Modal
            opened={opened}
            onClose={close}
            title={getLocalizedText("Finanz Einstellungen", "Finance Settings")}
          >
            <FinanceTagForm
              onClose={close}
              onSuccess={(tag) => setTags((prev) => [...prev, tag])}
            />
          </Modal>
        </Stack>
      </Paper>
    </Container>
  );
}
