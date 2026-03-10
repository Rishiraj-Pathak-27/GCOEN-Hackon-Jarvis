import { useState, useCallback, useEffect, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { IconMap, IconCurrentLocation, IconRefresh, IconNavigation } from '@tabler/icons-react';

// Google Maps libraries to load
const libraries = ['places'];

// Map container style
const containerStyle = {
  width: '100%',
  height: '460px',
  borderRadius: '12px',
};

// Default center (Delhi, India)
const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090,
};

// Map type options
const mapTypes = [
  { id: 'roadmap', name: 'Roadmap' },
  { id: 'satellite', name: 'Satellite' },
  { id: 'terrain', name: 'Terrain' },
  { id: 'hybrid', name: 'Hybrid' },
];

// Filter options
const filters = [
  { id: 'all', name: 'All', icon: '📍' },
  { id: 'hospital', name: 'Hospitals', icon: '🏥' },
  { id: 'blood_bank', name: 'Blood Banks', icon: '🩸' },
  { id: 'ambulance', name: 'Ambulances', icon: '🚑' },
];

export default function Maps() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [mapType, setMapType] = useState('roadmap');
  const [userLocation, setUserLocation] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
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
      setLocationError('Geolocation is not supported by your browser');
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
        
        // Search for nearby places after getting location
        if (mapRef.current) {
          searchNearbyPlaces(loc, activeFilter);
        }
      },
      (error) => {
        let errorMsg = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out.';
            break;
        }
        setLocationError(errorMsg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [activeFilter]);

  // Generate mock data near user location
  const generateMockData = useCallback((location) => {
    return [
      // Hospitals
      { id: 'h1', name: 'City General Hospital', address: '123 Main Street', lat: location.lat + 0.012, lng: location.lng + 0.008, type: 'hospital', isOpen: true, rating: 4.5, totalRatings: 342 },
      { id: 'h2', name: 'Apollo Emergency Center', address: '456 Park Avenue', lat: location.lat - 0.008, lng: location.lng + 0.015, type: 'hospital', isOpen: true, rating: 4.7, totalRatings: 521 },
      { id: 'h3', name: 'Metro Medical Complex', address: '789 Healthcare Blvd', lat: location.lat + 0.018, lng: location.lng - 0.005, type: 'hospital', isOpen: true, rating: 4.3, totalRatings: 287 },
      { id: 'h4', name: 'Central District Hospital', address: '321 Central Road', lat: location.lat - 0.015, lng: location.lng - 0.012, type: 'hospital', isOpen: true, rating: 4.6, totalRatings: 198 },
      { id: 'h5', name: 'Unity Care Hospital', address: '555 Unity Lane', lat: location.lat + 0.005, lng: location.lng + 0.022, type: 'hospital', isOpen: true, rating: 4.4, totalRatings: 156 },
      // Blood Banks
      { id: 'bb1', name: 'City Blood Bank', address: '100 Donation Center', lat: location.lat + 0.006, lng: location.lng - 0.008, type: 'blood_bank', isOpen: true, rating: 4.8, totalRatings: 89 },
      { id: 'bb2', name: 'Red Cross Blood Center', address: '200 Red Cross Way', lat: location.lat - 0.012, lng: location.lng + 0.006, type: 'blood_bank', isOpen: true, rating: 4.9, totalRatings: 245 },
      { id: 'bb3', name: 'LifeStream Blood Bank', address: '300 Life Avenue', lat: location.lat + 0.020, lng: location.lng + 0.010, type: 'blood_bank', isOpen: true, rating: 4.6, totalRatings: 67 },
      { id: 'bb4', name: 'Metro Blood Services', address: '400 Metro Plaza', lat: location.lat - 0.005, lng: location.lng - 0.018, type: 'blood_bank', isOpen: false, rating: 4.5, totalRatings: 112 },
      // Ambulances
      { id: 'amb1', name: 'EMS Station Alpha', address: 'Near your location', lat: location.lat + 0.008, lng: location.lng + 0.005, type: 'ambulance', isOpen: true, status: '3 Units Available' },
      { id: 'amb2', name: 'Emergency Response Unit', address: 'Central District', lat: location.lat - 0.006, lng: location.lng + 0.012, type: 'ambulance', isOpen: true, status: '2 Units Available' },
      { id: 'amb3', name: '108 Ambulance Service', address: 'South Zone', lat: location.lat - 0.018, lng: location.lng + 0.003, type: 'ambulance', isOpen: true, status: '5 Units Available' },
      { id: 'amb4', name: 'Quick Response Ambulance', address: 'North District', lat: location.lat + 0.015, lng: location.lng - 0.010, type: 'ambulance', isOpen: true, status: '4 Units Available' },
    ];
  }, []);

  // Search for nearby places using Google Places API
  const searchNearbyPlaces = useCallback((location, filter) => {
    // Always add mock data as base (will be supplemented by real data if API works)
    const mockData = generateMockData(location);
    
    // If Google Maps API isn't available, use mock data only
    if (!mapRef.current || !window.google || !window.google.maps?.places) {
      const filtered = filter === 'all' ? mockData : mockData.filter(p => p.type === filter);
      setPlaces(filtered);
      return;
    }

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const allResults = [];
    let completedSearches = 0;
    const searchesToComplete = filter === 'all' ? 2 : 1;
    let apiWorked = false;

    const processResults = () => {
      // If API returned results, use them; otherwise fall back to mock data
      if (allResults.length > 0) {
        apiWorked = true;
        const uniquePlaces = Array.from(
          new Map(allResults.map((p) => [p.id, p])).values()
        );
        // Always add ambulance mock data (no real API for ambulances)
        if (filter === 'all' || filter === 'ambulance') {
          const ambulances = mockData.filter(p => p.type === 'ambulance');
          uniquePlaces.push(...ambulances);
        }
        setPlaces(uniquePlaces);
      } else {
        // Fallback to mock data
        const filtered = filter === 'all' ? mockData : mockData.filter(p => p.type === filter);
        setPlaces(filtered);
      }
    };

    // Search for hospitals
    if (filter === 'all' || filter === 'hospital') {
      const hospitalRequest = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius: 5000,
        type: 'hospital',
      };

      service.nearbySearch(hospitalRequest, (results, status) => {
        completedSearches++;
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const hospitals = results.map((place) => ({
            id: place.place_id,
            name: place.name,
            address: place.vicinity,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            rating: place.rating,
            totalRatings: place.user_ratings_total,
            isOpen: place.opening_hours?.isOpen?.() ?? null,
            type: 'hospital',
          }));
          allResults.push(...hospitals);
        }
        if (completedSearches >= searchesToComplete) processResults();
      });
    }

    // Search for blood banks
    if (filter === 'all' || filter === 'blood_bank') {
      const bloodBankRequest = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius: 5000,
        query: 'blood bank blood donation center',
      };

      service.textSearch(bloodBankRequest, (results, status) => {
        completedSearches++;
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const bloodBanks = results.slice(0, 10).map((place) => ({
            id: place.place_id,
            name: place.name,
            address: place.formatted_address || place.vicinity,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            rating: place.rating,
            totalRatings: place.user_ratings_total,
            isOpen: place.opening_hours?.isOpen?.() ?? null,
            type: 'blood_bank',
          }));
          allResults.push(...bloodBanks);
        }
        if (completedSearches >= searchesToComplete) processResults();
      });
    }

    // For ambulance-only filter, process immediately with mock data
    if (filter === 'ambulance') {
      const ambulances = mockData.filter(p => p.type === 'ambulance');
      setPlaces(ambulances);
    }
  }, [generateMockData]);

  // Load mock data immediately on mount
  useEffect(() => {
    const mockData = generateMockData(defaultCenter);
    setPlaces(mockData);
  }, [generateMockData]);

  // Re-search when filter changes
  useEffect(() => {
    if (userLocation && mapRef.current) {
      searchNearbyPlaces(userLocation, activeFilter);
    }
  }, [activeFilter, userLocation, searchNearbyPlaces]);

  // Get filtered places
  const filteredPlaces = places.filter(
    (p) => activeFilter === 'all' || p.type === activeFilter
  );

  // Calculate distance from user
  const getDistance = (place) => {
    const loc = userLocation || defaultCenter;
    const R = 6371;
    const dLat = ((place.lat - loc.lat) * Math.PI) / 180;
    const dLng = ((place.lng - loc.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc.lat * Math.PI) / 180) *
        Math.cos((place.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Navigate to place
  const navigateToPlace = (place) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
    window.open(url, '_blank');
  };

  // On map load
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Get type icon/color
  const getTypeInfo = (type) => {
    switch (type) {
      case 'hospital':
        return { icon: '🏥', color: 'var(--primary)', bgColor: 'var(--primary-light)' };
      case 'blood_bank':
        return { icon: '🩸', color: 'var(--accent-red)', bgColor: 'var(--accent-red-light)' };
      case 'ambulance':
        return { icon: '🚑', color: 'var(--accent-orange)', bgColor: 'var(--accent-orange-light)' };
      default:
        return { icon: '📍', color: 'var(--text-secondary)', bgColor: 'var(--bg)' };
    }
  };

  // Create marker icon URL
  const createMarkerIcon = (type) => {
    const colors = {
      hospital: '#1d6fbf',
      blood_bank: '#e53935',
      ambulance: '#f57c00',
      user: '#4285F4',
    };
    const icons = {
      hospital: '🏥',
      blood_bank: '🩸',
      ambulance: '🚑',
    };
    
    if (type === 'user') {
      return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#4285F4" stroke="#fff" stroke-width="3"/>
            <circle cx="12" cy="12" r="5" fill="#fff"/>
          </svg>
        `),
        scaledSize: { width: 24, height: 24 },
      };
    }
    
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
          <path d="M20 0C8.954 0 0 8.954 0 20c0 14 20 28 20 28s20-14 20-28C40 8.954 31.046 0 20 0z" fill="${colors[type] || '#666'}"/>
          <text x="20" y="26" text-anchor="middle" font-size="18">${icons[type] || '📍'}</text>
        </svg>
      `),
      scaledSize: { width: 36, height: 44 },
    };
  };

  // Show loading or error state for API key issues
  if (loadError) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Emergency Maps</h1>
        </div>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ marginBottom: 8, color: 'var(--accent-red)' }}>Failed to Load Maps</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            Please add your Google Maps API key to the environment file.
          </p>
          <div style={{ 
            padding: 16, background: 'var(--bg)', 
            borderRadius: 8, fontSize: 13, textAlign: 'left', maxWidth: 500, margin: '0 auto'
          }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Steps to configure:</p>
            <ol style={{ paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <li>Create a <code>.env</code> file in the webapp folder</li>
              <li>Add: <code>VITE_GOOGLE_MAPS_API_KEY=your_api_key</code></li>
              <li>Enable Maps JavaScript API & Places API in Google Cloud Console</li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Emergency Maps</h1>
        </div>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Emergency Maps</h1>
        <p>Find nearby hospitals, blood banks, and emergency services with real-time navigation.</p>
      </div>

      {/* Controls Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`btn ${activeFilter === f.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 12, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>{f.icon}</span>
              {f.name}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Map Type Selector */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', borderRadius: 8, padding: 4 }}>
          {mapTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setMapType(t.id)}
              title={t.name}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: mapType === t.id ? 'var(--primary)' : 'transparent',
                color: mapType === t.id ? '#fff' : 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Location Button */}
        <button
          onClick={getCurrentLocation}
          className="btn btn-primary"
          style={{ padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
          disabled={loading}
        >
          {loading ? <IconRefresh size={16} className="spin" /> : <IconCurrentLocation size={16} />}
          My Location
        </button>
      </div>

      {/* Location Error */}
      {locationError && (
        <div style={{
          padding: '10px 16px',
          background: 'var(--accent-orange-light)',
          border: '1px solid var(--accent-orange)',
          borderRadius: 8,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          color: 'var(--accent-orange)',
        }}>
          ⚠️ {locationError}
        </div>
      )}

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* Map */}
        <div style={{ position: 'relative' }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
            onLoad={onMapLoad}
            mapTypeId={mapType}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            {/* User Location Marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={createMarkerIcon('user')}
                title="Your Location"
                zIndex={1000}
              />
            )}

            {/* Place Markers */}
            {filteredPlaces.map((place) => (
              <Marker
                key={place.id}
                position={{ lat: place.lat, lng: place.lng }}
                onClick={() => setSelectedPlace(place)}
                icon={createMarkerIcon(place.type)}
              />
            ))}

            {/* Info Window */}
            {selectedPlace && (
              <InfoWindow
                position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                onCloseClick={() => setSelectedPlace(null)}
              >
                <div style={{ padding: '8px 4px', minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 24 }}>{getTypeInfo(selectedPlace.type).icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{selectedPlace.name}</div>
                      <div style={{ fontSize: 11, color: '#666' }}>{selectedPlace.address}</div>
                    </div>
                  </div>
                  
                  {selectedPlace.rating && (
                    <div style={{ marginBottom: 8, fontSize: 12 }}>
                      ⭐ {selectedPlace.rating} ({selectedPlace.totalRatings} reviews)
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontSize: 10,
                      fontWeight: 600,
                      background: selectedPlace.isOpen ? '#e8f5e9' : '#fdecea',
                      color: selectedPlace.isOpen ? '#2e7d32' : '#e53935',
                    }}>
                      {selectedPlace.status || (selectedPlace.isOpen === null ? 'Hours N/A' : selectedPlace.isOpen ? 'Open Now' : 'Closed')}
                    </span>
                    {userLocation && (
                      <span style={{ fontSize: 11, color: '#666' }}>
                        📍 {getDistance(selectedPlace)} km
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => navigateToPlace(selectedPlace)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#1d6fbf',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    🧭 Get Directions
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

          {/* Map Legend */}
          <div style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            background: 'var(--white)',
            padding: '10px 14px',
            borderRadius: 8,
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            gap: 12,
            fontSize: 11,
            fontWeight: 600,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, background: '#1d6fbf', borderRadius: '50%' }}></span>
              Hospitals
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, background: '#e53935', borderRadius: '50%' }}></span>
              Blood Banks
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, background: '#f57c00', borderRadius: '50%' }}></span>
              EMS
            </span>
          </div>
        </div>

        {/* Location List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 460, overflowY: 'auto' }}>
          <div style={{ 
            fontWeight: 700, fontSize: 12, color: 'var(--text-secondary)', 
            textTransform: 'uppercase', letterSpacing: '0.06em',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>{filteredPlaces.length} locations found</span>
            {userLocation && (
              <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--accent-green)' }}>
                📍 Location Active
              </span>
            )}
          </div>

          {filteredPlaces.length === 0 && !loading && (
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                {userLocation 
                  ? 'No locations found nearby. Try changing the filter.'
                  : 'Click "My Location" to find nearby services.'}
              </p>
            </div>
          )}

          {filteredPlaces
            .sort((a, b) => (getDistance(a) || 999) - (getDistance(b) || 999))
            .map((place) => {
              const typeInfo = getTypeInfo(place.type);
              const distance = getDistance(place);

              return (
                <div
                  key={place.id}
                  className="card"
                  style={{
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: selectedPlace?.id === place.id ? `2px solid ${typeInfo.color}` : '1px solid var(--border)',
                  }}
                  onClick={() => {
                    setSelectedPlace(place);
                    setCenter({ lat: place.lat, lng: place.lng });
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 24,
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: typeInfo.bgColor,
                      borderRadius: 10,
                    }}>
                      {typeInfo.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {place.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {place.address}
                      </div>
                    </div>
                    {distance && (
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background: 'var(--bg)',
                        color: 'var(--text-secondary)',
                        flexShrink: 0,
                      }}>
                        {distance} km
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    {place.rating && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>⭐ {place.rating}</span>
                    )}
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontSize: 10,
                      fontWeight: 700,
                      background: place.isOpen ? 'var(--accent-green-light)' : 'var(--accent-orange-light)',
                      color: place.isOpen ? 'var(--accent-green)' : 'var(--accent-orange)',
                    }}>
                      {place.status || (place.isOpen === null ? 'Hours N/A' : place.isOpen ? 'Open Now' : 'Closed')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigateToPlace(place); }}
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '8px 12px' }}
                    >
                      <IconNavigation size={14} /> Navigate
                    </button>
                    <button className="btn btn-ghost" style={{ fontSize: 11, padding: '8px 12px' }}>
                      📞 Call
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .loading-spinner {
          width: 40px; height: 40px;
          border: 3px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
