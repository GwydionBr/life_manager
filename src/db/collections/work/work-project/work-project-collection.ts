import {
  createCollection,
  createLiveQueryCollection,
  useLiveQuery,
} from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
import { eq } from "@tanstack/db";
import { useMemo } from "react";
import { WorkProject } from "@/types/work.types";
import { financeCategoriesCollection } from "@/db/collections/finance/finance-category/finance-category-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  workProjectSchema,
  workProjectDeserializationSchema,
  workProjectCategorySchema,
  workProjectCategoryDeserializationSchema,
} from "@/db/collections/work/work-project/work-project-schema";

// Collection basierend auf der PowerSync-Tabelle 'timer_project'
export const workProjectsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.timer_project,
    schema: workProjectSchema,
    deserializationSchema: workProjectDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

export const workProjectCategoriesCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.timer_project_category,
    schema: workProjectCategorySchema,
    deserializationSchema: workProjectCategoryDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

// Cached Live Query: Project → Categories Mapping
const projectCategoryMappingCollection = createLiveQueryCollection((q) =>
  q
    .from({ relations: workProjectCategoriesCollection })
    .innerJoin(
      { category: financeCategoriesCollection },
      ({ relations, category }) =>
        eq(relations.finance_category_id, category.id)
    )
    .select(({ relations, category }) => ({
      projectId: relations.timer_project_id,
      category,
    }))
);

export const useWorkProjects = () => {
  const { data: projects } = useLiveQuery((q) =>
    q.from({ workProjects: workProjectsCollection })
  );
  const { data: mappings } = useLiveQuery((q) =>
    q.from({ mappings: projectCategoryMappingCollection })
  );

  return useMemo((): WorkProject[] => {
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
};
