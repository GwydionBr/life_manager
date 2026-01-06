import { useEffect, useState } from "react";
import { useMemo } from "react";
import {
  createLiveQueryCollection,
  eq,
  useLiveQuery,
} from "@tanstack/react-db";

import {
  recurringCashflowsCollection,
  recurringCashflowCategoriesCollection,
} from "./recurring-cashflow-collection";
import { tagsCollection } from "@/db/collections/finance/tags/tags-collection";

import { RecurringCashFlow } from "@/types/finance.types";

// Cached Live Query: Recurring Cashflow → Categories Mapping
const recurringCashflowCategoryMappingCollection = createLiveQueryCollection(
  (q) =>
    q
      .from({ relations: recurringCashflowCategoriesCollection })
      .innerJoin({ category: tagsCollection }, ({ relations, category }) =>
        eq(relations.finance_category_id, category.id)
      )
      .select(({ relations, category }) => ({
        cashflowId: relations.recurring_cash_flow_id,
        category,
      }))
);

export const useRecurringCashflows = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const {
    data: cashflows,
    isLoading: isCashflowsLoading,
    isReady: isCashflowsReady,
  } = useLiveQuery((q) =>
    q.from({ recurringCashflows: recurringCashflowsCollection })
  );
  const {
    data: mappings,
    isLoading: isMappingsLoading,
    isReady: isMappingsReady,
  } = useLiveQuery((q) =>
    q.from({ mappings: recurringCashflowCategoryMappingCollection })
  );

  useEffect(() => {
    setIsLoading(isCashflowsLoading || isMappingsLoading);
  }, [isCashflowsLoading, isMappingsLoading]);

  useEffect(() => {
    setIsReady(isCashflowsReady && isMappingsReady);
  }, [isCashflowsReady, isMappingsReady]);

  const cashflowsWithCategories = useMemo((): RecurringCashFlow[] => {
    if (!cashflows) return [];

    const categoriesByCashflow = new Map<string, RecurringCashFlow["tags"]>();
    mappings?.forEach(({ cashflowId, category }) => {
      if (!categoriesByCashflow.has(cashflowId)) {
        categoriesByCashflow.set(cashflowId, []);
      }
      categoriesByCashflow.get(cashflowId)!.push(category);
    });

    return cashflows.map((cashflow) => ({
      ...cashflow,
      categories: categoriesByCashflow.get(cashflow.id) || [],
    }));
  }, [cashflows, mappings]);

  return { data: cashflowsWithCategories, isLoading, isReady };
};
