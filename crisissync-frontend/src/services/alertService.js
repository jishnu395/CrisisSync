import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  getDoc,
} from "firebase/firestore";

const COLLECTION = "alerts";

/** Safely convert any Firestore value → JS Date (or null) */
function parseDate(value) {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/** Map a Firestore doc snapshot → clean alert object */
function docToAlert(docSnap) {
  const d = docSnap.data();
  return {
    docId:               docSnap.id,
    id:                  d.id              || docSnap.id,
    type:                d.type            || "other",
    location:            d.location        || "Unknown",
    floor:               d.floor           || "N/A",
    status:              d.status          || "active",
    triggeredBy:         d.triggeredBy     || null,
    acknowledgedBy:      d.acknowledgedBy  || null,
    triggeredAt:         parseDate(d.triggeredAt) || parseDate(d.timestamp),
    acknowledgedAt:      parseDate(d.acknowledgedAt),
    resolvedAt:          parseDate(d.resolvedAt),
    responseTimeSeconds: d.responseTimeSeconds || null,
    resolutionNote:      d.resolutionNote       || null,
  };
}

/** Subscribe to all alerts — accepts { callback } object to match useAlerts.js */
export function subscribeToAlerts({ callback } = {}) {
  const q = query(collection(db, COLLECTION), orderBy("triggeredAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(docToAlert);
    if (callback) callback(alerts);
  });
}

/** Subscribe to computed stats derived from the alerts collection */
export function subscribeToStats(callback) {
  const q = query(collection(db, COLLECTION), orderBy("triggeredAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(docToAlert);
    const resolved = alerts.filter(a => a.status === "resolved" && a.responseTimeSeconds);
    const avgResponseTime = resolved.length
      ? Math.round(resolved.reduce((sum, a) => sum + a.responseTimeSeconds, 0) / resolved.length)
      : null;
    if (callback) callback({
      total:        alerts.length,
      active:       alerts.filter(a => a.status === "active").length,
      acknowledged: alerts.filter(a => a.status === "acknowledged").length,
      resolved:     resolved.length,
      avgResponseTime,
    });
  });
}

/** Trigger a new SOS alert */
export async function createAlert(payload) {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...payload,
    status:      "active",
    triggeredAt: serverTimestamp(),
  });
  return ref.id;
}

/** Acknowledge an alert */
export async function acknowledgeAlert(docId, userId, userName) {
  await updateDoc(doc(db, COLLECTION, docId), {
    status:         "acknowledged",
    acknowledgedBy: userName || userId,
    acknowledgedAt: serverTimestamp(),
  });
}

/** Resolve an alert */
export async function resolveAlert(docId, userId, note) {
  const alertRef = doc(db, COLLECTION, docId);
  const snap     = await getDoc(alertRef);
  const data     = snap.data();
  const sentAt   = parseDate(data?.triggeredAt || data?.timestamp);
  const responseTimeSeconds = sentAt
    ? Math.round((Date.now() - sentAt.getTime()) / 1000)
    : null;

  await updateDoc(alertRef, {
    status:              "resolved",
    resolvedBy:          userId,
    resolvedAt:          serverTimestamp(),
    resolutionNote:      note || null,
    responseTimeSeconds,
  });
}
