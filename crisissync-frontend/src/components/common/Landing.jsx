import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* =============================================
   THREE.JS GLOBE — raw WebGL, zero wrappers
   ============================================= */
function useThreeScene(containerRef) {
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Scene + Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 7);

    // Lights
    scene.add(new THREE.AmbientLight(0x404040, 1.5));
    const p1 = new THREE.PointLight(0xff2d55, 2, 20);
    p1.position.set(5, 5, 5);
    scene.add(p1);
    const p2 = new THREE.PointLight(0x5ac8fa, 1.5, 20);
    p2.position.set(-5, -3, 3);
    scene.add(p2);

    // ---- GLOBE NODES ----
    const nodeCount = 180;
    const nodePositions = [];
    const nodeColors = [];
    const radius = 2.5;
    const colorOptions = [
      new THREE.Color(0xff2d55),
      new THREE.Color(0xff9500),
      new THREE.Color(0x5ac8fa),
      new THREE.Color(0x30d158),
    ];

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      nodePositions.push(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      );
      const c = colorOptions[i % 4];
      nodeColors.push(c.r, c.g, c.b);
    }

    const nodeGeom = new THREE.BufferGeometry();
    nodeGeom.setAttribute("position", new THREE.Float32BufferAttribute(nodePositions, 3));
    nodeGeom.setAttribute("color", new THREE.Float32BufferAttribute(nodeColors, 3));
    const nodeMat = new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true });
    const nodes = new THREE.Points(nodeGeom, nodeMat);
    scene.add(nodes);

    // ---- CONNECTION LINES ----
    const lineVerts = [];
    const posArr = [];
    for (let i = 0; i < nodeCount; i++) {
      posArr.push(new THREE.Vector3(nodePositions[i * 3], nodePositions[i * 3 + 1], nodePositions[i * 3 + 2]));
    }
    for (let i = 0; i < posArr.length; i++) {
      for (let j = i + 1; j < posArr.length; j++) {
        if (posArr[i].distanceTo(posArr[j]) < 0.85) {
          lineVerts.push(posArr[i].x, posArr[i].y, posArr[i].z, posArr[j].x, posArr[j].y, posArr[j].z);
        }
      }
    }
    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute("position", new THREE.Float32BufferAttribute(lineVerts, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0xff2d55, transparent: true, opacity: 0.1 });
    const lines = new THREE.LineSegments(lineGeom, lineMat);
    scene.add(lines);

    // ---- PULSE RINGS ----
    const rings = [];
    const ringColors = [0xff2d55, 0xff9500, 0x5ac8fa];
    for (let i = 0; i < 3; i++) {
      const rGeom = new THREE.RingGeometry(radius - 0.01, radius + 0.01, 64);
      const rMat = new THREE.MeshBasicMaterial({ color: ringColors[i], transparent: true, side: THREE.DoubleSide, opacity: 0.2 });
      const ring = new THREE.Mesh(rGeom, rMat);
      ring.rotation.x = Math.PI / 2;
      ring.userData.offset = i * 0.833;
      scene.add(ring);
      rings.push(ring);
    }

    // ---- ALERT BEACONS ----
    const beaconData = [
      { pos: [1.8, 1.4, 2.0], color: 0xff2d55 },
      { pos: [-2.0, -0.6, 1.4], color: 0xff9500 },
      { pos: [0.6, -2.2, -1.6], color: 0x5ac8fa },
      { pos: [-1.2, 1.8, -1.8], color: 0x30d158 },
      { pos: [2.2, -0.3, -1.0], color: 0xff2d55 },
    ];
    const beacons = [];
    beaconData.forEach((b) => {
      const bGeom = new THREE.SphereGeometry(0.06, 12, 12);
      const bMat = new THREE.MeshBasicMaterial({ color: b.color, transparent: true, opacity: 0.8 });
      const beacon = new THREE.Mesh(bGeom, bMat);
      beacon.position.set(...b.pos);
      beacon.userData.seed = b.pos[0] * 10;
      scene.add(beacon);
      beacons.push(beacon);
    });

    // ---- ORBITING WIREFRAME SHAPES ----
    const shapes = [
      { geom: new THREE.BoxGeometry(0.5, 0.8, 0.5), pos: [4.5, 1.5, -2], color: 0xff2d55, speed: 2, rotSpeed: 0.4 },
      { geom: new THREE.OctahedronGeometry(0.4), pos: [-4, -1, -1.5], color: 0x5ac8fa, speed: 1.5, rotSpeed: 0.3 },
      { geom: new THREE.IcosahedronGeometry(0.35), pos: [3, -2, 2], color: 0xff9500, speed: 1.8, rotSpeed: 0.5 },
      { geom: new THREE.DodecahedronGeometry(0.3), pos: [-3.5, 2, 1.5], color: 0x30d158, speed: 1.2, rotSpeed: 0.2 },
      { geom: new THREE.TorusGeometry(0.3, 0.08, 8, 16), pos: [-2, -2.5, -3], color: 0xff2d55, speed: 2.2, rotSpeed: 0.6 },
      { geom: new THREE.ConeGeometry(0.25, 0.6, 6), pos: [5, -0.5, 1], color: 0x5ac8fa, speed: 1.6, rotSpeed: 0.35 },
      { geom: new THREE.TetrahedronGeometry(0.35), pos: [-4.5, 0.5, 2.5], color: 0xff9500, speed: 1.9, rotSpeed: 0.45 },
      { geom: new THREE.TorusKnotGeometry(0.2, 0.06, 48, 8), pos: [3.5, 2.5, -2.5], color: 0x30d158, speed: 1.4, rotSpeed: 0.25 },
    ];
    const shapeMeshes = [];
    shapes.forEach((s) => {
      const mat = new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.12, wireframe: true });
      const mesh = new THREE.Mesh(s.geom, mat);
      mesh.position.set(...s.pos);
      mesh.userData = { baseY: s.pos[1], speed: s.speed, rotSpeed: s.rotSpeed, seed: s.pos[0] };
      scene.add(mesh);
      shapeMeshes.push(mesh);
    });

    // ---- ORBIT PATHS ----
    [
      { rx: 1.25, rz: 0.2, r: 4.2, color: 0xff2d55, op: 0.05 },
      { rx: 1.05, rz: -0.3, r: 3.8, color: 0x5ac8fa, op: 0.035 },
      { rx: 1.8, rz: 0.1, r: 4.8, color: 0xff9500, op: 0.035 },
    ].forEach((o) => {
      const geom = new THREE.RingGeometry(o.r, o.r + 0.02, 128);
      const mat = new THREE.MeshBasicMaterial({ color: o.color, transparent: true, opacity: o.op, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.rotation.x = o.rx;
      mesh.rotation.z = o.rz;
      scene.add(mesh);
    });

    // ---- DATA STREAM PARTICLES ----
    const streamCount = 300;
    const streamPos = new Float32Array(streamCount * 3);
    for (let i = 0; i < streamCount; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const t = (i % 50) / 49;
      const startR = 2.5;
      const endR = 5 + Math.random() * 2;
      const r = startR + (endR - startR) * t;
      const y = (Math.random() - 0.5) * 3 * Math.sin(t * Math.PI);
      streamPos[i * 3] = Math.cos(angle) * r;
      streamPos[i * 3 + 1] = y;
      streamPos[i * 3 + 2] = Math.sin(angle) * r;
    }
    const streamGeom = new THREE.BufferGeometry();
    streamGeom.setAttribute("position", new THREE.Float32BufferAttribute(streamPos, 3));
    const streamMat = new THREE.PointsMaterial({ size: 0.02, color: 0xff9500, transparent: true, opacity: 0.3, sizeAttenuation: true });
    const streams = new THREE.Points(streamGeom, streamMat);
    scene.add(streams);

    // ---- BACKGROUND STAR FIELD ----
    const starCount = 800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 40;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    const starGeom = new THREE.BufferGeometry();
    starGeom.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.015, color: 0xff2d55, transparent: true, opacity: 0.3, sizeAttenuation: true });
    const stars = new THREE.Points(starGeom, starMat);
    scene.add(stars);

    // ---- INNER GLOW ----
    const glowGeom = new THREE.SphereGeometry(1.2, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff2d55, transparent: true, opacity: 0.06 });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    scene.add(glow);

    // ---- MOUSE INTERACTION ----
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ---- ANIMATION LOOP ----
    const clock = new THREE.Clock();
    let animId;

    function animate() {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Globe rotation
      const rotY = t * 0.1 + mouseX * 0.3;
      const rotX = Math.sin(t * 0.06) * 0.12 + mouseY * 0.15;
      nodes.rotation.y = rotY;
      nodes.rotation.x = rotX;
      lines.rotation.y = rotY;
      lines.rotation.x = rotX;

      // Pulse rings
      rings.forEach((ring) => {
        const phase = ((t * 0.4 + ring.userData.offset) % 2.5) / 2.5;
        const scale = 1 + phase * 0.8;
        ring.scale.set(scale, scale, scale);
        ring.material.opacity = Math.max(0, 0.2 - phase * 0.2);
        ring.rotation.y = rotY;
        ring.rotation.x = rotX;
      });

      // Beacons
      beacons.forEach((b) => {
        b.scale.setScalar(1 + Math.sin(t * 3.5 + b.userData.seed) * 0.4);
        b.material.opacity = 0.5 + Math.sin(t * 4.5 + b.userData.seed) * 0.4;
      });

      // Orbiting shapes
      shapeMeshes.forEach((m) => {
        m.position.y = m.userData.baseY + Math.sin(t * m.userData.speed + m.userData.seed) * 0.5;
        m.rotation.x += m.userData.rotSpeed * 0.005;
        m.rotation.y += m.userData.rotSpeed * 0.007;
        m.rotation.z += m.userData.rotSpeed * 0.003;
      });

      // Data streams
      streams.rotation.y = t * 0.05;

      // Stars
      stars.rotation.y = t * 0.012;
      stars.rotation.x = t * 0.006;

      // Glow
      glow.scale.setScalar(1 + Math.sin(t * 1.5) * 0.08);
      glow.material.opacity = 0.05 + Math.sin(t * 2) * 0.02;

      renderer.render(scene, camera);
    }
    animate();

    // Resize
    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);
}

/* =============================================
   LANDING PAGE COMPONENT
   ============================================= */
export default function Landing({ onEnter }) {
  const canvasRef = useRef(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [dots] = useState(() => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      arr.push({
        id: i, x: Math.random() * 100, y: Math.random() * 100,
        size: Math.random() * 3 + 1, duration: Math.random() * 15 + 10,
        delay: Math.random() * 5, opacity: Math.random() * 0.25 + 0.05,
        dx: (Math.random() - 0.5) * 40, dy: (Math.random() - 0.5) * 40,
      });
    }
    return arr;
  });

  useThreeScene(canvasRef);

  const features = [
    { icon: "🚨", title: "One-Tap SOS", desc: "Instant alerts with a single button press. No app install needed." },
    { icon: "📡", title: "Real-Time Sync", desc: "Alerts reach all dashboards simultaneously via live database." },
    { icon: "🗺️", title: "Live Floor Map", desc: "Exact emergency locations with pulsing indicators." },
    { icon: "🤖", title: "AI Detection", desc: "IoT sensors auto-trigger alerts before humans notice." },
    { icon: "👥", title: "Role-Based Views", desc: "Separate dashboards for Admin, Staff, Guests, Responders." },
    { icon: "⏱️", title: "Response Tracking", desc: "Measure response times per incident with live metrics." },
  ];

  const stats = [
    { value: "< 3s", label: "Alert Delivery" },
    { value: "4", label: "Dashboards" },
    { value: "24/7", label: "IoT Monitor" },
    { value: "0", label: "Missed Alerts" },
  ];

  const flow = [
    { step: "01", title: "Trigger", desc: "Guest taps SOS or AI detects anomaly", color: "#ff2d55" },
    { step: "02", title: "Dispatch", desc: "Alert sent to all floor staff", color: "#ff9500" },
    { step: "03", title: "Respond", desc: "Staff acknowledges and moves to location", color: "#5ac8fa" },
    { step: "04", title: "Resolve", desc: "Emergency handled, time logged", color: "#30d158" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", fontFamily: "'Space Grotesk', sans-serif", position: "relative", overflow: "hidden" }}>

      {/* 3D Canvas — full screen behind everything */}
      <div ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0 }} />

      {/* CSS floating dots on top of 3D */}
      {dots.map((d) => (
        <div key={d.id} style={{
          position: "fixed", left: d.x + "%", top: d.y + "%",
          width: d.size, height: d.size, borderRadius: "50%",
          background: d.id % 3 === 0 ? "#ff2d55" : d.id % 3 === 1 ? "#5ac8fa" : "#ff9500",
          opacity: d.opacity, pointerEvents: "none", zIndex: 1,
          animation: `dotFloat${d.id % 3} ${d.duration}s ease-in-out ${d.delay}s infinite alternate`,
        }} />
      ))}

      {/* Dark vignette overlay for text readability */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 25%, rgba(10,10,15,0.6) 60%, rgba(10,10,15,0.92) 100%)",
      }} />

      {/* All UI content */}
      <div style={{ position: "relative", zIndex: 3 }}>

        {/* Navbar */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(10,10,15,0.55)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(42,42,58,0.25)", padding: "14px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: "#ff2d55",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 13, color: "white", letterSpacing: 1,
              boxShadow: "0 0 25px rgba(255,45,85,0.5)",
            }}>CS</div>
            <span style={{ fontWeight: 700, fontSize: 18 }}>CrisisSync</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {["Features", "How It Works"].map((item) => (
              <a key={item} href={"#" + item.toLowerCase().replace(/ /g, "-")} style={{
                fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.2s",
              }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
              >{item}</a>
            ))}
            <button onClick={onEnter} style={{
              padding: "8px 22px", borderRadius: 8, border: "none",
              background: "#ff2d55", color: "white", fontSize: 13,
              fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 25px rgba(255,45,85,0.4)", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = "0 6px 35px rgba(255,45,85,0.6)"; }}
            onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 4px 25px rgba(255,45,85,0.4)"; }}
            >Launch Demo</button>
          </div>
        </nav>

        {/* Hero — text overlays the 3D globe */}
        <section style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", textAlign: "center",
          paddingTop: 50, paddingBottom: 20, paddingHorizontal: 24,
          minHeight: "100vh",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 20,
            background: "rgba(255,45,85,0.1)", border: "1px solid rgba(255,45,85,0.2)",
            marginBottom: 28, fontSize: 12, color: "#ff2d55", fontWeight: 500,
            animation: "fadeUp 0.8s ease both",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff2d55", boxShadow: "0 0 8px rgba(255,45,85,0.5)", animation: "dotPulse 2s ease-in-out infinite" }} />
            Cepheus 2.0 — Team Code Crafters
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 5.5vw, 64px)", fontWeight: 800,
            lineHeight: 1.1, maxWidth: 700, marginBottom: 20,
            background: "linear-gradient(135deg, #ffffff 0%, #e8e8f0 40%, #ff2d55 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "fadeUp 0.8s ease 0.1s both",
          }}>
            Real-Time Emergency Coordination
          </h1>

          <p style={{
            fontSize: "clamp(14px, 1.8vw, 17px)", color: "rgba(255,255,255,0.45)", maxWidth: 520,
            lineHeight: 1.7, marginBottom: 34, animation: "fadeUp 0.8s ease 0.2s both",
          }}>
            Instant detection, reporting, and response coordination for hotels and resorts. Every second counts.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.8s ease 0.3s both" }}>
            <button onClick={onEnter} style={{
              padding: "14px 40px", borderRadius: 12, border: "none",
              background: "#ff2d55", color: "white", fontSize: 16,
              fontWeight: 700, cursor: "pointer",
              boxShadow: "0 6px 35px rgba(255,45,85,0.4)", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-3px) scale(1.03)"; e.target.style.boxShadow = "0 12px 50px rgba(255,45,85,0.5)"; }}
            onMouseLeave={e => { e.target.style.transform = "translateY(0) scale(1)"; e.target.style.boxShadow = "0 6px 35px rgba(255,45,85,0.4)"; }}
            >Enter Live Dashboard</button>
            <a href="#how-it-works" style={{
              padding: "14px 40px", borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)",
              color: "#e8e8f0", fontSize: 16, fontWeight: 500,
              textDecoration: "none", cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.background = "rgba(255,255,255,0.03)"; }}
            >How It Works</a>
          </div>

          {/* Scroll hint */}
          <div style={{ position: "absolute", bottom: 30, animation: "fadeUp 1.5s ease 1s both" }}>
            <div style={{
              width: 22, height: 36, borderRadius: 11, border: "2px solid rgba(255,255,255,0.12)",
              display: "flex", justifyContent: "center", paddingTop: 7, margin: "0 auto",
            }}>
              <div style={{ width: 3, height: 7, borderRadius: 2, background: "rgba(255,255,255,0.25)", animation: "scrollBounce 1.5s ease-in-out infinite" }} />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{
          borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(10,10,15,0.6)", backdropFilter: "blur(10px)",
        }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28, textAlign: "center" }}>
            {stats.map((s, i) => (
              <div key={i} style={{ animation: "fadeUp 0.6s ease " + (i * 0.1) + "s both" }}>
                <div style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: "#ff2d55", fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" style={{ maxWidth: 1050, margin: "0 auto", padding: "70px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#ff2d55", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Capabilities</p>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700 }}>Built for Crisis Response</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
            {features.map((f, i) => (
              <div key={i}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  background: hoveredFeature === i ? "rgba(26,26,38,0.9)" : "rgba(18,18,26,0.7)",
                  border: "1px solid " + (hoveredFeature === i ? "rgba(255,45,85,0.25)" : "rgba(255,255,255,0.04)"),
                  borderRadius: 14, padding: 22, cursor: "default", transition: "all 0.3s ease",
                  transform: hoveredFeature === i ? "translateY(-5px)" : "translateY(0)",
                  boxShadow: hoveredFeature === i ? "0 10px 35px rgba(255,45,85,0.15)" : "none",
                  backdropFilter: "blur(8px)",
                }}>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" style={{
          background: "rgba(18,18,26,0.4)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)",
          padding: "70px 24px",
        }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#ff2d55", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Workflow</p>
              <h2 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700 }}>How It Works</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
              {flow.map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, margin: "0 auto 14px",
                    background: s.color + "12", border: "1px solid " + s.color + "25",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace",
                  }}>{s.step}</div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: s.color }}>{s.title}</h4>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem */}
        <section style={{ maxWidth: 860, margin: "0 auto", padding: "70px 24px" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(255,45,85,0.06) 0%, rgba(255,45,85,0.01) 100%)",
            border: "1px solid rgba(255,45,85,0.1)", borderRadius: 18, padding: "40px 36px",
          }}>
            <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#ff2d55", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>The Problem</p>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18, lineHeight: 1.3 }}>Current emergency response in hospitality is broken</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {[
                { label: "Delayed Detection", desc: "Staff find out minutes after emergencies start" },
                { label: "Poor Communication", desc: "No direct channel between guests and responders" },
                { label: "No Coordination", desc: "No centralized system to track response" },
                { label: "Panic & Confusion", desc: "Guests don't know what to do or where to go" },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#ff2d55" }} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{item.label}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, paddingLeft: 10 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries */}
        <section style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "60px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#ff2d55", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Market</p>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, marginBottom: 32 }}>Built For These Industries</h2>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
              {[
                { icon: "🏨", name: "Hotels & Resorts" },
                { icon: "🏥", name: "Hospitals" },
                { icon: "🛒", name: "Malls" },
                { icon: "🎓", name: "Campuses" },
                { icon: "🏢", name: "Offices" },
                { icon: "🏙️", name: "Smart Cities" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "16px 24px", borderRadius: 12,
                  background: "rgba(18,18,26,0.6)", border: "1px solid rgba(255,255,255,0.04)",
                  transition: "all 0.2s", cursor: "default",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "60px 24px 80px" }}>
          <div style={{
            maxWidth: 600, margin: "0 auto", textAlign: "center",
            background: "linear-gradient(135deg, rgba(255,45,85,0.08) 0%, rgba(255,45,85,0.02) 100%)",
            border: "1px solid rgba(255,45,85,0.12)", borderRadius: 20, padding: "48px 36px",
          }}>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, marginBottom: 14 }}>See It In Action</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 28, lineHeight: 1.7 }}>
              Launch the live demo. Trigger an SOS, watch it reach all dashboards in real-time.
            </p>
            <button onClick={onEnter} style={{
              padding: "14px 44px", borderRadius: 12, border: "none",
              background: "#ff2d55", color: "white", fontSize: 16,
              fontWeight: 700, cursor: "pointer",
              boxShadow: "0 6px 35px rgba(255,45,85,0.35)", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = "0 10px 45px rgba(255,45,85,0.5)"; }}
            onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 6px 35px rgba(255,45,85,0.35)"; }}
            >Launch Live Demo</button>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: "1px solid rgba(255,255,255,0.04)", padding: "20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          maxWidth: 1000, margin: "0 auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: "#ff2d55", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: "white" }}>CS</div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>CrisisSync</span>
          </div>
          <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.12)", letterSpacing: 1 }}>Team Code Crafters — Cepheus 2.0</p>
        </footer>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.2; }
        }
        @keyframes dotFloat0 {
          0% { transform: translate(0, 0); }
          100% { transform: translate(25px, -35px); }
        }
        @keyframes dotFloat1 {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-30px, -20px); }
        }
        @keyframes dotFloat2 {
          0% { transform: translate(0, 0); }
          100% { transform: translate(15px, 40px); }
        }
      `}</style>
    </div>
  );
}