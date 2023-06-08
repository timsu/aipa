import { issueStore } from "@/stores/issueStore";
import { useStore } from "@nanostores/react";
import Head from "next/head";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import IssuePanel from "../issues/IssuePanel";

export default function PageLayout({
  children,
  title,
  titleButtons,
  className,
  fullSize,
}: {
  children: ReactNode;
  title: string;
  titleButtons?: ReactNode;
  fullSize?: boolean;
  className?: string;
}) {
  const activeIssue = useStore(issueStore.activeIssue);
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div
        className={twMerge("px-4 sm:px-6 lg:px-8 flex-1", fullSize ? "" : "max-w-4xl", className)}
      >
        <div className="flex items-center">
          <h1 className="font-bold text-2xl my-4 flex-1">{title}</h1>
          {titleButtons}
        </div>
        <div>{children}</div>
      </div>
      {activeIssue && <IssuePanel />}
    </>
  );
}
