import { Tables, Database, TablesUpdate } from "./db.types";

export type FriendshipStatus = Database["public"]["Enums"]["status"];
export enum FriendshipStatusEnum {
  DECLINED = "declined",
  PENDING = "pending",
  ACCEPTED = "accepted",
}

export interface Friend extends Tables<"profiles"> {
  friendshipId: string;
  friendshipCreatedAt: string;
  friendshipStatus: FriendshipStatus;
  isRequester: boolean;
}

export type Profile = Tables<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;
