import requests
import time

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3"

# def ask_ollama(prompt: str) -> str:
#     resp = requests.post(
#         OLLAMA_URL, json={"model": MODEL_NAME, "prompt": prompt, "stream": False}, timeout=120
#     )

#     resp.raise_for_status()
#     return resp.json()['response']


# import requests


def ask_ollama(prompt, retries=3):
    for i in range(retries):
        try:
            resp = requests.post(
                OLLAMA_URL,
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=300
            )
            return resp.json()["response"]

        except requests.exceptions.ReadTimeout:
            print(f"Ollama timeout — retry {i+1}")
            time.sleep(5)

    return "Explanation generation timed out. Please try again."
