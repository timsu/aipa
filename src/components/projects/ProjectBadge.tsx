import { classNames } from "@/lib/utils";
import { Project } from "@prisma/client";

export default function ProjectBadge({ project }: { project: Project }) {
  return (
    <span
      className={classNames(
        "text-white border-gray-200 group-hover:border-indigo-600",
        "flex h-6 px-2 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white"
      )}
      style={{ background: `#${project.color}` }}
    >
      {project.shortcode}
    </span>
  );
}
