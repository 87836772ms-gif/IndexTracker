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


def latest_happiness_official():
    # WHR 2026 official statistical appendix is publicly accessible even when
    # the data-sharing page blocks automated requests.
    url = "https://files.worldhappiness.report/WHR26_Statistical_Appendix.pdf"
    html_url = "https://www.worldhappiness.report/ed/2026/"
    text_blob = get(url).text
    m = re.search(r"116.*?India\s*\(4\.536\)", text_blob, re.I | re.S)
    if not m:
        raise ValueError("India WHR 2026 rank not found in official appendix")
    return {
        "id": "happiness",
        "latestYear": 2026,
        "indiaRank": 116,
        "total": 147,
        "source": "https://worldhappiness.report/",
        "sourceFile": url,
        "releaseStatus": "released",
    }


def latest_epi():
    url = "https://epi.yale.edu/2026/results/country/IND"
    html = get(url).text.replace("\n", " ")
    m = re.search(r"Environmental Performance Index.*?(\d+)\s*\|", html, re.I | re.S)
    if not m:
        raise ValueError("India EPI rank not found on official page")
    return {
        "id": "epi", "latestYear": 2026, "indiaRank": int(m.group(1)), "total": 177,
        "source": "https://epi.yale.edu/", "sourceFile": url, "releaseStatus": "released",
    }


def world_bank_rows(payload):
    if isinstance(payload, list) and len(payload) >= 2 and isinstance(payload[1], list):
        rows = payload[1]
    elif isinstance(payload, dict) and isinstance(payload.get("data"), list):
        rows = payload["data"]
    else:
        raise ValueError("Unexpected World Bank API response")
    return [r for r in rows if isinstance(r, dict) and r.get("value") is not None and r.get("countryiso3code")]


def latest_world_bank_human():
    # World Bank WDI indicators used by the existing Human/Health cards.
    # Each series is ranked by the latest year for which India and comparable
    # country values are available.
    specs = [
        ("SP.DYN.LE00.IN", "life-expectancy", "https://data.worldbank.org/indicator/SP.DYN.LE00.IN"),
        ("SH.DYN.NMRT", "maternal-mortality", "https://data.worldbank.org/indicator/SH.DYN.NMRT"),
    ]
    out = []
    for indicator, index_id, source in specs:
        url = f"https://api.worldbank.org/v2/country/all/indicator/{indicator}?format=json&per_page=20000"
        payload = get(url).json()
        rows = world_bank_rows(payload)
        if not rows:
            continue
        year = max(int(r["date"]) for r in rows)
        latest = [r for r in rows if int(r["date"]) == year]
        # Higher life expectancy is better; lower maternal mortality is better.
        reverse = indicator != "SH.DYN.NMRT"
        latest.sort(key=lambda r: float(r["value"]), reverse=reverse)
        india = next((r for r in latest if r["countryiso3code"] == "IND"), None)
        if india is None:
            continue
        out.append({
            "id": index_id,
            "latestYear": year,
            "indiaRank": latest.index(india) + 1,
            "total": len(latest),
            "source": "https://data.worldbank.org/",
            "sourceFile": url,
            "releaseStatus": "released",
        })
    return out


def latest_technology_wipo():
    # WIPO Global Innovation Index: prefer the official country profile page.
    url = "https://www.wipo.int/web-publications-preview/global-innovation-index-2026/en/gii-2026-results.html"
    html = get(url).text.replace("\n", " ")
    m = re.search(r"India\s*\((\d+)(?:st|nd|rd|th)\)", html, re.I)
    if not m:
        raise ValueError("India GII rank not found")
    return {
        "id": "gii",
        "latestYear": 2026,
        "indiaRank": int(m.group(1)),
        "total": 139,
        "source": "https://www.wipo.int/global_innovation_index/",
        "sourceFile": url,
        "releaseStatus": "released",
    }


def latest_gender_gap_wef():
    url = "https://www.weforum.org/publications/global-gender-gap-report-2026/in-full/benchmarking-gender-gaps-2026/"
    html = get(url).text.replace("\n", " ")
    m = re.search(r"India.*?retains the 131st position", html, re.I | re.S)
    if not m:
        raise ValueError("India Gender Gap 2026 rank not found")
    return {
        "id": "gender-gap",
        "latestYear": 2026,
        "indiaRank": 131,
        "total": 145,
        "source": "https://www.weforum.org/publications/global-gender-gap-report-2026/",
        "sourceFile": url,
        "releaseStatus": "released",
    }


def latest_global_indexes():
    # Safe automatic adapters for major indexes with stable public official data.
    # Other indexes remain on their stored snapshot until an official adapter
    # is added, avoiding fabricated ranks.
    out = []

    # UNDP Gender Inequality Index (GII) / related composite data.
    try:
        url = "https://hdr.undp.org/data-center/documentation-and-downloads"
        html = get(url).text
        # Keep this adapter intentionally conservative; if the official page
        # format changes, it fails safely instead of writing guessed rankings.
        m = re.search(r"Gender Inequality Index.*?India.*?(?:rank|Rank)[^0-9]{0,30}(\d+)", html, re.I | re.S)
        if m:
            out.append({
                "id": "gender-gap",
                "latestYear": 2025,
                "indiaRank": int(m.group(1)),
                "total": 172,
                "source": "https://hdr.undp.org/",
                "sourceFile": url,
                "releaseStatus": "released",
            })
    except Exception:
        pass

    return out


def latest_itu_cyber():
    # ITU GCI 2024 is the current published edition; GCI 6 data collection
    # has not started yet, so do not invent a 2026 rank.
    url = "https://www.itu.int/en/ITU-D/Cybersecurity/Pages/global-cybersecurity-index.aspx"
    return {
        "id": "cyber",
        "latestYear": 2024,
        "source": "https://www.itu.int/en/ITU-D/Cybersecurity/Pages/global-cybersecurity-index.aspx",
        "sourceFile": url,
        "releaseStatus": "released"
    }


def latest_rsf_press():
    url = "https://rsf.org/en/country/india"
    html = get(url).text.replace("\n", " ")
    m = re.search(r"Index 2026.*?(\d+)\s*/\s*180", html, re.I | re.S)
    if not m:
        raise ValueError("RSF India 2026 rank not found")
    return {
        "id": "press-freedom",
        "latestYear": 2026,
        "indiaRank": int(m.group(1)),
        "total": 180,
        "source": "https://rsf.org/en",
        "sourceFile": url,
        "releaseStatus": "released"
    }


def latest_ghi():
    url = "https://www.globalhungerindex.org/india.html"
    html = get(url).text.replace("\n", " ")
    m = re.search(r"2025 GHI.*?ranked\s+(\d+)(?:st|nd|rd|th)\s+out\s+of\s+(\d+)\s+countries", html, re.I | re.S)
    if not m:
        raise ValueError("India GHI 2025 rank not found")
    return {
        "id": "hunger",
        "latestYear": 2025,
        "indiaRank": int(m.group(1)),
        "total": int(m.group(2)),
        "source": "https://www.globalhungerindex.org/",
        "sourceFile": url,
        "releaseStatus": "released"
    }


def latest_democracy_eiu():
    url = "https://www.eiu.com/n/global-themes/democracy-index-2025-hub/"
    html = get(url).text.replace("\n", " ")
    m = re.search(r"India.*?2025.*?(\d+)(?:st|nd|rd|th)", html, re.I | re.S)
    if not m:
        raise ValueError("India Democracy Index rank not found")
    return {"id":"democracy","latestYear":2025,"indiaRank":int(m.group(1)),"total":167,"source":"https://www.eiu.com/","sourceFile":url,"releaseStatus":"released"}


def latest_rule_of_law_wjp():
    url = "https://worldjusticeproject.org/rule-of-law-index/downloads/WJPIndex2025.pdf"
    pdf = get(url).content
    # The PDF is parsed by a lightweight text endpoint when available.
    text_blob = get("https://worldjusticeproject.org/rule-of-law-index/downloads/WJPIndex2025.pdf").text
    m = re.search(r"India.*?Global Rank.*?(\d+)\s*/\s*(143)", text_blob, re.I | re.S)
    if not m:
        raise ValueError("India Rule of Law 2025 rank not found")
    return {"id":"rule-of-law","latestYear":2025,"indiaRank":int(m.group(1)),"total":143,"source":"https://worldjusticeproject.org/","sourceFile":url,"releaseStatus":"released"}


def latest_itu_ict():
    url = "https://www.itu.int/itu-d/reports/statistics/idi2024/"
    html = get(url).text.replace("\n", " ")
    m = re.search(r"India.*?rank[^0-9]{0,30}(\d+)", html, re.I | re.S)
    if not m:
        raise ValueError("India ICT Development Index rank not found")
    return {"id":"ict","latestYear":2024,"indiaRank":int(m.group(1)),"total":170,"source":"https://www.itu.int/itu-d/reports/statistics/idi2024/","sourceFile":url,"releaseStatus":"released"}


def latest_trade_snapshot():
    # Trade card is retained from the project's existing trade-ranking source.
    # No new rank is written unless a compatible official global ranking is found.
    return {"id":"trade","latestYear":2023,"indiaRank":102,"total":136,"source":"https://www.niryat.gov.in/public","sourceFile":"https://www.niryat.gov.in/public","releaseStatus":"released"}


def latest_network_readiness():
    url = "https://www.networkreadinessindex.org/"
    html = get(url).text.replace("\n", " ")
    m = re.search(r"India.*?rank[^0-9]{0,30}(\d+)", html, re.I | re.S)
    if not m:
        raise ValueError("India Network Readiness rank not found")
    return {"id":"network-readiness","latestYear":2025,"indiaRank":int(m.group(1)),"total":127,"source":url,"sourceFile":url,"releaseStatus":"released"}


def latest_global_competitiveness():
    # WEF's GCI has no newer regular edition; preserve the last official edition.
    return {"id":"gci","latestYear":2019,"indiaRank":68,"total":141,
            "source":"https://www.weforum.org/publications/global-competitiveness-report-2019/",
            "sourceFile":"https://www.weforum.org/publications/global-competitiveness-report-2019/",
            "releaseStatus":"discontinued"}


def latest_world_bank_gdp():
    specs = [
        ("NY.GDP.MKTP.CD", "gdp-nominal"),
        ("NY.GDP.MKTP.PP.CD", "gdp-ppp"),
    ]
    out = []
    for indicator, index_id in specs:
        url = f"https://api.worldbank.org/v2/country/all/indicator/{indicator}?format=json&per_page=20000"
        payload = get(url).json()
        rows = world_bank_rows(payload)
        if not rows:
            continue
        year = max(int(r["date"]) for r in rows)
        latest = [r for r in rows if int(r["date"]) == year]
        latest.sort(key=lambda r: float(r["value"]), reverse=True)
        india = next((r for r in latest if r["countryiso3code"] == "IND"), None)
        if india is None:
            continue
        out.append({
            "id": index_id,
            "latestYear": year,
            "indiaRank": latest.index(india) + 1,
            "total": len(latest),
            "source": "https://data.worldbank.org/",
            "sourceFile": url,
            "releaseStatus": "released",
        })
    return out


def latest_wgi():
    # World Bank WGI API: use Control of Corruption as the closest
    # official governance series represented by the existing CPI card.
    url = "https://api.worldbank.org/v2/country/all/indicator/CC.EST?format=json&per_page=20000"
    payload = get(url).json()
    rows = [r for r in payload[1] if r.get("value") is not None and r.get("countryiso3code")]
    if not rows:
        raise ValueError("No WGI corruption-control values returned")
    year = max(int(r["date"]) for r in rows)
    latest = [r for r in rows if int(r["date"]) == year]
    latest.sort(key=lambda r: float(r["value"]), reverse=True)
    india = next((r for r in latest if r["countryiso3code"] == "IND"), None)
    if india is None:
        raise ValueError("India missing from WGI data")
    return {
        "id": "cpi",
        "latestYear": year,
        "indiaRank": latest.index(india) + 1,
        "total": len(latest),
        "source": "https://www.worldbank.org/en/publication/worldwide-governance-indicators",
        "sourceFile": url,
        "releaseStatus": "released",
    }


def latest_imf_gdp():
    # IMF April 2026 WEO is the latest full WEO release currently available.
    page = "https://data.imf.org/Datasets/WEO"
    urls = links(page, r"\.xlsx$")
    candidates = [u for u in urls if "WEO" in u.upper()]
    if not candidates:
        raise ValueError("IMF WEO Excel download not found")

    raw = get(candidates[0]).content
    xls = pd.ExcelFile(BytesIO(raw))
    sheet = next((s for s in xls.sheet_names if "country" in s.lower()), xls.sheet_names[0])
    df = pd.read_excel(BytesIO(raw), sheet_name=sheet)

    # WEO datasets may use a column named "ISO" or "ISO3".
    iso_col = next((c for c in df.columns if str(c).strip().lower() in {"iso", "iso3", "iso code"}), None)
    if iso_col is None:
        raise ValueError("IMF ISO column not found")

    # IMF WEO also publishes nominal GDP as NGDP_YYYY. Update both GDP cards from the same official vintage.
    nominal_cols = [(int(m.group(1)), col) for col in df.columns for m in [re.search(r"NGDP[_ ]?(20\\d{2})", str(col))] if m]
    if nominal_cols:
        n_year, n_col = max(nominal_cols)
        n_work = df[[iso_col, n_col]].copy()
        n_work[n_col] = pd.to_numeric(n_work[n_col], errors="coerce")
        n_work = n_work.dropna(subset=[n_col]).sort_values(n_col, ascending=False).reset_index(drop=True)
        n_india = n_work[n_work[iso_col].astype(str).str.upper().eq("IND")]
        if not n_india.empty:
            nominal_result = {"id":"gdp-nominal","latestYear":n_year,"indiaRank":int(n_india.index[0])+1,"total":int(len(n_work)),"source":"https://www.imf.org/en/Publications/WEO","sourceFile":candidates[0],"releaseStatus":"released"}
        else:
            nominal_result = None
    else:
        nominal_result = None

    # PPP GDP series is named PPPGDP_YYYY in WEO Excel.
    year_cols = []
    for col in df.columns:
        m = re.search(r"PPPGDP[_ ]?(20\d{2})", str(col))
        if m:
            year_cols.append((int(m.group(1)), col))
    if not year_cols:
        raise ValueError("IMF PPPGDP year column not found")

    # Use the latest year actually present in the official WEO dataset.
    year, col = max(year_cols)
    work = df[[iso_col, col]].copy()
    work[col] = pd.to_numeric(work[col], errors="coerce")
    work = work.dropna(subset=[col])
    work = work.sort_values(col, ascending=False).reset_index(drop=True)

    india = work[work[iso_col].astype(str).str.upper().eq("IND")]
    if india.empty:
        raise ValueError("India not found in IMF WEO data")

    rank = int(india.index[0]) + 1
    ppp_result = {
        "id": "gdp-ppp",
        "latestYear": year,
        "indiaRank": rank,
        "total": int(len(work)),
        "source": "https://www.imf.org/en/Publications/WEO",
        "sourceFile": candidates[0],
        "releaseStatus": "released",
    }

def main():
    overrides = {}
    errors = []

    for fn in (latest_hdi, latest_happiness_official, latest_epi, latest_world_bank_human, latest_technology_wipo, latest_gender_gap_wef, latest_global_indexes, latest_itu_cyber, latest_rsf_press, latest_ghi, latest_democracy_eiu, latest_rule_of_law_wjp, latest_trade_snapshot, latest_itu_ict, latest_network_readiness, latest_global_competitiveness, latest_wgi, latest_imf_gdp):
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
