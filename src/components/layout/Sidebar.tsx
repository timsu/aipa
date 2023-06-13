import {
  CalendarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  ListBulletIcon,
  MapIcon,
  UsersIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@nanostores/react";
import { projectStore } from "@/stores/projectStore";
import { useRouter } from "next/router";

const navigation = [
  { name: "My Stuff", href: "/dashboard", icon: HomeIcon },
  { name: "Issues", href: "/issues", icon: ListBulletIcon },
  { name: "Boards", href: "/boards", icon: ViewColumnsIcon },
  { name: "Roadmap", href: "/roadmap", icon: MapIcon },
  { name: "Team", href: "/team", icon: UsersIcon },
  { name: "Projects", href: "/projects", icon: FolderIcon },
];

export default function Sidebar() {
  const router = useRouter();
  const currentPath = router.asPath;
  const projects = useStore(projectStore.projects);

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 h-full">
      <div className="flex h-16 shrink-0 items-center">
        <Image src="/icon.svg" width={32} height={32} alt="Logo" />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive =
                  currentPath.startsWith(item.href) &&
                  (item.href != "/projects" || router.route != "/projects/[id]");
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={classNames(
                        isActive
                          ? "bg-gray-50 text-indigo-600"
                          : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      )}
                    >
                      <item.icon
                        className={classNames(
                          isActive
                            ? "text-indigo-600"
                            : "text-gray-400 group-hover:text-indigo-600",
                          "h-6 w-6 shrink-0"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          <li>
            <div className="text-sm font-semibold leading-6 text-gray-400">Your projects</div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {projects.map((project) => {
                const href = "/projects/" + project.id;
                const isActive = currentPath.startsWith(href);
                return (
                  <li key={project.id}>
                    <Link
                      href={href}
                      className={classNames(
                        isActive
                          ? "bg-gray-50 text-indigo-600"
                          : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      )}
                    >
                      <span
                        className={classNames(
                          "text-white border-gray-200 group-hover:border-indigo-600",
                          "flex h-6 px-2 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white"
                        )}
                        style={{ background: `#${project.color}` }}
                      >
                        {project.shortcode}
                      </span>
                      <span className="truncate">{project.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          <li className="mt-auto">
            <a
              href="#"
              className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
            >
              <Cog6ToothIcon
                className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600"
                aria-hidden="true"
              />
              Settings
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
