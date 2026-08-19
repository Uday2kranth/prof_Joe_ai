import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Play, Pause, RotateCcw, SkipForward, SkipBack,
  Info, ChevronDown, ChevronUp, CheckCircle2, CircleDot,
  Database, Sparkles
} from 'lucide-react';

export type AlgorithmPreset =
  // 1. Searching & Pattern Matching
  | 'linear_search'
  | 'binary_search'
  | 'brute_force_search'
  | 'kmp_string_match'
  // 2. Sorting & Divide and Conquer
  | 'bubble_sort'
  | 'insertion_sort'
  | 'merge_sort'
  | 'quick_sort'
  | 'heap_sort'
  | 'randomized_quicksort'
  // 3. Dynamic Programming
  | 'knapsack_dp'
  | 'lcs_dp'
  | 'matrix_chain_dp'
  // 4. Greedy Algorithms
  | 'huffman_coding'
  | 'fractional_knapsack'
  | 'graph_dijkstra'
  // 5. Backtracking
  | 'n_queens_backtracking'
  | 'subset_sum_backtracking'
  // 6. Hashing Algorithms
  | 'hashing_chaining'
  | 'hashing_probing'
  // 7. Graph Traversals
  | 'graph_bfs'
  | 'graph_dfs'
  | 'topological_sort';

export interface StepLogEntry {
  step: number;
  title: string;
  explanation: string;
  memoryState: {
    type: string;
    items: string[];
    pointers?: Record<string, string>;
  };
  pseudoCode: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  conflictNodeIds?: string[];
  successNodeIds?: string[];
}

export interface PresetAlgorithmDefinition {
  title: string;
  category: string;
  timeComp: string;
  spaceComp: string;
  availableDs: { id: string; label: string; description: string }[];
  steps: StepLogEntry[];
  buildGraph: (dsType: string, stepIdx: number) => { nodes: Node[]; edges: Edge[] };
}

// ────────────────────────────────────────────────────────────────────────────
// ALGORITHM REGISTRY: ALL 23 PRESETS WITH NON-OVERLAPPING ACCURATE COORDINATES
// ────────────────────────────────────────────────────────────────────────────
export const ALGORITHM_REGISTRY: Record<AlgorithmPreset, PresetAlgorithmDefinition> = {
  // 1. GRAPH BFS
  graph_bfs: {
    title: 'Breadth-First Search (BFS)',
    category: 'Graph Traversals',
    timeComp: 'O(V + E)',
    spaceComp: 'O(V)',
    availableDs: [
      { id: 'spanning_tree', label: 'Level Spanning Tree', description: 'Hierarchical BFS Level-Order tree from Source' },
      { id: 'adj_list', label: 'Adjacency List', description: 'Linked lists of outgoing neighbors per vertex' },
      { id: 'adj_matrix', label: 'Adjacency Matrix', description: 'V × V binary connectivity matrix' }
    ],
    steps: [
      {
        step: 0,
        title: 'Level 0: Initialize FIFO Queue at Source A',
        explanation: 'Push root A into Queue. Mark A visited (Level 0).',
        memoryState: { type: 'Queue (FIFO)', items: ['[ A ]'], pointers: { visited: '{A}', level: '0' } },
        pseudoCode: 'queue.push(A);\nvisited.add(A); // Level 0 Root',
        activeNodeIds: ['node_A', 'tree_A', 'adj_head_A', 'mat_row_a'],
        activeEdgeIds: []
      },
      {
        step: 1,
        title: 'Level 1: Dequeue A -> Enqueue Neighbors [B, C]',
        explanation: 'Pop A. Inspect neighbors B (w:4) and C (w:2). Enqueue B and C as Level 1 tree children.',
        memoryState: { type: 'Queue (FIFO)', items: ['[ B ]', '[ C ]'], pointers: { visited: '{A, B, C}', popped: 'A' } },
        pseudoCode: 'for neighbor in adj[A]:\n  if neighbor not in visited:\n    visited.add(neighbor); queue.push(neighbor);',
        activeNodeIds: ['node_B', 'node_C', 'tree_B', 'tree_C', 'adj_head_B', 'adj_head_C', 'mat_row_b', 'mat_row_c'],
        activeEdgeIds: ['e_ab', 'e_ac', 'e_tree_ab', 'e_tree_ac', 'e_adj_a1', 'e_adj_a2']
      },
      {
        step: 2,
        title: 'Level 2: Dequeue B -> Discover Neighbor [D]',
        explanation: 'Pop B from queue. Neighbor C is already visited. Discover unvisited neighbor D. Enqueue D at Level 2.',
        memoryState: { type: 'Queue (FIFO)', items: ['[ C ]', '[ D ]'], pointers: { visited: '{A, B, C, D}', popped: 'B' } },
        pseudoCode: 'curr = queue.pop(); // B\nqueue.push(D); // Level 2 child under B',
        activeNodeIds: ['node_D', 'tree_D', 'adj_head_D', 'mat_row_d'],
        activeEdgeIds: ['e_bd', 'e_tree_bd', 'e_adj_b1']
      },
      {
        step: 3,
        title: 'Level 2: Dequeue C -> Discover Neighbor [E]',
        explanation: 'Pop C from queue. Discover unvisited neighbor E. Enqueue E at Level 2 under C.',
        memoryState: { type: 'Queue (FIFO)', items: ['[ D ]', '[ E ]'], pointers: { visited: '{A, B, C, D, E}', popped: 'C' } },
        pseudoCode: 'curr = queue.pop(); // C\nqueue.push(E); // Level 2 child under C',
        activeNodeIds: ['node_E', 'tree_E', 'adj_head_E', 'mat_row_e'],
        activeEdgeIds: ['e_ce', 'e_tree_ce', 'e_adj_c1']
      },
      {
        step: 4,
        title: 'Level 3: Dequeue E -> Reach Target Goal F!',
        explanation: 'Pop E from queue. Follow edge to unvisited Goal node F. Shortest path discovered: A -> C -> E -> F.',
        memoryState: { type: 'Queue (FIFO)', items: ['[ F (Goal) ]'], pointers: { visited: '{A,B,C,D,E,F}', status: 'GOAL_REACHED' } },
        pseudoCode: 'if (curr == GOAL) return reconstruct_path(); // A -> C -> E -> F',
        activeNodeIds: ['node_F', 'tree_F', 'adj_head_F', 'mat_row_f'],
        activeEdgeIds: ['e_ef', 'e_tree_ef', 'e_adj_e1'],
        successNodeIds: ['node_F', 'tree_F', 'adj_head_F', 'mat_row_f']
      }
    ],
    buildGraph: (dsType) => {
      if (dsType === 'adj_list') {
        const nodes: Node[] = [
          { id: 'adj_head_A', position: { x: 50, y: 50 }, data: { label: 'Vertex [ A ]' }, style: { background: '#0284c7', color: '#fff', border: '2px solid #38bdf8', borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', width: 110 } },
          { id: 'adj_n_A1', position: { x: 190, y: 50 }, data: { label: '-> B (w:4)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 12px', width: 95 } },
          { id: 'adj_n_A2', position: { x: 315, y: 50 }, data: { label: '-> C (w:2)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 12px', width: 95 } },
          { id: 'adj_head_B', position: { x: 50, y: 120 }, data: { label: 'Vertex [ B ]' }, style: { background: '#1e293b', color: '#f8fafc', border: '2px solid #64748b', borderRadius: '8px', padding: '8px 14px', width: 110 } },
          { id: 'adj_n_B1', position: { x: 190, y: 120 }, data: { label: '-> D (w:5)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 12px', width: 95 } },
          { id: 'adj_head_C', position: { x: 50, y: 190 }, data: { label: 'Vertex [ C ]' }, style: { background: '#1e293b', color: '#f8fafc', border: '2px solid #64748b', borderRadius: '8px', padding: '8px 14px', width: 110 } },
          { id: 'adj_n_C1', position: { x: 190, y: 190 }, data: { label: '-> E (w:1)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 12px', width: 95 } },
          { id: 'adj_head_D', position: { x: 50, y: 260 }, data: { label: 'Vertex [ D ]' }, style: { background: '#1e293b', color: '#f8fafc', border: '2px solid #64748b', borderRadius: '8px', padding: '8px 14px', width: 110 } },
          { id: 'adj_n_D1', position: { x: 190, y: 260 }, data: { label: '-> F (w:3)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 12px', width: 95 } },
          { id: 'adj_head_E', position: { x: 50, y: 330 }, data: { label: 'Vertex [ E ]' }, style: { background: '#1e293b', color: '#f8fafc', border: '2px solid #64748b', borderRadius: '8px', padding: '8px 14px', width: 110 } },
          { id: 'adj_n_E1', position: { x: 190, y: 330 }, data: { label: '-> F (w:6)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 12px', width: 95 } },
          { id: 'adj_head_F', position: { x: 50, y: 400 }, data: { label: 'Vertex [ F (Goal) ]' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', width: 150 } }
        ];
        const edges: Edge[] = [
          { id: 'e_adj_a1', source: 'adj_head_A', target: 'adj_n_A1', style: { stroke: '#38bdf8', strokeWidth: 2 } },
          { id: 'e_adj_a2', source: 'adj_n_A1', target: 'adj_n_A2', style: { stroke: '#38bdf8', strokeWidth: 2 } },
          { id: 'e_adj_b1', source: 'adj_head_B', target: 'adj_n_B1', style: { stroke: '#64748b', strokeWidth: 2 } },
          { id: 'e_adj_c1', source: 'adj_head_C', target: 'adj_n_C1', style: { stroke: '#64748b', strokeWidth: 2 } },
          { id: 'e_adj_d1', source: 'adj_head_D', target: 'adj_n_D1', style: { stroke: '#64748b', strokeWidth: 2 } },
          { id: 'e_adj_e1', source: 'adj_head_E', target: 'adj_n_E1', style: { stroke: '#64748b', strokeWidth: 2 } }
        ];
        return { nodes, edges };
      }

      if (dsType === 'adj_matrix') {
        const nodes: Node[] = [
          { id: 'mat_row_a', position: { x: 60, y: 50 }, data: { label: 'Row A: [ A:0, B:1, C:1, D:0, E:0, F:0 ]' }, style: { background: '#0284c7', color: '#fff', border: '2px solid #38bdf8', borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', width: 400 } },
          { id: 'mat_row_b', position: { x: 60, y: 110 }, data: { label: 'Row B: [ A:1, B:0, C:1, D:1, E:0, F:0 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 14px', width: 400 } },
          { id: 'mat_row_c', position: { x: 60, y: 170 }, data: { label: 'Row C: [ A:1, B:1, C:0, D:0, E:1, F:0 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 14px', width: 400 } },
          { id: 'mat_row_d', position: { x: 60, y: 230 }, data: { label: 'Row D: [ A:0, B:1, C:0, D:0, E:1, F:1 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 14px', width: 400 } },
          { id: 'mat_row_e', position: { x: 60, y: 290 }, data: { label: 'Row E: [ A:0, B:0, C:1, D:1, E:0, F:1 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 14px', width: 400 } },
          { id: 'mat_row_f', position: { x: 60, y: 350 }, data: { label: 'Row F: [ A:0, B:0, C:0, D:1, E:1, F:0 ] (Goal)' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', width: 400 } }
        ];
        return { nodes, edges: [] };
      }

      // Default: Spanning Tree
      const nodes: Node[] = [
        // Left Cyclic Graph
        { id: 'node_A', position: { x: 50, y: 160 }, data: { label: 'A\n(Start)' }, style: { background: '#0284c7', color: '#fff', border: '3px solid #38bdf8', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center' } },
        { id: 'node_B', position: { x: 140, y: 80 }, data: { label: 'B (w:4)' }, style: { background: '#1e293b', color: '#f8fafc', border: '2px solid #64748b', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' } },
        { id: 'node_C', position: { x: 140, y: 240 }, data: { label: 'C (w:2)' }, style: { background: '#1e293b', color: '#f8fafc', border: '2px solid #64748b', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' } },
        { id: 'node_D', position: { x: 240, y: 80 }, data: { label: 'D (w:5)' }, style: { background: '#1e293b', color: '#f8fafc', border: '2px solid #64748b', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' } },
        { id: 'node_E', position: { x: 240, y: 240 }, data: { label: 'E (w:1)' }, style: { background: '#1e293b', color: '#f8fafc', border: '2px solid #64748b', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' } },
        { id: 'node_F', position: { x: 310, y: 160 }, data: { label: 'F\n(Goal)' }, style: { background: '#1e293b', color: '#fbbf24', border: '2px solid #f59e0b', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center' } },

        // Right Spanning Tree
        { id: 'tree_A', position: { x: 480, y: 50 }, data: { label: 'Level 0: [ A ]' }, style: { background: '#0284c7', color: '#fff', border: '2px solid #38bdf8', borderRadius: '8px', padding: '6px 12px', fontWeight: 'bold', fontSize: '0.72rem', width: 120 } },
        { id: 'tree_B', position: { x: 370, y: 140 }, data: { label: 'L1: [ B ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '2px solid #64748b', borderRadius: '8px', padding: '6px 12px', fontSize: '0.72rem', width: 95 } },
        { id: 'tree_C', position: { x: 580, y: 140 }, data: { label: 'L1: [ C ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '2px solid #64748b', borderRadius: '8px', padding: '6px 12px', fontSize: '0.72rem', width: 95 } },
        { id: 'tree_D', position: { x: 370, y: 240 }, data: { label: 'L2: [ D ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '2px solid #64748b', borderRadius: '8px', padding: '6px 12px', fontSize: '0.72rem', width: 95 } },
        { id: 'tree_E', position: { x: 580, y: 240 }, data: { label: 'L2: [ E ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '2px solid #64748b', borderRadius: '8px', padding: '6px 12px', fontSize: '0.72rem', width: 95 } },
        { id: 'tree_F', position: { x: 480, y: 340 }, data: { label: 'L3: [ F (Goal) ]' }, style: { background: '#1e293b', color: '#fbbf24', border: '2px solid #f59e0b', borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', fontSize: '0.75rem', width: 140 } }
      ];
      const edges: Edge[] = [
        { id: 'e_ab', source: 'node_A', target: 'node_B', label: '4', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_ac', source: 'node_A', target: 'node_C', label: '2', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_bd', source: 'node_B', target: 'node_D', label: '5', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_bc', source: 'node_B', target: 'node_C', label: '1', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_ce', source: 'node_C', target: 'node_E', label: '1', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_de', source: 'node_D', target: 'node_E', label: '8', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_df', source: 'node_D', target: 'node_F', label: '3', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_ef', source: 'node_E', target: 'node_F', label: '6', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_tree_ab', source: 'tree_A', target: 'tree_B', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_tree_ac', source: 'tree_A', target: 'tree_C', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_tree_bd', source: 'tree_B', target: 'tree_D', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_tree_ce', source: 'tree_C', target: 'tree_E', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_tree_ef', source: 'tree_E', target: 'tree_F', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } }
      ];
      return { nodes, edges };
    }
  },

  // 2. GRAPH DFS
  graph_dfs: {
    title: 'Depth-First Search (DFS)',
    category: 'Graph Traversals',
    timeComp: 'O(V + E)',
    spaceComp: 'O(V)',
    availableDs: [
      { id: 'call_stack_tree', label: 'DFS Call Stack Tree', description: 'Tree with Discovery/Finish [d/f] timestamps' }
    ],
    steps: [
      {
        step: 0,
        title: 'Discover Root A: Timestamp [d:1]',
        explanation: 'Push A onto DFS recursion stack. Discovery time d[A] = 1. Explore first unvisited neighbor B.',
        memoryState: { type: 'Call Stack (LIFO)', items: ['dfs(A) [d:1]'], pointers: { top: 'A', time: '1' } },
        pseudoCode: 'time += 1; d[u] = time; color[u] = GRAY;\nfor v in adj[u]: dfs(v);',
        activeNodeIds: ['dfs_A'],
        activeEdgeIds: []
      },
      {
        step: 1,
        title: 'Recurse Deeply into B: Timestamp [d:2]',
        explanation: 'Push B onto stack. d[B] = 2. Inspect outgoing edge B -> D.',
        memoryState: { type: 'Call Stack (LIFO)', items: ['dfs(A)', 'dfs(B) [d:2]'], pointers: { top: 'B', time: '2' } },
        pseudoCode: 'dfs(B); // d[B] = 2',
        activeNodeIds: ['dfs_B'],
        activeEdgeIds: ['e_dfs_ab']
      },
      {
        step: 2,
        title: 'Recurse into D: Timestamp [d:3] & Finish D [f:4]',
        explanation: 'd[D] = 3. D has no unvisited neighbors. Backtrack: finish D at f[D] = 4, pop D from stack.',
        memoryState: { type: 'Call Stack (LIFO)', items: ['dfs(A)', 'dfs(B)', 'FINISHED: D [3/4]'], pointers: { popped: 'D', time: '4' } },
        pseudoCode: 'time += 1; f[D] = time; color[D] = BLACK; // Pop D',
        activeNodeIds: ['dfs_D'],
        activeEdgeIds: ['e_dfs_bd']
      },
      {
        step: 3,
        title: 'Finish B [f:5] & Explore C from A: Timestamp [d:6]',
        explanation: 'B finishes at f[B] = 5. Backtrack to A. A visits next unvisited neighbor C at d[C] = 6.',
        memoryState: { type: 'Call Stack (LIFO)', items: ['dfs(A)', 'dfs(C) [d:6]'], pointers: { top: 'C', time: '6' } },
        pseudoCode: 'dfs(C); // d[C] = 6',
        activeNodeIds: ['dfs_C'],
        activeEdgeIds: ['e_dfs_ac']
      },
      {
        step: 4,
        title: 'Explore E -> F (Goal) & Complete Full DFS Forest',
        explanation: 'Recurse C -> E [d:7] -> F [d:8]. Goal reached! Backtrack and record all finish timestamps.',
        memoryState: { type: 'Call Stack (LIFO)', items: ['All Vertices Processed', 'Forest Complete'], pointers: { status: 'DFS_DONE' } },
        pseudoCode: 'return dfs_timestamps; // Complete DFS Tree',
        activeNodeIds: ['dfs_E', 'dfs_F'],
        activeEdgeIds: ['e_dfs_ce', 'e_dfs_ef'],
        successNodeIds: ['dfs_F']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'dfs_A', position: { x: 260, y: 50 }, data: { label: 'A\n[ 1 / 12 ]' }, style: { background: '#0284c7', color: '#fff', border: '2px solid #38bdf8', borderRadius: '50%', width: 58, height: 58, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center' } },
        { id: 'dfs_B', position: { x: 140, y: 140 }, data: { label: 'B\n[ 2 / 5 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '2px solid #64748b', borderRadius: '50%', width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', textAlign: 'center' } },
        { id: 'dfs_C', position: { x: 380, y: 140 }, data: { label: 'C\n[ 6 / 11 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '2px solid #64748b', borderRadius: '50%', width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', textAlign: 'center' } },
        { id: 'dfs_D', position: { x: 140, y: 240 }, data: { label: 'D (Leaf)\n[ 3 / 4 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '2px solid #64748b', borderRadius: '8px', padding: '6px 10px', fontSize: '0.72rem' } },
        { id: 'dfs_E', position: { x: 380, y: 240 }, data: { label: 'E\n[ 7 / 10 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '2px solid #64748b', borderRadius: '50%', width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', textAlign: 'center' } },
        { id: 'dfs_F', position: { x: 380, y: 330 }, data: { label: 'F (Goal)\n[ 8 / 9 ]' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', fontSize: '0.75rem' } }
      ];
      const edges: Edge[] = [
        { id: 'e_dfs_ab', source: 'dfs_A', target: 'dfs_B', label: 'Tree Edge', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_dfs_ac', source: 'dfs_A', target: 'dfs_C', label: 'Tree Edge', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_dfs_bd', source: 'dfs_B', target: 'dfs_D', label: 'Tree Edge', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_dfs_ce', source: 'dfs_C', target: 'dfs_E', label: 'Tree Edge', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_dfs_ef', source: 'dfs_E', target: 'dfs_F', label: 'Tree Edge', style: { stroke: '#34d399', strokeWidth: 2 } }
      ];
      return { nodes, edges };
    }
  },

  // 3. DIJKSTRA SHORTEST PATH
  graph_dijkstra: {
    title: "Dijkstra's Shortest Path Algorithm",
    category: 'Greedy Algorithms',
    timeComp: 'O((V + E) log V)',
    spaceComp: 'O(V)',
    availableDs: [
      { id: 'pq_distance_table', label: 'Min-Heap PQ & Distance Table', description: 'Priority Queue extractions with relaxation updates' }
    ],
    steps: [
      {
        step: 0,
        title: 'Initialize Distances: dist[A] = 0, all others = ∞',
        explanation: 'Insert (dist:0, vertex:A) into Min-Heap. Distances: [A:0, B:∞, C:∞, D:∞, E:∞, F:∞].',
        memoryState: { type: 'Min-Heap PQ', items: ['(0, A)'], pointers: { dist_A: '0', others: 'INF' } },
        pseudoCode: 'dist = {v: INF for v in V}; dist[src] = 0;\npq.push((0, src));',
        activeNodeIds: ['dijk_A', 'tbl_A'],
        activeEdgeIds: []
      },
      {
        step: 1,
        title: 'Extract Min A (0) -> Relax Neighbors B and C',
        explanation: 'Relax (A->B, w:4): dist[B] = 0+4 = 4. Relax (A->C, w:2): dist[C] = 0+2 = 2. Push (2, C) and (4, B) to PQ.',
        memoryState: { type: 'Min-Heap PQ', items: ['(2, C)', '(4, B)'], pointers: { dist_C: '2', dist_B: '4' } },
        pseudoCode: 'if dist[u] + w < dist[v]:\n  dist[v] = dist[u] + w; pq.push((dist[v], v));',
        activeNodeIds: ['dijk_C', 'tbl_C', 'tbl_B'],
        activeEdgeIds: ['e_dijk_ac', 'e_dijk_ab']
      },
      {
        step: 2,
        title: 'Extract Min C (2) -> Relax E: dist[E] = 2 + 1 = 3',
        explanation: 'Pop C (dist 2). Inspect edge C->E (w:1). New dist[E] = 2 + 1 = 3 < ∞. Push (3, E) to PQ.',
        memoryState: { type: 'Min-Heap PQ', items: ['(3, E)', '(4, B)'], pointers: { dist_E: '3' } },
        pseudoCode: 'dist[E] = min(INF, 2 + 1) = 3;\npq.push((3, E));',
        activeNodeIds: ['dijk_E', 'tbl_E'],
        activeEdgeIds: ['e_dijk_ce']
      },
      {
        step: 3,
        title: 'Extract Min E (3) -> Relax F (Goal): dist[F] = 3 + 6 = 9',
        explanation: 'Pop E (dist 3). Path A -> C -> E provides shortest reaching distance to E. Relax E->F (w:6) to 9.',
        memoryState: { type: 'Min-Heap PQ', items: ['(4, B)', '(9, F)'], pointers: { dist_F: '9' } },
        pseudoCode: 'dist[F] = 3 + 6 = 9;\npq.push((9, F));',
        activeNodeIds: ['dijk_F', 'tbl_F'],
        activeEdgeIds: ['e_dijk_ef']
      },
      {
        step: 4,
        title: 'Final Shortest Path to Goal F: A -> C -> E -> F (Distance = 9)',
        explanation: 'Shortest path found! Total weighted distance = 9.',
        memoryState: { type: 'Shortest Distances', items: ['A: 0', 'B: 4', 'C: 2', 'D: 9', 'E: 3', 'F: 9 (Optimal)'], pointers: { status: 'OPTIMAL' } },
        pseudoCode: 'return dist[GOAL]; // 9 (Shortest Path Distance)',
        activeNodeIds: ['dijk_F', 'tbl_F'],
        activeEdgeIds: ['e_dijk_ac', 'e_dijk_ce', 'e_dijk_ef'],
        successNodeIds: ['dijk_F']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'dijk_A', position: { x: 50, y: 160 }, data: { label: 'A (Src)\n[ 0 ]' }, style: { background: '#0284c7', color: '#fff', border: '3px solid #38bdf8', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.72rem', textAlign: 'center' } },
        { id: 'dijk_B', position: { x: 140, y: 80 }, data: { label: 'B\n[ 4 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '2px solid #64748b', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', textAlign: 'center' } },
        { id: 'dijk_C', position: { x: 140, y: 240 }, data: { label: 'C\n[ 2 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '2px solid #64748b', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', textAlign: 'center' } },
        { id: 'dijk_D', position: { x: 240, y: 80 }, data: { label: 'D\n[ 9 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '2px solid #64748b', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', textAlign: 'center' } },
        { id: 'dijk_E', position: { x: 240, y: 240 }, data: { label: 'E\n[ 3 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '2px solid #64748b', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', textAlign: 'center' } },
        { id: 'dijk_F', position: { x: 310, y: 160 }, data: { label: 'F (Goal)\n[ 9 ]' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.72rem', textAlign: 'center' } },
        { id: 'tbl_A', position: { x: 420, y: 50 }, data: { label: 'dist[A] = 0 (Fixed)' }, style: { background: '#0284c7', color: '#fff', border: '1px solid #38bdf8', borderRadius: '6px', padding: '6px 12px', width: 140 } },
        { id: 'tbl_B', position: { x: 420, y: 100 }, data: { label: 'dist[B] = 4 (via A)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '6px', padding: '6px 12px', width: 140 } },
        { id: 'tbl_C', position: { x: 420, y: 150 }, data: { label: 'dist[C] = 2 (via A)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '6px', padding: '6px 12px', width: 140 } },
        { id: 'tbl_D', position: { x: 420, y: 200 }, data: { label: 'dist[D] = 9 (via B)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '6px', padding: '6px 12px', width: 140 } },
        { id: 'tbl_E', position: { x: 420, y: 250 }, data: { label: 'dist[E] = 3 (via C)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '6px', padding: '6px 12px', width: 140 } },
        { id: 'tbl_F', position: { x: 420, y: 300 }, data: { label: 'dist[F] = 9 (via E)' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '6px', padding: '6px 12px', fontWeight: 'bold', width: 140 } }
      ];
      const edges: Edge[] = [
        { id: 'e_dijk_ab', source: 'dijk_A', target: 'dijk_B', label: '4', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_dijk_ac', source: 'dijk_A', target: 'dijk_C', label: '2', style: { stroke: '#38bdf8', strokeWidth: 2.5 } },
        { id: 'e_dijk_bd', source: 'dijk_B', target: 'dijk_D', label: '5', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_dijk_ce', source: 'dijk_C', target: 'dijk_E', label: '1', style: { stroke: '#38bdf8', strokeWidth: 2.5 } },
        { id: 'e_dijk_ef', source: 'dijk_E', target: 'dijk_F', label: '6', style: { stroke: '#34d399', strokeWidth: 3 } }
      ];
      return { nodes, edges };
    }
  },

  // 4. TOPOLOGICAL SORT
  topological_sort: {
    title: "Topological Sort (Kahn's Algorithm)",
    category: 'Graph Traversals',
    timeComp: 'O(V + E)',
    spaceComp: 'O(V)',
    availableDs: [
      { id: 'indegree_table', label: 'In-Degree Table & Zero Queue', description: "Kahn's in-degree array reduction" }
    ],
    steps: [
      {
        step: 0,
        title: 'Compute In-Degrees: Vertex A has In-Degree 0',
        explanation: 'Calculate incoming edge count for each vertex: A:0, B:1, C:1, D:2, E:1, F:2. Push A into Zero-InDegree Queue.',
        memoryState: { type: 'Zero-InDegree Queue', items: ['[ A ]'], pointers: { indeg_A: '0', indeg_others: '>0' } },
        pseudoCode: 'indegree = compute_indegrees(graph);\nqueue = [v for v in V if indegree[v] == 0];',
        activeNodeIds: ['dag_A'],
        activeEdgeIds: []
      },
      {
        step: 1,
        title: 'Pop A -> Append to Order -> Reduce B and C In-Degrees',
        explanation: 'Pop A. Output Order = [A]. Decrement in-degree of B (1->0) and C (1->0). Push B and C to Queue.',
        memoryState: { type: 'Topological Order', items: ['[ A ]'], pointers: { queue: '[B, C]' } },
        pseudoCode: 'order.append(A);\nfor v in adj[A]:\n  indegree[v] -= 1;\n  if indegree[v] == 0: queue.push(v);',
        activeNodeIds: ['dag_B', 'dag_C'],
        activeEdgeIds: ['e_dag_ab', 'e_dag_ac']
      },
      {
        step: 2,
        title: 'Pop B & C -> Reduce D and E In-Degrees to 0',
        explanation: 'Pop B then C. Output Order = [A, B, C]. Decrement in-degrees for D and E -> both hit 0. Push D, E.',
        memoryState: { type: 'Topological Order', items: ['[ A ]', '[ B ]', '[ C ]'], pointers: { queue: '[D, E]' } },
        pseudoCode: 'order.extend([B, C]);\nindegree[D] -= 1; indegree[E] -= 1;',
        activeNodeIds: ['dag_D', 'dag_E'],
        activeEdgeIds: ['e_dag_bd', 'e_dag_ce']
      },
      {
        step: 3,
        title: 'Pop D & E -> F Hits In-Degree 0 -> Complete Valid Ordering',
        explanation: 'Pop D and E. F receives final edge reductions -> in-degree hits 0. Pop F. Valid DAG Linear Ordering completed!',
        memoryState: { type: 'Final Linear Order', items: ['A -> B -> C -> D -> E -> F'], pointers: { status: 'VALID_DAG' } },
        pseudoCode: 'return order; // [A, B, C, D, E, F]',
        activeNodeIds: ['dag_F', 'topo_final'],
        activeEdgeIds: ['e_dag_df', 'e_dag_ef'],
        successNodeIds: ['topo_final']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'dag_A', position: { x: 40, y: 110 }, data: { label: 'A\n(Indeg: 0)' }, style: { background: '#0284c7', color: '#fff', border: '2px solid #38bdf8', borderRadius: '8px', padding: '8px 12px', fontWeight: 'bold' } },
        { id: 'dag_B', position: { x: 190, y: 40 }, data: { label: 'B\n(Indeg: 1->0)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 12px' } },
        { id: 'dag_C', position: { x: 190, y: 180 }, data: { label: 'C\n(Indeg: 1->0)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 12px' } },
        { id: 'dag_D', position: { x: 350, y: 40 }, data: { label: 'D\n(Indeg: 2->0)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 12px' } },
        { id: 'dag_E', position: { x: 350, y: 180 }, data: { label: 'E\n(Indeg: 1->0)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 12px' } },
        { id: 'dag_F', position: { x: 500, y: 110 }, data: { label: 'F\n(Indeg: 2->0)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 12px' } },
        { id: 'topo_final', position: { x: 40, y: 280 }, data: { label: '🏆 LINEAR TOPOLOGICAL SORT ORDER:\n[ A ] ➔ [ B ] ➔ [ C ] ➔ [ D ] ➔ [ E ] ➔ [ F ]' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '10px', padding: '10px 18px', fontWeight: 'bold', width: 520, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_dag_ab', source: 'dag_A', target: 'dag_B', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_dag_ac', source: 'dag_A', target: 'dag_C', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_dag_bd', source: 'dag_B', target: 'dag_D', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_dag_ce', source: 'dag_C', target: 'dag_E', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_dag_df', source: 'dag_D', target: 'dag_F', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_dag_ef', source: 'dag_E', target: 'dag_F', style: { stroke: '#64748b', strokeWidth: 2 } }
      ];
      return { nodes, edges };
    }
  },

  // 5. BINARY SEARCH
  binary_search: {
    title: 'Binary Search (Pointer Halving)',
    category: 'Searching & Pattern Matching',
    timeComp: 'O(log N)',
    spaceComp: 'O(1)',
    availableDs: [
      { id: 'sorted_arr', label: 'Sorted Array Partition', description: '1D Array with Low, Mid, High pointer tracking' }
    ],
    steps: [
      {
        step: 0,
        title: 'Initialize Pointers: Low=0, High=6, Target=42',
        explanation: 'Search space spans full sorted array [0..6]. Calculate Mid = (0 + 6) / 2 = 3 (Arr[3] = 33). Target = 42.',
        memoryState: { type: 'Pointers', items: ['Low = 0 (5)', 'Mid = 3 (33)', 'High = 6 (89)'], pointers: { target: '42' } },
        pseudoCode: 'low = 0; high = len(arr) - 1;\nmid = (low + high) // 2; // 3',
        activeNodeIds: ['arr_3', 'ptr_low', 'ptr_mid', 'ptr_high', 'bs_target'],
        activeEdgeIds: ['e_ptr_m', 'e_target_comp']
      },
      {
        step: 1,
        title: 'Compare: 42 > Arr[3] (33) -> Discard Left Half [0..3]',
        explanation: 'Since target 42 > 33, target must reside in right sub-array. Set Low = mid + 1 = 4. Mid becomes 5 (65).',
        memoryState: { type: 'Pointers', items: ['Low = 4 (42)', 'Mid = 5 (65)', 'High = 6 (89)'], pointers: { direction: 'RIGHT' } },
        pseudoCode: 'if (arr[mid] < target):\n  low = mid + 1; // 4\n  mid = (4 + 6) // 2; // 5',
        activeNodeIds: ['arr_4', 'arr_5', 'arr_6', 'ptr_low', 'ptr_mid', 'ptr_high'],
        activeEdgeIds: ['e_ptr_l', 'e_ptr_m', 'e_ptr_h']
      },
      {
        step: 2,
        title: 'Compare: 42 < Arr[5] (65) -> Discard Right Half -> Low=4, High=4',
        explanation: 'Inspect Arr[5] = 65. Since 42 < 65, discard right half and set High = mid - 1 = 4. Mid becomes 4.',
        memoryState: { type: 'Pointers', items: ['Low = 4', 'Mid = 4 (42)', 'High = 4'], pointers: { direction: 'LEFT' } },
        pseudoCode: 'else if (arr[mid] > target):\n  high = mid - 1; // 4\n  mid = 4;',
        activeNodeIds: ['arr_4', 'ptr_mid', 'bs_target'],
        activeEdgeIds: ['e_ptr_m', 'e_target_comp']
      },
      {
        step: 3,
        title: 'Match Found at Index 4 (Arr[4] == 42)!',
        explanation: 'Low=4, High=4 -> Mid=4. Arr[4] equals Target 42! Search completed in O(log N) = 3 comparisons.',
        memoryState: { type: 'Search Result', items: ['Target 42 found at Index 4', 'Comparisons: 3'], pointers: { status: 'SUCCESS' } },
        pseudoCode: 'if (arr[mid] == target) return mid; // 4 (Found!)',
        activeNodeIds: ['arr_4', 'bs_target'],
        activeEdgeIds: ['e_target_comp'],
        successNodeIds: ['arr_4', 'bs_target']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'arr_0', position: { x: 30, y: 70 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Idx: 0\n[ 5 ]' }, style: { background: '#1e293b', color: '#64748b', border: '1px solid #475569', borderRadius: '8px', padding: '8px', width: 60, textAlign: 'center' } },
        { id: 'arr_1', position: { x: 100, y: 70 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Idx: 1\n[ 12 ]' }, style: { background: '#1e293b', color: '#64748b', border: '1px solid #475569', borderRadius: '8px', padding: '8px', width: 60, textAlign: 'center' } },
        { id: 'arr_2', position: { x: 170, y: 70 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Idx: 2\n[ 25 ]' }, style: { background: '#1e293b', color: '#64748b', border: '1px solid #475569', borderRadius: '8px', padding: '8px', width: 60, textAlign: 'center' } },
        { id: 'arr_3', position: { x: 240, y: 70 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Idx: 3\n[ 33 ]' }, style: { background: '#1e293b', color: '#64748b', border: '1px solid #475569', borderRadius: '8px', padding: '8px', width: 60, textAlign: 'center' } },
        { id: 'arr_4', position: { x: 310, y: 70 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Idx: 4 (★)\n[ 42 ]' }, style: { background: '#0284c7', color: '#fff', border: '2px solid #38bdf8', borderRadius: '8px', padding: '8px', width: 85, textAlign: 'center', fontWeight: 'bold' } },
        { id: 'arr_5', position: { x: 405, y: 70 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Idx: 5\n[ 65 ]' }, style: { background: '#1e293b', color: '#64748b', border: '1px solid #475569', borderRadius: '8px', padding: '8px', width: 60, textAlign: 'center' } },
        { id: 'arr_6', position: { x: 475, y: 70 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Idx: 6\n[ 89 ]' }, style: { background: '#1e293b', color: '#64748b', border: '1px solid #475569', borderRadius: '8px', padding: '8px', width: 60, textAlign: 'center' } },

        // Pointer Nodes
        { id: 'ptr_low', position: { x: 30, y: 170 }, sourcePosition: Position.Top, targetPosition: Position.Bottom, data: { label: '▲ LOW Pointer' }, style: { background: '#059669', color: '#fff', borderRadius: '6px', padding: '6px 10px', fontSize: '0.7rem', fontWeight: 'bold' } },
        { id: 'ptr_mid', position: { x: 240, y: 170 }, sourcePosition: Position.Top, targetPosition: Position.Bottom, data: { label: '▲ MID Pointer' }, style: { background: '#d97706', color: '#fff', borderRadius: '6px', padding: '6px 10px', fontSize: '0.7rem', fontWeight: 'bold' } },
        { id: 'ptr_high', position: { x: 475, y: 170 }, sourcePosition: Position.Top, targetPosition: Position.Bottom, data: { label: '▲ HIGH Pointer' }, style: { background: '#dc2626', color: '#fff', borderRadius: '6px', padding: '6px 10px', fontSize: '0.7rem', fontWeight: 'bold' } },

        // Target Banner Node
        { id: 'bs_target', position: { x: 120, y: 260 }, sourcePosition: Position.Top, targetPosition: Position.Bottom, data: { label: '🎯 TARGET KEY = 42\nDivide & Conquer Pointer Halving in O(log N)' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', width: 340, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_ptr_l', source: 'ptr_low', target: 'arr_0', label: 'Low', style: { stroke: '#10b981', strokeWidth: 2 } },
        { id: 'e_ptr_m', source: 'ptr_mid', target: 'arr_3', label: 'Mid (Pivot)', style: { stroke: '#f59e0b', strokeWidth: 2.5 } },
        { id: 'e_ptr_h', source: 'ptr_high', target: 'arr_6', label: 'High', style: { stroke: '#ef4444', strokeWidth: 2 } },
        { id: 'e_target_comp', source: 'bs_target', target: 'arr_4', type: 'smoothstep', label: 'Match Target 42', style: { stroke: '#34d399', strokeWidth: 2.5 } }
      ];
      return { nodes, edges };
    }
  },

  // 6. LINEAR SEARCH
  linear_search: {
    title: 'Linear Search (Sequential Scan)',
    category: 'Searching & Pattern Matching',
    timeComp: 'O(N)',
    spaceComp: 'O(1)',
    availableDs: [
      { id: 'linear_arr', label: '1D Array Scan', description: 'Sequential left-to-right element comparison' }
    ],
    steps: [
      {
        step: 0,
        title: 'Check Index 0: Arr[0] = 28 != 42 (Mismatch)',
        explanation: 'Pointer i=0. Compare 28 with target 42 -> No match. Advance i to next index.',
        memoryState: { type: 'Pointer', items: ['i = 0', 'Val = 28', 'Target = 42'], pointers: { status: 'MISMATCH' } },
        pseudoCode: 'if arr[i] == target: return i;\ni += 1;',
        activeNodeIds: ['l_0', 'l_query'],
        activeEdgeIds: ['e_l_01']
      },
      {
        step: 1,
        title: 'Check Index 1: Arr[1] = 14 != 42 (Mismatch)',
        explanation: 'Pointer i=1. Compare 14 with target 42 -> No match. Advance i.',
        memoryState: { type: 'Pointer', items: ['i = 1', 'Val = 14'], pointers: { status: 'MISMATCH' } },
        pseudoCode: 'i += 1; // 2',
        activeNodeIds: ['l_1', 'l_query'],
        activeEdgeIds: ['e_l_12']
      },
      {
        step: 2,
        title: 'Check Index 2: Arr[2] = 42 == 42 (Match Found!)',
        explanation: 'Pointer i=2. Value 42 matches target 42! Return index 2 immediately.',
        memoryState: { type: 'Result', items: ['Target 42 found at Index 2', 'Comparisons: 3'], pointers: { status: 'MATCH' } },
        pseudoCode: 'return i; // 2 (Success)',
        activeNodeIds: ['l_2', 'l_query'],
        activeEdgeIds: ['e_l_match'],
        successNodeIds: ['l_2', 'l_query']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'l_0', position: { x: 40, y: 70 }, sourcePosition: Position.Right, targetPosition: Position.Left, data: { label: 'Idx: 0\n[ 28 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '2px solid #64748b', borderRadius: '8px', padding: '8px', width: 65, textAlign: 'center' } },
        { id: 'l_1', position: { x: 135, y: 70 }, sourcePosition: Position.Right, targetPosition: Position.Left, data: { label: 'Idx: 1\n[ 14 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '2px solid #64748b', borderRadius: '8px', padding: '8px', width: 65, textAlign: 'center' } },
        { id: 'l_2', position: { x: 230, y: 70 }, sourcePosition: Position.Right, targetPosition: Position.Left, data: { label: 'Idx: 2\n[ 42 (★) ]' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '8px', width: 85, textAlign: 'center', fontWeight: 'bold' } },
        { id: 'l_3', position: { x: 345, y: 70 }, sourcePosition: Position.Right, targetPosition: Position.Left, data: { label: 'Idx: 3\n[ 7 ]' }, style: { background: '#1e293b', color: '#64748b', border: '1px solid #475569', borderRadius: '8px', padding: '8px', width: 65, textAlign: 'center' } },
        { id: 'l_4', position: { x: 440, y: 70 }, sourcePosition: Position.Right, targetPosition: Position.Left, data: { label: 'Idx: 4\n[ 91 ]' }, style: { background: '#1e293b', color: '#64748b', border: '1px solid #475569', borderRadius: '8px', padding: '8px', width: 65, textAlign: 'center' } },

        // Search Query Banner
        { id: 'l_query', position: { x: 110, y: 190 }, sourcePosition: Position.Top, targetPosition: Position.Bottom, data: { label: '🔍 SEARCH TARGET = 42\nSequential Linear Comparison O(N)' }, style: { background: '#0284c7', color: '#fff', border: '2px solid #38bdf8', borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', width: 320, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_l_01', source: 'l_0', target: 'l_1', label: 'Next i', style: { stroke: '#38bdf8', strokeWidth: 1.8 } },
        { id: 'e_l_12', source: 'l_1', target: 'l_2', label: 'Next i', style: { stroke: '#38bdf8', strokeWidth: 1.8 } },
        { id: 'e_l_23', source: 'l_2', target: 'l_3', label: 'Next i', style: { stroke: '#64748b', strokeWidth: 1.8 } },
        { id: 'e_l_34', source: 'l_3', target: 'l_4', label: 'Next i', style: { stroke: '#64748b', strokeWidth: 1.8 } },
        { id: 'e_l_match', source: 'l_query', target: 'l_2', type: 'smoothstep', label: 'Target Match at Arr[2] == 42', style: { stroke: '#34d399', strokeWidth: 2.5 } }
      ];
      return { nodes, edges };
    }
  },

  // 7. BRUTE FORCE STRING MATCH
  brute_force_search: {
    title: 'Brute Force String Matching',
    category: 'Searching & Pattern Matching',
    timeComp: 'O(N × M)',
    spaceComp: 'O(1)',
    availableDs: [
      { id: 'sliding_window', label: 'Sliding Window Alignment', description: 'Text vs Pattern character comparison matrix' }
    ],
    steps: [
      {
        step: 0,
        title: 'Align Pattern at Shift s=0: Text[0..3] vs "AABA"',
        explanation: 'Compare T[0..3] ("AABA") with Pattern P ("AABA"). All 4 characters match!',
        memoryState: { type: 'Alignment Window', items: ['s = 0', 'Text: AABA', 'Pattern: AABA'], pointers: { match: 'EXACT' } },
        pseudoCode: 'for s in 0..N-M:\n  if Text[s..s+M-1] == Pattern: match(s)',
        activeNodeIds: ['bf_text', 'bf_pat', 'bf_win0'],
        activeEdgeIds: ['e_bf_align0', 'e_bf_text0'],
        successNodeIds: ['bf_win0']
      },
      {
        step: 1,
        title: 'Shift Window to s=1: Text[1..4] ("ABAA") vs "AABA"',
        explanation: 'Compare T[1]=\'A\' with P[0]=\'A\' (Match). T[2]=\'B\' with P[1]=\'A\' (Mismatch!). Break shift and advance s.',
        memoryState: { type: 'Alignment Window', items: ['s = 1', 'Mismatch at pos 1'], pointers: { status: 'BREAK' } },
        pseudoCode: 'if Text[s+j] != Pattern[j]: break; // s += 1',
        activeNodeIds: ['bf_win1'],
        activeEdgeIds: ['e_bf_step', 'e_bf_text1'],
        conflictNodeIds: ['bf_win1']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'bf_text', position: { x: 50, y: 40 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Text String T: [ A ][ A ][ B ][ A ][ A ][ B ][ A ][ C ] (N=8)' }, style: { background: '#0f172a', color: '#38bdf8', border: '2px solid #0284c7', borderRadius: '8px', padding: '8px 14px', fontFamily: 'monospace', width: 420 } },
        { id: 'bf_pat', position: { x: 50, y: 110 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Pattern P: [ A ][ A ][ B ][ A ] (Length M=4)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 14px', fontFamily: 'monospace', width: 420 } },
        { id: 'bf_win0', position: { x: 50, y: 190 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Shift s=0: T[0..3] vs P -> Matched 4/4 Characters! (★)' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', width: 420 } },
        { id: 'bf_win1', position: { x: 50, y: 270 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Shift s=1: T[1..4] ("ABAA") vs P -> Mismatch at pos 1 (\'B\' != \'A\')' }, style: { background: '#7f1d1d', color: '#fca5a5', border: '2px solid #ef4444', borderRadius: '8px', padding: '8px 14px', width: 420 } }
      ];
      const edges: Edge[] = [
        { id: 'e_bf_text0', source: 'bf_text', target: 'bf_win0', label: 'T[0..3]', style: { stroke: '#38bdf8', strokeWidth: 1.8 } },
        { id: 'e_bf_align0', source: 'bf_pat', target: 'bf_win0', label: 'Align s=0', style: { stroke: '#34d399', strokeWidth: 2 } },
        { id: 'e_bf_step', source: 'bf_win0', target: 'bf_win1', label: 'Shift +1', style: { stroke: '#64748b', strokeWidth: 1.8 } },
        { id: 'e_bf_text1', source: 'bf_text', target: 'bf_win1', label: 'T[1..4]', style: { stroke: '#ef4444', strokeWidth: 1.8 } }
      ];
      return { nodes, edges };
    }
  },

  // 8. KMP STRING MATCH
  kmp_string_match: {
    title: 'Knuth-Morris-Pratt (KMP) Matcher',
    category: 'Searching & Pattern Matching',
    timeComp: 'O(N + M)',
    spaceComp: 'O(M)',
    availableDs: [
      { id: 'lps_table', label: 'π-LPS Array & Non-Backtracking Skips', description: 'Longest Prefix Suffix fallback array' }
    ],
    steps: [
      {
        step: 0,
        title: 'Precompute π-LPS (Longest Prefix Suffix) Array for Pattern',
        explanation: 'For Pattern "ABABCABAB", compute LPS array [0, 0, 1, 2, 0, 1, 2, 3, 4] in O(M) time.',
        memoryState: { type: 'π-LPS Table', items: ['P: ABABCABAB', 'π: [0,0,1,2,0,1,2,3,4]'], pointers: { phase: 'PRECOMPUTE' } },
        pseudoCode: 'pi = compute_prefix_function(Pattern);',
        activeNodeIds: ['kmp_text', 'kmp_lps'],
        activeEdgeIds: ['e_kmp_lps_scan']
      },
      {
        step: 1,
        title: 'Linear Text Scan: Mismatch at j=4 -> Fallback j = π[3] = 2',
        explanation: 'Characters 0..3 match. On mismatch at index 4, DO NOT backtrack text pointer i. Simply jump j to π[3] = 2!',
        memoryState: { type: 'KMP Pointers', items: ['Text i = 4', 'Pattern j -> 2 (Skipped 2 chars)'], pointers: { backtrack: 'ZERO' } },
        pseudoCode: 'if (j != 0) j = pi[j - 1]; // Fast jump in O(1)',
        activeNodeIds: ['kmp_scan', 'kmp_jump'],
        activeEdgeIds: ['e_kmp_fallback'],
        successNodeIds: ['kmp_scan', 'kmp_jump']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'kmp_text', position: { x: 40, y: 40 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Text String T: " A B A B C A B A B A " (Pointer i = 4)' }, style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #475569', borderRadius: '8px', padding: '8px 14px', fontFamily: 'monospace', width: 420 } },
        { id: 'kmp_lps', position: { x: 40, y: 110 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Pattern:  A  B  A  B  C  A  B  A  B\nπ-LPS:   [0, 0, 1, 2, 0, 1, 2, 3, 4]' }, style: { background: '#0f172a', color: '#38bdf8', border: '2px solid #0284c7', borderRadius: '8px', padding: '8px 14px', fontFamily: 'monospace', width: 420 } },
        { id: 'kmp_scan', position: { x: 40, y: 195 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: '⚡ Linear Text Scan: Mismatch at j=4 (\'C\' != \'A\')' }, style: { background: '#1e293b', color: '#fbbf24', border: '1px solid #f59e0b', borderRadius: '8px', padding: '8px 14px', width: 420 } },
        { id: 'kmp_jump', position: { x: 40, y: 275 }, sourcePosition: Position.Top, targetPosition: Position.Top, data: { label: '🏆 FAST FALLBACK JUMP: j = π[3] = 2\nText Pointer i Never Backtracks! Monotonic O(N+M) Complexity' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', width: 420, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_kmp_lps_scan', source: 'kmp_lps', target: 'kmp_scan', label: 'Inspect LPS Table', style: { stroke: '#38bdf8', strokeWidth: 1.8 } },
        { id: 'e_kmp_fallback', source: 'kmp_scan', target: 'kmp_jump', label: 'Fallback j = π[3]', style: { stroke: '#34d399', strokeWidth: 2.5 } },
        { id: 'e_kmp_txt', source: 'kmp_text', target: 'kmp_scan', label: 'Match prefix', style: { stroke: '#64748b', strokeWidth: 1.8 } }
      ];
      return { nodes, edges };
    }
  },

  // 9. MERGE SORT
  merge_sort: {
    title: 'Merge Sort (Divide and Conquer)',
    category: 'Sorting & Divide and Conquer',
    timeComp: 'O(N log N)',
    spaceComp: 'O(N)',
    availableDs: [
      { id: 'recursion_tree', label: 'Recursion Call Tree', description: 'Recursive split and conquer tree' }
    ],
    steps: [
      {
        step: 0,
        title: 'Divide Phase: Split Array into Halves',
        explanation: 'Recursively split array [38, 27, 43, 3, 9, 82, 10] into left [38, 27, 43] and right [3, 9, 82, 10].',
        memoryState: { type: 'Call Stack', items: ['mergeSort(0, 6)', 'mergeSort(0, 2)', 'mergeSort(3, 6)'], pointers: { depth: '1' } },
        pseudoCode: 'mid = (l + r) // 2;\nmergeSort(arr, l, mid);\nmergeSort(arr, mid + 1, r);',
        activeNodeIds: ['ms_root', 'ms_l1', 'ms_r1'],
        activeEdgeIds: ['e_ms_l1', 'e_ms_r1']
      },
      {
        step: 1,
        title: 'Atomic Base Cases: Single-Element Subarrays [38], [27], [43]',
        explanation: 'Atomic singletons are inherently sorted base cases.',
        memoryState: { type: 'Subarrays', items: ['[27]', '[38]', '[43]'], pointers: { state: 'ATOMIC' } },
        pseudoCode: 'if (l >= r) return;',
        activeNodeIds: ['ms_l2a', 'ms_l2b'],
        activeEdgeIds: ['e_ms_l2a', 'e_ms_l2b']
      },
      {
        step: 2,
        title: 'Conquer Phase: 2-Pointer Sorted Merge -> [27, 38, 43]',
        explanation: 'Merge [27, 38] with [43]. Compare heads and copy smaller to buffer in O(N).',
        memoryState: { type: 'Merge Buffer', items: ['i -> 27', 'j -> 43', 'Merged: [27, 38, 43]'], pointers: { comp: '27 < 43' } },
        pseudoCode: 'while i < len1 and j < len2:\n  if left[i] <= right[j]: out.append(left[i++])',
        activeNodeIds: ['ms_l1'],
        activeEdgeIds: []
      },
      {
        step: 3,
        title: 'Final Combined Merge: [ 3, 9, 10, 27, 38, 43, 82 ]',
        explanation: 'Full array sorted stably in O(N log N) time.',
        memoryState: { type: 'Sorted Array', items: ['[3, 9, 10, 27, 38, 43, 82]'], pointers: { status: 'SORTED' } },
        pseudoCode: 'return merged; // Fully sorted output',
        activeNodeIds: ['ms_merged'],
        activeEdgeIds: ['e_ms_merge'],
        successNodeIds: ['ms_merged']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'ms_root', position: { x: 260, y: 40 }, data: { label: 'Level 0: [ 38, 27, 43, 3, 9, 82, 10 ]' }, style: { background: '#0284c7', color: '#fff', border: '2px solid #38bdf8', borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold' } },
        { id: 'ms_l1', position: { x: 80, y: 130 }, data: { label: 'Left: [ 38, 27, 43 ]' }, style: { background: '#1e293b', color: '#f8fafc', border: '2px solid #38bdf8', borderRadius: '8px', padding: '6px 12px' } },
        { id: 'ms_r1', position: { x: 420, y: 130 }, data: { label: 'Right: [ 3, 9, 82, 10 ]' }, style: { background: '#1e293b', color: '#f8fafc', border: '2px solid #38bdf8', borderRadius: '8px', padding: '6px 12px' } },
        { id: 'ms_l2a', position: { x: 20, y: 220 }, data: { label: '[ 38, 27 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '6px', padding: '4px 8px' } },
        { id: 'ms_l2b', position: { x: 170, y: 220 }, data: { label: '[ 43 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '6px', padding: '4px 8px' } },
        { id: 'ms_merged', position: { x: 160, y: 310 }, data: { label: '🏆 SORTED RESULT: [ 3, 9, 10, 27, 38, 43, 82 ]\n2-Pointer Linear Merge in O(N log N)' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '10px', padding: '10px 18px', fontWeight: 'bold', textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_ms_l1', source: 'ms_root', target: 'ms_l1', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_ms_r1', source: 'ms_root', target: 'ms_r1', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_ms_l2a', source: 'ms_l1', target: 'ms_l2a', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_ms_l2b', source: 'ms_l1', target: 'ms_l2b', style: { stroke: '#64748b', strokeWidth: 2 } },
        { id: 'e_ms_merge', source: 'ms_l2a', target: 'ms_merged', type: 'smoothstep', style: { stroke: '#34d399', strokeWidth: 2 } }
      ];
      return { nodes, edges };
    }
  },

  // 10. QUICK SORT
  quick_sort: {
    title: 'QuickSort (Partitioning & Pivot Swaps)',
    category: 'Sorting & Divide and Conquer',
    timeComp: 'O(N log N) avg',
    spaceComp: 'O(log N)',
    availableDs: [
      { id: 'partition_array', label: 'Partition Array Slots', description: 'Pivot marker and two-pointer partition bounds' }
    ],
    steps: [
      {
        step: 0,
        title: 'Choose Pivot: Rightmost Element (Pivot = 70)',
        explanation: 'Array [10, 80, 30, 90, 40, 50, 70]. Set Pivot = 70. Pointer i = -1 (Smaller elements boundary).',
        memoryState: { type: 'Partition State', items: ['Pivot = 70', 'i = -1', 'j = 0'], pointers: { pivot: '70' } },
        pseudoCode: 'pivot = arr[high]; i = low - 1;',
        activeNodeIds: ['qs_arr', 'qs_piv'],
        activeEdgeIds: ['e_qs_piv']
      },
      {
        step: 1,
        title: 'Scan Elements: Swap Smaller Elements into Left Partition',
        explanation: 'Elements 10, 30, 40, 50 are < 70 -> swapped to left. Elements 80, 90 stay on right.',
        memoryState: { type: 'Partitions', items: ['Left (<70): [10, 30, 40, 50]', 'Right (>70): [80, 90]'], pointers: { i: '3' } },
        pseudoCode: 'if arr[j] < pivot:\n  i += 1; swap(arr[i], arr[j]);',
        activeNodeIds: ['qs_piv', 'qs_left', 'qs_right'],
        activeEdgeIds: ['e_qs_l', 'e_qs_r']
      },
      {
        step: 2,
        title: 'Place Pivot in Sorted Position (Index 4)',
        explanation: 'Swap Pivot (70) with arr[i+1]. Array becomes [10, 30, 40, 50, 70, 90, 80]. 70 is permanently locked!',
        memoryState: { type: 'Sorted Pivot', items: ['70 at Index 4 (Locked)', 'Subproblems: [10..50], [80..90]'], pointers: { status: 'PIVOT_LOCKED' } },
        pseudoCode: 'swap(arr[i+1], arr[high]); return i+1;',
        activeNodeIds: ['qs_sorted'],
        activeEdgeIds: ['e_qs_sl', 'e_qs_sr'],
        successNodeIds: ['qs_sorted']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'qs_arr', position: { x: 50, y: 35 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Input Array: [ 10, 80, 30, 90, 40, 50, 70 ]' }, style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #475569', borderRadius: '8px', padding: '8px 14px', width: 380 } },
        { id: 'qs_piv', position: { x: 140, y: 110 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: '🎯 Chosen Pivot = 70\n(i = -1, j = 0..5)' }, style: { background: '#1e293b', color: '#fbbf24', border: '2px solid #f59e0b', borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', width: 200, textAlign: 'center' } },
        { id: 'qs_left', position: { x: 30, y: 205 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Left Partition (< 70):\n[ 10, 30, 40, 50 ]' }, style: { background: '#1e293b', color: '#38bdf8', border: '2px solid #0284c7', borderRadius: '8px', padding: '8px 12px', width: 180, textAlign: 'center' } },
        { id: 'qs_right', position: { x: 260, y: 205 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Right Partition (>= 70):\n[ 80, 90 ]' }, style: { background: '#1e293b', color: '#a855f7', border: '2px solid #a855f7', borderRadius: '8px', padding: '8px 12px', width: 170, textAlign: 'center' } },
        { id: 'qs_sorted', position: { x: 40, y: 305 }, sourcePosition: Position.Top, targetPosition: Position.Top, data: { label: '🏆 PIVOT 70 LOCKED AT INDEX 4:\n[ 10, 30, 40, 50, 70(Fixed), 80, 90 ]' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '10px', padding: '10px 18px', fontWeight: 'bold', width: 400, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_qs_piv', source: 'qs_arr', target: 'qs_piv', label: 'Select Pivot', style: { stroke: '#f59e0b', strokeWidth: 2 } },
        { id: 'e_qs_l', source: 'qs_piv', target: 'qs_left', label: '< 70', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_qs_r', source: 'qs_piv', target: 'qs_right', label: '>= 70', style: { stroke: '#a855f7', strokeWidth: 2 } },
        { id: 'e_qs_sl', source: 'qs_left', target: 'qs_sorted', label: 'Join Left', style: { stroke: '#34d399', strokeWidth: 2 } },
        { id: 'e_qs_sr', source: 'qs_right', target: 'qs_sorted', label: 'Join Right', style: { stroke: '#34d399', strokeWidth: 2 } }
      ];
      return { nodes, edges };
    }
  },

  // 11. RANDOMIZED QUICKSORT
  randomized_quicksort: {
    title: 'Randomized QuickSort',
    category: 'Sorting & Divide and Conquer',
    timeComp: 'O(N log N) expected',
    spaceComp: 'O(log N)',
    availableDs: [
      { id: 'random_pivot', label: 'Random Pivot Selection', description: 'Dynamic uniform random pivot sampling' }
    ],
    steps: [
      {
        step: 0,
        title: 'Randomly Sample Pivot: Choose Index 3 (Val: 90) Uniformly',
        explanation: 'Select random index 3 in [0..6] with uniform probability 1/(high-low+1). Pivot value = 90.',
        memoryState: { type: 'Random Pivot', items: ['Random Idx: 3 (Val: 90)', 'Array: [10, 80, 30, 90, 40, 50, 70]'], pointers: { seed: 'UNIFORM_RANDOM' } },
        pseudoCode: 'rand_idx = uniform_random(low, high); // 3\npivot_val = arr[rand_idx]; // 90',
        activeNodeIds: ['rqs_orig'],
        activeEdgeIds: []
      },
      {
        step: 1,
        title: 'Swap Sampled Pivot with High Index (End of Subarray)',
        explanation: 'Swap arr[3] (90) with arr[6] (70). The randomized pivot is now placed at the high partition boundary.',
        memoryState: { type: 'Pivot Placed', items: ['Swapped (90 <-> 70)', 'New End Pivot: 90'], pointers: { pivot: '90' } },
        pseudoCode: 'swap(arr[rand_idx], arr[high]);\npivot = arr[high]; // 90',
        activeNodeIds: ['rqs_swap'],
        activeEdgeIds: ['e_rqs_1']
      },
      {
        step: 2,
        title: 'Two-Pointer Partitioning (< 90 vs >= 90)',
        explanation: 'Elements [10, 80, 30, 70, 40, 50] are all < 90. All elements gather on left partition.',
        memoryState: { type: 'Partitions', items: ['Left (<90): [10, 80, 30, 70, 40, 50]', 'Right: []'], pointers: { i: '5' } },
        pseudoCode: 'for j in low..high-1:\n  if arr[j] < pivot: i += 1; swap(arr[i], arr[j]);',
        activeNodeIds: ['rqs_part'],
        activeEdgeIds: ['e_rqs_2']
      },
      {
        step: 3,
        title: 'Pivot 90 Fixed in Place -> Recurse on Subarrays',
        explanation: 'Swap pivot with arr[i+1]. Pivot 90 locked at index 6. Adversarial input permutations defeated in expected O(N log N)!',
        memoryState: { type: 'Partition Complete', items: ['Index 6 (90) Locked', 'Expected Time: Θ(N log N)'], pointers: { status: 'PIVOT_LOCKED' } },
        pseudoCode: 'swap(arr[i+1], arr[high]); return i+1;',
        activeNodeIds: ['rqs_done'],
        activeEdgeIds: ['e_rqs_3'],
        successNodeIds: ['rqs_done']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'rqs_orig', position: { x: 40, y: 40 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Step 0: Sample Random Pivot\n[ 10, 80, 30, 90(★Rand), 40, 50, 70 ]' }, style: { background: '#1e293b', color: '#fbbf24', border: '2px solid #f59e0b', borderRadius: '8px', padding: '8px 14px', width: 400 } },
        { id: 'rqs_swap', position: { x: 40, y: 120 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Step 1: Swap Pivot to End Boundary\n[ 10, 80, 30, 70, 40, 50, 90(Pivot End) ]' }, style: { background: '#1e293b', color: '#38bdf8', border: '2px solid #38bdf8', borderRadius: '8px', padding: '8px 14px', width: 400 } },
        { id: 'rqs_part', position: { x: 40, y: 200 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Step 2: Linear 2-Way Partitioning\n< 90: [ 10, 80, 30, 70, 40, 50 ]  |  >= 90: [ ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '8px 14px', width: 400 } },
        { id: 'rqs_done', position: { x: 40, y: 285 }, sourcePosition: Position.Top, targetPosition: Position.Top, data: { label: '🏆 PIVOT 90 LOCKED AT INDEX 6\nGuaranteed Θ(N log N) Expected Across All Inputs' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '10px', padding: '10px 18px', fontWeight: 'bold', width: 400, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_rqs_1', source: 'rqs_orig', target: 'rqs_swap', label: 'Swap End', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_rqs_2', source: 'rqs_swap', target: 'rqs_part', label: 'Partition', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_rqs_3', source: 'rqs_part', target: 'rqs_done', label: 'Lock Pivot', style: { stroke: '#34d399', strokeWidth: 2.5 } }
      ];
      return { nodes, edges };
    }
  },

  // 12. BUBBLE SORT
  bubble_sort: {
    title: 'Bubble Sort (Adjacent Pair Swaps)',
    category: 'Sorting & Divide and Conquer',
    timeComp: 'O(N²)',
    spaceComp: 'O(1)',
    availableDs: [
      { id: 'array_swap', label: 'Adjacent Pair Swaps', description: 'Visual adjacent element comparison and bubbling' }
    ],
    steps: [
      {
        step: 0,
        title: 'Pass 1: Compare (64, 34) -> Swap -> 64 Bubbles Right',
        explanation: '64 > 34 -> Swap. 64 compared with 25 -> Swap. Largest element 90 bubbles to the rightmost index.',
        memoryState: { type: 'Pass 1 Swaps', items: ['(64,34)->Swap', '(64,25)->Swap', '90 Locked at End'], pointers: { pass: '1' } },
        pseudoCode: 'for i in 0..N-1:\n  for j in 0..N-i-2:\n    if arr[j] > arr[j+1]: swap(arr[j], arr[j+1]);',
        activeNodeIds: ['bs_init', 'bs_swap1', 'bs_pass1'],
        activeEdgeIds: ['e_bs_1', 'e_bs_2']
      },
      {
        step: 1,
        title: 'Pass 2: 64 Bubbles to Second-to-Last Position',
        explanation: 'Compare adjacent pairs up to index N-2. 64 locked into its sorted position. Sorted suffix grows.',
        memoryState: { type: 'Sorted Tail', items: ['[64, 90] Locked', 'Suffix Size: 2'], pointers: { pass: '2' } },
        pseudoCode: 'arr[N-2] is locked; // 64 in place',
        activeNodeIds: ['bs_pass1', 'bs_pass2'],
        activeEdgeIds: ['e_bs_3'],
        successNodeIds: ['bs_pass2']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'bs_init', position: { x: 40, y: 40 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Initial Array: [ 64, 34, 25, 12, 22, 11, 90 ]' }, style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #475569', borderRadius: '8px', padding: '8px 14px', width: 400 } },
        { id: 'bs_swap1', position: { x: 40, y: 120 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Adjacent Comp: (64 > 34) -> Swap -> 64 Bubbles Right' }, style: { background: '#1e293b', color: '#fbbf24', border: '2px solid #f59e0b', borderRadius: '8px', padding: '8px 14px', width: 400 } },
        { id: 'bs_pass1', position: { x: 40, y: 200 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Pass 1 Complete: [ 34, 25, 12, 22, 11, 64, 90(Locked) ]\nMax element 90 placed at end.' }, style: { background: '#1e293b', color: '#38bdf8', border: '2px solid #0284c7', borderRadius: '8px', padding: '8px 14px', width: 400 } },
        { id: 'bs_pass2', position: { x: 40, y: 285 }, sourcePosition: Position.Top, targetPosition: Position.Top, data: { label: '🏆 Pass 2 Complete: [ 25, 12, 22, 11, 34, 64(Locked), 90(Locked) ]\nSorted suffix grows by 1 per pass in O(N²)' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '10px 18px', fontWeight: 'bold', width: 400, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_bs_1', source: 'bs_init', target: 'bs_swap1', label: 'Compare (64, 34)', style: { stroke: '#f59e0b', strokeWidth: 1.8 } },
        { id: 'e_bs_2', source: 'bs_swap1', target: 'bs_pass1', label: 'Bubble 90 to End', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_bs_3', source: 'bs_pass1', target: 'bs_pass2', label: 'Bubble 64 to N-2', style: { stroke: '#34d399', strokeWidth: 2.5 } }
      ];
      return { nodes, edges };
    }
  },

  // 13. INSERTION SORT
  insertion_sort: {
    title: 'Insertion Sort (Sublist Shifts)',
    category: 'Sorting & Divide and Conquer',
    timeComp: 'O(N²)',
    spaceComp: 'O(1)',
    availableDs: [
      { id: 'sublist_shift', label: 'Sorted Sublist Shifts', description: 'Key extraction and sorted sublist shifting' }
    ],
    steps: [
      {
        step: 0,
        title: 'Initial State: First Element [12] is Sorted',
        explanation: 'Single-element prefix [12] is trivially sorted. Unsorted remainder: [11, 13, 5, 6].',
        memoryState: { type: 'Sublist State', items: ['Sorted: [12]', 'Unsorted: [11, 13, 5, 6]'], pointers: { i: '1' } },
        pseudoCode: 'i = 1; // Start inserting from index 1',
        activeNodeIds: ['is_st0'],
        activeEdgeIds: []
      },
      {
        step: 1,
        title: 'Key = 11: 11 < 12 -> Shift 12 Right -> Insert 11 at Index 0',
        explanation: 'Key 11 is smaller than 12. Shift 12 to index 1 and drop 11 at index 0. Sublist becomes [11, 12].',
        memoryState: { type: 'Shift & Insert', items: ['Shift 12 ->', 'Drop 11 at Idx 0', 'Sorted: [11, 12]'], pointers: { key: '11' } },
        pseudoCode: 'key = arr[1]; // 11\nwhile j >= 0 and arr[j] > key:\n  arr[j+1] = arr[j]; j -= 1;\narr[j+1] = key;',
        activeNodeIds: ['is_st1'],
        activeEdgeIds: ['e_is_1']
      },
      {
        step: 2,
        title: 'Key = 13: 13 > 12 -> Stays at Index 2 (No Shifts)',
        explanation: 'Key 13 is already larger than the largest sorted element 12. No elements shifted.',
        memoryState: { type: 'No Shift', items: ['Sorted: [11, 12, 13]', 'Unsorted: [5, 6]'], pointers: { key: '13' } },
        pseudoCode: 'key = arr[2]; // 13 > 12 -> 0 shifts',
        activeNodeIds: ['is_st2'],
        activeEdgeIds: ['e_is_2']
      },
      {
        step: 3,
        title: 'Key = 5: Shift [11, 12, 13] Right -> Insert 5 at Index 0',
        explanation: 'Key 5 is smaller than all sorted elements. Shift 13, 12, 11 right. Place 5 at index 0.',
        memoryState: { type: 'Multi-Shift', items: ['Shifted 3 elements', 'Sorted: [5, 11, 12, 13]'], pointers: { key: '5' } },
        pseudoCode: 'shift(13, 12, 11); arr[0] = 5;',
        activeNodeIds: ['is_st3'],
        activeEdgeIds: ['e_is_3']
      },
      {
        step: 4,
        title: 'Key = 6: Shift [11, 12, 13] -> Insert 6 at Index 1 -> Fully Sorted!',
        explanation: 'Key 6 is placed at index 1. Array is completely sorted in-place with O(1) auxiliary space!',
        memoryState: { type: 'Sorted Output', items: ['[5, 6, 11, 12, 13] Complete'], pointers: { status: 'SORTED' } },
        pseudoCode: 'return arr; // [5, 6, 11, 12, 13]',
        activeNodeIds: ['is_st4'],
        activeEdgeIds: ['e_is_4'],
        successNodeIds: ['is_st4']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'is_st0', position: { x: 40, y: 40 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Step 0: Sorted Prefix: [ 12 ] | Unsorted: [ 11, 13, 5, 6 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '6px', padding: '6px 12px', width: 400 } },
        { id: 'is_st1', position: { x: 40, y: 100 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Step 1: Key=11 -> Shift 12 -> Sorted: [ 11, 12 ]' }, style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', padding: '6px 12px', width: 400 } },
        { id: 'is_st2', position: { x: 40, y: 160 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Step 2: Key=13 -> No Shift -> Sorted: [ 11, 12, 13 ]' }, style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', padding: '6px 12px', width: 400 } },
        { id: 'is_st3', position: { x: 40, y: 220 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Step 3: Key=5  -> Shift 3  -> Sorted: [ 5, 11, 12, 13 ]' }, style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', padding: '6px 12px', width: 400 } },
        { id: 'is_st4', position: { x: 40, y: 280 }, sourcePosition: Position.Top, targetPosition: Position.Top, data: { label: '🏆 FINAL SORTED ARRAY: [ 5, 6, 11, 12, 13 ]\nAdaptive O(N) Best-Case, O(1) In-Place Space' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', width: 400, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_is_1', source: 'is_st0', target: 'is_st1', style: { stroke: '#38bdf8', strokeWidth: 1.8 } },
        { id: 'e_is_2', source: 'is_st1', target: 'is_st2', style: { stroke: '#38bdf8', strokeWidth: 1.8 } },
        { id: 'e_is_3', source: 'is_st2', target: 'is_st3', style: { stroke: '#38bdf8', strokeWidth: 1.8 } },
        { id: 'e_is_4', source: 'is_st3', target: 'is_st4', style: { stroke: '#34d399', strokeWidth: 2.2 } }
      ];
      return { nodes, edges };
    }
  },

  // 14. HEAP SORT
  heap_sort: {
    title: 'Heap Sort (Max-Heapify Down)',
    category: 'Sorting & Divide and Conquer',
    timeComp: 'O(N log N)',
    spaceComp: 'O(1)',
    availableDs: [
      { id: 'binary_heap', label: 'Complete Binary Heap Tree', description: 'Parent-child array tree representation' }
    ],
    steps: [
      {
        step: 0,
        title: 'Build Max-Heap in O(N): Root = 82 (Max Element)',
        explanation: 'Max-Heap property satisfied: Parent >= Children for all nodes. Root index 0 holds max value 82.',
        memoryState: { type: 'Max-Heap Array', items: ['[ 82, 43, 38, 27, 9, 10, 3 ]'], pointers: { root: '82' } },
        pseudoCode: 'build_max_heap(arr); // O(N)',
        activeNodeIds: ['hp_root', 'hp_l', 'hp_r'],
        activeEdgeIds: ['e_hp_l', 'e_hp_r']
      },
      {
        step: 1,
        title: 'Extract Max: Swap Root (82) with End Element (3) -> Sift Down',
        explanation: 'Place 82 into sorted position at end. Sift down 3 from root to restore Max-Heap property in O(log N).',
        memoryState: { type: 'Heap Extraction', items: ['82 Locked at End', 'New Root Heapified: 43'], pointers: { status: 'HEAPIFIED' } },
        pseudoCode: 'swap(arr[0], arr[i]); heapify(arr, 0, i);',
        activeNodeIds: ['hp_root', 'hp_sorted'],
        activeEdgeIds: ['e_hp_ext'],
        successNodeIds: ['hp_sorted']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'hp_root', position: { x: 260, y: 35 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Root: [ 82 ]\n(Max Element)' }, style: { background: '#0284c7', color: '#fff', border: '2px solid #38bdf8', borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold' } },
        { id: 'hp_l', position: { x: 130, y: 110 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Left: [ 43 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '6px 12px' } },
        { id: 'hp_r', position: { x: 380, y: 110 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Right: [ 38 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '8px', padding: '6px 12px' } },
        { id: 'hp_l1', position: { x: 70, y: 185 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: '[ 27 ]' }, style: { background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', padding: '4px 8px', width: 55, textAlign: 'center' } },
        { id: 'hp_l2', position: { x: 180, y: 185 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: '[ 9 ]' }, style: { background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', padding: '4px 8px', width: 55, textAlign: 'center' } },
        { id: 'hp_r1', position: { x: 330, y: 185 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: '[ 10 ]' }, style: { background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', padding: '4px 8px', width: 55, textAlign: 'center' } },
        { id: 'hp_r2', position: { x: 430, y: 185 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: '[ 3 ]' }, style: { background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', padding: '4px 8px', width: 55, textAlign: 'center' } },
        { id: 'hp_sorted', position: { x: 90, y: 275 }, sourcePosition: Position.Top, targetPosition: Position.Top, data: { label: '🏆 ROOT EXTRACTED & LOCKED: [ 82 ] at arr[N-1]\nMax-Heapify Down restores heap in O(log N)' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '10px 18px', fontWeight: 'bold', width: 400, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_hp_l', source: 'hp_root', target: 'hp_l', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_hp_r', source: 'hp_root', target: 'hp_r', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_hp_l1', source: 'hp_l', target: 'hp_l1', style: { stroke: '#64748b', strokeWidth: 1.8 } },
        { id: 'e_hp_l2', source: 'hp_l', target: 'hp_l2', style: { stroke: '#64748b', strokeWidth: 1.8 } },
        { id: 'e_hp_r1', source: 'hp_r', target: 'hp_r1', style: { stroke: '#64748b', strokeWidth: 1.8 } },
        { id: 'e_hp_r2', source: 'hp_r', target: 'hp_r2', style: { stroke: '#64748b', strokeWidth: 1.8 } },
        { id: 'e_hp_ext', source: 'hp_root', target: 'hp_sorted', type: 'smoothstep', label: 'Extract Root [82]', style: { stroke: '#34d399', strokeWidth: 2.5 } }
      ];
      return { nodes, edges };
    }
  },

  // 15. 0/1 KNAPSACK DP
  knapsack_dp: {
    title: '0/1 Knapsack (2D Dynamic Programming)',
    category: 'Dynamic Programming',
    timeComp: 'O(N × W)',
    spaceComp: 'O(N × W)',
    availableDs: [
      { id: 'table_2d', label: '2D DP Recurrence Table', description: 'Full (N+1) × (W+1) subproblem table' }
    ],
    steps: [
      {
        step: 0,
        title: 'Base Cases: DP[0..4][0] = 0 & Item Pool (Cap W = 7)',
        explanation: '0 items or 0 capacity yields 0 value. 4 candidate items with (Weight, Value): I₁(1, 1), I₂(2, 6), I₃(3, 10), I₄(5, 16).',
        memoryState: { type: '2D DP Matrix', items: ['DP[0..4][0] = 0', 'Capacity W = 7', '4 Items Ready'], pointers: { cap: '7', row: '0' } },
        pseudoCode: 'for w in 0..W: DP[0][w] = 0;\nfor i in 0..N: DP[i][0] = 0;',
        activeNodeIds: ['kp_base', 'kp_item1', 'kp_item2', 'kp_item3', 'kp_item4'],
        activeEdgeIds: []
      },
      {
        step: 1,
        title: 'Include Item 1 (W:1, V:1) -> DP[1][1..7] = 1',
        explanation: 'DP[1][w] = max(DP[0][w], DP[0][w-1] + 1) = 1. Capacity 1 gains value 1.',
        memoryState: { type: 'DP Subproblem', items: ['DP[1][1] = 1', 'Cap 1 Reached'], pointers: { item: '1 (W:1, V:1)' } },
        pseudoCode: 'DP[1][1] = max(DP[0][1], DP[0][0] + 1) = 1;',
        activeNodeIds: ['kp_item1', 'kp_c1'],
        activeEdgeIds: ['e_kp_i1_c1']
      },
      {
        step: 2,
        title: 'Include Item 2 (W:2, V:6) -> DP[2][2]=6 & DP[2][3]=7',
        explanation: 'At Cap 2: take I₂ (val: 6). At Cap 3: combine I₁ (W:1, V:1) + I₂ (W:2, V:6) -> Total Value = 1 + 6 = 7.',
        memoryState: { type: 'DP Subproblems', items: ['DP[2][2] = 6', 'DP[2][3] = 7'], pointers: { item: '2 (W:2, V:6)' } },
        pseudoCode: 'DP[2][2] = max(DP[1][2], DP[1][0] + 6) = 6;\nDP[2][3] = max(DP[1][3], DP[1][1] + 6) = 7;',
        activeNodeIds: ['kp_item2', 'kp_c2', 'kp_c3'],
        activeEdgeIds: ['e_kp_i2_c2', 'e_kp_c1_c3']
      },
      {
        step: 3,
        title: 'Include Item 3 (W:3, V:10) -> DP[3][5] = 6 + 10 = 16',
        explanation: 'At Cap 5: combine Item 2 (W:2, V:6) + Item 3 (W:3, V:10) -> Total Weight = 5, Total Value = 16.',
        memoryState: { type: 'DP Subproblem', items: ['DP[3][5] = 16 (I2 + I3)'], pointers: { item: '3 (W:3, V:10)' } },
        pseudoCode: 'DP[3][5] = max(DP[2][5], DP[2][5 - 3] + 10) = 6 + 10 = 16;',
        activeNodeIds: ['kp_item3', 'kp_c5'],
        activeEdgeIds: ['e_kp_i3_c5', 'e_kp_c2_c5']
      },
      {
        step: 4,
        title: 'Include Item 4 (W:5, V:16) -> Global Optimal Max DP[4][7] = 22!',
        explanation: 'At Cap 7: combine Item 2 (W:2, V:6) + Item 4 (W:5, V:16) -> Total W = 2 + 5 = 7 <= 7. Max Value = 6 + 16 = 22!',
        memoryState: { type: 'Optimal DP Solution', items: ['Global Max: 22', 'Chosen: {Item 2, Item 4}', 'Weight: 7/7'], pointers: { status: 'OPTIMAL_REACHED' } },
        pseudoCode: 'DP[4][7] = max(DP[3][7], DP[3][7 - 5] + 16) = 6 + 16 = 22;\nreturn backtrack(DP); // {Item 2, Item 4}',
        activeNodeIds: ['kp_item4', 'kp_c7', 'kp_opt'],
        activeEdgeIds: ['e_kp_i4_c7', 'e_kp_c2_c7', 'e_kp_c7_opt'],
        successNodeIds: ['kp_opt', 'kp_c7']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        // Left Column: 4 Candidate Items
        { id: 'kp_item1', position: { x: 30, y: 40 }, sourcePosition: Position.Right, targetPosition: Position.Left, data: { label: 'Item 1: [ W:1, V:1 ]' }, style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', padding: '6px 10px', width: 135 } },
        { id: 'kp_item2', position: { x: 30, y: 110 }, sourcePosition: Position.Right, targetPosition: Position.Left, data: { label: 'Item 2: [ W:2, V:6 ]' }, style: { background: '#1e293b', color: '#a855f7', border: '1px solid #a855f7', borderRadius: '6px', padding: '6px 10px', width: 135 } },
        { id: 'kp_item3', position: { x: 30, y: 180 }, sourcePosition: Position.Right, targetPosition: Position.Left, data: { label: 'Item 3: [ W:3, V:10 ]' }, style: { background: '#1e293b', color: '#fbbf24', border: '1px solid #f59e0b', borderRadius: '6px', padding: '6px 10px', width: 135 } },
        { id: 'kp_item4', position: { x: 30, y: 250 }, sourcePosition: Position.Right, targetPosition: Position.Left, data: { label: 'Item 4: [ W:5, V:16 ]' }, style: { background: '#1e293b', color: '#34d399', border: '1px solid #10b981', borderRadius: '6px', padding: '6px 10px', width: 135 } },

        // Middle Columns: Subproblem State Grid
        { id: 'kp_base', position: { x: 200, y: 40 }, sourcePosition: Position.Right, targetPosition: Position.Left, data: { label: 'Base Case\nDP[0..4][0] = 0' }, style: { background: '#0f172a', color: '#64748b', border: '1px solid #334155', borderRadius: '6px', padding: '6px', width: 110, textAlign: 'center', fontSize: '0.72rem' } },
        { id: 'kp_c1', position: { x: 350, y: 40 }, sourcePosition: Position.Bottom, targetPosition: Position.Left, data: { label: 'Cap 1 (I₁)\nDP[1][1] = 1' }, style: { background: '#0f172a', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '6px', padding: '6px', width: 110, textAlign: 'center', fontSize: '0.72rem' } },
        { id: 'kp_c2', position: { x: 200, y: 130 }, sourcePosition: Position.Right, targetPosition: Position.Left, data: { label: 'Cap 2 (I₂)\nDP[2][2] = 6' }, style: { background: '#0f172a', color: '#a855f7', border: '1px solid #a855f7', borderRadius: '6px', padding: '6px', width: 110, textAlign: 'center', fontSize: '0.72rem' } },
        { id: 'kp_c3', position: { x: 350, y: 130 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Cap 3 (I₁+I₂)\nDP[2][3] = 7' }, style: { background: '#0f172a', color: '#a855f7', border: '1px solid #a855f7', borderRadius: '6px', padding: '6px', width: 110, textAlign: 'center', fontSize: '0.72rem' } },
        { id: 'kp_c5', position: { x: 200, y: 220 }, sourcePosition: Position.Right, targetPosition: Position.Left, data: { label: 'Cap 5 (I₂+I₃)\nDP[3][5] = 16' }, style: { background: '#0f172a', color: '#fbbf24', border: '1px solid #f59e0b', borderRadius: '6px', padding: '6px', width: 110, textAlign: 'center', fontSize: '0.72rem' } },
        { id: 'kp_c7', position: { x: 350, y: 220 }, sourcePosition: Position.Bottom, targetPosition: Position.Left, data: { label: 'Cap 7 (I₂+I₄)\nDP[4][7] = 22 (★)' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '6px', padding: '6px', width: 120, textAlign: 'center', fontWeight: 'bold', fontSize: '0.75rem' } },

        // Bottom Banner: Optimal Result
        { id: 'kp_opt', position: { x: 80, y: 315 }, sourcePosition: Position.Top, targetPosition: Position.Top, data: { label: '🏆 OPTIMAL MAX VALUE = 22\nBacktrack Chosen Items: [Item 2 (W:2, V:6), Item 4 (W:5, V:16)] | Total W = 7 ≤ 7' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '10px', padding: '10px 18px', fontWeight: 'bold', width: 420, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_kp_i1_c1', source: 'kp_item1', target: 'kp_c1', label: 'Take I₁ (+1)', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_kp_i2_c2', source: 'kp_item2', target: 'kp_c2', label: 'Take I₂ (+6)', style: { stroke: '#a855f7', strokeWidth: 2 } },
        { id: 'e_kp_c1_c3', source: 'kp_c1', target: 'kp_c3', label: '+ I₂ (+6)', style: { stroke: '#a855f7', strokeWidth: 2 } },
        { id: 'e_kp_i3_c5', source: 'kp_item3', target: 'kp_c5', label: 'Take I₃ (+10)', style: { stroke: '#fbbf24', strokeWidth: 2 } },
        { id: 'e_kp_c2_c5', source: 'kp_c2', target: 'kp_c5', label: 'I₂ + I₃', style: { stroke: '#fbbf24', strokeWidth: 2 } },
        { id: 'e_kp_i4_c7', source: 'kp_item4', target: 'kp_c7', label: 'Take I₄ (+16)', style: { stroke: '#34d399', strokeWidth: 2.5 } },
        { id: 'e_kp_c2_c7', source: 'kp_c2', target: 'kp_c7', label: 'I₂ + I₄ (Max)', style: { stroke: '#34d399', strokeWidth: 2.5 } },
        { id: 'e_kp_c7_opt', source: 'kp_c7', target: 'kp_opt', type: 'smoothstep', label: 'Optimal Backtrack', style: { stroke: '#34d399', strokeWidth: 3 } }
      ];
      return { nodes, edges };
    }
  },

  // 16. LONGEST COMMON SUBSEQUENCE (LCS)
  lcs_dp: {
    title: 'Longest Common Subsequence (LCS)',
    category: 'Dynamic Programming',
    timeComp: 'O(M × N)',
    spaceComp: 'O(M × N)',
    availableDs: [
      { id: 'table_2d', label: '2D DP Alignment Matrix', description: 'Directional traceback arrows matrix' }
    ],
    steps: [
      {
        step: 0,
        title: 'Initialize (M+1) × (N+1) DP Table: S1="STONE", S2="LONGEST"',
        explanation: 'Set first row and first column to 0. S1 length M=5, S2 length N=7.',
        memoryState: { type: 'DP Matrix', items: ['S1: "STONE"', 'S2: "LONGEST"', 'Base Case: DP[0][*] = DP[*][0] = 0'], pointers: { m: '5', n: '7' } },
        pseudoCode: 'DP = [[0]*(N+1) for _ in range(M+1)];',
        activeNodeIds: ['lcs_init'],
        activeEdgeIds: []
      },
      {
        step: 1,
        title: 'Character Match at \'O\': S1[2]==\'O\' == S2[1]==\'O\'',
        explanation: 'Characters match! Diagonal recurrence: DP[3][2] = DP[2][1] + 1 = 0 + 1 = 1.',
        memoryState: { type: 'Match 1', items: ['Matched: \'O\'', 'DP[3][2] = 1'], pointers: { char: '\'O\'' } },
        pseudoCode: 'if S1[i-1] == S2[j-1]:\n  DP[i][j] = DP[i-1][j-1] + 1;',
        activeNodeIds: ['lcs_m1'],
        activeEdgeIds: ['e_lcs_1']
      },
      {
        step: 2,
        title: 'Character Match at \'N\': S1[3]==\'N\' == S2[2]==\'N\'',
        explanation: 'Characters match! Diagonal recurrence: DP[4][3] = DP[3][2] + 1 = 1 + 1 = 2.',
        memoryState: { type: 'Match 2', items: ['Matched: \'O\', \'N\'', 'DP[4][3] = 2'], pointers: { char: '\'N\'' } },
        pseudoCode: 'DP[4][3] = DP[3][2] + 1; // 2',
        activeNodeIds: ['lcs_m2'],
        activeEdgeIds: ['e_lcs_2']
      },
      {
        step: 3,
        title: 'Character Match at \'E\': S1[4]==\'E\' == S2[4]==\'E\'',
        explanation: 'Characters match! Diagonal recurrence: DP[5][5] = DP[4][4] + 1 = 2 + 1 = 3.',
        memoryState: { type: 'Match 3', items: ['Matched: \'O\', \'N\', \'E\'', 'DP[5][5] = 3'], pointers: { char: '\'E\'' } },
        pseudoCode: 'DP[5][5] = DP[4][4] + 1; // 3',
        activeNodeIds: ['lcs_m3'],
        activeEdgeIds: ['e_lcs_3']
      },
      {
        step: 4,
        title: 'Traceback Optimal Alignment -> LCS = "ONE" (Length = 3)',
        explanation: 'Follow non-zero diagonal traceback pointers. Longest common subsequence discovered: "ONE" with length 3.',
        memoryState: { type: 'Optimal LCS', items: ['LCS: "ONE"', 'Length: 3'], pointers: { status: 'OPTIMAL_LCS' } },
        pseudoCode: 'return reconstruct_lcs(DP, S1, S2); // "ONE"',
        activeNodeIds: ['lcs_done'],
        activeEdgeIds: ['e_lcs_4'],
        successNodeIds: ['lcs_done']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'lcs_init', position: { x: 40, y: 40 }, data: { label: 'Step 0: S1 = "STONE" | S2 = "LONGEST"\nBase: DP[0..5][0..7] initialized to 0' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '6px', padding: '6px 12px', width: 390 } },
        { id: 'lcs_m1', position: { x: 40, y: 100 }, data: { label: 'Step 1: Match \'O\' -> DP[3][2] = DP[2][1] + 1 = 1' }, style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', padding: '6px 12px', width: 390 } },
        { id: 'lcs_m2', position: { x: 40, y: 160 }, data: { label: 'Step 2: Match \'N\' -> DP[4][3] = DP[3][2] + 1 = 2' }, style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', padding: '6px 12px', width: 390 } },
        { id: 'lcs_m3', position: { x: 40, y: 220 }, data: { label: 'Step 3: Match \'E\' -> DP[5][5] = DP[4][4] + 1 = 3' }, style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', padding: '6px 12px', width: 390 } },
        { id: 'lcs_done', position: { x: 40, y: 280 }, data: { label: '🏆 LONGEST COMMON SUBSEQUENCE = "ONE" (Len 3)\nOptimal Directional Traceback in O(M × N)' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', width: 390, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_lcs_1', source: 'lcs_init', target: 'lcs_m1', style: { stroke: '#38bdf8', strokeWidth: 1.8 } },
        { id: 'e_lcs_2', source: 'lcs_m1', target: 'lcs_m2', style: { stroke: '#38bdf8', strokeWidth: 1.8 } },
        { id: 'e_lcs_3', source: 'lcs_m2', target: 'lcs_m3', style: { stroke: '#38bdf8', strokeWidth: 1.8 } },
        { id: 'e_lcs_4', source: 'lcs_m3', target: 'lcs_done', style: { stroke: '#34d399', strokeWidth: 2.2 } }
      ];
      return { nodes, edges };
    }
  },

  // 17. MATRIX CHAIN MULTIPLICATION
  matrix_chain_dp: {
    title: 'Matrix Chain Multiplication',
    category: 'Dynamic Programming',
    timeComp: 'O(N³)',
    spaceComp: 'O(N²)',
    availableDs: [
      { id: 'table_2d', label: 'Upper Triangular DP Table', description: 'm[i][j] cost matrix with split s[i][j]' }
    ],
    steps: [
      {
        step: 0,
        title: 'Input Dimensions: A₁(10×30), A₂(30×5), A₃(5×60)',
        explanation: 'Dimension vector p = <10, 30, 5, 60>. Chain length L=1 trivial base case: m[i][i] = 0.',
        memoryState: { type: 'Dimensions', items: ['A₁: 10×30', 'A₂: 30×5', 'A₃: 5×60'], pointers: { L: '1' } },
        pseudoCode: 'for i in 1..n: m[i][i] = 0;',
        activeNodeIds: ['mcm_st0'],
        activeEdgeIds: []
      },
      {
        step: 1,
        title: 'Chain Length L=2: Subproblems m[1,2] and m[2,3]',
        explanation: 'Compute m[1,2] = 10×30×5 = 1,500 operations. Compute m[2,3] = 30×5×60 = 9,000 operations.',
        memoryState: { type: 'Subproblems L=2', items: ['m[1,2] = 1,500', 'm[2,3] = 9,000'], pointers: { L: '2' } },
        pseudoCode: 'm[1][2] = p[0]*p[1]*p[2] = 1500;\nm[2][3] = p[1]*p[2]*p[3] = 9000;',
        activeNodeIds: ['mcm_st1'],
        activeEdgeIds: ['e_mcm_1']
      },
      {
        step: 2,
        title: 'Chain Length L=3: Compare Splits k=1 vs k=2',
        explanation: 'Split k=1: A₁(A₂A₃) = 0 + 9000 + (10×30×60) = 27,000 ops.\nSplit k=2: (A₁A₂)A₃ = 1500 + 0 + (10×5×60) = 4,500 ops (OPTIMAL!).',
        memoryState: { type: 'Split Evaluation', items: ['k=1: 27,000 ops', 'k=2: 4,500 ops (Min)'], pointers: { min_cost: '4500' } },
        pseudoCode: 'm[1][3] = min(27000, 4500) = 4500;\ns[1][3] = 2; // Optimal split at k=2',
        activeNodeIds: ['mcm_st2'],
        activeEdgeIds: ['e_mcm_2']
      },
      {
        step: 3,
        title: 'Optimal Parenthesization Output: ((A₁ × A₂) × A₃)',
        explanation: 'Optimal order saves 22,500 operations (83.3% speedup over naive grouping)!',
        memoryState: { type: 'Optimal Order', items: ['((A₁ × A₂) × A₃)', 'Min Cost: 4,500 scalar ops'], pointers: { status: 'OPTIMAL_PARENTHESIS' } },
        pseudoCode: 'return print_optimal_parens(s, 1, 3); // ((A1 A2) A3)',
        activeNodeIds: ['mcm_st3'],
        activeEdgeIds: ['e_mcm_3'],
        successNodeIds: ['mcm_st3']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'mcm_st0', position: { x: 40, y: 40 }, data: { label: 'Step 0: Input Matrices A₁(10×30), A₂(30×5), A₃(5×60)\nBase: m[1][1] = m[2][2] = m[3][3] = 0' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '6px', padding: '6px 12px', width: 400 } },
        { id: 'mcm_st1', position: { x: 40, y: 105 }, data: { label: 'Step 1: L=2 -> m[1,2] = 1,500 ops  |  m[2,3] = 9,000 ops' }, style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', padding: '6px 12px', width: 400 } },
        { id: 'mcm_st2', position: { x: 40, y: 170 }, data: { label: 'Step 2: L=3 -> Compare k=1 (27,000) vs k=2 (4,500 Min!)' }, style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', padding: '6px 12px', width: 400 } },
        { id: 'mcm_st3', position: { x: 40, y: 235 }, data: { label: '🏆 OPTIMAL PARENTHESIZATION: ((A₁ × A₂) × A₃)\nMinimum Cost = 4,500 Scalar Multiplications' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', width: 400, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_mcm_1', source: 'mcm_st0', target: 'mcm_st1', style: { stroke: '#38bdf8', strokeWidth: 1.8 } },
        { id: 'e_mcm_2', source: 'mcm_st1', target: 'mcm_st2', style: { stroke: '#38bdf8', strokeWidth: 1.8 } },
        { id: 'e_mcm_3', source: 'mcm_st2', target: 'mcm_st3', style: { stroke: '#34d399', strokeWidth: 2.2 } }
      ];
      return { nodes, edges };
    }
  },

  // 18. HUFFMAN CODING
  huffman_coding: {
    title: 'Huffman Optimal Prefix Coding',
    category: 'Greedy Algorithms',
    timeComp: 'O(N log N)',
    spaceComp: 'O(N)',
    availableDs: [
      { id: 'prefix_tree', label: 'Optimal Prefix Binary Tree', description: 'Frequency-merged binary code tree' }
    ],
    steps: [
      {
        step: 0,
        title: 'Initialize Min-Heap with Character Frequencies',
        explanation: 'Frequencies: B(20), C(25), A(55). Insert leaves into Min-Heap.',
        memoryState: { type: 'Min-Heap', items: ['[B: 20]', '[C: 25]', '[A: 55]'], pointers: { min1: 'B', min2: 'C' } },
        pseudoCode: 'pq = priority_queue(leaves);',
        activeNodeIds: ['h_a', 'h_b', 'h_c'],
        activeEdgeIds: []
      },
      {
        step: 1,
        title: 'Greedily Merge 2 Smallest Nodes: B(20) + C(25) = 45',
        explanation: 'Pop B(20) and C(25). Combine into Internal node (45). Reinsert into PQ.',
        memoryState: { type: 'Min-Heap', items: ['[Internal: 45]', '[A: 55]'], pointers: { merged: '45' } },
        pseudoCode: 'l = pq.pop(); r = pq.pop();\npq.push(Node(l.freq + r.freq, l, r));',
        activeNodeIds: ['h_left', 'h_a', 'h_b'],
        activeEdgeIds: ['e_hl_a', 'e_hl_b']
      },
      {
        step: 2,
        title: 'Merge Remaining Nodes -> Form Root Node (100)',
        explanation: 'Merge Internal(45) and A(55) -> Root(100). Codes: A="1", B="00", C="01". Complete optimal compression!',
        memoryState: { type: 'Prefix Codes', items: ["A: '1'", "B: '00'", "C: '01'"], pointers: { status: 'OPTIMAL' } },
        pseudoCode: 'return root; // Optimal prefix tree',
        activeNodeIds: ['h_root', 'h_left', 'h_c'],
        activeEdgeIds: ['e_hr_l', 'e_hr_c'],
        successNodeIds: ['h_root']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'h_root', position: { x: 280, y: 40 }, data: { label: 'Root [ 100 ]' }, style: { background: '#d97706', color: '#fff', border: '2px solid #fbbf24', borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold' } },
        { id: 'h_left', position: { x: 120, y: 130 }, data: { label: 'Internal [ 45 ]\n(Bit 0)' }, style: { background: '#1e293b', color: '#38bdf8', border: '2px solid #38bdf8', borderRadius: '8px', padding: '6px 12px' } },
        { id: 'h_c', position: { x: 420, y: 130 }, data: { label: "Char 'A' [ 55 ]\nCode: '1'" }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold' } },
        { id: 'h_a', position: { x: 40, y: 230 }, data: { label: "Char 'B' [ 20 ]\nCode: '00'" }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold' } },
        { id: 'h_b', position: { x: 220, y: 230 }, data: { label: "Char 'C' [ 25 ]\nCode: '01'" }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold' } }
      ];
      const edges: Edge[] = [
        { id: 'e_hr_l', source: 'h_root', target: 'h_left', label: '0', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_hr_c', source: 'h_root', target: 'h_c', label: '1', style: { stroke: '#34d399', strokeWidth: 2 } },
        { id: 'e_hl_a', source: 'h_left', target: 'h_a', label: '0', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_hl_b', source: 'h_left', target: 'h_b', label: '1', style: { stroke: '#38bdf8', strokeWidth: 2 } }
      ];
      return { nodes, edges };
    }
  },

  // 19. FRACTIONAL KNAPSACK
  fractional_knapsack: {
    title: 'Fractional Knapsack (Greedy Ratio Sorting)',
    category: 'Greedy Algorithms',
    timeComp: 'O(N log N)',
    spaceComp: 'O(1)',
    availableDs: [
      { id: 'ratio_sorted', label: 'Sorted Density Ratio Cards', description: 'Greedy selection by Value / Weight ratio' }
    ],
    steps: [
      {
        step: 0,
        title: 'Sort Items by Value/Weight Ratio (v/w)',
        explanation: 'Calculate densities: I₁(10kg, $60, v/w=6.0), I₂(20kg, $100, v/w=5.0), I₃(30kg, $120, v/w=4.0). Knapsack Capacity W=50kg.',
        memoryState: { type: 'Sorted Ratios', items: ['I₁: 6.0 $/kg', 'I₂: 5.0 $/kg', 'I₃: 4.0 $/kg'], pointers: { cap: '50kg' } },
        pseudoCode: 'items.sort(key=lambda x: x.val / x.wt, reverse=True);',
        activeNodeIds: ['fk_st0'],
        activeEdgeIds: []
      },
      {
        step: 1,
        title: 'Greedily Take 100% of Item 1 (v/w = 6.0)',
        explanation: 'Take all 10kg of I₁. Value gained = $60. Remaining capacity = 50 - 10 = 40kg.',
        memoryState: { type: 'Greedy Step 1', items: ['Take I₁: 10kg ($60)', 'Remaining: 40kg'], pointers: { val: '$60' } },
        pseudoCode: 'take(I1, 1.0); rem_cap -= 10; total_val += 60;',
        activeNodeIds: ['fk_st1'],
        activeEdgeIds: ['e_fk_1']
      },
      {
        step: 2,
        title: 'Greedily Take 100% of Item 2 (v/w = 5.0)',
        explanation: 'Take all 20kg of I₂. Value gained = $100. Remaining capacity = 40 - 20 = 20kg. Total value = $160.',
        memoryState: { type: 'Greedy Step 2', items: ['Take I₂: 20kg ($100)', 'Remaining: 20kg'], pointers: { val: '$160' } },
        pseudoCode: 'take(I2, 1.0); rem_cap -= 20; total_val += 100;',
        activeNodeIds: ['fk_st2'],
        activeEdgeIds: ['e_fk_2']
      },
      {
        step: 3,
        title: 'Take 20/30 Fraction (66.7%) of Item 3 (v/w = 4.0)',
        explanation: 'Knapsack has 20kg left. Take 20/30 of I₃. Added value = 20 × 4.0 = $80. Knapsack is full (50/50kg)!',
        memoryState: { type: 'Greedy Step 3', items: ['Take 2/3 of I₃ ($80)', 'Knapsack: 50/50kg (FULL)'], pointers: { val: '$240' } },
        pseudoCode: 'fraction = rem_cap / I3.wt; // 20/30\ntotal_val += fraction * I3.val; // +80',
        activeNodeIds: ['fk_st3'],
        activeEdgeIds: ['e_fk_3']
      },
      {
        step: 4,
        title: 'Global Maximum Profit Reached: Total Value = $240',
        explanation: 'Greedy choice property guarantees global optimality for Fractional Knapsack in O(N log N) time.',
        memoryState: { type: 'Greedy Optimum', items: ['Optimal Value: $240', 'Complexity: O(N log N)'], pointers: { status: 'GLOBAL_OPTIMUM' } },
        pseudoCode: 'return total_val; // 240 (Optimal)',
        activeNodeIds: ['fk_st4'],
        activeEdgeIds: ['e_fk_4'],
        successNodeIds: ['fk_st4']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'fk_st0', position: { x: 40, y: 40 }, data: { label: 'Step 0: Knapsack Cap W=50kg | Ratios: I₁(6.0) > I₂(5.0) > I₃(4.0)' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '6px', padding: '6px 12px', width: 400 } },
        { id: 'fk_st1', position: { x: 40, y: 100 }, data: { label: 'Step 1: Take 100% of I₁ (10kg) -> Val: $60  |  Rem: 40kg' }, style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', padding: '6px 12px', width: 400 } },
        { id: 'fk_st2', position: { x: 40, y: 160 }, data: { label: 'Step 2: Take 100% of I₂ (20kg) -> Val: $160 | Rem: 20kg' }, style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', padding: '6px 12px', width: 400 } },
        { id: 'fk_st3', position: { x: 40, y: 220 }, data: { label: 'Step 3: Take 2/3 of I₃ (20kg)   -> Val: $240 | Knapsack FULL' }, style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', padding: '6px 12px', width: 400 } },
        { id: 'fk_st4', position: { x: 40, y: 280 }, data: { label: '🏆 GREEDY OPTIMAL SOLUTION: Maximum Profit = $240\nFractional Knapsack Solved Globally in O(N log N)' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', width: 400, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_fk_1', source: 'fk_st0', target: 'fk_st1', style: { stroke: '#38bdf8', strokeWidth: 1.8 } },
        { id: 'e_fk_2', source: 'fk_st1', target: 'fk_st2', style: { stroke: '#38bdf8', strokeWidth: 1.8 } },
        { id: 'e_fk_3', source: 'fk_st2', target: 'fk_st3', style: { stroke: '#38bdf8', strokeWidth: 1.8 } },
        { id: 'e_fk_4', source: 'fk_st3', target: 'fk_st4', style: { stroke: '#34d399', strokeWidth: 2.2 } }
      ];
      return { nodes, edges };
    }
  },

  // 20. N-QUEENS BACKTRACKING
  n_queens_backtracking: {
    title: 'N-Queens (Backtracking & Conflict Pruning)',
    category: 'Backtracking',
    timeComp: 'O(N!)',
    spaceComp: 'O(N)',
    availableDs: [
      { id: 'board_4x4', label: '4×4 Chessboard Matrix', description: 'Interactive board with conflict rays' }
    ],
    steps: [
      {
        step: 0,
        title: 'Row 0: Place Queen at Column 0 -> Try (0, 0)',
        explanation: 'Place Queen Q0 at (0, 0). Advance recursion to Row 1.',
        memoryState: { type: 'Board Placement', items: ['Q0 at (0,0)', 'Row: 0 -> 1'], pointers: { row: '0' } },
        pseudoCode: 'def solve(row):\n  if row == N: return True;\n  for col in 0..N-1: place(row, col);',
        activeNodeIds: ['nq_root', 'nq_r0c0'],
        activeEdgeIds: ['e_nq_try0']
      },
      {
        step: 1,
        title: 'Row 1 Conflicts -> PRUNE & BACKTRACK to Row 0!',
        explanation: 'Column conflict at (1,0) (same column) and Diagonal conflict at (1,1). Prune both branches and backtrack to Row 0!',
        memoryState: { type: 'Backtrack Prune', items: ['Conflict (1,0)', 'Conflict (1,1)', 'ROLLBACK Q0'], pointers: { status: 'PRUNED' } },
        pseudoCode: 'if not is_safe(row, col):\n  prune_branch(); // Backtrack',
        activeNodeIds: ['nq_bad1', 'nq_bad2'],
        activeEdgeIds: ['e_nq_b1', 'e_nq_b2'],
        conflictNodeIds: ['nq_bad1', 'nq_bad2']
      },
      {
        step: 2,
        title: 'Advance Q0 to Column 1 -> VALID SOLUTION FOUND!',
        explanation: 'Place Q0 at (0,1). Safe valid placements: Q1 at (1,3), Q2 at (2,0), Q3 at (3,2). Non-attacking 4-Queens solution achieved!',
        memoryState: { type: 'Valid Solution', items: ['[(0,1), (1,3), (2,0), (3,2)]', 'Non-Attacking'], pointers: { status: 'SAFE_SOLUTION' } },
        pseudoCode: 'board = [1, 3, 0, 2]; // Complete 4-Queens Solution',
        activeNodeIds: ['nq_r0c1', 'nq_sol'],
        activeEdgeIds: ['e_nq_r0c1', 'e_nq_sol'],
        successNodeIds: ['nq_sol']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'nq_root', position: { x: 240, y: 35 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Start: 4×4 Empty Board\n(Row 0 Queen Decision)' }, style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #475569', borderRadius: '8px', padding: '6px 12px', width: 170, textAlign: 'center' } },
        { id: 'nq_r0c0', position: { x: 110, y: 115 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Try Q0 at (0, 0)' }, style: { background: '#0284c7', color: '#fff', border: '2px solid #38bdf8', borderRadius: '8px', padding: '6px 12px', width: 130, textAlign: 'center' } },
        { id: 'nq_bad1', position: { x: 30, y: 200 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: '💥 Conflict (1,0)\nSame Col Conflict' }, style: { background: '#7f1d1d', color: '#fca5a5', border: '2px solid #ef4444', borderRadius: '8px', padding: '6px 10px', width: 130, textAlign: 'center' } },
        { id: 'nq_bad2', position: { x: 180, y: 200 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: '💥 Conflict (1,1)\nDiagonal Conflict' }, style: { background: '#7f1d1d', color: '#fca5a5', border: '2px solid #ef4444', borderRadius: '8px', padding: '6px 10px', width: 130, textAlign: 'center' } },
        { id: 'nq_r0c1', position: { x: 360, y: 115 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Backtrack -> Try Q0 at (0, 1)' }, style: { background: '#1e293b', color: '#38bdf8', border: '2px solid #38bdf8', borderRadius: '8px', padding: '6px 12px', width: 160, textAlign: 'center' } },
        { id: 'nq_sol', position: { x: 90, y: 290 }, sourcePosition: Position.Top, targetPosition: Position.Top, data: { label: '🏆 NON-ATTACKING 4-QUEENS SOLUTION FOUND!\nQueens at [(0,1), (1,3), (2,0), (3,2)]' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '10px', padding: '10px 18px', fontWeight: 'bold', width: 420, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_nq_try0', source: 'nq_root', target: 'nq_r0c0', label: 'Try (0,0)', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_nq_b1', source: 'nq_r0c0', target: 'nq_bad1', label: 'Col Attack', style: { stroke: '#ef4444', strokeWidth: 2 } },
        { id: 'e_nq_b2', source: 'nq_r0c0', target: 'nq_bad2', label: 'Diag Attack', style: { stroke: '#ef4444', strokeWidth: 2 } },
        { id: 'e_nq_r0c1', source: 'nq_root', target: 'nq_r0c1', label: 'Try (0,1)', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_nq_sol', source: 'nq_r0c1', target: 'nq_sol', type: 'smoothstep', label: 'Valid Path', style: { stroke: '#34d399', strokeWidth: 2.5 } }
      ];
      return { nodes, edges };
    }
  },

  // 21. SUBSET SUM BACKTRACKING
  subset_sum_backtracking: {
    title: 'Subset Sum (Decision Branching)',
    category: 'Backtracking',
    timeComp: 'O(2^N)',
    spaceComp: 'O(N)',
    availableDs: [
      { id: 'decision_tree', label: 'Binary Decision Tree (Include/Exclude)', description: 'Include vs Exclude state branch tree' }
    ],
    steps: [
      {
        step: 0,
        title: 'Include 3 -> Include 4 -> Sum = 7. Target = 9',
        explanation: 'Branch left (Include element) or right (Exclude element). Running sum = 3 + 4 = 7 < 9.',
        memoryState: { type: 'Subset', items: ['Current: {3, 4}', 'Sum: 7', 'Target: 9'], pointers: { status: 'EXPANDING' } },
        pseudoCode: 'solve(idx + 1, current_sum + arr[idx]); // Include',
        activeNodeIds: ['ss_root', 'ss_inc3', 'ss_inc4'],
        activeEdgeIds: ['e_ss_1', 'e_ss_2']
      },
      {
        step: 1,
        title: 'Include 2 -> Exact Target Sum 9 Found: {3, 4, 2}!',
        explanation: 'Include 2: 7 + 2 = 9 == Target! Valid subset found. Branch with 7 would exceed 9 (pruned).',
        memoryState: { type: 'Valid Subset', items: ['{3, 4, 2}', 'Sum: 9 (MATCH)'], pointers: { status: 'MATCH' } },
        pseudoCode: 'if current_sum == target: return subset; // {3, 4, 2}',
        activeNodeIds: ['ss_inc2', 'ss_exc2', 'ss_sol'],
        activeEdgeIds: ['e_ss_3', 'e_ss_4', 'e_ss_sol'],
        successNodeIds: ['ss_sol'],
        conflictNodeIds: ['ss_exc2']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'ss_root', position: { x: 200, y: 35 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Input Set: { 3, 4, 2, 7 } | Target = 9' }, style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #475569', borderRadius: '8px', padding: '6px 12px', width: 220, textAlign: 'center' } },
        { id: 'ss_inc3', position: { x: 110, y: 110 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Include 3 -> Sum = 3' }, style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '8px', padding: '6px 12px', width: 160, textAlign: 'center' } },
        { id: 'ss_inc4', position: { x: 110, y: 185 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Include 4 -> Sum = 3+4 = 7' }, style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '8px', padding: '6px 12px', width: 170, textAlign: 'center' } },
        { id: 'ss_inc2', position: { x: 40, y: 265 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Include 2 -> Sum = 7+2 = 9 (★)' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '6px 12px', width: 180, textAlign: 'center', fontWeight: 'bold' } },
        { id: 'ss_exc2', position: { x: 245, y: 265 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Try 7 -> Sum = 7+7 = 14 > 9\n(Prune ❌)' }, style: { background: '#7f1d1d', color: '#fca5a5', border: '2px solid #ef4444', borderRadius: '8px', padding: '6px 10px', width: 180, textAlign: 'center' } },
        { id: 'ss_sol', position: { x: 60, y: 345 }, sourcePosition: Position.Top, targetPosition: Position.Top, data: { label: '🏆 EXACT TARGET SUM FOUND: { 3, 4, 2 } (Sum = 9)' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '10px', padding: '10px 18px', fontWeight: 'bold', width: 380, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_ss_1', source: 'ss_root', target: 'ss_inc3', label: '+3', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_ss_2', source: 'ss_inc3', target: 'ss_inc4', label: '+4', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_ss_3', source: 'ss_inc4', target: 'ss_inc2', label: '+2 (Match)', style: { stroke: '#34d399', strokeWidth: 2.5 } },
        { id: 'e_ss_4', source: 'ss_inc4', target: 'ss_exc2', label: '+7 (> 9)', style: { stroke: '#ef4444', strokeWidth: 1.8 } },
        { id: 'e_ss_sol', source: 'ss_inc2', target: 'ss_sol', type: 'smoothstep', label: 'Output Subset', style: { stroke: '#34d399', strokeWidth: 2.5 } }
      ];
      return { nodes, edges };
    }
  },

  // 22. HASHING WITH SEPARATE CHAINING
  hashing_chaining: {
    title: 'Hashing with Separate Chaining',
    category: 'Hashing & Hash Tables',
    timeComp: 'O(1) avg',
    spaceComp: 'O(N)',
    availableDs: [
      { id: 'hash_bucket', label: 'Bucket Chaining Array', description: 'Array of linked lists resolving collisions' }
    ],
    steps: [
      {
        step: 0,
        title: 'Insert Key 10: h(10) = 10 % 7 = Slot 3',
        explanation: 'Compute hash index 10 % 7 = 3. Prepend node [10] to Bucket 3.',
        memoryState: { type: 'Hash Table', items: ['Slot 3: [10]'], pointers: { key: '10' } },
        pseudoCode: 'idx = key % TableSize; table[idx].append(key);',
        activeNodeIds: ['h_slot3', 'h_k10'],
        activeEdgeIds: ['e_h3_10']
      },
      {
        step: 1,
        title: 'Insert Key 17: h(17) = 17 % 7 = Slot 3 (COLLISION)',
        explanation: 'Slot 3 already contains 10. Resolve collision by appending 17 to the linked bucket chain: Slot 3 -> [10] -> [17].',
        memoryState: { type: 'Chaining Chain', items: ['Slot 3: [10] -> [17]'], pointers: { collision: 'RESOLVED' } },
        pseudoCode: 'table[3].append(17); // Collision chained in O(1)',
        activeNodeIds: ['h_k17'],
        activeEdgeIds: ['e_h10_17'],
        successNodeIds: ['h_k17']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'h_slot3', position: { x: 40, y: 100 }, sourcePosition: Position.Right, targetPosition: Position.Left, data: { label: 'Bucket [ 3 ]' }, style: { background: '#0284c7', color: '#fff', border: '2px solid #38bdf8', borderRadius: '6px', padding: '8px 14px', fontWeight: 'bold' } },
        { id: 'h_k10', position: { x: 220, y: 100 }, sourcePosition: Position.Right, targetPosition: Position.Left, data: { label: '-> [ Key: 10 ]' }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #64748b', borderRadius: '6px', padding: '8px 12px' } },
        { id: 'h_k17', position: { x: 400, y: 100 }, sourcePosition: Position.Right, targetPosition: Position.Left, data: { label: '-> [ Key: 17 ] (Chained)' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '6px', padding: '8px 12px', fontWeight: 'bold' } }
      ];
      const edges: Edge[] = [
        { id: 'e_h3_10', source: 'h_slot3', target: 'h_k10', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_h10_17', source: 'h_k10', target: 'h_k17', style: { stroke: '#34d399', strokeWidth: 2 } }
      ];
      return { nodes, edges };
    }
  },

  // 23. HASHING WITH OPEN ADDRESSING (LINEAR PROBING)
  hashing_probing: {
    title: 'Hashing with Open Addressing (Linear Probing)',
    category: 'Hashing & Hash Tables',
    timeComp: 'O(1) avg',
    spaceComp: 'O(N)',
    availableDs: [
      { id: 'linear_probe', label: 'Open Addressing Slots', description: 'Sequential linear probing in fixed array slots' }
    ],
    steps: [
      {
        step: 0,
        title: 'Insert Key 10 at h(10, 0) = (10 + 0) % 7 = Slot 3',
        explanation: 'Slot 3 is empty. Store 10 directly in Slot 3.',
        memoryState: { type: 'Array Slots', items: ['Slot 3: [10]'], pointers: { probe: '0' } },
        pseudoCode: 'h(k, i) = (k + i) % M; table[3] = 10;',
        activeNodeIds: ['probe_key', 'slot_3'],
        activeEdgeIds: ['e_probe_1']
      },
      {
        step: 1,
        title: 'Insert Key 17: Collision at Slot 3 -> Probe Slot 4 -> Placed!',
        explanation: 'i=0: Slot 3 occupied with 10! i=1: Probe (17 + 1) % 7 = Slot 4 (Empty). Store 17 in Slot 4.',
        memoryState: { type: 'Linear Probe', items: ['Probe i=0: Occupied', 'Probe i=1: Slot 4 Filled with 17'], pointers: { status: 'PLACED' } },
        pseudoCode: 'i = 1;\nidx = (17 + 1) % 7; // Slot 4',
        activeNodeIds: ['slot_3', 'slot_4', 'probe_res'],
        activeEdgeIds: ['e_probe_2', 'e_probe_3'],
        successNodeIds: ['slot_4', 'probe_res']
      }
    ],
    buildGraph: () => {
      const nodes: Node[] = [
        { id: 'slot_0', position: { x: 30, y: 70 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Slot 0\n[ Empty ]' }, style: { background: '#0f172a', color: '#64748b', border: '1px solid #334155', borderRadius: '6px', padding: '6px', width: 60, textAlign: 'center' } },
        { id: 'slot_1', position: { x: 95, y: 70 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Slot 1\n[ Empty ]' }, style: { background: '#0f172a', color: '#64748b', border: '1px solid #334155', borderRadius: '6px', padding: '6px', width: 60, textAlign: 'center' } },
        { id: 'slot_2', position: { x: 160, y: 70 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Slot 2\n[ Empty ]' }, style: { background: '#0f172a', color: '#64748b', border: '1px solid #334155', borderRadius: '6px', padding: '6px', width: 60, textAlign: 'center' } },
        { id: 'slot_3', position: { x: 225, y: 70 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Slot 3\n[ 10 ]' }, style: { background: '#0284c7', color: '#fff', border: '2px solid #38bdf8', borderRadius: '6px', padding: '6px', width: 65, textAlign: 'center', fontWeight: 'bold' } },
        { id: 'slot_4', position: { x: 295, y: 70 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Slot 4\n[ 17 (★) ]' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '6px', padding: '6px', width: 75, textAlign: 'center', fontWeight: 'bold' } },
        { id: 'slot_5', position: { x: 375, y: 70 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Slot 5\n[ Empty ]' }, style: { background: '#0f172a', color: '#64748b', border: '1px solid #334155', borderRadius: '6px', padding: '6px', width: 60, textAlign: 'center' } },
        { id: 'slot_6', position: { x: 440, y: 70 }, sourcePosition: Position.Bottom, targetPosition: Position.Top, data: { label: 'Slot 6\n[ Empty ]' }, style: { background: '#0f172a', color: '#64748b', border: '1px solid #334155', borderRadius: '6px', padding: '6px', width: 60, textAlign: 'center' } },

        // Key Insertion Query & Resolution Cards
        { id: 'probe_key', position: { x: 120, y: 170 }, sourcePosition: Position.Top, targetPosition: Position.Bottom, data: { label: '🔑 Insert Key 17 | Hash h(17, 0) = 17 % 7 = Slot 3' }, style: { background: '#1e293b', color: '#fbbf24', border: '2px solid #f59e0b', borderRadius: '8px', padding: '6px 12px', width: 300, textAlign: 'center' } },
        { id: 'probe_res', position: { x: 60, y: 260 }, sourcePosition: Position.Top, targetPosition: Position.Bottom, data: { label: '🏆 Collision at Slot 3 -> Linear Probe i=1: (17+1)%7 = Slot 4 (Empty -> Insert 17!)' }, style: { background: '#047857', color: '#fff', border: '2px solid #34d399', borderRadius: '8px', padding: '10px 16px', fontWeight: 'bold', width: 420, textAlign: 'center' } }
      ];
      const edges: Edge[] = [
        { id: 'e_probe_1', source: 'probe_key', target: 'slot_3', label: 'Probe 0 (Collision ❌)', style: { stroke: '#ef4444', strokeWidth: 2 } },
        { id: 'e_probe_2', source: 'slot_3', target: 'slot_4', label: 'Linear Step +1', style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e_probe_3', source: 'slot_4', target: 'probe_res', type: 'smoothstep', label: 'Placed in Slot 4 ✅', style: { stroke: '#34d399', strokeWidth: 2.5 } }
      ];
      return { nodes, edges };
    }
  }
};

// ────────────────────────────────────────────────────────────────────────────
// AUTOMATIC VIEWPORT FITTER ON MOBILE & PRESET SWITCH
// ────────────────────────────────────────────────────────────────────────────
const FlowAutoFitter: React.FC<{ activePreset: string; stepIndex: number; mobileTab: string }> = ({
  activePreset,
  stepIndex,
  mobileTab
}) => {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.25, duration: 250 });
    }, 60);
    return () => clearTimeout(timer);
  }, [activePreset, stepIndex, mobileTab, fitView]);

  return null;
};

// ────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────────────────────
export const AlgorithmicLabModule: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<AlgorithmPreset>('graph_bfs');
  const [selectedDsRepresentation, setSelectedDsRepresentation] = useState<string>('spanning_tree');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(0);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentPresetDef = useMemo(() => {
    return ALGORITHM_REGISTRY[selectedPreset] || ALGORITHM_REGISTRY.graph_bfs;
  }, [selectedPreset]);

  // Generate Base Raw Graph
  const rawGraph = useMemo(() => {
    return currentPresetDef.buildGraph(selectedDsRepresentation, currentStepIndex);
  }, [currentPresetDef, selectedDsRepresentation, currentStepIndex]);

  // Compute Live Styled Nodes and Edges based on Current Step
  const { styledNodes, styledEdges } = useMemo(() => {
    const activeStep = currentPresetDef.steps[currentStepIndex] || currentPresetDef.steps[0];
    const activeNodeSet = new Set(activeStep?.activeNodeIds || []);
    const activeEdgeSet = new Set(activeStep?.activeEdgeIds || []);
    const conflictNodeSet = new Set(activeStep?.conflictNodeIds || []);
    const successNodeSet = new Set(activeStep?.successNodeIds || []);

    const styledNodesList = rawGraph.nodes.map(n => {
      const isActive = activeNodeSet.has(n.id);
      const isConflict = conflictNodeSet.has(n.id);
      const isSuccess = successNodeSet.has(n.id);

      const baseStyle = (n.style || {}) as React.CSSProperties;

      if (isConflict) {
        return {
          ...n,
          style: {
            ...baseStyle,
            background: '#7f1d1d',
            border: '3px solid #ef4444',
            boxShadow: '0 0 24px rgba(239, 68, 68, 0.95), 0 0 10px rgba(239, 68, 68, 0.5)',
            color: '#fecaca',
            transition: 'all 0.3s ease'
          }
        };
      }

      if (isSuccess) {
        return {
          ...n,
          style: {
            ...baseStyle,
            background: '#047857',
            border: '3px solid #34d399',
            boxShadow: '0 0 26px rgba(52, 211, 153, 0.95), 0 0 12px rgba(52, 211, 153, 0.5)',
            color: '#ffffff',
            transition: 'all 0.3s ease'
          }
        };
      }

      if (isActive) {
        return {
          ...n,
          style: {
            ...baseStyle,
            background: '#0284c7',
            border: '3px solid #38bdf8',
            boxShadow: '0 0 24px rgba(56, 189, 248, 0.95), inset 0 0 10px rgba(56, 189, 248, 0.4)',
            color: '#ffffff',
            transition: 'all 0.3s ease'
          }
        };
      }

      return {
        ...n,
        style: {
          ...baseStyle,
          transition: 'all 0.3s ease'
        }
      };
    });

    const styledEdgesList = rawGraph.edges.map(e => {
      const isActive = activeEdgeSet.has(e.id);
      if (isActive) {
        return {
          ...e,
          animated: true,
          style: {
            stroke: '#38bdf8',
            strokeWidth: 3.5,
            filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.9))'
          }
        };
      }
      return {
        ...e,
        animated: false,
        style: {
          stroke: '#475569',
          strokeWidth: 1.8
        }
      };
    });

    return { styledNodes: styledNodesList, styledEdges: styledEdgesList };
  }, [rawGraph, currentPresetDef, currentStepIndex]);

  const [nodes, setNodes, onNodesChange] = useNodesState(styledNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(styledEdges);
  const [mobileActiveTab, setMobileActiveTab] = useState<'canvas' | 'log'>('canvas');

  // Synchronize internal React Flow state on change
  useEffect(() => {
    setNodes(styledNodes);
    setEdges(styledEdges);
  }, [styledNodes, styledEdges, setNodes, setEdges]);

  // When changing algorithm preset, reset step and pick first available DS
  const handleSelectPreset = (preset: AlgorithmPreset) => {
    setSelectedPreset(preset);
    const def = ALGORITHM_REGISTRY[preset];
    if (def && def.availableDs.length > 0) {
      setSelectedDsRepresentation(def.availableDs[0].id);
    }
    setCurrentStepIndex(0);
    setExpandedStepIndex(0);
    setIsPlaying(false);
  };

  // Step Forward
  const stepForward = useCallback(() => {
    if (currentStepIndex < currentPresetDef.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setExpandedStepIndex(nextIdx);
    }
  }, [currentStepIndex, currentPresetDef.steps.length]);

  // Step Backward
  const stepBackward = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      setExpandedStepIndex(prevIdx);
    }
  }, [currentStepIndex]);

  // Auto-Play Timer
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= currentPresetDef.steps.length - 1) {
            setIsPlaying(false);
            if (playTimerRef.current) clearInterval(playTimerRef.current);
            return prev;
          }
          const next = prev + 1;
          setExpandedStepIndex(next);
          return next;
        });
      }, 1600);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, currentPresetDef.steps.length]);

  const toggleAutoPlay = () => setIsPlaying(prev => !prev);

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setExpandedStepIndex(0);
  };

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <ReactFlowProvider>
      <div className="flowlab-container">
        {/* ─── Top Control Bar: Algorithm Preset Select + DS Switcher + Stepping Controls ─── */}
        <div
          className="flowlab-control-bar dsa-header-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            padding: '10px 14px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(51, 65, 85, 0.7)',
            borderRadius: '14px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            flexWrap: 'wrap',
            minWidth: 0,
            maxWidth: '100%'
          }}
        >
          {/* Left: Algorithm Preset Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: '1 1 260px', minWidth: 0, maxWidth: '100%' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
              ALGORITHM:
            </span>
            <select
              value={selectedPreset}
              onChange={(e) => handleSelectPreset(e.target.value as AlgorithmPreset)}
              className="flowlab-preset-select dsa-select-control"
              style={{
                minHeight: '36px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(30, 41, 59, 0.95)',
                border: '1.5px solid rgba(56, 189, 248, 0.5)',
                color: '#f8fafc',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)',
                minWidth: 0,
                width: '100%'
              }}
            >
              <optgroup label="🕸️ Graph Algorithms">
                <option value="graph_bfs">🔵 Breadth-First Search (BFS)</option>
                <option value="graph_dfs">🟣 Depth-First Search (DFS)</option>
                <option value="graph_dijkstra">🟡 Dijkstra Shortest Path</option>
                <option value="topological_sort">🧭 Topological Sort</option>
              </optgroup>
              <optgroup label="🔍 Searching & Pattern Matching">
                <option value="binary_search">⚡ Binary Search</option>
                <option value="linear_search">➡️ Linear Search</option>
                <option value="brute_force_search">🔤 Brute Force String Match</option>
                <option value="kmp_string_match">🎯 KMP Pattern Match</option>
              </optgroup>
              <optgroup label="📊 Sorting & Divide and Conquer">
                <option value="merge_sort">📊 Merge Sort</option>
                <option value="quick_sort">⚡ Quick Sort</option>
                <option value="randomized_quicksort">🎲 Randomized QuickSort</option>
                <option value="bubble_sort">🫧 Bubble Sort</option>
                <option value="insertion_sort">📥 Insertion Sort</option>
                <option value="heap_sort">🔺 Heap Sort</option>
              </optgroup>
              <optgroup label="🎒 Dynamic Programming">
                <option value="knapsack_dp">🎒 0/1 Knapsack DP</option>
                <option value="lcs_dp">🧬 Longest Common Subsequence</option>
                <option value="matrix_chain_dp">⛓️ Matrix Chain Multiplication</option>
              </optgroup>
              <optgroup label="🌿 Greedy Algorithms">
                <option value="huffman_coding">🌲 Huffman Coding</option>
                <option value="fractional_knapsack">⚖️ Fractional Knapsack</option>
              </optgroup>
              <optgroup label="👑 Backtracking">
                <option value="n_queens_backtracking">👑 N-Queens Backtracking</option>
                <option value="subset_sum_backtracking">➕ Subset Sum</option>
              </optgroup>
              <optgroup label="🔑 Hashing & Hash Tables">
                <option value="hashing_chaining">🔗 Separate Chaining</option>
                <option value="hashing_probing">📍 Open Addressing</option>
              </optgroup>
            </select>

            {/* Dynamic Underlying Data Structure Selector */}
            {currentPresetDef.availableDs.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', padding: '2px 0', maxWidth: '100%' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, flexShrink: 0 }}>
                  DS:
                </span>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {currentPresetDef.availableDs.map(ds => (
                    <button
                      key={ds.id}
                      type="button"
                      onClick={() => setSelectedDsRepresentation(ds.id)}
                      title={ds.description}
                      style={{
                        minHeight: '30px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: selectedDsRepresentation === ds.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                        border: selectedDsRepresentation === ds.id ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)',
                        color: selectedDsRepresentation === ds.id ? '#38bdf8' : '#94a3b8',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {ds.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Stepping Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={stepBackward}
              disabled={currentStepIndex === 0 || isPlaying}
              className="dsa-action-btn"
              style={{
                background: currentStepIndex === 0 ? 'rgba(30, 41, 59, 0.4)' : 'rgba(30, 41, 59, 0.85)',
                border: '1px solid rgba(51, 65, 85, 0.8)',
                color: currentStepIndex === 0 ? '#64748b' : '#cbd5e1',
                cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer'
              }}
              title="Previous Step"
            >
              <SkipBack size={14} />
              <span className="dsa-btn-label">Prev</span>
            </button>

            <button
              type="button"
              onClick={stepForward}
              disabled={currentStepIndex >= currentPresetDef.steps.length - 1 || isPlaying}
              className="dsa-action-btn"
              style={{
                background: currentStepIndex >= currentPresetDef.steps.length - 1 ? 'rgba(30, 41, 59, 0.4)' : 'rgba(2, 132, 199, 0.2)',
                border: '1px solid #0284c7',
                color: currentStepIndex >= currentPresetDef.steps.length - 1 ? '#64748b' : '#38bdf8',
                cursor: currentStepIndex >= currentPresetDef.steps.length - 1 ? 'not-allowed' : 'pointer'
              }}
              title="Next Step"
            >
              <span className="dsa-btn-label">Next</span>
              <SkipForward size={14} />
            </button>

            <button
              type="button"
              onClick={toggleAutoPlay}
              className="dsa-action-btn"
              style={{
                background: isPlaying ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #0284c7, #06b6d4)',
                border: 'none',
                color: '#ffffff',
                boxShadow: isPlaying ? '0 0 12px rgba(245, 158, 11, 0.3)' : '0 0 12px rgba(6, 182, 212, 0.3)'
              }}
              title={isPlaying ? 'Pause Auto-Play' : 'Start Auto-Play'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span className="dsa-btn-label">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={resetSimulation}
              className="dsa-action-btn"
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(51, 65, 85, 0.8)',
                color: '#94a3b8'
              }}
              title="Reset Simulation"
            >
              <RotateCcw size={14} />
              <span className="dsa-btn-label">Reset</span>
            </button>
          </div>
        </div>

        {/* Mobile Dual-View Switcher (Only visible on screens <= 1024px) */}
        <div className="flowlab-mobile-tab-nav">
          <button
            type="button"
            onClick={() => {
              setMobileActiveTab('canvas');
              setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
            }}
            className={`flowlab-mobile-tab-btn ${mobileActiveTab === 'canvas' ? 'active' : ''}`}
          >
            <Sparkles size={15} />
            <span>Graph Flow Canvas</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveTab('log')}
            className={`flowlab-mobile-tab-btn ${mobileActiveTab === 'log' ? 'active' : ''}`}
          >
            <Info size={15} />
            <span>Execution Log & Memory</span>
          </button>
        </div>

        {/* ─── Main Grid: Left React Flow Viewport + Right Execution Log ─── */}
        <div className="flowlab-main-grid">
          {/* Left Interactive React Flow Viewport */}
          <div className={`flowlab-canvas-panel ${mobileActiveTab === 'canvas' ? 'mobile-active' : 'mobile-hidden'}`}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              fitViewOptions={{ padding: 0.25 }}
              defaultEdgeOptions={{ type: 'smoothstep' }}
              attributionPosition="bottom-right"
            >
              <FlowAutoFitter activePreset={selectedPreset} stepIndex={currentStepIndex} mobileTab={mobileActiveTab} />
              <Background color="#1e293b" gap={20} size={1.5} variant={BackgroundVariant.Dots} />
              <Controls
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  overflow: 'hidden'
                }}
              />
              <MiniMap
                nodeColor="#38bdf8"
                maskColor="rgba(15, 23, 42, 0.85)"
                style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
              />
              <Panel position="top-left">
                <div
                  style={{
                    padding: '8px 14px',
                    background: 'rgba(15, 23, 42, 0.92)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '10px',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                    fontSize: '0.74rem',
                    color: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={14} color="#38bdf8" />
                  <span style={{ fontWeight: 800, color: '#38bdf8' }}>{currentPresetDef.title}</span>
                  <span style={{ color: '#64748b' }}>•</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Step {currentStepIndex + 1}/{currentPresetDef.steps.length}</span>
                </div>
              </Panel>
            </ReactFlow>
          </div>

          {/* Right Algorithm Execution Log & Telemetry Panel */}
          <div className={`flowlab-log-panel ${mobileActiveTab === 'log' ? 'mobile-active' : 'mobile-hidden'}`}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(51, 65, 85, 0.6)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={15} color="#38bdf8" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                  DSA Execution Log & Memory State
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#38bdf8',
                  background: 'rgba(2, 132, 199, 0.2)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.4)'
                }}
              >
                STEP {currentStepIndex + 1} / {currentPresetDef.steps.length}
              </span>
            </div>

            {/* Scrollable Step Cards */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentPresetDef.steps.map((st, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isExpanded = expandedStepIndex === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      setExpandedStepIndex(isExpanded ? null : idx);
                    }}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: isCurrent ? 'rgba(2, 132, 199, 0.15)' : 'rgba(30, 41, 59, 0.6)',
                      border: isCurrent ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isCurrent ? (
                          <CircleDot size={14} color="#38bdf8" />
                        ) : idx < currentStepIndex ? (
                          <CheckCircle2 size={14} color="#34d399" />
                        ) : (
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }} />
                        )}
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isCurrent ? '#38bdf8' : '#e2e8f0' }}>
                          Step {idx + 1}: {st.title}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(51, 65, 85, 0.5)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                          {st.explanation}
                        </p>

                        <div
                          style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(51, 65, 85, 0.7)'
                          }}
                        >
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Database size={12} color="#a855f7" />
                            <span>{st.memoryState.type}:</span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {st.memoryState.items.map((item, itIdx) => (
                              <span
                                key={itIdx}
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: 'rgba(30, 41, 59, 0.9)',
                                  border: '1px solid rgba(168, 85, 247, 0.4)',
                                  fontSize: '0.7rem',
                                  color: '#e2e8f0',
                                  fontFamily: 'monospace'
                                }}
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            background: '#0b1120',
                            border: '1px solid #334155',
                            fontFamily: '"Fira Code", monospace',
                            fontSize: '0.7rem',
                            color: '#34d399',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {st.pseudoCode}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Complexity Telemetry Footer */}
            <div
              style={{
                marginTop: 'auto',
                padding: '8px 10px',
                borderRadius: '8px',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(51, 65, 85, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Time:</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                  {currentPresetDef.timeComp}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Space:</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a855f7', fontFamily: 'monospace' }}>
                  {currentPresetDef.spaceComp}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
};
export default AlgorithmicLabModule;
