"use client";

import type { Company, Status } from "@/lib/types";
import {
  COMPANY_COLORS,
  COMPANY_LABELS,
  STATUS_COLORS,
  ALL_COMPANIES,
  ALL_STATUSES,
} from "@/lib/constants";

interface FilterBarProps {
  selectedCompanies: Set<Company>;
  selectedStatuses: Set<Status>;
  onToggleCompany: (c: Company) => void;
  onToggleStatus: (s: Status) => void;
  onClear: () => void;
}

export default function FilterBar({
  selectedCompanies,
  selectedStatuses,
  onToggleCompany,
  onToggleStatus,
  onClear,
}: FilterBarProps) {
  const hasFilters = selectedCompanies.size > 0 || selectedStatuses.size > 0;

  return (
    <div className="border-b border-[#1e293b] px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-mono text-[10px] uppercase tracking-[2px] text-slate-500">
          Operator
        </h3>
        {hasFilters && (
          <button
            onClick={onClear}
            className="font-mono text-[10px] uppercase tracking-wider text-slate-500 hover:text-aurora"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ALL_COMPANIES.map((c) => {
          const active = selectedCompanies.has(c);
          const color = COMPANY_COLORS[c];
          return (
            <button
              key={c}
              onClick={() => onToggleCompany(c)}
              className="rounded px-3 py-1 text-xs font-semibold transition-all"
              style={{
                border: `1px solid ${active ? color : "#1e293b"}`,
                color: active ? color : "#94a3b8",
                backgroundColor: active ? `${color}15` : "#111827",
              }}
            >
              {COMPANY_LABELS[c]}
            </button>
          );
        })}
      </div>

      <h3 className="mb-3 mt-4 font-mono text-[10px] uppercase tracking-[2px] text-slate-500">
        Status
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {ALL_STATUSES.map((s) => {
          const active = selectedStatuses.has(s);
          const color = STATUS_COLORS[s];
          return (
            <button
              key={s}
              onClick={() => onToggleStatus(s)}
              className="rounded px-3 py-1 text-xs font-semibold capitalize transition-all"
              style={{
                border: `1px solid ${active ? color : "#1e293b"}`,
                color: active ? color : "#94a3b8",
                backgroundColor: active ? `${color}15` : "#111827",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
