import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulse: number;
  pulseSpeed: number;
}

const NetworkGlobe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const nodes: Node[] = [];
    const nodeCount = 60;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;
    const cx = () => w() / 2;
    const cy = () => h() / 2;
    const maxR = () => Math.min(w(), h()) * 0.38;

    for (let i = 0; i < nodeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * maxR();
      nodes.push({
        x: cx() + Math.cos(angle) * dist,
        y: cy() + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 1.5 + Math.random() * 2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w(), h());

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.25;
            ctx.strokeStyle = `rgba(0, 255, 163, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        node.pulse += node.pulseSpeed;
        const glow = 0.4 + Math.sin(node.pulse) * 0.3;

        // Glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 6);
        gradient.addColorStop(0, `rgba(0, 255, 163, ${glow * 0.4})`);
        gradient.addColorStop(1, "rgba(0, 255, 163, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 6, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(0, 255, 163, ${glow})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Move
        node.x += node.vx;
        node.y += node.vy;

        // Bounce within globe
        const distFromCenter = Math.sqrt((node.x - cx()) ** 2 + (node.y - cy()) ** 2);
        if (distFromCenter > maxR()) {
          const angle = Math.atan2(node.y - cy(), node.x - cx());
          node.x = cx() + Math.cos(angle) * maxR();
          node.y = cy() + Math.sin(angle) * maxR();
          node.vx *= -1;
          node.vy *= -1;
        }
      }

      // Globe outline
      ctx.strokeStyle = "rgba(0, 255, 163, 0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx(), cy(), maxR(), 0, Math.PI * 2);
      ctx.stroke();

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default NetworkGlobe;
