import IssueList from "@/components/issues/IssueList";

export default function DashboardIssues() {
  const emptyView = (
    <div className="">
      Nothing on your plate! Create a new issue or assign something to yourself.
    </div>
  );

  return (
    <>
      <IssueList emptyView={emptyView} />
    </>
  );
}
