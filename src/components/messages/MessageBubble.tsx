import { HTMLAttributes, PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export default function MessageBubble({
  className,
  children,
  ...rest
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div>
      <div className={twMerge("inline-block bg-blue-100 rounded-md p-2", className)} {...rest}>
        {children}
      </div>
    </div>
  );
}
