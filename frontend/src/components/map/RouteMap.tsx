"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Route } from "@/lib/types";
import {
  COMPANY_COLORS,
  COMPANY_LABELS,
  TILE_URL,
  TILE_ATTRIBUTION,
  TX_CENTER,
  DEFAULT_ZOOM,
} from "@/lib/constants";

interface RouteMapProps {
  routes: Route[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string | null) => void;
}

function FitToRoute({ route }: { route: Route | null }) {
  const map = useMap();
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (!route || route.id === prevId.current) return;
    prevId.current = route.id;

    const path = route.coordinates.path;
    if (path && path.length > 1) {
      const bounds = L.latLngBounds(
        path.map(([lat, lng]) => [lat, lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 });
    } else {
      const [lat, lng] = route.coordinates.origin;
      map.setView([lat, lng], 10);
    }
  }, [route, map]);

  return null;
}

function getDashArray(status: string): string | undefined {
  if (status === "planned") return "8 6";
  if (status === "pilot") return "4 4";
  return undefined;
}

export default function RouteMap({
  routes,
  selectedRouteId,
  onSelectRoute,
}: RouteMapProps) {
  const selectedRoute = routes.find((r) => r.id === selectedRouteId) ?? null;

  return (
    <MapContainer
      center={TX_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <FitToRoute route={selectedRoute} />

      {routes.map((route) => {
        const path = route.coordinates.path;
        if (!path || path.length < 2) return null;

        const isSelected = route.id === selectedRouteId;
        const color = COMPANY_COLORS[route.company];

        return (
          <Polyline
            key={route.id}
            positions={path.map(([lat, lng]) => [lat, lng] as [number, number])}
            pathOptions={{
              color,
              weight: isSelected ? 5 : 3,
              opacity: isSelected ? 1 : selectedRouteId ? 0.3 : 0.7,
              dashArray: getDashArray(route.status),
            }}
            eventHandlers={{
              click: () => onSelectRoute(route.id),
            }}
          >
            <Tooltip sticky>
              <span className="font-sans text-sm">
                <strong>{route.name}</strong>
                <br />
                {COMPANY_LABELS[route.company]} &middot; {route.corridor} &middot;{" "}
                {route.distance_miles} mi
              </span>
            </Tooltip>
          </Polyline>
        );
      })}

      {routes.map((route) => {
        const color = COMPANY_COLORS[route.company];
        const isSelected = route.id === selectedRouteId;
        const opacity = isSelected ? 1 : selectedRouteId ? 0.3 : 0.7;

        return (
          <span key={`markers-${route.id}`}>
            <CircleMarker
              center={route.coordinates.origin as [number, number]}
              radius={isSelected ? 7 : 5}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: opacity,
                opacity,
                weight: 2,
              }}
              eventHandlers={{ click: () => onSelectRoute(route.id) }}
            >
              <Tooltip>{route.origin}</Tooltip>
            </CircleMarker>
            <CircleMarker
              center={route.coordinates.destination as [number, number]}
              radius={isSelected ? 6 : 4}
              pathOptions={{
                color,
                fillColor: "#0a0e17",
                fillOpacity: 0.8,
                opacity,
                weight: 2,
              }}
              eventHandlers={{ click: () => onSelectRoute(route.id) }}
            >
              <Tooltip>{route.destination}</Tooltip>
            </CircleMarker>
          </span>
        );
      })}
    </MapContainer>
  );
}
