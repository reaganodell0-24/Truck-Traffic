"use client";

import { Polyline, useMap } from "react-leaflet";
import { useRoutes } from "@/hooks/use-routes";
import { useAppStore } from "@/stores/app-store";
import { COMPANY_COLORS } from "@/lib/constants";
import type { Route } from "@/lib/types";
import { useEffect } from "react";
import L from "leaflet";

function getPolylineStyle(route: Route, isSelected: boolean) {
  const color = COMPANY_COLORS[route.company] || "#94a3b8";
  const opacityMap = { active: 0.85, pilot: 0.65, planned: 0.45 };
  const dashMap = { active: undefined, pilot: "8 8", planned: "4 8" };

  return {
    color,
    weight: isSelected ? 5 : 3,
    opacity: isSelected ? 1 : opacityMap[route.status] ?? 0.5,
    dashArray: dashMap[route.status],
  };
}

function FitBounds({ route }: { route: Route | null }) {
  const map = useMap();

  useEffect(() => {
    if (!route?.coordinates?.path || route.coordinates.path.length === 0) return;
    const bounds = L.latLngBounds(
      route.coordinates.path.map(([lat, lng]) => [lat, lng] as [number, number])
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 9 });
  }, [route, map]);

  return null;
}

export function RoutePolylines() {
  const { data: routes } = useRoutes();
  const { selectedRouteId, selectRoute } = useAppStore();

  if (!routes) return null;

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) ?? null;

  return (
    <>
      <FitBounds route={selectedRoute} />
      {routes.map((route) => {
        const path = route.coordinates?.path;
        if (!path || path.length < 2) return null;

        const isSelected = route.id === selectedRouteId;
        const positions = path.map(([lat, lng]) => [lat, lng] as [number, number]);
        const style = getPolylineStyle(route, isSelected);

        return (
          <Polyline
            key={route.id}
            positions={positions}
            pathOptions={style}
            eventHandlers={{
              click: () => selectRoute(route.id),
            }}
          />
        );
      })}
    </>
  );
}
