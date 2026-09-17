"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  Activity,
  Bot,
  Brain,
  ChartNetwork,
  Check,
  Code2,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  Settings,
  Wrench,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useProjectStore } from "@/store/project-store";

const navigation = [
  {
    label: "Observe",
    items: [
      {
        title: "Overview",
        href: "/overview",
        icon: LayoutDashboard,
      },
      {
        title: "Traces",
        href: "/traces",
        icon: Activity,
      },
      {
        title: "Graph Explorer",
        href: "/graph",
        icon: ChartNetwork,
      },
    ],
  },
  {
    label: "Analyze",
    items: [
      {
        title: "Agents",
        href: "/agents",
        icon: Bot,
      },
      {
        title: "LLMs",
        href: "/llms",
        icon: Brain,
      },
      {
        title: "Tools",
        href: "/tools",
        icon: Wrench,
      },
    ],
  },
  {
    label: "Develop",
    items: [
      {
        title: "API Keys",
        href: "/api-keys",
        icon: KeyRound,
      },
      {
        title: "Projects",
        href: "/projects",
        icon: FolderKanban,
      },
      {
        title: "SDK",
        href: "/sdk",
        icon: Code2,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const projects = useProjectStore(
    (state) => state.projects,
  );

  const activeProject = useProjectStore(
    (state) => state.activeProject,
  );

  const setActiveProject = useProjectStore(
    (state) => state.setActiveProject,
  );

  const projectHref = (path: string) =>
    activeProject
      ? `${path}?projectId=${encodeURIComponent(
        activeProject.id,
      )}`
      : path;

  function handleProjectSelect(projectId: string) {
    const project = projects.find(
      (item) => item.id === projectId,
    );

    if (!project) {
      return;
    }

    setActiveProject(project);

    router.push(
      `/overview?projectId=${encodeURIComponent(
        project.id,
      )}`,
      {
        scroll: false,
      },
    );
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[#d8d8d8] bg-[#e8e8e8] shadow-[4px_0_10px_#cfcfcf]"
    >
      {/* Logo */}
      <SidebarHeader className="bg-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="group hover:bg-muted"
              render={
                <Link
                  href={projectHref("/overview")}
                />
              }
            >
              <img
                src="/logo.png"
                alt="Terrax"
                className="
                  size-15
                  scale-250
                  object-contain
                  brightness-0
                  drop-shadow-[2px_2px_2px_#c4c4c4]
                  transition-all
                  duration-300
                  group-hover:drop-shadow-[3px_3px_3px_#c0c0c0]
                "
              />

              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-base font-semibold">
                  Terrax
                </span>

                <span className="truncate text-xs text-muted-foreground">
                  Observability
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <Separator className="bg-[#d2d2d2]" />

      {/* Navigation */}
      <SidebarContent className="gap-0 bg-[#e8e8e8]">
        {navigation.map((section) => (
          <SidebarGroup
            key={section.label}
            className="py-3"
          >
            <SidebarGroupLabel
              className="
                px-3
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-[#777777]
              "
            >
              {section.label}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(
                      `${item.href}/`,
                    );

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        className={`
                          group
                          h-10
                          rounded-xl
                          px-3
                          transition-all
                          duration-200

                          ${isActive
                            ? `
                                bg-[#e8e8e8]
                                text-[#222222]
                                shadow-[inset_4px_4px_7px_#c5c5c5,inset_-4px_-4px_7px_#ffffff]
                              `
                            : `
                                text-[#555555]
                                hover:bg-[#e8e8e8]
                                hover:text-[#222222]
                                hover:shadow-[5px_5px_10px_#c8c8c8,-5px_-5px_10px_#ffffff]
                              `
                          }

                          active:shadow-[inset_4px_4px_7px_#c3c3c3,inset_-4px_-4px_7px_#ffffff]
                        `}
                        render={
                          <Link
                            href={projectHref(item.href)}
                          />
                        }
                      >
                        <item.icon
                          className={`
                            size-4
                            shrink-0
                            transition-all
                            duration-200

                            ${isActive
                              ? `
                                  text-[#222222]
                                  drop-shadow-none
                                `
                              : `
                                  text-[#666666]
                                  drop-shadow-[1px_1px_1px_#bdbdbd]
                                  group-hover:text-[#222222]
                                  group-hover:drop-shadow-[2px_2px_2px_#c1c1c1]
                                `
                            }
                          `}
                        />

                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Project Selector */}
      <SidebarFooter className="bg-[#e8e8e8] p-3">
        {activeProject ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="
                    h-14
                    rounded-xl
                    bg-[#e8e8e8]
                    px-3
                    shadow-[5px_5px_10px_#c7c7c7,-5px_-5px_10px_#ffffff]
                    transition-all
                    duration-200
                    hover:bg-[#e8e8e8]
                    hover:shadow-[7px_7px_14px_#c5c5c5,-7px_-7px_14px_#ffffff]
                    active:shadow-[inset_3px_3px_6px_#c7c7c7,inset_-3px_-3px_6px_#ffffff]
                  "
                />
              }
            >
              <div
                className="
                  flex
                  size-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[#e8e8e8]
                  text-xs
                  font-semibold
                  text-[#555555]
                  shadow-[inset_2px_2px_4px_#c7c7c7,inset_-2px_-2px_4px_#ffffff]
                "
              >
                {activeProject.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span
                  className="
                    truncate
                    font-medium
                    text-[#333333]
                    [text-shadow:1px_1px_1px_#cfcfcf,-1px_-1px_1px_#ffffff]
                  "
                >
                  {activeProject.name}
                </span>

                <span
                  className="
                    truncate
                    text-xs
                    text-[#777777]
                    [text-shadow:1px_1px_1px_#d2d2d2,-1px_-1px_1px_#ffffff]
                  "
                >
                  Development
                </span>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              side="top"
              className="
                w-[--anchor-width]
                border-[#d2d2d2]
                bg-[#e8e8e8]
              "
            >
              {projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() =>
                    handleProjectSelect(
                      project.id,
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    text-[#555555]
                    focus:bg-[#eeeeee]
                    focus:text-[#222222]
                  "
                >
                  <div
                    className="
                      flex
                      size-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-md
                      border
                      border-[#d8d8d8]
                      bg-[#e8e8e8]
                      text-[10px]
                      font-semibold
                      text-[#555555]
                      shadow-[inset_1px_1px_3px_#c7c7c7,inset_-1px_-1px_3px_#ffffff]
                    "
                  >
                    {project.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <span className="min-w-0 flex-1 truncate">
                    {project.name}
                  </span>

                  {project.id ===
                    activeProject.id && (
                      <Check className="size-4 shrink-0 text-[#333333]" />
                    )}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                render={
                  <Link href="/projects" />
                }
                className="
                  cursor-pointer
                  text-[#555555]
                  focus:bg-[#eeeeee]
                  focus:text-[#222222]
                "
              >
                + New project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <SidebarMenuButton
            size="lg"
            className="
              h-14
              rounded-xl
              bg-[#e8e8e8]
              px-3
              shadow-[5px_5px_10px_#c7c7c7,-5px_-5px_10px_#ffffff]
              transition-all
              duration-200
              hover:bg-[#e8e8e8]
              hover:shadow-[7px_7px_14px_#c5c5c5,-7px_-7px_14px_#ffffff]
            "
            render={
              <Link href="/projects" />
            }
          >
            <div
              className="
                flex
                size-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-[#d8d8d8]
                bg-[#e8e8e8]
                text-sm
                font-semibold
                text-[#555555]
                shadow-[inset_1px_1px_3px_#c7c7c7,inset_-1px_-1px_3px_#ffffff]
              "
            >
              +
            </div>

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span
                className="
                  font-medium
                  text-[#333333]
                  [text-shadow:1px_1px_1px_#cfcfcf,-1px_-1px_1px_#ffffff]
                "
              >
                Create project
              </span>

              <span
                className="
                  text-xs
                  text-[#777777]
                  [text-shadow:1px_1px_1px_#d2d2d2,-1px_-1px_1px_#ffffff]
                "
              >
                No project selected
              </span>
            </div>
          </SidebarMenuButton>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
