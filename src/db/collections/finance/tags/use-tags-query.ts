import { useLiveQuery } from "@tanstack/react-db";
import { tagsCollection } from "./tags-collection";

export const useTags = () =>
  useLiveQuery((q) => q.from({ tags: tagsCollection }));
