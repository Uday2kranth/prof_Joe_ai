export type DsaCategory = 
  | 'sorting'
  | 'searching'
  | 'data_structures'
  | 'graph'
  | 'recursion'
  | 'dp'
  | 'backtracking'
  | 'greedy_strings';

export interface DsaAlgorithmMeta {
  id: string;
  name: string;
  category: DsaCategory;
  tag: string;
  timeComplexityBest: string;
  timeComplexityAverage: string;
  timeComplexityWorst: string;
  spaceComplexity: string;
  description: string;
  mathFormula: string;
  pseudoCode: string;
  pythonCode: string;
  cppCode: string;
  javaCode: string;
}

export interface ArrayBar {
  value: number;
  id: string;
  state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot' | 'active' | 'selected';
  label?: string;
}

export interface StepLog {
  step: number;
  description: string;
  highlightedIndices?: number[];
  type?: 'compare' | 'swap' | 'partition' | 'merge' | 'insert' | 'delete' | 'visit' | 'found' | 'backtrack' | 'sorted' | 'pivot';
}

export interface Node2D {
  id: string;
  label: string;
  x: number;
  y: number;
  state: 'unvisited' | 'visiting' | 'visited' | 'current' | 'target' | 'path' | 'mst';
  dist?: number;
  inDegree?: number;
}

export interface Edge2D {
  u: string;
  v: string;
  weight?: number;
  state: 'default' | 'examining' | 'selected' | 'rejected' | 'mst';
  directed?: boolean;
}
