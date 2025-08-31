# Crime Pulse — Anonymous Crime Reporting Platform

> Empowering citizens in Sri Lanka to report crimes **anonymously**, from anywhere.  
> Heatmaps • Complaint workflow • Newsfeed • Admin dashboard

---

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Seeding Sample Data](#seeding-sample-data)
- [Ballerina Services](#ballerina-services)
- [MongoDB Data Models](#mongodb-data-models)
- [API Endpoints](#api-endpoints)
- [Admin Dashboard](#admin-dashboard)
- [Security & Privacy](#security--privacy)
- [FAQ](#faq)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview
Crime Pulse is a web platform to submit crime complaints anonymously (or as a registered user). Complaints can include photos/videos and are routed to the local police station after admin verification. A public HeatMap shows approximate incident locations. A Newsfeed surfaces relevant crime-related news. An Admin interface reviews complaints and updates statuses.

---

## Key Features
>Anonymous & Registered reporting (auto-generated anonymous IDs)

>Complaint submission with media attachments (photo/video) and geotag

>HeatMap of approximate crime locations (privacy-preserving jitter)

>Newsfeed filtered via News API

>FAQ & Emergency contacts

>Admin dashboard: heatmap, category pie chart, complaint review & status changes

>Anti-spam via Google reCAPTCHA

---

## System Architecture
[Web Client (React/TS)]
  ├─ Map (Google Maps JS API)
  ├─ Newsfeed (News API)
  └─ reCAPTCHA

      ⇅ HTTPS (JWT/Session)

[Backend (Ballerina Microservices)]
   ├─ auth-service          (login/register, JWT)
   ├─ complaint-service     (CRUD, media, status)
   ├─ heatmap-service       (aggregations, jitter)
   ├─ news-service          (curation proxy to News API)
   └─ admin-service         (moderation, metrics)

[MongoDB Atlas/Server]
   ├─ users
   ├─ complaints
   └─ audit_logs

[Object Storage (optional: S3/GCS/MinIO)]
   └─ media uploads


---

## Tech Stack
[List your frontend, backend, database, and APIs used.]

---

## Monorepo Structure
```
crime-pulse/
├─ apps/
│  ├─ web/
│  └─ admin/
│
├─ services/
│  ├─ auth_service/
│  ├─ complaint_service/
│  ├─ heatmap_service/
│  ├─ news_service/
│  └─ admin_service/
│
├─ infra/
│  ├─ docker/
│  └─ k8s/
│
├─ scripts/
├─ README.md
└─ package.json / bal.toml
```

---

## Getting Started
[Instructions on setup and installation.]

---

## Environment Variables
[Document required .env values here.]

---

## Running Locally
[Steps to run locally with Docker or manually.]

---

## Seeding Sample Data
[Instructions for seeding DB with sample data.]

---

## Ballerina Services
[List your Ballerina microservices and responsibilities.]

---

## MongoDB Data Models
[Document your MongoDB schema.]

---

## API Endpoints
[Document all key endpoints here.]

---

## Admin Dashboard
[Explain features available to admins.]

---

## Security & Privacy
[Notes on anonymity, data security, reCAPTCHA.]

---

## FAQ
[Add common questions and answers.]

---

## Roadmap
[Future improvements planned.]

---

## Contributing
[How to contribute guidelines.]

---

## License
[State your license here.]
