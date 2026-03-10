import { useState, useCallback, useEffect, useRef } from 'react';
import { Phone, Navigation, Clock, MapPin, RefreshCw } from 'lucide-react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';

const libraries = ['places'];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const rareGroups = ['A-', 'B-', 'AB-', 'O-'];

// Default center (Delhi, India)
const defaultCenter = { lat: 28.6139, lng: 77.2090 };

const containerStyle = {
  width: '100%',
  height: '320px',
  borderRadius: '12px',
};

export default function BloodBank() {
  const [selected, setSelected] = useState('O-');
  const [userLocation, setUserLocation] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const mapRef = useRef(null);

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        setCenter(loc);
        setLoading(false);
        if (mapRef.current) {
          searchBloodBanks(loc);
        }
      },
      (error) => {
        setLocationError('Unable to get location. Please allow location access.');
        setLoading(false);
        // Still show mock data even if location fails
        loadMockBloodBanks(defaultCenter);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Generate mock blood banks near a location
  const generateMockBloodBanks = useCallback((location) => {
    return [
      { id: 'bb1', name: 'City Blood Bank', address: '123 Medical Center Road', lat: location.lat + 0.008, lng: location.lng + 0.005, phone: '+91 98765 43210', available: ['A+', 'B+', 'O+', 'AB+', 'O-'], isOpen: true, rating: 4.8 },
      { id: 'bb2', name: 'Apollo Blood Centre', address: '456 Healthcare Avenue', lat: location.lat - 0.006, lng: location.lng + 0.012, phone: '+91 98765 43211', available: ['A+', 'A-', 'B+', 'O+', 'O-'], isOpen: true, rating: 4.7 },
      { id: 'bb3', name: 'AIIMS Blood Donation Dept.', address: '789 Hospital Complex', lat: location.lat + 0.015, lng: location.lng - 0.008, phone: '+91 98765 43212', available: ['A+', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], isOpen: true, rating: 4.9 },
      { id: 'bb4', name: 'Red Cross Blood Center', address: '321 Charity Lane', lat: location.lat - 0.012, lng: location.lng - 0.005, phone: '+91 98765 43213', available: ['A+', 'O+', 'O-'], isOpen: true, rating: 4.6 },
      { id: 'bb5', name: 'District Hospital Blood Bank', address: '555 Government Hospital', lat: location.lat + 0.003, lng: location.lng + 0.018, phone: '+91 98765 43214', available: ['A+', 'A-', 'B+', 'O+'], isOpen: true, rating: 4.4 },
      { id: 'bb6', name: 'LifeStream Blood Services', address: '777 Life Tower', lat: location.lat - 0.018, lng: location.lng + 0.008, phone: '+91 98765 43215', available: ['A+', 'B+', 'AB+', 'O+', 'O-', 'B-'], isOpen: true, rating: 4.5 },
      { id: 'bb7', name: 'Metro Blood Bank', address: '888 Metro Plaza', lat: location.lat + 0.010, lng: location.lng - 0.015, phone: '+91 98765 43216', available: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+'], isOpen: false, rating: 4.3 },
      { id: 'bb8', name: 'Unity Blood Donation Center', address: '999 Unity Circle', lat: location.lat - 0.008, lng: location.lng - 0.012, phone: '+91 98765 43217', available: ['A+', 'B+', 'O+', 'AB-'], isOpen: true, rating: 4.2 },
    ].map(bank => ({
      ...bank,
      dist: calculateDistance(location, { lat: bank.lat, lng: bank.lng })
    })).sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
  }, []);

  // Load mock blood banks
  const loadMockBloodBanks = useCallback((location) => {
    const mockBanks = generateMockBloodBanks(location);
    setBloodBanks(mockBanks);
  }, [generateMockBloodBanks]);

  // Search for blood banks using Places API
  const searchBloodBanks = useCallback((location) => {
    // If Google Maps API isn't available, use mock data
    if (!mapRef.current || !window.google || !window.google.maps?.places) {
      loadMockBloodBanks(location);
      return;
    }

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    
    // Search for blood banks
    const request = {
      location: new window.google.maps.LatLng(location.lat, location.lng),
      radius: 10000,
      query: 'blood bank blood donation center',
    };

    service.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        const banks = results.slice(0, 8).map((place, index) => {
          // Simulate blood availability (in real app, this would come from an API)
          const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
          const availableCount = Math.floor(Math.random() * 4) + 3;
          const shuffled = [...allGroups].sort(() => Math.random() - 0.5);
          const available = shuffled.slice(0, availableCount);
          
          return {
            id: place.place_id,
            name: place.name,
            address: place.formatted_address || place.vicinity,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            rating: place.rating,
            isOpen: place.opening_hours?.isOpen?.() ?? true,
            phone: '+91 98765 4321' + index,
            available: available,
            dist: calculateDistance(location, {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            }),
          };
        });
        
        // Sort by distance
        banks.sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
        setBloodBanks(banks);
      } else {
        // Fallback to mock data if API returns no results
        loadMockBloodBanks(location);
      }
    });
  }, [loadMockBloodBanks]);

  // Calculate distance
  const calculateDistance = (loc1, loc2) => {
    const R = 6371;
    const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc1.lat * Math.PI) / 180) *
        Math.cos((loc2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Estimate travel time (rough estimate: 30 km/h average)
  const getTime = (dist) => {
    const minutes = Math.round((parseFloat(dist) / 30) * 60);
    return minutes < 1 ? '1 min' : `${minutes} min`;
  };

  // Load mock data immediately on component mount
  useEffect(() => {
    // Load mock data for default center immediately so users see something
    const mockBanks = [
      { id: 'bb1', name: 'City Blood Bank', address: '123 Medical Center Road', lat: defaultCenter.lat + 0.008, lng: defaultCenter.lng + 0.005, phone: '+91 98765 43210', available: ['A+', 'B+', 'O+', 'AB+', 'O-'], isOpen: true, rating: 4.8 },
      { id: 'bb2', name: 'Apollo Blood Centre', address: '456 Healthcare Avenue', lat: defaultCenter.lat - 0.006, lng: defaultCenter.lng + 0.012, phone: '+91 98765 43211', available: ['A+', 'A-', 'B+', 'O+', 'O-'], isOpen: true, rating: 4.7 },
      { id: 'bb3', name: 'AIIMS Blood Donation Dept.', address: '789 Hospital Complex', lat: defaultCenter.lat + 0.015, lng: defaultCenter.lng - 0.008, phone: '+91 98765 43212', available: ['A+', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], isOpen: true, rating: 4.9 },
      { id: 'bb4', name: 'Red Cross Blood Center', address: '321 Charity Lane', lat: defaultCenter.lat - 0.012, lng: defaultCenter.lng - 0.005, phone: '+91 98765 43213', available: ['A+', 'O+', 'O-'], isOpen: true, rating: 4.6 },
      { id: 'bb5', name: 'District Hospital Blood Bank', address: '555 Government Hospital', lat: defaultCenter.lat + 0.003, lng: defaultCenter.lng + 0.018, phone: '+91 98765 43214', available: ['A+', 'A-', 'B+', 'O+'], isOpen: true, rating: 4.4 },
      { id: 'bb6', name: 'LifeStream Blood Services', address: '777 Life Tower', lat: defaultCenter.lat - 0.018, lng: defaultCenter.lng + 0.008, phone: '+91 98765 43215', available: ['A+', 'B+', 'AB+', 'O+', 'O-', 'B-'], isOpen: true, rating: 4.5 },
      { id: 'bb7', name: 'Metro Blood Bank', address: '888 Metro Plaza', lat: defaultCenter.lat + 0.010, lng: defaultCenter.lng - 0.015, phone: '+91 98765 43216', available: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+'], isOpen: false, rating: 4.3 },
      { id: 'bb8', name: 'Unity Blood Donation Center', address: '999 Unity Circle', lat: defaultCenter.lat - 0.008, lng: defaultCenter.lng - 0.012, phone: '+91 98765 43217', available: ['A+', 'B+', 'O+', 'AB-'], isOpen: true, rating: 4.2 },
    ].map(bank => ({
      ...bank,
      dist: calculateDistance(defaultCenter, { lat: bank.lat, lng: bank.lng })
    })).sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
    setBloodBanks(mockBanks);
  }, []);

  // On map load
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Navigate to place
  const navigateToPlace = (bank) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${bank.lat},${bank.lng}`, '_blank');
  };

  // Filter banks by selected blood group
  const filtered = bloodBanks.filter(b => b.available.includes(selected));
  const unavailable = bloodBanks.filter(b => !b.available.includes(selected));

  // Create marker icon
  const createMarkerIcon = (isUser) => {
    if (isUser) {
      return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#4285F4" stroke="#fff" stroke-width="3"/>
            <circle cx="12" cy="12" r="5" fill="#fff"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24),
      };
    }
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 40 48">
          <path d="M20 0C8.954 0 0 8.954 0 20c0 14 20 28 20 28s20-14 20-28C40 8.954 31.046 0 20 0z" fill="#e53935"/>
          <text x="20" y="26" text-anchor="middle" font-size="18">🩸</text>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(36, 44),
    };
  };

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
                {filtered.length} of {bloodBanks.length} banks available
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

          {/* Google Map */}
          {loadError ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <h3 style={{ marginBottom: 8, color: 'var(--accent-red)' }}>Maps Error</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                Unable to load Google Maps. Please check your API key and ensure Maps JavaScript API and Places API are enabled.
              </p>
            </div>
          ) : !isLoaded ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div className="loading-spinner" style={{ margin: '0 auto 16px', width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ color: 'var(--text-secondary)' }}>Loading Maps...</p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13}
                onLoad={onMapLoad}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                }}
              >
                {/* User Location */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={createMarkerIcon(true)}
                    title="Your Location"
                    zIndex={1000}
                  />
                )}

                {/* Blood Bank Markers */}
                {filtered.map((bank) => (
                  <Marker
                    key={bank.id}
                    position={{ lat: bank.lat, lng: bank.lng }}
                    onClick={() => setSelectedBank(bank)}
                    icon={createMarkerIcon(false)}
                  />
                ))}

                {/* Info Window */}
                {selectedBank && (
                  <InfoWindow
                    position={{ lat: selectedBank.lat, lng: selectedBank.lng }}
                    onCloseClick={() => setSelectedBank(null)}
                  >
                    <div style={{ padding: 8, minWidth: 200 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{selectedBank.name}</div>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>{selectedBank.address}</div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 11 }}>📍 {selectedBank.dist} km</span>
                        <span style={{ fontSize: 11 }}>⏱️ {getTime(selectedBank.dist)}</span>
                      </div>
                      <button
                        onClick={() => navigateToPlace(selectedBank)}
                        style={{
                          width: '100%', padding: '8px', background: '#e53935', color: '#fff',
                          border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 12
                        }}
                      >
                        🧭 Get Directions
                      </button>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>

              {/* Location Button */}
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                style={{
                  position: 'absolute', bottom: 12, right: 12,
                  padding: '10px 14px', background: 'var(--white)', border: '1px solid var(--border)',
                  borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, fontWeight: 600, boxShadow: 'var(--shadow-md)',
                }}
              >
                {loading ? <RefreshCw size={14} className="spin" /> : <MapPin size={14} />}
                My Location
              </button>

              {locationError && (
                <div style={{
                  position: 'absolute', top: 12, left: 12, right: 12,
                  padding: '8px 12px', background: 'var(--accent-orange-light)',
                  border: '1px solid var(--accent-orange)', borderRadius: 8,
                  fontSize: 11, color: 'var(--accent-orange)', fontWeight: 500,
                }}>
                  ⚠️ {locationError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Blood Bank List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflowY: 'auto' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>
            ✅ Available for <strong style={{ color: 'var(--primary)' }}>{selected}</strong>
          </div>
          
          {bloodBanks.length === 0 && !loading && (
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                {userLocation ? 'Searching for blood banks...' : 'Click "My Location" to find nearby blood banks.'}
              </p>
            </div>
          )}

          {filtered.length === 0 && bloodBanks.length > 0 && (
            <div className="alert-item critical" style={{ borderRadius: 10 }}>
              <span>🩸</span>
              <div className="alert-content">
                <h4>No blood banks have {selected} available nearby</h4>
                <p>Try a wider search or contact regional blood authority.</p>
              </div>
            </div>
          )}

          {filtered.map(b => (
            <div
              key={b.id}
              className="card"
              style={{
                padding: 16, cursor: 'pointer',
                border: selectedBank?.id === b.id ? '2px solid var(--accent-red)' : '1px solid var(--border)',
              }}
              onClick={() => {
                setSelectedBank(b);
                setCenter({ lat: b.lat, lng: b.lng });
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{b.name}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span>📍 {b.dist} km</span>
                    <span><Clock size={11} style={{ verticalAlign: 'middle' }} /> {getTime(b.dist)}</span>
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
                <button
                  onClick={(e) => { e.stopPropagation(); navigateToPlace(b); }}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
                >
                  <Navigation size={12} /> Navigate
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); window.open(`tel:${b.phone}`); }}
                  className="btn btn-ghost"
                  style={{ fontSize: 12 }}
                >
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
                <div key={b.id} style={{
                  padding: '12px 14px', border: '1px solid var(--border)',
                  borderRadius: 10, opacity: 0.6, background: 'var(--white)'
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {b.dist} km · No {selected} stock</div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
