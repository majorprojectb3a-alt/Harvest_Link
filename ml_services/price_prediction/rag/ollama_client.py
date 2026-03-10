import requests
import time

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "phi3"

def ask_ollama(prompt, retries=5):
    for i in range(retries):
        try:
            resp = requests.post(
                OLLAMA_URL,
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.2,
                        "num_predict": 200,
                        "top_p": 0.9
                    }
                },
                timeout=300
            )
            data = resp.json()

            if "response" in data:
                return data["response"]

            print("Ollama unexpected response:", data)
            return "AI explanation unavailable."

        except requests.exceptions.ReadTimeout:
            print(f"Ollama timeout — retry {i+1}")
            time.sleep(5)

    return "Explanation generation timed out. Please try again."


