import { useAlerts } from "../../hooks/useAlerts";

export default function StaffDashboard() {
  const { activeAlerts } = useAlerts();

  return (
    <div style={{ padding: 20 }}>
      <h2>Staff Dashboard</h2>

      {activeAlerts.map((a) => (
        <div key={a.docId} style={{ marginBottom: 10 }}>
          {a.type} - {a.location}
        </div>
      ))}
    </div>
  );
}