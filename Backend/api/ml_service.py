import numpy as np
import json
from PIL import Image
from google import genai
from django.apps import apps
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

client = genai.Client(api_key=os.getenv("API_KEY"))

def get_plant_type(image_file):
    try:
        image_file.seek(0) 
        vision_image = Image.open(image_file)
        prompt = """
        Identify the type of plant leaf in this image. 
        You must strictly choose from one of these four options: apple, corn, potato, tomato.
        Respond with ONLY the single word in lowercase. Do not include the word 'leaf'.
        """
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, vision_image]
        )
        
        # Grab exactly what the AI said
        raw_result = response.text.strip().lower()
        print(f"🧠 Gemini Vision saw: '{raw_result}'") # Debug print!
        
        # Bulletproof fuzzy matching
        if "apple" in raw_result: return "apple"
        if "corn" in raw_result: return "corn"
        if "potato" in raw_result: return "potato"
        if "tomato" in raw_result: return "tomato"
        
        return raw_result.replace(".", "")
        
    except Exception as e:
        print(f"Vision Error: {e}")
        return None
def generate_medical_json(plant_type, disease_name):
    """Asks Gemini to format the response exactly how your frontend wants it."""
    if "healthy" in disease_name.lower():
        return {
            "severity": "None",
            "weather_warning": "No current weather threats for healthy plants.",
            "symptoms": "Leaves appear green, vibrant, and free of blemishes.",
            "reasons": "Optimal growing conditions and good plant care.",
            "remedy": "Continue your current watering and sunlight routine!"
        }

    prompt = f"""
    You are an expert agricultural botanist. A {plant_type} leaf has been diagnosed with: {disease_name}.
    Return ONLY a valid JSON object with the following keys and detailed string values:
    "severity" (Low, Medium, or High),
    "weather_warning" (How weather affects this disease),
    "symptoms" (What to look for),
    "reasons" (Pathogen or cause),
    "remedy" (Step-by-step treatment)
    Do not include markdown formatting like ```json.
    """
    
    response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
    
    # Clean the response and parse it into a Python dictionary
    raw_text = response.text.strip()
    if raw_text.startswith("```json"):
        raw_text = raw_text[7:-3].strip()
        
    try:
        return json.loads(raw_text)
    except:
        return {"error": "Failed to parse LLM response"}

def process_image_pipeline(image_file):
    plant_type = get_plant_type(image_file)
    
    # Grab the active app configuration!
    api_config = apps.get_app_config('api')
    
    if not plant_type or plant_type not in api_config.expert_models:
        return {"error": f"Could not confidently identify an apple, corn, potato, or tomato leaf."}
    
    # 1. Run the CNN
    image_file.seek(0)
    img = Image.open(image_file).resize((224, 224))
    if img.mode != 'RGB':
        img = img.convert('RGB')
        
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # Use the active api_config here too
    selected_model = api_config.expert_models[plant_type]
    selected_labels = api_config.class_labels[plant_type]

    predictions = selected_model.predict(img_array, verbose=0)
    predicted_index = np.argmax(predictions[0])
    confidence = float(predictions[0][predicted_index] * 100)
    disease_name = selected_labels[predicted_index]

    # 2. Run the LLM
    llm_data = generate_medical_json(plant_type, disease_name)

    # 3. Build the final dictionary
    return {
        "name": disease_name.title(),
        "confidence": f"{confidence:.1f}%",
        "severity": llm_data.get("severity", "Unknown"),
        "weather_warning": llm_data.get("weather_warning", "N/A"),
        "symptoms": llm_data.get("symptoms", "N/A"),
        "reasons": llm_data.get("reasons", "N/A"),
        "remedy": llm_data.get("remedy", "N/A")
    }