import React, { useState, useRef } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const ImageUploader = ({ onImageSelected, selectedFile, onClear, disabled = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);

  const validateAndProcessFile = (file) => {
    setValidationError('');

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setValidationError('Invalid file format. Please upload a JPG, JPEG, or PNG image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setValidationError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB limit.`);
      return;
    }

    // Generate local preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onImageSelected(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setValidationError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onClear();
  };

  const triggerSelect = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="uploader-container">
      {validationError && (
        <div className="alert alert-error" role="alert">
          <span className="alert-icon">⚠️</span>
          <span>{validationError}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          className={`drop-zone ${dragActive ? 'drag-active' : ''} ${disabled ? 'drop-zone-disabled' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={triggerSelect}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={handleChange}
            style={{ display: 'none' }}
            disabled={disabled}
          />
          <div className="drop-zone-content">
            <div className="upload-icon-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3 className="upload-title">Drag & drop your leaf image here</h3>
            <p className="upload-subtitle">or click to browse from your device</p>
            <div className="upload-meta">
              <span className="badge badge-neutral">JPG, JPEG, PNG</span>
              <span className="badge badge-neutral">Max 5 MB</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="preview-card">
          <div className="preview-image-wrapper">
            <img src={previewUrl} alt="Crop Leaf Preview" className="preview-image" />
          </div>
          <div className="preview-details">
            <div className="file-info">
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="btn btn-outline-danger btn-sm"
              title="Remove image"
            >
              Change Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
