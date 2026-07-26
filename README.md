# 🌾 Smart Farm AI Integrated System
 
A comprehensive AI-powered agricultural intelligence platform designed to help farmers make data-driven decisions for optimal crop production. This system leverages machine learning and deep learning models to provide intelligent recommendations for crop selection, fertilizer usage, yield prediction, and crop disease detection.
 
## 🌟 Features 

### 1. **Crop Recommendation System**
   - Recommends the best crop to plant based on:
     - Soil properties (Nitrogen, Phosphorus, Potassium levels)
     - Soil pH and moisture content
     - Climate conditions (Temperature, Humidity, Rainfall)
   - Uses machine learning classification models for accurate predictions

### 2. **Fertilizer Recommendation**
   - Provides personalized fertilizer recommendations based on:
     - Current soil composition (N, P, K levels)
     - Soil type classification
     - Crop type being cultivated
     - Environmental conditions (Temperature, Humidity, Moisture)
   - Helps optimize nutrient usage and reduce waste

### 3. **Crop Yield Prediction**
   - Predicts potential crop yield considering:
     - Rainfall patterns
     - Soil quality index
     - Farm size
     - Sunlight hours
     - Fertilizer application amount
   - Assists in production planning and resource allocation

### 4. **Disease Detection & Identification**
   - CNN-based deep learning model for plant disease detection
   - Analyzes crop leaf images to identify diseases
   - Provides:
     - Disease classification with confidence score
     - Disease description and information
     - Treatment and prevention recommendations

### 5. **Crop Cultivation Guide**
   - Searchable database of crop information
   - Detailed cultivation tips and best practices
   - Climate and soil requirements for different crops

### 6. **Climate Information**
   - Real-time and historical climate data
   - Weather patterns and seasonal insights
   - Climate impact on agricultural decisions

## 📋 Project Structure

```
Smart-Farm-AI-integrated-System/
├── backend/
│   ├── app.py                           # Flask application with API endpoints
│   ├── requirements.txt                 # Python dependencies
│   ├── train_models.py                  # Model training scripts
│   ├── train_disease_model.py          # CNN model training for disease detection
│   ├── fertilizer_model.pkl            # Trained fertilizer recommendation model
│   ├── yield_model.pkl                 # Trained yield prediction model
│   ├── crop_recommendation_model.pkl   # Trained crop recommendation model
│   ├── disease_model.h5                # Trained CNN model for disease detection
│   ├── class_indices.json              # Disease class mapping
│   ├── disease_info.json               # Disease information database
│   ├── crop_data.json                  # Crop data reference
│   └── le_*.pkl                        # Label encoders for categorical features
├── frontend/
│   ├── index.html                      # Home page
│   ├── crop_recommendation.html        # Crop recommendation interface
│   ├── fertilizer.html                 # Fertilizer recommendation interface
│   ├── yield.html                      # Yield prediction interface
│   ├── disease.html                    # Disease detection interface
│   ├── climate.html                    # Climate information page
│   ├── crop_guide.html                 # Crop cultivation guide
│   ├── Images/                         # Image storage for disease detection
│   └── static/
│       ├── css/
│       │   └── style.css               # Styling
│       └── js/
│           └── main.js                 # Frontend functionality
└── README.md                           # Project documentation
```

## 🛠️ Requirements

- **Python 3.7+**
- **Flask** - Web framework for backend
- **TensorFlow/Keras** - Deep learning framework for disease detection
- **scikit-learn** - Machine learning library
- **pandas** - Data manipulation
- **NumPy** - Numerical computing
- **Pillow** - Image processing
- **flask-cors** - Cross-Origin Resource Sharing support

## 📦 Installation

### Prerequisites
- Python 3.7 or higher
- pip package manager

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/Smart-Farm-AI-integrated-System.git
cd Smart-Farm-AI-integrated-System
```

### Step 2: Create a Virtual Environment (Recommended)
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 4: Prepare Models and Data
Ensure the following files are present in the `backend/` directory:
- Pre-trained model pickle files (`.pkl`)
- Disease detection model (`disease_model.h5`)
- Class indices and disease information JSON files
- Label encoders for categorical features

### Step 5: Run the Application
```bash
cd backend
python app.py
```

The application will start on `http://localhost:5000`

## 🚀 Usage

### Accessing the Web Interface
1. Open your browser and navigate to `http://localhost:5000`
2. Use the navigation menu to access different features:
   - **Recommend Crop** - Get crop recommendations
   - **Fertilizer** - Get fertilizer recommendations
   - **Crop Yield** - Predict crop yield
   - **Disease** - Detect crop diseases from images
   - **Climate** - View climate information

### API Endpoints

#### 1. Crop Recommendation
```
POST /api/predict/recommend-crop
Content-Type: application/json

{
  "N": 90,
  "P": 42,
  "K": 43,
  "ph": 6.5,
  "moisture": 80.5,
  "temperature": 21.5,
  "humidity": 82.0,
  "rainfall": 202.5
}
```
**Response:**
```json
{
  "prediction": "Rice"
}
```

#### 2. Fertilizer Recommendation
```
POST /api/predict/fertilizer
Content-Type: application/json

{
  "temperature": 25.5,
  "humidity": 70.0,
  "moisture": 60.0,
  "soil_type": "Loamy",
  "crop_type": "Rice",
  "nitrogen": 90,
  "potassium": 42,
  "phosphorous": 43
}
```
**Response:**
```json
{
  "prediction": "10-26-26 (NPK Ratio)"
}
```

#### 3. Yield Prediction
```
POST /api/predict/yield
Content-Type: application/json

{
  "rainfall": 202.5,
  "soil_quality": 7.5,
  "farm_size": 5.0,
  "sunlight": 8.5,
  "fertilizer_amount": 100.0
}
```
**Response:**
```json
{
  "prediction": 8.75
}
```

#### 4. Disease Detection
```
POST /api/predict/disease
Content-Type: multipart/form-data

file: <image_file>
```
**Response:**
```json
{
  "prediction": "Leaf Rust",
  "confidence": 95.3,
  "message": "AI Analysis (CNN Model)",
  "disease_info": {
    "description": "...",
    "treatment": "...",
    "prevention": "..."
  }
}
```

## 📊 Model Details

### Crop Recommendation Model
- **Type:** Classification (Random Forest/SVM)
- **Input Features:** 8 (N, P, K, pH, Moisture, Temperature, Humidity, Rainfall)
- **Output:** Recommended crop name

### Fertilizer Recommendation Model
- **Type:** Classification
- **Input Features:** 8 (Temperature, Humidity, Moisture, Soil Type, Crop Type, N, K, P)
- **Output:** Fertilizer NPK ratio

### Yield Prediction Model
- **Type:** Regression
- **Input Features:** 5 (Rainfall, Soil Quality, Farm Size, Sunlight, Fertilizer Amount)
- **Output:** Predicted yield (in appropriate units)

### Disease Detection Model
- **Type:** Convolutional Neural Network (CNN)
- **Architecture:** Deep learning model trained on plant disease images
- **Input:** Plant leaf images (224x224 pixels)
- **Output:** Disease classification with confidence score

## 🔧 Training Models

To retrain the models with new data:

```bash
cd backend
python train_models.py          # Train crop, fertilizer, and yield models
python train_disease_model.py   # Train disease detection CNN model
```

Ensure your training data is properly formatted and available in the expected locations.

## 📱 Frontend Features

- **Responsive Design:** Works on desktop, tablet, and mobile devices
- **Interactive UI:** User-friendly forms and real-time feedback
- **Image Upload:** Drag-and-drop interface for disease detection
- **Result Visualization:** Clear presentation of predictions and recommendations
- **Navigation:** Intuitive menu for accessing different features

## 🐛 Troubleshooting

### Issue: Models not loading
- **Solution:** Ensure all `.pkl` and `.h5` files are in the `backend/` directory
- Verify that file paths in `app.py` match your project structure

### Issue: Image upload not working
- **Solution:** Create an `Images/` directory in the project root
- Ensure proper permissions for file upload

### Issue: CORS errors
- **Solution:** CORS is already enabled in the Flask app
- Check that `flask-cors` is installed and imported

### Issue: Port 5000 already in use
- **Solution:** Use a different port by modifying `app.run(port=5001)`

## 📈 Future Enhancements

- [ ] Multi-language support
- [ ] Mobile application (iOS/Android)
- [ ] Real-time weather API integration
- [ ] Soil sensor data integration
- [ ] IoT device compatibility
- [ ] Predictive analytics and forecasting
- [ ] User authentication and profiles
- [ ] Historical data tracking and analytics
- [ ] Community forum for farmers
- [ ] Market price predictions

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Authors and Acknowledgments

- Built with ❤️ for the agricultural community
- Special thanks to the open-source community for amazing libraries and frameworks

## 📞 Contact & Support

For questions, suggestions, or bug reports, please:
- Open an issue on GitHub
- Contact the development team

---

**Smart Farm AI** - Empowering farmers with artificial intelligence 🚜🤖
