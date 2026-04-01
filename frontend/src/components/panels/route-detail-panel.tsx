"use client";

import { useAppStore } from "@/stores/app-store";
import { useRoute } from "@/hooks/use-routes";
import { useEVFeasibility } from "@/hooks/use-analytics";
import { PanelShell } from "./panel-shell";
import { DataGrid } from "@/components/shared/data-grid";
import { CompanyBadge } from "@/components/shared/company-badge";
import { StatusDot } from "@/components/shared/status-dot";
import { Separator } from "@/components/ui/separator";
import { RouteName } from "@/components/shared/route-name";
import { Skeleton } from "@/components/ui/skeleton";

export function RouteDetailPanel() {
  const { selectedRouteId, activePanel, closePanel, truckType } = useAppStore();
  const { data: route, isLoading } = useRoute(selectedRouteId);
  const { data: evData } = useEVFeasibility(truckType);

  const open = activePanel === "route-detail" && selectedRouteId !== null;
  const evRoute = route ? evData?.find((e) => e.route_id === route.id) : null;

  return (
    <PanelShell open={open} onClose={closePanel} title="Route Detail">
      {isLoading || !route ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : "error" in route ? (
        <div className="text-muted-foreground text-sm">Route not found</div>
      ) : (
        <>
          {/* Header */}
          <div>
            <h3 className="text-lg font-semibold text-foreground"><RouteName name={route.name} /></h3>
            <div className="mt-1 flex items-center gap-2">
              <CompanyBadge company={route.company} />
              <StatusDot status={route.status} />
            </div>
          </div>

          {/* Core info grid */}
          <DataGrid
            items={[
              { label: "Corridor", value: route.corridor },
              { label: "Distance", value: route.distance_miles ? `${route.distance_miles} mi` : null },
              { label: "Launched", value: route.launched },
              { label: "Trucks", value: route.truck_count },
              { label: "Power Type", value: route.power_type },
              { label: "Fuel Economy", value: route.fuel_economy_mpg ? `${route.fuel_economy_mpg} MPG` : "N/A" },
              { label: "Customers", value: route.customers?.join(", ") || "—" },
              { label: "Origin", value: route.origin },
            ]}
          />

          {/* Volume section */}
          {route.volume && (
            <>
              <Separator />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Corridor Volume
                </div>
                <DataGrid
                  items={[
                    { label: "Truck AADT", value: route.volume.truck_aadt },
                    { label: "Annual Tonnage", value: route.volume.annual_tonnage_m_tons ? `${route.volume.annual_tonnage_m_tons}M tons` : null },
                    { label: "AV Loads/Week", value: route.volume.av_loads_per_week },
                    { label: "Source", value: `${route.volume.source} (${route.volume.year})` },
                  ]}
                />
                {route.volume.top_commodities?.length > 0 && (
                  <div className="mt-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Top Commodities
                    </div>
                    <div className="text-sm text-foreground mt-1">
                      {route.volume.top_commodities.join(" · ")}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* EV Feasibility (if truck type selected) */}
          {evRoute && (
            <>
              <Separator />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  EV Feasibility
                </div>
                <DataGrid
                  items={[
                    { label: "Truck Type", value: evRoute.truck_type },
                    { label: "Range", value: `${evRoute.truck_range} mi` },
                    { label: "Direct?", value: evRoute.can_complete_direct ? "Yes" : "No" },
                    { label: "Stops Needed", value: evRoute.charging_stops_needed },
                    { label: "Added Time", value: evRoute.added_charge_time_min > 0 ? `${evRoute.added_charge_time_min} min` : "—" },
                  ]}
                />
              </div>
            </>
          )}

          {/* Notes */}
          {route.notes && (
            <>
              <Separator />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Notes
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{route.notes}</p>
              </div>
            </>
          )}
        </>
      )}
    </PanelShell>
  );
}
