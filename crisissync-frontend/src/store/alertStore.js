const listeners = new Set();
let state = { alerts: [], stats: null };

export function getState() { return state; }

export function subscribe(callback) {
  listeners.add(callback);
  callback(state);
  return () => listeners.delete(callback);
}

function notifyAll() {
  listeners.forEach(fn => fn(state));
}

export function addAlert(alert) {
  state.alerts.unshift(alert);
  recalcStats();
  notifyAll();
}

export function updateAlert(docId, updates) {
  state.alerts = state.alerts.map(a => a.docId === docId ? { ...a, ...updates } : a);
  recalcStats();
  notifyAll();
}

function recalcStats() {
  const resolved = state.alerts.filter(a => a.status === "resolved");
  const withTime = resolved.filter(a => a.responseTimeSeconds);
  const avg = withTime.length > 0
    ? Math.round(withTime.reduce((s, a) => s + a.responseTimeSeconds, 0) / withTime.length)
    : 0;
  state.stats = {
    totalAlerts: state.alerts.length,
    activeAlerts: state.alerts.filter(a => a.status === "active").length,
    resolvedAlerts: resolved.length,
    avgResponseTime: avg,
  };
}