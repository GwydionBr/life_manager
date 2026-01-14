import { useState } from "react";
import { useIntl } from "@/hooks/useIntl";

import { Text, Modal, Box, Group, Tabs } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import MoreActionIcon from "@/components/UI/ActionIcons/MoreActionIcon";
import ModifyTime from "@/components/TimeTracker/ModifyTimeTracker/ModifyTime";
import ModifyRounding from "@/components/TimeTracker/ModifyTimeTracker/ModifyRounding";

import { TimeTrackerState } from "@/hooks/useTimeTracker";

interface ModifyTimeTrackerModalProps {
  timerState: TimeTrackerState;
}

export default function ModifyTimeTrackerModal({
  timerState,
}: ModifyTimeTrackerModalProps) {
  const { getLocalizedText } = useIntl();
  const [opened, setOpened] = useState(false);

  return (
    <Box>
      <MoreActionIcon
        onClick={() => setOpened(true)}
        aria-label="Modify Time Tracker"
        tooltipLabel={getLocalizedText(
          "Zeiterfassung anpassen",
          "Modify Time Tracker"
        )}
      />
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
        }}
        title={
          <Group gap="xs">
            <IconSettings size={20} />
            <Text fw={600}>
              {getLocalizedText(
                "Zeiterfassung anpassen",
                "Modify Time Tracker"
              )}
            </Text>
          </Group>
        }
        size="lg"
        styles={{
          title: {
            fontSize: "1.2rem",
            fontWeight: 600,
          },
          header: {
            borderBottom:
              "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-3))",
            paddingBottom: "1rem",
          },
        }}
      >
        <Tabs defaultValue="time" variant="pills">
          <Tabs.List grow mb="md">
            <Tabs.Tab value="time">{getLocalizedText("Zeit", "Time")}</Tabs.Tab>
            <Tabs.Tab value="rounding">
              {getLocalizedText("Rundung", "Rounding")}
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="time">
            <ModifyTime timerState={timerState} />
          </Tabs.Panel>
          <Tabs.Panel value="rounding">
            <ModifyRounding
              timerState={timerState}
              onClose={() => setOpened(false)}
            />
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </Box>
  );
}
