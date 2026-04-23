# 🚨 CrisisSync — Emergency Coordination Platform

> Real-time emergency alert and response coordination system built for **Cepheus 2.0** by **Team Code Crafters**

🔗 **Live Demo:** [crisis-sync-olive.vercel.app](https://crisis-sync-olive.vercel.app/)

---

## 📌 Overview

CrisisSync is a full-stack emergency coordination platform that enables guests, staff, and responders to communicate and act on crises in real time. Whether it's a fire, medical emergency, or security threat — CrisisSync ensures the right people are notified instantly, with full lifecycle tracking from the moment an SOS is triggered to the moment it is resolved.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔴 **One-tap SOS Trigger** | Guests raise emergency alerts with type, location, and floor details |
| 📡 **Live Alert Feed** | Admin dashboard shows all active incidents in real time via Firestore listeners |
| 🗺️ **Live Floor Map** | Interactive hotel floor map with colour-coded room pins reflecting alert status |
| 👥 **Role-based Views** | Separate dashboards for Admin, Staff, Responder, and Guest |
| ✅ **Acknowledge & Resolve** | Staff and responders can update alert status in one click |
| 📊 **Stats Dashboard** | Tracks active alerts, resolved count, and average response time |
| 🕐 **SOS Sent Timestamp** | Exact date and time when each SOS was triggered |
| ✅ **Resolved Timestamp** | Exact date and time when an alert was resolved |
| ⏱️ **Live Elapsed Timer** | Real-time countdown per alert — turns red after 60 seconds |
| 🔒 **Firebase Anonymous Auth** | Guests are identified without requiring sign-up |
| ☁️ **Cloud Firestore** | All incidents stored, synced, and streamed via Firebase |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Usage |
|---|---|
| React + Vite | UI framework and build tool |
| Three.js | 3D animated landing page |
| Firebase SDK | Firestore real-time listeners + anonymous auth |
| Vercel | Frontend deployment |

### Backend

| Technology | Usage |
|---|---|
| Node.js + Express | REST API server |
| Firebase Admin SDK | Firestore read/write |
| Render | Backend deployment |

---

## 🗂️ Project Structure

```
CrisisSync/
├── crisissync-frontend/            # React + Vite frontend
│   └── src/
│       ├── App.jsx                 # Root app — routing, role switcher, shell
│       ├── components/
│       │   ├── common/
│       │   │   ├── Landing.jsx     # Three.js animated landing page
│       │   │   ├── LiveTimer.jsx   # Shared elapsed-time countdown component
│       │   │   └── Toast.jsx       # Toast notification system
│       │   ├── dashboard/
│       │   │   ├── AdminDashboard.jsx   # Full admin view: stats, floor map, alert table
│       │   │   └── StaffDashboard.jsx   # Staff alert cards with resolve action
│       │   ├── HotelFloorMap.jsx   # Interactive SVG floor map with status pins
│       │   └── sos/
│       │       ├── GuestScreen.jsx      # Guest SOS trigger UI
│       │       ├── SOSButton.jsx        # Animated SOS button
│       │       ├── EmergencySelector.jsx # Emergency type picker
│       │       ├── ConfirmModal.jsx     # Pre-send confirmation dialog
│       │       └── ResponseTimer.jsx   # Guest-facing response wait timer
│       ├── hooks/
│       │   ├── useAlerts.js        # Firestore real-time alert subscription
│       │   └── useToast.js         # Toast state management hook
│       ├── services/
│       │   ├── alertService.js     # createAlert, acknowledgeAlert, resolveAlert
│       │   └── firebase.js         # Firebase init + anonymous login
│       └── store/
│           └── alertStore.js       # Shared alert state store
│
└── crisissync-backend/             # Express.js backend
    ├── routes/
    │   └── incidents.js            # SOS, acknowledge, resolve API routes
    ├── firebase.js                 # Firestore Admin SDK connection
    └── index.js                    # Server entry point
```

---

## 🗺️ Live Floor Map

The Admin dashboard includes an interactive hotel floor map (`HotelFloorMap.jsx`) that visualises alert status room-by-room in real time.

- **Red pin** — Active emergency in that room
- **Amber pin** — Alert acknowledged, response in progress
- **Green pin** — Resolved
- **Click a pin** — Advances the alert to the next state (Active → Acknowledged → Resolved) directly from the map

Room pins are driven by the live `alerts` array from Firestore, matched on the `location` field (e.g. `"Room 302"`).

---

## 🕐 Timestamp Tracking

Every alert tracks three key moments:

| Timestamp | Firestore Field | Where Shown |
|---|---|---|
| 📤 **Sent At** | `triggeredAt` | Admin table, Guest screen |
| 👤 **Acknowledged At** | `acknowledgedAt` | Alert detail |
| ✅ **Resolved At** | `resolvedAt` | Admin table, Guest screen |

The admin table displays **Sent At** in red and **Resolved At** in green. Unresolved alerts show `pending`. The guest screen shows both timestamps side-by-side once an incident is closed.

---

## 👥 Roles

| Role | Capabilities |
|---|---|
| **Guest** | Trigger SOS with type, location, floor; view sent and resolved timestamps |
| **Staff** | View active alerts as cards; mark resolved with resolution note |
| **Admin** | Full dashboard — stats, live floor map, full alert table with timestamps, filter bar |
| **Responder** | View dispatched emergencies; mark resolved |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- A Firebase project with **Firestore** and **Anonymous Authentication** enabled

### 1 — Clone the repo

```bash
git clone https://github.com/jishnu395/CrisisSync.git
cd CrisisSync
```

### 2 — Frontend setup

```bash
cd crisissync-frontend
npm install
```

Create `.env` in `crisissync-frontend/`:

```env
VITE_API_URL=https://crisissync-backend-5i57.onrender.com
```

Start the dev server:

```bash
npm run dev
```

### 3 — Backend setup

```bash
cd ../crisissync-backend
npm install
```

Create `.env` in `crisissync-backend/`:

```env
PORT=5000
```

Add your Firebase service account JSON credentials, then:

```bash
node index.js
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/api/sos` | Trigger a new SOS — saves `triggeredAt` timestamp to Firestore |
| `GET` | `/api/incidents` | Fetch all incidents with `triggeredAt`, `acknowledgedAt`, `resolvedAt` |
| `PATCH` | `/api/incidents/:id/acknowledge` | Acknowledge alert — saves `acknowledgedAt` |
| `PATCH` | `/api/incidents/:id/resolve` | Resolve alert — saves `resolvedAt` and `responseTimeSeconds` |

---

## 🔄 Alert Lifecycle

```
Guest triggers SOS
       │
       ▼
  [ACTIVE] ──────────────────── Admin/Staff sees alert (red)
       │                         Live elapsed timer starts
       ▼
  [ACKNOWLEDGED] ─────────────── Responder en route (amber)
       │                         acknowledgedAt recorded
       ▼
  [RESOLVED] ─────────────────── Incident closed (green)
                                  resolvedAt + responseTimeSeconds recorded
                                  Guest sees resolved timestamp
```

---

## 👨‍💻 Team

**Team Code Crafters** — Cepheus 2.0

---

## 📄 License

MIT License — free to use and modify for your own projects.
