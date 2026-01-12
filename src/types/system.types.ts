import { Tables, TablesInsert, TablesUpdate } from "./db.types";

export type Notification = Tables<"notification">;
export type InsertNotification = TablesInsert<"notification">;
export type UpdateNotification = TablesUpdate<"notification">;
