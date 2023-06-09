import IssueList from "@/components/issues/IssueList";
import { ButtonLink } from "@/components/ui/Button";

export default function DashboardIssues() {
  const emptyView = (
    <div className="block">
      <div className="mb-8">
        Nothing on your plate! Create a new issue or assign something to yourself.
      </div>
      <ButtonLink href="/issues">All Issues</ButtonLink>
    </div>
  );

  return (
    <>
      <IssueList emptyView={emptyView} />
    </>
  );
}
