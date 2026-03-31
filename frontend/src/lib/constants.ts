import type { Company, Status } from "./types";

export const COMPANY_COLORS: Record<Company, string> = {
  aurora: "#00d4aa",
  kodiak: "#f59e0b",
  gatik: "#8b5cf6",
  waabi: "#ef4444",
  "bot-auto": "#3b82f6",
};

export const COMPANY_LABELS: Record<Company, string> = {
  aurora: "Aurora",
  kodiak: "Kodiak",
  gatik: "Gatik",
  waabi: "Waabi",
  "bot-auto": "Bot Auto",
};

export const STATUS_COLORS: Record<Status, string> = {
  active: "#00d4aa",
  pilot: "#06b6d4",
  planned: "#f59e0b",
};

export const TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
export const TILE_ATTRIBUTION = "Tiles &copy; Esri";

export const TX_CENTER: [number, number] = [31.0, -100.0];
export const DEFAULT_ZOOM = 6;

export const ALL_COMPANIES: Company[] = [
  "aurora",
  "kodiak",
  "gatik",
  "waabi",
  "bot-auto",
];
export const ALL_STATUSES: Status[] = ["active", "pilot", "planned"];
