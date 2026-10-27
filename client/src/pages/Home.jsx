import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🌿</span>
            <span>Intelligent Agriculture Solution</span>
          </div>
          <h1 className="hero-title">
            AI-Powered Crop Disease Detection & Smart Farming Advisory Platform
          </h1>
          <p className="hero-subtitle">
            Farmers can identify crop diseases using leaf images and receive tailored treatment,
            prevention, and farming recommendations powered by deep learning.
          </p>
          <div className="hero-actions">
            <Link to="/detect" className="btn btn-primary btn-lg">
              Detect Disease Now
            </Link>
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="btn btn-outline-white btn-lg"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Core Platform Capabilities</h2>
          <p className="section-description">
            Designed to empower farmers and agronomists with rapid, accessible, and practical crop protection tools.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper bg-green-light">
              <span className="feature-icon">🔬</span>
            </div>
            <h3 className="feature-title">AI Disease Detection</h3>
            <p className="feature-text">
              Upload a clear photo of an affected leaf. The trained convolutional neural network identifies
              symptoms across 38 distinct crop condition classes in seconds.
            </p>
            <Link to="/detect" className="feature-link">
              Try Leaf Scanner →
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper bg-amber-light">
              <span className="feature-icon">🌾</span>
            </div>
            <h3 className="feature-title">Smart Advisory</h3>
            <p className="feature-text">
              Receive structured recommendations covering immediate chemical or biological action, preventive
              field practices, and optimal soil and irrigation care.
            </p>
            <Link to="/weather" className="feature-link">
              Explore Smart Advisory →
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper bg-blue-light">
              <span className="feature-icon">📊</span>
            </div>
            <h3 className="feature-title">Prediction History</h3>
            <p className="feature-text">
              Securely preserve every scan diagnosis to track seasonal disease patterns, verify recurring outbreaks,
              and maintain farm health records.
            </p>
            <Link to={isAuthenticated ? '/history' : '/login'} className="feature-link">
              View History Records →
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow Steps Section */}
      <section className="workflow-section">
        <div className="section-header">
          <h2 className="section-title">How It Works in 3 Steps</h2>
        </div>

        <div className="workflow-grid">
          <div className="workflow-step">
            <div className="step-number">1</div>
            <h4 className="step-title">Capture & Upload</h4>
            <p className="step-desc">Take a clear, well-lit photo of an affected crop leaf and upload it.</p>
          </div>
          <div className="workflow-step">
            <div className="step-number">2</div>
            <h4 className="step-title">Instant AI Diagnosis</h4>
            <p className="step-desc">Our neural network classifies the crop and diagnoses any pathogens or deficiencies.</p>
          </div>
          <div className="workflow-step">
            <div className="step-number">3</div>
            <h4 className="step-title">Apply Advisory</h4>
            <p className="step-desc">Follow scientifically grounded treatment, prevention, and crop maintenance steps.</p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">Protect Your Harvest Today</h2>
          <p className="cta-text">
            Start scanning your crops or register an account to keep a persistent record of all diagnoses.
          </p>
          <div className="cta-actions">
            <Link to="/detect" className="btn btn-primary">
              Start Free Scan
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
