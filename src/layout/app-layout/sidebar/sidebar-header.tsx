"use client";

import { SidebarHeader } from "@/components/ui/sidebar";
import { Link } from "@/i18n/navigation";
import { BoxIcon } from "@/icons";
import { cn } from "@/utils";

interface AppSidebarHeaderProps {
  showContent: boolean;
}

export default function AppSidebarHeader({
  showContent,
}: AppSidebarHeaderProps) {
  return (
    <SidebarHeader className="px-5 pt-5 pb-6">
      <Link
        href="/"
        className={cn(
          "flex items-center gap-3 group",
          !showContent ? "justify-center" : "justify-start"
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-theme-xs transition-transform group-hover:scale-105">
          <BoxIcon className="size-5.5 text-white" />
        </div>

        {showContent && (
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              Stock<span className="text-brand-500">Flow</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Inventory & Trade SaaS
            </span>
          </div>
        )}
      </Link>
    </SidebarHeader>
  );
}
