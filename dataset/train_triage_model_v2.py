import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Load updated dataset
df = pd.read_csv("triage_dataset_500_with_blood.csv")

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

# Features and target
X = df.drop("priority", axis=1)
y = df["priority"]

# Train test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=8,
    random_state=42
)

model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)

# Evaluation
print("\n=== Model Evaluation (Test Data) ===")
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:")
unique_classes = sorted(list(set(y_test) | set(y_pred)))
print(classification_report(y_test, y_pred, labels=unique_classes, target_names=le_priority.inverse_transform(unique_classes)))

# Save model and encoders
joblib.dump(model, "triage_model_v2.pkl")
joblib.dump(le_symptom, "le_symptom_v2.pkl")
joblib.dump(le_history, "le_history_v2.pkl")
joblib.dump(le_blood_group, "le_blood_group.pkl")
joblib.dump(le_blood_available, "le_blood_available.pkl")
joblib.dump(le_priority, "le_priority_v2.pkl")

print("\nModel saved as triage_model_v2.pkl (along with LabelEncoders)")

# ==========================================
# User Input Section for Testing
# ==========================================
print("\n=== Test the Model Model Manually ===")
print("Enter patient details to calculate triage priority and urgency score.")
try:
    print(f"Available symptoms: {', '.join(le_symptom.classes_)}")
    symptom = input("Patient Symptom: ").strip().lower()
    
    hr = float(input("Heart Rate (bpm): "))
    oxy = float(input("Oxygen Level (%): "))
    temp = float(input("Temperature (°C): "))
    sbp = float(input("Systolic BP (mmHg): "))
    age = float(input("Age: "))
    
    print(f"Available medical histories: {', '.join(le_history.classes_)}")
    history = input("Medical History: ").strip().lower()

    print(f"Available blood groups: {', '.join(le_blood_group.classes_)}")
    blood_group = input("Blood Group: ").strip().upper()

    print(f"Available blood banks nearby (0-5+):")
    blood_banks = int(input("Nearby Blood Banks count: "))

    # Simulation logic (later replaced by Google Maps API in frontend)
    if blood_banks == 0:
        blood_available_str = "No"
    else:
        # Simulate availability based on rarity
        import random
        base_prob = 0.8 if blood_group in ["A+", "B+", "O+", "AB+"] else 0.4
        blood_available_str = "Yes" if random.random() < base_prob else "No"
    
    print(f"\n[Simulation] Checking blood banks... Availability: {blood_available_str}")
    
    # Process user input using our encoders
    patient_data = pd.DataFrame([{
        "symptom": le_symptom.transform([symptom])[0] if symptom in le_symptom.classes_ else 0,
        "heart_rate": hr,
        "oxygen_level": oxy,
        "temperature": temp,
        "systolic_bp": sbp,
        "age": age,
        "medical_history": le_history.transform([history])[0] if history in le_history.classes_ else 0,
        "blood_group": le_blood_group.transform([blood_group])[0] if blood_group in le_blood_group.classes_ else 0,
        "blood_banks_nearby": blood_banks,
        "blood_available": le_blood_available.transform([blood_available_str])[0]
    }])
    
    # Predict priority
    pred_encoded = model.predict(patient_data)[0]
    predicted_priority = le_priority.inverse_transform([pred_encoded])[0]
    
    # Predict urgency score (confidence of the model)
    urgency_score = model.predict_proba(patient_data).max() * 100
    
    print("\n🚀 Prediction Result:")
    print(f"Priority: {predicted_priority}")
    print(f"Urgency Score: {urgency_score:.2f}")
    print(f"Blood Status: {'Available for Transfusion' if blood_available_str == 'Yes' else 'URGENT: No Blood Available Locally'}")
    
    if predicted_priority == "Critical" or predicted_priority == "High":
        print("Recommended Action: Immediate Treatment")
    elif predicted_priority == "Medium":
        print("Recommended Action: Keep Under Observation")
    else:
        print("Recommended Action: Standard Queue")
        
except Exception as e:
    print(f"\nError taking input or making prediction: {e}")
    print("Please make sure you entered the correct data types.")
