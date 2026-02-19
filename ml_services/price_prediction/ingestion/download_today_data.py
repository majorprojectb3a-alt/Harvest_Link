import requests
import pandas as pd
from datetime import datetime

from price_prediction.ingestion.session import create_session
from price_prediction.utils.config import RAW_DATA_DIR
from price_prediction.ingestion.params import DAILY_BASE_URI, API_KEY, HEADERS

def download_today_df(state = "Andhra Pradesh", limit = 500):
    session = create_session()
    # today = datetime.today().strftime("%d-%m-%Y")

    params = {
        "api-key": API_KEY,
        "format": "json",
        "filters[state.keyword]": state,
        "limit": limit
    }

    try:
        r = session.get(DAILY_BASE_URI, params = params, headers=HEADERS, timeout=30)
        r.raise_for_status()
        data = r.json()

        records = data.get("records", [])

        if not records:
            return pd.DataFrame(columns=["State", "District", "Market", "Commodity", "Variety", "Grade", "Arrival_Date", "Min_Price", "Max_Price", "Modal_Price"])
    
        df = pd.DataFrame(records)
        return df
    except Exception as e:
        print("download_today_df error: ", e)
        return pd.DataFrame()
    finally:
        session.close()
