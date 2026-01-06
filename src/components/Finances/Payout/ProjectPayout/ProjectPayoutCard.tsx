import { useIntl } from "@/hooks/useIntl";

import { Text, Card, Group } from "@mantine/core";

import type { Tables } from "@/types/db.types";
import { IconBrandCashapp } from "@tabler/icons-react";

interface ProjectPayoutCardProps {
  project: Tables<"work_project">;
}

export default function ProjectPayoutCard({ project: _workProject }: ProjectPayoutCardProps) {
  const { getLocalizedText } = useIntl();

  return (
    <Card withBorder radius="md" mb="md" p="md" shadow="md" w="100%" maw={400}>
      <Card.Section>
        <Group p="md" gap="md">
          <IconBrandCashapp />
          <Text size="sm" fw={500}>
            {getLocalizedText("Schnelle Auszahlung", "Quick Payout")}
          </Text>
        </Group>
      </Card.Section>
      <Card.Section></Card.Section>
      {/* <PayoutModal
        opened={openedModal}
        handleClose={closeModal}
        sessionPayouts={sessionPayouts}
        sessionIds={selectedSessionIds}
        payoutCategoryId={project.project.cash_flow_category_id}
        projectTitle={project.project.title}
      /> */}
    </Card>
  );
}
