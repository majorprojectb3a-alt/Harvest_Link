import pandas as pd
import joblib
from pathlib import Path

from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
# from sklearn.ensemble import RandomForestRegressor

from price_prediction.utils.config import MODEL_DIR, FEATURE_DATA_DIR
from price_prediction.models.model_factory import get_model_by_name
from price_prediction.models.model_comparison import run_model_comparison
FEATURES_FILE = FEATURE_DATA_DIR/ "Andhra_Pradesh_Feature_Data.parquet"
# DATA_FILE = "master_features.parquet"
BEST_MODEL_FILE = MODEL_DIR / "best_model_name.txt"
PIPELINE_PATH = MODEL_DIR/ "pipeline_price_model.pkl"

def load_best_model_name():
    if not BEST_MODEL_FILE.exists():
        print(f"Best model name file not found: {BEST_MODEL_FILE}")
        run_model_comparison()
    return BEST_MODEL_FILE.read_text().strip()
    
def load_data():
    df = pd.read_parquet(FEATURES_FILE)
    df['arrival_date'] = pd.to_datetime(df['arrival_date'])
    df = df.sort_values("arrival_date")
    return df

def train_pipeline():
    df = load_data()
    # create t+1 target (next-day modal price)
    df["target_price"] = df.groupby(["commodity","market"])["modal_price"].shift(-1)
    df = df.dropna(subset=["target_price"])
    cat_cols = ["state","district","market","commodity","variety","grade"]
    num_cols = ["modal_price_lag_1","modal_price_lag_7","rolling_mean_7","rolling_mean_30","rolling_std_7","month","day_of_week"]
    # ensure numeric cols exist
    for c in num_cols:
        if c not in df.columns:
            df[c] = 0.0
    X = df[cat_cols + num_cols]
    y = df["target_price"]
    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    preprocessor = ColumnTransformer(transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
        ("num", StandardScaler(), num_cols)
    ])
    best_model_name = load_best_model_name()
    model = get_model_by_name(best_model_name)
    pipeline = Pipeline([("pre", preprocessor), ("model", model)])
    pipeline.fit(X_train, y_train)
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, PIPELINE_PATH)
    # save feature lists for future alignment if desired
    joblib.dump({"cat_cols": cat_cols, "num_cols": num_cols}, MODEL_DIR / "feature_columns.pkl")
    print(f"✅ Pipeline trained with model {best_model_name} and saved to {PIPELINE_PATH}")

if __name__ == "__main__":
    train_pipeline()