const API_URL = "https://crisissync-backend-5i57.onrender.com";

export async function createAlert({ type, location, floor, triggeredBy }) {
  const res = await fetch(`${API_URL}/api/sos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, location, triggeredBy }),
  });
  const data = await res.json();
  // normalize to match your frontend's expected shape
  return {
    id: data.id,
    docId: data.id,
    type: data.type,
    location: data.location,
    floor: floor || "N/A",
    status: data.status,
    triggeredBy: data.triggeredBy,
    triggeredAt: new Date(data.timestamp),
    acknowledgedAt: null,
    acknowledgedBy: null,
    resolvedAt: null,
    responseTimeSeconds: null,
    assignedStaff: null,
    assignedStaffName: null,
  };
}

export async function getAlerts() {
  const res = await fetch(`${API_URL}/api/incidents`);
  const data = await res.json();
  return data.map(a => ({
    id: a.id,
    docId: a.id,
    type: a.type,
    location: a.location,
    floor: a.floor || "N/A",
    status: a.status,
    triggeredBy: a.triggeredBy,
    triggeredAt: a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp),
    acknowledgedAt: null,
    acknowledgedBy: a.acknowledgedBy || null,
    resolvedAt: null,
    responseTimeSeconds: a.responseTime || null,
    assignedStaff: null,
    assignedStaffName: null,
  }));
}

export async function acknowledgeAlert(docId, staffId, staffName) {
  await fetch(`${API_URL}/api/incidents/${docId}/acknowledge`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ acknowledgedBy: staffId }),
  });
}

export async function resolveAlert(docId, resolvedBy) {
  const res = await fetch(`${API_URL}/api/incidents/${docId}/resolve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resolvedBy }),
  });
  return await res.json();
}

export function subscribeToAlerts({ callback }) {
  const interval = setInterval(async () => {
    const alerts = await getAlerts();
    callback(alerts);
  }, 3000);
  return () => clearInterval(interval);
}

export function subscribeToStats(callback) {
  const interval = setInterval(async () => {
    const alerts = await getAlerts();
    const resolved = alerts.filter(a => a.status === "resolved");
    callback({
      resolvedAlerts: resolved.length,
      avgResponseTime: resolved.length
        ? Math.round(resolved.reduce((s, a) => s + (a.responseTimeSeconds || 0), 0) / resolved.length)
        : 0,
    });
  }, 3000);
  return () => clearInterval(interval);
}

export async function subscribeToLogs() {
  return () => {};
}
