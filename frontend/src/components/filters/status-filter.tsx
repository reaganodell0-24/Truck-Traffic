"use client";

import { useAppStore } from "@/stores/app-store";
import { STATUS_COLORS } from "@/lib/constants";
import { FilterChip } from "./filter-chip";

const statuses = ["active", "pilot", "planned"] as const;

export function StatusFilter() {
  const { statusFilter, setStatusFilter } = useAppStore();

  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        Status
      </div>
      <div className="flex flex-wrap gap-1">
        <FilterChip
          label="All"
          active={statusFilter === null}
          onClick={() => setStatusFilter(null)}
        />
        {statuses.map((s) => (
          <FilterChip
            key={s}
            label={s.charAt(0).toUpperCase() + s.slice(1)}
            color={STATUS_COLORS[s]}
            active={statusFilter === s}
            onClick={() => setStatusFilter(statusFilter === s ? null : s)}
          />
        ))}
      </div>
    </div>
  );
}
