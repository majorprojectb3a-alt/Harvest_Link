import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import pathlib as Path

from price_prediction.utils.config import PROCESSED_DATA_DIR, BASE_DIR


EDA_BASE_DIR = BASE_DIR / "eda" / "eda_outputs"

DATE_PRICE_DIR = EDA_BASE_DIR / "date_price_analysis"
SEASONAL_DIR = EDA_BASE_DIR / "seasonal_analysis"
MONTHLY_DIR = EDA_BASE_DIR / "monthly_seasonality"
VOLATILITY_DIR = EDA_BASE_DIR / "price_volatility"

for d in [DATE_PRICE_DIR, SEASONAL_DIR, MONTHLY_DIR, VOLATILITY_DIR]:
    d.mkdir(parents=True, exist_ok=True)


def assign_season(month: int) -> str:
    if month in [12, 1, 2]:
        return "Winter"
    elif month in [3, 4, 5]:
        return "Summer"
    elif month in [6, 7, 8]:
        return "Monsoon"
    else:
        return "Post-Monsoon"
    
def load_data():
    file_path = PROCESSED_DATA_DIR / "Andhra_Pradesh_Last_2_Year_Processed.csv"
    df = pd.read_csv(file_path, parse_dates = ["arrival_date"])
    return df

def add_time_features(df: pd.DataFrame):
    df["month"] = df["arrival_date"].dt.month
    df["year"] = df["arrival_date"].dt.year
    df["season"] = df["month"].apply(assign_season)

    return df

def plot_daily_trend(df):
    for commodity in df["commodity"].unique():
        crop_df = df[df["commodity"] == commodity]

        daily_avg = (crop_df.groupby("arrival_date")['modal_price'].mean().rolling(7).mean())

        plt.figure(figsize=(10, 5))
        plt.plot(daily_avg.index, daily_avg.values)
        plt.title(f"Daily Price Trend (7-day MA) - {commodity}")
        plt.xlabel("Date")
        plt.ylabel("Modal Price")
        plt.tight_layout()

        safe_name = commodity.replace("/", "_").replace("(", "").replace(")", "")
        plt.savefig(DATE_PRICE_DIR / f"{safe_name}_daily_trend.png")
        plt.close()
    
def plot_seasonal_avg(df):
    seasonal_avg = (
        df.groupby(["commodity", "season"])["modal_price"]
        .mean()
        .reset_index()
    )

    for commodity in seasonal_avg["commodity"].unique():
        crop_df = seasonal_avg[seasonal_avg["commodity"] == commodity]

        plt.figure(figsize=(8, 5))
        sns.barplot(data=crop_df, x="season", y="modal_price")
        plt.title(f"Seasonal Avg Price - {commodity}")
        plt.xlabel("Season")
        plt.ylabel("Avg Modal Price")
        plt.tight_layout()

        safe_name = commodity.replace("/", "_").replace("(", "").replace(")", "")
        plt.savefig(SEASONAL_DIR / f"{safe_name}_seasonal_avg.png")
        plt.close()

def plot_monthly_seasonality(df):
    monthly_avg = (
        df.groupby(["commodity", "month"])["modal_price"]
        .mean()
        .reset_index()
    )

    for commodity in monthly_avg["commodity"].unique():
        crop_df = monthly_avg[monthly_avg["commodity"] == commodity]

        plt.figure(figsize=(10, 5))
        sns.lineplot(data=crop_df, x="month", y="modal_price", marker="o")
        plt.title(f"Monthly Price Seasonality - {commodity}")
        plt.xlabel("Month")
        plt.ylabel("Avg Modal Price")
        plt.xticks(range(1, 13))
        plt.tight_layout()

        safe_name = commodity.replace("/", "_").replace("(", "").replace(")", "")
        plt.savefig(MONTHLY_DIR / f"{safe_name}_monthly_seasonality.png")
        plt.close()

def plot_seasonal_volatility(df):
    for commodity in df["commodity"].unique():
        crop_df = df[df["commodity"] == commodity]

        plt.figure(figsize=(8, 5))
        sns.boxplot(data=crop_df, x="season", y="modal_price")
        plt.title(f"Seasonal Price Volatility - {commodity}")
        plt.xlabel("Season")
        plt.ylabel("Modal Price")
        plt.tight_layout()

        safe_name = commodity.replace("/", "_").replace("(", "").replace(")", "")
        plt.savefig(VOLATILITY_DIR / f"{safe_name}_seasonal_volatility.png")
        plt.close()

def run_crop_seasonal_eda():
    df = load_data()
    df = add_time_features(df)

    plot_daily_trend(df)
    plot_seasonal_avg(df)
    plot_monthly_seasonality(df)
    plot_seasonal_volatility(df)

    print("Crop-wise seasonal EDA completed")

if __name__ == "__main__":
    run_crop_seasonal_eda()
