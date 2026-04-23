// src/components/HotelFloorMap.jsx
// Styled to match CrisisSync's dark theme (#12121a background, JetBrains Mono font).
//
// HOW TO CUSTOMISE YOUR ROOMS:
// Edit the ROOM_LAYOUT array below — change the `id` values to match whatever
// your backend sends in alert.location (e.g. "101", "Room 101", "Rm-101").
// The SVG x/y/w/h/cx/cy positions only need changing if you want a different layout.

import React from "react";

// ─── Room layout ───────────────────────────────────────────────────────────
// `id` must exactly match the value of alert.location in your Firestore data.
const ROOM_LAYOUT = [
  // Top row (rooms facing one side of corridor)
  { id: "101", label: "101", type: "Twin",   cx: 155, cy: 115, x: 100, y: 50,  w: 110, h: 130 },
  { id: "102", label: "102", type: "Double", cx: 275, cy: 115, x: 220, y: 50,  w: 110, h: 130 },
  { id: "103", label: "103", type: "Suite",  cx: 395, cy: 115, x: 340, y: 50,  w: 110, h: 130 },
  { id: "104", label: "104", type: "Double", cx: 515, cy: 115, x: 460, y: 50,  w: 110, h: 130 },
  // Bottom row (rooms facing other side of corridor)
  { id: "105", label: "105", type: "Twin",   cx: 155, cy: 315, x: 100, y: 250, w: 110, h: 130 },
  { id: "106", label: "106", type: "Suite",  cx: 275, cy: 315, x: 220, y: 250, w: 110, h: 130 },
  { id: "107", label: "107", type: "Double", cx: 395, cy: 315, x: 340, y: 250, w: 110, h: 130 },
  { id: "108", label: "108", type: "Twin",   cx: 515, cy: 315, x: 460, y: 250, w: 110, h: 130 },
];

// ─── Status → visual config (dark theme) ──────────────────────────────────
const STATUS_CONFIG = {
  active: {
    pinColor:   "#ff2d55",
    roomFill:   "rgba(255,45,85,0.10)",
    roomStroke: "#ff2d55",
    label:      "SOS",
    ripple:     true,
  },
  acknowledged: {
    pinColor:   "#f59e0b",
    roomFill:   "rgba(245,158,11,0.10)",
    roomStroke: "#f59e0b",
    label:      "ACK",
    ripple:     false,
  },
  resolved: {
    pinColor:   "#22c55e",
    roomFill:   "rgba(34,197,94,0.08)",
    roomStroke: "#22c55e",
    label:      "OK",
    ripple:     false,
  },
};

// ─── Animated SOS pin ─────────────────────────────────────────────────────
function SosPin({ cx, cy, status }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  const pinY = cy - 30;

  return (
    <g>
      {cfg.ripple && (
        <>
          <circle cx={cx} cy={pinY} r={10} fill={cfg.pinColor} opacity={0.5}
            style={{ animation: "hfm-ripple 1.2s ease-out infinite" }} />
          <circle cx={cx} cy={pinY} r={10} fill={cfg.pinColor} opacity={0.3}
            style={{ animation: "hfm-ripple 1.2s ease-out infinite 0.5s" }} />
        </>
      )}
      <circle
        cx={cx} cy={pinY} r={10}
        fill={cfg.pinColor}
        style={cfg.ripple ? { animation: "hfm-pulse 1.2s ease-in-out infinite" } : {}}
      />
      <text
        x={cx} y={pinY + 1}
        textAnchor="middle" dominantBaseline="central"
        fontSize={7} fontWeight={700} fill="white"
        fontFamily="'JetBrains Mono', monospace"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {cfg.label}
      </text>
      <line
        x1={cx} y1={pinY + 10} x2={cx} y2={cy - 12}
        stroke={cfg.pinColor} strokeWidth={1.5} strokeLinecap="round"
      />
    </g>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
// Props:
//   alerts        — array of { roomNumber: string, status: "active"|"acknowledged"|"resolved" }
//                   AdminDashboard maps alert.location → roomNumber before passing in.
//   onRoomClick   — function(roomId) called when admin clicks a room
//   floorLabel    — string shown in the header, e.g. "Floor 1"
export default function HotelFloorMap({ alerts = [], onRoomClick, floorLabel = "Floor 1" }) {
  // Fast lookup: roomId → status
  const alertMap = {};
  alerts.forEach((a) => {
    const id = String(a.roomNumber ?? "");
    if (id) alertMap[id] = a.status;
  });

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const ackCount    = alerts.filter((a) => a.status === "acknowledged").length;

  return (
    <div style={{ width: "100%", fontFamily: "'JetBrains Mono', monospace" }}>
      <style>{`
        @keyframes hfm-pulse  { 0%,100%{r:10;opacity:1} 50%{r:14;opacity:.5} }
        @keyframes hfm-ripple { 0%{r:10;opacity:.7} 100%{r:26;opacity:0} }
        @keyframes hfm-blink  { 0%,100%{opacity:1} 50%{opacity:.4} }
        .hfm-room { cursor: pointer; }
        .hfm-room:hover rect { opacity: .8; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#e8e8f0", letterSpacing: "0.05em" }}>
          {floorLabel.toUpperCase()} — LIVE VIEW
        </span>

        {/* Live dot */}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#555" }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block",
            animation: "hfm-blink 1.5s ease-in-out infinite",
          }} />
          LIVE
        </span>

        {/* Active badge */}
        {activeCount > 0 && (
          <span style={{
            background: "rgba(255,45,85,0.12)", border: "1px solid rgba(255,45,85,0.25)",
            color: "#ff2d55", fontSize: 10, fontWeight: 700,
            padding: "2px 10px", borderRadius: 99,
          }}>
            {activeCount} ACTIVE SOS
          </span>
        )}

        {/* Acknowledged badge */}
        {ackCount > 0 && (
          <span style={{
            background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)",
            color: "#f59e0b", fontSize: 10, fontWeight: 700,
            padding: "2px 10px", borderRadius: 99,
          }}>
            {ackCount} ACK
          </span>
        )}

        <span style={{ marginLeft: "auto", fontSize: 10, color: "#444" }}>
          Click room to ack / resolve
        </span>
      </div>

      {/* ── SVG floor plan ── */}
      <svg
        width="100%"
        viewBox="0 0 680 420"
        role="img"
        aria-label={`Hotel floor plan — ${floorLabel}`}
        style={{ display: "block", borderRadius: 10, border: "1px solid #1a1a26" }}
      >
        {/* Floor background */}
        <rect x={10} y={10} width={660} height={400} rx={12} fill="#0e0e18" stroke="#1a1a26" strokeWidth={0.5} />

        {/* Floor label */}
        <text x={30} y={32} fontSize={10} fontWeight={500} fill="#333"
          fontFamily="'JetBrains Mono', monospace" letterSpacing="0.08em">
          {floorLabel.toUpperCase()} — WING A
        </text>

        {/* Corridor */}
        <rect x={40} y={190} width={600} height={50} rx={4}
          fill="#12121a" stroke="#1a1a26" strokeWidth={0.5} strokeDasharray="6 3" />
        <text x={340} y={219} textAnchor="middle" fontSize={10} fill="#333"
          fontFamily="'JetBrains Mono', monospace" letterSpacing="0.1em">
          CORRIDOR
        </text>

        {/* Lift */}
        <rect x={590} y={185} width={55} height={60} rx={6}
          fill="#12121a" stroke="#2a2a3a" strokeWidth={0.5} />
        <text x={617} y={213} textAnchor="middle" fontSize={9} fill="#444"
          fontFamily="'JetBrains Mono', monospace">LIFT</text>
        <text x={617} y={230} textAnchor="middle" fontSize={13} fill="#333"
          fontFamily="system-ui, sans-serif">▲▼</text>

        {/* Stairwell */}
        <rect x={40} y={185} width={50} height={60} rx={6}
          fill="#12121a" stroke="#2a2a3a" strokeWidth={0.5} strokeDasharray="3 2" />
        <text x={65} y={215} textAnchor="middle" fontSize={8} fill="#444"
          fontFamily="'JetBrains Mono', monospace">STAIR</text>

        {/* ── Rooms ── */}
        {ROOM_LAYOUT.map((room) => {
          const status = alertMap[room.id];
          const cfg    = STATUS_CONFIG[status];
          return (
            <g
              key={room.id}
              className="hfm-room"
              onClick={() => onRoomClick?.(room.id)}
              role="button"
              aria-label={`Room ${room.label} — ${status ?? "clear"}`}
            >
              <rect
                x={room.x} y={room.y} width={room.w} height={room.h}
                rx={8}
                fill={cfg ? cfg.roomFill : "#12121a"}
                stroke={cfg ? cfg.roomStroke : "#2a2a3a"}
                strokeWidth={cfg ? 1.5 : 0.5}
              />
              <text
                x={room.cx} y={room.cy - 8}
                textAnchor="middle" dominantBaseline="central"
                fontSize={13} fontWeight={600} fill="#e8e8f0"
                fontFamily="'JetBrains Mono', monospace"
                style={{ pointerEvents: "none" }}
              >
                {room.label}
              </text>
              <text
                x={room.cx} y={room.cy + 10}
                textAnchor="middle" dominantBaseline="central"
                fontSize={9} fill="#444"
                fontFamily="'JetBrains Mono', monospace"
                style={{ pointerEvents: "none" }}
              >
                {room.type}
              </text>
            </g>
          );
        })}

        {/* ── SOS Pins (rendered on top) ── */}
        {ROOM_LAYOUT.map((room) => {
          const status = alertMap[room.id];
          if (!status) return null;
          return <SosPin key={room.id} cx={room.cx} cy={room.cy} status={status} />;
        })}
      </svg>

      {/* ── Legend ── */}
      <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 10, color: "#555", flexWrap: "wrap" }}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <span key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width={10} height={10} viewBox="0 0 10 10">
              <circle cx={5} cy={5} r={4} fill={cfg.pinColor} />
            </svg>
            {key.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}