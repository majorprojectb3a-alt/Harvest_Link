# price_prediction/models/predict_service.py
import joblib
import pandas as pd
from price_prediction.utils.config import RAW_DATA_DIR, MODEL_DIR, FEATURE_DATA_DIR
from datetime import datetime

MASTER_PATH = RAW_DATA_DIR / "master.parquet"
PIPELINE_PATH = MODEL_DIR / "pipeline_price_model.pkl"
FEATURE_PATH = FEATURE_DATA_DIR / "Andhra_Pradesh_Feature_Data.parquet"
BEST_MODEL_FILE = MODEL_DIR / "best_model_name.txt"

def ensure_pipeline_ready():
    from price_prediction.feature_engineering.build_features import increamental_update_features
    from price_prediction.models.model_comparison import run_model_comparison
    from price_prediction.models.train_pipeline import train_pipeline

    # ensure features exist
    if not FEATURE_PATH.exists():
        print("⚠ Feature file missing — building features...")
        increamental_update_features()

    # ensure best model exists
    if not BEST_MODEL_FILE.exists():
        print("⚠ Best model not decided — running model comparison...")
        run_model_comparison()

    # ensure trained pipeline exists
    if not PIPELINE_PATH.exists():
        print("⚠ Trained pipeline missing — training pipeline...")
        train_pipeline()

    print("✅ Pipeline ready")

def build_input_from_master(commodity, market, state=None, district=None):
    df = pd.read_parquet(MASTER_PATH)

    df_candidate = pd.DataFrame()
    if market is not None:
        df_candidate = df[(df["commodity"] == commodity) & (df["market"] == market)]
    if df_candidate.empty and district is not None:
        df_candidate = df[(df["commodity"] == commodity) & (df["district"] == district)]
    if df_candidate.empty:
        df_candidate = df[df["commodity"] == commodity]
    if df_candidate.empty:
        raise ValueError("No historical rows for this commodity/market/district. Try different inputs.")

    df_candidate = df_candidate.sort_values("arrival_date")
    last = df_candidate.iloc[-1]

    row = {
        "state": last["state"],
        "district": last["district"],
        "market": last["market"],
        "commodity": last["commodity"],
        "variety": last.get("variety", None),
        "grade": last.get("grade", None),
        "modal_price_lag_1": df_candidate["modal_price"].iloc[-1],
        "modal_price_lag_7": df_candidate["modal_price"].tail(7).mean() if len(df_candidate) >= 7 else df_candidate["modal_price"].mean(),
        "rolling_mean_7": df_candidate["modal_price"].tail(7).mean() if len(df_candidate) >= 7 else df_candidate["modal_price"].mean(),
        "rolling_mean_30": df_candidate["modal_price"].tail(30).mean() if len(df_candidate) >= 30 else df_candidate["modal_price"].mean(),
        "rolling_std_7": df_candidate["modal_price"].tail(7).std() if len(df_candidate) >= 7 else 0,
        "month": datetime.today().month,
        "day_of_week": datetime.today().weekday()
    }
    return pd.DataFrame([row])

def predict_for(commodity, market=None, state=None, district=None, quantity=1.0):
    ensure_pipeline_ready()
    if not PIPELINE_PATH.exists():
        raise FileNotFoundError(f"Trained pipeline not found at {PIPELINE_PATH}")
    pipeline = joblib.load(PIPELINE_PATH)
    X = build_input_from_master(commodity, market, state, district)
    price_per_quintal = pipeline.predict(X)[0]
    total = price_per_quintal * quantity
    return {"price_per_quintal": float(price_per_quintal), "total": float(total)}