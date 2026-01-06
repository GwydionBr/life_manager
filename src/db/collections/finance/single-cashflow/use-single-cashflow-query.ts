import { useMemo } from "react";
import {
  createLiveQueryCollection,
  eq,
  useLiveQuery,
} from "@tanstack/react-db";

import {
  singleCashflowsCollection,
  singleCashflowTagsCollection,
} from "./single-cashflow-collection";
import { tagsCollection } from "@/db/collections/finance/tags/tags-collection";

import { SingleCashFlow } from "@/types/finance.types";

// Cached Live Query: Single Cashflow → Tags Mapping
const singleCashflowTagMappingCollection = createLiveQueryCollection((q) =>
  q
    .from({ relations: singleCashflowTagsCollection })
    .innerJoin({ tag: tagsCollection }, ({ relations, tag }) =>
      eq(relations.tag_id, tag.id)
    )
    .select(({ relations, tag }) => ({
      cashflowId: relations.single_cashflow_id,
      tag,
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

  // Fetch single cashflow tag mappings
  const {
    data: mappings,
    isLoading: isMappingsLoading,
    isReady: isMappingsReady,
  } = useLiveQuery((q) =>
    q.from({ mappings: singleCashflowTagMappingCollection })
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

  // Combine cashflows and tags
  const cashflowsWithTags = useMemo((): SingleCashFlow[] => {
    if (!cashflows) return [];

    const tagsByCashflow = new Map<string, SingleCashFlow["tags"]>();
    // Map tags to cashflows
    mappings?.forEach(({ cashflowId, tag }) => {
      if (!tagsByCashflow.has(cashflowId)) {
        tagsByCashflow.set(cashflowId, []);
      }
      tagsByCashflow.get(cashflowId)!.push(tag);
    });

    // Return cashflows with tags
    return cashflows.map((cashflow) => ({
      ...cashflow,
      tags: tagsByCashflow.get(cashflow.id) || [],
    }));
  }, [cashflows, mappings]);

  // Return cashflows with tags and loading/ready states
  return { data: cashflowsWithTags, isLoading, isReady };
};
