export type Company = "aurora" | "kodiak" | "gatik" | "waabi" | "bot-auto";
export type Status = "active" | "pilot" | "planned";

export interface Coordinates {
  origin: [number, number];
  destination: [number, number];
  path: [number, number][];
}

export interface Volume {
  truck_aadt: string | null;
  annual_tonnage_m_tons: number | null;
  av_loads_per_week: number | null;
  top_commodities: string[];
  source: string;
  year: number;
}

export interface Route {
  id: string;
  name: string;
  company: Company;
  status: Status;
  corridor: string;
  distance_miles: number;
  origin: string;
  destination: string;
  waypoints: string[];
  launched: string;
  truck_count: string;
  customers: string[];
  power_type: string;
  fuel_economy_mpg: string | null;
  notes: string;
  coordinates: Coordinates;
  volume: Volume;
}

export type TerminalType = "av_terminal" | "truckport" | "megacharger" | "depot";

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

export type ChargingStopType = "megacharger" | "ev_charger" | "diesel_stop";
export type ChargingStopStatus = "active" | "planned" | "under_construction";

export interface ChargingStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  corridor: string;
  type: ChargingStopType;
  status: ChargingStopStatus;
  operator: string;
  power_kw: number | null;
  stall_count: number | null;
}
