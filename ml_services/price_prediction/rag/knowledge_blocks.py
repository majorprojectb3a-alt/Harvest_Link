import pandas as pd
from price_prediction.utils.config import RAW_DATA_DIR

MASTER_PATH = RAW_DATA_DIR/ "master.parquet"

def get_market_stats(commodity, market):
    df = pd.read_parquet(MASTER_PATH)

    df = df[(df['commodity'] == commodity) & (df['market'] == market)]
    df = df.sort_values("arrival_date")

    if len(df) == 0:
        return None
    
    last_price = df['modal_price'].iloc[-1]
    avg7 = df['modal_price'].tail(7).mean()
    avg30 = df['modal_price'].tail(30).mean()
    std7 = df['modal_price'].tail(7).std()

    trend = "increasing" if last_price > avg7 else "decreasing"

    return {
        "last_price": float(last_price),
        "avg7": float(avg7),
        "avg30": float(avg30),
        "volatality": float(std7),
        "trend": trend,
        "records": len(df)
    }