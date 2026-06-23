import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import pickle
import os

DATA_DIR = r"c:\Smart Farm"
MODEL_DIR = "."

def train_fertilizer_model():
    df = pd.read_csv(os.path.join(DATA_DIR, "Soil", "data_core.csv"))
    le_soil = LabelEncoder()
    df['Soil Type'] = le_soil.fit_transform(df['Soil Type'])
    le_crop = LabelEncoder()
    df['Crop Type'] = le_crop.fit_transform(df['Crop Type'])
    
    X = df[['Temparature', 'Humidity', 'Moisture', 'Soil Type', 'Crop Type', 'Nitrogen', 'Potassium', 'Phosphorous']]
    y = df['Fertilizer Name']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    with open(os.path.join(MODEL_DIR, "fertilizer_model.pkl"), "wb") as f:
        pickle.dump(model, f)
    with open(os.path.join(MODEL_DIR, "le_soil.pkl"), "wb") as f:
        pickle.dump(le_soil, f)
    with open(os.path.join(MODEL_DIR, "le_crop.pkl"), "wb") as f:
        pickle.dump(le_crop, f)

def train_yield_model():
    df = pd.read_csv(os.path.join(DATA_DIR, "Crop Recommendation", "crop_yield_data.csv"))
    
    X = df[['rainfall_mm', 'soil_quality_index', 'farm_size_hectares', 'sunlight_hours', 'fertilizer_kg']]
    y = df['crop_yield']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    with open(os.path.join(MODEL_DIR, "yield_model.pkl"), "wb") as f:
        pickle.dump(model, f)

def train_disease_model():
    df = pd.read_csv(os.path.join(DATA_DIR, "Crop Disease", "Smart_Farming_Crop_Yield_2024.csv"))
    X = df[['soil_moisture_%', 'soil_pH', 'temperature_C', 'rainfall_mm', 'humidity_%']]
    y = df['crop_disease_status']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    with open(os.path.join(MODEL_DIR, "disease_model.pkl"), "wb") as f:
        pickle.dump(model, f)

def train_crop_recommendation_model():
    dataset_path = os.path.join(DATA_DIR, "Crop Recommendation", "crop_remmendation_dataset.csv")
    if not os.path.exists(dataset_path):
        print(f"Crop dataset not found: {dataset_path}")
        return
    df = pd.read_csv(dataset_path)
    X = df[['N', 'P', 'K', 'Soil_pH', 'Soil_Moisture', 'Temperature', 'Humidity', 'Rainfall']]
    y = df['Recommended_Crop']
    le_rec_crop = LabelEncoder()
    y = le_rec_crop.fit_transform(y)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    with open(os.path.join(MODEL_DIR, "crop_recommendation_model.pkl"), "wb") as f:
        pickle.dump(model, f)
    with open(os.path.join(MODEL_DIR, "le_rec_crop.pkl"), "wb") as f:
        pickle.dump(le_rec_crop, f)

def train_image_disease_model():
    train_dir = os.path.join(DATA_DIR, "Crop Disease", "Train")
    val_dir = os.path.join(DATA_DIR, "Crop Disease", "Validation")
    
    if not os.path.exists(train_dir):
        print(f"Training directory not found: {train_dir}")
        return
        
    try:
        import tensorflow as tf
        from tensorflow.keras.preprocessing.image import ImageDataGenerator
        from tensorflow.keras.applications import MobileNetV2
        from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
        from tensorflow.keras.models import Model
    except Exception as e:
        print(f"Required libraries (tensorflow) not available: {e}")
        return

    print("Pre-processing images...")
    # Faster performance: smaller target size or subset
    train_datagen = ImageDataGenerator(rescale=1./255, rotation_range=10, horizontal_flip=True)
    val_datagen = ImageDataGenerator(rescale=1./255)

    train_generator = train_datagen.flow_from_directory(
        train_dir, target_size=(224, 224), batch_size=64, class_mode='categorical'
    )
    val_generator = val_datagen.flow_from_directory(
        val_dir, target_size=(224, 224), batch_size=64, class_mode='categorical'
    )

    print("Building MobileNetV2 Model...")
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    base_model.trainable = False
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.2)(x)
    predictions = Dense(len(train_generator.class_indices), activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    print("Starting training (Limited to 2 epochs for speed)...")
    try:
        # Use steps_per_epoch to limit training time if needed
        model.fit(
            train_generator, 
            epochs=2, 
            steps_per_epoch=max(1, train_generator.samples // 128), # Train on a smaller subset for faster feedback
            validation_data=val_generator,
            validation_steps=max(1, val_generator.samples // 128)
        )
        model.save(os.path.join(MODEL_DIR, "disease_model.h5"))
        
        # Save class indices
        import json
        with open(os.path.join(MODEL_DIR, "class_indices.json"), "w") as f:
            json.dump(train_generator.class_indices, f)
        print("Image model and indices saved successfully.")
    except Exception as e:
        print(f"Training failed: {e}")

if __name__ == "__main__":
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
    
    print("Starting comprehensive model training...")
    try: train_fertilizer_model()
    except Exception as e: print(f"Fertilizer Model Error: {e}")
    
    try: train_yield_model()
    except Exception as e: print(f"Yield Model Error: {e}")
    
    try: train_crop_recommendation_model()
    except Exception as e: print(f"Crop Model Error: {e}")
    
    try: train_image_disease_model()
    except Exception as e: print(f"Image Disease Model Error: {e}")
    
    print("All training tasks attempted.")
