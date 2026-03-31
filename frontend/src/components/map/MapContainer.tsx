"use client";

import dynamic from "next/dynamic";
import type { Route } from "@/lib/types";

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
  selectedRouteId: string | null;
  onSelectRoute: (id: string | null) => void;
}

export default function MapWrapper({
  routes,
  selectedRouteId,
  onSelectRoute,
}: MapWrapperProps) {
  return (
    <RouteMap
      routes={routes}
      selectedRouteId={selectedRouteId}
      onSelectRoute={onSelectRoute}
    />
  );
}
