import { IssueType } from "@/types";
import {
  BeakerIcon,
  BugAntIcon,
  CodeBracketSquareIcon,
  IdentificationIcon,
} from "@heroicons/react/24/solid";

export default function IssueIcon({ type }: { type: IssueType }) {
  switch (type) {
    case IssueType.STORY:
      return <IdentificationIcon className="w-6 h-6 text-green-600" />;
    case IssueType.BUG:
      <BugAntIcon className="w-6 h-6 text-red-600" />;
    case IssueType.TASK:
      <CodeBracketSquareIcon className="w-6 h-6 text-blue-400" />;
    case IssueType.EXPRIMENT:
      return <BeakerIcon className="w-6 h-6 text-purple-600" />;
  }
  return null;
}
