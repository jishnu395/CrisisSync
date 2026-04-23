const COLORS = { critical: "#ff2d55", warn: "#f59e0b", success: "#22c55e", info: "#818cf8" };

export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8, maxWidth: 340 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          padding: "12px 16px", borderRadius: 10, fontSize: 13,
          background: "#1a1a26", borderLeft: "3px solid " + (COLORS[t.type] || COLORS.info),
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          animation: t.removing ? "slideOut 0.3s ease-in forwards" : "slideIn 0.4s ease-out",
        }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}