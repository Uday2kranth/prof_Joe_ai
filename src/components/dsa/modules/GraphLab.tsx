import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, Shuffle, HelpCircle, Layers, Target, Compass, Activity, CheckCircle2, XCircle, ArrowRightLeft } from 'lucide-react';
import type { Node2D, Edge2D } from '../types';

interface GraphLabProps {
  activeAlgorithm?: string;
  onSelectAlgorithm: (id: string) => void;
  speed: number;
}

type GraphPreset = 'default' | 'dense' | 'tree' | 'cycle' | 'star' | 'random';

interface GraphStepSnapshot {
  step: number;
  nodes: Node2D[];
  edges: Edge2D[];
  activeQueueOrStack: string[];
  queueOrStackLabel: string;
  description: string;
  traceHistory: { text: string; status: 'active' | 'done' | 'rejected' | 'neutral' }[];
  traceTitle: string;
  telemetry?: {
    comparisons?: number;
    relaxedEdges?: number;
    mstWeight?: number;
    currentPass?: string;
  };
  floydMatrix?: number[][];
  floydK?: number;
  floydFormula?: string;
  highlightedPath?: string[];
}

export const GraphLab: React.FC<GraphLabProps> = ({
  onSelectAlgorithm,
  speed = 2
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState<
    'dijkstra' | 'bfs' | 'dfs' | 'bellman_ford' | 'prims' | 'kruskals' | 'floyd_warshall' | 'topo_sort'
  >('dijkstra');

  const [activePreset, setActivePreset] = useState<GraphPreset>('default');
  const [randomSeedIdx, setRandomSeedIdx] = useState<number>(0);
  const [showCheatsheet, setShowCheatsheet] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [localSpeed, setLocalSpeed] = useState<number>(speed);

  // Default Graph Topology (Symmetric Planar Diamond-Bridge)
  const defaultNodes: Node2D[] = useMemo(() => [
    { id: 'A', label: 'A', x: 120, y: 150, state: 'unvisited', dist: 0, inDegree: 0 },
    { id: 'B', label: 'B', x: 260, y: 70, state: 'unvisited', dist: Infinity, inDegree: 1 },
    { id: 'C', label: 'C', x: 260, y: 230, state: 'unvisited', dist: Infinity, inDegree: 2 },
    { id: 'D', label: 'D', x: 420, y: 70, state: 'unvisited', dist: Infinity, inDegree: 1 },
    { id: 'E', label: 'E', x: 420, y: 230, state: 'unvisited', dist: Infinity, inDegree: 2 },
    { id: 'F', label: 'F', x: 560, y: 150, state: 'unvisited', dist: Infinity, inDegree: 2 }
  ], []);

  const defaultEdges: Edge2D[] = useMemo(() => [
    { u: 'A', v: 'B', weight: 4, state: 'default' },
    { u: 'A', v: 'C', weight: 2, state: 'default' },
    { u: 'B', v: 'C', weight: 1, state: 'default' },
    { u: 'B', v: 'D', weight: 5, state: 'default' },
    { u: 'C', v: 'E', weight: 8, state: 'default' },
    { u: 'D', v: 'E', weight: 2, state: 'default' },
    { u: 'D', v: 'F', weight: 6, state: 'default' },
    { u: 'E', v: 'F', weight: 3, state: 'default' }
  ], []);

  // Bank of 4 Curated, Planar, Non-Overlapping Random Topologies
  const curatedRandomPool: { nodes: Node2D[]; edges: Edge2D[]; start: string; target: string }[] = useMemo(() => [
    // Pool 0: Hexagonal Dual-Bridge (Zero overlapping lines)
    {
      nodes: [
        { id: 'A', label: 'A', x: 140, y: 145, state: 'unvisited', dist: 0 },
        { id: 'B', label: 'B', x: 260, y: 65, state: 'unvisited', dist: Infinity },
        { id: 'C', label: 'C', x: 440, y: 65, state: 'unvisited', dist: Infinity },
        { id: 'D', label: 'D', x: 560, y: 145, state: 'unvisited', dist: Infinity },
        { id: 'E', label: 'E', x: 440, y: 225, state: 'unvisited', dist: Infinity },
        { id: 'F', label: 'F', x: 260, y: 225, state: 'unvisited', dist: Infinity }
      ],
      edges: [
        { u: 'A', v: 'B', weight: 3, state: 'default' },
        { u: 'B', v: 'C', weight: 2, state: 'default' },
        { u: 'C', v: 'D', weight: 4, state: 'default' },
        { u: 'D', v: 'E', weight: 1, state: 'default' },
        { u: 'E', v: 'F', weight: 5, state: 'default' },
        { u: 'F', v: 'A', weight: 6, state: 'default' },
        { u: 'B', v: 'F', weight: 2, state: 'default' },
        { u: 'C', v: 'E', weight: 3, state: 'default' }
      ],
      start: 'A',
      target: 'D'
    },
    // Pool 1: Diamond Lattice Flow
    {
      nodes: [
        { id: 'S', label: 'S', x: 120, y: 145, state: 'unvisited', dist: 0 },
        { id: 'T1', label: 'T1', x: 260, y: 65, state: 'unvisited', dist: Infinity },
        { id: 'B1', label: 'B1', x: 260, y: 225, state: 'unvisited', dist: Infinity },
        { id: 'T2', label: 'T2', x: 440, y: 65, state: 'unvisited', dist: Infinity },
        { id: 'B2', label: 'B2', x: 440, y: 225, state: 'unvisited', dist: Infinity },
        { id: 'E', label: 'E', x: 580, y: 145, state: 'unvisited', dist: Infinity }
      ],
      edges: [
        { u: 'S', v: 'T1', weight: 2, state: 'default' },
        { u: 'S', v: 'B1', weight: 5, state: 'default' },
        { u: 'T1', v: 'B1', weight: 1, state: 'default' },
        { u: 'T1', v: 'T2', weight: 4, state: 'default' },
        { u: 'B1', v: 'B2', weight: 2, state: 'default' },
        { u: 'T2', v: 'B2', weight: 6, state: 'default' },
        { u: 'T2', v: 'E', weight: 3, state: 'default' },
        { u: 'B2', v: 'E', weight: 1, state: 'default' }
      ],
      start: 'S',
      target: 'E'
    },
    // Pool 2: Double Triangle Butterfly
    {
      nodes: [
        { id: 'A', label: 'A', x: 140, y: 70, state: 'unvisited', dist: 0 },
        { id: 'B', label: 'B', x: 140, y: 220, state: 'unvisited', dist: Infinity },
        { id: 'C', label: 'C', x: 350, y: 145, state: 'unvisited', dist: Infinity },
        { id: 'D', label: 'D', x: 560, y: 70, state: 'unvisited', dist: Infinity },
        { id: 'E', label: 'E', x: 560, y: 220, state: 'unvisited', dist: Infinity }
      ],
      edges: [
        { u: 'A', v: 'B', weight: 4, state: 'default' },
        { u: 'A', v: 'C', weight: 2, state: 'default' },
        { u: 'B', v: 'C', weight: 3, state: 'default' },
        { u: 'C', v: 'D', weight: 1, state: 'default' },
        { u: 'C', v: 'E', weight: 5, state: 'default' },
        { u: 'D', v: 'E', weight: 2, state: 'default' }
      ],
      start: 'A',
      target: 'E'
    },
    // Pool 3: 4-Stage Feed-Forward DAG
    {
      nodes: [
        { id: '1', label: '1', x: 120, y: 145, state: 'unvisited', dist: 0 },
        { id: '2', label: '2', x: 270, y: 70, state: 'unvisited', dist: Infinity },
        { id: '3', label: '3', x: 270, y: 220, state: 'unvisited', dist: Infinity },
        { id: '4', label: '4', x: 430, y: 70, state: 'unvisited', dist: Infinity },
        { id: '5', label: '5', x: 430, y: 220, state: 'unvisited', dist: Infinity },
        { id: '6', label: '6', x: 580, y: 145, state: 'unvisited', dist: Infinity }
      ],
      edges: [
        { u: '1', v: '2', weight: 2, state: 'default' },
        { u: '1', v: '3', weight: 4, state: 'default' },
        { u: '2', v: '4', weight: 7, state: 'default' },
        { u: '2', v: '5', weight: 1, state: 'default' },
        { u: '3', v: '5', weight: 3, state: 'default' },
        { u: '4', v: '6', weight: 1, state: 'default' },
        { u: '5', v: '6', weight: 5, state: 'default' }
      ],
      start: '1',
      target: '6'
    }
  ], []);

  const [baseNodes, setBaseNodes] = useState<Node2D[]>(defaultNodes);
  const [baseEdges, setBaseEdges] = useState<Edge2D[]>(defaultEdges);
  const [startNodeId, setStartNodeId] = useState<string>('A');
  const [targetNodeId, setTargetNodeId] = useState<string>('F');

  // Load Preset
  const loadPreset = useCallback((preset: GraphPreset) => {
    setActivePreset(preset);
    setIsPlaying(false);
    setCurrentStep(0);

    if (preset === 'dense') {
      const dNodes: Node2D[] = [
        { id: '1', label: '1', x: 200, y: 70, state: 'unvisited', dist: 0 },
        { id: '2', label: '2', x: 500, y: 70, state: 'unvisited', dist: Infinity },
        { id: '3', label: '3', x: 500, y: 230, state: 'unvisited', dist: Infinity },
        { id: '4', label: '4', x: 200, y: 230, state: 'unvisited', dist: Infinity },
        { id: '5', label: '5', x: 350, y: 150, state: 'unvisited', dist: Infinity }
      ];
      const dEdges: Edge2D[] = [
        { u: '1', v: '2', weight: 3, state: 'default' },
        { u: '2', v: '3', weight: 4, state: 'default' },
        { u: '3', v: '4', weight: 2, state: 'default' },
        { u: '4', v: '1', weight: 5, state: 'default' },
        { u: '1', v: '5', weight: 1, state: 'default' },
        { u: '2', v: '5', weight: 2, state: 'default' },
        { u: '3', v: '5', weight: 6, state: 'default' },
        { u: '4', v: '5', weight: 3, state: 'default' }
      ];
      setBaseNodes(dNodes);
      setBaseEdges(dEdges);
      setStartNodeId('1');
      setTargetNodeId('3');
    } else if (preset === 'tree') {
      const tNodes: Node2D[] = [
        { id: 'R', label: 'Root', x: 350, y: 50, state: 'unvisited', dist: 0 },
        { id: 'L1', label: 'L1', x: 220, y: 130, state: 'unvisited', dist: Infinity },
        { id: 'R1', label: 'R1', x: 480, y: 130, state: 'unvisited', dist: Infinity },
        { id: 'L2', label: 'L2', x: 160, y: 220, state: 'unvisited', dist: Infinity },
        { id: 'L3', label: 'L3', x: 280, y: 220, state: 'unvisited', dist: Infinity },
        { id: 'R2', label: 'R2', x: 420, y: 220, state: 'unvisited', dist: Infinity },
        { id: 'R3', label: 'R3', x: 540, y: 220, state: 'unvisited', dist: Infinity }
      ];
      const tEdges: Edge2D[] = [
        { u: 'R', v: 'L1', weight: 2, state: 'default' },
        { u: 'R', v: 'R1', weight: 4, state: 'default' },
        { u: 'L1', v: 'L2', weight: 1, state: 'default' },
        { u: 'L1', v: 'L3', weight: 3, state: 'default' },
        { u: 'R1', v: 'R2', weight: 5, state: 'default' },
        { u: 'R1', v: 'R3', weight: 2, state: 'default' }
      ];
      setBaseNodes(tNodes);
      setBaseEdges(tEdges);
      setStartNodeId('R');
      setTargetNodeId('R3');
    } else if (preset === 'cycle') {
      const cNodes: Node2D[] = [
        { id: '1', label: '1', x: 350, y: 50, state: 'unvisited', dist: 0 },
        { id: '2', label: '2', x: 520, y: 110, state: 'unvisited', dist: Infinity },
        { id: '3', label: '3', x: 480, y: 220, state: 'unvisited', dist: Infinity },
        { id: '4', label: '4', x: 220, y: 220, state: 'unvisited', dist: Infinity },
        { id: '5', label: '5', x: 180, y: 110, state: 'unvisited', dist: Infinity }
      ];
      const cEdges: Edge2D[] = [
        { u: '1', v: '2', weight: 4, state: 'default' },
        { u: '2', v: '3', weight: 2, state: 'default' },
        { u: '3', v: '4', weight: 6, state: 'default' },
        { u: '4', v: '5', weight: 3, state: 'default' },
        { u: '5', v: '1', weight: 5, state: 'default' }
      ];
      setBaseNodes(cNodes);
      setBaseEdges(cEdges);
      setStartNodeId('1');
      setTargetNodeId('3');
    } else if (preset === 'star') {
      const sNodes: Node2D[] = [
        { id: 'C', label: 'Hub', x: 350, y: 140, state: 'unvisited', dist: 0 },
        { id: '1', label: '1', x: 200, y: 60, state: 'unvisited', dist: Infinity },
        { id: '2', label: '2', x: 500, y: 60, state: 'unvisited', dist: Infinity },
        { id: '3', label: '3', x: 500, y: 220, state: 'unvisited', dist: Infinity },
        { id: '4', label: '4', x: 200, y: 220, state: 'unvisited', dist: Infinity }
      ];
      const sEdges: Edge2D[] = [
        { u: 'C', v: '1', weight: 2, state: 'default' },
        { u: 'C', v: '2', weight: 4, state: 'default' },
        { u: 'C', v: '3', weight: 1, state: 'default' },
        { u: 'C', v: '4', weight: 7, state: 'default' }
      ];
      setBaseNodes(sNodes);
      setBaseEdges(sEdges);
      setStartNodeId('C');
      setTargetNodeId('3');
    } else if (preset === 'random') {
      const nextIdx = (randomSeedIdx + 1) % curatedRandomPool.length;
      setRandomSeedIdx(nextIdx);
      const selected = curatedRandomPool[nextIdx];
      setBaseNodes(selected.nodes);
      setBaseEdges(selected.edges);
      setStartNodeId(selected.start);
      setTargetNodeId(selected.target);
    } else {
      setBaseNodes(defaultNodes);
      setBaseEdges(defaultEdges);
      setStartNodeId('A');
      setTargetNodeId('F');
    }
  }, [defaultNodes, defaultEdges, randomSeedIdx, curatedRandomPool]);

  const handleSwapEndpoints = () => {
    const currentStart = startNodeId;
    const currentTarget = targetNodeId;
    setStartNodeId(currentTarget);
    setTargetNodeId(currentStart);
  };

  // =========================================================================
  // DYNAMIC ALGORITHM STEP-BY-STEP SIMULATION ENGINE WITH EXECUTION TRACES
  // =========================================================================
  const steps: GraphStepSnapshot[] = useMemo(() => {
    if (baseNodes.length === 0) return [];
    const snapshots: GraphStepSnapshot[] = [];

    const cloneNodes = (curNodes: Node2D[]): Node2D[] => curNodes.map(n => ({ ...n }));
    const cloneEdges = (curEdges: Edge2D[]): Edge2D[] => curEdges.map(e => ({ ...e }));

    const effectiveStart = (baseNodes.some(n => n.id === startNodeId) ? startNodeId : baseNodes[0]?.id) || 'A';
    const effectiveTarget = (baseNodes.some(n => n.id === targetNodeId) ? targetNodeId : baseNodes[baseNodes.length - 1]?.id) || 'F';

    const initialNodes = baseNodes.map(n => ({
      ...n,
      state: 'unvisited' as const,
      dist: n.id === effectiveStart ? 0 : Infinity
    }));
    const initialEdges = baseEdges.map(e => ({ ...e, state: 'default' as const }));

    const record = (
      curNodes: Node2D[],
      curEdges: Edge2D[],
      qOrStack: string[],
      qLabel: string,
      desc: string,
      traceHistory: { text: string; status: 'active' | 'done' | 'rejected' | 'neutral' }[],
      traceTitle: string,
      telemetry?: any,
      floydM?: number[][],
      fK?: number,
      floydForm?: string,
      pathNodes?: string[]
    ) => {
      snapshots.push({
        step: snapshots.length,
        nodes: cloneNodes(curNodes),
        edges: cloneEdges(curEdges),
        activeQueueOrStack: [...qOrStack],
        queueOrStackLabel: qLabel,
        description: desc,
        traceHistory: traceHistory.map(t => ({ ...t })),
        traceTitle,
        telemetry,
        floydMatrix: floydM ? floydM.map(r => [...r]) : undefined,
        floydK: fK,
        floydFormula: floydForm,
        highlightedPath: pathNodes ? [...pathNodes] : undefined
      });
    };

    // -------------------------------------------------------------
    // 1. DYNAMIC BFS (WITH CUSTOM START & DESTINATION)
    // -------------------------------------------------------------
    if (selectedAlgo === 'bfs') {
      const curNodes = cloneNodes(initialNodes);
      const curEdges = cloneEdges(initialEdges);
      const startId = effectiveStart;
      const visited = new Set<string>();
      const queue: string[] = [startId];
      const prev: Record<string, string | null> = {};
      const trace: { text: string; status: 'active' | 'done' | 'rejected' | 'neutral' }[] = [];

      curNodes.forEach(n => {
        prev[n.id] = null;
        n.dist = n.id === startId ? 0 : Infinity;
        n.state = n.id === startId ? 'visiting' : 'unvisited';
      });
      visited.add(startId);
      trace.push({ text: `Start: ${startId}`, status: 'active' });

      record(curNodes, curEdges, queue, 'FIFO Queue', `Initialized BFS: Enqueued source vertex ${startId} (Destination: ${effectiveTarget})`, trace, 'BFS Discovery Trace');

      while (queue.length > 0) {
        const u = queue.shift()!;
        const uNode = curNodes.find(n => n.id === u);
        if (uNode) uNode.state = 'visiting';
        record(curNodes, curEdges, queue, 'FIFO Queue', `Popped vertex ${u} from Queue. Inspecting incident edges...`, trace, 'BFS Discovery Trace');

        const incidentEdges = curEdges.filter(e => e.u === u || e.v === u);
        for (const edge of incidentEdges) {
          const v = edge.u === u ? edge.v : edge.u;
          const vNode = curNodes.find(n => n.id === v);

          if (!visited.has(v)) {
            visited.add(v);
            prev[v] = u;
            if (vNode && uNode && uNode.dist !== undefined) vNode.dist = uNode.dist + 1;
            edge.state = 'selected';
            if (vNode) vNode.state = 'visiting';
            queue.push(v);
            trace.push({ text: `${u} → ${v}`, status: 'done' });
            record(curNodes, curEdges, queue, 'FIFO Queue', `Discovered neighbor ${v} via (${u} ↔ ${v}). Enqueued ${v} (dist = ${vNode?.dist ?? 1})`, trace, 'BFS Discovery Trace');
          }
        }

        if (uNode) uNode.state = 'visited';
        if (visited.size === curNodes.length && queue.length === 0) break;
      }

      const path: string[] = [];
      let curr: string | null = effectiveTarget;
      while (curr) {
        path.unshift(curr);
        if (curr === startId) break;
        curr = prev[curr];
      }
      const isPathValid = path[0] === startId && path[path.length - 1] === effectiveTarget;
      const finalPath = isPathValid ? path : [startId];

      curEdges.forEach(e => {
        const isInPath = isPathValid && finalPath.some((node, i) => {
          if (i === finalPath.length - 1) return false;
          const nextNode = finalPath[i + 1];
          return (e.u === node && e.v === nextNode) || (e.u === nextNode && e.v === node);
        });
        e.state = isInPath ? 'mst' : 'default';
      });

      curNodes.forEach(n => {
        n.state = isPathValid && finalPath.includes(n.id) ? 'mst' : visited.has(n.id) ? 'visited' : 'unvisited';
      });

      record(
        curNodes,
        curEdges,
        finalPath,
        'Shortest Hop Path',
        isPathValid
          ? `🏆 BFS Complete! Shortest path from ${startId} to ${effectiveTarget}: [${finalPath.join(' → ')}] (${finalPath.length - 1} hops)`
          : `BFS Complete! No reachable path from ${startId} to ${effectiveTarget}.`,
        trace,
        'BFS Discovery Trace',
        undefined,
        undefined,
        undefined,
        undefined,
        finalPath
      );
    }

    // -------------------------------------------------------------
    // 2. DYNAMIC DFS (WITH CUSTOM START & DESTINATION)
    // -------------------------------------------------------------
    else if (selectedAlgo === 'dfs') {
      const curNodes = cloneNodes(initialNodes);
      const curEdges = cloneEdges(initialEdges);
      const startId = effectiveStart;
      const visited = new Set<string>();
      const stack: string[] = [];
      const prev: Record<string, string | null> = {};
      curNodes.forEach(n => { prev[n.id] = null; });
      const trace: { text: string; status: 'active' | 'done' | 'rejected' | 'neutral' }[] = [];

      const dfsVisit = (u: string) => {
        if (visited.size === curNodes.length) return;

        visited.add(u);
        stack.push(u);
        const uNode = curNodes.find(n => n.id === u);
        if (uNode) uNode.state = 'visiting';
        trace.push({ text: `Dive: ${u}`, status: 'active' });
        record(curNodes, curEdges, stack, 'Call Stack', `DFS Dive: Visited ${u} (Start: ${startId}, Dest: ${effectiveTarget}). Stack: [${stack.join(' → ')}]`, trace, 'DFS Call Stack Trace');

        if (visited.size === curNodes.length) return;

        const incidentEdges = curEdges.filter(e => e.u === u || e.v === u);
        for (const edge of incidentEdges) {
          if (visited.size === curNodes.length) break;
          const v = edge.u === u ? edge.v : edge.u;

          if (!visited.has(v)) {
            prev[v] = u;
            edge.state = 'selected';
            dfsVisit(v);
          }
        }

        if (visited.size < curNodes.length) {
          if (uNode) uNode.state = 'visited';
          stack.pop();
          trace.push({ text: `Backtrack: ${u}`, status: 'neutral' });
          record(curNodes, curEdges, stack, 'Call Stack', `Completed local branch at ${u}. Backtracking...`, trace, 'DFS Call Stack Trace');
        }
      };

      dfsVisit(startId);

      const path: string[] = [];
      let curr: string | null = effectiveTarget;
      while (curr) {
        path.unshift(curr);
        if (curr === startId) break;
        curr = prev[curr];
      }
      const isPathValid = path[0] === startId && path[path.length - 1] === effectiveTarget;
      const finalPath = isPathValid ? path : [startId];

      curEdges.forEach(e => {
        const isInPath = isPathValid && finalPath.some((node, i) => {
          if (i === finalPath.length - 1) return false;
          const nextNode = finalPath[i + 1];
          return (e.u === node && e.v === nextNode) || (e.u === nextNode && e.v === node);
        });
        e.state = isInPath ? 'mst' : 'default';
      });

      curNodes.forEach(n => {
        n.state = isPathValid && finalPath.includes(n.id) ? 'mst' : visited.has(n.id) ? 'visited' : 'unvisited';
      });

      record(
        curNodes,
        curEdges,
        finalPath,
        'Explored DFS Path',
        isPathValid
          ? `🏆 DFS Complete! Explored path from ${startId} to ${effectiveTarget}: [${finalPath.join(' → ')}]`
          : `DFS Complete! Explored ${visited.size} reachable vertices starting from ${startId}.`,
        trace,
        'DFS Call Stack Trace',
        undefined,
        undefined,
        undefined,
        undefined,
        finalPath
      );
    }

    // -------------------------------------------------------------
    // 3. DYNAMIC DIJKSTRA (CUSTOM SOURCE & DESTINATION)
    // -------------------------------------------------------------
    else if (selectedAlgo === 'dijkstra') {
      const curNodes = cloneNodes(initialNodes);
      const curEdges = cloneEdges(initialEdges);
      const dist: Record<string, number> = {};
      const prev: Record<string, string | null> = {};
      const settled = new Set<string>();
      const trace: { text: string; status: 'active' | 'done' | 'rejected' | 'neutral' }[] = [];

      curNodes.forEach(n => {
        dist[n.id] = n.id === effectiveStart ? 0 : Infinity;
        prev[n.id] = null;
        n.dist = dist[n.id];
      });

      trace.push({ text: `Start ${effectiveStart} (d=0)`, status: 'active' });
      record(curNodes, curEdges, [effectiveStart], 'Priority Queue', `Initialized Dijkstra: dist[${effectiveStart}] = 0, Destination = ${effectiveTarget}, all others = ∞`, trace, 'Dijkstra Relaxation Trace');

      while (settled.size < curNodes.length) {
        let u: string | null = null;
        let minDist = Infinity;
        for (const n of curNodes) {
          if (!settled.has(n.id) && dist[n.id] < minDist) {
            minDist = dist[n.id];
            u = n.id;
          }
        }

        if (!u || minDist === Infinity) break;
        settled.add(u);
        const uNode = curNodes.find(n => n.id === u)!;
        uNode.state = 'visiting';

        const pqRemaining = curNodes.filter(n => !settled.has(n.id) && dist[n.id] !== Infinity).map(n => `${n.id}(${dist[n.id]})`);
        record(curNodes, curEdges, pqRemaining, 'Priority Queue', `Settled vertex ${u} (min dist = ${minDist}). Relaxing incident edges...`, trace, 'Dijkstra Relaxation Trace');

        const incident = curEdges.filter(e => e.u === u || e.v === u);
        for (const edge of incident) {
          const v = edge.u === u ? edge.v : edge.u;
          const vNode = curNodes.find(n => n.id === v)!;
          const weight = edge.weight ?? 1;

          if (!settled.has(v)) {
            edge.state = 'examining';
            if (dist[u] + weight < dist[v]) {
              dist[v] = dist[u] + weight;
              prev[v] = u;
              vNode.dist = dist[v];
              edge.state = 'selected';
              trace.push({ text: `Relax ${u}→${v} (d=${dist[v]})`, status: 'done' });
              record(curNodes, curEdges, pqRemaining, 'Priority Queue', `Relaxed (${u} ↔ ${v}, wt=${weight}): dist[${v}] = ${dist[v]}`, trace, 'Dijkstra Relaxation Trace');
            }
          }
        }

        uNode.state = 'visited';
      }

      const path: string[] = [];
      let curr: string | null = effectiveTarget;
      while (curr) {
        path.unshift(curr);
        if (curr === effectiveStart) break;
        curr = prev[curr];
      }
      const isPathValid = path[0] === effectiveStart && path[path.length - 1] === effectiveTarget;
      const finalPath = isPathValid ? path : [effectiveStart];

      curEdges.forEach(e => {
        const isInPath = isPathValid && finalPath.some((node, i) => {
          if (i === finalPath.length - 1) return false;
          const nextNode = finalPath[i + 1];
          return (e.u === node && e.v === nextNode) || (e.u === nextNode && e.v === node);
        });
        e.state = isInPath ? 'mst' : 'default';
      });

      curNodes.forEach(n => {
        n.state = isPathValid && finalPath.includes(n.id) ? 'mst' : settled.has(n.id) ? 'visited' : 'unvisited';
      });

      trace.push({ text: `🏆 Path: ${finalPath.join('→')} (Cost ${dist[effectiveTarget] ?? 0})`, status: 'active' });

      record(
        curNodes,
        curEdges,
        finalPath,
        'Shortest Path',
        isPathValid
          ? `🏆 Dijkstra Complete! Optimal Shortest Path from ${effectiveStart} to ${effectiveTarget}: [${finalPath.join(' → ')}] | Total Cost = ${dist[effectiveTarget] ?? 0}`
          : `Dijkstra Complete! No reachable path from ${effectiveStart} to ${effectiveTarget}.`,
        trace,
        'Dijkstra Relaxation Trace',
        undefined,
        undefined,
        undefined,
        undefined,
        finalPath
      );
    }

    // -------------------------------------------------------------
    // 4. DYNAMIC BELLMAN-FORD (CUSTOM SOURCE & DESTINATION)
    // -------------------------------------------------------------
    else if (selectedAlgo === 'bellman_ford') {
      const curNodes = cloneNodes(initialNodes);
      const curEdges = cloneEdges(initialEdges);
      const dist: Record<string, number> = {};
      const prev: Record<string, string | null> = {};
      const trace: { text: string; status: 'active' | 'done' | 'rejected' | 'neutral' }[] = [];

      curNodes.forEach(n => {
        dist[n.id] = n.id === effectiveStart ? 0 : Infinity;
        prev[n.id] = null;
        n.dist = dist[n.id];
      });

      const V = curNodes.length;
      record(curNodes, curEdges, [], 'Pass HUD', `Bellman-Ford: Starting ${V - 1} passes from Source [${effectiveStart}] towards Destination [${effectiveTarget}].`, trace, 'Bellman-Ford Trace');

      for (let pass = 1; pass <= V - 1; pass++) {
        let changedInPass = false;
        for (let i = 0; i < curEdges.length; i++) {
          const edge = curEdges[i];
          const u = edge.u;
          const v = edge.v;
          const w = edge.weight ?? 1;

          edge.state = 'examining';
          if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            prev[v] = u;
            const vNode = curNodes.find(n => n.id === v);
            if (vNode) vNode.dist = dist[v];
            edge.state = 'selected';
            changedInPass = true;
            trace.push({ text: `P${pass}: ${u}→${v} (d=${dist[v]})`, status: 'done' });
            record(curNodes, curEdges, [`Pass ${pass}/${V - 1}`], 'Pass HUD', `[Pass ${pass}] Relaxed (${u} → ${v}, wt=${w}): dist[${v}] = ${dist[v]}`, trace, 'Bellman-Ford Trace');
          } else if (dist[v] !== Infinity && dist[v] + w < dist[u]) {
            dist[u] = dist[v] + w;
            prev[u] = v;
            const uNode = curNodes.find(n => n.id === u);
            if (uNode) uNode.dist = dist[u];
            edge.state = 'selected';
            changedInPass = true;
            trace.push({ text: `P${pass}: ${v}→${u} (d=${dist[u]})`, status: 'done' });
            record(curNodes, curEdges, [`Pass ${pass}/${V - 1}`], 'Pass HUD', `[Pass ${pass}] Relaxed (${v} → ${u}, wt=${w}): dist[${u}] = ${dist[u]}`, trace, 'Bellman-Ford Trace');
          }
        }

        if (!changedInPass) {
          trace.push({ text: `Converged at Pass ${pass}`, status: 'active' });
          record(curNodes, curEdges, [`Pass ${pass} (Converged)`], 'Pass HUD', `Early Convergence at Pass ${pass}! Optimal shortest paths computed.`, trace, 'Bellman-Ford Trace');
          break;
        }
      }

      const path: string[] = [];
      let curr: string | null = effectiveTarget;
      while (curr) {
        path.unshift(curr);
        if (curr === effectiveStart) break;
        curr = prev[curr];
      }
      const isPathValid = path[0] === effectiveStart && path[path.length - 1] === effectiveTarget;
      const finalPath = isPathValid ? path : [effectiveStart];

      curEdges.forEach(e => {
        const isInPath = isPathValid && finalPath.some((node, i) => {
          if (i === finalPath.length - 1) return false;
          const nextNode = finalPath[i + 1];
          return (e.u === node && e.v === nextNode) || (e.u === nextNode && e.v === node);
        });
        e.state = isInPath ? 'mst' : 'default';
      });

      curNodes.forEach(n => {
        n.state = isPathValid && finalPath.includes(n.id) ? 'mst' : 'visited';
      });

      trace.push({ text: `🏆 Route: ${finalPath.join('→')} (Cost ${dist[effectiveTarget] ?? 0})`, status: 'active' });

      record(
        curNodes,
        curEdges,
        finalPath,
        'Shortest Path',
        isPathValid
          ? `🏆 Bellman-Ford Complete! Optimal Route from ${effectiveStart} to ${effectiveTarget}: [${finalPath.join(' → ')}] | Total Cost = ${dist[effectiveTarget] ?? 0}`
          : `Bellman-Ford Complete! No route from ${effectiveStart} to ${effectiveTarget}.`,
        trace,
        'Bellman-Ford Trace',
        undefined,
        undefined,
        undefined,
        undefined,
        finalPath
      );
    }

    // -------------------------------------------------------------
    // 5. PRIM'S MST (GROWN FROM CUSTOM SEED ROOT)
    // -------------------------------------------------------------
    else if (selectedAlgo === 'prims') {
      const curNodes = cloneNodes(initialNodes);
      const curEdges = cloneEdges(initialEdges);
      const inMST = new Set<string>();
      const startId = effectiveStart;
      const trace: { text: string; status: 'active' | 'done' | 'rejected' | 'neutral' }[] = [];

      inMST.add(startId);
      const rootNode = curNodes.find(n => n.id === startId);
      if (rootNode) rootNode.state = 'mst';
      trace.push({ text: `Seed Root: ${startId}`, status: 'active' });

      let totalMstWeight = 0;
      record(curNodes, curEdges, [startId], 'MST Set S', `Prim's Initialized: Seed Root [${startId}] chosen. Destination to connect: [${effectiveTarget}].`, trace, "Prim's Cut Trace");

      while (inMST.size < curNodes.length) {
        let minEdge: Edge2D | null = null;
        let minWeight = Infinity;
        let nextVertex: string | null = null;

        for (const edge of curEdges) {
          const uIn = inMST.has(edge.u);
          const vIn = inMST.has(edge.v);
          const w = edge.weight ?? 1;

          if ((uIn && !vIn) || (!uIn && vIn)) {
            edge.state = 'examining';
            if (w < minWeight) {
              minWeight = w;
              minEdge = edge;
              nextVertex = uIn ? edge.v : edge.u;
            }
          }
        }

        if (!minEdge || !nextVertex) break;

        minEdge.state = 'mst';
        inMST.add(nextVertex);
        const vNode = curNodes.find(n => n.id === nextVertex);
        if (vNode) vNode.state = 'mst';
        totalMstWeight += minWeight;

        trace.push({ text: `+ Edge (${minEdge.u}-${minEdge.v}, wt=${minWeight})`, status: 'done' });

        curEdges.forEach(e => {
          if (e.state === 'examining') e.state = 'default';
        });

        record(
          curNodes,
          curEdges,
          Array.from(inMST),
          'MST Set S',
          `Added cheapest crossing edge (${minEdge.u} ↔ ${minEdge.v}, wt=${minWeight}) to MST. Total Cost = ${totalMstWeight}`,
          trace,
          "Prim's Cut Trace"
        );
      }

      trace.push({ text: `Total MST Weight: ${totalMstWeight}`, status: 'active' });
      record(
        curNodes,
        curEdges,
        Array.from(inMST),
        'MST Set S',
        `Prim's MST Complete! Grown from Seed Root [${startId}], spanning all ${inMST.size} vertices with Total Cost = ${totalMstWeight}. Target [${effectiveTarget}] is fully connected.`,
        trace,
        "Prim's Cut Trace"
      );
    }

    // -------------------------------------------------------------
    // 6. KRUSKAL'S MST
    // -------------------------------------------------------------
    else if (selectedAlgo === 'kruskals') {
      const curNodes = cloneNodes(initialNodes);
      const curEdges = cloneEdges(initialEdges);
      const sortedEdges = [...curEdges].sort((a, b) => (a.weight ?? 1) - (b.weight ?? 1));
      const trace: { text: string; status: 'active' | 'done' | 'rejected' | 'neutral' }[] = [];

      const parent: Record<string, string> = {};
      curNodes.forEach(n => { parent[n.id] = n.id; });

      const find = (i: string): string => {
        if (parent[i] === i) return i;
        parent[i] = find(parent[i]);
        return parent[i];
      };

      const union = (i: string, j: string) => {
        const rootI = find(i);
        const rootJ = find(j);
        if (rootI !== rootJ) parent[rootI] = rootJ;
      };

      let mstEdgesCount = 0;
      let totalMstWeight = 0;
      record(curNodes, curEdges, [], 'Edge Queue', `Kruskal's: Sorted ${curEdges.length} edges in ascending order. (Start: ${effectiveStart}, Dest: ${effectiveTarget})`, trace, "Kruskal's Decision Trace");

      for (const sEdge of sortedEdges) {
        const actualEdge = curEdges.find(e => (e.u === sEdge.u && e.v === sEdge.v) || (e.u === sEdge.v && e.v === sEdge.u))!;
        const rootU = find(actualEdge.u);
        const rootV = find(actualEdge.v);
        const w = actualEdge.weight ?? 1;

        if (rootU !== rootV) {
          union(actualEdge.u, actualEdge.v);
          actualEdge.state = 'mst';
          mstEdgesCount++;
          totalMstWeight += w;

          const uNode = curNodes.find(n => n.id === actualEdge.u);
          const vNode = curNodes.find(n => n.id === actualEdge.v);
          if (uNode) uNode.state = 'mst';
          if (vNode) vNode.state = 'mst';

          trace.push({ text: `✔ Accept (${actualEdge.u}-${actualEdge.v}, wt=${w})`, status: 'done' });
          record(curNodes, curEdges, [`Edge ${actualEdge.u}-${actualEdge.v} (wt=${w})`], 'Edge Queue', `ACCEPTED (${actualEdge.u} ↔ ${actualEdge.v}, wt=${w}): Merged components. MST Cost = ${totalMstWeight}`, trace, "Kruskal's Decision Trace");
        } else {
          actualEdge.state = 'rejected';
          trace.push({ text: `❌ Reject (${actualEdge.u}-${actualEdge.v}, Cycle)`, status: 'rejected' });
          record(curNodes, curEdges, [`Edge ${actualEdge.u}-${actualEdge.v} (Cycle)`], 'Edge Queue', `REJECTED (${actualEdge.u} ↔ ${actualEdge.v}, wt=${w}): Forms cycle! Both share Root ${rootU}`, trace, "Kruskal's Decision Trace");
        }

        if (mstEdgesCount === curNodes.length - 1) break;
      }

      trace.push({ text: `MST Cost: ${totalMstWeight}`, status: 'active' });
      record(
        curNodes,
        curEdges,
        ['Complete'],
        'Edge Queue',
        `Kruskal's MST Complete! Connected spanning forest with Total Weight = ${totalMstWeight}. Start [${effectiveStart}] & Dest [${effectiveTarget}] are connected.`,
        trace,
        "Kruskal's Decision Trace"
      );
    }

    // -------------------------------------------------------------
    // 7. TOPOLOGICAL SORT
    // -------------------------------------------------------------
    else if (selectedAlgo === 'topo_sort') {
      const curNodes = cloneNodes(initialNodes);
      const curEdges = cloneEdges(initialEdges);
      const inDegree: Record<string, number> = {};
      const trace: { text: string; status: 'active' | 'done' | 'rejected' | 'neutral' }[] = [];

      curNodes.forEach(n => { inDegree[n.id] = 0; });
      curEdges.forEach(e => {
        inDegree[e.v] = (inDegree[e.v] || 0) + 1;
      });
      curNodes.forEach(n => { n.inDegree = inDegree[n.id]; });

      const queue: string[] = curNodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
      const topoOrder: string[] = [];

      trace.push({ text: `In-Degree 0: [${queue.join(', ')}]`, status: 'active' });
      record(curNodes, curEdges, queue, 'Zero In-Degree Queue', `Calculated In-Degrees. Enqueued zero in-degree vertices: [${queue.join(', ')}] (Focus: ${effectiveStart} → ${effectiveTarget})`, trace, "Kahn's Topological Trace");

      while (queue.length > 0) {
        const u = queue.shift()!;
        topoOrder.push(u);
        const uNode = curNodes.find(n => n.id === u);
        if (uNode) uNode.state = 'visited';

        trace.push({ text: `Order: ${u}`, status: 'done' });
        record(curNodes, curEdges, queue, 'Zero In-Degree Queue', `Dequeued ${u}. Appended to Topological Sequence: [${topoOrder.join(' → ')}]`, trace, "Kahn's Topological Trace");

        const outgoing = curEdges.filter(e => e.u === u);
        for (const edge of outgoing) {
          edge.state = 'selected';
          const v = edge.v;
          inDegree[v]--;
          const vNode = curNodes.find(n => n.id === v);
          if (vNode) vNode.inDegree = inDegree[v];

          if (inDegree[v] === 0) {
            queue.push(v);
            if (vNode) vNode.state = 'visiting';
            record(curNodes, curEdges, queue, 'Zero In-Degree Queue', `In-Degree of ${v} dropped to 0! Enqueued ${v}`, trace, "Kahn's Topological Trace");
          }
        }
      }

      if (topoOrder.length === curNodes.length) {
        trace.push({ text: `Final: [${topoOrder.join('→')}]`, status: 'active' });
        record(curNodes, curEdges, topoOrder, 'Final Order', `Topological Ordering Valid: [${topoOrder.join(' → ')}]. Dependency precedence verified.`, trace, "Kahn's Topological Trace");
      } else {
        trace.push({ text: `Cycle Detected!`, status: 'rejected' });
        record(curNodes, curEdges, topoOrder, 'Cycle Detected', `Graph contains a Directed Cycle! Only processed [${topoOrder.join(' → ')}]`, trace, "Kahn's Topological Trace");
      }
    }

    // -------------------------------------------------------------
    // 8. FLOYD-WARSHALL (2D ALL-PAIRS MATRIX WITH START/DEST QUERY)
    // -------------------------------------------------------------
    else if (selectedAlgo === 'floyd_warshall') {
      const curNodes = cloneNodes(initialNodes);
      const curEdges = cloneEdges(initialEdges);
      const N = curNodes.length;
      const matrix: number[][] = Array(N).fill(0).map(() => Array(N).fill(Infinity));

      for (let i = 0; i < N; i++) matrix[i][i] = 0;
      for (const e of curEdges) {
        const uIdx = curNodes.findIndex(n => n.id === e.u);
        const vIdx = curNodes.findIndex(n => n.id === e.v);
        const w = e.weight ?? 1;
        if (uIdx !== -1 && vIdx !== -1) {
          matrix[uIdx][vIdx] = Math.min(matrix[uIdx][vIdx], w);
          matrix[vIdx][uIdx] = Math.min(matrix[vIdx][uIdx], w);
        }
      }

      const startIdx = curNodes.findIndex(n => n.id === effectiveStart);
      const targetIdx = curNodes.findIndex(n => n.id === effectiveTarget);

      record(
        curNodes,
        curEdges,
        [],
        'Matrix HUD',
        `Initialized 2D Distance Matrix D^(0). Querying Shortest Path from [${effectiveStart}] to [${effectiveTarget}].`,
        [],
        'Floyd-Warshall Matrix',
        undefined,
        matrix,
        0,
        `Base Case: Direct edge lengths between all pairs (i, j). Initial D[${effectiveStart}][${effectiveTarget}] = ${matrix[startIdx]?.[targetIdx] === Infinity ? '∞' : matrix[startIdx]?.[targetIdx]}`
      );

      for (let k = 0; k < N; k++) {
        const kLabel = curNodes[k].label;
        let relaxationsCount = 0;

        for (let i = 0; i < N; i++) {
          for (let j = 0; j < N; j++) {
            if (matrix[i][k] + matrix[k][j] < matrix[i][j]) {
              matrix[i][j] = matrix[i][k] + matrix[k][j];
              relaxationsCount++;
            }
          }
        }

        const queryDist = matrix[startIdx]?.[targetIdx] === Infinity ? '∞' : matrix[startIdx]?.[targetIdx];
        const formulaText = `D[i][j] = min(D[i][j], D[i][${kLabel}] + D[${kLabel}][j]) — Evaluated intermediate stop ${kLabel}. Current D[${effectiveStart}][${effectiveTarget}] = ${queryDist}. (${relaxationsCount} improvements)`;

        record(
          curNodes,
          curEdges,
          [`Intermediate: ${kLabel}`],
          'Matrix HUD',
          `Pass k=${k + 1}/${N}: Relaxed all pairs through intermediate vertex ${kLabel}.`,
          [],
          'Floyd-Warshall Matrix',
          undefined,
          matrix,
          k,
          formulaText
        );
      }

      const finalQueryDist = matrix[startIdx]?.[targetIdx] === Infinity ? '∞' : matrix[startIdx]?.[targetIdx];
      record(
        curNodes,
        curEdges,
        ['Finalized'],
        'Matrix HUD',
        `🏆 Floyd-Warshall Complete! Shortest Distance from [${effectiveStart}] to [${effectiveTarget}] is ${finalQueryDist}. All-Pairs Matrix computed.`,
        [],
        'Floyd-Warshall Matrix',
        undefined,
        matrix,
        N - 1,
        `Optimal Shortest Distance from [${effectiveStart}] to [${effectiveTarget}] = ${finalQueryDist}. Matrix finalized.`
      );
    }

    return snapshots;
  }, [baseNodes, baseEdges, selectedAlgo, startNodeId, targetNodeId]);

  // Player Loop
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

  const safeStep = Math.min(currentStep, Math.max(0, steps.length - 1));
  const currentSnap = steps[safeStep] || steps[0] || {
    step: 0,
    nodes: baseNodes,
    edges: baseEdges,
    activeQueueOrStack: [],
    queueOrStackLabel: 'Status',
    description: 'Ready.',
    traceHistory: [],
    traceTitle: 'Trace'
  };

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    handleReset();
  }, [selectedAlgo, activePreset, startNodeId, targetNodeId, baseNodes, baseEdges, handleReset]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
      {/* 8 Graph Algorithm Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '8px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        {[
          { id: 'dijkstra', label: "Dijkstra's (Shortest Path)" },
          { id: 'bfs', label: 'Breadth-First Search (BFS)' },
          { id: 'dfs', label: 'Depth-First Search (DFS)' },
          { id: 'bellman_ford', label: 'Bellman-Ford (± Weights)' },
          { id: 'prims', label: "Prim's Algorithm (MST)" },
          { id: 'kruskals', label: "Kruskal's Algorithm (MST)" },
          { id: 'floyd_warshall', label: 'Floyd-Warshall (All-Pairs)' },
          { id: 'topo_sort', label: 'Topological Sort (DAG)' }
        ].map(tab => {
          const isActive = selectedAlgo === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedAlgo(tab.id as any);
                onSelectAlgorithm(tab.id);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: isActive ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Preset & Graph Configuration Strip WITH START & DESTINATION CONTROLS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '8px 12px',
        background: '#090d16',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {/* Topology Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Preset:</span>
          {[
            { id: 'default', label: 'Default' },
            { id: 'dense', label: 'Dense Mesh' },
            { id: 'tree', label: 'Binary Tree' },
            { id: 'cycle', label: 'Ring Cycle' },
            { id: 'star', label: 'Star / Hub' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => loadPreset(p.id as GraphPreset)}
              style={{
                padding: '3px 9px',
                borderRadius: '6px',
                border: activePreset === p.id ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                background: activePreset === p.id ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.04)',
                color: activePreset === p.id ? '#c084fc' : '#cbd5e1',
                fontSize: '0.73rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {p.label}
            </button>
          ))}

          {/* Random Graph Button */}
          <button
            onClick={() => loadPreset('random')}
            style={{
              padding: '3px 11px',
              borderRadius: '6px',
              border: '1px solid #10b981',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              fontSize: '0.73rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Shuffle size={12} /> 🎲 Random ({randomSeedIdx + 1}/{curatedRandomPool.length})
          </button>
        </div>

        {/* UNIVERSAL START & DESTINATION CONTROLS FOR ALL ALGORITHMS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Start Point (Source / Seed) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(56, 189, 248, 0.12)',
            padding: '3px 8px',
            borderRadius: '8px',
            border: '1px solid rgba(56, 189, 248, 0.4)'
          }}>
            <Compass size={13} color="#38bdf8" />
            <span style={{ fontSize: '0.73rem', color: '#38bdf8', fontWeight: 800 }}>Start / Source:</span>
            <select
              value={startNodeId}
              onChange={(e) => setStartNodeId(e.target.value)}
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#0f172a',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {baseNodes.map(n => (
                <option key={`start-opt-${n.id}`} value={n.id}>
                  Vertex {n.label}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapEndpoints}
            title="Swap Start and Destination"
            style={{
              padding: '4px 6px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ArrowRightLeft size={12} />
          </button>

          {/* Destination Point (Target) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(16, 185, 129, 0.12)',
            padding: '3px 8px',
            borderRadius: '8px',
            border: '1px solid rgba(16, 185, 129, 0.4)'
          }}>
            <Target size={13} color="#34d399" />
            <span style={{ fontSize: '0.73rem', color: '#34d399', fontWeight: 800 }}>Destination:</span>
            <select
              value={targetNodeId}
              onChange={(e) => setTargetNodeId(e.target.value)}
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#0f172a',
                border: '1px solid #34d399',
                color: '#34d399',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {baseNodes.map(n => (
                <option key={`dest-opt-${n.id}`} value={n.id}>
                  Target {n.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cheatsheet Modal Button */}
          <button
            onClick={() => setShowCheatsheet(!showCheatsheet)}
            style={{
              padding: '3px 10px',
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
            <HelpCircle size={12} /> Comparison
          </button>
        </div>
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
            {isPlaying ? 'Pause' : 'Auto Play'}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              if (currentStep > 0) setCurrentStep(c => c - 1);
            }}
            disabled={safeStep === 0}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', opacity: safeStep === 0 ? 0.4 : 1 }}
          >
            ‹ Prev
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              if (currentStep < steps.length - 1) setCurrentStep(c => c + 1);
            }}
            disabled={safeStep >= steps.length - 1}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', opacity: safeStep >= steps.length - 1 ? 0.4 : 1 }}
          >
            Next ›
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#94a3b8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>

        {/* Live Queue / Stack Status Banner */}
        {currentSnap.activeQueueOrStack.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '8px', border: '1px solid #34d399' }}>
            <Layers size={13} color="#34d399" />
            <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 800 }}>
              {currentSnap.queueOrStackLabel}: [{currentSnap.activeQueueOrStack.join(' › ')}]
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Speed: {localSpeed}x</span>
            <input
              type="range"
              min="1"
              max="5"
              value={localSpeed}
              onChange={(e) => setLocalSpeed(parseInt(e.target.value, 10))}
              style={{ width: '60px', accentColor: '#38bdf8' }}
            />
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Step <strong>{safeStep}</strong> / {Math.max(0, steps.length - 1)}
          </span>
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
          {currentSnap.description}
        </span>
      </div>

      {/* Execution Trace History Ribbon */}
      {selectedAlgo !== 'floyd_warshall' && currentSnap.traceHistory.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <Activity size={12} color="#38bdf8" />
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800 }}>{currentSnap.traceTitle}:</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
            {currentSnap.traceHistory.map((item, idx) => (
              <span
                key={`tr-${idx}`}
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: item.status === 'active'
                    ? 'rgba(56, 189, 248, 0.25)'
                    : item.status === 'done'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : item.status === 'rejected'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: item.status === 'active'
                    ? '1px solid #38bdf8'
                    : item.status === 'done'
                    ? '1px solid #10b981'
                    : item.status === 'rejected'
                    ? '1px solid #ef4444'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: item.status === 'active'
                    ? '#38bdf8'
                    : item.status === 'done'
                    ? '#34d399'
                    : item.status === 'rejected'
                    ? '#f87171'
                    : '#94a3b8'
                }}
              >
                {item.status === 'done' && <CheckCircle2 size={10} />}
                {item.status === 'rejected' && <XCircle size={10} />}
                {item.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Canvas Viewport */}
      <div style={{
        flex: 1,
        minHeight: '380px',
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #030712 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {selectedAlgo === 'floyd_warshall' && currentSnap.floydMatrix ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
            {/* Intuitive Mathematical Substituted Formula Box */}
            <div style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              padding: '8px 16px',
              maxWidth: '650px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 800, display: 'block', marginBottom: '3px' }}>
                RECURRENCE: D[i][j] = min( D[i][j], D[i][k] + D[k][j] )
              </span>
              <span style={{ fontSize: '0.75rem', color: '#f1f5f9' }}>
                {currentSnap.floydFormula}
              </span>
            </div>

            {/* 2D Matrix Table */}
            <div style={{ border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 0 20px rgba(0,0,0,0.6)' }}>
              <table style={{ borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#0284c7', color: '#fff', fontSize: '0.78rem' }}>
                    <th style={{ padding: '8px 14px' }}>From \ To</th>
                    {currentSnap.nodes.map((n, cIdx) => (
                      <th
                        key={`hdr-${n.id}`}
                        style={{
                          padding: '8px 14px',
                          background: cIdx === (currentSnap.floydK ?? -1) ? '#7e22ce' : n.id === targetNodeId ? '#059669' : '#0284c7'
                        }}
                      >
                        {n.label} {cIdx === (currentSnap.floydK ?? -1) ? '(k)' : n.id === targetNodeId ? '🎯' : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentSnap.floydMatrix.map((row, rIdx) => {
                    const isKRow = rIdx === (currentSnap.floydK ?? -1);
                    const isStartRow = currentSnap.nodes[rIdx]?.id === startNodeId;
                    return (
                      <tr key={`row-${rIdx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: isKRow ? 'rgba(126, 34, 206, 0.2)' : isStartRow ? 'rgba(56, 189, 248, 0.15)' : rIdx % 2 === 0 ? '#1e293b' : '#0f172a' }}>
                        <td style={{ padding: '8px 14px', fontWeight: 800, color: isKRow ? '#c084fc' : isStartRow ? '#38bdf8' : '#cbd5e1', background: isKRow ? '#7e22ce' : isStartRow ? 'rgba(2, 132, 199, 0.4)' : undefined }}>
                          {currentSnap.nodes[rIdx]?.label} {isKRow ? '(k)' : isStartRow ? '🚀' : ''}
                        </td>
                        {row.map((val, cIdx) => {
                          const isKCell = rIdx === currentSnap.floydK || cIdx === currentSnap.floydK;
                          const isQueriedCell = currentSnap.nodes[rIdx]?.id === startNodeId && currentSnap.nodes[cIdx]?.id === targetNodeId;
                          return (
                            <td
                              key={`cell-${rIdx}-${cIdx}`}
                              style={{
                                padding: '8px 14px',
                                color: isQueriedCell ? '#fbbf24' : val === Infinity ? 'rgba(255,255,255,0.3)' : val === 0 ? '#10b981' : '#fff',
                                fontWeight: isQueriedCell ? 900 : 700,
                                fontSize: isQueriedCell ? '0.95rem' : '0.78rem',
                                background: isQueriedCell ? 'rgba(245, 158, 11, 0.25)' : isKCell ? 'rgba(168, 85, 247, 0.08)' : undefined,
                                border: isQueriedCell ? '2px solid #fbbf24' : undefined
                              }}
                            >
                              {val === Infinity ? '∞' : val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <svg viewBox="0 0 700 280" style={{ width: '100%', height: '100%' }}>
            {/* Draw Edges */}
            {currentSnap.edges.map((e, idx) => {
              const uNode = currentSnap.nodes.find(n => n.id === e.u);
              const vNode = currentSnap.nodes.find(n => n.id === e.v);
              if (!uNode || !vNode) return null;

              let stroke = 'rgba(255, 255, 255, 0.15)';
              let strokeWidth = '2';
              let strokeDasharray = 'none';
              let edgeFilter = 'none';

              if (e.state === 'mst') {
                stroke = '#10b981';
                strokeWidth = '5';
                edgeFilter = 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.9))';
              } else if (e.state === 'selected') {
                stroke = '#38bdf8';
                strokeWidth = '3.5';
              } else if (e.state === 'examining') {
                stroke = '#f59e0b';
                strokeWidth = '3';
              } else if (e.state === 'rejected') {
                stroke = '#ef4444';
                strokeWidth = '2';
                strokeDasharray = '4 4';
              }

              const midX = (uNode.x + vNode.x) / 2;
              const midY = (uNode.y + vNode.y) / 2;

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={uNode.x}
                    y1={uNode.y}
                    x2={vNode.x}
                    y2={vNode.y}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    style={{ filter: edgeFilter, transition: 'all 0.25s ease' }}
                  />
                  {e.weight !== undefined && (
                    <>
                      <rect
                        x={midX - 10}
                        y={midY - 10}
                        width="20"
                        height="20"
                        rx="4"
                        fill="#0f172a"
                        stroke={e.state === 'mst' ? '#10b981' : 'rgba(255, 255, 255, 0.2)'}
                      />
                      <text
                        x={midX}
                        y={midY + 4}
                        fill={e.state === 'mst' ? '#34d399' : '#94a3b8'}
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {e.weight}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Draw Nodes */}
            {currentSnap.nodes.map(n => {
              const isStart = n.id === startNodeId;
              const isTargetDestination = n.id === targetNodeId;
              let fill = '#1e293b';
              let stroke = '#38bdf8';
              let glow = 'none';

              if (n.state === 'mst') {
                fill = '#064e3b';
                stroke = '#34d399';
                glow = '0 0 16px rgba(52, 211, 153, 0.9)';
              } else if (n.state === 'visiting') {
                fill = '#78350f';
                stroke = '#fbbf24';
                glow = '0 0 16px rgba(251, 191, 36, 0.9)';
              } else if (n.state === 'visited') {
                fill = '#0284c7';
                stroke = '#38bdf8';
                glow = '0 0 10px rgba(56, 189, 248, 0.5)';
              }

              return (
                <g
                  key={n.id}
                  onClick={() => {
                    if (n.id === startNodeId) {
                      // Clicked start node -> keep
                    } else {
                      setTargetNodeId(n.id);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={isStart || isTargetDestination ? "24" : "20"}
                    fill={isStart ? '#0369a1' : isTargetDestination ? '#047857' : fill}
                    stroke={isStart ? '#38bdf8' : isTargetDestination ? '#34d399' : stroke}
                    strokeWidth={isStart || isTargetDestination ? "4" : "3"}
                    style={{ filter: isStart ? 'drop-shadow(0 0 16px rgba(56,189,248,0.8))' : isTargetDestination ? 'drop-shadow(0 0 16px rgba(52,211,153,0.8))' : glow, transition: 'all 0.25s ease' }}
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {n.label}
                  </text>

                  {/* Start & Destination Pill Badges */}
                  {isStart && (
                    <g transform={`translate(${n.x}, ${n.y - 28})`}>
                      <rect x="-24" y="-8" width="48" height="15" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                      <text x="0" y="3" fill="#ffffff" fontSize="8.5" fontWeight="bold" textAnchor="middle">START</text>
                    </g>
                  )}
                  {isTargetDestination && !isStart && (
                    <g transform={`translate(${n.x}, ${n.y - 28})`}>
                      <rect x="-22" y="-8" width="44" height="15" rx="4" fill="#059669" stroke="#34d399" strokeWidth="1" />
                      <text x="0" y="3" fill="#ffffff" fontSize="8.5" fontWeight="bold" textAnchor="middle">DEST</text>
                    </g>
                  )}

                  {n.dist !== undefined && (selectedAlgo === 'dijkstra' || selectedAlgo === 'bellman_ford' || selectedAlgo === 'bfs') && !isStart && (
                    <text
                      x={n.x}
                      y={n.y + 36}
                      fill={n.state === 'mst' ? '#34d399' : '#38bdf8'}
                      fontSize="9.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      d={n.dist === Infinity ? '∞' : n.dist}
                    </text>
                  )}
                  {n.inDegree !== undefined && selectedAlgo === 'topo_sort' && (
                    <text
                      x={n.x}
                      y={n.y + 36}
                      fill="#c084fc"
                      fontSize="9.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      in={n.inDegree}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Graph Algorithms Comparison Table */}
      {showCheatsheet && (
        <div style={{
          background: '#030712',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          padding: '12px',
          overflowX: 'auto'
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', marginBottom: '8px', display: 'block' }}>
            Graph Algorithms Comparison Matrix (Osmania Core Syllabus)
          </span>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '6px 10px' }}>Algorithm</th>
                <th style={{ padding: '6px 10px' }}>Time</th>
                <th style={{ padding: '6px 10px' }}>Space</th>
                <th style={{ padding: '6px 10px' }}>Solves</th>
                <th style={{ padding: '6px 10px' }}>Weighted?</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Depth-First Search', time: 'O(V + E)', space: 'O(V)', solves: 'Traversal / Connected Components', weighted: 'No' },
                { name: 'Breadth-First Search', time: 'O(V + E)', space: 'O(V)', solves: 'Traversal / Shortest Path (Unweighted)', weighted: 'No' },
                { name: 'Topological Sort', time: 'O(V + E)', space: 'O(V)', solves: 'Ordering (DAG)', weighted: 'No' },
                { name: "Dijkstra's Algorithm", time: 'O((V + E) log V)', space: 'O(V)', solves: 'Single-Source Shortest Path', weighted: 'Yes (Non-negative)' },
                { name: 'Bellman-Ford Algorithm', time: 'O(V · E)', space: 'O(V)', solves: 'Shortest Path (Detects -Cycles)', weighted: 'Yes (± Weights)' },
                { name: "Kruskal's Algorithm", time: 'O(E log E)', space: 'O(V)', solves: 'Minimum Spanning Tree (MST)', weighted: 'Yes' },
                { name: "Prim's Algorithm", time: 'O(E log V)', space: 'O(V)', solves: 'Minimum Spanning Tree (MST)', weighted: 'Yes' },
                { name: 'Floyd-Warshall', time: 'O(V³)', space: 'O(V²)', solves: 'All-Pairs Shortest Paths', weighted: 'Yes' }
              ].map((row, idx) => (
                <tr key={`comp-${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: 700, color: '#f8fafc' }}>{row.name}</td>
                  <td style={{ padding: '6px 10px', color: '#34d399' }}>{row.time}</td>
                  <td style={{ padding: '6px 10px', color: '#c084fc' }}>{row.space}</td>
                  <td style={{ padding: '6px 10px' }}>{row.solves}</td>
                  <td style={{ padding: '6px 10px' }}>{row.weighted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
