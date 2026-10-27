import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getScanHistory } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchHistoryData = async () => {
      try {
        setLoadingHistory(true);
        setError('');
        const data = await getScanHistory();

        if (!isMounted) return;

        if (data && Array.isArray(data.history)) {
          setScans(data.history);
          setTotalCount(data.count ?? data.history.length);
        } else {
          setScans([]);
          setTotalCount(0);
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn('Could not load scans for dashboard:', err.message);
        setError('Unable to load recent scan records.');
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };

    fetchHistoryData();

    return () => {
      isMounted = false;
    };
  }, []);

  const healthyCount = scans.filter((s) => (s.disease || '').toLowerCase().includes('healthy')).length;
  const diseaseCount = totalCount - healthyCount;
  const recentScans = scans.slice(0, 4);

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div className="welcome-text-group">
          <span className="welcome-tag">Agronomy Dashboard</span>
          <h1 className="welcome-title">
            Welcome, <span className="text-highlight">{user?.name || 'Farmer'}</span>
          </h1>
          <p className="welcome-subtitle">
            Monitor crop health, analyze foliar pathogen scans in real time, and review actionable smart farming advisories.
          </p>
        </div>
        <div className="welcome-action">
          <Link to="/detect" className="btn btn-primary btn-lg">
            🔍 Scan Crop Leaf
          </Link>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="dashboard-metrics-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        margin: '1.5rem 0'
      }}>
        <div className="metric-box" style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="metric-label" style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Scans Recorded</span>
          <span className="metric-value" style={{ display: 'block', fontSize: '1.8rem', fontWeight: 700, color: '#1e293b', marginTop: '0.25rem' }}>
            {loadingHistory ? '—' : totalCount}
          </span>
          <span className="metric-sub" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>User scan history</span>
        </div>

        <div className="metric-box" style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="metric-label" style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Healthy Crops</span>
          <span className="metric-value" style={{ display: 'block', fontSize: '1.8rem', fontWeight: 700, color: '#059669', marginTop: '0.25rem' }}>
            {loadingHistory ? '—' : healthyCount}
          </span>
          <span className="metric-sub" style={{ fontSize: '0.75rem', color: '#059669' }}>No treatment needed</span>
        </div>

        <div className="metric-box" style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="metric-label" style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Pathogen Conditions</span>
          <span className="metric-value" style={{ display: 'block', fontSize: '1.8rem', fontWeight: 700, color: '#d97706', marginTop: '0.25rem' }}>
            {loadingHistory ? '—' : diseaseCount}
          </span>
          <span className="metric-sub" style={{ fontSize: '0.75rem', color: '#d97706' }}>Advisories generated</span>
        </div>

        <div className="metric-box" style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="metric-label" style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Active Agro-Advisory</span>
          <span className="metric-value" style={{ display: 'block', fontSize: '1.8rem', fontWeight: 700, color: '#2563eb', marginTop: '0.25rem' }}>
            38 Classes
          </span>
          <span className="metric-sub" style={{ fontSize: '0.75rem', color: '#2563eb' }}>MobileNetV2 neural net</span>
        </div>
      </section>

      {/* Main Navigation Cards */}
      <section className="dashboard-grid">
        {/* Card 1: Disease Detection */}
        <div className="dash-card">
          <div className="dash-card-icon icon-emerald">🌿</div>
          <div className="dash-card-body">
            <h3 className="dash-card-title">Crop Disease Detection</h3>
            <p className="dash-card-desc">
              Upload leaf photos to run deep learning classification across 38 crop condition classes.
            </p>
          </div>
          <div className="dash-card-footer">
            <Link to="/detect" className="btn btn-primary btn-sm">
              Launch Scanner →
            </Link>
          </div>
        </div>

        {/* Card 2: Prediction History */}
        <div className="dash-card">
          <div className="dash-card-icon icon-blue">📋</div>
          <div className="dash-card-body">
            <h3 className="dash-card-title">Diagnostic History</h3>
            <p className="dash-card-desc">
              Review your past crop scans, previous pathogen diagnoses, confidence scores, and recommendations.
            </p>
          </div>
          <div className="dash-card-footer">
            <Link to="/history" className="btn btn-outline btn-sm">
              View All History ({totalCount}) →
            </Link>
          </div>
        </div>

        {/* Card 3: Weather & Advisory */}
        <div className="dash-card">
          <div className="dash-card-icon icon-amber">⛅</div>
          <div className="dash-card-body">
            <h3 className="dash-card-title">Weather & Smart Advisory</h3>
            <p className="dash-card-desc">
              Check agro-climatic conditions, relative humidity risks, and spray window warnings.
            </p>
          </div>
          <div className="dash-card-footer">
            <Link to="/weather" className="btn btn-outline btn-sm">
              Open Agro-Advisory →
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Activity & Smart Farming Tips */}
      <div className="dashboard-split-section">
        {/* Recent Scans Overview */}
        <div className="dash-subcard">
          <div className="subcard-header">
            <h3 className="subcard-title">Recent Crop Scans</h3>
            {totalCount > 0 && (
              <Link to="/history" className="subcard-link">
                View All ({totalCount})
              </Link>
            )}
          </div>
          <div className="subcard-content">
            {loadingHistory ? (
              <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                <LoadingSpinner message="Loading your scan records..." size="small" />
              </div>
            ) : error ? (
              <p className="subcard-empty" style={{ color: '#ef4444' }}>{error}</p>
            ) : totalCount === 0 ? (
              <div className="subcard-empty-state" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌱</div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No crop scans recorded yet</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Capture or select an image of a crop leaf to identify any diseases and receive tailored farming advisories.
                </p>
                <Link to="/detect" className="btn btn-primary btn-sm">
                  Perform First Scan
                </Link>
              </div>
            ) : (
              <ul className="recent-list">
                {recentScans.map((scan) => {
                  const isHealthy = (scan.disease || '').toLowerCase().includes('healthy');
                  return (
                    <li key={scan._id} className="recent-item">
                      <div className="recent-info">
                        <span className="recent-crop" style={{ fontWeight: 600 }}>{scan.crop || 'Crop'}</span>
                        <span className={`recent-disease badge ${isHealthy ? 'badge-success' : 'badge-warning'}`} style={{ display: 'inline-block', marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                          {scan.disease || 'Detected'}
                        </span>
                      </div>
                      <div className="recent-meta">
                        <span className="recent-conf" style={{ fontWeight: 600, color: '#047857' }}>
                          {scan.confidence != null ? `${Number(scan.confidence).toFixed(1)}%` : '—'}
                        </span>
                        <span className="recent-date" style={{ marginLeft: '0.75rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Farming Best Practices Tip */}
        <div className="dash-subcard tip-card">
          <div className="subcard-header">
            <h3 className="subcard-title">💡 Smart Farming Tip of the Day</h3>
          </div>
          <div className="subcard-content tip-body">
            <h4 className="tip-headline">Preventing Fungal Outbreaks During Humid Cycles</h4>
            <p className="tip-text">
              High humidity above 80% combined with extended leaf wetness promotes rapid fungal spore germination
              (such as <em>Late Blight</em>, <em>Leaf Mold</em>, and <em>Powdery Mildew</em>). To minimize transmission risk:
            </p>
            <ul className="tip-list">
              <li>Prefer morning drip irrigation over evening overhead sprinkling.</li>
              <li>Prune dense bottom foliage to improve canopy aeration.</li>
              <li>Disinfect pruning shears with 70% alcohol between crop rows.</li>
              <li>Inspect lower leaves first, where moisture stays trapped longest.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
