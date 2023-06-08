import { Member } from "@/types";
import { Workspace } from "@prisma/client";

export type ItemsResponse<T> = {
  items: T[];
};

export type ItemResponse<T> = {
  item: T;
};

export type WorkspaceWithMembersResponse = ItemResponse<Workspace> & {
  members: Member[];
};
