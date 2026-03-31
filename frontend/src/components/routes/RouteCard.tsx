"use client";

import type { Route } from "@/lib/types";
import { COMPANY_COLORS, COMPANY_LABELS, STATUS_COLORS } from "@/lib/constants";

interface RouteCardProps {
  route: Route;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function RouteCard({
  route,
  isSelected,
  onSelect,
}: RouteCardProps) {
  const color = COMPANY_COLORS[route.company];
  const statusColor = STATUS_COLORS[route.status];

  return (
    <button
      onClick={() => onSelect(route.id)}
      className="w-full cursor-pointer border-l-[3px] px-5 py-3 text-left transition-all hover:bg-[#1a2234]"
      style={{
        borderLeftColor: isSelected ? color : "transparent",
        backgroundColor: isSelected ? "#1a2234" : undefined,
      }}
    >
      <div className="mb-1 text-sm font-semibold text-slate-100">
        {route.name}
      </div>
      <div className="flex items-center gap-2.5 text-[11px] text-slate-500">
        <span
          className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide"
          style={{
            backgroundColor: `${color}20`,
            color,
          }}
        >
          {COMPANY_LABELS[route.company]}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-[7px] w-[7px] rounded-full"
            style={{
              backgroundColor: statusColor,
              boxShadow:
                route.status === "active" ? `0 0 6px ${statusColor}` : undefined,
            }}
          />
          {route.corridor}
        </span>
        <span>{route.distance_miles} mi</span>
      </div>
    </button>
  );
}
