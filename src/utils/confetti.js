export function triggerConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "9999"
  });
  document.body.appendChild(canvas);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const colors = ["#ff8ab5", "#cdb4ff", "#98ebca", "#ffd875", "#ff9e8a"];
  const particles = Array.from({ length: 42 }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
    const speed = 5 + Math.random() * 8;
    return {
      x: w * (0.35 + Math.random() * 0.3),
      y: h * 0.45,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 6 + Math.random() * 6,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.25,
      color: colors[Math.floor(Math.random() * colors.length)],
      isHeart: Math.random() < 0.35
    };
  });

  const start = performance.now();
  const duration = 1200;

  function drawHeart(c, size) {
    const s = size * 0.55;
    c.beginPath();
    c.moveTo(0, s * 0.35);
    c.bezierCurveTo(-s, -s * 0.4, -s * 1.4, s * 0.6, 0, s * 1.3);
    c.bezierCurveTo(s * 1.4, s * 0.6, s, -s * 0.4, 0, s * 0.35);
    c.fill();
  }

  function frame(now) {
    const t = (now - start) / duration;
    if (t >= 1) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, w, h);
    const alpha = t > 0.65 ? Math.max(0, 1 - (t - 0.65) / 0.35) : 1;

    for (const p of particles) {
      p.vy += 0.28;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vRot;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.isHeart) {
        drawHeart(ctx, p.size);
      } else {
        ctx.fillRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.7);
      }
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
