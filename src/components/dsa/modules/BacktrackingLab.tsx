import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, Crown } from 'lucide-react';

interface BacktrackingLabProps {
  activeAlgorithm?: string;
  onSelectAlgorithm?: (id: string) => void;
  speed: number;
}

export const BacktrackingLab: React.FC<BacktrackingLabProps> = ({
  speed
}) => {
  const [activeTab, setActiveTab] = useState<'n_queens' | 'rec_factorial' | 'sudoku'>('n_queens');

  // 1. N-QUEENS STATE
  const [boardSize, setBoardSize] = useState<number>(4);
  const [queens, setQueens] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [history, setHistory] = useState<{ queens: number[]; log: string; status: 'placing' | 'conflict' | 'backtrack' | 'solved' }[]>([]);

  // 2. RECURSIVE CALL STACK STATE
  const [factorialInput, setFactorialInput] = useState<number>(4);
  const [callStack, setCallStack] = useState<{ frame: string; val?: number; returning?: boolean }[]>([]);
  const [recStep, setRecStep] = useState<number>(0);
  const [recHistory, setRecHistory] = useState<{ stack: { frame: string; val?: number; returning?: boolean }[]; log: string }[]>([]);

  // 3. SUDOKU STATE
  const [sudokuBoard, setSudokuBoard] = useState<number[][]>(
    Array(9).fill(null).map(() => Array(9).fill(0))
  );
  const [sudokuInitial, setSudokuInitial] = useState<number[][]>(
    Array(9).fill(null).map(() => Array(9).fill(0))
  );
  const [sudokuHistory, setSudokuHistory] = useState<{
    board: number[][];
    log: string;
    status: 'trying' | 'conflict' | 'backtrack' | 'solved';
    cell: [number, number] | null;
  }[]>([]);
  const [sudokuStep, setSudokuStep] = useState<number>(0);
  const [sudokuIsPlaying, setSudokuIsPlaying] = useState<boolean>(false);

  // Generate N-Queens Simulation Steps
  const generateNQueensSteps = useCallback((n: number) => {
    const steps: { queens: number[]; log: string; status: 'placing' | 'conflict' | 'backtrack' | 'solved' }[] = [];
    const q: number[] = Array(n).fill(-1);

    const isSafe = (row: number, col: number): boolean => {
      for (let prevRow = 0; prevRow < row; prevRow++) {
        const prevCol = q[prevRow];
        if (prevCol === col) return false;
        if (Math.abs(prevRow - row) === Math.abs(prevCol - col)) return false;
      }
      return true;
    };

    const solve = (row: number): boolean => {
      if (row === n) {
        steps.push({
          queens: [...q],
          log: `VALID SOLUTION FOUND! All ${n} Queens placed without conflict.`,
          status: 'solved'
        });
        return true;
      }

      for (let col = 0; col < n; col++) {
        q[row] = col;
        if (isSafe(row, col)) {
          steps.push({
            queens: [...q],
            log: `Row ${row}: Placed Queen safely at column ${col}`,
            status: 'placing'
          });
          if (solve(row + 1)) return true;
        } else {
          steps.push({
            queens: [...q],
            log: `Row ${row}, Col ${col}: Diagonal/Row CONFLICT! Backtracking...`,
            status: 'conflict'
          });
        }
      }
      q[row] = -1;
      steps.push({
        queens: [...q],
        log: `Row ${row}: Exhausted all columns. Backtracking to row ${row - 1}`,
        status: 'backtrack'
      });
      return false;
    };

    solve(0);
    setHistory(steps);
    setCurrentStep(0);
    if (steps.length > 0) setQueens(steps[0].queens);
    setIsPlaying(false);
  }, []);

  // Generate Factorial Call Stack Steps
  const generateFactorialSteps = useCallback((num: number) => {
    const steps: { stack: { frame: string; val?: number; returning?: boolean }[]; log: string }[] = [];
    const currentFrames: { frame: string; val?: number; returning?: boolean }[] = [];

    const fact = (n: number): number => {
      currentFrames.push({ frame: `fact(${n})` });
      steps.push({
        stack: currentFrames.map(f => ({ ...f })),
        log: `Pushed call frame fact(${n}) onto Call Stack.`
      });

      if (n <= 1) {
        steps.push({
          stack: currentFrames.map(f => ({ ...f })),
          log: `Base case reached: fact(1) = 1. Commencing return unwinding.`
        });
        const popped = currentFrames.pop();
        if (popped) popped.returning = true;
        return 1;
      }

      const res = n * fact(n - 1);
      steps.push({
        stack: currentFrames.map(f => ({ ...f })),
        log: `Returning from fact(${n}) = ${n} * fact(${n - 1}) = ${res}`
      });
      currentFrames.pop();
      return res;
    };

    fact(num);
    setRecHistory(steps);
    setRecStep(0);
    if (steps.length > 0) setCallStack(steps[0].stack);
  }, []);

  // Generate Sudoku Steps
  const generateSudokuSteps = useCallback((initialGrid: number[][]) => {
    const steps: {
      board: number[][];
      log: string;
      status: 'trying' | 'conflict' | 'backtrack' | 'solved';
      cell: [number, number] | null;
    }[] = [];
    const grid = initialGrid.map(row => [...row]);
    let stepCount = 0;
    const MAX_STEPS = 1200;

    const isSafe = (g: number[][], r: number, c: number, val: number): boolean => {
      for (let i = 0; i < 9; i++) {
        if (g[r][i] === val && i !== c) return false;
        if (g[i][c] === val && i !== r) return false;
      }
      const startRow = r - (r % 3);
      const startCol = c - (c % 3);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const row = startRow + i;
          const col = startCol + j;
          if (g[row][col] === val && (row !== r || col !== c)) return false;
        }
      }
      return true;
    };

    const hasInitialConflicts = (): boolean => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const val = grid[r][c];
          if (val !== 0) {
            if (!isSafe(grid, r, c, val)) return true;
          }
        }
      }
      return false;
    };

    if (hasInitialConflicts()) {
      steps.push({
        board: grid.map(row => [...row]),
        log: 'INVALID STARTING BOARD! Direct conflicts detected.',
        status: 'conflict',
        cell: null
      });
      setSudokuHistory(steps);
      setSudokuStep(0);
      setSudokuBoard(grid);
      return;
    }

    const solve = (g: number[][]): boolean => {
      if (stepCount >= MAX_STEPS) return false;

      let r = -1;
      let c = -1;
      let isEmpty = false;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (g[i][j] === 0) {
            r = i;
            c = j;
            isEmpty = true;
            break;
          }
        }
        if (isEmpty) break;
      }

      if (!isEmpty) {
        steps.push({
          board: g.map(row => [...row]),
          log: 'SUDOKU SOLVED! All cells filled correctly.',
          status: 'solved',
          cell: null
        });
        return true;
      }

      for (let val = 1; val <= 9; val++) {
        g[r][c] = val;
        stepCount++;
        
        steps.push({
          board: g.map(row => [...row]),
          log: `Cell (${r}, ${c}): Trying value ${val}`,
          status: 'trying',
          cell: [r, c]
        });

        if (isSafe(g, r, c, val)) {
          if (solve(g)) return true;
        } else {
          steps.push({
            board: g.map(row => [...row]),
            log: `Cell (${r}, ${c}): Value ${val} causes conflict!`,
            status: 'conflict',
            cell: [r, c]
          });
        }
        g[r][c] = 0;
      }

      steps.push({
        board: g.map(row => [...row]),
        log: `Cell (${r}, ${c}): No valid value found. Backtracking...`,
        status: 'backtrack',
        cell: [r, c]
      });
      return false;
    };

    steps.push({
      board: grid.map(row => [...row]),
      log: 'Sudoku solver initialized. Click Auto Backtrack or Step Forward.',
      status: 'trying',
      cell: null
    });

    const solved = solve(grid);
    if (!solved && stepCount < MAX_STEPS) {
      steps.push({
        board: grid.map(row => [...row]),
        log: 'NO SOLUTION EXISTS! Board cannot be solved.',
        status: 'conflict',
        cell: null
      });
    }

    setSudokuHistory(steps);
    setSudokuStep(0);
    setSudokuBoard(steps[0]?.board || initialGrid);
    setSudokuIsPlaying(false);
  }, []);

  const handleCellChange = (r: number, c: number, val: number) => {
    const newBoard = sudokuInitial.map((row, ri) =>
      row.map((colVal, ci) => (ri === r && ci === c ? val : colVal))
    );
    setSudokuInitial(newBoard);
    generateSudokuSteps(newBoard);
  };

  useEffect(() => {
    if (activeTab === 'n_queens') {
      generateNQueensSteps(boardSize);
    } else if (activeTab === 'rec_factorial') {
      generateFactorialSteps(factorialInput);
    } else if (activeTab === 'sudoku') {
      const defaultPreset = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 0, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [0, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 0, 1, 7, 9]
      ];
      setSudokuInitial(defaultPreset);
      generateSudokuSteps(defaultPreset);
    }
  }, [activeTab, boardSize, factorialInput, generateNQueensSteps, generateFactorialSteps, generateSudokuSteps]);

  // Player for N-Queens
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && history.length > 0) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          setQueens(history[next].queens);
          return next;
        });
      }, Math.max(30, 800 / speed));
    }
    return () => clearInterval(interval);
  }, [isPlaying, history, speed]);

  // Player for Sudoku
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sudokuIsPlaying && sudokuHistory.length > 0) {
      interval = setInterval(() => {
        setSudokuStep(prev => {
          if (prev >= sudokuHistory.length - 1) {
            setSudokuIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          setSudokuBoard(sudokuHistory[next].board);
          return next;
        });
      }, Math.max(30, 800 / speed));
    }
    return () => clearInterval(interval);
  }, [sudokuIsPlaying, sudokuHistory, speed]);

  const currentLog = history[currentStep] || {
    log: 'Chessboard initialized. Click Auto Backtrack or Step Forward.',
    status: 'placing'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* Sub-Tabs: N-Queens vs Recursive Call Stacks vs Sudoku */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {[
          { id: 'n_queens', name: '👑 N-Queens Problem (Backtrack Pruning)' },
          { id: 'rec_factorial', name: '📦 Recursive Call Stack (Factorial N!)' },
          { id: 'sudoku', name: '🧩 Sudoku Solver (DFS)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '5px 12px',
              borderRadius: '8px',
              border: activeTab === tab.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.6)',
              color: activeTab === tab.id ? '#38bdf8' : 'var(--text-secondary)',
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
        {activeTab === 'n_queens' ? (
          <>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                {isPlaying ? 'Pause' : 'Auto Backtrack'}
              </button>

              <button
                onClick={() => {
                  if (currentStep < history.length - 1) {
                    const next = currentStep + 1;
                    setCurrentStep(next);
                    setQueens(history[next].queens);
                  }
                }}
                disabled={currentStep >= history.length - 1 || isPlaying}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Step +1
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStep(0);
                  if (history.length > 0) setQueens(history[0].queens);
                }}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Queens (N):</span>
              {[4, 5, 6].map(n => (
                <button
                  key={`n-${n}`}
                  onClick={() => setBoardSize(n)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: boardSize === n ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: boardSize === n ? '#0284c7' : 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  N={n}
                </button>
              ))}
            </div>
          </>
        ) : activeTab === 'rec_factorial' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>N:</span>
            <input
              type="number"
              min="1"
              max="6"
              value={factorialInput}
              onChange={(e) => setFactorialInput(parseInt(e.target.value, 10))}
              style={{ width: '50px', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: '#0f172a', color: '#fff', fontSize: '0.85rem' }}
            />
            <button
              onClick={() => {
                if (recStep < recHistory.length - 1) {
                  const next = recStep + 1;
                  setRecStep(next);
                  setCallStack(recHistory[next].stack);
                }
              }}
              style={{ padding: '6px 12px', borderRadius: '6px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
            >
              Step Call Frame
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setSudokuIsPlaying(!sudokuIsPlaying)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: sudokuIsPlaying ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                {sudokuIsPlaying ? <Pause size={13} /> : <Play size={13} />}
                {sudokuIsPlaying ? 'Pause' : 'Auto Backtrack'}
              </button>

              <button
                onClick={() => {
                  if (sudokuStep < sudokuHistory.length - 1) {
                    const next = sudokuStep + 1;
                    setSudokuStep(next);
                    setSudokuBoard(sudokuHistory[next].board);
                  }
                }}
                disabled={sudokuStep >= sudokuHistory.length - 1 || sudokuIsPlaying}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Step +1
              </button>

              <button
                onClick={() => {
                  setSudokuIsPlaying(false);
                  setSudokuStep(0);
                  if (sudokuHistory.length > 0) {
                    setSudokuBoard(sudokuHistory[0].board);
                  } else {
                    setSudokuBoard(sudokuInitial);
                  }
                }}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Presets:</span>
              {[
                { name: 'Beginner', key: 'beginner' },
                { name: 'Easy', key: 'easy' },
                { name: 'Blank', key: 'blank' }
              ].map(p => (
                <button
                  key={`preset-${p.key}`}
                  onClick={() => {
                    const selected = p.key === 'beginner' 
                      ? [
                          [5, 3, 4, 6, 7, 8, 9, 1, 2],
                          [6, 7, 2, 1, 9, 5, 3, 4, 8],
                          [1, 9, 8, 3, 4, 2, 5, 6, 7],
                          [8, 5, 9, 7, 6, 1, 4, 2, 3],
                          [4, 2, 6, 8, 0, 3, 7, 9, 1],
                          [7, 1, 3, 9, 2, 4, 8, 5, 6],
                          [9, 6, 1, 5, 3, 7, 2, 8, 4],
                          [0, 8, 7, 4, 1, 9, 6, 3, 5],
                          [3, 4, 5, 2, 8, 0, 1, 7, 9]
                        ]
                      : p.key === 'easy'
                      ? [
                          [0, 0, 0, 2, 6, 0, 7, 0, 1],
                          [6, 8, 0, 0, 7, 0, 0, 9, 0],
                          [1, 9, 0, 0, 0, 4, 5, 0, 0],
                          [8, 2, 0, 1, 0, 0, 0, 4, 0],
                          [0, 0, 4, 6, 0, 2, 9, 0, 0],
                          [0, 5, 0, 0, 0, 3, 0, 2, 8],
                          [0, 0, 9, 3, 0, 0, 0, 7, 4],
                          [0, 4, 0, 0, 5, 0, 0, 3, 6],
                          [7, 0, 3, 0, 1, 8, 0, 0, 0]
                        ]
                      : Array(9).fill(null).map(() => Array(9).fill(0));
                    
                    setSudokuInitial(selected);
                    generateSudokuSteps(selected);
                  }}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </>
        )}
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
            {activeTab === 'n_queens' 
              ? `STEP ${currentStep} / ${Math.max(0, history.length - 1)}` 
              : activeTab === 'rec_factorial'
              ? `CALL STEP ${recStep} / ${Math.max(0, recHistory.length - 1)}`
              : `DFS STEP ${sudokuStep} / ${Math.max(0, sudokuHistory.length - 1)}`}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#f1f5f9', fontWeight: 600 }}>
            {activeTab === 'n_queens' 
              ? currentLog.log 
              : activeTab === 'rec_factorial'
              ? (recHistory[recStep]?.log || 'Call stack ready.')
              : (sudokuHistory[sudokuStep]?.log || 'Sudoku solver ready.')}
          </span>
        </div>
      </div>

      {/* Main Viewport */}
      <div style={{
        flex: 1,
        minHeight: '380px',
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #030712 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {activeTab === 'n_queens' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${boardSize}, 48px)`,
              gridTemplateRows: `repeat(${boardSize}, 48px)`,
              gap: '4px',
              background: '#030712',
              padding: '12px',
              borderRadius: '12px',
              border: '2px solid rgba(56, 189, 248, 0.3)',
              boxShadow: '0 0 24px rgba(0,0,0,0.8)'
            }}
          >
            {Array(boardSize).fill(0).map((_, row) =>
              Array(boardSize).fill(0).map((__, col) => {
                const hasQueen = queens[row] === col;
                const isConflict = hasQueen && currentLog.status === 'conflict';
                const isSolved = hasQueen && currentLog.status === 'solved';

                return (
                  <div
                    key={`sq-${row}-${col}`}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '6px',
                      background: (row + col) % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {hasQueen && (
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          background: isConflict
                            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                            : isSolved
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : 'linear-gradient(135deg, #0284c7, #0369a1)',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          boxShadow: isConflict
                            ? '0 0 16px rgba(239, 68, 68, 0.8)'
                            : '0 0 12px rgba(56, 189, 248, 0.6)'
                        }}
                      >
                        <Crown size={20} color="#fff" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : activeTab === 'rec_factorial' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 800 }}>
              RECURSIVE CALL STACK (LIFO FRAME GROWTH)
            </span>
            <div style={{ width: '180px', minHeight: '220px', borderLeft: '3px solid #f59e0b', borderRight: '3px solid #f59e0b', borderBottom: '5px solid #f59e0b', display: 'flex', flexDirection: 'column-reverse', gap: '6px', padding: '8px' }}>
              {callStack.map((frame, idx) => (
                <div key={`frame-${idx}`} style={{ padding: '8px 12px', borderRadius: '6px', background: frame.returning ? '#10b981' : '#0284c7', color: '#fff', fontWeight: 800, textAlign: 'center', fontSize: '0.85rem', border: '1px solid #38bdf8' }}>
                  {frame.frame}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(9, 36px)',
                gridTemplateRows: 'repeat(9, 36px)',
                background: '#030712',
                padding: '10px',
                borderRadius: '12px',
                border: '2px solid rgba(56, 189, 248, 0.4)',
                boxShadow: '0 0 24px rgba(0,0,0,0.8)'
              }}
            >
              {Array(9).fill(0).map((_, row) =>
                Array(9).fill(0).map((__, col) => {
                  const val = sudokuBoard[row]?.[col] || 0;
                  const isInitial = sudokuInitial[row]?.[col] !== 0;
                  
                  const currentInfo = sudokuHistory[sudokuStep];
                  const isCurrentCell = currentInfo?.cell?.[0] === row && currentInfo?.cell?.[1] === col;
                  const status = currentInfo?.status;
                  const isSolved = status === 'solved';
                  
                  let bg = (Math.floor(row / 3) + Math.floor(col / 3)) % 2 === 0 
                    ? 'rgba(255,255,255,0.04)' 
                    : 'rgba(255,255,255,0.01)';
                  
                  if (isCurrentCell) {
                    if (status === 'conflict') bg = 'rgba(239, 68, 68, 0.4)';
                    else if (status === 'trying') bg = 'rgba(245, 158, 11, 0.4)';
                    else if (status === 'backtrack') bg = 'rgba(239, 68, 68, 0.2)';
                  } else if (isSolved && !isInitial) {
                    bg = 'rgba(16, 185, 129, 0.2)';
                  } else if (!isInitial && val !== 0) {
                    bg = 'rgba(56, 189, 248, 0.1)';
                  }

                  const borderRight = (col === 2 || col === 5) 
                    ? '2px solid rgba(56, 189, 248, 0.6)' 
                    : '1px solid rgba(255,255,255,0.08)';
                  const borderBottom = (row === 2 || row === 5) 
                    ? '2px solid rgba(56, 189, 248, 0.6)' 
                    : '1px solid rgba(255,255,255,0.08)';

                  return (
                    <div
                      key={`sd-${row}-${col}`}
                      style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: bg,
                        borderRight,
                        borderBottom,
                        borderLeft: col === 0 ? '1px solid rgba(255,255,255,0.08)' : undefined,
                        borderTop: row === 0 ? '1px solid rgba(255,255,255,0.08)' : undefined,
                        boxSizing: 'border-box',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="text"
                        maxLength={1}
                        value={val === 0 ? '' : val}
                        onChange={(e) => {
                          const char = e.target.value;
                          const newVal = parseInt(char, 10);
                          if (isNaN(newVal) || newVal < 1 || newVal > 9) {
                            handleCellChange(row, col, 0);
                          } else {
                            handleCellChange(row, col, newVal);
                          }
                        }}
                        disabled={sudokuIsPlaying || sudokuStep > 0}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          background: 'transparent',
                          color: isInitial ? '#38bdf8' : '#fff',
                          textAlign: 'center',
                          fontSize: '1rem',
                          fontWeight: isInitial ? '800' : '500',
                          outline: 'none',
                          cursor: (sudokuIsPlaying || sudokuStep > 0) ? 'not-allowed' : 'text'
                        }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
