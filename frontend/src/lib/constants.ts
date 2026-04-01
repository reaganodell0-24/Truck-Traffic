import type { Company } from "./types";

export const COMPANY_COLORS: Record<Company, string> = {
  aurora: "#00d4aa",
  kodiak: "#f59e0b",
  gatik: "#8b5cf6",
  waabi: "#ef4444",
  "bot-auto": "#3b82f6",
};

export const COMPANY_NAMES: Record<Company, string> = {
  aurora: "Aurora",
  kodiak: "Kodiak",
  gatik: "Gatik",
  waabi: "Waabi",
  "bot-auto": "Bot Auto",
};

export const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  pilot: "#f59e0b",
  planned: "#94a3b8",
};

export const FAF_ZONES: Record<string, string> = {
  "481": "Dallas-Fort Worth",
  "482": "Houston",
  "483": "San Antonio",
  "484": "Austin",
  "485": "Beaumont",
  "486": "Corpus Christi",
  "487": "El Paso",
  "488": "Laredo",
  "489": "Remainder of TX",
};

export const CORRIDORS = ["I-45", "I-35", "I-10", "I-20", "Permian"] as const;

export const TRUCK_TYPES = [
  { id: "semi-lr", name: "Tesla Semi LR", range: 500, chargeMin: 30 },
  { id: "semi-sr", name: "Tesla Semi SR", range: 325, chargeMin: 30 },
  { id: "volvo", name: "Volvo VNR Electric", range: 373, chargeMin: 90 },
  { id: "ecascadia", name: "Freightliner eCascadia", range: 230, chargeMin: 90 },
] as const;

export const BORDER_PORTS = ["Laredo", "El Paso", "Hidalgo", "Eagle Pass", "Brownsville"] as const;

export const MAP_CENTER: [number, number] = [31.0, -99.5];
export const MAP_ZOOM = 6;

export const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
export const LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
