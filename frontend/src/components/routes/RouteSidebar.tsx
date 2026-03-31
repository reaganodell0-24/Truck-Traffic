"use client";

import type { Company, Route, Status } from "@/lib/types";
import FilterBar from "./FilterBar";
import RouteList from "./RouteList";

interface RouteSidebarProps {
  routes: Route[];
  filteredRoutes: Route[];
  selectedCompanies: Set<Company>;
  selectedStatuses: Set<Status>;
  selectedRouteId: string | null;
  onToggleCompany: (c: Company) => void;
  onToggleStatus: (s: Status) => void;
  onClearFilters: () => void;
  onSelectRoute: (id: string) => void;
  showTerminals: boolean;
  showCharging: boolean;
  onToggleTerminals: () => void;
  onToggleCharging: () => void;
}

function LayerToggle({
  label,
  color,
  enabled,
  onToggle,
}: {
  label: string;
  color: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 rounded px-3 py-1 text-xs font-semibold transition-all"
      style={{
        border: `1px solid ${enabled ? color : "#1e293b"}`,
        color: enabled ? color : "#64748b",
        backgroundColor: enabled ? `${color}15` : "#111827",
      }}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{
          backgroundColor: enabled ? color : "#64748b",
        }}
      />
      {label}
    </button>
  );
}

export default function RouteSidebar({
  routes,
  filteredRoutes,
  selectedCompanies,
  selectedStatuses,
  selectedRouteId,
  onToggleCompany,
  onToggleStatus,
  onClearFilters,
  onSelectRoute,
  showTerminals,
  showCharging,
  onToggleTerminals,
  onToggleCharging,
}: RouteSidebarProps) {
  const activeCount = routes.filter((r) => r.status === "active").length;

  return (
    <aside className="flex h-full flex-col border-r border-[#1e293b] bg-bg-primary">
      {/* Header stats */}
      <div className="border-b border-[#1e293b] px-5 py-4">
        <h2 className="font-mono text-lg font-bold text-slate-100">
          <span className="text-aurora">AV</span> Routes
        </h2>
        <p className="mt-1 font-mono text-[11px] text-slate-500">
          Texas & Sun Belt autonomous trucking corridors
        </p>
        <div className="mt-3 flex gap-6">
          <div className="text-right">
            <div className="font-mono text-xl font-bold text-aurora">
              {routes.length}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Routes
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xl font-bold text-aurora">
              {activeCount}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Active
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xl font-bold text-aurora">5</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Operators
            </div>
          </div>
        </div>
      </div>

      <FilterBar
        selectedCompanies={selectedCompanies}
        selectedStatuses={selectedStatuses}
        onToggleCompany={onToggleCompany}
        onToggleStatus={onToggleStatus}
        onClear={onClearFilters}
      />

      {/* Map layers */}
      <div className="border-b border-[#1e293b] px-5 py-3">
        <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[2px] text-slate-500">
          Map Layers
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <LayerToggle
            label="Terminals"
            color="#f1f5f9"
            enabled={showTerminals}
            onToggle={onToggleTerminals}
          />
          <LayerToggle
            label="Megachargers"
            color="#e11d48"
            enabled={showCharging}
            onToggle={onToggleCharging}
          />
        </div>
      </div>

      <RouteList
        routes={filteredRoutes}
        totalCount={routes.length}
        selectedRouteId={selectedRouteId}
        onSelectRoute={onSelectRoute}
      />
    </aside>
  );
}
