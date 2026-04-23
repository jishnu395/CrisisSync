# 🚨 CrisisSync — Emergency Coordination Platform
 
> Real-time emergency alert and response coordination system built for **Cepheus 2.0** by **Team Code Crafters**
 
🔗 **Live Demo:** [https://crisis-sync-olive.vercel.app/](https://crisis-sync-olive.vercel.app/)
 
---
 
## 📌 Overview
 
CrisisSync is a full-stack emergency coordination platform that enables guests, staff, and responders to communicate and respond to crises in real time. Whether it's a fire, medical emergency, or security threat — CrisisSync ensures the right people are notified instantly.
 
---
 
## ✨ Features
 
- 🔴 **One-tap SOS Trigger** — Guests can raise emergency alerts with type, location, and floor details
- 📡 **Live Alert Feed** — Admin dashboard shows all active incidents in real time
- 👥 **Role-based Views** — Separate dashboards for Admin, Staff, Responder, and Guest
- ✅ **Acknowledge & Resolve** — Staff and responders can update alert status
- 📊 **Stats Dashboard** — Tracks active alerts, resolved count, and average response time
- 🔒 **Firebase Anonymous Auth** — Guests are identified without requiring sign-up
- ☁️ **Cloud Firestore** — All incidents stored and synced via Firebase
---
 
## 🛠️ Tech Stack
 
### Frontend
| Technology | Usage |
|---|---|
| React + Vite | UI framework |
| Three.js | 3D animated landing page |
| Firebase Auth | Anonymous user authentication |
| Vercel | Frontend deployment |
 
### Backend
| Technology | Usage |
|---|---|
| Node.js + Express | REST API server |
| Firebase Firestore | Database |
| Render | Backend deployment |
 
---
 
## 🗂️ Project Structure
 
```
CrisisSync/
├── crisissync-frontend/     # React + Vite frontend
│   ├── src/
│   │   ├── components/      # UI components (Landing, GuestScreen, Toast, etc.)
│   │   ├── services/        # API service layer (alertService.js, firebase.js)
│   │   ├── hooks/           # Custom React hooks (useAlerts, useToast)
│   │   └── store/           # State management
│   └── vite.config.js
│
└── crisissync-backend/      # Express.js backend
    ├── routes/
    │   └── incidents.js     # API routes for SOS, incidents
    ├── firebase.js          # Firestore connection
    └── index.js             # Server entry point
```
 
---
 
## 🚀 Getting Started
 
### Prerequisites
- Node.js v18+
- Firebase project with Firestore and Anonymous Auth enabled
### Frontend Setup
 
```bash
git clone https://github.com/jishnu395/CrisisSync.git
cd CrisisSync/crisissync-frontend
npm install
```
 
Create a `.env` file:
```env
VITE_API_URL=https://crisissync-backend-5i57.onrender.com
```
 
```bash
npm run dev
```
 
### Backend Setup
 
```bash
cd CrisisSync/crisissync-backend
npm install
```
 
Create a `.env` file:
```env
PORT=5000
```
 
Add your Firebase service account credentials, then:
```bash
node index.js
```
 
---
 
## 🔌 API Endpoints
 
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/api/sos` | Trigger a new SOS alert |
| `GET` | `/api/incidents` | Get all incidents |
| `PATCH` | `/api/incidents/:id/acknowledge` | Acknowledge an incident |
| `PATCH` | `/api/incidents/:id/resolve` | Resolve an incident |
 
---
 
## 👥 Roles
 
| Role | Capabilities |
|---|---|
| **Guest** | Trigger SOS alerts with type, location, floor |
| **Staff** | View and resolve assigned alerts |
| **Admin** | Full dashboard with stats and all live alerts |
| **Responder** | View dispatched emergencies and mark resolved |
 
---
 
## 👨‍💻 Team
 
**Team Code Crafters** — Cepheus 2.0
 
---
 
## 📄 License
 
MIT License — feel free to use and modify for your own projects.
 
