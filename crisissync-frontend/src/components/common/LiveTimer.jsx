import { useState, useEffect } from "react";

export function LiveTimer({ triggeredAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = triggeredAt instanceof Date ? triggeredAt : new Date(triggeredAt);
    
    const tick = () => {
      const seconds = Math.floor((Date.now() - start.getTime()) / 1000);
      setElapsed(seconds);
    };

    tick(); // immediate
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [triggeredAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  // Color changes based on urgency
  const color = elapsed < 60 ? "#30d158" : elapsed < 180 ? "#ff9500" : "#ff2d55";
  const label = mins > 0
    ? `${mins}m ${secs.toString().padStart(2, "0")}s`
    : `${secs}s`;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
      color, fontWeight: 700,
      padding: "3px 8px", borderRadius: 20,
      background: color + "15",
      border: `1px solid ${color}30`,
      animation: elapsed >= 180 ? "pulse 1s infinite" : "none",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: color, display: "inline-block",
        boxShadow: `0 0 6px ${color}`,
        animation: "pulse 1.5s infinite",
      }} />
      ⏱ {label}
    </span>
  );
}