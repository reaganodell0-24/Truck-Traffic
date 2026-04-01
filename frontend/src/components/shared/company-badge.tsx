"use client";

import { COMPANY_COLORS, COMPANY_NAMES } from "@/lib/constants";
import type { Company } from "@/lib/types";

export function CompanyBadge({ company }: { company: Company }) {
  const color = COMPANY_COLORS[company] || "#94a3b8";
  const name = COMPANY_NAMES[company] || company;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}
