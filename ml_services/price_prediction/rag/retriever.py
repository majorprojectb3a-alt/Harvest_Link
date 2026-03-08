# KNOWLEDGE_BASE = [
#     "Vegetable prices rise during off-season supply shortages.",
#     "Market arrivals influence modal price strongly.",
#     "Festival months often increase demand.",
#     "Rainfall affects mandi arrivals and pricing.",
# ]

# def retrieve_context(query_dict):
#     commodity = query_dict.get("commodity", "")
#     return '\n'.join(KNOWLEDGE_BASE)

import json
import requests
from pathlib import Path

KNOWLEDGE_BASE_PATH = Path(__file__).parent / "knowledge_base.json"

INDIA_STATE_COORDINATES = {
    "andhra_pradesh": (15.9129, 79.7400),
    "maharashtra": (19.7515, 75.7139),
    "karnataka": (15.3173, 75.7139),
    "tamil_nadu": (11.1271, 78.6569),
    "uttar_pradesh": (26.8467, 80.9462),
    "madhya_pradesh": (22.9734, 78.6569),
    "gujarat": (22.2587, 71.1924),
    "rajasthan": (27.0238, 74.2179),
    "west_bengal": (22.9868, 87.8550),
    "punjab": (31.1471, 75.3412),
    "haryana": (29.0588, 76.0856),
    "bihar": (25.0961, 85.3131),
    "odisha": (20.9517, 85.0985),
    "telangana": (18.1124, 79.0193),
    "kerala": (10.8505, 76.2711),
}


def load_knowledge_base():
    """Load knowledge base from JSON file."""
    try:
        with open(KNOWLEDGE_BASE_PATH, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Warning: Could not load knowledge base: {e}")
        return {"general_factors": []}


def fetch_weather_data(state):
    """Fetch current weather data from Open-Meteo API (free, no API key required)."""
    state_key = state.lower().replace(" ", "_") if state else "andhra_pradesh"
    coords = INDIA_STATE_COORDINATES.get(state_key, (15.9129, 79.7400))
    
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": coords[0],
            "longitude": coords[1],
            "current": "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code",
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum",
            "timezone": "Asia/Kolkata",
            "forecast_days": 7
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return parse_weather_data(data, state_key)
    except Exception as e:
        print(f"Warning: Could not fetch weather data: {e}")
    
    return None


def parse_weather_data(data, state):
    """Parse Open-Meteo response into readable weather context."""
    weather_context = []
    
    current = data.get("current", {})
    if current:
        temp = current.get("temperature_2m", "N/A")
        humidity = current.get("relative_humidity_2m", "N/A")
        precip = current.get("precipitation", 0)
        rain = current.get("rain", 0)
        
        weather_context.append(f"Current weather in {state.replace('_', ' ').title()}:")
        weather_context.append(f"  - Temperature: {temp}°C, Humidity: {humidity}%")
        
        if rain > 0 or precip > 0:
            weather_context.append(f"  - Precipitation: {precip}mm (Rain: {rain}mm)")
            weather_context.append("  - Impact: Rain may affect transportation and mandi arrivals, potentially increasing prices.")
        else:
            weather_context.append("  - No precipitation currently.")
    
    daily = data.get("daily", {})
    if daily:
        precip_sum = daily.get("precipitation_sum", [])
        temp_max = daily.get("temperature_2m_max", [])
        
        total_rain_7days = sum(p for p in precip_sum if p) if precip_sum else 0
        avg_max_temp = sum(t for t in temp_max if t) / len(temp_max) if temp_max else 0
        
        weather_context.append(f"7-day forecast summary:")
        weather_context.append(f"  - Total expected precipitation: {total_rain_7days:.1f}mm")
        weather_context.append(f"  - Average max temperature: {avg_max_temp:.1f}°C")
        
        if total_rain_7days > 50:
            weather_context.append("  - Heavy rain expected: May cause supply disruptions and price spikes for perishables.")
        elif total_rain_7days > 20:
            weather_context.append("  - Moderate rain expected: Could affect vegetable arrivals and prices.")
        
        if avg_max_temp > 38:
            weather_context.append("  - High temperatures: May reduce shelf life of perishables, affecting prices.")
        elif avg_max_temp < 15:
            weather_context.append("  - Cool weather: Good for vegetable storage and transport.")
    
    return "\n".join(weather_context)


def retrieve_context(query_dict):
    """Retrieve context from knowledge base and weather API."""
    kb = load_knowledge_base()
    
    all_facts = []
    for key, value in kb.items():
        if key in ["sources", "data_sources"]:
            continue
        if isinstance(value, list):
            all_facts.extend(value)
        elif isinstance(value, dict):
            for sub_value in value.values():
                if isinstance(sub_value, list):
                    all_facts.extend(sub_value)
    
    context_parts = ['\n'.join(all_facts)]
    
    state = query_dict.get("state", "")
    weather_data = fetch_weather_data(state)
    if weather_data:
        context_parts.append("\n--- CURRENT WEATHER CONDITIONS ---")
        context_parts.append(weather_data)
    
    return '\n'.join(context_parts)