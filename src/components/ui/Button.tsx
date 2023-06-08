import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, ButtonHTMLAttributes, PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export const BASE_BUTTON_CLASS =
  "bg-brand-500 disabled:bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-brand-700 cursor-pointer";

export default function Button({
  children,
  ...rest
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const className = twMerge(BASE_BUTTON_CLASS, rest.className);

  return (
    <button {...rest} className={className}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  ...rest
}: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement> & LinkProps>) {
  const className = twMerge(BASE_BUTTON_CLASS, rest.className);

  return (
    <Link {...rest} className={className}>
      {children}
    </Link>
  );
}
