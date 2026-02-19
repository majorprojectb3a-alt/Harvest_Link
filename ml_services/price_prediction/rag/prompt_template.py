def explanation_prompt(context, predicted_price, quantity):

    return f""" You are an agricultural market analyst.
    Predicted mandi price: {predicted_price:.0f} per quintal
    Quantity: {quantity}

    Market Context: {context}

Explain in simple farmer-friendly language:
- Why this price is predicted
- What trends influenced it
- Whether it it above/ below recent average
- What it suggests for selling today

Keep it practical and clear
"""