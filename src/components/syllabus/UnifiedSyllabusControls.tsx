import React from 'react';

// ─── 1. Unified Button ──────────────────────────────────────────────────────
export interface UnifiedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'launch' | 'accent' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  active?: boolean;
}

export const UnifiedButton: React.FC<UnifiedButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'sm',
  icon,
  active = false,
  className = '',
  style = {},
  ...props
}) => {
  const getPadding = () => {
    switch (size) {
      case 'xs': return '4px 8px';
      case 'sm': return '6px 12px';
      case 'md': return '8px 16px';
      case 'lg': return '10px 20px';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'xs': return '0.72rem';
      case 'sm': return '0.78rem';
      case 'md': return '0.86rem';
      case 'lg': return '0.94rem';
    }
  };

  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: getPadding(),
      fontSize: getFontSize(),
      fontWeight: 700,
      fontFamily: 'var(--font-main, inherit)',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      border: '1px solid transparent',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      ...style
    };

    switch (variant) {
      case 'primary':
        return {
          ...base,
          background: 'var(--btn-primary-bg, linear-gradient(135deg, #06b6d4, #0891b2))',
          color: 'var(--btn-primary-text, #020617)',
          border: '1px solid var(--btn-primary-border, #06b6d4)',
          boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'
        };
      case 'launch':
        return {
          ...base,
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.85), rgba(59, 130, 246, 0.85))',
          color: '#ffffff',
          border: '1px solid rgba(56, 189, 248, 0.5)',
          boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)'
        };
      case 'accent':
        return {
          ...base,
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.85), rgba(147, 51, 234, 0.85))',
          color: '#ffffff',
          border: '1px solid rgba(192, 132, 252, 0.4)',
          boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)'
        };
      case 'ghost':
        return {
          ...base,
          background: 'transparent',
          color: active ? 'var(--accent-cyan, #38bdf8)' : 'var(--text-secondary, #94a3b8)',
          border: active ? '1px solid var(--accent-cyan, #06b6d4)' : '1px solid transparent'
        };
      case 'secondary':
      default:
        return {
          ...base,
          background: active
            ? 'var(--pill-active-bg, rgba(6, 182, 212, 0.22))'
            : 'var(--card-bg, rgba(15, 23, 42, 0.85))',
          color: active ? 'var(--accent-cyan, #38bdf8)' : 'var(--text-primary, #f8fafc)',
          border: active
            ? '1.5px solid var(--accent-cyan, #06b6d4)'
            : '1px solid var(--card-border, rgba(255, 255, 255, 0.08))',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        };
    }
  };

  return (
    <button className={`unified-ui-btn ${className}`} style={getStyles()} {...props}>
      {icon && <span className="unified-btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

// ─── 2. Unified Bento Tile ──────────────────────────────────────────────────
export interface UnifiedBentoTileProps {
  icon: string | React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  active?: boolean;
  onClick?: () => void;
  accentColor?: string;
  footerText?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const UnifiedBentoTile: React.FC<UnifiedBentoTileProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor = 'var(--accent-cyan, #38bdf8)',
  active = false,
  onClick,
  accentColor = 'var(--accent-cyan, #38bdf8)',
  footerText,
  className = '',
  style = {}
}) => {
  return (
    <div
      onClick={onClick}
      className={`unified-bento-tile ${active ? 'active' : ''} ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: '14px',
        cursor: onClick ? 'pointer' : 'default',
        background: active
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))'
          : 'var(--card-bg, rgba(11, 17, 32, 0.88))',
        border: active
          ? `1.5px solid ${accentColor}`
          : '1px solid var(--card-border, rgba(255, 255, 255, 0.08))',
        boxShadow: active
          ? `0 6px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(6, 182, 212, 0.15)`
          : '0 4px 12px rgba(0, 0, 0, 0.25)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        {badge && (
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(0, 0, 0, 0.4)',
              color: badgeColor,
              border: `1px solid ${badgeColor}33`,
              letterSpacing: '0.04em'
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div>
        <h4
          style={{
            margin: '0 0 4px 0',
            fontSize: '0.88rem',
            fontWeight: 800,
            color: active ? accentColor : 'var(--text-primary, #f8fafc)',
            fontFamily: 'var(--font-main, inherit)'
          }}
        >
          {title}
        </h4>
        {subtitle && (
          <p
            style={{
              margin: 0,
              fontSize: '0.74rem',
              color: 'var(--text-secondary, #94a3b8)',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {footerText && (
        <div
          style={{
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.68rem',
            fontWeight: 700,
            color: active ? accentColor : 'var(--text-muted, #64748b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>{footerText}</span>
          <span>{active ? '● Active' : 'Select →'}</span>
        </div>
      )}
    </div>
  );
};

// ─── 3. Unified Search Bar ──────────────────────────────────────────────────
export interface UnifiedSearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  keywords?: string[];
  onSelectKeyword?: (kw: string) => void;
}

export const UnifiedSearchInput: React.FC<UnifiedSearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search syllabus modules, theorems, formulas, or textbooks...',
  keywords = ['SVD', 'Backprop', 'Attention', 'Dijkstra', 'AVL Rotations', 'KKT Duality'],
  onSelectKeyword
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px 16px',
        borderRadius: '14px',
        background: 'var(--card-bg, rgba(15, 23, 42, 0.85))',
        border: '1px solid var(--card-border, rgba(255, 255, 255, 0.08))',
        boxShadow: 'var(--card-shadow)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
        <span style={{ fontSize: '1rem', color: 'var(--accent-cyan, #06b6d4)' }}>🔍</span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'var(--bg-primary, #020617)',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'var(--text-primary, #f8fafc)',
            fontSize: '0.80rem',
            fontFamily: 'var(--font-mono, monospace)',
            outline: 'none'
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted, #64748b)',
              cursor: 'pointer',
              fontSize: '0.88rem'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {keywords.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingTop: '2px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>Quick:</span>
          {keywords.map(kw => (
            <button
              key={kw}
              type="button"
              onClick={() => onSelectKeyword ? onSelectKeyword(kw) : onChange(kw)}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary, #1e293b)',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                color: 'var(--text-secondary, #94a3b8)',
                fontSize: '0.70rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              #{kw}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── 4. Unified Mastery Checkbox ────────────────────────────────────────────
export interface UnifiedMasteryCheckboxProps {
  checked: boolean;
  onChange: () => void;
  title?: string;
}

export const UnifiedMasteryCheckbox: React.FC<UnifiedMasteryCheckboxProps> = ({
  checked,
  onChange,
  title
}) => {
  return (
    <button
      type="button"
      onClick={onChange}
      title={title || (checked ? 'Mark as Incomplete' : 'Mark as Mastered')}
      style={{
        width: '24px',
        height: '24px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: checked ? '#10b981' : 'var(--bg-tertiary, #1e293b)',
        color: checked ? '#020617' : 'transparent',
        border: checked ? '1px solid #10b981' : '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
        fontSize: '0.76rem',
        fontWeight: 900,
        cursor: 'pointer',
        boxShadow: checked ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none',
        transition: 'all 0.15s ease',
        flexShrink: 0
      }}
    >
      {checked ? '✓' : ''}
    </button>
  );
};
