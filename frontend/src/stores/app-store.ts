"use client";

import { create } from "zustand";
import type { PanelType } from "@/lib/types";

interface AppState {
  selectedRouteId: string | null;
  activePanel: PanelType | null;

  companyFilter: string | null;
  statusFilter: string | null;
  corridorFilter: string | null;
  truckType: string | null;

  faf5Origin: string;
  faf5Dest: string;
  transborderPort: string;
  corridorDiveTarget: string;

  selectRoute: (id: string | null) => void;
  openPanel: (panel: PanelType) => void;
  closePanel: () => void;
  setCompanyFilter: (company: string | null) => void;
  setStatusFilter: (status: string | null) => void;
  setCorridorFilter: (corridor: string | null) => void;
  setTruckType: (type: string | null) => void;
  setFaf5Origin: (origin: string) => void;
  setFaf5Dest: (dest: string) => void;
  setTransborderPort: (port: string) => void;
  setCorridorDiveTarget: (corridor: string) => void;
  clearFilters: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedRouteId: null,
  activePanel: null,

  companyFilter: null,
  statusFilter: null,
  corridorFilter: null,
  truckType: null,

  faf5Origin: "481",
  faf5Dest: "482",
  transborderPort: "Laredo",
  corridorDiveTarget: "I-45",

  selectRoute: (id) =>
    set({ selectedRouteId: id, activePanel: id ? "route-detail" : null }),

  openPanel: (panel) => set({ activePanel: panel }),
  closePanel: () => set({ activePanel: null }),

  setCompanyFilter: (company) => set({ companyFilter: company }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setCorridorFilter: (corridor) => set({ corridorFilter: corridor }),
  setTruckType: (type) => set({ truckType: type }),

  setFaf5Origin: (origin) => set({ faf5Origin: origin }),
  setFaf5Dest: (dest) => set({ faf5Dest: dest }),
  setTransborderPort: (port) => set({ transborderPort: port }),
  setCorridorDiveTarget: (corridor) => set({ corridorDiveTarget: corridor }),

  clearFilters: () =>
    set({ companyFilter: null, statusFilter: null, corridorFilter: null, truckType: null }),
}));
