import { contactsCollection } from "@/db/collections/finance/contacts/contact-collection";
import { InsertContact, UpdateContact, Contact } from "@/types/finance.types";

/**
 * Adds a new Contact.
 *
 * @param newContact - The data of the new contact
 * @param userId - The user ID
 * @returns The new Contact or undefined if an error occurs
 */
export const addContact = async (newContact: InsertContact, userId: string) => {
  const contactToInsert: Contact = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
    name: newContact.name || "",
    description: newContact.description || null,
    address: newContact.address || null,
    phone: newContact.phone || null,
    email: newContact.email || null,
    currency: newContact.currency || null,
  };

  try {
    const transaction = contactsCollection.insert(contactToInsert);
    await transaction.isPersisted.promise;
    return contactToInsert;
  } catch (error) {
    console.error(error);
    return;
  }
};

/**
 * Updates a Contact.
 *
 * @param id - The ID of the contact to update
 * @param item - The item to update
 * @returns Returns true if the contact was updated, false otherwise
 */
export const updateContact = async (id: string, item: UpdateContact) => {
  try {
    const transaction = contactsCollection.update(id, (draft) => {
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
 * Deletes a Contact.
 *
 * @param id - The ID or IDs of the contact to delete
 * @returns True if the contact was deleted, false otherwise
 */
export const deleteContact = async (id: string | string[]) => {
  try {
    const transaction = contactsCollection.delete(id);
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
