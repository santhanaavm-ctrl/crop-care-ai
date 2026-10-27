import React from 'react';
import { Link } from 'react-router-dom';
import { SERVER_BASE_URL } from '../services/api';

const DiseaseResult = ({ result, onReset, localPreviewUrl }) => {
  if (!result) return null;

  const {
    crop = 'Unknown Crop',
    disease = 'Condition Detected',
    confidence = 0,
    status = 'HIGH CONFIDENCE',
    statusMessage = '',
    speciesConfidence = 0,
    topCandidates = [],
    symptoms = '',
    nextSteps = '',
    disclaimer = '',
    recommendation = {},
    imagePath,
  } = result;

  const isHealthy = disease.toLowerCase().includes('healthy');
  const isUncertain = status === 'UNCERTAIN';
  const isUnsupported = status === 'UNSUPPORTED';

  const imageUrl = imagePath ? `${SERVER_BASE_URL}${imagePath}` : localPreviewUrl;
  const advisorySymptoms = symptoms || recommendation?.symptoms;
  const advisoryAction = recommendation?.action || 'Inspect the crop canopy and isolate any symptomatic leaves.';
  const advisoryPrevention = recommendation?.prevention || 'Ensure proper crop rotation, sanitation of field tools, and weed control.';
  const advisoryCare = recommendation?.care || 'Provide balanced fertilization and avoid prolonged leaf moisture.';
  const advisoryNextSteps = nextSteps || recommendation?.nextSteps;

  return (
    <div className="result-card" style={{ maxWidth: '1050px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="result-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div className="result-status-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            {isUncertain ? (
              <span className="status-pill" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontWeight: 600, padding: '4px 12px', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706' }}></span>
                Uncertain Diagnosis
              </span>
            ) : isUnsupported ? (
              <span className="status-pill" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', fontWeight: 600, padding: '4px 12px', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }}></span>
                Low Quality / Out-of-Distribution
              </span>
            ) : (
              <span className={`status-pill ${isHealthy ? 'status-healthy' : 'status-diseased'}`}>
                <span className="status-dot"></span>
                {isHealthy ? 'Healthy Foliage Confirmed' : 'Disease Identified'}
              </span>
            )}

            {speciesConfidence > 0 && (
              <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: '6px' }}>
                Plant Species: <strong>{crop}</strong> ({speciesConfidence}% match)
              </span>
            )}
          </div>
          <h2 className="result-title" style={{ margin: 0, fontSize: '1.6rem', color: '#0f172a' }}>
            Diagnostic & Agronomic Report
          </h2>
        </div>

        {/* Live Weather Integration CTA */}
        <Link
          to={`/weather?crop=${encodeURIComponent(crop)}&disease=${encodeURIComponent(disease)}`}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderColor: '#059669', color: '#059669', fontWeight: 600 }}
        >
          <span>🌦️</span> Check Weather Advisory for {crop}
        </Link>
      </div>

      {/* Uncertainty Alert Banner */}
      {isUncertain && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>⚠️</span>
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#92400e', fontSize: '0.95rem' }}>Attention: Diagnosis Requires Verification</h4>
            <p style={{ margin: 0, color: '#b45309', fontSize: '0.875rem', lineHeight: '1.5' }}>
              {statusMessage || 'The prediction confidence is below our clinical threshold or exhibits multi-species features. Please review the alternative hypotheses below and consider retaking a closer, well-lit photo of a single leaf.'}
            </p>
          </div>
        </div>
      )}

      <div className="result-main-grid">
        {/* Left Column: Image, Primary Diagnosis, and Top 3 Candidates */}
        <div className="result-visual-col">
          {imageUrl && (
            <div className="result-image-box" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
              <img src={imageUrl} alt={`${crop} ${disease}`} className="result-image" style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Primary Diagnosis Card */}
          <div className="result-stats-card" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1rem' }}>
            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
              <span className="stat-label" style={{ color: '#64748b', fontSize: '0.9rem' }}>Crop Species</span>
              <span className="stat-value crop-name" style={{ fontWeight: 700, color: '#0f172a' }}>{crop}</span>
            </div>
            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.75rem' }}>
              <span className="stat-label" style={{ color: '#64748b', fontSize: '0.9rem' }}>Primary Diagnosis</span>
              <span className={`stat-value disease-name ${isHealthy ? 'text-healthy' : 'text-danger'}`} style={{ fontWeight: 700, color: isHealthy ? '#16a34a' : '#dc2626' }}>
                {disease}
              </span>
            </div>

            <div className="confidence-section">
              <div className="confidence-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span className="stat-label" style={{ color: '#64748b', fontSize: '0.85rem' }}>Calibrated Confidence</span>
                <span className="confidence-number" style={{ fontWeight: 700, color: confidence > 70 ? '#16a34a' : confidence > 45 ? '#d97706' : '#dc2626' }}>
                  {confidence}%
                </span>
              </div>
              <div className="confidence-track" style={{ height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  className={`confidence-bar ${confidence > 75 ? 'bar-high' : confidence > 50 ? 'bar-medium' : 'bar-low'}`}
                  style={{
                    width: `${Math.min(100, Math.max(5, confidence))}%`,
                    height: '100%',
                    background: confidence > 70 ? '#16a34a' : confidence > 45 ? '#d97706' : '#dc2626',
                    borderRadius: '9999px',
                    transition: 'width 0.4s ease'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Top 3 Alternative Candidates */}
          {topCandidates && topCandidates.length > 0 && (
            <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📊</span> Top Classification Candidates:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {topCandidates.map((cand, idx) => (
                  <div key={idx} style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #edf2f7', padding: '0.5rem 0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '3px' }}>
                      <span style={{ fontWeight: idx === 0 ? 600 : 500, color: idx === 0 ? '#0f172a' : '#475569' }}>
                        {idx + 1}. {cand.crop} — {cand.disease}
                      </span>
                      <span style={{ fontWeight: 700, color: idx === 0 ? '#16a34a' : '#64748b' }}>
                        {cand.confidence}%
                      </span>
                    </div>
                    <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(3, cand.confidence))}%`,
                          height: '100%',
                          background: idx === 0 ? '#16a34a' : '#94a3b8',
                          borderRadius: '9999px'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Smart Farming Advisory & Agronomic Guidance */}
        <div className="result-advisory-col">
          <div className="advisory-panel" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 className="advisory-panel-title" style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="panel-icon">🚜</span> Smart Farming Agronomic Advisory
            </h3>

            {/* Observable Symptoms */}
            {advisorySymptoms && (
              <div className="advisory-block symptoms-block" style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '1rem' }}>
                <div className="block-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#6b21a8', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
                  <span>🔍</span> Observable Diagnostic Symptoms
                </div>
                <p className="block-text" style={{ margin: 0, color: '#3b0764', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  {advisorySymptoms}
                </p>
              </div>
            )}

            {/* Immediate Action */}
            <div className="advisory-block action-block" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1rem' }}>
              <div className="block-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#166534', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
                <span>⚡</span> Recommended Immediate Action
              </div>
              <p className="block-text" style={{ margin: 0, color: '#14532d', fontSize: '0.875rem', lineHeight: '1.5' }}>
                {advisoryAction}
              </p>
            </div>

            {/* Preventive Strategies */}
            <div className="advisory-block prevention-block" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '1rem' }}>
              <div className="block-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#1e40af', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
                <span>🛡️</span> Preventative Field Strategies
              </div>
              <p className="block-text" style={{ margin: 0, color: '#1e3a8a', fontSize: '0.875rem', lineHeight: '1.5' }}>
                {advisoryPrevention}
              </p>
            </div>

            {/* Long-Term Crop Care */}
            <div className="advisory-block care-block" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
              <div className="block-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#334155', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
                <span>💧</span> Long-term Irrigation & Soil Nutrition
              </div>
              <p className="block-text" style={{ margin: 0, color: '#475569', fontSize: '0.875rem', lineHeight: '1.5' }}>
                {advisoryCare}
              </p>
            </div>

            {/* Diagnostic Next Steps */}
            {advisoryNextSteps && (
              <div className="advisory-block nextsteps-block" style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: '10px', padding: '1rem' }}>
                <div className="block-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#86198f', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
                  <span>📋</span> Diagnostic Next Steps
                </div>
                <p className="block-text" style={{ margin: 0, color: '#701a75', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  {advisoryNextSteps}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agronomic Disclaimer */}
      <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>⚠️</span>
        <span>
          {disclaimer || 'AI-assisted diagnosis provides preliminary identification based on leaf imagery. Confirm with your local agricultural university or extension officer before initiating commercial chemical sprays.'}
        </span>
      </div>

      {/* Footer Actions */}
      <div className="result-footer" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={onReset} className="btn btn-primary">
          🌱 Scan Another Leaf
        </button>
        <Link to={`/weather?crop=${encodeURIComponent(crop)}&disease=${encodeURIComponent(disease)}`} className="btn btn-outline" style={{ borderColor: '#059669', color: '#059669' }}>
          🌦️ View Weather Advisory for {crop}
        </Link>
        <Link to="/history" className="btn btn-outline">
          📖 View Scan History
        </Link>
      </div>
    </div>
  );
};

export default DiseaseResult;
