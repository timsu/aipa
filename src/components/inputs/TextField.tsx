import { InputHTMLAttributes, PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

type Props = {} & InputHTMLAttributes<HTMLInputElement>;

export default function TextField(props: Props) {
  const { className, ...rest } = props;
  return (
    <input
      type="text"
      className={twMerge("border rounded-md p-2 text-black text-sm leading-6", className)}
      {...rest}
    />
  );
}
