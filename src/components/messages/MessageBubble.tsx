import { formatDistanceToNow } from "date-fns";
import { HTMLAttributes, PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export default function MessageBubble({
  className,
  children,
  timestamp,
  ...rest
}: PropsWithChildren<{ timestamp?: Date | null } & HTMLAttributes<HTMLDivElement>>) {
  const tsLabel = timestamp ? formatDistanceToNow(timestamp, { addSuffix: true }) : "";
  return (
    <div>
      <div className={twMerge("inline-block bg-blue-100 rounded-md p-2", className)} {...rest}>
        {children}
      </div>
      {tsLabel && <div className="text-xs text-gray-500">{tsLabel}</div>}
    </div>
  );
}
