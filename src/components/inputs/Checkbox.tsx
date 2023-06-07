import { InputHTMLAttributes, PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  id: string;
  label: string;
  description?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Checkbox(props: PropsWithChildren<Props>) {
  const { label, description, children, ...rest } = props;
  return (
    <div className="relative flex items-start">
      <div className="flex h-6 items-center">
        <input
          type="checkbox"
          {...rest}
          className={twMerge(
            "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600",
            props.className
          )}
        />
      </div>
      <div className="ml-3 text-sm leading-6">
        <label htmlFor={rest.id} className="font-medium text-gray-900 cursor-pointer">
          {label}
        </label>{" "}
        {description && <span className="text-gray-500">{description}</span>}
        {children}
      </div>
    </div>
  );
}
