"""Generate sample FAF5 data for development without downloading from BTS.

Creates a realistic CSV matching the FAF5.7.1 schema with Texas zone flows,
then triggers SQLite ingestion via FAF5Client.

Usage:
    python scripts/generate_sample_faf5.py
"""

import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

DATA_DIR = Path(__file__).parent.parent / "data" / "faf5"

# Years in FAF5 regional database
ACTUAL_YEARS = list(range(2017, 2025))
FORECAST_YEARS = [2030, 2035, 2040, 2045, 2050]
ALL_YEARS = ACTUAL_YEARS + FORECAST_YEARS

# Texas FAF zone pairs (key corridors)
CORRIDORS = [
    # (origin, dest, description)
    ("481", "482", "DFW → Houston"),
    ("482", "481", "Houston → DFW"),
    ("481", "483", "DFW → San Antonio"),
    ("483", "481", "San Antonio → DFW"),
    ("481", "487", "DFW → El Paso"),
    ("487", "481", "El Paso → DFW"),
    ("482", "483", "Houston → San Antonio"),
    ("483", "482", "San Antonio → Houston"),
    ("481", "488", "DFW → Laredo"),
    ("488", "481", "Laredo → DFW"),
    ("481", "484", "DFW → Austin"),
    ("484", "481", "Austin → DFW"),
    ("489", "489", "Intra-Rest of TX (Permian)"),
    ("482", "485", "Houston → Beaumont"),
    ("485", "482", "Beaumont → Houston"),
    ("489", "481", "Rest of TX → DFW"),
    ("481", "489", "DFW → Rest of TX"),
    ("489", "482", "Rest of TX → Houston"),
    ("482", "489", "Houston → Rest of TX"),
]

# Key commodities with base tonnage (thousands of tons) and value (millions USD)
# for the DFW-Houston corridor; other corridors scale from these
COMMODITIES = [
    # (sctg2, base_tons, base_value, description)
    ("43", 4500, 28000, "Mixed freight"),
    ("17", 3800, 8500, "Gasoline/aviation fuel"),
    ("20", 2200, 5200, "Basic chemicals"),
    ("36", 1800, 18000, "Motorized vehicles"),
    ("24", 1500, 6800, "Plastics/rubber"),
    ("35", 1200, 22000, "Electronics"),
    ("34", 1100, 9500, "Machinery"),
    ("11", 3200, 1800, "Natural sands (frac sand)"),
    ("12", 2800, 1200, "Gravel/crushed stone"),
    ("05", 900, 4200, "Meat/seafood"),
    ("07", 850, 3800, "Other foodstuffs"),
    ("23", 750, 4500, "Chemical products"),
    ("31", 1400, 2800, "Nonmetal mineral products"),
    ("16", 5500, 9000, "Crude petroleum"),
    ("18", 2000, 3500, "Fuel oils"),
    ("33", 600, 3200, "Metal articles"),
    ("40", 550, 2900, "Misc mfg products"),
    ("32", 800, 2100, "Base metals"),
    ("41", 700, 800, "Waste/scrap"),
    ("02", 1600, 1100, "Cereal grains"),
]

# Corridor-specific scaling factors relative to DFW-Houston
CORRIDOR_SCALES = {
    ("481", "482"): 1.0,
    ("482", "481"): 0.85,
    ("481", "483"): 0.6,
    ("483", "481"): 0.5,
    ("481", "487"): 0.35,
    ("487", "481"): 0.3,
    ("482", "483"): 0.55,
    ("483", "482"): 0.45,
    ("481", "488"): 0.4,
    ("488", "481"): 0.45,  # Laredo imports
    ("481", "484"): 0.5,
    ("484", "481"): 0.4,
    ("489", "489"): 0.7,   # Permian intra-zone
    ("482", "485"): 0.3,
    ("485", "482"): 0.25,
    ("489", "481"): 0.5,
    ("481", "489"): 0.45,
    ("489", "482"): 0.55,
    ("482", "489"): 0.4,
}

# Year-over-year growth factors (cumulative from 2017 base)
YEAR_FACTORS = {
    2017: 1.0, 2018: 1.03, 2019: 1.05, 2020: 0.92,  # COVID dip
    2021: 1.02, 2022: 1.08, 2023: 1.10, 2024: 1.12,
    2030: 1.28, 2035: 1.42, 2040: 1.55, 2045: 1.68, 2050: 1.82,
}

# Commodity emphasis by corridor (boost certain commodities for realism)
CORRIDOR_COMMODITY_BOOSTS = {
    ("489", "489"): {"11": 5.0, "12": 4.0, "16": 3.0},  # Permian: frac sand, gravel, crude
    ("481", "488"): {"36": 2.0, "43": 1.5},  # Laredo: vehicles, mixed freight (NAFTA)
    ("488", "481"): {"36": 2.5, "35": 2.0, "43": 1.5},  # Laredo imports
    ("482", "485"): {"16": 3.0, "17": 2.5, "18": 2.0},  # Beaumont: petrochemicals
    ("485", "482"): {"16": 3.0, "17": 2.5, "20": 2.0},
    ("489", "481"): {"11": 3.0, "16": 2.0},  # Rest of TX to DFW: sand, crude
    ("489", "482"): {"16": 3.0, "11": 2.0},  # Rest of TX to Houston: crude, sand
}


def generate_csv():
    """Generate sample FAF5 CSV file."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = DATA_DIR / "FAF5_sample.csv"

    # Build CSV header matching real FAF5 schema
    fieldnames = [
        "fr_orig", "dms_orig", "dms_dest", "fr_dest",
        "fr_inmode", "dms_mode", "sctg2", "trade_type",
    ]
    for yr in ALL_YEARS:
        fieldnames.extend([f"tons_{yr}", f"value_{yr}", f"tmiles_{yr}"])

    rows = []
    for orig, dest, _desc in CORRIDORS:
        scale = CORRIDOR_SCALES.get((orig, dest), 0.3)
        boosts = CORRIDOR_COMMODITY_BOOSTS.get((orig, dest), {})

        for sctg, base_tons, base_value, _cname in COMMODITIES:
            commodity_boost = boosts.get(sctg, 1.0)

            # Truck mode (mode 1) — primary
            row = {
                "fr_orig": orig,
                "dms_orig": orig,
                "dms_dest": dest,
                "fr_dest": dest,
                "fr_inmode": "1",
                "dms_mode": "1",
                "sctg2": sctg,
                "trade_type": "1",
            }
            for yr in ALL_YEARS:
                yf = YEAR_FACTORS[yr]
                tons = round(base_tons * scale * commodity_boost * yf, 1)
                value = round(base_value * scale * commodity_boost * yf, 1)
                # Estimate ton-miles: tons * average distance (200 mi for intra-TX)
                tmiles = round(tons * 0.2, 1)
                row[f"tons_{yr}"] = tons
                row[f"value_{yr}"] = value
                row[f"tmiles_{yr}"] = tmiles
            rows.append(row)

            # Add some Rail mode (mode 2) for bulk commodities
            if sctg in ("02", "11", "12", "15", "16", "32"):
                rail_row = dict(row)
                rail_row["dms_mode"] = "2"
                for yr in ALL_YEARS:
                    rail_row[f"tons_{yr}"] = round(row[f"tons_{yr}"] * 0.3, 1)
                    rail_row[f"value_{yr}"] = round(row[f"value_{yr}"] * 0.25, 1)
                    rail_row[f"tmiles_{yr}"] = round(row[f"tmiles_{yr}"] * 0.4, 1)
                rows.append(rail_row)

            # Add Pipeline mode (mode 6) for petroleum
            if sctg in ("16", "17", "18"):
                pipe_row = dict(row)
                pipe_row["dms_mode"] = "6"
                for yr in ALL_YEARS:
                    pipe_row[f"tons_{yr}"] = round(row[f"tons_{yr}"] * 1.5, 1)
                    pipe_row[f"value_{yr}"] = round(row[f"value_{yr}"] * 1.5, 1)
                    pipe_row[f"tmiles_{yr}"] = round(row[f"tmiles_{yr}"] * 1.2, 1)
                rows.append(pipe_row)

    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated {len(rows)} rows → {csv_path}")
    return csv_path


def build_db():
    """Ingest the sample CSV into SQLite via FAF5Client."""
    from api.faf5_client import FAF5Client

    # Remove existing DB so it re-ingests
    db_path = DATA_DIR / "faf5.db"
    if db_path.exists():
        db_path.unlink()
        print(f"Removed existing {db_path}")

    client = FAF5Client(DATA_DIR)
    if client.db_path.exists():
        size_kb = client.db_path.stat().st_size / 1000
        print(f"Database ready: {client.db_path} ({size_kb:.0f} KB)")
    else:
        print("ERROR: Database was not created.")


def verify():
    """Quick verification of the sample data."""
    from api.faf5_client import FAF5Client

    client = FAF5Client(DATA_DIR)

    # Test DFW → Houston truck flows
    results = client.query_flows(origin="481", dest="482", mode="Truck", year=2024)
    if results and "error" not in results[0]:
        total_tons = sum(r.get("total_tons", 0) for r in results)
        print(f"\nVerification: DFW → Houston truck flows (2024)")
        print(f"  Commodities found: {len(results)}")
        print(f"  Total tonnage: {total_tons:,.0f} thousand tons")
        print(f"  Top 3:")
        for r in results[:3]:
            print(f"    {r['commodity_name']}: {r['total_tons']:,.0f}K tons (${r['total_value']:,.0f}M)")
    else:
        print(f"Verification failed: {results}")

    # Test forecast
    forecast = client.tonnage_forecast(origin="481", dest="482", mode="Truck")
    if forecast and "error" not in forecast[0]:
        print(f"\n  Forecast years: {len(forecast)}")
        print(f"  2024: {forecast[-6]['total_tons']:,.0f}K tons")
        print(f"  2050: {forecast[-1]['total_tons']:,.0f}K tons")


if __name__ == "__main__":
    print("=" * 60)
    print("Generating Sample FAF5 Data")
    print("=" * 60)
    generate_csv()
    build_db()
    verify()
    print("\nDone.")
