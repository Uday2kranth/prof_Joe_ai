import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Sparkles,
  Activity,
  Layers,
  Zap,
  Code2,
  Copy,
  Check,
  Maximize2,
  Download,
  Info,
  MousePointer,
  Compass,
  ArrowRight,
  TrendingUp,
  Grid,
  Box,
  Eye,
  EyeOff,
  BarChart2,
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
  SplitSquareVertical,
  Crosshair,
  RefreshCw,
  Shuffle,
  CircleDot,
  Plus,
  Minus,
  Orbit,
  Percent,
  Waves,
  FastForward,
  Square
} from 'lucide-react';
import { DualParamControl } from './common/DualParamControl';
import { PillSelector } from './common/PillSelector';

export type MathStudioModuleId =
  // 1. Statistics & Machine Learning
  | 'logistic_regression'
  | 'ols_regression'
  | 'gaussian_ci'
  // 2. 2D Geometry & Multi-Line
  | 'multi_line_intersections'
  | 'mafs_curves'
  // 3. Dynamic Calculus (JSXGraph)
  | 'jsxgraph_calculus'
  // 4. 3D Surfaces & 4D Hyperplanes (WebGL/MathBox)
  | 'mathbox_3d'
  // 5. Differential Equations & Vector Fields
  | 'vector_fields'
  // 6. Live Formula Sandbox
  | 'formula_sandbox'
  // 7. Architecture Guide
  | 'framework_compare';

export type LogRegSubMode = 'binary_linear' | 'softmax_3class' | 'polynomial_nonlinear' | '4d_hyperplane' | 'regularization_l1_l2';
export type LinRegSubMode = '1d_linear' | '3d_plane' | '4d_hyperplane' | 'polynomial_curve' | 'regularization_l1_l2';
export type LogActivationType = 'sigmoid' | 'tanh' | 'relu' | 'leaky_relu' | 'gelu' | 'probit';
export type LinFunctionFamily = 'linear' | 'polynomial' | 'logarithmic' | 'exponential' | 'sinusoidal';

export interface StudioModuleMeta {
  id: MathStudioModuleId;
  category: '2d_geometry' | 'stats_ml' | 'calculus' | '3d_surfaces' | 'vector_fields' | 'sandbox' | 'guide';
  categoryLabel: string;
  name: string;
  framework: string;
  badge: string;
  icon: React.ComponentType<{ size?: number }>;
  description: string;
}

export const STUDIO_MODULES: StudioModuleMeta[] = [
  // 1. Statistics & Machine Learning
  {
    id: 'logistic_regression',
    category: 'stats_ml',
    categoryLabel: '📊 Statistics & Machine Learning',
    name: 'Logistic Regression & Softmax Lab',
    framework: 'Mafs & WebGL 3D Mesh',
    badge: '1D S-CURVE / 2D / 3D / 4D',
    icon: Crosshair,
    description: '1D Sigmoid S-Curve with P=0/P=1 data levels, 2D Probability Heatmap & Iso-Contours, 3D Smooth Manifold, 3-Class Softmax Tri-Territory Landscape, 4D Hyperplane Slicing, and 6 Activations.'
  },
  {
    id: 'ols_regression',
    category: 'stats_ml',
    categoryLabel: '📊 Statistics & Machine Learning',
    name: 'Linear Regression & 3D Plane Lab',
    framework: 'Mafs & WebGL 3D Mesh',
    badge: '1D / 3D / 4D PLANE & GRADIENT',
    icon: BarChart2,
    description: '1D Line + Geometric Residual Squares (Least Squares Proof), 95% Confidence Ribbon, Live Gradient Descent Simulation, 3D/4D Hyperplanes, and Non-Linear families.'
  },
  {
    id: 'gaussian_ci',
    category: 'stats_ml',
    categoryLabel: '📊 Statistics & Machine Learning',
    name: 'Gaussian & Student-t Distributions',
    framework: 'Mafs (React SVG)',
    badge: 'DISTRIBUTIONS',
    icon: Activity,
    description: 'Gaussian PDF bell curves, variable degrees of freedom Student-t tails, and shaded Z-score confidence intervals (90%, 95%, 99%).'
  },
  // 2. 2D Geometry & Multi-Line
  {
    id: 'multi_line_intersections',
    category: '2d_geometry',
    categoryLabel: '📐 2D Geometry & Multi-Line',
    name: 'Multi-Line Intersections & Systems',
    framework: 'Mafs (React SVG)',
    badge: 'MULTI-LINE',
    icon: SplitSquareVertical,
    description: 'Add multiple lines (L1, L2, L3...), solve pairwise linear systems, and calculate intersection points and angles in real time.'
  },
  {
    id: 'mafs_curves',
    category: '2d_geometry',
    categoryLabel: '📐 2D Geometry & Multi-Line',
    name: 'Harmonics, Fourier & Vector Spaces',
    framework: 'Mafs (React SVG)',
    badge: 'VECTOR SVG',
    icon: Compass,
    description: 'Draggable point handles, Fourier harmonic square-wave synthesis, vector parallelogram addition, and Lissajous curves.'
  },
  // 3. Dynamic Calculus (JSXGraph)
  {
    id: 'jsxgraph_calculus',
    category: 'calculus',
    categoryLabel: '⚡ Dynamic Calculus & Tangents',
    name: 'Tangents, Derivatives & Riemann Sums',
    framework: 'JSXGraph Paradigm',
    badge: 'CALCULUS',
    icon: Activity,
    description: 'Sliding tangent line evaluating exact derivative slope f\'(x₀) alongside Midpoint, Trapezoid, and Left/Right Riemann partitions.'
  },
  // 4. 3D Surfaces & 4D Hyperplanes (WebGL/MathBox)
  {
    id: 'mathbox_3d',
    category: '3d_surfaces',
    categoryLabel: '🌌 3D & Multivariable Manifolds',
    name: '3D Mesh & 4D Hyperplane Slicing',
    framework: 'WebGL / MathBox',
    badge: '3D / 4D WEBGL',
    icon: Box,
    description: 'Rotatable 3D coordinate bounding box, depth-sorted quad meshes, and 4D hyperplane slicing projecting hyper-surfaces into 3D.'
  },
  // 5. Differential Equations & Vector Fields
  {
    id: 'vector_fields',
    category: 'vector_fields',
    categoryLabel: '🌀 Differential Equations & ODEs',
    name: 'Vector Fields & Phase Space Orbits',
    framework: 'Runge-Kutta ODE',
    badge: 'VECTOR FLOW',
    icon: TrendingUp,
    description: 'Autonomous direction field arrows with dynamic streaming phase trajectory tracers for Damped Pendulums and Lotka-Volterra.'
  },
  // 6. Live Formula Sandbox
  {
    id: 'formula_sandbox',
    category: 'sandbox',
    categoryLabel: '🧪 Live Formula Sandbox',
    name: 'Multivariable Formula Sandbox',
    framework: 'React SVG Parser',
    badge: 'CUSTOM FORMULA',
    icon: Zap,
    description: 'Type custom mathematical formulas and bind live parameters (k, a, b) to instantly plot declarative curves.'
  },
  // 7. Architecture Guide
  {
    id: 'framework_compare',
    category: 'guide',
    categoryLabel: 'ℹ️ Framework Architecture Guide',
    name: 'Client-Side Framework Matrix',
    framework: 'Full Architectural Guide',
    badge: '0-BACKEND DOC',
    icon: Info,
    description: 'Comprehensive comparative breakdown matrix covering Mafs vs JSXGraph vs Plotly.js vs MathBox.'
  }
];

export const TestDiagramsStudioView: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState<MathStudioModuleId>('ols_regression');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Global 3D Auto-Orbit & Live Animation Speed
  const [isAutoOrbit, setIsAutoOrbit] = useState<boolean>(false);
  const [isBendingAnim, setIsBendingAnim] = useState<boolean>(false);
  const [animSpeed, setAnimSpeed] = useState<number>(1.0);

  const activeMeta = useMemo(() => {
    return STUDIO_MODULES.find(m => m.id === activeModuleId) || STUDIO_MODULES[0];
  }, [activeModuleId]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. LOGISTIC REGRESSION & SOFTMAX LAB
  // ─────────────────────────────────────────────────────────────────────────────
  const [logSubMode, setLogSubMode] = useState<LogRegSubMode>('binary_linear');
  const [logDimension, setLogDimension] = useState<'3d_surface' | '2d_boundary' | '1d_curve'>('2d_boundary');
  const [logActivation, setLogActivation] = useState<LogActivationType>('sigmoid');
  const [log2dVisualMode, setLog2dVisualMode] = useState<'smooth_heatmap' | 'iso_contours' | 'boundary_only'>('smooth_heatmap');

  // Binary Linear & 4D Weights & Threshold
  const [logW1, setLogW1] = useState<number>(1.4);
  const [logW2, setLogW2] = useState<number>(-1.1);
  const [logW3, setLogW3] = useState<number>(0.8);
  const [logW4, setLogW4] = useState<number>(-0.6);
  const [logBiasB, setLogBiasB] = useState<number>(0.0);
  const [logSliceX3, setLogSliceX3] = useState<number>(0.5);
  const [logSliceX4, setLogSliceX4] = useState<number>(-0.4);
  const [logThreshold, setLogThreshold] = useState<number>(0.5);
  const [logCurvatureK, setLogCurvatureK] = useState<number>(1.5); // S-Curvature steepness factor (k)

  // Polynomial Feature Weights
  const [polyW1, setPolyW1] = useState<number>(0.2);
  const [polyW2, setPolyW2] = useState<number>(0.1);
  const [polyW3, setPolyW3] = useState<number>(1.2);
  const [polyW4, setPolyW4] = useState<number>(1.2);
  const [polyBias, setPolyBias] = useState<number>(-1.8);

  // 3-Class Softmax Weights (Multi-Class Hyperplanes)
  const [softW0, setSoftW0] = useState<{ w1: number; w2: number; b: number }>({ w1: -1.2, w2: 1.4, b: 0.2 });
  const [softW1, setSoftW1] = useState<{ w1: number; w2: number; b: number }>({ w1: 1.5, w2: 1.1, b: -0.4 });
  const [softW2, setSoftW2] = useState<{ w1: number; w2: number; b: number }>({ w1: 0.2, w2: -1.8, b: 0.1 });

  // 3D Canvas Rotation
  const [log3dRotX, setLog3dRotX] = useState<number>(28);
  const [log3dRotY, setLog3dRotY] = useState<number>(42);
  const [isDraggingLog3D, setIsDraggingLog3D] = useState<boolean>(false);
  const dragLog3dStartRef = useRef<{ x: number; y: number; rx: number; ry: number }>({ x: 0, y: 0, rx: 28, ry: 42 });
  const canvasLog3dRef = useRef<HTMLCanvasElement | null>(null);

  // Granular Coordinate Input Box for Logistic Regression
  const [injectLogClass, setInjectLogClass] = useState<0 | 1 | 2>(0);
  const [injectLogX1, setInjectLogX1] = useState<number>(-1.5);
  const [injectLogX2, setInjectLogX2] = useState<number>(1.0);
  const [isLogPointsListOpen, setIsLogPointsListOpen] = useState<boolean>(false);

  // Scatter Dataset for Logistic Regression
  const [scatterData, setScatterData] = useState<Array<{ id: number; x1: number; x2: number; label: 0 | 1 | 2 }>>([
    { id: 1, x1: -1.8, x2: 1.4, label: 0 },
    { id: 2, x1: -1.2, x2: 0.8, label: 0 },
    { id: 3, x1: -0.6, x2: 1.6, label: 0 },
    { id: 4, x1: -0.4, x2: 0.2, label: 0 },
    { id: 5, x1: 0.2, x2: -0.5, label: 1 },
    { id: 6, x1: 0.8, x2: -1.2, label: 1 },
    { id: 7, x1: 1.4, x2: -0.4, label: 1 },
    { id: 8, x1: 1.7, x2: -1.5, label: 1 },
    { id: 9, x1: 1.5, x2: 1.2, label: 2 },
    { id: 10, x1: 0.9, x2: 1.6, label: 2 },
    { id: 11, x1: 1.8, x2: 0.7, label: 2 }
  ]);

  const class0Count = useMemo(() => scatterData.filter(p => p.label === 0).length, [scatterData]);
  const class1Count = useMemo(() => scatterData.filter(p => p.label === 1).length, [scatterData]);
  const class2Count = useMemo(() => scatterData.filter(p => p.label === 2).length, [scatterData]);

  const adjustClassCount = (targetClass: 0 | 1 | 2, delta: number) => {
    if (delta > 0) {
      const centers = { 0: { cx: -1.2, cy: 1.0 }, 1: { cx: 1.0, cy: -1.0 }, 2: { cx: 1.2, cy: 1.2 } };
      const center = centers[targetClass];
      const newPts: Array<{ id: number; x1: number; x2: number; label: 0 | 1 | 2 }> = [];
      for (let i = 0; i < delta; i++) {
        newPts.push({
          id: Date.now() + i,
          x1: parseFloat((center.cx + (Math.random() - 0.5) * 1.2).toFixed(2)),
          x2: parseFloat((center.cy + (Math.random() - 0.5) * 1.2).toFixed(2)),
          label: targetClass
        });
      }
      setScatterData(prev => [...prev, ...newPts]);
    } else {
      let removeLeft = Math.abs(delta);
      setScatterData(prev => {
        const next: typeof prev = [];
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i].label === targetClass && removeLeft > 0) {
            removeLeft--;
          } else {
            next.unshift(prev[i]);
          }
        }
        return next;
      });
    }
  };

  const handleInjectLogPoint = () => {
    setScatterData(prev => [
      ...prev,
      {
        id: Date.now(),
        x1: parseFloat(injectLogX1.toFixed(2)),
        x2: parseFloat(injectLogX2.toFixed(2)),
        label: injectLogClass
      }
    ]);
  };

  const removeScatterPoint = (id: number) => {
    setScatterData(prev => prev.filter(p => p.id !== id));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. LINEAR REGRESSION & 3D/4D PLANE LAB
  // ─────────────────────────────────────────────────────────────────────────────
  const [linSubMode, setLinSubMode] = useState<LinRegSubMode>('1d_linear');
  const [linFitMode, setLinFitMode] = useState<'auto_ols' | 'manual_user'>('manual_user');
  const [linFunctionFamily, setLinFunctionFamily] = useState<LinFunctionFamily>('linear');
  const [lin1dVisualMode, setLin1dVisualMode] = useState<'residual_squares' | 'confidence_band' | 'drop_lines'>('residual_squares');

  // Gradient Descent State
  const [isGradDescentRunning, setIsGradDescentRunning] = useState<boolean>(false);
  const [learningRateEta, setLearningRateEta] = useState<number>(0.05);
  const [gradEpochCount, setGradEpochCount] = useState<number>(0);

  const [manualBeta1, setManualBeta1] = useState<number>(0.8);
  const [manualBeta0, setManualBeta0] = useState<number>(0.1);
  const [manualBeta2, setManualBeta2] = useState<number>(-0.6);
  const [manualBeta3, setManualBeta3] = useState<number>(0.4);
  const [manualBeta4, setManualBeta4] = useState<number>(-0.5);

  const [linSliceX3, setLinSliceX3] = useState<number>(0.5);
  const [linSliceX4, setLinSliceX4] = useState<number>(-0.3);

  const [lin3dRotX, setLin3dRotX] = useState<number>(24);
  const [lin3dRotY, setLin3dRotY] = useState<number>(36);
  const [isDraggingLin3D, setIsDraggingLin3D] = useState<boolean>(false);
  const dragLin3dStartRef = useRef<{ x: number; y: number; rx: number; ry: number }>({ x: 0, y: 0, rx: 24, ry: 36 });
  const canvasLin3dRef = useRef<HTMLCanvasElement | null>(null);

  const [polyA, setPolyA] = useState<number>(0.5);
  const [polyB, setPolyB] = useState<number>(0.1);
  const [polyC, setPolyC] = useState<number>(-0.8);
  const [linRegType, setLinRegType] = useState<'l2_ridge' | 'l1_lasso'>('l2_ridge');
  const [linRegLambda, setLinRegLambda] = useState<number>(0.8);

  const [injectLinX, setInjectLinX] = useState<number>(1.2);
  const [injectLinY, setInjectLinY] = useState<number>(1.0);
  const [isLinPointsListOpen, setIsLinPointsListOpen] = useState<boolean>(false);

  const [linPoints, setLinPoints] = useState<Array<{ id: number; x1: number; x2: number; y: number }>>([
    { id: 1, x1: -2.0, x2: 1.2, y: -1.4 },
    { id: 2, x1: -1.3, x2: 0.6, y: -0.8 },
    { id: 3, x1: -0.6, x2: -0.4, y: -0.3 },
    { id: 4, x1: 0.2, x2: 0.8, y: 0.4 },
    { id: 5, x1: 1.0, x2: -0.5, y: 0.9 },
    { id: 6, x1: 1.7, x2: 1.1, y: 1.5 },
    { id: 7, x1: 2.3, x2: -0.9, y: 1.9 }
  ]);

  const adjustLinPointsCount = (delta: number) => {
    if (delta > 0) {
      const newPts: Array<{ id: number; x1: number; x2: number; y: number }> = [];
      for (let i = 0; i < delta; i++) {
        const x1 = parseFloat(((Math.random() - 0.5) * 4.4).toFixed(2));
        const x2 = parseFloat(((Math.random() - 0.5) * 2.0).toFixed(2));
        const y = parseFloat((0.8 * x1 + 0.1 + (Math.random() - 0.5) * 0.5).toFixed(2));
        newPts.push({ id: Date.now() + i, x1, x2, y });
      }
      setLinPoints(prev => [...prev, ...newPts]);
    } else {
      setLinPoints(prev => prev.slice(0, Math.max(2, prev.length + delta)));
    }
  };

  const handleInjectLinPoint = () => {
    setLinPoints(prev => [
      ...prev,
      {
        id: Date.now(),
        x1: parseFloat(injectLinX.toFixed(2)),
        x2: 0,
        y: parseFloat(injectLinY.toFixed(2))
      }
    ]);
  };

  const removeLinPoint = (id: number) => {
    if (linPoints.length <= 2) return;
    setLinPoints(prev => prev.filter(p => p.id !== id));
  };

  // Perform a single step of Gradient Descent
  const performGradientDescentStep = () => {
    const N = linPoints.length;
    if (N < 2) return;

    let gradBeta1 = 0;
    let gradBeta0 = 0;
    linPoints.forEach(p => {
      const predY = manualBeta0 + manualBeta1 * p.x1;
      const err = predY - p.y;
      gradBeta0 += (2 / N) * err;
      gradBeta1 += (2 / N) * err * p.x1;
    });

    setManualBeta0(prev => parseFloat((prev - learningRateEta * gradBeta0).toFixed(4)));
    setManualBeta1(prev => parseFloat((prev - learningRateEta * gradBeta1).toFixed(4)));
    setLinFitMode('manual_user');
    setGradEpochCount(prev => prev + 1);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. MULTI-LINE INTERSECTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const [lines, setLines] = useState<Array<{ id: number; m: number; c: number; color: string; label: string }>>([
    { id: 1, m: 1.2, c: 0.5, color: '#38bdf8', label: 'Line 1' },
    { id: 2, m: -0.8, c: 1.8, color: '#f59e0b', label: 'Line 2' },
    { id: 3, m: 0.2, c: -1.2, color: '#34d399', label: 'Line 3' }
  ]);

  const addLine = () => {
    if (lines.length >= 6) return;
    const colors = ['#ec4899', '#a855f7', '#06b6d4', '#f97316'];
    const newId = Date.now();
    setLines(prev => [
      ...prev,
      {
        id: newId,
        m: parseFloat(((Math.random() - 0.5) * 3).toFixed(2)),
        c: parseFloat(((Math.random() - 0.5) * 3).toFixed(2)),
        color: colors[prev.length % colors.length],
        label: `Line ${prev.length + 1}`
      }
    ]);
  };

  const removeLine = (id: number) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter(l => l.id !== id));
  };

  const lineIntersections = useMemo(() => {
    const points: Array<{ x: number; y: number; lineA: string; lineB: string; colorA: string; colorB: string }> = [];
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const l1 = lines[i];
        const l2 = lines[j];
        const denom = l1.m - l2.m;
        if (Math.abs(denom) > 1e-4) {
          const x = (l2.c - l1.c) / denom;
          const y = l1.m * x + l1.c;
          if (x >= -4.5 && x <= 4.5 && y >= -4.5 && y <= 4.5) {
            points.push({ x, y, lineA: l1.label, lineB: l2.label, colorA: l1.color, colorB: l2.color });
          }
        }
      }
    }
    return points;
  }, [lines]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. MAFS CURVES & FOURIER HARMONICS
  // ─────────────────────────────────────────────────────────────────────────────
  const [fourierHarmonics, setFourierHarmonics] = useState<number>(4);

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. GAUSSIAN & STUDENT-T DISTRIBUTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const [gaussMean, setGaussMean] = useState<number>(0.0);
  const [gaussStd, setGaussStd] = useState<number>(1.0);
  const [studentNu, setStudentNu] = useState<number>(4);
  const [ciConfidence, setCiConfidence] = useState<number>(95);

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. JSXGRAPH DYNAMIC CALCULUS
  // ─────────────────────────────────────────────────────────────────────────────
  const [calcX0, setCalcX0] = useState<number>(0.8);
  const [calcIntegralN, setCalcIntegralN] = useState<number>(12);
  const [calcIntegralMethod, setCalcIntegralMethod] = useState<'midpoint' | 'trapezoid' | 'left' | 'right'>('midpoint');

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. MATHBOX 3D & 4D HYPERPLANE SLICING
  // ─────────────────────────────────────────────────────────────────────────────
  const [surfaceType, setSurfaceType] = useState<'saddle' | 'monkey' | 'ripple' | 'paraboloid' | 'hyper_4d'>('hyper_4d');
  const [hyperW, setHyperW] = useState<number>(0.6);
  const [rotX, setRotX] = useState<number>(24);
  const [rotY, setRotY] = useState<number>(38);
  const [isDragging3D, setIsDragging3D] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; rx: number; ry: number }>({ x: 0, y: 0, rx: 24, ry: 38 });
  const canvas3DRef = useRef<HTMLCanvasElement | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. VECTOR FIELDS & PHASE SPACE
  // ─────────────────────────────────────────────────────────────────────────────
  const [odeSystem, setOdeSystem] = useState<'pendulum' | 'lotka_volterra' | 'vanderpol'>('pendulum');
  const [dampingFactor, setDampingFactor] = useState<number>(0.25);

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. FORMULA SANDBOX
  // ─────────────────────────────────────────────────────────────────────────────
  const [paramK, setParamK] = useState<number>(2.5);
  const [paramA, setParamA] = useState<number>(1.0);
  const [paramB, setParamB] = useState<number>(0.5);

  // Animation Loop & Clock
  const [timeT, setTimeT] = useState<number>(0);
  const lastGradStepRef = useRef<number>(0);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (isSimulating) {
        setTimeT(prev => prev + dt * animSpeed);
        if (isAutoOrbit) {
          setLog3dRotY(prev => (prev + 0.4 * animSpeed) % 360);
          setLin3dRotY(prev => (prev + 0.4 * animSpeed) % 360);
          setRotY(prev => (prev + 0.4 * animSpeed) % 360);
        }

        // Live Gradient Descent Simulation Loop
        if (isGradDescentRunning && now - lastGradStepRef.current > 80 / animSpeed) {
          lastGradStepRef.current = now;
          const N = linPoints.length;
          if (N >= 2) {
            let gradBeta1 = 0;
            let gradBeta0 = 0;
            linPoints.forEach(p => {
              const predY = manualBeta0 + manualBeta1 * p.x1;
              const err = predY - p.y;
              gradBeta0 += (2 / N) * err;
              gradBeta1 += (2 / N) * err * p.x1;
            });

            const gradNorm = Math.sqrt(gradBeta0 * gradBeta0 + gradBeta1 * gradBeta1);
            if (gradNorm > 0.001) {
              setManualBeta0(prev => prev - learningRateEta * gradBeta0);
              setManualBeta1(prev => prev - learningRateEta * gradBeta1);
              setGradEpochCount(prev => prev + 1);
            } else {
              setIsGradDescentRunning(false);
            }
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isSimulating, isAutoOrbit, isGradDescentRunning, learningRateEta, manualBeta0, manualBeta1, linPoints, animSpeed]);

  // Compute Linear Regression Statistics
  const linStats = useMemo(() => {
    const N = linPoints.length;
    if (N < 2) return { beta0: 0, beta1: 0, beta2: 0, beta3: 0, beta4: 0, meanX1: 0, meanY: 0, sxx: 1, r2: 0, mse: 0, rmse: 0, sst: 0, ssr: 0, sse: 0, regLoss: 0, gradBeta0: 0, gradBeta1: 0 };

    const meanX1 = linPoints.reduce((s, p) => s + p.x1, 0) / N;
    const meanY = linPoints.reduce((s, p) => s + p.y, 0) / N;

    let num1 = 0, den1 = 0;
    linPoints.forEach(p => {
      num1 += (p.x1 - meanX1) * (p.y - meanY);
      den1 += Math.pow(p.x1 - meanX1, 2);
    });

    let autoBeta1 = den1 !== 0 ? num1 / den1 : 0;
    let autoBeta0 = meanY - autoBeta1 * meanX1;
    let autoBeta2 = -0.5;
    let autoBeta3 = 0.4;
    let autoBeta4 = -0.3;

    if (linSubMode === 'regularization_l1_l2') {
      if (linRegType === 'l2_ridge') {
        autoBeta1 = autoBeta1 / (1 + linRegLambda * 0.5);
      } else {
        const penalty = linRegLambda * 0.15;
        autoBeta1 = Math.sign(autoBeta1) * Math.max(0, Math.abs(autoBeta1) - penalty);
      }
    }

    const activeB0 = linFitMode === 'manual_user' ? manualBeta0 : autoBeta0;
    const activeB1 = linFitMode === 'manual_user' ? manualBeta1 : autoBeta1;
    const activeB2 = linFitMode === 'manual_user' ? manualBeta2 : autoBeta2;
    const activeB3 = linFitMode === 'manual_user' ? manualBeta3 : autoBeta3;
    const activeB4 = linFitMode === 'manual_user' ? manualBeta4 : autoBeta4;

    let sst = 0, sse = 0;
    let gradBeta0 = 0, gradBeta1 = 0;

    linPoints.forEach(p => {
      let predY = 0;
      if (linSubMode === '4d_hyperplane') {
        predY = activeB0 + activeB1 * p.x1 + activeB2 * p.x2 + activeB3 * linSliceX3 + activeB4 * linSliceX4;
      } else if (linSubMode === '3d_plane') {
        predY = activeB0 + activeB1 * p.x1 + activeB2 * p.x2;
      } else if (linSubMode === 'polynomial_curve') {
        if (linFunctionFamily === 'sinusoidal') {
          predY = polyA * Math.sin(polyB * p.x1) + polyC;
        } else if (linFunctionFamily === 'exponential') {
          predY = polyA * Math.exp(polyB * p.x1 * 0.5) + polyC;
        } else {
          predY = polyA * Math.pow(p.x1, 2) + polyB * p.x1 + polyC;
        }
      } else {
        predY = activeB0 + activeB1 * p.x1;
      }

      const err = predY - p.y;
      gradBeta0 += (2 / N) * err;
      gradBeta1 += (2 / N) * err * p.x1;

      sst += Math.pow(p.y - meanY, 2);
      sse += Math.pow(err, 2);
    });

    const ssr = Math.max(0, sst - sse);
    const r2 = sst > 0 ? Math.max(0, Math.min(1, 1 - sse / sst)) : 1;
    const mse = sse / N;
    const rmse = Math.sqrt(mse);
    const weightPenalty = linRegType === 'l2_ridge' ? Math.pow(activeB1, 2) : Math.abs(activeB1);
    const regLoss = mse + linRegLambda * 0.1 * weightPenalty;

    return { beta0: activeB0, beta1: activeB1, beta2: activeB2, beta3: activeB3, beta4: activeB4, meanX1, meanY, sxx: den1 || 1, r2, mse, rmse, sst, ssr, sse, regLoss, gradBeta0, gradBeta1 };
  }, [linPoints, linSubMode, linFitMode, linFunctionFamily, manualBeta0, manualBeta1, manualBeta2, manualBeta3, manualBeta4, linSliceX3, linSliceX4, polyA, polyB, polyC, linRegType, linRegLambda]);

  // Compute Activation Function Output
  const applyActivation = (z: number, act: LogActivationType) => {
    switch (act) {
      case 'tanh':
        return (Math.tanh(z) + 1) / 2; // Normalized to [0, 1] probability
      case 'relu':
        return Math.min(1.0, Math.max(0, z * 0.3));
      case 'leaky_relu':
        return Math.min(1.0, Math.max(0.05 * z, z * 0.3));
      case 'gelu': {
        const cdf = 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (z + 0.044715 * Math.pow(z, 3))));
        return Math.min(1.0, Math.max(0, z * cdf * 0.35 + 0.1));
      }
      case 'probit':
        return 0.5 * (1 + Math.tanh(z * 0.797885));
      case 'sigmoid':
      default:
        return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
    }
  };

  // Dynamic Effective S-Curvature Factor
  const activeCurvature = isBendingAnim ? 1.5 + Math.sin(timeT * 2.0) * 1.0 : logCurvatureK;

  // Compute Logistic Regression Statistics
  const logStats = useMemo(() => {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    let totalLoss = 0;
    let multiCorrect = 0;

    scatterData.forEach(p => {
      if (logSubMode === 'softmax_3class') {
        const z0 = softW0.w1 * p.x1 + softW0.w2 * p.x2 + softW0.b;
        const z1 = softW1.w1 * p.x1 + softW1.w2 * p.x2 + softW1.b;
        const z2 = softW2.w1 * p.x1 + softW2.w2 * p.x2 + softW2.b;
        const maxZ = Math.max(z0, z1, z2);
        const exp0 = Math.exp(z0 - maxZ);
        const exp1 = Math.exp(z1 - maxZ);
        const exp2 = Math.exp(z2 - maxZ);
        const sumExp = exp0 + exp1 + exp2;

        const p0 = exp0 / sumExp;
        const p1 = exp1 / sumExp;
        const p2 = exp2 / sumExp;

        let predClass = 0;
        if (p1 > p0 && p1 > p2) predClass = 1;
        else if (p2 > p0 && p2 > p1) predClass = 2;

        if (predClass === p.label) multiCorrect++;
        const targetProb = p.label === 0 ? p0 : p.label === 1 ? p1 : p2;
        totalLoss -= Math.log(Math.max(1e-5, targetProb));
      } else if (logSubMode === '4d_hyperplane') {
        const z = activeCurvature * (logW1 * p.x1 + logW2 * p.x2 + logW3 * logSliceX3 + logW4 * logSliceX4 + logBiasB);
        const prob = applyActivation(z, logActivation);
        const predLabel = prob >= logThreshold ? 1 : 0;
        if (p.label === 1 && predLabel === 1) tp++;
        else if (p.label === 0 && predLabel === 1) fp++;
        else if (p.label === 0 && predLabel === 0) tn++;
        else if (p.label === 0 && predLabel === 1) fn++;

        const safeProb = Math.max(1e-5, Math.min(1 - 1e-5, prob));
        if (p.label === 1) totalLoss -= Math.log(safeProb);
        else totalLoss -= Math.log(1 - safeProb);
      } else if (logSubMode === 'polynomial_nonlinear') {
        const z = activeCurvature * (polyW1 * p.x1 + polyW2 * p.x2 + polyW3 * Math.pow(p.x1, 2) + polyW4 * Math.pow(p.x2, 2) + polyBias);
        const prob = applyActivation(z, logActivation);
        const predLabel = prob >= logThreshold ? 1 : 0;
        if (p.label === 1 && predLabel === 1) tp++;
        else if (p.label === 0 && predLabel === 1) fp++;
        else if (p.label === 0 && predLabel === 0) tn++;
        else if (p.label === 0 && predLabel === 1) fn++;

        const safeProb = Math.max(1e-5, Math.min(1 - 1e-5, prob));
        if (p.label === 1) totalLoss -= Math.log(safeProb);
        else totalLoss -= Math.log(1 - safeProb);
      } else {
        const z = activeCurvature * (logW1 * p.x1 + (logDimension === '1d_curve' ? 0 : logW2 * p.x2) + logBiasB);
        const prob = applyActivation(z, logActivation);
        const predLabel = prob >= logThreshold ? 1 : 0;

        if (p.label === 1 && predLabel === 1) tp++;
        else if (p.label === 0 && predLabel === 1) fp++;
        else if (p.label === 0 && predLabel === 0) tn++;
        else if (p.label === 0 && predLabel === 1) fn++;

        const safeProb = Math.max(1e-5, Math.min(1 - 1e-5, prob));
        if (p.label === 1) totalLoss -= Math.log(safeProb);
        else totalLoss -= Math.log(1 - safeProb);
      }
    });

    const total = scatterData.length || 1;
    const accuracy = logSubMode === 'softmax_3class'
      ? (multiCorrect / total) * 100
      : ((tp + tn) / total) * 100;
    const meanLoss = totalLoss / total;

    return { tp, fp, tn, fn, accuracy, meanLoss };
  }, [logSubMode, logDimension, logW1, logW2, logW3, logW4, logBiasB, logSliceX3, logSliceX4, logThreshold, logActivation, activeCurvature, polyW1, polyW2, polyW3, polyW4, polyBias, softW0, softW1, softW2, scatterData]);

  // 3D Canvas Projection for Logistic Regression & 3-Class Softmax Landscape
  useEffect(() => {
    if (activeModuleId !== 'logistic_regression' || (logDimension !== '3d_surface' && logSubMode !== '4d_hyperplane')) return;
    const canvas = canvasLog3dRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W * 0.7);
    bgGrad.addColorStop(0, '#0b1120');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const radX = (log3dRotX * Math.PI) / 180;
    const radY = (log3dRotY * Math.PI) / 180;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    const project3D = (x: number, y: number, z: number) => {
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const scale = 62;
      return { x: W / 2 + x1 * scale, y: H / 2 - y2 * scale, z: z2 };
    };

    const bX = 2.4;
    const bZ = 2.4;
    const bYMin = -1.4;
    const bYMax = 1.4;

    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    for (let gx = -bX; gx <= bX + 0.1; gx += 0.8) {
      const pStart = project3D(gx, bYMin, -bZ);
      const pEnd = project3D(gx, bYMin, bZ);
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.stroke();
    }
    for (let gz = -bZ; gz <= bZ + 0.1; gz += 0.8) {
      const pStart = project3D(-bX, bYMin, gz);
      const pEnd = project3D(bX, bYMin, gz);
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.stroke();
    }

    const pillarBase = project3D(-bX, bYMin, -bZ);
    const pillarTop = project3D(-bX, bYMax, -bZ);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pillarBase.x, pillarBase.y);
    ctx.lineTo(pillarTop.x, pillarTop.y);
    ctx.stroke();

    for (let pVal = 0; pVal <= 1.05; pVal += 0.25) {
      const gy = bYMin + pVal * (bYMax - bYMin);
      const pTick = project3D(-bX, gy, -bZ);
      ctx.fillStyle = '#34d399';
      ctx.fillText(`P=${pVal.toFixed(2)}`, pTick.x - 46, pTick.y + 3);
    }

    const evalProb = (u: number, v: number) => {
      if (logSubMode === 'softmax_3class') {
        const z0 = softW0.w1 * u + softW0.w2 * v + softW0.b;
        const z1 = softW1.w1 * u + softW1.w2 * v + softW1.b;
        const z2 = softW2.w1 * u + softW2.w2 * v + softW2.b;
        const maxZ = Math.max(z0, z1, z2);
        const e0 = Math.exp(z0 - maxZ);
        const e1 = Math.exp(z1 - maxZ);
        const e2 = Math.exp(z2 - maxZ);
        const sum = e0 + e1 + e2;
        const p0 = e0 / sum;
        const p1 = e1 / sum;
        const p2 = e2 / sum;
        const maxP = Math.max(p0, p1, p2);
        const winner = p0 === maxP ? 0 : p1 === maxP ? 1 : 2;
        return { prob: maxP, winner };
      }

      let z = 0;
      if (logSubMode === '4d_hyperplane') {
        z = activeCurvature * (logW1 * u + logW2 * v + logW3 * logSliceX3 + logW4 * logSliceX4 + logBiasB);
      } else if (logSubMode === 'polynomial_nonlinear') {
        z = activeCurvature * (polyW1 * u + polyW2 * v + polyW3 * u * u + polyW4 * v * v + polyBias);
      } else {
        z = activeCurvature * (logW1 * u + logW2 * v + logBiasB);
      }
      return { prob: applyActivation(z, logActivation), winner: 1 };
    };

    const quads: Array<{ p1: any; p2: any; p3: any; p4: any; avgZ: number; probVal: number; winner: number }> = [];
    const steps = 22;
    const range = 2.2;
    for (let i = 0; i < steps; i++) {
      for (let j = 0; j < steps; j++) {
        const u1 = -range + (i / steps) * (2 * range);
        const u2 = -range + ((i + 1) / steps) * (2 * range);
        const v1 = -range + (j / steps) * (2 * range);
        const v2 = -range + ((j + 1) / steps) * (2 * range);

        const r1 = evalProb(u1, v1);
        const r2 = evalProb(u2, v1);
        const r3 = evalProb(u2, v2);
        const r4 = evalProb(u1, v2);

        const p1 = project3D(u1, bYMin + r1.prob * (bYMax - bYMin), v1);
        const p2 = project3D(u2, bYMin + r2.prob * (bYMax - bYMin), v1);
        const p3 = project3D(u2, bYMin + r3.prob * (bYMax - bYMin), v2);
        const p4 = project3D(u1, bYMin + r4.prob * (bYMax - bYMin), v2);

        quads.push({
          p1, p2, p3, p4,
          avgZ: (p1.z + p2.z + p3.z + p4.z) / 4,
          probVal: (r1.prob + r2.prob + r3.prob + r4.prob) / 4,
          winner: r1.winner
        });
      }
    }

    quads.sort((a, b) => a.avgZ - b.avgZ);
    quads.forEach(q => {
      ctx.beginPath();
      ctx.moveTo(q.p1.x, q.p1.y);
      ctx.lineTo(q.p2.x, q.p2.y);
      ctx.lineTo(q.p3.x, q.p3.y);
      ctx.lineTo(q.p4.x, q.p4.y);
      ctx.closePath();

      if (logSubMode === 'softmax_3class') {
        const alpha = Math.min(0.85, Math.max(0.35, (q.probVal - 0.33) * 1.3));
        if (q.winner === 0) ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        else if (q.winner === 1) ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
        else ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
      } else {
        const red = Math.round(239 * (1 - q.probVal) + 52 * q.probVal);
        const green = Math.round(68 * (1 - q.probVal) + 211 * q.probVal);
        const blue = Math.round(68 * (1 - q.probVal) + 153 * q.probVal);
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, 0.72)`;
      }

      ctx.fill();
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });

    scatterData.forEach(pt => {
      const probPt = pt.label === 0 ? 0 : 1;
      const scr = project3D(pt.x1, bYMin + probPt * (bYMax - bYMin), pt.x2);
      ctx.beginPath();
      ctx.arc(scr.x, scr.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = pt.label === 1 ? '#34d399' : pt.label === 2 ? '#38bdf8' : '#f87171';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [activeModuleId, logDimension, logSubMode, logW1, logW2, logW3, logW4, logBiasB, logSliceX3, logSliceX4, logActivation, activeCurvature, softW0, softW1, softW2, log3dRotX, log3dRotY, scatterData]);

  // 3D Canvas Projection for Linear Regression (with Centroid & Residual 3D Drop Pillars)
  useEffect(() => {
    if (activeModuleId !== 'ols_regression' || (linSubMode !== '3d_plane' && linSubMode !== '4d_hyperplane')) return;
    const canvas = canvasLin3dRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W * 0.7);
    bgGrad.addColorStop(0, '#0b1120');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const radX = (lin3dRotX * Math.PI) / 180;
    const radY = (lin3dRotY * Math.PI) / 180;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    const project3D = (x: number, y: number, z: number) => {
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const scale = 62;
      return { x: W / 2 + x1 * scale, y: H / 2 - y2 * scale, z: z2 };
    };

    const bX = 2.4;
    const bZ = 2.4;
    const bYMin = -2.2;
    const bYMax = 2.2;

    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    for (let gx = -bX; gx <= bX + 0.1; gx += 0.8) {
      const pStart = project3D(gx, bYMin, -bZ);
      const pEnd = project3D(gx, bYMin, bZ);
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.stroke();
    }
    for (let gz = -bZ; gz <= bZ + 0.1; gz += 0.8) {
      const pStart = project3D(-bX, bYMin, gz);
      const pEnd = project3D(bX, bYMin, gz);
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.stroke();
    }

    const evalY = (x1: number, x2: number) => {
      if (linSubMode === '4d_hyperplane') {
        return linStats.beta0 + linStats.beta1 * x1 + linStats.beta2 * x2 + linStats.beta3 * linSliceX3 + linStats.beta4 * linSliceX4;
      }
      return linStats.beta0 + linStats.beta1 * x1 + linStats.beta2 * x2;
    };

    const quads: Array<{ p1: any; p2: any; p3: any; p4: any; avgZ: number; avgY: number }> = [];
    const steps = 14;
    const range = 2.2;
    for (let i = 0; i < steps; i++) {
      for (let j = 0; j < steps; j++) {
        const u1 = -range + (i / steps) * (2 * range);
        const u2 = -range + ((i + 1) / steps) * (2 * range);
        const v1 = -range + (j / steps) * (2 * range);
        const v2 = -range + ((j + 1) / steps) * (2 * range);

        const y1 = evalY(u1, v1);
        const y2 = evalY(u2, v1);
        const y3 = evalY(u2, v2);
        const y4 = evalY(u1, v2);

        const p1 = project3D(u1, y1, v1);
        const p2 = project3D(u2, y2, v1);
        const p3 = project3D(u2, y3, v2);
        const p4 = project3D(u1, y4, v2);

        quads.push({
          p1, p2, p3, p4,
          avgZ: (p1.z + p2.z + p3.z + p4.z) / 4,
          avgY: (y1 + y2 + y3 + y4) / 4
        });
      }
    }

    quads.sort((a, b) => a.avgZ - b.avgZ);
    quads.forEach(q => {
      ctx.beginPath();
      ctx.moveTo(q.p1.x, q.p1.y);
      ctx.lineTo(q.p2.x, q.p2.y);
      ctx.lineTo(q.p3.x, q.p3.y);
      ctx.lineTo(q.p4.x, q.p4.y);
      ctx.closePath();

      if (linSubMode === '4d_hyperplane') {
        ctx.fillStyle = 'rgba(236, 72, 153, 0.38)';
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.85)';
      } else {
        const normY = Math.max(0, Math.min(1, (q.avgY + 2) / 4));
        const r = Math.round(52 + normY * 180);
        const g = Math.round(211 - normY * 80);
        const b = Math.round(153 + normY * 95);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.38)`;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.75)`;
      }

      ctx.fill();
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw 3D Residual Drop Pillars
    linPoints.forEach(pt => {
      const predY = evalY(pt.x1, pt.x2);
      const scrPoint = project3D(pt.x1, pt.y, pt.x2);
      const scrPlane = project3D(pt.x1, predY, pt.x2);

      ctx.beginPath();
      ctx.moveTo(scrPoint.x, scrPoint.y);
      ctx.lineTo(scrPlane.x, scrPlane.y);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(scrPoint.x, scrPoint.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Draw Centroid Point (Center of Mass: mean(X1), mean(Y), mean(X2))
    const meanX2 = linPoints.reduce((s, p) => s + p.x2, 0) / (linPoints.length || 1);
    const scrCentroid = project3D(linStats.meanX1, linStats.meanY, meanX2);
    ctx.beginPath();
    ctx.arc(scrCentroid.x, scrCentroid.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [activeModuleId, linSubMode, lin3dRotX, lin3dRotY, linStats, linSliceX3, linSliceX4, linPoints]);

  // 3D Canvas Projection for MathBox 3D
  useEffect(() => {
    if (activeModuleId !== 'mathbox_3d') return;
    const canvas = canvas3DRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W * 0.7);
    bgGrad.addColorStop(0, '#0b1120');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    const project3D = (x: number, y: number, z: number) => {
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const scale = 62;
      return { x: W / 2 + x1 * scale, y: H / 2 - y2 * scale, z: z2 };
    };

    const bX = 2.4;
    const bZ = 2.4;
    const bYMin = -1.6;
    const bYMax = 1.6;

    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    for (let gx = -bX; gx <= bX + 0.1; gx += 0.8) {
      const pStart = project3D(gx, bYMin, -bZ);
      const pEnd = project3D(gx, bYMin, bZ);
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.stroke();
    }
    for (let gz = -bZ; gz <= bZ + 0.1; gz += 0.8) {
      const pStart = project3D(-bX, bYMin, gz);
      const pEnd = project3D(bX, bYMin, gz);
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.stroke();
    }

    const evalZ = (u: number, v: number) => {
      if (surfaceType === 'hyper_4d') {
        return (u * u - v * v) * 0.35 * Math.cos(hyperW) + 0.45 * Math.sin(u * hyperW);
      } else if (surfaceType === 'saddle') {
        return (u * u - v * v) * 0.42;
      } else if (surfaceType === 'monkey') {
        return (u * u * u - 3 * u * v * v) * 0.16;
      } else if (surfaceType === 'ripple') {
        const r = Math.sqrt(u * u + v * v) * 2.2;
        return Math.cos(r - timeT * 2.5) * 0.75;
      } else {
        return (u * u + v * v) * 0.32 - 1.0;
      }
    };

    const quads: Array<{ p1: any; p2: any; p3: any; p4: any; avgZ: number; valZ: number }> = [];
    const steps = 24;
    const range = 2.1;
    for (let i = 0; i < steps; i++) {
      for (let j = 0; j < steps; j++) {
        const u1 = -range + (i / steps) * (2 * range);
        const u2 = -range + ((i + 1) / steps) * (2 * range);
        const v1 = -range + (j / steps) * (2 * range);
        const v2 = -range + ((j + 1) / steps) * (2 * range);

        const z1 = evalZ(u1, v1);
        const z2 = evalZ(u2, v1);
        const z3 = evalZ(u2, v2);
        const z4 = evalZ(u1, v2);

        const p1 = project3D(u1, z1, v1);
        const p2 = project3D(u2, z2, v1);
        const p3 = project3D(u2, z3, v2);
        const p4 = project3D(u1, z4, v2);

        quads.push({ p1, p2, p3, p4, avgZ: (p1.z + p2.z + p3.z + p4.z) / 4, valZ: (z1 + z2 + z3 + z4) / 4 });
      }
    }

    quads.sort((a, b) => a.avgZ - b.avgZ);
    quads.forEach(q => {
      ctx.beginPath();
      ctx.moveTo(q.p1.x, q.p1.y);
      ctx.lineTo(q.p2.x, q.p2.y);
      ctx.lineTo(q.p3.x, q.p3.y);
      ctx.lineTo(q.p4.x, q.p4.y);
      ctx.closePath();

      const normH = Math.max(0, Math.min(1, (q.valZ + 1.2) / 2.4));
      const red = Math.round(56 + normH * (192 - 56));
      const green = Math.round(189 - normH * (189 - 132));
      const blue = 248;

      ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, 0.78)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(15, 23, 42, 0.5)`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });
  }, [activeModuleId, surfaceType, hyperW, rotX, rotY, timeT]);

  return (
    <div
      className="test-diagrams-studio-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'var(--bg-primary, #020617)',
        color: 'var(--text-primary, #f8fafc)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* ─── Top Studio Command Header ─── */}
      <div
        className="dsa-header-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '8px 16px',
          background: 'var(--card-bg, rgba(15, 23, 42, 0.88))',
          borderRadius: '10px',
          border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))',
          backdropFilter: 'blur(10px)',
          margin: '10px 14px 4px 14px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              height: '32px',
              padding: '0 10px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--pill-bg, rgba(30, 41, 59, 0.6))',
              color: 'var(--accent-cyan, #38bdf8)',
              border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))'
            }}
          >
            {isSidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
            <span>{isSidebarOpen ? 'Hide Deck' : 'Show Deck'}</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.90rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>
                Mafs • JSXGraph • Plotly • MathBox Studio 📐
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.4)'
                }}
              >
                {activeMeta.badge}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={activeModuleId}
              onChange={(e) => setActiveModuleId(e.target.value as MathStudioModuleId)}
              style={{
                height: '32px',
                padding: '0 32px 0 12px',
                borderRadius: '6px',
                background: 'var(--dropdown-bg, rgba(15, 23, 42, 0.96))',
                color: 'var(--text-primary, #f8fafc)',
                border: '1px solid var(--dropdown-border, rgba(6, 182, 212, 0.4))',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none'
              }}
            >
              <optgroup label="📊 Statistics & Machine Learning">
                <option value="logistic_regression">Logistic Regression & Softmax Lab (1D/2D/3D/4D)</option>
                <option value="ols_regression">Linear Regression & 3D/4D Plane Lab</option>
                <option value="gaussian_ci">Gaussian & Student-t Distributions</option>
              </optgroup>
              <optgroup label="📐 2D Geometry & Multi-Line">
                <option value="multi_line_intersections">Multi-Line Intersections & Systems</option>
                <option value="mafs_curves">Harmonics, Fourier & Vector Spaces</option>
              </optgroup>
              <optgroup label="⚡ Dynamic Calculus & Tangents">
                <option value="jsxgraph_calculus">Tangents, Derivatives & Riemann Sums</option>
              </optgroup>
              <optgroup label="🌌 3D & Multivariable Manifolds">
                <option value="mathbox_3d">3D Mesh & 4D Hyperplane Slicing</option>
              </optgroup>
              <optgroup label="🌀 Differential Equations & ODEs">
                <option value="vector_fields">Vector Fields & Phase Space Orbits</option>
              </optgroup>
              <optgroup label="🧪 Sandbox & Documentation">
                <option value="formula_sandbox">Multivariable Formula Sandbox</option>
                <option value="framework_compare">Framework Architecture Guide</option>
              </optgroup>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: 'var(--accent-cyan, #38bdf8)' }} />
          </div>

          <button
            type="button"
            onClick={() => setIsBendingAnim(!isBendingAnim)}
            style={{
              height: '32px',
              padding: '0 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: isBendingAnim ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)',
              color: isBendingAnim ? '#34d399' : 'var(--text-muted)',
              border: isBendingAnim ? '1px solid #34d399' : '1px solid rgba(51, 65, 85, 0.6)'
            }}
            title="Toggle Live S-Curvature Animation"
          >
            <Waves size={13} />
            <span>Wave</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAutoOrbit(!isAutoOrbit)}
            style={{
              height: '32px',
              padding: '0 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: isAutoOrbit ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
              color: isAutoOrbit ? '#38bdf8' : 'var(--text-muted)',
              border: isAutoOrbit ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)'
            }}
            title="Toggle 3D Auto-Orbit Animation"
          >
            <Orbit size={13} />
            <span>Orbit</span>
          </button>
        </div>
      </div>

      {/* ─── Main Workspace Flex Layout (Left Collapsible Sidebar / Right Full-Bleed Canvas) ─── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: isSidebarOpen ? '12px' : '0px',
          padding: '6px 14px 14px 14px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* ─── LEFT COLUMN: Collapsible Control Deck ─── */}
        <div
          style={{
            width: isSidebarOpen ? '340px' : '0px',
            minWidth: isSidebarOpen ? '340px' : '0px',
            opacity: isSidebarOpen ? 1 : 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
            pointerEvents: isSidebarOpen ? 'auto' : 'none'
          }}
        >
          {/* Module Description Card */}
          <div
            style={{
              background: 'var(--card-bg, rgba(15, 23, 42, 0.88))',
              borderRadius: '10px',
              border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))',
              padding: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--accent-cyan, #38bdf8)', fontSize: '0.80rem', fontWeight: 800 }}>
              <activeMeta.icon size={15} />
              <span>{activeMeta.name}</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: '1.4', margin: 0 }}>
              {activeMeta.description}
            </p>
          </div>

          <div
            style={{
              background: 'var(--card-bg, rgba(15, 23, 42, 0.88))',
              borderRadius: '10px',
              border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* LOGISTIC REGRESSION CONTROLS */}
            {activeModuleId === 'logistic_regression' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <PillSelector
                  options={[
                    { id: 'binary_linear', label: 'Standard Binary' },
                    { id: 'softmax_3class', label: '3-Class Softmax' },
                    { id: '4d_hyperplane', label: '4D Hyperplane' },
                    { id: 'polynomial_nonlinear', label: 'Polynomial' }
                  ]}
                  value={logSubMode}
                  onChange={(val) => setLogSubMode(val as any)}
                  columns={2}
                  activeColor="#34d399"
                />

                {/* Dimension Selector */}
                {logSubMode !== '4d_hyperplane' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                      Dimensional View:
                    </span>
                    <PillSelector
                      options={[
                        { id: '1d_curve', label: '1D S-Curve' },
                        { id: '2d_boundary', label: '2D Probability' },
                        { id: '3d_surface', label: '3D Landscape' }
                      ]}
                      value={logDimension}
                      onChange={(val) => setLogDimension(val as any)}
                      columns={3}
                      activeColor="#38bdf8"
                    />
                  </div>
                )}

                {/* 2D Visual Style Selector */}
                {logDimension === '2d_boundary' && logSubMode === 'binary_linear' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                      2D Visual Representation:
                    </span>
                    <PillSelector
                      options={[
                        { id: 'smooth_heatmap', label: '🌈 Heatmap' },
                        { id: 'iso_contours', label: '🗺️ Iso-Contours' },
                        { id: 'boundary_only', label: '⚡ Boundary' }
                      ]}
                      value={log2dVisualMode}
                      onChange={(val) => setLog2dVisualMode(val as any)}
                      columns={3}
                      activeColor="#38bdf8"
                    />
                  </div>
                )}

                {/* Activation Function Selector */}
                {logSubMode !== 'softmax_3class' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                      Activation Function:
                    </span>
                    <PillSelector
                      options={[
                        { id: 'sigmoid', label: 'Sigmoid' },
                        { id: 'tanh', label: 'Tanh' },
                        { id: 'relu', label: 'ReLU' },
                        { id: 'gelu', label: 'GELU' },
                        { id: 'leaky_relu', label: 'Leaky' },
                        { id: 'probit', label: 'Probit' }
                      ]}
                      value={logActivation}
                      onChange={(val) => setLogActivation(val as any)}
                      columns={3}
                      activeColor="#ec4899"
                    />
                  </div>
                )}

                {/* 3-Class Softmax Parameters */}
                {logSubMode === 'softmax_3class' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#f87171' }}>Class 0 (Red) Hyperplane:</span>
                      <DualParamControl label="w₀,₁:" value={softW0.w1} min={-3.0} max={3.0} step={0.1} onChange={(val) => setSoftW0(prev => ({ ...prev, w1: val }))} color="#f87171" />
                      <DualParamControl label="w₀,₂:" value={softW0.w2} min={-3.0} max={3.0} step={0.1} onChange={(val) => setSoftW0(prev => ({ ...prev, w2: val }))} color="#f87171" />
                      <DualParamControl label="b₀:" value={softW0.b} min={-3.0} max={3.0} step={0.1} onChange={(val) => setSoftW0(prev => ({ ...prev, b: val }))} color="#f87171" />
                    </div>

                    <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(52, 211, 153, 0.4)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#34d399' }}>Class 1 (Green) Hyperplane:</span>
                      <DualParamControl label="w₁,₁:" value={softW1.w1} min={-3.0} max={3.0} step={0.1} onChange={(val) => setSoftW1(prev => ({ ...prev, w1: val }))} color="#34d399" />
                      <DualParamControl label="w₁,₂:" value={softW1.w2} min={-3.0} max={3.0} step={0.1} onChange={(val) => setSoftW1(prev => ({ ...prev, w2: val }))} color="#34d399" />
                      <DualParamControl label="b₁:" value={softW1.b} min={-3.0} max={3.0} step={0.1} onChange={(val) => setSoftW1(prev => ({ ...prev, b: val }))} color="#34d399" />
                    </div>

                    <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(56, 189, 248, 0.4)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#38bdf8' }}>Class 2 (Cyan) Hyperplane:</span>
                      <DualParamControl label="w₂,₁:" value={softW2.w1} min={-3.0} max={3.0} step={0.1} onChange={(val) => setSoftW2(prev => ({ ...prev, w1: val }))} color="#38bdf8" />
                      <DualParamControl label="w₂,₂:" value={softW2.w2} min={-3.0} max={3.0} step={0.1} onChange={(val) => setSoftW2(prev => ({ ...prev, w2: val }))} color="#38bdf8" />
                      <DualParamControl label="b₂:" value={softW2.b} min={-3.0} max={3.0} step={0.1} onChange={(val) => setSoftW2(prev => ({ ...prev, b: val }))} color="#38bdf8" />
                    </div>
                  </div>
                ) : (
                  <>
                    <DualParamControl label="Weight w₁ (Feature X₁):" value={logW1} min={-4.0} max={4.0} step={0.1} onChange={setLogW1} color="#34d399" />
                    {logDimension !== '1d_curve' && (
                      <DualParamControl label="Weight w₂ (Feature X₂):" value={logW2} min={-4.0} max={4.0} step={0.1} onChange={setLogW2} color="#38bdf8" />
                    )}
                    <DualParamControl label="Bias (b):" value={logBiasB} min={-4.0} max={4.0} step={0.1} onChange={setLogBiasB} color="#ec4899" />

                    {/* Sigmoid Curvature / Steepness Control */}
                    <DualParamControl
                      label="S-Curvature / Steepness (k):"
                      value={logCurvatureK}
                      min={0.2}
                      max={5.0}
                      step={0.1}
                      onChange={(val) => {
                        setLogCurvatureK(val);
                        setIsBendingAnim(false);
                      }}
                      color="#a855f7"
                    />
                  </>
                )}

                {logSubMode === '4d_hyperplane' && (
                  <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(236, 72, 153, 0.4)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#ec4899' }}>
                      4D Multivariable Hyperplane Slicing:
                    </span>
                    <DualParamControl label="Weight w₃ (Feature X₃):" value={logW3} min={-3.0} max={3.0} step={0.1} onChange={setLogW3} color="#ec4899" />
                    <DualParamControl label="Weight w₄ (Feature X₄):" value={logW4} min={-3.0} max={3.0} step={0.1} onChange={setLogW4} color="#f59e0b" />
                    <DualParamControl label="4D Slice Position (X₃):" value={logSliceX3} min={-3.0} max={3.0} step={0.1} onChange={setLogSliceX3} color="#ec4899" />
                    <DualParamControl label="4D Slice Position (X₄):" value={logSliceX4} min={-3.0} max={3.0} step={0.1} onChange={setLogSliceX4} color="#f59e0b" />
                  </div>
                )}

                {/* Granular Point Steppers */}
                <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(51, 65, 85, 0.6)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                    Per-Class Point Steppers:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem' }}>
                    <span style={{ color: '#f87171', fontWeight: 800 }}>Class 0 (Red):</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button type="button" onClick={() => adjustClassCount(0, -1)} style={{ width: '22px', height: '22px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', cursor: 'pointer' }}>-</button>
                      <span style={{ minWidth: '22px', textAlign: 'center', fontWeight: 800 }}>{class0Count}</span>
                      <button type="button" onClick={() => adjustClassCount(0, 1)} style={{ width: '22px', height: '22px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem' }}>
                    <span style={{ color: '#34d399', fontWeight: 800 }}>Class 1 (Green):</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button type="button" onClick={() => adjustClassCount(1, -1)} style={{ width: '22px', height: '22px', borderRadius: '3px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)', cursor: 'pointer' }}>-</button>
                      <span style={{ minWidth: '22px', textAlign: 'center', fontWeight: 800 }}>{class1Count}</span>
                      <button type="button" onClick={() => adjustClassCount(1, 1)} style={{ width: '22px', height: '22px', borderRadius: '3px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 800 }}>Class 2 (Cyan):</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button type="button" onClick={() => adjustClassCount(2, -1)} style={{ width: '22px', height: '22px', borderRadius: '3px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', cursor: 'pointer' }}>-</button>
                      <span style={{ minWidth: '22px', textAlign: 'center', fontWeight: 800 }}>{class2Count}</span>
                      <button type="button" onClick={() => adjustClassCount(2, 1)} style={{ width: '22px', height: '22px', borderRadius: '3px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                </div>

                {/* Exact Coordinate Placement Box with Un-truncated Button */}
                <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(51, 65, 85, 0.6)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                    Add Point at (X₁, X₂):
                  </span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <select
                      value={injectLogClass}
                      onChange={(e) => setInjectLogClass(parseInt(e.target.value) as any)}
                      style={{ padding: '4px', borderRadius: '4px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', fontSize: '0.66rem' }}
                    >
                      <option value="0">C0</option>
                      <option value="1">C1</option>
                      <option value="2">C2</option>
                    </select>
                    <input
                      type="number"
                      value={injectLogX1}
                      step={0.1}
                      onChange={(e) => setInjectLogX1(parseFloat(e.target.value) || 0)}
                      placeholder="X1"
                      style={{ flex: 1, minWidth: '40px', padding: '4px', textAlign: 'center', borderRadius: '4px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', fontSize: '0.66rem' }}
                    />
                    <input
                      type="number"
                      value={injectLogX2}
                      step={0.1}
                      onChange={(e) => setInjectLogX2(parseFloat(e.target.value) || 0)}
                      placeholder="X2"
                      style={{ flex: 1, minWidth: '40px', padding: '4px', textAlign: 'center', borderRadius: '4px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', fontSize: '0.66rem' }}
                    />
                    <button
                      type="button"
                      onClick={handleInjectLogPoint}
                      style={{ padding: '4px 10px', minWidth: '58px', whiteSpace: 'nowrap', borderRadius: '4px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Expandable Data Points Inspector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setIsLogPointsListOpen(!isLogPointsListOpen)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(30, 41, 59, 0.6)',
                      color: 'var(--accent-cyan, #38bdf8)',
                      border: '1px solid rgba(51, 65, 85, 0.6)'
                    }}
                  >
                    <span>Inspect All Points ({scatterData.length})</span>
                    {isLogPointsListOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {isLogPointsListOpen && (
                    <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px', padding: '4px', background: '#090d16', borderRadius: '4px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
                      {scatterData.map((p, idx) => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.64rem', padding: '2px 4px', borderBottom: '1px solid rgba(30, 41, 59, 0.5)' }}>
                          <span style={{ color: p.label === 0 ? '#f87171' : p.label === 1 ? '#34d399' : '#38bdf8' }}>
                            #{idx + 1}: ({p.x1}, {p.x2}) → C{p.label}
                          </span>
                          <button type="button" onClick={() => removeScatterPoint(p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Telemetry */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Accuracy:</span>
                    <span style={{ color: '#34d399', fontWeight: 800 }}>{logStats.accuracy.toFixed(1)}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Mean Loss:</span>
                    <span style={{ color: '#f59e0b', fontWeight: 800 }}>{logStats.meanLoss.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* LINEAR REGRESSION CONTROLS */}
            {activeModuleId === 'ols_regression' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <PillSelector
                  options={[
                    { id: '1d_linear', label: '1D Line' },
                    { id: '3d_plane', label: '3D Plane' },
                    { id: '4d_hyperplane', label: '4D Hyperplane' },
                    { id: 'polynomial_curve', label: 'Non-Linear Fit' }
                  ]}
                  value={linSubMode}
                  onChange={(val) => setLinSubMode(val as any)}
                  columns={2}
                  activeColor="#34d399"
                />

                {/* 1D Visual Mode Selector (Residual Squares vs 95% CI vs Drop Lines) */}
                {linSubMode === '1d_linear' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                      1D Visual Explainability:
                    </span>
                    <PillSelector
                      options={[
                        { id: 'residual_squares', label: '⬛ Squares (SSE)' },
                        { id: 'confidence_band', label: '📈 95% CI Ribbon' },
                        { id: 'drop_lines', label: '📏 Residuals' }
                      ]}
                      value={lin1dVisualMode}
                      onChange={(val) => setLin1dVisualMode(val as any)}
                      columns={3}
                      activeColor="#f59e0b"
                    />
                  </div>
                )}

                {/* Fit Mode Selector (Auto-OLS vs Manual Parameters) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                    Fitting Mode:
                  </span>
                  <PillSelector
                    options={[
                      { id: 'manual_user', label: '🛠️ Manual Sliders' },
                      { id: 'auto_ols', label: '🟢 Auto OLS Fit' }
                    ]}
                    value={linFitMode}
                    onChange={(val) => setLinFitMode(val as any)}
                    columns={2}
                    activeColor="#38bdf8"
                  />
                </div>

                {/* Live Gradient Descent Simulation Deck */}
                {linSubMode === '1d_linear' && (
                  <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(52, 211, 153, 0.4)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#34d399' }}>
                        ⚡ Gradient Descent Optimizer:
                      </span>
                      <span style={{ fontSize: '0.64rem', fontFamily: 'monospace', color: '#f59e0b' }}>
                        Epoch: {gradEpochCount}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setLinFitMode('manual_user');
                          setIsGradDescentRunning(!isGradDescentRunning);
                        }}
                        style={{
                          flex: 1,
                          padding: '5px 8px',
                          borderRadius: '4px',
                          background: isGradDescentRunning ? 'rgba(239, 68, 68, 0.25)' : 'rgba(52, 211, 153, 0.25)',
                          color: isGradDescentRunning ? '#f87171' : '#34d399',
                          border: isGradDescentRunning ? '1px solid #f87171' : '1px solid #34d399',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        {isGradDescentRunning ? <Pause size={12} /> : <Play size={12} />}
                        <span>{isGradDescentRunning ? 'Pause Optimizer' : 'Run Gradient Descent'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={performGradientDescentStep}
                        disabled={isGradDescentRunning}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '4px',
                          background: 'rgba(56, 189, 248, 0.2)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: isGradDescentRunning ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title="Execute 1 Single Optimization Step"
                      >
                        <FastForward size={12} />
                        <span>Step</span>
                      </button>
                    </div>

                    <DualParamControl
                      label="Learning Rate (η):"
                      value={learningRateEta}
                      min={0.01}
                      max={0.2}
                      step={0.01}
                      onChange={setLearningRateEta}
                      color="#34d399"
                    />
                  </div>
                )}

                {/* Non-Linear Function Family Selector */}
                {linSubMode === 'polynomial_curve' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#ec4899' }}>
                      Curve Function Family:
                    </span>
                    <PillSelector
                      options={[
                        { id: 'polynomial', label: 'Polynomial' },
                        { id: 'logarithmic', label: 'Log' },
                        { id: 'exponential', label: 'Exp' },
                        { id: 'sinusoidal', label: 'Sinusoid' }
                      ]}
                      value={linFunctionFamily}
                      onChange={(val) => setLinFunctionFamily(val as any)}
                      columns={2}
                      activeColor="#ec4899"
                    />
                  </div>
                )}

                <DualParamControl
                  label="Slope β₁ (Feature X₁):"
                  value={linStats.beta1}
                  min={-3.0}
                  max={3.0}
                  step={0.05}
                  onChange={(val) => {
                    setManualBeta1(val);
                    setLinFitMode('manual_user');
                    setIsGradDescentRunning(false);
                  }}
                  color="#34d399"
                />

                <DualParamControl
                  label="Intercept β₀:"
                  value={linStats.beta0}
                  min={-3.0}
                  max={3.0}
                  step={0.05}
                  onChange={(val) => {
                    setManualBeta0(val);
                    setLinFitMode('manual_user');
                    setIsGradDescentRunning(false);
                  }}
                  color="#ec4899"
                />

                {(linSubMode === '3d_plane' || linSubMode === '4d_hyperplane') && (
                  <DualParamControl
                    label="Slope β₂ (Feature X₂):"
                    value={linStats.beta2}
                    min={-3.0}
                    max={3.0}
                    step={0.05}
                    onChange={(val) => {
                      setManualBeta2(val);
                      setLinFitMode('manual_user');
                    }}
                    color="#38bdf8"
                  />
                )}

                {linSubMode === '4d_hyperplane' && (
                  <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(236, 72, 153, 0.4)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#ec4899' }}>
                      4D Multivariable Hyperplane Slicing:
                    </span>
                    <DualParamControl
                      label="Slope β₃ (Feature X₃):"
                      value={linStats.beta3}
                      min={-3.0}
                      max={3.0}
                      step={0.05}
                      onChange={(val) => {
                        setManualBeta3(val);
                        setLinFitMode('manual_user');
                      }}
                      color="#ec4899"
                    />
                    <DualParamControl
                      label="Slope β₄ (Feature X₄):"
                      value={linStats.beta4}
                      min={-3.0}
                      max={3.0}
                      step={0.05}
                      onChange={(val) => {
                        setManualBeta4(val);
                        setLinFitMode('manual_user');
                      }}
                      color="#f59e0b"
                    />
                    <DualParamControl label="4D Slice Position (X₃):" value={linSliceX3} min={-3.0} max={3.0} step={0.1} onChange={setLinSliceX3} color="#ec4899" />
                    <DualParamControl label="4D Slice Position (X₄):" value={linSliceX4} min={-3.0} max={3.0} step={0.1} onChange={setLinSliceX4} color="#f59e0b" />
                  </div>
                )}

                {/* Granular Points Stepper */}
                <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(51, 65, 85, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.70rem' }}>
                  <span style={{ color: 'var(--accent-cyan, #38bdf8)', fontWeight: 800 }}>Sample Points Count:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button type="button" onClick={() => adjustLinPointsCount(-1)} style={{ width: '22px', height: '22px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', cursor: 'pointer' }}>-</button>
                    <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 800 }}>{linPoints.length}</span>
                    <button type="button" onClick={() => adjustLinPointsCount(1)} style={{ width: '22px', height: '22px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', cursor: 'pointer' }}>+</button>
                  </div>
                </div>

                {/* Add Exact Point at (X, Y) with Un-truncated Button */}
                <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(51, 65, 85, 0.6)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                    Add Point at (X, Y):
                  </span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input type="number" value={injectLinX} step={0.1} onChange={(e) => setInjectLinX(parseFloat(e.target.value) || 0)} placeholder="X" style={{ flex: 1, minWidth: '40px', padding: '4px', textAlign: 'center', borderRadius: '4px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', fontSize: '0.66rem' }} />
                    <input type="number" value={injectLinY} step={0.1} onChange={(e) => setInjectLinY(parseFloat(e.target.value) || 0)} placeholder="Y" style={{ flex: 1, minWidth: '40px', padding: '4px', textAlign: 'center', borderRadius: '4px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', fontSize: '0.66rem' }} />
                    <button type="button" onClick={handleInjectLinPoint} style={{ padding: '4px 10px', minWidth: '58px', whiteSpace: 'nowrap', borderRadius: '4px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>+ Add</button>
                  </div>
                </div>

                {/* Expandable Data Points Inspector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setIsLinPointsListOpen(!isLinPointsListOpen)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(30, 41, 59, 0.6)',
                      color: 'var(--accent-cyan, #38bdf8)',
                      border: '1px solid rgba(51, 65, 85, 0.6)'
                    }}
                  >
                    <span>Inspect All Points ({linPoints.length})</span>
                    {isLinPointsListOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {isLinPointsListOpen && (
                    <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px', padding: '4px', background: '#090d16', borderRadius: '4px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
                      {linPoints.map((p, idx) => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.64rem', padding: '2px 4px', borderBottom: '1px solid rgba(30, 41, 59, 0.5)' }}>
                          <span style={{ color: '#38bdf8' }}>
                            #{idx + 1}: (X: {p.x1}, Y: {p.y})
                          </span>
                          <button type="button" onClick={() => removeLinPoint(p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Telemetry */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>R² Score:</span>
                    <span style={{ color: '#34d399', fontWeight: 800 }}>{linStats.r2.toFixed(3)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Mean Squared Error (MSE):</span>
                    <span style={{ color: '#f59e0b', fontWeight: 800 }}>{linStats.mse.toFixed(3)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Sum of Squared Errors (SSE):</span>
                    <span style={{ color: '#ec4899', fontWeight: 800 }}>{linStats.sse.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* MULTI-LINE CONTROLS */}
            {activeModuleId === 'multi_line_intersections' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Active Lines ({lines.length}/6):</span>
                  <button type="button" onClick={addLine} style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                    <PlusCircle size={11} />
                    <span>+ Add Line</span>
                  </button>
                </div>
                {lines.map((line) => (
                  <div key={line.id} style={{ padding: '8px', borderRadius: '6px', background: 'var(--pill-bg, rgba(30, 41, 59, 0.6))', border: `1px solid ${line.color}40`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: line.color }}>{line.label}: y = {line.m.toFixed(2)}x + {line.c.toFixed(2)}</span>
                      {lines.length > 1 && (
                        <button type="button" onClick={() => removeLine(line.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <DualParamControl label="Slope (m):" value={line.m} min={-4.0} max={4.0} step={0.1} onChange={(val) => setLines(prev => prev.map(l => l.id === line.id ? { ...l, m: val } : l))} color={line.color} />
                    <DualParamControl label="Intercept (c):" value={line.c} min={-4.0} max={4.0} step={0.1} onChange={(val) => setLines(prev => prev.map(l => l.id === line.id ? { ...l, c: val } : l))} color={line.color} />
                  </div>
                ))}
              </div>
            )}

            {/* GAUSSIAN & STUDENT-T CONTROLS */}
            {activeModuleId === 'gaussian_ci' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <DualParamControl label="Mean (μ):" value={gaussMean} min={-3.0} max={3.0} step={0.1} onChange={setGaussMean} color="#38bdf8" />
                <DualParamControl label="Standard Deviation (σ):" value={gaussStd} min={0.2} max={3.0} step={0.1} onChange={setGaussStd} color="#34d399" />
                <DualParamControl label="Student-t Degrees of Freedom (ν):" value={studentNu} min={1} max={30} step={1} precision={0} onChange={setStudentNu} color="#f59e0b" />
                <PillSelector options={[{ id: 90, label: '90% CI' }, { id: 95, label: '95% CI' }, { id: 99, label: '99% CI' }]} value={ciConfidence} onChange={(val) => setCiConfidence(val as any)} columns={3} activeColor="#a855f7" />
              </div>
            )}

            {/* DYNAMIC CALCULUS CONTROLS */}
            {activeModuleId === 'jsxgraph_calculus' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <DualParamControl label="Tangent Point (x₀):" value={calcX0} min={-2.5} max={2.5} step={0.05} onChange={setCalcX0} color="#38bdf8" />
                <DualParamControl label="Riemann Partitions (N):" value={calcIntegralN} min={4} max={40} step={2} precision={0} onChange={setCalcIntegralN} color="#34d399" />
                <PillSelector options={[{ id: 'midpoint', label: 'Midpoint' }, { id: 'trapezoid', label: 'Trapezoid' }, { id: 'left', label: 'Left' }, { id: 'right', label: 'Right' }]} value={calcIntegralMethod} onChange={(val) => setCalcIntegralMethod(val as any)} columns={2} />
              </div>
            )}

            {/* MATHBOX 3D CONTROLS */}
            {activeModuleId === 'mathbox_3d' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <PillSelector options={[{ id: 'hyper_4d', label: '4D Hyper-Slice' }, { id: 'saddle', label: 'Saddle' }, { id: 'monkey', label: 'Monkey' }, { id: 'ripple', label: 'Ripple' }]} value={surfaceType} onChange={(val) => setSurfaceType(val as any)} />
                {surfaceType === 'hyper_4d' && <DualParamControl label="4D Hyperplane Slice (w):" value={hyperW} min={-3.14} max={3.14} step={0.1} onChange={setHyperW} color="#ec4899" />}
                <DualParamControl label="Pitch Angle (Rx):" value={rotX} min={-80} max={80} step={2} onChange={setRotX} color="#38bdf8" />
                <DualParamControl label="Yaw Angle (Ry):" value={rotY} min={-180} max={180} step={2} onChange={setRotY} color="#34d399" />
              </div>
            )}

            {/* VECTOR FIELDS CONTROLS */}
            {activeModuleId === 'vector_fields' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <PillSelector options={[{ id: 'pendulum', label: 'Damped Pendulum' }, { id: 'lotka_volterra', label: 'Lotka-Volterra' }, { id: 'vanderpol', label: 'Van der Pol' }]} value={odeSystem} onChange={(val) => setOdeSystem(val as any)} />
                <DualParamControl label="Damping Coefficient (γ):" value={dampingFactor} min={0.0} max={1.5} step={0.05} onChange={setDampingFactor} color="#38bdf8" />
              </div>
            )}

            {/* FORMULA SANDBOX CONTROLS */}
            {activeModuleId === 'formula_sandbox' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <DualParamControl label="Parameter k (Frequency):" value={paramK} min={0.5} max={8.0} step={0.1} onChange={setParamK} color="#38bdf8" />
                <DualParamControl label="Parameter a (Amplitude):" value={paramA} min={0.1} max={3.0} step={0.1} onChange={setParamA} color="#34d399" />
                <DualParamControl label="Parameter b (Phase Shift):" value={paramB} min={-3.14} max={3.14} step={0.1} onChange={setParamB} color="#ec4899" />
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Full Interactive Visualizer Deck (100% Full-Bleed on Collapse) ─── */}
        <div
          style={{
            flex: 1,
            height: '100%',
            minWidth: 0,
            background: 'var(--card-bg, rgba(15, 23, 42, 0.88))',
            borderRadius: '10px',
            border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* 1. LOGISTIC REGRESSION VISUALIZER */}
          {activeModuleId === 'logistic_regression' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              {(logDimension === '3d_surface' || logSubMode === '4d_hyperplane') ? (
                <div
                  style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
                  onMouseDown={(e) => {
                    setIsDraggingLog3D(true);
                    dragLog3dStartRef.current = { x: e.clientX, y: e.clientY, rx: log3dRotX, ry: log3dRotY };
                  }}
                  onMouseMove={(e) => {
                    if (!isDraggingLog3D) return;
                    const dx = e.clientX - dragLog3dStartRef.current.x;
                    const dy = e.clientY - dragLog3dStartRef.current.y;
                    setLog3dRotY(dragLog3dStartRef.current.ry + dx * 0.5);
                    setLog3dRotX(Math.max(-80, Math.min(80, dragLog3dStartRef.current.rx - dy * 0.5)));
                  }}
                  onMouseUp={() => setIsDraggingLog3D(false)}
                  onMouseLeave={() => setIsDraggingLog3D(false)}
                >
                  <canvas ref={canvasLog3dRef} width={700} height={480} style={{ width: '100%', height: '100%', cursor: isDraggingLog3D ? 'grabbing' : 'grab' }} />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(52, 211, 153, 0.4)',
                      fontSize: '0.74rem',
                      fontFamily: 'monospace',
                      color: logSubMode === 'softmax_3class' ? '#38bdf8' : '#34d399'
                    }}
                  >
                    🌀 {logSubMode === 'softmax_3class' ? '3-Class Softmax Decision Landscape' : logSubMode === '4d_hyperplane' ? '4D Hyperplane Slicing' : '3D Smooth Probability Manifold'} • Curvature: {activeCurvature.toFixed(2)}
                  </div>
                </div>
              ) : logDimension === '1d_curve' ? (
                /* ─── 1D SIGMOID S-CURVE CARTESIAN PLOT ─── */
                <svg viewBox="-320 -200 640 400" style={{ width: '100%', height: '100%', background: '#090d16', userSelect: 'none' }}>
                  {/* Grid Lines & Axis */}
                  <line x1="-300" y1="120" x2="300" y2="120" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" />
                  <line x1="-300" y1="-120" x2="300" y2="-120" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="-300" y1="0" x2="300" y2="0" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <line x1="0" y1="-160" x2="0" y2="150" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" />

                  {/* Axis & Probability Level Labels */}
                  <text x="-310" y="-115" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">P = 1.0 (Class 1)</text>
                  <text x="-310" y="5" fill="#f59e0b" fontSize="10" fontWeight="bold" fontFamily="monospace">P = 0.5 (Cutoff)</text>
                  <text x="-310" y="125" fill="#f87171" fontSize="11" fontWeight="bold" fontFamily="monospace">P = 0.0 (Class 0)</text>
                  <text x="280" y="140" fill="var(--text-muted)" fontSize="10" fontWeight="bold" fontFamily="monospace">Feature X₁ →</text>

                  {/* 1D Sigmoid S-Curve Path */}
                  <path
                    d={(() => {
                      let path = '';
                      for (let px = -300; px <= 300; px += 3) {
                        const x = px / 65;
                        const z = activeCurvature * (logW1 * x + logBiasB);
                        const pVal = applyActivation(z, logActivation);
                        const py = 120 - pVal * 240;
                        if (px === -300) path += `M ${px} ${py}`;
                        else path += ` L ${px} ${py}`;
                      }
                      return path;
                    })()}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                  />

                  {/* Threshold Intercept Vertical Marker (x = -b / w1) */}
                  {Math.abs(logW1) > 0.05 && (
                    <g>
                      <line
                        x1={(-logBiasB / logW1) * 65}
                        y1="-150"
                        x2={(-logBiasB / logW1) * 65}
                        y2="140"
                        stroke="#f59e0b"
                        strokeWidth="1.6"
                        strokeDasharray="2 2"
                      />
                      <circle cx={(-logBiasB / logW1) * 65} cy="0" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                      <text x={(-logBiasB / logW1) * 65 + 8} y="-8" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">x* = {(-logBiasB / logW1).toFixed(2)}</text>
                    </g>
                  )}

                  {/* 1D Scatter Data Points with Vertical Projection Lines */}
                  {scatterData.map(p => {
                    const z = activeCurvature * (logW1 * p.x1 + logBiasB);
                    const predP = applyActivation(z, logActivation);
                    const curveY = 120 - predP * 240;
                    const pointY = p.label === 0 ? 120 : -120;
                    const color = p.label === 0 ? '#f87171' : '#34d399';

                    return (
                      <g key={p.id}>
                        <line x1={p.x1 * 65} y1={pointY} x2={p.x1 * 65} y2={curveY} stroke={color} strokeWidth="1.2" strokeDasharray="2 2" />
                        <circle cx={p.x1 * 65} cy={curveY} r="3.5" fill={color} opacity={0.6} />
                        <circle cx={p.x1 * 65} cy={pointY} r="6" fill={color} stroke="#ffffff" strokeWidth="1.5" />
                      </g>
                    );
                  })}
                </svg>
              ) : (
                /* ─── 2D PROBABILITY HEATMAP, ISO-CONTOURS & BOUNDARIES ─── */
                <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: '#090d16', userSelect: 'none' }}>
                  {/* 2D Continuous Probability Heatmap Grid Overlay */}
                  {logSubMode === 'binary_linear' && log2dVisualMode === 'smooth_heatmap' && (
                    <g opacity="0.42">
                      {(() => {
                        const cells = [];
                        const cols = 28;
                        const rows = 20;
                        const dx = 640 / cols;
                        const dy = 480 / rows;
                        for (let c = 0; c < cols; c++) {
                          for (let r = 0; r < rows; r++) {
                            const vx = -4.0 + (c / cols) * 8.0;
                            const vy = 3.0 - (r / rows) * 6.0;
                            const z = activeCurvature * (logW1 * vx + logW2 * vy + logBiasB);
                            const pVal = applyActivation(z, logActivation);

                            const red = Math.round(239 * (1 - pVal) + 52 * pVal);
                            const green = Math.round(68 * (1 - pVal) + 211 * pVal);
                            const blue = Math.round(68 * (1 - pVal) + 153 * pVal);

                            cells.push(
                              <rect
                                key={`hm-${c}-${r}`}
                                x={-320 + c * dx}
                                y={-240 + r * dy}
                                width={dx + 0.5}
                                height={dy + 0.5}
                                fill={`rgb(${red}, ${green}, ${blue})`}
                              />
                            );
                          }
                        }
                        return cells;
                      })()}
                    </g>
                  )}

                  {/* 3-Class Softmax Tri-Color Territory Heatmap */}
                  {logSubMode === 'softmax_3class' && (
                    <g opacity="0.35">
                      {(() => {
                        const cells = [];
                        const cols = 28;
                        const rows = 20;
                        const dx = 640 / cols;
                        const dy = 480 / rows;
                        for (let c = 0; c < cols; c++) {
                          for (let r = 0; r < rows; r++) {
                            const vx = -4.0 + (c / cols) * 8.0;
                            const vy = 3.0 - (r / rows) * 6.0;
                            const z0 = softW0.w1 * vx + softW0.w2 * vy + softW0.b;
                            const z1 = softW1.w1 * vx + softW1.w2 * vy + softW1.b;
                            const z2 = softW2.w1 * vx + softW2.w2 * vy + softW2.b;
                            const maxZ = Math.max(z0, z1, z2);
                            const e0 = Math.exp(z0 - maxZ);
                            const e1 = Math.exp(z1 - maxZ);
                            const e2 = Math.exp(z2 - maxZ);
                            const sum = e0 + e1 + e2;
                            const p0 = e0 / sum;
                            const p1 = e1 / sum;
                            const p2 = e2 / sum;
                            const maxP = Math.max(p0, p1, p2);

                            let fillCol = 'rgb(239, 68, 68)';
                            if (p1 === maxP) fillCol = 'rgb(52, 211, 153)';
                            else if (p2 === maxP) fillCol = 'rgb(56, 189, 248)';

                            cells.push(
                              <rect
                                key={`sm-${c}-${r}`}
                                x={-320 + c * dx}
                                y={-240 + r * dy}
                                width={dx + 0.5}
                                height={dy + 0.5}
                                fill={fillCol}
                                opacity={Math.min(1.0, (maxP - 0.33) * 1.5)}
                              />
                            );
                          }
                        }
                        return cells;
                      })()}
                    </g>
                  )}

                  {/* Coordinate Axes */}
                  <line x1="-320" y1="0" x2="320" y2="0" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" />
                  <line x1="0" y1="-240" x2="0" y2="240" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" />

                  {/* Multi-Class Softmax Decision Rays */}
                  {logSubMode === 'softmax_3class' && (
                    <>
                      <line x1="-300" y1={-((-300 / 80) * (-(softW0.w1 - softW1.w1) / ((softW0.w2 - softW1.w2) || 1e-4)) - (softW0.b - softW1.b) / ((softW0.w2 - softW1.w2) || 1e-4)) * 60} x2="300" y2={-((300 / 80) * (-(softW0.w1 - softW1.w1) / ((softW0.w2 - softW1.w2) || 1e-4)) - (softW0.b - softW1.b) / ((softW0.w2 - softW1.w2) || 1e-4)) * 60} stroke="#f87171" strokeWidth="2.8" strokeDasharray="3 3" />
                      <line x1="-300" y1={-((-300 / 80) * (-(softW1.w1 - softW2.w1) / ((softW1.w2 - softW2.w2) || 1e-4)) - (softW1.b - softW2.b) / ((softW1.w2 - softW2.w2) || 1e-4)) * 60} x2="300" y2={-((300 / 80) * (-(softW1.w1 - softW2.w1) / ((softW1.w2 - softW2.w2) || 1e-4)) - (softW1.b - softW2.b) / ((softW1.w2 - softW2.w2) || 1e-4)) * 60} stroke="#34d399" strokeWidth="2.8" strokeDasharray="3 3" />
                      <line x1="-300" y1={-((-300 / 80) * (-(softW2.w1 - softW0.w1) / ((softW2.w2 - softW0.w2) || 1e-4)) - (softW2.b - softW0.b) / ((softW2.w2 - softW0.w2) || 1e-4)) * 60} x2="300" y2={-((300 / 80) * (-(softW2.w1 - softW0.w1) / ((softW2.w2 - softW0.w2) || 1e-4)) - (softW2.b - softW0.b) / ((softW2.w2 - softW0.w2) || 1e-4)) * 60} stroke="#38bdf8" strokeWidth="2.8" strokeDasharray="3 3" />
                    </>
                  )}

                  {/* Polynomial Non-Linear Curve */}
                  {logSubMode === 'polynomial_nonlinear' && (
                    <ellipse cx={0} cy={0} rx={Math.max(10, Math.sqrt(Math.max(0, -polyBias / (polyW3 || 1))) * 80)} ry={Math.max(10, Math.sqrt(Math.max(0, -polyBias / (polyW4 || 1))) * 60)} fill="rgba(52, 211, 153, 0.15)" stroke="#f59e0b" strokeWidth="3.2" />
                  )}

                  {/* Binary Iso-Probability Contours */}
                  {(logSubMode === 'binary_linear' || logSubMode === 'regularization_l1_l2') && (
                    <>
                      {log2dVisualMode === 'iso_contours' && (
                        <>
                          {/* P = 0.90 Contour */}
                          <line
                            x1="-300"
                            y1={-((-300 / 80) * (-logW1 / (logW2 || 1e-4)) - (logBiasB - 2.197 / activeCurvature) / (logW2 || 1e-4)) * 60}
                            x2="300"
                            y2={-((300 / 80) * (-logW1 / (logW2 || 1e-4)) - (logBiasB - 2.197 / activeCurvature) / (logW2 || 1e-4)) * 60}
                            stroke="#34d399"
                            strokeWidth="1.2"
                            strokeDasharray="2 2"
                            opacity="0.75"
                          />
                          {/* P = 0.75 Contour */}
                          <line
                            x1="-300"
                            y1={-((-300 / 80) * (-logW1 / (logW2 || 1e-4)) - (logBiasB - 1.098 / activeCurvature) / (logW2 || 1e-4)) * 60}
                            x2="300"
                            y2={-((300 / 80) * (-logW1 / (logW2 || 1e-4)) - (logBiasB - 1.098 / activeCurvature) / (logW2 || 1e-4)) * 60}
                            stroke="#34d399"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                            opacity="0.85"
                          />
                          {/* P = 0.25 Contour */}
                          <line
                            x1="-300"
                            y1={-((-300 / 80) * (-logW1 / (logW2 || 1e-4)) - (logBiasB + 1.098 / activeCurvature) / (logW2 || 1e-4)) * 60}
                            x2="300"
                            y2={-((300 / 80) * (-logW1 / (logW2 || 1e-4)) - (logBiasB + 1.098 / activeCurvature) / (logW2 || 1e-4)) * 60}
                            stroke="#f87171"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                            opacity="0.85"
                          />
                          {/* P = 0.10 Contour */}
                          <line
                            x1="-300"
                            y1={-((-300 / 80) * (-logW1 / (logW2 || 1e-4)) - (logBiasB + 2.197 / activeCurvature) / (logW2 || 1e-4)) * 60}
                            x2="300"
                            y2={-((300 / 80) * (-logW1 / (logW2 || 1e-4)) - (logBiasB + 2.197 / activeCurvature) / (logW2 || 1e-4)) * 60}
                            stroke="#f87171"
                            strokeWidth="1.2"
                            strokeDasharray="2 2"
                            opacity="0.75"
                          />
                        </>
                      )}

                      {/* Solid Central P = 0.5 Decision Boundary */}
                      <line
                        x1="-300"
                        y1={-((-300 / 80) * (-logW1 / (logW2 || 1e-4)) - logBiasB / (logW2 || 1e-4)) * 60}
                        x2="300"
                        y2={-((300 / 80) * (-logW1 / (logW2 || 1e-4)) - logBiasB / (logW2 || 1e-4)) * 60}
                        stroke="#f59e0b"
                        strokeWidth="3.5"
                      />
                    </>
                  )}

                  {/* 2D Scatter Data Points */}
                  {scatterData.map(p => (
                    <circle key={p.id} cx={p.x1 * 80} cy={-p.x2 * 60} r="6.5" fill={p.label === 1 ? '#34d399' : p.label === 2 ? '#38bdf8' : '#f87171'} stroke="#ffffff" strokeWidth="1.5" />
                  ))}
                </svg>
              )}
            </div>
          )}

          {/* 2. LINEAR REGRESSION VISUALIZER */}
          {activeModuleId === 'ols_regression' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              {(linSubMode === '3d_plane' || linSubMode === '4d_hyperplane') ? (
                <div
                  style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
                  onMouseDown={(e) => {
                    setIsDraggingLin3D(true);
                    dragLin3dStartRef.current = { x: e.clientX, y: e.clientY, rx: lin3dRotX, ry: lin3dRotY };
                  }}
                  onMouseMove={(e) => {
                    if (!isDraggingLin3D) return;
                    const dx = e.clientX - dragLin3dStartRef.current.x;
                    const dy = e.clientY - dragLin3dStartRef.current.y;
                    setLin3dRotY(dragLin3dStartRef.current.ry + dx * 0.5);
                    setLin3dRotX(Math.max(-80, Math.min(80, dragLin3dStartRef.current.rx - dy * 0.5)));
                  }}
                  onMouseUp={() => setIsDraggingLin3D(false)}
                  onMouseLeave={() => setIsDraggingLin3D(false)}
                >
                  <canvas ref={canvasLin3dRef} width={700} height={480} style={{ width: '100%', height: '100%', cursor: isDraggingLin3D ? 'grabbing' : 'grab' }} />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(52, 211, 153, 0.4)',
                      fontSize: '0.74rem',
                      fontFamily: 'monospace',
                      color: linSubMode === '4d_hyperplane' ? '#ec4899' : '#34d399'
                    }}
                  >
                    🌌 {linSubMode === '4d_hyperplane' ? '4D Multivariable Hyperplane' : '3D Regression Plane'} • R² = {linStats.r2.toFixed(3)} • Mode: {linFitMode === 'manual_user' ? 'Manual' : 'Auto OLS'}
                  </div>
                </div>
              ) : (
                /* ─── 1D LINEAR REGRESSION SVG CARTESIAN PLOT ─── */
                <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: '#090d16', userSelect: 'none' }}>
                  {/* Coordinate Axes */}
                  <line x1="-320" y1="0" x2="320" y2="0" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" />
                  <line x1="0" y1="-240" x2="0" y2="240" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" />

                  {/* 95% Confidence Interval Flared Ribbon */}
                  {linSubMode === '1d_linear' && lin1dVisualMode === 'confidence_band' && (
                    <path
                      d={(() => {
                        const se = linStats.rmse;
                        const N = linPoints.length;
                        const sxx = linStats.sxx;
                        const meanX = linStats.meanX1;

                        let upperPts = '';
                        let lowerPts = '';

                        for (let px = -320; px <= 320; px += 8) {
                          const x = px / 100;
                          const predY = linStats.beta0 + linStats.beta1 * x;
                          const seMean = se * Math.sqrt(1 / N + Math.pow(x - meanX, 2) / sxx);
                          const margin = 1.96 * seMean;

                          const yUpper = -(predY + margin) * 80;
                          const yLower = -(predY - margin) * 80;

                          if (px === -320) {
                            upperPts += `M ${px} ${yUpper}`;
                            lowerPts = `L ${px} ${yLower}`;
                          } else {
                            upperPts += ` L ${px} ${yUpper}`;
                            lowerPts = ` L ${px} ${yLower}` + lowerPts;
                          }
                        }
                        return upperPts + lowerPts + ' Z';
                      })()}
                      fill="rgba(56, 189, 248, 0.18)"
                      stroke="rgba(56, 189, 248, 0.5)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Geometric Residual Squares (SSE Error Boxes) */}
                  {linSubMode === '1d_linear' && lin1dVisualMode === 'residual_squares' && (
                    linPoints.map(p => {
                      const predY = linStats.beta0 + linStats.beta1 * p.x1;
                      const px = p.x1 * 100;
                      const py = -p.y * 80;
                      const predPy = -predY * 80;
                      const side = Math.abs(py - predPy);
                      const isAbove = py < predPy;

                      return (
                        <g key={`sq-${p.id}`}>
                          <rect
                            x={px}
                            y={Math.min(py, predPy)}
                            width={side}
                            height={side}
                            fill="rgba(245, 158, 11, 0.18)"
                            stroke="#f59e0b"
                            strokeWidth="1.2"
                            strokeDasharray="3 3"
                          />
                          <line x1={px} y1={py} x2={px} y2={predPy} stroke="#f59e0b" strokeWidth="2" />
                        </g>
                      );
                    })
                  )}

                  {/* Standard Residual Drop Lines */}
                  {(linSubMode === 'polynomial_curve' || (linSubMode === '1d_linear' && lin1dVisualMode === 'drop_lines')) && (
                    linPoints.map(p => {
                      let predY = 0;
                      if (linSubMode === 'polynomial_curve') {
                        if (linFunctionFamily === 'sinusoidal') {
                          predY = polyA * Math.sin(polyB * p.x1) + polyC;
                        } else if (linFunctionFamily === 'exponential') {
                          predY = polyA * Math.exp(polyB * p.x1 * 0.5) + polyC;
                        } else {
                          predY = polyA * Math.pow(p.x1, 2) + polyB * p.x1 + polyC;
                        }
                      } else {
                        predY = linStats.beta0 + linStats.beta1 * p.x1;
                      }
                      return <line key={`res-${p.id}`} x1={p.x1 * 100} y1={-p.y * 80} x2={p.x1 * 100} y2={-predY * 80} stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="3 3" />;
                    })
                  )}

                  {/* Regression Line or Non-Linear Curve */}
                  {linSubMode === 'polynomial_curve' ? (
                    <path
                      d={(() => {
                        let path = '';
                        for (let px = -320; px <= 320; px += 4) {
                          const wx = px / 100;
                          let wy = 0;
                          if (linFunctionFamily === 'sinusoidal') {
                            wy = polyA * Math.sin(polyB * wx) + polyC;
                          } else if (linFunctionFamily === 'exponential') {
                            wy = polyA * Math.exp(polyB * wx * 0.5) + polyC;
                          } else {
                            wy = polyA * Math.pow(wx, 2) + polyB * wx + polyC;
                          }
                          const py = -wy * 80;
                          if (px === -320) path += `M ${px} ${py}`;
                          else path += ` L ${px} ${py}`;
                        }
                        return path;
                      })()}
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="3.2"
                    />
                  ) : (
                    <line x1="-300" y1={-((-300 / 100) * linStats.beta1 + linStats.beta0) * 80} x2="300" y2={-((300 / 100) * linStats.beta1 + linStats.beta0) * 80} stroke="#34d399" strokeWidth="3.5" />
                  )}

                  {/* Centroid Center-of-Mass Marker (X̄, Ȳ) */}
                  {linSubMode === '1d_linear' && (
                    <g>
                      <circle cx={linStats.meanX1 * 100} cy={-linStats.meanY * 80} r="8" fill="#fbbf24" stroke="#090d16" strokeWidth="2" />
                      <circle cx={linStats.meanX1 * 100} cy={-linStats.meanY * 80} r="3" fill="#090d16" />
                      <text x={linStats.meanX1 * 100 + 10} y={-linStats.meanY * 80 - 10} fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">Centroid (X̄, Ȳ)</text>
                    </g>
                  )}

                  {/* Scatter Data Points */}
                  {linPoints.map(p => (
                    <circle key={p.id} cx={p.x1 * 100} cy={-p.y * 80} r="6.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                  ))}
                </svg>
              )}
            </div>
          )}

          {/* 3. GAUSSIAN & STUDENT-T VISUALIZER */}
          {activeModuleId === 'gaussian_ci' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: '#090d16' }}>
                <line x1="-320" y1="0" x2="320" y2="0" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                <line x1="0" y1="-240" x2="0" y2="240" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                <path
                  d={(() => {
                    let path = '';
                    for (let px = -300; px <= 300; px += 4) {
                      const x = px / 60;
                      const y = (1 / (gaussStd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - gaussMean) / gaussStd, 2));
                      const py = -y * 380;
                      if (px === -300) path += `M ${px} ${py}`;
                      else path += ` L ${px} ${py}`;
                    }
                    return path;
                  })()}
                  fill="rgba(56, 189, 248, 0.2)"
                  stroke="#38bdf8"
                  strokeWidth="3"
                />
              </svg>
            </div>
          )}

          {/* 4. MULTI-LINE INTERSECTIONS VISUALIZER */}
          {activeModuleId === 'multi_line_intersections' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: '#090d16' }}>
                <line x1="-320" y1="0" x2="320" y2="0" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                <line x1="0" y1="-240" x2="0" y2="240" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                {lines.map(line => (
                  <line key={line.id} x1={-300} y1={-(-3.75 * line.m + line.c) * 60} x2={300} y2={-(3.75 * line.m + line.c) * 60} stroke={line.color} strokeWidth="2.8" />
                ))}
                {lineIntersections.map((pt, idx) => (
                  <g key={idx}>
                    <circle cx={pt.x * 80} cy={-pt.y * 60} r="10" fill="rgba(255, 255, 255, 0.2)" />
                    <circle cx={pt.x * 80} cy={-pt.y * 60} r="4.5" fill="#ffffff" stroke="#090d16" strokeWidth="1.5" />
                    <text x={pt.x * 80 + 8} y={-pt.y * 60 - 8} fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">({pt.x.toFixed(2)}, {pt.y.toFixed(2)})</text>
                  </g>
                ))}
              </svg>
            </div>
          )}

          {/* 5. MAFS HARMONICS & FOURIER VISUALIZER */}
          {activeModuleId === 'mafs_curves' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: '#090d16' }}>
                <line x1="-320" y1="0" x2="320" y2="0" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                <line x1="0" y1="-240" x2="0" y2="240" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                <path
                  d={(() => {
                    let path = '';
                    for (let px = -300; px <= 300; px += 3) {
                      const x = px / 60;
                      let y = 0;
                      for (let n = 1; n <= fourierHarmonics; n++) {
                        const k = 2 * n - 1;
                        y += (4 / (k * Math.PI)) * Math.sin(k * x);
                      }
                      const py = -y * 80;
                      if (px === -300) path += `M ${px} ${py}`;
                      else path += ` L ${px} ${py}`;
                    }
                    return path;
                  })()}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="3.2"
                />
              </svg>
            </div>
          )}

          {/* 6. DYNAMIC CALCULUS VISUALIZER */}
          {activeModuleId === 'jsxgraph_calculus' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: '#090d16' }}>
                <line x1="-320" y1="0" x2="320" y2="0" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                <line x1="0" y1="-240" x2="0" y2="240" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                <path
                  d={(() => {
                    let path = '';
                    for (let px = -300; px <= 300; px += 4) {
                      const x = px / 80;
                      const y = 0.4 * Math.pow(x, 3) - 0.8 * x;
                      const py = -y * 80;
                      if (px === -300) path += `M ${px} ${py}`;
                      else path += ` L ${px} ${py}`;
                    }
                    return path;
                  })()}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                />
                {(() => {
                  const y0 = 0.4 * Math.pow(calcX0, 3) - 0.8 * calcX0;
                  const slope = 1.2 * Math.pow(calcX0, 2) - 0.8;
                  return (
                    <>
                      <line x1={(calcX0 - 1.5) * 80} y1={-(y0 - 1.5 * slope) * 80} x2={(calcX0 + 1.5) * 80} y2={-(y0 + 1.5 * slope) * 80} stroke="#f59e0b" strokeWidth="2.5" />
                      <circle cx={calcX0 * 80} cy={-y0 * 80} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                    </>
                  );
                })()}
              </svg>
            </div>
          )}

          {/* 7. MATHBOX 3D VISUALIZER */}
          {activeModuleId === 'mathbox_3d' && (
            <div
              style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
              onMouseDown={(e) => {
                setIsDragging3D(true);
                dragStartRef.current = { x: e.clientX, y: e.clientY, rx: rotX, ry: rotY };
              }}
              onMouseMove={(e) => {
                if (!isDragging3D) return;
                const dx = e.clientX - dragStartRef.current.x;
                const dy = e.clientY - dragStartRef.current.y;
                setRotY(dragStartRef.current.ry + dx * 0.5);
                setRotX(Math.max(-80, Math.min(80, dragStartRef.current.rx - dy * 0.5)));
              }}
              onMouseUp={() => setIsDragging3D(false)}
              onMouseLeave={() => setIsDragging3D(false)}
            >
              <canvas ref={canvas3DRef} width={700} height={480} style={{ width: '100%', height: '100%', cursor: isDragging3D ? 'grabbing' : 'grab' }} />
            </div>
          )}

          {/* 8. VECTOR FIELDS VISUALIZER */}
          {activeModuleId === 'vector_fields' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: '#090d16' }}>
                <line x1="-320" y1="0" x2="320" y2="0" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                <line x1="0" y1="-240" x2="0" y2="240" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                {(() => {
                  const arrows = [];
                  for (let x = -2.4; x <= 2.4; x += 0.6) {
                    for (let y = -1.8; y <= 1.8; y += 0.6) {
                      const dx = y;
                      const dy = -Math.sin(x) - dampingFactor * y;
                      const len = Math.sqrt(dx * dx + dy * dy) || 1;
                      const ndx = (dx / len) * 16;
                      const ndy = (dy / len) * 16;
                      arrows.push(
                        <line key={`${x}-${y}`} x1={x * 80} y1={-y * 80} x2={x * 80 + ndx} y2={-y * 80 - ndy} stroke="rgba(56, 189, 248, 0.6)" strokeWidth="1.4" />
                      );
                    }
                  }
                  return arrows;
                })()}
              </svg>
            </div>
          )}

          {/* 9. FORMULA SANDBOX VISUALIZER */}
          {activeModuleId === 'formula_sandbox' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: '#090d16' }}>
                <line x1="-320" y1="0" x2="320" y2="0" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                <line x1="0" y1="-240" x2="0" y2="240" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                <path
                  d={(() => {
                    let path = '';
                    for (let px = -300; px <= 300; px += 3) {
                      const x = px / 60;
                      const y = paramA * Math.sin(paramK * x + paramB);
                      const py = -y * 80;
                      if (px === -300) path += `M ${px} ${py}`;
                      else path += ` L ${px} ${py}`;
                    }
                    return path;
                  })()}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="3.2"
                />
              </svg>
            </div>
          )}

          {/* 10. ARCHITECTURE GUIDE VISUALIZER */}
          {activeModuleId === 'framework_compare' && (
            <div style={{ width: '100%', height: '100%', padding: '24px', overflowY: 'auto', background: '#090d16' }}>
              <h3 style={{ color: 'var(--accent-cyan, #38bdf8)', marginTop: 0 }}>Client-Side Mathematical Frameworks Matrix</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem', color: '#f8fafc' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.8)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Framework</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Paradigm</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Core Strengths</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Best Used For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.4)' }}>
                    <td style={{ padding: '8px', fontWeight: 800, color: '#38bdf8' }}>Mafs</td>
                    <td style={{ padding: '8px' }}>Declarative React SVG</td>
                    <td style={{ padding: '8px' }}>Smooth animations, JSX vectors</td>
                    <td style={{ padding: '8px' }}>2D Curves, Fourier, Linear Systems</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.4)' }}>
                    <td style={{ padding: '8px', fontWeight: 800, color: '#34d399' }}>JSXGraph</td>
                    <td style={{ padding: '8px' }}>Dynamic Geometry Canvas</td>
                    <td style={{ padding: '8px' }}>Interactive constraints, tangents</td>
                    <td style={{ padding: '8px' }}>Calculus, Geometry proofs, Riemann sums</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.4)' }}>
                    <td style={{ padding: '8px', fontWeight: 800, color: '#f59e0b' }}>Plotly.js</td>
                    <td style={{ padding: '8px' }}>Declarative JSON Data-Viz</td>
                    <td style={{ padding: '8px' }}>Statistical plots, distributions</td>
                    <td style={{ padding: '8px' }}>Histograms, Heatmaps, Box plots</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', fontWeight: 800, color: '#ec4899' }}>MathBox / WebGL</td>
                    <td style={{ padding: '8px' }}>GPU Shader Pipeline</td>
                    <td style={{ padding: '8px' }}>3D Parametric Meshes, 4D Slicing</td>
                    <td style={{ padding: '8px' }}>High-dimensional manifolds, Vector flows</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
