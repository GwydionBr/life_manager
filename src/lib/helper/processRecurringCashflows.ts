import { TablesInsert } from "@/types/db.types";
import {
  RecurringCashFlow,
  SingleCashFlow,
  InsertSingleCashFlow,
} from "@/types/finance.types";
import { getCorrectDay } from "@/lib/financeHelperFunction";
import {
  addMonths,
  addDays,
  addWeeks,
  addQuarters,
  addYears,
  isSameDay,
} from "date-fns";

export const processRecurringCashFlows = (
  recurringCashFlows: RecurringCashFlow[],
  existingSingleCashFlows: SingleCashFlow[]
): InsertSingleCashFlow[] => {
  const pastAndCurrentFlows: InsertSingleCashFlow[] = [];
  const today = new Date();
  const sixMonthsFromNow = addMonths(today, 6);

  recurringCashFlows.forEach((flow) => {
    const startDate = new Date(flow.start_date);
    const anchorDay = startDate.getDate();
    const endDate = flow.end_date ? new Date(flow.end_date) : null;

    // Calculate the actual end date (either the recurring flow's end date or 6 months from now, whichever comes first)
    const actualEndDate =
      endDate && endDate < sixMonthsFromNow ? endDate : sixMonthsFromNow;

    let currentDate = new Date(startDate);

    while (currentDate <= actualEndDate) {
      // Check if this date already exists in existingSingleCashFlows
      const existingFlow = existingSingleCashFlows.find(
        (singleFlow) =>
          isSameDay(new Date(singleFlow.date), currentDate) &&
          singleFlow.recurring_cash_flow_id === flow.id
      );

      if (!existingFlow) {
        const baseFlow: TablesInsert<"single_cash_flow"> = {
          amount: flow.amount,
          currency: flow.currency,
          date: currentDate.toISOString(),
          title: flow.title,
          is_active: true,
          user_id: flow.user_id,
          recurring_cash_flow_id: flow.id,
          finance_client_id: flow.finance_client_id,
        };

        if (currentDate <= today) {
          // Past or current flow - only include fields needed for insertion
          pastAndCurrentFlows.push({
            ...baseFlow,
            tags: flow.tags,
          });
        }
      }

      // Calculate next date based on interval
      switch (flow.interval) {
        case "day":
          currentDate = addDays(currentDate, 1);
          break;
        case "week":
          currentDate = addWeeks(currentDate, 1);
          break;
        case "month":
          currentDate = addMonths(currentDate, 1);
          currentDate.setDate(getCorrectDay(currentDate, anchorDay));
          break;
        case "1/4 year":
          currentDate = addQuarters(currentDate, 1);
          currentDate.setDate(getCorrectDay(currentDate, anchorDay));
          break;
        case "1/2 year":
          currentDate = addMonths(currentDate, 6);
          currentDate.setDate(getCorrectDay(currentDate, anchorDay));
          break;
        case "year":
          currentDate = addYears(currentDate, 1);
          currentDate.setDate(getCorrectDay(currentDate, anchorDay));
          break;
      }
    }
  });

  return pastAndCurrentFlows;
};
