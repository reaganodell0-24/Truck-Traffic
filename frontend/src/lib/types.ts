export interface Route {
  id: string;
  name: string;
  company: Company;
  status: RouteStatus;
  corridor: string;
  distance_miles: number | null;
  origin: string;
  destination: string;
  waypoints: string[];
  launched: string;
  truck_count: string;
  customers: string[];
  power_type: string;
  fuel_economy_mpg: string | null;
  coordinates: {
    origin: [number, number];
    destination: [number, number];
    path?: [number, number][];
  };
  volume: CorridorVolume;
  notes: string;
}

export interface CorridorVolume {
  truck_aadt: string | null;
  annual_tonnage_m_tons: number | null;
  av_loads_per_week: number | null;
  top_commodities: string[];
  source: string;
  year: number;
}

export interface Terminal {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  operators: string[];
  type: TerminalType;
  size_sqft: number | null;
  capabilities: string[];
}

export interface ChargingStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  corridor: string;
  type: string;
  status: string;
  operator: string;
  power_kw: number | null;
  stall_count: number | null;
}

export interface FAF5Flow {
  sctg2: string;
  commodity_name: string;
  total_tons: number;
  total_value: number;
  total_tons_display?: string;
  total_value_display?: string;
}

export interface FAF5Forecast {
  year: number;
  total_tons: number;
  total_value: number;
}

export interface AVPenetrationResult {
  route_id: string;
  route_name: string;
  company: string;
  corridor_aadt_midpoint: number;
  av_loads_per_week: number;
  total_loads_per_week: number;
  av_penetration_pct: number;
  av_category: string;
}

export interface EVFeasibilityResult {
  route_id: string;
  route_name: string;
  distance_miles: number;
  truck_type: string;
  truck_range: number;
  can_complete_direct: boolean;
  charging_stops_needed: number;
  added_charge_time_min: number;
}

export interface RouteVolumeResponse {
  route_id: string;
  route_name: string;
  corridor: string;
  distance_miles: number | null;
  volume: CorridorVolume;
}

export type Company = "aurora" | "kodiak" | "gatik" | "waabi" | "bot-auto";
export type RouteStatus = "active" | "pilot" | "planned";
export type TerminalType = "av_terminal" | "truckport" | "megacharger" | "depot";

export type PanelType =
  | "route-detail"
  | "faf5"
  | "transborder"
  | "av-penetration"
  | "ev-feasibility"
  | "corridor-dive"
  | "industry";

export interface RouteFilters {
  company?: string | null;
  status?: string | null;
  corridor?: string | null;
}
