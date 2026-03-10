# 🚑 AI Emergency Triage Assistant

An **AI-powered Emergency Triage Assistant** designed to help hospitals prioritize patients during emergency situations.  
The system analyzes **patient symptoms, vital signs, medical history, and blood group** to classify urgency levels and support healthcare workers in making faster triage decisions.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://gcoen-hackon-jarvis-git-main-rishirajpathak234s-projects.vercel.app](https://gcoen-hackon-jarvis-git-main-rishirajpathak234s-projects.vercel.app) |
| **Backend API** | [https://gcoen-hackon-jarvis.onrender.com](https://gcoen-hackon-jarvis.onrender.com) |

---

## 📌 Project Overview

Emergency departments often face **overcrowding and delayed patient prioritization**, which can impact patient outcomes.

This project introduces an **AI-based triage assistant** that helps medical staff quickly determine the urgency level of patients by analyzing their health parameters.

The system predicts patient priority and helps identify **nearby blood banks** in case of emergency blood requirements.

---

## ⚡ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Triage Engine** | Random Forest model classifies patient priority with 97% accuracy |
| 🩺 **Vital Signs Analysis** | Heart rate, oxygen, BP, temperature monitoring |
| 🧾 **Medical History** | Factor in existing conditions (diabetes, hypertension, etc.) |
| 🩸 **Blood Bank Finder** | Locate nearby blood banks with availability status |
| 🗺️ **Emergency Maps** | Google Maps integration for hospitals & blood banks |
| 📊 **Live Dashboard** | Real-time ER overview with patient queue |
| 🚨 **Critical Alerts** | Push notifications for urgent cases |

---

## 🏗️ System Workflow

```
┌─────────────────────────────────────────────────────────────┐
│         Patient arrives at emergency department             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│      Healthcare worker enters patient details via form      │
│  (symptoms, vitals, age, blood group, medical history)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            AI Model analyzes patient parameters             │
│         (Random Forest Classifier - 200 trees)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│      System predicts urgency score & priority level         │
│       (Critical / High / Medium / Low)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│     Dashboard displays triage result with reasoning         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│   If blood required → search nearby blood banks via API     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Application Pages

| Page | Description |
|------|-------------|
| **Welcome** | Hero section with GSAP animations, project overview |
| **Dashboard** | Patient statistics, critical alerts, patient queue |
| **Patient Intake** | Form for symptoms, vitals, medical history input |
| **AI Analysis** | Displays urgency score, priority, recommended action |
| **Blood Bank** | Nearby blood banks with availability by blood group |
| **Maps** | Interactive Google Maps with hospitals, blood banks, ambulances |
| **Queue** | Priority-sorted patient list |
| **Alerts** | Critical patient notifications |

---

## 🤖 Machine Learning Model

### Model Architecture
```
Algorithm: Random Forest Classifier
Estimators: 200 decision trees
Max Depth: 8 levels
Accuracy: ~97%
```

### Input Features (10 parameters)

| Feature | Type | Range |
|---------|------|-------|
| `age` | Numeric | 0-100 years |
| `symptom` | Categorical | chest pain, shortness of breath, headache, etc. |
| `heart_rate` | Numeric | 40-180 bpm |
| `oxygen_level` | Numeric | 70-100% |
| `temperature` | Numeric | 35-42°C |
| `systolic_bp` | Numeric | 60-200 mmHg |
| `medical_history` | Categorical | diabetes, hypertension, heart disease, none |
| `blood_group` | Categorical | A+, A-, B+, B-, AB+, AB-, O+, O- |
| `blood_banks_nearby` | Numeric | 0-5+ |
| `blood_available` | Binary | Yes/No |

### Output Priority Levels

| Priority | Color | Action |
|----------|-------|--------|
| 🔴 **CRITICAL** | Red | Immediate resuscitation — ICU/trauma bay |
| 🟠 **HIGH** | Orange | Urgent attention within 15 minutes |
| 🟡 **MEDIUM** | Yellow | Observation — treat within 30-60 mins |
| 🟢 **LOW** | Green | Standard queue — routine examination |

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| Vite | 7.3.1 | Build tool & dev server |
| GSAP | 3.14.2 | Text & UI animations |
| Framer Motion | 12.35.2 | Motion animations |
| React Router DOM | 7.13.1 | Client-side routing |
| Lucide React | 0.577.0 | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| Flask | Python web server (REST API) |
| Flask-CORS | Cross-origin requests |
| Python | 3.12 |

### Machine Learning
| Technology | Purpose |
|------------|---------|
| Scikit-learn | Random Forest Classifier |
| Pandas | Data manipulation |
| Joblib | Model serialization |

### Google Cloud APIs
| API | Purpose |
|-----|---------|
| Google Maps JavaScript API | Interactive maps |
| Google Places API | Search nearby hospitals & blood banks |
| Google Geolocation | User location detection |

---

## 📂 Project Structure

```
GCOEN-Hackon-Jarvis/
│
├── backend/
│   ├── app.py                 # Flask API server
│   └── venv/                  # Python virtual environment
│
├── dataset/
│   ├── triage_dataset_500_with_blood.csv
│   ├── train_triage_model_v2.py
│   ├── triage_model_v2.pkl    # Trained model
│   └── le_*.pkl               # Label encoders
│
├── webapp/
│   ├── public/
│   │   └── videoplayback.mp4  # Hero background video
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── SplitText.jsx
│   │   │   └── TextType.jsx
│   │   ├── pages/
│   │   │   ├── Welcome.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Intake.jsx
│   │   │   ├── Analysis.jsx
│   │   │   ├── BloodBank.jsx
│   │   │   ├── Maps.jsx
│   │   │   ├── Queue.jsx
│   │   │   └── Alerts.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── .env                   # Google Maps API key
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/Rishiraj-Pathak-27/GCOEN-Hackon-Jarvis.git
cd GCOEN-Hackon-Jarvis
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows

pip install flask flask-cors pandas scikit-learn joblib
```

### 3. Setup Frontend
```bash
cd webapp
npm install
```

### 4. Configure Google Maps API
Create `webapp/.env`:
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

---

## ▶️ Running the Project

### Start Backend Server
```bash
cd backend
source venv/bin/activate
python app.py
```
Server runs at: `http://localhost:5000`

### Start Frontend
```bash
cd webapp
npm run dev
```
App runs at: `http://localhost:5173`

---

## 🧪 Example Input

| Field | Value |
|-------|-------|
| Age | 60 |
| Symptom | Chest Pain |
| Heart Rate | 110 bpm |
| Oxygen Level | 88% |
| Temperature | 38.5°C |
| Blood Pressure | 150 mmHg |
| Medical History | Heart Disease |
| Blood Group | O+ |

---

## 📊 Example Output

```json
{
  "priority": "CRITICAL",
  "urgency_score": 92.5,
  "blood_available": "Yes",
  "recommended_action": "Immediate resuscitation — rush to ICU / trauma bay",
  "reasoning": [
    "⚠️ Low Oxygen Level: 88%",
    "⚠️ Critical Blood Pressure: 150 mmHg",
    "🚨 High-risk symptom: chest pain",
    "ℹ️ Senior patient (age 60) — elevated risk"
  ]
}
```

---

## 🚀 Future Improvements

- [ ] Real-time hospital patient monitoring
- [ ] Integration with hospital management systems (HMS)
- [ ] Wearable health device integration
- [ ] Explainable AI for medical predictions
- [ ] Real-time ambulance tracking
- [ ] Live blood bank inventory system
- [ ] Multi-language support

---

## 🏆 Hackathon Project

This project was developed as part of **GCOEN Hackon** hackathon to demonstrate how **AI can support faster and smarter emergency triage decisions** in hospitals.

---

## 👨‍💻 Author

**Rishiraj Pathak**  
Computer Engineering Student  
AI & Software Development Enthusiast

[![GitHub](https://img.shields.io/badge/GitHub-Rishiraj--Pathak--27-black?style=flat&logo=github)](https://github.com/Rishiraj-Pathak-27)

---

## ⭐ Support

If you find this project useful, please consider **starring the repository** ⭐

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
