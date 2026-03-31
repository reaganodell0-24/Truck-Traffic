"""BTS TransBorder Freight Data — Socrata API client.

Queries the BTS data.bts.gov Socrata API for near-real-time cross-border
freight data by port, mode, commodity, and time period.

Relevant for: Laredo, El Paso, Hidalgo TX border corridors
Dashboard: https://data.bts.gov/stories/s/Dashboard/myhq-rm6q

Key Socrata datasets on data.bts.gov:
  - TransBorder Freight (monthly, by port/mode/commodity)
  - Border Crossing Data (monthly truck crossing counts)

API docs: https://dev.socrata.com/foundry/data.bts.gov/{dataset-id}
Auth: Free app token from data.bts.gov, or unauthenticated (throttled to 1000 req/hr)
"""

import httpx
from typing import Optional


# Known Socrata dataset IDs for BTS freight data
# These may need updating — verify at https://data.bts.gov/browse
DATASETS = {
    "transborder": "yri4-wfni",          # TransBorder Freight Data
    "border_crossing": "keg4-3bc2",       # Border Crossing/Entry Data
}

BASE_URL = "https://data.bts.gov/resource"

# Texas border ports of interest for autonomous trucking corridors
TX_BORDER_PORTS = [
    "Laredo",        # #1 US inland port, I-35 corridor → Dallas
    "El Paso",       # I-10/I-20 corridor → Fort Worth / Phoenix
    "Hidalgo",       # Rio Grande Valley
    "Eagle Pass",    # Rail + truck
    "Brownsville",   # Southernmost TX
]


class TransBorderClient:
    """Client for BTS TransBorder Freight API via Socrata."""

    def __init__(self, app_token: Optional[str] = None):
        """
        Args:
            app_token: Socrata app token for higher rate limits.
                       Get one free at https://data.bts.gov/profile/edit/developer_settings
                       Without token: 1,000 requests/hour. With token: much higher.
        """
        self.app_token = app_token
        self.headers = {}
        if app_token:
            self.headers["X-App-Token"] = app_token

    def _get(self, dataset_key: str, params: dict) -> list[dict]:
        """Execute a SoQL query against a Socrata dataset."""
        dataset_id = DATASETS.get(dataset_key, dataset_key)
        url = f"{BASE_URL}/{dataset_id}.json"

        try:
            with httpx.Client(timeout=30) as client:
                resp = client.get(url, params=params, headers=self.headers)
                resp.raise_for_status()
                return resp.json()
        except httpx.HTTPError as e:
            return [{"error": str(e), "hint": "Check dataset ID and query syntax"}]

    def monthly_by_port(
        self,
        port: str = "Laredo",
        mode: Optional[str] = "Truck",
        year: Optional[int] = 2025,
        limit: int = 100,
    ) -> list[dict]:
        """
        Monthly freight value at a border port by mode.
        Returns monthly totals useful for trend analysis.
        """
        where_clauses = [f"port LIKE '%{port}%'"]
        if year:
            where_clauses.append(f"year = '{year}'")
        if mode:
            where_clauses.append(f"measure LIKE '%{mode}%'")

        params = {
            "$where": " AND ".join(where_clauses),
            "$order": "year DESC, month DESC",
            "$limit": limit,
        }
        return self._get("transborder", params)

    def top_commodities_by_port(
        self,
        port: str = "Laredo",
        year: Optional[int] = 2025,
        limit: int = 20,
    ) -> list[dict]:
        """Top commodities by value at a border crossing."""
        where_clauses = [f"port LIKE '%{port}%'"]
        if year:
            where_clauses.append(f"year = '{year}'")

        params = {
            "$select": "commodity, commodity2, SUM(value) as total_value",
            "$where": " AND ".join(where_clauses),
            "$group": "commodity, commodity2",
            "$order": "total_value DESC",
            "$limit": limit,
        }
        return self._get("transborder", params)

    def truck_crossings_by_port(
        self,
        port: str = "Laredo",
        year: Optional[int] = 2025,
    ) -> list[dict]:
        """Monthly truck crossing counts at a border port."""
        where_clauses = [
            f"port_name LIKE '%{port}%'",
            "measure = 'Trucks'",
        ]
        if year:
            where_clauses.append(f"date >= '{year}-01-01'")
            where_clauses.append(f"date < '{year + 1}-01-01'")

        params = {
            "$where": " AND ".join(where_clauses),
            "$order": "date DESC",
            "$limit": 50,
        }
        return self._get("border_crossing", params)

    def annual_summary(self, year: int = 2024) -> list[dict]:
        """
        Annual freight summary across all TX border ports.
        Useful for the dashboard overview.
        """
        params = {
            "$select": "port, measure, SUM(value) as total_value",
            "$where": f"year = '{year}' AND state = 'Texas'",
            "$group": "port, measure",
            "$order": "total_value DESC",
            "$limit": 200,
        }
        return self._get("transborder", params)
