"use client";

import type { Route } from "@/lib/types";
import RouteCard from "./RouteCard";

interface RouteListProps {
  routes: Route[];
  totalCount: number;
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
}

export default function RouteList({
  routes,
  totalCount,
  selectedRouteId,
  onSelectRoute,
}: RouteListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 py-3 font-mono text-[10px] uppercase tracking-[2px] text-slate-500">
        Showing {routes.length} of {totalCount} routes
      </div>
      <div className="flex flex-col gap-0.5 pb-4">
        {routes.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            isSelected={route.id === selectedRouteId}
            onSelect={onSelectRoute}
          />
        ))}
      </div>
    </div>
  );
}
