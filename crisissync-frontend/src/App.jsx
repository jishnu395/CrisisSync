import { useState, useEffect, useCallback } from "react";
import { createAlert } from "./services/alertService";
import { loginAnonymously } from "./services/firebase";
import { useAlerts } from "./hooks/useAlerts";
import { useToast } from "./hooks/useToast";
import ToastContainer from "./components/common/Toast";
import Landing from "./components/common/Landing";
import GuestScreen from "./components/sos/GuestScreen";

export default function App() {
  const [page, setPage] = useState("landing");
  const [role, setRole] = useState("guest");
  const [userId, setUserId] = useState("guest-" + Date.now());
  const [ready, setReady] = useState(true);
  const { toasts, show } = useToast();
  const { activeAlerts, stats } = useAlerts();

  // Try Firebase login in background — don't block the page
  useEffect(() => {
    loginAnonymously().then((uid) => {
      setUserId(uid);
    }).catch(() => {});
  }, []);

  const handleEnter = useCallback(() => {
    setPage("dashboard");
  }, []);

  const handleSOS = useCallback(
    async (payload) => {
      try {
        const result = await createAlert({ ...payload, triggeredBy: userId });
        show("SOS sent — " + payload.type + " at " + payload.location, "critical");
        return result;
      } catch (err) {
        show("SOS failed: " + err.message, "critical");
        throw err;
      }
    },
    [userId, show]
  );

  // Landing page — always show immediately
  if (page === "landing") {
    return <Landing onEnter={handleEnter} />;
  }

  // Dashboard
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(255,45,85,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,45,85,0.025) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      <div style={{
        position: "fixed", top: -200, right: -100, width: 500, height: 500,
        borderRadius: "50%", background: "#ff2d55", filter: "blur(150px)",
        opacity: 0.08, pointerEvents: "none", animation: "glowBreathe 8s ease-in-out infinite",
      }} />

      <ToastContainer toasts={toasts} />

      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(18,18,26,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #2a2a3a", padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setPage("landing")} style={{
            width: 36, height: 36, borderRadius: 8, background: "#ff2d55",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "bold", fontSize: 14, color: "white", border: "none", cursor: "pointer",
          }}>CS</button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>CrisisSync</div>
            <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: "#555", letterSpacing: 2 }}>EMERGENCY COORDINATION</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {["admin", "staff", "guest", "responder"].map((r) => (
            <button key={r} onClick={() => setRole(r)} style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500,
              border: "1px solid transparent", cursor: "pointer", textTransform: "capitalize",
              background: role === r ? "rgba(255,45,85,0.1)" : "transparent",
              color: role === r ? "#ff2d55" : "#666",
              borderColor: role === r ? "rgba(255,45,85,0.2)" : "transparent",
            }}>{r}</button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#30d158", boxShadow: "0 0 8px rgba(48,209,88,0.4)" }} />
          <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#30d158" }}>LIVE</span>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 1 }}>
        {role === "guest" && <GuestScreen onTrigger={handleSOS} userId={userId} />}

        {role === "admin" && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Active Alerts", value: activeAlerts.length, color: "#ff2d55" },
                { label: "Avg Response", value: stats?.avgResponseTime ? stats.avgResponseTime + "s" : "--", color: "#ff9500" },
                { label: "Resolved", value: stats?.resolvedAlerts ?? 0, color: "#30d158" },
                { label: "Staff Online", value: 12, color: "#5ac8fa" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#1a1a26", border: "1px solid #2a2a3a", borderRadius: 12, padding: 20, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                  <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 30, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#666", marginBottom: 12 }}>
              <span style={{ color: "#ff2d55", marginRight: 8 }}>●</span>Live Alerts
            </h3>
            {activeAlerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#444" }}>
                <div style={{ fontSize: 32, marginBottom: 8, color: "#30d158" }}>✓</div>
                <p style={{ fontSize: 13 }}>All clear. Trigger an SOS from the Guest tab.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activeAlerts.map((a) => {
                  const colors = { fire: "#ff2d55", medical: "#ff9500", security: "#5ac8fa", other: "#888" };
                  const icons = { fire: "🔥", medical: "💉", security: "🛡️", other: "⚠️" };
                  const c = colors[a.type] || "#888";
                  return (
                    <div key={a.docId} style={{ background: "#1a1a26", border: "1px solid #2a2a3a", borderLeft: "3px solid " + c, borderRadius: 10, padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{icons[a.type] || "⚠️"}</span>
                          <span style={{ fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>{a.type}</span>
                          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#555" }}>{a.id}</span>
                        </div>
                        <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", padding: "2px 8px", borderRadius: 10, background: c + "15", color: c }}>{a.status.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        📍 {a.location} — Floor {a.floor}
                        {a.assignedStaffName && <span style={{ color: "#ff9500", marginLeft: 12 }}>👤 {a.assignedStaffName}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {role === "staff" && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Staff Response</h2>
                <p style={{ fontSize: 13, color: "#555", marginTop: 4 }}>Alerts requiring attention</p>
              </div>
              <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, background: "rgba(90,200,250,0.1)", color: "#5ac8fa", border: "1px solid rgba(90,200,250,0.2)" }}>Staff — Floor 1</span>
            </div>
            {activeAlerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 80, color: "#444" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>☕</div>
                <p style={{ fontSize: 13 }}>No pending assignments. Standing by.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {activeAlerts.map((a) => {
                  const colors = { fire: "#ff2d55", medical: "#ff9500", security: "#5ac8fa", other: "#888" };
                  const icons = { fire: "🔥", medical: "💉", security: "🛡️", other: "⚠️" };
                  const c = colors[a.type] || "#888";
                  return (
                    <div key={a.docId} style={{ background: "#1a1a26", border: "1px solid #2a2a3a", borderTop: "3px solid " + c, borderRadius: 12, padding: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: c + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icons[a.type] || "⚠️"}</div>
                        <div>
                          <p style={{ fontWeight: 600, textTransform: "capitalize" }}>{a.type} Emergency</p>
                          <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#555" }}>{a.id}</p>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>📍 {a.location} — Floor {a.floor}</p>
                      <button style={{ width: "100%", padding: 10, borderRadius: 10, border: "none", background: "#30d158", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>✓ Mark Resolved</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {role === "responder" && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Emergency Dispatch</h2>
                <p style={{ fontSize: 13, color: "#555", marginTop: 4 }}>Incoming from CrisisSync network</p>
              </div>
              <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, background: "rgba(255,149,0,0.1)", color: "#ff9500", border: "1px solid rgba(255,149,0,0.2)" }}>🚑 Responder</span>
            </div>
            {activeAlerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 80, color: "#444" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📡</div>
                <p style={{ fontSize: 13 }}>Monitoring. No dispatches yet.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                {activeAlerts.map((a) => {
                  const colors = { fire: "#ff2d55", medical: "#ff9500", security: "#5ac8fa", other: "#888" };
                  const icons = { fire: "🔥", medical: "💉", security: "🛡️", other: "⚠️" };
                  const c = colors[a.type] || "#888";
                  return (
                    <div key={a.docId} style={{ background: "#1a1a26", border: "1px solid #2a2a3a", borderTop: "3px solid " + c, borderRadius: 12, padding: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: c + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{icons[a.type] || "⚠️"}</div>
                        <div>
                          <p style={{ fontWeight: 700, textTransform: "capitalize" }}>{a.type} Emergency</p>
                          <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#555" }}>{a.id}</p>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "#888", display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                        <span>📍 {a.location} — Floor {a.floor}</span>
                        <span>🕐 {a.triggeredAt?.toLocaleTimeString()}</span>
                      </div>
                      <button style={{ width: "100%", padding: 10, borderRadius: 10, border: "none", background: "#30d158", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>✓ Mark Resolved</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid #2a2a3a", padding: "16px", textAlign: "center" }}>
        <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#444", letterSpacing: 2, textTransform: "uppercase" }}>CrisisSync v1.0 — Team Code Crafters — Cepheus 2.0</p>
      </footer>
    </div>
  );
}