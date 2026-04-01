"use client";

import { CompanyFilter } from "@/components/filters/company-filter";
import { StatusFilter } from "@/components/filters/status-filter";
import { RouteList } from "@/components/routes/route-list";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Sidebar() {
  return (
    <aside className="w-[320px] flex-shrink-0 border-r border-border bg-card flex flex-col h-full">
      <div className="p-3 space-y-3">
        <CompanyFilter />
        <StatusFilter />
      </div>
      <Separator />
      <ScrollArea className="flex-1 p-3">
        <RouteList />
      </ScrollArea>
    </aside>
  );
}
