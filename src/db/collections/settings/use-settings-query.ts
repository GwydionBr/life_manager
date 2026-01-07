import { useLiveQuery } from "@tanstack/react-db";
import { settingsCollection } from "./settings-collection";

export const useSettings = () =>
  useLiveQuery((q) => q.from({ settings: settingsCollection }).findOne());
