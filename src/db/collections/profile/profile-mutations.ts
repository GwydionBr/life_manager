import { profileCollection } from "@/db/collections/profile/profile-collection";
import { ProfileUpdate } from "@/types/profile.types";

/**
 * Updates a Profile.
 *
 * @param id - The ID of the profile to update
 * @param item - The item to update
 * @returns Returns true if the profile was updated, false otherwise
 */
export const updateProfile = async (id: string, item: ProfileUpdate) => {
  try {
    const transaction = profileCollection.update(id, (draft) => {
      Object.assign(draft, item);
    });
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
