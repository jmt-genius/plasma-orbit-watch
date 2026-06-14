import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePlasmaStore, type OrbitParams } from "@/lib/plasma/store";

function makeOrbitPoints(altKm: number, inclinationDeg: number, raanDeg: number, segments = 256) {
  const earthRadius = 1; // unit sphere
  const r = earthRadius + altKm / 6371;
  const inc = (inclinationDeg * Math.PI) / 180;
  const raan = (raanDeg * Math.PI) / 180;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    // base circle in XY plane
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const z = 0;
    // rotate around X by inclination
    const y1 = y * Math.cos(inc) - z * Math.sin(inc);
    const z1 = y * Math.sin(inc) + z * Math.cos(inc);
    // rotate around Z by RAAN
    const x2 = x * Math.cos(raan) - y1 * Math.sin(raan);
    const y2 = x * Math.sin(raan) + y1 * Math.cos(raan);
    pts.push(new THREE.Vector3(x2, y2, z1));
  }
  return pts;
}

export function OrbitGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);
  const debrisOrbitRef = useRef<THREE.Line | null>(null);
  const debrisMeshRef = useRef<THREE.Mesh | null>(null);
  const debrisParamsRef = useRef<OrbitParams | null>(null);
  const debrisPhaseRef = useRef(0);
  const riskMarkerRef = useRef<THREE.Mesh | null>(null);

  const liveOrbit = usePlasmaStore((s) => s.liveOrbit);
  const liveRisk = usePlasmaStore((s) => s.liveRisk);

  useEffect(() => {
    const mount = mountRef.current!;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.0, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0x223355, 0.6));
    const sun = new THREE.DirectionalLight(0x88ccff, 1.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xaa66ff, 0.5);
    rim.position.set(-4, -2, -3);
    scene.add(rim);

    // Earth
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x0a1a3a,
      emissive: 0x05122a,
      shininess: 18,
      specular: 0x224477,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);

    // Wireframe overlay (lat/long grid)
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.SphereGeometry(1.002, 24, 18)),
      new THREE.LineBasicMaterial({ color: 0x39c4ff, transparent: true, opacity: 0.22 }),
    );
    earthGroup.add(wire);

    // Atmosphere
    const atmoGeo = new THREE.SphereGeometry(1.08, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: {},
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
          gl_FragColor = vec4(0.25, 0.7, 1.0, 1.0) * intensity;
        }
      `,
    });
    const atmo = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmo);

    // Stars
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 30 + Math.random() * 20;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(p) * Math.cos(t);
      positions[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      positions[i * 3 + 2] = r * Math.cos(p);
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(
      starsGeo,
      new THREE.PointsMaterial({ color: 0xaaddff, size: 0.06, sizeAttenuation: true, transparent: true, opacity: 0.8 }),
    );
    scene.add(stars);

    // Host CubeSat orbit (ISS-like at ~400km, inc ~51.6)
    const hostPts = makeOrbitPoints(400, 51.6, 0);
    const hostOrbitGeo = new THREE.BufferGeometry().setFromPoints(hostPts);
    const hostOrbit = new THREE.Line(
      hostOrbitGeo,
      new THREE.LineBasicMaterial({ color: 0x39c4ff, transparent: true, opacity: 0.5 }),
    );
    scene.add(hostOrbit);

    const hostSatGeo = new THREE.SphereGeometry(0.025, 16, 16);
    const hostSatMat = new THREE.MeshBasicMaterial({ color: 0x39c4ff });
    const hostSat = new THREE.Mesh(hostSatGeo, hostSatMat);
    scene.add(hostSat);
    const hostHalo = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x39c4ff, transparent: true, opacity: 0.25 }),
    );
    scene.add(hostHalo);

    // Debris orbit (created on detection)
    const debrisOrbitMat = new THREE.LineBasicMaterial({ color: 0xff5ab4, transparent: true, opacity: 0.8 });
    const debrisOrbit = new THREE.Line(new THREE.BufferGeometry(), debrisOrbitMat);
    debrisOrbit.visible = false;
    scene.add(debrisOrbit);
    debrisOrbitRef.current = debrisOrbit;

    const debrisMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xff5ab4 }),
    );
    debrisMesh.visible = false;
    scene.add(debrisMesh);
    debrisMeshRef.current = debrisMesh;

    // Risk marker
    const riskMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffaa33, transparent: true, opacity: 0.6 }),
    );
    riskMarker.visible = false;
    scene.add(riskMarker);
    riskMarkerRef.current = riskMarker;

    // Animation
    let raf = 0;
    let hostPhase = 0;
    const clock = new THREE.Clock();
    function animate() {
      const dt = clock.getDelta();
      hostPhase = (hostPhase + dt * 0.08) % 1;
      const i = Math.floor(hostPhase * (hostPts.length - 1));
      const p = hostPts[i];
      hostSat.position.copy(p);
      hostHalo.position.copy(p);

      if (debrisParamsRef.current && debrisOrbitRef.current?.visible) {
        debrisPhaseRef.current = (debrisPhaseRef.current + dt * debrisParamsRef.current.speed) % 1;
        const pts = (debrisOrbitRef.current.geometry as THREE.BufferGeometry).attributes.position;
        const idx = Math.floor(debrisPhaseRef.current * (pts.count - 1));
        const x = pts.getX(idx), y = pts.getY(idx), z = pts.getZ(idx);
        debrisMeshRef.current!.position.set(x, y, z);
      }

      earthGroup.rotation.y += dt * 0.04;
      stars.rotation.y += dt * 0.005;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }
    animate();

    // Resize
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(mount);

    // Pointer drag for slight rotation
    let dragging = false; let lastX = 0; let lastY = 0;
    const down = (e: PointerEvent) => { dragging = true; lastX = e.clientX; lastY = e.clientY; };
    const up = () => { dragging = false; };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      earthGroup.rotation.y += dx * 0.005;
      earthGroup.rotation.x = Math.max(-1, Math.min(1, earthGroup.rotation.x + dy * 0.005));
    };
    renderer.domElement.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointermove", move);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointermove", move);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  // Update debris orbit when a new detection lands
  useEffect(() => {
    if (!liveOrbit || !debrisOrbitRef.current || !debrisMeshRef.current) return;
    const pts = makeOrbitPoints(liveOrbit.altitudeKm, liveOrbit.inclination, liveOrbit.raan);
    debrisOrbitRef.current.geometry.dispose();
    debrisOrbitRef.current.geometry = new THREE.BufferGeometry().setFromPoints(pts);
    debrisOrbitRef.current.visible = true;
    debrisMeshRef.current.visible = true;
    debrisParamsRef.current = liveOrbit;
    debrisPhaseRef.current = liveOrbit.phase;
  }, [liveOrbit]);

  // Risk marker placement (rough intersection visualization)
  useEffect(() => {
    if (!liveRisk || !liveOrbit || !riskMarkerRef.current) return;
    if (liveRisk.level === "Low") {
      riskMarkerRef.current.visible = false;
      return;
    }
    const pts = makeOrbitPoints(liveOrbit.altitudeKm, liveOrbit.inclination, liveOrbit.raan, 64);
    const mid = pts[Math.floor(pts.length / 3)];
    riskMarkerRef.current.position.copy(mid);
    const mat = riskMarkerRef.current.material as THREE.MeshBasicMaterial;
    mat.color.set(liveRisk.level === "High" ? 0xff3355 : 0xffaa33);
    mat.opacity = liveRisk.level === "High" ? 0.85 : 0.55;
    riskMarkerRef.current.visible = true;
  }, [liveRisk, liveOrbit]);

  return (
    <div className="relative h-full w-full">
      <div ref={mountRef} className="h-full w-full" />
      <div className="pointer-events-none absolute left-3 top-3 text-[10px] uppercase tracking-[0.18em] font-display text-muted-foreground">
        Orbital View · LEO
      </div>
      <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[color:var(--cyan-glow)] shadow-[0_0_8px_var(--cyan-glow)]" />CubeSat</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#ff5ab4] shadow-[0_0_8px_#ff5ab4]" />Debris</span>
      </div>
    </div>
  );
}
