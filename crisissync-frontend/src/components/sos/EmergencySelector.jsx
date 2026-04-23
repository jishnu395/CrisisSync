const TYPES = [
  { key: "fire", label: "Fire", icon: "🔥", color: "#ff2d55" },
  { key: "medical", label: "Medical", icon: "💉", color: "#f59e0b" },
  { key: "security", label: "Security", icon: "🛡️", color: "#818cf8" },
  { key: "other", label: "Other", icon: "⚠️", color: "#888" },
];

export default function EmergencySelector({ selected, onSelect }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, maxWidth: 500, width: "100%" }}>
      {TYPES.map((t) => (
        <button key={t.key} onClick={() => onSelect(t.key)} style={{
          padding: "16px 8px", borderRadius: 12,
          border: "1px solid " + (selected === t.key ? t.color + "50" : "#2a2a3a"),
          background: selected === t.key ? t.color + "15" : "#1a1a26",
          cursor: "pointer", textAlign: "center", transition: "all 0.2s",
        }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>{t.icon}</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: selected === t.key ? t.color : "#666" }}>{t.label}</div>
        </button>
      ))}
    </div>
  );
}