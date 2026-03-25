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
from price_prediction.models.predict_service import predict_for
from price_prediction.models.predict_with_explain import predict_and_explain

app = FastAPI()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# -----------------------------
# Load Model and Encoders
# -----------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "waste_prediction", "models")

model = joblib.load(os.path.join(MODELS_DIR, "biofuel_model.pkl"))
le_waste = joblib.load(os.path.join(MODELS_DIR, "waste_encoder.pkl"))
le_fuel = joblib.load(os.path.join(MODELS_DIR, "fuel_encoder.pkl"))

# -----------------------------
# Request Schema
# -----------------------------

class CropWasteRequest(BaseModel):
    crop_waste: str
    waste_quantity: float


class FreshPriceRequest(BaseModel):
    commodity: str
    market: str | None = None
    state: str | None = None
    district: str | None = None
    quantity: float

@app.post("/crop-to-biofuel")
def predict_biofuel(req: CropWasteRequest):

    try:
        print('crop to biofuel')

        # Encode waste type
        waste_encoded = le_waste.transform([req.crop_waste])[0]

        # Create dataframe
        input_df = pd.DataFrame([{
            "waste_encoded": waste_encoded,
            "waste_amount_kg": req.waste_quantity
        }])

        # Prediction
        prediction = model.predict(input_df)

        fuel_encoded = int(round(prediction[0][0]))
        fuel_amount = float(prediction[0][1])

        # Decode fuel type
        fuel_type = le_fuel.inverse_transform([fuel_encoded])[0]

        # print(fuel_type)

        if fuel_type == "Biogas":
            units = "m3"
        else:
            units = "L"
        return {
            "success": True,
            "crop_waste": req.crop_waste,
            "waste_quantity": req.waste_quantity,
            "biofuel_type": fuel_type,
            "biofuel_produced_liters": round(fuel_amount, 2),
            "units": units
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    
@app.post("/predict-fresh-price")
def predict_fresh_price(req: FreshPriceRequest):
    print('inside predict fresh now')
    try:

        # Step 1: predict price
        result = predict_for(
            commodity=req.commodity,
            market=req.market,
            state=req.state,
            district=req.district,
            quantity=req.quantity
        )

        price_per_quintal = result["price_per_quintal"]
        total_value = result["total"]

        print(price_per_quintal, total_value)

        # Step 2: generate explanation
        exp = predict_and_explain(
            commodity=req.commodity,
            market=req.market,
            state=req.state,
            district=req.district,
            quantity=req.quantity
        )

        explanation = exp["explanation"]
        
        # print(explanation)

        return {
            "success": True,
            "commodity": req.commodity,
            "market": req.market,
            "district": req.district,
            "price_per_quintal": price_per_quintal,
            "total_price": total_value,
            "explanation": explanation
        }

    except Exception as e:
        print('inside exception', e)
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
