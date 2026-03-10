/**
 * ============================================================
 *  MODEL INTEGRATION POINT
 * ============================================================
 *
 * This file is where you connect your own trained ML model
 * to predict urgency scores and priority classification.
 *
 * HOW TO INTEGRATE YOUR MODEL:
 *
 * Option A — Call a Python/Flask/FastAPI backend:
 *   Replace the body of `runModelPrediction()` with a fetch()
 *   call to your model's API endpoint.
 *
 * Option B — Use ONNX.js / TensorFlow.js in the browser:
 *   Load your model in this file and run inference directly.
 *
 * Option C — Use the built-in fallback engine:
 *   The default implementation below uses a rule-based scoring
 *   system. You can keep it as a fallback or replace entirely.
 *
 * ============================================================
 */

import { PatientFormData, TriageResult, RiskFactor, PriorityLevel } from '@/types';

/**
 * MAIN ENTRY POINT — Your model prediction function.
 *
 * Replace this function's body with your own model integration.
 * Input:  PatientFormData (all patient vitals, symptoms, etc.)
 * Output: Promise<TriageResult> with urgencyScore, priority, riskFactors, explanation
 */
export async function runModelPrediction(
  data: PatientFormData
): Promise<TriageResult> {
  // ──────────────────────────────────────────────────
  // EXAMPLE: Call your Python backend API
  // ──────────────────────────────────────────────────
  //
  // const response = await fetch('http://localhost:5000/predict', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     symptoms: data.symptoms,
  //     age: parseInt(data.age),
  //     gender: data.gender,
  //     pain_level: data.painLevel,
  //     heart_rate: parseInt(data.heartRate),
  //     blood_pressure: data.bloodPressure,
  //     oxygen_level: parseInt(data.oxygenLevel),
  //     temperature: parseFloat(data.temperature),
  //     medical_history: data.medicalHistory,
  //   }),
  // });
  //
  // const result = await response.json();
  //
  // return {
  //   urgencyScore: result.urgency_score,
  //   priority: result.priority,        // 'critical' | 'high' | 'medium' | 'low'
  //   assignedArea: result.assigned_area,
  //   riskFactors: result.risk_factors,  // { text: string, severity: 'high'|'medium'|'low' }[]
  //   explanation: result.explanation,
  // };
  //
  // ──────────────────────────────────────────────────

  // FALLBACK: Built-in rule-based engine (used when no model is connected)
  return fallbackRuleBasedEngine(data);
}

// ============================================================
// BUILT-IN FALLBACK ENGINE (rule-based scoring)
// ============================================================

const SYMPTOM_WEIGHTS: Record<string, number> = {
  'Chest Pain': 25,
  'Difficulty Breathing': 22,
  'Severe Bleeding': 24,
  'Loss of Consciousness': 26,
  'Stroke Symptoms': 28,
  'Seizure': 22,
  'Severe Allergic Reaction': 20,
  'Heart Palpitations': 15,
  'High Fever': 12,
  'Abdominal Pain': 10,
  'Head Injury': 18,
  'Burns': 14,
  'Fracture/Broken Bone': 12,
  'Severe Headache': 10,
  'Dizziness': 8,
  'Nausea/Vomiting': 6,
  'Cough': 4,
  'Sore Throat': 3,
  'Minor Cut/Wound': 2,
  'Rash': 3,
  'Back Pain': 5,
  'Joint Pain': 4,
  'Eye Injury': 10,
  'Ear Pain': 4,
  'Dehydration': 8,
};

export const ALL_SYMPTOMS = Object.keys(SYMPTOM_WEIGHTS);

function fallbackRuleBasedEngine(data: PatientFormData): TriageResult {
  let score = 0;
  const riskFactors: RiskFactor[] = [];

  // Symptoms
  for (const s of data.symptoms) {
    score += SYMPTOM_WEIGHTS[s] || 5;
  }

  // Pain level
  score += data.painLevel * 2;
  if (data.painLevel >= 8) riskFactors.push({ text: `Severe pain level (${data.painLevel}/10)`, severity: 'high' });
  else if (data.painLevel >= 5) riskFactors.push({ text: `Moderate pain level (${data.painLevel}/10)`, severity: 'medium' });

  // Heart rate
  const hr = parseInt(data.heartRate) || 0;
  if (hr > 120) { score += 15; riskFactors.push({ text: `Tachycardia (HR: ${hr} bpm)`, severity: 'high' }); }
  else if (hr > 100) { score += 8; riskFactors.push({ text: `Elevated heart rate (HR: ${hr} bpm)`, severity: 'medium' }); }
  else if (hr < 50 && hr > 0) { score += 12; riskFactors.push({ text: `Bradycardia (HR: ${hr} bpm)`, severity: 'high' }); }

  // Oxygen
  const o2 = parseInt(data.oxygenLevel) || 0;
  if (o2 > 0 && o2 < 90) { score += 20; riskFactors.push({ text: `Critical SpO2 (${o2}%)`, severity: 'high' }); }
  else if (o2 >= 90 && o2 < 95) { score += 10; riskFactors.push({ text: `Low SpO2 (${o2}%)`, severity: 'medium' }); }

  // Temperature
  const temp = parseFloat(data.temperature) || 0;
  if (temp > 39.5) { score += 12; riskFactors.push({ text: `High fever (${temp}°C)`, severity: 'high' }); }
  else if (temp > 38) { score += 6; riskFactors.push({ text: `Elevated temperature (${temp}°C)`, severity: 'medium' }); }
  else if (temp < 35 && temp > 0) { score += 15; riskFactors.push({ text: `Hypothermia (${temp}°C)`, severity: 'high' }); }

  // Age
  const age = parseInt(data.age) || 0;
  if (age > 70) { score += 8; riskFactors.push({ text: 'Elderly patient (>70y)', severity: 'medium' }); }
  else if (age < 5 && age > 0) { score += 8; riskFactors.push({ text: 'Pediatric patient (<5y)', severity: 'medium' }); }

  // Blood pressure
  if (data.bloodPressure) {
    const parts = data.bloodPressure.split('/');
    if (parts.length === 2) {
      const sys = parseInt(parts[0]), dia = parseInt(parts[1]);
      if (sys > 180 || dia > 120) { score += 15; riskFactors.push({ text: `Hypertensive crisis (BP: ${data.bloodPressure})`, severity: 'high' }); }
      else if (sys > 140 || dia > 90) { score += 6; riskFactors.push({ text: `Elevated BP (${data.bloodPressure})`, severity: 'medium' }); }
      else if (sys < 90 && sys > 0) { score += 15; riskFactors.push({ text: `Hypotension (BP: ${data.bloodPressure})`, severity: 'high' }); }
    }
  }

  // Medical history
  if (data.medicalHistory) {
    const h = data.medicalHistory.toLowerCase();
    if (h.includes('diabetes') || h.includes('heart') || h.includes('cardiac')) {
      score += 5; riskFactors.push({ text: 'Pre-existing cardiac/metabolic condition', severity: 'medium' });
    }
    if (h.includes('asthma') || h.includes('copd') || h.includes('respiratory')) {
      score += 5; riskFactors.push({ text: 'Pre-existing respiratory condition', severity: 'medium' });
    }
  }

  // Dangerous combos
  const ss = new Set(data.symptoms);
  if (ss.has('Chest Pain') && ss.has('Difficulty Breathing')) {
    score += 10; riskFactors.push({ text: 'Critical combo: chest pain + dyspnea', severity: 'high' });
  }

  score = Math.min(100, Math.max(0, score));

  let priority: PriorityLevel;
  let assignedArea: string;
  if (score >= 75) { priority = 'critical'; assignedArea = 'Immediate Treatment Room'; }
  else if (score >= 50) { priority = 'high'; assignedArea = 'Urgent Care Queue'; }
  else if (score >= 25) { priority = 'medium'; assignedArea = 'Standard Care Queue'; }
  else { priority = 'low'; assignedArea = 'Waiting Room'; }

  const explanation = buildExplanation(data, score, priority, riskFactors);

  return { urgencyScore: score, priority, assignedArea, riskFactors, explanation };
}

function buildExplanation(data: PatientFormData, score: number, priority: PriorityLevel, risks: RiskFactor[]): string {
  const parts: string[] = [];
  parts.push(`Patient classified as ${priority.toUpperCase()} priority with urgency score ${score}/100.`);
  if (data.symptoms.length > 0) parts.push(`Presenting symptoms: ${data.symptoms.join(', ')}.`);
  const highRisks = risks.filter(r => r.severity === 'high');
  if (highRisks.length > 0) parts.push(`Key risk factors: ${highRisks.map(r => r.text).join('; ')}.`);
  if (data.painLevel >= 7) parts.push(`Pain level ${data.painLevel}/10 indicates acute distress.`);
  return parts.join(' ');
}
