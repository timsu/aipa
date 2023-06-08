import { ReactNode } from "react";

export default function PageLayout({
  children,
  title,
  titleButtons,
}: {
  children: ReactNode;
  title: string;
  titleButtons?: ReactNode;
}) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl my-4">{title}</h1>
        {titleButtons}
      </div>
      <div>{children}</div>
    </div>
  );
}
