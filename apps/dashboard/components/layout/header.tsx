"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  Activity,
  ChevronDown,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

const pageNames: Record<string, string> = {
  "/overview": "Overview",
  "/traces": "Traces",
  "/projects": "Projects",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();

  const pageName = pageNames[pathname] ?? "Dashboard";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b">
      {/* Left */}
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger />

        <Separator
          orientation="vertical"
          className="mr-2 h-4"
        />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/overview" />}>
                Terrax
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>{pageName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 px-4">
        {/* System status */}
        <div className="hidden items-center gap-2 rounded-md border px-3 py-1.5 text-xs md:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>

          <span className="text-muted-foreground">
            All systems operational
          </span>
        </div>

        {/* Environment */}
        <Badge
          variant="secondary"
          className="hidden gap-1.5 sm:flex"
        >
          <Activity className="h-3 w-3" />
          Production
        </Badge>

        <Separator
          orientation="vertical"
          className="mx-1 h-5"
        />

        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />

          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </Button>

        {/* User */}
        <Button
          variant="ghost"
          className="flex h-8 items-center gap-2 px-2"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            YJ
          </div>

          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
        </Button>
      </div>
    </header>
  );
}
