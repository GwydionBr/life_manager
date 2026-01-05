import { useEffect, useState } from "react";
import { useMemo } from "react";
import {
  createLiveQueryCollection,
  eq,
  useLiveQuery,
} from "@tanstack/react-db";

import {
  workProjectsCollection,
  workProjectCategoriesCollection,
} from "./work-project-collection";
import { tagsCollection } from "@/db/collections/finance/tags/tags-collection";

import { WorkProject } from "@/types/work.types";

// Cached Live Query: Project → Categories Mapping
const projectCategoryMappingCollection = createLiveQueryCollection((q) =>
  q
    .from({ relations: workProjectCategoriesCollection })
    .innerJoin({ category: tagsCollection }, ({ relations, category }) =>
      eq(relations.finance_category_id, category.id)
    )
    .select(({ relations, category }) => ({
      projectId: relations.timer_project_id,
      category,
    }))
);

export const useWorkProjects = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const {
    data: projects,
    isLoading: isProjectsLoading,
    isReady: isProjectsReady,
  } = useLiveQuery((q) => q.from({ workProjects: workProjectsCollection }));
  const {
    data: mappings,
    isLoading: isMappingsLoading,
    isReady: isMappingsReady,
  } = useLiveQuery((q) =>
    q.from({ mappings: projectCategoryMappingCollection })
  );

  useEffect(() => {
    setIsLoading(isProjectsLoading || isMappingsLoading);
  }, [isProjectsLoading, isMappingsLoading]);

  useEffect(() => {
    setIsReady(isProjectsReady && isMappingsReady);
  }, [isProjectsReady, isMappingsReady]);

  const projectsWithCategories = useMemo((): WorkProject[] => {
    if (!projects) return [];

    const categoriesByProject = new Map<string, WorkProject["categories"]>();
    mappings?.forEach(({ projectId, category }) => {
      if (!categoriesByProject.has(projectId)) {
        categoriesByProject.set(projectId, []);
      }
      categoriesByProject.get(projectId)!.push(category);
    });

    return projects.map((project) => ({
      ...project,
      categories: categoriesByProject.get(project.id) || [],
    }));
  }, [projects, mappings]);

  return { data: projectsWithCategories, isLoading, isReady };
};
