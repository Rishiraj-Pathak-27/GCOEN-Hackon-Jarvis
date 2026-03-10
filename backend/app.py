from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
import random

app = Flask(__name__)

# CORS: Allow Vercel frontend and localhost for development
FRONTEND_URLS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://gcoen-hackon-jarvis-git-main-rishirajpathak234s-projects.vercel.app",
    "https://gcoen-hackon-jarvis.vercel.app",  # Production domain
    os.environ.get("FRONTEND_URL", ""),  # Additional URL from Railway env vars
]
# Filter out empty strings
FRONTEND_URLS = [url for url in FRONTEND_URLS if url]
CORS(app, origins=FRONTEND_URLS if FRONTEND_URLS else "*")

# ── Load model and encoders from the dataset folder ──────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, '..', 'dataset')

model        = joblib.load(os.path.join(DATASET_DIR, 'triage_model_v2.pkl'))
le_symptom   = joblib.load(os.path.join(DATASET_DIR, 'le_symptom_v2.pkl'))
le_history   = joblib.load(os.path.join(DATASET_DIR, 'le_history_v2.pkl'))
le_blood_grp = joblib.load(os.path.join(DATASET_DIR, 'le_blood_group.pkl'))
le_blood_avl = joblib.load(os.path.join(DATASET_DIR, 'le_blood_available.pkl'))
le_priority  = joblib.load(os.path.join(DATASET_DIR, 'le_priority_v2.pkl'))

# ── Helper: simulate blood availability ──────────────────────────
def simulate_blood_availability(blood_group: str, blood_banks_nearby: int) -> str:
    if blood_banks_nearby == 0:
        return 'No'
    base_prob = 0.85 if blood_group in ['A+', 'B+', 'O+', 'AB+'] else 0.40
    return 'Yes' if random.random() < base_prob else 'No'

# ── Helper: recommended action ────────────────────────────────────
def get_action(priority: str) -> str:
    return {
        'Critical': 'Immediate resuscitation — rush to ICU / trauma bay',
        'High':     'Urgent attention required within 15 minutes',
        'Medium':   'Keep under observation — treat within 30–60 minutes',
        'Low':      'Standard queue — routine examination',
    }.get(priority, 'Monitor patient')

# ── Helper: reasoning factors ─────────────────────────────────────
def get_reasoning(data: dict, priority: str) -> list:
    factors = []
    if data['heart_rate'] > 120 or data['heart_rate'] < 50:
        factors.append(f"⚠️  Abnormal Heart Rate: {data['heart_rate']} bpm")
    if data['oxygen_level'] < 94:
        factors.append(f"⚠️  Low Oxygen Level: {data['oxygen_level']}%")
    if data['systolic_bp'] > 180 or data['systolic_bp'] < 80:
        factors.append(f"⚠️  Critical Blood Pressure: {data['systolic_bp']} mmHg")
    if data['temperature'] > 39.5 or data['temperature'] < 35:
        factors.append(f"⚠️  Dangerous Temperature: {data['temperature']}°C")
    if data['age'] > 65:
        factors.append(f"ℹ️  Senior patient (age {data['age']}) — elevated risk")
    if data['symptom'] in ['chest pain', 'shortness of breath']:
        factors.append(f"🚨 High-risk symptom: {data['symptom']}")
    if data.get('blood_available') == 'No':
        factors.append('🩸 Blood not available locally — locate donor urgently')
    if not factors:
        factors.append('✅ Vitals within acceptable range — low-risk presentation')
    return factors


# ── Metadata endpoint ─────────────────────────────────────────────
@app.route('/meta', methods=['GET'])
def meta():
    return jsonify({
        'symptoms':       list(le_symptom.classes_),
        'medical_history': list(le_history.classes_),
        'blood_groups':   list(le_blood_grp.classes_),
    })


# ── Predict endpoint ──────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    try:
        body = request.get_json()

        symptom         = body.get('symptom', '').strip().lower()
        heart_rate      = float(body.get('heart_rate', 0))
        oxygen_level    = float(body.get('oxygen_level', 0))
        temperature     = float(body.get('temperature', 0))
        systolic_bp     = float(body.get('systolic_bp', 0))
        age             = float(body.get('age', 0))
        medical_history = body.get('medical_history', 'none').strip().lower()
        blood_group     = body.get('blood_group', 'O+').strip().upper()
        blood_banks     = int(body.get('blood_banks_nearby', 1))

        # Simulate blood availability
        blood_avl_str = simulate_blood_availability(blood_group, blood_banks)

        # Encode categoricals (fallback to 0 for unseen labels)
        def safe_encode(le, val):
            return le.transform([val])[0] if val in le.classes_ else 0

        features = pd.DataFrame([{
            'symptom':          safe_encode(le_symptom, symptom),
            'heart_rate':       heart_rate,
            'oxygen_level':     oxygen_level,
            'temperature':      temperature,
            'systolic_bp':      systolic_bp,
            'age':              age,
            'medical_history':  safe_encode(le_history, medical_history),
            'blood_group':      safe_encode(le_blood_grp, blood_group),
            'blood_banks_nearby': blood_banks,
            'blood_available':  safe_encode(le_blood_avl, blood_avl_str),
        }])

        pred_encoded   = model.predict(features)[0]
        priority       = le_priority.inverse_transform([pred_encoded])[0]
        urgency_score  = round(float(model.predict_proba(features).max() * 100), 1)

        raw = {
            'symptom': symptom, 'heart_rate': heart_rate,
            'oxygen_level': oxygen_level, 'temperature': temperature,
            'systolic_bp': systolic_bp, 'age': age,
            'blood_available': blood_avl_str,
        }

        return jsonify({
            'priority':        priority,
            'urgency_score':   urgency_score,
            'blood_available': blood_avl_str,
            'blood_group':     blood_group,
            'recommended_action': get_action(priority),
            'reasoning':       get_reasoning(raw, priority),
            'vitals': {
                'heart_rate':   heart_rate,
                'oxygen_level': oxygen_level,
                'temperature':  temperature,
                'systolic_bp':  systolic_bp,
                'age':          age,
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    print('🏥 AI Triage Backend running on http://localhost:5000')
    app.run(host='0.0.0.0', port=5000, debug=True)
