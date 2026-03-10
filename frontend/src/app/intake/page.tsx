'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PatientFormData, Patient } from '@/types';
import { runModelPrediction, ALL_SYMPTOMS } from '@/lib/model-integration';

export default function IntakePage() {
  const router = useRouter();
  const { addPatient } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<PatientFormData>({
    name: '', age: '', gender: 'male', symptoms: [], painLevel: 0,
    heartRate: '', bloodPressure: '', oxygenLevel: '', temperature: '',
    medicalHistory: '', emergencyNotes: '',
  });

  const [symptomSearch, setSymptomSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredSymptoms = ALL_SYMPTOMS.filter(
    s => s.toLowerCase().includes(symptomSearch.toLowerCase()) && !form.symptoms.includes(s)
  );

  const addSymptom = (s: string) => {
    setForm(prev => ({ ...prev, symptoms: [...prev.symptoms, s] }));
    setSymptomSearch('');
    setShowDropdown(false);
  };

  const removeSymptom = (s: string) => {
    setForm(prev => ({ ...prev, symptoms: prev.symptoms.filter(x => x !== s) }));
  };

  const update = (field: keyof PatientFormData, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call the model prediction (your ML model or fallback engine)
      const result = await runModelPrediction(form);

      const newPatient: Patient = {
        id: `PT-${String(Math.floor(Math.random() * 900) + 100)}`,
        name: form.name || 'Unknown Patient',
        age: parseInt(form.age) || 0,
        gender: form.gender,
        symptoms: form.symptoms,
        painLevel: form.painLevel,
        heartRate: parseInt(form.heartRate) || 0,
        bloodPressure: form.bloodPressure,
        oxygenLevel: parseInt(form.oxygenLevel) || 0,
        temperature: parseFloat(form.temperature) || 0,
        medicalHistory: form.medicalHistory,
        emergencyNotes: form.emergencyNotes,
        arrivalTime: new Date(),
        urgencyScore: result.urgencyScore,
        priority: result.priority,
        status: 'waiting',
        assignedArea: result.assignedArea,
        riskFactors: result.riskFactors,
        aiExplanation: result.explanation,
      };

      addPatient(newPatient);

      // Navigate to analysis page with the patient ID
      router.push(`/analysis?patient=${newPatient.id}`);
    } catch (err) {
      console.error('Model prediction error:', err);
      alert('Error running AI analysis. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const painColor = form.painLevel <= 3 ? 'var(--low)' : form.painLevel <= 5 ? 'var(--medium)' : form.painLevel <= 7 ? 'var(--high)' : 'var(--critical)';

  return (
    <div className="page-container" style={{ maxWidth: '720px' }}>
      <div className="page-header">
        <h1 className="page-title">📋 Patient Intake</h1>
        <p className="page-subtitle">Enter patient information for AI-powered triage assessment</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Patient Info */}
        <div className="card section-gap">
          <div className="card-header">
            <h3 className="card-title">👤 Patient Information</h3>
          </div>
          <div className="form-group">
            <label className="form-label">Patient Name / ID <span className="required">*</span></label>
            <input className="form-input" type="text" placeholder="Enter patient name or ID" value={form.name} onChange={e => update('name', e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age <span className="required">*</span></label>
              <input className="form-input" type="number" placeholder="e.g. 45" value={form.age} onChange={e => update('age', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender} onChange={e => update('gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div className="card section-gap">
          <div className="card-header">
            <h3 className="card-title">🩺 Symptoms</h3>
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Search & Select Symptoms</label>
            <input className="form-input" type="text" placeholder="Type to search symptoms..." value={symptomSearch}
              onChange={e => { setSymptomSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {showDropdown && filteredSymptoms.length > 0 && (
              <div className="symptom-dropdown">
                {filteredSymptoms.slice(0, 8).map(s => (
                  <div key={s} className="symptom-option" onMouseDown={() => addSymptom(s)}>{s}</div>
                ))}
              </div>
            )}
          </div>
          {form.symptoms.length > 0 && (
            <div className="symptom-tags">
              {form.symptoms.map(s => (
                <span key={s} className="symptom-tag">
                  {s}
                  <button type="button" className="remove-btn" onClick={() => removeSymptom(s)}>×</button>
                </span>
              ))}
            </div>
          )}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Pain Level ({form.painLevel}/10)</label>
            <div className="pain-slider-wrap">
              <input className="pain-slider" type="range" min="0" max="10" value={form.painLevel} onChange={e => update('painLevel', parseInt(e.target.value))} />
              <span className="pain-num" style={{ color: painColor }}>{form.painLevel}</span>
            </div>
          </div>
        </div>

        {/* Vital Signs */}
        <div className="card section-gap">
          <div className="card-header">
            <h3 className="card-title">💓 Vital Signs</h3>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Heart Rate (bpm)</label>
              <input className="form-input" type="number" placeholder="e.g. 72" value={form.heartRate} onChange={e => update('heartRate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Blood Pressure (mmHg)</label>
              <input className="form-input" type="text" placeholder="e.g. 120/80" value={form.bloodPressure} onChange={e => update('bloodPressure', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Oxygen Level — SpO2 (%)</label>
              <input className="form-input" type="number" placeholder="e.g. 98" value={form.oxygenLevel} onChange={e => update('oxygenLevel', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Body Temperature (°C)</label>
              <input className="form-input" type="number" step="0.1" placeholder="e.g. 36.6" value={form.temperature} onChange={e => update('temperature', e.target.value)} />
            </div>
          </div>
          <p className="form-hint">💡 Vitals from connected wearable devices will auto-fill here in a future update.</p>
        </div>

        {/* Medical History */}
        <div className="card section-gap">
          <div className="card-header">
            <h3 className="card-title">📑 History & Notes</h3>
          </div>
          <div className="form-group">
            <label className="form-label">Medical History / Pre-existing Conditions</label>
            <textarea className="form-textarea" placeholder="e.g. Diabetes, hypertension, asthma..." value={form.medicalHistory} onChange={e => update('medicalHistory', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Emergency Notes</label>
            <textarea className="form-textarea" placeholder="Any additional observations..." value={form.emergencyNotes} onChange={e => update('emergencyNotes', e.target.value)} />
          </div>
        </div>

        {/* Submit */}
        <button className="btn btn-primary btn-full" type="submit" disabled={isSubmitting} style={{ padding: '14px', fontSize: '1rem' }}>
          {isSubmitting ? '⏳ Analyzing...' : '🤖 Run AI Triage Analysis'}
        </button>
      </form>
    </div>
  );
}
