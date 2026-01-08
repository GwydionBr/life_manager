import { useEffect, useCallback, useRef } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import { useRecurringCashflows } from "@/db/collections/finance/recurring-cashflow/use-recurring-cashflow-query";
import { useSingleCashflowsQuery } from "@/db/collections/finance/single-cashflow/use-single-cashflow-query";
import { processRecurringCashFlows } from "@/lib/helper/processRecurringCashflows";
import { useSingleCashflowMutations } from "@/db/collections/finance/single-cashflow/use-single-cashflow-mutations";
import { isSameDay } from "date-fns";

const LAST_PROCESSED_KEY = "recurringCashflowsLastProcessed";

/**
 * Hook that ensures recurring cashflows are processed daily to create single cashflows.
 *
 * This hook checks if today has already been checked for new single cashflows to create
 * from recurring cashflows. If not checked today, it processes all recurring cashflows
 * and creates the necessary single cashflows. If already checked today, it skips processing.
 *
 * @returns Object with triggerProcessing function to manually trigger processing
 */
export const useProcessRecurringCashflows = () => {
  const { data: profile } = useProfile();
  const { data: recurringCashflows = [], isReady: isRecurringReady } =
    useRecurringCashflows();
  const { data: existingSingleCashflows = [], isReady: isSingleReady } =
    useSingleCashflowsQuery();
  const processingRef = useRef(false);
  const hasProcessedTodayRef = useRef(false);
  const { addSingleCashflow } = useSingleCashflowMutations();
  /**
   * Checks if today has already been processed
   */
  const hasProcessedToday = useCallback((): boolean => {
    try {
      const lastProcessedDate = localStorage.getItem(LAST_PROCESSED_KEY);
      if (!lastProcessedDate) return false;

      const lastProcessed = new Date(lastProcessedDate);
      const today = new Date();
      return isSameDay(lastProcessed, today);
    } catch (error) {
      console.error("Error checking last processed date:", error);
      return false;
    }
  }, []);

  /**
   * Marks today as processed in localStorage
   */
  const markAsProcessed = useCallback(() => {
    try {
      const today = new Date().toISOString();
      localStorage.setItem(LAST_PROCESSED_KEY, today);
      hasProcessedTodayRef.current = true;
    } catch (error) {
      console.error("Error marking as processed:", error);
    }
  }, []);

  /**
   * Processes recurring cashflows and creates new single cashflows
   */
  const processRecurringCashflows = useCallback(async () => {
    if (!profile?.id) {
      console.warn(
        "No user profile found, skipping recurring cashflow processing"
      );
      return;
    }

    if (processingRef.current) {
      console.log("Processing already in progress, skipping");
      return;
    }

    if (hasProcessedTodayRef.current || hasProcessedToday()) {
      console.log("Already processed today, skipping");
      return;
    }

    if (!isRecurringReady || !isSingleReady) {
      console.log("Data not ready yet, skipping");
      return;
    }

    if (recurringCashflows.length === 0) {
      console.log("No recurring cashflows to process");
      markAsProcessed();
      return;
    }

    processingRef.current = true;

    try {
      // Process recurring cashflows to get new single cashflows to create
      const singleCashflowsToInsert = processRecurringCashFlows(
        recurringCashflows,
        existingSingleCashflows
      );

      if (singleCashflowsToInsert.length === 0) {
        console.log("No new single cashflows to create");
        markAsProcessed();
        return;
      }

      // Create the new single cashflows
      await addSingleCashflow(singleCashflowsToInsert);

      console.log(
        `Successfully created ${singleCashflowsToInsert.length} single cashflow(s) from recurring cashflows`
      );
      markAsProcessed();
    } catch (error) {
      console.error("Error processing recurring cashflows:", error);
    } finally {
      processingRef.current = false;
    }
  }, [
    profile?.id,
    recurringCashflows,
    existingSingleCashflows,
    isRecurringReady,
    isSingleReady,
    hasProcessedToday,
    markAsProcessed,
    addSingleCashflow,
  ]);

  /**
   * Manually trigger processing (useful for testing or manual refresh)
   */
  const triggerProcessing = useCallback(() => {
    hasProcessedTodayRef.current = false;
    processRecurringCashflows();
  }, [processRecurringCashflows]);

  // Automatically process on mount if not already processed today
  useEffect(() => {
    // Only process if data is ready and we haven't processed today
    if (isRecurringReady && isSingleReady && profile?.id) {
      if (!hasProcessedToday()) {
        processRecurringCashflows();
      } else {
        hasProcessedTodayRef.current = true;
      }
    }
  }, [
    isRecurringReady,
    isSingleReady,
    profile?.id,
    hasProcessedToday,
    processRecurringCashflows,
  ]);

  return {
    triggerProcessing,
  };
};
