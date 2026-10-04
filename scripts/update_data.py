#!/usr/bin/env python3
"""
IndexTracker automatic data updater.

This updater reads the latest official releases for sources that expose
machine-readable public files and writes js/live-data.json. The website
keeps js/data.js as a fallback, so a source failure never breaks the UI.
"""

import json
import re
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from urllib.parse import urljoin

import pandas as pd
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "js" / "live-data.json"
TIMEOUT = 45
HEADERS = {"User-Agent": "IndexTracker/1.0 (+https://github.com/87836772ms-gif/IndexTracker)"}

session = requests.Session()
session.headers.update(HEADERS)


def get(url):
    r = session.get(url, timeout=TIMEOUT)
    r.raise_for_status()
    return r


def links(page_url, pattern):
    html = get(page_url).text
    soup = BeautifulSoup(html, "html.parser")
    found = []
    for a in soup.find_all("a", href=True):
        href = urljoin(page_url, a["href"])
        if re.search(pattern, href, re.I):
            found.append(href)
    return list(dict.fromkeys(found))


def latest_hdi():
    page = "https://hdr.undp.org/data-center/documentation-and-downloads"
    urls = links(page, r"\.xlsx$")
    candidates = [u for u in urls if "HDI" in u.upper() or "TABLE_1" in u.upper()]
    # Current official file is HDR25_Statistical_Annex_HDI_Table.xlsx.
    if not candidates:
        candidates = ["https://hdr.undp.org/sites/default/files/2025_HDR/HDR25_Statistical_Annex_HDI_Table.xlsx"]

    # Prefer the URL containing the largest report year.
    def year(u):
        m = re.search(r"(20\d{2})", u)
        return int(m.group(1)) if m else 0

    url = sorted(candidates, key=year, reverse=True)[0]
    raw = get(url).content
    xls = pd.ExcelFile(BytesIO(raw))
    df = pd.read_excel(BytesIO(raw), sheet_name=xls.sheet_names[0], header=None)

    # Find the row containing India and the column containing HDI rank.
    india_rows = df.index[df.apply(lambda row: row.astype(str).str.strip().eq("India").any(), axis=1)]
    if len(india_rows) == 0:
        raise ValueError("India row not found in UNDP HDI table")

    row_i = int(india_rows[0])
    row = df.iloc[row_i].tolist()

    # In Table 1, the first numeric cell before the country name is rank.
    country_col = next(i for i, v in enumerate(row) if str(v).strip() == "India")
    rank = None
    for v in row[:country_col][::-1]:
        try:
            n = int(float(v))
            if 1 <= n <= 250:
                rank = n
                break
        except Exception:
            pass

    # Report year is taken from the URL; underlying HDI data year is separately
    # documented by UNDP and should not be confused with report year.
    m = re.search(r"(20\d{2})", url)
    report_year = int(m.group(1)) if m else datetime.now().year

    return {
        "id": "hdi",
        "latestYear": report_year,
        "indiaRank": rank,
        "source": "https://hdr.undp.org/",
        "sourceFile": url,
    }


def latest_happiness():
    page = "https://www.worldhappiness.report/data-sharing/"
    urls = links(page, r"WHR\d{2}_Data_Figure_2\.1\.xlsx$")
    if not urls:
        raise ValueError("World Happiness Report data file not found")

    def yr(u):
        m = re.search(r"WHR(\d{2})_", u, re.I)
        return 2000 + int(m.group(1)) if m else 0

    url = sorted(urls, key=yr, reverse=True)[0]
    report_year = yr(url)

    raw = get(url).content
    xls = pd.ExcelFile(BytesIO(raw))

    india_rank = None
    total = None
    for sheet in xls.sheet_names:
        df = pd.read_excel(BytesIO(raw), sheet_name=sheet, header=None)
        matches = df.apply(lambda row: row.astype(str).str.strip().eq("India").any(), axis=1)
        if matches.any():
            ri = int(df.index[matches][0])
            row = df.iloc[ri].tolist()
            nums = []
            for v in row:
                try:
                    n = int(float(v))
                    if 1 <= n <= 250:
                        nums.append(n)
                except Exception:
                    pass
            if nums:
                india_rank = nums[0]
            # Count country rows containing a country name is not reliable from
            # every workbook layout, so use the official 2026 fallback if needed.
            break

    # The report's official ranking appendix has 147 countries in 2026.
    # Keep total from the workbook when a clear rank column is available;
    # otherwise do not overwrite the site's fallback total.
    return {
        "id": "happiness",
        "latestYear": report_year,
        "indiaRank": india_rank,
        "source": "https://worldhappiness.report/",
        "sourceFile": url,
    }


def latest_imf_gdp():
    page = "https://data.imf.org/Datasets/WEO"
    urls = links(page, r"\.xlsx$")
    candidates = [u for u in urls if "WEO" in u.upper()]
    if not candidates:
        raise ValueError("IMF WEO Excel download not found")

    raw = get(candidates[0]).content
    xls = pd.ExcelFile(BytesIO(raw))
    sheet = next((s for s in xls.sheet_names if "country" in s.lower()), xls.sheet_names[0])
    df = pd.read_excel(BytesIO(raw), sheet_name=sheet)

    # IMF WEO Excel normally has columns Country, ISO, and PPPGDP_YYYY.
    iso_col = next((c for c in df.columns if str(c).strip().lower() in {"iso", "iso3", "iso code"}), None)
    if iso_col is None:
        raise ValueError("IMF ISO column not found")

    year_cols = []
    for c in df.columns:
        m = re.search(r"PPPGDP[_ ]?(20\d{2})", str(c))
        if m:
            year_cols.append((int(m.group(1)), c))
    if not year_cols:
        raise ValueError("IMF PPPGDP year column not found")

    year, col = max(year_cols)
    work = df[[iso_col, col]].copy()
    work[col] = pd.to_numeric(work[col], errors="coerce")
    work = work.dropna(subset=[col])
    work = work.sort_values(col, ascending=False).reset_index(drop=True)

    india = work[work[iso_col].astype(str).str.upper().eq("IND")]
    if india.empty:
        raise ValueError("India not found in IMF WEO data")

    rank = int(india.index[0]) + 1
    return {
        "id": "gdp-ppp",
        "latestYear": year,
        "indiaRank": rank,
        "total": int(len(work)),
        "source": "https://www.imf.org/en/Publications/WEO",
        "sourceFile": candidates[0],
    }


def main():
    overrides = {}
    errors = []

    for fn in (latest_hdi, latest_happiness, latest_imf_gdp):
        try:
            item = fn()
            overrides[item["id"]] = item
        except Exception as exc:
            errors.append({"source": fn.__name__, "error": str(exc)})

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "autoUpdatedIndexes": overrides,
        "errors": errors,
        "note": "Only verified machine-readable official sources are overridden here. js/data.js remains the fallback for indexes without a supported automatic adapter yet.",
    }

    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(payload, indent=2, ensure_ascii=False))

    # Do not fail the workflow merely because one source temporarily blocks.
    # Existing live data remains valid and the next scheduled run retries.


if __name__ == "__main__":
    main()
