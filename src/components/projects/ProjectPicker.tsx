import PopoverMenu, { PopoverSelectOption } from "@/components/ui/PopoverMenu";
import { classNames } from "@/lib/utils";
import { projectStore } from "@/stores/projectStore";
import { useStore } from "@nanostores/react";
import { Project } from "@prisma/client";

export default function ProjectPicker({ project: currentProject }: { project: Project }) {
  const projects = useStore(projectStore.projects);

  const selectProject = (project: Project) => {
    projectStore.activeProject.set(project);
  };

  return (
    <PopoverMenu
      buttonClass={classNames(
        "text-white border-gray-200 group-hover:border-indigo-600 cursor-pointer",
        "flex h-6 px-2 items-center justify-center rounded-lg border text-[0.625rem] font-medium"
      )}
      buttonProps={{ style: { background: `#${currentProject.color}` } }}
      buttonLabel={currentProject.shortcode}
    >
      {projects.map((project) => (
        <PopoverSelectOption
          key={project.id}
          selected={currentProject.id == project.id}
          onClick={() => selectProject(project)}
        >
          {project.name} ({project.shortcode})
        </PopoverSelectOption>
      ))}
    </PopoverMenu>
  );
}
