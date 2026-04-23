export default function SOSButton({ onPress }) {
  return (
    <button onClick={onPress} style={{
      width: 170, height: 170, borderRadius: "50%", border: "4px solid #ff2d55",
      background: "radial-gradient(circle, #ff2d55 0%, rgba(255,45,85,0.6) 50%, transparent 70%)",
      color: "white", fontSize: 30, fontWeight: 700, cursor: "pointer",
      fontFamily: "'JetBrains Mono', monospace", letterSpacing: 6,
      boxShadow: "0 0 40px rgba(255,45,85,0.3)", position: "relative", outline: "none",
    }}>
      SOS
      <span style={{
        position: "absolute", inset: -15, borderRadius: "50%",
        border: "2px solid rgba(255,45,85,0.3)", animation: "sosRing 2s ease-out infinite",
      }} />
      <span style={{
        position: "absolute", inset: -30, borderRadius: "50%",
        border: "1px solid rgba(255,45,85,0.15)", animation: "sosRing 2s ease-out 0.5s infinite",
      }} />
    </button>
  );
}