'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

function formatTime(date: Date): string {
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function HistoryPage() {
  const { patients } = useApp();
  const [search, setSearch] = useState('');

  const sorted = useMemo(() => {
    let list = [...patients].sort((a, b) => b.arrivalTime.getTime() - a.arrivalTime.getTime());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.symptoms.some(s => s.toLowerCase().includes(q)) ||
        p.medicalHistory.toLowerCase().includes(q)
      );
    }
    return list;
  }, [patients, search]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📁 Patient History</h1>
        <p className="page-subtitle">Search and review all patient records</p>
      </div>

      <div className="search-bar section-gap">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search by ID, name, symptoms, or medical history..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Records</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{sorted.length} records</span>
        </div>

        {sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No records found</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age/Gender</th>
                  <th>Symptoms</th>
                  <th>Score</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Medical History</th>
                  <th>Arrived</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.age}{p.gender === 'male' ? 'M' : p.gender === 'female' ? 'F' : 'O'}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.symptoms.join(', ')}
                    </td>
                    <td><strong>{p.urgencyScore}</strong></td>
                    <td><span className={`badge badge-${p.priority}`}>{p.priority}</span></td>
                    <td><span className={`status status-${p.status}`}>
                      {p.status === 'in-treatment' ? 'In Treatment' : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span></td>
                    <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {p.medicalHistory || '—'}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatTime(p.arrivalTime)}
                    </td>
                    <td>
                      <Link href={`/analysis?patient=${p.id}`} className="btn btn-sm btn-outline">Details</Link>
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
