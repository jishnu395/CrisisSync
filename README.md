# 🚨 CrisisSync — Real-Time Emergency Response & Coordination Platform

> Real-time emergency alert and response coordination system built for **Cepheus 2.0** by **Team Code Crafters**

## 🌐 Live Demo

👉 https://crisis-sync-olive.vercel.app/

---

## 📸 Preview

### 🏠 Landing Page

![Landing](./assets/HomePage.jpeg)

### 🚨 SOS Trigger (Guest View)

![SOS](./assets/Sos.jpeg)

### 👨‍💼 Admin Dashboard

![Admin](./assets/Admin.jpeg)

### 🧑‍🚒 Staff Dashboard

![Staff](./assets/Staff.jpeg)

### 🚑 Responder View

![Responder](./assets/Responder.jpeg)

---

## 📌 Overview

CrisisSync is a full-stack emergency coordination platform that enables guests, staff, and responders to communicate and act on crises in real time. Whether it's a fire, medical emergency, or security threat — CrisisSync ensures the right people are notified instantly, with full lifecycle tracking from the moment an SOS is triggered to resolution.

---

## 🎯 Problem Statement

Design a system that can:

* Detect and manage emergency alerts in real-time
* Provide a centralized dashboard for monitoring
* Enable quick response actions to minimize delays
* Visually represent incidents for better situational awareness

---

## ✨ Features

| Feature                | Description                             |
| ---------------------- | --------------------------------------- |
| 🔴 One-tap SOS Trigger | Guests raise emergency alerts instantly |
| 📡 Live Alert Feed     | Real-time updates via Firestore         |
| 🗺️ Live Floor Map     | Visual room-level alert tracking        |
| 👥 Role-based Views    | Admin, Staff, Responder, Guest          |
| ✅ Ack & Resolve        | One-click lifecycle management          |
| 📊 Stats Dashboard     | Active, resolved, response time         |
| ⏱️ Live Timer          | Tracks urgency in real-time             |
| 🔒 Anonymous Auth      | No login needed for guests              |
| ☁️ Firestore           | Real-time backend database              |

---

## 🧠 System Architecture

```mermaid
flowchart LR
    A[Guest / User] --> B[Frontend (React)]
    B --> C[Backend API (Node.js)]
    C --> D[(Firestore Database)]
    D --> B
    B --> E[Admin Dashboard]
    B --> F[Staff / Responder Views]
```

* Event-driven real-time system
* Firestore listeners power live updates
* Instant UI sync across all roles

---

## 🛠️ Tech Stack

### Frontend

* React + Vite
* Three.js (animated landing page)
* Firebase SDK
* Vercel (deployment)

### Backend

* Node.js + Express
* Firebase Admin SDK
* Render (deployment)

---

## 🗂️ Project Structure

```
CrisisSync/
├── crisissync-frontend/
├── crisissync-backend/
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js v18+
* Firebase project with Firestore + Anonymous Auth

### Clone

```bash
git clone https://github.com/jishnu395/CrisisSync.git
cd CrisisSync
```

---

## 🔐 Environment Variables

### Frontend (`crisissync-frontend/.env`)

```env
VITE_API_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
```

### Backend (`crisissync-backend/.env`)

```env
PORT=5000
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

⚠️ Do NOT commit `.env` files
👉 Use `.env.example` as reference

---

## 🔄 Alert Lifecycle

```
ACTIVE → ACKNOWLEDGED → RESOLVED
```

---

## 🚧 Limitations & Future Improvements

### Current Limitations

* Single-floor visualization
* Basic role handling
* No push notifications
* Limited scalability testing

### Future Improvements

* Multi-floor navigation
* Push notifications (FCM)
* Role-based authentication
* Mobile app (React Native)
* Analytics dashboard

---

## 💡 Why This Project Matters

CrisisSync demonstrates:

* Real-time system design
* Event-driven architecture
* Role-based workflows
* Interactive UI/UX
* Practical emergency response system

---

## 👥 Team

Built by **Team Code Crafters** during **Cepheus 2.0 Hackathon**
*(Individual contributor names intentionally omitted)*

---

## 📄 License

MIT License
