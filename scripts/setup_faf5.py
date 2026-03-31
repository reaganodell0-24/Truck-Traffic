"""Download and prepare FAF5 data for the TX AV Routes database.

Run this once to fetch the FAF5.7.1 regional CSV from BTS and set up the SQLite DB.

Usage:
    python scripts/setup_faf5.py

The script will:
1. Download FAF5.7.1.zip from BTS (~100MB compressed, ~350MB uncompressed)
2. Extract the CSV to data/faf5/
3. Trigger SQLite ingestion (filters for Texas zones only, ~5-10MB DB)
"""

import os
import sys
import zipfile
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

FAF5_URL = "https://faf.ornl.gov/faf5/data/download_files/FAF5.7.1.zip"
DATA_DIR = Path(__file__).parent.parent / "data" / "faf5"


def download_faf5():
    """Download FAF5.7.1 regional database ZIP."""
    import httpx

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = DATA_DIR / "FAF5.7.1.zip"

    if zip_path.exists():
        print(f"ZIP already exists: {zip_path}")
    else:
        print(f"Downloading FAF5.7.1 from {FAF5_URL}...")
        print("This is ~100MB, may take a few minutes...")
        with httpx.Client(timeout=300, follow_redirects=True) as client:
            resp = client.get(FAF5_URL)
            resp.raise_for_status()
            zip_path.write_bytes(resp.content)
        print(f"Downloaded to {zip_path} ({zip_path.stat().st_size / 1_000_000:.1f} MB)")

    # Extract
    csv_files = list(DATA_DIR.glob("FAF5*.csv"))
    if csv_files:
        print(f"CSV already extracted: {csv_files[0]}")
    else:
        print("Extracting ZIP...")
        with zipfile.ZipFile(zip_path) as zf:
            zf.extractall(DATA_DIR)
        csv_files = list(DATA_DIR.glob("FAF5*.csv"))
        if csv_files:
            print(f"Extracted: {csv_files[0]}")
        else:
            print("WARNING: No CSV found after extraction. Check ZIP contents.")
            return

    return csv_files[0] if csv_files else None


def build_sqlite():
    """Trigger FAF5 SQLite ingestion."""
    from api.faf5_client import FAF5Client

    print("Building SQLite database (Texas zones only)...")
    client = FAF5Client(DATA_DIR)

    if client.db_path.exists():
        size_mb = client.db_path.stat().st_size / 1_000_000
        print(f"Database ready: {client.db_path} ({size_mb:.1f} MB)")
    else:
        print("ERROR: Database was not created. Check CSV file location.")


def verify():
    """Quick verification that the data loaded correctly."""
    from api.faf5_client import FAF5Client

    client = FAF5Client(DATA_DIR)
    # Test: DFW → Houston, Truck, 2024
    results = client.query_flows(origin="481", dest="482", mode="Truck", year=2024)
    if results and "error" not in results[0]:
        total_tons = sum(r.get("total_tons", 0) for r in results)
        print(f"\nVerification: DFW→Houston truck flows (2024)")
        print(f"  Commodities found: {len(results)}")
        print(f"  Total tonnage: {total_tons:,.0f} thousand tons")
        print(f"  Top 3 commodities:")
        for r in results[:3]:
            print(f"    {r['commodity_name']}: {r['total_tons']:,.0f}K tons (${r['total_value']:,.0f}M)")
    else:
        print(f"\nVerification result: {results}")


if __name__ == "__main__":
    print("=" * 60)
    print("FAF5 Data Setup for TX AV Routes Database")
    print("=" * 60)

    csv_path = download_faf5()
    if csv_path:
        build_sqlite()
        verify()

    print("\nDone. You can now start the API with: uvicorn api.main:app --reload")
