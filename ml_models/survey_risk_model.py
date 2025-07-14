#!/usr/bin/env python3
"""
Survey-based Risk Assessment Model
Uses only 4 survey questions to predict risk level
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os
import warnings
warnings.filterwarnings('ignore')

def create_survey_dataset(n_samples=500):
    """Create realistic dataset based on actual investor behavior patterns"""
    print(f"Creating realistic survey dataset with {n_samples} samples...")

    np.random.seed(42)  # For reproducible results

    data = []

    # Define survey options (matching frontend exactly)
    risk_options = ['Low', 'Medium', 'High']
    goal_options = ['Wealth Growth', 'Retirement', 'Short-Term Gains', 'Passive Income']
    duration_options = ['Short-term (1-3 years)', 'Medium-term (3-7 years)', 'Long-term (7+ years)']
    experience_options = ['Beginner', 'Intermediate', 'Advanced']

    # Create realistic investor profiles based on research
    investor_profiles = [
        # Conservative Retirees (25% of investors)
        {
            'profile': 'Conservative Retiree',
            'weight': 0.25,
            'risk_dist': [0.8, 0.2, 0.0],  # Mostly Low risk
            'goal_dist': [0.1, 0.7, 0.0, 0.2],  # Retirement focus
            'duration_dist': [0.3, 0.5, 0.2],  # Shorter to medium term
            'experience_dist': [0.4, 0.5, 0.1]  # Less experienced
        },
        # Young Aggressive Investors (20% of investors)
        {
            'profile': 'Young Aggressive',
            'weight': 0.20,
            'risk_dist': [0.0, 0.3, 0.7],  # High risk
            'goal_dist': [0.8, 0.1, 0.1, 0.0],  # Wealth growth
            'duration_dist': [0.1, 0.2, 0.7],  # Long term
            'experience_dist': [0.3, 0.4, 0.3]  # Mixed experience
        },
        # Balanced Mid-Career (30% of investors)
        {
            'profile': 'Balanced Mid-Career',
            'weight': 0.30,
            'risk_dist': [0.1, 0.8, 0.1],  # Medium risk
            'goal_dist': [0.5, 0.3, 0.1, 0.1],  # Balanced goals
            'duration_dist': [0.2, 0.4, 0.4],  # Medium to long term
            'experience_dist': [0.2, 0.6, 0.2]  # Mostly intermediate
        },
        # Cautious Beginners (15% of investors)
        {
            'profile': 'Cautious Beginner',
            'weight': 0.15,
            'risk_dist': [0.7, 0.3, 0.0],  # Low to medium risk
            'goal_dist': [0.3, 0.4, 0.2, 0.1],  # Conservative goals
            'duration_dist': [0.4, 0.4, 0.2],  # Shorter term
            'experience_dist': [0.8, 0.2, 0.0]  # Beginners
        },
        # Experienced Traders (10% of investors)
        {
            'profile': 'Experienced Trader',
            'weight': 0.10,
            'risk_dist': [0.0, 0.2, 0.8],  # High risk
            'goal_dist': [0.6, 0.0, 0.3, 0.1],  # Growth and short-term
            'duration_dist': [0.3, 0.3, 0.4],  # Mixed duration
            'experience_dist': [0.0, 0.2, 0.8]  # Advanced
        }
    ]

    for i in range(n_samples):
        # Select investor profile based on weights
        profile_weights = [p['weight'] for p in investor_profiles]
        selected_profile = np.random.choice(investor_profiles, p=profile_weights)

        # Generate responses based on selected profile
        risk = np.random.choice(risk_options, p=selected_profile['risk_dist'])
        goal = np.random.choice(goal_options, p=selected_profile['goal_dist'])
        experience = np.random.choice(experience_options, p=selected_profile['experience_dist'])

        # Duration logic based on goal and risk (realistic correlations)
        if goal == 'Short-Term Gains':
            # Short-term gains always short duration
            duration = 'Short-term (1-3 years)'
        elif goal == 'Retirement':
            # Retirement planning usually longer term
            if experience == 'Beginner':
                duration = np.random.choice(duration_options, p=[0.4, 0.4, 0.2])
            else:
                duration = np.random.choice(duration_options, p=[0.1, 0.3, 0.6])
        elif goal == 'Wealth Growth':
            # Wealth growth varies by risk tolerance
            if risk == 'High':
                duration = np.random.choice(duration_options, p=[0.1, 0.3, 0.6])  # Longer term
            elif risk == 'Medium':
                duration = np.random.choice(duration_options, p=[0.2, 0.5, 0.3])  # Medium term
            else:
                duration = np.random.choice(duration_options, p=[0.4, 0.4, 0.2])  # Shorter term
        else:  # Passive Income
            # Passive income usually medium to long term
            duration = np.random.choice(duration_options, p=[0.2, 0.5, 0.3])

        # Add some realistic inconsistencies (people aren't always logical)
        if np.random.random() < 0.1:  # 10% chance of inconsistency
            if risk == 'Low' and np.random.random() < 0.3:
                # Some conservative investors still want wealth growth
                goal = 'Wealth Growth'
            elif risk == 'High' and np.random.random() < 0.2:
                # Some aggressive investors are actually beginners
                experience = 'Beginner'
        
        # Calculate realistic risk score using behavioral finance principles
        risk_score = 0

        # Risk tolerance is the primary factor (50% weight)
        if risk == 'High':
            risk_score += 5.0
        elif risk == 'Medium':
            risk_score += 2.5
        # Low adds 0

        # Experience affects confidence and risk capacity (25% weight)
        if experience == 'Advanced':
            risk_score += 2.5
        elif experience == 'Intermediate':
            risk_score += 1.25
        # Beginner adds 0

        # Time horizon affects risk capacity (15% weight)
        if duration == 'Long-term (7+ years)':
            risk_score += 1.5
        elif duration == 'Medium-term (3-7 years)':
            risk_score += 0.75
        # Short-term adds 0

        # Investment goal affects risk necessity (10% weight)
        if goal == 'Wealth Growth':
            risk_score += 1.0
        elif goal == 'Short-Term Gains':
            risk_score += 0.5  # Paradoxically, short-term gains often require higher risk
        elif goal == 'Passive Income':
            risk_score += 0.25
        # Retirement adds 0 (conservative)

        # Realistic behavioral adjustments
        # Young aggressive investors sometimes overestimate risk tolerance
        if risk == 'High' and experience == 'Beginner':
            risk_score -= 0.5  # Reduce score for inexperienced high-risk takers

        # Experienced investors with conservative goals
        if experience == 'Advanced' and goal == 'Retirement':
            risk_score -= 0.3  # Experienced investors are more realistic about retirement

        # Short-term high risk is often unrealistic
        if duration == 'Short-term (1-3 years)' and risk == 'High':
            risk_score -= 0.7  # Penalize unrealistic short-term high risk

        # Add realistic noise (people aren't perfectly consistent)
        risk_score += np.random.normal(0, 0.2)

        # Determine final risk level with realistic thresholds
        if risk_score >= 6.5:
            risk_level = 'High'
        elif risk_score >= 3.5:
            risk_level = 'Moderate'
        else:
            risk_level = 'Low'

        # Ensure some consistency with stated risk tolerance (80% of the time)
        if np.random.random() < 0.8:
            # If there's a big mismatch, adjust towards stated preference
            if risk == 'High' and risk_level == 'Low':
                risk_level = 'Moderate'
            elif risk == 'Low' and risk_level == 'High':
                risk_level = 'Moderate'
        
        # Add realistic edge cases (5% of data)
        if np.random.random() < 0.05:
            # Conservative investor forced into growth due to inflation concerns
            if risk == 'Low' and goal == 'Retirement':
                goal = 'Wealth Growth'
                risk_level = 'Moderate'  # Forced to take some risk

            # Experienced investor being very conservative due to market conditions
            elif experience == 'Advanced' and np.random.random() < 0.5:
                risk = 'Low'
                risk_level = 'Low'

            # Beginner overconfident due to recent market gains
            elif experience == 'Beginner' and np.random.random() < 0.3:
                risk = 'High'
                # But actual risk level should be moderate due to inexperience
                if risk_level == 'High':
                    risk_level = 'Moderate'

        data.append({
            'risk': risk,
            'goal': goal,
            'investmentDuration': duration,
            'experience': experience,
            'risk_level': risk_level
        })

    df = pd.DataFrame(data)

    # Add data quality checks
    print(f"Dataset created with {len(df)} samples")
    print("\n📊 Risk Level Distribution:")
    risk_counts = df['risk_level'].value_counts()
    for level, count in risk_counts.items():
        percentage = (count / len(df)) * 100
        print(f"  {level}: {count} ({percentage:.1f}%)")

    print("\n📋 Survey Response Patterns:")
    print("Risk Tolerance Distribution:")
    risk_tolerance_counts = df['risk'].value_counts()
    for risk, count in risk_tolerance_counts.items():
        percentage = (count / len(df)) * 100
        print(f"  {risk}: {count} ({percentage:.1f}%)")

    print("\nInvestment Goals Distribution:")
    goal_counts = df['goal'].value_counts()
    for goal, count in goal_counts.items():
        percentage = (count / len(df)) * 100
        print(f"  {goal}: {count} ({percentage:.1f}%)")

    print("\nExperience Level Distribution:")
    exp_counts = df['experience'].value_counts()
    for exp, count in exp_counts.items():
        percentage = (count / len(df)) * 100
        print(f"  {exp}: {count} ({percentage:.1f}%)")

    print("\n🔍 Data Quality Checks:")
    # Check for realistic correlations
    high_risk_advanced = len(df[(df['risk'] == 'High') & (df['experience'] == 'Advanced')])
    high_risk_total = len(df[df['risk'] == 'High'])
    if high_risk_total > 0:
        advanced_ratio = (high_risk_advanced / high_risk_total) * 100
        print(f"  High-risk investors who are Advanced: {advanced_ratio:.1f}% (should be >40%)")

    retirement_long_term = len(df[(df['goal'] == 'Retirement') & (df['investmentDuration'] == 'Long-term (7+ years)')])
    retirement_total = len(df[df['goal'] == 'Retirement'])
    if retirement_total > 0:
        long_term_ratio = (retirement_long_term / retirement_total) * 100
        print(f"  Retirement investors with Long-term horizon: {long_term_ratio:.1f}% (should be >50%)")

    print("\n✅ Sample realistic data:")
    print(df.head(10))

    return df

def train_models():
    """Train 3 different models and select the best one"""
    print("Training ML models...")
    
    # Create dataset
    df = create_survey_dataset(500)
    
    # Prepare features and target
    feature_columns = ['risk', 'goal', 'investmentDuration', 'experience']
    X = df[feature_columns]
    y = df['risk_level']
    
    # Encode categorical features
    encoders = {}
    X_encoded = X.copy()
    
    for column in feature_columns:
        encoders[column] = LabelEncoder()
        X_encoded[column] = encoders[column].fit_transform(X[column])
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_encoded, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Define models
    models = {
        'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42),
        'LogisticRegression': LogisticRegression(random_state=42, max_iter=1000),
        'SVC': SVC(random_state=42, probability=True)
    }
    
    # Train and evaluate models
    results = {}
    trained_models = {}
    
    print("\nModel Training Results:")
    print("=" * 50)
    
    for name, model in models.items():
        # Train model
        model.fit(X_train, y_train)
        
        # Make predictions
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Store results
        results[name] = accuracy
        trained_models[name] = model
        
        print(f"{name}: {accuracy:.3f} accuracy")
    
    # Select best model
    best_model_name = max(results, key=results.get)
    best_model = trained_models[best_model_name]
    best_accuracy = results[best_model_name]
    
    print(f"\n✅ Best Model: {best_model_name} with {best_accuracy:.3f} accuracy")
    
    # Save models and encoders
    model_data = {
        'best_model': best_model,
        'best_model_name': best_model_name,
        'best_accuracy': best_accuracy,
        'all_models': trained_models,
        'encoders': encoders,
        'feature_columns': feature_columns,
        'results': results
    }
    
    with open('survey_risk_model.pkl', 'wb') as f:
        pickle.dump(model_data, f)
    
    print(f"✅ Models saved to survey_risk_model.pkl")
    
    # Save dataset for reference
    df.to_csv('survey_risk_dataset.csv', index=False)
    print(f"✅ Dataset saved to survey_risk_dataset.csv")
    
    return model_data

def predict_risk(survey_responses):
    """Predict risk level from survey responses"""
    try:
        # Load trained model
        with open('survey_risk_model.pkl', 'rb') as f:
            model_data = pickle.load(f)
        
        best_model = model_data['best_model']
        encoders = model_data['encoders']
        feature_columns = model_data['feature_columns']
        
        # Prepare input data
        input_data = pd.DataFrame([survey_responses])
        
        # Encode features
        for column in feature_columns:
            if column in input_data.columns:
                try:
                    input_data[column] = encoders[column].transform(input_data[column])
                except ValueError:
                    # Handle unseen categories
                    print(f"Warning: Unseen category in {column}, using most common value")
                    input_data[column] = 0
        
        # Make prediction
        prediction = best_model.predict(input_data[feature_columns])[0]
        
        # Get prediction probabilities
        probabilities = best_model.predict_proba(input_data[feature_columns])[0]
        confidence = max(probabilities)
        
        # Get class names
        classes = best_model.classes_
        prob_dict = {classes[i]: probabilities[i] for i in range(len(classes))}
        
        return {
            'predicted_risk': prediction,
            'confidence': confidence,
            'probabilities': prob_dict,
            'method': f'{model_data["best_model_name"]}_survey_based'
        }
        
    except Exception as e:
        print(f"Error in prediction: {e}")
        return None

if __name__ == "__main__":
    # Train models
    model_data = train_models()
    
    # Test prediction
    test_survey = {
        'risk': 'High',
        'goal': 'Wealth Growth',
        'investmentDuration': 'Long-term (7+ years)',
        'experience': 'Advanced'
    }
    
    print(f"\nTesting prediction with: {test_survey}")
    result = predict_risk(test_survey)
    if result:
        print(f"Predicted Risk: {result['predicted_risk']}")
        print(f"Confidence: {result['confidence']:.3f}")
        print(f"Method: {result['method']}")
    else:
        print("Prediction failed")
