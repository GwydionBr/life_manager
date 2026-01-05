import { useEffect, useState } from "react";
import { useMemo } from "react";
import {
  createLiveQueryCollection,
  eq,
  useLiveQuery,
} from "@tanstack/react-db";

import {
  financeProjectsCollection,
  financeProjectCategoriesCollection,
} from "./finance-project-collection";
import { tagsCollection } from "@/db/collections/finance/tags/tags-collection";
import { projectAdjustmentsCollection } from "@/db/collections/finance/project-adjustment/project-adjustment-collection";
import { contactsCollection } from "@/db/collections/finance/contacts/contact-collection";

import { FinanceProject } from "@/types/finance.types";

// Cached Live Query: Finance Project → Categories Mapping
const financeProjectCategoryMappingCollection = createLiveQueryCollection((q) =>
  q
    .from({ relations: financeProjectCategoriesCollection })
    .innerJoin({ category: tagsCollection }, ({ relations, category }) =>
      eq(relations.finance_category_id, category.id)
    )
    .select(({ relations, category }) => ({
      projectId: relations.finance_project_id,
      category,
    }))
);

export const useFinanceProjects = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const {
    data: projects,
    isLoading: isProjectsLoading,
    isReady: isProjectsReady,
  } = useLiveQuery((q) =>
    q.from({ financeProjects: financeProjectsCollection })
  );
  const {
    data: mappings,
    isLoading: isMappingsLoading,
    isReady: isMappingsReady,
  } = useLiveQuery((q) =>
    q.from({ mappings: financeProjectCategoryMappingCollection })
  );
  const {
    data: adjustments,
    isLoading: isAdjustmentsLoading,
    isReady: isAdjustmentsReady,
  } = useLiveQuery((q) =>
    q.from({ adjustments: projectAdjustmentsCollection })
  );
  const {
    data: clients,
    isLoading: isClientsLoading,
    isReady: isClientsReady,
  } = useLiveQuery((q) => q.from({ clients: contactsCollection }));

  useEffect(() => {
    setIsLoading(
      isProjectsLoading ||
        isMappingsLoading ||
        isAdjustmentsLoading ||
        isClientsLoading
    );
  }, [
    isProjectsLoading,
    isMappingsLoading,
    isAdjustmentsLoading,
    isClientsLoading,
  ]);

  useEffect(() => {
    setIsReady(
      isProjectsReady && isMappingsReady && isAdjustmentsReady && isClientsReady
    );
  }, [isProjectsReady, isMappingsReady, isAdjustmentsReady, isClientsReady]);

  const projectsWithCategories = useMemo((): FinanceProject[] => {
    if (!projects) return [];

    // Group categories by project
    const categoriesByProject = new Map<string, FinanceProject["categories"]>();
    mappings?.forEach(({ projectId, category }) => {
      if (!categoriesByProject.has(projectId)) {
        categoriesByProject.set(projectId, []);
      }
      categoriesByProject.get(projectId)!.push(category);
    });

    // Group adjustments by project
    const adjustmentsByProject = new Map<
      string,
      FinanceProject["adjustments"]
    >();
    adjustments?.forEach((adjustment) => {
      const projectId = adjustment.finance_project_id;
      if (!adjustmentsByProject.has(projectId)) {
        adjustmentsByProject.set(projectId, []);
      }
      adjustmentsByProject.get(projectId)!.push(adjustment);
    });

    // Create a map of clients by id for quick lookup
    const clientsById = new Map<string, FinanceProject["client"]>();
    clients?.forEach((client) => {
      clientsById.set(client.id, client);
    });

    return projects.map((project) => ({
      ...project,
      categories: categoriesByProject.get(project.id) || [],
      adjustments: adjustmentsByProject.get(project.id) || [],
      client: project.finance_client_id
        ? clientsById.get(project.finance_client_id) || null
        : null,
    }));
  }, [projects, mappings, adjustments, clients]);

  return { data: projectsWithCategories, isLoading, isReady };
};
