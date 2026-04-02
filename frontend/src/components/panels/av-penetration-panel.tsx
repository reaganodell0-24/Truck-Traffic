"use client";

import { useState } from "react";
import { useAppStore } from "@/stores/app-store";
import { useAVPenetration } from "@/hooks/use-analytics";
import { useRoutes } from "@/hooks/use-routes";
import { PanelShell } from "./panel-shell";
import { ExportButton } from "@/components/shared/export-button";
import { CompanyBadge } from "@/components/shared/company-badge";
import { Separator } from "@/components/ui/separator";
import { RouteName } from "@/components/shared/route-name";
import type { Company, Route } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { parseAADT } from "@/lib/utils";

export function AVPenetrationPanel() {
  const { activePanel, closePanel } = useAppStore();
  const { data: avData, isLoading } = useAVPenetration();
  const { data: routes } = useRoutes();
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const open = activePanel === "av-penetration";

  const totalRoutes = routes?.length ?? 0;
  const activeRoutes = routes?.filter((r) => r.status === "active").length ?? 0;
  const routesWithAV = avData?.length ?? 0;

  // Build combined list: all routes with AV data merged in
  const allRouteData = routes?.map((route) => {
    const av = avData?.find((a) => a.route_id === route.id);
    const aadt = parseAADT(route.volume?.truck_aadt);
    return {
      route,
      avLoads: av?.av_loads_per_week ?? route.volume?.av_loads_per_week ?? null,
      totalLoadsPerWeek: av?.total_loads_per_week ?? (aadt ? aadt.mid * 7 : null),
      penetration: av?.av_penetration_pct ?? null,
      aadtMid: aadt?.mid ?? null,
    };
  }) ?? [];

  const selectedRoute = selectedRouteId
    ? allRouteData.find((r) => r.route.id === selectedRouteId)
    : null;

  return (
    <PanelShell
      open={open}
      onClose={closePanel}
      title="AV Penetration Analytics"
      wide
      actions={avData ? <ExportButton data={avData} filename="av-penetration" /> : undefined}
    >
      <div className="text-sm text-muted-foreground">
        Autonomous vehicle loads as a percentage of total corridor truck traffic.
        Select a route below to see its AV penetration details.
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <>
          {/* Summary stat cards */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard value={String(totalRoutes)} label="Total Routes" />
            <StatCard value={String(activeRoutes)} label="Active" />
            <StatCard value={String(routesWithAV)} label="Reporting AV Loads" color="#00d4aa" />
            <StatCard
              value={avData && avData.length > 0 ? `${avData[0].av_penetration_pct.toFixed(3)}%` : "—"}
              label="Peak AV %"
              color="#00d4aa"
            />
          </div>

          <Separator />

          {/* Route selector list */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Select a Route
            </div>
            <div className="grid grid-cols-2 gap-2">
              {allRouteData.map(({ route, avLoads, penetration }) => (
                <button
                  key={route.id}
                  onClick={() => setSelectedRouteId(selectedRouteId === route.id ? null : route.id)}
                  className={`text-left rounded-lg border p-3 transition-colors cursor-pointer ${
                    selectedRouteId === route.id
                      ? "border-[#00d4aa]/50 bg-[#00d4aa]/10"
                      : "border-border hover:border-border/80 hover:bg-accent/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium truncate">
                      <RouteName name={route.name} />
                    </div>
                    {avLoads !== null ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00d4aa]/20 text-[#00d4aa]">
                        {penetration !== null ? `${penetration.toFixed(3)}%` : `${avLoads}/wk`}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        No data
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <CompanyBadge company={route.company} />
                    <span className="text-[10px] text-muted-foreground">{route.corridor}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected route detail */}
          {selectedRoute && (
            <>
              <Separator />
              <RouteAVDetail data={selectedRoute} />
            </>
          )}

          <Separator />

          {/* Context */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Industry Context
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Current AV penetration is &lt;0.1% on most corridors. Only {routesWithAV} of {totalRoutes} routes
              report AV load counts. Most operators are in early deployment and have not disclosed weekly load figures.
              The growth projection from 0.1% to 5% to 15% over the next decade is where the investment thesis for
              terminal real estate, charging infrastructure, and corridor development lives.
            </div>
          </div>
        </>
      )}
    </PanelShell>
  );
}

function RouteAVDetail({ data }: { data: { route: Route; avLoads: number | null; totalLoadsPerWeek: number | null; penetration: number | null; aadtMid: number | null } }) {
  const { route, avLoads, totalLoadsPerWeek, penetration, aadtMid } = data;

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold"><RouteName name={route.name} /></div>
          <div className="mt-1 flex items-center gap-2">
            <CompanyBadge company={route.company} />
            <span className="text-xs text-muted-foreground">{route.corridor} · {route.distance_miles ? `${route.distance_miles} mi` : "—"}</span>
          </div>
        </div>
        {penetration !== null && (
          <div className="text-right">
            <div className="text-2xl font-mono font-bold" style={{ color: "#00d4aa" }}>
              {penetration.toFixed(4)}%
            </div>
            <div className="text-[10px] text-muted-foreground">AV Penetration</div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4 text-xs">
        <div>
          <div className="text-muted-foreground">AV Loads/Week</div>
          <div className="font-mono font-medium text-sm">{avLoads !== null ? avLoads.toLocaleString() : "Not reported"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Total Loads/Week</div>
          <div className="font-mono font-medium text-sm">{totalLoadsPerWeek !== null ? Math.round(totalLoadsPerWeek).toLocaleString() : "—"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Corridor AADT</div>
          <div className="font-mono font-medium text-sm">{aadtMid !== null ? aadtMid.toLocaleString() : "—"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Status</div>
          <div className="font-mono font-medium text-sm capitalize">{route.status}</div>
        </div>
      </div>

      {/* AV share bar */}
      {penetration !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>AV Share of Corridor Traffic</span>
            <span>{penetration.toFixed(4)}%</span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(penetration * 20, 1)}%`,
                backgroundColor: "#00d4aa",
              }}
            />
          </div>
        </div>
      )}

      {/* Top commodities */}
      {route.volume?.top_commodities && route.volume.top_commodities.length > 0 && (
        <div className="mt-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Top commodities:</span>{" "}
          {route.volume.top_commodities.join(" · ")}
        </div>
      )}

      {route.notes && (
        <div className="mt-2 text-xs text-muted-foreground italic">
          {route.notes}
        </div>
      )}
    </div>
  );
}

function StatCard({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div className="rounded-lg bg-secondary p-3 text-center">
      <div className="text-xl font-mono font-bold" style={color ? { color } : undefined}>{value}</div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
