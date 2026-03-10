import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Navigation, Clock } from 'lucide-react';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const rareGroups = ['A-', 'B-', 'AB-', 'O-'];

const banks = [
  { name: 'City Blood Bank', dist: '0.8 km', time: '5 min', phone: '+91 98765 43210', available: ['A+', 'B+', 'O+', 'AB+', 'O-'], status: 'open' },
  { name: 'Apollo Blood Centre', dist: '1.2 km', time: '8 min', phone: '+91 98765 43211', available: ['A+', 'A-', 'B+', 'O+', 'O-'], status: 'open' },
  { name: 'AIIMS Donate Dept.', dist: '2.4 km', time: '12 min', phone: '+91 98765 43212', available: ['A+', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], status: 'open' },
  { name: 'Red Cross Society', dist: '3.0 km', time: '15 min', phone: '+91 98765 43213', available: ['A+', 'O+', 'O-'], status: 'open' },
  { name: 'District Hospital Bank', dist: '4.2 km', time: '22 min', phone: '+91 98765 43214', available: ['A+', 'A-', 'B+', 'O+'], status: 'open' },
];

export default function BloodBank() {
  const [selected, setSelected] = useState('O-');

  const filtered = banks.filter(b => b.available.includes(selected));
  const unavailable = banks.filter(b => !b.available.includes(selected));

  return (
    <div className="page">
      <div className="page-header">
        <h1>Blood Bank Finder</h1>
        <p>Locate nearby blood banks with compatible blood units for your patient.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Map + Filter */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <h3>🩸 Select Blood Group</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {filtered.length} of {banks.length} banks available
              </span>
            </div>
            <div className="card-body">
              <div className="blood-group-selector">
                {bloodGroups.map(b => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setSelected(b)}
                    className={`blood-chip${rareGroups.includes(b) ? ' rare' : ''}${selected === b ? ' selected' : ''}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              {rareGroups.includes(selected) && (
                <div className="alert-item high" style={{ marginTop: 12, borderRadius: 8 }}>
                  <span>⚠️</span>
                  <div className="alert-content">
                    <p><strong>{selected}</strong> is a rare blood type. Limited availability at nearby banks.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map placeholder */}
          <div className="map-placeholder">
            <div className="map-icon">🗺️</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Google Maps Integration</div>
              <p style={{ fontSize: 13, color: 'var(--primary)', opacity: 0.7, maxWidth: 280, lineHeight: 1.6 }}>
                Add your Google Maps API key to activate the interactive map showing blood bank locations and real-time navigation.
              </p>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 4 }}>
              Configure Maps API →
            </button>
          </div>
        </div>

        {/* Blood Bank List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>
            ✅ Available for <strong style={{ color: 'var(--primary)' }}>{selected}</strong>
          </div>
          {filtered.length === 0 && (
            <div className="alert-item critical" style={{ borderRadius: 10 }}>
              <span>🩸</span>
              <div className="alert-content">
                <h4>No blood banks have {selected} available nearby</h4>
                <p>Try a wider search or contact regional blood authority.</p>
              </div>
            </div>
          )}
          {filtered.map(b => (
            <div key={b.name} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{b.name}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span>📍 {b.dist}</span>
                    <span><Clock size={11} style={{ verticalAlign: 'middle' }} /> {b.time}</span>
                  </div>
                </div>
                <span style={{
                  padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: 'var(--accent-green-light)', color: 'var(--accent-green)'
                }}>Available</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                {b.available.map(bg => (
                  <span key={bg} style={{
                    padding: '1px 7px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                    background: bg === selected ? 'var(--primary)' : 'var(--bg)',
                    color: bg === selected ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border)'
                  }}>{bg}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>
                  <Navigation size={12} /> Navigate
                </button>
                <button className="btn btn-ghost" style={{ fontSize: 12 }}>
                  <Phone size={12} /> Call
                </button>
              </div>
            </div>
          ))}

          {unavailable.length > 0 && (
            <>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                ❌ Unavailable
              </div>
              {unavailable.map(b => (
                <div key={b.name} style={{
                  padding: '12px 14px', border: '1px solid var(--border)',
                  borderRadius: 10, opacity: 0.6, background: 'var(--white)'
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {b.dist} · No {selected} stock</div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
