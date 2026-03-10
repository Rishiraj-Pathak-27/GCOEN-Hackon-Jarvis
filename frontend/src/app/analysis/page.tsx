'use client';

import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Suspense } from 'react';

function AnalysisContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patient');
  const { getPatient, patients } = useApp();

  const patient = patientId ? getPatient(patientId) : null;

  const priorityColors = { critical: 'var(--critical)', high: 'var(--high)', medium: 'var(--medium)', low: 'var(--low)' };
  const priorityBgs = { critical: 'var(--critical-bg)', high: 'var(--high-bg)', medium: 'var(--medium-bg)', low: 'var(--low-bg)' };
  const priorityActions = {
    critical: { area: 'Immediate Treatment Room', desc: 'Patient requires immediate intervention. Alert attending physician.' },
    high: { area: 'Urgent Care Queue', desc: 'Patient should be seen within 15 minutes.' },
    medium: { area: 'Standard Care Queue', desc: 'Patient can be queued with periodic monitoring.' },
    low: { area: 'Waiting Room', desc: 'Patient is stable. Standard intake applies.' },
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🤖 AI Analysis</h1>
        <p className="page-subtitle">Model predictions and triage results</p>
      </div>

      {/* MODEL INTEGRATION SECTION */}
      <div className="card section-gap">
        <div className="card-header">
          <h3 className="card-title">🔌 ML Model Integration</h3>
          <span className="badge badge-medium">Configurable</span>
        </div>
        <div className="model-box">
          <h3>Connect Your Trained Model</h3>
          <p>
            Edit <strong>src/lib/model-integration.ts</strong> to connect your ML model.
            The function <code style={{ display: 'inline', padding: '2px 6px', margin: 0 }}>runModelPrediction()</code> is called when a patient is submitted.
          </p>
          <code>{`// src/lib/model-integration.ts

export async function runModelPrediction(
  data: PatientFormData
): Promise<TriageResult> {

  // Option A: Call your Python API
  const response = await fetch(
    'http://localhost:5000/predict',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symptoms: data.symptoms,
        age: parseInt(data.age),
        heart_rate: parseInt(data.heartRate),
        oxygen_level: parseInt(data.oxygenLevel),
        // ... other features
      }),
    }
  );
  const result = await response.json();

  return {
    urgencyScore: result.urgency_score,
    priority: result.priority,
    assignedArea: result.assigned_area,
    riskFactors: result.risk_factors,
    explanation: result.explanation,
  };
}`}</code>
          <p style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Currently using the built-in rule-based fallback engine. Replace with your model to get real predictions.
          </p>
        </div>
      </div>

      {/* PATIENT ANALYSIS RESULT */}
      {patient ? (
        <>
          <div className="alert-bar alert-info section-gap">
            📄 Showing analysis for <strong>{patient.name}</strong> ({patient.id})
          </div>

          <div className="grid-2 section-gap">
            {/* Urgency Score */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🎯 Urgency Score</h3>
                <span className={`badge badge-${patient.priority}`}>{patient.priority}</span>
              </div>
              <div className="urgency-display">
                <div className="urgency-ring" style={{
                  borderColor: priorityColors[patient.priority],
                  background: priorityBgs[patient.priority],
                }}>
                  <div className="urgency-num" style={{ color: priorityColors[patient.priority] }}>
                    {patient.urgencyScore}
                  </div>
                  <div className="urgency-of">out of 100</div>
                </div>
                <div className="progress-track" style={{ marginTop: '16px' }}>
                  <div className="progress-fill" style={{
                    width: `${patient.urgencyScore}%`,
                    background: priorityColors[patient.priority],
                  }} />
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {patient.urgencyScore >= 75 ? 'Requires immediate attention'
                    : patient.urgencyScore >= 50 ? 'Urgent medical evaluation needed'
                    : patient.urgencyScore >= 25 ? 'Standard priority — monitor'
                    : 'Low priority — standard queue'}
                </p>
              </div>
            </div>

            {/* Priority Levels */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📊 Priority Classification</h3>
              </div>
              <div className="priority-levels" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {(['critical', 'high', 'medium', 'low'] as const).map(level => {
                  const active = patient.priority === level;
                  return (
                    <div key={level} className={`priority-level-card ${active ? 'active' : ''}`} style={{
                      background: active ? priorityBgs[level] : 'var(--bg-input)',
                      borderColor: active ? priorityColors[level] : 'transparent',
                      color: active ? priorityColors[level] : 'var(--text-muted)',
                    }}>
                      <div className="level-label">{level}</div>
                      <div className="level-action">{priorityActions[level].area}</div>
                    </div>
                  );
                })}
              </div>

              {/* Recommended Action */}
              <div style={{ marginTop: '16px', padding: '14px', background: priorityBgs[patient.priority], border: `1px solid ${priorityColors[patient.priority]}33`, borderRadius: 'var(--radius)' }}>
                <div style={{ fontWeight: 600, color: priorityColors[patient.priority], marginBottom: '4px' }}>
                  ➜ {priorityActions[patient.priority].area}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {priorityActions[patient.priority].desc}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          {patient.riskFactors.length > 0 && (
            <div className="card section-gap">
              <div className="card-header">
                <h3 className="card-title">⚠️ Risk Factors Detected</h3>
                <span className="badge badge-critical">{patient.riskFactors.length} found</span>
              </div>
              <ul className="risk-list">
                {patient.riskFactors.map((rf, i) => (
                  <li key={i} className="risk-item">
                    <span className={`risk-dot ${rf.severity}`} />
                    <span style={{ color: 'var(--text-secondary)' }}>{rf.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Explanation */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🧠 AI Explanation</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {patient.aiExplanation}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px', fontStyle: 'italic' }}>
              This explanation was generated by the triage model to support clinical decision-making. Always apply clinical judgment.
            </p>
          </div>
        </>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No Patient Selected</h3>
            <p style={{ marginBottom: '16px' }}>Submit a patient from the intake form or select one from the queue to see the AI analysis.</p>

            {/* Quick Links to Recent Patients */}
            {patients.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Recent patients:</p>
                <div className="btn-group" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                  {patients.slice(0, 5).map(p => (
                    <a key={p.id} href={`/analysis?patient=${p.id}`} className="btn btn-sm btn-outline">
                      {p.id} — {p.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="page-container"><div className="spinner" /><p style={{textAlign:'center',color:'var(--text-muted)'}}>Loading...</p></div>}>
      <AnalysisContent />
    </Suspense>
  );
}
