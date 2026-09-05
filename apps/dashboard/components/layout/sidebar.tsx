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
    <Sidebar collapsible="icon" className="border-r bg-muted">
      <SidebarHeader className="bg-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-muted"
              render={<Link href="/overview" />}
            >
              <img
                src="/logo.png"
                alt="Terrax"
                className="size-15 scale-250 object-contain brightness-0"
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

      <Separator />

      <SidebarContent className="gap-0">
        {navigation.map((section) => (
          <SidebarGroup key={section.label} className="py-3">
            <SidebarGroupLabel className="px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
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
                        className="h-9 transition-colors"
                        render={<Link href={item.href} />}
                      >
                        <item.icon className="size-4" />
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

      <SidebarFooter className="bg-background p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-12 hover:bg-muted"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                Y
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  My Project
                </span>

                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-green-500" />
                  Development
                </span>
              </div>

              <ChevronUp className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
