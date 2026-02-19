KNOWLEDGE_BASE = [
    "Vegetable prices rise during off-season supply shortages.",
    "Market arrivals influence modal price strongly.",
    "Festival months often increase demand.",
    "Rainfall affects mandi arrivals and pricing.",
]

def retrieve_context(query_dict):
    commodity = query_dict.get("commodity", "")
    return '\n'.join(KNOWLEDGE_BASE)
