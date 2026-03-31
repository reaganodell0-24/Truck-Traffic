import type { Route, Terminal, ChargingStop } from "@/lib/types";
import routesJson from "../../../data/routes.json";
import terminalsJson from "../../../data/terminals.json";
import chargingStopsJson from "../../../data/charging_stops.json";

export const routes: Route[] = routesJson as Route[];
export const terminals: Terminal[] = terminalsJson as Terminal[];
export const chargingStops: ChargingStop[] = chargingStopsJson as ChargingStop[];
