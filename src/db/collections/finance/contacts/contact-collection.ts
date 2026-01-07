import { createCollection } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  contactSchema,
  contactDeserializationSchema,
} from "@/db/collections/finance/contacts/contact-schema";

// Collection basierend auf der PowerSync-Tabelle 'contact'
export const contactsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.contact,
    schema: contactSchema,
    deserializationSchema: contactDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);
