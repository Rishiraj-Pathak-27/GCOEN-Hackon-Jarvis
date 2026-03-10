'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { PriorityLevel, PatientStatus } from '@/types';

function formatTimeSince(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
}

const statusLabels: Record<PatientStatus, string> = {
  'waiting': 'Waiting',
  'in-treatment': 'In Treatment',
  'completed': 'Completed',
  'transferred': 'Transferred',
};

export default function QueuePage() {
  const { patients, updatePatientStatus } = useApp();
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<PriorityLevel | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<PatientStatus | 'all'>('all');

  const filtered = useMemo(() => {
    let list = [...patients];
    if (filterPriority !== 'all') list = list.filter(p => p.priority === filterPriority);
    if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.symptoms.some(s => s.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => b.urgencyScore - a.urgencyScore);
    return list;
  }, [patients, filterPriority, filterStatus, search]);

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">👥 Triage Queue</h1>
          <p className="page-subtitle">All current patients sorted by urgency — most critical first</p>
        </div>
        <Link href="/intake" className="btn btn-primary">+ New Patient</Link>
      </div>

      {/* Search */}
      <div className="search-bar section-gap">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search patients by ID, name, or symptoms..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>PRIORITY</label>
          <div className="filter-row">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map(v => (
              <button key={v} className={`filter-chip ${filterPriority === v ? 'active' : ''}`} onClick={() => setFilterPriority(v)}>
                {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>STATUS</label>
          <div className="filter-row">
            {(['all', 'waiting', 'in-treatment', 'completed', 'transferred'] as const).map(v => (
              <button key={v} className={`filter-chip ${filterStatus === v ? 'active' : ''}`} onClick={() => setFilterStatus(v)}>
                {v === 'all' ? 'All' : statusLabels[v] || v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Patient Queue</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{filtered.length} patients</span>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No patients match filters</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Symptoms</th>
                  <th>Score</th>
                  <th>Priority</th>
                  <th>Area</th>
                  <th>Status</th>
                  <th>Arrival</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.age}</td>
                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.symptoms.join(', ')}
                    </td>
                    <td>
                      <strong>{p.urgencyScore}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>/100</span>
                    </td>
                    <td><span className={`badge badge-${p.priority}`}>{p.priority}</span></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{p.assignedArea}</td>
                    <td>
                      <select
                        className="form-select"
                        value={p.status}
                        onChange={e => updatePatientStatus(p.id, e.target.value as PatientStatus)}
                        style={{ padding: '4px 28px 4px 8px', fontSize: '0.78rem', minWidth: '120px' }}
                      >
                        <option value="waiting">⏳ Waiting</option>
                        <option value="in-treatment">💊 In Treatment</option>
                        <option value="completed">✅ Completed</option>
                        <option value="transferred">🔄 Transferred</option>
                      </select>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatTimeSince(p.arrivalTime)}
                    </td>
                    <td>
                      <Link href={`/analysis?patient=${p.id}`} className="btn btn-sm btn-outline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
