import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, Activity, Sliders, Check, Copy } from 'lucide-react';
// @ts-ignore
import Cubes from './Cubes';

export const CubesPlaygroundView: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'projectile' | 'optics' | 'pendulum' | 'cubes'>('projectile');

  // ─────────────────────────────────────────────────────────────────────────────
  // MODULE 1: PROJECTILE MOTION & KINEMATICS
  // ─────────────────────────────────────────────────────────────────────────────
  const [projAngle, setProjAngle] = useState<number>(45);
  const [projVelocity, setProjVelocity] = useState<number>(30);
  const [projHeight, setProjHeight] = useState<number>(0);
  const [projGravity, setProjGravity] = useState<number>(9.8);
  const [isProjFlying, setIsProjFlying] = useState<boolean>(false);
  const [projTime, setProjTime] = useState<number>(0);
  const projCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Physics Calculations for Projectile
  const rad = (projAngle * Math.PI) / 180;
  const vx0 = projVelocity * Math.cos(rad);
  const vy0 = projVelocity * Math.sin(rad);
  const totalFlightTime = (vy0 + Math.sqrt(vy0 * vy0 + 2 * projGravity * projHeight)) / projGravity;
  const maxH = projHeight + (vy0 * vy0) / (2 * projGravity);
  const maxRange = vx0 * totalFlightTime;

  useEffect(() => {
    let animId: number;
    if (isProjFlying) {
      const startTime = performance.now() - projTime * 1000;
      const loop = (now: number) => {
        const elapsed = (now - startTime) / 1000;
        if (elapsed >= totalFlightTime) {
          setProjTime(totalFlightTime);
          setIsProjFlying(false);
        } else {
          setProjTime(elapsed);
          animId = requestAnimationFrame(loop);
        }
      };
      animId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animId);
  }, [isProjFlying, totalFlightTime]);

  // Draw Projectile Canvas
  useEffect(() => {
    const canvas = projCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Coordinate scaling
    const margin = 50;
    const scaleX = (W - margin * 2) / Math.max(100, maxRange * 1.15);
    const scaleY = (H - margin * 2) / Math.max(50, maxH * 1.3);

    // Draw Grid & Ground
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= Math.max(100, maxRange * 1.2); x += 20) {
      const cx = margin + x * scaleX;
      ctx.beginPath();
      ctx.moveTo(cx, margin);
      ctx.lineTo(cx, H - margin);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${x}m`, cx - 8, H - margin + 18);
    }

    const groundY = H - margin;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(margin, groundY);
    ctx.lineTo(W - margin, groundY);
    ctx.stroke();

    // Draw Parabolic Theoretical Trajectory Curve
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let t = 0; t <= totalFlightTime; t += 0.02) {
      const px = margin + (vx0 * t) * scaleX;
      const py = groundY - (projHeight + vy0 * t - 0.5 * projGravity * t * t) * scaleY;
      if (t === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Cannon / Launch Base
    const startY = groundY - projHeight * scaleY;
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(margin, startY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Current Ball Position
    const currentX = vx0 * projTime;
    const currentY = projHeight + vy0 * projTime - 0.5 * projGravity * projTime * projTime;
    const ballScreenX = margin + currentX * scaleX;
    const ballScreenY = groundY - Math.max(0, currentY) * scaleY;

    // Ball Velocity Vector Arrow
    const curVx = vx0;
    const curVy = vy0 - projGravity * projTime;
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ballScreenX, ballScreenY);
    ctx.lineTo(ballScreenX + curVx * 0.8, ballScreenY - curVy * 0.8);
    ctx.stroke();

    // Glowing Projectile Ball
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(ballScreenX, ballScreenY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [projAngle, projVelocity, projHeight, projGravity, projTime, maxRange, maxH, totalFlightTime, vx0, vy0]);

  // ─────────────────────────────────────────────────────────────────────────────
  // MODULE 2: WAVE OPTICS & SNELL'S LAW REFRACTION
  // ─────────────────────────────────────────────────────────────────────────────
  const [n1, setN1] = useState<number>(1.0); // Air
  const [n2, setN2] = useState<number>(1.5); // Glass
  const [incidentAngle, setIncidentAngle] = useState<number>(45);
  const opticsCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const rad1 = (incidentAngle * Math.PI) / 180;
  const sinTheta2 = (n1 / n2) * Math.sin(rad1);
  const isTIR = sinTheta2 > 1.0; // Total Internal Reflection
  const theta2Deg = isTIR ? 0 : (Math.asin(sinTheta2) * 180) / Math.PI;
  const criticalAngleDeg = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : null;

  useEffect(() => {
    const canvas = opticsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const midX = W / 2;
    const midY = H / 2;
    ctx.clearRect(0, 0, W, H);

    // Medium 1 (Top) & Medium 2 (Bottom) Fills
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(0, 0, W, midY);
    ctx.fillStyle = n2 > 1.3 ? 'rgba(6, 182, 212, 0.12)' : 'rgba(30, 41, 59, 0.6)';
    ctx.fillRect(0, midY, W, midY);

    // Interface Boundary
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(W, midY);
    ctx.stroke();

    // Normal Line (Dashed)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(midX, 20);
    ctx.lineTo(midX, H - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Incident Ray (Yellow)
    const rayLen = 180;
    const incX = midX - rayLen * Math.sin(rad1);
    const incY = midY - rayLen * Math.cos(rad1);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(incX, incY);
    ctx.lineTo(midX, midY);
    ctx.stroke();

    // Reflected Ray (Pink)
    const reflX = midX + rayLen * Math.sin(rad1);
    const reflY = midY - rayLen * Math.cos(rad1);
    ctx.strokeStyle = isTIR ? '#f43f5e' : 'rgba(244, 63, 94, 0.4)';
    ctx.lineWidth = isTIR ? 3.5 : 1.8;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(reflX, reflY);
    ctx.stroke();

    // Refracted Ray (Cyan/Green)
    if (!isTIR) {
      const rad2 = (theta2Deg * Math.PI) / 180;
      const refrX = midX + rayLen * Math.sin(rad2);
      const refrY = midY + rayLen * Math.cos(rad2);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(refrX, refrY);
      ctx.stroke();
    }
  }, [n1, n2, incidentAngle, theta2Deg, isTIR, rad1]);

  // ─────────────────────────────────────────────────────────────────────────────
  // MODULE 3: SIMPLE HARMONIC PENDULUM & ENERGY
  // ─────────────────────────────────────────────────────────────────────────────
  const [pendLength, setPendLength] = useState<number>(2.0); // meters
  const [pendMass, setPendMass] = useState<number>(1.5); // kg
  const [pendInitAngle, setPendInitAngle] = useState<number>(30); // degrees
  const [isPendRunning, setIsPendRunning] = useState<boolean>(true);
  const [pendAngle, setPendAngle] = useState<number>(30);
  const [pendOmega, setPendOmega] = useState<number>(0);
  const pendCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const pendPeriod = 2 * Math.PI * Math.sqrt(pendLength / 9.8);
  const pendFrequency = 1 / pendPeriod;

  // Live Pendulum Euler Integration
  useEffect(() => {
    let animId: number;
    let currentAngle = (pendInitAngle * Math.PI) / 180;
    let omega = 0;
    const dt = 0.02;

    const loop = () => {
      if (isPendRunning) {
        const alpha = -(9.8 / pendLength) * Math.sin(currentAngle);
        omega += alpha * dt;
        omega *= 0.9995; // light damping
        currentAngle += omega * dt;
        setPendAngle((currentAngle * 180) / Math.PI);
        setPendOmega(omega);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPendRunning, pendLength, pendInitAngle]);

  useEffect(() => {
    const canvas = pendCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const pivotX = W / 2;
    const pivotY = 50;
    ctx.clearRect(0, 0, W, H);

    // Ceiling Bracket
    ctx.fillStyle = '#334155';
    ctx.fillRect(pivotX - 50, pivotY - 12, 100, 12);

    // String & Bob
    const visualLen = pendLength * 70;
    const currentRad = (pendAngle * Math.PI) / 180;
    const bobX = pivotX + visualLen * Math.sin(currentRad);
    const bobY = pivotY + visualLen * Math.cos(currentRad);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Bob
    const bobRadius = 12 + pendMass * 3;
    ctx.fillStyle = '#a855f7';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [pendAngle, pendLength, pendMass]);

  // ─────────────────────────────────────────────────────────────────────────────
  // MODULE 4: 3D CUBES TILT MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  const [gridSize, setGridSize] = useState<number>(8);
  const [maxAngle, setMaxAngle] = useState<number>(55);
  const [rippleColor, setRippleColor] = useState<string>('#06b6d4');
  const [rippleSpeed, setRippleSpeed] = useState<number>(2);

  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const handleCopyFormula = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification('Formula Copied to Clipboard!');
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* ─── HEADER & SIMULATION NAV DOCK ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
              Interactive Physics & Visual Simulation Lab
            </h1>
            <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              Real-time educational physics engines with mathematical proofs, vector visualization & live parameter tuning
            </p>
          </div>
        </div>

        {/* Module Selector Pill Dock */}
        <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.7)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 0.6)', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setActiveModule('projectile')}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: activeModule === 'projectile' ? '#0284c7' : 'transparent', color: activeModule === 'projectile' ? '#ffffff' : '#94a3b8', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🏹 Kinematics & Projectile
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('optics')}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: activeModule === 'optics' ? '#0284c7' : 'transparent', color: activeModule === 'optics' ? '#ffffff' : '#94a3b8', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🌈 Optics & Snell's Law
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('pendulum')}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: activeModule === 'pendulum' ? '#0284c7' : 'transparent', color: activeModule === 'pendulum' ? '#ffffff' : '#94a3b8', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🕰️ Harmonic Pendulum
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('cubes')}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: activeModule === 'cubes' ? '#0284c7' : 'transparent', color: activeModule === 'cubes' ? '#ffffff' : '#94a3b8', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🧊 3D Tilt Matrix
          </button>
        </div>
      </div>

      {copiedNotification && (
        <div style={{ padding: '8px 16px', background: '#10b981', color: '#ffffff', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Check size={14} /> {copiedNotification}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 1. PROJECTILE MOTION WORKSPACE */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeModule === 'projectile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '20px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8' }}>
                PARABOLIC TRAJECTORY CANVAS (v₀ = {projVelocity} m/s, θ = {projAngle}°, g = {projGravity} m/s²)
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setIsProjFlying(true); setProjTime(0); }}
                  style={{ padding: '6px 12px', borderRadius: '8px', background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Play size={14} /> Launch Ball
                </button>
                <button
                  type="button"
                  onClick={() => { setIsProjFlying(false); setProjTime(0); }}
                  style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(51, 65, 85, 0.6)', color: '#f8fafc', border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            </div>

            <canvas ref={projCanvasRef} width={800} height={380} style={{ width: '100%', height: '380px', background: '#090d16', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 0.4)' }} />

            {/* Live Formula Deck */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>MAX APEX HEIGHT (H)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8' }}>{maxH.toFixed(2)} m</div>
                <button type="button" onClick={() => handleCopyFormula(`H = v0²·sin²(θ)/(2g) = ${maxH.toFixed(2)}m`)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.68rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <Copy size={11} /> Copy Formula
                </button>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>TOTAL HORIZONTAL RANGE (R)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#c084fc' }}>{maxRange.toFixed(2)} m</div>
                <button type="button" onClick={() => handleCopyFormula(`R = v0·cos(θ)·T = ${maxRange.toFixed(2)}m`)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.68rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <Copy size={11} /> Copy Formula
                </button>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>TOTAL TIME OF FLIGHT (T)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#34d399' }}>{totalFlightTime.toFixed(2)} s</div>
                <button type="button" onClick={() => handleCopyFormula(`T = (v0·sin(θ) + √(v0²·sin²(θ)+2gh))/g = ${totalFlightTime.toFixed(2)}s`)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.68rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <Copy size={11} /> Copy Formula
                </button>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(51, 65, 85, 0.6)', paddingBottom: '10px' }}>
              <Sliders size={18} className="text-cyan-400" />
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>Kinematics Parameters</h3>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                <span>Launch Angle (θ):</span>
                <span className="text-cyan-400">{projAngle}°</span>
              </div>
              <input type="range" min="5" max="85" value={projAngle} onChange={e => setProjAngle(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                <span>Initial Velocity (v₀):</span>
                <span className="text-cyan-400">{projVelocity} m/s</span>
              </div>
              <input type="range" min="10" max="60" value={projVelocity} onChange={e => setProjVelocity(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                <span>Initial Cliff Height (h₀):</span>
                <span className="text-cyan-400">{projHeight} m</span>
              </div>
              <input type="range" min="0" max="40" value={projHeight} onChange={e => setProjHeight(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                <span>Celestial Gravity Environment:</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {[
                  { name: '🌍 Earth', g: 9.8 },
                  { name: '🌕 Moon', g: 1.62 },
                  { name: '🔴 Mars', g: 3.71 },
                  { name: '🪐 Jupiter', g: 24.79 }
                ].map(env => (
                  <button
                    key={env.name}
                    type="button"
                    onClick={() => setProjGravity(env.g)}
                    style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid', borderColor: projGravity === env.g ? '#0284c7' : 'rgba(51, 65, 85, 0.6)', background: projGravity === env.g ? 'rgba(2, 132, 199, 0.25)' : 'transparent', color: '#f8fafc', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {env.name} ({env.g} m/s²)
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 2. OPTICS & SNELL'S LAW WORKSPACE */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeModule === 'optics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '20px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8' }}>
                RAY OPTICS (n₁ = {n1.toFixed(2)}, n₂ = {n2.toFixed(2)}, θ₁ = {incidentAngle}°)
              </div>
              {isTIR && (
                <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#ef4444', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800 }}>
                  ⚠️ TOTAL INTERNAL REFLECTION
                </span>
              )}
            </div>

            <canvas ref={opticsCanvasRef} width={800} height={380} style={{ width: '100%', height: '380px', background: '#090d16', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 0.4)' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>INCIDENT ANGLE (θ₁)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#facc15' }}>{incidentAngle}°</div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>REFRACTED ANGLE (θ₂)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: isTIR ? '#ef4444' : '#10b981' }}>
                  {isTIR ? 'None (TIR)' : `${theta2Deg.toFixed(2)}°`}
                </div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>CRITICAL ANGLE (θ_c)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#c084fc' }}>
                  {criticalAngleDeg ? `${criticalAngleDeg.toFixed(2)}°` : 'N/A (n₁ ≤ n₂)'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(51, 65, 85, 0.6)', paddingBottom: '10px' }}>
              <Sliders size={18} className="text-cyan-400" />
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>Optical Media Controls</h3>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                <span>Incident Angle (θ₁):</span>
                <span className="text-cyan-400">{incidentAngle}°</span>
              </div>
              <input type="range" min="0" max="85" value={incidentAngle} onChange={e => setIncidentAngle(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                <span>Medium 1 Index (n₁):</span>
                <span className="text-cyan-400">{n1.toFixed(2)}</span>
              </div>
              <input type="range" min="1.0" max="2.4" step="0.05" value={n1} onChange={e => setN1(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                <span>Medium 2 Index (n₂):</span>
                <span className="text-cyan-400">{n2.toFixed(2)}</span>
              </div>
              <input type="range" min="1.0" max="2.4" step="0.05" value={n2} onChange={e => setN2(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 3. PENDULUM HARMONIC OSCILLATOR */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeModule === 'pendulum' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '20px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8' }}>
                SIMPLE HARMONIC OSCILLATOR (L = {pendLength}m, m = {pendMass}kg)
              </div>
              <button
                type="button"
                onClick={() => setIsPendRunning(!isPendRunning)}
                style={{ padding: '6px 12px', borderRadius: '8px', background: isPendRunning ? '#eab308' : '#10b981', color: '#000000', border: 'none', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {isPendRunning ? <Pause size={14} /> : <Play size={14} />} {isPendRunning ? 'Pause' : 'Resume'}
              </button>
            </div>

            <canvas ref={pendCanvasRef} width={800} height={380} style={{ width: '100%', height: '380px', background: '#090d16', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 0.4)' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>PERIOD (T)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8' }}>{pendPeriod.toFixed(2)} s</div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>FREQUENCY (f)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#c084fc' }}>{pendFrequency.toFixed(2)} Hz</div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>ANGLE (θ)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#eab308' }}>{pendAngle.toFixed(1)}°</div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>ANGULAR VEL (ω)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#34d399' }}>{pendOmega.toFixed(2)} rad/s</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(51, 65, 85, 0.6)', paddingBottom: '10px' }}>
              <Sliders size={18} className="text-cyan-400" />
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>Pendulum Controls</h3>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                <span>String Length (L):</span>
                <span className="text-cyan-400">{pendLength} m</span>
              </div>
              <input type="range" min="0.5" max="4.0" step="0.1" value={pendLength} onChange={e => setPendLength(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                <span>Bob Mass (m):</span>
                <span className="text-cyan-400">{pendMass} kg</span>
              </div>
              <input type="range" min="0.5" max="5.0" step="0.2" value={pendMass} onChange={e => setPendMass(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                <span>Initial Release Angle (θ₀):</span>
                <span className="text-cyan-400">{pendInitAngle}°</span>
              </div>
              <input type="range" min="10" max="60" step="5" value={pendInitAngle} onChange={e => setPendInitAngle(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 4. 3D TILT MATRIX CUBES */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeModule === 'cubes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '20px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '16px', padding: '30px', minHeight: '440px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94a3b8' }}>
              <Zap size={14} className="text-cyan-400" />
              <span>Hover cursor or drag touch over grid to tilt 3D cubes. Click to trigger ripple pulse!</span>
            </div>

            <Cubes
              key={`${gridSize}-${maxAngle}-${rippleColor}-${rippleSpeed}`}
              gridSize={gridSize}
              maxAngle={maxAngle}
              radius={4}
              faceColor="rgba(30, 41, 59, 0.8)"
              borderStyle="1px solid rgba(56, 189, 248, 0.3)"
              rippleColor={rippleColor}
              rippleSpeed={rippleSpeed}
              autoAnimate={true}
              rippleOnClick={true}
            />
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(51, 65, 85, 0.6)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(51, 65, 85, 0.6)', paddingBottom: '10px' }}>
              <Sliders size={18} className="text-cyan-400" />
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>Matrix Controls</h3>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                <span>Grid Size:</span>
                <span className="text-cyan-400">{gridSize} x {gridSize}</span>
              </div>
              <input type="range" min="4" max="12" value={gridSize} onChange={e => setGridSize(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                <span>Max Tilt Angle:</span>
                <span className="text-cyan-400">{maxAngle}°</span>
              </div>
              <input type="range" min="20" max="80" step="5" value={maxAngle} onChange={e => setMaxAngle(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                <span>Ripple Color:</span>
                <input
                  type="color"
                  value={rippleColor}
                  onChange={e => setRippleColor(e.target.value)}
                  style={{ width: '32px', height: '22px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                <span>Ripple Speed:</span>
                <span className="text-cyan-400">{rippleSpeed}x</span>
              </div>
              <input type="range" min="1" max="5" step="0.5" value={rippleSpeed} onChange={e => setRippleSpeed(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
