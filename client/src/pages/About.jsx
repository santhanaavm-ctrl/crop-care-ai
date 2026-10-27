import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="about-container">
      <div className="page-header">
        <h1 className="page-title">About CropCare AI Platform</h1>
        <p className="page-description">
          An intelligent decision-support system designed to assist farmers and agriculturalists in early crop disease diagnosis.
        </p>
      </div>

      <div className="about-grid">
        {/* The Problem */}
        <section className="about-card">
          <div className="about-card-icon bg-amber-light">🔍</div>
          <h2 className="about-card-title">The Agricultural Challenge</h2>
          <p className="about-card-text">
            Crop diseases and nutritional deficiencies can spread rapidly through agricultural fields,
            causing significant yield losses if left unaddressed. Traditional diagnosis frequently relies
            on manual visual inspection or specialized agronomists, which may not always be immediately
            accessible in remote or rural farming communities.
          </p>
        </section>

        {/* The Solution */}
        <section className="about-card">
          <div className="about-card-icon bg-green-light">💡</div>
          <h2 className="about-card-title">Our AI Solution</h2>
          <p className="about-card-text">
            CropCare AI utilizes deep learning computer vision models trained on the benchmark PlantVillage dataset.
            By analyzing leaf photographs captured directly on mobile devices or computers, the system classifies
            pathogens across 38 distinct crop-disease categories and delivers immediate, actionable farming advisories.
          </p>
        </section>
      </div>

      {/* Technology Stack Architecture */}
      <section className="tech-stack-section">
        <h2 className="tech-title">System Architecture & Technologies</h2>
        <div className="tech-grid">
          <div className="tech-item">
            <span className="tech-badge">Frontend</span>
            <h4>React.js & Vite</h4>
            <p>Responsive, component-driven client architecture with React Router and Axios.</p>
          </div>

          <div className="tech-item">
            <span className="tech-badge">Backend</span>
            <h4>Node.js & Express.js</h4>
            <p>RESTful API layer handling authentication, image uploads with Multer, and AI subprocess orchestration.</p>
          </div>

          <div className="tech-item">
            <span className="tech-badge">Database</span>
            <h4>MongoDB & Mongoose</h4>
            <p>Scalable NoSQL document store managing user profiles and persistent diagnostic scan histories.</p>
          </div>

          <div className="tech-item">
            <span className="tech-badge">Artificial Intelligence</span>
            <h4>TensorFlow & MobileNetV2</h4>
            <p>Lightweight convolutional neural network optimized for fast inference and reliable feature extraction.</p>
          </div>
        </div>
      </section>

      {/* Scope and Supported Crops */}
      <section className="crops-section">
        <h2 className="crops-title">Supported Crops</h2>
        <p className="crops-desc">
          The deep learning model recognizes healthy foliage and common bacterial, fungal, and viral conditions across:
        </p>
        <div className="crops-tags">
          <span className="crop-tag">🍅 Tomato (10 conditions)</span>
          <span className="crop-tag">🥔 Potato (Early/Late Blight)</span>
          <span className="crop-tag">🍎 Apple (Scab, Rust, Rot)</span>
          <span className="crop-tag">🌽 Corn / Maize</span>
          <span className="crop-tag">🍇 Grape</span>
          <span className="crop-tag">🫑 Bell Pepper</span>
          <span className="crop-tag">🍒 Cherry</span>
          <span className="crop-tag">🍓 Strawberry</span>
          <span className="crop-tag">🫐 Blueberry</span>
          <span className="crop-tag">🍑 Peach</span>
          <span className="crop-tag">🌱 Soybean & Squash</span>
        </div>
      </section>

      <div className="about-cta">
        <Link to="/detect" className="btn btn-primary btn-lg">
          Try the Leaf Scanner
        </Link>
      </div>
    </div>
  );
};

export default About;
