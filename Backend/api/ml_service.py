import numpy as np
import json
from PIL import Image
from google import genai
import os
import gc # 🔥 Python's Garbage Collector
import tf_keras as keras # 🔥 We need Keras here now to load the models
from django.conf import settings # 🔥 To safely find the file paths
from dotenv import load_dotenv
from gtts import gTTS
import io
import base64
import traceback

load_dotenv()  # Load environment variables from .env file

AVAILABLE_KEYS = [
    os.getenv("API_KEY_1"),
    os.getenv("API_KEY_2"),
    os.getenv("API_KEY_3"),
    os.getenv("API_KEY_4"),
    os.getenv("API_KEY_5")
]

VALID_KEYS = [key for key in AVAILABLE_KEYS if key]
current_key_index = 0 # Start with the first key

# 🔥 Define your labels here now, since apps.py is empty!
DISEASE_LABELS = {
    'apple': ["Apple - healthy", "Apple - Apple scab", "Apple - Cedar apple rust", "Apple - Black rot"],
    'corn': ["Corn - healthy", "Corn - Northern Leaf Blight", "Corn - Common rust", "Corn - Cercospora leaf spot Gray leaf spot"],
    'grapes': ["Grapes - healthy", "Grapes - Black rot", "Grapes - Esca (Black Measles)", "Grapes - Leaf Blight (Isariopsis Leaf Spot)"],
    'potato': ["Potato - healthy", "Potato - Early blight", "Potato - Late blight"],
    'tomato': ["Tomato - healthy", "Tomato - Early blight", "Tomato - Late blight", "Tomato - Bacterial spot", "Tomato - Leaf Mold", "Tomato - Septoria leaf spot", "Tomato - Spider mites", "Tomato - Target Spot", "Tomato - Tomato Yellow Leaf Curl Virus", "Tomato - Tomato mosaic virus"]
}

def generate_with_fallback(contents):
    """Wraps the Gemini call in a bulletproof auto-rotating loop."""
    global current_key_index
    attempts = 0
    
    while attempts < len(VALID_KEYS):
        try:
            client = genai.Client(api_key=VALID_KEYS[current_key_index])
            response = client.models.generate_content(
                model='gemini-2.5-flash', 
                contents=contents
            )
            return response 

        except Exception as e:
            print(f"\n⚠️ GEMINI KEY #{current_key_index + 1} FAILED: {e}")
            attempts += 1
            current_key_index = (current_key_index + 1) % len(VALID_KEYS)
            
            if attempts < len(VALID_KEYS):
                print(f"🔄 SILENTLY SWAPPING TO BACKUP KEY #{current_key_index + 1}...\n")
                
    raise Exception("❌ ALL GEMINI BACKUP KEYS HAVE FAILED!")

def generate_human_audio(disease_name, severity, symptoms, remedy, language="English"):
    print("\n" + "="*50)
    print("🎯 [1] generate_human_audio (Google TTS) called!")
    
    try:
        script = f"Diagnosis: {disease_name}. Risk level: {severity}. {symptoms} Here is the treatment plan: {remedy}"
        
        lang_map = {
            "English": "en",
            "Spanish": "es",
            "French": "fr",
            "German": "de",
            "Indonesian": "id"
        }
        tts_lang = lang_map.get(language, "en") 
        
        print(f"🎯 [2] Requesting Google Cloud Audio in language: {tts_lang}...")
        
        tts = gTTS(text=script, lang=tts_lang, slow=False)
        
        print("🎯 [3] Google responded! Encoding to Base64 in memory...")
        
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        audio_bytes = fp.getvalue()
        
        encoded_audio = base64.b64encode(audio_bytes).decode("utf-8")
        
        print("✅ SUCCESS! Returning Base64 string to React.")
        print("="*50 + "\n")
        
        return f"data:audio/mp3;base64,{encoded_audio}"
        
    except Exception as e:
        print("\n❌❌❌ GOOGLE TTS ERROR ❌❌❌")
        print(str(e))
        traceback.print_exc()
        print("=========================================\n")
        return None

def get_plant_type(image_file):
    try:
        image_file.seek(0) 
        vision_image = Image.open(image_file)
        prompt = """
        Identify the type of plant leaf in this image. 
        You must strictly choose from one of these four options: apple, corn, potato, tomato.
        Respond with ONLY the single word in lowercase. Do not include the word 'leaf'.
        """
        response = generate_with_fallback(contents=[prompt, vision_image])
        
        raw_result = response.text.strip().lower()
        print(f"🧠 Gemini Vision saw: '{raw_result}'") 
        
        if "apple" in raw_result: return "apple"
        if "corn" in raw_result: return "corn"
        if "potato" in raw_result: return "potato"
        if "tomato" in raw_result: return "tomato"
        
        return raw_result.replace(".", "")
        
    except Exception as e:
        print(f"Vision Error: {e}")
        return None

def generate_medical_json(plant_type, disease_name, language="English"):
    prompt = f"""
    You are an empathetic, highly knowledgeable agricultural advisor talking directly to a local farmer. 
    A {plant_type} crop has been analyzed. The diagnosis is: {disease_name}.
    
    CRITICAL RULES:
    1. Speak in clear, professional, but accessible language. Explain the "why" and "how".
    2. Give practical, cheap, and accessible solutions that a farmer can do today.
    3. DO NOT use any Markdown formatting. NEVER use asterisks (*) or bold text.
    4. YOU MUST TRANSLATE ALL VALUES IN YOUR JSON RESPONSE INTO {language.upper()}.
    
    Return ONLY a valid JSON object with the following keys. Do not include extra text.
    {{
        "severity": "Choose exactly one word (translated to {language}): Low, Medium, High, Critical, or None",
        "weather_warning": "1 to 2 sentences explaining how weather affects this condition (translated to {language}).",
        "symptoms": "A detailed paragraph describing visual symptoms, or describing healthy leaves if the plant is healthy (translated to {language}).",
        "reasons": "A detailed explanation of the root cause, or why it is healthy (translated to {language}).",
        "remedy": "Numbered list of 3 to 4 actionable steps (translated to {language})."
    }}
    """
    
    try:
        response = generate_with_fallback(contents=prompt)
    except Exception as e:
        raise Exception(e)
    
    raw_text = response.text.strip()
    
    if raw_text.startswith("```json"):
        raw_text = raw_text[7:]
    elif raw_text.startswith("```"):
        raw_text = raw_text[3:]
        
    if raw_text.endswith("```"):
        raw_text = raw_text[:-3]
        
    raw_text = raw_text.strip()
        
    try:
        return json.loads(raw_text)
    except Exception as e:
        print(f"JSON Parsing Error: {e}")
        print(f"Raw AI Output: {raw_text}")
        return {"error": "Failed to parse LLM response"}

def process_image_pipeline(image_file, language="English"):
    plant_type = get_plant_type(image_file)
    
    if not plant_type or plant_type not in DISEASE_LABELS:
        return {"error": f"Could not confidently identify an apple, corn, potato, or tomato leaf."}
    
    # 1. Prepare the Image
    image_file.seek(0)
    img = Image.open(image_file).resize((224, 224))
    if img.mode != 'RGB':
        img = img.convert('RGB')
        
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # ==========================================
    # 🔥 THE LAZY LOAD RAM SAVER
    # ==========================================
    print(f"🧠 Lazy loading the {plant_type} model...")
    model_path = os.path.join(settings.BASE_DIR, 'ml_models', f'{plant_type} model.h5')
    
    try:
        # Load the model, get the prediction, and immediately destroy it
        model = keras.models.load_model(model_path)
        predictions = model.predict(img_array, verbose=0)
        
        predicted_index = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_index] * 100)
        disease_name = DISEASE_LABELS[plant_type][predicted_index]
        
        # 🗑️ The Assassination Protocol (Freeing up Render's RAM)
        del model
        keras.backend.clear_session()
        gc.collect() 
        print("🗑️ Model wiped from RAM. Safe to proceed!")
        
    except Exception as e:
        print(f"⚠️ Model Execution Error: {e}")
        return {"error": f"Failed to run the local AI model for {plant_type}."}

    # 2. Run the LLM
    llm_data = generate_medical_json(plant_type, disease_name, language)

    # 3. Generate Audio
    print("🚀 Firing off Audio generation...")
    audio_base64 = generate_human_audio(
        disease_name.title(),
        llm_data.get("severity", ""),
        llm_data.get("symptoms", ""),
        llm_data.get("remedy", ""),
        language
    )

    # 4. Build the final dictionary
    return {
        "name": disease_name.title(),
        "confidence": f"{confidence:.1f}%",
        "severity": llm_data.get("severity", "Unknown"),
        "weather_warning": llm_data.get("weather_warning", "N/A"),
        "symptoms": llm_data.get("symptoms", "N/A"),
        "reasons": llm_data.get("reasons", "N/A"),
        "remedy": llm_data.get("remedy", "N/A"),
        "audio_data": audio_base64  
    }