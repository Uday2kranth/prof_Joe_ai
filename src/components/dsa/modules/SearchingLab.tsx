import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Shuffle, Zap, HelpCircle, ChevronRight } from 'lucide-react';

interface SearchingLabProps {
  activeAlgorithm?: string;
  onSelectAlgorithm: (id: string) => void;
  speed: number;
}

export const SearchingLab: React.FC<SearchingLabProps> = ({
  activeAlgorithm,
  onSelectAlgorithm,
  speed
}) => {
  const [activeSearchAlgo, setActiveSearchAlgo] = useState<'linear_search' | 'binary_search' | 'two_pointers'>('binary_search');
  const [arraySize, setArraySize] = useState<number>(8);
  const [customNInput, setCustomNInput] = useState<string>('8');
  const [array, setArray] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(45);
  const [customTargetInput, setCustomTargetInput] = useState<string>('45');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showCheatsheet, setShowCheatsheet] = useState<boolean>(false);

  // Synchronize activeAlgorithm with top Bento ribbon
  useEffect(() => {
    if (activeAlgorithm && ['linear_search', 'binary_search', 'two_pointers'].includes(activeAlgorithm)) {
      setActiveSearchAlgo(activeAlgorithm as any);
      setIsPlaying(false);
      setCurrentStep(0);
    }
  }, [activeAlgorithm]);

  const [pointers, setPointers] = useState<{ low: number; mid?: number; high: number; current?: number; found?: boolean }>({ low: -1, high: -1 });
  const [comparisons, setComparisons] = useState<number>(0);

  const stepsRef = useRef<{ pointers: { low: number; mid?: number; high: number; current?: number; found?: boolean }; log: string; comp: number }[]>([]);

  const generateSortedArray = useCallback((len: number = 8) => {
    const arr: number[] = [];
    let current = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < len; i++) {
      current += Math.floor(Math.random() * 6) + 2;
      arr.push(current);
    }
    setArray(arr);
    const randomElem = arr[Math.floor(Math.random() * arr.length)];
    setTarget(randomElem);
    setCustomTargetInput(String(randomElem));
    setCurrentStep(0);
    setComparisons(0);
    setIsPlaying(false);
  }, []);

  const handleApplyN = () => {
    const n = parseInt(customNInput, 10);
    if (!isNaN(n) && n >= 4 && n <= 20) {
      setArraySize(n);
      generateSortedArray(n);
    } else {
      setCustomNInput(String(arraySize));
    }
  };

  useEffect(() => {
    generateSortedArray(arraySize);
  }, [generateSortedArray, arraySize]);

  // Compile search simulation steps
  const compileSearchSteps = useCallback(() => {
    if (array.length === 0) return;
    const history: { pointers: { low: number; mid?: number; high: number; current?: number; found?: boolean }; log: string; comp: number }[] = [];
    let compCount = 0;

    // 1. LINEAR SEARCH
    if (activeSearchAlgo === 'linear_search') {
      for (let i = 0; i < array.length; i++) {
        compCount++;
        if (array[i] === target) {
          history.push({
            pointers: { low: -1, high: -1, current: i, found: true },
            log: `TARGET FOUND! arr[${i}] == ${target} (Total Comparisons: ${compCount})`,
            comp: compCount
          });
          break;
        } else {
          history.push({
            pointers: { low: -1, high: -1, current: i, found: false },
            log: `Scanning index ${i}: arr[${i}] (${array[i]}) != target (${target})`,
            comp: compCount
          });
        }
      }
    }
    // 2. BINARY SEARCH
    else if (activeSearchAlgo === 'binary_search') {
      let low = 0;
      let high = array.length - 1;
      let found = false;

      while (low <= high) {
        compCount++;
        const mid = Math.floor(low + (high - low) / 2);
        const midVal = array[mid];

        if (midVal === target) {
          history.push({
            pointers: { low, mid, high, found: true },
            log: `TARGET FOUND at index ${mid}! arr[${mid}] == ${target}`,
            comp: compCount
          });
          found = true;
          break;
        } else if (midVal < target) {
          history.push({
            pointers: { low, mid, high, found: false },
            log: `arr[mid=${mid}] (${midVal}) < target (${target}). Eliminating left window [${low}..${mid}]. Adjusting Low to ${mid + 1}.`,
            comp: compCount
          });
          low = mid + 1;
        } else {
          history.push({
            pointers: { low, mid, high, found: false },
            log: `arr[mid=${mid}] (${midVal}) > target (${target}). Eliminating right window [${mid}..${high}]. Adjusting High to ${mid - 1}.`,
            comp: compCount
          });
          high = mid - 1;
        }
      }

      if (!found) {
        history.push({
          pointers: { low, high, found: false },
          log: `Search window empty (Low > High). Target ${target} not present in array.`,
          comp: compCount
        });
      }
    }
    // 3. TWO POINTERS
    else if (activeSearchAlgo === 'two_pointers') {
      let l = 0, r = array.length - 1;
      const targetSum = target * 2;

      while (l < r) {
        compCount++;
        const currentSum = array[l] + array[r];
        if (currentSum === targetSum) {
          history.push({
            pointers: { low: l, high: r, found: true },
            log: `PAIR FOUND! arr[${l}] (${array[l]}) + arr[${r}] (${array[r]}) == Target Sum (${targetSum})`,
            comp: compCount
          });
          break;
        } else if (currentSum < targetSum) {
          history.push({
            pointers: { low: l, high: r, found: false },
            log: `Sum (${currentSum}) < Target (${targetSum}). Shifting Left pointer rightward (L: ${l} → ${l + 1})`,
            comp: compCount
          });
          l++;
        } else {
          history.push({
            pointers: { low: l, high: r, found: false },
            log: `Sum (${currentSum}) > Target (${targetSum}). Shifting Right pointer leftward (R: ${r} → ${r - 1})`,
            comp: compCount
          });
          r--;
        }
      }
    }

    stepsRef.current = history;
    setCurrentStep(0);
    if (history.length > 0) {
      setPointers(history[0].pointers);
      setComparisons(history[0].comp);
    }
  }, [activeSearchAlgo, array, target]);

  useEffect(() => {
    compileSearchSteps();
  }, [compileSearchSteps]);

  // Player Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && stepsRef.current.length > 0) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= stepsRef.current.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          const snap = stepsRef.current[next];
          if (snap) {
            setPointers(snap.pointers);
            setComparisons(snap.comp);
          }
          return next;
        });
      }, Math.max(80, 800 / speed));
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const handleApplyCustomTarget = () => {
    const val = parseInt(customTargetInput, 10);
    if (!isNaN(val)) {
      setTarget(val);
      setIsPlaying(false);
    }
  };

  const currentLog = stepsRef.current[currentStep]?.log || 'Search initialized.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
      {/* Search Algorithm Dropdown & Cheatsheet */}
      {/* Consolidated Searching Lab Control Deck with Unified [Set] Controls */}
      <div className="dsa-header-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.8)',
        padding: '8px 12px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {/* Left: Action Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            title={isPlaying ? 'Pause' : 'Play'}
            onClick={() => setIsPlaying(!isPlaying)}
            className="dsa-action-btn"
            style={{
              border: 'none',
              background: isPlaying ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              padding: '5px 10px',
              borderRadius: '7px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 700,
              fontSize: '0.74rem'
            }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            title="Next Step"
            onClick={() => {
              if (currentStep < stepsRef.current.length - 1) {
                const next = currentStep + 1;
                setCurrentStep(next);
                setPointers(stepsRef.current[next].pointers);
                setComparisons(stepsRef.current[next].comp);
              }
            }}
            disabled={currentStep >= stepsRef.current.length - 1 || isPlaying}
            className="dsa-action-btn"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              opacity: currentStep >= stepsRef.current.length - 1 ? 0.4 : 1,
              padding: '5px 8px',
              borderRadius: '7px',
              cursor: 'pointer'
            }}
          >
            <ChevronRight size={14} />
          </button>

          <button
            type="button"
            title="Reset Search"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep(0);
              if (stepsRef.current.length > 0) {
                setPointers(stepsRef.current[0].pointers);
                setComparisons(stepsRef.current[0].comp);
              }
            }}
            className="dsa-action-btn"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-muted, #94a3b8)',
              padding: '5px 8px',
              borderRadius: '7px',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={13} />
          </button>

          <button
            type="button"
            title="Generate New Random Sorted Array"
            onClick={() => generateSortedArray(arraySize)}
            className="dsa-action-btn"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#38bdf8',
              padding: '5px 8px',
              borderRadius: '7px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}
          >
            <Shuffle size={12} />
            <span>New Array</span>
          </button>
        </div>

        {/* Center/Right: Target and N [Set] Inputs & Matrix Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Target Input with [Set] */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>Target:</span>
            <input
              type="number"
              value={customTargetInput}
              onChange={(e) => setCustomTargetInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCustomTarget(); }}
              style={{
                width: '44px',
                padding: '3px 5px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: '#0f172a',
                color: '#fff',
                fontSize: '0.76rem',
                textAlign: 'center',
                outline: 'none'
              }}
            />
            <button
              type="button"
              title="Set Target"
              onClick={handleApplyCustomTarget}
              className="dsa-action-btn"
              style={{
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                padding: '3px 8px',
                borderRadius: '5px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Set
            </button>
          </div>

          {/* Array Size N Input with [Set] */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>N:</span>
            <input
              type="number"
              min={4}
              max={20}
              value={customNInput}
              onChange={(e) => setCustomNInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyN(); }}
              style={{
                width: '40px',
                padding: '3px 5px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: '#0f172a',
                color: '#fff',
                fontSize: '0.76rem',
                textAlign: 'center',
                outline: 'none'
              }}
            />
            <button
              type="button"
              title="Set Array Size"
              onClick={handleApplyN}
              className="dsa-action-btn"
              style={{
                background: 'var(--accent-cyan, #0284c7)',
                color: '#fff',
                border: 'none',
                padding: '3px 8px',
                borderRadius: '5px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Set
            </button>
          </div>

          {/* Matrix Cheatsheet Button */}
          <button
            type="button"
            title="Searching Comparison Matrix"
            onClick={() => setShowCheatsheet(!showCheatsheet)}
            className="dsa-action-btn"
            style={{
              border: '1px solid rgba(56, 189, 248, 0.4)',
              background: showCheatsheet ? '#0284c7' : 'rgba(56, 189, 248, 0.12)',
              color: showCheatsheet ? '#fff' : '#38bdf8',
              padding: '3px 8px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}
          >
            <HelpCircle size={13} />
            <span>Matrix</span>
          </button>
        </div>
      </div>

      {/* Narrative Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(2, 132, 199, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        padding: '6px 12px',
        borderRadius: '8px',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
          <Zap size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38bdf8', flexShrink: 0 }}>
            {currentStep}/{Math.max(0, stepsRef.current.length - 1)}
          </span>
          <span style={{ fontSize: '0.76rem', color: '#f1f5f9', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentLog}
          </span>
        </div>

        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
          Comparisons: <strong style={{ color: '#38bdf8' }}>{comparisons}</strong>
        </span>
      </div>

      {/* Search Visualizer Canvas */}
      <div style={{
        flex: 1,
        minHeight: '260px',
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #030712 100%)',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '100%' }}>
          {array.map((val, idx) => {
            const isMid = pointers.mid === idx;
            const isLow = pointers.low === idx;
            const isHigh = pointers.high === idx;
            const isCurrent = pointers.current === idx;
            const isFound = ((isMid || isCurrent) && pointers.found) || (pointers.found && (isLow || isHigh) && activeSearchAlgo === 'two_pointers');
            const isOutRange = activeSearchAlgo === 'binary_search' && pointers.low !== -1 && (idx < pointers.low || idx > pointers.high);

            let bg = 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)';
            let border = '1px solid rgba(255,255,255,0.15)';
            let shadow = 'none';

            if (isFound) {
              bg = 'linear-gradient(180deg, #10b981 0%, #047857 100%)';
              border = '2px solid #34d399';
              shadow = '0 0 16px rgba(16, 185, 129, 0.8)';
            } else if (isMid || isCurrent) {
              bg = 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)';
              border = '2px solid #fbbf24';
              shadow = '0 0 14px rgba(245, 158, 11, 0.7)';
            } else if (isLow || isHigh) {
              bg = 'linear-gradient(180deg, #a855f7 0%, #7e22ce 100%)';
              border = '2px solid #c084fc';
              shadow = '0 0 10px rgba(168, 85, 247, 0.6)';
            } else if (isOutRange) {
              bg = '#050811';
              border = '1px dashed rgba(255,255,255,0.05)';
            }

            return (
              <div key={`search-box-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                {/* Pointer Indicator */}
                <div style={{ height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isMid && <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#fbbf24' }}>MID</span>}
                  {isCurrent && <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#fbbf24' }}>SCAN</span>}
                  {isLow && !isMid && <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#c084fc' }}>LOW</span>}
                  {isHigh && !isMid && <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#c084fc' }}>HIGH</span>}
                </div>

                {/* Number Box */}
                <div
                  style={{
                    width: '38px',
                    height: '44px',
                    borderRadius: '8px',
                    background: bg,
                    border,
                    boxShadow: shadow,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: isOutRange ? 'rgba(255,255,255,0.2)' : '#fff',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{val}</span>
                  <span style={{ fontSize: '0.52rem', color: isOutRange ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)' }}>
                    [{idx}]
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coddy-style Searching Comparison Table */}
      {showCheatsheet && (
        <div style={{
          background: '#030712',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          padding: '12px',
          overflowX: 'auto'
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', marginBottom: '8px', display: 'block' }}>
            Searching Algorithms Comparison Matrix
          </span>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '6px 10px' }}>Algorithm</th>
                <th style={{ padding: '6px 10px' }}>Best</th>
                <th style={{ padding: '6px 10px' }}>Average</th>
                <th style={{ padding: '6px 10px' }}>Worst</th>
                <th style={{ padding: '6px 10px' }}>Space</th>
                <th style={{ padding: '6px 10px' }}>Needs Sorted Data?</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Linear Search', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)', sorted: 'No' },
                { name: 'Binary Search', best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)', sorted: 'Yes' },
                { name: 'Two-Pointer Technique', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)', sorted: 'Yes' }
              ].map((row, idx) => (
                <tr key={`search-comp-${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: 700, color: '#f8fafc' }}>{row.name}</td>
                  <td style={{ padding: '6px 10px', color: '#34d399' }}>{row.best}</td>
                  <td style={{ padding: '6px 10px', color: '#38bdf8' }}>{row.avg}</td>
                  <td style={{ padding: '6px 10px', color: '#ef4444' }}>{row.worst}</td>
                  <td style={{ padding: '6px 10px', color: '#c084fc' }}>{row.space}</td>
                  <td style={{ padding: '6px 10px', fontWeight: 700, color: row.sorted === 'Yes' ? '#fbbf24' : '#94a3b8' }}>{row.sorted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
