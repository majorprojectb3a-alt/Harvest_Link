import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import pathlib as Path

from price_prediction.utils.config import PROCESSED_DATA_DIR, BASE_DIR

def load_processed_data(filename: str) -> pd.DataFrame:

    file_path = PROCESSED_DATA_DIR/ filename
    df = pd.read_csv(file_path, parse_dates = ["arrival_date"])

    return df

def dataset_overview(df: pd.DataFrame):
    print('dataset shape', df.shape)
    print('COlumns:')
    print(df.columns.tolist())
    print('Missing Values:')
    print(df.isnull().sum())
    print('data range:')
    print(df['arrival_date'].min, '->', df['arrival_date'].max)

def price_distribution(df: pd.DataFrame, output_dir: Path):
    price_cols = ["min_price", "max_price", "modal_price"]

    for col in price_cols:
        plt.figure(figsize=(8, 4))
        sns.histplot(df[col], kde= True, bins= 50)
        plt.title(f'Distribution of {col}')
        plt.xlabel(col)
        plt.ylabel('Freq')
        plt.tight_layout()
        plt.savefig(output_dir/ f'{col}_distribution.png')
        plt.close()
    
def time_series_trend(df: pd.DataFrame, output_dir: Path):
    daily_avg = (df.groupby('arrival_date')['modal_price'].mean().reset_index())

    plt.figure(figsize=(12, 5))
    plt.plot(daily_avg["arrival_date"], daily_avg["modal_price"])
    plt.title("Daily Average Modal Price Trend")
    plt.xlabel("Date")
    plt.ylabel("Modal Price")
    plt.tight_layout()
    plt.savefig(output_dir / "daily_modal_price_trend.png")
    plt.close()

def monthly_seasonality(df: pd.DataFrame, output_dir: Path):
    df["month"] = df["arrival_date"].dt.month

    monthly_avg = (
        df.groupby("month")["modal_price"]
        .mean()
        .reset_index()
    )

    plt.figure(figsize=(8, 4))
    sns.barplot(data=monthly_avg, x="month", y="modal_price")
    plt.title("Monthly Average Modal Price")
    plt.xlabel("Month")
    plt.ylabel("Modal Price")
    plt.tight_layout()
    plt.savefig(output_dir / "monthly_seasonality.png")
    plt.close()

def commodity_analysis(df: pd.DataFrame, output_dir: Path, top_n=10):
    top_commodities = (
        df["commodity"]
        .value_counts()
        .head(top_n)
        .index
    )

    filtered_df = df[df["commodity"].isin(top_commodities)]

    plt.figure(figsize=(12, 6))
    sns.boxplot(
        data=filtered_df,
        x="commodity",
        y="modal_price"
    )
    plt.xticks(rotation=45)
    plt.title(f"Modal Price Distribution (Top {top_n} Commodities)")
    plt.tight_layout()
    plt.savefig(output_dir / "commodity_price_boxplot.png")
    plt.close()

def run_eda():
    output_dir = BASE_DIR/ "eda"/ "eda_outputs"
    output_dir.mkdir(parents = True, exist_ok=True)

    df = load_processed_data("Andhra_Pradesh_Last_2_Year_Processed.csv")

    dataset_overview(df)
    price_distribution(df, output_dir)
    time_series_trend(df, output_dir)
    monthly_seasonality(df, output_dir)
    commodity_analysis(df, output_dir)

    print("\n EDA completed. Outputs saved in:", output_dir.resolve())

if __name__ == "__main__":
    run_eda()