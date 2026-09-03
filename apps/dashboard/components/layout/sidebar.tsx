"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  Brain,
  ChartNetwork,
  Code2,
  KeyRound,
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
      { title: "Overview", href: "/overview", icon: Activity },
      { title: "Traces", href: "/traces", icon: Activity },
      { title: "Graph Explorer", href: "/graph", icon: ChartNetwork },
    ],
  },
  {
    label: "Analyze",
    items: [
      { title: "Agents", href: "/agents", icon: Bot },
      { title: "LLMs", href: "/llms", icon: Brain },
      { title: "Tools", href: "/tools", icon: Wrench },
    ],
  },
  {
    label: "Develop",
    items: [
      { title: "API Keys", href: "/api-keys", icon: KeyRound },
      { title: "SDK", href: "/sdk", icon: Code2 },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/overview" />}
            >
            <img
              src="/logo.png"
              alt="Terrax"
              className="size-15 scale-225 object-contain brightness-0"
            />

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-2xl">
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

      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>
              {section.label}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                Y
              </div>

              <span>My Project</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}