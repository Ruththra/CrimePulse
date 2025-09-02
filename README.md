# CrimePulse - Anonymous Crime Reporting Platform

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/your-repo/crimepulse/blob/main/LICENSE)
[![Get Support](https://img.shields.io/badge/Support-Community-orange)](https://github.com/your-repo/crimepulse/discussions)

## Table of Contents
- [Overview](#overview)
- [Demo](#demo)
- [Core Features](#core-features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
    - [Frontend Installation](#frontend-installation)
    - [Backend Services Installation](#backend-services-installation)
- [Configuration](#configuration)
    - [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Development & Testing](#development--testing)
    - [Running Tests](#running-tests)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

## Overview

CrimePulse is a comprehensive web platform designed to empower citizens in Sri Lanka to report crimes anonymously from anywhere. The platform features heatmaps for crime visualization, a streamlined complaint workflow, integrated newsfeed, and an admin dashboard for efficient management. Built with modern web technologies and microservices architecture, it ensures privacy, security, and ease of use.

## Demo

This video demonstrates the CrimePulse platform's key features, including anonymous crime reporting, heatmap visualization, and admin dashboard functionality.

[![Demo Video](https://img.youtube.com/vi/rDuEvArJm0s/0.jpg)](https://youtu.be/rDuEvArJm0s)

## Core Features

- **Anonymous & Registered Reporting**: Submit complaints anonymously with auto-generated IDs or as a registered user
- **Media Attachments**: Upload photos and videos with geotagging for detailed incident reporting
- **Privacy-Preserving Heatmaps**: Visualize approximate crime locations with jitter for privacy protection
- **Newsfeed Integration**: Curated crime-related news using News API
- **Admin Dashboard**: Comprehensive interface for complaint review, status updates, and analytics
- **Anti-Spam Protection**: Google reCAPTCHA integration for spam prevention
- **Emergency Contacts & FAQ**: Quick access to important resources and frequently asked questions

## Prerequisites

- Node.js 18+
- Ballerina 2201.8.0 or later
- MongoDB (local or Atlas)
- Git

## Installation

### Frontend Installation

1. **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd crimepulse
    ```

2. **Install dependencies:**
    ```bash
    cd frontend
    npm install
    ```

3. **Configure environment variables:**
    Copy the example file and customize:
    ```bash
    cp .env.example .env
    # Edit .env with your configuration
    ```

### Backend Services Installation

1. **Navigate to backend services:**
    ```bash
    cd backend/auth
    # Repeat for complaint and newsfeed
    ```

2. **Install Ballerina dependencies:**
    ```bash
    bal build
    ```

3. **Configure service configs:**
    Copy example config files:
    ```bash
    cp Config.toml.example Config.toml
    # Edit Config.toml with your settings
    ```

## Configuration

### Environment Variables

**Frontend (.env):**
- `VITE_API_BASE_URL`: Base URL for backend APIs
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key
- `VITE_RECAPTCHA_SITE_KEY`: reCAPTCHA site key

**Backend Services (Config.toml):**
- `MONGO_URI`: MongoDB connection string
- `DB_NAME`: Database name
- `PORT`: Service port
- `SERVER_URL`: Service URL
- `FRONTEND_URL`: Frontend URL

## Running the Application

1. **Start MongoDB:**
    Ensure MongoDB is running locally or configure Atlas connection.

2. **Start Backend Services:**
    ```bash
    # Auth Service
    cd backend/auth
    bal run

    # Complaint Service
    cd ../complaint
    bal run

    # Newsfeed Service
    cd ../newsfeed
    bal run
    ```

3. **Start Frontend:**
    ```bash
    cd frontend
    npm run dev
    ```

4. **Access the application:**
    Open http://localhost:5173 in your browser.

## Development & Testing

### Running Tests

**Frontend Tests:**
```bash
cd frontend
npm test
```

**Backend Tests:**
```bash
cd backend/<service>
bal test
```

## System Architecture

```
[Frontend (React/TypeScript)]
  ├─ Components (HeatMap, NewsTicker, etc.)
  ├─ Pages (Auth, Complaint, Admin, etc.)
  └─ State Management (Zustand)

      ⇅ HTTP/HTTPS

[Backend Microservices (Ballerina)]
   ├─ auth-service (8082)
   │   ├─ User authentication & JWT
   │   └─ User management
   ├─ complaint-service (8081)
   │   ├─ Complaint CRUD operations
   │   ├─ Media upload handling
   │   └─ Status management
   └─ newsfeed-service (8083)
       ├─ News API integration
       └─ Content curation

[MongoDB]
   ├─ Users collection
   ├─ Complaints collection
   └─ Audit logs

[External Services]
   ├─ Google Maps API
   ├─ News API
   ├─ Cloudinary (media storage)
   └─ Google reCAPTCHA
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Ballerina (microservices)
- **Database**: MongoDB
- **APIs**: Google Maps JS API, News API
- **Authentication**: JWT
<!-- - **Deployment**: Docker, Kubernetes (optional) -->

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

