import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getScanHistory, deleteScanHistory, SERVER_BASE_URL } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getScanHistory();

        console.log('Scan history response:', data);

        if (!isMounted) return;

        if (data?.success === false) {
          throw new Error(data.message || 'Failed to retrieve scan history.');
        }

        if (Array.isArray(data?.history)) {
          setHistory(data.history);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('Failed to load scan history:', err);

        if (!isMounted) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to load your scan history. Please check your connection and try again.'
        );

        setHistory([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDeleteScan = async (event, scanId) => {
    event.stopPropagation();
    if (!scanId) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this scan record? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      setDeletingId(scanId);
      await deleteScanHistory(scanId);
      setHistory((prev) => prev.filter((item) => item._id !== scanId));
      if (selectedScan?._id === scanId) {
        setSelectedScan(null);
      }
    } catch (err) {
      console.error('Failed to delete scan record:', err);
      alert(err.response?.data?.message || err.message || 'Failed to delete scan record.');
    } finally {
      setDeletingId(null);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If backend already returned a complete URL
    if (
      imagePath.startsWith('http://') ||
      imagePath.startsWith('https://')
    ) {
      return imagePath;
    }

    // Make sure there is exactly one slash
    return `${SERVER_BASE_URL.replace(/\/$/, '')}/${imagePath.replace(
      /^\//,
      ''
    )}`;
  };

  const formatDate = (date) => {
    if (!date) return '—';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '—';
    }

    return parsedDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return '—';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '—';
    }

    return parsedDate.toLocaleString();
  };

  const handleImageError = (event) => {
    event.currentTarget.style.display = 'none';

    const fallback = event.currentTarget.parentElement?.querySelector(
      '.thumbnail-fallback'
    );

    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  return (
    <div className="history-container">
      <div className="page-header">
        <div className="header-flex">
          <div>
            <h1 className="page-title">Scan & Advisory History</h1>

            <p className="page-description">
              Review your previous crop scans, pathogen diagnoses, and smart
              farming advisories.
            </p>
          </div>

          <Link to="/detect" className="btn btn-primary btn-sm">
            + New Scan
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-error" role="alert">
          <span className="alert-icon">⚠️</span>

          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div
          style={{
            padding: '60px 0',
            textAlign: 'center',
          }}
        >
          <LoadingSpinner
            message="Retrieving your diagnostic history..."
            size="large"
          />
        </div>
      ) : history.length === 0 ? (
        /* Empty state */
        <div className="empty-history-card">
          <div className="empty-icon">🍃</div>

          <h3 className="empty-title">No predictions yet</h3>

          <p className="empty-subtitle">
            You haven't scanned any crop leaves yet. Upload your first crop
            image to get started.
          </p>

          <Link to="/detect" className="btn btn-primary">
            Upload First Crop Image
          </Link>
        </div>
      ) : (
        <div className="history-content-layout">
          {/* History table */}
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Leaf</th>
                  <th>Crop</th>
                  <th>Diagnosis</th>
                  <th>Confidence</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {history.map((scan) => {
                  const diseaseName = scan.disease || 'Unknown';

                  const isHealthy = diseaseName
                    .toLowerCase()
                    .includes('healthy');

                  const isSelected =
                    selectedScan?._id === scan._id;

                  const imageUrl = getImageUrl(scan.imagePath);

                  return (
                    <tr
                      key={scan._id}
                      className={`history-row ${
                        isSelected ? 'row-selected' : ''
                      }`}
                      onClick={() => setSelectedScan(scan)}
                    >
                      {/* Image */}
                      <td className="table-img-cell">
                        {imageUrl ? (
                          <>
                            <img
                              src={imageUrl}
                              alt={scan.crop || 'Crop leaf'}
                              className="table-thumbnail"
                              onError={handleImageError}
                            />

                            <span
                              className="thumbnail-fallback"
                              style={{ display: 'none' }}
                            >
                              🌿
                            </span>
                          </>
                        ) : (
                          <span className="thumbnail-fallback">
                            🌿
                          </span>
                        )}
                      </td>

                      {/* Crop */}
                      <td className="table-crop-cell">
                        <strong>{scan.crop || 'Unknown'}</strong>
                      </td>

                      {/* Disease */}
                      <td>
                        <span
                          className={`badge ${
                            isHealthy
                              ? 'badge-success'
                              : 'badge-warning'
                          }`}
                        >
                          {diseaseName}
                        </span>
                      </td>

                      {/* Confidence */}
                      <td>
                        <span className="confidence-pill">
                          {scan.confidence != null
                            ? `${Number(scan.confidence).toFixed(2)}%`
                            : '—'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="table-date-cell">
                        {formatDate(scan.createdAt)}
                      </td>

                      {/* Action */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedScan(scan);
                          }}
                          className="btn btn-ghost btn-xs"
                          style={{ marginRight: '0.25rem' }}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={(event) => handleDeleteScan(event, scan._id)}
                          disabled={deletingId === scan._id}
                          className="btn btn-outline-danger btn-xs"
                          title="Delete scan record"
                        >
                          {deletingId === scan._id ? '...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selectedScan && (
            <div className="history-detail-panel">
              <div className="detail-panel-header">
                <h3>Diagnostic Details</h3>

                <button
                  type="button"
                  onClick={() => setSelectedScan(null)}
                  className="btn btn-ghost btn-sm close-btn"
                  aria-label="Close details"
                >
                  ✕
                </button>
              </div>

              <div className="detail-panel-body">
                {/* Large image */}
                {(selectedScan.imagePath || selectedScan.imageUrl) && (
                  <div className="detail-img-box">
                    <img
                      src={getImageUrl(selectedScan.imagePath || selectedScan.imageUrl)}
                      alt={selectedScan.crop || 'Crop leaf'}
                      className="detail-img"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Diagnostic statistics */}
                <div className="detail-stat-group">
                  <div className="detail-stat">
                    <span className="detail-label">
                      Crop
                    </span>

                    <span className="detail-val">
                      {selectedScan.crop || '—'}
                    </span>
                  </div>

                  <div className="detail-stat">
                    <span className="detail-label">
                      Condition
                    </span>

                    <span className="detail-val">
                      {selectedScan.disease || '—'}
                    </span>
                  </div>

                  <div className="detail-stat">
                    <span className="detail-label">
                      Confidence
                    </span>

                    <span className="detail-val">
                      {selectedScan.confidence != null
                        ? `${Number(selectedScan.confidence).toFixed(2)}%`
                        : '—'}
                    </span>
                  </div>

                  <div className="detail-stat">
                    <span className="detail-label">
                      Scanned Date
                    </span>

                    <span className="detail-val">
                      {formatDateTime(selectedScan.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Advisory */}
                <div className="detail-advisory">
                  <h4>Smart Advisory</h4>

                  {selectedScan.recommendation?.action && (
                    <div className="advisory-snippet">
                      <strong>Immediate Action:</strong>

                      <p>
                        {selectedScan.recommendation.action}
                      </p>
                    </div>
                  )}

                  {selectedScan.recommendation?.prevention && (
                    <div className="advisory-snippet">
                      <strong>Prevention:</strong>

                      <p>
                        {selectedScan.recommendation.prevention}
                      </p>
                    </div>
                  )}

                  {selectedScan.recommendation?.care && (
                    <div className="advisory-snippet">
                      <strong>Crop Care:</strong>

                      <p>
                        {selectedScan.recommendation.care}
                      </p>
                    </div>
                  )}

                  {!selectedScan.recommendation?.action &&
                    !selectedScan.recommendation?.prevention &&
                    !selectedScan.recommendation?.care && (
                      <p>
                        No advisory information is available for
                        this scan.
                      </p>
                    )}
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={(event) => handleDeleteScan(event, selectedScan._id)}
                    disabled={deletingId === selectedScan._id}
                    className="btn btn-outline-danger btn-sm"
                  >
                    {deletingId === selectedScan._id ? 'Deleting...' : '🗑️ Delete This Record'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;
