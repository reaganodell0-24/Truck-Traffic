"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { useChargingStops } from "@/hooks/use-charging-stops";
import { useAppStore } from "@/stores/app-store";

export function ChargerMarkers() {
  const { data: stops } = useChargingStops();
  const { truckType, activePanel } = useAppStore();

  // Only show chargers when EV calculator is active
  const showChargers = truckType !== null || activePanel === "ev-feasibility";
  if (!showChargers || !stops) return null;

  return (
    <>
      {stops.map((stop) => (
        <CircleMarker
          key={stop.id}
          center={[stop.lat, stop.lng]}
          radius={5}
          pathOptions={{
            color: "#06b6d4",
            fillColor: stop.status === "active" ? "#06b6d4" : "transparent",
            fillOpacity: stop.status === "active" ? 0.9 : 0.5,
            weight: 1.5,
            dashArray: stop.status === "planned" ? "3 3" : undefined,
          }}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{stop.name}</div>
              <div className="text-muted-foreground">
                {stop.operator} · {stop.corridor}
              </div>
              <div className="text-xs mt-1">
                {stop.power_kw ? `${stop.power_kw} kW` : ""} · {stop.status}
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
