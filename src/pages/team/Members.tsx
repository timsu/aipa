import API from "@/client/api";
import Avatar, { UserAvatar } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { uiStore } from "@/stores/uiStore";
import { workspaceStore } from "@/stores/workspaceStore";
import { User } from "@/types";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import { WorkspaceUser } from "@prisma/client";
import { useEffect, useState } from "react";

export default function Members({ isAdmin }: { isAdmin?: boolean }) {
  const users = useStore(workspaceStore.memberList);
  const you = useStore(uiStore.user);
  const workspace = useStore(workspaceStore.activeWorkspace);

  useEffect(() => {
    if (!workspace) return;
    workspaceStore.loadMembers();
  }, [workspace]);

  const removeMember = async (user: User) => {};

  const resend = async (user: User) => {
    await workspaceStore.resendInvite(user);
  };

  return (
    <div className="mt-2 flex flex-col">
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Role
                  </th>
                  {isAdmin && (
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 w-20">
                      <span className="sr-only">Edit</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id || user.name}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        {!user.pending ? (
                          <Avatar className="h-8 w-8" user={user} />
                        ) : (
                          <EnvelopeIcon className="h-8 w-8 text-gray-500" />
                        )}
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          {user.pending && (
                            <div
                              className="text-sm text-blue-500 hover:underline cursor-pointer"
                              onClick={() => resend(user)}
                            >
                              {user.sentEmail ? "(Email sent)" : "(Resend invite?)"}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.role}
                      {user.pending && ` (pending)`}
                    </td>
                    {isAdmin && (
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {user.id != you!.id && (
                          <div className="text-indigo-600 hover:text-indigo-900">
                            <Button className="bg-transparent" onClick={() => removeMember(user)}>
                              Remove
                            </Button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
