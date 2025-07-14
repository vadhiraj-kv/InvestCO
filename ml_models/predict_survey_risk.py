#!/usr/bin/env python3
"""
Predict risk level from survey responses
Usage: python predict_survey_risk.py '{"risk": "High", "goal": "Wealth Growth", "investmentDuration": "Long-term (7+ years)", "experience": "Advanced"}'
"""

import sys
import json
import pandas as pd
import pickle
import warnings
warnings.filterwarnings('ignore')

def predict_risk_from_survey(survey_data):
    """Predict risk level from survey responses"""
    try:
        # Load trained model
        with open('survey_risk_model.pkl', 'rb') as f:
            model_data = pickle.load(f)
        
        # Get all models and try each one
        all_models = model_data['all_models']
        encoders = model_data['encoders']
        feature_columns = model_data['feature_columns']
        
        # Prepare input data
        input_data = pd.DataFrame([survey_data])
        
        # Encode features
        input_encoded = input_data.copy()
        for column in feature_columns:
            if column in input_data.columns:
                try:
                    input_encoded[column] = encoders[column].transform(input_data[column])
                except ValueError:
                    # Handle unseen categories by using the most common encoded value
                    input_encoded[column] = 0
        
        # Try all models and get the one with highest confidence
        best_prediction = None
        best_confidence = 0
        best_model_name = None
        
        for model_name, model in all_models.items():
            try:
                # Make prediction
                prediction = model.predict(input_encoded[feature_columns])[0]
                probabilities = model.predict_proba(input_encoded[feature_columns])[0]
                confidence = max(probabilities)
                
                # Keep track of best prediction
                if confidence > best_confidence:
                    best_confidence = confidence
                    best_prediction = prediction
                    best_model_name = model_name
                    
                    # Get class names and probabilities
                    classes = model.classes_
                    prob_dict = {classes[i]: probabilities[i] for i in range(len(classes))}
                    
            except Exception as e:
                print(f"Error with model {model_name}: {e}", file=sys.stderr)
                continue
        
        if best_prediction is None:
            raise Exception("All models failed to make prediction")
        
        return {
            'predicted_risk': best_prediction,
            'confidence': best_confidence,
            'probabilities': prob_dict,
            'method': f'{best_model_name}_survey_ml',
            'model_used': best_model_name
        }
        
    except FileNotFoundError:
        # Fallback if model file doesn't exist
        return fallback_prediction(survey_data)
    except Exception as e:
        print(f"ML prediction error: {e}", file=sys.stderr)
        return fallback_prediction(survey_data)

def fallback_prediction(survey_data):
    """Rule-based fallback prediction"""
    risk_score = 0
    
    # Risk tolerance (40% weight)
    risk = survey_data.get('risk', 'Medium')
    if risk == 'High':
        risk_score += 4
    elif risk == 'Medium':
        risk_score += 2
    
    # Experience (25% weight)
    experience = survey_data.get('experience', 'Intermediate')
    if experience == 'Advanced':
        risk_score += 2.5
    elif experience == 'Intermediate':
        risk_score += 1.25
    
    # Time horizon (20% weight)
    duration = survey_data.get('investmentDuration', 'Medium-term (3-7 years)')
    if 'Long-term' in duration:
        risk_score += 2
    elif 'Medium-term' in duration:
        risk_score += 1
    
    # Goal (15% weight)
    goal = survey_data.get('goal', 'Wealth Growth')
    if goal == 'Wealth Growth':
        risk_score += 1.5
    elif goal == 'Passive Income':
        risk_score += 0.75
    
    # Determine risk level
    if risk_score >= 6.0:
        predicted_risk = 'High'
        confidence = 0.75
    elif risk_score >= 3.0:
        predicted_risk = 'Moderate'
        confidence = 0.78
    else:
        predicted_risk = 'Low'
        confidence = 0.72
    
    return {
        'predicted_risk': predicted_risk,
        'confidence': confidence,
        'probabilities': {
            'Low': confidence if predicted_risk == 'Low' else (1 - confidence) / 2,
            'Moderate': confidence if predicted_risk == 'Moderate' else (1 - confidence) / 2,
            'High': confidence if predicted_risk == 'High' else (1 - confidence) / 2
        },
        'method': 'rule_based_fallback',
        'model_used': 'fallback'
    }

def main():
    if len(sys.argv) != 2:
        print("Usage: python predict_survey_risk.py '<survey_json>'", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Parse input JSON
        survey_json = sys.argv[1]
        survey_data = json.loads(survey_json)
        
        # Make prediction
        result = predict_risk_from_survey(survey_data)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except json.JSONDecodeError as e:
        print(f"Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Prediction error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
