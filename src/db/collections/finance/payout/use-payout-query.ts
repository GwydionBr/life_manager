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
    data: timerProjects,
    isLoading: isTimerProjectsLoading,
    isReady: isTimerProjectsReady,
  } = useLiveQuery((q) => q.from({ timerProjects: workProjectsCollection }));
  const {
    data: timerSessions,
    isLoading: isTimerSessionsLoading,
    isReady: isTimerSessionsReady,
  } = useLiveQuery((q) => q.from({ timerSessions: workTimeEntriesCollection }));

  useEffect(() => {
    setIsLoading(
      isPayoutsLoading ||
        isCashflowsLoading ||
        isTimerProjectsLoading ||
        isTimerSessionsLoading
    );
  }, [
    isPayoutsLoading,
    isCashflowsLoading,
    isTimerProjectsLoading,
    isTimerSessionsLoading,
  ]);

  useEffect(() => {
    setIsReady(
      isPayoutsReady &&
        isCashflowsReady &&
        isTimerProjectsReady &&
        isTimerSessionsReady
    );
  }, [
    isPayoutsReady,
    isCashflowsReady,
    isTimerProjectsReady,
    isTimerSessionsReady,
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

    const timerProjectById = new Map<string, Payout["work_project"]>();
    timerProjects?.forEach((project) => {
      timerProjectById.set(project.id, project);
    });

    const timerSessionsByPayoutId = new Map<
      string,
      Payout["work_time_entry"]
    >();
    timerSessions?.forEach((session) => {
      if (session.payout_id) {
        const existing = timerSessionsByPayoutId.get(session.payout_id) || [];
        timerSessionsByPayoutId.set(session.payout_id, [...existing, session]);
      }
    });

    return payouts.map((payout) => ({
      ...payout,
      cashflow: cashflowByPayoutId.get(payout.id) || null,
      timer_project: payout.timer_project_id
        ? timerProjectById.get(payout.timer_project_id) || null
        : null,
      timer_sessions: timerSessionsByPayoutId.get(payout.id) || [],
    }));
  }, [payouts, cashflows, timerProjects, timerSessions]);

  return { data: payoutsWithRelations, isLoading, isReady };
};
