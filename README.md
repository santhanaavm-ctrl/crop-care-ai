# 🌱 AI-Powered Crop Disease Detection & Smart Farming Advisory Platform

An intelligent, full-stack agricultural decision-support web application designed to help farmers, agronomists, and researchers rapidly diagnose crop leaf diseases and receive actionable agronomic advisories.

Built with the **MERN Stack** (MongoDB, Express.js, React, Node.js) and a **Deep Learning Convolutional Neural Network (MobileNetV2)** trained on the PlantVillage dataset across 38 distinct crop condition classes.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [Prerequisites](#-prerequisites)
- [Installation Guide](#-installation-guide)
- [Environment Variables Configuration](#-environment-variables-configuration)
- [Starting the Application](#-starting-the-application)
- [AI Model & Inference Architecture](#-ai-model--inference-architecture)
- [Smart Agro-Meteorological Advisory Integration](#-smart-agro-meteorological-advisory-integration)
- [API Endpoints Documentation](#-api-endpoints-documentation)
- [Troubleshooting & Windows Environment Notes](#-troubleshooting--windows-environment-notes)
- [Known Limitations](#-known-limitations)

---

## 🌾 Project Overview

Early detection of foliar crop diseases is critical to preventing harvest loss and maintaining food security. This platform provides:
1. **Instant Disease Diagnosis**: Upload a photo of a crop leaf to identify diseases and receive a percentage confidence score.
2. **Actionable Smart Advisories**: Tailored immediate chemical/biological treatments, long-term prevention protocols, and canopy care.
3. **Agro-Meteorological Guidance**: Weather-informed disease transmission risk analysis (relative humidity, rainfall wash-off, wind spray windows).
4. **Historical Record Keeping**: Authenticated users maintain a private diagnostic scan history to track seasonal outbreaks.

---

## ✨ Key Features

- **Leaf Image Upload & Validation**: Client- and server-side validation supporting JPG, JPEG, and PNG files up to 5 MB with image preview.
- **Deep Learning Classification**: Evaluates input leaves against 38 plant disease and healthy crop classes using MobileNetV2.
- **Structured Advisory Logic**: Delivers disease descriptions, immediate actions, cultural preventive measures, and irrigation/pruning guidelines.
- **JWT-Secured Authentication**: User registration, login, and protected routes using bcryptjs password hashing and JSON Web Tokens.
- **Private Scan History & Management**: Scans are securely tied to the authenticated user ID with full viewing and deletion capabilities.
- **Agro-Meteorological Advisory**: Connects to weather services when configured, or provides structured agronomic transmission guidelines without fabricating data.
- **Responsive Agricultural UI**: Clean, accessible design optimized for desktops, tablets, and smartphones.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS Design System with responsive grid and accessible typography

### Backend
- **Runtime**: Node.js & Express.js 5
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **File Uploads**: `multer` disk storage

### Artificial Intelligence & Machine Learning
- **Framework**: Python 3.11 with TensorFlow / Keras 2.x
- **Architecture**: MobileNetV2 transfer learning model (`ai/models/plant_disease_model.keras`)
- **Dataset**: PlantVillage (38 crop condition classes, 224x224 RGB input)

---

## 📁 Project Architecture & Directory Structure

```text
crop-disease-platform/
├── ai/
│   ├── .venv/                         # Python virtual environment (Python 3.11)
│   ├── dataset/                       # Training & validation dataset folders
│   ├── models/
│   │   ├── class_names.json           # 38 plant disease class mapping
│   │   ├── plant_disease_model.keras  # Trained MobileNetV2 Keras model
│   │   └── plant_disease_model_final.keras
│   ├── predict.py                     # Standalone Python inference script
│   ├── prepare_dataset.py             # Dataset preprocessing utility
│   └── train_model.py                 # Neural network training pipeline
│
├── client/
│   ├── .env                           # Frontend environment variables
│   ├── .env.example                   # Example frontend environment file
│   ├── index.html                     # HTML root entry point
│   ├── package.json                   # Client scripts & dependencies
│   ├── vite.config.js                 # Vite bundler configuration
│   └── src/
│       ├── App.jsx                    # Router, layout, and footer
│       ├── index.css                  # Global design tokens and responsive CSS
│       ├── main.jsx                   # React DOM root
│       ├── components/
│       │   ├── DiseaseResult.jsx      # Diagnostic breakdown & advisory card
│       │   ├── ImageUploader.jsx      # Drag-and-drop leaf uploader with preview
│       │   ├── LoadingSpinner.jsx     # Reusable loading state indicator
│       │   ├── Navbar.jsx             # Responsive navigation with auth awareness
│       │   └── ProtectedRoute.jsx     # Route guard for authenticated views
│       ├── context/
│       │   └── AuthContext.jsx        # Authentication state & session manager
│       ├── pages/
│       │   ├── About.jsx              # Platform details and AI model architecture
│       │   ├── Dashboard.jsx          # User overview, metrics, and quick actions
│       │   ├── DiseaseDetection.jsx   # Upload workbench & disease prediction
│       │   ├── History.jsx            # Scan history table, details, and deletion
│       │   ├── Home.jsx               # Landing page with feature highlights
│       │   ├── Login.jsx              # Farmer login page
│       │   ├── Register.jsx           # Farmer account creation page
│       │   └── Weather.jsx            # Agro-meteorological advisory module
│       └── services/
│           └── api.js                 # Axios API configuration & endpoints
│
├── server/
│   ├── .env                           # Server secrets (excluded from Git)
│   ├── .env.example                   # Safe template for server variables
│   ├── package.json                   # Server scripts & dependencies
│   ├── server.js                      # Express server entry point & middleware
│   ├── config/
│   │   └── db.js                      # MongoDB Atlas connection handler
│   ├── controllers/
│   │   ├── aiController.js            # Python process spawn, prediction & history
│   │   ├── authController.js          # User registration & login handlers
│   │   └── weatherController.js       # Weather advisory & agro-risk logic
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT authorization verification middleware
│   ├── models/
│   │   ├── ScanHistory.js             # Mongoose scan history schema
│   │   └── User.js                    # Mongoose user credentials schema
│   ├── routes/
│   │   ├── authRoutes.js              # /api/auth routes
│   │   ├── scanRoutes.js              # /api/scan routes
│   │   └── weatherRoutes.js           # /api/weather routes
│   └── uploads/                       # Uploaded leaf images storage
│
├── .gitignore                         # Protects secrets, uploads, node_modules, and venv
└── README.md                          # Comprehensive project documentation
```

---

## 📦 Prerequisites

1. **Node.js**: v18.0.0 or higher (v20+ recommended).
2. **npm**: v9.0.0 or higher.
3. **MongoDB**: A free MongoDB Atlas cluster connection string.
4. **Python**: Python 3.10 or 3.11 installed (for the AI inference pipeline).

---

## 🚀 Installation Guide

### 1. Clone or Open the Repository
```bash
cd "C:\Users\Santhana Sathiskumar\Desktop\crop-disease-platform"
```

### 2. Install Server Dependencies
```bash
cd server
npm install
cd ..
```

### 3. Install Client Dependencies
```bash
cd client
npm install
cd ..
```

---

## ⚙️ Environment Variables Configuration

### Server Configuration (`server/.env`)
Create a file named `.env` in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/crop_care?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters

# Optional: Real-time Weather Advisory (OpenWeatherMap)
# OPENWEATHER_API_KEY=your_openweather_api_key_here
```

> **Security Notice**: Never commit `server/.env` to Git or expose database passwords or JWT secrets.

### Client Configuration (`client/.env`)
Create a file named `.env` in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Starting the Application

### 1. Start the Backend Server
```bash
cd server
npm run dev
# Or for production:
# npm start
```
The server will start at: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/health`

### 2. Start the Frontend Client
In a separate terminal window:
```bash
cd client
npm run dev
```
The React application will start at: `http://localhost:5173`

---

## 🧠 AI Model & Inference Architecture

1. **Input Quality & Out-of-Distribution Rejection**:
   - Validates minimum dimensions (50x50 pixels).
   - Computes grayscale variance and color distribution: rejects low-contrast, monochrome, or non-foliar uploads with `UNSUPPORTED` status before running neural inference.
2. **Runtime Engine**:
   - Utilizes Keras 3 with the PyTorch backend (`KERAS_BACKEND=torch`) to bypass Windows Smart App Control unsigned DLL policy blocks (`WinError 4551`) cleanly and securely.
3. **Model Prediction**:
   - Resizes leaf image to 224x224 RGB float32 in $[0, 255]$ (the model's internal Rescaling layer converts to $[-1, 1]$).
   - Generates logits across all 38 PlantVillage classes.
4. **Temperature-Scaled Probability Calibration**:
   - Applies temperature scaling ($T = 1.20$) to prevent raw softmax overconfidence on ambiguous symptoms.
5. **Two-Stage Hierarchical Plant Species Verification**:
   - Computes species marginal probability: $P(\text{Species}) = \sum_{c \in \text{Species}} P(c)$ across 14 plant families.
   - Enforces consistency between the top predicted species and the top disease class.
   - Solves the Apple-to-Strawberry misclassification: apple scab lesions cannot be misattributed to strawberry leaf scorch when species verification confirms 99%+ Apple features.
6. **Honest Confidence States**:
   - `HIGH CONFIDENCE`: Disease probability $\ge 48\%$, Species probability $\ge 60\%$, and species agreement.
   - `UNCERTAIN`: Conflicting species traits or marginal probability below diagnostic threshold.
   - `UNSUPPORTED`: Non-leaf or low-quality input.
7. **Top-3 Candidates & Comprehensive Agronomic Advisory**:
   - Returns top 3 candidate hypotheses with probabilities.
   - Supplies observable symptoms, immediate actions, preventive measures, irrigation care, and diagnostic next steps.

---

## ⛅ Smart Agro-Meteorological Advisory Integration

The platform includes a real-time agro-meteorological advisory module:
- **Server-Side API**: `GET /api/weather/advisory?city=<name>&lat=<lat>&lon=<lon>&crop=<crop>&disease=<disease>`
- **Live OpenWeatherMap Integration**:
  - Current atmospheric observations (Temperature, Feels Like, Relative Humidity, Wind Speed, Cardinal Wind Direction, Barometric Pressure, Sunrise/Sunset).
  - 5-Day / 3-hour microclimate forecast grouped by day with precipitation probability (`pop`) and expected rainfall amount (`mm`).
  - In-memory 10-minute caching to optimize performance and prevent rate limiting.
- **Spraying Safety Window Evaluation**:
  - **Optimal (5–15 km/h)**: Calm conditions for uniform canopy droplet deposition.
  - **Caution**: Rain expected within upcoming 24h window; recommends rain-fast adjuvant.
  - **Unfavorable (> 20 km/h or Active Rain)**: Warns against drift hazard or immediate chemical runoff.
- **Crop & Pathogen Disease Correlation**:
  - Dynamically links leaf diagnosis to microclimate factors. For instance, high humidity ($> 75\%$) combined with Apple Scab or Late Blight triggers elevated secondary infection warnings.
- **Safe Fallback**: If `OPENWEATHER_API_KEY` is not set in `server/.env`, returns a clean unconfigured response with agronomic guidance principles—**no fabricated weather data**.

---

## 📡 API Endpoints Documentation

### Health & Diagnostic
- `GET /api/health` — Returns server uptime and MongoDB connection state (`200 OK`).

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new farmer account (`{ name, email, password }`).
- `POST /api/auth/login` — Authenticate and receive a JWT Bearer token (`{ email, password }`).
- `GET /api/auth/protected` — Verify token authenticity and retrieve `userId` (Requires `Authorization: Bearer <token>`).

### Crop Disease Scanning (`/api/scan`)
- `POST /api/scan/upload` — Upload an image without running prediction (Multer field: `image`).
- `POST /api/scan/predict` — Upload image and run deep learning disease prediction (Multer field: `image`, optional `Bearer` token to save to history).
- `GET /api/scan/history` — Retrieve authenticated user's scan history (Requires `Bearer` token).
- `DELETE /api/scan/history/:id` — Delete a scan record owned by the authenticated user (Requires `Bearer` token).

### Weather & Advisory (`/api/weather`)
- `GET /api/weather/advisory?city=<city>` — Retrieve live weather metrics and agro-meteorological spray advisories.

---

## 🔍 Troubleshooting & Windows Environment Notes

### Windows Smart App Control / WDAC Blocker (`WinError 4551`)
On certain Windows 11 installations with **Smart App Control** or **Windows Defender Application Control (WDAC)** enabled:
- **Symptom**: Importing TensorFlow fails with:
  `WinError 4551: An Application Control policy has blocked this file: .../_pywrap_tensorflow_internal.pyd`
- **Root Cause**: The `.pyd` native binary packaged with TensorFlow does not carry a digital Authenticode signature matching the machine's enterprise/OEM code-signing policy.
- **Handling in Code**:
  - The Express backend includes a 25-second execution timeout guard and specific error inspection.
  - If Windows blocks the binary, the server safely catches the event and returns an informative HTTP 504 / 500 error instead of hanging or crashing.
- **How to Resolve on Windows (Manual Steps)**:
  1. **Option A (WSL 2 - Recommended for Development)**: Run the Python prediction service inside Windows Subsystem for Linux (WSL 2 Ubuntu), where Windows Application Control policies do not restrict ELF binaries.
  2. **Option B (Signed Release / Conda)**: Use an Anaconda or Miniconda environment with signed Python packages.
  3. **Option C (Docker Container)**: Run the backend and AI inference script within a standard Docker container (`node:20` + `python:3.11-slim`).

---

## 📋 Known Limitations

1. **Single Leaf Focus**: The MobileNetV2 model expects clear close-up images of a single leaf on a relatively neutral background. Entire plant or field shots reduce prediction accuracy.
2. **PlantVillage Species Scope**: The model is trained on 14 crop species (Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato). Unrecognized plants will yield low confidence predictions.
3. **Advisory Disclaimer**: All disease diagnoses and treatment suggestions are AI-generated assistive tools and should be confirmed by a local agricultural extension officer before applying commercial chemicals.

---

## 👨‍🎓 Project Credits & College Submission

- **Project Name**: AI-Powered Crop Disease Detection and Smart Farming Advisory Platform
- **Architecture**: MERN Stack (React, Express, Node.js, MongoDB Atlas) + MobileNetV2 Deep Learning
- **Dataset**: PlantVillage Dataset (38 Classes)
