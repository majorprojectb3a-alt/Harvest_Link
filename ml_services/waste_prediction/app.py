from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import uvicorn
import os
import pandas as pd   # IMPORTANT

app = FastAPI()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODELS_DIR = os.path.join(BASE_DIR, "models")

model = joblib.load(os.path.join(MODELS_DIR, "biofuel_model.pkl"))
le_waste = joblib.load(os.path.join(MODELS_DIR,"waste_encoder.pkl"))
le_fuel = joblib.load(os.path.join(MODELS_DIR,"fuel_encoder.pkl"))

class WasteInput(BaseModel):
    crop_waste: str
    waste_quantity: float

@app.post("/crop-to-biofuel")
def predict(data: WasteInput):
    waste = data.crop_waste
    quantity = data.waste_quantity

    waste_encoded = le_waste.transform([waste])[0]

    X = pd.DataFrame({
        "waste_encoded": [waste_encoded],
        "waste_amount_kg": [quantity]
    })

    # Predict both outputs
    prediction = model.predict(X)

    fuel_encoded = round(prediction[0][0])
    amount_pred = prediction[0][1]

    # Decode fuel type
    fuel_type = le_fuel.inverse_transform([fuel_encoded])[0]

    if fuel_type == "Biogas":
        units = "m3"
    else:
        units = "L"
    return {
        "biofuel_type": fuel_type,
        "biofuel_quantity": round(float(amount_pred), 2),
        "units": units
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
