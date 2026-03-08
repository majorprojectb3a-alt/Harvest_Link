# # train_model.py
# import pandas as pd
# import numpy as np
# from sklearn.model_selection import train_test_split
# from sklearn.preprocessing import OneHotEncoder, StandardScaler
# from sklearn.compose import ColumnTransformer
# from sklearn.pipeline import Pipeline
# from sklearn.ensemble import HistGradientBoostingRegressor
# import joblib
# import os
# # 1) Load dataset (CSV prepared from FAOSTAT + RPR + lab yields)
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DATA_PATH = os.path.join(BASE_DIR, "..", "data", "biofuel_training.csv")
# df = pd.read_csv(DATA_PATH)

# # example columns:
# # 'crop', 'region', 'harvested_kg', 'rpr', 'moisture_frac', 'LHV_MJ_per_kg', 'lab_yield_l_per_tonne'

# # 2) Feature engineering: deterministic baseline
# df['residue_kg'] = df['harvested_kg'] * df['rpr'] * (1 - df['moisture_frac'])
# df['energy_MJ'] = df['residue_kg'] * df['LHV_MJ_per_kg']
# # assume energy_per_liter = 36 MJ/L (example for biodiesel ~ 35-37 MJ/L)
# energy_per_liter = 36.0
# df['baseline_l'] = df['energy_MJ'] * 0.25 / energy_per_liter  # using a 25% conversion efficiency as baseline

# # Target
# y = df['lab_yield_l_per_tonne']  # or df['measured_l_per_tonne']

# # Features
# X = df[['crop', 'region', 'residue_kg', 'LHV_MJ_per_kg', 'moisture_frac', 'baseline_l']]

# # Preprocessing pipelines
# cat_cols = ['crop', 'region']
# num_cols = ['residue_kg', 'LHV_MJ_per_kg', 'moisture_frac', 'baseline_l']

# preprocessor = ColumnTransformer([
#     ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols),
#     ('num', StandardScaler(), num_cols)
# ])

# model = Pipeline([
#     ('pre', preprocessor),
#     ('reg', HistGradientBoostingRegressor(loss="squared_error", max_iter=500))
# ])

# # train/test
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# model.fit(X_train, y_train)
# print("Train score:", model.score(X_train, y_train))
# print("Test score:", model.score(X_test, y_test))

# # save
# MODELS_PATH = os.path.join(BASE_DIR, "..", "models", "biofuel_model.joblib")
# joblib.dump(model, MODELS_PATH)

# print("Saved model to ../models/biofuel_model.joblib")


from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, mean_absolute_error, r2_score
import pandas as pd
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "waste_to_biofuel_dataset.csv")
df = pd.read_csv(DATA_PATH)

le_waste = LabelEncoder()
df['waste_encoded'] = le_waste.fit_transform(df['crop_waste'])

le_fuel = LabelEncoder()
df['fuel_encoded'] = le_fuel.fit_transform(df['biofuel_type'])
# Input features

X = df[["waste_encoded","waste_amount_kg"]]

# Multi outputs
Y = df[["fuel_encoded","biofuel_produced"]]

# Train test split
X_train,X_test,Y_train,Y_test = train_test_split(
    X,Y,test_size=0.2,random_state=42
)

# Multi output model
model = MultiOutputRegressor(RandomForestRegressor())

model.fit(X_train,Y_train)

# Predictions
Y_pred = model.predict(X_test)

fuel_pred = Y_pred[:,0].round()
amount_pred = Y_pred[:,1]

# Accuracy for fuel type
accuracy = accuracy_score(Y_test["fuel_encoded"],fuel_pred)

# Regression metrics
mae = mean_absolute_error(Y_test["biofuel_produced"],amount_pred)
r2 = r2_score(Y_test["biofuel_produced"],amount_pred)

print("Fuel Type Accuracy:",accuracy)
print("Fuel Amount MAE:",mae)
print("Fuel Amount R2:",r2)

# Save model
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
joblib.dump(model,os.path.join(MODELS_DIR,"biofuel_model.pkl"))
joblib.dump(le_waste,os.path.join(MODELS_DIR,"waste_encoder.pkl"))
joblib.dump(le_fuel,os.path.join(MODELS_DIR,"fuel_encoder.pkl"))

print("Model saved")