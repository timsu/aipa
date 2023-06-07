import Image from "next/image";
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren<{}>) {
  return (
    <main>
      <div className="w-full h-full grid place-items-center">
        <div className="bg-gray-100 shadow-md rounded-md p-4 sm:p-8 flex flex-col items-center gap-4 sm:w-[40rem]">
          <Image src="/icon.svg" alt="Logo" width={64} height={64} />
          <h1 className="text-xl font-bold">DocGet</h1>
          {children}
        </div>
      </div>
    </main>
  );
}
