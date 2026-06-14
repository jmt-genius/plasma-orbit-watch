import { useEffect, useRef } from "react";

export function ParticleBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let w = 0, h = 0;
    const stars: { x: number; y: number; z: number; s: number }[] = [];
    const dust: { x: number; y: number; vx: number; vy: number; a: number }[] = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      stars.length = 0;
      dust.length = 0;
      for (let i = 0; i < 240; i++) {
        stars.push({ x: Math.random() * w, y: Math.random() * h, z: Math.random(), s: Math.random() * 1.4 + 0.2 });
      }
      for (let i = 0; i < 60; i++) {
        dust.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -0.05 - Math.random() * 0.2,
          a: Math.random() * 0.5 + 0.1,
        });
      }
    }
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    function frame() {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      // stars
      for (const s of stars) {
        const tw = 0.7 + 0.3 * Math.sin(t * 2 + s.x * 0.01);
        ctx.fillStyle = `rgba(200, 230, 255, ${0.35 * s.z * tw})`;
        ctx.fillRect(s.x, s.y, s.s, s.s);
      }
      // dust
      for (const d of dust) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.y < 0) { d.y = h; d.x = Math.random() * w; }
        if (d.x < 0) d.x = w; if (d.x > w) d.x = 0;
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, 30);
        g.addColorStop(0, `rgba(120, 220, 255, ${d.a * 0.18})`);
        g.addColorStop(1, "rgba(120, 220, 255, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(d.x - 30, d.y - 30, 60, 60);
      }
      raf = requestAnimationFrame(frame);
    }
    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 -z-10 pointer-events-none" aria-hidden />;
}
