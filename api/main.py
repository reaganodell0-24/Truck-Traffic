"""TX Autonomous Trucking Route Database — FastAPI Backend"""

from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
from typing import Any, Optional

from .faf5_client import FAF5Client
from .transborder_client import TransBorderClient


class SafeJSONResponse(JSONResponse):
    """JSON response that uses ensure_ascii=True to avoid encoding issues on Windows."""
    def render(self, content: Any) -> bytes:
        return json.dumps(content, ensure_ascii=True).encode("utf-8")


app = FastAPI(
    title="TX AV Route Database",
    description="Autonomous trucking routes, freight volumes, and EV charging stops for Texas corridors",
    version="0.1.0",
    default_response_class=SafeJSONResponse,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent.parent / "data"

faf5 = FAF5Client(DATA_DIR / "faf5")
transborder = TransBorderClient()


def load_json(filename: str) -> list:
    with open(DATA_DIR / filename, encoding="utf-8") as f:
        return json.load(f)


# ── Data Status ───────────────────────────────────────────────────

@app.get("/api/data-status")
def get_data_status():
    """Serve the latest data sweeper status."""
    status_file = DATA_DIR / "sweeper_status.json"
    if status_file.exists():
        with open(status_file, encoding="utf-8") as f:
            return json.load(f)
    return {"error": "No sweeper status found. Run: python scripts/data_sweeper.py"}


# ── Routes ──────────────────────────────────────────────────────────

@app.get("/api/routes")
def get_routes(
    company: Optional[str] = None,
    status: Optional[str] = None,
    corridor: Optional[str] = None,
):
    routes = load_json("routes.json")
    if company:
        routes = [r for r in routes if r["company"] == company]
    if status:
        routes = [r for r in routes if r["status"] == status]
    if corridor:
        routes = [r for r in routes if corridor.lower() in r["corridor"].lower()]
    return routes


@app.get("/api/routes/{route_id}")
def get_route(route_id: str):
    routes = load_json("routes.json")
    route = next((r for r in routes if r["id"] == route_id), None)
    if not route:
        return {"error": "Route not found"}
    return route


# ── Terminals ─────────────────────────────────────────────────────

@app.get("/api/terminals")
def get_terminals(
    operator: Optional[str] = None,
    type: Optional[str] = None,
):
    """All terminal/hub locations, optionally filtered by operator or type."""
    terminals = load_json("terminals.json")
    if operator:
        terminals = [t for t in terminals if operator in t["operators"]]
    if type:
        terminals = [t for t in terminals if t["type"] == type]
    return terminals


@app.get("/api/terminals/{terminal_id}")
def get_terminal(terminal_id: str):
    terminals = load_json("terminals.json")
    terminal = next((t for t in terminals if t["id"] == terminal_id), None)
    if not terminal:
        return {"error": "Terminal not found"}
    return terminal


# ── Charging Stops ────────────────────────────────────────────────

@app.get("/api/charging-stops")
def get_charging_stops(
    corridor: Optional[str] = None,
    status: Optional[str] = None,
    type: Optional[str] = None,
):
    """Megacharger + EV charging locations, optionally filtered."""
    stops = load_json("charging_stops.json")
    if corridor:
        stops = [s for s in stops if corridor.lower() in s["corridor"].lower()]
    if status:
        stops = [s for s in stops if s["status"] == status]
    if type:
        stops = [s for s in stops if s["type"] == type]
    return stops


# ── Route Volume ──────────────────────────────────────────────────

@app.get("/api/routes/{route_id}/volume")
def get_route_volume(route_id: str):
    """Corridor volume data for a specific route."""
    routes = load_json("routes.json")
    route = next((r for r in routes if r["id"] == route_id), None)
    if not route:
        return {"error": "Route not found"}
    return {
        "route_id": route["id"],
        "route_name": route["name"],
        "corridor": route["corridor"],
        "distance_miles": route.get("distance_miles"),
        "volume": route.get("volume", {}),
    }


# ── FAF5 Freight Flows ─────────────────────────────────────────────

@app.get("/api/faf5/flows")
def get_faf5_flows(
    origin: str = Query(..., description="FAF zone code, e.g. 481 for DFW"),
    dest: str = Query(..., description="FAF zone code, e.g. 482 for Houston"),
    mode: Optional[str] = Query("Truck", description="Truck, Rail, Water, Air, Pipeline"),
    year: Optional[int] = Query(2024),
):
    """Query FAF5 freight flows between two zones filtered by mode and year."""
    try:
        return faf5.query_flows(origin=origin, dest=dest, mode=mode, year=year)
    except Exception:
        return [{"error": "FAF5 database not available. Run: python scripts/setup_faf5.py"}]


@app.get("/api/faf5/commodities")
def get_faf5_commodities(
    origin: str = Query(...),
    dest: str = Query(...),
    year: Optional[int] = Query(2024),
):
    """Top commodities by tonnage between two zones (truck mode only)."""
    try:
        return faf5.top_commodities(origin=origin, dest=dest, year=year)
    except Exception:
        return [{"error": "FAF5 database not available. Run: python scripts/setup_faf5.py"}]


@app.get("/api/faf5/forecast")
def get_faf5_forecast(
    origin: str = Query(...),
    dest: str = Query(...),
    mode: Optional[str] = Query("Truck"),
):
    """Tonnage forecast 2024-2050 for a corridor."""
    try:
        return faf5.tonnage_forecast(origin=origin, dest=dest, mode=mode)
    except Exception:
        return [{"error": "FAF5 database not available. Run: python scripts/setup_faf5.py"}]


# ── BTS TransBorder Freight ────────────────────────────────────────

@app.get("/api/transborder/monthly")
def get_transborder_monthly(
    port: str = Query("Laredo", description="Border port name"),
    mode: Optional[str] = Query("Truck"),
    year: Optional[int] = Query(2025),
):
    """Monthly cross-border freight value by port and mode from BTS TransBorder."""
    return transborder.monthly_by_port(port=port, mode=mode, year=year)


@app.get("/api/transborder/commodity")
def get_transborder_commodity(
    port: str = Query("Laredo"),
    year: Optional[int] = Query(2025),
):
    """Top commodities at a border crossing by value."""
    return transborder.top_commodities_by_port(port=port, year=year)


@app.get("/api/transborder/crossings")
def get_transborder_crossings(
    port: str = Query("Laredo", description="Border port name"),
    year: Optional[int] = Query(2025),
):
    """Monthly truck crossing counts at a border port."""
    return transborder.truck_crossings_by_port(port=port, year=year)


@app.get("/api/transborder/summary")
def get_transborder_summary(
    year: int = Query(2024),
):
    """Annual freight summary across all TX border ports."""
    return transborder.annual_summary(year=year)


# ── Analytics ──────────────────────────────────────────────────────

@app.get("/api/analytics/av-penetration")
def get_av_penetration():
    """Calculate AV penetration % for each route: av_loads / total_corridor_loads."""
    routes = load_json("routes.json")
    results = []
    for r in routes:
        vol = r.get("volume", {})
        aadt_str = vol.get("truck_aadt")
        av_loads = vol.get("av_loads_per_week")
        if aadt_str and av_loads:
            # Parse AADT midpoint from range string like "18000-25000"
            parts = aadt_str.replace(",", "").split("-")
            aadt_mid = sum(int(p) for p in parts) / len(parts)
            weekly_total = aadt_mid * 7
            penetration = (av_loads / weekly_total) * 100
            results.append({
                "route_id": r["id"],
                "route_name": r["name"],
                "company": r["company"],
                "corridor_aadt_midpoint": aadt_mid,
                "av_loads_per_week": av_loads,
                "total_loads_per_week": weekly_total,
                "av_penetration_pct": round(penetration, 4),
                "av_category": "Active driverless" if r["status"] == "active" else r["status"],
            })
    return sorted(results, key=lambda x: x["av_penetration_pct"], reverse=True)


@app.get("/api/analytics/ev-feasibility")
def get_ev_feasibility(
    truck_type: str = Query("semi-lr", description="semi-lr, semi-sr, volvo, ecascadia"),
):
    """For each route, calculate charging stops needed for a given EV truck type."""
    truck_ranges = {
        "semi-lr": {"name": "Tesla Semi LR", "range_miles": 500, "charge_min": 30},
        "semi-sr": {"name": "Tesla Semi SR", "range_miles": 325, "charge_min": 30},
        "volvo": {"name": "Volvo VNR Electric", "range_miles": 373, "charge_min": 90},
        "ecascadia": {"name": "Freightliner eCascadia", "range_miles": 230, "charge_min": 90},
    }
    truck = truck_ranges.get(truck_type)
    if not truck:
        return {"error": f"Unknown truck type: {truck_type}"}

    routes = load_json("routes.json")
    results = []
    for r in routes:
        dist = r.get("distance_miles")
        if not dist:
            continue
        can_direct = dist <= truck["range_miles"]
        stops = 0 if can_direct else max(1, -(-dist // int(truck["range_miles"] * 0.85)) - 1)
        added_time = stops * truck["charge_min"]
        results.append({
            "route_id": r["id"],
            "route_name": r["name"],
            "distance_miles": dist,
            "truck_type": truck["name"],
            "truck_range": truck["range_miles"],
            "can_complete_direct": can_direct,
            "charging_stops_needed": stops,
            "added_charge_time_min": added_time,
        })
    return results
