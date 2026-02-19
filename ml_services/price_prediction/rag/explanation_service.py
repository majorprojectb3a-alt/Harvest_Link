from .ollama_client import ask_ollama
from .retriever import retrieve_context

def build_prompt(prediction_dict, input_context, retrieved_docs):
    return f"""
    You are an agricultural price analyst.

    Predicted Price: {prediction_dict}

    Input Context: {input_context}

    Reference Knowledge: {retrieved_docs}
    
    Explain in simple terms why this price was predicted.
    Mention seasona;ity, recent trends, and location factors.
    """

def explain_price(prediction_dict, input_context):
    docs = retrieve_context(input_context)
    prompt = build_prompt(prediction_dict, input_context, docs)

    return ask_ollama(prompt)