"""FAF5 data ingestion and query client.

Downloads FAF5.7.1 CSV from BTS, loads into SQLite, and provides query methods.

FAF5 CSV schema (regional database):
  fr_orig    - FAF origin zone (e.g., 481 = DFW)
  dms_orig   - Domestic origin zone
  dms_dest   - Domestic destination zone
  fr_dest    - FAF destination zone
  fr_inmode  - Foreign inbound mode
  dms_mode   - Domestic mode (1=Truck, 2=Rail, 3=Water, 4=Air, 5=Multiple, 6=Pipeline, 7=Other, 8=No domestic)
  sctg2      - 2-digit SCTG commodity code
  trade_type - 1=Domestic, 2=Import, 3=Export
  tons_YYYY  - Weight in thousands of tons for year YYYY
  value_YYYY - Value in millions of 2017 USD for year YYYY
  tmiles_YYYY - Ton-miles in millions for year YYYY

Texas FAF zones:
  481=DFW, 482=Houston, 483=San Antonio, 484=Austin,
  485=Beaumont, 486=Corpus Christi, 487=El Paso, 488=Laredo, 489=Rest of TX
"""

import csv
import sqlite3
from pathlib import Path
from typing import Optional

# Mode code lookup
MODE_CODES = {
    "1": "Truck", "2": "Rail", "3": "Water", "4": "Air",
    "5": "Multiple", "6": "Pipeline", "7": "Other", "8": "No domestic",
}
MODE_REVERSE = {v: k for k, v in MODE_CODES.items()}

# SCTG commodity code lookup (abbreviated)
SCTG_CODES = {
    "01": "Live animals/fish", "02": "Cereal grains", "03": "Other ag products",
    "04": "Animal feed", "05": "Meat/seafood", "06": "Milled grain",
    "07": "Other foodstuffs", "08": "Alcoholic beverages", "09": "Tobacco",
    "10": "Building stone", "11": "Natural sands", "12": "Gravel/crushed stone",
    "13": "Nonmetallic minerals NEC", "14": "Metallic ores", "15": "Coal",
    "16": "Crude petroleum", "17": "Gasoline/aviation fuel", "18": "Fuel oils",
    "19": "Coal/petroleum NEC", "20": "Basic chemicals", "21": "Pharmaceuticals",
    "22": "Fertilizers", "23": "Chemical products", "24": "Plastics/rubber",
    "25": "Logs/lumber", "26": "Wood products", "27": "Pulp/paper",
    "28": "Paper articles", "29": "Printed products", "30": "Textiles/leather",
    "31": "Nonmetal mineral products", "32": "Base metals", "33": "Metal articles",
    "34": "Machinery", "35": "Electronics", "36": "Motorized vehicles",
    "37": "Transport equipment", "38": "Precision instruments", "39": "Furniture",
    "40": "Misc mfg products", "41": "Waste/scrap", "43": "Mixed freight",
}

# TX zone-to-corridor mapping (maps FAF O-D pairs to our route corridors)
ZONE_TO_CORRIDOR = {
    ("481", "482"): "I-45",   # DFW → Houston
    ("482", "481"): "I-45",   # Houston → DFW
    ("481", "483"): "I-35",   # DFW → San Antonio
    ("483", "481"): "I-35",
    ("481", "488"): "I-35",   # DFW → Laredo
    ("488", "481"): "I-35",
    ("481", "484"): "I-35",   # DFW → Austin
    ("484", "481"): "I-35",
    ("482", "483"): "I-10",   # Houston → San Antonio
    ("483", "482"): "I-10",
    ("481", "487"): "I-20",   # DFW → El Paso
    ("487", "481"): "I-20",
    ("489", "489"): "Permian", # Intra-Rest-of-TX (includes Permian)
}

FORECAST_YEARS = [2024, 2030, 2035, 2040, 2045, 2050]
ALL_YEARS = list(range(2017, 2025)) + [2030, 2035, 2040, 2045, 2050]


class FAF5Client:
    """Client for querying FAF5 freight flow data."""

    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.db_path = data_dir / "faf5.db"
        self._ensure_db()

    def _ensure_db(self):
        """Check if SQLite DB exists. If not, check for CSV and ingest."""
        if self.db_path.exists():
            return
        csv_path = self._find_csv()
        if csv_path:
            self._ingest_csv(csv_path)

    def _find_csv(self) -> Optional[Path]:
        """Look for FAF5 CSV file in data directory."""
        for pattern in ["FAF5*.csv", "faf5*.csv"]:
            files = list(self.data_dir.glob(pattern))
            if files:
                return files[0]
        return None

    def _ingest_csv(self, csv_path: Path):
        """Load FAF5 CSV into SQLite, filtering for Texas zones only."""
        tx_zones = {"481", "482", "483", "484", "485", "486", "487", "488", "489"}
        conn = sqlite3.connect(str(self.db_path))
        cur = conn.cursor()

        cur.execute("""
            CREATE TABLE IF NOT EXISTS flows (
                dms_orig TEXT, dms_dest TEXT, sctg2 TEXT,
                dms_mode TEXT, trade_type TEXT,
                tons REAL, value REAL, year INTEGER
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_orig_dest ON flows(dms_orig, dms_dest)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_mode ON flows(dms_mode)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_year ON flows(year)")

        batch = []
        with open(csv_path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                orig = row.get("dms_orig", "").strip()
                dest = row.get("dms_dest", "").strip()
                if orig not in tx_zones and dest not in tx_zones:
                    continue

                sctg = row.get("sctg2", "").strip()
                mode = row.get("dms_mode", "").strip()
                trade = row.get("trade_type", "").strip()

                for yr in ALL_YEARS:
                    tons_key = f"tons_{yr}"
                    val_key = f"value_{yr}"
                    tons = float(row.get(tons_key, 0) or 0)
                    value = float(row.get(val_key, 0) or 0)
                    if tons > 0 or value > 0:
                        batch.append((orig, dest, sctg, mode, trade, tons, value, yr))

                if len(batch) >= 10000:
                    cur.executemany("INSERT INTO flows VALUES (?,?,?,?,?,?,?,?)", batch)
                    batch = []

        if batch:
            cur.executemany("INSERT INTO flows VALUES (?,?,?,?,?,?,?,?)", batch)

        conn.commit()
        conn.close()
        print(f"Ingested FAF5 data from {csv_path} into {self.db_path}")

    def _query(self, sql: str, params: tuple = ()) -> list[dict]:
        if not self.db_path.exists():
            return [{"error": "FAF5 database not found. Place FAF5.7.1 CSV in data/faf5/ and restart."}]
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute(sql, params)
        results = [dict(row) for row in cur.fetchall()]
        conn.close()
        return results

    def query_flows(self, origin: str, dest: str, mode: str = "Truck", year: int = 2024) -> list[dict]:
        mode_code = MODE_REVERSE.get(mode, "1")
        rows = self._query(
            "SELECT sctg2, SUM(tons) as total_tons, SUM(value) as total_value "
            "FROM flows WHERE dms_orig=? AND dms_dest=? AND dms_mode=? AND year=? "
            "GROUP BY sctg2 ORDER BY total_tons DESC",
            (origin, dest, mode_code, year),
        )
        for row in rows:
            row["commodity_name"] = SCTG_CODES.get(row["sctg2"], "Unknown")
            row["total_tons_display"] = f"{row['total_tons']:,.0f} thousand tons"
            row["total_value_display"] = f"${row['total_value']:,.0f}M"
        return rows

    def top_commodities(self, origin: str, dest: str, year: int = 2024, limit: int = 10) -> list[dict]:
        mode_code = MODE_REVERSE.get("Truck", "1")
        rows = self._query(
            "SELECT sctg2, SUM(tons) as total_tons, SUM(value) as total_value "
            "FROM flows WHERE dms_orig=? AND dms_dest=? AND dms_mode=? AND year=? "
            "GROUP BY sctg2 ORDER BY total_tons DESC LIMIT ?",
            (origin, dest, mode_code, year, limit),
        )
        for row in rows:
            row["commodity_name"] = SCTG_CODES.get(row["sctg2"], "Unknown")
        return rows

    def tonnage_forecast(self, origin: str, dest: str, mode: str = "Truck") -> list[dict]:
        mode_code = MODE_REVERSE.get(mode, "1")
        rows = self._query(
            "SELECT year, SUM(tons) as total_tons, SUM(value) as total_value "
            "FROM flows WHERE dms_orig=? AND dms_dest=? AND dms_mode=? "
            "AND year IN (2017,2018,2019,2020,2021,2022,2023,2024,2030,2035,2040,2045,2050) "
            "GROUP BY year ORDER BY year",
            (origin, dest, mode_code),
        )
        return rows
