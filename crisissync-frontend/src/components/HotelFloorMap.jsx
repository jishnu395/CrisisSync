import React, { useState, useEffect, useMemo } from 'react';
import { useAlerts } from '../hooks/useAlerts';

const HotelFloorMap = () => {
  const { alerts } = useAlerts();
  const [activeFloor, setActiveFloor] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // ✅ Safe time formatter
  const formatTime = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "—";
    }
  };

  // ✅ Auto-switch to floor with newest ACTIVE alert
  useEffect(() => {
    const activeAlerts = alerts.filter(a => a.status === 'active' && a.triggeredAt);

    if (activeAlerts.length > 0) {
      const newest = activeAlerts.sort(
        (a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt)
      )[0];

      if (newest?.floor) {
        setActiveFloor(Number(newest.floor));
      }
    }
  }, [alerts]);

  // ✅ Floor badge counts (FIXED string/number issue)
  const floorAlertCounts = useMemo(() => {
    return {
      1: alerts.filter(a => String(a.floor) === "1" && a.status === 'active').length,
      2: alerts.filter(a => String(a.floor) === "2" && a.status === 'active').length,
    };
  }, [alerts]);

  // ✅ Get highest priority alert for a room
  const getRoomAlert = (roomNum) => {
    return alerts
      .filter(a =>
        a.location &&
        a.location.toLowerCase().includes(roomNum.toString())
      )
      .sort((a, b) => {
        const priority = { active: 3, acknowledged: 2, resolved: 1 };
        return (priority[b.status] || 0) - (priority[a.status] || 0);
      })[0];
  };

  // 🎨 Room component
  const Room = ({ number, x, y }) => {
    const alert = getRoomAlert(number);
    const status = alert?.status || 'idle';

    const colors = {
      active: '#ff4b2b',
      acknowledged: '#ffb400',
      resolved: '#00e676',
      idle: 'rgba(255,255,255,0.05)'
    };

    return (
      <g
        onClick={() => setSelectedRoom({ number, alert })}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={x}
          y={y}
          width="80"
          height="50"
          rx="6"
          fill={status === 'idle' ? colors.idle : `${colors[status]}22`}
          stroke={status === 'idle' ? 'rgba(255,255,255,0.1)' : colors[status]}
          strokeWidth={selectedRoom?.number === number ? "3" : "2"}
          className={status === 'active' ? 'pulse-anim' : ''}
          style={{ transition: 'all 0.25s ease' }}
        />
        <text
          x={x + 40}
          y={y + 30}
          textAnchor="middle"
          fill={status === 'idle' ? 'rgba(255,255,255,0.4)' : '#fff'}
          fontSize="14px"
          fontWeight="500"
        >
          {number}
        </text>
      </g>
    );
  };

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#fff',
      fontFamily: '"JetBrains Mono", monospace',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.08)',
      maxWidth: '900px',
      margin: '0 auto'
    }}>

      {/* 🎯 Animations */}
      <style>{`
        @keyframes pulse {
          0% { stroke-opacity: 1; filter: drop-shadow(0 0 0px #ff4b2b); }
          50% { stroke-opacity: 0.5; filter: drop-shadow(0 0 10px #ff4b2b); }
          100% { stroke-opacity: 1; filter: drop-shadow(0 0 0px #ff4b2b); }
        }
        .pulse-anim {
          animation: pulse 1.5s infinite ease-in-out;
        }

        .tab-btn {
          padding: 10px 20px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          font-family: inherit;
          position: relative;
        }

        .tab-btn.active {
          color: #fff;
          border-bottom: 2px solid #fff;
        }

        .badge {
          background: #ff4b2b;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 8px;
        }
      `}</style>

      {/* 🧭 Floor Tabs */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {[1, 2].map(floorNum => (
          <button
            key={floorNum}
            className={`tab-btn ${activeFloor === floorNum ? 'active' : ''}`}
            onClick={() => setActiveFloor(floorNum)}
          >
            FLOOR {floorNum}
            {floorAlertCounts[floorNum] > 0 && (
              <span className="badge">{floorAlertCounts[floorNum]}</span>
            )}
          </button>
        ))}
      </div>

      {/* 🗺️ Floor Map */}
      <div style={{ overflowX: 'auto', width: '100%', marginBottom: '30px' }}>
        <svg width="500" height="200" viewBox="0 0 500 200">

          {/* Top Row */}
          {[1, 2, 3, 4, 5].map((idx, i) => (
            <Room
              key={idx}
              number={activeFloor * 100 + idx}
              x={10 + (i * 90)}
              y={10}
            />
          ))}

          {/* Corridor */}
          <rect x="0" y="75" width="500" height="50" fill="rgba(255,255,255,0.03)" />
          <text x="250" y="105" textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="12">
            CENTRAL CORRIDOR
          </text>

          {/* Bottom Row */}
          {[6, 7, 8, 9, 10].map((idx, i) => (
            <Room
              key={idx}
              number={activeFloor * 100 + idx}
              x={10 + (i * 90)}
              y={140}
            />
          ))}

        </svg>
      </div>

      {/* 📋 Detail Panel */}
      <div style={{
        minHeight: '120px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '20px'
      }}>
        {selectedRoom ? (
          <div>
            <h3 style={{ marginBottom: '15px' }}>
              Room {selectedRoom.number}
            </h3>

            {selectedRoom.alert ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                fontSize: '13px'
              }}>
                <div>
                  STATUS:
                  <span style={{
                    marginLeft: 6,
                    color: {
                      active: '#ff4b2b',
                      acknowledged: '#ffb400',
                      resolved: '#00e676'
                    }[selectedRoom.alert.status]
                  }}>
                    {selectedRoom.alert.status.toUpperCase()}
                  </span>
                </div>

                <div>TYPE: {selectedRoom.alert.type || 'Standard Alert'}</div>

                <div>📤 SENT: {formatTime(selectedRoom.alert.triggeredAt)}</div>

                <div>✅ RESOLVED: {formatTime(selectedRoom.alert.resolvedAt)}</div>
              </div>
            ) : (
              <p style={{ opacity: 0.5 }}>
                No alerts for this room.
              </p>
            )}
          </div>
        ) : (
          <p style={{ opacity: 0.5, textAlign: 'center' }}>
            Select a room to view details
          </p>
        )}
      </div>
    </div>
  );
};

export default HotelFloorMap;
