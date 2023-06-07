/* This example requires Tailwind CSS v2.0+ */
import { FormEvent, Fragment, HTMLAttributes, MutableRefObject, PropsWithChildren } from "react";

import { Dialog, Transition } from "@headlessui/react";
import { twMerge } from "tailwind-merge";
import { Noto_Sans } from "next/font/google";

const noto = Noto_Sans({ subsets: ["latin"], weight: ["400", "700"] });

export default function Modal(
  props: PropsWithChildren<{
    open: boolean;
    setOpen: (open: boolean) => void;
    initialFocus?: MutableRefObject<HTMLElement | null>;
  }>
) {
  const { open, setOpen, initialFocus, children } = props;
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className={"relative z-10 " + noto.className}
        initialFocus={initialFocus}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel>{children}</Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export const ModalBody = ({
  title,
  buttons,
  icon,
  iconBg,
  className,
  children,
}: PropsWithChildren<{
  title: string;
  buttons?: JSX.Element;
  icon?: JSX.Element;
  iconBg?: string;
  className?: string;
}>) => {
  return (
    <ModalShell className={className}>
      <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 w-full">
        <div className="sm:flex sm:items-start w-full">
          {icon && <ModalIcon className={iconBg}>{icon}</ModalIcon>}
          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
            <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
              {title}
            </Dialog.Title>
            <div className="mt-2 w-full">{children}</div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 sm:flex sm:px-6 justify-end items-center">{buttons}</div>
    </ModalShell>
  );
};

export const ModalIcon = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
  return (
    <div
      className={twMerge(
        "mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ",
        className
      )}
    >
      {children}
    </div>
  );
};

export const ModalShell = ({
  className,
  children,
}: PropsWithChildren<{
  className?: string;
}>) => {
  return (
    <div
      className={twMerge(
        "relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg",
        className
      )}
    >
      {children}
    </div>
  );
};

export const ModalButton = ({
  children,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLButtonElement>>) => {
  const { className, ...rest } = props;
  return (
    <button
      className={twMerge(
        "inline-flex w-full justify-center rounded-md bg-blue-600 disabled:bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};
