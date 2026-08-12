from flask import Flask, request, jsonify, render_template, send_from_directory 
import pandas as pd
import pickle
import os
import json
from flask_cors import CORS 
        
app = Flask(__name__, static_folder="../frontend/static", template_folder="../frontend") 
CORS(app)   
# Image directory - adjust path based on project structure
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  
IMAGE_DIR = os.path.join(BASE_DIR, "Images")
# Fallback to absolute path if relative doesn't work
if not os.path.exists(IMAGE_DIR):
    IMAGE_DIR = r"c:\Smart Farm\Images"  
             
MODEL_DIR = "."  
DATA_DIR = "../data"

# Load Models (Lazy loading or global)
fertilizer_model = None
yield_model = None
crop_rec_model = None
le_rec_crop = None
disease_info = {}
disease_model_keras = None 
class_indices = {}  
def load_models():
    global fertilizer_model, yield_model, crop_rec_model, disease_model, le_soil, le_crop, le_rec_crop, disease_info, disease_model_keras, class_indices
    try:
        # Load Pickled Models
        with open(os.path.join(MODEL_DIR, "fertilizer_model.pkl"), "rb") as f:
            fertilizer_model = pickle.load(f)
        with open(os.path.join(MODEL_DIR, "yield_model.pkl"), "rb") as f:
            yield_model = pickle.load(f)
        with open(os.path.join(MODEL_DIR, "crop_recommendation_model.pkl"), "rb") as f:
            crop_rec_model = pickle.load(f)
        with open(os.path.join(MODEL_DIR, "le_soil.pkl"), "rb") as f:
            le_soil = pickle.load(f)
        with open(os.path.join(MODEL_DIR, "le_crop.pkl"), "rb") as f:
            le_crop = pickle.load(f)
        with open(os.path.join(MODEL_DIR, "le_rec_crop.pkl"), "rb") as f:
            le_rec_crop = pickle.load(f)
         
        # Load Disease Info Mapping
        with open(os.path.join(MODEL_DIR, "disease_info.json"), "r") as f:
            disease_info = json.load(f)
            
        # Try loading Keras Disease Model
        try: 
            import tensorflow as tf
            model_path = os.path.join(MODEL_DIR, "disease_model.h5")
            if os.path.exists(model_path):
                disease_model_keras = tf.keras.models.load_model(model_path)
                with open(os.path.join(MODEL_DIR, "class_indices.json"), "r") as f:
                    # Invert the mapping: {0: "Disease Name"}
                    indices = json.load(f)
                    class_indices = {v: k for k, v in indices.items()}
                print("CNN Disease Model loaded.")
            else:
                print("CNN Model (disease_model.h5) not found. Using simulation mode.")
        except Exception as e:
            print(f"Error loading Keras model: {e}")
            
        print("Models loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {e}")

load_models()
  
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/fertilizer.html')
def fertilizer_page():
    return render_template('fertilizer.html')

@app.route('/yield.html')
def yield_page():
    return render_template('yield.html')

@app.route('/disease.html')
def disease_page():
    return render_template('disease.html')

@app.route('/climate.html')
def climate_page():
    return render_template('climate.html')

@app.route('/recommend.html')
def recommend_page():
    return render_template('crop_recommendation.html')

@app.route('/api/predict/fertilizer', methods=['POST'])
def predict_fertilizer():
    try:  
        data = request.json
        # Input: Temparature, Humidity, Moisture, Soil Type, Crop Type, Nitrogen, Potassium, Phosphorous
        
        # Encode inputs
        soil_enc = le_soil.transform([data['soil_type']])[0]
        crop_enc = le_crop.transform([data['crop_type']])[0]
        
        features = [[
            float(data['temperature']),
            float(data['humidity']),
            float(data['moisture']),
            soil_enc,
            crop_enc,
            float(data['nitrogen']),
            float(data['potassium']),
            float(data['phosphorous']) 
        ]]
        
        prediction = fertilizer_model.predict(features)[0]
        return jsonify({'prediction': prediction})
    except Exception as e:
        # print error to console for debugging
        print(e)
        return jsonify({'error': str(e)}), 400

@app.route('/api/predict/yield', methods=['POST'])
def predict_yield():
    try:
        data = request.json
        # Input: rainfall_mm, soil_quality_index, farm_size_hectares, sunlight_hours, fertilizer_kg
        features = [[
            float(data['rainfall']),
            float(data['soil_quality']),
            float(data['farm_size']),
            float(data['sunlight']),
            float(data['fertilizer_amount'])
        ]]
        
        prediction = yield_model.predict(features)[0]
        return jsonify({'prediction': round(prediction, 2)})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/predict/recommend-crop', methods=['POST'])
def predict_crop_recommendation():
    try:
        data = request.json
        # Columns: N, P, K, Soil_pH, Soil_Moisture, Temperature, Humidity, Rainfall
        features = [[
            float(data['N']),
            float(data['P']),
            float(data['K']),
            float(data['ph']),
            float(data['moisture']),
            float(data['temperature']),
            float(data['humidity']),
            float(data['rainfall'])
        ]]
        
        pred_idx = crop_rec_model.predict(features)[0]
        prediction = le_rec_crop.inverse_transform([pred_idx])[0]
        return jsonify({'prediction': prediction})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/predict/disease', methods=['POST'])
def predict_disease():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        prediction = "Unknown"
        confidence = 0.0
        message = ""

        if disease_model_keras:
            # REAL CNN PREDICTION
            import numpy as np
            from tensorflow.keras.preprocessing import image
            
            # Save temporary file
            temp_path = os.path.join(IMAGE_DIR, "temp_predict.jpg")
            file.save(temp_path)
            
            img = image.load_img(temp_path, target_size=(224, 224))
            x = image.img_to_array(img)
            x = np.expand_dims(x, axis=0)
            x = x / 255.0
            
            preds = disease_model_keras.predict(x)
            pred_idx = np.argmax(preds[0])
            confidence = float(np.max(preds[0]) * 100)
            prediction = class_indices.get(pred_idx, "Unknown Disease")
            message = "AI Analysis (CNN Model)"
            
            # Remove temp file
            os.remove(temp_path)
        else:
            # FALLBACK / SIMULATION with Real Mapping
            import random
            available_classes = list(disease_info.keys()) if disease_info else [
                "Rice Blast", "Brownspot", "Common_Rust", "Leaf smut", "Tungro"
            ]
            prediction = random.choice(available_classes)
            confidence = round(random.uniform(85.0, 99.9), 2)
            message = "Simulated Analysis (Model Training in Progress)"

        # Fetch extra info
        if confidence < 20.0:
            prediction = "Healthy/Safe"
            info = {
                "advice": "The given crop is safe, check daily to keep it from disease.",
                "impact": "No disease detected with high confidence. Potential for 100% expected yield."
            }
        else:
            info = disease_info.get(prediction, {
                "advice": "Consult an agricultural expert for specific treatments.",
                "impact": "Severity varies. Monitor crop health closely."
            })
        
        return jsonify({
            'prediction': prediction,
            'confidence': round(confidence, 2),
            'advice': info['advice'],
            'impact': info['impact'],
            'message': message
        })
    except Exception as e:
        print(f"Disease prediction error: {e}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '').lower()
        
        response = ""
        
        # Simple Keyword Matching Logic
        if 'hello' in message or 'hi' in message or 'hey' in message:
            response = "Hello! I am your Smart Farm Assistant. How can I help you today?"
        elif 'fertilizer' in message:
            response = "For fertilizer recommendations, I need to know your soil nutrients (N, P, K). You can use our <a href='/fertilizer.html'>Fertilizer Tool</a>."
        elif 'yield' in message:
            response = "I can predict crop yield based on rainfall and soil quality. Check out the <a href='/yield.html'>Yield Prediction Tool</a>."
        elif 'disease' in message or 'sick' in message:
            response = "If your plants look sick, upload a photo in our <a href='/disease.html'>Disease Analysis Tool</a> to identify the issue."
        elif 'climate' in message or 'weather' in message:
            response = "Climate trends are vital! View historical data on our <a href='/climate.html'>Climate Dashboard</a>."
        elif 'soil' in message:
            response = "Soil health is key. Nitrogen, Phosphorus, and Potassium are the main nutrients we analyze."
        elif 'how' in message or "what" in message and 'smart farm' in message:
            response = "That is a great question! This website was developed for African farmers to increase crop productivity " \
            "by providing comprehensive advice throughout the entire crop production cycle. For instance, farmers " \
            "can receive crop recommendations based on suitable soil and climate conditions before planting. After " \
            "planting, they can access fertilizer recommendations and perform disease tests to identify and prevent " \
            "crop diseases before they cause significant damage."
        
        else:
            response = "I'm still learning! Ask me about fertilizers, crop yield, plant diseases, or climate trends."
            
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/climate-data', methods=['GET'])
def get_climate_data():
    try:
        df = pd.read_csv(r"c:\Smart Farm\Climate\climate_change_impact_on_agriculture_2024.csv")
        # Aggregate data by Year for simple visualization
        # Columns: Year, Average_Temperature_C, Total_Precipitation_mm, CO2_Emissions_MT
        df_agg = df.groupby('Year')[['Average_Temperature_C', 'Total_Precipitation_mm', 'CO2_Emissions_MT']].mean().reset_index()
        return jsonify(df_agg.to_dict(orient='records'))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/images/list', methods=['GET'])
def list_images():
    """List all available images from the Images folder"""
    try:
        if not os.path.exists(IMAGE_DIR):
            return jsonify({'images': [], 'error': 'Images directory not found'})
        
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        images = []
        for filename in os.listdir(IMAGE_DIR):
            if any(filename.lower().endswith(ext) for ext in image_extensions):
                images.append({
                    'name': filename,
                    'url': f'/api/images/{filename}'
                })
        return jsonify({'images': images})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/images/<filename>')
def serve_image(filename):
    """Serve images from the Images folder"""
    try:
        # Security: prevent directory traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            return jsonify({'error': 'Invalid filename'}), 400
        
        file_path = os.path.join(IMAGE_DIR, filename)
        if not os.path.exists(file_path):
            return jsonify({'error': f'Image not found: {filename}'}), 404
        
        return send_from_directory(IMAGE_DIR, filename)
    except Exception as e:
        print(f"Error serving image {filename}: {e}")
        return jsonify({'error': str(e)}), 404

# Load Crop Data
import json
crop_data = {}
try:
    with open(os.path.join(os.path.dirname(__file__), "crop_data.json"), "r") as f:
        crop_data = json.load(f)
    print("Crop data loaded successfully.")
except Exception as e:
    print(f"Error loading crop data: {e}")

@app.route('/api/guide', methods=['GET'])
def get_crop_guide():
    try:
        query = request.args.get('crop', '').lower().strip()
        if not query:
            return jsonify({'error': 'No crop specified'}), 400
        
        # Exact match or fuzzy search could be implemented here
        # For now, let's try direct key access or partial match
        
        if query in crop_data:
            return jsonify(crop_data[query])
        
        # Try to find a close match
        for key in crop_data:
            if query in key or key in query:
                return jsonify(crop_data[key])
                
        return jsonify({'error': 'Crop not found in database'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
