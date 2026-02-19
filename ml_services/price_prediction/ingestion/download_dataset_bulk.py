import pandas as pd
import time
from datetime import datetime, timedelta

from ingestion.session import create_session
from ingestion.params import HISTORICAL_BASE_URL, API_KEY, HEADERS, STATE_NAME, LIMIT
from price_prediction.utils.config import RAW_DATA_DIR


def download_dataset(days=730):
    session = create_session()
    all_records = []

    end_date = datetime.today()
    start_date = end_date - timedelta(days=days)
    current_date = start_date

    while current_date <= end_date:
        date_str = current_date.strftime("%d-%m-%Y")
        offset = 0

        print(f"📅 Fetching data for {date_str}")

        while True:
            params = {
                "api-key": API_KEY,
                "format": "json",
                "limit": LIMIT,
                "offset": offset,
                "filters[State]": STATE_NAME,
                "filters[Arrival_Date]": date_str
            }

            response = session.get(HISTORICAL_BASE_URL, params=params, headers=HEADERS, timeout=30)
            response.raise_for_status()

            data = response.json()
            records = data.get("records", [])

            if not records:
                break

            all_records.extend(records)
            offset += LIMIT
            time.sleep(1)

        current_date += timedelta(days=1)
        time.sleep(2)

    df = pd.DataFrame(all_records)

    output_file = RAW_DATA_DIR / f"{STATE_NAME.replace(' ', '_')}_2_years.csv"
    df.to_csv(output_file, index=False)

    print(f"✅ Dataset saved at: {output_file}")
    return df

if __name__ == "__main__":
    download_dataset(days = 365 * 2)
    