import { useState } from 'react';

const filters = ['All', 'Hospitals', 'Blood Banks', 'Ambulances'];

const locations = [
  { type: 'hospital', emoji: '🏥', name: 'City General Hospital', dist: '0.3 km', status: 'ER Open', statusOk: true },
  { type: 'blood', emoji: '🩸', name: 'City Blood Bank', dist: '0.8 km', status: 'All Types Available', statusOk: true },
  { type: 'hospital', emoji: '🏥', name: 'Apollo Medical Centre', dist: '1.1 km', status: 'ER Open', statusOk: true },
  { type: 'blood', emoji: '🩸', name: 'Apollo Blood Centre', dist: '1.2 km', status: 'Limited Stock', statusOk: false },
  { type: 'ambulance', emoji: '🚑', name: 'EMS Station 4', dist: '1.5 km', status: '3 Units Available', statusOk: true },
  { type: 'hospital', emoji: '🏥', name: 'AIIMS Delhi', dist: '2.4 km', status: 'Trauma Centre Open', statusOk: true },
];

export default function Maps() {
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? locations :
    active === 'Hospitals' ? locations.filter(l => l.type === 'hospital') :
      active === 'Blood Banks' ? locations.filter(l => l.type === 'blood') :
        locations.filter(l => l.type === 'ambulance');

  return (
    <div className="page">
      <div className="page-header">
        <h1>Emergency Maps</h1>
        <p>Interactive map showing nearby hospitals, blood banks, and emergency services.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`btn ${active === f ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: 12, padding: '7px 16px' }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 20 }}>
        {/* Map */}
        <div className="map-placeholder" style={{ height: 460 }}>
          <div className="map-icon">📍</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Google Maps Integration</div>
            <p style={{ fontSize: 13, color: 'var(--primary)', opacity: 0.7, maxWidth: 280, lineHeight: 1.6 }}>
              Add your Google Maps API key to show nearby hospitals, blood banks, and emergency services with real-time navigation.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ padding: '4px 12px', background: 'var(--primary)', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>🏥 Hospitals</span>
            <span style={{ padding: '4px 12px', background: 'var(--accent-red)', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>🩸 Blood Banks</span>
            <span style={{ padding: '4px 12px', background: 'var(--accent-orange)', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>🚑 EMS</span>
          </div>
        </div>

        {/* Location List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 460, overflowY: 'auto' }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {filtered.length} locations found
          </div>
          {filtered.map((l, i) => (
            <div key={i} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{l.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {l.dist} away</div>
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, flexShrink: 0,
                  background: l.statusOk ? 'var(--accent-green-light)' : 'var(--accent-orange-light)',
                  color: l.statusOk ? 'var(--accent-green)' : 'var(--accent-orange)'
                }}>{l.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}>🧭 Navigate</button>
                <button className="btn btn-ghost" style={{ fontSize: 11 }}>📞 Call</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
