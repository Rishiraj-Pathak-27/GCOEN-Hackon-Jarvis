"""
Train an improved triage classification model with:
- Balanced dataset
- Class weighting
- Better hyperparameters
- Cross-validation
"""

import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib
import numpy as np

print("=" * 60)
print("Training Improved Triage Model v3")
print("=" * 60)

# Load the balanced dataset
df = pd.read_csv("triage_dataset_balanced.csv")

print(f"\nDataset size: {len(df)} records")
print("\nPriority Distribution:")
print(df['priority'].value_counts())

# Encode categorical columns
le_symptom = LabelEncoder()
le_history = LabelEncoder()
le_blood_group = LabelEncoder()
le_blood_available = LabelEncoder()
le_priority = LabelEncoder()

df["symptom"] = le_symptom.fit_transform(df["symptom"])
df["medical_history"] = le_history.fit_transform(df["medical_history"])
df["blood_group"] = le_blood_group.fit_transform(df["blood_group"])
df["blood_available"] = le_blood_available.fit_transform(df["blood_available"])
df["priority"] = le_priority.fit_transform(df["priority"])

print("\nPriority class mapping:")
for i, cls in enumerate(le_priority.classes_):
    print(f"  {i} -> {cls}")

# Features and target
X = df.drop("priority", axis=1)
y = df["priority"]

print(f"\nFeatures: {list(X.columns)}")

# Train-test split with stratification
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTraining set: {len(X_train)} samples")
print(f"Test set: {len(X_test)} samples")

# Train model with class weighting and optimized hyperparameters
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    min_samples_split=5,
    min_samples_leaf=2,
    class_weight='balanced',  # Important for handling any remaining imbalance
    random_state=42,
    n_jobs=-1
)

print("\nTraining Random Forest model...")
model.fit(X_train, y_train)

# Cross-validation score
cv_scores = cross_val_score(model, X_train, y_train, cv=5)
print(f"\nCross-validation accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")

# Predictions
y_pred = model.predict(X_test)

# Evaluation
print("\n" + "=" * 60)
print("Model Evaluation (Test Data)")
print("=" * 60)
print(f"\nAccuracy: {accuracy_score(y_test, y_pred):.4f}")

print("\nClassification Report:")
unique_classes = sorted(list(set(y_test) | set(y_pred)))
print(classification_report(
    y_test, y_pred, 
    labels=unique_classes, 
    target_names=le_priority.inverse_transform(unique_classes)
))

print("\nConfusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(f"Labels: {le_priority.inverse_transform(unique_classes)}")
print(cm)

# Feature importance
print("\nFeature Importance:")
for feature, importance in sorted(zip(X.columns, model.feature_importances_), 
                                   key=lambda x: -x[1]):
    print(f"  {feature}: {importance:.4f}")

# Save model and encoders (overwrite v2 files for compatibility)
joblib.dump(model, "triage_model_v2.pkl")
joblib.dump(le_symptom, "le_symptom_v2.pkl")
joblib.dump(le_history, "le_history_v2.pkl")
joblib.dump(le_blood_group, "le_blood_group.pkl")
joblib.dump(le_blood_available, "le_blood_available.pkl")
joblib.dump(le_priority, "le_priority_v2.pkl")

print("\n" + "=" * 60)
print("Model saved successfully!")
print("=" * 60)

# Test with the provided test cases
print("\n" + "=" * 60)
print("Testing with Provided Test Cases")
print("=" * 60)

test_cases = [
    {
        "name": "John Smith",
        "symptom": "chest pain",
        "heart_rate": 138,
        "oxygen_level": 89,
        "temperature": 38.9,
        "systolic_bp": 190,
        "age": 65,
        "medical_history": "heart disease",
        "blood_group": "O-",
        "blood_banks_nearby": 1,
        "blood_available": "No",
        "expected": "Critical"
    },
    {
        "name": "Priya Mehta",
        "symptom": "shortness of breath",
        "heart_rate": 125,
        "oxygen_level": 92,
        "temperature": 38.4,
        "systolic_bp": 160,
        "age": 52,
        "medical_history": "asthma",
        "blood_group": "A+",
        "blood_banks_nearby": 2,
        "blood_available": "Yes",
        "expected": "High"
    },
    {
        "name": "Rahul Kumar",
        "symptom": "fever",
        "heart_rate": 102,
        "oxygen_level": 95,
        "temperature": 39.2,
        "systolic_bp": 135,
        "age": 38,
        "medical_history": "diabetes",
        "blood_group": "B+",
        "blood_banks_nearby": 3,
        "blood_available": "Yes",
        "expected": "Medium"
    },
    {
        "name": "Sneha Patil",
        "symptom": "headache",
        "heart_rate": 78,
        "oxygen_level": 98,
        "temperature": 37.2,
        "systolic_bp": 118,
        "age": 25,
        "medical_history": "none",
        "blood_group": "AB+",
        "blood_banks_nearby": 4,
        "blood_available": "Yes",
        "expected": "Low"
    }
]

print("\nResults:")
print("-" * 80)

for case in test_cases:
    # Encode inputs
    symptom_enc = le_symptom.transform([case['symptom']])[0] if case['symptom'] in le_symptom.classes_ else 0
    history_enc = le_history.transform([case['medical_history']])[0] if case['medical_history'] in le_history.classes_ else 0
    blood_grp_enc = le_blood_group.transform([case['blood_group']])[0] if case['blood_group'] in le_blood_group.classes_ else 0
    blood_avl_enc = le_blood_available.transform([case['blood_available']])[0]
    
    patient_data = pd.DataFrame([{
        "symptom": symptom_enc,
        "heart_rate": case['heart_rate'],
        "oxygen_level": case['oxygen_level'],
        "temperature": case['temperature'],
        "systolic_bp": case['systolic_bp'],
        "age": case['age'],
        "medical_history": history_enc,
        "blood_group": blood_grp_enc,
        "blood_banks_nearby": case['blood_banks_nearby'],
        "blood_available": blood_avl_enc
    }])
    
    pred_encoded = model.predict(patient_data)[0]
    predicted = le_priority.inverse_transform([pred_encoded])[0]
    urgency_score = model.predict_proba(patient_data).max() * 100
    
    match = "✅" if predicted == case['expected'] else "❌"
    print(f"{match} {case['name']}: Predicted={predicted}, Expected={case['expected']}, Urgency={urgency_score:.1f}%")
    print(f"   Vitals: HR={case['heart_rate']}, O2={case['oxygen_level']}, BP={case['systolic_bp']}, Temp={case['temperature']}")

print("-" * 80)
print("Training complete!")
