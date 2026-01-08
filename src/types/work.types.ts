import { Tables, TablesInsert, TablesUpdate } from "./db.types";

// Timer Project Types
export type WorkProject = Tables<"work_project"> & {
  tags: Tables<"tag">[];
};
export type InsertWorkProject = TablesInsert<"work_project"> & {
  tags?: Tables<"tag">[];
};
export type UpdateWorkProject = TablesUpdate<"work_project"> & {
  tags?: Tables<"tag">[] | null;
};
export type CompleteWorkProject = WorkProject & {
  timeEntries: WorkTimeEntry[];
};

// Timer Session Types
export type WorkTimeEntry = Tables<"work_time_entry">;
export type InsertWorkTimeEntry = TablesInsert<"work_time_entry">;
export type UpdateWorkTimeEntry = TablesUpdate<"work_time_entry">;

// Timer Folder Types
export type WorkFolder = Tables<"work_folder">;
export type InsertWorkFolder = TablesInsert<"work_folder">;
export type UpdateWorkFolder = TablesUpdate<"work_folder">;

// Appointment Types
export type Appointment = Tables<"appointment">;
export type InsertAppointment = TablesInsert<"appointment">;
export type UpdateAppointment = TablesUpdate<"appointment">;

export interface ProjectTreeItem {
  id: string;
  name: string;
  index: number;
  type: "project" | "folder";
  children?: ProjectTreeItem[];
}

export interface TimeSpan {
  start_time: number;
  end_time: number;
}
