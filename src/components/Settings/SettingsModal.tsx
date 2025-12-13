import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";

import { Group, Modal, Tabs, Text } from "@mantine/core";
import DefaultSettings from "./General/GeneralSettings";
import FinanceSettings from "./Finances/FinanceSettings";
import {
  IconCurrencyDollar,
  IconBriefcase,
  IconSettings,
  IconCalendar,
  IconTarget,
} from "@tabler/icons-react";
import WorkSettings from "./Work/WorkSettings";
import CalendarSettings from "./Calendar/CalendarSettings";

import { SettingsTab } from "@/stores/settingsStore";
import HabbitTrackerSettings from "./HabbitTracker/HabbitTrackerSettings";

export default function SettingsModal() {
  const { getLocalizedText } = useIntl();
  const { selectedTab, setSelectedTab, isModalOpen, setIsModalOpen } =
    useSettingsStore();

  return (
    <Modal
      opened={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={
        <Group gap="xs">
          <IconSettings size={16} />
          <Text fw={600}>{getLocalizedText("Einstellungen", "Settings")}</Text>
        </Group>
      }
      size="80%"
      centered
      radius="lg"
    >
      <Tabs
        mih="80vh"
        value={selectedTab}
        onChange={(value) => setSelectedTab(value as SettingsTab)}
      >
        <Tabs.List mb="md" grow>
          <Tabs.Tab
            value={SettingsTab.GENERAL}
            leftSection={<IconSettings size={16} />}
          >
            {getLocalizedText("Allgemein", "General")}
          </Tabs.Tab>
          <Tabs.Tab
            value={SettingsTab.WORK}
            leftSection={<IconBriefcase size={16} />}
          >
            {getLocalizedText("Arbeit", "Work")}
          </Tabs.Tab>
          <Tabs.Tab
            value={SettingsTab.FINANCE}
            leftSection={<IconCurrencyDollar size={16} />}
          >
            {getLocalizedText("Finanzen", "Finance")}
          </Tabs.Tab>
          <Tabs.Tab
            value={SettingsTab.CALENDAR}
            leftSection={<IconCalendar size={16} />}
          >
            {getLocalizedText("Kalender", "Calendar")}
          </Tabs.Tab>
          <Tabs.Tab
            value={SettingsTab.HABBIT}
            leftSection={<IconTarget size={16} />}
          >
            {getLocalizedText("Habit Tracker", "Habit Tracker")}
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={SettingsTab.GENERAL}>
          <DefaultSettings />
        </Tabs.Panel>
        <Tabs.Panel value={SettingsTab.WORK}>
          <WorkSettings />
        </Tabs.Panel>
        <Tabs.Panel value={SettingsTab.FINANCE}>
          <FinanceSettings />
        </Tabs.Panel>
        <Tabs.Panel value={SettingsTab.CALENDAR}>
          <CalendarSettings />
        </Tabs.Panel>
        <Tabs.Panel value={SettingsTab.HABBIT}>
          <HabbitTrackerSettings />
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
