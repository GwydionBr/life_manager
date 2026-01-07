import {
  createCollection,
  createLiveQueryCollection,
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

export const allWorkProjects = createLiveQueryCollection((q) =>
  q.from({ projects: workProjectsCollection })
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

export const allWorkProjectTags = createLiveQueryCollection((q) =>
  q.from({ tags: workProjectTagsCollection })
);
