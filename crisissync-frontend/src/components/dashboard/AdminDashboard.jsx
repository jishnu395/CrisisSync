import React, { useState, useEffect, useRef } from "react";
import { acknowledgeAlert, resolveAlert } from "../../services/alertService";
import { useAlerts } from "../../hooks/useAlerts";
import HotelFloorMap from "../HotelFloorMap"; // ← NEW

const TYPE_CFG = {
  fire:     { icon: "🔥", color: "#ff2d55", bg: "rgba(255,45,85,0.08)",    border: "rgba(255,45,85,0.15)"    },
  medical:  { icon: "💉", color: "#f59e0b", bg: "rgba(245,158,11,0.08)",   border: "rgba(245,158,11,0.15)"   },
  security: { icon: "🛡️", color: "#818cf8", bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.15)"  },
  other:    { icon: "⚠️", color: "#888",    bg: "rgba(136,136,136,0.08)", border: "rgba(136,136,136,0.15)"  },
};

const STATUS_CFG = {
  active:       { label: "ACTIVE",    color: "#ff2d55", bg: "rgba(255,45,85,0.08)",  dot: "#ff2d55", border: "rgba(255,45,85,0.15)"  },
  acknowledged: { label: "ACK",       color: "#f59e0b", bg: "rgba(245,158,11,0.08)", dot: "#f59e0b", border: "rgba(245,158,11,0.15)" },
  resolved:     { label: "RESOLVED",  color: "#22c55e", bg: "rgba(34,197,94,0.08)",  dot: "#22c55e", border: "rgba(34,197,94,0.15)"  },
};

/** Format a Date object → "23 Apr 2025, 14:07:32" */
function formatDateTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
}

function ElapsedTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const ms = startTime ? new Date(startTime).getTime() : Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - ms) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const color = elapsed > 60 ? "#ff2d55" : elapsed > 30 ? "#f59e0b" : "#e8e8f0";
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color }}>
      {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
      {String(elapsed % 60).padStart(2, "0")}
    </span>
  );
}

/** Small two-line timestamp cell */
function TimestampCell({ date, label, color = "#22c55e" }) {
  if (!date) return <span style={{ color: "#444", fontSize: 11 }}>—</span>;
  const d = new Date(date);
  const datePart = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
  const timePart = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
  return (
    <div style={{ lineHeight: 1.5 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color }}>{timePart}</div>
      <div style={{ fontSize: 10, color: "#555" }}>{datePart}</div>
    </div>
  );
}

export default function AdminDashboard({ userId, onToast }) {
  const { alerts, stats } = useAlerts();
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(null);
  const [showMap, setShowMap] = useState(true); // ← NEW
  const prevCount = useRef(0);

  useEffect(() => {
    if (alerts.length > prevCount.current && prevCount.current > 0) {
      const latest = alerts[0];
      if (latest.status === "active") {
        onToast(`${latest.type} at ${latest.location}`, "critical");
      }
    }
    prevCount.current = alerts.length;
  }, [alerts]);

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.status === filter);

  const activeCount   = alerts.filter((a) => a.status === "active").length;
  const ackCount      = alerts.filter((a) => a.status === "acknowledged").length;
  const resolvedCount = alerts.filter((a) => a.status === "resolved").length;

  const handleAck = async (alert) => {
    setLoading(alert.docId);
    try {
      await acknowledgeAlert(alert.docId, userId || "admin_01", "Admin");
      onToast(`${alert.id} acknowledged`, "warn");
    } catch (err) {
      onToast("Failed: " + err.message, "critical");
    }
    setLoading(null);
  };

  const handleResolve = async (alert) => {
    setLoading(alert.docId);
    try {
      await resolveAlert(alert.docId, "admin_01");
      onToast(`${alert.id} resolved`, "success");
    } catch (err) {
      onToast("Failed: " + err.message, "critical");
    }
    setLoading(null);
  };

  // ── NEW: when admin clicks a room pin on the map ─────────────────────────
  // Finds the alert for that room and acknowledges / resolves it in one click.
  const handleRoomClick = async (roomId) => {
    const alert = alerts.find((a) => String(a.location) === String(roomId));
    if (!alert) return;
    if (alert.status === "active")       await handleAck(alert);
    if (alert.status === "acknowledged") await handleResolve(alert);
  };

  // ── NEW: build the alerts array the map expects ──────────────────────────
  // HotelFloorMap needs { roomNumber, status }. Your alerts use `location`
  // as the room identifier, so we remap here.
  const mapAlerts = alerts.map((a) => ({
    roomNumber: String(a.location),
    status:     a.status,
  }));

  /* ── filter bar ── */
  const filterBtnStyle = (val) => ({
    padding: "6px 16px",
    borderRadius: 8,
    border: "1px solid",
    borderColor: filter === val ? "#818cf8" : "#2a2a3a",
    background: filter === val ? "rgba(129,140,248,0.12)" : "transparent",
    color: filter === val ? "#818cf8" : "#555",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
  });

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Active",       value: activeCount,   color: "#ff2d55" },
          { label: "Acknowledged", value: ackCount,      color: "#f59e0b" },
          { label: "Resolved",     value: resolvedCount, color: "#22c55e" },
          { label: "Avg Response", value: stats?.avgResponseTime ? stats.avgResponseTime + "s" : "--", color: "#818cf8" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#12121a", border: "1px solid #1a1a26", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 10, color: "#555" }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── NEW: Live Floor Map ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        {/* Map header with toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e8e8f0", fontFamily: "'JetBrains Mono', monospace" }}>
            🗺️ LIVE FLOOR MAP
          </span>
          <button
            onClick={() => setShowMap((v) => !v)}
            style={{
              padding: "4px 14px",
              borderRadius: 8,
              border: "1px solid #2a2a3a",
              background: showMap ? "rgba(129,140,248,0.12)" : "transparent",
              color: showMap ? "#818cf8" : "#555",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {showMap ? "HIDE" : "SHOW"}
          </button>
        </div>

        {showMap && (
          <div style={{
            background: "#12121a",
            border: "1px solid #1a1a26",
            borderRadius: 12,
            padding: 20,
          }}>
            <HotelFloorMap
              alerts={mapAlerts}
              onRoomClick={handleRoomClick}
              floorLabel="Floor 1"
            />
          </div>
        )}
      </div>
      {/* ── END Live Floor Map ──────────────────────────────────────────── */}

      {/* ── Filter bar ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "active", "acknowledged", "resolved"].map((f) => (
          <button key={f} style={filterBtnStyle(f)} onClick={() => setFilter(f)}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1a26" }}>
              {["ID", "Type", "Location", "Status", "Elapsed", "📤 Sent At", "✅ Resolved At", "Actions"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#555", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#444" }}>No alerts</td>
              </tr>
            )}

            {filtered.map((alert) => {
              const tc = TYPE_CFG[alert.type] || TYPE_CFG.other;
              const sc = STATUS_CFG[alert.status] || STATUS_CFG.active;
              const isLoading = loading === alert.docId;

              return (
                <tr
                  key={alert.docId}
                  style={{
                    borderBottom: "1px solid #0e0e18",
                    background: alert.status === "active" ? "rgba(255,45,85,0.03)" : "transparent",
                    transition: "background 0.2s",
                  }}
                >
                  {/* ID */}
                  <td style={{ padding: "12px 12px" }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#666" }}>{alert.id}</span>
                  </td>

                  {/* Type */}
                  <td style={{ padding: "12px 12px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: tc.bg, border: `1px solid ${tc.border}`,
                      borderRadius: 6, padding: "3px 8px", fontSize: 12, color: tc.color,
                    }}>
                      {tc.icon} {alert.type}
                    </span>
                  </td>

                  {/* Location */}
                  <td style={{ padding: "12px 12px", color: "#e8e8f0" }}>{alert.location}</td>

                  {/* Status */}
                  <td style={{ padding: "12px 12px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      background: sc.bg, border: `1px solid ${sc.border}`,
                      borderRadius: 6, padding: "3px 10px", fontSize: 11,
                      color: sc.color, fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
                      {sc.label}
                    </span>
                  </td>

                  {/* Elapsed */}
                  <td style={{ padding: "12px 12px" }}>
                    {alert.status === "resolved"
                      ? <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#22c55e" }}>{alert.responseTimeSeconds}s</span>
                      : <ElapsedTimer startTime={alert.triggeredAt} />}
                  </td>

                  {/* 📤 Sent At */}
                  <td style={{ padding: "12px 12px" }}>
                    <TimestampCell date={alert.triggeredAt} color="#ff2d55" />
                  </td>

                  {/* ✅ Resolved At */}
                  <td style={{ padding: "12px 12px" }}>
                    {alert.status === "resolved"
                      ? <TimestampCell date={alert.resolvedAt} color="#22c55e" />
                      : <span style={{ color: "#333", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>pending</span>}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 12px" }}>
                    {alert.status === "active" && (
                      <button
                        onClick={() => handleAck(alert)}
                        disabled={isLoading}
                        style={{
                          background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
                          color: "#f59e0b", borderRadius: 7, padding: "5px 14px", cursor: "pointer",
                          fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {isLoading ? "..." : "Ack"}
                      </button>
                    )}
                    {alert.status === "acknowledged" && (
                      <button
                        onClick={() => handleResolve(alert)}
                        disabled={isLoading}
                        style={{
                          background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
                          color: "#22c55e", borderRadius: 7, padding: "5px 14px", cursor: "pointer",
                          fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {isLoading ? "..." : "Resolve"}
                      </button>
                    )}
                    {alert.status === "resolved" && (
                      <span style={{ color: "#22c55e", fontSize: 16 }}>✓</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
