"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Bot,
  Brain,
  ChartNetwork,
  ChevronUp,
  Code2,
  KeyRound,
  LayoutDashboard,
  Settings,
  Wrench,
} from "lucide-react";

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
              render={<Link href="/overview" />}
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

      <SidebarContent className="gap-0 bg-[#e8e8e8]">
        {navigation.map((section) => (
          <SidebarGroup key={section.label} className="py-3">
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
                    pathname.startsWith(`${item.href}/`);

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

                          ${
                            isActive
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
                        render={<Link href={item.href} />}
                      >
                        <item.icon
                          className={`
                            size-4
                            shrink-0
                            transition-all
                            duration-200

                            ${
                              isActive
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

      <SidebarFooter className="bg-[#e8e8e8] p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="
                h-14
                rounded-xl
                bg-[#e8e8e8]
                shadow-[5px_5px_10px_#c7c7c7,-5px_-5px_10px_#ffffff]
                transition-all
                duration-200
                hover:shadow-[7px_7px_14px_#c5c5c5,-7px_-7px_14px_#ffffff]
                active:shadow-[inset_3px_3px_6px_#c7c7c7,inset_-3px_-3px_6px_#ffffff]
              "
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
                Y
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
                My Project
              </span>

              <span
                className="
                  flex
                  items-center
                  gap-1.5
                  text-xs
                  text-[#777777]
                  [text-shadow:1px_1px_1px_#d2d2d2,-1px_-1px_1px_#ffffff]
                "
              >
                <span
                  className="
                    size-1.5
                    rounded-full
                    bg-green-500
                    shadow-[2px_2px_3px_#c7c7c7,-1px_-1px_2px_#ffffff]
                  "
                />
                Development
              </span>
            </div>

              <ChevronUp className="ml-auto size-4 text-[#777777]" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
