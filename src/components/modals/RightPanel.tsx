import { Fragment, PropsWithChildren, useState } from "react";
import { Dialog, Popover, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function RightPanel({
  open,
  close,
  title,
  children,
}: PropsWithChildren<{ open: boolean; title: string; close: () => void }>) {
  return (
    <Transition
      show={open}
      className={`absolute lg:relative right-0 top-0 bottom-0 overflow-hidden z-10`}
      enter="transform transition ease-in-out duration-500 sm:duration-700"
      enterFrom="translate-x-full"
      enterTo="translate-x-0"
      leave="transform transition ease-in-out duration-500 sm:duration-700"
      leaveFrom="translate-x-0"
      leaveTo="translate-x-full"
    >
      <div className="pointer-events-auto w-screen max-w-md shadow-left ml-4 h-full">
        <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 border-l">
          <div className="px-4 sm:px-6">
            <div className="flex items-start justify-between">
              <div className="text-base font-semibold leading-6 text-gray-900">{title}</div>
              <div className="ml-3 flex h-7 items-center">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                  onClick={() => close()}
                >
                  <span className="sr-only">Close panel</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <div className="relative mt-6 flex-1 px-4 sm:px-6">{children}</div>
        </div>
      </div>
    </Transition>
  );
}
