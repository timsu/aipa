import { formatDistanceToNow } from "date-fns";
import { HTMLAttributes, PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export default function MessageBubble({
  className,
  user,
  children,
  timestamp,
  ...rest
}: PropsWithChildren<
  { user?: string | null; timestamp?: Date | null } & HTMLAttributes<HTMLDivElement>
>) {
  const tsLabel = timestamp ? formatDistanceToNow(timestamp, { addSuffix: true }) : "";
  return (
    <div>
      {user && <div className="mb-1 text-xs text-gray-500">{user}</div>}
      <div className={twMerge("inline-block bg-blue-100 rounded-md p-2", className)} {...rest}>
        {children}
      </div>
      {tsLabel && <div className="mt-1 text-xs text-gray-500">{tsLabel}</div>}
    </div>
  );
}
