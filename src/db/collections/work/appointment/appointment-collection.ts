import { createCollection, useLiveQuery } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  appointmentSchema,
  appointmentDeserializationSchema,
} from "@/db/collections/work/appointment/appointment-schema";

// Collection basierend auf der PowerSync-Tabelle 'timer_project'
export const appointmentsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.appointment,
    schema: appointmentSchema,
    deserializationSchema: appointmentDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

export const useAppointments = () =>
  useLiveQuery((q) => q.from({ appointments: appointmentsCollection }));
