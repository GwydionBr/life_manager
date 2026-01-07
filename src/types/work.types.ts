import { Tables, TablesInsert, TablesUpdate } from "./db.types";

// Timer Project Types
export interface WorkProject extends Tables<"work_project"> {
  tags: Tables<"tag">[];
}
export interface InsertWorkProject extends TablesInsert<"work_project"> {
  tags?: Tables<"tag">[];
}
export interface UpdateWorkProject extends TablesUpdate<"work_project"> {
  tags?: Tables<"tag">[] | null;
}
export interface CompleteWorkProject extends WorkProject {
  timeEntries: WorkTimeEntry[];
}

// Timer Session Types
export type WorkTimeEntry = Tables<"work_time_entry">;
export type InsertWorkTimeEntry = TablesInsert<"work_time_entry">;
export type UpdateWorkTimeEntry = TablesUpdate<"work_time_entry">;

// Timer Folder Types
export type WorkFolder = Tables<"work_folder">;
export type InsertWorkFolder = TablesInsert<"work_folder">;
export type UpdateWorkFolder = TablesUpdate<"work_folder">;

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
