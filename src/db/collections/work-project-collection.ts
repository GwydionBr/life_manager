import { createCollection, useLiveQuery } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";

// Collection basierend auf der PowerSync-Tabelle 'timer_project'
export const workProjectsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.timer_project, // Verweise auf die Lists-Tabelle
  })
);

export const useWorkProjects = () =>
  useLiveQuery((q) => q.from({ workProjects: workProjectsCollection }));
