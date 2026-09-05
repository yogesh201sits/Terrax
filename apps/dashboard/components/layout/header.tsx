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
    <header
      className="
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
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger
          className="
            size-8
            rounded-lg
            text-[#555555]
            shadow-[3px_3px_6px_#c7c7c7,-3px_-3px_6px_#ffffff]
            transition-all
            duration-200
            hover:bg-[#e8e8e8]
            hover:text-[#222222]
            hover:shadow-[4px_4px_8px_#c5c5c5,-4px_-4px_8px_#ffffff]
            active:shadow-[inset_2px_2px_4px_#c5c5c5,inset_-2px_-2px_4px_#ffffff]
          "
        />

        <Separator
          orientation="vertical"
          className="mx-1 h-5 bg-[#d0d0d0]"
        />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link href="/overview" />}
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

            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-[#292929]">
                {pageName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 px-4">
        {/* System status */}
        <div
          className="
            hidden
            items-center
            gap-2
            rounded-xl
            bg-[#e8e8e8]
            px-3
            py-1.5
            text-xs
            shadow-[inset_2px_2px_5px_#c7c7c7,inset_-2px_-2px_5px_#ffffff]
            md:flex
          "
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
          </span>

          <span className="text-[#666666]">
            All systems operational
          </span>
        </div>

        {/* Environment */}
        <Badge
          variant="secondary"
          className="
            hidden
            gap-1.5
            rounded-lg
            border-0
            bg-[#e8e8e8]
            px-3
            py-1.5
            text-[#555555]
            shadow-[3px_3px_6px_#c7c7c7,-3px_-3px_6px_#ffffff]
            transition-all
            duration-200
            hover:shadow-[4px_4px_8px_#c5c5c5,-4px_-4px_8px_#ffffff]
            sm:flex
          "
        >
          <Activity className="h-3 w-3 drop-shadow-[1px_1px_1px_#c0c0c0]" />
          Production
        </Badge>

        <Separator
          orientation="vertical"
          className="mx-1 h-5 bg-[#d0d0d0]"
        />

        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          className="
            size-8
            rounded-lg
            bg-[#e8e8e8]
            text-[#666666]
            shadow-[3px_3px_6px_#c7c7c7,-3px_-3px_6px_#ffffff]
            transition-all
            duration-200
            hover:bg-[#e8e8e8]
            hover:text-[#222222]
            hover:shadow-[4px_4px_8px_#c5c5c5,-4px_-4px_8px_#ffffff]
            active:shadow-[inset_2px_2px_4px_#c5c5c5,inset_-2px_-2px_4px_#ffffff]
          "
          aria-label="Search"
        >
          <Search className="h-4 w-4 drop-shadow-[1px_1px_1px_#c0c0c0]" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="
            relative
            size-8
            rounded-lg
            bg-[#e8e8e8]
            text-[#666666]
            shadow-[3px_3px_6px_#c7c7c7,-3px_-3px_6px_#ffffff]
            transition-all
            duration-200
            hover:bg-[#e8e8e8]
            hover:text-[#222222]
            hover:shadow-[4px_4px_8px_#c5c5c5,-4px_-4px_8px_#ffffff]
            active:shadow-[inset_2px_2px_4px_#c5c5c5,inset_-2px_-2px_4px_#ffffff]
          "
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 drop-shadow-[1px_1px_1px_#c0c0c0]" />

          <span
            className="
              absolute
              right-1.5
              top-1.5
              size-1.5
              rounded-full
              bg-red-500
              shadow-[0_0_5px_rgba(239,68,68,0.6)]
            "
          />
        </Button>

        {/* User */}
        <Button
          variant="ghost"
          className="
            flex
            h-9
            items-center
            gap-2
            rounded-xl
            bg-[#e8e8e8]
            px-2
            shadow-[3px_3px_6px_#c7c7c7,-3px_-3px_6px_#ffffff]
            transition-all
            duration-200
            hover:bg-[#e8e8e8]
            hover:shadow-[4px_4px_8px_#c5c5c5,-4px_-4px_8px_#ffffff]
            active:shadow-[inset_2px_2px_4px_#c5c5c5,inset_-2px_-2px_4px_#ffffff]
          "
        >
          <div
            className="
              flex
              size-6
              items-center
              justify-center
              rounded-full
              bg-[#e8e8e8]
              text-[10px]
              font-semibold
              text-[#555555]
              shadow-[inset_2px_2px_4px_#c7c7c7,inset_-2px_-2px_4px_#ffffff]
            "
          >
            YJ
          </div>

          <ChevronDown className="hidden h-3.5 w-3.5 text-[#777777] sm:block" />
        </Button>
      </div>
    </header>
  );
}
