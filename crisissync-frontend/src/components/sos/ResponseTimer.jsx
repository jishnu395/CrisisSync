import { useState, useEffect } from "react";

export default function ResponseTimer({ startTime, color }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const ms = startTime?.getTime?.() || Date.now();
    const interval = setInterval(() => setSeconds(Math.round((Date.now() - ms) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500, color: color || "#e8e8f0" }}>{mins}:{secs}</span>;
}