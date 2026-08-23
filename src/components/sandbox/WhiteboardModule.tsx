import React, { useState, useRef, useEffect, useCallback } from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import {
  PenTool, Sparkles, Download,
  Trash2, Undo, Type, Plus, Wand2, X,
  StickyNote, Copy, Move, Hand, MousePointer,
  Image as ImageIcon, Link2,
  RotateCcw, RotateCw, Shapes,
  Briefcase, Eraser, Lock, Unlock, Zap, Wind
} from 'lucide-react';
import { sendChatMessage } from '../../services/apiService';
import type { UserKeys } from '../../types';

export type ShapeType =
  | 'rect'
  | 'rounded_rect'
  | 'circle'
  | 'oval'
  | 'triangle'
  | 'right_triangle'
  | 'diamond'
  | 'parallelogram'
  | 'trapezoid'
  | 'hexagon'
  | 'cloud'
  | 'callout'
  | 'thought_bubble'
  | 'pill'
  | 'star'
  | 'arrow_block'
  | 'polygon'
  | 'cube'
  | 'cylinder'
  | 'cone'
  | 'coordinate_axes'
  | 'bracket';

export interface WaypointPoint {
  x: number;
  y: number;
}

export interface ChalkboardItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'formula' | 'note' | 'image' | ShapeType;
  name?: string; // Title / Header
  text?: string; // Editable Text inside shape
  latex?: string;
  explanation?: string;
  color?: string; // Theme / Stroke color
  fillColor?: string; // Background fill
  strokeWidth?: number;
  rotation?: number; // In degrees (0 - 360)
  imageUrl?: string;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  fillMode?: 'pastel' | 'solid' | 'none';
  isGlowing?: boolean;
  isSpinning?: boolean;
  isFlipping?: boolean;
  aspectRatioLocked?: boolean;
  cornerRadius?: number;
  polygonEdges?: number;
  locked?: boolean;
  waypointEnd?: { x: number; y: number }; // Legacy Point B
  waypoints?: WaypointPoint[]; // Custom multi-point path [P1, P2, P3, ... Pn]
  patrolSpeed?: number; // Speed multiplier (default 1.0)
  patrolLoop?: boolean; // Loop path or ping-pong bounce (default true)
  vx?: number; // Floating physics velocity X
  vy?: number; // Floating physics velocity Y
  isAnimatingMove?: boolean;
  isFloating?: boolean; // Per-object force-proportional gentle nudge float
  isDrifting?: boolean; // Per-object slow ambient drift motion
  isRepelling?: boolean; // Per-object cursor magnetic repulsion field
  driftPhase?: number; // Phase offset for smooth drift wave
}

export interface ShapeCatalogItem {
  type: ShapeType;
  label: string;
  category: '2d' | 'concept' | '3d';
  icon: string;
  defaultW: number;
  defaultH: number;
  aspectRatioLocked?: boolean;
}

export const ACADEMIC_SHAPES_CATALOG: ShapeCatalogItem[] = [
  // 2D Basics
  { type: 'circle', label: 'Circle (1:1)', category: '2d', icon: '⭕', defaultW: 140, defaultH: 140, aspectRatioLocked: true },
  { type: 'oval', label: 'Oval / Ellipse', category: '2d', icon: '⬭', defaultW: 180, defaultH: 110, aspectRatioLocked: false },
  { type: 'rect', label: 'Rectangle', category: '2d', icon: '▭', defaultW: 180, defaultH: 120 },
  { type: 'rounded_rect', label: 'Rounded Box', category: '2d', icon: '▢', defaultW: 180, defaultH: 120 },
  { type: 'triangle', label: 'Equilateral △', category: '2d', icon: '🔺', defaultW: 150, defaultH: 130 },
  { type: 'right_triangle', label: 'Right △ (90°)', category: '2d', icon: '📐', defaultW: 160, defaultH: 130 },
  { type: 'diamond', label: 'Diamond / Decision', category: '2d', icon: '💎', defaultW: 160, defaultH: 130 },
  { type: 'hexagon', label: 'Hexagon / Benzene', category: '2d', icon: '⬡', defaultW: 150, defaultH: 140 },
  { type: 'parallelogram', label: 'Parallelogram (I/O)', category: '2d', icon: '▱', defaultW: 180, defaultH: 110 },
  { type: 'trapezoid', label: 'Trapezoid', category: '2d', icon: '⏢', defaultW: 180, defaultH: 110 },
  { type: 'star', label: '5-Point Star', category: '2d', icon: '⭐️', defaultW: 150, defaultH: 150 },
  { type: 'polygon', label: 'Parametric N-gon', category: '2d', icon: '⬡', defaultW: 150, defaultH: 150 },

  // Teaching & Conceptual
  { type: 'cloud', label: 'Cloud / Idea', category: 'concept', icon: '☁️', defaultW: 190, defaultH: 120 },
  { type: 'thought_bubble', label: 'Thought Bubble', category: 'concept', icon: '💭', defaultW: 190, defaultH: 130 },
  { type: 'callout', label: 'Speech Callout', category: 'concept', icon: '💬', defaultW: 190, defaultH: 120 },
  { type: 'coordinate_axes', label: 'X-Y Cartesian Axes', category: 'concept', icon: '📈', defaultW: 220, defaultH: 180 },
  { type: 'bracket', label: 'Curly Brackets', category: 'concept', icon: '}', defaultW: 80, defaultH: 180 },
  { type: 'arrow_block', label: 'Block Arrow', category: 'concept', icon: '➔', defaultW: 180, defaultH: 90 },

  // 3D Solids
  { type: 'cube', label: '3D Cube', category: '3d', icon: '🧊', defaultW: 160, defaultH: 160 },
  { type: 'cylinder', label: '3D Cylinder', category: '3d', icon: '🛢️', defaultW: 150, defaultH: 170 },
  { type: 'cone', label: '3D Cone', category: '3d', icon: '🍦', defaultW: 150, defaultH: 170 },
];

export interface RelationshipConnection {
  id: string;
  fromItemId: string;
  fromAnchor: 'top' | 'bottom' | 'left' | 'right';
  toItemId: string;
  toAnchor: 'top' | 'bottom' | 'left' | 'right';
  label?: string;
}

export interface ArchitecturePresetItem {
  relId: string;
  relX: number;
  relY: number;
  width: number;
  height: number;
  type: 'formula' | 'note' | 'image' | ShapeType;
  name?: string;
  text?: string;
  latex?: string;
  explanation?: string;
  color?: string;
}

export interface ArchitecturePreset {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  items: ArchitecturePresetItem[];
  connections: Array<{
    fromRelId: string;
    fromAnchor: 'top' | 'bottom' | 'left' | 'right';
    toRelId: string;
    toAnchor: 'top' | 'bottom' | 'left' | 'right';
    label?: string;
  }>;
}

// 1-Click Teaching Architecture Presets Library
export const ACADEMIC_ARCHITECTURE_PRESETS: ArchitecturePreset[] = [
  {
    id: 'transformer_attention',
    name: 'Transformer Attention & FFN',
    category: 'Deep Learning',
    icon: '⚡',
    description: 'Scaled Dot-Product Attention, Add & Norm, and Feed-Forward Network',
    items: [
      { relId: 'input_emb', relX: 0, relY: 340, width: 220, height: 80, type: 'rect', name: 'Input Embeddings', text: 'X + Positional Encoding', color: '#38bdf8' },
      { relId: 'mha', relX: 0, relY: 220, width: 220, height: 85, type: 'rounded_rect', name: 'Multi-Head Attention', text: 'softmax(QK^T / √d_k)V', color: '#a855f7' },
      { relId: 'norm1', relX: 0, relY: 110, width: 220, height: 75, type: 'rect', name: 'Add & LayerNorm', text: 'Norm(x + Sublayer(x))', color: '#10b981' },
      { relId: 'ffn', relX: 0, relY: 0, width: 220, height: 80, type: 'rounded_rect', name: 'Feed-Forward Network', text: 'max(0, xW₁ + b₁)W₂ + b₂', color: '#f59e0b' },
      { relId: 'mha_formula', relX: 280, relY: 160, width: 360, height: 140, type: 'formula', name: 'Attention Formula', latex: '\\text{MHA}(Q,K,V) = \\text{Concat}(head_i)W^O', explanation: 'Multi-Head Projection Matrix' }
    ],
    connections: [
      { fromRelId: 'input_emb', fromAnchor: 'top', toRelId: 'mha', toAnchor: 'bottom', label: 'Q, K, V' },
      { fromRelId: 'mha', fromAnchor: 'top', toRelId: 'norm1', toAnchor: 'bottom', label: 'Residual' },
      { fromRelId: 'norm1', fromAnchor: 'top', toRelId: 'ffn', toAnchor: 'bottom', label: 'Normalized' },
      { fromRelId: 'mha', fromAnchor: 'right', toRelId: 'mha_formula', toAnchor: 'left', label: 'Defines' }
    ]
  },
  {
    id: 'three_tier_web',
    name: '3-Tier Web & Microservices',
    category: 'System Architecture',
    icon: '🌐',
    description: 'Client App → API Gateway → Microservices Cluster → Database & Cache',
    items: [
      { relId: 'client', relX: 0, relY: 120, width: 170, height: 90, type: 'rect', name: 'Client Device', text: 'React / Mobile App', color: '#38bdf8' },
      { relId: 'gateway', relX: 230, relY: 120, width: 180, height: 90, type: 'rounded_rect', name: 'API Gateway', text: 'Auth, Rate Limit, Proxy', color: '#a855f7' },
      { relId: 'srv_auth', relX: 470, relY: 40, width: 170, height: 80, type: 'rect', name: 'Auth Service', text: 'JWT / OAuth2 Session', color: '#10b981' },
      { relId: 'srv_core', relX: 470, relY: 200, width: 170, height: 80, type: 'rect', name: 'Core API Service', text: 'Business Logic & Rules', color: '#10b981' },
      { relId: 'db', relX: 700, relY: 120, width: 160, height: 130, type: 'cylinder', name: 'PostgreSQL DB', text: 'ACID Relational Storage', color: '#f59e0b' }
    ],
    connections: [
      { fromRelId: 'client', fromAnchor: 'right', toRelId: 'gateway', toAnchor: 'left', label: 'HTTPS / JSON' },
      { fromRelId: 'gateway', fromAnchor: 'top', toRelId: 'srv_auth', toAnchor: 'left', label: 'gRPC' },
      { fromRelId: 'gateway', fromAnchor: 'bottom', toRelId: 'srv_core', toAnchor: 'left', label: 'REST' },
      { fromRelId: 'srv_core', fromAnchor: 'right', toRelId: 'db', toAnchor: 'left', label: 'SQL Query' },
      { fromRelId: 'srv_auth', fromAnchor: 'right', toRelId: 'db', toAnchor: 'top', label: 'Verify User' }
    ]
  },
  {
    id: 'binary_search_tree',
    name: 'Binary Search Tree (BST)',
    category: 'Data Structures',
    icon: '🌲',
    description: 'Hierarchical node tree with Left < Parent < Right invariant',
    items: [
      { relId: 'root', relX: 240, relY: 0, width: 120, height: 120, type: 'circle', name: 'Root [50]', text: '50', color: '#38bdf8' },
      { relId: 'left1', relX: 100, relY: 160, width: 110, height: 110, type: 'circle', name: 'Node [30]', text: '30', color: '#a855f7' },
      { relId: 'right1', relX: 380, relY: 160, width: 110, height: 110, type: 'circle', name: 'Node [70]', text: '70', color: '#10b981' },
      { relId: 'll', relX: 20, relY: 310, width: 100, height: 100, type: 'circle', name: 'Leaf [20]', text: '20', color: '#f59e0b' },
      { relId: 'lr', relX: 180, relY: 310, width: 100, height: 100, type: 'circle', name: 'Leaf [40]', text: '40', color: '#f59e0b' }
    ],
    connections: [
      { fromRelId: 'root', fromAnchor: 'left', toRelId: 'left1', toAnchor: 'top', label: 'key < 50' },
      { fromRelId: 'root', fromAnchor: 'right', toRelId: 'right1', toAnchor: 'top', label: 'key > 50' },
      { fromRelId: 'left1', fromAnchor: 'left', toRelId: 'll', toAnchor: 'top', label: 'key < 30' },
      { fromRelId: 'left1', fromAnchor: 'right', toRelId: 'lr', toAnchor: 'top', label: 'key > 30' }
    ]
  },
  {
    id: 'reinforcement_learning',
    name: 'RL Agent-Environment Loop',
    category: 'Machine Learning',
    icon: '🤖',
    description: 'Markov Decision Process: Action, State, Reward Closed-Loop',
    items: [
      { relId: 'agent', relX: 40, relY: 80, width: 220, height: 130, type: 'rounded_rect', name: 'Agent (Policy π)', text: 'Action a_t based on State s_t', color: '#38bdf8' },
      { relId: 'env', relX: 380, relY: 80, width: 220, height: 130, type: 'rounded_rect', name: 'Environment (MDP)', text: 'P(s\'|s,a), Reward R(s,a)', color: '#10b981' },
      { relId: 'q_formula', relX: 180, relY: 260, width: 380, height: 130, type: 'formula', name: 'Bellman Equation', latex: 'Q(s, a) = r + \\gamma \\max_{a\'} Q(s\', a\')', explanation: 'Optimal Action-Value Function Update' }
    ],
    connections: [
      { fromRelId: 'agent', fromAnchor: 'top', toRelId: 'env', toAnchor: 'top', label: 'Action a_t' },
      { fromRelId: 'env', fromAnchor: 'bottom', toRelId: 'agent', toAnchor: 'bottom', label: 'State s_{t+1}, Reward r_t' },
      { fromRelId: 'agent', fromAnchor: 'right', toRelId: 'q_formula', toAnchor: 'left', label: 'Optimizes' }
    ]
  },
  {
    id: 'cnn_pipeline',
    name: 'Convolutional Neural Network (CNN)',
    category: 'Computer Vision',
    icon: '📊',
    description: 'Image Input → Feature Map Filter Scanner → Pooling → Dense Classification',
    items: [
      { relId: 'input_img', relX: 0, relY: 100, width: 140, height: 140, type: 'rect', name: 'Input Matrix', text: 'H × W × C', color: '#38bdf8' },
      { relId: 'conv', relX: 200, relY: 100, width: 170, height: 110, type: 'rounded_rect', name: 'Conv2D + ReLU', text: 'K filters (3×3), stride 1', color: '#a855f7' },
      { relId: 'pool', relX: 430, relY: 100, width: 160, height: 100, type: 'rect', name: 'MaxPool2D', text: '2×2 Subsampling', color: '#10b981' },
      { relId: 'dense', relX: 650, relY: 100, width: 170, height: 120, type: 'rounded_rect', name: 'Softmax Dense', text: 'Class Probabilities', color: '#f59e0b' }
    ],
    connections: [
      { fromRelId: 'input_img', fromAnchor: 'right', toRelId: 'conv', toAnchor: 'left', label: 'Filter Convolve' },
      { fromRelId: 'conv', fromAnchor: 'right', toRelId: 'pool', toAnchor: 'left', label: 'Downsample' },
      { fromRelId: 'pool', fromAnchor: 'right', toRelId: 'dense', toAnchor: 'left', label: 'Flatten & FC' }
    ]
  }
];

// Curated AI Providers & Model Catalog for Whiteboard AI
export const WHITEBOARD_AI_PROVIDERS = [
  {
    id: 'pollinations',
    name: 'Pollinations (Free / No Key)',
    defaultModel: 'openai',
    models: [
      { id: 'openai', name: 'OpenAI (GPT-4o Mini / Turbo)' },
      { id: 'deepseek', name: 'DeepSeek-V3 (Smart Chat)' },
      { id: 'deepseek-r1', name: 'DeepSeek-R1 (Reasoning)' },
      { id: 'qwen-coder', name: 'Qwen 2.5 Coder (Code & Math)' },
      { id: 'mistral', name: 'Mistral Large' },
      { id: 'claude-hybrid', name: 'Claude 3.5 Sonnet (Hybrid)' }
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    defaultModel: 'deepseek/deepseek-r1',
    models: [
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 Reasoning' },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct' },
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash [Free]' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' }
    ]
  },
  {
    id: 'groq',
    name: 'Groq (Ultra Speed)',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
      { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' }
    ]
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    defaultModel: 'gemini-2.5-flash',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' }
    ]
  },
  {
    id: 'cerebras',
    name: 'Cerebras (Fastest Inference)',
    defaultModel: 'llama3.1-8b',
    models: [
      { id: 'llama3.1-8b', name: 'Llama 3.1 8B' },
      { id: 'llama-3.3-70b', name: 'Llama 3.3 70B' }
    ]
  },
  {
    id: 'sambanova',
    name: 'SambaNova Cloud',
    defaultModel: 'Meta-Llama-3.1-70B-Instruct',
    models: [
      { id: 'Meta-Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B Instruct' },
      { id: 'DeepSeek-R1-Distill-Llama-70B', name: 'DeepSeek R1 Distill 70B' },
      { id: 'Meta-Llama-3.1-405B-Instruct', name: 'Llama 3.1 405B Heavy' }
    ]
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    defaultModel: 'meta/llama-3.1-70b-instruct',
    models: [
      { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B Instruct' },
      { id: 'deepseek-ai/deepseek-r1', name: 'DeepSeek R1 Reasoning' },
      { id: 'mistralai/mistral-large-2-instruct', name: 'Mistral Large 2' }
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    defaultModel: 'mistral-large-latest',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large' },
      { id: 'codestral-latest', name: 'Codestral Code & Logic' },
      { id: 'mistral-small-latest', name: 'Mistral Small' }
    ]
  }
];

// Formula Presets Chips Catalog
export const WHITEBOARD_FORMULA_PRESETS: Array<{ name: string; latex: string; explanation: string }> = [
  {
    name: 'Bayes Theorem',
    latex: 'P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}',
    explanation: 'Posterior probability computed from prior and likelihood.'
  },
  {
    name: 'Softmax Activation',
    latex: '\\sigma(\\mathbf{z})_i = \\frac{e^{z_i}}{\\sum_{j=1}^K e^{z_j}}',
    explanation: 'Converts raw logit scores into probability distribution.'
  },
  {
    name: 'MSE Loss',
    latex: 'L(y, \\hat{y}) = \\frac{1}{N} \\sum_{i=1}^N (y_i - \\hat{y}_i)^2',
    explanation: 'Mean Squared Error loss for regression optimization.'
  },
  {
    name: 'Gradient Descent',
    latex: 'w_{t+1} = w_t - \\eta \\nabla L(w_t)',
    explanation: 'Weights updated in the opposite direction of loss gradient.'
  },
  {
    name: 'Gini Impurity',
    latex: 'I_G(p) = 1 - \\sum_{i=1}^J p_i^2',
    explanation: 'Measure of node heterogeneity in Decision Trees.'
  },
  {
    name: 'Transformer Attention',
    latex: '\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
    explanation: 'Scaled Dot-Product Attention mechanism in Transformers.'
  }
];

export const WhiteboardModule: React.FC = () => {
  // Dynamic Theme Tracking
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return document.documentElement.getAttribute('data-theme') === 'light';
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      setIsLightMode(isLight);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-atmosphere'] });
    return () => observer.disconnect();
  }, []);

  const [activeFormulaFeedback, setActiveFormulaFeedback] = useState<string | null>(null);
  const [showGrid] = useState<boolean>(true);
  const [bgGridType, setBgGridType] = useState<'grid' | 'dots' | 'isometric' | 'lined' | 'none'>('grid');
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [fillMode, setFillMode] = useState<'pastel' | 'solid' | 'none'>('pastel');
  const [polygonEdgeCount, setPolygonEdgeCount] = useState<number>(5);
  const [activeFlyout, setActiveFlyout] = useState<'none' | 'laser' | 'pen' | 'shapes' | 'text' | 'eraser' | 'utilities'>('none');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [rotatingItemId, setRotatingItemId] = useState<string | null>(null);
  const [settingWaypointForId, setSettingWaypointForId] = useState<string | null>(null);

  // Infinite Chalkboard Pan Offset & Viewport Container Ref
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const boardContainerRef = useRef<HTMLDivElement | null>(null);

  // Push-to-Float Inertial Physics Mode
  const [isPushPhysicsMode, setIsPushPhysicsMode] = useState<boolean>(false);
  const lastCursorPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const pushModeActivatedTime = useRef<number>(0);

  const togglePushPhysicsMode = () => {
    setIsPushPhysicsMode(prev => {
      const next = !prev;
      if (next) {
        pushModeActivatedTime.current = performance.now();
        lastCursorPos.current = null;
      } else {
        setItems(items => items.map(it => ({ ...it, vx: 0, vy: 0 })));
      }
      return next;
    });
    setActiveFlyout('none');
  };

  // Active Tool: Selection (move objects), Hand (pan frame), Laser Pointer, Shapes or Drawing Tools
  const [activeTool, setActiveTool] = useState<
    | 'select'
    | 'hand'
    | 'laser'
    | 'pen'
    | 'highlighter'
    | 'text'
    | 'eraser'
    | 'eraser_object'
    | 'line'
    | 'arrow'
    | 'double_arrow'
    | 'curve'
    | 'rect'
    | 'rounded_rect'
    | 'circle'
    | 'oval'
    | 'triangle'
    | 'right_triangle'
    | 'diamond'
    | 'parallelogram'
    | 'trapezoid'
    | 'hexagon'
    | 'cloud'
    | 'callout'
    | 'thought_bubble'
    | 'bracket'
    | 'coordinate_axes'
    | 'star'
    | 'arrow_block'
    | 'polygon'
    | 'cube'
    | 'cylinder'
    | 'cone'
  >('pen');

  // Animation Loop State for Universal Spin, Multi-point Waypoints, Breathing Glow & Physics Drift
  const [animTime, setAnimTime] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    const loop = (now: number) => {
      setAnimTime((now - startTime) / 1000);

      // Integrate Physics Floating, High Damping (Controlled Nudge) & Slow Ambient Drift
      setItems(prevItems => {
        let hasMotion = false;
        for (let i = 0; i < prevItems.length; i++) {
          const it = prevItems[i];
          if (
            (it.vx && Math.abs(it.vx) > 0.02) ||
            (it.vy && Math.abs(it.vy) > 0.02) ||
            it.isDrifting
          ) {
            hasMotion = true;
            break;
          }
        }
        if (!hasMotion) return prevItems;

        const boardW = boardContainerRef.current?.clientWidth || 1600;
        const boardH = boardContainerRef.current?.clientHeight || 900;

        return prevItems.map(it => {
          let nx = it.x;
          let ny = it.y;
          let nvx = it.vx || 0;
          let nvy = it.vy || 0;

          // 1. Force-proportional float (high kinetic friction: 0.82x decay, gentle nudge travels only ~10-30px)
          if (it.isFloating && (Math.abs(nvx) > 0.02 || Math.abs(nvy) > 0.02)) {
            nx += nvx;
            ny += nvy;
            nvx *= 0.82; // Controlled short travel
            nvy *= 0.82;
          } else if (Math.abs(nvx) > 0.02 || Math.abs(nvy) > 0.02) {
            nx += nvx;
            ny += nvy;
            nvx *= 0.75;
            nvy *= 0.75;
          }

          // 2. Slow ambient floating drift
          if (it.isDrifting) {
            const phase = it.driftPhase || (it.id.charCodeAt(0) % 10);
            const driftDx = Math.sin(animTime * 0.75 + phase) * 0.32;
            const driftDy = Math.cos(animTime * 0.6 + phase) * 0.22;
            nx += driftDx;
            ny += driftDy;
          }

          // Chalkboard Viewport Soft Boundary Walls & Gentle Rebound
          const minX = 15 - panOffset.x;
          const maxX = boardW - it.width - 15 - panOffset.x;
          const minY = 15 - panOffset.y;
          const maxY = boardH - it.height - 15 - panOffset.y;

          if (nx < minX) {
            nx = minX;
            nvx = -nvx * 0.4; // Gentle soft bounce
          } else if (nx > maxX) {
            nx = maxX;
            nvx = -nvx * 0.4;
          }

          if (ny < minY) {
            ny = minY;
            nvy = -nvy * 0.4;
          } else if (ny > maxY) {
            ny = maxY;
            nvy = -nvy * 0.4;
          }

          return {
            ...it,
            x: nx,
            y: ny,
            vx: Math.abs(nvx) < 0.02 ? 0 : nvx,
            vy: Math.abs(nvy) < 0.02 ? 0 : nvy
          };
        });
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [panOffset.x, panOffset.y]);

  // Spotlight / Laser Pointer State (Color & Shape)
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);
  const [laserColor, setLaserColor] = useState<string>('#ef4444');
  const [laserShape, setLaserShape] = useState<'dot' | 'crosshair' | 'star' | 'ring' | 'arrow'>('dot');
  const [highlighterPaletteColor, setHighlighterPaletteColor] = useState<string>('#fef08a');

  // Classroom Teaching Tools & Widgets State
  const [isProtractorVisible, setIsProtractorVisible] = useState<boolean>(false);
  const [protractorPos, setProtractorPos] = useState<{ x: number; y: number; rotation: number }>({ x: 220, y: 160, rotation: 0 });
  const [, setIsDraggingProtractor] = useState<boolean>(false);

  const [isDiceRollerVisible, setIsDiceRollerVisible] = useState<boolean>(false);
  const [diceValue, setDiceValue] = useState<number>(6);
  const [isDiceRolling, setIsDiceRolling] = useState<boolean>(false);

  const [isTrafficLightVisible, setIsTrafficLightVisible] = useState<boolean>(false);
  const [trafficStatus, setTrafficStatus] = useState<'red' | 'yellow' | 'green'>('green');

  const [isStudentPickerVisible, setIsStudentPickerVisible] = useState<boolean>(false);
  const [studentList] = useState<string>('Alex, Priya, Rahul, Sam, Maya, David, Ananya, Vikram');
  const [pickedStudent, setPickedStudent] = useState<string | null>(null);
  const [isPickingStudent, setIsPickingStudent] = useState<boolean>(false);

  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(300);

  // Custom Canvas Drawing State (for freehand ink, lines & arrows)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState<string>('#38bdf8');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [canvasHistory, setCanvasHistory] = useState<ImageData[]>([]);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const snapshotRef = useRef<ImageData | null>(null);

  // Relationship Forming & Anchor Points State
  const [relationshipMode, setRelationshipMode] = useState<boolean>(false);
  const [connections, setConnections] = useState<RelationshipConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<{
    itemId: string;
    anchor: 'top' | 'bottom' | 'left' | 'right';
    startX: number;
    startY: number;
  } | null>(null);
  const [tempConnectionEnd, setTempConnectionEnd] = useState<{ x: number; y: number } | null>(null);
  const [hoveredAnchor, setHoveredAnchor] = useState<{
    itemId: string;
    anchor: 'top' | 'bottom' | 'left' | 'right';
  } | null>(null);

  // All Interactive Draggable Items (KaTeX Formulas, Sticky Notes, Images, Shapes)
  const [items, setItems] = useState<ChalkboardItem[]>([
    {
      id: 'init_softmax',
      x: 80,
      y: 40,
      width: 310,
      height: 160,
      name: 'Softmax Activation Function',
      latex: '\\sigma(\\mathbf{z})_i = \\frac{e^{z_i}}{\\sum_{j=1}^K e^{z_j}}',
      explanation: 'Normalizes logits into a valid probability distribution where sum equals 1.',
      type: 'formula'
    },
    {
      id: 'init_note',
      x: 80,
      y: 220,
      width: 280,
      height: 110,
      name: 'Key Exam Note',
      latex: '',
      explanation: 'Tip: Always normalize input vectors before computing cosine similarity or softmax!',
      type: 'note',
      color: '#f59e0b'
    },
    {
      id: 'init_rect',
      x: 80,
      y: 350,
      width: 180,
      height: 80,
      type: 'rect',
      name: 'Input Layer',
      text: 'X = [x₁, x₂, ..., xₙ]',
      color: '#38bdf8',
      strokeWidth: 3,
      rotation: 0
    },
    {
      id: 'init_circle',
      x: 280,
      y: 350,
      width: 90,
      height: 90,
      type: 'circle',
      name: 'Neuron Node',
      text: 'f(∑wᵢxᵢ + b)',
      color: '#a855f7',
      strokeWidth: 3,
      rotation: 0
    }
  ]);

  // Dragging and Rotating refs
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Text Tool State
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState<string>('');
  const [quickNoteText, setQuickNoteText] = useState<string>('');
  const [showQuickNoteModal, setShowQuickNoteModal] = useState<boolean>(false);

  // Custom Shape Creator / Palette Modal State
  const [showCustomShapeModal, setShowCustomShapeModal] = useState<boolean>(false);
  const [editingShapeId, setEditingShapeId] = useState<string | null>(null);
  const [shapeFormType, setShapeFormType] = useState<ShapeType>('rect');
  const [shapeFormTitle, setShapeFormTitle] = useState<string>('');
  const [shapeFormText, setShapeFormText] = useState<string>('');
  const [shapeFormColor, setShapeFormColor] = useState<string>('#38bdf8');
  const [shapeFormRotation, setShapeFormRotation] = useState<number>(0);
  const [shapeFormSize, setShapeFormSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Image Upload Ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Custom Formula / Edit Modal State
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [customFormulaName, setCustomFormulaName] = useState<string>('');
  const [customFormulaLatex, setCustomFormulaLatex] = useState<string>('');
  const [customFormulaExplanation, setCustomFormulaExplanation] = useState<string>('');

  // AI Formula & Concept Architecture Generator States
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAiFormula, setIsGeneratingAiFormula] = useState<boolean>(false);

  const [showAiDiagramModal, setShowAiDiagramModal] = useState<boolean>(false);
  const [aiDiagramPrompt, setAiDiagramPrompt] = useState<string>('');
  const [isGeneratingAiDiagram, setIsGeneratingAiDiagram] = useState<boolean>(false);

  const [selectedProvider, setSelectedProvider] = useState<string>(
    localStorage.getItem('chatterbot_provider') || 'pollinations'
  );
  const [selectedModel, setSelectedModel] = useState<string>(
    localStorage.getItem('chatterbot_model') || 'openai'
  );
  const [isCustomModel, setIsCustomModel] = useState<boolean>(false);
  const [customModelInput, setCustomModelInput] = useState<string>('');

  // Draw Background Grid (Supports Square, Dot Matrix, Isometric, Lined Paper, None)
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, width, height);

    if (bgGridType === 'none') return;

    if (bgGridType === 'dots' || (bgGridType === 'grid' && showGrid)) {
      const gridSize = 32;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.16)';
      for (let x = gridSize; x < width; x += gridSize) {
        for (let y = gridSize; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    } else if (bgGridType === 'grid') {
      const gridSize = 32;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      for (let x = gridSize; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (bgGridType === 'isometric') {
      const gridSize = 40;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let x = -width; x < width * 2; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height * 0.577, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - height * 0.577, height);
        ctx.stroke();
      }
    } else if (bgGridType === 'lined') {
      const lineGap = 28;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.lineWidth = 1;
      for (let y = lineGap; y < height; y += lineGap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  }, [bgGridType, showGrid]);

  // Stopwatch / Timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev: number) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Initialize Canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    drawBackground(ctx, rect.width, rect.height);

    if (canvas.width > 0 && canvas.height > 0) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setCanvasHistory([imgData]);
    }
  }, [drawBackground]);

  useEffect(() => {
    const timer = setTimeout(initCanvas, 100);
    window.addEventListener('resize', initCanvas);

    let resizeObserver: ResizeObserver | null = null;
    if (canvasRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        initCanvas();
      });
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', initCanvas);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [initCanvas]);

  // Delete Connection on Backspace/Delete Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedConnectionId) {
        setConnections(prev => prev.filter(c => c.id !== selectedConnectionId));
        setSelectedConnectionId(null);
      }
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedItemId && activeTool === 'select') {
        const activeElem = document.activeElement;
        if (activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA')) return;
        deleteItem(selectedItemId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedConnectionId, selectedItemId, activeTool]);

  // Add KaTeX Formula Card to Chalkboard
  const addFormulaCard = (formula: { name: string; latex: string; explanation?: string }) => {
    navigator.clipboard.writeText(formula.latex);
    setActiveFormulaFeedback(formula.name);
    setTimeout(() => setActiveFormulaFeedback(null), 2500);

    const newItem: ChalkboardItem = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      x: 60 - panOffset.x + Math.random() * 240,
      y: 70 - panOffset.y + Math.random() * 160,
      width: 420,
      height: 170,
      name: formula.name,
      latex: formula.latex,
      explanation: formula.explanation || '',
      type: 'formula'
    };

    setItems(prev => [...prev, newItem]);
  };

  // Add Sticky Note Card
  const addStickyNoteCard = () => {
    if (!quickNoteText.trim()) return;
    const newNote: ChalkboardItem = {
      id: `note_${Date.now()}`,
      x: 80 - panOffset.x + Math.random() * 200,
      y: 90 - panOffset.y + Math.random() * 140,
      width: 280,
      height: 120,
      name: 'Sticky Note',
      latex: '',
      explanation: quickNoteText.trim(),
      type: 'note',
      color: '#f59e0b'
    };
    setItems(prev => [...prev, newNote]);
    setShowQuickNoteModal(false);
    setQuickNoteText('');
  };

  // Insert Local Image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const newImgItem: ChalkboardItem = {
        id: `img_${Date.now()}`,
        x: 100 - panOffset.x + Math.random() * 160,
        y: 100 - panOffset.y + Math.random() * 140,
        width: 320,
        height: 220,
        name: file.name.slice(0, 24),
        latex: '',
        explanation: 'Inserted Diagram / Reference',
        type: 'image',
        imageUrl: url
      };
      setItems(prev => [...prev, newImgItem]);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Open Edit Modal for an Existing Shape
  const openEditShapeModal = (item: ChalkboardItem) => {
    setEditingShapeId(item.id);
    setShapeFormType(item.type as ShapeType);
    setShapeFormTitle(item.name || '');
    setShapeFormText(item.text || '');
    setShapeFormColor(item.color || '#38bdf8');
    setShapeFormRotation(item.rotation || 0);
    setShowCustomShapeModal(true);
  };

  // Save Custom Shape from Modal
  const handleSaveCustomShape = () => {
    const meta = ACADEMIC_SHAPES_CATALOG.find(s => s.type === shapeFormType);
    const defaultW = meta?.defaultW || 150;
    const defaultH = meta?.defaultH || 130;
    const sizeMultiplier = shapeFormSize === 'sm' ? 0.75 : shapeFormSize === 'lg' ? 1.35 : 1.0;
    const finalW = Math.round(defaultW * sizeMultiplier);
    const finalH = Math.round(defaultH * sizeMultiplier);

    if (editingShapeId) {
      setItems(prev =>
        prev.map(item =>
          item.id === editingShapeId
            ? {
                ...item,
                type: shapeFormType,
                name: shapeFormTitle.trim() || undefined,
                text: shapeFormText.trim() || undefined,
                color: shapeFormColor,
                rotation: shapeFormRotation,
                aspectRatioLocked: shapeFormType === 'circle' ? true : item.aspectRatioLocked
              }
            : item
        )
      );
    } else {
      const newShape: ChalkboardItem = {
        id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        x: 120 - panOffset.x + Math.random() * 180,
        y: 120 - panOffset.y + Math.random() * 140,
        width: finalW,
        height: finalH,
        type: shapeFormType,
        name: shapeFormTitle.trim() || undefined,
        text: shapeFormText.trim() || undefined,
        color: shapeFormColor,
        strokeWidth: 3,
        aspectRatioLocked: shapeFormType === 'circle',
        rotation: shapeFormRotation
      };
      setItems(prev => [...prev, newShape]);
      setSelectedItemId(newShape.id);
    }

    setShowCustomShapeModal(false);
    setEditingShapeId(null);
  };

  // Delete Item & Associated Connections
  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(c => c.id !== id));
    setConnections(prev => prev.filter(cn => cn.fromItemId !== id && cn.toItemId !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  // Open Edit Modal for a Formula Card
  const openEditModal = (item: ChalkboardItem) => {
    setEditingItemId(item.id);
    setCustomFormulaName(item.name || '');
    setCustomFormulaLatex(item.latex || '');
    setCustomFormulaExplanation(item.explanation || '');
    setShowFormulaModal(true);
  };

  // Save Custom or Edited Formula
  const handleSaveFormula = () => {
    if (!customFormulaName.trim() || !customFormulaLatex.trim()) return;

    if (editingItemId) {
      setItems(prev =>
        prev.map(c =>
          c.id === editingItemId
            ? {
                ...c,
                name: customFormulaName.trim(),
                latex: customFormulaLatex.trim(),
                explanation: customFormulaExplanation.trim()
              }
            : c
        )
      );
    } else {
      const newItem: ChalkboardItem = {
        id: `custom_${Date.now()}`,
        x: 100 - panOffset.x + Math.random() * 200,
        y: 100 - panOffset.y + Math.random() * 150,
        width: 420,
        height: 170,
        name: customFormulaName.trim(),
        latex: customFormulaLatex.trim(),
        explanation: customFormulaExplanation.trim() || 'Custom academic formula',
        type: 'formula'
      };
      setItems(prev => [...prev, newItem]);
    }

    setShowFormulaModal(false);
    setEditingItemId(null);
    setCustomFormulaName('');
    setCustomFormulaLatex('');
    setCustomFormulaExplanation('');
  };

  // 1-Click Architecture Preset Placement Handler
  const handleInsertArchitecturePreset = (preset: ArchitecturePreset) => {
    const baseTimestamp = Date.now();
    const idMap: Record<string, string> = {};

    const startX = 80 - panOffset.x;
    const startY = 70 - panOffset.y;

    const newItems: ChalkboardItem[] = preset.items.map((item, idx) => {
      const newId = `arch_${baseTimestamp}_${item.relId}_${idx}`;
      idMap[item.relId] = newId;
      return {
        id: newId,
        x: startX + item.relX,
        y: startY + item.relY,
        width: item.width,
        height: item.height,
        type: item.type,
        name: item.name,
        text: item.text,
        latex: item.latex,
        explanation: item.explanation,
        color: item.color || '#38bdf8',
        strokeWidth: 3,
        rotation: 0
      };
    });

    const newConnections: RelationshipConnection[] = preset.connections.map((conn, idx) => ({
      id: `conn_arch_${baseTimestamp}_${idx}`,
      fromItemId: idMap[conn.fromRelId] || conn.fromRelId,
      fromAnchor: conn.fromAnchor,
      toItemId: idMap[conn.toRelId] || conn.toRelId,
      toAnchor: conn.toAnchor,
      label: conn.label
    }));

    setItems(prev => [...prev, ...newItems]);
    setConnections(prev => [...prev, ...newConnections]);
    setActiveFormulaFeedback(`🏛️ Inserted Architecture: ${preset.name}`);
    setTimeout(() => setActiveFormulaFeedback(null), 3000);
    setActiveFlyout('none');
  };

  // AI Formula Generator Handler
  const handleGenerateAiFormula = async () => {
    if (!aiPrompt.trim() || isGeneratingAiFormula) return;
    setIsGeneratingAiFormula(true);
    try {
      const userKeys: UserKeys = JSON.parse(localStorage.getItem('chatterbot_user_keys') || '{}');
      const targetModel = isCustomModel && customModelInput.trim() ? customModelInput.trim() : selectedModel;
      const prompt = `Generate a standard, complete LaTeX mathematical formula for the academic topic: "${aiPrompt.trim()}". Return JSON ONLY with format: {"name": "Formula Name", "latex": "raw_latex_string", "explanation": "one concise sentence explanation for students"}`;

      const res = await sendChatMessage(
        selectedProvider,
        targetModel,
        [{ id: '1', role: 'user', content: prompt, timestamp: Date.now() }],
        userKeys,
        false,
        'auto',
        'You are a mathematical formula and KaTeX LaTeX synthesis system. Return JSON only.'
      );

      let parsed: any = null;
      const jsonMatch = res.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.warn('Failed parsing KaTeX formula JSON:', e);
        }
      }

      if (parsed && parsed.latex) {
        addFormulaCard({
          name: parsed.name || aiPrompt.trim(),
          latex: parsed.latex,
          explanation: parsed.explanation || 'AI generated KaTeX formula card.'
        });
        setShowAiModal(false);
        setAiPrompt('');
      } else {
        addFormulaCard({
          name: aiPrompt.trim(),
          latex: `\\text{${aiPrompt.trim().replace(/\s+/g, '_')}}(x) = \\int_{-\\infty}^\\infty f(t) e^{-i 2\\pi x t} dt`,
          explanation: `Mathematical formulation of ${aiPrompt.trim()}`
        });
        setShowAiModal(false);
        setAiPrompt('');
      }
    } catch (err) {
      console.error('AI Formula generation error:', err);
      addFormulaCard({
        name: aiPrompt.trim(),
        latex: `\\text{${aiPrompt.trim().replace(/\s+/g, '_')}} = \\sum_{i=1}^N w_i x_i + b`,
        explanation: `Mathematical formulation of ${aiPrompt.trim()}`
      });
      setShowAiModal(false);
      setAiPrompt('');
    } finally {
      setIsGeneratingAiFormula(false);
    }
  };

  // AI Concept Architecture & Connected Diagram Generator Handler
  const handleGenerateAiDiagram = async () => {
    if (!aiDiagramPrompt.trim() || isGeneratingAiDiagram) return;
    setIsGeneratingAiDiagram(true);
    try {
      const userKeys: UserKeys = JSON.parse(localStorage.getItem('chatterbot_user_keys') || '{}');
      const targetModel = isCustomModel && customModelInput.trim() ? customModelInput.trim() : selectedModel;
      const prompt = `You are an educational architecture diagram generator.
Create an interconnected multi-node diagram for: "${aiDiagramPrompt.trim()}".
Return valid JSON ONLY with this exact structure:
{
  "title": "Diagram Title",
  "items": [
    { "relId": "node1", "relX": 0, "relY": 0, "width": 180, "height": 90, "type": "rect", "name": "Node Title", "text": "Details or equation", "latex": "", "color": "#38bdf8" }
  ],
  "connections": [
    { "fromRelId": "node1", "fromAnchor": "bottom", "toRelId": "node2", "toAnchor": "top", "label": "Connection label" }
  ]
}
Supported types: rect, rounded_rect, circle, oval, cylinder, diamond, cloud, formula.
Position 3 to 6 cleanly spaced nodes with reasonable spatial offsets (x: 0 to 600, y: 0 to 350) and meaningful directional arrow connections.`;

      const res = await sendChatMessage(
        selectedProvider,
        targetModel,
        [{ id: '1', role: 'user', content: prompt, timestamp: Date.now() }],
        userKeys,
        false,
        'auto',
        'You are a visual architecture synthesis engine. Return JSON only.'
      );

      let parsed: any = null;
      const jsonMatch = res.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.warn('Failed parsing AI diagram JSON:', e);
        }
      }

      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        const preset: ArchitecturePreset = {
          id: `ai_${Date.now()}`,
          name: parsed.title || aiDiagramPrompt.trim(),
          category: 'AI Generated',
          icon: '✨',
          description: aiDiagramPrompt.trim(),
          items: parsed.items,
          connections: parsed.connections || []
        };
        handleInsertArchitecturePreset(preset);
        setShowAiDiagramModal(false);
        setAiDiagramPrompt('');
      } else {
        // Intelligent 3-node fallback diagram
        const fallbackPreset: ArchitecturePreset = {
          id: `ai_fallback_${Date.now()}`,
          name: aiDiagramPrompt.trim(),
          category: 'AI Generated',
          icon: '🧠',
          description: aiDiagramPrompt.trim(),
          items: [
            { relId: 'in', relX: 0, relY: 100, width: 180, height: 90, type: 'rect', name: 'Input Entity', text: `${aiDiagramPrompt.slice(0, 18)} In`, color: '#38bdf8' },
            { relId: 'proc', relX: 240, relY: 100, width: 200, height: 100, type: 'rounded_rect', name: 'Processing Unit', text: 'Evaluation Engine', color: '#a855f7' },
            { relId: 'out', relX: 490, relY: 100, width: 180, height: 90, type: 'cylinder', name: 'Output State', text: 'Result / Store', color: '#10b981' }
          ],
          connections: [
            { fromRelId: 'in', fromAnchor: 'right', toRelId: 'proc', toAnchor: 'left', label: 'Data In' },
            { fromRelId: 'proc', fromAnchor: 'right', toRelId: 'out', toAnchor: 'left', label: 'Computed' }
          ]
        };
        handleInsertArchitecturePreset(fallbackPreset);
        setShowAiDiagramModal(false);
        setAiDiagramPrompt('');
      }
    } catch (err: any) {
      console.error('Error generating AI diagram:', err);
      const fallbackPreset: ArchitecturePreset = {
        id: `ai_fallback_${Date.now()}`,
        name: aiDiagramPrompt.trim(),
        category: 'AI Generated',
        icon: '🧠',
        description: aiDiagramPrompt.trim(),
        items: [
          { relId: 'in', relX: 0, relY: 100, width: 180, height: 90, type: 'rect', name: 'Input Flow', text: `${aiDiagramPrompt.slice(0, 18)} Flow`, color: '#38bdf8' },
          { relId: 'proc', relX: 240, relY: 100, width: 200, height: 100, type: 'rounded_rect', name: 'Transformation', text: 'Processing Unit', color: '#a855f7' },
          { relId: 'out', relX: 490, relY: 100, width: 180, height: 90, type: 'cylinder', name: 'Sink / Storage', text: 'Output State', color: '#10b981' }
        ],
        connections: [
          { fromRelId: 'in', fromAnchor: 'right', toRelId: 'proc', toAnchor: 'left', label: 'Data In' },
          { fromRelId: 'proc', fromAnchor: 'right', toRelId: 'out', toAnchor: 'left', label: 'Response' }
        ]
      };
      handleInsertArchitecturePreset(fallbackPreset);
      setShowAiDiagramModal(false);
      setAiDiagramPrompt('');
    } finally {
      setIsGeneratingAiDiagram(false);
    }
  };

  // Item Mouse Drag Handlers
  const handleItemMouseDown = (e: React.MouseEvent, item: ChalkboardItem) => {
    if (activeTool === 'hand' || relationshipMode) return;
    e.stopPropagation();
    setSelectedItemId(item.id);
    setSelectedConnectionId(null);
    setDraggingItemId(item.id);
    dragOffsetRef.current = {
      x: e.clientX - item.x,
      y: e.clientY - item.y
    };
  };

  const handleItemTouchStart = (e: React.TouchEvent, item: ChalkboardItem) => {
    if (activeTool === 'hand' || relationshipMode) return;
    if (e.touches.length > 0) {
      e.stopPropagation();
      setSelectedItemId(item.id);
      setSelectedConnectionId(null);
      setDraggingItemId(item.id);
      dragOffsetRef.current = {
        x: e.touches[0].clientX - item.x,
        y: e.touches[0].clientY - item.y
      };
    }
  };

  const handleTouchMoveGlobal = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];

    if (isPanning && activeTool === 'hand') {
      const dx = touch.clientX - panStartRef.current.x;
      const dy = touch.clientY - panStartRef.current.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      panStartRef.current = { x: touch.clientX, y: touch.clientY };
      return;
    }

    if (draggingItemId) {
      const newX = touch.clientX - dragOffsetRef.current.x;
      const newY = touch.clientY - dragOffsetRef.current.y;

      setItems(prev =>
        prev.map(c => (c.id === draggingItemId ? { ...c, x: newX, y: newY } : c))
      );
    }
  };

  const handleTouchUpGlobal = () => {
    if (isPanning) setIsPanning(false);
    if (draggingItemId) setDraggingItemId(null);
    if (rotatingItemId) setRotatingItemId(null);
  };

  // Anchor Dot Position Calculation for Relationships (Rotates with shape)
  const getAnchorCoords = (item: ChalkboardItem, anchor: 'top' | 'bottom' | 'left' | 'right') => {
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;
    let ax = 0;
    let ay = 0;

    switch (anchor) {
      case 'top': ax = cx; ay = item.y; break;
      case 'bottom': ax = cx; ay = item.y + item.height; break;
      case 'left': ax = item.x; ay = cy; break;
      case 'right': ax = item.x + item.width; ay = cy; break;
    }

    if (item.rotation) {
      const rad = (item.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const rx = cos * (ax - cx) - sin * (ay - cy) + cx;
      const ry = sin * (ax - cx) + cos * (ay - cy) + cy;
      return { x: rx, y: ry };
    }

    return { x: ax, y: ay };
  };

  // Start Relationship Anchor Link (Fluid Drag)
  const handleAnchorMouseDown = (e: React.MouseEvent, item: ChalkboardItem, anchor: 'top' | 'bottom' | 'left' | 'right') => {
    e.stopPropagation();
    e.preventDefault();
    const coords = getAnchorCoords(item, anchor);
    setConnectingFrom({
      itemId: item.id,
      anchor,
      startX: coords.x,
      startY: coords.y
    });
    setTempConnectionEnd({ x: coords.x, y: coords.y });
  };

  // Start Rotating Shape Handle
  const handleRotateStart = (e: React.MouseEvent, item: ChalkboardItem) => {
    e.stopPropagation();
    e.preventDefault();
    setRotatingItemId(item.id);
  };

  // Global Mouse Move (Item Dragging, Rotation, Connection Elastic Drawing & Canvas Panning)
  const handleMouseMoveGlobal = (e: React.MouseEvent) => {
    if (isPanning && activeTool === 'hand') {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      panStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Interactive Shape Rotation by Mouse Dragging
    if (rotatingItemId && boardContainerRef.current) {
      const item = items.find(i => i.id === rotatingItemId);
      if (item) {
        const containerRect = boardContainerRef.current.getBoundingClientRect();
        const itemCenterX = containerRect.left + panOffset.x + item.x + item.width / 2;
        const itemCenterY = containerRect.top + panOffset.y + item.y + item.height / 2;

        const rad = Math.atan2(e.clientY - itemCenterY, e.clientX - itemCenterX);
        let deg = Math.round((rad * 180) / Math.PI) + 90;
        if (deg < 0) deg += 360;
        deg = deg % 360;

        // Snap to 15-degree increments if shift key is pressed
        if (e.shiftKey) {
          deg = Math.round(deg / 15) * 15;
        }

        setItems(prev =>
          prev.map(i => (i.id === rotatingItemId ? { ...i, rotation: deg } : i))
        );
      }
      return;
    }

    // Global Laser Tracking over all text, shapes, notes, and cards
    if (activeTool === 'laser' && boardContainerRef.current) {
      const containerRect = boardContainerRef.current.getBoundingClientRect();
      setLaserPos({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      });
    }

    if (draggingItemId) {
      const newX = e.clientX - dragOffsetRef.current.x;
      const newY = e.clientY - dragOffsetRef.current.y;

      setItems(prev =>
        prev.map(c => (c.id === draggingItemId ? { ...c, x: newX, y: newY } : c))
      );
    }

    // Dynamic Elastic Relationship Line
    if (connectingFrom && boardContainerRef.current) {
      const containerRect = boardContainerRef.current.getBoundingClientRect();
      const currentBoardX = e.clientX - containerRect.left - panOffset.x;
      const currentBoardY = e.clientY - containerRect.top - panOffset.y;

      setTempConnectionEnd({ x: currentBoardX, y: currentBoardY });
    }
  };

  const handleMouseUpGlobal = () => {
    if (isPanning) setIsPanning(false);
    if (draggingItemId) setDraggingItemId(null);
    if (rotatingItemId) setRotatingItemId(null);

    // If released over a valid target anchor
    if (connectingFrom) {
      if (hoveredAnchor && hoveredAnchor.itemId !== connectingFrom.itemId) {
        const newConn: RelationshipConnection = {
          id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          fromItemId: connectingFrom.itemId,
          fromAnchor: connectingFrom.anchor,
          toItemId: hoveredAnchor.itemId,
          toAnchor: hoveredAnchor.anchor,
          label: 'maps_to'
        };
        setConnections(prev => [...prev, newConn]);
      }
      setConnectingFrom(null);
      setTempConnectionEnd(null);
      setHoveredAnchor(null);
    }
  };

  // Text Tool Canvas Placement
  const confirmTextInput = () => {
    if (!textInputPos || !textInputValue.trim()) {
      setTextInputPos(null);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = strokeColor;
    ctx.font = `bold ${strokeWidth * 4 + 12}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(textInputValue, textInputPos.x, textInputPos.y + 16);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasHistory(prev => [...prev.slice(-25), imgData]);
    setTextInputPos(null);
    setTextInputValue('');
  };

  // Canvas Drawing & Interactive Shape Creation Handlers
  const isShapeTool =
    activeTool === 'rect' ||
    activeTool === 'rounded_rect' ||
    activeTool === 'circle' ||
    activeTool === 'oval' ||
    activeTool === 'triangle' ||
    activeTool === 'right_triangle' ||
    activeTool === 'diamond' ||
    activeTool === 'parallelogram' ||
    activeTool === 'trapezoid' ||
    activeTool === 'hexagon' ||
    activeTool === 'cloud' ||
    activeTool === 'callout' ||
    activeTool === 'thought_bubble' ||
    activeTool === 'bracket' ||
    activeTool === 'coordinate_axes' ||
    activeTool === 'star' ||
    activeTool === 'arrow_block' ||
    activeTool === 'polygon' ||
    activeTool === 'cube' ||
    activeTool === 'cylinder' ||
    activeTool === 'cone';

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'hand') {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (activeTool === 'laser') {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setLaserPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
      return;
    }

    if (settingWaypointForId) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left - panOffset.x;
      const clickY = e.clientY - rect.top - panOffset.y;
      setItems(prev =>
        prev.map(it => {
          if (it.id === settingWaypointForId) {
            const currentWps = it.waypoints ? [...it.waypoints] : (it.waypointEnd ? [it.waypointEnd] : []);
            return {
              ...it,
              waypoints: [...currentWps, { x: clickX, y: clickY }],
              waypointEnd: { x: clickX, y: clickY },
              isAnimatingMove: true
            };
          }
          return it;
        })
      );
      return;
    }

    if (activeTool === 'select' || relationshipMode) {
      setSelectedItemId(null);
      setSelectedConnectionId(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - panOffset.x;
    const y = e.clientY - rect.top - panOffset.y;

    if (activeTool === 'text') {
      setTextInputPos({ x, y });
      setTextInputValue('');
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    setIsDrawing(true);
    startPosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Per-Object Physics: isFloating (proportional nudge) & isRepelling (magnetic ripple repulsion)
    const now = performance.now();
    if (lastCursorPos.current) {
      const dt = Math.max(1, now - lastCursorPos.current.time);
      const rawDx = e.clientX - lastCursorPos.current.x;
      const rawDy = e.clientY - lastCursorPos.current.y;
      const moveDist = Math.hypot(rawDx, rawDy);

      if (moveDist < 90 && dt < 200) {
        const cdx = (rawDx / dt) * 16;
        const cdy = (rawDy / dt) * 16;
        const cursorSpeed = Math.hypot(cdx, cdy);
        const canvas = canvasRef.current;

        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const cx = e.clientX - rect.left - panOffset.x;
          const cy = e.clientY - rect.top - panOffset.y;

          setItems(prevItems =>
            prevItems.map(item => {
              if (item.locked || item.isAnimatingMove) return item;
              const ix = item.x + item.width / 2;
              const iy = item.y + item.height / 2;
              const dist = Math.hypot(cx - ix, cy - iy);

              let addedVx = 0;
              let addedVy = 0;

              // 💥 Per-object Magnetic Cursor Repulsion
              if (item.isRepelling) {
                const repelRadius = Math.max(item.width, item.height) / 2 + 70;
                if (dist < repelRadius && dist > 1) {
                  const repelRatio = (repelRadius - dist) / repelRadius;
                  const force = Math.pow(repelRatio, 1.8) * 4.2;
                  const angle = Math.atan2(iy - cy, ix - cx);
                  addedVx += Math.cos(angle) * force;
                  addedVy += Math.sin(angle) * force;
                }
              }

              // 🫧 Per-object Force-Proportional Float Nudge (Light nudge moves only ~10-30px)
              if ((item.isFloating || isPushPhysicsMode) && cursorSpeed > 0.2) {
                const pushRadius = Math.max(item.width, item.height) / 2 + 45;
                if (dist < pushRadius && dist > 1) {
                  const proximity = (pushRadius - dist) / pushRadius;
                  const force = Math.min(5.5, proximity * 1.6 + Math.min(3.2, cursorSpeed * 0.14));
                  const angle = Math.atan2(iy - cy, ix - cx);
                  addedVx += Math.cos(angle) * force + (cdx / (cursorSpeed || 1)) * Math.min(1.5, cursorSpeed * 0.1);
                  addedVy += Math.sin(angle) * force + (cdy / (cursorSpeed || 1)) * Math.min(1.5, cursorSpeed * 0.1);
                }
              }

              if (addedVx !== 0 || addedVy !== 0) {
                const curVx = item.vx || 0;
                const curVy = item.vy || 0;
                return {
                  ...item,
                  vx: Math.max(-6, Math.min(6, curVx + addedVx)),
                  vy: Math.max(-6, Math.min(6, curVy + addedVy))
                };
              }

              return item;
            })
          );
        }
      }
    }
    lastCursorPos.current = { x: e.clientX, y: e.clientY, time: now };

    if (activeTool === 'laser') {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setLaserPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
      return;
    }

    if (!isDrawing || activeTool === 'text' || activeTool === 'hand' || activeTool === 'select') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // Apply Line Style Dash Array
    if (lineStyle === 'dashed') {
      ctx.setLineDash([8, 6]);
    } else if (lineStyle === 'dotted') {
      ctx.setLineDash([2, 5]);
    } else {
      ctx.setLineDash([]);
    }

    if (activeTool === 'eraser') {
      ctx.setLineDash([]);
      ctx.strokeStyle = '#0b1120';
      ctx.lineWidth = strokeWidth * 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(rawX, rawY);
      ctx.stroke();
    } else if (activeTool === 'highlighter') {
      ctx.setLineDash([]);
      ctx.strokeStyle = (highlighterPaletteColor || strokeColor) + '66';
      ctx.lineWidth = strokeWidth * 5;
      ctx.lineCap = 'square';
      ctx.lineTo(rawX, rawY);
      ctx.stroke();
    } else if (activeTool === 'pen') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(rawX, rawY);
      ctx.stroke();
    } else if (snapshotRef.current) {
      // Shape / Line / Arrow Real-Time Preview
      ctx.putImageData(snapshotRef.current, 0, 0);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;

      const startX = startPosRef.current.x;
      const startY = startPosRef.current.y;

      if (activeTool === 'rect' || activeTool === 'rounded_rect' || activeTool === 'cube') {
        ctx.strokeRect(startX, startY, rawX - startX, rawY - startY);
      } else if (activeTool === 'circle') {
        const side = Math.max(Math.abs(rawX - startX), Math.abs(rawY - startY));
        const r = side / 2;
        ctx.beginPath();
        ctx.arc(startX + (rawX >= startX ? r : -r), startY + (rawY >= startY ? r : -r), r, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (activeTool === 'oval' || activeTool === 'cylinder') {
        const rx = Math.abs(rawX - startX) / 2;
        const ry = Math.abs(rawY - startY) / 2;
        ctx.beginPath();
        ctx.ellipse(startX + (rawX - startX) / 2, startY + (rawY - startY) / 2, Math.max(1, rx), Math.max(1, ry), 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (activeTool === 'triangle' || activeTool === 'cone') {
        ctx.beginPath();
        ctx.moveTo(startX + (rawX - startX) / 2, startY);
        ctx.lineTo(rawX, rawY);
        ctx.lineTo(startX, rawY);
        ctx.closePath();
        ctx.stroke();
      } else if (activeTool === 'right_triangle') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, rawY);
        ctx.lineTo(rawX, rawY);
        ctx.closePath();
        ctx.stroke();
      } else if (activeTool === 'star') {
        const cx = startX + (rawX - startX) / 2;
        const cy = startY + (rawY - startY) / 2;
        const r = Math.abs(rawX - startX) / 2;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(Math.cos((18 + i * 72) * 0.01745) * r + cx, -Math.sin((18 + i * 72) * 0.01745) * r + cy);
          ctx.lineTo(Math.cos((54 + i * 72) * 0.01745) * (r / 2) + cx, -Math.sin((54 + i * 72) * 0.01745) * (r / 2) + cy);
        }
        ctx.closePath();
        ctx.stroke();
      } else if (activeTool === 'diamond') {
        const midX = startX + (rawX - startX) / 2;
        const midY = startY + (rawY - startY) / 2;
        ctx.beginPath();
        ctx.moveTo(midX, startY);
        ctx.lineTo(rawX, midY);
        ctx.lineTo(midX, rawY);
        ctx.lineTo(startX, midY);
        ctx.closePath();
        ctx.stroke();
      } else if (activeTool === 'parallelogram') {
        const dx = (rawX - startX) * 0.25;
        ctx.beginPath();
        ctx.moveTo(startX + dx, startY);
        ctx.lineTo(rawX, startY);
        ctx.lineTo(rawX - dx, rawY);
        ctx.lineTo(startX, rawY);
        ctx.closePath();
        ctx.stroke();
      } else if (activeTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(rawX, rawY);
        ctx.stroke();
      } else if (activeTool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(rawX, rawY);
        ctx.stroke();

        const angle = Math.atan2(rawY - startY, rawX - startX);
        const headLen = 14;
        ctx.beginPath();
        ctx.moveTo(rawX, rawY);
        ctx.lineTo(rawX - headLen * Math.cos(angle - Math.PI / 6), rawY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(rawX, rawY);
        ctx.lineTo(rawX - headLen * Math.cos(angle + Math.PI / 6), rawY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (activeTool === 'double_arrow') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(rawX, rawY);
        ctx.stroke();

        const angle = Math.atan2(rawY - startY, rawX - startX);
        const headLen = 12;
        // Head at end
        ctx.beginPath();
        ctx.moveTo(rawX, rawY);
        ctx.lineTo(rawX - headLen * Math.cos(angle - Math.PI / 6), rawY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(rawX, rawY);
        ctx.lineTo(rawX - headLen * Math.cos(angle + Math.PI / 6), rawY - headLen * Math.sin(angle + Math.PI / 6));
        // Head at start
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + headLen * Math.cos(angle - Math.PI / 6), startY + headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + headLen * Math.cos(angle + Math.PI / 6), startY + headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (activeTool === 'curve') {
        const midX = (startX + rawX) / 2;
        const midY = startY - 40;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(midX, midY, rawX, rawY);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    const startX = startPosRef.current.x;
    const startY = startPosRef.current.y;

    // IF DRAWING A SHAPE -> CONVERT TO INTERACTIVE DRAGGABLE VECTOR ITEM WITH EDITABLE TEXT
    if (isShapeTool) {
      if (snapshotRef.current) ctx.putImageData(snapshotRef.current, 0, 0);

      const xMin = Math.min(startX, rawX) - panOffset.x;
      const yMin = Math.min(startY, rawY) - panOffset.y;
      
      let w = Math.max(48, Math.abs(rawX - startX));
      let h = Math.max(48, Math.abs(rawY - startY));

      // Circle 1:1 perfect ratio constraint
      if (activeTool === 'circle') {
        const side = Math.max(48, Math.max(w, h));
        w = side;
        h = side;
      }

      const newShapeItem: ChalkboardItem = {
        id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        x: xMin,
        y: yMin,
        width: w,
        height: h,
        type: activeTool as ShapeType,
        color: strokeColor,
        strokeWidth: strokeWidth,
        lineStyle,
        fillMode,
        aspectRatioLocked: activeTool === 'circle',
        cornerRadius: activeTool === 'rounded_rect' ? 16 : 8,
        polygonEdges: polygonEdgeCount,
        rotation: 0
      };

      setItems(prev => [...prev, newShapeItem]);
      setSelectedItemId(newShapeItem.id);
      setActiveTool('select');
      return;
    }

    // Freehand strokes & arrows save to canvas history
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasHistory(prev => [...prev.slice(-25), imgData]);
  };

  // Touch Inking Handlers for Mobile Chalkboard
  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];

    if (activeTool === 'hand') {
      setIsPanning(true);
      panStartRef.current = { x: touch.clientX, y: touch.clientY };
      return;
    }

    if (activeTool === 'laser') {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setLaserPos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
      }
      return;
    }

    if (settingWaypointForId) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = touch.clientX - rect.left - panOffset.x;
      const clickY = touch.clientY - rect.top - panOffset.y;
      setItems(prev =>
        prev.map(it => {
          if (it.id === settingWaypointForId) {
            const currentWps = it.waypoints ? [...it.waypoints] : (it.waypointEnd ? [it.waypointEnd] : []);
            return {
              ...it,
              waypoints: [...currentWps, { x: clickX, y: clickY }],
              waypointEnd: { x: clickX, y: clickY },
              isAnimatingMove: true
            };
          }
          return it;
        })
      );
      return;
    }

    if (activeTool === 'select' || relationshipMode) {
      setSelectedItemId(null);
      setSelectedConnectionId(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left - panOffset.x;
    const y = touch.clientY - rect.top - panOffset.y;

    if (activeTool === 'text') {
      setTextInputPos({ x, y });
      setTextInputValue('');
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    setIsDrawing(true);
    startPosRef.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    }
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];

    if (activeTool === 'laser') {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setLaserPos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
      }
      return;
    }

    if (!isDrawing || activeTool === 'text' || activeTool === 'hand' || activeTool === 'select') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const rawX = touch.clientX - rect.left;
    const rawY = touch.clientY - rect.top;

    if (lineStyle === 'dashed') {
      ctx.setLineDash([8, 6]);
    } else if (lineStyle === 'dotted') {
      ctx.setLineDash([2, 5]);
    } else {
      ctx.setLineDash([]);
    }

    if (activeTool === 'eraser') {
      ctx.setLineDash([]);
      ctx.strokeStyle = '#0b1120';
      ctx.lineWidth = strokeWidth * 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(rawX, rawY);
      ctx.stroke();
    } else if (activeTool === 'highlighter') {
      ctx.setLineDash([]);
      ctx.strokeStyle = (highlighterPaletteColor || strokeColor) + '66';
      ctx.lineWidth = strokeWidth * 5;
      ctx.lineCap = 'square';
      ctx.lineTo(rawX, rawY);
      ctx.stroke();
    } else if (activeTool === 'pen') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(rawX, rawY);
      ctx.stroke();
    }
  };

  const stopDrawingTouch = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (canvas.width > 0 && canvas.height > 0) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setCanvasHistory(prev => [...prev.slice(-25), imgData]);
    }
  };

  const undoCanvas = () => {
    if (canvasHistory.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const newHistory = [...canvasHistory];
    newHistory.pop();
    const previous = newHistory[newHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setCanvasHistory(newHistory);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    drawBackground(ctx, rect.width, rect.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasHistory([imgData]);
    setItems([]);
    setConnections([]);
    setSelectedItemId(null);
    setSelectedConnectionId(null);
  };

  const downloadCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `prof-joe-academic-board-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      className="whiteboard-container"
      onMouseMove={handleMouseMoveGlobal}
      onMouseUp={handleMouseUpGlobal}
      onTouchMove={handleTouchMoveGlobal}
      onTouchEnd={handleTouchUpGlobal}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px', touchAction: 'none' }}
    >
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Top Academic Bar: 1-Click KaTeX Formula Presets & Triggers */}
      <div
        className="whiteboard-top-deck"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '8px 14px',
          background: 'var(--card-bg, rgba(15, 23, 42, 0.96))',
          borderRadius: '12px',
          border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))',
          boxShadow: 'var(--card-shadow, 0 4px 20px rgba(0,0,0,0.5))',
          flexShrink: 0
        }}
      >
        <div className="whiteboard-top-row" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          {/* Brand Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '5px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex' }}>
              <Sparkles size={16} />
            </div>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>
              Prof. Joe Academic Board
            </span>
          </div>

          {/* Center: Grid Selector Dropdown, Line Style Pill, Fill Mode Pill & Stroke Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {/* GRID DROP DOWN */}
            <select
              value={bgGridType}
              onChange={e => setBgGridType(e.target.value as any)}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.9))',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                fontSize: '0.72rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="grid">Grid: Square</option>
              <option value="dots">Grid: Dot Matrix</option>
              <option value="isometric">Grid: Isometric</option>
              <option value="lined">Grid: Lined Paper</option>
              <option value="none">Grid: None</option>
            </select>

            {/* LINE STYLE MULTI-TOGGLE (Solid / Dashed / Dotted) */}
            <div style={{ display: 'flex', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setLineStyle('solid')}
                style={{ padding: '3px 7px', borderRadius: '4px', border: 'none', background: lineStyle === 'solid' ? '#0284c7' : 'transparent', color: lineStyle === 'solid' ? '#ffffff' : '#94a3b8', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                title="Solid Continuous Line"
              >
                — Solid
              </button>
              <button
                type="button"
                onClick={() => setLineStyle('dashed')}
                style={{ padding: '3px 7px', borderRadius: '4px', border: 'none', background: lineStyle === 'dashed' ? '#0284c7' : 'transparent', color: lineStyle === 'dashed' ? '#ffffff' : '#94a3b8', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                title="Dashed Line (8px dash, 6px gap)"
              >
                ╌╌ Dashed
              </button>
              <button
                type="button"
                onClick={() => setLineStyle('dotted')}
                style={{ padding: '3px 7px', borderRadius: '4px', border: 'none', background: lineStyle === 'dotted' ? '#0284c7' : 'transparent', color: lineStyle === 'dotted' ? '#ffffff' : '#94a3b8', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                title="Dotted Line (2px dot, 5px gap)"
              >
                ⋯ Dotted
              </button>
            </div>

            {/* FILL MODE SELECTOR */}
            <div style={{ display: 'flex', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setFillMode('pastel')}
                style={{ padding: '3px 7px', borderRadius: '4px', border: 'none', background: fillMode === 'pastel' ? '#0284c7' : 'transparent', color: fillMode === 'pastel' ? '#ffffff' : '#94a3b8', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                title="Translucent Pastel Fill"
              >
                ▨ Pastel
              </button>
              <button
                type="button"
                onClick={() => setFillMode('solid')}
                style={{ padding: '3px 7px', borderRadius: '4px', border: 'none', background: fillMode === 'solid' ? '#0284c7' : 'transparent', color: fillMode === 'solid' ? '#ffffff' : '#94a3b8', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                title="Solid Opaque Fill"
              >
                █ Solid
              </button>
              <button
                type="button"
                onClick={() => setFillMode('none')}
                style={{ padding: '3px 7px', borderRadius: '4px', border: 'none', background: fillMode === 'none' ? '#0284c7' : 'transparent', color: fillMode === 'none' ? '#ffffff' : '#94a3b8', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                title="Outline Only (No Fill)"
              >
                ▢ Outline
              </button>
            </div>

            {/* Stroke Width Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', padding: '2px 8px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 700 }}>{strokeWidth}px</span>
              <input
                type="range"
                min={1}
                max={24}
                value={strokeWidth}
                onChange={e => setStrokeWidth(Number(e.target.value))}
                style={{ width: '60px', height: '4px', cursor: 'pointer' }}
              />
            </div>

            {/* Quick Color Swatches */}
            {['#38bdf8', '#22c55e', '#facc15', '#ec4899', '#a855f7', '#f8fafc'].map(col => (
              <div
                key={col}
                onClick={() => setStrokeColor(col)}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: col,
                  border: strokeColor === col ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                  boxShadow: strokeColor === col ? `0 0 8px ${col}` : 'none'
                }}
              />
            ))}
          </div>

          {/* Action Controls & Triggers */}
          <div className="whiteboard-action-strip" style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
            {/* Relationship Forming Toggle */}
            <button
              type="button"
              onClick={() => {
                setRelationshipMode(prev => !prev);
                setSelectedConnectionId(null);
              }}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: relationshipMode ? 'rgba(6, 182, 212, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))',
                border: relationshipMode ? '1px solid #06b6d4' : '1px solid #334155',
                color: relationshipMode ? '#22d3ee' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: relationshipMode ? '0 0 10px rgba(6, 182, 212, 0.3)' : 'none'
              }}
              title="Toggle Entity Relationship Anchor Spots"
            >
              <Link2 size={13} />
              <span>{relationshipMode ? '🔗 Connect ON' : '🔗 Connect Spots'}</span>
            </button>

            {/* Insert Image Trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                color: '#34d399',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ImageIcon size={13} />
              <span>🖼️ Image</span>
            </button>

            {/* Sticky Note Trigger */}
            <button
              type="button"
              onClick={() => setShowQuickNoteModal(true)}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid #f59e0b',
                color: '#fbbf24',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <StickyNote size={13} />
              <span>📝 Note</span>
            </button>

            {/* AI Generator Trigger */}
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(99, 102, 241, 0.25))',
                border: '1px solid #a855f7',
                color: '#c084fc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Wand2 size={13} />
              <span>✨ AI Formula</span>
            </button>

            {/* Custom Formula Trigger */}
            <button
              type="button"
              onClick={() => {
                setEditingItemId(null);
                setCustomFormulaName('');
                setCustomFormulaLatex('');
                setCustomFormulaExplanation('');
                setShowFormulaModal(true);
              }}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'rgba(2, 132, 199, 0.2)',
                border: '1px solid #0284c7',
                color: '#38bdf8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Plus size={13} />
              <span>+ LaTeX</span>
            </button>

            {/* Download PNG */}
            <button
              type="button"
              onClick={downloadCanvasImage}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Download Whiteboard as PNG"
            >
              <Download size={13} />
              <span>Save PNG</span>
            </button>
          </div>
        </div>

        {/* ─── DOCKED SELECTION INSPECTOR DECK (DOCKED RIGHT BELOW MENU BAR) ─── */}
        {(() => {
          const selectedItem = items.find(it => it.id === selectedItemId);
          if (!selectedItem) return null;

          const isShape = selectedItem.type !== 'formula' && selectedItem.type !== 'note' && selectedItem.type !== 'image';

          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '10px 14px',
                background: 'var(--card-bg, rgba(15, 23, 42, 0.96))',
                backdropFilter: 'blur(16px)',
                borderRadius: '12px',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                zIndex: 40
              }}
            >
              {/* ROW 1: Item Identity, Dimensions (W, H, Lock), Rotation, Animations & Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                {/* Left: Item Badge & Lock Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.03em'
                    }}
                  >
                    {selectedItem.name || selectedItem.type.toUpperCase()}
                  </span>
                  {selectedItem.locked && (
                    <span style={{ fontSize: '0.68rem', color: '#f87171', fontWeight: 700 }}>🔒 Locked</span>
                  )}
                </div>

                {/* Center: Dimensions Deck with Direct Numeric Inputs, +/- buttons and Lock Ratio */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.7))', padding: '2px 8px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))' }}>
                  {/* Width Control */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary, #94a3b8)' }}>W:</span>
                    <input
                      type="number"
                      value={selectedItem.width}
                      onChange={e => {
                        const newW = Math.max(20, parseInt(e.target.value) || 20);
                        setItems(prev =>
                          prev.map(it =>
                            it.id === selectedItem.id
                              ? {
                                  ...it,
                                  width: newW,
                                  height: it.aspectRatioLocked ? Math.round(newW * (it.height / it.width)) : it.height
                                }
                              : it
                          )
                        );
                      }}
                      style={{
                        width: '52px',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        background: '#0f172a',
                        border: '1px solid #334155',
                        color: '#38bdf8',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setItems(prev =>
                          prev.map(it =>
                            it.id === selectedItem.id
                              ? {
                                  ...it,
                                  width: it.width + 10,
                                  height: it.aspectRatioLocked ? it.height + 10 : it.height
                                }
                              : it
                          )
                        );
                      }}
                      style={{ padding: '2px 5px', borderRadius: '4px', background: '#334155', color: 'var(--text-primary, #f8fafc)', border: 'none', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setItems(prev =>
                          prev.map(it =>
                            it.id === selectedItem.id
                              ? {
                                  ...it,
                                  width: Math.max(30, it.width - 10),
                                  height: it.aspectRatioLocked ? Math.max(30, it.height - 10) : it.height
                                }
                              : it
                          )
                        );
                      }}
                      style={{ padding: '2px 5px', borderRadius: '4px', background: '#334155', color: 'var(--text-primary, #f8fafc)', border: 'none', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      -
                    </button>
                  </div>

                  {/* Lock Aspect Ratio Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setItems(prev =>
                        prev.map(it =>
                          it.id === selectedItem.id ? { ...it, aspectRatioLocked: !it.aspectRatioLocked } : it
                        )
                      );
                    }}
                    style={{
                      padding: '3px 6px',
                      borderRadius: '5px',
                      background: selectedItem.aspectRatioLocked ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                      border: `1px solid ${selectedItem.aspectRatioLocked ? '#38bdf8' : 'rgba(100, 116, 139, 0.4)'}`,
                      color: selectedItem.aspectRatioLocked ? '#38bdf8' : '#94a3b8',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                    title={selectedItem.aspectRatioLocked ? 'Aspect Ratio Locked (1:1 / Fixed)' : 'Aspect Ratio Unlocked (Free Resize)'}
                  >
                    <span>{selectedItem.aspectRatioLocked ? '⛓️ 1:1' : '🔓 Free'}</span>
                  </button>

                  {/* Height Control */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary, #94a3b8)' }}>H:</span>
                    <input
                      type="number"
                      value={selectedItem.height}
                      onChange={e => {
                        const newH = Math.max(20, parseInt(e.target.value) || 20);
                        setItems(prev =>
                          prev.map(it =>
                            it.id === selectedItem.id
                              ? {
                                  ...it,
                                  height: newH,
                                  width: it.aspectRatioLocked ? Math.round(newH * (it.width / it.height)) : it.width
                                }
                              : it
                          )
                        );
                      }}
                      style={{
                        width: '52px',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        background: '#0f172a',
                        border: '1px solid #334155',
                        color: '#38bdf8',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setItems(prev =>
                          prev.map(it =>
                            it.id === selectedItem.id
                              ? {
                                  ...it,
                                  height: it.height + 10,
                                  width: it.aspectRatioLocked ? it.width + 10 : it.width
                                }
                              : it
                          )
                        );
                      }}
                      style={{ padding: '2px 5px', borderRadius: '4px', background: '#334155', color: 'var(--text-primary, #f8fafc)', border: 'none', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setItems(prev =>
                          prev.map(it =>
                            it.id === selectedItem.id
                              ? {
                                  ...it,
                                  height: Math.max(30, it.height - 10),
                                  width: it.aspectRatioLocked ? Math.max(30, it.width - 10) : it.width
                                }
                              : it
                          )
                        );
                      }}
                      style={{ padding: '2px 5px', borderRadius: '4px', background: '#334155', color: 'var(--text-primary, #f8fafc)', border: 'none', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      -
                    </button>
                  </div>
                </div>

                {/* Center: Rotation Angle Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.7))', padding: '2px 8px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#c084fc' }}>
                    {Math.round(selectedItem.rotation || 0)}°
                  </span>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={selectedItem.rotation || 0}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      setItems(prev => prev.map(it => it.id === selectedItem.id ? { ...it, rotation: val } : it));
                    }}
                    style={{ width: '55px', accentColor: '#c084fc', cursor: 'pointer' }}
                  />
                  <button
                    type="button"
                    onClick={() => setItems(prev => prev.map(it => it.id === selectedItem.id ? { ...it, rotation: 0 } : it))}
                    style={{ padding: '2px 4px', borderRadius: '4px', background: '#334155', color: 'var(--text-primary, #cbd5e1)', border: 'none', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 700 }}
                    title="Reset Angle to 0°"
                  >
                    0°
                  </button>
                  <button
                    type="button"
                    onClick={() => setItems(prev => prev.map(it => it.id === selectedItem.id ? { ...it, rotation: ((it.rotation || 0) + 15) % 360 } : it))}
                    style={{ padding: '2px 4px', borderRadius: '4px', background: '#334155', color: 'var(--text-primary, #cbd5e1)', border: 'none', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 700 }}
                    title="+15° Rotation Step"
                  >
                    ↻+15
                  </button>
                  <button
                    type="button"
                    onClick={() => setItems(prev => prev.map(it => it.id === selectedItem.id ? { ...it, rotation: ((it.rotation || 0) + 90) % 360 } : it))}
                    style={{ padding: '2px 4px', borderRadius: '4px', background: '#334155', color: 'var(--text-primary, #cbd5e1)', border: 'none', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 700 }}
                    title="+90° Rotation Step"
                  >
                    +90°
                  </button>
                </div>

                {/* Right Actions: Multi-Point Waypoint Deck, Glow, Spin, Edit, Lock, Duplicate, Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                  {/* Add Waypoint Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSettingWaypointForId(selectedItem.id);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: settingWaypointForId === selectedItem.id ? 'rgba(234, 179, 8, 0.35)' : 'rgba(51, 65, 85, 0.8)',
                      color: settingWaypointForId === selectedItem.id ? '#facc15' : '#f8fafc',
                      border: `1px solid ${settingWaypointForId === selectedItem.id ? '#eab308' : 'rgba(100, 116, 139, 0.5)'}`,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Click on the chalkboard to add custom Waypoint Pins"
                  >
                    <span>📍 + Waypoint</span>
                    {((selectedItem.waypoints?.length || (selectedItem.waypointEnd ? 1 : 0)) > 0) && (
                      <span style={{ background: '#eab308', color: '#0f172a', borderRadius: '4px', padding: '1px 4px', fontSize: '0.62rem', fontWeight: 900 }}>
                        {selectedItem.waypoints?.length || 1}
                      </span>
                    )}
                  </button>

                  {/* Start / Pause Patrol Motion */}
                  {((selectedItem.waypoints && selectedItem.waypoints.length > 0) || selectedItem.waypointEnd) && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setItems(prev =>
                            prev.map(it =>
                              it.id === selectedItem.id ? { ...it, isAnimatingMove: !it.isAnimatingMove } : it
                            )
                          );
                        }}
                        style={{
                          padding: '4px 7px',
                          borderRadius: '6px',
                          background: selectedItem.isAnimatingMove ? 'rgba(34, 197, 94, 0.3)' : 'rgba(51, 65, 85, 0.8)',
                          color: selectedItem.isAnimatingMove ? '#4ade80' : '#f8fafc',
                          border: `1px solid ${selectedItem.isAnimatingMove ? '#22c55e' : 'rgba(100, 116, 139, 0.5)'}`,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title={selectedItem.isAnimatingMove ? 'Pause Patrol Animation' : 'Start Multi-Point Patrol Animation'}
                      >
                        <Move size={11} />
                        <span>{selectedItem.isAnimatingMove ? '⏸️ Pause' : '▶️ Patrol'}</span>
                      </button>

                      {/* Speed Multiplier Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const speeds = [0.5, 1.0, 1.5, 2.0, 3.0];
                          const curSpeed = selectedItem.patrolSpeed || 1.0;
                          const nextIdx = (speeds.indexOf(curSpeed) + 1) % speeds.length;
                          const nextSpeed = speeds[nextIdx !== -1 ? nextIdx : 1];
                          setItems(prev =>
                            prev.map(it => (it.id === selectedItem.id ? { ...it, patrolSpeed: nextSpeed } : it))
                          );
                        }}
                        style={{
                          padding: '4px 6px',
                          borderRadius: '6px',
                          background: 'rgba(56, 189, 248, 0.2)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                        title="Click to cycle motion speed (0.5x, 1x, 1.5x, 2x, 3x)"
                      >
                        ⚡ {selectedItem.patrolSpeed || 1}x
                      </button>

                      {/* Loop / Bounce Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          setItems(prev =>
                            prev.map(it =>
                              it.id === selectedItem.id
                                ? { ...it, patrolLoop: !(it.patrolLoop !== false) }
                                : it
                            )
                          );
                        }}
                        style={{
                          padding: '4px 6px',
                          borderRadius: '6px',
                          background: selectedItem.patrolLoop !== false ? 'rgba(168, 85, 247, 0.25)' : 'rgba(51, 65, 85, 0.8)',
                          color: selectedItem.patrolLoop !== false ? '#c084fc' : '#94a3b8',
                          border: `1px solid ${selectedItem.patrolLoop !== false ? '#a855f7' : 'rgba(100, 116, 139, 0.4)'}`,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title={selectedItem.patrolLoop !== false ? 'Looping closed circuit (P0->Pn->P0)' : 'Ping-pong bounce back-and-forth'}
                      >
                        {selectedItem.patrolLoop !== false ? '🔁 Loop' : '↔️ Bounce'}
                      </button>

                      {/* Clear Waypoints */}
                      <button
                        type="button"
                        onClick={() => {
                          setItems(prev =>
                            prev.map(it =>
                              it.id === selectedItem.id
                                ? { ...it, waypoints: [], waypointEnd: undefined, isAnimatingMove: false }
                                : it
                            )
                          );
                          setSettingWaypointForId(null);
                        }}
                        style={{
                          padding: '4px 6px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="Clear all waypoints for this object"
                      >
                        🗑️ Path
                      </button>
                    </>
                  )}

                  {/* Breathing Vector Outline Glow Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setItems(prev =>
                        prev.map(it =>
                          it.id === selectedItem.id ? { ...it, isGlowing: !it.isGlowing } : it
                        )
                      );
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: selectedItem.isGlowing ? 'rgba(250, 204, 21, 0.3)' : 'rgba(51, 65, 85, 0.8)',
                      color: selectedItem.isGlowing ? '#facc15' : '#f8fafc',
                      border: `1px solid ${selectedItem.isGlowing ? '#facc15' : 'rgba(100, 116, 139, 0.5)'}`,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Toggle True Vector Silhouette Breathing Glow"
                  >
                    <Sparkles size={12} />
                    <span>{selectedItem.isGlowing ? '✨ Glow ON' : '✨ Glow'}</span>
                  </button>

                  {/* Universal Spin 360° Animation Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setItems(prev =>
                        prev.map(it =>
                          it.id === selectedItem.id ? { ...it, isSpinning: !it.isSpinning } : it
                        )
                      );
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: selectedItem.isSpinning ? 'rgba(168, 85, 247, 0.3)' : 'rgba(51, 65, 85, 0.8)',
                      color: selectedItem.isSpinning ? '#c084fc' : '#f8fafc',
                      border: `1px solid ${selectedItem.isSpinning ? '#a855f7' : 'rgba(100, 116, 139, 0.5)'}`,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Toggle Universal Continuous 360° Spin"
                  >
                    <RotateCw size={12} />
                    <span>{selectedItem.isSpinning ? '💫 Spin ON' : '💫 Spin'}</span>
                  </button>

                  {/* Universal Continuous 3D Coin Flip Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setItems(prev =>
                        prev.map(it =>
                          it.id === selectedItem.id ? { ...it, isFlipping: !it.isFlipping } : it
                        )
                      );
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: selectedItem.isFlipping ? 'rgba(234, 179, 8, 0.3)' : 'rgba(51, 65, 85, 0.8)',
                      color: selectedItem.isFlipping ? '#facc15' : '#f8fafc',
                      border: `1px solid ${selectedItem.isFlipping ? '#eab308' : 'rgba(100, 116, 139, 0.5)'}`,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Toggle Universal Continuous 3D Coin Flip"
                  >
                    <span>{selectedItem.isFlipping ? '🪙 Flip ON' : '🪙 Flip'}</span>
                  </button>

                  {/* Per-Object 🫧 Float Button (Force-Proportional Controlled Nudge) */}
                  <button
                    type="button"
                    onClick={() => {
                      setItems(prev =>
                        prev.map(it =>
                          it.id === selectedItem.id ? { ...it, isFloating: !it.isFloating, vx: 0, vy: 0 } : it
                        )
                      );
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: selectedItem.isFloating ? 'rgba(56, 189, 248, 0.35)' : 'rgba(51, 65, 85, 0.8)',
                      color: selectedItem.isFloating ? '#38bdf8' : '#f8fafc',
                      border: `1px solid ${selectedItem.isFloating ? '#38bdf8' : 'rgba(100, 116, 139, 0.5)'}`,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Toggle Force-Proportional Float (Gentle nudge moves ~10-30px; proportional to flick force)"
                  >
                    <span>{selectedItem.isFloating ? '🫧 Float ON' : '🫧 Float'}</span>
                  </button>

                  {/* Per-Object 💨 Drift Button (Slow Ambient Drift Motion) */}
                  <button
                    type="button"
                    onClick={() => {
                      setItems(prev =>
                        prev.map(it =>
                          it.id === selectedItem.id ? { ...it, isDrifting: !it.isDrifting, driftPhase: Math.random() * 6.28 } : it
                        )
                      );
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: selectedItem.isDrifting ? 'rgba(168, 85, 247, 0.35)' : 'rgba(51, 65, 85, 0.8)',
                      color: selectedItem.isDrifting ? '#c084fc' : '#f8fafc',
                      border: `1px solid ${selectedItem.isDrifting ? '#a855f7' : 'rgba(100, 116, 139, 0.5)'}`,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Toggle Slow Ambient Floating Kinetic Drift"
                  >
                    <span>{selectedItem.isDrifting ? '💨 Drift ON' : '💨 Drift'}</span>
                  </button>

                  {/* Per-Object 💥 Repel Button (Magnetic Cursor Repulsion Field) */}
                  <button
                    type="button"
                    onClick={() => {
                      setItems(prev =>
                        prev.map(it =>
                          it.id === selectedItem.id ? { ...it, isRepelling: !it.isRepelling, vx: 0, vy: 0 } : it
                        )
                      );
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: selectedItem.isRepelling ? 'rgba(239, 68, 68, 0.35)' : 'rgba(51, 65, 85, 0.8)',
                      color: selectedItem.isRepelling ? '#f87171' : '#f8fafc',
                      border: `1px solid ${selectedItem.isRepelling ? '#ef4444' : 'rgba(100, 116, 139, 0.5)'}`,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Toggle Magnetic Cursor Repulsion (Item repels away when cursor approaches)"
                  >
                    <span>{selectedItem.isRepelling ? '💥 Repel ON' : '💥 Repel'}</span>
                  </button>

                  {/* Edit / Text Content */}
                  {isShape && (
                    <button
                      type="button"
                      onClick={() => openEditShapeModal(selectedItem)}
                      style={{ padding: '4px 7px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                      title="Edit Shape Details and Inner Text"
                    >
                      <span>✏️ Edit</span>
                    </button>
                  )}

                  {/* Lock Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setItems(prev =>
                        prev.map(it => (it.id === selectedItem.id ? { ...it, locked: !it.locked } : it))
                      );
                    }}
                    style={{ padding: '4px 6px', borderRadius: '6px', background: selectedItem.locked ? 'rgba(239, 68, 68, 0.25)' : 'rgba(51, 65, 85, 0.8)', color: selectedItem.locked ? '#f87171' : '#f8fafc', border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    {selectedItem.locked ? <Lock size={11} /> : <Unlock size={11} />}
                  </button>

                  {/* Duplicate */}
                  <button
                    type="button"
                    onClick={() => {
                      const newItem: ChalkboardItem = {
                        ...selectedItem,
                        id: `dup_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                        x: selectedItem.x + 30,
                        y: selectedItem.y + 30
                      };
                      setItems(prev => [...prev, newItem]);
                      setSelectedItemId(newItem.id);
                    }}
                    style={{ padding: '4px 6px', borderRadius: '6px', background: 'rgba(51, 65, 85, 0.8)', color: 'var(--text-primary, #f8fafc)', border: '1px solid rgba(100, 116, 139, 0.5)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Copy size={11} />
                  </button>

                  {/* Delete Item */}
                  <button
                    type="button"
                    onClick={() => {
                      deleteItem(selectedItem.id);
                      setSelectedItemId(null);
                    }}
                    style={{ padding: '4px 6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Trash2 size={11} />
                  </button>

                  {/* Close Inspector */}
                  <button
                    type="button"
                    onClick={() => setSelectedItemId(null)}
                    style={{ padding: '4px', borderRadius: '6px', background: 'transparent', color: 'var(--text-secondary, #94a3b8)', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* ROW 2: DYNAMIC SMASH / MORPH SHAPE STRIP & STYLE CONTROLS (WHEN SHAPE IS SELECTED) */}
              {isShape && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(51, 65, 85, 0.6)'
                  }}
                >
                  {/* Smash / Morph Chips */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#facc15', marginRight: '4px' }}>
                      ⚡ SMASH SHAPE:
                    </span>
                    {ACADEMIC_SHAPES_CATALOG.map(s => {
                      const isActiveShape = selectedItem.type === s.type;
                      return (
                        <button
                          key={s.type}
                          type="button"
                          onClick={() => {
                            setItems(prev =>
                              prev.map(it => {
                                if (it.id !== selectedItem.id) return it;
                                let newW = it.width;
                                let newH = it.height;
                                if (s.type === 'circle') {
                                  const side = Math.max(it.width, it.height);
                                  newW = side;
                                  newH = side;
                                }
                                return {
                                  ...it,
                                  type: s.type,
                                  width: newW,
                                  height: newH,
                                  aspectRatioLocked: s.type === 'circle' ? true : it.aspectRatioLocked
                                };
                              })
                            );
                          }}
                          style={{
                            padding: '3px 6px',
                            borderRadius: '5px',
                            background: isActiveShape ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))',
                            border: `1px solid ${isActiveShape ? '#38bdf8' : 'rgba(51, 65, 85, 0.8)'}`,
                            color: isActiveShape ? '#38bdf8' : '#cbd5e1',
                            fontSize: '0.67rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                          title={`Morph into ${s.label}`}
                        >
                          <span>{s.icon}</span>
                          <span>{s.label.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Shape Styling Controls: Color Swatches, Fill Mode, Line Style, Corner Radius */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Corner Radius Slider (for Rect / Rounded) */}
                    {(selectedItem.type === 'rect' || selectedItem.type === 'rounded_rect') && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))', padding: '2px 6px', borderRadius: '5px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary, #94a3b8)' }}>Round:</span>
                        <input
                          type="range"
                          min={0}
                          max={40}
                          value={selectedItem.cornerRadius ?? 8}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setItems(prev =>
                              prev.map(it => (it.id === selectedItem.id ? { ...it, cornerRadius: val } : it))
                            );
                          }}
                          style={{ width: '45px', accentColor: '#38bdf8', cursor: 'pointer' }}
                        />
                      </div>
                    )}

                    {/* Polygon Vertices Slider */}
                    {selectedItem.type === 'polygon' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))', padding: '2px 6px', borderRadius: '5px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary, #94a3b8)' }}>Sides ({selectedItem.polygonEdges || 5}):</span>
                        <input
                          type="range"
                          min={3}
                          max={12}
                          value={selectedItem.polygonEdges ?? 5}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setItems(prev =>
                              prev.map(it => (it.id === selectedItem.id ? { ...it, polygonEdges: val } : it))
                            );
                          }}
                          style={{ width: '45px', accentColor: '#38bdf8', cursor: 'pointer' }}
                        />
                      </div>
                    )}

                    {/* Color Swatches */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {['#38bdf8', '#c084fc', '#34d399', '#facc15', '#f87171', '#fb923c', '#ffffff'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setItems(prev =>
                              prev.map(it => (it.id === selectedItem.id ? { ...it, color: c } : it))
                            );
                          }}
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: c,
                            border: selectedItem.color === c ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.5)',
                            cursor: 'pointer',
                            transform: selectedItem.color === c ? 'scale(1.2)' : 'scale(1)'
                          }}
                        />
                      ))}
                    </div>

                    {/* Fill Mode */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      {(['pastel', 'solid', 'none'] as const).map(fm => (
                        <button
                          key={fm}
                          type="button"
                          onClick={() => {
                            setItems(prev =>
                              prev.map(it => (it.id === selectedItem.id ? { ...it, fillMode: fm } : it))
                            );
                          }}
                          style={{
                            padding: '2px 5px',
                            borderRadius: '4px',
                            background: selectedItem.fillMode === fm ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))',
                            color: selectedItem.fillMode === fm ? '#38bdf8' : '#94a3b8',
                            border: 'none',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {fm.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Main Board Viewport with Infinite Pan + HTML5 Canvas + Draggable Items */}
      <div
        className="whiteboard-canvas-viewport"
        ref={boardContainerRef}
        onMouseMove={handleMouseMoveGlobal}
        onMouseLeave={() => setLaserPos(null)}
        onTouchMove={handleTouchMoveGlobal}
        onTouchEnd={handleTouchUpGlobal}
        style={{
          flex: 1,
          height: '100%',
          minHeight: 0,
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))',
          boxShadow: 'var(--card-shadow, 0 10px 30px rgba(0, 0, 0, 0.5))',
          position: 'relative',
          background: isLightMode ? '#ffffff' : 'var(--bg-primary, #0b1120)',
          touchAction: 'none'
        }}
      >
        {/* ─── VERTICAL LEFT DOCKED TOOLBAR WITH RICH FLYOUTS ─── */}
        <div
          className="whiteboard-left-toolbar"
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 35,
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            padding: '5px',
            background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
            backdropFilter: 'blur(16px)',
            borderRadius: '12px',
            border: '1px solid var(--card-border, rgba(51, 65, 85, 0.8))',
            boxShadow: 'var(--card-shadow, 0 8px 30px rgba(0, 0, 0, 0.6))'
          }}
        >
          {/* 1. SELECT (POINTER) */}
          <button
            type="button"
            onClick={() => { setActiveTool('select'); setActiveFlyout('none'); }}
            style={{ width: '38px', height: '38px', borderRadius: '8px', background: activeTool === 'select' ? 'rgba(56, 189, 248, 0.25)' : 'transparent', color: activeTool === 'select' ? '#38bdf8' : '#94a3b8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Select & Move Objects / Cards"
          >
            <MousePointer size={18} />
          </button>

          {/* 2. HAND (PAN) */}
          <button
            type="button"
            onClick={() => { setActiveTool('hand'); setActiveFlyout('none'); }}
            style={{ width: '38px', height: '38px', borderRadius: '8px', background: activeTool === 'hand' ? 'rgba(168, 85, 247, 0.25)' : 'transparent', color: activeTool === 'hand' ? '#c084fc' : '#94a3b8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Hand: Pan Canvas Frame"
          >
            <Hand size={18} />
          </button>

          {/* 3. SYMBOL-ONLY LASER WITH COLOR & SHAPE FLYOUT */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setActiveTool('laser');
                setActiveFlyout(activeFlyout === 'laser' ? 'none' : 'laser');
              }}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: activeTool === 'laser' ? `${laserColor}33` : 'transparent',
                color: activeTool === 'laser' ? laserColor : '#94a3b8',
                border: activeTool === 'laser' ? `1px solid ${laserColor}` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: activeTool === 'laser' ? `0 0 10px ${laserColor}66` : 'none'
              }}
              title="🔦"
            >
              <Zap size={18} />
            </button>

            {activeFlyout === 'laser' && (
              <div
                style={{
                  position: 'absolute',
                  left: '52px',
                  top: '-10px',
                  width: '210px',
                  background: 'var(--card-bg, rgba(15, 23, 42, 0.98))',
                  border: `1px solid ${laserColor}88`,
                  borderRadius: '14px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  zIndex: 50,
                  boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                {/* Laser Color Palette */}
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: laserColor, padding: '2px 2px 4px 2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>🎨</span>
                    <span>COLOR</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                    {[
                      { col: '#ef4444' },
                      { col: '#22c55e' },
                      { col: '#06b6d4' },
                      { col: '#a855f7' },
                      { col: '#eab308' },
                      { col: '#f43f5e' }
                    ].map(c => (
                      <button
                        key={c.col}
                        type="button"
                        onClick={() => setLaserColor(c.col)}
                        style={{
                          height: '22px',
                          borderRadius: '6px',
                          background: c.col,
                          border: laserColor === c.col ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.4)',
                          cursor: 'pointer',
                          transform: laserColor === c.col ? 'scale(1.15)' : 'scale(1)',
                          boxShadow: laserColor === c.col ? `0 0 8px ${c.col}` : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Laser Shape Selector */}
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8', padding: '2px 2px 4px 2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📐</span>
                    <span>SHAPE</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                    {[
                      { id: 'dot', symbol: '🔴', label: 'Dot' },
                      { id: 'crosshair', symbol: '🎯', label: 'Reticle' },
                      { id: 'star', symbol: '✨', label: 'Star' },
                      { id: 'ring', symbol: '⭕', label: 'Ring' },
                      { id: 'arrow', symbol: '🔺', label: 'Pointer' }
                    ].map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setLaserShape(s.id as any)}
                        style={{
                          padding: '6px 2px',
                          borderRadius: '6px',
                          background: laserShape === s.id ? `${laserColor}33` : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))',
                          border: laserShape === s.id ? `1.5px solid ${laserColor}` : '1px solid rgba(51, 65, 85, 0.6)',
                          color: 'var(--text-primary, #f8fafc)',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title={s.label}
                      >
                        {s.symbol}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. 💨 PUSH & FLOAT INERTIAL PHYSICS DRIFT TOGGLE */}
          <button
            type="button"
            onClick={togglePushPhysicsMode}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: isPushPhysicsMode ? 'rgba(56, 189, 248, 0.35)' : 'transparent',
              color: isPushPhysicsMode ? '#38bdf8' : '#94a3b8',
              border: isPushPhysicsMode ? '1px solid #38bdf8' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isPushPhysicsMode ? '0 0 12px rgba(56, 189, 248, 0.5)' : 'none'
            }}
            title={isPushPhysicsMode ? '💨 Push & Float Active: Move cursor near items to push them (Click to Freeze/Disable)' : '💨 Enable Push & Float: Cursor impulse physics'}
          >
            <Wind size={18} />
          </button>

          <div style={{ height: '1px', background: 'rgba(51, 65, 85, 0.6)', margin: '2px 0' }} />

          {/* 4. PEN & INKING SUITE FLYOUT TRIGGER */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setActiveFlyout(activeFlyout === 'pen' ? 'none' : 'pen')}
              style={{ width: '38px', height: '38px', borderRadius: '8px', background: activeFlyout === 'pen' || activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'line' || activeTool === 'arrow' || activeTool === 'double_arrow' || activeTool === 'curve' ? 'rgba(168, 85, 247, 0.25)' : 'transparent', color: activeFlyout === 'pen' || activeTool === 'pen' || activeTool === 'highlighter' ? '#c084fc' : '#94a3b8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title="Drawing & Inking Suite"
            >
              <PenTool size={18} />
            </button>

            {activeFlyout === 'pen' && (
              <div
                style={{
                  position: 'absolute',
                  left: '52px',
                  top: '-10px',
                  width: '280px',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  background: 'var(--card-bg, rgba(15, 23, 42, 0.98))',
                  border: '1px solid rgba(168, 85, 247, 0.5)',
                  borderRadius: '14px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  zIndex: 50,
                  boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c084fc', padding: '2px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✏️ INKING & LINES</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary, #94a3b8)' }}>{lineStyle.toUpperCase()}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('pen'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'pen' ? 'rgba(168, 85, 247, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', cursor: 'pointer' }}
                  >
                    ✏️ Pen Tool
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('highlighter'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'highlighter' ? 'rgba(168, 85, 247, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', cursor: 'pointer' }}
                  >
                    🖍️ Highlighter
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('line'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'line' ? 'rgba(168, 85, 247, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', cursor: 'pointer' }}
                  >
                    📏 Straight Line
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('arrow'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'arrow' ? 'rgba(168, 85, 247, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', cursor: 'pointer' }}
                  >
                    ➔ One-Way Arrow
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('double_arrow'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'double_arrow' ? 'rgba(168, 85, 247, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', cursor: 'pointer' }}
                  >
                    ⇄ 2-Way Arrow
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('curve'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'curve' ? 'rgba(168, 85, 247, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', cursor: 'pointer' }}
                  >
                    ➰ Bezier Curve
                  </button>
                </div>

                {/* Highlighter Color Palette */}
                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                    Highlighter Ink Tone:
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { col: '#fef08a', label: 'Neon Yellow' },
                      { col: '#67e8f9', label: 'Aqua Cyan' },
                      { col: '#a7f3d0', label: 'Pastel Lime' },
                      { col: '#fbcfe8', label: 'Hot Pink' }
                    ].map(h => (
                      <button
                        key={h.col}
                        type="button"
                        onClick={() => setHighlighterPaletteColor(h.col)}
                        style={{
                          flex: 1,
                          height: '22px',
                          borderRadius: '6px',
                          background: h.col,
                          border: highlighterPaletteColor === h.col ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.3)',
                          cursor: 'pointer',
                          transform: highlighterPaletteColor === h.col ? 'scale(1.08)' : 'scale(1)'
                        }}
                        title={h.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. ACADEMIC & TEACHING SHAPES SUITE FLYOUT TRIGGER */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setActiveFlyout(activeFlyout === 'shapes' ? 'none' : 'shapes')}
              style={{ width: '38px', height: '38px', borderRadius: '8px', background: activeFlyout === 'shapes' || isShapeTool ? 'rgba(56, 189, 248, 0.25)' : 'transparent', color: activeFlyout === 'shapes' || isShapeTool ? '#38bdf8' : '#94a3b8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title="Academic Shapes & Concept Visualizers"
            >
              <Shapes size={18} />
            </button>

            {activeFlyout === 'shapes' && (
              <div
                style={{
                  position: 'absolute',
                  left: '52px',
                  top: '-10px',
                  width: '300px',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  background: 'var(--card-bg, rgba(15, 23, 42, 0.98))',
                  border: '1px solid rgba(56, 189, 248, 0.5)',
                  borderRadius: '14px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  zIndex: 50,
                  boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                {/* 2D Basics */}
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', padding: '2px 4px' }}>
                  📐 2D GEOMETRY (CIRCLE VS OVAL)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('circle'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'circle' ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ⭕ Circle (1:1 Lock)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('oval'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'oval' ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ⬭ Oval / Ellipse
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('rect'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'rect' ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    ▭ Rectangle
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('rounded_rect'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'rounded_rect' ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    ▢ Rounded Box
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('triangle'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'triangle' ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    🔺 Equilateral △
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('right_triangle'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'right_triangle' ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    📐 Right △ (90°)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('diamond'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'diamond' ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    💎 Diamond
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('hexagon'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'hexagon' ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    ⬡ Hexagon / Benzene
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('parallelogram'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'parallelogram' ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    ▱ Parallelogram
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('trapezoid'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'trapezoid' ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    ⏢ Trapezoid
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('star'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'star' ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    ⭐️ 5-Point Star
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const edges = prompt('Enter number of polygon edges (3 to 12):', polygonEdgeCount.toString()) || '5';
                      const n = Math.max(3, Math.min(12, parseInt(edges) || 5));
                      setPolygonEdgeCount(n);
                      setActiveTool('polygon');
                      setActiveFlyout('none');
                    }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'polygon' ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    ⬡ N-gon ({polygonEdgeCount})
                  </button>
                </div>

                <div style={{ height: '1px', background: 'rgba(51, 65, 85, 0.6)', margin: '4px 0' }} />

                {/* Conceptual & Teaching Visualizers */}
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c084fc', padding: '2px 4px' }}>
                  🧠 TEACHING & CONCEPT VISUALIZERS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('cloud'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'cloud' ? 'rgba(192, 132, 252, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    ☁️ Cloud / Concept
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('thought_bubble'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'thought_bubble' ? 'rgba(192, 132, 252, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    💭 Thought Bubble
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('callout'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'callout' ? 'rgba(192, 132, 252, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    💬 Speech Callout
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('coordinate_axes'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'coordinate_axes' ? 'rgba(192, 132, 252, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    📈 X-Y Axes
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('bracket'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'bracket' ? 'rgba(192, 132, 252, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    {'}'} Curly Braces
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('arrow_block'); setActiveFlyout('none'); }}
                    style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.74rem', background: activeTool === 'arrow_block' ? 'rgba(192, 132, 252, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    ➔ Block Arrow
                  </button>
                </div>

                <div style={{ height: '1px', background: 'rgba(51, 65, 85, 0.6)', margin: '4px 0' }} />

                {/* 3D Solids */}
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#facc15', padding: '2px 4px' }}>
                  🧊 3D SOLID GEOMETRIES
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('cube'); setActiveFlyout('none'); }}
                    style={{ padding: '6px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'center', fontSize: '0.72rem', background: activeTool === 'cube' ? 'rgba(250, 204, 21, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    🧊 Cube
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('cylinder'); setActiveFlyout('none'); }}
                    style={{ padding: '6px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'center', fontSize: '0.72rem', background: activeTool === 'cylinder' ? 'rgba(250, 204, 21, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    🛢️ Cyl
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTool('cone'); setActiveFlyout('none'); }}
                    style={{ padding: '6px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'center', fontSize: '0.72rem', background: activeTool === 'cone' ? 'rgba(250, 204, 21, 0.3)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', cursor: 'pointer' }}
                  >
                    🍦 Cone
                  </button>
                </div>

                <div style={{ height: '1px', background: 'rgba(51, 65, 85, 0.6)', margin: '4px 0' }} />

                {/* 1-Click Teaching Architecture Presets */}
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', padding: '2px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>🏛️ 1-CLICK ARCHITECTURES</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary, #94a3b8)' }}>Zero-Wait</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {ACADEMIC_ARCHITECTURE_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleInsertArchitecturePreset(preset)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))',
                        border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))',
                        color: 'var(--text-primary, #f8fafc)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                      title={preset.description}
                    >
                      <span>{preset.icon}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span style={{ fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{preset.name}</span>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary, #94a3b8)' }}>{preset.category}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ height: '1px', background: 'rgba(51, 65, 85, 0.6)', margin: '4px 0' }} />

                {/* Ask AI to Generate Diagram Button */}
                <button
                  type="button"
                  onClick={() => { setShowAiDiagramModal(true); setActiveFlyout('none'); }}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.35), rgba(99, 102, 241, 0.35))',
                    border: '1px solid rgba(168, 85, 247, 0.6)',
                    color: '#c084fc',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Wand2 size={14} />
                  <span>✨ Ask AI to Generate Diagram</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setShowCustomShapeModal(true); setActiveFlyout('none'); }}
                  style={{ padding: '7px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer', textAlign: 'center' }}
                >
                  📐 + Custom Shape Designer
                </button>
              </div>
            )}
          </div>

          {/* 4. TEXT & NOTES FLYOUT TRIGGER */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setActiveFlyout(activeFlyout === 'text' ? 'none' : 'text')}
              style={{ width: '38px', height: '38px', borderRadius: '8px', background: activeFlyout === 'text' || activeTool === 'text' ? 'rgba(56, 189, 248, 0.25)' : 'transparent', color: activeFlyout === 'text' || activeTool === 'text' ? '#38bdf8' : '#94a3b8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title="Text, LaTeX & Post-it Notes"
            >
              <Type size={18} />
            </button>

            {activeFlyout === 'text' && (
              <div
                style={{
                  position: 'absolute',
                  left: '52px',
                  top: '-10px',
                  width: '220px',
                  background: 'var(--card-bg, rgba(15, 23, 42, 0.98))',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '12px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 50,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', padding: '2px 6px' }}>📝 TEXT & LABELS</div>
                <button
                  type="button"
                  onClick={() => { setActiveTool('text'); setActiveFlyout('none'); }}
                  style={{ padding: '6px 8px', borderRadius: '6px', background: 'transparent', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  ✍️ Direct Canvas Text
                </button>
                <button
                  type="button"
                  onClick={() => { setShowQuickNoteModal(true); setActiveFlyout('none'); }}
                  style={{ padding: '6px 8px', borderRadius: '6px', background: 'transparent', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  📝 Draggable Sticky Note
                </button>
                <button
                  type="button"
                  onClick={() => { setShowFormulaModal(true); setActiveFlyout('none'); }}
                  style={{ padding: '6px 8px', borderRadius: '6px', background: 'transparent', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  📐 + Custom LaTeX Card
                </button>
              </div>
            )}
          </div>

          {/* 5. ERASER FLYOUT TRIGGER */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setActiveFlyout(activeFlyout === 'eraser' ? 'none' : 'eraser')}
              style={{ width: '38px', height: '38px', borderRadius: '8px', background: activeFlyout === 'eraser' || activeTool === 'eraser' || activeTool === 'eraser_object' ? 'rgba(244, 63, 94, 0.25)' : 'transparent', color: activeFlyout === 'eraser' || activeTool === 'eraser' ? '#f43f5e' : '#94a3b8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title="Eraser Suite"
            >
              <Eraser size={18} />
            </button>

            {activeFlyout === 'eraser' && (
              <div
                style={{
                  position: 'absolute',
                  left: '52px',
                  top: '-10px',
                  width: '190px',
                  background: 'var(--card-bg, rgba(15, 23, 42, 0.98))',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  borderRadius: '12px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 50,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f43f5e', padding: '2px 6px' }}>🧹 ERASER TOOLS</div>
                <button
                  type="button"
                  onClick={() => { setActiveTool('eraser_object'); setActiveFlyout('none'); }}
                  style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'eraser_object' ? 'rgba(244, 63, 94, 0.2)' : 'transparent', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  🧹 Object Eraser (Click item)
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTool('eraser'); setActiveFlyout('none'); }}
                  style={{ padding: '6px 8px', borderRadius: '6px', background: activeTool === 'eraser' ? 'rgba(244, 63, 94, 0.2)' : 'transparent', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  ⚪ Whiteout Mask Brush
                </button>
                <button
                  type="button"
                  onClick={() => { clearCanvas(); setActiveFlyout('none'); }}
                  style={{ padding: '6px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'none', textAlign: 'left', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  🗑️ Clear All Board
                </button>
              </div>
            )}
          </div>

          {/* 6. CLASSROOM TEACHING UTILITIES FLYOUT TRIGGER */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setActiveFlyout(activeFlyout === 'utilities' ? 'none' : 'utilities')}
              style={{ width: '38px', height: '38px', borderRadius: '8px', background: activeFlyout === 'utilities' ? 'rgba(168, 85, 247, 0.25)' : 'transparent', color: activeFlyout === 'utilities' ? '#c084fc' : '#94a3b8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title="Classroom Teaching Utilities"
            >
              <Briefcase size={18} />
            </button>

            {activeFlyout === 'utilities' && (
              <div
                style={{
                  position: 'absolute',
                  left: '52px',
                  top: '-10px',
                  width: '210px',
                  background: 'var(--card-bg, rgba(15, 23, 42, 0.98))',
                  border: '1px solid rgba(168, 85, 247, 0.5)',
                  borderRadius: '12px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 50,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#c084fc', padding: '2px 6px' }}>🧰 TEACHING UTILITIES</div>
                <button
                  type="button"
                  onClick={() => { setIsProtractorVisible(!isProtractorVisible); setActiveFlyout('none'); }}
                  style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', background: isProtractorVisible ? 'rgba(56, 189, 248, 0.25)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  📐 {isProtractorVisible ? 'Hide Protractor' : 'Show 180° Protractor'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsDiceRollerVisible(!isDiceRollerVisible); setActiveFlyout('none'); }}
                  style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', background: isDiceRollerVisible ? 'rgba(168, 85, 247, 0.25)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  🎲 {isDiceRollerVisible ? 'Hide Dice Roller' : 'Show 3D Dice Roller'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsTrafficLightVisible(!isTrafficLightVisible); setActiveFlyout('none'); }}
                  style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', background: isTrafficLightVisible ? 'rgba(34, 197, 94, 0.25)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  🚦 {isTrafficLightVisible ? 'Hide Traffic Light' : 'Show Traffic Light'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsStudentPickerVisible(!isStudentPickerVisible); setActiveFlyout('none'); }}
                  style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', background: isStudentPickerVisible ? 'rgba(234, 179, 8, 0.25)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  👥 {isStudentPickerVisible ? 'Hide Student Picker' : 'Show Student Picker'}
                </button>
                <div style={{ height: '1px', background: 'rgba(51, 65, 85, 0.6)', margin: '4px 0' }} />
                <button
                  type="button"
                  onClick={() => { setIsTimerRunning(!isTimerRunning); setActiveFlyout('none'); }}
                  style={{ padding: '6px 8px', borderRadius: '6px', color: 'var(--text-primary, #f8fafc)', border: 'none', textAlign: 'left', fontSize: '0.75rem', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  ⏱️ {isTimerRunning ? 'Pause Timer' : `Timer (${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')})`}
                </button>
              </div>
            )}
          </div>

          <div style={{ height: '1px', background: 'rgba(51, 65, 85, 0.6)', margin: '2px 0' }} />

          {/* 7. UNDO & PAN RESET */}
          <button
            type="button"
            onClick={undoCanvas}
            disabled={canvasHistory.length <= 1}
            style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'transparent', color: canvasHistory.length <= 1 ? '#475569' : '#cbd5e1', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canvasHistory.length <= 1 ? 'not-allowed' : 'pointer' }}
            title="Undo"
          >
            <Undo size={16} />
          </button>

          <button
            type="button"
            onClick={() => setPanOffset({ x: 0, y: 0 })}
            style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'transparent', color: 'var(--text-secondary, #94a3b8)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Reset Canvas Pan Position"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Text Tool Floating Inline Input */}
        {textInputPos && (
          <div
            style={{
              position: 'absolute',
              top: Math.max(10, textInputPos.y + panOffset.y),
              left: Math.max(10, textInputPos.x + panOffset.x),
              zIndex: 35,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--card-bg, rgba(15, 23, 42, 0.96))',
              padding: '6px 10px',
              borderRadius: '10px',
              border: '1px solid #38bdf8',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
            }}
          >
            <input
              type="text"
              autoFocus
              value={textInputValue}
              onChange={e => setTextInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') confirmTextInput();
                if (e.key === 'Escape') setTextInputPos(null);
              }}
              placeholder="Type notes / equation label..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: strokeColor,
                fontSize: '0.85rem',
                fontWeight: 600,
                width: '240px'
              }}
            />
            <button
              type="button"
              onClick={confirmTextInput}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#0284c7',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Place
            </button>
            <button
              type="button"
              onClick={() => setTextInputPos(null)}
              style={{
                padding: '4px',
                borderRadius: '6px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary, #94a3b8)',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* RELATIONSHIP SVG OVERLAY LAYER (Always rendered & connectable between all shapes, formulas & notes) */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 15
          }}
        >
          <defs>
            <marker
              id="rel-arrowhead-cyan"
              markerWidth="10"
              markerHeight="7"
              refX="8"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4" />
            </marker>
            <marker
              id="rel-arrowhead-red"
              markerWidth="10"
              markerHeight="7"
              refX="8"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
            </marker>
          </defs>

          {/* Render Active Connections (Always Visible Even When Connect Spots is OFF) */}
          {connections.map(conn => {
            const fromItem = items.find(c => c.id === conn.fromItemId);
            const toItem = items.find(c => c.id === conn.toItemId);
            if (!fromItem || !toItem) return null;

            const fromCoord = getAnchorCoords(fromItem, conn.fromAnchor);
            const toCoord = getAnchorCoords(toItem, conn.toAnchor);

            const startX = fromCoord.x + panOffset.x;
            const startY = fromCoord.y + panOffset.y;
            const endX = toCoord.x + panOffset.x;
            const endY = toCoord.y + panOffset.y;

            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const isConnSelected = selectedConnectionId === conn.id;

            return (
              <g key={conn.id}>
                {/* Thick Invisible Click Target for easy selecting */}
                <path
                  d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                  stroke="transparent"
                  strokeWidth="18"
                  fill="none"
                  style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedConnectionId(conn.id);
                    setSelectedItemId(null);
                  }}
                />

                {/* Visible Smart Curve Line */}
                <path
                  d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                  stroke={isConnSelected ? '#ef4444' : '#06b6d4'}
                  strokeWidth={isConnSelected ? '3.5' : '2.5'}
                  strokeDasharray={isConnSelected ? 'none' : '6,4'}
                  fill="none"
                  markerEnd={isConnSelected ? 'url(#rel-arrowhead-red)' : 'url(#rel-arrowhead-cyan)'}
                  style={{ pointerEvents: 'none', transition: 'stroke 0.2s ease' }}
                />

                {/* Cardinal Anchor Dots on Endpoints */}
                <circle cx={startX} cy={startY} r="4.5" fill={isConnSelected ? '#ef4444' : '#06b6d4'} />
                <circle cx={endX} cy={endY} r="4.5" fill={isConnSelected ? '#ef4444' : '#06b6d4'} />

                {/* 1-Click Delete Badge when Connection is Selected */}
                {isConnSelected && (
                  <g
                    transform={`translate(${midX - 35}, ${midY - 14})`}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConnections(prev => prev.filter(c => c.id !== conn.id));
                      setSelectedConnectionId(null);
                    }}
                  >
                    <rect
                      width="70"
                      height="24"
                      rx="6"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x="35"
                      y="16"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      ✕ Delete
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Live Elastic Connection Drag Preview */}
          {connectingFrom && tempConnectionEnd && (() => {
            const startX = connectingFrom.startX + panOffset.x;
            const startY = connectingFrom.startY + panOffset.y;
            const endX = tempConnectionEnd.x + panOffset.x;
            const endY = tempConnectionEnd.y + panOffset.y;
            const midX = (startX + endX) / 2;

            return (
              <g>
                <path
                  d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                  strokeDasharray="4,4"
                  fill="none"
                  markerEnd="url(#rel-arrowhead-cyan)"
                />
                <circle cx={startX} cy={startY} r="5" fill="#22d3ee" />
                <circle cx={endX} cy={endY} r="5" fill="#22d3ee" />
              </g>
            );
          })()}

          {/* Multi-Point Waypoint Trajectory Paths (P0 -> P1 -> P2 -> ... Pn -> P0) */}
          {items.filter(it => (it.waypoints && it.waypoints.length > 0) || it.waypointEnd).map(it => {
            const originX = it.x + it.width / 2 + panOffset.x;
            const originY = it.y + it.height / 2 + panOffset.y;
            const wps = it.waypoints && it.waypoints.length > 0
              ? it.waypoints
              : (it.waypointEnd ? [it.waypointEnd] : []);

            const fullCoords = [
              { x: originX, y: originY },
              ...wps.map(p => ({ x: p.x + panOffset.x, y: p.y + panOffset.y }))
            ];
            if (it.patrolLoop !== false && wps.length > 1) {
              fullCoords.push({ x: originX, y: originY });
            }

            // Calculate total path distance
            let totalDist = 0;
            for (let i = 0; i < fullCoords.length - 1; i++) {
              totalDist += Math.hypot(fullCoords[i + 1].x - fullCoords[i].x, fullCoords[i + 1].y - fullCoords[i].y);
            }
            const roundDist = Math.round(totalDist);
            const polyPoints = fullCoords.map(p => `${p.x},${p.y}`).join(' ');

            return (
              <g key={`waypoint-path-${it.id}`}>
                {/* Trajectory Dashed Multi-segment Path */}
                <polyline
                  points={polyPoints}
                  stroke="#eab308"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                  fill="none"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(234, 179, 8, 0.6))' }}
                />

                {/* Origin Home Point 0 Marker */}
                <circle cx={originX} cy={originY} r="7" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
                <text x={originX} y={originY - 12} fill="#06b6d4" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Home P0
                </text>

                {/* Numbered Custom Waypoint Pins P1, P2, P3... */}
                {wps.map((wp, idx) => {
                  const px = wp.x + panOffset.x;
                  const py = wp.y + panOffset.y;
                  return (
                    <g key={`wp-pin-${idx}`}>
                      <circle cx={px} cy={py} r="8" fill="#eab308" stroke="#ffffff" strokeWidth="2" />
                      <text x={px} y={py + 3.5} fill="#0f172a" fontSize="10" fontWeight="900" textAnchor="middle">
                        {idx + 1}
                      </text>
                      <text x={px} y={py - 12} fill="#facc15" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                        Point {idx + 1}
                      </text>
                    </g>
                  );
                })}

                {/* Distance, Waypoint Count & Speed Badge */}
                {wps.length > 0 && (() => {
                  const firstWp = wps[0];
                  const midX = (originX + firstWp.x + panOffset.x) / 2;
                  const midY = (originY + firstWp.y + panOffset.y) / 2;
                  return (
                    <g>
                      <rect
                        x={midX - 60}
                        y={midY - 11}
                        width="120"
                        height="22"
                        rx="11"
                        fill="rgba(15, 23, 42, 0.95)"
                        stroke="#eab308"
                        strokeWidth="1.5"
                      />
                      <text
                        x={midX}
                        y={midY + 4}
                        fill="#facc15"
                        fontSize="9.5"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {wps.length} {wps.length === 1 ? 'Pt' : 'Pts'} · {roundDist}px · {it.patrolSpeed || 1}x {it.isAnimatingMove ? '⚡ PATROL' : '🎯 IDLE'}
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })}
        </svg>

        {/* DRAGGABLE & ROTATABLE VECTOR OBJECTS (KaTeX Formulas, Sticky Notes, Images, Shapes) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            pointerEvents: 'none',
            zIndex: 20
          }}
        >
          {items.map(item => {
            const isSelected = selectedItemId === item.id;
            
            // Dynamic Piecewise Parametric Multi-Point Waypoint Motion Calculation
            let curX = item.x;
            let curY = item.y;

            if (item.isAnimatingMove) {
              const wps = item.waypoints && item.waypoints.length > 0
                ? item.waypoints
                : (item.waypointEnd ? [item.waypointEnd] : []);

              if (wps.length === 1) {
                const target = wps[0];
                const speed = item.patrolSpeed || 1.0;
                const tMove = (Math.sin(animTime * 2.5 * speed) + 1) / 2;
                curX = item.x + (target.x - (item.x + item.width / 2)) * tMove;
                curY = item.y + (target.y - (item.y + item.height / 2)) * tMove;
              } else if (wps.length > 1) {
                const homePoint = { x: item.x + item.width / 2, y: item.y + item.height / 2 };
                const isLoop = item.patrolLoop !== false;
                const fullPath = [homePoint, ...wps];
                if (isLoop) {
                  fullPath.push(homePoint);
                }

                const segDistances: number[] = [];
                let totalPathDist = 0;
                for (let i = 0; i < fullPath.length - 1; i++) {
                  const d = Math.hypot(fullPath[i + 1].x - fullPath[i].x, fullPath[i + 1].y - fullPath[i].y);
                  segDistances.push(d);
                  totalPathDist += d;
                }

                if (totalPathDist > 0) {
                  const speedMultiplier = item.patrolSpeed || 1.0;
                  const speedPxSec = 140 * speedMultiplier;
                  let currentDist = 0;
                  if (isLoop) {
                    currentDist = (animTime * speedPxSec) % totalPathDist;
                  } else {
                    const cycle = (animTime * speedPxSec) % (totalPathDist * 2);
                    currentDist = cycle > totalPathDist ? totalPathDist * 2 - cycle : cycle;
                  }

                  let distAccum = 0;
                  for (let i = 0; i < segDistances.length; i++) {
                    const segLen = segDistances[i];
                    if (currentDist <= distAccum + segLen || i === segDistances.length - 1) {
                      const segT = segLen > 0 ? (currentDist - distAccum) / segLen : 0;
                      const ptA = fullPath[i];
                      const ptB = fullPath[i + 1];
                      const curCenterX = ptA.x + (ptB.x - ptA.x) * segT;
                      const curCenterY = ptA.y + (ptB.y - ptA.y) * segT;
                      curX = curCenterX - item.width / 2;
                      curY = curCenterY - item.height / 2;
                      break;
                    }
                    distAccum += segLen;
                  }
                }
              }
            }

            // Universal Continuous Spin & 3D Coin Flip
            const spinDeg = item.isSpinning ? (animTime * 65) % 360 : 0;
            const totalRotation = ((item.rotation || 0) + spinDeg) % 360;
            const flipDeg = item.isFlipping ? (animTime * 220) % 360 : 0;
            const itemTransform = `rotate(${totalRotation}deg) perspective(600px) rotateY(${flipDeg}deg)`;

            // Harmonic Breathing Vector Outline Glow
            const glow1 = Math.round(6 + Math.sin(animTime * 4) * 4);
            const glow2 = Math.round(14 + Math.sin(animTime * 4) * 8);
            const outlineGlowFilter = item.isGlowing
              ? `drop-shadow(0 0 ${glow1}px ${item.color || '#38bdf8'}) drop-shadow(0 0 ${glow2}px ${item.color || '#38bdf8'}99)`
              : 'none';

            // Anchor Spot Rendering Helper (Common across ALL entity types)
            const renderAnchors = () => {
              if (!relationshipMode) return null;

              const anchors: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'left', 'right'];

              return (
                <>
                  {anchors.map(anchor => {
                    const isHovered = hoveredAnchor?.itemId === item.id && hoveredAnchor?.anchor === anchor;
                    const isSource = connectingFrom?.itemId === item.id && connectingFrom?.anchor === anchor;

                    let posStyle: React.CSSProperties = {};
                    if (anchor === 'top') posStyle = { top: '-7px', left: '50%', transform: 'translateX(-50%)' };
                    if (anchor === 'bottom') posStyle = { bottom: '-7px', left: '50%', transform: 'translateX(-50%)' };
                    if (anchor === 'left') posStyle = { left: '-7px', top: '50%', transform: 'translateY(-50%)' };
                    if (anchor === 'right') posStyle = { right: '-7px', top: '50%', transform: 'translateY(-50%)' };

                    return (
                      <div
                        key={anchor}
                        onMouseDown={(e) => handleAnchorMouseDown(e, item, anchor)}
                        onMouseEnter={() => setHoveredAnchor({ itemId: item.id, anchor })}
                        onMouseLeave={() => setHoveredAnchor(null)}
                        style={{
                          position: 'absolute',
                          ...posStyle,
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: isHovered ? '#10b981' : isSource ? '#f59e0b' : '#06b6d4',
                          border: '2px solid #ffffff',
                          boxShadow: isHovered ? '0 0 12px #10b981' : '0 0 8px #06b6d4',
                          cursor: 'crosshair',
                          pointerEvents: 'auto',
                          zIndex: 30,
                          transform: `${posStyle.transform || ''} ${isHovered ? 'scale(1.4)' : 'scale(1)'}`,
                          transition: 'transform 0.15s ease, background 0.15s ease'
                        }}
                        title={`Connect ${anchor} anchor spot`}
                      />
                    );
                  })}
                </>
              );
            };

            // 1. DRAGGABLE & ROTATABLE VECTOR SHAPES WITH INNER TEXT LABELS
            const isShape = item.type !== 'formula' && item.type !== 'note' && item.type !== 'image';

            if (isShape) {
              const shapeColor = item.color || '#38bdf8';
              const sWidth = item.strokeWidth || 3;
              const w = item.width;
              const h = item.height;

              // Line Style stroke-dasharray
              const dashArray = item.lineStyle === 'dashed' ? '8,6' : item.lineStyle === 'dotted' ? '2,5' : 'none';

              // Fill color calculation based on fillMode
              let computedFill = 'rgba(15, 23, 42, 0.6)';
              if (item.fillMode === 'none') {
                computedFill = 'none';
              } else if (item.fillMode === 'solid') {
                computedFill = item.fillColor || shapeColor;
              } else if (item.fillMode === 'pastel') {
                computedFill = item.fillColor || `${shapeColor}33`;
              }

              return (
                <div
                  key={item.id}
                  onMouseDown={e => handleItemMouseDown(e, item)}
                  onTouchStart={e => handleItemTouchStart(e, item)}
                  onDoubleClick={() => openEditShapeModal(item)}
                  style={{
                    position: 'absolute',
                    top: curY,
                    left: curX,
                    width: `${w}px`,
                    height: `${h}px`,
                    pointerEvents: 'auto',
                    cursor: activeTool === 'select' ? (draggingItemId === item.id ? 'grabbing' : 'grab') : 'default',
                    transform: itemTransform,
                    transformOrigin: 'center center',
                    boxSizing: 'border-box',
                    filter: outlineGlowFilter
                  }}
                >
                  {renderAnchors()}

                  {/* Top Rotation Handle on Selection */}
                  {isSelected && activeTool === 'select' && (
                    <>
                      {/* Selection Outline */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: '-5px',
                          border: '1.5px dashed #38bdf8',
                          borderRadius: '8px',
                          pointerEvents: 'none'
                        }}
                      />

                      {/* Rotation Stem & Handle */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '-26px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          zIndex: 40
                        }}
                      >
                        <div
                          onMouseDown={(e) => handleRotateStart(e, item)}
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#38bdf8',
                            border: '2px solid #ffffff',
                            cursor: 'grab',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
                          }}
                          title={`Drag to rotate (Current: ${Math.round(totalRotation)}°)`}
                        >
                          <RotateCw size={10} color="#0f172a" />
                        </div>
                        <div style={{ width: '1.5px', height: '8px', background: '#38bdf8' }} />
                      </div>
                    </>
                  )}

                  {/* SVG Shape Graphic */}
                  <svg
                    style={{ width: '100%', height: '100%', overflow: 'visible' }}
                    viewBox={`0 0 ${w} ${h}`}
                  >
                    {/* Circle (1:1 Aspect Ratio) */}
                    {item.type === 'circle' && (
                      <circle
                        cx={w / 2}
                        cy={h / 2}
                        r={Math.max(1, (Math.min(w, h) - sWidth) / 2)}
                        fill={computedFill}
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                        strokeDasharray={dashArray}
                      />
                    )}

                    {/* Oval / Free Ellipse */}
                    {item.type === 'oval' && (
                      <ellipse
                        cx={w / 2}
                        cy={h / 2}
                        rx={Math.max(1, (w - sWidth) / 2)}
                        ry={Math.max(1, (h - sWidth) / 2)}
                        fill={computedFill}
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                        strokeDasharray={dashArray}
                      />
                    )}

                    {/* Rectangle */}
                    {item.type === 'rect' && (
                      <rect
                        x={sWidth / 2}
                        y={sWidth / 2}
                        width={Math.max(1, w - sWidth)}
                        height={Math.max(1, h - sWidth)}
                        rx={item.cornerRadius || 4}
                        fill={computedFill}
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                        strokeDasharray={dashArray}
                      />
                    )}

                    {/* Rounded Rectangle */}
                    {item.type === 'rounded_rect' && (
                      <rect
                        x={sWidth / 2}
                        y={sWidth / 2}
                        width={Math.max(1, w - sWidth)}
                        height={Math.max(1, h - sWidth)}
                        rx={item.cornerRadius || 16}
                        fill={computedFill}
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                        strokeDasharray={dashArray}
                      />
                    )}

                    {/* Equilateral Triangle */}
                    {item.type === 'triangle' && (
                      <polygon
                        points={`${w / 2},${sWidth} ${w - sWidth},${h - sWidth} ${sWidth},${h - sWidth}`}
                        fill={computedFill}
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                        strokeDasharray={dashArray}
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Right-Angled Triangle with 90° Corner Box */}
                    {item.type === 'right_triangle' && (() => {
                      const boxSize = Math.min(18, Math.min(w, h) * 0.2);
                      return (
                        <g>
                          <polygon
                            points={`${sWidth},${sWidth} ${sWidth},${h - sWidth} ${w - sWidth},${h - sWidth}`}
                            fill={computedFill}
                            stroke={shapeColor}
                            strokeWidth={sWidth}
                            strokeDasharray={dashArray}
                            strokeLinejoin="round"
                          />
                          <rect
                            x={sWidth}
                            y={h - sWidth - boxSize}
                            width={boxSize}
                            height={boxSize}
                            fill="none"
                            stroke={shapeColor}
                            strokeWidth={Math.max(1, sWidth * 0.75)}
                          />
                        </g>
                      );
                    })()}

                    {/* Diamond */}
                    {item.type === 'diamond' && (
                      <polygon
                        points={`${w / 2},${sWidth} ${w - sWidth},${h / 2} ${w / 2},${h - sWidth} ${sWidth},${h / 2}`}
                        fill={computedFill}
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                        strokeDasharray={dashArray}
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Hexagon (Benzene Ring) */}
                    {item.type === 'hexagon' && (() => {
                      const cx = w / 2;
                      const cy = h / 2;
                      const rx = (w - sWidth) / 2;
                      const ry = (h - sWidth) / 2;
                      let pts = '';
                      for (let i = 0; i < 6; i++) {
                        const angle = ((i * 60 - 30) * Math.PI) / 180;
                        pts += `${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)} `;
                      }
                      return (
                        <polygon
                          points={pts.trim()}
                          fill={computedFill}
                          stroke={shapeColor}
                          strokeWidth={sWidth}
                          strokeDasharray={dashArray}
                          strokeLinejoin="round"
                        />
                      );
                    })()}

                    {/* Parallelogram */}
                    {item.type === 'parallelogram' && (() => {
                      const skew = Math.min(30, w * 0.2);
                      return (
                        <polygon
                          points={`${skew},${sWidth} ${w - sWidth},${sWidth} ${w - skew},${h - sWidth} ${sWidth},${h - sWidth}`}
                          fill={computedFill}
                          stroke={shapeColor}
                          strokeWidth={sWidth}
                          strokeDasharray={dashArray}
                          strokeLinejoin="round"
                        />
                      );
                    })()}

                    {/* Trapezoid */}
                    {item.type === 'trapezoid' && (() => {
                      const inset = Math.min(35, w * 0.22);
                      return (
                        <polygon
                          points={`${inset},${sWidth} ${w - inset},${sWidth} ${w - sWidth},${h - sWidth} ${sWidth},${h - sWidth}`}
                          fill={computedFill}
                          stroke={shapeColor}
                          strokeWidth={sWidth}
                          strokeDasharray={dashArray}
                          strokeLinejoin="round"
                        />
                      );
                    })()}

                    {/* Cloud (Multi-Lobed Conceptual Outline) */}
                    {item.type === 'cloud' && (
                      <path
                        d={`M ${w * 0.25} ${h * 0.75} C ${w * 0.05} ${h * 0.75} ${w * 0.05} ${h * 0.45} ${w * 0.25} ${h * 0.45} C ${w * 0.2} ${h * 0.15} ${w * 0.5} ${h * 0.15} ${w * 0.55} ${h * 0.35} C ${w * 0.65} ${h * 0.15} ${w * 0.9} ${h * 0.25} ${w * 0.85} ${h * 0.5} C ${w * 0.98} ${h * 0.55} ${w * 0.95} ${h * 0.8} ${w * 0.75} ${h * 0.75} Z`}
                        fill={computedFill}
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                        strokeDasharray={dashArray}
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Thought Bubble with Trailing Circles */}
                    {item.type === 'thought_bubble' && (
                      <g>
                        <path
                          d={`M ${w * 0.25} ${h * 0.65} C ${w * 0.08} ${h * 0.65} ${w * 0.08} ${h * 0.38} ${w * 0.25} ${h * 0.38} C ${w * 0.2} ${h * 0.12} ${w * 0.5} ${h * 0.12} ${w * 0.55} ${h * 0.28} C ${w * 0.65} ${h * 0.12} ${w * 0.9} ${h * 0.2} ${w * 0.85} ${h * 0.42} C ${w * 0.96} ${h * 0.48} ${w * 0.94} ${h * 0.7} ${w * 0.75} ${h * 0.65} Z`}
                          fill={computedFill}
                          stroke={shapeColor}
                          strokeWidth={sWidth}
                          strokeDasharray={dashArray}
                          strokeLinejoin="round"
                        />
                        <circle cx={w * 0.22} cy={h * 0.78} r={Math.min(6, h * 0.06)} fill={computedFill} stroke={shapeColor} strokeWidth={sWidth} />
                        <circle cx={w * 0.14} cy={h * 0.9} r={Math.min(3.5, h * 0.035)} fill={computedFill} stroke={shapeColor} strokeWidth={sWidth} />
                      </g>
                    )}

                    {/* Speech Callout */}
                    {item.type === 'callout' && (
                      <path
                        d={`M 8 8 L ${w - 8} 8 L ${w - 8} ${h - 22} L 36 ${h - 22} L 18 ${h - 4} L 22 ${h - 22} L 8 ${h - 22} Z`}
                        fill={computedFill}
                        stroke={shapeColor}
                        strokeWidth={sWidth}
                        strokeDasharray={dashArray}
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Cartesian X-Y Coordinate Axes */}
                    {item.type === 'coordinate_axes' && (
                      <g>
                        <line x1={sWidth} y1={h / 2} x2={w - sWidth} y2={h / 2} stroke={shapeColor} strokeWidth={sWidth} />
                        <polygon points={`${w - sWidth},${h / 2} ${w - sWidth - 8},${h / 2 - 4} ${w - sWidth - 8},${h / 2 + 4}`} fill={shapeColor} />
                        <line x1={w / 2} y1={h - sWidth} x2={w / 2} y2={sWidth} stroke={shapeColor} strokeWidth={sWidth} />
                        <polygon points={`${w / 2},${sWidth} ${w / 2 - 4},${sWidth + 8} ${w / 2 + 4},${sWidth + 8}`} fill={shapeColor} />
                        <circle cx={w / 2} cy={h / 2} r="3.5" fill={shapeColor} />
                        <text x={w - sWidth - 4} y={h / 2 - 8} fill={shapeColor} fontSize="11" fontWeight="bold">x</text>
                        <text x={w / 2 + 8} y={sWidth + 12} fill={shapeColor} fontSize="11" fontWeight="bold">y</text>
                        <text x={w / 2 - 12} y={h / 2 + 14} fill={shapeColor} fontSize="9">O</text>
                      </g>
                    )}

                    {/* Curly Bracket Grouping */}
                    {item.type === 'bracket' && (
                      <path
                        d={`M ${w * 0.6} 6 Q ${w * 0.2} 6 ${w * 0.2} ${h * 0.25} T ${w * 0.2} ${h * 0.5 - 6} Q ${w * 0.05} ${h * 0.5} ${w * 0.2} ${h * 0.5 + 6} T ${w * 0.2} ${h * 0.75} Q ${w * 0.2} ${h - 6} ${w * 0.6} ${h - 6}`}
                        fill="none"
                        stroke={shapeColor}
                        strokeWidth={sWidth + 1}
                        strokeLinecap="round"
                      />
                    )}

                    {/* Block Arrow */}
                    {item.type === 'arrow_block' && (() => {
                      const arrowHead = w * 0.35;
                      const barTop = h * 0.28;
                      const barBottom = h * 0.72;
                      return (
                        <polygon
                          points={`0,${barTop} ${w - arrowHead},${barTop} ${w - arrowHead},0 ${w},${h / 2} ${w - arrowHead},${h} ${w - arrowHead},${barBottom} 0,${barBottom}`}
                          fill={computedFill}
                          stroke={shapeColor}
                          strokeWidth={sWidth}
                          strokeDasharray={dashArray}
                          strokeLinejoin="round"
                        />
                      );
                    })()}

                    {/* Parametric Polygon (N-gon) */}
                    {item.type === 'polygon' && (() => {
                      const n = item.polygonEdges || 5;
                      const cx = w / 2;
                      const cy = h / 2;
                      const r = Math.min(w, h) / 2 - sWidth;
                      let pts = '';
                      for (let i = 0; i < n; i++) {
                        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
                        pts += `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)} `;
                      }
                      return (
                        <polygon
                          points={pts.trim()}
                          fill={computedFill}
                          stroke={shapeColor}
                          strokeWidth={sWidth}
                          strokeDasharray={dashArray}
                          strokeLinejoin="round"
                        />
                      );
                    })()}

                    {/* 3D Isometric Cube */}
                    {item.type === 'cube' && (() => {
                      const depth = Math.min(w, h) * 0.25;
                      return (
                        <g>
                          <rect
                            x={sWidth / 2}
                            y={depth}
                            width={w - depth - sWidth}
                            height={h - depth - sWidth}
                            fill={computedFill}
                            stroke={shapeColor}
                            strokeWidth={sWidth}
                            strokeDasharray={dashArray}
                          />
                          <polygon
                            points={`${sWidth / 2},${depth} ${depth},${sWidth / 2} ${w - sWidth},${sWidth / 2} ${w - depth - sWidth},${depth}`}
                            fill={item.fillMode === 'pastel' ? `${shapeColor}44` : computedFill}
                            stroke={shapeColor}
                            strokeWidth={sWidth}
                            strokeDasharray={dashArray}
                          />
                          <polygon
                            points={`${w - depth - sWidth},${depth} ${w - sWidth},${sWidth / 2} ${w - sWidth},${h - depth - sWidth} ${w - depth - sWidth},${h - sWidth}`}
                            fill={item.fillMode === 'pastel' ? `${shapeColor}22` : computedFill}
                            stroke={shapeColor}
                            strokeWidth={sWidth}
                            strokeDasharray={dashArray}
                          />
                        </g>
                      );
                    })()}

                    {/* 3D Cylinder */}
                    {item.type === 'cylinder' && (() => {
                      const rx = (w - sWidth) / 2;
                      const ry = Math.min(20, h * 0.2);
                      return (
                        <g>
                          <path
                            d={`M ${sWidth / 2} ${ry} L ${sWidth / 2} ${h - ry} A ${rx} ${ry} 0 0 0 ${w - sWidth / 2} ${h - ry} L ${w - sWidth / 2} ${ry} Z`}
                            fill={computedFill}
                            stroke={shapeColor}
                            strokeWidth={sWidth}
                            strokeDasharray={dashArray}
                          />
                          <ellipse
                            cx={w / 2}
                            cy={ry}
                            rx={rx}
                            ry={ry}
                            fill={item.fillMode === 'pastel' ? `${shapeColor}44` : computedFill}
                            stroke={shapeColor}
                            strokeWidth={sWidth}
                            strokeDasharray={dashArray}
                          />
                          <ellipse
                            cx={w / 2}
                            cy={h - ry}
                            rx={rx}
                            ry={ry}
                            fill="none"
                            stroke={shapeColor}
                            strokeWidth={sWidth}
                            strokeDasharray={dashArray}
                          />
                        </g>
                      );
                    })()}

                    {/* 3D Cone */}
                    {item.type === 'cone' && (() => {
                      const rx = (w - sWidth) / 2;
                      const ry = Math.min(20, h * 0.2);
                      return (
                        <g>
                          <polygon
                            points={`${w / 2},${sWidth} ${sWidth / 2},${h - ry} ${w - sWidth / 2},${h - ry}`}
                            fill={computedFill}
                            stroke={shapeColor}
                            strokeWidth={sWidth}
                            strokeDasharray={dashArray}
                          />
                          <ellipse
                            cx={w / 2}
                            cy={h - ry}
                            rx={rx}
                            ry={ry}
                            fill={item.fillMode === 'pastel' ? `${shapeColor}44` : computedFill}
                            stroke={shapeColor}
                            strokeWidth={sWidth}
                            strokeDasharray={dashArray}
                          />
                        </g>
                      );
                    })()}

                    {/* 5-Point Star */}
                    {item.type === 'star' && (() => {
                      const cx = w / 2;
                      const cy = h / 2;
                      const r = Math.min(w, h) / 2 - sWidth;
                      let pts = '';
                      for (let i = 0; i < 5; i++) {
                        const a1 = (18 + i * 72) * 0.01745;
                        const a2 = (54 + i * 72) * 0.01745;
                        pts += `${Math.cos(a1) * r + cx},${-Math.sin(a1) * r + cy} `;
                        pts += `${Math.cos(a2) * (r / 2) + cx},${-Math.sin(a2) * (r / 2) + cy} `;
                      }
                      return (
                        <polygon
                          points={pts.trim()}
                          fill={computedFill}
                          stroke={shapeColor}
                          strokeWidth={sWidth}
                          strokeDasharray={dashArray}
                          strokeLinejoin="round"
                        />
                      );
                    })()}
                  </svg>

                  {/* Centered Integrated Text & Title Container */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      pointerEvents: 'none',
                      userSelect: 'none',
                      gap: '2px'
                    }}
                  >
                    {item.name && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: shapeColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          maxWidth: '90%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.name}
                      </span>
                    )}
                    {item.text && (
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'var(--text-primary, #f8fafc)',
                          lineHeight: '1.25',
                          maxWidth: '92%',
                          wordBreak: 'break-word'
                        }}
                      >
                        {item.text}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // 2. IMAGE CARD
            if (item.type === 'image') {
              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top: curY,
                    left: curX,
                    width: `${item.width}px`,
                    background: '#0f172a',
                    border: isSelected ? '2px solid #34d399' : '1.5px solid rgba(52, 211, 153, 0.7)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
                    overflow: 'hidden',
                    pointerEvents: 'auto',
                    cursor: draggingItemId === item.id ? 'grabbing' : 'default',
                    transform: itemTransform,
                    transformOrigin: 'center center',
                    filter: outlineGlowFilter
                  }}
                >
                  {renderAnchors()}
                  {/* Image Header */}
                  <div
                    onMouseDown={e => handleItemMouseDown(e, item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      cursor: 'grab',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Move size={12} color="#ffffff" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>🖼️ {item.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                  {/* Image Content */}
                  <div style={{ padding: '8px', background: '#0b1120', display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '8px', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              );
            }

            // 3. STICKY NOTE CARD
            if (item.type === 'note') {
              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top: curY,
                    left: curX,
                    width: `${item.width}px`,
                    background: 'rgba(245, 158, 11, 0.95)',
                    border: isSelected ? '2px solid #ffffff' : '1px solid #fde047',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    pointerEvents: 'auto',
                    cursor: draggingItemId === item.id ? 'grabbing' : 'default',
                    transform: itemTransform,
                    transformOrigin: 'center center',
                    filter: outlineGlowFilter
                  }}
                >
                  {renderAnchors()}
                  {/* Note Header */}
                  <div
                    onMouseDown={e => handleItemMouseDown(e, item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      background: '#d97706',
                      cursor: 'grab',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Move size={12} color="#ffffff" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>📌 STICKY NOTE</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                  {/* Note Content */}
                  <div style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#1e293b', fontWeight: 600, lineHeight: '1.4' }}>
                    {item.explanation}
                  </div>
                </div>
              );
            }

            // 4. TRUE KATEX FORMULA CARD
            let renderedHtml = '';
            try {
              renderedHtml = katex.renderToString(item.latex || '', { displayMode: true, throwOnError: false });
            } catch (err) {
              renderedHtml = `<span style="color:#f87171">${item.latex}</span>`;
            }

            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  top: curY,
                  left: curX,
                  width: `${item.width}px`,
                  background: 'var(--card-bg, rgba(15, 23, 42, 0.96))',
                  backdropFilter: 'blur(12px)',
                  border: isSelected ? '2px solid #38bdf8' : '1.5px solid rgba(56, 189, 248, 0.6)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
                  overflow: 'hidden',
                  pointerEvents: 'auto',
                  cursor: draggingItemId === item.id ? 'grabbing' : 'default',
                  transform: itemTransform,
                  transformOrigin: 'center center',
                  filter: outlineGlowFilter,
                  transition: draggingItemId === item.id ? 'none' : 'box-shadow 0.2s ease'
                }}
              >
                {renderAnchors()}

                {/* Card Header Bar (Draggable Handle) */}
                <div
                  onMouseDown={e => handleItemMouseDown(e, item)}
                  onTouchStart={e => handleItemTouchStart(e, item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    cursor: 'grab',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Move size={12} color="#ffffff" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>📐 {item.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {/* Copy LaTeX */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(item.latex || '');
                        setActiveFormulaFeedback(`Copied: ${item.name}`);
                        setTimeout(() => setActiveFormulaFeedback(null), 2000);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '3px 6px',
                        color: '#ffffff',
                        fontSize: '0.68rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title="Copy LaTeX"
                    >
                      <Copy size={11} />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(item);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '3px 6px',
                        color: '#ffffff',
                        fontSize: '0.68rem',
                        cursor: 'pointer'
                      }}
                      title="Edit Formula"
                    >
                      Edit
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.3)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '3px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex'
                      }}
                      title="Remove from Chalkboard"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {/* KaTeX Mathematical Rendering Container */}
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(11, 17, 32, 0.9)',
                    overflowX: 'auto',
                    textAlign: 'center',
                    color: 'var(--text-primary, #f8fafc)',
                    borderBottom: item.explanation ? '1px solid rgba(51, 65, 85, 0.6)' : 'none'
                  }}
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />

                {/* Subtitle Explanation */}
                {item.explanation && (
                  <div style={{ padding: '8px 12px', fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: '1.4' }}>
                    💡 {item.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* HTML5 Canvas (Chalkboard Freehand & Arrow Ink) */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawingTouch}
          onTouchMove={drawTouch}
          onTouchEnd={stopDrawingTouch}
          onTouchCancel={stopDrawingTouch}
          style={{
            width: '100%',
            height: '100%',
            touchAction: 'none',
            cursor: activeTool === 'hand' ? (isPanning ? 'grabbing' : 'grab') : activeTool === 'text' ? 'text' : activeTool === 'eraser' ? 'cell' : activeTool === 'laser' ? 'crosshair' : activeTool === 'select' ? 'default' : 'crosshair'
          }}
        />

        {/* ─── LIVE SPOTLIGHT LASER POINTER OVERLAY ─── */}
        {activeTool === 'laser' && laserPos && (
          <div
            style={{
              position: 'absolute',
              left: `${laserPos.x}px`,
              top: `${laserPos.y}px`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 60,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#ef4444',
                border: '2px solid #ffffff',
                boxShadow: '0 0 20px #ef4444, 0 0 40px #ef4444, 0 0 60px #f87171',
                animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />
            <div
              style={{
                marginTop: '6px',
                padding: '2px 8px',
                background: 'var(--card-bg, rgba(15, 23, 42, 0.85))',
                border: '1px solid rgba(239, 68, 68, 0.6)',
                borderRadius: '6px',
                color: '#fca5a5',
                fontSize: '0.65rem',
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}
            >
              🔦 Laser Spotlight
            </div>
          </div>
        )}

        {/* ─── WAYPOINT TARGETING MODE BANNER HUD ─── */}
        {settingWaypointForId !== null && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 60,
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.98), rgba(202, 138, 4, 0.98))',
              color: '#0f172a',
              padding: '8px 18px',
              borderRadius: '20px',
              boxShadow: '0 8px 30px rgba(234, 179, 8, 0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontWeight: 800,
              fontSize: '0.82rem'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>📍</span>
            <span>
              ADD WAYPOINTS: Click anywhere on the chalkboard to add Path Points (
              {((items.find(it => it.id === settingWaypointForId)?.waypoints?.length || 0))} Added
              )
            </span>
            <button
              type="button"
              onClick={() => setSettingWaypointForId(null)}
              style={{
                background: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                padding: '4px 12px',
                color: '#facc15',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '0.74rem'
              }}
            >
              ✓ Done (Esc)
            </button>
          </div>
        )}

        {/* ─── CLASSROOM TEACHING WIDGETS OVERLAY ─── */}

        {/* 1. 📐 180° ACRYLIC PROTRACTOR WIDGET */}
        {isProtractorVisible && (
          <div
            style={{
              position: 'absolute',
              top: `${protractorPos.y}px`,
              left: `${protractorPos.x}px`,
              transform: `rotate(${protractorPos.rotation}deg)`,
              transformOrigin: '160px 160px',
              zIndex: 45,
              userSelect: 'none',
              filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.6))'
            }}
            onMouseDown={e => {
              e.stopPropagation();
              setIsDraggingProtractor(true);
            }}
          >
            <svg width="320" height="180" viewBox="0 0 320 180" style={{ cursor: 'move' }}>
              {/* Semi-Circle Body (Glassmorphic) */}
              <path
                d="M 10 160 A 150 150 0 0 1 310 160 Z"
                fill="rgba(15, 23, 42, 0.85)"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              {/* Inner Cutout Arc */}
              <path
                d="M 60 160 A 100 100 0 0 1 260 160 Z"
                fill="rgba(2, 132, 199, 0.12)"
                stroke="rgba(56, 189, 248, 0.4)"
                strokeWidth="1.5"
              />
              {/* Center Pin Crosshair */}
              <circle cx="160" cy="160" r="4" fill="#facc15" />
              <line x1="160" y1="145" x2="160" y2="160" stroke="#facc15" strokeWidth="2" />
              <line x1="145" y1="160" x2="175" y2="160" stroke="#facc15" strokeWidth="2" />

              {/* Degree Tick Marks & Labels */}
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180].map(deg => {
                const rad = ((180 - deg) * Math.PI) / 180;
                const x1 = 160 + 150 * Math.cos(rad);
                const y1 = 160 - 150 * Math.sin(rad);
                const tickLen = deg % 30 === 0 ? 16 : deg % 10 === 0 ? 10 : 6;
                const x2 = 160 + (150 - tickLen) * Math.cos(rad);
                const y2 = 160 - (150 - tickLen) * Math.sin(rad);

                const labelX = 160 + 120 * Math.cos(rad);
                const labelY = 160 - 120 * Math.sin(rad);

                return (
                  <g key={deg}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38bdf8" strokeWidth={deg % 30 === 0 ? 2 : 1} />
                    {deg % 30 === 0 && (
                      <text
                        x={labelX}
                        y={labelY + 4}
                        fill="#f8fafc"
                        fontSize="9"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {deg}°
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Rotation & Close Controls */}
            <div style={{ position: 'absolute', top: '-36px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', background: 'var(--card-bg, rgba(15, 23, 42, 0.95))', padding: '3px 8px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.4)', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 800 }}>Angle: {Math.round(protractorPos.rotation % 360)}°</span>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setProtractorPos((prev: { x: number; y: number; rotation: number }) => ({ ...prev, rotation: (prev.rotation + 15) % 360 }));
                }}
                style={{ padding: '2px 6px', borderRadius: '4px', background: '#0284c7', color: '#ffffff', border: 'none', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 700 }}
              >
                ↻ +15°
              </button>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setProtractorPos((prev: { x: number; y: number; rotation: number }) => ({ ...prev, rotation: (prev.rotation - 15 + 360) % 360 }));
                }}
                style={{ padding: '2px 6px', borderRadius: '4px', background: '#0284c7', color: '#ffffff', border: 'none', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 700 }}
              >
                ↺ -15°
              </button>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setIsProtractorVisible(false);
                }}
                style={{ padding: '2px 6px', borderRadius: '4px', background: '#ef4444', color: '#ffffff', border: 'none', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 2. 🎲 INTERACTIVE 3D DICE ROLLER WIDGET */}
        {isDiceRollerVisible && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '180px',
              background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              borderRadius: '14px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              zIndex: 42,
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c084fc' }}>🎲 CLASSROOM DICE</span>
              <button
                type="button"
                onClick={() => setIsDiceRollerVisible(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                ✕
              </button>
            </div>

            {/* Big Animated Die Face */}
            <div
              onClick={() => {
                if (isDiceRolling) return;
                setIsDiceRolling(true);
                let rollCount = 0;
                const interval = setInterval(() => {
                  setDiceValue(Math.floor(Math.random() * 6) + 1);
                  rollCount++;
                  if (rollCount > 8) {
                    clearInterval(interval);
                    setIsDiceRolling(false);
                  }
                }, 60);
              }}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '2.5rem',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)',
                transform: isDiceRolling ? 'rotate(360deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                transition: 'transform 0.5s ease'
              }}
            >
              {diceValue}
            </div>

            <button
              type="button"
              onClick={() => {
                if (isDiceRolling) return;
                setIsDiceRolling(true);
                let rollCount = 0;
                const interval = setInterval(() => {
                  setDiceValue(Math.floor(Math.random() * 6) + 1);
                  rollCount++;
                  if (rollCount > 8) {
                    clearInterval(interval);
                    setIsDiceRolling(false);
                  }
                }, 60);
              }}
              style={{ width: '100%', padding: '6px', borderRadius: '8px', background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer' }}
            >
              {isDiceRolling ? 'Rolling...' : 'Roll Dice'}
            </button>
          </div>
        )}

        {/* 3. 🚦 CLASSROOM TRAFFIC LIGHT & FOCUS METER */}
        {isTrafficLightVisible && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '70px',
              background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '14px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              zIndex: 42,
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>🚦 FOCUS LIGHT</span>
              <button
                type="button"
                onClick={() => setIsTrafficLightVisible(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', background: '#090d16', padding: '6px 10px', borderRadius: '20px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))' }}>
              {/* Red */}
              <div
                onClick={() => setTrafficStatus('red')}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: trafficStatus === 'red' ? '#ef4444' : 'rgba(239, 68, 68, 0.25)',
                  boxShadow: trafficStatus === 'red' ? '0 0 14px #ef4444' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Silent Individual Study"
              />
              {/* Yellow */}
              <div
                onClick={() => setTrafficStatus('yellow')}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: trafficStatus === 'yellow' ? '#facc15' : 'rgba(250, 204, 21, 0.25)',
                  boxShadow: trafficStatus === 'yellow' ? '0 0 14px #facc15' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Whisper / Partner Work"
              />
              {/* Green */}
              <div
                onClick={() => setTrafficStatus('green')}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: trafficStatus === 'green' ? '#22c55e' : 'rgba(34, 197, 94, 0.25)',
                  boxShadow: trafficStatus === 'green' ? '0 0 14px #22c55e' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Active Class Discussion"
              />
            </div>

            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: trafficStatus === 'red' ? '#f87171' : trafficStatus === 'yellow' ? '#facc15' : '#4ade80' }}>
              {trafficStatus === 'red' ? '🔴 Silent Focus' : trafficStatus === 'yellow' ? '🟡 Group Work' : '🟢 Open Discussion'}
            </span>
          </div>
        )}

        {/* 4. 👥 RANDOM STUDENT PICKER WIDGET */}
        {isStudentPickerVisible && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '260px',
              width: '240px',
              background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
              border: '1px solid rgba(234, 179, 8, 0.5)',
              borderRadius: '14px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              zIndex: 42,
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#facc15' }}>👥 STUDENT PICKER</span>
              <button
                type="button"
                onClick={() => setIsStudentPickerVisible(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '8px', borderRadius: '8px', background: '#090d16', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))', textAlign: 'center', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: '#38bdf8' }}>
                {pickedStudent || 'Click Pick!'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                const names = studentList.split(',').map((s: string) => s.trim()).filter(Boolean);
                if (names.length === 0) return;
                setIsPickingStudent(true);
                let count = 0;
                const interval = setInterval(() => {
                  setPickedStudent(names[Math.floor(Math.random() * names.length)]);
                  count++;
                  if (count > 12) {
                    clearInterval(interval);
                    setIsPickingStudent(false);
                  }
                }, 60);
              }}
              style={{ padding: '6px', borderRadius: '6px', background: '#eab308', color: '#000000', border: 'none', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
            >
              {isPickingStudent ? 'Selecting...' : '🎯 Pick Random Student'}
            </button>
          </div>
        )}

        {/* TOP-LAYER UNIVERSAL LASER POINTER VISUALIZER (HOVERS OVER ALL OBJECTS, CARDS & TEXT) */}
        {activeTool === 'laser' && laserPos && (
          <div
            style={{
              position: 'absolute',
              top: laserPos.y,
              left: laserPos.x,
              pointerEvents: 'none',
              zIndex: 90,
              transform: 'translate(-50%, -50%)',
              transition: 'transform 0.04s ease-out'
            }}
          >
            {laserShape === 'dot' && (
              <div style={{ position: 'relative', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div
                  style={{
                    position: 'absolute',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: laserColor,
                    opacity: 0.35,
                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                  }}
                />
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    boxShadow: `0 0 12px 4px ${laserColor}, 0 0 24px 8px ${laserColor}99`
                  }}
                />
              </div>
            )}

            {laserShape === 'crosshair' && (
              <div style={{ position: 'relative', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', width: '100%', height: '2px', background: laserColor, boxShadow: `0 0 8px ${laserColor}` }} />
                <div style={{ position: 'absolute', height: '100%', width: '2px', background: laserColor, boxShadow: `0 0 8px ${laserColor}` }} />
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${laserColor}`, boxShadow: `0 0 10px ${laserColor}` }} />
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ffffff', boxShadow: `0 0 6px ${laserColor}` }} />
              </div>
            )}

            {laserShape === 'star' && (
              <div style={{ position: 'relative', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span
                  style={{
                    fontSize: '26px',
                    color: laserColor,
                    filter: `drop-shadow(0 0 10px ${laserColor}) drop-shadow(0 0 18px #ffffff)`
                  }}
                >
                  ✨
                </span>
              </div>
            )}

            {laserShape === 'ring' && (
              <div style={{ position: 'relative', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    border: `2.5px solid ${laserColor}`,
                    boxShadow: `0 0 16px ${laserColor}, inset 0 0 12px ${laserColor}88`
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    boxShadow: `0 0 8px ${laserColor}`
                  }}
                />
              </div>
            )}

            {laserShape === 'arrow' && (
              <div style={{ position: 'relative', width: '30px', height: '30px', transform: 'translate(45%, 45%) rotate(-45deg)' }}>
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '11px solid transparent',
                    borderRight: '11px solid transparent',
                    borderBottom: `24px solid ${laserColor}`,
                    filter: `drop-shadow(0 0 10px ${laserColor})`
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* CUSTOM SHAPE CREATOR & EDIT PALETTE MODAL */}
      {showCustomShapeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div
            style={{
              width: '540px',
              maxWidth: '92vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#0f172a',
              borderRadius: '18px',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              padding: '22px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shapes size={20} color="#38bdf8" />
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
                  {editingShapeId ? 'Edit Shape & Inner Text' : 'Insert Custom Vector Shape'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomShapeModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Shape Category Grid */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '8px' }}>
                Select Shape Architecture:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {ACADEMIC_SHAPES_CATALOG.map(s => {
                  const isCur = shapeFormType === s.type;
                  return (
                    <button
                      key={s.type}
                      type="button"
                      onClick={() => setShapeFormType(s.type)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: '10px',
                        background: isCur ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))',
                        border: isCur ? '1.5px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.8)',
                        color: isCur ? '#38bdf8' : '#cbd5e1',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {s.icon}
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, textAlign: 'center' }}>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Input Inside Shape */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                Text / Label Inside Shape:
              </label>
              <textarea
                autoFocus
                value={shapeFormText}
                onChange={e => setShapeFormText(e.target.value)}
                placeholder="e.g., Hidden State h_t = tanh(W_h h_{t-1} + W_x x_t)"
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: 'var(--text-primary, #f8fafc)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Optional Shape Title Banner */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                Shape Header Title (Optional):
              </label>
              <input
                type="text"
                value={shapeFormTitle}
                onChange={e => setShapeFormTitle(e.target.value)}
                placeholder="e.g., Decision Gate, Input Vector, Output Layer"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: 'var(--text-primary, #f8fafc)',
                  fontSize: '0.82rem'
                }}
              />
            </div>

            {/* Color & Rotation Controls Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Color Theme */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  Outline Theme Color:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {['#38bdf8', '#a855f7', '#34d399', '#f59e0b', '#ef4444', '#f8fafc'].map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setShapeFormColor(col)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: col,
                        border: shapeFormColor === col ? '2.5px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        transform: shapeFormColor === col ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Rotation Angle with Slider & Number Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>
                    Rotation Angle:
                  </label>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>
                    {shapeFormRotation}°
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={shapeFormRotation}
                    onChange={e => setShapeFormRotation(parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: '#38bdf8', cursor: 'pointer' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShapeFormRotation(prev => (prev + 90) % 360)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))',
                      border: '1px solid #334155',
                      color: 'var(--text-primary, #cbd5e1)',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                    title="+90° Rotate"
                  >
                    <RotateCw size={11} />
                    <span>+90°</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sizing Preset (When creating new shape) */}
            {!editingShapeId && (
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                  Initial Size Preset:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'sm', label: 'Compact' },
                    { id: 'md', label: 'Medium (Standard)' },
                    { id: 'lg', label: 'Large (Hero)' }
                  ].map(sz => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setShapeFormSize(sz.id as any)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: shapeFormSize === sz.id ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))',
                        border: shapeFormSize === sz.id ? '1px solid #38bdf8' : '1px solid #334155',
                        color: shapeFormSize === sz.id ? '#38bdf8' : '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setShowCustomShapeModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))',
                  border: '1px solid #334155',
                  color: 'var(--text-primary, #cbd5e1)',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomShape}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)'
                }}
              >
                <Shapes size={14} />
                <span>{editingShapeId ? 'Update Shape' : 'Insert Shape to Board'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STICKY QUICK NOTE MODAL */}
      {showQuickNoteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)'
          }}
        >
          <div
            style={{
              width: '420px',
              maxWidth: '90vw',
              background: '#0f172a',
              borderRadius: '16px',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              padding: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StickyNote size={18} color="#fbbf24" />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
                  Add Sticky Note on Chalkboard
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickNoteModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                Note Content:
              </label>
              <textarea
                autoFocus
                value={quickNoteText}
                onChange={e => setQuickNoteText(e.target.value)}
                placeholder="e.g., Remember: Dijkstra does not support negative edge weights!"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: 'var(--text-primary, #f8fafc)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowQuickNoteModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))',
                  border: '1px solid #334155',
                  color: 'var(--text-primary, #cbd5e1)',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addStickyNoteCard}
                disabled={!quickNoteText.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: !quickNoteText.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                Add Note to Chalkboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM / EDIT FORMULA MODAL WITH LIVE KATEX PREVIEW */}
      {showFormulaModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)'
          }}
        >
          <div
            style={{
              width: '500px',
              maxWidth: '90vw',
              background: '#0f172a',
              borderRadius: '16px',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              padding: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="#38bdf8" />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
                  {editingItemId ? 'Edit KaTeX Formula Card' : 'Add Custom KaTeX Formula'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Formula Title */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                Formula Title:
              </label>
              <input
                type="text"
                value={customFormulaName}
                onChange={e => setCustomFormulaName(e.target.value)}
                placeholder="e.g., Scaled Dot-Product Attention"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: 'var(--text-primary, #f8fafc)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* LaTeX Code */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                LaTeX Mathematical Code:
              </label>
              <textarea
                value={customFormulaLatex}
                onChange={e => setCustomFormulaLatex(e.target.value)}
                placeholder="e.g., \text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V"
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#38bdf8',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            {/* Live KaTeX Rendered Preview */}
            {customFormulaLatex.trim() && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#0b1120',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase' }}>
                  Live KaTeX Rendered Preview:
                </span>
                <div
                  style={{ overflowX: 'auto', padding: '6px 0', color: 'var(--text-primary, #f8fafc)', textAlign: 'center' }}
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      try {
                        return katex.renderToString(customFormulaLatex.trim(), { displayMode: true, throwOnError: false });
                      } catch (e) {
                        return `<span style="color:#f87171">LaTeX Syntax Error</span>`;
                      }
                    })()
                  }}
                />
              </div>
            )}

            {/* Optional Explanation */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                Explanation / Note (Optional):
              </label>
              <input
                type="text"
                value={customFormulaExplanation}
                onChange={e => setCustomFormulaExplanation(e.target.value)}
                placeholder="One-line summary for students"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: 'var(--text-primary, #f8fafc)',
                  fontSize: '0.8rem'
                }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))',
                  border: '1px solid #334155',
                  color: 'var(--text-primary, #cbd5e1)',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFormula}
                disabled={!customFormulaName.trim() || !customFormulaLatex.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: (!customFormulaName.trim() || !customFormulaLatex.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {editingItemId ? 'Update Card' : 'Add to Chalkboard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI FORMULA GENERATOR MODAL WITH DYNAMIC MODEL PICKER */}
      {showAiModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)'
          }}
        >
          <div
            style={{
              width: '500px',
              maxWidth: '92vw',
              background: '#0f172a',
              borderRadius: '16px',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              padding: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wand2 size={18} color="#c084fc" />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
                  Ask AI to Generate KaTeX Formula
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Provider & Model Pickers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                  AI Provider:
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => {
                    const prov = e.target.value;
                    setSelectedProvider(prov);
                    const opt = WHITEBOARD_AI_PROVIDERS.find(o => o.id === prov);
                    if (opt) {
                      setSelectedModel(opt.defaultModel);
                      setIsCustomModel(false);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: 'var(--text-primary, #f8fafc)',
                    fontSize: '0.78rem'
                  }}
                >
                  {WHITEBOARD_AI_PROVIDERS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                  Model:
                </label>
                <select
                  value={isCustomModel ? 'custom_manual' : selectedModel}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom_manual') {
                      setIsCustomModel(true);
                      setCustomModelInput(selectedModel);
                    } else {
                      setIsCustomModel(false);
                      setSelectedModel(val);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#38bdf8',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}
                >
                  {WHITEBOARD_AI_PROVIDERS.find(p => p.id === selectedProvider)?.models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                  <option value="custom_manual">✏️ Custom Model ID...</option>
                </select>
              </div>
            </div>

            {/* Custom Model ID Text Input (if custom chosen) */}
            {isCustomModel && (
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#38bdf8', display: 'block', marginBottom: '3px' }}>
                  Enter Custom Model Identifier:
                </label>
                <input
                  type="text"
                  value={customModelInput}
                  onChange={e => setCustomModelInput(e.target.value)}
                  placeholder="e.g. meta-llama/llama-3.3-70b-instruct"
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: '#0b1120',
                    border: '1px solid #38bdf8',
                    color: 'var(--text-primary, #f8fafc)',
                    fontSize: '0.78rem'
                  }}
                />
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                Formula Concept or Topic:
              </label>
              <input
                type="text"
                autoFocus
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !isGeneratingAiFormula) handleGenerateAiFormula();
                }}
                placeholder="e.g., Attention Matrix, Shannon Channel Capacity, LeakyReLU"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: 'var(--text-primary, #f8fafc)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Attention Matrix', 'Transformer LayerNorm', 'CNN Feature Dimension', 'Shannon Capacity', 'Information Gain'].map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAiPrompt(s)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    color: '#c084fc',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))',
                  border: '1px solid #334155',
                  color: 'var(--text-primary, #cbd5e1)',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAiFormula}
                disabled={!aiPrompt.trim() || isGeneratingAiFormula}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: (!aiPrompt.trim() || isGeneratingAiFormula) ? 'not-allowed' : 'pointer'
                }}
              >
                <Sparkles size={14} />
                <span>{isGeneratingAiFormula ? 'Generating...' : 'Generate & Add Card'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI CONCEPT ARCHITECTURE & CONNECTED DIAGRAM GENERATOR MODAL */}
      {showAiDiagramModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)'
          }}
        >
          <div
            style={{
              width: '520px',
              maxWidth: '92vw',
              background: '#0f172a',
              borderRadius: '16px',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              padding: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wand2 size={18} color="#38bdf8" />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
                  Ask AI to Generate Concept Architecture & Diagram
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiDiagramModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Provider & Model Pickers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                  AI Provider:
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => {
                    const prov = e.target.value;
                    setSelectedProvider(prov);
                    const opt = WHITEBOARD_AI_PROVIDERS.find(o => o.id === prov);
                    if (opt) {
                      setSelectedModel(opt.defaultModel);
                      setIsCustomModel(false);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: 'var(--text-primary, #f8fafc)',
                    fontSize: '0.78rem'
                  }}
                >
                  {WHITEBOARD_AI_PROVIDERS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                  Model:
                </label>
                <select
                  value={isCustomModel ? 'custom_manual' : selectedModel}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom_manual') {
                      setIsCustomModel(true);
                      setCustomModelInput(selectedModel);
                    } else {
                      setIsCustomModel(false);
                      setSelectedModel(val);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#38bdf8',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}
                >
                  {WHITEBOARD_AI_PROVIDERS.find(p => p.id === selectedProvider)?.models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                  <option value="custom_manual">✏️ Custom Model ID...</option>
                </select>
              </div>
            </div>

            {/* Custom Model ID Text Input (if custom chosen) */}
            {isCustomModel && (
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#38bdf8', display: 'block', marginBottom: '3px' }}>
                  Enter Custom Model Identifier:
                </label>
                <input
                  type="text"
                  value={customModelInput}
                  onChange={e => setCustomModelInput(e.target.value)}
                  placeholder="e.g. meta-llama/llama-3.3-70b-instruct"
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: '#0b1120',
                    border: '1px solid #38bdf8',
                    color: 'var(--text-primary, #f8fafc)',
                    fontSize: '0.78rem'
                  }}
                />
              </div>
            )}

            {/* Diagram Concept Topic Prompt */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                Architecture Concept or Teaching Topic:
              </label>
              <input
                type="text"
                autoFocus
                value={aiDiagramPrompt}
                onChange={e => setAiDiagramPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !isGeneratingAiDiagram) handleGenerateAiDiagram();
                }}
                placeholder="e.g., Transformer Encoder Stack, Microservices Event Bus, Binary Search Tree, MVC Pattern"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: 'var(--text-primary, #f8fafc)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                'Transformer Encoder Stack',
                'Event-Driven Microservices',
                'Binary Search Tree (BST)',
                'Reinforcement Learning Loop',
                'CNN Convolution Pipeline',
                'MVC Web Architecture'
              ].map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAiDiagramPrompt(s)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38bdf8',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setShowAiDiagramModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))',
                  border: '1px solid #334155',
                  color: 'var(--text-primary, #cbd5e1)',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAiDiagram}
                disabled={!aiDiagramPrompt.trim() || isGeneratingAiDiagram}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: (!aiDiagramPrompt.trim() || isGeneratingAiDiagram) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)'
                }}
              >
                <Sparkles size={14} />
                <span>{isGeneratingAiDiagram ? 'Generating Architecture...' : 'Generate & Place on Board'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Formula Card AI Explanation / Action Toast */}
      {activeFormulaFeedback && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 60,
            background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
            border: '1px solid rgba(56, 189, 248, 0.5)',
            borderRadius: '10px',
            padding: '10px 16px',
            color: '#38bdf8',
            fontSize: '0.8rem',
            fontWeight: 700,
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={14} />
          <span>{activeFormulaFeedback}</span>
        </div>
      )}
    </div>
  );
};
