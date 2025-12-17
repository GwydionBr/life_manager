import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
import { createCollection, useLiveQuery } from "@tanstack/react-db";
import {
  settingsSchema,
  settingsDeserializationSchema,
} from "@/db/collections/settings/settings-schema";

export const settingsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.settings,
    schema: settingsSchema,
    deserializationSchema: settingsDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

export const useSettings = () =>
  useLiveQuery((q) => q.from({ settings: settingsCollection }).findOne());
