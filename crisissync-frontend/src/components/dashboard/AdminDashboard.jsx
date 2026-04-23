import React, { useState, useEffect, useRef } from "react";
import { acknowledgeAlert, resolveAlert } from "../../services/alertService";
import { useAlerts } from "../../hooks/useAlerts";

const TYPE_CFG = {
  fire: { icon: "🔥", color: "#ff2d55", bg: "rgba(255,45,85,0.08)", border: "rgba(255,45,85,0.15)" },
  medical: { icon: "💉", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
  security: { icon: "🛡️", color: "#818cf8", bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.15)" },
  other: { icon: "⚠️", color: "#888", bg: "rgba(136,136,136,0.08)", border: "rgba(136,136,136,0.15)" },
};

const STATUS_CFG = {
  active: { label: "ACTIVE", color: "#ff2d55", bg: "rgba(255,45,85,0.08)", dot: "#ff2d55", border: "rgba(255,45,85,0.15)" },
  acknowledged: { label: "ACK", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", dot: "#f59e0b", border: "rgba(245,158,11,0.15)" },
  resolved: { label: "RESOLVED", color: "#22c55e", bg: "rgba(34,197,94,0.08)", dot: "#22c55e", border: "rgba(34,197,94,0.15)" },
};

function ElapsedTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const ms = startTime ? new Date(startTime).getTime() : Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - ms) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const color =
    elapsed > 60 ? "#ff2d55" : elapsed > 30 ? "#f59e0b" : "#e8e8f0";

  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color }}>
      {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
      {String(elapsed % 60).padStart(2, "0")}
    </span>
  );
}

export default function AdminDashboard({ userId, onToast }) {
  const { alerts, stats } = useAlerts();
  const [filter, setFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(null);
  const prevCount = useRef(0);
  const tableRef = useRef(null);

  useEffect(() => {
    if (alerts.length > prevCount.current && prevCount.current > 0) {
      const latest = alerts[0];
      if (latest.status === "active") {
        setExpandedRow(latest.docId);
        onToast(`${latest.type} at ${latest.location}`, "critical");
      }
    }
    prevCount.current = alerts.length;
  }, [alerts]);

  const filtered =
    filter === "all" ? alerts : alerts.filter((a) => a.status === filter);

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const ackCount = alerts.filter((a) => a.status === "acknowledged").length;
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

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Active", value: activeCount, color: "#ff2d55" },
          { label: "Acknowledged", value: ackCount, color: "#f59e0b" },
          { label: "Resolved", value: resolvedCount, color: "#22c55e" },
          { label: "Avg Response", value: stats?.avgResponseTime ? stats.avgResponseTime + "s" : "--", color: "#818cf8" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#12121a",
            border: "1px solid #1a1a26",
            borderRadius: 12,
            padding: "18px 20px",
          }}>
            <div style={{ fontSize: 10, color: "#555" }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["ID", "Type", "Location", "Status", "Elapsed", "Actions"].map((h) => (
              <th key={h} style={{ padding: 10, textAlign: "left", color: "#555" }}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filtered.map((alert) => {
            const tc = TYPE_CFG[alert.type] || TYPE_CFG.other;
            const sc = STATUS_CFG[alert.status] || STATUS_CFG.active;

            return (
              <tr key={alert.docId}>
                <td>{alert.id}</td>
                <td>{tc.icon} {alert.type}</td>
                <td>{alert.location}</td>
                <td style={{ color: sc.color }}>{sc.label}</td>
                <td>
                  {alert.status === "resolved"
                    ? `${alert.responseTimeSeconds}s`
                    : <ElapsedTimer startTime={alert.triggeredAt} />}
                </td>
                <td>
                  {alert.status === "active" && (
                    <button onClick={() => handleAck(alert)}>Ack</button>
                  )}
                  {alert.status === "acknowledged" && (
                    <button onClick={() => handleResolve(alert)}>Resolve</button>
                  )}
                  {alert.status === "resolved" && "✓"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}