"use client";

import dynamic from "next/dynamic";
import type { Route, Terminal, ChargingStop } from "@/lib/types";

const RouteMap = dynamic(() => import("./RouteMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-bg-primary text-slate-500">
      Loading map...
    </div>
  ),
});

interface MapWrapperProps {
  routes: Route[];
  terminals: Terminal[];
  chargingStops: ChargingStop[];
  showTerminals: boolean;
  showCharging: boolean;
  selectedRouteId: string | null;
  onSelectRoute: (id: string | null) => void;
}

export default function MapWrapper({
  routes,
  terminals,
  chargingStops,
  showTerminals,
  showCharging,
  selectedRouteId,
  onSelectRoute,
}: MapWrapperProps) {
  return (
    <RouteMap
      routes={routes}
      terminals={terminals}
      chargingStops={chargingStops}
      showTerminals={showTerminals}
      showCharging={showCharging}
      selectedRouteId={selectedRouteId}
      onSelectRoute={onSelectRoute}
    />
  );
}
