"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Bell,
  Check,
  ChevronDown,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useProjectStore } from "@/store/project-store";

const pageNames: Record<string, string> = {
  "/overview": "Overview",
  "/traces": "Traces",
  "/projects": "Projects",
  "/settings": "Settings",
  "/graph": "Graph Explorer",
  "/agents": "Agents",
  "/llms": "LLMs",
  "/tools": "Tools",
  "/api-keys": "API Keys",
  "/sdk": "SDK",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [projectMenuOpen, setProjectMenuOpen] =
    useState(false);

  const projects = useProjectStore(
    (state) => state.projects,
  );

  const activeProject = useProjectStore(
    (state) => state.activeProject,
  );

  const setActiveProject = useProjectStore(
    (state) => state.setActiveProject,
  );

  const pageName = pageNames[pathname] ?? "Dashboard";

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
    setProjectMenuOpen(false);

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
    <header
      className="
        sticky
        top-0
        z-50
        flex
        h-14
        shrink-0
        items-center
        justify-between
        border-b
        border-[#d8d8d8]
        bg-[#e8e8e8]
        shadow-[0_3px_10px_#cfcfcf]
      "
    >
      {/* Left */}
      <div className="flex min-w-0 items-center gap-2 px-4">
        <SidebarTrigger
          className="
            size-8
            rounded-lg
            text-[#555555]
            hover:bg-[#dedede]
            hover:text-[#222222]
          "
        />

        <Separator
          orientation="vertical"
          className="mx-1 h-5 bg-[#d0d0d0]"
        />

        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className="shrink-0">
              <BreadcrumbLink
                render={
                  <Link href={projectHref("/overview")} />
                }
                className="
                  font-medium
                  text-[#666666]
                  transition-colors
                  hover:text-[#222222]
                "
              >
                Terrax
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="text-[#999999]" />

            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage
                className="
                  truncate
                  font-semibold
                  text-[#292929]
                "
              >
                {pageName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-3 px-4">
        {/* Project selector */}
        <div className="relative">
          <button
            type="button"
            disabled={projects.length === 0}
            onClick={() =>
              setProjectMenuOpen((open) => !open)
            }
            className="
              flex
              h-8
              items-center
              gap-2
              rounded-lg
              bg-[#e8e8e8]
              px-3
              text-xs
              font-medium
              text-[#444444]
              shadow-[2px_2px_5px_#c7c7c7,-2px_-2px_5px_#ffffff]
              transition-all
              hover:text-[#222222]
              active:shadow-[inset_2px_2px_4px_#c7c7c7,inset_-2px_-2px_4px_#ffffff]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <span className="size-1.5 rounded-full bg-[#555555]" />

            <span className="max-w-32 truncate">
              {activeProject?.name ?? "Select project"}
            </span>

            <ChevronDown
              className={`
                size-3
                text-[#777777]
                transition-transform
                ${projectMenuOpen ? "rotate-180" : ""}
              `}
            />
          </button>

          {/* Project dropdown */}
          {projectMenuOpen && projects.length > 0 && (
            <div
              className="
                absolute
                right-0
                top-[calc(100%+8px)]
                z-[100]
                w-56
                overflow-hidden
                rounded-xl
                border
                border-[#d0d0d0]
                bg-[#e8e8e8]
                p-1.5
                shadow-[6px_6px_14px_#c7c7c7,-4px_-4px_10px_#ffffff]
              "
            >
              <div className="px-2.5 py-2">
                <p
                  className="
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-wider
                    text-[#888888]
                  "
                >
                  Projects
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {projects.map((project) => {
                  const isActive =
                    project.id === activeProject?.id;

                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() =>
                        handleProjectSelect(project.id)
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-lg
                        px-2.5
                        py-2
                        text-left
                        text-xs
                        text-[#444444]
                        transition-colors
                        hover:bg-[#dedede]
                      "
                    >
                      <span className="min-w-0 truncate">
                        {project.name}
                      </span>

                      {isActive && (
                        <Check
                          className="
                            ml-2
                            size-3.5
                            shrink-0
                            text-[#333333]
                          "
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* System status */}
        <div
          className="
            flex
            h-8
            items-center
            gap-2
            rounded-lg
            bg-[#e8e8e8]
            px-3
            shadow-[2px_2px_5px_#c7c7c7,-2px_-2px_5px_#ffffff]
          "
        >
          <span className="size-1.5 rounded-full bg-[#33df10]" />

          <span className="text-xs font-medium text-[#555555]">
            All systems operational
          </span>
        </div>

        {/* Environment */}
        {/* <Badge
          variant="outline"
          className="
            h-7
            rounded-md
            border-[#cfcfcf]
            bg-[#e8e8e8]
            px-2.5
            text-[11px]
            font-medium
            text-[#555555]
            shadow-[1px_1px_3px_#c7c7c7,-1px_-1px_3px_#ffffff]
          "
        >
          Production
        </Badge> */}

        <Separator
          orientation="vertical"
          className="h-5 bg-[#d0d0d0]"
        />

        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          className="
            size-8
            rounded-lg
            text-[#666666]
            hover:bg-[#dedede]
            hover:text-[#222222]
          "
        >
          <Search className="size-4" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="
            size-8
            rounded-lg
            text-[#666666]
            hover:bg-[#dedede]
            hover:text-[#222222]
          "
        >
          <Bell className="size-4" />
          <span className="sr-only">
            Notifications
          </span>
        </Button>

        {/* User */}
        <div
          className="
            flex
            size-9
            items-center
            justify-center
            rounded-xl
            bg-[#e8e8e8]
            shadow-[3px_3px_6px_#c7c7c7,-3px_-3px_6px_#ffffff]
          "
        >
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-7",
                userButtonTrigger:
                  "rounded-full focus:shadow-none",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
