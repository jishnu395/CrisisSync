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