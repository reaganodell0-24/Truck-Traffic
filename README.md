# TX Autonomous Trucking Route Database

Interactive database tracking autonomous trucking routes across Texas and the Sun Belt — with USDOT freight volume data, EV charging feasibility analysis, and autonomous vs. conventional traffic separation.

## Quick Start

```bash
# 1. Clone and install
cd tx-av-routes
pip install -r requirements.txt

# 2. Download FAF5 freight data (~100MB download, one-time)
python scripts/setup_faf5.py

# 3. Start the API
uvicorn api.main:app --reload --port 8000

# 4. Start the frontend (separate terminal)
cd frontend && npm install && npm run dev
```

## Data Sources

| Source | Type | Coverage | Update Frequency |
|--------|------|----------|-----------------|
| **BTS TransBorder** | API (Socrata) | US-Mexico/Canada freight by port, mode, commodity | Monthly |
| **FHWA FAF5** | CSV → SQLite | All US domestic freight O-D flows, 42 commodities | Annual + 2050 forecast |
| **TxDOT STARS II** | Manual / GIS | Texas highway segment AADT with truck % | Annual |
| **AV Operators** | Manual / press releases | Fleet size, loads/week, routes, terminals | As reported |
| **Tesla Megacharger** | Manual / map scrape | 19 planned TX locations at Pilot Travel Centers | As announced |

## Architecture

```
tx-av-routes/
├── CLAUDE.md              # Domain context for Claude Code
├── api/
│   ├── main.py            # FastAPI endpoints
│   ├── faf5_client.py     # FAF5 CSV → SQLite ingestion + queries
│   └── transborder_client.py  # BTS Socrata API client
├── data/
│   ├── routes.json        # Route definitions with coordinates + volume
│   ├── terminals.json     # Terminal/hub locations (TODO)
│   ├── charging_stops.json # Megacharger + EV charging locations (TODO)
│   └── faf5/              # FAF5 CSV + SQLite DB (gitignored, ~350MB)
├── frontend/
│   └── src/
│       ├── components/    # React map viewer, route cards, filters
│       ├── hooks/         # useRoutes, useFAF5, useTransBorder
│       ├── lib/           # API client, types, utils
│       └── data/          # Static truck type definitions
├── scripts/
│   └── setup_faf5.py     # One-time FAF5 data download + DB build
└── requirements.txt
```

## API Endpoints

### Routes & Terminals
- `GET /api/routes` — All routes (filter by `?company=aurora&status=active`)
- `GET /api/routes/{id}` — Single route with full detail + volume
- `GET /api/terminals` — Terminal/hub locations
- `GET /api/charging-stops` — Megacharger + EV charging sites

### USDOT Freight Data
- `GET /api/faf5/flows?origin=481&dest=482&mode=Truck&year=2024` — FAF5 commodity flows
- `GET /api/faf5/commodities?origin=481&dest=482` — Top commodities by tonnage
- `GET /api/faf5/forecast?origin=481&dest=482` — Tonnage forecast 2024→2050
- `GET /api/transborder/monthly?port=Laredo&mode=Truck` — Border freight (near real-time)
- `GET /api/transborder/commodity?port=Laredo` — Top border commodities

### Analytics
- `GET /api/analytics/av-penetration` — AV % of corridor traffic (AV loads ÷ total AADT)
- `GET /api/analytics/ev-feasibility?truck_type=semi-lr` — Charging stops needed per route

## FAF5 Zone Codes (Texas)

| Code | Region | Key Corridors |
|------|--------|--------------|
| 481 | Dallas-Fort Worth | I-45, I-35, I-20 |
| 482 | Houston | I-45, I-10 |
| 483 | San Antonio | I-35, I-10 |
| 484 | Austin | I-35 |
| 487 | El Paso | I-10, I-20 |
| 488 | Laredo | I-35 (border) |
| 489 | Remainder of TX | Permian Basin, I-20 west |

## AV vs. Regular Traffic Separation

The system calculates autonomous vehicle penetration per corridor:

```
Total corridor volume  →  FAF5 (truck mode) + TxDOT AADT
Autonomous volume      →  Operator-reported loads/week
Regular volume         →  Total − Autonomous
AV penetration %       →  (AV loads/week) ÷ (AADT × 7) × 100
```

Current AV penetration is <0.1% on most corridors. The growth projection
from 0.1% → 5% → 15% over the next decade is where the investment
thesis for terminal real estate, charging infrastructure, and corridor
development lives.

## Prototype

The HTML prototype built in Claude chat is in the repo root as
`autonomous_trucking_texas.html` — it has the full route database,
SVG map, EV stop calculator, Permian Basin expansion, volume data,
and diesel MPG comparisons. Use it as reference for the React rebuild.
