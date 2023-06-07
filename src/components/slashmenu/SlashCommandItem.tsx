import { CommandItemProps } from "@/components/slashmenu/CommandMenu";
import { CommandItem } from "@/components/slashmenu/SlashExtension";
import { classNames } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

export default function SlashCommandItem({
  item,
  isActive,
  ...props
}: CommandItemProps<CommandItem>) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({ block: "nearest" });
    }
  }, [isActive]);

  return (
    <div
      ref={ref}
      className={classNames(
        "flex items-center cursor-default select-none rounded-xl p-3 min-w-[20rem]",
        isActive && "bg-gray-100"
      )}
      {...props}
    >
      <div
        className={classNames(
          "flex h-10 w-10 flex-none items-center justify-center rounded-lg",
          item.color
        )}
      >
        <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
      </div>
      <div className="ml-4 flex-auto">
        <p
          className={classNames(
            "text-sm font-medium",
            isActive ? "text-gray-900" : "text-gray-700"
          )}
        >
          {item.title}
        </p>
        <p className={classNames("text-sm", isActive ? "text-gray-700" : "text-gray-500")}>
          {item.description}
        </p>
      </div>
      {item.shortcut && (
        <div className="flex-none ml-4">
          <p className="text-sm text-gray-500">{item.shortcut}</p>
        </div>
      )}
    </div>
  );
}
