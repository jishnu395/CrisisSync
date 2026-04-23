const API_URL = "https://crisissync-backend-5i57.onrender.com";

export async function createAlert({ type, location, floor, triggeredBy }) {
  const res = await fetch(`${API_URL}/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, location, floor, triggeredBy }),
  });
  return await res.json();
}

export async function acknowledgeAlert(docId, staffId, staffName) {
  await fetch(`${API_URL}/alerts/${docId}/acknowledge`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ staffId, staffName }),
  });
}

export async function resolveAlert(docId, resolvedBy) {
  const res = await fetch(`${API_URL}/alerts/${docId}/resolve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resolvedBy }),
  });
  return await res.json();
}

export async function getAlerts() {
  const res = await fetch(`${API_URL}/alerts`);
  return await res.json();
}

export function subscribeToAlerts({ callback }) {
  // Poll the backend every 3 seconds
  const interval = setInterval(async () => {
    const alerts = await getAlerts();
    callback(alerts);
  }, 3000);

  return () => clearInterval(interval); // cleanup
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
