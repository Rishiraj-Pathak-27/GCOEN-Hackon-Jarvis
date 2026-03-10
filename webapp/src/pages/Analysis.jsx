import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, Clock, Droplets, Activity, Thermometer, Heart } from 'lucide-react';

const PRIORITY_CONFIG = {
  Critical: { color: 'var(--accent-red)', bg: 'var(--accent-red-light)', border: 'rgba(229,57,53,0.3)', emoji: '🚨', ring: '#e53935' },
  High:     { color: 'var(--accent-orange)', bg: 'var(--accent-orange-light)', border: 'rgba(245,124,0,0.3)', emoji: '⚠️', ring: '#f57c00' },
  Medium:   { color: 'var(--accent-yellow)', bg: 'var(--accent-yellow-light)', border: 'rgba(249,168,37,0.3)', emoji: '🔶', ring: '#f9a825' },
  Low:      { color: 'var(--accent-green)', bg: 'var(--accent-green-light)', border: 'rgba(46,125,50,0.3)', emoji: '✅', ring: '#2e7d32' },
};

// Sample fallback when navigating directly
const DEMO = {
  result: {
    priority: 'High', urgency_score: 78.4, blood_available: 'Yes', blood_group: 'O+',
    recommended_action: 'Urgent attention required within 15 minutes',
    reasoning: ['⚠️ Abnormal Heart Rate: 131 bpm', '⚠️ Low Oxygen Level: 93%', '🚨 High-risk symptom: chest pain'],
    vitals: { heart_rate: 131, oxygen_level: 93, temperature: 38.2, systolic_bp: 155, age: 52 },
  },
  patient: { name: 'Demo Patient', age: 52, gender: 'Male', symptom: 'chest pain', medical_history: 'hypertension', blood_group: 'O+' },
};

function UrgencyRing({ score, color }) {
  const r = 54, circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 70 70)" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <text x="70" y="66" textAnchor="middle" fontSize="28" fontWeight="900" fill={color} fontFamily="Plus Jakarta Sans, sans-serif">{Math.round(score)}</text>
      <text x="70" y="84" textAnchor="middle" fontSize="12" fill="var(--text-secondary)" fontFamily="Plus Jakarta Sans, sans-serif">/ 100</text>
    </svg>
  );
}

export default function Analysis() {
  const location = useLocation();
  const { result, patient } = location.state || DEMO;
  const cfg = PRIORITY_CONFIG[result.priority] || PRIORITY_CONFIG.High;

  const vitals = [
    { label: 'Heart Rate', val: result.vitals.heart_rate, unit: 'bpm', icon: Heart, warn: v => v > 120 || v < 50 },
    { label: 'Oxygen Level', val: result.vitals.oxygen_level, unit: '%', icon: Activity, warn: v => v < 94 },
    { label: 'Temperature', val: result.vitals.temperature, unit: '°C', icon: Thermometer, warn: v => v > 39.5 || v < 35 },
    { label: 'Systolic BP', val: result.vitals.systolic_bp, unit: 'mmHg', icon: Activity, warn: v => v > 180 || v < 80 },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <Link to="/intake" className="btn btn-ghost" style={{ border: '1px solid var(--border)', padding: '8px 14px' }}>
          <ArrowLeft size={16} /> Back to Intake
        </Link>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>AI Analysis Result</h1>
          <p>Patient: <strong>{patient.name || 'Unknown'}</strong> · {patient.age}y · {patient.gender}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>

        {/* ── Left: Urgency Score + Priority ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Score ring */}
          <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
            <UrgencyRing score={result.urgency_score} color={cfg.ring} />
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>AI URGENCY SCORE</div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                borderRadius: 12, padding: '10px 22px',
              }}>
                <span style={{ fontSize: 22 }}>{cfg.emoji}</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: cfg.color }}>{result.priority}</span>
              </div>
            </div>
          </div>

          {/* Recommended Action */}
          <div className="card" style={{ padding: '20px 22px', borderLeft: `4px solid ${cfg.ring}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              RECOMMENDED ACTION
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {result.recommended_action}
            </p>
          </div>

          {/* Blood Status */}
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Droplets size={18} color="var(--accent-red)" />
              <div style={{ fontSize: 13, fontWeight: 700 }}>Blood Availability</div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: result.blood_available === 'Yes' ? 'var(--accent-green-light)' : 'var(--accent-red-light)',
              border: `1px solid ${result.blood_available === 'Yes' ? 'rgba(46,125,50,0.25)' : 'rgba(229,57,53,0.25)'}`,
              borderRadius: 10, padding: '12px 16px',
            }}>
              {result.blood_available === 'Yes'
                ? <CheckCircle size={20} color="var(--accent-green)" />
                : <AlertCircle size={20} color="var(--accent-red)" />}
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: result.blood_available === 'Yes' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {result.blood_available === 'Yes' ? 'Blood Available' : 'URGENT: No Blood Locally'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Blood group: <strong>{result.blood_group}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Vitals + Reasoning ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Vitals Grid */}
          <div className="card">
            <div className="card-header">
              <h3>📊 Recorded Vitals</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
                {vitals.map(({ label, val, unit, icon: Icon, warn }) => {
                  const isWarn = warn(val);
                  return (
                    <div key={label} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 18px', borderRadius: 12,
                      background: isWarn ? 'var(--accent-red-light)' : 'var(--bg)',
                      border: `1px solid ${isWarn ? 'rgba(229,57,53,0.25)' : 'var(--border)'}`,
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isWarn ? 'rgba(229,57,53,0.15)' : 'var(--primary-light)', flexShrink: 0 }}>
                        <Icon size={18} color={isWarn ? 'var(--accent-red)' : 'var(--primary)'} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: isWarn ? 'var(--accent-red)' : 'var(--text-primary)', lineHeight: 1.2 }}>
                          {val} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)' }}>{unit}</span>
                        </div>
                        {isWarn && <div style={{ fontSize: 11, color: 'var(--accent-red)', fontWeight: 700 }}>⚠ Abnormal</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Patient details strip */}
              <div style={{ display: 'flex', gap: 20, marginTop: 16, padding: '12px 16px', background: 'var(--bg)', borderRadius: 10, flexWrap: 'wrap' }}>
                {[
                  { label: 'Symptom', val: patient.symptom },
                  { label: 'History', val: patient.medical_history },
                  { label: 'Blood Group', val: patient.blood_group || result.blood_group },
                  { label: 'Age', val: `${patient.age} years` },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="card">
            <div className="card-header">
              <h3>🧠 AI Reasoning Factors</h3>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Random Forest · Model v2</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.reasoning.map((r, i) => (
                <div key={i} style={{
                  padding: '12px 16px', borderRadius: 10,
                  background: r.includes('⚠') || r.includes('🚨') || r.includes('🩸') ? 'var(--accent-red-light)' : 'var(--bg)',
                  border: `1px solid ${r.includes('⚠') || r.includes('🚨') || r.includes('🩸') ? 'rgba(229,57,53,0.2)' : 'var(--border)'}`,
                  fontSize: 14, fontWeight: 500, color: 'var(--text-primary)',
                }}>
                  {r}
                </div>
              ))}
            </div>
          </div>

          {/* Next steps */}
          <div className="card">
            <div className="card-header"><h3>📋 Next Steps</h3></div>
            <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/intake" className="btn btn-primary">New Patient</Link>
              <Link to="/queue" className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>
                <Clock size={15} /> View Queue
              </Link>
              <Link to="/blood-bank" className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>
                <Droplets size={15} /> Blood Bank Finder
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
