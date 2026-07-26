import React from 'react';
import './BorderBeam.css';

interface BorderBeamProps {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
  className?: string;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  size = 140,
  duration = 6,
  delay = 0,
  colorFrom = '#06b6d4',
  colorTo = '#a855f7',
  borderWidth = 2,
  className = ''
}) => {
  return (
    <div
      className={`border-beam-container ${className}`}
      style={{
        '--border-beam-width': `${borderWidth}px`,
        '--border-beam-size': `${size}px`,
        '--border-beam-duration': `${duration}s`,
        '--border-beam-delay': `${delay}s`,
        '--border-beam-color-from': colorFrom,
        '--border-beam-color-to': colorTo,
      } as React.CSSProperties}
    >
      <div className="border-beam-element" />
    </div>
  );
};
