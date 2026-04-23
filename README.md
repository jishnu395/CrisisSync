# 🚨 CrisisSync — Emergency Coordination Platform

> Real-time emergency alert and response coordination system built for **Cepheus 2.0** by **Team Code Crafters**

🔗 **Live Demo:** [https://crisis-sync-olive.vercel.app/](https://crisis-sync-olive.vercel.app/)

---

## 📌 Overview

CrisisSync is a full-stack emergency coordination platform that enables guests, staff, and responders to communicate and respond to crises in real time. Whether it's a fire, medical emergency, or security threat — CrisisSync ensures the right people are notified instantly, with full timestamp tracking from the moment an SOS is sent to the moment it is resolved.

---

## ✨ Features

- 🔴 **One-tap SOS Trigger** — Guests can raise emergency alerts with type, location, and floor details
- 📡 **Live Alert Feed** — Admin dashboard shows all active incidents in real time
- 👥 **Role-based Views** — Separate dashboards for Admin, Staff, Responder, and Guest
- ✅ **Acknowledge & Resolve** — Staff and responders can update alert status
- 📊 **Stats Dashboard** — Tracks active alerts, resolved count, and average response time
- 🕐 **SOS Sent Timestamp** — Exact date and time when each SOS was triggered, shown to both the guest and admin
- ✅ **Resolved Timestamp** — Exact date and time when an alert was resolved, shown in the admin table and on the guest screen
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
│   │   ├── components/      # UI components (Landing, GuestScreen, AdminDashboard, Toast, etc.)
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

## 🕐 Timestamp Feature

### What was added

Every SOS alert now tracks two key timestamps:

| Timestamp | Field | Description |
|---|---|---|
| 📤 **Sent At** | `triggeredAt` | When the guest pressed the SOS button |
| ✅ **Resolved At** | `resolvedAt` | When the admin/staff marked the alert as resolved |

### Admin Dashboard

The alert table now includes two new columns:

- **📤 Sent At** — Shows the time (HH:MM:SS) and date (DD Mon YYYY) the SOS was received, highlighted in red for active alerts
- **✅ Resolved At** — Shows the resolution time in green once resolved; displays "pending" for unresolved alerts

### Guest Screen

After triggering an SOS, guests can now see:

- **Active state** — A `📤 SOS SENT` badge showing the exact time the alert was dispatched
- **Acknowledged state** — The sent timestamp remains visible while help is on the way
- **Resolved state** — Both `📤 SOS SENT` and `✅ RESOLVED` timestamps are shown side by side

### Files Changed

| File | Changes |
|---|---|
| `src/services/alertService.js` | Added `parseDate()` helper; maps `acknowledgedAt` and `resolvedAt` from API response in both `createAlert()` and `getAlerts()` |
| `src/components/AdminDashboard.jsx` | Added `TimestampCell` component; added **Sent At** and **Resolved At** columns to the alert table; added filter bar |
| `src/components/GuestScreen.jsx` | Added `TimestampBadge` component; displays sent and resolved timestamps to the guest after SOS is triggered |

> **Note:** The backend must return `timestamp`, `acknowledgedAt`, and `resolvedAt` fields in the `/api/incidents` response for timestamps to display correctly.

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
| `POST` | `/api/sos` | Trigger a new SOS alert — saves `timestamp` (sentAt) to Firestore |
| `GET` | `/api/incidents` | Get all incidents — returns `timestamp`, `acknowledgedAt`, `resolvedAt` |
| `PATCH` | `/api/incidents/:id/acknowledge` | Acknowledge an incident — saves `acknowledgedAt` to Firestore |
| `PATCH` | `/api/incidents/:id/resolve` | Resolve an incident — saves `resolvedAt` to Firestore |

---

## 👥 Roles

| Role | Capabilities |
|---|---|
| **Guest** | Trigger SOS alerts with type, location, floor; view sent and resolved timestamps |
| **Staff** | View and resolve assigned alerts |
| **Admin** | Full dashboard with stats, all live alerts, sent timestamps, and resolved timestamps |
| **Responder** | View dispatched emergencies and mark resolved |

---

## 👨‍💻 Team

**Team Code Crafters** — Cepheus 2.0

---

## 📄 License

MIT License — feel free to use and modify for your own projects.
