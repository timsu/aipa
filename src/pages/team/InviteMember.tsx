import Select from "@/components/inputs/Select";
import TextField from "@/components/inputs/TextField";
import Button from "@/components/ui/Button";
import { unwrapError } from "@/lib/utils";
import { workspaceStore } from "@/stores/workspaceStore";
import { WorkspaceRole } from "@/types";
import { FormEvent, useState } from "react";

export default function InviteMember() {
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<WorkspaceRole>(WorkspaceRole.MEMBER);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const isAdmin = true;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email) return setError("Email is required");

    try {
      setSubmitting(true);
      setError(undefined);
      await workspaceStore.inviteMember(email, role);
      setEmail("");
    } catch (e) {
      setError(unwrapError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 shadow sm:rounded-lg mb-8">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Invite Teammates</h3>
        <div className="mt-2 text-sm text-gray-500">
          <p className="mt-4">
            Members have access to all public projects, can create projects, and can add other
            members. Admins can remove members, manage billing, and archive or delete projects.
          </p>
        </div>
        {error && <div className="mt-2 text-sm text-red-500">{error}</div>}

        <form className="mt-5 sm:flex sm:items-center gap-2 select-none" onSubmit={onSubmit}>
          <TextField
            type="email"
            value={email}
            placeholder="you@example.com"
            className="w-72"
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          />

          <Select
            className="bg-transparent"
            value={role}
            onChange={(e) => setRole(e.target.value as WorkspaceRole)}
          >
            <option label="Member" value={WorkspaceRole.MEMBER} />
            {isAdmin && <option label="Admin" value={WorkspaceRole.ADMIN} />}
          </Select>
          <Button
            type="submit"
            disabled={submitting}
            className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Add
          </Button>
        </form>
      </div>
    </div>
  );
}
