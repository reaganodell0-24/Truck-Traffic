"use client";

import type { Route } from "@/lib/types";
import { COMPANY_COLORS, COMPANY_LABELS, STATUS_COLORS } from "@/lib/constants";

interface RouteDetailProps {
  route: Route;
  onClose: () => void;
}

function Stat({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-slate-200">{value}</div>
    </div>
  );
}

export default function RouteDetail({ route, onClose }: RouteDetailProps) {
  const color = COMPANY_COLORS[route.company];
  const statusColor = STATUS_COLORS[route.status];
  const vol = route.volume;

  return (
    <div className="absolute right-4 top-4 z-[1000] w-[340px] max-h-[calc(100%-2rem)] overflow-y-auto rounded-lg border border-[#1e293b] bg-[#0a0e17]/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#1e293b] px-5 py-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">{route.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {COMPANY_LABELS[route.company]}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span
                className="inline-block h-[7px] w-[7px] rounded-full"
                style={{
                  backgroundColor: statusColor,
                  boxShadow:
                    route.status === "active"
                      ? `0 0 6px ${statusColor}`
                      : undefined,
                }}
              />
              {route.status}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-200"
          aria-label="Close detail panel"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 border-b border-[#1e293b] px-5 py-4">
        <Stat label="Corridor" value={route.corridor} />
        <Stat label="Distance" value={`${route.distance_miles} mi`} />
        <Stat label="Launched" value={route.launched} />
        <Stat label="Trucks" value={route.truck_count} />
        <Stat label="Power" value={route.power_type} />
        <Stat
          label="Fuel Economy"
          value={route.fuel_economy_mpg ? `${route.fuel_economy_mpg} MPG` : null}
        />
      </div>

      {/* Volume data */}
      {vol && (
        <div className="border-b border-[#1e293b] px-5 py-4">
          <h4 className="mb-3 font-mono text-[10px] uppercase tracking-[2px] text-slate-500">
            Volume Data
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Truck AADT" value={vol.truck_aadt} />
            <Stat
              label="Annual Tonnage"
              value={
                vol.annual_tonnage_m_tons
                  ? `${vol.annual_tonnage_m_tons}M tons`
                  : null
              }
            />
            <Stat
              label="AV Loads/Week"
              value={
                vol.av_loads_per_week
                  ? vol.av_loads_per_week.toLocaleString()
                  : null
              }
            />
            <Stat label="Data Year" value={String(vol.year)} />
          </div>
          {vol.top_commodities.length > 0 && (
            <div className="mt-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Top Commodities
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {vol.top_commodities.map((c) => (
                  <span
                    key={c}
                    className="rounded bg-[#111827] px-2 py-0.5 text-[11px] text-slate-400"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-2 text-[10px] text-slate-600">
            Source: {vol.source}
          </div>
        </div>
      )}

      {/* Customers */}
      {route.customers.length > 0 && (
        <div className="border-b border-[#1e293b] px-5 py-4">
          <h4 className="mb-2 font-mono text-[10px] uppercase tracking-[2px] text-slate-500">
            Customers / Partners
          </h4>
          <div className="flex flex-wrap gap-1">
            {route.customers.map((c) => (
              <span
                key={c}
                className="rounded border border-[#1e293b] bg-[#111827] px-2 py-0.5 text-[11px] text-slate-300"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {route.notes && (
        <div className="px-5 py-4">
          <h4 className="mb-2 font-mono text-[10px] uppercase tracking-[2px] text-slate-500">
            Notes
          </h4>
          <p className="text-xs leading-relaxed text-slate-400">
            {route.notes}
          </p>
        </div>
      )}
    </div>
  );
}
