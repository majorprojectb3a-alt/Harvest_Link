import pandas as pd
import numpy as np
from pathlib import Path

from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.base import clone

from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

import joblib

from price_prediction.utils.config import MODEL_DIR, FEATURE_DATA_DIR

FEATURES_FILE = FEATURE_DATA_DIR/ "Andhra_Pradesh_Feature_Data.parquet"
# DATA_FILE = 
TARGET_COL = "modal_price"

def load_data():
    df = pd.read_parquet(FEATURES_FILE)

    df['arrival_date'] = pd.to_datetime(df["arrival_date"])
    df = df.sort_values("arrival_date").reset_index(drop=False)

    return df

def split_features_target(df):
    drop_cols = ["arrival_date", "modal_price", "commodity", "market", "district", "state", "variety","grade"]

    X = df.drop(columns=[c for c in drop_cols if c in df.columns])
    y = df[TARGET_COL]

    X = X.select_dtypes(include = np.number)

    return X, y

def compute_metrics(y_true, y_pred):

    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))

    denom = np.where(y_true == 0, 1, y_true)
    mape = np.mean(np.abs((y_true - y_pred) / denom)) * 100

    r2 = r2_score(y_true, y_pred)

    return mae, rmse, mape, r2

def get_models():

    return {
        "LinearRegression": LinearRegression(),
        "Ridge": Ridge(alpha=1.0),
        "RandomForest": RandomForestRegressor(n_estimators=200, max_depth=12, n_jobs=-1, random_state=42),
        "GradientBoosting": GradientBoostingRegressor(n_estimators=200, learning_rate=0.05, max_depth=5, random_state=42)
    }

def time_series_cv_train(X, y, models):

    tcsv = TimeSeriesSplit(n_splits=5)
    results = []

    for name, base_model in models.items():
       
        mae_list = []
        rmse_list = []
        mape_list = []
        r2_list = []

        for fold, (train_ind, test_ind) in enumerate(tcsv.split(X), 1):
            
            model = clone(base_model)

            X_train, X_test = X.iloc[train_ind], X.iloc[test_ind]
            y_train, y_test = y.iloc[train_ind], y.iloc[test_ind]

            model.fit(X_train, y_train)
            pred = model.predict(X_test)

            mae, rmse, mape, r2 = compute_metrics(y_test, pred)
            
            mae_list.append(mae)
            rmse_list.append(rmse)
            mape_list.append(mape)
            r2_list.append(r2)
            print(f" Fold {fold} RMSE: {rmse:.3f}")

        results.append({
            "model": name,
            "MAE": np.mean(mae_list),
            "RMSE": np.mean(rmse_list),
            "MAPE": np.mean(mape_list),
            "R2": np.mean(r2_list)
        })
        # print(results)
    return pd.DataFrame(results)
    
def train_full_and_save_best(X, y, best_model_name, models):

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    model = models[best_model_name]
    model.fit(X, y)

    path = MODEL_DIR/ f"{best_model_name}_price_model.pkl"
    joblib.dump(model, path)

    print(f"{path} Best model saved successfully")

def run_model_comparison():

    df = load_data()

    X, y = split_features_target(df)

    models = get_models()
    # print(models)

    results_df = time_series_cv_train(X, y, models)
    results_df = results_df.sort_values("RMSE")
    print(results_df)

    results_path = MODEL_DIR/ "model_comparison_results.csv"
    results_df.to_csv(results_path, index=False)

    best_model = results_df.iloc[0]['model']

    best_model_path = MODEL_DIR/ "best_model_name.txt"
    best_model_path.write_text(best_model)
    print("best model: ", best_model)

    train_full_and_save_best(X, y, best_model, models)

if __name__ == "__main__":
    run_model_comparison()