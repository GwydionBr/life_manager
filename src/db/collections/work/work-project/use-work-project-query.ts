import { useEffect, useState } from "react";
import { useMemo } from "react";
import {
  createLiveQueryCollection,
  eq,
  useLiveQuery,
} from "@tanstack/react-db";

import {
  workProjectsCollection,
  workProjectTagsCollection,
} from "./work-project-collection";
import { tagsCollection } from "@/db/collections/finance/tags/tags-collection";

import { WorkProject } from "@/types/work.types";

// Cached Live Query: Project → Tags Mapping
const projectTagMappingCollection = createLiveQueryCollection((q) =>
  q
    .from({ relations: workProjectTagsCollection })
    .innerJoin({ tag: tagsCollection }, ({ relations, tag }) =>
      eq(relations.tag_id, tag.id)
    )
    .select(({ relations, tag }) => ({
      projectId: relations.work_project_id,
      tag,
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
    q.from({ mappings: projectTagMappingCollection })
  );

  useEffect(() => {
    setIsLoading(isProjectsLoading || isMappingsLoading);
  }, [isProjectsLoading, isMappingsLoading]);

  useEffect(() => {
    setIsReady(isProjectsReady && isMappingsReady);
  }, [isProjectsReady, isMappingsReady]);

  const projectsWithTags = useMemo((): WorkProject[] => {
    if (!projects) return [];

    const tagsByProject = new Map<string, WorkProject["tags"]>();
    mappings?.forEach(({ projectId, tag }) => {
      if (!tagsByProject.has(projectId)) {
        tagsByProject.set(projectId, []);
      }
      tagsByProject.get(projectId)!.push(tag);
    });

    return projects.map((project) => ({
      ...project,
      tags: tagsByProject.get(project.id) || [],
    }));
  }, [projects, mappings]);

  return { data: projectsWithTags, isLoading, isReady };
};
