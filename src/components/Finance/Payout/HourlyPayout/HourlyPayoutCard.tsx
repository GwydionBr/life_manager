import dayjs from "dayjs";

import { useIntl } from "@/hooks/useIntl";

import { Text, Stack, Card, Group, Loader } from "@mantine/core";
import { IconCashBanknotePlus } from "@tabler/icons-react";
import QuickPayoutButton from "@/components/Finance/Payout/HourlyPayout/QuickPayoutButton";

import { CompleteWorkProject, WorkTimeEntry } from "@/types/work.types";

interface HourlyPayoutCardProps {
  project: CompleteWorkProject;
  isProcessing: boolean;
  handlePayoutClick: (timeEntries: WorkTimeEntry[]) => void;
}
export default function HourlyPayoutCard({
  project,
  isProcessing,
  handlePayoutClick,
}: HourlyPayoutCardProps) {
  const { getLocalizedText } = useIntl();

  const today = dayjs();

  const thisMonthTimeEntries = project.timeEntries.filter((timeEntry) => {
    return dayjs(timeEntry.start_time).isSame(today, "month");
  });
  const lastMonthTimeEntries = project.timeEntries.filter((timeEntry) => {
    return dayjs(timeEntry.start_time).isSame(
      today.subtract(1, "month"),
      "month"
    );
  });
  const allTimeTimeEntries = project.timeEntries;

  return (
    <Card withBorder radius="md" mb="md" p="md" shadow="md" w="100%" maw={400}>
      <Card.Section>
        <Group p="md" gap="md">
          <IconCashBanknotePlus />
          <Text size="sm" fw={500}>
            {getLocalizedText("Schnelle Auszahlung", "Quick Payout")}
          </Text>
          {isProcessing && <Loader size="xs" />}
        </Group>
      </Card.Section>
      <Card.Section>
        <Stack p="md" gap="md">
          <QuickPayoutButton
            label={getLocalizedText("Gesamter Zeitraum", "All time")}
            timeEntries={allTimeTimeEntries}
            salary={project.salary}
            currency={project.currency}
            timeSpan={[null, null]}
            handleClick={handlePayoutClick}
          />
          <QuickPayoutButton
            label={getLocalizedText("Dieser Monat", "This month")}
            timeEntries={thisMonthTimeEntries}
            salary={project.salary}
            currency={project.currency}
            timeSpan={[today.startOf("month").toDate(), today.toDate()]}
            handleClick={handlePayoutClick}
          />
          <QuickPayoutButton
            label={getLocalizedText("Letzter Monat", "Last month")}
            timeEntries={lastMonthTimeEntries}
            salary={project.salary}
            currency={project.currency}
            timeSpan={[
              today.subtract(1, "month").startOf("month").toDate(),
              today.subtract(1, "month").endOf("month").toDate(),
            ]}
            handleClick={handlePayoutClick}
          />
        </Stack>
      </Card.Section>
    </Card>
  );
}
