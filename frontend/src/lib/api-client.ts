import type {
  Route,
  Terminal,
  ChargingStop,
  FAF5Flow,
  FAF5Forecast,
  AVPenetrationResult,
  EVFeasibilityResult,
  RouteVolumeResponse,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, params?: Record<string, string | number | null | undefined>): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== "") url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  routes: {
    list: (filters?: { company?: string | null; status?: string | null; corridor?: string | null }) =>
      apiFetch<Route[]>("/api/routes", filters ?? {}),
    get: (id: string) => apiFetch<Route>(`/api/routes/${id}`),
    volume: (id: string) => apiFetch<RouteVolumeResponse>(`/api/routes/${id}/volume`),
  },
  terminals: {
    list: (filters?: { operator?: string | null; type?: string | null }) =>
      apiFetch<Terminal[]>("/api/terminals", filters ?? {}),
    get: (id: string) => apiFetch<Terminal>(`/api/terminals/${id}`),
  },
  chargingStops: {
    list: (filters?: { corridor?: string | null; status?: string | null; type?: string | null }) =>
      apiFetch<ChargingStop[]>("/api/charging-stops", filters ?? {}),
  },
  faf5: {
    flows: (params: { origin: string; dest: string; mode?: string; year?: number }) =>
      apiFetch<FAF5Flow[]>("/api/faf5/flows", params as Record<string, string | number>),
    commodities: (params: { origin: string; dest: string; year?: number }) =>
      apiFetch<FAF5Flow[]>("/api/faf5/commodities", params as Record<string, string | number>),
    forecast: (params: { origin: string; dest: string; mode?: string }) =>
      apiFetch<FAF5Forecast[]>("/api/faf5/forecast", params as Record<string, string>),
  },
  transborder: {
    monthly: (params: { port?: string; mode?: string; year?: number }) =>
      apiFetch<Record<string, unknown>[]>("/api/transborder/monthly", params as Record<string, string | number>),
    commodity: (params: { port?: string; year?: number }) =>
      apiFetch<Record<string, unknown>[]>("/api/transborder/commodity", params as Record<string, string | number>),
    crossings: (params: { port?: string; year?: number }) =>
      apiFetch<Record<string, unknown>[]>("/api/transborder/crossings", params as Record<string, string | number>),
    summary: (params: { year?: number }) =>
      apiFetch<Record<string, unknown>[]>("/api/transborder/summary", params as Record<string, string | number>),
  },
  analytics: {
    avPenetration: () => apiFetch<AVPenetrationResult[]>("/api/analytics/av-penetration"),
    evFeasibility: (truckType: string) =>
      apiFetch<EVFeasibilityResult[]>("/api/analytics/ev-feasibility", { truck_type: truckType }),
  },
};
