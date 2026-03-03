import { useEffect, useRef } from "react";

interface HeroParticleNetworkProps {
  mousePosRef: React.MutableRefObject<{ x: number; y: number } | null>;
}

/** Rede de partículas decorativa no hero da landing (repulsão suave pelo mouse). */
export function HeroParticleNetwork({ mousePosRef }: HeroParticleNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    const spacing = 48;
    const radius = 1.2;
    const repulseRadius = 120;
    const repulseStrength = 18;

    let animationId: number;

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const mouse = mousePosRef.current;
      const color = "hsla(263, 55%, 60%, 0.32)";

      for (let x = 0; x < w + spacing; x += spacing) {
        for (let y = 0; y < h + spacing; y += spacing) {
          let dx = 0,
            dy = 0;
          if (mouse) {
            const dist = Math.hypot(mouse.x - x, mouse.y - y);
            if (dist < repulseRadius && dist > 0) {
              const f = (1 - dist / repulseRadius) * repulseStrength;
              dx = ((x - mouse.x) / dist) * f;
              dy = ((y - mouse.y) / dist) * f;
            }
          }
          ctx.beginPath();
          ctx.arc(x + dx, y + dy, radius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    setSize();
    draw();
    window.addEventListener("resize", setSize);
    return () => {
      window.removeEventListener("resize", setSize);
      cancelAnimationFrame(animationId);
    };
  }, [mousePosRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden
    />
  );
}
