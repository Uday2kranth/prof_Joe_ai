import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface RecursionLabProps {
  activeAlgorithm?: string;
  onSelectAlgorithm?: (id: string) => void;
  speed: number;
}

interface TreeNode {
  id: string;
  n: number;
  label: string;
  x: number;
  y: number;
  parent?: string;
  left?: TreeNode;
  right?: TreeNode;
}

interface RecStepSnapshot {
  step: number;
  activeNodeId: string;
  callStack: string[];
  nodeStates: Record<string, 'pending' | 'on_stack' | 'evaluating' | 'returned'>;
  nodeValues: Record<string, number>;
  activeLine: number;
  description: string;
}

export const RecursionLab: React.FC<RecursionLabProps> = ({
  speed = 2
}) => {
  const [sizeN, setSizeN] = useState<number>(4);
  const [activeMode, setActiveMode] = useState<'fibonacci' | 'factorial'>('fibonacci');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [localSpeed, setLocalSpeed] = useState<number>(speed);

  // Generate Tree Layout
  const treeData = useMemo(() => {
    let idCounter = 0;

    if (activeMode === 'fibonacci') {
      const buildFibTree = (n: number, depth: number, offset: number, spread: number): TreeNode => {
        const id = `node-fib-${idCounter++}`;
        const node: TreeNode = {
          id,
          n,
          label: `f(${n})`,
          x: offset,
          y: 40 + depth * 60
        };
        if (n > 1) {
          const nextSpread = spread * 0.52;
          node.left = buildFibTree(n - 1, depth + 1, offset - spread, nextSpread);
          node.right = buildFibTree(n - 2, depth + 1, offset + spread, nextSpread);
          node.left.parent = id;
          node.right.parent = id;
        }
        return node;
      };

      const initialSpread = sizeN === 6 ? 260 : sizeN === 5 ? 210 : sizeN === 4 ? 160 : sizeN === 3 ? 120 : 90;
      return buildFibTree(sizeN, 0, 400, initialSpread);
    } else {
      // Factorial Tree (Linear Call Chain)
      const buildFactTree = (n: number, depth: number): TreeNode => {
        const id = `node-fact-${idCounter++}`;
        const node: TreeNode = {
          id,
          n,
          label: `fact(${n})`,
          x: 400,
          y: 40 + depth * 55
        };
        if (n > 1) {
          node.left = buildFactTree(n - 1, depth + 1);
          node.left.parent = id;
        }
        return node;
      };
      return buildFactTree(sizeN, 0);
    }
  }, [sizeN, activeMode]);

  // Generate Execution Steps
  const steps = useMemo(() => {
    const snapshots: RecStepSnapshot[] = [];
    const nodeStates: Record<string, 'pending' | 'on_stack' | 'evaluating' | 'returned'> = {};
    const nodeValues: Record<string, number> = {};
    const currentStack: { id: string; label: string }[] = [];

    // Collect all node IDs and initialize to pending
    const initNodes = (node?: TreeNode) => {
      if (!node) return;
      nodeStates[node.id] = 'pending';
      initNodes(node.left);
      initNodes(node.right);
    };
    initNodes(treeData);

    const record = (activeId: string, line: number, desc: string) => {
      snapshots.push({
        step: snapshots.length,
        activeNodeId: activeId,
        callStack: currentStack.map(s => s.label),
        nodeStates: { ...nodeStates },
        nodeValues: { ...nodeValues },
        activeLine: line,
        description: desc
      });
    };

    if (activeMode === 'fibonacci') {
      const simulateFib = (node: TreeNode): number => {
        currentStack.push({ id: node.id, label: `fib(${node.n})` });
        nodeStates[node.id] = 'evaluating';
        record(node.id, 1, `Calling fib(${node.n}) — pushed to Call Stack`);

        nodeStates[node.id] = 'on_stack';
        record(node.id, 2, `Checking base case: is ${node.n} <= 1?`);

        if (node.n <= 1) {
          nodeStates[node.id] = 'returned';
          nodeValues[node.id] = node.n;
          record(node.id, 3, `Base case met! fib(${node.n}) returns ${node.n}`);
          currentStack.pop();
          return node.n;
        }

        record(node.id, 4, `Branching left: evaluating fib(${node.n - 1})`);
        const leftVal = simulateFib(node.left!);

        nodeStates[node.id] = 'on_stack';
        currentStack.push({ id: node.id, label: `fib(${node.n})` });
        record(node.id, 5, `Left branch returned ${leftVal}. Branching right: fib(${node.n - 2})`);

        const rightVal = simulateFib(node.right!);

        const total = leftVal + rightVal;
        nodeStates[node.id] = 'returned';
        nodeValues[node.id] = total;
        record(node.id, 6, `fib(${node.n}) = left(${leftVal}) + right(${rightVal}) = ${total}`);

        currentStack.pop();
        return total;
      };

      simulateFib(treeData);
    } else {
      // Factorial simulation
      const simulateFact = (node: TreeNode): number => {
        currentStack.push({ id: node.id, label: `fact(${node.n})` });
        nodeStates[node.id] = 'evaluating';
        record(node.id, 1, `Calling fact(${node.n}) — pushed onto Call Stack`);

        nodeStates[node.id] = 'on_stack';
        record(node.id, 2, `Checking base case: is ${node.n} <= 1?`);

        if (node.n <= 1) {
          nodeStates[node.id] = 'returned';
          nodeValues[node.id] = 1;
          record(node.id, 3, `Base case met! fact(1) = 1`);
          currentStack.pop();
          return 1;
        }

        record(node.id, 4, `Recursing: waiting for fact(${node.n - 1})`);
        const sub = simulateFact(node.left!);

        const total = node.n * sub;
        nodeStates[node.id] = 'returned';
        nodeValues[node.id] = total;
        record(node.id, 5, `fact(${node.n}) = ${node.n} * fact(${node.n - 1}) = ${total}`);
        currentStack.pop();
        return total;
      };

      simulateFact(treeData);
    }

    return snapshots;
  }, [treeData, activeMode]);

  // Animation Loop
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, Math.max(80, 1000 / localSpeed));
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, localSpeed, steps.length]);

  const currentSnap = steps[currentStep] || steps[0] || {
    step: 0,
    activeNodeId: '',
    callStack: [],
    nodeStates: {},
    nodeValues: {},
    activeLine: 1,
    description: 'Initialized.'
  };

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    handleReset();
  }, [sizeN, activeMode, handleReset]);

  // Render SVG Connection Lines
  const renderLines = (node?: TreeNode): React.ReactNode[] => {
    if (!node) return [];
    const lines: React.ReactNode[] = [];
    if (node.left) {
      lines.push(
        <line
          key={`line-${node.id}-${node.left.id}`}
          x1={node.x}
          y1={node.y}
          x2={node.left.x}
          y2={node.left.y}
          stroke={currentSnap.nodeStates[node.left.id] !== 'pending' ? 'rgba(56, 189, 248, 0.6)' : 'rgba(255, 255, 255, 0.12)'}
          strokeWidth="2"
        />
      );
      lines.push(...renderLines(node.left));
    }
    if (node.right) {
      lines.push(
        <line
          key={`line-${node.id}-${node.right.id}`}
          x1={node.x}
          y1={node.y}
          x2={node.right.x}
          y2={node.right.y}
          stroke={currentSnap.nodeStates[node.right.id] !== 'pending' ? 'rgba(56, 189, 248, 0.6)' : 'rgba(255, 255, 255, 0.12)'}
          strokeWidth="2"
        />
      );
      lines.push(...renderLines(node.right));
    }
    return lines;
  };

  // Render SVG Tree Nodes
  const renderNodes = (node?: TreeNode): React.ReactNode[] => {
    if (!node) return [];
    const state = currentSnap.nodeStates[node.id] || 'pending';
    const val = currentSnap.nodeValues[node.id];
    const isEvaluating = currentSnap.activeNodeId === node.id && state === 'evaluating';

    let fill = '#0f172a';
    let stroke = 'rgba(255, 255, 255, 0.2)';
    let textColor = '#64748b';
    let glow = 'none';

    if (state === 'on_stack') {
      fill = '#581c87';
      stroke = '#c084fc';
      textColor = '#ffffff';
      glow = '0 0 14px rgba(192, 132, 252, 0.8)';
    } else if (isEvaluating || state === 'evaluating') {
      fill = '#78350f';
      stroke = '#fbbf24';
      textColor = '#ffffff';
      glow = '0 0 18px rgba(251, 191, 36, 0.9)';
    } else if (state === 'returned') {
      fill = '#064e3b';
      stroke = '#34d399';
      textColor = '#ffffff';
      glow = '0 0 12px rgba(52, 211, 153, 0.6)';
    }

    const elements: React.ReactNode[] = [
      <g key={node.id}>
        <circle
          cx={node.x}
          cy={node.y}
          r="18"
          fill={fill}
          stroke={stroke}
          strokeWidth={isEvaluating ? "3.5" : "2"}
          style={{ filter: glow, transition: 'all 0.2s ease' }}
        />
        <text
          x={node.x}
          y={node.y + 4}
          fill={textColor}
          fontSize="10.5"
          fontWeight="bold"
          textAnchor="middle"
        >
          {state === 'returned' && val !== undefined ? val : node.label}
        </text>
        {state === 'returned' && (
          <text
            x={node.x}
            y={node.y - 21}
            fill="#34d399"
            fontSize="8.5"
            fontWeight="bold"
            textAnchor="middle"
          >
            {node.label}={val}
          </text>
        )}
      </g>
    ];

    if (node.left) elements.push(...renderNodes(node.left));
    if (node.right) elements.push(...renderNodes(node.right));
    return elements;
  };

  const progressPercent = steps.length > 1 ? Math.round((currentStep / (steps.length - 1)) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* Model Selection Header */}
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
            MODEL:
          </span>
          <select
            value={activeMode}
            onChange={(e) => setActiveMode(e.target.value as any)}
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
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)'
            }}
          >
            <option value="fibonacci">🔢 Fibonacci Tree (Binary Branching)</option>
            <option value="factorial">📦 Factorial Tree (Linear Unwinding)</option>
          </select>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#c084fc' }} />
            <span style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 600 }}>Stack</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fbbf24' }} />
            <span style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 600 }}>Eval</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399' }} />
            <span style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 600 }}>Done</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage Box */}
      <div style={{
        flex: 1,
        minHeight: '280px',
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #030712 100%)',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Title Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
            {activeMode === 'fibonacci' ? `fib(${sizeN})` : `fact(${sizeN})`} — Recursive Call Tree
          </span>
          <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>
            {progressPercent}% Complete
          </span>
        </div>

        {/* SVG Call Tree Canvas */}
        <div style={{ flex: 1, minHeight: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
          <svg viewBox="0 0 800 280" style={{ width: '100%', height: '240px' }}>
            {renderLines(treeData)}
            {renderNodes(treeData)}
          </svg>
        </div>

        {/* Live Call Stack Chip Ribbon (Coddy Style) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          background: 'rgba(3, 7, 18, 0.85)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginTop: '4px',
          overflowX: 'auto'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', whiteSpace: 'nowrap' }}>
            Stack:
          </span>
          {currentSnap.callStack.length === 0 ? (
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>[Empty - Done]</span>
          ) : (
            currentSnap.callStack.map((frame, idx) => (
              <React.Fragment key={`frame-${idx}`}>
                <div style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #7e22ce, #581c87)',
                  border: '1px solid #c084fc',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  boxShadow: '0 0 8px rgba(192, 132, 252, 0.4)',
                  whiteSpace: 'nowrap'
                }}>
                  {frame}
                </div>
                {idx < currentSnap.callStack.length - 1 && (
                  <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>›</span>
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* Progress Scrubber Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
        <input
          type="range"
          min="0"
          max={Math.max(0, steps.length - 1)}
          value={currentStep}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentStep(parseInt(e.target.value, 10));
          }}
          style={{ flex: 1, accentColor: '#c084fc', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.72rem', color: '#94a3b8', minWidth: '65px', textAlign: 'right' }}>
          {currentStep}/{Math.max(0, steps.length - 1)}
        </span>
      </div>

      {/* Bottom Action HUD Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.8)',
        padding: '6px 12px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            title={isPlaying ? 'Pause' : 'Play'}
            onClick={() => setIsPlaying(!isPlaying)}
            className="dsa-action-btn"
            style={{
              border: 'none',
              background: isPlaying ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: '#fff'
            }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span className="dsa-btn-label">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            title="Previous Step"
            onClick={() => {
              setIsPlaying(false);
              if (currentStep > 0) setCurrentStep(c => c - 1);
            }}
            disabled={currentStep === 0}
            className="dsa-action-btn"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              opacity: currentStep === 0 ? 0.4 : 1
            }}
          >
            ‹<span className="dsa-btn-label"> Prev</span>
          </button>

          <button
            title="Next Step"
            onClick={() => {
              setIsPlaying(false);
              if (currentStep < steps.length - 1) setCurrentStep(c => c + 1);
            }}
            disabled={currentStep >= steps.length - 1}
            className="dsa-action-btn"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              opacity: currentStep >= steps.length - 1 ? 0.4 : 1
            }}
          >
            <span className="dsa-btn-label">Next </span>›
          </button>

          <button
            title="Reset"
            onClick={handleReset}
            className="dsa-action-btn"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-muted)'
            }}
          >
            <RotateCcw size={12} />
            <span className="dsa-btn-label">Reset</span>
          </button>
        </div>

        {/* Speed & Size Sliders */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Speed: {localSpeed}x</span>
            <input
              type="range"
              min="1"
              max="5"
              value={localSpeed}
              onChange={(e) => setLocalSpeed(parseInt(e.target.value, 10))}
              style={{ width: '50px', accentColor: '#38bdf8' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>n = {sizeN}</span>
            <input
              type="range"
              min="2"
              max="5"
              value={sizeN}
              onChange={(e) => setSizeN(parseInt(e.target.value, 10))}
              style={{ width: '55px', accentColor: '#c084fc' }}
            />
          </div>
        </div>
      </div>

      {/* Code Synchronizer Box with Real-Time Active Line Highlight */}
      <div style={{
        background: '#030712',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '12px 16px',
        fontFamily: 'monospace',
        fontSize: '0.82rem'
      }}>
        <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 800, marginBottom: '6px' }}>
          CODE EXECUTION LINE TRACE:
        </div>
        {activeMode === 'fibonacci' ? (
          <div>
            {[
              { num: 1, code: 'def fib(n):' },
              { num: 2, code: '    if n <= 1:' },
              { num: 3, code: '        return n' },
              { num: 4, code: '    left = fib(n - 1)' },
              { num: 5, code: '    right = fib(n - 2)' },
              { num: 6, code: '    return left + right' }
            ].map(line => (
              <div
                key={`line-${line.num}`}
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: currentSnap.activeLine === line.num ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  borderLeft: currentSnap.activeLine === line.num ? '3px solid #38bdf8' : '3px solid transparent',
                  color: currentSnap.activeLine === line.num ? '#38bdf8' : '#cbd5e1'
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.3)', marginRight: '10px' }}>{line.num}</span>
                {line.code}
              </div>
            ))}
          </div>
        ) : (
          <div>
            {[
              { num: 1, code: 'def fact(n):' },
              { num: 2, code: '    if n <= 1:' },
              { num: 3, code: '        return 1' },
              { num: 4, code: '    sub = fact(n - 1)' },
              { num: 5, code: '    return n * sub' }
            ].map(line => (
              <div
                key={`fact-line-${line.num}`}
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: currentSnap.activeLine === line.num ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  borderLeft: currentSnap.activeLine === line.num ? '3px solid #38bdf8' : '3px solid transparent',
                  color: currentSnap.activeLine === line.num ? '#38bdf8' : '#cbd5e1'
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.3)', marginRight: '10px' }}>{line.num}</span>
                {line.code}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
