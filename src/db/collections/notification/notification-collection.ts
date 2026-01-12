import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
import { createCollection } from "@tanstack/react-db";
import {
  notificationSchema,
  notificationDeserializationSchema,
} from "@/db/collections/notification/notification-schema";

export const notificationsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.notification,
    schema: notificationSchema,
    deserializationSchema: notificationDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);
