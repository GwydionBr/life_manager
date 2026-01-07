import { useLiveQuery } from "@tanstack/react-db";
import { contactsCollection } from "./contact-collection";

export const useContacts = () =>
  useLiveQuery((q) => q.from({ contacts: contactsCollection }));
