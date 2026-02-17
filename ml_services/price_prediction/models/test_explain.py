from price_prediction.models.predict_with_explain import predict_and_explain

result = predict_and_explain(commodity="Tomato", market= "Pattikonda", quantity=5)

print(result['prediction'])
print('\n-- explanation --\n')
print(result['explanation'])
 