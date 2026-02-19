import pandas as pd

df = pd.read_csv("price_prediction/data/raw/Andhra_Pradesh_Last_2_Year.csv")
df.to_parquet("price_prediction/data/raw/master.parquet", index=False, compression="snappy")