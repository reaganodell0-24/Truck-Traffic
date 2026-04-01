"use client";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { DARK_TILES, LIGHT_TILES, TILE_ATTRIBUTION, MAP_CENTER, MAP_ZOOM } from "@/lib/constants";
import { RoutePolylines } from "./route-polylines";
import { TerminalMarkers } from "./terminal-markers";
import { ChargerMarkers } from "./charger-markers";
import { MapLegend } from "./map-legend";
import "leaflet/dist/leaflet.css";

function TileSwapper() {
  const { theme } = useTheme();
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  const tiles = theme === "dark" ? DARK_TILES : LIGHT_TILES;

  return <TileLayer url={tiles} attribution={TILE_ATTRIBUTION} />;
}

export default function MapInner() {
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      minZoom={5}
      maxZoom={12}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileSwapper />
      <RoutePolylines />
      <TerminalMarkers />
      <ChargerMarkers />
      <MapLegend />
    </MapContainer>
  );
}
