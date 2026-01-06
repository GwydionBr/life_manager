import { useEffect, useState } from "react";
import { useMemo } from "react";
import {
  createLiveQueryCollection,
  eq,
  useLiveQuery,
} from "@tanstack/react-db";

import {
  financeProjectsCollection,
  financeProjectTagsCollection,
} from "./finance-project-collection";
import { tagsCollection } from "@/db/collections/finance/tags/tags-collection";
import { projectAdjustmentsCollection } from "@/db/collections/finance/project-adjustment/project-adjustment-collection";
import { contactsCollection } from "@/db/collections/finance/contacts/contact-collection";

import { FinanceProject } from "@/types/finance.types";

// Cached Live Query: Finance Project → Tags Mapping
const financeProjectTagMappingCollection = createLiveQueryCollection((q) =>
  q
    .from({ relations: financeProjectTagsCollection })
    .innerJoin({ tag: tagsCollection }, ({ relations, tag }) =>
      eq(relations.tag_id, tag.id)
    )
    .select(({ relations, tag }) => ({
      projectId: relations.finance_project_id,
      tag,
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
    q.from({ mappings: financeProjectTagMappingCollection })
  );
  const {
    data: adjustments,
    isLoading: isAdjustmentsLoading,
    isReady: isAdjustmentsReady,
  } = useLiveQuery((q) =>
    q.from({ adjustments: projectAdjustmentsCollection })
  );
  const {
    data: contacts,
    isLoading: isContactsLoading,
    isReady: isContactsReady,
  } = useLiveQuery((q) => q.from({ contacts: contactsCollection }));

  useEffect(() => {
    setIsLoading(
      isProjectsLoading ||
        isMappingsLoading ||
        isAdjustmentsLoading ||
        isContactsLoading
    );
  }, [
    isProjectsLoading,
    isMappingsLoading,
    isAdjustmentsLoading,
    isContactsLoading,
  ]);

  useEffect(() => {
    setIsReady(
      isProjectsReady && isMappingsReady && isAdjustmentsReady && isContactsReady
    );
  }, [isProjectsReady, isMappingsReady, isAdjustmentsReady, isContactsReady]);

  const projectsWithTags = useMemo((): FinanceProject[] => {
    if (!projects) return [];

    // Group tags by project
    const tagsByProject = new Map<string, FinanceProject["tags"]>();
    mappings?.forEach(({ projectId, tag }) => {
      if (!tagsByProject.has(projectId)) {
        tagsByProject.set(projectId, []);
      }
      tagsByProject.get(projectId)!.push(tag);
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

    // Create a map of contacts by id for quick lookup
    const contactById = new Map<string, FinanceProject["contact"]>();
    contacts?.forEach((contact) => {
      contactById.set(contact.id, contact);
    });

    return projects.map((project) => ({
      ...project,
      tags: tagsByProject.get(project.id) || [],
      adjustments: adjustmentsByProject.get(project.id) || [],
      contact: project.contact_id
        ? contactById.get(project.contact_id) || null
        : null,
    }));
  }, [projects, mappings, adjustments, contacts]);

  return { data: projectsWithTags, isLoading, isReady };
};
