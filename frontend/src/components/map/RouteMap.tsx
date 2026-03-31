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
import type { Route, Terminal, ChargingStop } from "@/lib/types";
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
  terminals: Terminal[];
  chargingStops: ChargingStop[];
  showTerminals: boolean;
  showCharging: boolean;
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
  terminals,
  chargingStops,
  showTerminals,
  showCharging,
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

      {showTerminals &&
        terminals.map((t) => {
          const opColor =
            t.operators[0] && t.operators[0] in COMPANY_COLORS
              ? COMPANY_COLORS[t.operators[0] as keyof typeof COMPANY_COLORS]
              : "#94a3b8";
          return (
            <CircleMarker
              key={t.id}
              center={[t.lat, t.lng]}
              radius={6}
              pathOptions={{
                color: "#f1f5f9",
                fillColor: opColor,
                fillOpacity: 0.9,
                weight: 2,
                opacity: 0.9,
              }}
            >
              <Tooltip>
                <span className="text-sm">
                  <strong>{t.name}</strong>
                  <br />
                  {t.city} &middot; {t.type.replace("_", " ")}
                  {t.capabilities.length > 0 && (
                    <>
                      <br />
                      {t.capabilities.join(", ")}
                    </>
                  )}
                </span>
              </Tooltip>
            </CircleMarker>
          );
        })}

      {showCharging &&
        chargingStops.map((cs) => (
          <CircleMarker
            key={cs.id}
            center={[cs.lat, cs.lng]}
            radius={5}
            pathOptions={{
              color: cs.status === "active" ? "#e11d48" : "#e11d48",
              fillColor: cs.status === "active" ? "#e11d48" : "#1a2234",
              fillOpacity: cs.status === "active" ? 0.9 : 0.7,
              weight: 2,
              opacity: 0.8,
              dashArray: cs.status === "planned" ? "3 3" : undefined,
            }}
          >
            <Tooltip>
              <span className="text-sm">
                <strong>{cs.name}</strong>
                <br />
                {cs.corridor} &middot; {cs.status}
                {cs.power_kw && <> &middot; {cs.power_kw / 1000} MW</>}
              </span>
            </Tooltip>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}
