# # app.py
# from fastapi import FastAPI
# from pydantic import BaseModel
# import joblib
# import uvicorn
# import numpy as np
# import os
# import pandas as pd

# app = FastAPI()
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# MODELS_PATH = os.path.join(BASE_DIR, "models", "biofuel_model.joblib")
# model = joblib.load(MODELS_PATH)

# class PredictRequest(BaseModel):
#     crop: str
#     region: str
#     harvested_kg: float
#     rpr: float
#     moisture_frac: float
#     LHV_MJ_per_kg: float
#     energy_per_liter: float = 36.0

# @app.post("/predict-price")
# def predict(req: PredictRequest):
#     # compute deterministic baseline the same way as training
#     residue_kg = req.harvested_kg * req.rpr * (1 - req.moisture_frac)
#     energy_MJ = residue_kg * req.LHV_MJ_per_kg
#     baseline_l = energy_MJ * 0.25 / req.energy_per_liter  # baseline 25% eff (or you can include as input)
#     # create DataFrame-like input
#     X = [{
#         'crop': req.crop,
#         'region': req.region,
#         'residue_kg': residue_kg,
#         'LHV_MJ_per_kg': req.LHV_MJ_per_kg,
#         'moisture_frac': req.moisture_frac,
#         'baseline_l': baseline_l
#     }]
#     df_pred = model.predict(X)  # pipeline accepts list-of-dicts if trained that way; if not, construct pandas
#     predicted_l_per_tonne = float(df_pred[0])
#     # convert to liters for this batch:
#     predicted_liters = predicted_l_per_tonne * (residue_kg / 1000.0)  # if label is l/tonne
#     # estimate value (ask user for price per liter or store defaults)
#     price_per_liter = 50.0  # INR or chosen currency — ideally passed in request
#     estimated_value = predicted_liters * price_per_liter

#     return {
#         "predicted_liters": predicted_liters,
#         "predicted_l_per_tonne": predicted_l_per_tonne,
#         "baseline_liters": baseline_l * (residue_kg / 1000.0),
#         "estimated_value": estimated_value
#     }

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import uvicorn
import os
import pandas as pd   # IMPORTANT

app = FastAPI()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODELS_PATH = os.path.join(BASE_DIR, "models", "biofuel_model.joblib")
model = joblib.load(MODELS_PATH)

class PredictRequest(BaseModel):
    crop: str
    region: str
    harvested_kg: float
    rpr: float
    moisture_frac: float
    LHV_MJ_per_kg: float
    energy_per_liter: float = 36.0


@app.post("/predict-price")
def predict(req: PredictRequest):
    # 1. Compute derived values
    residue_kg = req.harvested_kg * req.rpr * (1 - req.moisture_frac)
    energy_MJ = residue_kg * req.LHV_MJ_per_kg
    baseline_l = energy_MJ * 0.25 / req.energy_per_liter

    # 2. Create DataFrame (NOT list)
    X_df = pd.DataFrame([{
        "crop": req.crop,
        "region": req.region,
        "residue_kg": residue_kg,
        "LHV_MJ_per_kg": req.LHV_MJ_per_kg,
        "moisture_frac": req.moisture_frac,
        "baseline_l": baseline_l
    }])

    # 3. Predict
    predicted_l_per_tonne = float(model.predict(X_df)[0])

    # 4. Convert to total liters
    predicted_liters = predicted_l_per_tonne * (residue_kg / 1000.0)

    # 5. Estimate value
    price_per_liter = 50.0
    estimated_value = predicted_liters * price_per_liter

    return {
        "predicted_liters": predicted_liters,
        "predicted_l_per_tonne": predicted_l_per_tonne,
        "baseline_liters": baseline_l * (residue_kg / 1000.0),
        "estimated_value": estimated_value
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
