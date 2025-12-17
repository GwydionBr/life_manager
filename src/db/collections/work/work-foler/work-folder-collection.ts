import { createCollection, useLiveQuery } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  workFolderSchema,
  workFolderDeserializationSchema,
} from "@/db/collections/work/work-foler/work-folder-schema";

// Collection basierend auf der PowerSync-Tabelle 'timer_project'
export const workFoldersCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.timer_project_folder,
    schema: workFolderSchema,
    deserializationSchema: workFolderDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

export const useWorkFolders = () =>
  useLiveQuery((q) => q.from({ workFolders: workFoldersCollection }));
