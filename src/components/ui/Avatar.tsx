import { uiStore } from "@/stores/uiStore";
import { workspaceStore } from "@/stores/workspaceStore";
import { User } from "@/types";
import { useStore } from "@nanostores/react";
import { twMerge } from "tailwind-merge";

export default function Avatar({ user, className }: { user: User; className?: string }) {
  if (!user.image) {
    const initials = (user.name || "?")
      .split(" ", 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    return (
      <span
        className={twMerge(
          "inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-700",
          className
        )}
        data-tooltip-content={user.name || "Unknown User"}
        data-tooltip-id="tooltip"
      >
        <span className="text-xs font-medium leading-none text-white">{initials}</span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-tooltip-content={user.name || "Unknown User"}
      data-tooltip-id="tooltip"
      className={twMerge("inline-block h-6 w-6 rounded-full", className)}
      src={user.image}
      alt={user.name || "User"}
    />
  );
}

export function UserAvatar({ userId, className }: { userId: string; className?: string }) {
  let user: User = useStore(workspaceStore.users)[userId] || { id: userId, name: "User" };

  return <Avatar user={user} className={className} />;
}
