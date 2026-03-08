"""
MANDI GEOLOCATION PIPELINE

Steps
1. Load master.parquet
2. Extract unique (state, district, market)
3. Remove "APMC" from market names
4. Find coordinates using:

   1️⃣ Overpass API (OpenStreetMap)
   2️⃣ Nominatim geocoder
   3️⃣ Google Geocoding API (optional)
   4️⃣ District centroid fallback

5. Cache results to avoid repeated queries
6. Save results:
   - mandis_geocoded.csv
   - mandis_geocoded_failed.csv
   - dataset_with_mandi_coordinates.csv
"""

import os
import re
import time
import pickle
import requests
import pandas as pd

from tqdm import tqdm
from dotenv import load_dotenv
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError

# -------------------------------------------------
# PATH CONFIGURATION
# -------------------------------------------------

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

INPUT_PARQUET = os.path.join(
    ROOT,
    "price_prediction",
    "data",
    "raw",
    "master.parquet"
)

OUT_DIR = os.path.dirname(__file__)

OUT_CSV = os.path.join(OUT_DIR, "mandis_geocoded.csv")
OUT_FAILED = os.path.join(OUT_DIR, "mandis_geocoded_failed.csv")
OUT_MERGED = os.path.join(OUT_DIR, "dataset_with_mandi_coordinates.csv")

CACHE_FILE = os.path.join(OUT_DIR, "mandi_geocode_cache.pkl")

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

USER_AGENT = "HarvestLink/1.0 yahnaviarja@gmail.com"

SLEEP_OVERPASS = 1
SLEEP_NOMINATIM = 1.1

MAX_OVERPASS_ELEMENTS = 10

# -------------------------------------------------
# LOAD ENV VARIABLES
# -------------------------------------------------

load_dotenv(os.path.join(ROOT, ".env"))
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# -------------------------------------------------
# TEXT CLEANING
# -------------------------------------------------

def normalize_text(s):

    if pd.isna(s):
        return ""

    s = str(s).strip()
    s = re.sub(r"\s+", " ", s)

    return s

def remove_apmc(name):

    if not name:
        return name

    name = re.sub(r"\bAPMC\b", "", name, flags=re.IGNORECASE)
    name = re.sub(r"\bMarket Yard\b", "", name, flags=re.IGNORECASE)

    name = re.sub(r"[()\[\]]", "", name)

    name = re.sub(r"\s+", " ", name)

    return name.strip()

# -------------------------------------------------
# OVERPASS LOOKUP
# -------------------------------------------------

def query_overpass(market, district, state):

    m = market.replace('"', '\\"')
    d = district.replace('"', '\\"')
    s = state.replace('"', '\\"')

    query = f"""
[out:json][timeout:25];
area["name"="{s}"]->.stateArea;
area["name"="{d}"](area.stateArea)->.districtArea;

(
 node["amenity"="marketplace"]["name"~"{m}",i](area.districtArea);
 way["amenity"="marketplace"]["name"~"{m}",i](area.districtArea);
 rel["amenity"="marketplace"]["name"~"{m}",i](area.districtArea);

 node["name"~"{m}",i](area.districtArea);
 way["name"~"{m}",i](area.districtArea);
 rel["name"~"{m}",i](area.districtArea);
);

out center {MAX_OVERPASS_ELEMENTS};
"""

    try:

        r = requests.post(
            OVERPASS_URL,
            data=query,
            timeout=60,
            headers={"User-Agent": USER_AGENT}
        )

        data = r.json()
        elements = data.get("elements", [])

        if not elements:
            time.sleep(SLEEP_OVERPASS)
            return None, None

        el = elements[0]

        if "lat" in el:
            return el["lat"], el["lon"]

        if "center" in el:
            return el["center"]["lat"], el["center"]["lon"]

    except Exception as e:

        print("Overpass error:", e)

    time.sleep(SLEEP_OVERPASS)

    return None, None

# -------------------------------------------------
# NOMINATIM GEOCODER
# -------------------------------------------------

geolocator = Nominatim(user_agent=USER_AGENT)

def geocode_nominatim(market, district, state):

    queries = [

        f"{market} Agricultural Market, {district}, {state}, India",
        f"APMC {market}, {district}, {state}, India",
        f"{market} market yard, {district}, {state}, India",
        f"{market} market, {district}, {state}, India",
        f"{market}, {district}, {state}, India",
        f"{market}, {state}, India",
    ]

    for q in queries:
        try:
            location = geolocator.geocode(q)
            time.sleep(SLEEP_NOMINATIM)
            if location:
                return location.latitude, location.longitude, q
        except (GeocoderTimedOut, GeocoderServiceError):
            time.sleep(SLEEP_NOMINATIM)
    return None, None, None

# -------------------------------------------------
# GOOGLE GEOCODING
# -------------------------------------------------

def geocode_google(market, district, state):

    if not GOOGLE_API_KEY:
        return None, None, None

    queries = [

        f"{market} Agricultural Market, {district}, {state}, India",
        f"{market}, {district}, {state}, India",
        f"{market}, {state}, India",
    ]

    for q in queries:
        try:
            url = "https://maps.googleapis.com/maps/api/geocode/json"
            params = {
                "address": q,
                "key": GOOGLE_API_KEY
            }
            r = requests.get(url, params=params)
            data = r.json()
            if data["status"] == "OK":
                loc = data["results"][0]["geometry"]["location"]
                return loc["lat"], loc["lng"], q
        except Exception:
            pass
    return None, None, None

# -------------------------------------------------
# DISTRICT CENTROID
# -------------------------------------------------

district_cache = {}

def get_district_centroid(district, state):
    key = (district.lower(), state.lower())
    if key in district_cache:
        return district_cache[key]
    query = f"{district}, {state}, India"

    try:
        location = geolocator.geocode(query)
        time.sleep(SLEEP_NOMINATIM)
        if location:
            coords = (location.latitude, location.longitude)
            district_cache[key] = coords
            return coords
    except Exception:
        pass
    district_cache[key] = (None, None)
    return None, None


# -------------------------------------------------
# MAIN
# -------------------------------------------------

def main():
    print("Loading dataset...")
    df = pd.read_parquet(INPUT_PARQUET)
    print("Rows:", len(df))
    # detect columns
    cols = {c.lower(): c for c in df.columns}

    state_col = cols.get("state")
    district_col = cols.get("district")
    market_col = cols.get("market")

    if not (state_col and district_col and market_col):
        raise Exception("State/District/Market columns not found")
    
    # -------------------------------------------------
    # CLEAN ORIGINAL DATASET (FOR MERGE)
    # -------------------------------------------------

    df["_state_clean"] = df[state_col].apply(normalize_text)
    df["_district_clean"] = df[district_col].apply(normalize_text)
    df["_market_clean"] = df[market_col].apply(normalize_text).apply(remove_apmc)

    # -------------------------------------------------
    # UNIQUE MANDIS
    # -------------------------------------------------

    unique = df[
        ["_state_clean", "_district_clean", "_market_clean"]
    ].drop_duplicates().reset_index(drop=True)
    unique.columns = ["state", "district", "market"]
    print("Unique mandis:", len(unique))

    # -------------------------------------------------
    # LOAD CACHE
    # -------------------------------------------------

    cache = {}

    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "rb") as f:
            cache = pickle.load(f)
        print("Loaded cache:", len(cache))

    results = []
    failed = []

    # -------------------------------------------------
    # GEOLOCATE
    # -------------------------------------------------

    for row in tqdm(unique.itertuples(index=False), total=len(unique)):

        state = row.state
        district = row.district
        market = row.market

        key = (state.lower(), district.lower(), market.lower())

        if key in cache:
            lat, lng, source, q = cache[key]

        else:
            lat = lng = None
            source = None
            q = None
            # 1 OVERPASS
            lat, lng = query_overpass(market, district, state)
            if lat:
                source = "overpass"
            # 2 NOMINATIM
            if lat is None:
                lat, lng, q = geocode_nominatim(market, district, state)
                if lat:
                    source = "nominatim"
            # 3 GOOGLE
            if lat is None:
                lat, lng, q = geocode_google(market, district, state)
                if lat:
                    source = "google"
            # 4 DISTRICT CENTROID
            if lat is None:
                lat, lng = get_district_centroid(district, state)
                if lat:
                    source = "district_centroid"
            if lat is None:
                source = "failed"
                failed.append({
                    "state": state,
                    "district": district,
                    "market": market
                })
            cache[key] = (lat, lng, source, q)

        results.append({

            "state": state,
            "district": district,
            "market": market,
            "lat": lat,
            "lng": lng,
            "source": source
        })

        if len(cache) % 50 == 0:
            with open(CACHE_FILE, "wb") as f:
                pickle.dump(cache, f)

    # -------------------------------------------------
    # SAVE CACHE
    # -------------------------------------------------

    with open(CACHE_FILE, "wb") as f:
        pickle.dump(cache, f)

    # -------------------------------------------------
    # SAVE RESULTS
    # -------------------------------------------------

    out_df = pd.DataFrame(results)
    out_df.to_csv(OUT_CSV, index=False)
    print("Saved:", OUT_CSV)

    if failed:
        pd.DataFrame(failed).to_csv(OUT_FAILED, index=False)
        print("Saved failed:", OUT_FAILED)

    # -------------------------------------------------
    # MERGE WITH ORIGINAL DATA
    # -------------------------------------------------
    
    merged = df.merge(
        out_df,
        left_on=["_state_clean", "_district_clean", "_market_clean"],
        right_on=["state", "district", "market"],
        how="left"
    )
    merged.to_csv(OUT_MERGED, index=False)
    print("Saved merged dataset:", OUT_MERGED)

    # -------------------------------------------------
    # SUMMARY
    # -------------------------------------------------
    print("\nSummary\n")
    print(out_df["source"].value_counts())

if __name__ == "__main__":
    main()