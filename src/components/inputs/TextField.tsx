import { InputHTMLAttributes, PropsWithRef, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type Props = InputHTMLAttributes<HTMLInputElement>;

export default forwardRef<HTMLInputElement, Props>(function TextField(props, ref) {
  const { className, ...rest } = props;
  return (
    <input
      ref={ref}
      type="text"
      className={twMerge("border rounded-md p-2 text-black text-sm leading-6", className)}
      {...rest}
    />
  );
});
