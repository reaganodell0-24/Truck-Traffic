# TX Autonomous Trucking Route Database

## Project Overview
Interactive database and viewer for autonomous trucking routes in Texas and the Sun Belt. Tracks active, pilot, and planned driverless freight corridors with volume data from USDOT/BTS, EV charging stop feasibility analysis, and autonomous vs. conventional truck traffic separation.

## Architecture
- **Frontend**: Next.js 14+ / React 18 / TypeScript / Tailwind CSS / shadcn/ui
- **Backend**: Python FastAPI
- **Data Sources**: BTS TransBorder Freight API (Socrata), FHWA FAF5 CSVs, TxDOT STARS II, AV operator press releases
- **Database**: SQLite (local dev) → PostgreSQL (production)
- **Map**: Leaflet + ESRI satellite tiles (consistent with Industrial Land Scanner project)

## Domain Vocabulary
- **AADT**: Annual Average Daily Traffic — total vehicles/day on a road segment
- **AADTT**: Annual Average Daily Truck Traffic — truck-specific AADT
- **AV**: Autonomous Vehicle (Level 4 SAE — no human driver required within ODD)
- **ODD**: Operational Design Domain — conditions under which AV system can operate
- **HOS**: Hours of Service — federal rules limiting human driver operating time (11 hrs driving / 14 hrs on-duty)
- **FAF5**: Freight Analysis Framework version 5 — FHWA/BTS national freight flow dataset
- **SCTG**: Standard Classification of Transported Goods — 42 commodity codes used in FAF
- **DTT**: Data Tabulation Tool — FAF5's interactive query interface at faf.ornl.gov
- **TransBorder**: BTS program tracking US-Canada/Mexico cross-border freight monthly
- **Megacharger**: Tesla's 1.2 MW charging system for Semi trucks (MCS standard)
- **MCS**: Megawatt Charging System — industry standard for heavy-duty EV charging
- **Hub-to-hub**: Operating model where AV trucks run between terminals, human drivers handle first/last mile
- **Driver-out / Pull the driver**: Operating without any human in the cab
- **Truckport**: Autonomous truck terminal (Kodiak's term) — co-located with truck stops for fueling/maintenance
- **Dune Express**: Atlas Energy Solutions' 42-mile conveyor system in Permian Basin
- **Frac sand / Proppant**: Sand used in hydraulic fracturing — major commodity in Permian Basin routes
- **Simul-frac**: Simultaneous fracturing of multiple wells — drives extreme sand demand and 24/7 hauling
- **Texas Triangle**: DFW ↔ Houston ↔ San Antonio metro freight corridor network
- **Sun Belt**: Southern US corridor — Aurora's expansion geography (TX, NM, AZ)

## Data Model

### Core Entities

```
Route {
  id: string                    // e.g., "aur-dh" (operator-corridor shorthand)
  name: string                  // "Dallas → Houston"
  company: string               // "aurora" | "kodiak" | "gatik" | "waabi" | "bot-auto"
  status: string                // "active" | "pilot" | "planned"
  corridor: string              // "I-45" | "I-20 / I-10" | "Private roads"
  distance_miles: number
  origin: string                // city/terminal key
  destination: string
  waypoints: string[]
  launched: string
  truck_count: string
  customers: string[]
  power_type: string            // "Diesel (autonomous)" | "Diesel (w/ safety driver)" | "EV"
  fuel_economy_mpg: string      // "9-11 MPG" or null for EV
  notes: string
}

Terminal {
  id: string
  name: string
  city: string
  lat: number
  lng: number
  operators: string[]           // companies operating from this terminal
  type: string                  // "av_terminal" | "truckport" | "megacharger" | "depot"
  size_sqft: number | null
  capabilities: string[]        // ["fueling", "maintenance", "charging", "inspection", "calibration"]
}

CorridorVolume {
  route_id: string
  truck_aadt: string            // daily truck count range
  annual_tonnage_tons: number
  av_loads_per_week: number | null
  av_penetration_pct: number    // calculated: av_loads / (truck_aadt * 7)
  top_commodities: string[]
  source: string                // "TxDOT TFMP" | "FHWA FAF5" | "BTS TransBorder"
  year: number
}

FAF5Flow {
  origin_faf_zone: string       // "481" = DFW, "482" = Houston, etc.
  dest_faf_zone: string
  commodity_sctg: string        // 2-digit SCTG code
  mode: string                  // "Truck" | "Rail" | "Water" | "Air" | "Pipeline" | "Multiple" | "Other"
  tons_thousands: number
  value_millions: number
  year: number                  // 2017-2024 actual, 2025-2050 forecast
}

ChargingStop {
  id: string
  name: string
  lat: number
  lng: number
  corridor: string
  type: string                  // "megacharger" | "ev_charger" | "diesel_stop"
  status: string                // "active" | "planned" | "under_construction"
  operator: string              // "Tesla/Pilot" | "Pilot" | "ChargePoint"
  power_kw: number | null       // 1200 for Megacharger
  stall_count: number | null
}

TruckType {
  id: string
  name: string
  range_miles: number
  charge_time_minutes: number   // to 60% capacity
  power_type: string            // "BEV" | "Diesel" | "FCEV" | "EREV"
  class: string                 // "Class 8" | "Medium-duty"
}
```

### FAF5 Zone Codes for Texas
```
481 = Dallas-Fort Worth TX (CMA)
482 = Houston TX (CMA)
483 = San Antonio TX (CMA)  
484 = Austin TX (CMA)
485 = Beaumont TX (CMA)
486 = Corpus Christi TX (CMA)
487 = El Paso TX (CMA)
488 = Laredo TX (CMA)
489 = Remainder of Texas (includes Permian Basin / Midland-Odessa)
```

### SCTG Commodity Codes (key ones for TX corridors)
```
01 = Live animals/fish          17 = Gasoline/aviation fuel
02 = Cereal grains              18 = Fuel oils
03 = Other ag products          19 = Coal/petroleum products NEC
04 = Animal feed                20 = Basic chemicals
05 = Meat/seafood               21 = Pharmaceutical products
06 = Milled grain products      23 = Chemical products
07 = Other foodstuffs           24 = Plastics/rubber
08 = Alcoholic beverages        25 = Logs/lumber
10 = Building stone             26 = Wood products
11 = Natural sands (FRAC SAND)  27 = Pulp/newsprint/paper
12 = Gravel/crusite stone       31 = Nonmetal mineral products
13 = Nonmetallic minerals NEC   32 = Base metals
14 = Metallic ores              33 = Articles of base metal
15 = Coal                       34 = Machinery
16 = Crude petroleum            35 = Electronics
                                36 = Motorized vehicles
                                37 = Transport equipment
                                38 = Precision instruments
                                39 = Furniture
                                40 = Miscellaneous mfg products
                                41 = Waste/scrap
                                43 = Mixed freight
```

## API Design

### External Data Sources

**BTS TransBorder Freight (Socrata API)**
- Base URL: `https://data.bts.gov/resource/{dataset-id}.json`
- Auth: App token (free registration) or unauthenticated (throttled)
- Filters: `$where`, `$select`, `$group` (SoQL)
- Key fields: port_name, commodity, mode, value, year, month
- Relevant ports: Laredo TX, El Paso TX, Hidalgo TX

**FAF5 Data (CSV ingestion)**
- Download from: https://www.bts.gov/faf
- Files: `FAF5.7.1.zip` (regional) and `FAF5.7.1_State.zip` (state-level)
- Schema: dms_orig, dms_dest, sctg2 (commodity), dms_mode, tons_2017...tons_2050, value_2017...value_2050
- Process: download CSV → filter TX zones → load into SQLite → serve via FastAPI

### Internal API Endpoints (FastAPI)

```
GET  /api/routes                    → all routes with filters (?company=aurora&status=active)
GET  /api/routes/{id}               → single route with full detail
GET  /api/routes/{id}/volume        → corridor volume data for a route
GET  /api/terminals                 → all terminals/hubs
GET  /api/charging-stops            → Megacharger + EV charging locations
GET  /api/faf5/flows                → FAF5 flows (?origin=481&dest=482&mode=Truck&year=2024)
GET  /api/faf5/commodities          → commodity breakdown for a corridor
GET  /api/faf5/forecast             → tonnage forecast 2025-2050 for a corridor
GET  /api/transborder/monthly       → TransBorder freight (?port=Laredo&mode=Truck)
GET  /api/analytics/av-penetration  → AV % of corridor traffic by route
GET  /api/analytics/ev-feasibility  → charging stop analysis by truck type
```

## Key AV Operators — Fleet Data

### Aurora Innovation (NASDAQ: AUR)
- 10 active driverless lanes (Sun Belt)
- 30 trucks (10 fully driverless), scaling to 200+ by end 2026
- Terminals: Palmer TX (Dallas), Houston, Fort Worth, El Paso
- 20 hrs/day utilization target
- $14-16M revenue projected 2026
- Partners: Uber Freight, Hirschbach, FedEx, Werner, Schneider, Detmar Logistics

### Kodiak AI (NASDAQ: KOD)
- 10 driverless trucks in Permian Basin (Atlas Energy)
- 100-truck binding order from Atlas (fulfilling 2026)
- Office: Odessa TX (18,000 SF)
- Truckport: Pilot Travel Center (GA)
- Targeting highway driverless H2 2026
- ARM (Autonomous Readiness Metric): 78% for long-haul (Nov 2025)
- Partners: Atlas Energy, Bosch, J.B. Hunt, Bridgestone, Werner, US Military

### Gatik
- First NA company to deploy fully driverless at commercial scale (Jan 2026)
- 60,000+ driverless orders, $600M contracted revenue
- Medium-duty (26-30 ft) — NOT Class 8 long-haul
- Middle-mile: DC → retail store
- Partners: Walmart, Kroger, Tyson Foods, Pitney Bowes

### Waabi
- Terminal: Lancaster TX (8+ acres, south of Dallas)
- AI-simulation-first approach (Waabi World)
- Planning driver-out I-45 ops 2026
- Backed by Uber, Nvidia, Khosla Ventures

### Bot Auto (Houston-based)
- 8 trucks, piloting with drivers
- I-10 (Houston↔San Antonio), I-45 (Houston↔Dallas) overnight
- Partners: Steves & Sons, Ryan Transportation, J.B. Hunt

## Code Conventions
- Follow global ~/.claude/CLAUDE.md for code style
- Use snake_case for Python (FastAPI), camelCase for TypeScript
- All API responses use JSON, snake_case keys
- Map coordinates: [lat, lng] format for Leaflet compatibility
- Volume data: always include `source` and `year` fields for attribution
- Monetary values in millions USD, tonnage in thousands of tons (matching FAF5)

## Pre-commit Quality Checks
- Python: ruff lint + format, mypy type check
- TypeScript: eslint, tsc --noEmit
- Data: validate all route IDs exist in routes.json before commit
