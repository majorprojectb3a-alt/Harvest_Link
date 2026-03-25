from .ollama_client import ask_ollama
from .retriever import retrieve_context

def build_prompt(prediction_dict, input_context, retrieved_docs):
    return f"""
        You are an agricultural price analyst.

        Predicted Price Data:
        {prediction_dict}

        Input Context:
        {input_context}

        Reference Knowledge:
        {retrieved_docs}

        Explain clearly in 5-6 detailed sentences:
        - Why this price was predicted
        - Role of seasonality
        - Market demand and supply
        - Location (mandi/district) influence
        - Weather impact (if any)

        Keep it structured and complete.
        """

def explain_price(prediction_dict, input_context):
    docs = retrieve_context(input_context)
    prompt = build_prompt(prediction_dict, input_context, docs)

    return ask_ollama(prompt)