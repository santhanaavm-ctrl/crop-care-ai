import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getWeatherAdvisory } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Weather = () => {
  const [searchParams] = useSearchParams();
  const queryCrop = searchParams.get('crop') || '';
  const queryDisease = searchParams.get('disease') || '';

  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cityInput, setCityInput] = useState('Salem');
  const [activeQuery, setActiveQuery] = useState({ city: 'Salem' });
  const [geoLocating, setGeoLocating] = useState(false);

  const fetchWeather = async (params) => {
    try {
      setLoading(true);
      setError('');
      const requestParams = {
        ...params,
        ...(queryCrop ? { crop: queryCrop } : {}),
        ...(queryDisease ? { disease: queryDisease } : {})
      };
      const data = await getWeatherAdvisory(requestParams);
      setWeatherData(data);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to retrieve weather advisory from server.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(activeQuery);
  }, [activeQuery, queryCrop, queryDisease]);

  const handleCitySearch = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setActiveQuery({ city: cityInput.trim() });
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLocating(false);
        setActiveQuery({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
        setCityInput('Current Location');
      },
      (geoErr) => {
        setGeoLocating(false);
        console.warn('Geolocation failed:', geoErr.message);
        alert(`Could not acquire location: ${geoErr.message}. You can still search by city or district name.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="weather-container" style={{ maxWidth: '1050px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <h1 className="page-title" style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '0.5rem' }}>
          Smart Agro-Meteorological Advisory
        </h1>
        <p className="page-description" style={{ color: '#64748b', fontSize: '1rem' }}>
          Real-time weather intelligence, microclimate fungal risk evaluation, and optimal pesticide spraying windows.
        </p>
      </div>

      {/* Linked Crop Diagnosis Context Banner */}
      {queryCrop && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#047857', fontWeight: 700 }}>
              🌿 Active Crop Diagnostic Focus
            </span>
            <h3 style={{ margin: '0.2rem 0 0 0', color: '#064e3b', fontSize: '1.15rem' }}>
              {queryCrop} {queryDisease && `— ${queryDisease}`}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#065f46', fontSize: '0.85rem' }}>
              Correlating real-time microclimate conditions with pathogen biological requirements for {queryCrop}.
            </p>
          </div>
          <Link to="/detect" className="btn btn-ghost btn-xs" style={{ color: '#047857', textDecoration: 'underline' }}>
            Change Crop / Scan Another
          </Link>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => fetchWeather(activeQuery)}
            className="btn btn-ghost btn-xs"
            style={{ marginLeft: 'auto' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <LoadingSpinner message="Consulting live agro-meteorological satellite & station feeds..." size="large" />
        </div>
      ) : !weatherData?.configured ? (
        /* Explicit Unconfigured State - Does not fabricate weather data */
        <div className="weather-card-notice" style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '2.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⛅</div>
          <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '0.75rem' }}>
            Live Weather Provider Not Configured
          </h2>
          <p style={{ color: '#475569', maxWidth: '700px', margin: '0 auto 1.5rem auto', lineHeight: '1.6' }}>
            To safeguard crops with real-time agro-meteorological advisories, connect a free OpenWeatherMap API key on your backend.
            CropCare AI adheres to strict data integrity: no live temperatures or forecasts are fabricated without real credentials.
          </p>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '1.25rem',
            maxWidth: '650px',
            margin: '0 auto 2rem auto',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '0.95rem' }}>
              🔧 How to configure live weather updates:
            </h4>
            <ol style={{ margin: '0', paddingLeft: '1.25rem', color: '#334155', fontSize: '0.875rem', lineHeight: '1.6' }}>
              <li>Get a free API key from <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" style={{ color: '#059669', textDecoration: 'underline' }}>OpenWeatherMap</a>.</li>
              <li>Add the key to your <code>server/.env</code> file:</li>
            </ol>
            <pre style={{
              background: '#1e293b',
              color: '#34d399',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              marginTop: '0.75rem',
              overflowX: 'auto'
            }}>OPENWEATHER_API_KEY=your_openweather_api_key_here</pre>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Once saved, restart the Express backend to enable live temperature, humidity, wind, and disease outbreak forecasting.
            </p>
          </div>

          {/* Scientific Agronomic Principles Guidance */}
          <div style={{ textAlign: 'left', marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#1e293b', marginBottom: '1rem', textAlign: 'center' }}>
              🌾 Scientific Agro-Meteorological Principles
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#166534', fontSize: '0.95rem' }}>
                  💧 Relative Humidity (&gt; 80%)
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#15803d', lineHeight: '1.5' }}>
                  Extended leaf wetness accelerates fungal spore incubation (Late Blight, Downy Mildew, Rust). Avoid overhead evening irrigation and ensure canopy airflow.
                </p>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af', fontSize: '0.95rem' }}>
                  💨 Spraying Window (Wind 5–15 km/h)
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#1d4ed8', lineHeight: '1.5' }}>
                  Winds above 20 km/h cause chemical drift and poor droplet adhesion. Optimal foliar spraying is achieved during calm early morning or twilight hours.
                </p>
              </div>

              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e', fontSize: '0.95rem' }}>
                  🌧️ Rainfall Wash-Off Rules
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309', lineHeight: '1.5' }}>
                  Rainfall within 2 to 4 hours of spraying washes active ingredients into soil runoff. Postpone protective sprays until dry weather.
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/detect" className="btn btn-primary">
              🌱 Scan Crop Foliage Now
            </Link>
            <Link to="/dashboard" className="btn btn-outline">
              Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Real Configured Weather Display */
        <div className="weather-active-display" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {/* Search bar & Location buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <form onSubmit={handleCitySearch} style={{ display: 'flex', gap: '0.5rem', flex: '1', minWidth: '280px', maxWidth: '450px' }}>
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Enter agricultural district or city..."
                className="form-control"
                style={{ flex: 1, padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                🔍 Search
              </button>
            </form>

            <button
              onClick={handleUseLocation}
              disabled={geoLocating}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>📍</span> {geoLocating ? 'Locating...' : 'Use My Farm Location'}
            </button>

            {weatherData.cached && (
              <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', marginLeft: 'auto' }}>
                ⚡ Cached ({weatherData.cacheAgeSeconds}s ago)
              </span>
            )}
          </div>

          {/* Location & Current Condition Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '1.3rem' }}>📍</span>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem' }}>{weatherData.location}</h2>
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                Observations as of {weatherData.metrics?.localTime || new Date(weatherData.timestamp).toLocaleTimeString()}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {weatherData.metrics?.icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${weatherData.metrics.icon}@2x.png`}
                  alt={weatherData.metrics?.condition}
                  style={{ width: '64px', height: '64px' }}
                />
              )}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#047857', lineHeight: 1 }}>
                  {weatherData.metrics?.temperature}°C
                </span>
                <p style={{ margin: '0.2rem 0 0 0', color: '#475569', fontSize: '0.9rem', textTransform: 'capitalize', fontWeight: 500 }}>
                  {weatherData.metrics?.condition}
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Relative Humidity</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>{weatherData.metrics?.humidity}%</span>
              <span style={{ fontSize: '0.75rem', color: weatherData.metrics?.humidity > 75 ? '#dc2626' : '#16a34a', display: 'block', marginTop: '2px' }}>
                {weatherData.metrics?.humidity > 75 ? 'High fungal risk' : 'Optimal moisture'}
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Wind Speed</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
                {weatherData.metrics?.windSpeed} km/h
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                Direction: {weatherData.metrics?.windDirection || 'N/A'}
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Feels Like</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>{weatherData.metrics?.feelsLike}°C</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                Pressure: {weatherData.metrics?.pressure} hPa
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Daylight Window</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', display: 'block' }}>
                🌅 {weatherData.metrics?.sunrise ? new Date(weatherData.metrics.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', display: 'block', marginTop: '2px' }}>
                🌇 {weatherData.metrics?.sunset ? new Date(weatherData.metrics.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
            </div>
          </div>

          {/* Spray Window Status Card */}
          {weatherData.sprayWindow && (
            <div style={{
              background: weatherData.sprayWindow.status === 'OPTIMAL' ? '#f0fdf4' : weatherData.sprayWindow.status === 'CAUTION' ? '#fffbeb' : '#fef2f2',
              border: `1px solid ${weatherData.sprayWindow.status === 'OPTIMAL' ? '#bbf7d0' : weatherData.sprayWindow.status === 'CAUTION' ? '#fde68a' : '#fecaca'}`,
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  color: weatherData.sprayWindow.status === 'OPTIMAL' ? '#166534' : weatherData.sprayWindow.status === 'CAUTION' ? '#92400e' : '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>💨</span> Spraying Safety Window: {weatherData.sprayWindow.status}
                </h3>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                  Rain Risk: {weatherData.sprayWindow.rainRiskPercent}% • Wind: {weatherData.sprayWindow.windSpeedKmh} km/h
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: '1.5' }}>
                {weatherData.sprayWindow.recommendation}
              </p>
            </div>
          )}

          {/* Crop-Specific Agro-Meteorological Correlation Alerts */}
          {weatherData.diseaseAlerts && weatherData.diseaseAlerts.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌱</span> Crop Pathogen Microclimate Correlation
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {weatherData.diseaseAlerts.map((alert, idx) => (
                  <div key={idx} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <h4 style={{ margin: 0, color: '#166534', fontSize: '0.95rem' }}>{alert.target}</h4>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                        {alert.riskLevel}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#14532d', fontSize: '0.875rem', lineHeight: '1.5' }}>
                      {alert.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Field Advisories */}
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem' }}>
            🚜 Field Environmental Advisories
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {weatherData.advisories?.map((adv, index) => {
              const bg = adv.type === 'warning' ? '#fef2f2' : adv.type === 'success' ? '#f0fdf4' : '#eff6ff';
              const border = adv.type === 'warning' ? '#fecaca' : adv.type === 'success' ? '#bbf7d0' : '#bfdbfe';
              const text = adv.type === 'warning' ? '#991b1b' : adv.type === 'success' ? '#166534' : '#1e40af';
              return (
                <div key={index} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: text, fontSize: '0.95rem' }}>{adv.category}</h4>
                  <p style={{ margin: 0, color: '#334155', fontSize: '0.875rem', lineHeight: '1.5' }}>{adv.details}</p>
                </div>
              );
            })}
          </div>

          {/* 5-Day Forecast Grid */}
          {weatherData.dailySummary && weatherData.dailySummary.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📅</span> 5-Day Agro-Meteorological Forecast
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                {weatherData.dailySummary.map((day, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem', marginBottom: '4px' }}>
                      {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
                      {day.tempMin}° / {day.tempMax}°C
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'capitalize', marginBottom: '6px' }}>
                      {day.dominantCondition}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: day.maxRainPop > 40 ? '#2563eb' : '#64748b' }}>
                      🌧️ Rain: {day.maxRainPop}% ({day.totalRainMm}mm)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      💧 Humidity: ~{day.avgHumidity}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <Link to="/detect" className="btn btn-primary">
              🌱 Scan Crop Leaf Now
            </Link>
            <Link to="/dashboard" className="btn btn-outline">
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
