import React, { useState } from 'react';
import { Box, Sliders, Zap } from 'lucide-react';
// @ts-ignore
import Cubes from './Cubes';

export const CubesPlaygroundView: React.FC = () => {
  const [gridSize, setGridSize] = useState<number>(8);
  const [maxAngle, setMaxAngle] = useState<number>(55);
  const [rippleColor, setRippleColor] = useState<string>('#06b6d4');
  const [rippleSpeed, setRippleSpeed] = useState<number>(2);
  const [autoAnimate, setAutoAnimate] = useState<boolean>(true);
  const [rippleOnClick, setRippleOnClick] = useState<boolean>(true);

  const colorPresets = [
    { label: 'Cyan Glow', value: '#06b6d4' },
    { label: 'Purple Neon', value: '#a855f7' },
    { label: 'Rose Gold', value: '#f43f5e' },
    { label: 'Amber Spark', value: '#f59e0b' },
    { label: 'Emerald Tech', value: '#10b981' }
  ];

  return (
    <div className="cubes-playground-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="playground-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Box className="text-cyan-400" size={26} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Interactive 3D Cubes Playground</h2>
            <p className="subtitle" style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Interactive 3D matrix simulation with pointer tilt physics, touch gestures, and ripple effects
            </p>
          </div>
        </div>
      </div>

      <div className="playground-content-grid">
        {/* 3D Cubes Stage (Renders First on Mobile) */}
        <div className="stage-card card-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', border: '1px solid var(--border-color)', borderRadius: '16px', minHeight: '440px', position: 'relative' }}>
          <div className="stage-card-hint" style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Zap size={14} className="text-cyan-400" />
            <span>Hover cursor or drag touch over grid to tilt 3D cubes. Click to trigger ripple pulse!</span>
          </div>

          <Cubes
            key={`${gridSize}-${maxAngle}-${rippleColor}-${rippleSpeed}-${autoAnimate}`}
            gridSize={gridSize}
            maxAngle={maxAngle}
            radius={4}
            faceColor="var(--cube-face-bg)"
            borderStyle="var(--cube-face-border)"
            rippleColor={rippleColor}
            rippleSpeed={rippleSpeed}
            autoAnimate={autoAnimate}
            rippleOnClick={rippleOnClick}
          />
        </div>

        {/* Customization Control Panel */}
        <div className="control-panel card-box" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Sliders size={18} className="text-cyan-400" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Physics Controls</h3>
          </div>

          {/* Grid Size Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
              <span>Grid Matrix Size:</span>
              <span className="text-cyan-400">{gridSize} x {gridSize}</span>
            </div>
            <input
              type="range"
              min="4"
              max="12"
              step="1"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#06b6d4' }}
            />
          </div>

          {/* Max Angle Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
              <span>Max Tilt Angle:</span>
              <span className="text-cyan-400">{maxAngle}°</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              step="5"
              value={maxAngle}
              onChange={(e) => setMaxAngle(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#06b6d4' }}
            />
          </div>

          {/* Ripple Speed Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
              <span>Ripple Propagation Speed:</span>
              <span className="text-cyan-400">{rippleSpeed}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={rippleSpeed}
              onChange={(e) => setRippleSpeed(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#06b6d4' }}
            />
          </div>

          {/* Ripple Color Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Ripple Color Glow:</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {colorPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setRippleColor(preset.value)}
                  style={{
                    background: preset.value,
                    border: rippleColor === preset.value ? '2px solid #ffffff' : '1px solid transparent',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: rippleColor === preset.value ? `0 0 12px ${preset.value}` : 'none'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              <span>Auto Idle Movement:</span>
              <input
                type="checkbox"
                checked={autoAnimate}
                onChange={(e) => setAutoAnimate(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#06b6d4' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              <span>Click Ripple Wave:</span>
              <input
                type="checkbox"
                checked={rippleOnClick}
                onChange={(e) => setRippleOnClick(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#06b6d4' }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
