import { InputHTMLAttributes, PropsWithChildren, useRef } from "react";
import { twMerge } from "tailwind-merge";
import useAutosizeTextArea from "../hooks/useAutosizeTextArea";

type Props = {} & InputHTMLAttributes<HTMLTextAreaElement>;

export default function TextArea(props: PropsWithChildren<Props>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const { children, className, ...rest } = props;

  useAutosizeTextArea(ref.current, (rest.value as string) || "");

  return (
    <textarea
      ref={ref}
      className={twMerge(
        "border rounded-md p-2 text-black text-sm leading-6 min-h-[4rem]",
        className
      )}
      {...rest}
    />
  );
}
