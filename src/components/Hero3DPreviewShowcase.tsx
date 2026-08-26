import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Orbit, Play, Pause, ArrowRight, Sparkles, Cpu, Layers } from 'lucide-react';

interface Hero3DPreviewShowcaseProps {
  onLaunchStudio: (workspaceId: 'test_diagrams' | 'deep_learning_studio' | 'dsa_lab') => void;
}

export type HeroPreviewMode = 'svc_3d' | 'gaussian_3d' | 'neural_pulse';

export const Hero3DPreviewShowcase: React.FC<Hero3DPreviewShowcaseProps> = ({ onLaunchStudio }) => {
  const [mode, setMode] = useState<HeroPreviewMode>('svc_3d');
  const [rotX, setRotX] = useState<number>(24);
  const [rotY, setRotY] = useState<number>(35);
  const [isAutoOrbit, setIsAutoOrbit] = useState<boolean>(true);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation Loop for 60 FPS rendering
  useEffect(() => {
    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.025;
      if (isAutoOrbit && !isDraggingRef.current) {
        setRotY(prev => (prev + 0.35) % 360);
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const W = canvas.width;
          const H = canvas.height;
          ctx.clearRect(0, 0, W, H);

          // Subtle glowing radial background
          const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * 0.6);
          bgGrad.addColorStop(0, '#0f172a');
          bgGrad.addColorStop(1, '#020617');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, W, H);

          const radX = (rotX * Math.PI) / 180;
          const radY = (rotY * Math.PI) / 180;
          const cosX = Math.cos(radX);
          const sinX = Math.sin(radX);
          const cosY = Math.cos(radY);
          const sinY = Math.sin(radY);

          const project3D = (x: number, y: number, z: number) => {
            const x1 = x * cosY - z * sinY;
            const z1 = x * sinY + z * cosY;
            const y2 = y * cosX - z1 * sinX;
            const z2 = y * sinX + z1 * cosX;
            const scale = 58;
            return { x: W / 2 + x1 * scale, y: H / 2 - y2 * scale, z: z2 };
          };

          if (mode === 'svc_3d') {
            // ─── 1. SVC 3D Paraboloid Lift z = 0.45(x^2 + y^2) ───
            const steps = 14;
            const range = 2.0;
            const quads: Array<{ p1: any; p2: any; p3: any; p4: any; avgZ: number; avgY: number }> = [];

            for (let i = 0; i < steps; i++) {
              for (let j = 0; j < steps; j++) {
                const u1 = -range + (i / steps) * (2 * range);
                const u2 = -range + ((i + 1) / steps) * (2 * range);
                const v1 = -range + (j / steps) * (2 * range);
                const v2 = -range + ((j + 1) / steps) * (2 * range);

                const y1 = 0.42 * (u1 * u1 + v1 * v1) - 1.2;
                const y2 = 0.42 * (u2 * u2 + v1 * v1) - 1.2;
                const y3 = 0.42 * (u2 * u2 + v2 * v2) - 1.2;
                const y4 = 0.42 * (u1 * u1 + v2 * v2) - 1.2;

                const p1 = project3D(u1, y1, v1);
                const p2 = project3D(u2, y2, v1);
                const p3 = project3D(u2, y3, v2);
                const p4 = project3D(u1, y4, v2);

                quads.push({
                  p1, p2, p3, p4,
                  avgZ: (p1.z + p2.z + p3.z + p4.z) / 4,
                  avgY: (y1 + y2 + y3 + y4) / 4
                });
              }
            }

            quads.sort((a, b) => a.avgZ - b.avgZ);
            quads.forEach(q => {
              ctx.beginPath();
              ctx.moveTo(q.p1.x, q.p1.y);
              ctx.lineTo(q.p2.x, q.p2.y);
              ctx.lineTo(q.p3.x, q.p3.y);
              ctx.lineTo(q.p4.x, q.p4.y);
              ctx.closePath();

              const normY = Math.max(0, Math.min(1, (q.avgY + 1.2) / 2.2));
              const r = Math.round(56 + normY * 180);
              const g = Math.round(189 - normY * 80);
              const b = Math.round(248 - normY * 40);
              ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.28)`;
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
              ctx.lineWidth = 1;
              ctx.fill();
              ctx.stroke();
            });

            // Hyperplane Slicing Ring
            const hpY = -0.35 + Math.sin(time) * 0.15;
            const hpPoints = [
              project3D(-2.2, hpY, -2.2),
              project3D(2.2, hpY, -2.2),
              project3D(2.2, hpY, 2.2),
              project3D(-2.2, hpY, 2.2)
            ];
            ctx.beginPath();
            ctx.moveTo(hpPoints[0].x, hpPoints[0].y);
            ctx.lineTo(hpPoints[1].x, hpPoints[1].y);
            ctx.lineTo(hpPoints[2].x, hpPoints[2].y);
            ctx.lineTo(hpPoints[3].x, hpPoints[3].y);
            ctx.closePath();
            ctx.fillStyle = 'rgba(236, 72, 153, 0.22)';
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.9)';
            ctx.lineWidth = 1.6;
            ctx.fill();
            ctx.stroke();

            // Lifted Class Points
            const pts = [
              { x: 0.2, z: 0.1, label: 1 },
              { x: -0.3, z: 0.25, label: 1 },
              { x: 0.15, z: -0.3, label: 1 },
              { x: -1.3, z: 1.1, label: 0 },
              { x: 1.4, z: -1.0, label: 0 },
              { x: -1.1, z: -1.2, label: 0 },
              { x: 1.2, z: 1.3, label: 0 }
            ];
            pts.forEach(p => {
              const y = 0.42 * (p.x * p.x + p.z * p.z) - 1.2;
              const sp = project3D(p.x, y, p.z);
              ctx.beginPath();
              ctx.arc(sp.x, sp.y, 5.5, 0, 2 * Math.PI);
              ctx.fillStyle = p.label === 1 ? '#34d399' : '#38bdf8';
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.4;
              ctx.stroke();
            });

          } else if (mode === 'gaussian_3d') {
            // ─── 2. 3D Gaussian Bell Surface ───
            const steps = 14;
            const range = 2.2;
            const quads: Array<{ p1: any; p2: any; p3: any; p4: any; avgZ: number; avgY: number }> = [];

            for (let i = 0; i < steps; i++) {
              for (let j = 0; j < steps; j++) {
                const u1 = -range + (i / steps) * (2 * range);
                const u2 = -range + ((i + 1) / steps) * (2 * range);
                const v1 = -range + (j / steps) * (2 * range);
                const v2 = -range + ((j + 1) / steps) * (2 * range);

                const y1 = 1.6 * Math.exp(-(u1 * u1 + v1 * v1) / 1.5) - 0.8;
                const y2 = 1.6 * Math.exp(-(u2 * u2 + v1 * v1) / 1.5) - 0.8;
                const y3 = 1.6 * Math.exp(-(u2 * u2 + v2 * v2) / 1.5) - 0.8;
                const y4 = 1.6 * Math.exp(-(u1 * u1 + v2 * v2) / 1.5) - 0.8;

                const p1 = project3D(u1, y1, v1);
                const p2 = project3D(u2, y2, v1);
                const p3 = project3D(u2, y3, v2);
                const p4 = project3D(u1, y4, v2);

                quads.push({
                  p1, p2, p3, p4,
                  avgZ: (p1.z + p2.z + p3.z + p4.z) / 4,
                  avgY: (y1 + y2 + y3 + y4) / 4
                });
              }
            }

            quads.sort((a, b) => a.avgZ - b.avgZ);
            quads.forEach(q => {
              ctx.beginPath();
              ctx.moveTo(q.p1.x, q.p1.y);
              ctx.lineTo(q.p2.x, q.p2.y);
              ctx.lineTo(q.p3.x, q.p3.y);
              ctx.lineTo(q.p4.x, q.p4.y);
              ctx.closePath();

              const normY = Math.max(0, Math.min(1, (q.avgY + 0.8) / 1.6));
              const r = Math.round(52 + normY * 190);
              const g = Math.round(211 - normY * 100);
              const b = Math.round(153 + normY * 50);
              ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.32)`;
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.75)`;
              ctx.lineWidth = 1;
              ctx.fill();
              ctx.stroke();
            });

          } else {
            // ─── 3. Neural Synapse Wave ───
            const layers = [
              { x: -1.8, count: 2, color: '#38bdf8', label: 'In' },
              { x: -0.6, count: 4, color: '#34d399', label: 'H1' },
              { x: 0.6, count: 3, color: '#f59e0b', label: 'H2' },
              { x: 1.8, count: 1, color: '#ec4899', label: 'Out' }
            ];

            // Synapses
            for (let l = 0; l < layers.length - 1; l++) {
              const l1 = layers[l];
              const l2 = layers[l + 1];
              for (let i = 0; i < l1.count; i++) {
                const y1 = -((l1.count - 1) * 0.5) + i * 1.0;
                const p1 = project3D(l1.x, y1, 0);
                for (let j = 0; j < l2.count; j++) {
                  const y2 = -((l2.count - 1) * 0.5) + j * 1.0;
                  const p2 = project3D(l2.x, y2, 0);

                  ctx.beginPath();
                  ctx.moveTo(p1.x, p1.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
                  ctx.lineWidth = 1.2;
                  ctx.stroke();

                  // Animated pulse bead
                  const tFrac = (time * 0.8 + i * 0.2 + j * 0.15 + l * 0.3) % 1;
                  const bx = p1.x + tFrac * (p2.x - p1.x);
                  const by = p1.y + tFrac * (p2.y - p1.y);
                  ctx.beginPath();
                  ctx.arc(bx, by, 3, 0, 2 * Math.PI);
                  ctx.fillStyle = l2.color;
                  ctx.fill();
                }
              }
            }

            // Layer Nodes
            layers.forEach(l => {
              for (let i = 0; i < l.count; i++) {
                const y = -((l.count - 1) * 0.5) + i * 1.0;
                const p = project3D(l.x, y, 0);
                ctx.beginPath();
                ctx.arc(p.x, p.y, 11, 0, 2 * Math.PI);
                ctx.fillStyle = '#0f172a';
                ctx.fill();
                ctx.strokeStyle = l.color;
                ctx.lineWidth = 2.4;
                ctx.stroke();

                // Glow ring
                ctx.beginPath();
                ctx.arc(p.x, p.y, 15, 0, 2 * Math.PI);
                ctx.strokeStyle = `${l.color}44`;
                ctx.lineWidth = 1;
                ctx.stroke();
              }
            });
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mode, rotX, rotY, isAutoOrbit]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotY(prev => prev + dx * 0.7);
    setRotX(prev => Math.max(-60, Math.min(60, prev - dy * 0.7)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '860px',
        margin: '12px auto 20px auto',
        background: 'rgba(15, 23, 42, 0.85)',
        borderRadius: '16px',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(56, 189, 248, 0.15)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(12px)'
      }}
    >
      {/* Top Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          padding: '10px 16px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(51, 65, 85, 0.6)',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ⚡ Live 3D Hero Preview:
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'svc_3d', label: '🌐 3D SVC Lift' },
              { id: 'gaussian_3d', label: '🔔 3D Gaussian Bell' },
              { id: 'neural_pulse', label: '🧠 Neural Waves' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id as HeroPreviewMode)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: mode === tab.id ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.7)',
                  background: mode === tab.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                  color: mode === tab.id ? '#38bdf8' : '#94a3b8',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsAutoOrbit(!isAutoOrbit)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(51, 65, 85, 0.8)',
              color: isAutoOrbit ? '#34d399' : '#94a3b8',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isAutoOrbit ? <Pause size={12} /> : <Play size={12} />}
            <span>{isAutoOrbit ? 'Orbit On' : 'Orbit Paused'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (mode === 'neural_pulse') onLaunchStudio('deep_learning_studio');
              else onLaunchStudio('test_diagrams');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)'
            }}
          >
            <span>Launch Full Studio</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Interactive 3D Canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '240px',
          cursor: 'grab',
          touchAction: 'none'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <canvas
          ref={canvasRef}
          width={860}
          height={240}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Orbit Drag Hint */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.62rem',
            color: '#94a3b8',
            background: 'rgba(15, 23, 42, 0.75)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid rgba(51, 65, 85, 0.6)'
          }}
        >
          <Orbit size={11} color="#38bdf8" />
          <span>Drag to Orbit 3D</span>
        </div>
      </div>
    </div>
  );
};
