import React from 'react';

export interface PillOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

export interface PillSelectorProps<T extends string = string> {
  options: PillOption<T>[];
  value: T;
  onChange: (val: T) => void;
  columns?: number;
  activeColor?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function PillSelector<T extends string = string>({
  options,
  value,
  onChange,
  columns = 2,
  activeColor = 'var(--accent-cyan, #38bdf8)',
  size = 'sm',
  className = ''
}: PillSelectorProps<T>) {
  return (
    <div
      className={`pill-selector-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '6px',
        width: '100%'
      }}
    >
      {options.map((opt) => {
        const isActive = value === opt.id;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            style={{
              padding: size === 'sm' ? '5px 8px' : '7px 12px',
              borderRadius: '6px',
              fontSize: size === 'sm' ? '0.72rem' : '0.78rem',
              fontWeight: isActive ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: isActive
                ? 'var(--pill-active-bg, rgba(6, 182, 212, 0.22))'
                : 'var(--pill-bg, rgba(30, 41, 59, 0.6))',
              color: isActive ? activeColor : 'var(--text-secondary, #94a3b8)',
              border: isActive
                ? `1.5px solid ${activeColor}`
                : '1px solid var(--card-border, rgba(51, 65, 85, 0.6))',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              textTransform: 'capitalize'
            }}
          >
            {Icon && <Icon size={size === 'sm' ? 12 : 14} />}
            <span>{opt.label}</span>
            {opt.badge && (
              <span
                style={{
                  fontSize: '0.62rem',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
