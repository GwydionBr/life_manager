import {
  createCollection,
  createLiveQueryCollection,
  eq,
} from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Import the PowerSync DB and the App Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  workProjectSchema,
  workProjectDeserializationSchema,
  workProjectTagSchema,
  workProjectTagDeserializationSchema,
} from "@/db/collections/work/work-project/work-project-schema";
import { tagsCollection } from "../../finance/tags/tags-collection";

// Collection based on the PowerSync table 'work_project'
export const workProjectsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.work_project,
    schema: workProjectSchema,
    deserializationSchema: workProjectDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

export const workProjectTagsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.work_project_tag,
    schema: workProjectTagSchema,
    deserializationSchema: workProjectTagDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

// Cached Live Query: Project → Tags Mapping
export const projectTagMappingCollection = createLiveQueryCollection((q) =>
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
