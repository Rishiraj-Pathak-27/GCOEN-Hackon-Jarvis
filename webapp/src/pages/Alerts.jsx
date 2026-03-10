import { useState } from 'react';
import { X, Bell } from 'lucide-react';

const initialAlerts = [
  { id: 1, type: 'critical', title: 'Critical Patient Arrived — P-042', body: 'Rahul Mehta (29M) has chest pain with urgency score 94. Immediate treatment required. O- blood needed urgently.', time: '2 min ago', read: false },
  { id: 2, type: 'critical', title: 'Blood Type O- — Low Availability', body: 'Patient P-042 requires O- blood. Only 1 nearby bank (AIIMS) has O- in stock. Contact immediately.', time: '4 min ago', read: false },
  { id: 3, type: 'high', title: 'High Priority Patient — P-039', body: 'Priya Sharma (24F) presents with shortness of breath, SpO₂ 88%. Urgency Score: 87. Monitor closely.', time: '8 min ago', read: false },
  { id: 4, type: 'high', title: 'Queue Overload Warning', body: '7 patients currently waiting. 3 are High/Critical priority. Consider activating additional staff.', time: '12 min ago', read: true },
  { id: 5, type: 'info', title: 'AI Model Completed Analysis', body: '3 new patient analyses processed in the last 30 minutes. Average urgency score: 72.', time: '18 min ago', read: true },
  { id: 6, type: 'success', title: 'Patient P-030 Discharged', body: 'Mohammed Farhan has been successfully discharged after treatment. Bed 4 is now available.', time: '25 min ago', read: true },
  { id: 7, type: 'info', title: 'Blood Bank Stock Updated', body: 'City Blood Bank has restocked A+ and B+ supply. 8 units of each available.', time: '40 min ago', read: true },
];

const typeIcons = { critical: '🚨', high: '⚠️', info: 'ℹ️', success: '✅' };

export default function Alerts() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState('all');

  const dismiss = id => setAlerts(a => a.filter(x => x.id !== id));
  const markRead = id => setAlerts(a => a.map(x => x.id === id ? { ...x, read: true } : x));
  const markAllRead = () => setAlerts(a => a.map(x => ({ ...x, read: true })));

  const filtered = filter === 'all' ? alerts :
    filter === 'unread' ? alerts.filter(a => !a.read) :
      alerts.filter(a => a.type === filter);

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Emergency Alerts</h1>
            <p>{unreadCount} unread alert{unreadCount !== 1 ? 's' : ''} — Stay informed on critical updates.</p>
          </div>
          <button className="btn btn-ghost" onClick={markAllRead}>
            <Bell size={14} /> Mark All Read
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Alerts', value: alerts.length, icon: '🔔', c: 'blue' },
          { label: 'Unread', value: unreadCount, icon: '📬', c: 'red' },
          { label: 'Critical', value: alerts.filter(a => a.type === 'critical').length, icon: '🚨', c: 'red' },
          { label: 'Resolved', value: alerts.filter(a => a.read).length, icon: '✅', c: 'green' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.c}`}>{s.icon}</div>
            <div className="stat-info">
              <h4>{s.label}</h4>
              <div className="value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'unread', 'critical', 'high', 'info', 'success'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: 12, padding: '6px 14px' }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="alert-panel">
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
            <div style={{ fontWeight: 700 }}>No alerts in this category</div>
          </div>
        )}
        {filtered.map(alert => (
          <div
            key={alert.id}
            className={`alert-item ${alert.type}`}
            onClick={() => markRead(alert.id)}
            style={{ cursor: 'pointer', opacity: alert.read ? 0.7 : 1 }}
          >
            <span className="alert-icon">{typeIcons[alert.type]}</span>
            <div className="alert-content">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {alert.title}
                {!alert.read && (
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--accent-red)', display: 'inline-block'
                  }} />
                )}
              </h4>
              <p>{alert.body}</p>
            </div>
            <span className="alert-time">{alert.time}</span>
            <button
              className="btn-icon"
              style={{ border: 'none', background: 'transparent', flexShrink: 0 }}
              onClick={e => { e.stopPropagation(); dismiss(alert.id); }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
