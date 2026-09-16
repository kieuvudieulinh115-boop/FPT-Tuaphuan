import React, { useEffect, useRef } from 'react';

interface Cyber3DFaceProps {
  className?: string;
  interactive?: boolean;
}

export const Cyber3DFace: React.FC<Cyber3DFaceProps> = ({ className = '', interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.5);
    let width = (canvas.width = (canvas.offsetWidth || 350) * dpr);
    let height = (canvas.height = (canvas.offsetHeight || 450) * dpr);

    const handleResize = () => {
      if (!canvas) return;
      if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) return;
      width = canvas.width = canvas.offsetWidth * dpr;
      height = canvas.height = canvas.offsetHeight * dpr;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseRef.current.targetX = x * 0.45;
      mouseRef.current.targetY = y * 0.35;
    };

    const handleTouch = (e: TouchEvent) => {
      if (!interactive || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width - 0.5;
      const y = (touch.clientY - rect.top) / rect.height - 0.5;
      mouseRef.current.targetX = x * 0.55;
      mouseRef.current.targetY = y * 0.4;
    };

    const handleTouchEnd = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (!interactive) return;
      const gamma = e.gamma ?? 0;
      const beta = e.beta ?? 0;
      if (Math.abs(gamma) > 1 || Math.abs(beta) > 1) {
        mouseRef.current.targetX = Math.max(-0.4, Math.min(0.4, (gamma / 40) * 0.4));
        mouseRef.current.targetY = Math.max(-0.3, Math.min(0.3, ((beta - 45) / 40) * 0.3));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchstart', handleTouch, { passive: true });
    canvas.addEventListener('touchmove', handleTouch, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });

    // Generate 3D Human Face Wireframe Points
    interface Point3D {
      x: number;
      y: number;
      z: number;
      originX: number;
      originY: number;
      originZ: number;
      type: 'jaw' | 'eye' | 'nose' | 'lip' | 'forehead' | 'cheek' | 'particle';
      glow?: boolean;
    }

    const points: Point3D[] = [];
    const lines: [number, number][] = [];

    // Helper: Add 3D Point
    const addPt = (x: number, y: number, z: number, type: Point3D['type'], glow = false) => {
      const idx = points.length;
      points.push({ x, y, z, originX: x, originY: y, originZ: z, type, glow });
      return idx;
    };

    // Helper: Add Line
    const addLine = (i1: number, i2: number) => {
      lines.push([i1, i2]);
    };

    // 1. Forehead / Cranium contour
    const fhPoints: number[] = [];
    for (let angle = Math.PI * 0.15; angle <= Math.PI * 0.85; angle += 0.12) {
      const x = Math.cos(angle) * 75;
      const y = -Math.sin(angle) * 85 - 20;
      const z = Math.sin(angle) * 45;
      fhPoints.push(addPt(x, y, z, 'forehead'));
    }
    for (let i = 0; i < fhPoints.length - 1; i++) {
      addLine(fhPoints[i], fhPoints[i + 1]);
    }

    // 2. Jawline
    const jawPoints: number[] = [];
    for (let angle = Math.PI * 0.15; angle <= Math.PI * 0.85; angle += 0.1) {
      const x = Math.cos(angle) * 65;
      const y = Math.sin(angle) * 95;
      const z = Math.sin(angle) * 35;
      jawPoints.push(addPt(x, y, z, 'jaw', true));
    }
    for (let i = 0; i < jawPoints.length - 1; i++) {
      addLine(jawPoints[i], jawPoints[i + 1]);
    }

    // 3. Eyebrows & Eyes
    // Left Eyebrow
    const lBrow = [
      addPt(-48, -35, 30, 'eye'),
      addPt(-35, -42, 38, 'eye'),
      addPt(-18, -40, 42, 'eye'),
      addPt(-8, -36, 40, 'eye')
    ];
    for (let i = 0; i < lBrow.length - 1; i++) addLine(lBrow[i], lBrow[i + 1]);

    // Right Eyebrow
    const rBrow = [
      addPt(8, -36, 40, 'eye'),
      addPt(18, -40, 42, 'eye'),
      addPt(35, -42, 38, 'eye'),
      addPt(48, -35, 30, 'eye')
    ];
    for (let i = 0; i < rBrow.length - 1; i++) addLine(rBrow[i], rBrow[i + 1]);

    // Left Eye contour
    const lEye = [
      addPt(-40, -26, 32, 'eye', true),
      addPt(-30, -32, 36, 'eye'),
      addPt(-16, -26, 38, 'eye', true),
      addPt(-30, -22, 34, 'eye')
    ];
    addLine(lEye[0], lEye[1]);
    addLine(lEye[1], lEye[2]);
    addLine(lEye[2], lEye[3]);
    addLine(lEye[3], lEye[0]);

    // Right Eye contour
    const rEye = [
      addPt(16, -26, 38, 'eye', true),
      addPt(30, -32, 36, 'eye'),
      addPt(40, -26, 32, 'eye', true),
      addPt(30, -22, 34, 'eye')
    ];
    addLine(rEye[0], rEye[1]);
    addLine(rEye[1], rEye[2]);
    addLine(rEye[2], rEye[3]);
    addLine(rEye[3], rEye[0]);

    // 4. Nose Bridge & Tip
    const nosePts = [
      addPt(0, -35, 42, 'nose'),
      addPt(0, -18, 48, 'nose'),
      addPt(0, 0, 56, 'nose', true), // tip
      addPt(-10, 8, 46, 'nose'),
      addPt(0, 10, 50, 'nose'),
      addPt(10, 8, 46, 'nose')
    ];
    addLine(nosePts[0], nosePts[1]);
    addLine(nosePts[1], nosePts[2]);
    addLine(nosePts[2], nosePts[4]);
    addLine(nosePts[3], nosePts[4]);
    addLine(nosePts[4], nosePts[5]);
    addLine(nosePts[3], nosePts[2]);
    addLine(nosePts[5], nosePts[2]);

    // 5. Lips
    const upperLip = [
      addPt(-22, 28, 38, 'lip', true),
      addPt(-10, 24, 46, 'lip'),
      addPt(0, 26, 48, 'lip', true),
      addPt(10, 24, 46, 'lip'),
      addPt(22, 28, 38, 'lip', true)
    ];
    for (let i = 0; i < upperLip.length - 1; i++) addLine(upperLip[i], upperLip[i + 1]);

    const lowerLip = [
      upperLip[0],
      addPt(-12, 38, 42, 'lip'),
      addPt(0, 42, 45, 'lip', true),
      addPt(12, 38, 42, 'lip'),
      upperLip[4]
    ];
    for (let i = 0; i < lowerLip.length - 1; i++) addLine(lowerLip[i], lowerLip[i + 1]);

    // 6. Cheeks and Chin Cross-Grid Lines
    const chinPt = addPt(0, 75, 45, 'jaw', true);
    addLine(lowerLip[2], chinPt);

    const lCheek = addPt(-38, 2, 34, 'cheek', true);
    const rCheek = addPt(38, 2, 34, 'cheek', true);
    addLine(lEye[0], lCheek);
    addLine(lCheek, upperLip[0]);
    addLine(rEye[2], rCheek);
    addLine(rCheek, upperLip[4]);
    addLine(nosePts[3], lCheek);
    addLine(nosePts[5], rCheek);

    // 7. Ambient Cyber Floating Particles in 3D Volume
    for (let p = 0; p < 75; p++) {
      const px = (Math.random() - 0.5) * 220;
      const py = (Math.random() - 0.5) * 240;
      const pz = (Math.random() - 0.5) * 140;
      addPt(px, py, pz, 'particle');
    }

    let frame = 0;
    let scanY = -120;

    const render = () => {
      // If canvas is hidden or detached (e.g. desktop canvas while on mobile, or vice versa), skip work
      if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      frame++;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow with gentle, soft damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.035;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.035;

      // 3D Rotation angles: gentle, calming auto-rotation + soft touch interaction
      const rotY = Math.sin(frame * 0.007) * 0.16 - mouseRef.current.x * 0.45;
      const rotX = Math.cos(frame * 0.005) * 0.08 + mouseRef.current.y * 0.35;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const fov = 340;
      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) / 290;

      // Project all 3D points to 2D screen coordinates
      const projected = points.map((pt) => {
        // Rotate around Y
        let x1 = pt.originX * cosY - pt.originZ * sinY;
        let z1 = pt.originX * sinY + pt.originZ * cosY;

        // Rotate around X
        let y2 = pt.originY * cosX - z1 * sinX;
        let z2 = pt.originY * sinX + z1 * cosX;

        // Add subtle, gentle breathing motion
        y2 += Math.sin(frame * 0.02 + pt.originY * 0.02) * 0.8;

        // Distance factor
        const distance = fov / (fov + z2 + 100);
        const screenX = centerX + x1 * distance * scale;
        const screenY = centerY + y2 * distance * scale;
        const depth = z2;

        return { x: screenX, y: screenY, z: depth, pt };
      });

      // Update vertical scanline gently
      scanY += 0.8;
      if (scanY > 130) scanY = -130;
      const screenScanY = centerY + scanY * scale;

      // 1. Draw connecting lines in batched strokes (10x faster)
      ctx.lineWidth = 1 * dpr;

      // Regular wireframe lines
      ctx.beginPath();
      for (const [i1, i2] of lines) {
        const p1 = projected[i1];
        const p2 = projected[i2];
        if (!p1 || !p2) continue;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.42)';
      ctx.stroke();

      // Scanline illuminated lines (highlighted pass)
      ctx.beginPath();
      for (const [i1, i2] of lines) {
        const p1 = projected[i1];
        const p2 = projected[i2];
        if (!p1 || !p2) continue;
        if (Math.abs(p1.y - screenScanY) < 22 || Math.abs(p2.y - screenScanY) < 22) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
      ctx.stroke();

      // 2. Draw 3D nodes & landmarks in batched calls
      // Particles
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      for (const p of projected) {
        if (p.pt.type === 'particle') {
          ctx.rect(p.x, p.y, 1.5 * dpr, 1.5 * dpr);
        }
      }
      ctx.fill();

      // Key landmark points (glowing)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      for (const p of projected) {
        if (p.pt.type !== 'particle' && p.pt.glow) {
          ctx.moveTo(p.x + 2.5 * dpr, p.y);
          ctx.arc(p.x, p.y, 2.5 * dpr, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      // Regular landmark points
      ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.beginPath();
      for (const p of projected) {
        if (p.pt.type !== 'particle' && !p.pt.glow) {
          ctx.moveTo(p.x + 1.6 * dpr, p.y);
          ctx.arc(p.x, p.y, 1.6 * dpr, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      // 3. Draw Scanline Sweep
      const grad = ctx.createLinearGradient(0, screenScanY - 15, 0, screenScanY + 15);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(centerX - 120 * scale, screenScanY - 10, 240 * scale, 20);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 1.2 * window.devicePixelRatio;
      ctx.beginPath();
      ctx.moveTo(centerX - 110 * scale, screenScanY);
      ctx.lineTo(centerX + 110 * scale, screenScanY);
      ctx.stroke();

      // 4. Tech brackets & telemetry overlay around the face
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.lineWidth = 1.5 * window.devicePixelRatio;
      const bW = 140 * scale;
      const bH = 170 * scale;
      const brLen = 14 * scale;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(centerX - bW, centerY - bH + brLen);
      ctx.lineTo(centerX - bW, centerY - bH);
      ctx.lineTo(centerX - bW + brLen, centerY - bH);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(centerX + bW - brLen, centerY - bH);
      ctx.lineTo(centerX + bW, centerY - bH);
      ctx.lineTo(centerX + bW, centerY - bH + brLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(centerX - bW, centerY + bH - brLen);
      ctx.lineTo(centerX - bW, centerY + bH);
      ctx.lineTo(centerX - bW + brLen, centerY + bH);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(centerX + bW - brLen, centerY + bH);
      ctx.lineTo(centerX + bW, centerY + bH);
      ctx.lineTo(centerX + bW, centerY + bH - brLen);
      ctx.stroke();

      // Small telemetry text
      ctx.font = `${8 * window.devicePixelRatio}px monospace`;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.fillText('MESH: 478 NODES', centerX - bW, centerY + bH + 15 * scale);
      ctx.fillText(`ROT: ${(rotY * 57.3).toFixed(1)}°`, centerX + bW - 65 * scale, centerY + bH + 15 * scale);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouch);
        canvas.removeEventListener('touchmove', handleTouch);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('touchcancel', handleTouchEnd);
      }
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [interactive]);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden select-none ${interactive ? 'pointer-events-auto cursor-grab active:cursor-grabbing touch-none' : 'pointer-events-none'} ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
    </div>
  );
};
