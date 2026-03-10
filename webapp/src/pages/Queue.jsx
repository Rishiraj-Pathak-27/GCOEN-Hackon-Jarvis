import { Link } from 'react-router-dom';

const patients = [
  { id: 'P-042', name: 'Rahul Mehta', symptom: 'Chest Pain', score: 94, priority: 'critical', arrival: '10:03 AM', wait: '8m', blood: 'O-' },
  { id: 'P-039', name: 'Priya Sharma', symptom: 'Shortness of Breath', score: 87, priority: 'high', arrival: '10:12 AM', wait: '5m', blood: 'A+' },
  { id: 'P-051', name: 'Anil Kumar', symptom: 'Fatigue', score: 81, priority: 'high', arrival: '10:18 AM', wait: '3m', blood: 'B+' },
  { id: 'P-034', name: 'Sneha Patel', symptom: 'Vomiting', score: 69, priority: 'medium', arrival: '10:22 AM', wait: '2m', blood: 'AB+' },
  { id: 'P-028', name: 'Mohammed Ali', symptom: 'Dizziness', score: 44, priority: 'medium', arrival: '10:30 AM', wait: '1m', blood: 'O+' },
  { id: 'P-019', name: 'Kavita Rao', symptom: 'Headache', score: 28, priority: 'low', arrival: '10:41 AM', wait: '12m', blood: 'A-' },
  { id: 'P-011', name: 'Suresh Gupta', symptom: 'Cough', score: 22, priority: 'low', arrival: '10:55 AM', wait: '20m', blood: 'B-' },
];

const PriorityBadge = ({ p }) => (
  <span className={`badge ${p}`}>
    <span className="dot" />{p.charAt(0).toUpperCase() + p.slice(1)}
  </span>
);

const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
const sorted = [...patients].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

const barColor = { critical: 'var(--accent-red)', high: 'var(--accent-orange)', medium: 'var(--accent-yellow)', low: 'var(--accent-green)' };

export default function Queue() {
  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Patient Queue</h1>
            <p>Auto-sorted by priority level and urgency score. {patients.length} patients currently waiting.</p>
          </div>
          <Link to="/intake" className="btn btn-primary">+ Add Patient</Link>
        </div>
      </div>

      {/* Summary Row */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {['critical', 'high', 'medium', 'low'].map(p => {
          const count = patients.filter(x => x.priority === p).length;
          const icons = { critical: '🚨', high: '⚠️', medium: '🔶', low: '✅' };
          const colors = { critical: 'red', high: 'orange', medium: 'yellow', low: 'green' };
          return (
            <div className="stat-card" key={p}>
              <div className={`stat-icon ${colors[p]}`}>{icons[p]}</div>
              <div className="stat-info">
                <h4>{p.charAt(0).toUpperCase() + p.slice(1)}</h4>
                <div className="value">{count}</div>
                <div className="change">in queue</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Queue List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((p, idx) => (
          <div key={p.id} className={`card ${p.priority === 'critical' ? 'critical-row' : ''}`}
            style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Position */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: p.priority === 'critical' ? 'var(--accent-red)' : 'var(--bg)',
              color: p.priority === 'critical' ? '#fff' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 13
            }}>{idx + 1}</div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontWeight: 700 }}>{p.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.id}</span>
                <PriorityBadge p={p.priority} />
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>🩺 {p.symptom}</span>
                <span>🩸 {p.blood}</span>
                <span>📅 {p.arrival}</span>
                <span>⏱ Waiting: {p.wait}</span>
              </div>
            </div>

            {/* Urgency Bar */}
            <div style={{ width: 160 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Urgency</span>
                <span style={{ fontWeight: 700, color: barColor[p.priority] }}>{p.score}</span>
              </div>
              <div className="urgency-bar-wrap">
                <div className="urgency-bar" style={{ width: `${p.score}%`, background: barColor[p.priority] }} />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <Link to="/analysis" className="btn btn-outline" style={{ fontSize: 12, padding: '5px 12px' }}>Analyze</Link>
              {p.priority === 'critical' && (
                <button className="btn btn-danger" style={{ fontSize: 12, padding: '5px 12px' }}>Treat Now</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
