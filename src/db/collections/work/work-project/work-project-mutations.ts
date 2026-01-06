import { db } from "@/db/powersync/db";
import {
  workProjectsCollection,
  workProjectTagsCollection,
} from "@/db/collections/work/work-project/work-project-collection";
import { UpdateWorkProject, WorkProject } from "@/types/work.types";

/**
 * Adds a new Work Project.
 * Returns the transaction for further processing.
 *
 * @param newWorkProject - The data of the new project
 * @param userId - The user ID
 * @returns Transaction object with isPersisted promise
 */
export const addWorkProject = (newWorkProject: WorkProject, userId: string) => {
  const { tags: _tags, ...projectData } = newWorkProject;
  const transaction = workProjectsCollection.insert({
    ...projectData,
    id: projectData.id || crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
  });

  return transaction;
};

/**
 * Updates a Work Project.
 *
 * @param id - The ID or IDs of the project to update
 * @param item - The item to update
 * @returns Transaction object with isPersisted promise
 */
export const updateWorkProject = (
  id: string | string[],
  item: UpdateWorkProject
) => {
  const { tags: _tags, ...projectData } = item;
  return workProjectsCollection.update(id, (draft) => {
    Object.assign(draft, projectData);
  });
};

/**
 * Deletes a Work Project.
 *
 * @param id - The ID or IDs of the project to delete
 * @returns Transaction object with isPersisted promise
 */
export const deleteWorkProject = (id: string | string[]) => {
  return workProjectsCollection.delete(id);
};

/**
 * Synchronizes the Many-to-Many relations between Project and Finance Tags.
 * Deletes old relations and creates new ones based on tagIds.
 *
 * @param projectId - The project ID
 * @param tagIds - Array of tag IDs to associate
 * @param userId - The user ID
 */
export async function syncProjectTags(
  projectId: string,
  tagIds: string[],
  userId: string
): Promise<void> {
  // 1. Get all existing relations for this project
  const existingRelations = await db.getAll<{
    id: string;
    tag_id: string;
  }>("SELECT id, tag_id FROM work_project_tag WHERE work_project_id = ?", [
    projectId,
  ]);

  const existingTagIds = existingRelations.map((r) => r.tag_id);
  const newTagIds = tagIds || [];

  // 2. Find relations to delete (in existing but not in new)
  const relationsToDelete = existingRelations.filter(
    (relation) => !newTagIds.includes(relation.tag_id)
  );

  // 3. Find tags to add (in new but not in existing)
  const tagsToAdd = newTagIds.filter(
    (tagId) => !existingTagIds.includes(tagId)
  );

  // 4. Delete old relations
  const deletePromises = relationsToDelete.map((relation) =>
    workProjectTagsCollection.delete(relation.id)
  );

  // 5. Create new relations
  const insertPromises = tagsToAdd.map((tagId) =>
    workProjectTagsCollection.insert({
      id: crypto.randomUUID(),
      work_project_id: projectId,
      tag_id: tagId,
      user_id: userId,
      created_at: new Date().toISOString(),
    })
  );

  // 6. Wait for all transactions
  const allTransactions = [...deletePromises, ...insertPromises];
  await Promise.all(allTransactions.map((tx) => tx.isPersisted.promise));
}

/**
 * Loads a complete WorkProject with all Tags.
 *
 * @param projectId - The project ID
 * @returns Complete WorkProject or undefined if not found
 */
export async function getWorkProjectWithTags(
  projectId: string
): Promise<WorkProject | undefined> {
  // Get the project
  const project = await db.getOptional<Omit<WorkProject, "tags">>(
    "SELECT * FROM work_project WHERE id = ?",
    [projectId]
  );

  if (!project) return undefined;

  // Get the associated tags
  const tagRelations = await db.getAll<{
    tag_id: string;
  }>(
    "SELECT tag_id FROM work_project_tag WHERE work_project_id = ?",
    [projectId]
  );

  const tagIds = tagRelations.map((r) => r.tag_id);

  // Get the complete tag data
  const tags =
    tagIds.length > 0
      ? await db.getAll(
          `SELECT * FROM tag WHERE id IN (${tagIds.map(() => "?").join(",")})`,
          tagIds
        )
      : [];

  return {
    ...project,
    tags: tags || [],
  } as WorkProject;
}
