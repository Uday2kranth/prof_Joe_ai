import React, { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';

interface DynamicProgrammingLabProps {
  activeAlgorithm?: string;
  onSelectAlgorithm: (id: string) => void;
  speed?: number;
}

export const DynamicProgrammingLab: React.FC<DynamicProgrammingLabProps> = ({
  onSelectAlgorithm
}) => {
  const [activeDpAlgo, setActiveDpAlgo] = useState<'knapsack' | 'lcs' | 'coin_change' | 'fibonacci'>('knapsack');

  // 1. KNAPSACK STATE
  const knapsackCapacity = 6;
  const items = [
    { wt: 1, val: 1, name: 'Item 1' },
    { wt: 2, val: 4, name: 'Item 2' },
    { wt: 3, val: 5, name: 'Item 3' },
    { wt: 4, val: 7, name: 'Item 4' }
  ];
  const [knapsackTable, setKnapsackTable] = useState<number[][]>([]);
  const [knapsackStep, setKnapsackStep] = useState<number>(0);

  // 2. LCS STATE
  const str1 = 'AGGTAB';
  const str2 = 'GXTXAYB';
  const [lcsTable, setLcsTable] = useState<number[][]>([]);
  const [lcsStep, setLcsStep] = useState<number>(0);

  // 3. COIN CHANGE STATE
  const coins = [1, 2, 5];
  const targetAmount = 11;
  const [coinTable, setCoinTable] = useState<number[]>([]);
  const [coinStep, setCoinStep] = useState<number>(0);

  // 4. FIBONACCI STATE
  const fibN = 7;
  const [fibTable, setFibTable] = useState<number[]>([0, 1]);
  const [fibStep, setFibStep] = useState<number>(2);

  const [narrative, setNarrative] = useState<string>('Select a dynamic programming problem to explore table filling.');

  // Reset Tables
  const initAllTables = useCallback(() => {
    // Knapsack Table
    const kTable: number[][] = Array(items.length + 1)
      .fill(0)
      .map(() => Array(knapsackCapacity + 1).fill(0));
    setKnapsackTable(kTable);
    setKnapsackStep(0);

    // LCS Table
    const lTable: number[][] = Array(str1.length + 1)
      .fill(0)
      .map(() => Array(str2.length + 1).fill(0));
    setLcsTable(lTable);
    setLcsStep(0);

    // Coin Change Table
    const cTable: number[] = Array(targetAmount + 1).fill(Infinity);
    cTable[0] = 0;
    setCoinTable(cTable);
    setCoinStep(1);

    // Fibonacci Table
    setFibTable([0, 1]);
    setFibStep(2);

    setNarrative('DP tables initialized. Click Step Forward to compute optimal subproblems.');
  }, [items.length, knapsackCapacity, str1.length, str2.length, targetAmount]);

  useEffect(() => {
    initAllTables();
  }, [initAllTables]);

  const stepForward = () => {
    // 1. Knapsack Step
    if (activeDpAlgo === 'knapsack') {
      let stepCount = 0;
      setKnapsackTable(prev => {
        const next = prev.map(r => [...r]);
        for (let i = 1; i <= items.length; i++) {
          for (let w = 1; w <= knapsackCapacity; w++) {
            if (stepCount === knapsackStep) {
              const item = items[i - 1];
              if (item.wt <= w) {
                next[i][w] = Math.max(item.val + next[i - 1][w - item.wt], next[i - 1][w]);
              } else {
                next[i][w] = next[i - 1][w];
              }
              setNarrative(`Filled DP[${i}][${w}] = ${next[i][w]} for item (${item.name}, wt=${item.wt}, val=${item.val}) at capacity ${w}.`);
              setKnapsackStep(s => s + 1);
              return next;
            }
            stepCount++;
          }
        }
        setNarrative('Knapsack DP table full! Optimal maximum value is ' + next[items.length][knapsackCapacity]);
        return next;
      });
    }
    // 2. LCS Step
    else if (activeDpAlgo === 'lcs') {
      let stepCount = 0;
      setLcsTable(prev => {
        const next = prev.map(r => [...r]);
        for (let i = 1; i <= str1.length; i++) {
          for (let j = 1; j <= str2.length; j++) {
            if (stepCount === lcsStep) {
              if (str1[i - 1] === str2[j - 1]) {
                next[i][j] = 1 + next[i - 1][j - 1];
                setNarrative(`Match! str1[${i - 1}] == str2[${j - 1}] ('${str1[i - 1]}'). DP[${i}][${j}] = 1 + DP[${i - 1}][${j - 1}] = ${next[i][j]}.`);
              } else {
                next[i][j] = Math.max(next[i - 1][j], next[i][j - 1]);
                setNarrative(`No match. DP[${i}][${j}] = max(DP[${i - 1}][${j}], DP[${i}][${j - 1}]) = ${next[i][j]}.`);
              }
              setLcsStep(s => s + 1);
              return next;
            }
            stepCount++;
          }
        }
        setNarrative('LCS table full! Longest Common Subsequence length is ' + next[str1.length][str2.length] + ' (LCS: "GTAB")');
        return next;
      });
    }
    // 3. Coin Change Step
    else if (activeDpAlgo === 'coin_change') {
      if (coinStep <= targetAmount) {
        setCoinTable(prev => {
          const next = [...prev];
          const a = coinStep;
          for (const c of coins) {
            if (a - c >= 0 && next[a - c] !== Infinity) {
              next[a] = Math.min(next[a], 1 + next[a - c]);
            }
          }
          setNarrative(`Amount ${a}: Min coins = ${next[a] === Infinity ? '∞' : next[a]}`);
          return next;
        });
        setCoinStep(s => s + 1);
      }
    }
    // 4. Fibonacci Step
    else if (activeDpAlgo === 'fibonacci') {
      if (fibStep <= fibN) {
        setFibTable(prev => {
          const next = [...prev];
          next[fibStep] = next[fibStep - 1] + next[fibStep - 2];
          setNarrative(`Computed Fib(${fibStep}) = Fib(${fibStep - 1}) + Fib(${fibStep - 2}) = ${next[fibStep - 1]} + ${next[fibStep - 2]} = ${next[fibStep]}`);
          return next;
        });
        setFibStep(s => s + 1);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* 4 DP Algorithm Tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {[
          { id: 'knapsack', name: '🎒 0/1 Knapsack (2D Table)' },
          { id: 'lcs', name: '🔤 Longest Common Subsequence (LCS)' },
          { id: 'coin_change', name: '🪙 Making Change (Coin Change)' },
          { id: 'fibonacci', name: '🔢 Fibonacci (Memoization vs Tabulation)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveDpAlgo(tab.id as any);
              onSelectAlgorithm(tab.id);
              initAllTables();
            }}
            style={{
              padding: '5px 12px',
              borderRadius: '8px',
              border: activeDpAlgo === tab.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
              background: activeDpAlgo === tab.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.6)',
              color: activeDpAlgo === tab.id ? '#38bdf8' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Control Action Bar */}
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
            onClick={stepForward}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Play size={13} /> Compute Next Cell
          </button>

          <button
            onClick={initAllTables}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={12} /> Reset Table
          </button>
        </div>
      </div>

      {/* Narrative Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(2, 132, 199, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        padding: '8px 14px',
        borderRadius: '10px'
      }}>
        <Zap size={14} color="#38bdf8" />
        <span style={{ fontSize: '0.8rem', color: '#f1f5f9', fontWeight: 600 }}>
          {narrative}
        </span>
      </div>

      {/* DP Table Viewport */}
      <div style={{
        flex: 1,
        minHeight: '380px',
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #030712 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto'
      }}>
        {/* 1. 0/1 KNAPSACK TABLE */}
        {activeDpAlgo === 'knapsack' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>
              Recurrence: DP[i][w] = max(val_i + DP[i-1][w - wt_i], DP[i-1][w])
            </span>
            <table style={{ borderCollapse: 'collapse', textAlign: 'center', borderRadius: '8px', overflow: 'hidden', border: '1px solid #38bdf8' }}>
              <thead>
                <tr style={{ background: '#0284c7', color: '#fff', fontSize: '0.78rem' }}>
                  <th style={{ padding: '6px 10px' }}>Item \ Cap (W)</th>
                  {Array(knapsackCapacity + 1).fill(0).map((_, w) => (
                    <th key={`cap-${w}`} style={{ padding: '6px 10px' }}>{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {knapsackTable.map((row, rIdx) => (
                  <tr key={`k-row-${rIdx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: rIdx % 2 === 0 ? '#1e293b' : '#0f172a' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 800, color: '#38bdf8', fontSize: '0.75rem' }}>
                      {rIdx === 0 ? '0 (None)' : `${items[rIdx - 1].name} (w=${items[rIdx - 1].wt}, v=${items[rIdx - 1].val})`}
                    </td>
                    {row.map((val, cIdx) => (
                      <td key={`k-cell-${rIdx}-${cIdx}`} style={{ padding: '6px 12px', color: val > 0 ? '#10b981' : 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.85rem' }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. LCS TABLE */}
        {activeDpAlgo === 'lcs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>
              LCS Matrix: str1 = "{str1}" vs str2 = "{str2}"
            </span>
            <table style={{ borderCollapse: 'collapse', textAlign: 'center', borderRadius: '8px', overflow: 'hidden', border: '1px solid #38bdf8' }}>
              <thead>
                <tr style={{ background: '#0284c7', color: '#fff', fontSize: '0.78rem' }}>
                  <th style={{ padding: '6px 10px' }}>str1 \ str2</th>
                  <th style={{ padding: '6px 10px' }}>Ø</th>
                  {str2.split('').map((c, idx) => (
                    <th key={`str2-${idx}`} style={{ padding: '6px 10px' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lcsTable.map((row, rIdx) => (
                  <tr key={`lcs-row-${rIdx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: rIdx % 2 === 0 ? '#1e293b' : '#0f172a' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 800, color: '#38bdf8', fontSize: '0.78rem' }}>
                      {rIdx === 0 ? 'Ø' : str1[rIdx - 1]}
                    </td>
                    {row.map((val, cIdx) => (
                      <td key={`lcs-cell-${rIdx}-${cIdx}`} style={{ padding: '6px 10px', color: val > 0 ? '#10b981' : 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '0.85rem' }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. COIN CHANGE TABLE */}
        {activeDpAlgo === 'coin_change' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>
              Available Denominations: [{coins.join('¢, ')}¢] | Target: {targetAmount}¢
            </span>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '10px' }}>
              {coinTable.map((val, amt) => (
                <div key={`coin-${amt}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>{amt}¢</span>
                  <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: val !== Infinity ? 'linear-gradient(135deg, #10b981, #059669)' : '#1e293b', border: '1px solid #38bdf8', color: '#fff', fontWeight: 800, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.9rem' }}>
                    {val === Infinity ? '∞' : val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. FIBONACCI TABLE */}
        {activeDpAlgo === 'fibonacci' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>
              1D Tabulation Array: Fib(n) = Fib(n-1) + Fib(n-2)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {fibTable.map((val, idx) => (
                <div key={`fib-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>N={idx}</span>
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', border: '2px solid #38bdf8', color: '#fff', fontWeight: 800, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.1rem' }}>
                    {val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
