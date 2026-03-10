"""
Generate a balanced triage dataset with medically accurate priority classifications.

Priority Rules (based on Emergency Severity Index - ESI):
- Critical: Life-threatening conditions requiring immediate intervention
- High: Urgent conditions requiring attention within 15 minutes  
- Medium: Conditions that can wait 30-60 minutes
- Low: Non-urgent, routine examination

Key factors:
1. Vital signs (heart rate, oxygen level, blood pressure, temperature)
2. Symptoms (chest pain, shortness of breath are high-risk)
3. Age (elderly patients elevated risk)
4. Medical history (heart disease + chest pain = critical)
"""

import pandas as pd
import numpy as np
import random

np.random.seed(42)
random.seed(42)

def assign_priority(row):
    """Assign priority based on medical triage rules."""
    symptom = row['symptom']
    hr = row['heart_rate']
    oxy = row['oxygen_level']
    temp = row['temperature']
    bp = row['systolic_bp']
    age = row['age']
    history = row['medical_history']
    blood_available = row['blood_available']
    
    # Critical conditions - life threatening
    critical_conditions = [
        # Severe hypoxia
        oxy < 90,
        # Cardiac emergency
        (symptom == 'chest pain' and hr > 120 and history == 'heart disease'),
        (symptom == 'chest pain' and bp > 180),
        (symptom == 'chest pain' and oxy < 92),
        # Severe tachycardia/bradycardia
        hr > 140 or hr < 45,
        # Hypertensive emergency
        bp > 185,
        # Severe hypotension
        bp < 75,
        # Extreme temperature with other issues
        (temp > 40 and (oxy < 94 or hr > 110)),
        (temp < 34.5),
        # Old patient with dangerous symptoms
        (age > 70 and symptom == 'chest pain' and history == 'heart disease'),
        (age > 65 and oxy < 92 and symptom in ['chest pain', 'shortness of breath']),
    ]
    
    if any(critical_conditions):
        return 'Critical'
    
    # High priority conditions - urgent
    high_conditions = [
        # Low oxygen (but not critical)
        (oxy >= 90 and oxy < 94),
        # Chest pain with risk factors
        (symptom == 'chest pain' and (hr > 100 or history == 'heart disease')),
        # Shortness of breath with risk factors
        (symptom == 'shortness of breath' and (oxy < 95 or hr > 110 or history in ['asthma', 'heart disease'])),
        # High heart rate
        (hr > 120 and hr <= 140),
        # Elevated BP with symptoms
        (bp > 160 and bp <= 185 and symptom in ['chest pain', 'headache', 'dizziness']),
        # High fever
        (temp > 39.5 and temp <= 40),
        # Elderly with concerning vitals
        (age > 65 and hr > 110),
        (age > 65 and bp > 170),
        # Injury with abnormal vitals
        (symptom == 'injury' and (hr > 115 or bp < 90)),
        # No blood available for critical symptoms
        (blood_available == 'No' and symptom in ['chest pain', 'injury'] and history == 'heart disease'),
    ]
    
    if any(high_conditions):
        return 'High'
    
    # Medium priority conditions
    medium_conditions = [
        # Moderate vital sign abnormalities
        (hr > 100 and hr <= 120),
        (oxy >= 94 and oxy < 96),
        (bp > 140 and bp <= 160),
        (bp > 85 and bp < 95),
        (temp > 38.5 and temp <= 39.5),
        # Symptom-based
        (symptom == 'shortness of breath' and oxy >= 95),
        (symptom == 'chest pain' and hr <= 100 and history != 'heart disease'),
        (symptom in ['abdominal pain', 'vomiting'] and temp > 38),
        # Age-based
        (age > 60 and symptom in ['dizziness', 'fatigue'] and (hr > 95 or bp > 145)),
    ]
    
    if any(medium_conditions):
        return 'Medium'
    
    return 'Low'

# Generate diverse patient data
symptoms = ['chest pain', 'shortness of breath', 'headache', 'fever', 'cough', 
            'abdominal pain', 'dizziness', 'fatigue', 'injury', 'vomiting']
histories = ['none', 'diabetes', 'heart disease', 'hypertension', 'asthma']
blood_groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

data = []

# Generate Critical cases (target: ~100)
for _ in range(50):
    # Severe hypoxia cases
    data.append({
        'symptom': random.choice(['chest pain', 'shortness of breath']),
        'heart_rate': random.randint(100, 150),
        'oxygen_level': random.randint(80, 89),
        'temperature': round(random.uniform(36.0, 39.5), 1),
        'systolic_bp': random.randint(90, 180),
        'age': random.randint(25, 85),
        'medical_history': random.choice(histories),
        'blood_group': random.choice(blood_groups),
        'blood_banks_nearby': random.randint(0, 4),
        'blood_available': random.choice(['Yes', 'No'])
    })

for _ in range(30):
    # Cardiac emergencies
    data.append({
        'symptom': 'chest pain',
        'heart_rate': random.randint(125, 160),
        'oxygen_level': random.randint(88, 95),
        'temperature': round(random.uniform(36.5, 39.0), 1),
        'systolic_bp': random.randint(170, 210),
        'age': random.randint(45, 85),
        'medical_history': 'heart disease',
        'blood_group': random.choice(blood_groups),
        'blood_banks_nearby': random.randint(0, 3),
        'blood_available': random.choice(['Yes', 'No'])
    })

for _ in range(20):
    # Hypertensive crisis / extreme bradycardia
    data.append({
        'symptom': random.choice(['headache', 'dizziness', 'chest pain']),
        'heart_rate': random.choice([random.randint(35, 44), random.randint(145, 170)]),
        'oxygen_level': random.randint(88, 96),
        'temperature': round(random.uniform(36.0, 38.5), 1),
        'systolic_bp': random.randint(190, 220),
        'age': random.randint(50, 80),
        'medical_history': random.choice(['hypertension', 'heart disease']),
        'blood_group': random.choice(blood_groups),
        'blood_banks_nearby': random.randint(0, 2),
        'blood_available': random.choice(['Yes', 'No'])
    })

# Generate High priority cases (target: ~100)
for _ in range(40):
    # Low oxygen (90-93)
    data.append({
        'symptom': random.choice(['shortness of breath', 'chest pain', 'cough']),
        'heart_rate': random.randint(90, 130),
        'oxygen_level': random.randint(90, 93),
        'temperature': round(random.uniform(36.5, 39.0), 1),
        'systolic_bp': random.randint(110, 165),
        'age': random.randint(30, 75),
        'medical_history': random.choice(histories),
        'blood_group': random.choice(blood_groups),
        'blood_banks_nearby': random.randint(1, 4),
        'blood_available': random.choice(['Yes', 'No'])
    })

for _ in range(35):
    # High heart rate (121-140)
    data.append({
        'symptom': random.choice(symptoms),
        'heart_rate': random.randint(121, 140),
        'oxygen_level': random.randint(93, 98),
        'temperature': round(random.uniform(37.0, 39.8), 1),
        'systolic_bp': random.randint(110, 175),
        'age': random.randint(25, 70),
        'medical_history': random.choice(histories),
        'blood_group': random.choice(blood_groups),
        'blood_banks_nearby': random.randint(0, 4),
        'blood_available': random.choice(['Yes', 'No'])
    })

for _ in range(30):
    # Chest pain with heart disease
    data.append({
        'symptom': 'chest pain',
        'heart_rate': random.randint(95, 120),
        'oxygen_level': random.randint(93, 97),
        'temperature': round(random.uniform(36.5, 38.5), 1),
        'systolic_bp': random.randint(120, 170),
        'age': random.randint(40, 80),
        'medical_history': 'heart disease',
        'blood_group': random.choice(blood_groups),
        'blood_banks_nearby': random.randint(1, 4),
        'blood_available': random.choice(['Yes', 'No'])
    })

# Generate Medium priority cases (target: ~150)
for _ in range(50):
    # Moderate tachycardia (100-120)
    data.append({
        'symptom': random.choice(symptoms),
        'heart_rate': random.randint(100, 120),
        'oxygen_level': random.randint(95, 98),
        'temperature': round(random.uniform(36.5, 39.0), 1),
        'systolic_bp': random.randint(110, 150),
        'age': random.randint(20, 65),
        'medical_history': random.choice(histories),
        'blood_group': random.choice(blood_groups),
        'blood_banks_nearby': random.randint(1, 5),
        'blood_available': random.choice(['Yes', 'No'])
    })

for _ in range(50):
    # Moderate oxygen (94-95) or moderate BP
    data.append({
        'symptom': random.choice(symptoms),
        'heart_rate': random.randint(75, 105),
        'oxygen_level': random.randint(94, 96),
        'temperature': round(random.uniform(37.5, 39.2), 1),
        'systolic_bp': random.randint(140, 165),
        'age': random.randint(35, 70),
        'medical_history': random.choice(histories),
        'blood_group': random.choice(blood_groups),
        'blood_banks_nearby': random.randint(1, 4),
        'blood_available': random.choice(['Yes', 'No'])
    })

for _ in range(50):
    # Shortness of breath with normal/near-normal vitals
    data.append({
        'symptom': 'shortness of breath',
        'heart_rate': random.randint(75, 100),
        'oxygen_level': random.randint(95, 98),
        'temperature': round(random.uniform(36.5, 38.0), 1),
        'systolic_bp': random.randint(110, 140),
        'age': random.randint(25, 60),
        'medical_history': random.choice(['none', 'asthma', 'diabetes']),
        'blood_group': random.choice(blood_groups),
        'blood_banks_nearby': random.randint(2, 5),
        'blood_available': random.choice(['Yes', 'No'])
    })

# Generate Low priority cases (target: ~150)
for _ in range(150):
    data.append({
        'symptom': random.choice(['headache', 'fatigue', 'cough', 'dizziness', 'vomiting', 'fever']),
        'heart_rate': random.randint(60, 95),
        'oxygen_level': random.randint(96, 100),
        'temperature': round(random.uniform(36.0, 38.0), 1),
        'systolic_bp': random.randint(100, 135),
        'age': random.randint(18, 55),
        'medical_history': random.choice(['none', 'diabetes', 'asthma']),
        'blood_group': random.choice(blood_groups),
        'blood_banks_nearby': random.randint(2, 5),
        'blood_available': random.choice(['Yes', 'No'])
    })

# Create DataFrame
df = pd.DataFrame(data)

# Apply priority rules
df['priority'] = df.apply(assign_priority, axis=1)

# Check distribution
print("Priority Distribution:")
print(df['priority'].value_counts())

# Shuffle the dataset
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

# Save
df.to_csv('triage_dataset_balanced.csv', index=False)
print(f"\nSaved {len(df)} records to triage_dataset_balanced.csv")

# Print sample cases for each priority
print("\n=== Sample Cases ===")
for priority in ['Critical', 'High', 'Medium', 'Low']:
    print(f"\n{priority} Priority Sample:")
    sample = df[df['priority'] == priority].head(2)
    for _, row in sample.iterrows():
        print(f"  {row['symptom']}, HR:{row['heart_rate']}, O2:{row['oxygen_level']}, "
              f"BP:{row['systolic_bp']}, Temp:{row['temperature']}, Age:{row['age']}, "
              f"History:{row['medical_history']}")
