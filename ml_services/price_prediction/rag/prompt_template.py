def explanation_prompt(context, predicted_price, quantity):

    return f""" You are an agricultural market analyst.
    Predicted mandi price: {predicted_price:.0f} per quintal
    Quantity: {quantity}

    Market Context: {context}

Explain briefly:
1. Why this price is predicted
2. Current market trend
3. Should the farmer sell today or wait a few days
4. Reason for this advice

Use simple farmer-friendly language. Keep it practical and clear.
"""