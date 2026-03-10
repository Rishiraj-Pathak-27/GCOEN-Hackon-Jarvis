import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Plus, Filter, Download } from 'lucide-react';

const patients = [
  { id: 'P-042', name: 'Rahul Mehta', symptom: 'Chest Pain', hr: 131, oxy: 93, temp: 38.7, score: 94, priority: 'critical', arrival: '10:03 AM', status: 'Awaiting' },
  { id: 'P-039', name: 'Priya Sharma', symptom: 'Shortness of Breath', hr: 94, oxy: 88, temp: 35.7, score: 87, priority: 'high', arrival: '10:12 AM', status: 'In Treatment' },
  { id: 'P-051', name: 'Anil Kumar', symptom: 'Fatigue', hr: 136, oxy: 88, temp: 37.7, score: 81, priority: 'high', arrival: '10:18 AM', status: 'Awaiting' },
  { id: 'P-034', name: 'Sneha Patel', symptom: 'Vomiting', hr: 94, oxy: 88, temp: 35.3, score: 69, priority: 'medium', arrival: '10:22 AM', status: 'Awaiting' },
  { id: 'P-028', name: 'Mohammed Ali', symptom: 'Dizziness', hr: 80, oxy: 97, temp: 37.0, score: 44, priority: 'medium', arrival: '10:30 AM', status: 'Awaiting' },
  { id: 'P-019', name: 'Kavita Rao', symptom: 'Headache', hr: 85, oxy: 95, temp: 38.6, score: 28, priority: 'low', arrival: '10:41 AM', status: 'Awaiting' },
  { id: 'P-011', name: 'Suresh Gupta', symptom: 'Cough', hr: 69, oxy: 97, temp: 36.1, score: 22, priority: 'low', arrival: '10:55 AM', status: 'Discharged' },
];

const PriorityBadge = ({ p }) => (
  <span className={`badge ${p}`}>
    <span className="dot" />
    {p.charAt(0).toUpperCase() + p.slice(1)}
  </span>
);

export default function Dashboard() {
  const [filter, setFilter] = useState('all');

  const counts = {
    total: patients.length,
    critical: patients.filter(p => p.priority === 'critical').length,
    high: patients.filter(p => p.priority === 'high').length,
    treatment: patients.filter(p => p.status === 'In Treatment').length,
    waiting: patients.filter(p => p.status === 'Awaiting').length,
  };

  const filtered = filter === 'all' ? patients : patients.filter(p => p.priority === filter);

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Emergency Dashboard</h1>
            <p>Real-time overview of emergency room activity — {new Date().toLocaleString()}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost"><RefreshCw size={14} /> Refresh</button>
            <Link to="/intake" className="btn btn-primary"><Plus size={14} /> New Patient</Link>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">🏥</div>
          <div className="stat-info">
            <h4>Total Patients</h4>
            <div className="value">{counts.total}</div>
            <div className="change up">↑ 3 in last hour</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">🚨</div>
          <div className="stat-info">
            <h4>Critical Cases</h4>
            <div className="value" style={{ color: 'var(--accent-red)' }}>{counts.critical}</div>
            <div className="change up">Immediate attention needed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⚠️</div>
          <div className="stat-info">
            <h4>High Priority</h4>
            <div className="value" style={{ color: 'var(--accent-orange)' }}>{counts.high}</div>
            <div className="change">Monitor closely</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <h4>In Treatment</h4>
            <div className="value" style={{ color: 'var(--accent-green)' }}>{counts.treatment}</div>
            <div className="change down">↓ normal load</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">⏳</div>
          <div className="stat-info">
            <h4>Waiting</h4>
            <div className="value">{counts.waiting}</div>
            <div className="change">In queue</div>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {counts.critical > 0 && (
        <div className="alert-item critical" style={{ marginBottom: 20, borderRadius: 10 }}>
          <span className="alert-icon">🚨</span>
          <div className="alert-content">
            <h4>Critical Patient Alert — {counts.critical} patient(s) require immediate attention!</h4>
            <p>Patient P-042 (Rahul Mehta) has chest pain with Urgency Score 94. Immediate treatment required.</p>
          </div>
          <Link to="/queue" className="btn btn-danger" style={{ marginLeft: 'auto', flexShrink: 0 }}>View Queue</Link>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="card">
        <div className="card-header">
          <h3>Patient Queue</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'critical', 'high', 'medium', 'low'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '5px 12px', fontSize: 12 }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <button className="btn btn-ghost" style={{ marginLeft: 8 }}><Download size={14} /></button>
          </div>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Symptom</th>
                <th>HR</th>
                <th>SpO₂</th>
                <th>Temp</th>
                <th>Urgency</th>
                <th>Priority</th>
                <th>Arrival</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className={p.priority === 'critical' ? 'critical-row' : ''}>
                  <td><strong>{p.id}</strong></td>
                  <td>{p.name}</td>
                  <td>{p.symptom}</td>
                  <td>{p.hr} bpm</td>
                  <td>{p.oxy}%</td>
                  <td>{p.temp}°C</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 60, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${p.score}%`, height: '100%',
                          background: p.priority === 'critical' ? 'var(--accent-red)' :
                            p.priority === 'high' ? 'var(--accent-orange)' :
                              p.priority === 'medium' ? 'var(--accent-yellow)' : 'var(--accent-green)',
                          borderRadius: 3
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{p.score}</span>
                    </div>
                  </td>
                  <td><PriorityBadge p={p.priority} /></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{p.arrival}</td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 12,
                      background: p.status === 'In Treatment' ? 'var(--accent-green-light)' :
                        p.status === 'Discharged' ? 'var(--border)' : 'var(--primary-light)',
                      color: p.status === 'In Treatment' ? 'var(--accent-green)' :
                        p.status === 'Discharged' ? 'var(--text-muted)' : 'var(--primary)'
                    }}>{p.status}</span>
                  </td>
                  <td>
                    <Link to="/analysis" className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 11 }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
