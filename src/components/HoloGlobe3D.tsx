import React, { useEffect, useRef } from 'react';

interface HoloGlobe3DProps {
  className?: string;
}

export const HoloGlobe3D: React.FC<HoloGlobe3DProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.5);
    let width = (canvas.width = (canvas.offsetWidth || 120) * dpr);
    let height = (canvas.height = (canvas.offsetHeight || 120) * dpr);

    const handleResize = () => {
      if (!canvas || canvas.offsetWidth === 0) return;
      width = canvas.width = canvas.offsetWidth * dpr;
      height = canvas.height = canvas.offsetHeight * dpr;
    };
    window.addEventListener('resize', handleResize);

    // Generate Globe Wireframe Points (Latitude & Longitude)
    const points: { x: number; y: number; z: number }[] = [];
    const radius = 38;

    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (lat * Math.PI) / 180;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      for (let lon = 0; lon < 360; lon += 24) {
        const theta = (lon * Math.PI) / 180;
        points.push({
          x: radius * cosPhi * Math.cos(theta),
          y: radius * sinPhi,
          z: radius * cosPhi * Math.sin(theta)
        });
      }
    }

    let angle = 0;

    const render = () => {
      if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      angle += 0.007;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const scale = (Math.min(width, height) / 110);

      // Rotate points
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const tilt = 0.35; // tilt globe slightly
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);

      // Draw Orbiting Ring
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 52 * scale, 18 * scale, -0.3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();

      // Draw points in batched fill
      ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.beginPath();
      for (const p of points) {
        // Rotate around Y
        const x1 = p.x * cosA - p.z * sinA;
        const z1 = p.x * sinA + p.z * cosA;

        // Tilt around X
        const y2 = p.y * cosT - z1 * sinT;
        const z2 = p.y * sinT + z1 * cosT;

        if (z2 > -10) {
          const px = centerX + x1 * scale;
          const py = centerY + y2 * scale;
          ctx.moveTo(px + 1.2 * dpr, py);
          ctx.arc(px, py, 1.2 * dpr, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center pointer-events-none select-none ${className}`}>
      <div className="relative w-24 h-24 sm:w-28 sm:h-28">
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
      </div>
      <div className="text-[10px] font-mono tracking-widest text-cyan-300 font-bold uppercase mt-1">
        UNLOCK NEW WORLD
      </div>
    </div>
  );
};
