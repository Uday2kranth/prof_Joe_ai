import React, { useState, useEffect } from 'react';

export interface DualParamControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  color?: string;
  precision?: number;
  tooltip?: string;
  className?: string;
}

export const DualParamControl: React.FC<DualParamControlProps> = ({
  label,
  value,
  min,
  max,
  step = 0.01,
  unit = '',
  onChange,
  color = 'var(--accent-cyan, #38bdf8)',
  precision = 2,
  tooltip,
  className = ''
}) => {
  // Local string state to allow natural decimal and negative number typing without premature truncation
  const [localStr, setLocalStr] = useState<string>(value.toFixed(precision));

  useEffect(() => {
    // Sync local text when external prop changes, unless user is actively typing an intermediate valid value
    const parsed = parseFloat(localStr);
    if (isNaN(parsed) || Math.abs(parsed - value) > 1e-5) {
      setLocalStr(Number.isInteger(value) ? value.toString() : value.toFixed(precision));
    }
  }, [value, precision]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setLocalStr(text);
    const parsed = parseFloat(text);
    if (!isNaN(parsed)) {
      // Clamp within safe bounds if desired, or pass through
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(val);
    setLocalStr(Number.isInteger(val) ? val.toString() : val.toFixed(precision));
  };

  return (
    <div
      className={`dual-param-control-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: '100%'
      }}
      title={tooltip}
    >
      {/* Top Header: Label + Direct Number Input Box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}
      >
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: 'var(--text-secondary, #cbd5e1)',
            userSelect: 'none'
          }}
        >
          {label}
        </span>

        {/* Direct Number Input Box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={localStr}
            onChange={handleInputChange}
            style={{
              width: '58px',
              height: '24px',
              padding: '2px 4px',
              borderRadius: '4px',
              border: '1px solid var(--card-border, rgba(51, 65, 85, 0.8))',
              background: 'var(--input-dock-bg, rgba(9, 13, 22, 0.85))',
              color: color,
              fontSize: '0.74rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono, monospace)',
              textAlign: 'right',
              outline: 'none',
              transition: 'border-color 0.15s ease'
            }}
            onFocus={(e) => (e.target.style.borderColor = color)}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--card-border, rgba(51, 65, 85, 0.8))';
              const parsed = parseFloat(localStr);
              if (isNaN(parsed)) {
                setLocalStr(value.toFixed(precision));
              }
            }}
          />
          {unit && (
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-muted, #64748b)',
                fontFamily: 'var(--font-mono, monospace)'
              }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Range Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        style={{
          width: '100%',
          height: '4px',
          accentColor: color,
          cursor: 'pointer'
        }}
      />
    </div>
  );
};
