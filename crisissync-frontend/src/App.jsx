import { useState, useEffect, useCallback } from "react";
import { createAlert, resolveAlert, acknowledgeAlert } from "./services/alertService";
import { loginAnonymously } from "./services/firebase";
import { useAlerts } from "./hooks/useAlerts";
import { useToast } from "./hooks/useToast";
import ToastContainer from "./components/common/Toast";
import Landing from "./components/common/Landing";
import GuestScreen from "./components/sos/GuestScreen";

// Resolution Modal
function ResolveModal({ alert, onConfirm, onCancel }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const icons = { fire: "🔥", medical: "💉", security: "🛡️", other: "⚠️" };
  const colors = { fire: "#ff2d55", medical: "#ff9500", security: "#5ac8fa", other: "#888" };
  const c = colors[alert.type] || "#888";

  const steps = {
    fire: ["Fire extinguished", "Area evacuated", "Equipment checked", "All clear given"],
    medical: ["Patient assessed", "First aid provided", "Emergency services called", "Patient stable"],
    security: ["Threat neutralized", "Area secured", "Authorities notified", "All clear confirmed"],
    other: ["Situation assessed", "Action taken", "Area cleared", "Resolved"],
  };
  const suggestions = steps[alert.type] || steps.other;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        background: "#1a1a26", border: "1px solid #2a2a3a", borderTop: `3px solid ${c}`,
        borderRadius: 16, padding: 28, width: "100%", maxWidth: 480,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: c + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
            {icons[alert.type] || "⚠️"}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, textTransform: "capitalize" }}>{alert.type} Emergency</p>
            <p style={{ fontSize: 11, color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>📍 {alert.location}</p>
          </div>
        </div>

        <p style={{ fontSize: 12, color: "#888", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>How was it resolved?</p>

        {/* Quick suggestion chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {suggestions.map((s) => (
            <button key={s} onClick={() => setNote(s)} style={{
              padding: "5px 10px", borderRadius: 20, fontSize: 11, cursor: "pointer",
              background: note === s ? c + "25" : "#12121c",
              color: note === s ? c : "#666",
              border: `1px solid ${note === s ? c + "60" : "#2a2a3a"}`,
            }}>{s}</button>
          ))}
        </div>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Describe how the situation was resolved..."
          rows={3}
          style={{
            width: "100%", background: "#12121c", border: "1px solid #2a2a3a",
            borderRadius: 10, padding: "10px 12px", color: "#e8e8f0",
            fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: 11, borderRadius: 10, border: "1px solid #2a2a3a",
            background: "transparent", color: "#666", fontSize: 13, cursor: "pointer",
          }}>Cancel</button>
          <button
            onClick={async () => {
              if (!note.trim()) return;
              setLoading(true);
              await onConfirm(note);
              setLoading(false);
            }}
            disabled={!note.trim() || loading}
            style={{
              flex: 2, padding: 11, borderRadius: 10, border: "none",
              background: note.trim() ? "#30d158" : "#1e3a28",
              color: note.trim() ? "white" : "#444",
              fontSize: 13, fontWeight: 700, cursor: note.trim() ? "pointer" : "not-allowed",
            }}
          >{loading ? "Resolving..." : "✓ Confirm Resolved"}</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("landing");
  const [role, setRole] = useState("guest");
  const [userId, setUserId] = useState("guest-" + Date.now());
  const [resolvingAlert, setResolvingAlert] = useState(null);
  const { toasts, show } = useToast();
  const { alerts, activeAlerts, stats } = useAlerts();

  useEffect(() => {
    loginAnonymously().then((uid) => setUserId(uid)).catch(() => {});
  }, []);

  const handleEnter = useCallback(() => setPage("dashboard"), []);

  const handleSOS = useCallback(async (payload) => {
    try {
      const result = await createAlert({ ...payload, triggeredBy: userId });
      show("SOS sent — " + payload.type + " at " + payload.location, "critical");
      return result;
    } catch (err) {
      show("SOS failed: " + err.message, "critical");
      throw err;
    }
  }, [userId, show]);

  const handleResolve = useCallback(async (docId, note) => {
    try {
      await resolveAlert(docId, userId, note);
      show("✓ Incident resolved", "success");
      setResolvingAlert(null);
    } catch (err) {
      show("Failed to resolve: " + err.message, "critical");
    }
  }, [userId, show]);

  if (page === "landing") return <Landing onEnter={handleEnter} />;

  const colors = { fire: "#ff2d55", medical: "#ff9500", security: "#5ac8fa", other: "#888" };
  const icons = { fire: "🔥", medical: "💉", security: "🛡️", other: "⚠️" };
  const resolvedAlerts = alerts.filter(a => a.status === "resolved");

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`
        @media (max-width: 600px) {
          .header-roles { display: none !important; }
          .mobile-roles { display: flex !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .staff-grid { grid-template-columns: 1fr !important; }
          .header-inner { padding: 10px 14px !important; }
        }
        @keyframes glowBreathe { 0%,100%{opacity:.08} 50%{opacity:.14} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,45,85,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,45,85,0.025) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div style={{ position: "fixed", top: -200, right: -100, width: 500, height: 500, borderRadius: "50%", background: "#ff2d55", filter: "blur(150px)", opacity: 0.08, pointerEvents: "none", animation: "glowBreathe 8s ease-in-out infinite" }} />

      <ToastContainer toasts={toasts} />
      {resolvingAlert && (
        <ResolveModal
          alert={resolvingAlert}
          onConfirm={(note) => handleResolve(resolvingAlert.docId, note)}
          onCancel={() => setResolvingAlert(null)}
        />
      )}

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(18,18,26,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #2a2a3a" }}>
        <div className="header-inner" style={{ padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <button onClick={() => setPage("landing")} style={{ width: 36, height: 36, borderRadius: 8, background: "#ff2d55", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 14, color: "white", border: "none", cursor: "pointer" }}>CS</button>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>CrisisSync</div>
              <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: "#555", letterSpacing: 2 }}>EMERGENCY COORDINATION</div>
            </div>
          </div>

          {/* Desktop roles */}
          <div className="header-roles" style={{ display: "flex", gap: 4 }}>
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

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#30d158", boxShadow: "0 0 8px rgba(48,209,88,0.4)", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#30d158" }}>LIVE</span>
          </div>
        </div>

        {/* Mobile role tabs */}
        <div className="mobile-roles" style={{ display: "none", borderTop: "1px solid #1a1a2a", overflowX: "auto" }}>
          {["admin", "staff", "guest", "responder"].map((r) => (
            <button key={r} onClick={() => setRole(r)} style={{
              flex: 1, padding: "10px 4px", fontSize: 11, fontWeight: 600,
              border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.5,
              background: role === r ? "rgba(255,45,85,0.1)" : "transparent",
              color: role === r ? "#ff2d55" : "#555",
              borderBottom: role === r ? "2px solid #ff2d55" : "2px solid transparent",
            }}>{r}</button>
          ))}
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 1 }}>
        {role === "guest" && <GuestScreen onTrigger={handleSOS} userId={userId} />}

        {/* ADMIN */}
        {role === "admin" && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Active Alerts", value: activeAlerts.length, color: "#ff2d55" },
                { label: "Avg Response", value: stats?.avgResponseTime ? stats.avgResponseTime + "s" : "--", color: "#ff9500" },
                { label: "Resolved", value: resolvedAlerts.length, color: "#30d158" },
                { label: "Staff Online", value: 12, color: "#5ac8fa" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#1a1a26", border: "1px solid #2a2a3a", borderRadius: 12, padding: "16px 20px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                  <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
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
                  const c = colors[a.type] || "#888";
                  return (
                    <div key={a.docId} style={{ background: "#1a1a26", border: "1px solid #2a2a3a", borderLeft: "3px solid " + c, borderRadius: 10, padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{icons[a.type] || "⚠️"}</span>
                          <span style={{ fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>{a.type}</span>
                          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#555" }}>{a.id}</span>
                        </div>
                        <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", padding: "2px 8px", borderRadius: 10, background: c + "15", color: c }}>{a.status.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        📍 {a.location} — Floor {a.floor}
                        {a.acknowledgedBy && <span style={{ color: "#ff9500", marginLeft: 12 }}>👤 {a.acknowledgedBy}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Resolved history */}
            {resolvedAlerts.length > 0 && (
              <>
                <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#666", marginBottom: 12, marginTop: 32 }}>
                  <span style={{ color: "#30d158", marginRight: 8 }}>✓</span>Resolved History
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {resolvedAlerts.map((a) => {
                    const c = colors[a.type] || "#888";
                    return (
                      <div key={a.docId} style={{ background: "#12121c", border: "1px solid #1e1e2e", borderLeft: "3px solid #30d158", borderRadius: 10, padding: 16, opacity: 0.8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span>{icons[a.type] || "⚠️"}</span>
                            <span style={{ fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>{a.type}</span>
                            <span style={{ fontSize: 11, color: "#555" }}>📍 {a.location}</span>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {a.responseTimeSeconds && <span style={{ fontSize: 10, color: "#30d158", fontFamily: "'JetBrains Mono', monospace" }}>⚡ {Math.round(a.responseTimeSeconds)}s</span>}
                            <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, background: "#30d15815", color: "#30d158", fontFamily: "'JetBrains Mono', monospace" }}>RESOLVED</span>
                          </div>
                        </div>
                        {a.resolutionNote && <p style={{ fontSize: 12, color: "#555", marginTop: 8, fontStyle: "italic" }}>"{a.resolutionNote}"</p>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* STAFF */}
        {role === "staff" && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
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
              <div className="staff-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {activeAlerts.map((a) => {
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
                      <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>📍 {a.location} — Floor {a.floor}</p>
                      <p style={{ fontSize: 11, color: "#555", marginBottom: 16 }}>🕐 {a.triggeredAt?.toLocaleTimeString()}</p>

                      {/* Step indicator */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
                        {["Dispatched", "On Site", "Resolved"].map((step, i) => (
                          <div key={step} style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
                            <div style={{ width: "100%", height: 3, borderRadius: 2, background: i === 0 ? c : "#2a2a3a" }} />
                            <span style={{ fontSize: 9, color: i === 0 ? c : "#444", whiteSpace: "nowrap" }}>{step}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setResolvingAlert(a)}
                        style={{ width: "100%", padding: 10, borderRadius: 10, border: "none", background: "#30d158", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                      >✓ Mark Resolved</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RESPONDER */}
        {role === "responder" && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
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
              <div className="staff-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                {activeAlerts.map((a) => {
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

                      {/* Step indicator */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
                        {["Dispatched", "En Route", "On Site", "Resolved"].map((step, i) => (
                          <div key={step} style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                            <div style={{ width: "100%", height: 3, borderRadius: 2, background: i === 0 ? c : "#2a2a3a" }} />
                            <span style={{ fontSize: 8, color: i === 0 ? c : "#444", whiteSpace: "nowrap" }}>{step}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setResolvingAlert(a)}
                        style={{ width: "100%", padding: 10, borderRadius: 10, border: "none", background: "#30d158", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                      >✓ Mark Resolved</button>
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
