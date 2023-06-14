import { issueStore } from "@/stores/issueStore";
import { useStore } from "@nanostores/react";
import Head from "next/head";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import IssuePanel from "../issues/IssuePanel";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { uiStore } from "@/stores/uiStore";
import { classNames } from "@/lib/utils";

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
  const sidebarVisible = useStore(uiStore.sidebarVisible);
  const activeIssue = useStore(issueStore.activeIssue);
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className={twMerge("px-4 sm:px-6 lg:px-8 flex-1 max-h-full overflow-auto", className)}>
        <div className="flex items-center">
          <div
            className={classNames(
              "rounded-md hover:bg-gray-100 mr-2",
              sidebarVisible && "sm:hidden"
            )}
            onClick={() => uiStore.toggleSidebar()}
          >
            <Bars3Icon className="h-5 w-5 text-gray-700" />
          </div>
          <h1 className="font-bold text-2xl my-4 flex-1">{title}</h1>
          {titleButtons}
        </div>
        <div>{children}</div>
      </div>
      {activeIssue && <IssuePanel />}
    </>
  );
}
