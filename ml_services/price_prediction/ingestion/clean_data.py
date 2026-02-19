import pandas as pd
from pathlib import Path
from price_prediction.utils.config import RAW_DATA_DIR, PROCESSED_DATA_DIR

def load_raw_data(filename: str) -> pd.DataFrame:

    file_path = RAW_DATA_DIR/ filename
    df = pd.read_csv(file_path)
    return df

def standardize_columns(df: pd.DataFrame) -> pd.DataFrame:

    df.columns = (df.columns.str.strip().str.lower().str.replace(" ", "_"))
    return df

def clean_dates(df: pd.DataFrame) -> pd.DataFrame:

    df["arrival_date"] = pd.to_datetime(df["arrival_date"], format = "%d/%m/%Y", errors = "coerce")
    df = df.dropna(subset=["arrival_date"])
    return df

def clean_prices(df: pd.DataFrame) -> pd.DataFrame:

    price_cols = ["min_price", "max_price", "modal_price"]
    for col in price_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset= price_cols)
    df = df[(df[price_cols] > 0).all(axis = 1)]
    return df

def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:

    df = df.drop_duplicates(subset=["state", "district", "market", "commodity", "arrival_date"])
    return df

def finalize_dataset(df: pd.DataFrame) -> pd.DataFrame:

    df = df.sort_values("arrival_date").reset_index(drop = True)
    return df

def save_clean_data(df: pd.DataFrame, filename: str):

    PROCESSED_DATA_DIR.mkdir(parents = True, exist_ok = True)
    output_path = PROCESSED_DATA_DIR/ filename
    df.to_csv(output_path, index = False)
    print("cleaned data successfully")

def run_pipeline():
    df = load_raw_data("Andhra_Pradesh_Last_2_Year.csv")
    print("data loaded")

    df = standardize_columns(df)
    df = clean_dates(df)
    df = clean_prices(df)
    df = remove_duplicates(df)
    df = finalize_dataset(df)

    save_clean_data(df, "Andhra_Pradesh_Last_2_Year_Processed.csv")

if __name__ == "__main__":
    run_pipeline()