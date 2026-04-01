"use client";

import useSWR from "swr";
import { api } from "@/lib/api-client";

export function useTransborderMonthly(port = "Laredo", mode = "Truck", year = 2025) {
  return useSWR(["transborder-monthly", port, mode, year], () =>
    api.transborder.monthly({ port, mode, year })
  );
}

export function useTransborderCommodities(port = "Laredo", year = 2025) {
  return useSWR(["transborder-commodity", port, year], () =>
    api.transborder.commodity({ port, year })
  );
}

export function useTransborderCrossings(port = "Laredo", year = 2025) {
  return useSWR(["transborder-crossings", port, year], () =>
    api.transborder.crossings({ port, year })
  );
}

export function useTransborderSummary(year = 2024) {
  return useSWR(["transborder-summary", year], () => api.transborder.summary({ year }));
}
