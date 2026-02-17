# train_model.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import HistGradientBoostingRegressor
import joblib
import os
# 1) Load dataset (CSV prepared from FAOSTAT + RPR + lab yields)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "biofuel_training.csv")
df = pd.read_csv(DATA_PATH)

# example columns:
# 'crop', 'region', 'harvested_kg', 'rpr', 'moisture_frac', 'LHV_MJ_per_kg', 'lab_yield_l_per_tonne'

# 2) Feature engineering: deterministic baseline
df['residue_kg'] = df['harvested_kg'] * df['rpr'] * (1 - df['moisture_frac'])
df['energy_MJ'] = df['residue_kg'] * df['LHV_MJ_per_kg']
# assume energy_per_liter = 36 MJ/L (example for biodiesel ~ 35-37 MJ/L)
energy_per_liter = 36.0
df['baseline_l'] = df['energy_MJ'] * 0.25 / energy_per_liter  # using a 25% conversion efficiency as baseline

# Target
y = df['lab_yield_l_per_tonne']  # or df['measured_l_per_tonne']

# Features
X = df[['crop', 'region', 'residue_kg', 'LHV_MJ_per_kg', 'moisture_frac', 'baseline_l']]

# Preprocessing pipelines
cat_cols = ['crop', 'region']
num_cols = ['residue_kg', 'LHV_MJ_per_kg', 'moisture_frac', 'baseline_l']

preprocessor = ColumnTransformer([
    ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols),
    ('num', StandardScaler(), num_cols)
])

model = Pipeline([
    ('pre', preprocessor),
    ('reg', HistGradientBoostingRegressor(loss="squared_error", max_iter=500))
])

# train/test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model.fit(X_train, y_train)
print("Train score:", model.score(X_train, y_train))
print("Test score:", model.score(X_test, y_test))

# save
MODELS_PATH = os.path.join(BASE_DIR, "..", "models", "biofuel_model.joblib")
joblib.dump(model, MODELS_PATH)

print("Saved model to ../models/biofuel_model.joblib")
