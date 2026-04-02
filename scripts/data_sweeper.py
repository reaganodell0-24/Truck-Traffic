"""Weekly data sweeper — checks external sources for new data.

Run manually or schedule weekly:
    python scripts/data_sweeper.py

On Windows, schedule via Task Scheduler:
    Action: python
    Arguments: scripts/data_sweeper.py (run from project root)
    Trigger: Weekly (e.g. every Monday 8:00 AM)
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import httpx

STATUS_FILE = Path(__file__).parent.parent / "data" / "sweeper_status.json"

# BTS Socrata endpoints
BORDER_CROSSING_ID = "keg4-3bc2"
TRANSBORDER_FREIGHT_ID = "yri4-wfni"
BTS_BASE = "https://data.bts.gov/resource"


def load_previous_status() -> dict:
    if STATUS_FILE.exists():
        with open(STATUS_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {}


def check_border_crossings(prev: dict) -> dict:
    """Check BTS border crossing dataset for latest available date."""
    print("Checking Border Crossings (keg4-3bc2)...")
    try:
        url = f"{BTS_BASE}/{BORDER_CROSSING_ID}.json"
        params = {
            "$select": "date",
            "$order": "date DESC",
            "$limit": "1",
        }
        with httpx.Client(timeout=30) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        if data and "date" in data[0]:
            latest = data[0]["date"][:10]
            prev_latest = prev.get("border_crossings", {}).get("latest_date", "")
            is_new = latest != prev_latest and prev_latest != ""

            print(f"  Latest data: {latest}")
            if is_new:
                print(f"  *** NEW DATA AVAILABLE *** (was {prev_latest})")
            else:
                print(f"  No change (previously {prev_latest or 'first check'})")

            return {
                "latest_date": latest,
                "status": "current",
                "new_data_available": is_new,
                "record_count_check": len(data),
            }
        else:
            print("  WARNING: No data returned")
            return {"status": "no_data", "new_data_available": False}

    except Exception as e:
        print(f"  ERROR: {e}")
        return {"status": "error", "error": str(e), "new_data_available": False}


def check_transborder_freight(prev: dict) -> dict:
    """Check if the TransBorder freight dataset has come back online."""
    print(f"Checking TransBorder Freight ({TRANSBORDER_FREIGHT_ID})...")
    try:
        url = f"{BTS_BASE}/{TRANSBORDER_FREIGHT_ID}.json"
        params = {"$limit": "1"}
        with httpx.Client(timeout=15) as client:
            resp = client.get(url, params=params)

        if resp.status_code == 200:
            print("  *** DATASET IS BACK ONLINE ***")
            return {
                "status": "available",
                "dataset_id": TRANSBORDER_FREIGHT_ID,
                "new_data_available": True,
            }
        else:
            print(f"  Still unavailable (HTTP {resp.status_code})")
            return {
                "status": "dataset_unavailable",
                "dataset_id": TRANSBORDER_FREIGHT_ID,
                "http_status": resp.status_code,
                "new_data_available": False,
            }

    except Exception as e:
        print(f"  ERROR: {e}")
        return {
            "status": "error",
            "dataset_id": TRANSBORDER_FREIGHT_ID,
            "error": str(e),
            "new_data_available": False,
        }


def check_faf5(prev: dict) -> dict:
    """Check if a newer FAF5 version exists by probing the download URL."""
    print("Checking FAF5 version...")
    current_version = "5.7.1"

    # Check if a hypothetical FAF5.8 or FAF6 exists
    next_versions = [
        ("5.7.2", "https://faf.ornl.gov/faf5/data/download_files/FAF5.7.2.zip"),
        ("5.8", "https://faf.ornl.gov/faf5/data/download_files/FAF5.8.zip"),
        ("6.0", "https://faf.ornl.gov/faf5/data/download_files/FAF6.0.zip"),
    ]

    for version, url in next_versions:
        try:
            with httpx.Client(timeout=10, follow_redirects=False) as client:
                resp = client.head(url)
                if resp.status_code == 200:
                    print(f"  *** NEW VERSION FOUND: FAF {version} ***")
                    return {
                        "current_version": current_version,
                        "new_version": version,
                        "download_url": url,
                        "status": "update_available",
                        "new_data_available": True,
                    }
        except Exception:
            pass

    print(f"  Current version {current_version} is latest")
    return {
        "current_version": current_version,
        "status": "current",
        "new_data_available": False,
    }


def check_border_crossings_tx_summary() -> dict:
    """Get a quick summary of TX border port truck volumes for the latest month."""
    print("Fetching TX border port summary...")
    try:
        url = f"{BTS_BASE}/{BORDER_CROSSING_ID}.json"
        params = {
            "$select": "port_name, date, value",
            "$where": "state = 'Texas' AND measure = 'Trucks'",
            "$order": "date DESC",
            "$limit": "50",
        }
        with httpx.Client(timeout=30) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        if not data:
            return {"ports": {}}

        latest_date = data[0]["date"][:10]
        ports = {}
        for row in data:
            if row["date"][:10] == latest_date:
                ports[row["port_name"]] = int(row["value"])

        print(f"  Latest month: {latest_date}")
        for port, count in sorted(ports.items(), key=lambda x: -x[1]):
            print(f"    {port}: {count:,} trucks")

        return {"latest_date": latest_date, "ports": ports}

    except Exception as e:
        print(f"  ERROR: {e}")
        return {"error": str(e)}


def main():
    print("=" * 60)
    print("TX AV Routes — Data Sweeper")
    print(f"Run time: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)
    print()

    prev = load_previous_status()

    # Run all checks
    border = check_border_crossings(prev)
    print()
    transborder = check_transborder_freight(prev)
    print()
    faf5 = check_faf5(prev)
    print()
    tx_summary = check_border_crossings_tx_summary()

    # Build status
    status = {
        "last_check": datetime.now(timezone.utc).isoformat(),
        "border_crossings": border,
        "transborder_freight": transborder,
        "faf5": faf5,
        "tx_border_summary": tx_summary,
    }

    # Save
    STATUS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STATUS_FILE, "w", encoding="utf-8") as f:
        json.dump(status, f, indent=2, ensure_ascii=True)

    print()
    print(f"Status saved to: {STATUS_FILE}")

    # Summary
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    any_new = False
    for source in ["border_crossings", "transborder_freight", "faf5"]:
        info = status[source]
        new = info.get("new_data_available", False)
        if new:
            any_new = True
        marker = "*** NEW ***" if new else "OK"
        print(f"  {source}: {info.get('status', '?')} [{marker}]")

    if any_new:
        print()
        print("ACTION REQUIRED: New data is available. Restart the API to pick it up.")
    else:
        print()
        print("All data sources are current. No action needed.")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
