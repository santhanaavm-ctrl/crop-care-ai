import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import DiseaseResult from '../components/DiseaseResult';
import LoadingSpinner from '../components/LoadingSpinner';
import { predictDisease } from '../services/api';

const DiseaseDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);

  const handleImageSelected = (file) => {
    setSelectedFile(file);
    setError('');
    setPredictionResult(null);
    if (file) {
      setLocalPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClear = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setSelectedFile(null);
    setLocalPreviewUrl(null);
    setError('');
    setPredictionResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('Please select or drop a crop leaf image before requesting a prediction.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Call backend API which runs the Python AI model
      const result = await predictDisease(formData);

      if (result && result.success) {
        setPredictionResult(result);
      } else if (result && (result.status === 'UNSUPPORTED' || !result.success)) {
        setError(
          result.message ||
          'The uploaded image is unsupported or has insufficient visual detail. Please ensure the photo clearly shows a single crop leaf in good lighting.'
        );
      } else {
        throw new Error(result?.message || 'Unable to classify leaf image.');
      }
    } catch (err) {
      console.error('Prediction request error:', err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'An unexpected error occurred while analyzing the image. Please verify your connection and try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="detection-container">
      <div className="page-header">
        <h1 className="page-title">Crop Disease Detection</h1>
        <p className="page-description">
          Upload a clear image of a crop leaf to identify possible diseases and receive immediate agronomic advisories.
        </p>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* When no result is yet computed */}
      {!predictionResult ? (
        <div className="detection-workbench">
          <form onSubmit={handleSubmit} className="detection-form">
            <ImageUploader
              onImageSelected={handleImageSelected}
              selectedFile={selectedFile}
              onClear={handleClear}
              disabled={loading}
            />

            <div className="detection-actions">
              <button
                type="submit"
                disabled={!selectedFile || loading}
                className="btn btn-primary btn-lg btn-predict"
              >
                {loading ? (
                  <LoadingSpinner
                    message="Analyzing leaf via MobileNetV2 AI model..."
                    size="small"
                  />
                ) : (
                  'Predict Disease'
                )}
              </button>
            </div>
          </form>

          {/* Quick tips panel */}
          <div className="tips-banner">
            <h4 className="tips-title">📸 How to take an optimal leaf photo:</h4>
            <div className="tips-grid">
              <div className="tip-item">
                <span className="tip-bullet">✓</span>
                <span>Focus clearly on the discolored or symptomatic area.</span>
              </div>
              <div className="tip-item">
                <span className="tip-bullet">✓</span>
                <span>Ensure bright, natural daylight without harsh shadows.</span>
              </div>
              <div className="tip-item">
                <span className="tip-bullet">✓</span>
                <span>Isolate a single leaf on a neutral background when possible.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Result display */
        <DiseaseResult
          result={predictionResult}
          onReset={handleClear}
          localPreviewUrl={localPreviewUrl}
        />
      )}
    </div>
  );
};

export default DiseaseDetection;
