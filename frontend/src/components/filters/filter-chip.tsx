"use client";

import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}

export function FilterChip({ label, active, color, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
      style={
        active
          ? {
              backgroundColor: color ? `${color}20` : "var(--accent)",
              color: color || "var(--foreground)",
              border: `1px solid ${color || "var(--border)"}40`,
            }
          : { border: "1px solid transparent" }
      }
    >
      {color && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </button>
  );
}
