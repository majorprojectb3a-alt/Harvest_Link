import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from pathlib import Path
from datetime import datetime
from price_prediction.utils.config import RAW_DATA_DIR

MASTER_CSV = RAW_DATA_DIR / "master.parquet"
TMP_PATH = RAW_DATA_DIR / "master_tmp.parquet"

curr_day = datetime.today().strftime("%d-%m-%Y")
TODAY_CSV =RAW_DATA_DIR/ f"today_{curr_day}.csv"
columns = [
    "state","district","market","commodity",
    "variety","grade","arrival_date",
    "min_price","max_price","modal_price"
]

def _normalize_columns(df):
    df.columns = (
        df.columns.str.strip().str.lower().str.replace(" ", "_")
    )

    for c in columns:
        if c not in df.columns:
            df[c] = pd.NA
    df = df[columns]
    df['arrival_date'] = pd.to_datetime(df['arrival_date'], format="%d/%m/%Y", errors="coerce")
    return df

def append_df_to_master(new_df: pd.DataFrame):

    new_df = _normalize_columns(new_df)

    new_df = new_df.dropna(subset=["arrival_date","commodity","market","modal_price"])

    if MASTER_CSV.exists():
        master_df = pd.read_parquet(MASTER_CSV)
    else:
        master_df = pd.DataFrame(columns= columns)
    
    combined = pd.concat([master_df, new_df], ignore_index=True, sort=False)

    combined = combined.drop_duplicates(subset=["state", "district", "market", "commodity", "arrival_date"], keep="last")
    
    combined["arrival_date"] = pd.to_datetime(
        combined["arrival_date"],
        errors="coerce"
    )

    for c in ["min_price","max_price","modal_price"]:
        combined[c] = pd.to_numeric(combined[c], errors="coerce")

    table = pa.Table.from_pandas(combined, preserve_index = False)
    pq.write_table(table, TMP_PATH, compression="snappy")
    TMP_PATH.replace(MASTER_CSV)
    #when rename is used, windows throws an error that it cannot create a file which already exists. So, we are using replace to overcome this error

    print("master dataset updated", len(combined))

    return combined