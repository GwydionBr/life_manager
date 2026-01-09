import { appointmentsCollection } from "@/db/collections/work/appointment/appointment-collection";
import {
  InsertAppointment,
  UpdateAppointment,
  Appointment,
} from "@/types/work.types";

/**
 * Adds a new Appointment.
 *
 * @param newAppointment - The data of the new appointment
 * @param userId - The user ID
 * @returns The new Appointment or undefined if an error occurs
 */
export const addAppointment = async (
  newAppointment: InsertAppointment,
  userId: string
) => {
  const appointmentToInsert: Appointment = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
    title: newAppointment.title || "",
    description: newAppointment.description || null,
    start_date: newAppointment.start_date || new Date().toISOString(),
    end_date: newAppointment.end_date || new Date().toISOString(),
    reminder: newAppointment.reminder || null,
    work_project_id: newAppointment.work_project_id || null,
    is_all_day: newAppointment.is_all_day || false,
    type: newAppointment.type || "work",
  };

  try {
    const transaction = appointmentsCollection.insert(appointmentToInsert);
    await transaction.isPersisted.promise;
    return appointmentToInsert;
  } catch (error) {
    console.error(error);
    return;
  }
};

/**
 * Updates an Appointment.
 *
 * @param id - The ID of the appointment to update
 * @param item - The item to update
 * @returns Returns true if the appointment was updated, false otherwise
 */
export const updateAppointment = async (
  id: string,
  item: UpdateAppointment
) => {
  try {
    const transaction = appointmentsCollection.update(id, (draft) => {
      Object.assign(draft, item);
    });
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Deletes an Appointment.
 *
 * @param id - The ID or IDs of the appointment to delete
 * @returns True if the appointment was deleted, false otherwise
 */
export const deleteAppointment = async (id: string | string[]) => {
  try {
    const transaction = appointmentsCollection.delete(id);
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
