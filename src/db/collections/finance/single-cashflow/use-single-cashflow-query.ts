import { useMemo } from "react";
import {
  createLiveQueryCollection,
  eq,
  useLiveQuery,
} from "@tanstack/react-db";

import {
  singleCashflowsCollection,
  singleCashflowCategoriesCollection,
} from "./single-cashflow-collection";
import { tagsCollection } from "@/db/collections/finance/tags/tags-collection";

import { SingleCashFlow } from "@/types/finance.types";

// Cached Live Query: Single Cashflow → Categories Mapping
const singleCashflowCategoryMappingCollection = createLiveQueryCollection((q) =>
  q
    .from({ relations: singleCashflowCategoriesCollection })
    .innerJoin({ category: tagsCollection }, ({ relations, category }) =>
      eq(relations.finance_category_id, category.id)
    )
    .select(({ relations, category }) => ({
      cashflowId: relations.single_cash_flow_id,
      category,
    }))
);

export const useSingleCashflowsQuery = () => {
  // Fetch single cashflows
  const {
    data: cashflows,
    isLoading: isCashflowsLoading,
    isReady: isCashflowsReady,
  } = useLiveQuery((q) =>
    q.from({ singleCashflows: singleCashflowsCollection })
  );

  // Fetch single cashflow category mappings
  const {
    data: mappings,
    isLoading: isMappingsLoading,
    isReady: isMappingsReady,
  } = useLiveQuery((q) =>
    q.from({ mappings: singleCashflowCategoryMappingCollection })
  );

  // Calculate loading state
  const isLoading = useMemo(
    () => isCashflowsLoading || isMappingsLoading,
    [isCashflowsLoading, isMappingsLoading]
  );

  // Calculate ready state
  const isReady = useMemo(
    () => isCashflowsReady && isMappingsReady,
    [isCashflowsReady, isMappingsReady]
  );

  // Combine cashflows and categories
  const cashflowsWithCategories = useMemo((): SingleCashFlow[] => {
    if (!cashflows) return [];

    const categoriesByCashflow = new Map<
      string,
      SingleCashFlow["categories"]
    >();
    // Map categories to cashflows
    mappings?.forEach(({ cashflowId, category }) => {
      if (!categoriesByCashflow.has(cashflowId)) {
        categoriesByCashflow.set(cashflowId, []);
      }
      categoriesByCashflow.get(cashflowId)!.push(category);
    });

    // Return cashflows with categories
    return cashflows.map((cashflow) => ({
      ...cashflow,
      categories: categoriesByCashflow.get(cashflow.id) || [],
    }));
  }, [cashflows, mappings]);

  // Return cashflows with categories and loading/ready states
  return { data: cashflowsWithCategories, isLoading, isReady };
};
