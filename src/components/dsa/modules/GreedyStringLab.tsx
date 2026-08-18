import React, { useState } from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';

interface GreedyStringLabProps {
  activeAlgorithm?: string;
  onSelectAlgorithm?: (id: string) => void;
  speed?: number;
}

export const GreedyStringLab: React.FC<GreedyStringLabProps> = () => {
  const [text, setText] = useState<string>('ABABDABACDABABCABAB');
  const [pattern, setPattern] = useState<string>('ABABCABAB');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [textPointer, setTextPointer] = useState<number>(0);
  const [patPointer, setPatPointer] = useState<number>(0);
  const [matches, setMatches] = useState<number[]>([]);

  // Precompute LPS array
  const computeLps = (pat: string): number[] => {
    const lps = Array(pat.length).fill(0);
    let len = 0;
    let i = 1;
    while (i < pat.length) {
      if (pat[i] === pat[len]) {
        len++;
        lps[i] = len;
        i++;
      } else {
        if (len !== 0) {
          len = lps[len - 1];
        } else {
          lps[i] = 0;
          i++;
        }
      }
    }
    return lps;
  };

  const lpsArray = computeLps(pattern);

  const handleStepKMP = () => {
    if (textPointer < text.length) {
      if (pattern[patPointer] === text[textPointer]) {
        setTextPointer(prev => prev + 1);
        setPatPointer(prev => {
          const next = prev + 1;
          if (next === pattern.length) {
            setMatches(m => [...m, textPointer - next + 1]);
            return lpsArray[next - 1];
          }
          return next;
        });
      } else {
        if (patPointer !== 0) {
          setPatPointer(lpsArray[patPointer - 1]);
        } else {
          setTextPointer(prev => prev + 1);
        }
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const resetKMP = () => {
    setTextPointer(0);
    setPatPointer(0);
    setMatches([]);
    setCurrentStep(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'rgba(15, 23, 42, 0.7)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleStepKMP}
            disabled={textPointer >= text.length}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            <Play size={16} />
            <span>KMP Next Character Step</span>
          </button>

          <button
            onClick={resetKMP}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Text:</span>
            <input
              type="text"
              value={text}
              onChange={(e) => { setText(e.target.value.toUpperCase()); resetKMP(); }}
              style={{ width: '160px', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: '#0f172a', color: '#fff', fontSize: '0.8rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pattern:</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => { setPattern(e.target.value.toUpperCase()); resetKMP(); }}
              style={{ width: '100px', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: '#0f172a', color: '#fff', fontSize: '0.8rem' }}
            />
          </div>
        </div>
      </div>

      {/* Main KMP Visualizer Canvas */}
      <div style={{
        flex: 1,
        minHeight: '380px',
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #030712 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Step Banner */}
        <div style={{ position: 'absolute', top: '16px', left: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 800 }}>
            <Zap size={12} /> STEP {currentStep}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>
            Matching text[i={textPointer}] with pattern[j={patPointer}]
          </span>
        </div>

        {/* Text String Array */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '20px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', maxWidth: '100%', padding: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', width: '50px' }}>TEXT:</span>
            {text.split('').map((char, idx) => (
              <div
                key={`txt-${idx}`}
                style={{
                  width: '32px',
                  height: '38px',
                  borderRadius: '6px',
                  background: idx === textPointer ? '#38bdf8' : (matches.some(m => idx >= m && idx < m + pattern.length) ? 'rgba(16, 185, 129, 0.3)' : '#1e293b'),
                  color: idx === textPointer ? '#0f172a' : '#fff',
                  border: idx === textPointer ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem'
                }}
              >
                {char}
              </div>
            ))}
          </div>

          {/* Pattern String Array */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', maxWidth: '100%', padding: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', width: '50px' }}>PAT:</span>
            {pattern.split('').map((char, idx) => (
              <div
                key={`pat-${idx}`}
                style={{
                  width: '32px',
                  height: '38px',
                  borderRadius: '6px',
                  background: idx === patPointer ? '#f59e0b' : '#1e293b',
                  color: idx === patPointer ? '#0f172a' : '#fff',
                  border: idx === patPointer ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem'
                }}
              >
                {char}
              </div>
            ))}
          </div>

          {/* Precomputed LPS Table */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a855f7', width: '50px' }}>LPS [π]:</span>
            {lpsArray.map((val, idx) => (
              <div
                key={`lps-${idx}`}
                style={{
                  width: '32px',
                  height: '30px',
                  borderRadius: '4px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#a855f7',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 800,
                  fontSize: '0.8rem'
                }}
              >
                {val}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
