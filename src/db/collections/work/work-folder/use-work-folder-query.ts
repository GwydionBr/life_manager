import { useLiveQuery } from "@tanstack/react-db";
import { workFoldersCollection } from "./work-folder-collection";

export const useWorkFolders = () =>
  useLiveQuery((q) => q.from({ workFolders: workFoldersCollection }));
