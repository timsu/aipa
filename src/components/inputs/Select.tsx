import { InputHTMLAttributes, PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

type Props = {} & InputHTMLAttributes<HTMLSelectElement>;

export default function Select(props: PropsWithChildren<Props>) {
  const { children, ...rest } = props;
  return (
    <div>
      <select
        {...rest}
        className={twMerge(
          "block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 sm:text-sm sm:leading-6",
          props.className
        )}
      >
        {children}
      </select>
    </div>
  );
}
