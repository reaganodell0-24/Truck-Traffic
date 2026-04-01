"use client";

import { STATUS_COLORS } from "@/lib/constants";
import type { RouteStatus } from "@/lib/types";

export function StatusDot({ status }: { status: RouteStatus }) {
  const color = STATUS_COLORS[status] || "#94a3b8";

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={`h-2 w-2 rounded-full ${status === "active" ? "terminal-pulse" : ""}`}
        style={{ backgroundColor: color }}
      />
      <span className="capitalize">{status}</span>
    </span>
  );
}
