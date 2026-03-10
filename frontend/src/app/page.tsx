'use client';

import Link from 'next/link';
import { useApp } from '@/context/AppContext';

function formatTimeSince(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
}

export default function DashboardPage() {
  const { patients, stats } = useApp();

  const recentCritical = patients
    .filter(p => p.priority === 'critical' || p.priority === 'high')
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .slice(0, 5);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Emergency department overview at a glance</p>
      </div>

      {stats.critical > 0 && (
        <div className="alert-bar alert-critical section-gap">
          ⚠️ <strong>{stats.critical} critical patient{stats.critical > 1 ? 's' : ''}</strong> currently requiring immediate attention
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid-4 section-gap">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--critical-bg)', color: 'var(--critical)' }}>🔴</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: 'var(--critical)' }}>{stats.critical}</div>
            <div className="stat-label">Critical</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--high-bg)', color: 'var(--high)' }}>🟠</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: 'var(--high)' }}>{stats.high}</div>
            <div className="stat-label">High Priority</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--medium-bg)', color: 'var(--medium)' }}>⏳</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: 'var(--medium)' }}>{stats.waiting}</div>
            <div className="stat-label">Waiting</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>📋</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.total}</div>
            <div className="stat-label">Total Patients</div>
          </div>
        </div>
      </div>

      <div className="grid-2 section-gap">
        {/* Priority Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Priority Distribution</h3>
          </div>
          {(['critical', 'high', 'medium', 'low'] as const).map(level => {
            const count = patients.filter(p => p.priority === level).length;
            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
            const colors = { critical: 'var(--critical)', high: 'var(--high)', medium: 'var(--medium)', low: 'var(--low)' };
            return (
              <div key={level} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{level}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: colors[level] }}>{count} ({Math.round(pct)}%)</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: colors[level] }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Department Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🏥 Department Activity</h3>
          </div>
          {[
            { label: 'In Treatment', count: patients.filter(p => p.status === 'in-treatment').length, color: 'var(--primary)' },
            { label: 'Waiting', count: stats.waiting, color: 'var(--medium)' },
            { label: 'Completed', count: patients.filter(p => p.status === 'completed').length, color: 'var(--low)' },
            { label: 'Transferred', count: patients.filter(p => p.status === 'transferred').length, color: '#7c3aed' },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem' }}>{s.label}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: s.color }}>{s.count}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${stats.total > 0 ? (s.count / stats.total) * 100 : 0}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Critical/High Patients */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🚨 High Priority Patients</h3>
          <Link href="/queue" className="btn btn-sm btn-outline">View All →</Link>
        </div>
        {recentCritical.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>No urgent patients</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Symptoms</th>
                  <th>Score</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Arrival</th>
                </tr>
              </thead>
              <tbody>
                {recentCritical.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.id}</td>
                    <td>{p.name}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.symptoms.join(', ')}
                    </td>
                    <td><strong>{p.urgencyScore}</strong>/100</td>
                    <td><span className={`badge badge-${p.priority}`}>{p.priority}</span></td>
                    <td><span className={`status status-${p.status}`}>{p.status === 'in-treatment' ? 'In Treatment' : p.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{formatTimeSince(p.arrivalTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid-3 section-gap" style={{ marginTop: '20px' }}>
        <Link href="/intake" className="card" style={{ textDecoration: 'none', textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>New Patient Intake</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Register and assess a new patient</div>
        </Link>
        <Link href="/queue" className="card" style={{ textDecoration: 'none', textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Triage Queue</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>View and manage patient queue</div>
        </Link>
        <Link href="/analysis" className="card" style={{ textDecoration: 'none', textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤖</div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>AI Analysis</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>View model integration & results</div>
        </Link>
      </div>
    </div>
  );
}
