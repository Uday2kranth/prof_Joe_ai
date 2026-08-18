import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Shuffle, Zap, HelpCircle } from 'lucide-react';

interface SearchingLabProps {
  activeAlgorithm?: string;
  onSelectAlgorithm: (id: string) => void;
  speed: number;
}

export const SearchingLab: React.FC<SearchingLabProps> = ({
  onSelectAlgorithm,
  speed
}) => {
  const [activeSearchAlgo, setActiveSearchAlgo] = useState<'linear_search' | 'binary_search' | 'two_pointers'>('binary_search');
  const [array, setArray] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(45);
  const [customTargetInput, setCustomTargetInput] = useState<string>('45');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showCheatsheet, setShowCheatsheet] = useState<boolean>(false);

  const [pointers, setPointers] = useState<{ low: number; mid?: number; high: number; current?: number; found?: boolean }>({ low: -1, high: -1 });
  const [comparisons, setComparisons] = useState<number>(0);

  const stepsRef = useRef<{ pointers: { low: number; mid?: number; high: number; current?: number; found?: boolean }; log: string; comp: number }[]>([]);

  const generateSortedArray = useCallback(() => {
    const arr: number[] = [];
    let current = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < 16; i++) {
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

  useEffect(() => {
    generateSortedArray();
  }, [generateSortedArray]);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* Search Algorithm Tabs & Cheatsheet */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'linear_search', name: '🔍 Linear Search (Scan One by One)' },
            { id: 'binary_search', name: '⚡ Binary Search (Halve Window [L, M, R])' },
            { id: 'two_pointers', name: '👉👈 Two-Pointer Technique (2-Sum)' }
          ].map(algo => (
            <button
              key={algo.id}
              onClick={() => {
                setActiveSearchAlgo(algo.id as any);
                onSelectAlgorithm(algo.id);
              }}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: activeSearchAlgo === algo.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                background: activeSearchAlgo === algo.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                color: activeSearchAlgo === algo.id ? '#38bdf8' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {algo.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCheatsheet(!showCheatsheet)}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: '#38bdf8',
            fontSize: '0.73rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <HelpCircle size={12} /> Search Matrix
        </button>
      </div>

      {/* Control Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        background: 'rgba(15, 23, 42, 0.8)',
        padding: '8px 14px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: isPlaying ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            {isPlaying ? 'Pause' : 'Auto Search'}
          </button>

          <button
            onClick={() => {
              if (currentStep < stepsRef.current.length - 1) {
                const next = currentStep + 1;
                setCurrentStep(next);
                setPointers(stepsRef.current[next].pointers);
                setComparisons(stepsRef.current[next].comp);
              }
            }}
            disabled={currentStep >= stepsRef.current.length - 1 || isPlaying}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            Next Step
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep(0);
              if (stepsRef.current.length > 0) {
                setPointers(stepsRef.current[0].pointers);
                setComparisons(stepsRef.current[0].comp);
              }
            }}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RotateCcw size={12} /> Reset
          </button>

          <button
            onClick={generateSortedArray}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Shuffle size={12} /> New Array
          </button>
        </div>

        {/* Target Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Target:</span>
          <input
            type="number"
            value={customTargetInput}
            onChange={(e) => setCustomTargetInput(e.target.value)}
            style={{ width: '60px', padding: '4px 6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: '#0f172a', color: '#fff', fontSize: '0.8rem' }}
          />
          <button
            onClick={handleApplyCustomTarget}
            style={{ padding: '4px 8px', borderRadius: '6px', background: '#0284c7', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
          >
            Set
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
        padding: '8px 14px',
        borderRadius: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={14} color="#38bdf8" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8' }}>
            STEP {currentStep} / {Math.max(0, stepsRef.current.length - 1)}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#f1f5f9', fontWeight: 600 }}>
            {currentLog}
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          Comparisons: <strong style={{ color: '#38bdf8' }}>{comparisons}</strong>
        </span>
      </div>

      {/* Main Array Search Board */}
      <div style={{
        flex: 1,
        minHeight: '340px',
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #030712 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '24px 16px',
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
              shadow = '0 0 20px rgba(16, 185, 129, 0.8)';
            } else if (isMid || isCurrent) {
              bg = 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)';
              border = '2px solid #fbbf24';
              shadow = '0 0 16px rgba(245, 158, 11, 0.7)';
            } else if (isLow || isHigh) {
              bg = 'linear-gradient(180deg, #a855f7 0%, #7e22ce 100%)';
              border = '2px solid #c084fc';
              shadow = '0 0 12px rgba(168, 85, 247, 0.6)';
            } else if (isOutRange) {
              bg = '#050811';
              border = '1px dashed rgba(255,255,255,0.05)';
            }

            return (
              <div key={`search-box-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                {/* Pointer Indicator */}
                <div style={{ height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isMid && <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fbbf24' }}>MID</span>}
                  {isCurrent && <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fbbf24' }}>SCAN</span>}
                  {isLow && !isMid && <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#c084fc' }}>LOW</span>}
                  {isHigh && !isMid && <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#c084fc' }}>HIGH</span>}
                </div>

                {/* Number Box */}
                <div
                  style={{
                    width: '44px',
                    height: '52px',
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
                    fontSize: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{val}</span>
                  <span style={{ fontSize: '0.55rem', color: isOutRange ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)' }}>
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
