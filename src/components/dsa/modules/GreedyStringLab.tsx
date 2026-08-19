import React, { useState } from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';

interface GreedyStringLabProps {
  activeAlgorithm?: string;
  onSelectAlgorithm?: (id: string) => void;
  speed?: number;
}

export const GreedyStringLab: React.FC<GreedyStringLabProps> = () => {
  const [text, setText] = useState<string>('ABABDABABC');
  const [pattern, setPattern] = useState<string>('ABABC');
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
    if (textPointer >= text.length) return;

    if (text[textPointer] === pattern[patPointer]) {
      const nextPat = patPointer + 1;
      const nextTxt = textPointer + 1;
      setTextPointer(nextTxt);
      setPatPointer(nextPat);
      setCurrentStep(s => s + 1);

      if (nextPat === pattern.length) {
        setMatches(m => [...m, nextTxt - pattern.length]);
        setPatPointer(lpsArray[pattern.length - 1]);
      }
    } else {
      if (patPointer !== 0) {
        setPatPointer(lpsArray[patPointer - 1]);
      } else {
        setTextPointer(t => t + 1);
      }
      setCurrentStep(s => s + 1);
    }
  };

  const resetKMP = () => {
    setTextPointer(0);
    setPatPointer(0);
    setCurrentStep(0);
    setMatches([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
      {/* Top Algorithm Selector Card */}
      <div className="dsa-header-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.75)',
        padding: '8px 12px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 200px', minWidth: 0, maxWidth: '100%', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
            MATCHING:
          </span>
          <select
            value="kmp"
            disabled
            className="dsa-select-control"
            style={{
              minHeight: '36px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(30, 41, 59, 0.95)',
              border: '1.5px solid #38bdf8',
              color: '#f8fafc',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'default',
              outline: 'none',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)'
            }}
          >
            <option value="kmp">🔤 Knuth-Morris-Pratt (KMP) Automaton</option>
          </select>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', background: 'rgba(15, 23, 42, 0.7)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            title="KMP Next Character Step"
            onClick={handleStepKMP}
            disabled={textPointer >= text.length}
            className="dsa-action-btn"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Play size={13} />
            <span className="dsa-btn-label">KMP Next</span>
          </button>

          <button
            title="Reset"
            onClick={resetKMP}
            className="dsa-action-btn"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <RotateCcw size={12} />
            <span className="dsa-btn-label">Reset</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Text:</span>
            <input
              type="text"
              value={text}
              onChange={(e) => { setText(e.target.value.toUpperCase()); resetKMP(); }}
              style={{ width: '100px', padding: '3px 6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: '#0f172a', color: '#fff', fontSize: '0.75rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pat:</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => { setPattern(e.target.value.toUpperCase()); resetKMP(); }}
              style={{ width: '65px', padding: '3px 6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: '#0f172a', color: '#fff', fontSize: '0.75rem' }}
            />
          </div>
        </div>
      </div>

      {/* Main KMP Visualizer Canvas */}
      <div style={{
        flex: 1,
        minHeight: '280px',
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #030712 100%)',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Step Banner */}
        <div style={{ position: 'absolute', top: '10px', left: '12px', display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '5px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
            <Zap size={11} /> STEP {currentStep}
          </span>
          <span style={{ fontSize: '0.74rem', color: '#e2e8f0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            text[i={textPointer}] vs pat[j={patPointer}]
          </span>
        </div>

        {/* Text String Array */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '24px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', maxWidth: '100%', padding: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', width: '42px', flexShrink: 0 }}>TEXT:</span>
            {text.split('').map((char, idx) => (
              <div
                key={`txt-${idx}`}
                style={{
                  width: '28px',
                  height: '34px',
                  borderRadius: '5px',
                  background: idx === textPointer ? '#38bdf8' : (matches.some(m => idx >= m && idx < m + pattern.length) ? 'rgba(16, 185, 129, 0.3)' : '#1e293b'),
                  color: idx === textPointer ? '#0f172a' : '#fff',
                  border: idx === textPointer ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  flexShrink: 0
                }}
              >
                {char}
              </div>
            ))}
          </div>

          {/* Pattern String Array */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', maxWidth: '100%', padding: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b', width: '42px', flexShrink: 0 }}>PAT:</span>
            {pattern.split('').map((char, idx) => (
              <div
                key={`pat-${idx}`}
                style={{
                  width: '28px',
                  height: '34px',
                  borderRadius: '5px',
                  background: idx === patPointer ? '#f59e0b' : '#1e293b',
                  color: idx === patPointer ? '#0f172a' : '#fff',
                  border: idx === patPointer ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  flexShrink: 0
                }}
              >
                {char}
              </div>
            ))}
          </div>

          {/* Precomputed LPS Table */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', overflowX: 'auto', maxWidth: '100%', padding: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a855f7', width: '42px', flexShrink: 0 }}>LPS:</span>
            {lpsArray.map((val, idx) => (
              <div
                key={`lps-${idx}`}
                style={{
                  width: '28px',
                  height: '26px',
                  borderRadius: '4px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#a855f7',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  flexShrink: 0
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
