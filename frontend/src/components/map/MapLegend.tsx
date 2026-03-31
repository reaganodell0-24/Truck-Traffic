"use client";

import {
  COMPANY_COLORS,
  COMPANY_LABELS,
  STATUS_COLORS,
  ALL_COMPANIES,
} from "@/lib/constants";

export default function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-[#1e293b] bg-[#0a0e17]/90 px-4 py-3 backdrop-blur-sm">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
        Operators
      </div>
      <div className="flex flex-col gap-1.5">
        {ALL_COMPANIES.map((c) => (
          <div key={c} className="flex items-center gap-2">
            <div
              className="h-0.5 w-5 rounded"
              style={{ backgroundColor: COMPANY_COLORS[c] }}
            />
            <span className="text-xs text-slate-300">
              {COMPANY_LABELS[c]}
            </span>
          </div>
        ))}
      </div>
      <div className="mb-2 mt-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">
        Status
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-5 rounded" style={{ backgroundColor: STATUS_COLORS.active }} />
          <span className="text-xs text-slate-300">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-0.5 w-5"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${STATUS_COLORS.pilot} 0, ${STATUS_COLORS.pilot} 3px, transparent 3px, transparent 6px)`,
            }}
          />
          <span className="text-xs text-slate-300">Pilot</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-0.5 w-5"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${STATUS_COLORS.planned} 0, ${STATUS_COLORS.planned} 5px, transparent 5px, transparent 9px)`,
            }}
          />
          <span className="text-xs text-slate-300">Planned</span>
        </div>
      </div>
    </div>
  );
}
