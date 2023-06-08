import { Member } from "@/types";
import { Workspace } from "@prisma/client";

export type ItemsResponse<T> = T[];

export type ItemResponse<T> = T;

export type WorkspaceWithMembersResponse = ItemResponse<Workspace> & {
  members: Member[];
};
