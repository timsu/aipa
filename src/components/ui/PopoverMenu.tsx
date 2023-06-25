import { classNames } from "@/lib/utils";
import { issueStore } from "@/stores/issueStore";
import { IssueState, stateLabels } from "@/types";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Issue } from "@prisma/client";
import {
  ButtonHTMLAttributes,
  HTMLAttributes,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { usePopper } from "react-popper";
import { twMerge } from "tailwind-merge";

export default function PopoverMenu({
  buttonLabel,
  buttonClass,
  buttonProps,
  popoverClass,
  children,
  popperOptions = {},
}: PropsWithChildren<{
  buttonLabel: string | React.ReactElement;
  buttonClass?: string;
  buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  popoverClass?: string;
  popperOptions?: Parameters<typeof usePopper>[2];
}>) {
  const [open, setOpen] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
    ...popperOptions,
  });

  useEffect(() => {
    if (!open) return;
    console.log("wire up popper", popperElement);
    const docClickListener = (e: Event) => {
      if (!popperElement) return;
      if (popperElement.contains(e.target as Node)) return;
      setOpen(false);
      document.removeEventListener("click", docClickListener);
      document.removeEventListener("touchstart", docClickListener);
    };
    setTimeout(() => {
      document.addEventListener("click", docClickListener);
      document.addEventListener("touchstart", docClickListener);
    }, 0);
    return () => {
      document.removeEventListener("click", docClickListener);
      document.removeEventListener("touchstart", docClickListener);
    };
  }, [open, popperElement]);

  return (
    <>
      <button
        ref={setReferenceElement}
        className={buttonClass}
        {...buttonProps}
        onClick={() => setOpen((o) => !o)}
      >
        {buttonLabel}
      </button>
      {open && (
        <div
          ref={setPopperElement}
          className={twMerge(
            "z-10 overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm",
            popoverClass
          )}
          style={styles.popper}
          {...attributes.popper}
        >
          {children}
        </div>
      )}
    </>
  );
}

export function PopoverSelectOption({
  selected,
  className,
  children,
  ...rest
}: { selected?: boolean } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        selected ? "bg-brand-600 text-white" : "text-gray-900 hover:bg-gray-200",
        "relative cursor-pointer select-none py-2 pl-8 pr-4",
        className
      )}
      {...rest}
    >
      <span className={classNames(selected ? "font-semibold" : "font-normal", "block truncate")}>
        {children}
      </span>

      {selected ? (
        <span
          className={classNames("text-white, absolute inset-y-0 left-0 flex items-center pl-1.5")}
        >
          <CheckIcon className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}
    </div>
  );
}
