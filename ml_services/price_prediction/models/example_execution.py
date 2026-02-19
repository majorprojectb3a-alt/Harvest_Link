# from price_prediction.models.predict_service import predict_for
# from price_prediction.rag.explanation_service import explain_price
# print(explain_price("Tomato", "Pattikonda", 7))
# # print(predict_for("Brinjal", market="Palamaner APMC", quantity=1))

from openai import OpenAI
client = OpenAI()

r = client.responses.create(
    model="gpt-5-mini",
    input="Say hello"
)

print(r.output_text)
