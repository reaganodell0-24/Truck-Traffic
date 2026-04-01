"use client";

import { cn } from "@/lib/utils";
import { CompanyBadge } from "@/components/shared/company-badge";
import { StatusDot } from "@/components/shared/status-dot";
import { RouteName } from "@/components/shared/route-name";
import { COMPANY_COLORS } from "@/lib/constants";
import type { Route } from "@/lib/types";

interface RouteCardProps {
  route: Route;
  selected: boolean;
  onClick: () => void;
}

export function RouteCard({ route, selected, onClick }: RouteCardProps) {
  const color = COMPANY_COLORS[route.company] || "#94a3b8";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg p-3 transition-colors cursor-pointer",
        "border border-transparent",
        selected
          ? "bg-accent"
          : "bg-card hover:bg-accent/50"
      )}
      style={selected ? { borderLeftColor: color, borderLeftWidth: 3 } : {}}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">
            <RouteName name={route.name} />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <CompanyBadge company={route.company} />
            <StatusDot status={route.status} />
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span>{route.corridor}</span>
        {route.distance_miles && <span>{route.distance_miles} mi</span>}
        {route.volume?.truck_aadt && (
          <span className="font-mono">{route.volume.truck_aadt} AADT</span>
        )}
      </div>
    </button>
  );
}
