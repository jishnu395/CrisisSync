export default function ConfirmModal({ type, room, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#12121a", border: "1px solid #2a2a3a", borderRadius: 16, padding: 32, maxWidth: 420, width: "90%", animation: "modalIn 0.4s ease-out",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%", background: "rgba(255,45,85,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", fontSize: 28, color: "#ff2d55",
        }}>!</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 12 }}>Confirm Emergency Alert</h3>
        <p style={{ fontSize: 13, color: "#888", textAlign: "center", marginBottom: 4 }}>
          Type: <span style={{ fontWeight: 600, color: "#ff2d55", textTransform: "capitalize" }}>{type}</span>
        </p>
        <p style={{ fontSize: 13, color: "#888", textAlign: "center", marginBottom: 20 }}>
          Location: <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>Room {room}</span>
        </p>
        <p style={{ fontSize: 11, color: "#555", textAlign: "center", marginBottom: 24 }}>
          This will immediately notify hotel staff and emergency services.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: 12, borderRadius: 10, border: "1px solid #2a2a3a",
            background: "#1a1a26", color: "#888", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: 12, borderRadius: 10, border: "none",
            background: "#ff2d55", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 20px rgba(255,45,85,0.3)",
          }}>Confirm SOS</button>
        </div>
      </div>
    </div>
  );
}