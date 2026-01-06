import { useEffect, useState } from "react";
import { useMemo } from "react";
import { useLiveQuery } from "@tanstack/react-db";

import { payoutsCollection } from "./payout-collection";
import { singleCashflowsCollection } from "@/db/collections/finance/single-cashflow/single-cashflow-collection";
import { workProjectsCollection } from "@/db/collections/work/work-project/work-project-collection";
import { workTimeEntriesCollection } from "@/db/collections/work/work-time-entry/work-time-entry-collection";

import { Payout } from "@/types/finance.types";

export const usePayouts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const {
    data: payouts,
    isLoading: isPayoutsLoading,
    isReady: isPayoutsReady,
  } = useLiveQuery((q) => q.from({ payouts: payoutsCollection }));
  const {
    data: cashflows,
    isLoading: isCashflowsLoading,
    isReady: isCashflowsReady,
  } = useLiveQuery((q) => q.from({ cashflows: singleCashflowsCollection }));
  const {
    data: workProjects,
    isLoading: isWorkProjectsLoading,
    isReady: isWorkProjectsReady,
  } = useLiveQuery((q) => q.from({ workProjects: workProjectsCollection }));
  const {
    data: workTimeEntries,
    isLoading: isWorkTimeEntriesLoading,
    isReady: isWorkTimeEntriesReady,
  } = useLiveQuery((q) => q.from({ workTimeEntries: workTimeEntriesCollection }));

  useEffect(() => {
    setIsLoading(
      isPayoutsLoading ||
        isCashflowsLoading ||
        isWorkProjectsLoading ||
        isWorkTimeEntriesLoading
    );
  }, [
    isPayoutsLoading,
    isCashflowsLoading,
    isWorkProjectsLoading,
    isWorkTimeEntriesLoading,
  ]);

  useEffect(() => {
    setIsReady(
      isPayoutsReady &&
        isCashflowsReady &&
        isWorkProjectsReady &&
        isWorkTimeEntriesReady
    );
  }, [
    isPayoutsReady,
    isCashflowsReady,
    isWorkProjectsReady,
    isWorkTimeEntriesReady,
  ]);

  const payoutsWithRelations = useMemo((): Payout[] => {
    if (!payouts) return [];

    // Create maps for quick lookup
    const cashflowByPayoutId = new Map<string, Payout["cashflow"]>();
    cashflows?.forEach((cashflow) => {
      if (cashflow.payout_id) {
        cashflowByPayoutId.set(cashflow.payout_id, cashflow);
      }
    });

    const workProjectById = new Map<string, Payout["work_project"]>();
    workProjects?.forEach((project) => {
      workProjectById.set(project.id, project);
    });

    const workTimeEntriesByPayoutId = new Map<
      string,
      Payout["work_time_entry"]
    >();
    workTimeEntries?.forEach((timeEntry) => {
      if (timeEntry.payout_id) {
        const existing = workTimeEntriesByPayoutId.get(timeEntry.payout_id) || [];
        workTimeEntriesByPayoutId.set(timeEntry.payout_id, [...existing, timeEntry]);
      }
    });

    return payouts.map((payout) => ({
      ...payout,
      cashflow: cashflowByPayoutId.get(payout.id) || null,
      work_project: payout.work_project_id
        ? workProjectById.get(payout.work_project_id) || null
        : null,
      work_time_entry: workTimeEntriesByPayoutId.get(payout.id) || [],
    }));
  }, [payouts, cashflows, workProjects, workTimeEntries]);

  return { data: payoutsWithRelations, isLoading, isReady };
};
