import pandas as pd
import numpy as np
from pathlib import Path
from price_prediction.utils.config import PROCESSED_DATA_DIR, DATA_DIR, RAW_DATA_DIR

MASTER_PATH = RAW_DATA_DIR/ "master.parquet"
FEATURE_DATA_DIR = DATA_DIR / "features" / "Andhra_Pradesh_Feature_Data.parquet"
FEATURE_DATA_DIR.parent.mkdir(parents=True, exist_ok=True)

def build_features(full_df: pd.DataFrame) -> pd.DataFrame:
    df = full_df.copy()

    df["arrival_date"] = pd.to_datetime(df["arrival_date"], dayfirst=True, errors="coerce") # ensuring correct dtypes
    df = df.dropna(subset=["arrival_date"])
    df = df.sort_values(["commodity","market","arrival_date"])

    df["year"] = df["arrival_date"].dt.year
    df["month"] = df["arrival_date"].dt.month
    df["day"] = df["arrival_date"].dt.day
    df["day_of_week"] = df["arrival_date"].dt.dayofweek
    df["week_of_year"] = df["arrival_date"].dt.isocalendar().week.astype(int)

    df["modal_price_lag_1"] = df.groupby(["commodity","market"])["modal_price"].shift(1)
    df["modal_price_lag_7"] = df.groupby(["commodity","market"])["modal_price"].shift(7)
    df["rolling_mean_7"] = df.groupby(["commodity","market"])["modal_price"].transform(lambda x: x.rolling(7, min_periods=1).mean())
    df["rolling_mean_30"] = df.groupby(["commodity","market"])["modal_price"].transform(lambda x: x.rolling(30, min_periods=1).mean())
    df["rolling_std_7"] = df.groupby(["commodity","market"])["modal_price"].transform(lambda x: x.rolling(7, min_periods=1).std().fillna(0))

    df = df.dropna()
    return df

def increamental_update_features():
    full_df = pd.read_parquet(MASTER_PATH)
    features = build_features(full_df)
    features.to_parquet(FEATURE_DATA_DIR, compression="snappy", index=False)
    print("features saved", len(features))
    return features

if __name__ == "__main__":
    increamental_update_features()