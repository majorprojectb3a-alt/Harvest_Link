from price_prediction.ingestion.download_today_data import download_today_df
from price_prediction.ingestion.append_to_master import append_df_to_master
from price_prediction.feature_engineering.build_features import increamental_update_features
from price_prediction.models.train_pipeline import train_pipeline
from price_prediction.utils.config import MODEL_DIR

import json
from pathlib import Path
import datetime

META_PATH = MODEL_DIR / "train_meta.json"

def should_retrain(last_trained_date, new_rows, min_days = 7, min_new_rows = 500):
    if last_trained_date is None:
        return True
    
    days = (datetime.datetime.now().date() - last_trained_date).days
    return (days >= min_days) or (new_rows >= min_new_rows)

def run_daily_update(retrain_policy = True):
    df_today = download_today_df(state= "Andhra Pradesh")
    if df_today.empty:
        print("No new data today - nothing appended")
        return 
    
    combined = append_df_to_master(df_today)
    features = increamental_update_features()

    retrain = False
    if retrain_policy:
        if META_PATH.exists():
            meta = json.loads(META_PATH.read_text())
            last_tr = datetime.datetime.fromisoformat(meta.get("last_trained"))
            rows_then = meta.get("rows_used", 0)
            new_rows = len(combined) - rows_then
            retrain = should_retrain(last_tr.date(), new_rows)
        else:
            retrain = True

    if retrain:
        print("retraining the model pipeline (this may take some time..)")
        train_pipeline()
        meta = {"last_trained": datetime.datetime.now().isoformat(), "rows_used": len(combined)}
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        META_PATH.write_text(json.dumps(meta))
        print("Retrain complete and metadata updated")
    
    print("Daily update completed")

if __name__ == "__main__":
    run_daily_update()