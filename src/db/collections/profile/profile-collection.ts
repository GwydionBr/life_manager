import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
import { createCollection, useLiveQuery } from "@tanstack/react-db";
import {
  profileSchema,
  profileDeserializationSchema,
} from "@/db/collections/profile/profile-schema";

// Collection basierend auf der PowerSync-Tabelle 'profiles'
export const profileCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.profiles,
    schema: profileSchema,
    deserializationSchema: profileDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

export const useProfile = () =>
  useLiveQuery((q) => q.from({ profile: profileCollection }).findOne());
