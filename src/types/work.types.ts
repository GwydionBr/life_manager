import { Tables, TablesInsert, TablesUpdate } from "./db.types";

// Timer Project Types
export interface WorkProject extends Tables<"timer_project"> {
  categories: Tables<"finance_category">[];
}
export interface InsertWorkProject extends TablesInsert<"timer_project"> {
  categories: Tables<"finance_category">[];
}
export interface UpdateWorkProject extends TablesUpdate<"timer_project"> {
  categories: Tables<"finance_category">[] | null;
}
export interface CompleteWorkProject extends WorkProject {
  timeEntries: WorkTimeEntry[];
}

// Timer Session Types
export type WorkTimeEntry = Tables<"timer_session">;
export type InsertWorkTimeEntry = TablesInsert<"timer_session">;
export type UpdateWorkTimeEntry = TablesUpdate<"timer_session">;

// Timer Folder Types
export type WorkFolder = Tables<"timer_project_folder">;
export type InsertWorkFolder = TablesInsert<"timer_project_folder">;
export type UpdateWorkFolder = TablesUpdate<"timer_project_folder">;


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
