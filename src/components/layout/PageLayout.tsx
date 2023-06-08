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
    <div className="p-4 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl my-4">{title}</h1>
        {titleButtons}
      </div>
      <div>{children}</div>
    </div>
  );
}
