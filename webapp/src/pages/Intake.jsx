import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Heart, Activity, Thermometer, Droplets, AlertCircle, Loader } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RARE_TYPES   = ['AB-', 'B-', 'A-', 'O-'];
const API          = 'http://localhost:5000';

export default function Intake() {
  const navigate = useNavigate();

  // form state
  const [form, setForm] = useState({
    name: '', age: '', gender: 'Male', symptom: '',
    heart_rate: '', oxygen_level: '', temperature: '',
    systolic_bp: '', medical_history: 'none',
    blood_group: 'O+', blood_banks_nearby: 1,
  });

  // meta from backend
  const [meta, setMeta] = useState({ symptoms: [], medical_history: [], blood_groups: BLOOD_GROUPS });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [backendOk, setBackendOk] = useState(true);

  useEffect(() => {
    fetch(`${API}/meta`)
      .then(r => r.json())
      .then(d => setMeta(d))
      .catch(() => setBackendOk(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          age:              parseFloat(form.age),
          heart_rate:       parseFloat(form.heart_rate),
          oxygen_level:     parseFloat(form.oxygen_level),
          temperature:      parseFloat(form.temperature),
          systolic_bp:      parseFloat(form.systolic_bp),
          blood_banks_nearby: parseInt(form.blood_banks_nearby),
        }),
      });
      if (!res.ok) throw new Error('Prediction failed');
      const result = await res.json();
      navigate('/analysis', { state: { result, patient: form } });
    } catch (err) {
      setError('Could not reach the AI backend. Make sure the Flask server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      name: '', age: '', gender: 'Male', symptom: '',
      heart_rate: '', oxygen_level: '', temperature: '',
      systolic_bp: '', medical_history: 'none',
      blood_group: 'O+', blood_banks_nearby: 1,
    });
    setError('');
  };

  const isRare = RARE_TYPES.includes(form.blood_group);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Patient Intake Form</h1>
        <p>Enter patient vitals and history for AI-powered triage classification</p>
      </div>

      {!backendOk && (
        <div className="alert-banner alert-banner-warning" style={{ marginBottom: 24 }}>
          <AlertCircle size={18} />
          <span>⚠️ Backend offline — start the Flask server: <code>cd dataset && source .venv/bin/activate && python ../backend/app.py</code></span>
        </div>
      )}

      {error && (
        <div className="alert-banner alert-banner-critical" style={{ marginBottom: 24 }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* ── Patient Demographics ── */}
          <div className="card">
            <div className="card-header">
              <h3><User size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Patient Demographics</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Enter patient name" value={form.name}
                  onChange={e => set('name', e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="form-input" type="number" min="0" max="120" placeholder="e.g. 45"
                    value={form.age} onChange={e => set('age', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Primary Symptom</label>
                <select className="form-input" value={form.symptom} onChange={e => set('symptom', e.target.value)} required>
                  <option value="">-- Select symptom --</option>
                  {(meta.symptoms.length ? meta.symptoms : ['chest pain','fever','headache','vomiting','cough','dizziness','fatigue','injury','shortness of breath','abdominal pain'])
                    .map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Medical History</label>
                <select className="form-input" value={form.medical_history} onChange={e => set('medical_history', e.target.value)}>
                  {(meta.medical_history.length ? meta.medical_history : ['none','diabetes','hypertension','asthma','heart disease'])
                    .map(h => <option key={h} value={h}>{h.charAt(0).toUpperCase() + h.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Vital Signs ── */}
          <div className="card">
            <div className="card-header">
              <h3><Activity size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Vital Signs</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label"><Heart size={13} style={{ marginRight: 4 }} />Heart Rate (bpm)</label>
                  <input className="form-input" type="number" placeholder="e.g. 90"
                    value={form.heart_rate} onChange={e => set('heart_rate', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label"><Activity size={13} style={{ marginRight: 4 }} />Oxygen Level (%)</label>
                  <input className="form-input" type="number" min="0" max="100" placeholder="e.g. 97"
                    value={form.oxygen_level} onChange={e => set('oxygen_level', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label"><Thermometer size={13} style={{ marginRight: 4 }} />Temperature (°C)</label>
                  <input className="form-input" type="number" step="0.1" placeholder="e.g. 37.5"
                    value={form.temperature} onChange={e => set('temperature', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Systolic BP (mmHg)</label>
                  <input className="form-input" type="number" placeholder="e.g. 120"
                    value={form.systolic_bp} onChange={e => set('systolic_bp', e.target.value)} required />
                </div>
              </div>

              {/* Live vitals preview */}
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                {[
                  { label: 'HR', val: form.heart_rate, unit: 'bpm', warn: v => v > 120 || v < 50 },
                  { label: 'SpO₂', val: form.oxygen_level, unit: '%', warn: v => v < 94 },
                  { label: 'Temp', val: form.temperature, unit: '°C', warn: v => v > 39.5 || v < 35 },
                  { label: 'BP', val: form.systolic_bp, unit: 'mmHg', warn: v => v > 180 || v < 80 },
                ].map(({ label, val, unit, warn }) => {
                  const isWarn = val && warn(parseFloat(val));
                  return (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 8, background: isWarn ? 'var(--accent-red-light)' : '#fff', border: `1px solid ${isWarn ? 'rgba(229,57,53,0.25)' : 'var(--border)'}` }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: isWarn ? 'var(--accent-red)' : 'var(--text-primary)' }}>{val || '—'} <span style={{ fontSize: 11, fontWeight: 400 }}>{unit}</span></span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Blood Information ── */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-header">
              <h3><Droplets size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Blood Information</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-input" value={form.blood_group} onChange={e => set('blood_group', e.target.value)}>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nearby Blood Banks</label>
                  <input className="form-input" type="number" min="0" max="10" placeholder="0–10"
                    value={form.blood_banks_nearby} onChange={e => set('blood_banks_nearby', e.target.value)} />
                </div>
                <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center' }}>
                  {isRare ? (
                    <div style={{ background: 'var(--accent-red-light)', border: '1px solid rgba(229,57,53,0.3)', borderRadius: 10, padding: '12px 16px', width: '100%' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <AlertCircle size={16} color="var(--accent-red)" />
                        <span style={{ fontWeight: 700, color: 'var(--accent-red)', fontSize: 14 }}>Rare Blood Type — {form.blood_group}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                        This blood type is rare. Availability may be limited nearby. Ensure a compatible donor is identified.
                      </p>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--accent-green-light)', border: '1px solid rgba(46,125,50,0.2)', borderRadius: 10, padding: '12px 16px', width: '100%' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: 14 }}>✅ Common blood type — {form.blood_group}</span>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>Generally available at most blood banks.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', marginTop: 24 }}>
          <button type="button" className="btn btn-ghost" onClick={handleReset} style={{ border: '1px solid var(--border)' }}>
            Reset Form
          </button>
          <button type="submit" className="btn btn-danger" disabled={loading} style={{ padding: '12px 32px', fontSize: 16, fontWeight: 800 }}>
            {loading ? <><Loader size={18} className="spin" /> Analyzing...</> : '🧠 Run AI Analysis'}
          </button>
        </div>
      </form>
    </div>
  );
}
