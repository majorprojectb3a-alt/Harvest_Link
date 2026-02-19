from price_prediction.models.predict_service import predict_for
from price_prediction.rag.explanation_service import explain_price

def predict_and_explain(commodity, market = None, state = None, district = None, quantity = 1):
    pred = predict_for(commodity, market, state, district, quantity)

    input_ctx = {
        "commodity": commodity,
        "market": market,
        "state": state,
        "district": district,
        "quantity": quantity
    }

    explanation = explain_price(pred, input_ctx)

    return {
        "prediction": pred,
        "explanation": explanation
    }