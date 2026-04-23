import { useState, useEffect } from "react";
import { subscribeToAlerts, subscribeToStats } from "../services/alertService";

export function useAlerts({ floor, status } = {}) {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const unsub1 = subscribeToAlerts({ callback: (data) => {
      let filtered = data;
      if (floor != null) filtered = filtered.filter(a => a.floor === floor);
      if (status != null) filtered = filtered.filter(a => a.status === status);
      setAlerts([...filtered]);
    }});
    const unsub2 = subscribeToStats((data) => { setStats(data); });
    return () => { unsub1(); unsub2(); };
  }, [floor, status]);

  const activeAlerts = alerts.filter(a => a.status === "active" || a.status === " acknowledged");
  return { alerts, activeAlerts, stats };
}