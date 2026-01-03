import { useMemo } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";
import { usePayouts } from "@/db/collections/finance/payout/use-payout-query";

import { Stack, Group, Skeleton } from "@mantine/core";

import PayoutRowCard from "./PayoutRowCard";
import FinancesNavbar from "../../FinancesNavbar/FinancesNavbar";
import AdjustmentActionIcon from "@/components/UI/ActionIcons/AdjustmentActionIcon";

import { SettingsTab } from "@/stores/settingsStore";
import { useSingleCashflowsQuery } from "@/db/collections/finance/single-cashflow/use-single-cashflow-query";
import { Payout } from "@/types/finance.types";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useWorkTimeEntries } from "@/db/collections/work/work-time-entry/use-work-time-entry-query";
import FinancesNavbarToolbar from "../../FinancesNavbar/FinancesNavbarToolbar";

export default function PayoutTab() {
  const { setIsModalOpen, setSelectedTab } = useSettingsStore();
  const { getLocalizedText } = useIntl();

  const { data: payouts = [], isLoading: isPayoutsPending } = usePayouts();
  const { data: singleCashFlows = [], isLoading: isSingleCashFlowsPending } =
    useSingleCashflowsQuery();
  const { data: projects = [], isLoading: isProjectPending } =
    useWorkProjects();
  const { data: timerSessions = [], isLoading: isTimeEntryPending } =
    useWorkTimeEntries();

  const payoutData = useMemo<Payout[]>(() => {
    return payouts.map((payout) => ({
      ...payout,
      cashflow:
        singleCashFlows.find((flow) => flow.payout_id === payout.id) ?? null,
      timer_project: payout.timer_project_id
        ? (projects.find((project) => project.id === payout.timer_project_id) ??
          null)
        : null,
      timer_sessions:
        timerSessions
          .map((session) => (session.payout_id === payout.id ? session : null))
          .filter((session) => session !== null) ?? [],
    }));
  }, [payouts, singleCashFlows, projects, timerSessions]);

  return (
    <Group wrap="nowrap" align="flex-start" mt="lg" mx="lg" gap="xl">
      <FinancesNavbar
        items={[
          <FinancesNavbarToolbar
            key="payout-toolbar"
            toolbarItems={[
              <AdjustmentActionIcon
                key="payout-adjustment-action-icon"
                size="lg"
                tooltipLabel={getLocalizedText(
                  "Finanz Einstellungen anpassen",
                  "Adjust finance settings"
                )}
                iconSize={20}
                onClick={() => {
                  setIsModalOpen(true);
                  setSelectedTab(SettingsTab.FINANCE);
                }}
              />,
            ]}
          />,
        ]}
      />
      <Stack w="100%" mb="xl" align="center">
        {isPayoutsPending ||
        isSingleCashFlowsPending ||
        isProjectPending ||
        isTimeEntryPending
          ? Array.from({ length: 3 }, (_, i) => (
              <Skeleton height={200} w="100%" key={i} radius="md" />
            ))
          : payoutData.map((payout) => (
              <PayoutRowCard key={payout.id} payout={payout} />
            ))}
      </Stack>
    </Group>
  );
}
