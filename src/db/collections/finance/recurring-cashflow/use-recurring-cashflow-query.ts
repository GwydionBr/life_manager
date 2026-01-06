import { useEffect, useState } from "react";
import { useMemo } from "react";
import {
  createLiveQueryCollection,
  eq,
  useLiveQuery,
} from "@tanstack/react-db";

import {
  recurringCashflowsCollection,
  recurringCashflowTagsCollection,
} from "./recurring-cashflow-collection";
import { tagsCollection } from "@/db/collections/finance/tags/tags-collection";

import { RecurringCashFlow } from "@/types/finance.types";

// Cached Live Query: Recurring Cashflow → Tags Mapping
const recurringCashflowTagMappingCollection = createLiveQueryCollection(
  (q) =>
    q
      .from({ relations: recurringCashflowTagsCollection })
      .innerJoin({ tag: tagsCollection }, ({ relations, tag }) =>
        eq(relations.tag_id, tag.id)
      )
      .select(({ relations, tag }) => ({
        cashflowId: relations.recurring_cashflow_id,
        tag,
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
    q.from({ mappings: recurringCashflowTagMappingCollection })
  );

  useEffect(() => {
    setIsLoading(isCashflowsLoading || isMappingsLoading);
  }, [isCashflowsLoading, isMappingsLoading]);

  useEffect(() => {
    setIsReady(isCashflowsReady && isMappingsReady);
  }, [isCashflowsReady, isMappingsReady]);

  const cashflowsWithTags = useMemo((): RecurringCashFlow[] => {
    if (!cashflows) return [];

    const tagsByCashflow = new Map<string, RecurringCashFlow["tags"]>();
    mappings?.forEach(({ cashflowId, tag }) => {
      if (!tagsByCashflow.has(cashflowId)) {
        tagsByCashflow.set(cashflowId, []);
      }
      tagsByCashflow.get(cashflowId)!.push(tag);
    });

    return cashflows.map((cashflow) => ({
      ...cashflow,
      tags: tagsByCashflow.get(cashflow.id) || [],
    }));
  }, [cashflows, mappings]);

  return { data: cashflowsWithTags, isLoading, isReady };
};
