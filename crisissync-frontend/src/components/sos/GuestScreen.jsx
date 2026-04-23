import { useState } from "react";
import EmergencySelector from "./EmergencySelector";
import SOSButton from "./SOSButton";
import ConfirmModal from "./ConfirmModal";
import ResponseTimer from "./ResponseTimer";
import { useAlerts } from "../../hooks/useAlerts";

const TYPE_LABELS = { fire: "Fire", medical: "Medical", security: "Security", other: "Other" };

/** Format a Date → "23 Apr 2025 at 14:07:32" */
function formatDateTime(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const datePart = d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata",
  });
  const timePart = d.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Kolkata",
  });
  return `${datePart} at ${timePart}`;
}

/** Small labelled timestamp badge */
function TimestampBadge({ icon, label, date, color }) {
  const formatted = formatDateTime(date);
  if (!formatted) return null;
  return (
    <div style={{
      display: "inline-flex", flexDirection: "column", alignItems: "center",
      background: `rgba(${color},0.08)`, border: `1px solid rgba(${color},0.2)`,
      borderRadius: 10, padding: "10px 18px", minWidth: 200,
    }}>
      <span style={{ fontSize: 11, color: `rgba(${color},1)`, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4, letterSpacing: 1 }}>
        {icon} {label}
      </span>
      <span style={{ fontSize: 13, color: "#e8e8f0", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
        {formatted}
      </span>
    </div>
  );
}

export default function GuestScreen({ onTrigger, userId }) {
  const [type, setType] = useState("fire");
  const [room, setRoom] = useState("101");
  const [showConfirm, setShowConfirm] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [triggeredAlertId, setTriggeredAlertId] = useState(null);

  const { activeAlerts } = useAlerts();
  const myAlert = activeAlerts.find((a) => a.triggeredBy === userId && a.id === triggeredAlertId);

  const handleConfirm = async () => {
    setShowConfirm(false);
    setTriggered(true);
    try {
      const result = await onTrigger({
        type,
        location: "Room " + room,
        floor: parseInt(room.charAt(0)),
        triggeredBy: userId,
      });
      setTriggeredAlertId(result.id);
    } catch (err) {
      setTriggered(false);
    }
  };

  const isAck      = myAlert?.status === "acknowledged";
  const isResolved = myAlert?.status === "resolved";

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "calc(100vh - 140px)", padding: 24,
    }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, animation: "fadeUp 0.6s ease both" }}>
        Emergency SOS
      </h2>
      <p style={{ fontSize: 14, color: "#666", marginBottom: 32, animation: "fadeUp 0.6s ease 0.1s both" }}>
        Press the button if you need immediate help
      </p>

      {!triggered ? (
        <>
          <div style={{ animation: "fadeUp 0.6s ease 0.2s both" }}>
            <EmergencySelector selected={type} onSelect={setType} />
          </div>
          <div style={{ marginBottom: 40, animation: "fadeUp 0.6s ease 0.3s both" }}>
            <label style={{
              display: "block", fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
              color: "#555", textAlign: "center", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1,
            }}>Your Room</label>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              style={{
                background: "#1a1a26", border: "1px solid #2a2a3a", borderRadius: 10,
                padding: "10px 20px", color: "#e8e8f0", fontSize: 14, minWidth: 200,
                textAlign: "center", outline: "none",
              }}
            >
              <optgroup label="Floor 1">
                <option value="101">Room 101</option><option value="102">Room 102</option>
                <option value="103">Room 103</option><option value="104">Room 104</option>
              </optgroup>
              <optgroup label="Floor 2">
                <option value="201">Room 201</option><option value="202">Room 202</option>
                <option value="203">Room 203</option>
              </optgroup>
              <optgroup label="Floor 3">
                <option value="301">Room 301</option><option value="302">Room 302</option>
              </optgroup>
            </select>
          </div>
          <div style={{ animation: "fadeUp 0.6s ease 0.4s both" }}>
            <SOSButton onPress={() => setShowConfirm(true)} />
          </div>
          <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#444", marginTop: 20, animation: "fadeUp 0.6s ease 0.5s both" }}>
            Tap to send emergency alert
          </p>
        </>
      ) : (
        <div style={{ textAlign: "center", animation: "fadeUp 0.5s ease" }}>

          {/* ── RESOLVED ── */}
          {isResolved ? (
            <div style={{ animation: "scaleIn 0.4s ease" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", fontSize: 36, color: "#22c55e",
              }}>✓</div>
              <p style={{ fontSize: 20, fontWeight: 600, color: "#22c55e", marginBottom: 8 }}>
                Emergency Resolved
              </p>
              <p style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>
                Response time:{" "}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#22c55e" }}>
                  {myAlert.responseTimeSeconds}s
                </span>
              </p>

              {/* Timestamps */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <TimestampBadge
                  icon="📤"
                  label="SOS SENT"
                  date={myAlert.triggeredAt}
                  color="255,45,85"
                />
                <TimestampBadge
                  icon="✅"
                  label="RESOLVED"
                  date={myAlert.resolvedAt}
                  color="34,197,94"
                />
              </div>
            </div>

          /* ── ACKNOWLEDGED ── */
          ) : isAck ? (
            <div style={{ animation: "scaleIn 0.4s ease" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%", background: "rgba(245,158,11,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", fontSize: 30, color: "#f59e0b",
                animation: "sosPulse 1.5s ease-in-out infinite",
              }}>🏃</div>
              <p style={{ fontSize: 20, fontWeight: 600, color: "#f59e0b", marginBottom: 8 }}>
                Help is on the way
              </p>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
                {myAlert.assignedStaffName} is responding to Room {room.replace("Room ", "")}
              </p>
              <ResponseTimer startTime={myAlert.triggeredAt} color="#f59e0b" />

              {/* Sent timestamp */}
              <div style={{ marginTop: 16 }}>
                <TimestampBadge
                  icon="📤"
                  label="SOS SENT"
                  date={myAlert.triggeredAt}
                  color="255,45,85"
                />
              </div>
            </div>

          /* ── ACTIVE / PENDING ── */
          ) : (
            <div style={{ animation: "scaleIn 0.4s ease" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%", background: "rgba(255,45,85,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", fontSize: 30, color: "#ff2d55",
                animation: "sosPulse 1.5s ease-in-out infinite",
              }}>📡</div>
              <p style={{ fontSize: 20, fontWeight: 600, color: "#ff2d55", marginBottom: 8 }}>
                Alert Sent
              </p>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
                Notifying hotel staff...
              </p>
              <ResponseTimer startTime={myAlert?.triggeredAt || new Date()} color="#ff2d55" />

              {/* Sent timestamp */}
              <div style={{ marginTop: 16 }}>
                <TimestampBadge
                  icon="📤"
                  label="SOS SENT"
                  date={myAlert?.triggeredAt || new Date()}
                  color="255,45,85"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {showConfirm && (
        <ConfirmModal
          type={TYPE_LABELS[type]}
          room={room}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
