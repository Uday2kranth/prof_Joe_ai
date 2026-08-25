import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  Activity,
  Zap,
  Info,
  Compass,
  TrendingUp,
  Box,
  BarChart2,
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
  SplitSquareVertical,
  Crosshair,
  Orbit,
  Waves,
  FastForward,
  ShieldAlert,
  Target,
  Dice5,
  Search,
  ArrowLeft,
  ArrowRight,
  Grid,
  Layers,
  Sparkles,
  Sliders,
  Eye,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  RotateCcw,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { DualParamControl } from './common/DualParamControl';
import { PillSelector } from './common/PillSelector';
import { getCanvasTheme, type CanvasAtmosphere } from '../utils/canvasThemeEngine';

export type MathStudioModuleId =
  // 1. Statistics & Machine Learning
  | 'gaussian_ci'
  | 'svc_classifier'
  | 'svr_regressor'
  | 'logistic_regression'
  | 'ols_regression'
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
    id: 'gaussian_ci',
    category: 'stats_ml',
    categoryLabel: '📊 Statistics & Machine Learning',
    name: 'Gaussian & Student-t Distributions',
    framework: 'Mafs (React SVG) + WebGL',
    badge: '1D / 2D / 3D DENSITIES & CLT',
    icon: Activity,
    description: '1D Normal vs Student-t comparison, CDF S-Curve, 2D Bivariate Normal Heatmap (Correlation ρ), 3D Bell Surface, Shaded Rejection Tails (Z/t), Empirical 68-95-99.7% Rule, and CLT Sampling Simulator.'
  },
  {
    id: 'svc_classifier',
    category: 'stats_ml',
    categoryLabel: '📊 Statistics & Machine Learning',
    name: 'Support Vector Classifier (SVC) Lab',
    framework: 'Mafs & WebGL 3D Mesh',
    badge: 'MAX MARGIN & KERNELS',
    icon: ShieldAlert,
    description: 'Maximum Margin Hyperplane (wᵀx + b = 0), Margin Gutters (±1), Glowing Support Vectors (αᵢ > 0), Slack Penalties (ξᵢ), Linear/RBF/Polynomial Kernels, and 3D Decision Plane.'
  },
  {
    id: 'svr_regressor',
    category: 'stats_ml',
    categoryLabel: '📊 Statistics & Machine Learning',
    name: 'Support Vector Regressor (SVR) Lab',
    framework: 'Mafs & WebGL 3D Mesh',
    badge: 'ε-TUBE REGRESSION',
    icon: Target,
    description: 'ε-Insensitive Loss Tube (ŷ ± ε), Active Boundary Support Vectors, Slack Variables (ξᵢ, ξᵢ*), Box Constraint C, and Non-Linear Kernel Regression.'
  },
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
  // 2. 2D Geometry & Multi-Line
  {
    id: 'multi_line_intersections',
    category: '2d_geometry',
    categoryLabel: '📐 2D Geometry & Multi-Line',
    name: 'Multi-Line Intersections & Systems',
    framework: 'Mafs (React SVG)',
    badge: '2D & FEASIBLE POLYGON',
    icon: SplitSquareVertical,
    description: 'Add up to 6 lines, Matrix Determinant det(A) condition viewer, Angle Bisectors, and Linear Programming Half-Plane Feasible Region with optimal vertex highlights.'
  },
  {
    id: 'mafs_curves',
    category: '2d_geometry',
    categoryLabel: '📐 2D Geometry & Multi-Line',
    name: 'Harmonics, Fourier & Vector Spaces',
    framework: 'Mafs (React SVG)',
    badge: 'EPICYCLES & TRANSFORMATIONS',
    icon: Compass,
    description: 'Fourier Waveform Synthesis (Square, Sawtooth, Triangle), Rotating Epicycle Phasor wheels, Frequency Spectrum Bars, and 2D Linear Transformation Matrix basis mapping.'
  },
  // 3. Dynamic Calculus (JSXGraph)
  {
    id: 'jsxgraph_calculus',
    category: 'calculus',
    categoryLabel: '⚡ Dynamic Calculus & Tangents',
    name: 'Tangents, Derivatives & Riemann Sums',
    framework: 'JSXGraph Paradigm',
    badge: 'SECANT LIMIT & RIEMANN',
    icon: Activity,
    description: 'Interactive Secant-to-Tangent Limit (h → 0), 1st and 2nd Derivative slope/concavity graphs, and Riemann Partitions (Left, Right, Midpoint, Trapezoid, Simpson) with live numerical error.'
  },
  // 4. 3D Surfaces & 4D Hyperplanes (WebGL/MathBox)
  {
    id: 'mathbox_3d',
    category: '3d_surfaces',
    categoryLabel: '🌌 3D & Multivariable Manifolds',
    name: '3D Mesh & 4D Hyperplane Slicing',
    framework: 'WebGL / MathBox',
    badge: '3D / 4D MANIFOLDS & GRADIENT',
    icon: Box,
    description: 'Rotatable 3D Quad Meshes (Saddle, Monkey, Torus, Möbius, Himmelblau), 2D Isocline Contours with Gradient ∇f Vectors, 3D Gradient Descent Rolling Particle, and 4D Hyper-Slicing.'
  },
  // 5. Differential Equations & Vector Fields
  {
    id: 'vector_fields',
    category: 'vector_fields',
    categoryLabel: '🌀 Differential Equations & ODEs',
    name: 'Vector Fields & Phase Space Orbits',
    framework: 'Runge-Kutta ODE',
    badge: 'PARTICLE FLOW & RK4 ORBIT',
    icon: TrendingUp,
    description: 'Autonomous Vector Direction Field, Live Streaming Glowing Particle Streamlines, Interactive Click-to-Release RK4 Phase Trajectories, and Nullclines / Equilibrium Stability analysis.'
  },
  // 6. Live Formula Sandbox
  {
    id: 'formula_sandbox',
    category: 'sandbox',
    categoryLabel: '🧪 Live Formula Sandbox',
    name: 'Multivariable Formula Sandbox',
    framework: 'React SVG Parser',
    badge: 'MULTI-CURVE & POLAR/PARAM',
    icon: Zap,
    description: 'Plot up to 3 custom mathematical expressions simultaneously with live bound dials (k, a, b, c), Cartesian, Polar r(θ), and Parametric (x(t), y(t)) coordinate systems.'
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
  const [activeModuleId, setActiveModuleId] = useState<MathStudioModuleId>('gaussian_ci');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Global 3D Auto-Orbit & Live Animation Speed (Interactive Slow Teach)
  const [isAutoOrbit, setIsAutoOrbit] = useState<boolean>(false);
  const [isBendingAnim, setIsBendingAnim] = useState<boolean>(false);
  const [animSpeed, setAnimSpeed] = useState<number>(1.0);
  const [timeT, setTimeT] = useState<number>(0);
  const lastGradStepRef = useRef<number>(0);

  // Manual Step / Slow Teach Handlers
  const stepTime = (deltaSeconds: number) => {
    setIsSimulating(false);
    setTimeT(prev => Math.max(0, prev + deltaSeconds));
    if (isAutoOrbit) {
      const rotDelta = deltaSeconds * 25;
      setRotY(prev => (prev + rotDelta) % 360);
      setLog3dRotY(prev => (prev + rotDelta) % 360);
      setLin3dRotY(prev => (prev + rotDelta) % 360);
    }

    // Advance 3D Physics Step
    if (activeModuleId === 'mathbox_3d' && showRollingBall) {
      const phys = ballPhysicsRef.current;
      const effW = surfaceType === 'hyper_4d' ? (autoSlice4D ? hyperW + (timeT + deltaSeconds) * 0.6 : hyperW) : 0;
      if (surfaceType === 'torus') {
        phys.u = (phys.u + deltaSeconds * 1.4) % (2 * Math.PI);
        phys.v = (phys.v + deltaSeconds * 2.8) % (2 * Math.PI);
        const pt = eval3DSurface(phys.u, phys.v, 'torus', 0);
        phys.x = pt.x;
        phys.y = pt.y;
        phys.history.push({ x: pt.x, y: pt.y, z: pt.z });
        if (phys.history.length > 90) phys.history.shift();
        phys.stepCount += 1;
      } else if (surfaceType === 'mobius') {
        phys.u = (phys.u + deltaSeconds * 1.2) % (4 * Math.PI);
        phys.v = 0.55 * Math.sin(phys.u * 1.5);
        const pt = eval3DSurface(phys.u, phys.v, 'mobius', 0);
        phys.x = pt.x;
        phys.y = pt.y;
        phys.history.push({ x: pt.x, y: pt.y, z: pt.z });
        if (phys.history.length > 90) phys.history.shift();
        phys.stepCount += 1;
      } else {
        const eps = 0.005;
        const zXp = eval3DSurface(phys.x + eps, phys.y, surfaceType, effW).z;
        const zXm = eval3DSurface(phys.x - eps, phys.y, surfaceType, effW).z;
        const zYp = eval3DSurface(phys.x, phys.y + eps, surfaceType, effW).z;
        const zYm = eval3DSurface(phys.x, phys.y - eps, surfaceType, effW).z;

        const gx = (zXp - zXm) / (2 * eps);
        const gy = (zYp - zYm) / (2 * eps);
        const gNorm = Math.hypot(gx, gy);
        phys.gradNorm = gNorm;

        phys.vx = phys.vx * ballMomentum - ballLearningRate * gx;
        phys.vy = phys.vy * ballMomentum - ballLearningRate * gy;
        const nx = Math.max(-2.0, Math.min(2.0, phys.x + phys.vx));
        const ny = Math.max(-2.0, Math.min(2.0, phys.y + phys.vy));
        const nz = eval3DSurface(nx, ny, surfaceType, effW).z;

        phys.x = nx;
        phys.y = ny;
        phys.history.push({ x: nx, y: ny, z: nz });
        if (phys.history.length > 80) phys.history.shift();
        phys.stepCount += 1;
      }
      setBallPhysicsTick(prev => prev + 1);
    }
  };

  const resetAnimationTime = () => {
    setTimeT(0);
    resetBall(false);
  };

  // View Mode: 'bento_hub' (Bento Box Model Gallery) vs 'studio_sheet' (Personalized Visualization Sheet)
  const [viewMode, setViewMode] = useState<'bento_hub' | 'studio_sheet'>('bento_hub');
  const [bentoCategoryFilter, setBentoCategoryFilter] = useState<string>('all');
  const [bentoSearchQuery, setBentoSearchQuery] = useState<string>('');

  // Canvas Atmosphere (Theme Engine integration)
  const [canvasAtmosphere, setCanvasAtmosphere] = useState<string>(() => {
    try {
      return localStorage.getItem('chatterbot_canvas_atmosphere') || document.documentElement.getAttribute('data-canvas-atmosphere') || 'deep_void';
    } catch {
      return 'deep_void';
    }
  });

  useEffect(() => {
    const handleAtmosphereUpdate = () => {
      try {
        const atmo = localStorage.getItem('chatterbot_canvas_atmosphere') || document.documentElement.getAttribute('data-canvas-atmosphere') || 'deep_void';
        setCanvasAtmosphere(atmo);
      } catch {}
    };
    window.addEventListener('chatterbot_canvas_atmosphere_updated', handleAtmosphereUpdate);
    window.addEventListener('storage', handleAtmosphereUpdate);
    return () => {
      window.removeEventListener('chatterbot_canvas_atmosphere_updated', handleAtmosphereUpdate);
      window.removeEventListener('storage', handleAtmosphereUpdate);
    };
  }, []);

  const currentCanvasTheme = useMemo(() => getCanvasTheme(canvasAtmosphere), [canvasAtmosphere]);

  const activeMeta = useMemo(() => {
    return STUDIO_MODULES.find(m => m.id === activeModuleId) || STUDIO_MODULES[0];
  }, [activeModuleId]);

  const filteredBentoModules = useMemo(() => {
    return STUDIO_MODULES.filter(m => {
      const matchCat = bentoCategoryFilter === 'all' || m.category === bentoCategoryFilter;
      const matchQuery = !bentoSearchQuery.trim() ||
        m.name.toLowerCase().includes(bentoSearchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(bentoSearchQuery.toLowerCase()) ||
        m.badge.toLowerCase().includes(bentoSearchQuery.toLowerCase()) ||
        m.framework.toLowerCase().includes(bentoSearchQuery.toLowerCase()) ||
        m.categoryLabel.toLowerCase().includes(bentoSearchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [bentoCategoryFilter, bentoSearchQuery]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. LOGISTIC REGRESSION & SOFTMAX LAB (PRESERVED)
  // ─────────────────────────────────────────────────────────────────────────────
  const [logSubMode, setLogSubMode] = useState<LogRegSubMode>('binary_linear');
  const [logDimension, setLogDimension] = useState<'3d_surface' | '2d_boundary' | '1d_curve'>('2d_boundary');
  const [logActivation, setLogActivation] = useState<LogActivationType>('sigmoid');
  const [log2dVisualMode, setLog2dVisualMode] = useState<'smooth_heatmap' | 'iso_contours' | 'boundary_only'>('smooth_heatmap');

  const [logW1, setLogW1] = useState<number>(1.4);
  const [logW2, setLogW2] = useState<number>(-1.1);
  const [logW3, setLogW3] = useState<number>(0.8);
  const [logW4, setLogW4] = useState<number>(-0.6);
  const [logBiasB, setLogBiasB] = useState<number>(0.0);
  const [logSliceX3, setLogSliceX3] = useState<number>(0.5);
  const [logSliceX4, setLogSliceX4] = useState<number>(-0.4);
  const logThreshold = 0.5;
  const [logCurvatureK, setLogCurvatureK] = useState<number>(1.5);

  const polyW1 = 0.2;
  const polyW2 = 0.1;
  const polyW3 = 1.2;
  const polyW4 = 1.2;
  const polyBias = -1.8;

  const [softW0, setSoftW0] = useState<{ w1: number; w2: number; b: number }>({ w1: -1.2, w2: 1.4, b: 0.2 });
  const [softW1, setSoftW1] = useState<{ w1: number; w2: number; b: number }>({ w1: 1.5, w2: 1.1, b: -0.4 });
  const [softW2, setSoftW2] = useState<{ w1: number; w2: number; b: number }>({ w1: 0.2, w2: -1.8, b: 0.1 });

  const [log3dRotX, setLog3dRotX] = useState<number>(28);
  const [log3dRotY, setLog3dRotY] = useState<number>(42);
  const [isDraggingLog3D, setIsDraggingLog3D] = useState<boolean>(false);
  const dragLog3dStartRef = useRef<{ x: number; y: number; rx: number; ry: number }>({ x: 0, y: 0, rx: 28, ry: 42 });
  const canvasLog3dRef = useRef<HTMLCanvasElement | null>(null);

  const [injectLogClass, setInjectLogClass] = useState<0 | 1 | 2>(0);
  const [injectLogX1, setInjectLogX1] = useState<number>(-1.5);
  const [injectLogX2, setInjectLogX2] = useState<number>(1.0);
  const [isLogPointsListOpen, setIsLogPointsListOpen] = useState<boolean>(false);

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
  // 2. LINEAR REGRESSION & 3D/4D PLANE LAB (PRESERVED)
  // ─────────────────────────────────────────────────────────────────────────────
  const [linSubMode, setLinSubMode] = useState<LinRegSubMode>('1d_linear');
  const [linFitMode, setLinFitMode] = useState<'auto_ols' | 'manual_user'>('manual_user');
  const [linFunctionFamily, setLinFunctionFamily] = useState<LinFunctionFamily>('linear');
  const [lin1dVisualMode, setLin1dVisualMode] = useState<'residual_squares' | 'confidence_band' | 'drop_lines'>('residual_squares');

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

  const polyA = 0.5;
  const polyB = 0.1;
  const polyC = -0.8;
  const linRegType = 'l2_ridge';
  const linRegLambda = 0.8;

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
  // 3. PHASE 1: GAUSSIAN & STUDENT-T DISTRIBUTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const [gaussDimension, setGaussDimension] = useState<'1d_pdf_compare' | '1d_cdf' | '2d_bivariate' | '3d_surface'>('1d_pdf_compare');
  const [gaussTailMode, setGaussTailMode] = useState<'two_tailed' | 'left_tailed' | 'right_tailed' | 'empirical_bands'>('two_tailed');
  const [gaussMean, setGaussMean] = useState<number>(0.0);
  const [gaussStd, setGaussStd] = useState<number>(1.0);
  const [studentNu, setStudentNu] = useState<number>(4);
  const [bivariateRho, setBivariateRho] = useState<number>(0.6);
  const [ciConfidence, setCiConfidence] = useState<number>(95);
  const [injectGaussX0, setInjectGaussX0] = useState<number>(1.96);

  const [gauss3dRotX, setGauss3dRotX] = useState<number>(30);
  const [gauss3dRotY, setGauss3dRotY] = useState<number>(45);
  const [isDraggingGauss3D, setIsDraggingGauss3D] = useState<boolean>(false);
  const dragGauss3dStartRef = useRef<{ x: number; y: number; rx: number; ry: number }>({ x: 0, y: 0, rx: 30, ry: 45 });
  const canvasGauss3dRef = useRef<HTMLCanvasElement | null>(null);

  const [cltSamples, setCltSamples] = useState<Array<number>>([]);

  const drawCltSamples = () => {
    const sampleSize = 30;
    const newMeans: number[] = [];
    for (let k = 0; k < 15; k++) {
      let sum = 0;
      for (let i = 0; i < sampleSize; i++) {
        sum += (Math.random() - 0.5) * 3.464;
      }
      newMeans.push(parseFloat((gaussMean + (sum / sampleSize) * gaussStd).toFixed(3)));
    }
    setCltSamples(prev => [...prev.slice(-180), ...newMeans]);
  };

  const resetCltSamples = () => {
    setCltSamples([]);
  };

  const calcGaussianPdf = (x: number, mu: number, sigma: number): number => {
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
  };

  const calcErf = (x: number): number => {
    // Abramowitz and Stegun formula 7.1.26 approximation
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);
    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
    return sign * y;
  };

  const calcGaussianCdf = (x: number, mu: number, sigma: number): number => {
    return 0.5 * (1 + calcErf((x - mu) / (sigma * Math.SQRT2)));
  };

  const calcStudentTPdf = (x: number, nu: number, mu: number, sigma: number): number => {
    const z = (x - mu) / sigma;
    const factor = Math.sqrt(nu / (nu + 1)) * (1 - 1 / (8 * nu));
    const coef = (1 / (sigma * Math.sqrt(nu * Math.PI))) * (1 / factor);
    return coef * Math.pow(1 + (z * z) / nu, -(nu + 1) / 2);
  };

  const calcStudentTCdf = (x: number, nu: number, mu: number, sigma: number): number => {
    // Normal approximation weighted by degrees of freedom
    const z = (x - mu) / sigma;
    const normCdf = calcGaussianCdf(x, mu, sigma);
    if (nu > 25) return normCdf;
    const tCorrection = (z * z * z + z) / (4 * nu);
    return Math.max(0, Math.min(1, normCdf - calcGaussianPdf(x, mu, sigma) * tCorrection));
  };

  const calcBivariatePdf = (x: number, y: number, muX: number, muY: number, sigma: number, rho: number): number => {
    const zX = (x - muX) / sigma;
    const zY = (y - muY) / sigma;
    const factor = 1 / (2 * Math.PI * sigma * sigma * Math.sqrt(Math.max(1e-4, 1 - rho * rho)));
    const exponent = -1 / (2 * (1 - rho * rho)) * (zX * zX - 2 * rho * zX * zY + zY * zY);
    return factor * Math.exp(Math.max(-20, exponent));
  };

  const activeNu = isBendingAnim ? Math.round(1 + (Math.sin(timeT * 2.0) + 1) * 14.5) : studentNu;
  const activeRho = isBendingAnim ? Math.sin(timeT * 1.5) * 0.85 : bivariateRho;

  // 3D Gaussian Surface Canvas Rendering Effect
  useEffect(() => {
    if (activeModuleId !== 'gaussian_ci' || gaussDimension !== '3d_surface') return;
    const canvas = canvasGauss3dRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const radX = (gauss3dRotX * Math.PI) / 180;
    const radY = (gauss3dRotY * Math.PI) / 180;

    const project3D = (x: number, y: number, z: number) => {
      const x1 = x * Math.cos(radY) + y * Math.sin(radY);
      const y1 = -x * Math.sin(radY) + y * Math.cos(radY);
      const y2 = y1 * Math.cos(radX) - z * Math.sin(radX);
      const z2 = y1 * Math.sin(radX) + z * Math.cos(radX);

      const scale = 52;
      const screenX = width / 2 + x1 * scale;
      const screenY = height / 2 + y2 * scale * 0.7 - z2 * scale * 0.55;
      return { sx: screenX, sy: screenY, depth: z2 };
    };

    const N = 24;
    const range = 3.2;
    const grid: Array<Array<{ sx: number; sy: number; zVal: number; depth: number }>> = [];

    for (let i = 0; i <= N; i++) {
      const row = [];
      const x = -range + (i / N) * (2 * range);
      for (let j = 0; j <= N; j++) {
        const y = -range + (j / N) * (2 * range);
        const zVal = calcBivariatePdf(x, y, gaussMean, 0, gaussStd, activeRho) * 8.5;
        const pt = project3D(x, y, zVal);
        row.push({ ...pt, zVal });
      }
      grid.push(row);
    }

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const p1 = grid[i][j];
        const p2 = grid[i + 1][j];
        const p3 = grid[i + 1][j + 1];
        const p4 = grid[i][j + 1];

        const avgZ = (p1.zVal + p2.zVal + p3.zVal + p4.zVal) / 4;
        const hue = 180 + Math.min(160, avgZ * 60);
        const lightness = 22 + Math.min(48, avgZ * 18);

        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.lineTo(p3.sx, p3.sy);
        ctx.lineTo(p4.sx, p4.sy);
        ctx.closePath();

        ctx.fillStyle = `hsla(${hue}, 80%, ${lightness}%, 0.75)`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${hue}, 90%, 65%, 0.45)`;
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }
    }

    // Coordinate Axes
    const origin = project3D(0, 0, 0);
    const xEnd = project3D(range * 1.1, 0, 0);
    const yEnd = project3D(0, range * 1.1, 0);
    const zEnd = project3D(0, 0, 3.8);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(origin.sx, origin.sy);
    ctx.lineTo(xEnd.sx, xEnd.sy);
    ctx.stroke();

    ctx.strokeStyle = '#34d399';
    ctx.beginPath();
    ctx.moveTo(origin.sx, origin.sy);
    ctx.lineTo(yEnd.sx, yEnd.sy);
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(origin.sx, origin.sy);
    ctx.lineTo(zEnd.sx, zEnd.sy);
    ctx.stroke();
  }, [activeModuleId, gaussDimension, gauss3dRotX, gauss3dRotY, gaussMean, gaussStd, activeRho]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. PHASE 2: SUPPORT VECTOR MACHINES (SVC & SVR)
  // ─────────────────────────────────────────────────────────────────────────────
  const [svcDimension, setSvcDimension] = useState<'2d_margin' | '1d_line' | '3d_plane'>('2d_margin');
  const [svcKernel, setSvcKernel] = useState<'linear' | 'rbf' | 'poly'>('linear');
  const [svcC, setSvcC] = useState<number>(1.0);
  const [svcMarginW, setSvcMarginW] = useState<number>(1.2);
  const [svcBiasB, setSvcBiasB] = useState<number>(0.2);
  const [svcGamma, setSvcGamma] = useState<number>(0.8);
  const [svcPolyDegree, setSvcPolyDegree] = useState<number>(2);

  const [injectSvcX1, setInjectSvcX1] = useState<number>(0.5);
  const [injectSvcX2, setInjectSvcX2] = useState<number>(0.5);
  const [injectSvcClass, setInjectSvcClass] = useState<1 | -1>(1);
  const [isSvcPointsListOpen, setIsSvcPointsListOpen] = useState<boolean>(false);

  const [svcPoints, setSvcPoints] = useState<Array<{ id: number; x1: number; x2: number; label: 1 | -1 }>>([
    { id: 1, x1: -2.0, x2: 1.5, label: 1 },
    { id: 2, x1: -1.2, x2: 0.8, label: 1 },
    { id: 3, x1: -0.5, x2: 1.8, label: 1 },
    { id: 4, x1: -1.8, x2: -0.5, label: 1 },
    { id: 5, x1: 0.8, x2: -1.2, label: -1 },
    { id: 6, x1: 1.5, x2: -0.5, label: -1 },
    { id: 7, x1: 2.0, x2: -1.8, label: -1 },
    { id: 8, x1: 1.2, x2: 0.2, label: -1 }
  ]);

  const adjustSvcClassCount = (targetClass: 1 | -1, delta: number) => {
    if (delta > 0) {
      const center = targetClass === 1 ? { cx: -1.3, cy: 1.0 } : { cx: 1.3, cy: -1.0 };
      const newPts: Array<{ id: number; x1: number; x2: number; label: 1 | -1 }> = [];
      for (let i = 0; i < delta; i++) {
        newPts.push({
          id: Date.now() + i,
          x1: parseFloat((center.cx + (Math.random() - 0.5) * 1.5).toFixed(2)),
          x2: parseFloat((center.cy + (Math.random() - 0.5) * 1.5).toFixed(2)),
          label: targetClass
        });
      }
      setSvcPoints(prev => [...prev, ...newPts]);
    } else {
      let removeLeft = Math.abs(delta);
      setSvcPoints(prev => {
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

  const handleInjectSvcPoint = () => {
    setSvcPoints(prev => [
      ...prev,
      {
        id: Date.now(),
        x1: parseFloat(injectSvcX1.toFixed(2)),
        x2: parseFloat(injectSvcX2.toFixed(2)),
        label: injectSvcClass
      }
    ]);
  };

  const removeSvcPoint = (id: number) => {
    if (svcPoints.length <= 2) return;
    setSvcPoints(prev => prev.filter(p => p.id !== id));
  };

  // SVC Decision Function & Support Vector / Slack Analysis
  const svcAnalysis = useMemo(() => {
    const w1 = 1.2;
    const w2 = -1.0;
    let totalSlack = 0;
    let supportVectorCount = 0;
    let marginViolatorCount = 0;

    const pointsWithStatus = svcPoints.map(p => {
      let fVal = 0;
      if (svcKernel === 'linear') {
        fVal = (w1 * p.x1 + w2 * p.x2 + svcBiasB);
      } else if (svcKernel === 'rbf') {
        let rbfSum = 0;
        svcPoints.forEach(other => {
          const dist2 = (p.x1 - other.x1) * (p.x1 - other.x1) + (p.x2 - other.x2) * (p.x2 - other.x2);
          rbfSum += other.label * Math.exp(-svcGamma * dist2);
        });
        fVal = rbfSum + svcBiasB;
      } else {
        const polyInner = (w1 * p.x1 + w2 * p.x2 + 1);
        fVal = Math.pow(polyInner, svcPolyDegree) * 0.15 + svcBiasB;
      }

      const functionalMargin = p.label * fVal;
      const isMarginViolator = functionalMargin < 1.0;
      const slack = Math.max(0, 1.0 - functionalMargin);
      const isSupportVector = Math.abs(functionalMargin - 1.0) < 0.45 || isMarginViolator;

      if (isSupportVector) supportVectorCount++;
      if (isMarginViolator) {
        marginViolatorCount++;
        totalSlack += slack;
      }

      return {
        ...p,
        fVal,
        functionalMargin,
        isSupportVector,
        isMarginViolator,
        slack
      };
    });

    return {
      pointsWithStatus,
      supportVectorCount,
      marginViolatorCount,
      totalSlack
    };
  }, [svcPoints, svcMarginW, svcBiasB, svcC, svcKernel, svcGamma, svcPolyDegree]);

  // SVR Support Vector Regressor State & Analysis
  const [svrEpsilon, setSvrEpsilon] = useState<number>(0.4);
  const [svrSlopeM, setSvrSlopeM] = useState<number>(0.75);
  const [svrInterceptC, setSvrInterceptC] = useState<number>(-0.1);
  const [svrC, setSvrC] = useState<number>(1.0);

  const [injectSvrX, setInjectSvrX] = useState<number>(0.8);
  const [injectSvrY, setInjectSvrY] = useState<number>(1.2);
  const [isSvrPointsListOpen, setIsSvrPointsListOpen] = useState<boolean>(false);

  const [svrPoints, setSvrPoints] = useState<Array<{ id: number; x: number; y: number }>>([
    { id: 1, x: -2.4, y: -1.8 },
    { id: 2, x: -1.6, y: -1.0 },
    { id: 3, x: -0.8, y: -0.4 },
    { id: 4, x: 0.0, y: 0.1 },
    { id: 5, x: 0.8, y: 0.9 },
    { id: 6, x: 1.6, y: 1.4 },
    { id: 7, x: 2.4, y: 2.1 },
    { id: 8, x: -0.4, y: 0.8 },
    { id: 9, x: 1.2, y: -0.2 }
  ]);

  const adjustSvrPointsCount = (delta: number) => {
    if (delta > 0) {
      const newPts: Array<{ id: number; x: number; y: number }> = [];
      for (let i = 0; i < delta; i++) {
        const x = parseFloat(((Math.random() - 0.5) * 4.8).toFixed(2));
        const noise = (Math.random() - 0.5) * 1.2;
        const y = parseFloat((svrSlopeM * x + svrInterceptC + noise).toFixed(2));
        newPts.push({ id: Date.now() + i, x, y });
      }
      setSvrPoints(prev => [...prev, ...newPts]);
    } else {
      setSvrPoints(prev => prev.slice(0, Math.max(3, prev.length + delta)));
    }
  };

  const handleInjectSvrPoint = () => {
    setSvrPoints(prev => [
      ...prev,
      {
        id: Date.now(),
        x: parseFloat(injectSvrX.toFixed(2)),
        y: parseFloat(injectSvrY.toFixed(2))
      }
    ]);
  };

  const removeSvrPoint = (id: number) => {
    if (svrPoints.length <= 2) return;
    setSvrPoints(prev => prev.filter(p => p.id !== id));
  };

  const svrAnalysis = useMemo(() => {
    let totalSlack = 0;
    let svCount = 0;

    const pointsWithStatus = svrPoints.map(p => {
      const predY = svrSlopeM * p.x + svrInterceptC;
      const residual = Math.abs(p.y - predY);
      const isOutsideTube = residual > svrEpsilon;
      const slack = Math.max(0, residual - svrEpsilon);

      if (isOutsideTube || Math.abs(residual - svrEpsilon) < 0.12) {
        svCount++;
      }
      if (isOutsideTube) {
        totalSlack += slack;
      }

      return {
        ...p,
        predY,
        residual,
        isOutsideTube,
        slack
      };
    });

    return {
      pointsWithStatus,
      svCount,
      totalSlack
    };
  }, [svrPoints, svrSlopeM, svrInterceptC, svrEpsilon, svrC]);

  // ─────────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  // 5. PHASE 3: MULTI-LINE INTERSECTIONS & LINEAR SYSTEMS
  // ─────────────────────────────────────────────────────────────────────────────
  interface MultiLineItem {
    id: number;
    m: number;
    c: number;
    ineq: 'le' | 'ge';
    color: string;
    label: string;
    isVertical?: boolean;
    xVal?: number;
  }

  const [lineMode, setLineMode] = useState<'2d_systems' | 'feasible_polygon'>('2d_systems');
  const [linePreset, setLinePreset] = useState<'custom' | 'resource_allocation' | 'triangle_orthocenter' | 'least_squares' | 'optical_reflections'>('custom');
  const [equationForm, setEquationForm] = useState<'slope_intercept' | 'general_form' | 'normal_form'>('slope_intercept');
  const [simplexStepIdx, setSimplexStepIdx] = useState<number>(0);
  const [copiedLatexFeedback, setCopiedLatexFeedback] = useState<boolean>(false);
  const [showAngleBadges, setShowAngleBadges] = useState<boolean>(true);
  const [showLineLabels, setShowLineLabels] = useState<boolean>(true);
  const [showVertexPills, setShowVertexPills] = useState<boolean>(true);

  const [lines, setLines] = useState<MultiLineItem[]>([
    { id: 1, m: 1.2, c: 0.5, ineq: 'le', color: '#38bdf8', label: 'Line 1' },
    { id: 2, m: -0.8, c: 1.8, ineq: 'le', color: '#f59e0b', label: 'Line 2' },
    { id: 3, m: 0.2, c: -1.2, ineq: 'ge', color: '#34d399', label: 'Line 3' }
  ]);

  // Linear Programming (LP) Objective Function: Max/Min Z = c_x * x + c_y * y
  const [lpObjCx, setLpObjCx] = useState<number>(1.0);
  const [lpObjCy, setLpObjCy] = useState<number>(1.5);
  const [lpMaximize, setLpMaximize] = useState<boolean>(true);

  // Preset Switcher Handler
  const applyLinePreset = (preset: 'custom' | 'resource_allocation' | 'triangle_orthocenter' | 'least_squares' | 'optical_reflections') => {
    setLinePreset(preset);
    if (preset === 'resource_allocation') {
      setLineMode('feasible_polygon');
      setLpObjCx(3.0);
      setLpObjCy(4.0);
      setLpMaximize(true);
      setLines([
        { id: 1, m: -0.6667, c: 4.0, ineq: 'le', color: '#38bdf8', label: 'Wood (2x + 3y ≤ 12)' },
        { id: 2, m: -1.0, c: 5.0, ineq: 'le', color: '#f59e0b', label: 'Steel (x + y ≤ 5)' },
        { id: 3, m: 0.0, c: 0.0, ineq: 'ge', color: '#34d399', label: 'Non-negativity y ≥ 0' },
        { id: 4, m: 0.0, c: 0.0, ineq: 'ge', color: '#06b6d4', label: 'Non-negativity x ≥ 0', isVertical: true, xVal: 0.0 }
      ]);
    } else if (preset === 'triangle_orthocenter') {
      setLineMode('2d_systems');
      setLines([
        { id: 1, m: 0.5, c: 1.0, ineq: 'le', color: '#38bdf8', label: 'Altitude A (m = 0.5)' },
        { id: 2, m: -2.0, c: 3.5, ineq: 'le', color: '#34d399', label: 'Altitude B (m = -2.0 ⊥ A)' },
        { id: 3, m: -0.5, c: 2.0, ineq: 'ge', color: '#f59e0b', label: 'Altitude C' }
      ]);
    } else if (preset === 'least_squares') {
      setLineMode('2d_systems');
      setLines([
        { id: 1, m: 1.5, c: 0.8, ineq: 'le', color: '#38bdf8', label: 'Sensor Line 1' },
        { id: 2, m: -0.6, c: 1.5, ineq: 'le', color: '#f59e0b', label: 'Sensor Line 2' },
        { id: 3, m: 0.3, c: -1.0, ineq: 'ge', color: '#34d399', label: 'Sensor Line 3' },
        { id: 4, m: -1.8, c: -0.5, ineq: 'le', color: '#ec4899', label: 'Sensor Line 4' }
      ]);
    } else if (preset === 'optical_reflections') {
      setLineMode('2d_systems');
      setLines([
        { id: 1, m: 0.8, c: 2.0, ineq: 'le', color: '#06b6d4', label: 'Mirror 1' },
        { id: 2, m: -1.2, c: 1.5, ineq: 'le', color: '#a855f7', label: 'Mirror 2' },
        { id: 3, m: 0.0, c: -2.0, ineq: 'ge', color: '#38bdf8', label: 'Mirror 3' }
      ]);
    }
  };

  const addLine = () => {
    if (lines.length >= 6) return;
    const colors = ['#ec4899', '#a855f7', '#06b6d4', '#f97316', '#34d399', '#38bdf8'];
    const newId = Date.now();
    setLines(prev => [
      ...prev,
      {
        id: newId,
        m: parseFloat(((Math.random() - 0.5) * 3).toFixed(2)),
        c: parseFloat(((Math.random() - 0.5) * 3).toFixed(2)),
        ineq: 'le',
        color: colors[prev.length % colors.length],
        label: `Line ${prev.length + 1}`
      }
    ]);
  };

  const removeLine = (id: number) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter(l => l.id !== id));
  };

  // Dynamic lines with real-time harmonic oscillation when Wave mode is active
  const dynamicLines = useMemo<MultiLineItem[]>(() => {
    if (!isBendingAnim) return lines;
    return lines.map((l, i) => {
      if (l.isVertical) return l;
      return {
        ...l,
        m: parseFloat((l.m + 0.35 * Math.sin(timeT * 1.5 + i * 0.9)).toFixed(2)),
        c: parseFloat((l.c + 0.35 * Math.cos(timeT * 1.5 + i * 1.2)).toFixed(2))
      };
    });
  }, [lines, isBendingAnim, timeT]);

  // Overdetermined Least Squares Pseudo-Inverse Solution: x* = (A^T A)^-1 A^T b
  const leastSquaresEstimate = useMemo(() => {
    const nonVertLines = dynamicLines.filter(l => !l.isVertical);
    if (nonVertLines.length < 2) return null;
    const N = nonVertLines.length;
    let sumM2 = 0;
    let sumM = 0;
    let sumMC = 0;
    let sumC = 0;

    for (const l of nonVertLines) {
      sumM2 += l.m * l.m;
      sumM += l.m;
      sumMC += l.m * l.c;
      sumC += l.c;
    }

    // A = [-m_i, 1], b = [c_i]
    // A^T A = [ sumM2, -sumM; -sumM, N ]
    const detATA = N * sumM2 - sumM * sumM;
    if (Math.abs(detATA) < 1e-5) return null;

    // A^T b = [ -sumMC; sumC ]
    const atb1 = -sumMC;
    const atb2 = sumC;

    // (A^T A)^-1 = 1/det * [ N, sumM; sumM, sumM2 ]
    const xStar = (N * atb1 + sumM * atb2) / detATA;
    const yStar = (sumM * atb1 + sumM2 * atb2) / detATA;

    // Calculate individual residuals d_i = |-m*x + y - c| / sqrt(m^2 + 1)
    const residuals = nonVertLines.map(l => {
      const d = Math.abs(-l.m * xStar + yStar - l.c) / Math.sqrt(l.m * l.m + 1);
      return { id: l.id, label: l.label, dist: d };
    });

    const sumSquaredErrors = residuals.reduce((acc, r) => acc + r.dist * r.dist, 0);

    return {
      x: xStar,
      y: yStar,
      residuals,
      sumSquaredErrors
    };
  }, [dynamicLines]);

  // Geometric Relationships (Parallel distance, Perpendicular, 3-Line Concurrency)
  const geometricRelations = useMemo(() => {
    const parallels: Array<{ lineA: string; lineB: string; dist: number }> = [];
    const orthogonals: Array<{ lineA: string; lineB: string }> = [];
    const concurrents: Array<{ x: number; y: number; lines: string[] }> = [];

    // Parallel & Perpendicular
    for (let i = 0; i < dynamicLines.length; i++) {
      for (let j = i + 1; j < dynamicLines.length; j++) {
        const l1 = dynamicLines[i];
        const l2 = dynamicLines[j];
        if (l1.isVertical && l2.isVertical) {
          parallels.push({ lineA: l1.label, lineB: l2.label, dist: Math.abs((l1.xVal ?? 0) - (l2.xVal ?? 0)) });
        } else if (l1.isVertical || l2.isVertical) {
          const nonVert = l1.isVertical ? l2 : l1;
          if (Math.abs(nonVert.m) < 0.08) {
            orthogonals.push({ lineA: l1.label, lineB: l2.label });
          }
        } else {
          if (Math.abs(l1.m - l2.m) < 0.06) {
            const dist = Math.abs(l1.c - l2.c) / Math.sqrt(1 + l1.m * l1.m);
            parallels.push({ lineA: l1.label, lineB: l2.label, dist });
          }
          if (Math.abs(1 + l1.m * l2.m) < 0.08) {
            orthogonals.push({ lineA: l1.label, lineB: l2.label });
          }
        }
      }
    }

    // 3-Line Concurrency Detection (Deduplicated)
    if (dynamicLines.length >= 3) {
      for (let i = 0; i < dynamicLines.length; i++) {
        for (let j = i + 1; j < dynamicLines.length; j++) {
          for (let k = j + 1; k < dynamicLines.length; k++) {
            const l1 = dynamicLines[i];
            const l2 = dynamicLines[j];
            const l3 = dynamicLines[k];

            let ix = 0;
            let iy = 0;
            let isValid = false;

            if (l1.isVertical && !l2.isVertical && !l3.isVertical) {
              ix = l1.xVal ?? 0;
              iy = l2.m * ix + l2.c;
              const y3 = l3.m * ix + l3.c;
              if (Math.abs(iy - y3) < 0.15) isValid = true;
            } else if (!l1.isVertical && !l2.isVertical && !l3.isVertical) {
              const denom = l1.m - l2.m;
              if (Math.abs(denom) > 1e-4) {
                ix = (l2.c - l1.c) / denom;
                iy = l1.m * ix + l1.c;
                const expectedY3 = l3.m * ix + l3.c;
                if (Math.abs(iy - expectedY3) < 0.15) isValid = true;
              }
            }

            const isResourceLp = linePreset === 'resource_allocation';
            const minB = isResourceLp ? -0.5 : -4.5;
            const maxB = isResourceLp ? 7.5 : 4.5;
            if (isValid && ix >= minB && ix <= maxB && iy >= minB && iy <= maxB) {
              if (!concurrents.some(c => Math.hypot(c.x - ix, c.y - iy) < 0.25)) {
                concurrents.push({ x: ix, y: iy, lines: [l1.label, l2.label, l3.label] });
              }
            }
          }
        }
      }
    }

    return { parallels, orthogonals, concurrents };
  }, [dynamicLines, linePreset]);

  // Pairwise Intersections & Angle Calculation with Concurrency Awareness
  const lineIntersections = useMemo(() => {
    const points: Array<{
      x: number;
      y: number;
      lineA: string;
      lineB: string;
      colorA: string;
      colorB: string;
      angleDeg: number;
      isOrthogonal: boolean;
      isPartOfConcurrency: boolean;
    }> = [];

    const isResourceLp = linePreset === 'resource_allocation';
    const minB = isResourceLp ? -0.5 : -4.5;
    const maxB = isResourceLp ? 7.5 : 4.5;

    for (let i = 0; i < dynamicLines.length; i++) {
      for (let j = i + 1; j < dynamicLines.length; j++) {
        const l1 = dynamicLines[i];
        const l2 = dynamicLines[j];

        if (l1.isVertical && l2.isVertical) continue;

        let x = 0;
        let y = 0;
        let angleDeg = 0;
        let isOrthogonal = false;
        let found = false;

        if (l1.isVertical) {
          x = l1.xVal ?? 0;
          y = l2.m * x + l2.c;
          angleDeg = Math.abs(90 - (Math.atan(Math.abs(l2.m)) * 180) / Math.PI);
          isOrthogonal = Math.abs(l2.m) < 0.05;
          found = true;
        } else if (l2.isVertical) {
          x = l2.xVal ?? 0;
          y = l1.m * x + l1.c;
          angleDeg = Math.abs(90 - (Math.atan(Math.abs(l1.m)) * 180) / Math.PI);
          isOrthogonal = Math.abs(l1.m) < 0.05;
          found = true;
        } else {
          const denom = l1.m - l2.m;
          if (Math.abs(denom) > 1e-4) {
            x = (l2.c - l1.c) / denom;
            y = l1.m * x + l1.c;
            const tanTheta = Math.abs((l1.m - l2.m) / (1 + l1.m * l2.m || 1e-4));
            angleDeg = (Math.atan(tanTheta) * 180) / Math.PI;
            isOrthogonal = Math.abs(angleDeg - 90) < 3.5 || Math.abs(1 + l1.m * l2.m) < 0.06;
            found = true;
          }
        }

        if (found && x >= minB && x <= maxB && y >= minB && y <= maxB) {
          const isPartOfConcurrency = geometricRelations.concurrents.some(cp => Math.hypot(cp.x - x, cp.y - y) < 0.25);
          points.push({ x, y, lineA: l1.label, lineB: l2.label, colorA: l1.color, colorB: l2.color, angleDeg, isOrthogonal, isPartOfConcurrency });
        }
      }
    }
    return points;
  }, [dynamicLines, geometricRelations.concurrents, linePreset]);

  // Sutherland-Hodgman Convex Polygon Half-Plane Intersection Clipper
  const feasiblePolygon = useMemo(() => {
    const isResourceLp = linePreset === 'resource_allocation';
    let polygon: Array<{ x: number; y: number }> = isResourceLp ? [
      { x: -0.2, y: -0.2 },
      { x: 7.5, y: -0.2 },
      { x: 7.5, y: 6.5 },
      { x: -0.2, y: 6.5 }
    ] : [
      { x: -4.5, y: -4.5 },
      { x: 4.5, y: -4.5 },
      { x: 4.5, y: 4.5 },
      { x: -4.5, y: 4.5 }
    ];

    const isInside = (pt: { x: number; y: number }, line: MultiLineItem): boolean => {
      if (line.isVertical) {
        const vx = line.xVal ?? 0;
        return line.ineq === 'ge' ? pt.x >= vx - 0.001 : pt.x <= vx + 0.001;
      }
      const val = pt.y - (line.m * pt.x + line.c);
      return line.ineq === 'le' ? val <= 0.001 : val >= -0.001;
    };

    const computeIntersection = (p1: { x: number; y: number }, p2: { x: number; y: number }, line: MultiLineItem) => {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      if (line.isVertical) {
        const vx = line.xVal ?? 0;
        if (Math.abs(dx) < 1e-6) return p1;
        const t = (vx - p1.x) / dx;
        return { x: vx, y: p1.y + t * dy };
      }
      const denom = dy - line.m * dx;
      if (Math.abs(denom) < 1e-6) return p1;
      const t = (line.m * p1.x - p1.y + line.c) / denom;
      return {
        x: p1.x + t * dx,
        y: p1.y + t * dy
      };
    };

    for (const line of dynamicLines) {
      if (polygon.length === 0) break;
      const nextPoly: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < polygon.length; i++) {
        const cur = polygon[i];
        const prev = polygon[(i + polygon.length - 1) % polygon.length];
        const curInside = isInside(cur, line);
        const prevInside = isInside(prev, line);

        if (curInside) {
          if (!prevInside) {
            nextPoly.push(computeIntersection(prev, cur, line));
          }
          nextPoly.push(cur);
        } else if (prevInside) {
          nextPoly.push(computeIntersection(prev, cur, line));
        }
      }
      polygon = nextPoly;
    }

    // Polygon Area (Shoelace formula)
    let area = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < polygon.length; i++) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % polygon.length];
      const cross = p1.x * p2.y - p2.x * p1.y;
      area += cross;
      cx += (p1.x + p2.x) * cross;
      cy += (p1.y + p2.y) * cross;
    }
    area = Math.abs(area) * 0.5;
    if (area > 0.001) {
      cx = cx / (6 * area);
      cy = cy / (6 * area);
    }

    // LP Objective Function Maximization / Minimization at Corner Vertices
    let optimalVertex: { x: number; y: number; z: number } | null = null;
    if (polygon.length > 0) {
      let bestZ = lpMaximize ? -Infinity : Infinity;
      for (const v of polygon) {
        const z = lpObjCx * v.x + lpObjCy * v.y;
        if (lpMaximize ? z > bestZ : z < bestZ) {
          bestZ = z;
          optimalVertex = { x: v.x, y: v.y, z };
        }
      }
    }

    return { vertices: polygon, area, centroid: { x: cx, y: cy }, optimalVertex };
  }, [dynamicLines, lpObjCx, lpObjCy, lpMaximize, linePreset, lineMode]);

  // Copy LaTeX System to Clipboard
  const copyLatexSystem = () => {
    let latex = '\\begin{cases}\n';
    dynamicLines.forEach(l => {
      if (l.isVertical) {
        const rel = lineMode === 'feasible_polygon' ? (l.ineq === 'le' ? '\\le' : '\\ge') : '=';
        latex += `  x ${rel} ${(l.xVal ?? 0).toFixed(2)} \\\\\n`;
      } else {
        const sign = l.c >= 0 ? '+' : '-';
        const rel = lineMode === 'feasible_polygon' ? (l.ineq === 'le' ? '\\le' : '\\ge') : '=';
        latex += `  y ${rel} ${l.m.toFixed(2)}x ${sign} ${Math.abs(l.c).toFixed(2)} \\\\\n`;
      }
    });
    if (lineMode === 'feasible_polygon') {
      latex += `  \\max Z = ${lpObjCx.toFixed(2)}x + ${lpObjCy.toFixed(2)}y\n`;
    }
    latex += '\\end{cases}';
    navigator.clipboard?.writeText(latex);
    setCopiedLatexFeedback(true);
    setTimeout(() => setCopiedLatexFeedback(false), 2000);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. PHASE 4: HARMONICS, FOURIER SYNTHESIS & VECTOR SPACES
  // ─────────────────────────────────────────────────────────────────────────────
  const [fourierMode, setFourierMode] = useState<'time_domain' | 'epicycles' | 'vector_basis'>('time_domain');
  const [fourierWaveType, setFourierWaveType] = useState<'square' | 'sawtooth' | 'triangle'>('square');
  const [fourierHarmonics, setFourierHarmonics] = useState<number>(5);
  const [showIndividualHarmonics, setShowIndividualHarmonics] = useState<boolean>(true);
  const [showIdealTargetWave, setShowIdealTargetWave] = useState<boolean>(true);
  const [fourierWaveSpeed, setFourierWaveSpeed] = useState<number>(1.2);
  const [matrixA, setMatrixA] = useState<number>(1.2);
  const [matrixB, setMatrixB] = useState<number>(0.5);
  const [matrixC, setMatrixC] = useState<number>(-0.3);
  const [matrixD, setMatrixD] = useState<number>(1.0);
  const [showTransformedGrid, setShowTransformedGrid] = useState<boolean>(true);
  const [showDeformationEllipse, setShowDeformationEllipse] = useState<boolean>(true);
  const [showEigenvectors, setShowEigenvectors] = useState<boolean>(true);

  // 2D Matrix Transformation Eigensystem & Geometric Properties
  const matrixAnalysis = useMemo(() => {
    const a = matrixA;
    const b = matrixB;
    const c = matrixC;
    const d = matrixD;

    const det = a * d - b * c;
    const trace = a + d;
    const discriminant = trace * trace - 4 * det;
    const isSingular = Math.abs(det) < 0.001;

    let eigenvalues: number[] = [];
    let eigenvectors: Array<{ x: number; y: number; val: number }> = [];

    if (discriminant >= 0) {
      const lambda1 = (trace + Math.sqrt(discriminant)) / 2;
      const lambda2 = (trace - Math.sqrt(discriminant)) / 2;
      eigenvalues = [lambda1, lambda2];

      [lambda1, lambda2].forEach(lambda => {
        let vx = 0;
        let vy = 0;
        if (Math.abs(c) > 1e-4) {
          vx = lambda - d;
          vy = c;
        } else if (Math.abs(b) > 1e-4) {
          vx = b;
          vy = lambda - a;
        } else {
          if (Math.abs(lambda - a) < 1e-4) { vx = 1; vy = 0; }
          else { vx = 0; vy = 1; }
        }
        const len = Math.hypot(vx, vy) || 1;
        eigenvectors.push({ x: vx / len, y: vy / len, val: lambda });
      });
    }

    let classification = 'General Linear';
    if (isSingular) classification = 'Singular (Collapsed to 1D Line)';
    else if (Math.abs(a - d) < 1e-3 && Math.abs(b + c) < 1e-3 && Math.abs(a * a + b * b - 1) < 1e-3) classification = 'Orthogonal Rotation';
    else if (Math.abs(b) < 1e-3 && Math.abs(c) < 1e-3) classification = 'Pure Scaling (Diagonal)';
    else if ((Math.abs(b) > 1e-3 && Math.abs(c) < 1e-3) || (Math.abs(c) > 1e-3 && Math.abs(b) < 1e-3)) classification = 'Shear Mapping';
    else if (det < 0) classification = 'Orientation-Reversing (Reflection)';

    return { det, trace, discriminant, isSingular, eigenvalues, eigenvectors, classification };
  }, [matrixA, matrixB, matrixC, matrixD]);

  // Exact Fourier Series Mathematical Evaluators
  const evalFourierHarmonic = (n: number, x: number, phase: number, waveType: 'square' | 'sawtooth' | 'triangle') => {
    if (waveType === 'square') {
      const k = 2 * n - 1; // odd harmonics: 1, 3, 5, 7...
      const amp = 4 / (k * Math.PI);
      const val = amp * Math.sin(k * (x - phase));
      return { val, k, amp };
    } else if (waveType === 'sawtooth') {
      const k = n; // all integer harmonics: 1, 2, 3, 4...
      const sign = (n % 2 === 1) ? 1 : -1;
      const amp = (2 / (k * Math.PI)) * sign;
      const val = amp * Math.sin(k * (x - phase));
      return { val, k, amp: Math.abs(amp) };
    } else {
      // Triangle wave: odd harmonics with 1/k^2 decay and alternating signs
      const k = 2 * n - 1;
      const sign = (n % 2 === 1) ? 1 : -1;
      const amp = (8 / (Math.pow(k * Math.PI, 2))) * sign;
      const val = amp * Math.sin(k * (x - phase));
      return { val, k, amp: Math.abs(amp) };
    }
  };

  const evalFourierComposite = (x: number, phase: number, waveType: 'square' | 'sawtooth' | 'triangle', numHarmonics: number) => {
    let sum = 0;
    for (let n = 1; n <= numHarmonics; n++) {
      sum += evalFourierHarmonic(n, x, phase, waveType).val;
    }
    return sum;
  };

  const evalIdealWave = (x: number, phase: number, waveType: 'square' | 'sawtooth' | 'triangle') => {
    const normX = (((x - phase) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (waveType === 'square') {
      return normX < Math.PI ? 1.0 : -1.0;
    } else if (waveType === 'sawtooth') {
      return 1.0 - (normX / Math.PI);
    } else {
      if (normX < Math.PI / 2) return (2 / Math.PI) * normX;
      if (normX < 3 * Math.PI / 2) return 1.0 - (2 / Math.PI) * (normX - Math.PI / 2);
      return -1.0 + (2 / Math.PI) * (normX - 3 * Math.PI / 2);
    }
  };

  // Telemetry: L2 RMS error, Gibbs overshoot, decay rate
  const fourierTelemetry = useMemo(() => {
    let sumSqErr = 0;
    const samples = 100;
    for (let i = 0; i < samples; i++) {
      const sx = (i / samples) * 2 * Math.PI;
      const fourierVal = evalFourierComposite(sx, 0, fourierWaveType, fourierHarmonics);
      const idealVal = evalIdealWave(sx, 0, fourierWaveType);
      sumSqErr += Math.pow(fourierVal - idealVal, 2);
    }
    const rmsError = Math.sqrt(sumSqErr / samples);
    const gibbsOvershootPct = (fourierWaveType === 'square' || fourierWaveType === 'sawtooth') ? 8.95 : 0;
    const decayRate = fourierWaveType === 'triangle' ? 'O(1 / k²)' : 'O(1 / k)';
    const highestFreq = fourierWaveType === 'sawtooth' ? fourierHarmonics : (2 * fourierHarmonics - 1);
    return { rmsError, gibbsOvershootPct, decayRate, highestFreq };
  }, [fourierWaveType, fourierHarmonics]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. PHASE 5: DYNAMIC CALCULUS: TANGENTS & RIEMANN SUMS
  // ─────────────────────────────────────────────────────────────────────────────
  const [calcMode, setCalcMode] = useState<'tangent_secant' | 'riemann_sums' | 'derivatives'>('tangent_secant');
  const [calcPreset, setCalcPreset] = useState<'cubic' | 'sinusoid' | 'bell'>('cubic');
  const [calcX0, setCalcX0] = useState<number>(0.8);
  const [calcH, setCalcH] = useState<number>(0.5);
  const [calcIntegralN, setCalcIntegralN] = useState<number>(12);

  const evalCalcFunction = (x: number) => {
    if (calcPreset === 'sinusoid') return Math.sin(1.8 * x) * 1.5;
    if (calcPreset === 'bell') return 2.2 * Math.exp(-0.8 * x * x);
    return 0.35 * Math.pow(x, 3) - 0.8 * x;
  };

  const evalCalcDerivative = (x: number) => {
    if (calcPreset === 'sinusoid') return 1.8 * Math.cos(1.8 * x) * 1.5;
    if (calcPreset === 'bell') return -3.52 * x * Math.exp(-0.8 * x * x);
    return 1.05 * Math.pow(x, 2) - 0.8;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. PHASE 6: 3D SURFACES & 4D HYPERPLANE SLICING
  // ─────────────────────────────────────────────────────────────────────────────
  const [surfaceType, setSurfaceType] = useState<'saddle' | 'monkey' | 'torus' | 'mobius' | 'himmelblau' | 'hyper_4d'>('hyper_4d');
  const [hyperW, setHyperW] = useState<number>(0.6);
  const [autoSlice4D, setAutoSlice4D] = useState<boolean>(true);
  const [showSlicePlane, setShowSlicePlane] = useState<boolean>(false);
  const [sliceHeightZ, setSliceHeightZ] = useState<number>(0.0);
  const [rotX, setRotX] = useState<number>(26);
  const [rotY, setRotY] = useState<number>(42);
  const [shadingMode, setShadingMode] = useState<'solid' | 'wireframe' | 'both'>('solid');
  const [surfaceColormap, setSurfaceColormap] = useState<'cyberpunk' | 'plasma' | 'emerald' | 'sunset'>('cyberpunk');
  const [show3dAxes, setShow3dAxes] = useState<boolean>(true);
  const [showFloorGrid, setShowFloorGrid] = useState<boolean>(true);
  const [meshResolution, setMeshResolution] = useState<number>(26);
  const [showRollingBall, setShowRollingBall] = useState<boolean>(true);
  const [ballLearningRate, setBallLearningRate] = useState<number>(0.07);
  const [ballMomentum, setBallMomentum] = useState<number>(0.72);
  const [ballPhysicsTick, setBallPhysicsTick] = useState<number>(0);
  const isDragging3DRef = useRef<boolean>(false);
  const [isDragging3D, setIsDragging3D] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; rx: number; ry: number }>({ x: 0, y: 0, rx: 26, ry: 42 });
  const canvas3DRef = useRef<HTMLCanvasElement | null>(null);

  // High-performance mutable physics state for 60 FPS animation without React re-render thrashing
  const ballPhysicsRef = useRef<{
    x: number;
    y: number;
    u: number;
    v: number;
    vx: number;
    vy: number;
    history: Array<{ x: number; y: number; z: number }>;
    stepCount: number;
    gradNorm: number;
    isActive: boolean;
  }>({
    x: -1.3,
    y: 1.1,
    u: 0.2,
    v: 0.1,
    vx: 0,
    vy: 0,
    history: [{ x: -1.3, y: 1.1, z: 0.2 }],
    stepCount: 0,
    gradNorm: 0,
    isActive: true
  });

  const resetBall = (randomize = false) => {
    const rx = randomize ? (Math.random() * 2.8 - 1.4) : -1.3;
    const ry = randomize ? (Math.random() * 2.8 - 1.4) : 1.1;
    const effectiveW = surfaceType === 'hyper_4d' ? (autoSlice4D || isBendingAnim ? hyperW + timeT * 0.7 : hyperW) : 0;
    const pz = eval3DSurface(rx, ry, surfaceType, effectiveW, timeT, isBendingAnim).z;
    ballPhysicsRef.current = {
      x: rx,
      y: ry,
      u: randomize ? Math.random() * Math.PI : 0.2,
      v: randomize ? Math.random() * 0.5 : 0.1,
      vx: 0,
      vy: 0,
      history: [{ x: rx, y: ry, z: pz }],
      stepCount: 0,
      gradNorm: 0,
      isActive: true
    };
    setBallPhysicsTick(prev => prev + 1);
  };

  // Auto-reset physics ball when switching 3D surface geometries
  useEffect(() => {
    if (activeModuleId === 'mathbox_3d') {
      resetBall(true);
    }
  }, [surfaceType, activeModuleId]);

  // Surface Mathematical Coordinate & Height Evaluator with Harmonic Wave Dynamics
  const eval3DSurface = (
    u: number,
    v: number,
    type: 'saddle' | 'monkey' | 'torus' | 'mobius' | 'himmelblau' | 'hyper_4d',
    w: number,
    waveT: number = 0,
    hasWave: boolean = false
  ) => {
    if (type === 'saddle') {
      const x = u;
      const y = v;
      const baseZ = 0.55 * (u * u - v * v);
      const z = hasWave
        ? baseZ * Math.cos(waveT * 1.2) + 0.16 * Math.sin(2.2 * u + waveT * 2.0) * Math.cos(2.2 * v)
        : baseZ;
      return { x, y, z };
    } else if (type === 'monkey') {
      const x = u;
      const y = v;
      const baseZ = 0.32 * (Math.pow(u, 3) - 3 * u * Math.pow(v, 2));
      const z = hasWave
        ? 0.32 * ((Math.pow(u, 3) - 3 * u * Math.pow(v, 2)) * Math.cos(waveT * 1.2) + (3 * Math.pow(u, 2) * v - Math.pow(v, 3)) * Math.sin(waveT * 1.2))
        : baseZ;
      return { x, y, z };
    } else if (type === 'torus') {
      const R = hasWave ? 1.35 + 0.22 * Math.sin(waveT * 1.6) : 1.35;
      const r = hasWave ? 0.55 + 0.14 * Math.cos(waveT * 1.6) : 0.55;
      const x = (R + r * Math.cos(v)) * Math.cos(u);
      const y = (R + r * Math.cos(v)) * Math.sin(u);
      const z = r * Math.sin(v);
      return { x, y, z };
    } else if (type === 'mobius') {
      const twist = hasWave ? u + waveT * 1.4 : u;
      const x = (1 + (v / 2) * Math.cos(twist / 2)) * Math.cos(u);
      const y = (1 + (v / 2) * Math.cos(twist / 2)) * Math.sin(u);
      const z = (v / 2) * Math.sin(twist / 2);
      return { x, y, z };
    } else if (type === 'himmelblau') {
      const x = u;
      const y = v;
      const rawZ = Math.pow(u * u + v - 11, 2) + Math.pow(u + v * v - 7, 2);
      const baseZ = 0.018 * rawZ - 1.2;
      const z = hasWave
        ? baseZ + 0.16 * Math.sin(2 * u + waveT * 1.8) * Math.sin(2 * v + waveT * 1.4)
        : baseZ;
      return { x, y, z };
    } else {
      // 4D Hyperplane Slicing: z = (x^2 - y^2) * cos(w) + 2xy * sin(w)
      const x = u;
      const y = v;
      const baseZ = 0.48 * ((u * u - v * v) * Math.cos(w) + 2 * u * v * Math.sin(w));
      const z = hasWave
        ? baseZ + 0.14 * Math.sin(2 * u + waveT * 2.2) * Math.cos(2 * v)
        : baseZ;
      return { x, y, z };
    }
  };

  // Colormap Interpolator
  const getSurfaceColor = (normZ: number, colormap: 'cyberpunk' | 'plasma' | 'emerald' | 'sunset', light: number) => {
    const t = Math.max(0, Math.min(1, normZ));
    let r = 0, g = 0, b = 0;

    if (colormap === 'cyberpunk') {
      if (t < 0.35) {
        const k = t / 0.35;
        r = 30 + k * (6 - 30);
        g = 27 + k * (182 - 27);
        b = 75 + k * (212 - 75);
      } else if (t < 0.7) {
        const k = (t - 0.35) / 0.35;
        r = 6 + k * (168 - 6);
        g = 182 + k * (85 - 182);
        b = 212 + k * (247 - 212);
      } else {
        const k = (t - 0.7) / 0.3;
        r = 168 + k * (236 - 168);
        g = 85 + k * (72 - 85);
        b = 247 + k * (153 - 247);
      }
    } else if (colormap === 'plasma') {
      if (t < 0.33) {
        const k = t / 0.33;
        r = 13 + k * (140 - 13);
        g = 8 + k * (41 - 8);
        b = 135 + k * (129 - 135);
      } else if (t < 0.66) {
        const k = (t - 0.33) / 0.33;
        r = 140 + k * (225 - 140);
        g = 41 + k * (100 - 41);
        b = 129 + k * (40 - 129);
      } else {
        const k = (t - 0.66) / 0.34;
        r = 225 + k * (251 - 225);
        g = 100 + k * (191 - 100);
        b = 40 + k * (36 - 40);
      }
    } else if (colormap === 'emerald') {
      r = 16 + t * (52 - 16) + Math.pow(t, 2) * 150;
      g = 50 + t * (211 - 50);
      b = 70 + t * (153 - 70) + Math.pow(t, 2) * 80;
    } else {
      r = 90 + t * (251 - 90);
      g = 20 + t * (191 - 20);
      b = 120 - t * 100;
    }

    r = Math.min(255, Math.max(0, Math.round(r * light)));
    g = Math.min(255, Math.max(0, Math.round(g * light)));
    b = Math.min(255, Math.max(0, Math.round(b * light)));

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Mathematical Curvature & Hessian Telemetry for Active 3D/4D Manifold
  const surfaceTelemetry = useMemo(() => {
    const effectiveW = surfaceType === 'hyper_4d' ? (autoSlice4D || isBendingAnim ? hyperW + timeT * 0.7 : hyperW) : 0;

    let equationLatex = '';
    let description = '';
    let criticalPointInfo = '';
    let fxx = 0, fyy = 0, fxy = 0;

    if (surfaceType === 'saddle') {
      equationLatex = isBendingAnim ? 'z = 0.55(x² - y²)cos(ωt) + 0.16sin(2.2x+2ωt)cos(2.2y)' : 'z = 0.55 · (x² - y²)';
      description = isBendingAnim ? 'Harmonic Breathing Hyperbolic Paraboloid (Wave Active)' : 'Hyperbolic Paraboloid (Minimax saddle point at origin)';
      fxx = 1.1; fyy = -1.1; fxy = 0;
      criticalPointInfo = 'Saddle Point at (0, 0): det(H) = -1.21 < 0';
    } else if (surfaceType === 'monkey') {
      equationLatex = isBendingAnim ? 'z = 0.32[(x³ - 3xy²)cos(ωt) + (3x²y - y³)sin(ωt)]' : 'z = 0.32 · (x³ - 3xy²)';
      description = isBendingAnim ? 'Rotating Tri-Ridge Monkey Saddle (Wave Active)' : 'Monkey Saddle (3 downward troughs & 3 upward ridges)';
      fxx = 0; fyy = 0; fxy = 0;
      criticalPointInfo = 'Monkey Saddle at (0, 0): det(H) = 0 (Degenerate Tri-Saddle)';
    } else if (surfaceType === 'torus') {
      equationLatex = '(√(x² + y²) - R(t))² + z² = r(t)²';
      description = isBendingAnim ? 'Pulsating Torus (Dynamic Tube Breathing & Knot Geodesic)' : 'Parametric Torus (Genus-1 compact manifold, R=1.35, r=0.55)';
      criticalPointInfo = 'Outer equator: Elliptic (K > 0) • Inner ring: Hyperbolic (K < 0)';
    } else if (surfaceType === 'mobius') {
      equationLatex = 'x(u,v) = (1 + ½v·cos½θ)cos u,  θ = u + ωt';
      description = isBendingAnim ? 'Dynamic Traveling Half-Twist Möbius Strip (Wave Active)' : 'Möbius Strip (Non-orientable manifold with 180° half-twist)';
      criticalPointInfo = 'One-sided boundary curve, Euler characteristic χ = 0';
    } else if (surfaceType === 'himmelblau') {
      equationLatex = 'f(x,y) = (x² + y - 11)² + (x + y² - 7)² + Ψ(t)';
      description = isBendingAnim ? 'Oscillating Himmelblau 4-Well Potential Landscape' : 'Himmelblau Multi-Modal Optimization Surface (4 global minima)';
      fxx = 14; fyy = 2; fxy = 4;
      criticalPointInfo = '4 Global Minima: f(x*, y*) = 0 • 1 Local Max • 4 Saddles';
    } else {
      const wDeg = (((effectiveW % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) * (180 / Math.PI)).toFixed(0);
      equationLatex = `z = 0.48 · [(x² - y²)cos(w) + 2xy·sin(w)],  w=${wDeg}°`;
      description = isBendingAnim ? '4D Hyper-Saddle Sliced with Propagating Hyper-Wave' : '4D Hyper-Saddle sliced by 3D Hyperplane w = w(t)';
      fxx = 0.96 * Math.cos(effectiveW);
      fyy = -0.96 * Math.cos(effectiveW);
      fxy = 0.96 * Math.sin(effectiveW);
      const detH = fxx * fyy - fxy * fxy;
      criticalPointInfo = `4D Slicing Manifold: det(H) = ${detH.toFixed(3)} (Invariant Hyperbolic)`;
    }

    const detH = fxx * fyy - fxy * fxy;
    const curvatureClass = (surfaceType === 'torus' || surfaceType === 'mobius')
      ? 'Parametric Non-Euclidean'
      : detH < 0
      ? 'Hyperbolic Saddle (K < 0)'
      : detH > 0
      ? (fxx > 0 ? 'Elliptic Valley (Local Min)' : 'Elliptic Dome (Local Max)')
      : 'Degenerate Critical Flat (det H = 0)';

    return { equationLatex, description, criticalPointInfo, fxx, fyy, fxy, detH, curvatureClass, effectiveW };
  }, [surfaceType, hyperW, autoSlice4D, isBendingAnim, timeT]);

  // 3D Canvas Rendering Loop
  useEffect(() => {
    if (activeModuleId !== 'mathbox_3d') return;
    const canvas = canvas3DRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // HiDPI Screen / Retina Resolution Scaling
    const displayWidth = canvas.clientWidth || 700;
    const displayHeight = canvas.clientHeight || 480;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    const expectedWidth = Math.round(displayWidth * dpr);
    const expectedHeight = Math.round(displayHeight * dpr);
    if (canvas.width !== expectedWidth || canvas.height !== expectedHeight) {
      canvas.width = expectedWidth;
      canvas.height = expectedHeight;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const width = displayWidth;
    const height = displayHeight;
    const cx = width / 2;
    const cy = height / 2 + 15;

    // Clear canvas
    ctx.fillStyle = currentCanvasTheme.bg || '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Dynamic 4D Slice Angle & Dynamic Slicing Height
    const effectiveW = surfaceType === 'hyper_4d' ? (autoSlice4D || isBendingAnim ? hyperW + timeT * 0.7 : hyperW) : hyperW;
    const effectiveSliceZ = isBendingAnim && showSlicePlane ? sliceHeightZ + 0.65 * Math.sin(timeT * 1.5) : sliceHeightZ;

    // Rotation Matrix: Yaw (rotY) then Pitch (rotX)
    const radY = (rotY * Math.PI) / 180;
    const radX = (rotX * Math.PI) / 180;
    const cosY = Math.cos(radY), sinY = Math.sin(radY);
    const cosX = Math.cos(radX), sinX = Math.sin(radX);

    const project = (x: number, y: number, z: number) => {
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const dist = 5.5;
      const scale = 160;
      const factor = dist / (z2 + dist);
      const px = cx + x1 * factor * scale;
      const py = cy - y2 * factor * scale;

      return { px, py, zDepth: z2 };
    };

    // 1. Draw Floor Grid
    if (showFloorGrid) {
      const floorZ = -1.8;
      // Minor Grid Lines
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
      ctx.lineWidth = 0.9;
      for (let gx = -2.0; gx <= 2.0; gx += 0.4) {
        if (Math.abs(gx % 1.0) > 0.05) {
          const p1 = project(gx, floorZ, -2.0);
          const p2 = project(gx, floorZ, 2.0);
          ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py); ctx.stroke();
        }
      }
      for (let gz = -2.0; gz <= 2.0; gz += 0.4) {
        if (Math.abs(gz % 1.0) > 0.05) {
          const p1 = project(-2.0, floorZ, gz);
          const p2 = project(2.0, floorZ, gz);
          ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py); ctx.stroke();
        }
      }

      // Major Illuminated Cyan Grid Lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.42)';
      ctx.lineWidth = 1.4;
      for (let gx = -2.0; gx <= 2.0; gx += 1.0) {
        const p1 = project(gx, floorZ, -2.0);
        const p2 = project(gx, floorZ, 2.0);
        ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py); ctx.stroke();

        // Floor coordinate numeric labels
        ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
        ctx.font = '8.5px monospace';
        ctx.fillText(gx.toFixed(0), p2.px - 3, p2.py + 11);
      }
      for (let gz = -2.0; gz <= 2.0; gz += 1.0) {
        const p1 = project(-2.0, floorZ, gz);
        const p2 = project(2.0, floorZ, gz);
        ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py); ctx.stroke();
      }

      // Perimeter Floor Border & Corner Anchors
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 1.8;
      const c0 = project(-2.0, floorZ, -2.0);
      const c1 = project(2.0, floorZ, -2.0);
      const c2 = project(2.0, floorZ, 2.0);
      const c3 = project(-2.0, floorZ, 2.0);
      ctx.beginPath();
      ctx.moveTo(c0.px, c0.py); ctx.lineTo(c1.px, c1.py); ctx.lineTo(c2.px, c2.py); ctx.lineTo(c3.px, c3.py);
      ctx.closePath();
      ctx.stroke();

      // Corner Anchor Points
      [c0, c1, c2, c3].forEach(c => {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(c.px, c.py, 3, 0, 2 * Math.PI); ctx.fill();
      });
    }

    // 2. Generate 3D Mesh Grid Vertices
    const N = meshResolution;
    const uMin = surfaceType === 'torus' || surfaceType === 'mobius' ? -Math.PI : -2.0;
    const uMax = surfaceType === 'torus' || surfaceType === 'mobius' ? Math.PI : 2.0;
    const vMin = surfaceType === 'torus' ? -Math.PI : surfaceType === 'mobius' ? -0.8 : -2.0;
    const vMax = surfaceType === 'torus' ? Math.PI : surfaceType === 'mobius' ? 0.8 : 2.0;

    const grid: Array<Array<{ x: number; y: number; z: number; px: number; py: number; zDepth: number }>> = [];
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i <= N; i++) {
      grid[i] = [];
      const u = uMin + (i / N) * (uMax - uMin);
      for (let j = 0; j <= N; j++) {
        const v = vMin + (j / N) * (vMax - vMin);
        const pt = eval3DSurface(u, v, surfaceType, effectiveW, timeT, isBendingAnim);
        const proj = project(pt.x, pt.z, pt.y);
        grid[i][j] = { x: pt.x, y: pt.y, z: pt.z, px: proj.px, py: proj.py, zDepth: proj.zDepth };
        if (pt.z < minZ) minZ = pt.z;
        if (pt.z > maxZ) maxZ = pt.z;
      }
    }
    const zSpan = maxZ - minZ || 1;

    // 3. Build Quad Faces & Compute Face Normals / Depths
    interface QuadFace {
      p0: { x: number; y: number; z: number; px: number; py: number };
      p1: { x: number; y: number; z: number; px: number; py: number };
      p2: { x: number; y: number; z: number; px: number; py: number };
      p3: { x: number; y: number; z: number; px: number; py: number };
      avgZ: number;
      depth: number;
      color: string;
      wireColor: string;
      isoclinePts: Array<{ px: number; py: number }>;
    }

    const quads: QuadFace[] = [];
    const lightDir = { x: 0.45, y: 0.75, z: 0.48 };
    const lightLen = Math.hypot(lightDir.x, lightDir.y, lightDir.z);
    lightDir.x /= lightLen; lightDir.y /= lightLen; lightDir.z /= lightLen;

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const v0 = grid[i][j];
        const v1 = grid[i + 1][j];
        const v2 = grid[i + 1][j + 1];
        const v3 = grid[i][j + 1];

        const avgDepth = (v0.zDepth + v1.zDepth + v2.zDepth + v3.zDepth) / 4;
        const avgZ = (v0.z + v1.z + v2.z + v3.z) / 4;
        const normZ = (avgZ - minZ) / zSpan;

        const ax = v1.x - v0.x, ay = v1.y - v0.y, az = v1.z - v0.z;
        const bx = v3.x - v0.x, by = v3.y - v0.y, bz = v3.z - v0.z;
        let nx = ay * bz - az * by;
        let ny = az * bx - ax * bz;
        let nz = ax * by - ay * bx;
        const nLen = Math.hypot(nx, ny, nz) || 1;
        nx /= nLen; ny /= nLen; nz /= nLen;

        const dot = Math.max(0, nx * lightDir.x + ny * lightDir.y + nz * lightDir.z);
        const intensity = 0.35 + 0.65 * dot;

        const color = getSurfaceColor(normZ, surfaceColormap, intensity);
        const wireColor = getSurfaceColor(normZ, surfaceColormap, 1.2);

        // Exact Edge Linear Interpolation for Isocline Slicing Level Curve
        const isoclinePts: Array<{ px: number; py: number }> = [];
        if (showSlicePlane) {
          const edges = [
            [v0, v1],
            [v1, v2],
            [v2, v3],
            [v3, v0]
          ];
          edges.forEach(([ea, eb]) => {
            const zMinE = Math.min(ea.z, eb.z);
            const zMaxE = Math.max(ea.z, eb.z);
            if (effectiveSliceZ >= zMinE && effectiveSliceZ <= zMaxE && Math.abs(eb.z - ea.z) > 1e-5) {
              const t = (effectiveSliceZ - ea.z) / (eb.z - ea.z);
              const ix = ea.x + t * (eb.x - ea.x);
              const iy = ea.y + t * (eb.y - ea.y);
              const proj = project(ix, effectiveSliceZ, iy);
              isoclinePts.push({ px: proj.px, py: proj.py });
            }
          });
        }

        quads.push({
          p0: { x: v0.x, y: v0.y, z: v0.z, px: v0.px, py: v0.py },
          p1: { x: v1.x, y: v1.y, z: v1.z, px: v1.px, py: v1.py },
          p2: { x: v2.x, y: v2.y, z: v2.z, px: v2.px, py: v2.py },
          p3: { x: v3.x, y: v3.y, z: v3.z, px: v3.px, py: v3.py },
          avgZ,
          depth: avgDepth,
          color,
          wireColor,
          isoclinePts
        });
      }
    }

    // 4. Painter's Algorithm: Sort quads by descending depth
    quads.sort((a, b) => b.depth - a.depth);

    // 5. Draw Quads
    quads.forEach(q => {
      ctx.beginPath();
      ctx.moveTo(q.p0.px, q.p0.py);
      ctx.lineTo(q.p1.px, q.p1.py);
      ctx.lineTo(q.p2.px, q.p2.py);
      ctx.lineTo(q.p3.px, q.p3.py);
      ctx.closePath();

      if (shadingMode === 'solid' || shadingMode === 'both') {
        ctx.fillStyle = q.color;
        ctx.fill();
      }

      if (shadingMode === 'wireframe' || shadingMode === 'both') {
        ctx.strokeStyle = shadingMode === 'wireframe' ? q.wireColor : 'rgba(15, 23, 42, 0.4)';
        ctx.lineWidth = shadingMode === 'wireframe' ? 1.2 : 0.6;
        ctx.stroke();
      }

      // Draw Exact Isocline Segment across this Quad
      if (showSlicePlane && q.isoclinePts.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(q.isoclinePts[0].px, q.isoclinePts[0].py);
        ctx.lineTo(q.isoclinePts[1].px, q.isoclinePts[1].py);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3.0;
        ctx.stroke();
      }
    });

    // 6. Draw Horizontal Slicing Plane
    if (showSlicePlane) {
      const sp0 = project(-2.2, effectiveSliceZ, -2.2);
      const sp1 = project(2.2, effectiveSliceZ, -2.2);
      const sp2 = project(2.2, effectiveSliceZ, 2.2);
      const sp3 = project(-2.2, effectiveSliceZ, 2.2);

      ctx.beginPath();
      ctx.moveTo(sp0.px, sp0.py);
      ctx.lineTo(sp1.px, sp1.py);
      ctx.lineTo(sp2.px, sp2.py);
      ctx.lineTo(sp3.px, sp3.py);
      ctx.closePath();

      ctx.fillStyle = 'rgba(251, 191, 36, 0.14)';
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText(`Slice z₀ = ${effectiveSliceZ.toFixed(2)}${isBendingAnim ? ' (Wave Oscillating)' : ''}`, sp1.px + 6, sp1.py);
    }

    // 7. Draw 3D Axes Triad & Corner 3D Orientation Gizmo
    if (show3dAxes) {
      // 7a. In-World 3D Coordinate Axes
      const origin = project(0, 0, 0);

      // Negative dashed axes
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      const negX = project(-2.2, 0, 0);
      const negY = project(0, 0, -2.2);
      const negZ = project(0, -2.2, 0);
      ctx.beginPath(); ctx.moveTo(origin.px, origin.py); ctx.lineTo(negX.px, negX.py); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(origin.px, origin.py); ctx.lineTo(negY.px, negY.py); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(origin.px, origin.py); ctx.lineTo(negZ.px, negZ.py); ctx.stroke();
      ctx.setLineDash([]);

      // Positive illuminated solid axes with distinct colors
      // X-Axis (Red / Coral)
      const posX = project(2.3, 0, 0);
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(origin.px, origin.py); ctx.lineTo(posX.px, posX.py); ctx.stroke();
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('+X (u)', posX.px + 5, posX.py + 3);

      // Y-Axis (Green / Emerald)
      const posY = project(0, 0, 2.3);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(origin.px, origin.py); ctx.lineTo(posY.px, posY.py); ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('+Y (v)', posY.px + 5, posY.py + 3);

      // Z-Axis (Cyan / Sky)
      const posZ = project(0, 2.3, 0);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(origin.px, origin.py); ctx.lineTo(posZ.px, posZ.py); ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('+Z (f)', posZ.px - 6, posZ.py - 6);

      // 7b. Fixed Bottom-Right 3D Orientation Mini-Gizmo
      const gizmoCX = width - 42;
      const gizmoCY = height - 42;
      const gLen = 22;

      const gx = gizmoCX + gLen * cosY;
      const gy = gizmoCY - gLen * sinY * sinX;
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2.0;
      ctx.beginPath(); ctx.moveTo(gizmoCX, gizmoCY); ctx.lineTo(gx, gy); ctx.stroke();
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText('X', gx + 3, gy + 3);

      const hy = gizmoCY - gLen * cosX;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.0;
      ctx.beginPath(); ctx.moveTo(gizmoCX, gizmoCY); ctx.lineTo(gizmoCX, hy); ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Z', gizmoCX - 3, hy - 4);

      const kx = gizmoCX - gLen * sinY;
      const ky = gizmoCY - gLen * cosY * sinX;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.0;
      ctx.beginPath(); ctx.moveTo(gizmoCX, gizmoCY); ctx.lineTo(kx, ky); ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.fillText('Y', kx + 3, ky + 3);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(gizmoCX, gizmoCY, 2.5, 0, 2 * Math.PI); ctx.fill();
    }

    // 8. Draw 3D Gradient Descent Rolling Ball / Geodesic Particle
    const phys = ballPhysicsRef.current;
    if (showRollingBall && phys) {
      // 8a. History Trajectory Ribbon (Trailing Path)
      if (phys.history.length >= 2) {
        ctx.strokeStyle = surfaceType === 'torus' || surfaceType === 'mobius' ? '#38bdf8' : '#fbbf24';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let h = 0; h < phys.history.length; h++) {
          const hp = phys.history[h];
          const hProj = project(hp.x, hp.z, hp.y);
          if (h === 0) ctx.moveTo(hProj.px, hProj.py);
          else ctx.lineTo(hProj.px, hProj.py);
        }
        ctx.stroke();

        // Glowing halo line
        ctx.strokeStyle = surfaceType === 'torus' || surfaceType === 'mobius' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(251, 191, 36, 0.35)';
        ctx.lineWidth = 5.0;
        ctx.stroke();
      }

      // 8b. Active Ball Position & Drop-Line to Floor
      const currentZ = (surfaceType === 'torus' || surfaceType === 'mobius')
        ? (phys.history[phys.history.length - 1]?.z ?? 0)
        : eval3DSurface(phys.x, phys.y, surfaceType, effectiveW, timeT, isBendingAnim).z;
      const ballProj = project(phys.x, currentZ, phys.y);
      const floorProj = project(phys.x, -1.8, phys.y);

      // Drop Line to Floor
      ctx.strokeStyle = surfaceType === 'torus' || surfaceType === 'mobius' ? 'rgba(56, 189, 248, 0.5)' : 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(ballProj.px, ballProj.py);
      ctx.lineTo(floorProj.px, floorProj.py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Floor Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(floorProj.px, floorProj.py, 8, 4, 0, 0, 2 * Math.PI);
      ctx.fill();

      // 3D Radial Gradient Sphere
      const radGrad = ctx.createRadialGradient(ballProj.px - 2.5, ballProj.py - 2.5, 1, ballProj.px, ballProj.py, 8);
      if (surfaceType === 'torus' || surfaceType === 'mobius') {
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.3, '#38bdf8');
        radGrad.addColorStop(0.8, '#0284c7');
        radGrad.addColorStop(1, '#0369a1');
      } else {
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.3, '#fbbf24');
        radGrad.addColorStop(0.8, '#d97706');
        radGrad.addColorStop(1, '#78350f');
      }

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(ballProj.px, ballProj.py, 7.5, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 9. On-Canvas Telemetry HUD Badge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(14, 14, 235, showRollingBall ? 72 : 56, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(surfaceType.toUpperCase() + ' (3D MESH)' + (isBendingAnim ? ' [WAVE ON]' : ''), 24, 32);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '9.5px monospace';
    ctx.fillText(`Rx: ${rotX.toFixed(0)}°  Ry: ${rotY.toFixed(0)}°  N: ${N}×${N}`, 24, 46);
    if (surfaceType === 'hyper_4d') {
      const wDeg = (((effectiveW % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) * (180 / Math.PI)).toFixed(0);
      ctx.fillStyle = '#ec4899';
      ctx.fillText(`4D Hyper-Slice: w = ${wDeg}° (${autoSlice4D || isBendingAnim ? 'Auto-Orbit' : 'Manual'})`, 24, 58);
    } else {
      ctx.fillStyle = '#34d399';
      ctx.fillText(`${surfaceTelemetry.curvatureClass}`, 24, 58);
    }

    if (showRollingBall) {
      if (surfaceType === 'torus' || surfaceType === 'mobius') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`● Geodesic Orbit: Toroidal Knot (step ${phys.stepCount})`, 24, 72);
      } else {
        const currentZ = eval3DSurface(phys.x, phys.y, surfaceType, effectiveW, timeT, isBendingAnim).z;
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`● Descent Ball: z=${currentZ.toFixed(2)} |∇f|=${phys.gradNorm.toFixed(3)} (step ${phys.stepCount})`, 24, 72);
      }
    }

    ctx.restore();

  }, [activeModuleId, surfaceType, hyperW, autoSlice4D, showSlicePlane, sliceHeightZ, rotX, rotY, shadingMode, surfaceColormap, show3dAxes, showFloorGrid, meshResolution, currentCanvasTheme, isBendingAnim, timeT, surfaceTelemetry, showRollingBall, ballPhysicsTick]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. PHASE 7: VECTOR FIELDS & PHASE SPACE ORBITS
  // ─────────────────────────────────────────────────────────────────────────────
  const [odeSystem, setOdeSystem] = useState<'pendulum' | 'lotka_volterra' | 'vanderpol' | 'lorenz'>('pendulum');
  const [dampingFactor, setDampingFactor] = useState<number>(0.25);
  const [phaseX0, setPhaseX0] = useState<number>(1.2);
  const [phaseY0, setPhaseY0] = useState<number>(0.5);
  // ─────────────────────────────────────────────────────────────────────────────
  // 10. PHASE 8: FORMULA SANDBOX STATES
  // ─────────────────────────────────────────────────────────────────────────────
  const [sandboxCoordType, setSandboxCoordType] = useState<'cartesian' | 'polar' | 'parametric'>('cartesian');
  const [paramK, setParamK] = useState<number>(2.0);
  const [paramA, setParamA] = useState<number>(1.2);
  const [paramB, setParamB] = useState<number>(0.0);

  // Global Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (isSimulating) {
        setTimeT(prev => prev + dt * animSpeed);
        if (isAutoOrbit) {
          setRotY(prev => (prev + 0.4 * animSpeed) % 360);
          setLog3dRotY(prev => (prev + 0.4 * animSpeed) % 360);
          setLin3dRotY(prev => (prev + 0.4 * animSpeed) % 360);
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

        // 3D Manifold Gradient Descent & Geodesic Physics Step
        if (activeModuleId === 'mathbox_3d' && showRollingBall) {
          const phys = ballPhysicsRef.current;
          const effW = surfaceType === 'hyper_4d' ? (autoSlice4D || isBendingAnim ? hyperW + timeT * 0.7 : hyperW) : 0;

          if (surfaceType === 'torus') {
            // (1, 2) Torus Knot Geodesic Circumnavigation
            phys.u = (phys.u + dt * animSpeed * 1.4) % (2 * Math.PI);
            phys.v = (phys.v + dt * animSpeed * 2.8) % (2 * Math.PI);
            const pt = eval3DSurface(phys.u, phys.v, 'torus', 0, timeT, isBendingAnim);
            phys.x = pt.x;
            phys.y = pt.y;
            phys.history.push({ x: pt.x, y: pt.y, z: pt.z });
            if (phys.history.length > 90) phys.history.shift();
            phys.stepCount += 1;
          } else if (surfaceType === 'mobius') {
            // Non-orientable Möbius strip centerline twist orbit
            phys.u = (phys.u + dt * animSpeed * 1.2) % (4 * Math.PI);
            phys.v = 0.55 * Math.sin(phys.u * 1.5);
            const pt = eval3DSurface(phys.u, phys.v, 'mobius', 0, timeT, isBendingAnim);
            phys.x = pt.x;
            phys.y = pt.y;
            phys.history.push({ x: pt.x, y: pt.y, z: pt.z });
            if (phys.history.length > 90) phys.history.shift();
            phys.stepCount += 1;
          } else {
            // Classical Gradient Descent with Momentum for Explicit Height Fields
            const eps = 0.005;
            const zXp = eval3DSurface(phys.x + eps, phys.y, surfaceType, effW, timeT, isBendingAnim).z;
            const zXm = eval3DSurface(phys.x - eps, phys.y, surfaceType, effW, timeT, isBendingAnim).z;
            const zYp = eval3DSurface(phys.x, phys.y + eps, surfaceType, effW, timeT, isBendingAnim).z;
            const zYm = eval3DSurface(phys.x, phys.y - eps, surfaceType, effW, timeT, isBendingAnim).z;

            const gx = (zXp - zXm) / (2 * eps);
            const gy = (zYp - zYm) / (2 * eps);
            const gNorm = Math.hypot(gx, gy);
            phys.gradNorm = gNorm;

            if (gNorm > 0.0005 && phys.isActive) {
              phys.vx = phys.vx * ballMomentum - ballLearningRate * gx;
              phys.vy = phys.vy * ballMomentum - ballLearningRate * gy;
              const nx = Math.max(-2.0, Math.min(2.0, phys.x + phys.vx * animSpeed));
              const ny = Math.max(-2.0, Math.min(2.0, phys.y + phys.vy * animSpeed));
              const nz = eval3DSurface(nx, ny, surfaceType, effW, timeT, isBendingAnim).z;

              phys.x = nx;
              phys.y = ny;
              phys.history.push({ x: nx, y: ny, z: nz });
              if (phys.history.length > 80) phys.history.shift();
              phys.stepCount += 1;
            }
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isSimulating, isAutoOrbit, isBendingAnim, isGradDescentRunning, learningRateEta, manualBeta0, manualBeta1, linPoints, animSpeed, activeModuleId, showRollingBall, ballMomentum, ballLearningRate, surfaceType, autoSlice4D, hyperW, timeT]);

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
    bgGrad.addColorStop(0, currentCanvasTheme.plotBoxBg || currentCanvasTheme.bg || '#0b1120');
    bgGrad.addColorStop(1, currentCanvasTheme.bg || '#020617');
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
    bgGrad.addColorStop(0, currentCanvasTheme.plotBoxBg || currentCanvasTheme.bg || '#0b1120');
    bgGrad.addColorStop(1, currentCanvasTheme.bg || '#020617');
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
      {viewMode === 'bento_hub' ? (
        /* ═══════════════════════════════════════════════════════════════════════
           1. BENTO BOX MODELS GALLERY HUB (UNIFIED ATMOSPHERE BOUND)
           ═══════════════════════════════════════════════════════════════════════ */
        <div className="mathbox-bento-hub">
          {/* Top Bento Hub Command Card */}
          <div className="mathbox-bento-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'var(--pill-bg, rgba(6, 182, 212, 0.15))',
                    border: '1px solid var(--pill-border, rgba(6, 182, 212, 0.35))',
                    color: 'var(--accent-cyan, #38bdf8)'
                  }}
                >
                  <Grid size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.10rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', letterSpacing: '-0.02em' }}>
                      Mafs • JSXGraph • Plotly • MathBox Studio 📐
                    </h2>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'var(--pill-active-bg, rgba(6, 182, 212, 0.2))',
                        color: 'var(--pill-active-text, #38bdf8)',
                        border: '1px solid var(--pill-border, rgba(6, 182, 212, 0.4))'
                      }}
                    >
                      BENTO SUITE
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: 'var(--text-muted, #94a3b8)' }}>
                    Interactive mathematical models, 3D WebGL manifolds, ODE flows, and calculus suites
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Live Search Input */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted, #94a3b8)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  className="mathbox-bento-search-input"
                  value={bentoSearchQuery}
                  onChange={(e) => setBentoSearchQuery(e.target.value)}
                  placeholder="Search 11+ models..."
                />
              </div>

              {/* Quick Launch Button */}
              <button
                type="button"
                onClick={() => setViewMode('studio_sheet')}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  background: 'var(--btn-primary-bg, linear-gradient(135deg, #0284c7, #0369a1))',
                  color: 'var(--btn-primary-text, #ffffff)',
                  border: '1px solid var(--card-border, rgba(56, 189, 248, 0.5))',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--card-shadow, 0 4px 12px rgba(2, 132, 199, 0.35))'
                }}
              >
                <span>Launch Active Sheet ({activeMeta.name.split(' ')[0]})</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Category Filter Pills Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '10px',
              marginBottom: '14px',
              flexShrink: 0
            }}
          >
            {[
              { id: 'all', label: `All Models (${STUDIO_MODULES.length})`, icon: Sparkles },
              { id: 'stats_ml', label: '📊 Stats & ML (5)', icon: Activity },
              { id: '2d_geometry', label: '📐 2D Geometry (2)', icon: SplitSquareVertical },
              { id: 'calculus', label: '⚡ Dynamic Calculus (1)', icon: Zap },
              { id: '3d_surfaces', label: '🌌 3D Surfaces & 4D (1)', icon: Box },
              { id: 'vector_fields', label: '🌀 Vector Fields & ODEs (1)', icon: TrendingUp },
              { id: 'sandbox', label: '🧪 Sandbox & Guide (2)', icon: Info }
            ].map((cat) => {
              const isSelected = bentoCategoryFilter === cat.id;
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setBentoCategoryFilter(cat.id)}
                  className={`mathbox-bento-pill ${isSelected ? 'active' : ''}`}
                >
                  <CatIcon size={12} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bento Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: '14px',
              alignItems: 'stretch'
            }}
          >
            {filteredBentoModules.map((module) => {
              const IconComponent = module.icon;
              const isActive = activeModuleId === module.id;

              let themeColor = 'var(--accent-cyan, #38bdf8)';
              if (module.category === 'stats_ml') themeColor = '#38bdf8';
              else if (module.category === '2d_geometry') themeColor = '#34d399';
              else if (module.category === 'calculus') themeColor = '#a855f7';
              else if (module.category === '3d_surfaces') themeColor = '#ec4899';
              else if (module.category === 'vector_fields') themeColor = '#f59e0b';
              else themeColor = '#06b6d4';

              return (
                <div
                  key={module.id}
                  className={`mathbox-bento-card ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveModuleId(module.id);
                    setViewMode('studio_sheet');
                  }}
                >
                  {/* Top Accent Line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)`
                    }}
                  />

                  <div>
                    {/* Header inside Card */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: 'var(--pill-bg, rgba(6, 182, 212, 0.12))',
                          border: '1px solid var(--pill-border, rgba(6, 182, 212, 0.3))',
                          color: themeColor
                        }}
                      >
                        <IconComponent size={18} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: 'var(--pill-bg, rgba(30, 41, 59, 0.8))',
                            color: 'var(--text-muted, #94a3b8)',
                            border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))'
                          }}
                        >
                          {module.framework.split(' ')[0]}
                        </span>
                        {isActive && (
                          <span
                            style={{
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              background: 'var(--pill-active-bg, rgba(6, 182, 212, 0.25))',
                              color: 'var(--pill-active-text, #38bdf8)',
                              border: '1px solid var(--pill-border, rgba(6, 182, 212, 0.5))'
                            }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Badge */}
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '0.94rem', fontWeight: 800, lineHeight: 1.3 }}>
                      {module.name}
                    </h3>

                    <div
                      style={{
                        display: 'inline-block',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'var(--pill-bg, rgba(6, 182, 212, 0.12))',
                        color: themeColor,
                        border: '1px solid var(--pill-border, rgba(6, 182, 212, 0.25))',
                        marginBottom: '8px'
                      }}
                    >
                      {module.badge}
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.72rem',
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {module.description}
                    </p>
                  </div>

                  {/* Card Action Footer */}
                  <div
                    style={{
                      marginTop: '14px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-color, rgba(51, 65, 85, 0.4))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
                      {module.categoryLabel.split(' ')[1] || 'Module'}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModuleId(module.id);
                        setViewMode('studio_sheet');
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: isActive ? 'var(--pill-active-bg, rgba(6, 182, 212, 0.25))' : 'var(--pill-bg, rgba(30, 41, 59, 0.8))',
                        color: isActive ? 'var(--pill-active-text, #38bdf8)' : 'var(--text-primary, #f8fafc)',
                        border: isActive ? '1px solid var(--accent-cyan, #38bdf8)' : '1px solid var(--card-border, rgba(51, 65, 85, 0.7))'
                      }}
                    >
                      <span>Launch Sheet</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════════
           2. PERSONALIZED VISUALIZATION STUDIO SHEET
           ═══════════════════════════════════════════════════════════════════════ */
        <>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setViewMode('bento_hub')}
                style={{
                  height: '32px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--pill-active-bg, rgba(6, 182, 212, 0.22))',
                  color: 'var(--accent-cyan, #38bdf8)',
                  border: '1px solid var(--pill-border, rgba(6, 182, 212, 0.45))',
                  transition: 'all 0.18s ease'
                }}
                title="Return to Bento Box Models Hub"
              >
                <Grid size={14} />
                <span>← Bento Hub</span>
              </button>

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
                  background: 'var(--btn-secondary-bg, rgba(15, 23, 42, 0.85))',
                  color: 'var(--text-primary, #f8fafc)',
                  border: '1px solid var(--card-border, rgba(6, 182, 212, 0.3))',
                  transition: 'all 0.18s ease'
                }}
              >
                {isSidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
                <span>{isSidebarOpen ? 'Hide Deck' : 'Show Deck'}</span>
              </button>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>
                    {activeMeta.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'var(--pill-active-bg, rgba(6, 182, 212, 0.2))',
                      color: 'var(--accent-cyan, #38bdf8)',
                      border: '1px solid var(--pill-border, rgba(6, 182, 212, 0.4))'
                    }}
                  >
                    {activeMeta.badge}
                  </span>
                </div>
              </div>
            </div>

            {/* ─── Teaching & Animation Master Controller ─── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {/* Reset Time Button */}
              <button
                type="button"
                onClick={resetAnimationTime}
                style={{
                  height: '32px',
                  padding: '0 8px',
                  borderRadius: '6px',
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'var(--pill-bg, rgba(30, 41, 59, 0.7))',
                  color: 'var(--text-muted, #94a3b8)',
                  border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))',
                  transition: 'all 0.15s ease'
                }}
                title="Reset animation time to t = 0"
              >
                <RotateCcw size={12} />
                <span>t=0</span>
              </button>

              {/* Manual Step Backward Button (-0.15s) */}
              <button
                type="button"
                onClick={() => stepTime(-0.15)}
                style={{
                  height: '32px',
                  padding: '0 8px',
                  borderRadius: '6px',
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: 'var(--pill-bg, rgba(30, 41, 59, 0.7))',
                  color: '#38bdf8',
                  border: '1px solid var(--card-border, rgba(56, 189, 248, 0.35))',
                  transition: 'all 0.15s ease'
                }}
                title="Step Backward in time (-0.15s) [Slow Teach]"
              >
                <SkipBack size={12} />
                <span>-Step</span>
              </button>

              {/* Live / Paused Playhead */}
              <button
                type="button"
                onClick={() => setIsSimulating(!isSimulating)}
                style={{
                  height: '32px',
                  padding: '0 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: isSimulating ? 'rgba(52, 211, 153, 0.22)' : 'rgba(239, 68, 68, 0.22)',
                  color: isSimulating ? '#34d399' : '#f87171',
                  border: isSimulating ? '1px solid #34d399' : '1px solid #f87171',
                  boxShadow: isSimulating ? '0 0 10px rgba(52, 211, 153, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                title={isSimulating ? 'Pause animation loop for slow teaching' : 'Resume live continuous playback'}
              >
                {isSimulating ? <Pause size={13} /> : <Play size={13} />}
                <span>{isSimulating ? 'Live' : 'Paused'}</span>
              </button>

              {/* Manual Step Forward Button (+0.15s) */}
              <button
                type="button"
                onClick={() => stepTime(0.15)}
                style={{
                  height: '32px',
                  padding: '0 8px',
                  borderRadius: '6px',
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: 'var(--pill-bg, rgba(30, 41, 59, 0.7))',
                  color: '#38bdf8',
                  border: '1px solid var(--card-border, rgba(56, 189, 248, 0.35))',
                  transition: 'all 0.15s ease'
                }}
                title="Step Forward in time (+0.15s) [Slow Teach]"
              >
                <span>+Step</span>
                <SkipForward size={12} />
              </button>

              {/* Speed Preset Selector (Slow Teach vs Normal vs Fast) */}
              <div style={{ display: 'flex', background: 'var(--dropdown-bg, rgba(15, 23, 42, 0.95))', padding: '2px', borderRadius: '6px', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))' }}>
                {[
                  { speed: 0.25, label: '0.25×' },
                  { speed: 0.5, label: '0.5×' },
                  { speed: 1.0, label: '1.0×' }
                ].map(s => {
                  const isSel = Math.abs(animSpeed - s.speed) < 0.05;
                  return (
                    <button
                      key={s.speed}
                      type="button"
                      onClick={() => setAnimSpeed(s.speed)}
                      style={{
                        padding: '3px 6px',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        background: isSel ? 'rgba(56, 189, 248, 0.28)' : 'transparent',
                        color: isSel ? '#38bdf8' : 'var(--text-muted, #94a3b8)',
                        transition: 'all 0.15s ease'
                      }}
                      title={`Set playback speed to ${s.speed}x (Slow Teach)`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {/* Wave Oscillation Toggle */}
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
                  background: isBendingAnim ? 'var(--pill-active-bg, rgba(52, 211, 153, 0.25))' : 'var(--pill-bg, rgba(30, 41, 59, 0.6))',
                  color: isBendingAnim ? 'var(--accent-cyan, #34d399)' : 'var(--text-muted)',
                  border: isBendingAnim ? '1px solid var(--accent-cyan, #34d399)' : '1px solid var(--card-border, rgba(51, 65, 85, 0.6))'
                }}
                title="Toggle Live Parameter Oscillation / Wave Animation"
              >
                <Waves size={13} />
                <span>Wave</span>
              </button>

              {/* 3D Orbit Toggle */}
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
                  background: isAutoOrbit ? 'var(--pill-active-bg, rgba(56, 189, 248, 0.25))' : 'var(--pill-bg, rgba(30, 41, 59, 0.6))',
                  color: isAutoOrbit ? 'var(--accent-cyan, #38bdf8)' : 'var(--text-muted)',
                  border: isAutoOrbit ? '1px solid var(--accent-cyan, #38bdf8)' : '1px solid var(--card-border, rgba(51, 65, 85, 0.6))'
                }}
                title="Toggle 3D Auto-Orbit Animation"
              >
                <Orbit size={13} />
                <span>Orbit</span>
              </button>
            </div>
          </div>

      {/* ─── Main Workspace Flex Layout ─── */}
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
                  activeColor="var(--accent-cyan, #38bdf8)"
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
                      activeColor="var(--accent-cyan, #38bdf8)"
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
                        { id: 'smooth_heatmap', label: '🎨 Heatmap' },
                        { id: 'iso_contours', label: '🗺️ Iso-Contours' },
                        { id: 'boundary_only', label: '⚡ Boundary' }
                      ]}
                      value={log2dVisualMode}
                      onChange={(val) => setLog2dVisualMode(val as any)}
                      columns={3}
                      activeColor="var(--accent-cyan, #38bdf8)"
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
                      activeColor="var(--accent-cyan, #38bdf8)"
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

                {/* Exact Coordinate Placement Box */}
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
                  activeColor="var(--accent-cyan, #38bdf8)"
                />

                {/* 1D Visual Mode Selector (Residual Squares vs 95% CI vs Drop Lines) */}
                {linSubMode === '1d_linear' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                      1D Visual Explainability:
                    </span>
                    <PillSelector
                      options={[
                        { id: 'residual_squares', label: '⏹ Squares (SSE)' },
                        { id: 'confidence_band', label: '📈 95% CI Ribbon' },
                        { id: 'drop_lines', label: '📏 Residuals' }
                      ]}
                      value={lin1dVisualMode}
                      onChange={(val) => setLin1dVisualMode(val as any)}
                      columns={3}
                      activeColor="var(--accent-cyan, #38bdf8)"
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
                    activeColor="var(--accent-cyan, #38bdf8)"
                  />
                </div>

                {/* Live Gradient Descent Simulation Deck */}
                {linSubMode === '1d_linear' && (
                  <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--pill-bg, rgba(30, 41, 59, 0.6))', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #34d399)' }}>
                        ⚡ Gradient Descent Optimizer:
                      </span>
                      <span style={{ fontSize: '0.64rem', fontFamily: 'monospace', color: 'var(--accent-cyan, #f59e0b)' }}>
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
                          background: isGradDescentRunning ? 'rgba(239, 68, 68, 0.25)' : 'var(--pill-active-bg, rgba(6, 182, 212, 0.22))',
                          color: isGradDescentRunning ? '#f87171' : 'var(--accent-cyan, #38bdf8)',
                          border: isGradDescentRunning ? '1px solid #f87171' : '1px solid var(--pill-border, rgba(6, 182, 212, 0.4))',
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
                          background: 'var(--pill-active-bg, rgba(6, 182, 212, 0.22))',
                          color: 'var(--accent-cyan, #38bdf8)',
                          border: '1px solid var(--pill-border, rgba(6, 182, 212, 0.4))',
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

                {/* Add Exact Point at (X, Y) */}
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

            {/* PHASE 1: GAUSSIAN & STUDENT-T CONTROLS */}
            {activeModuleId === 'gaussian_ci' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <PillSelector
                  options={[
                    { id: '1d_pdf_compare', label: '1D PDF Norm vs t' },
                    { id: '1d_cdf', label: '1D CDF S-Curve' },
                    { id: '2d_bivariate', label: '2D Bivariate Heatmap' },
                    { id: '3d_surface', label: '3D Bell Mesh' }
                  ]}
                  value={gaussDimension}
                  onChange={(val) => setGaussDimension(val as any)}
                  columns={2}
                  activeColor="var(--accent-cyan, #38bdf8)"
                />

                {(gaussDimension === '1d_pdf_compare' || gaussDimension === '1d_cdf') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                      Rejection Tail & Area Shading:
                    </span>
                    <PillSelector
                      options={[
                        { id: 'two_tailed', label: 'Two-Tailed (α/2)' },
                        { id: 'left_tailed', label: 'Left Tail' },
                        { id: 'right_tailed', label: 'Right Tail' },
                        { id: 'empirical_bands', label: '68-95-99.7%' }
                      ]}
                      value={gaussTailMode}
                      onChange={(val) => setGaussTailMode(val as any)}
                      columns={2}
                      activeColor="var(--accent-cyan, #38bdf8)"
                    />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                    Confidence Level:
                  </span>
                  <PillSelector
                    options={[
                      { id: '90', label: '90% (z=1.645)' },
                      { id: '95', label: '95% (z=1.960)' },
                      { id: '99', label: '99% (z=2.576)' }
                    ]}
                    value={String(ciConfidence)}
                    onChange={(val) => setCiConfidence(parseInt(val, 10) as 90 | 95 | 99)}
                    columns={3}
                    activeColor="var(--accent-cyan, #38bdf8)"
                  />
                </div>

                <DualParamControl label="Mean (μ):" value={gaussMean} min={-3.0} max={3.0} step={0.1} onChange={setGaussMean} color="#38bdf8" />
                <DualParamControl label="Standard Deviation (σ):" value={gaussStd} min={0.2} max={3.0} step={0.1} onChange={setGaussStd} color="#34d399" />

                {gaussDimension === '1d_pdf_compare' && (
                  <DualParamControl
                    label="Student-t Degrees of Freedom (ν):"
                    value={activeNu}
                    min={1}
                    max={30}
                    step={1}
                    precision={0}
                    onChange={(val) => {
                      setStudentNu(val);
                      setIsBendingAnim(false);
                    }}
                    color="#f59e0b"
                  />
                )}

                {(gaussDimension === '2d_bivariate' || gaussDimension === '3d_surface') && (
                  <DualParamControl
                    label="Correlation Coefficient (ρ):"
                    value={activeRho}
                    min={-0.95}
                    max={0.95}
                    step={0.05}
                    onChange={(val) => {
                      setBivariateRho(val);
                      setIsBendingAnim(false);
                    }}
                    color="#ec4899"
                  />
                )}

                <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--pill-bg, rgba(30, 41, 59, 0.6))', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                    Inspect Test Value x₀:
                  </span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={injectGaussX0}
                      step={0.1}
                      onChange={(e) => setInjectGaussX0(parseFloat(e.target.value) || 0)}
                      placeholder="x0"
                      style={{ flex: 1, padding: '4px', textAlign: 'center', borderRadius: '4px', background: 'var(--dropdown-bg, #1e293b)', color: 'var(--text-primary, #f8fafc)', border: '1px solid var(--card-border, #334155)', fontSize: '0.72rem' }}
                    />
                    <div style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: 'var(--accent-cyan, #34d399)', fontWeight: 800 }}>
                      Z = {((injectGaussX0 - gaussMean) / gaussStd).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--pill-bg, rgba(30, 41, 59, 0.6))', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #34d399)' }}>
                      🎲 CLT Sampling Generator:
                    </span>
                    <span style={{ fontSize: '0.64rem', color: '#f59e0b', fontFamily: 'monospace' }}>
                      Draws: {cltSamples.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={drawCltSamples}
                      style={{
                        flex: 1,
                        padding: '5px 8px',
                        borderRadius: '4px',
                        background: 'var(--pill-active-bg, rgba(6, 182, 212, 0.22))',
                        color: 'var(--accent-cyan, #38bdf8)',
                        border: '1px solid var(--pill-border, rgba(6, 182, 212, 0.4))',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Dice5 size={12} />
                      <span>Draw 15 Samples</span>
                    </button>
                    {cltSamples.length > 0 && (
                      <button
                        type="button"
                        onClick={resetCltSamples}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '4px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PHASE 2: SUPPORT VECTOR CLASSIFIER CONTROLS */}
            {activeModuleId === 'svc_classifier' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <PillSelector
                  options={[
                    { id: '2d_margin', label: '2D Hyperplane' },
                    { id: '1d_line', label: '1D Threshold' },
                    { id: '3d_plane', label: '3D Plane' }
                  ]}
                  value={svcDimension}
                  onChange={(val) => setSvcDimension(val as any)}
                  columns={3}
                  activeColor="var(--accent-cyan, #38bdf8)"
                />

                <PillSelector
                  options={[
                    { id: 'linear', label: 'Linear' },
                    { id: 'rbf', label: 'RBF (Gaussian)' },
                    { id: 'poly', label: 'Polynomial' }
                  ]}
                  value={svcKernel}
                  onChange={(val) => setSvcKernel(val as any)}
                  columns={3}
                  activeColor="var(--accent-cyan, #38bdf8)"
                />

                <DualParamControl label="Margin Width (2/||w||):" value={svcMarginW} min={0.4} max={3.0} step={0.1} onChange={setSvcMarginW} color="#34d399" />
                <DualParamControl label="Box Constraint (C):" value={svcC} min={0.1} max={10.0} step={0.1} onChange={setSvcC} color="#f59e0b" />
                <DualParamControl label="Bias (b):" value={svcBiasB} min={-3.0} max={3.0} step={0.1} onChange={setSvcBiasB} color="#38bdf8" />

                {svcKernel === 'rbf' && (
                  <DualParamControl label="RBF Gamma (γ):" value={svcGamma} min={0.1} max={4.0} step={0.1} onChange={setSvcGamma} color="#ec4899" />
                )}

                {svcKernel === 'poly' && (
                  <DualParamControl label="Poly Degree (d):" value={svcPolyDegree} min={2} max={4} step={1} precision={0} onChange={setSvcPolyDegree} color="#a855f7" />
                )}

                {/* Per-Class Sample Points Stepper */}
                <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--dropdown-bg, #0b1120)', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem' }}>
                    <span style={{ color: '#34d399', fontWeight: 800 }}>Class +1 (Green):</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button type="button" onClick={() => adjustSvcClassCount(1, -1)} style={{ width: '20px', height: '20px', borderRadius: '3px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)', cursor: 'pointer' }}>-</button>
                      <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 800 }}>{svcPoints.filter(p => p.label === 1).length}</span>
                      <button type="button" onClick={() => adjustSvcClassCount(1, 1)} style={{ width: '20px', height: '20px', borderRadius: '3px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem' }}>
                    <span style={{ color: '#f87171', fontWeight: 800 }}>Class -1 (Red):</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button type="button" onClick={() => adjustSvcClassCount(-1, -1)} style={{ width: '20px', height: '20px', borderRadius: '3px', background: 'rgba(248, 113, 113, 0.2)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.4)', cursor: 'pointer' }}>-</button>
                      <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 800 }}>{svcPoints.filter(p => p.label === -1).length}</span>
                      <button type="button" onClick={() => adjustSvcClassCount(-1, 1)} style={{ width: '20px', height: '20px', borderRadius: '3px', background: 'rgba(248, 113, 113, 0.2)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.4)', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                </div>

                {/* Add Custom Point */}
                <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--dropdown-bg, #0b1120)', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                    Add Sample Point (X₁, X₂):
                  </span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input type="number" value={injectSvcX1} step={0.1} onChange={(e) => setInjectSvcX1(parseFloat(e.target.value) || 0)} placeholder="X1" style={{ flex: 1, minWidth: '35px', padding: '4px', textAlign: 'center', borderRadius: '4px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', fontSize: '0.66rem' }} />
                    <input type="number" value={injectSvcX2} step={0.1} onChange={(e) => setInjectSvcX2(parseFloat(e.target.value) || 0)} placeholder="X2" style={{ flex: 1, minWidth: '35px', padding: '4px', textAlign: 'center', borderRadius: '4px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', fontSize: '0.66rem' }} />
                    <button type="button" onClick={() => setInjectSvcClass(prev => prev === 1 ? -1 : 1)} style={{ padding: '4px 6px', borderRadius: '4px', background: injectSvcClass === 1 ? 'rgba(52, 211, 153, 0.25)' : 'rgba(248, 113, 113, 0.25)', color: injectSvcClass === 1 ? '#34d399' : '#f87171', border: '1px solid var(--card-border)', fontSize: '0.66rem', fontWeight: 800, cursor: 'pointer' }}>
                      {injectSvcClass === 1 ? '+1' : '-1'}
                    </button>
                    <button type="button" onClick={handleInjectSvcPoint} style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--pill-active-bg, rgba(6, 182, 212, 0.3))', color: 'var(--accent-cyan, #38bdf8)', border: '1px solid var(--pill-border)', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}>+ Add</button>
                  </div>
                </div>

                {/* Expandable Points Inspector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setIsSvcPointsListOpen(!isSvcPointsListOpen)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--pill-bg, rgba(30, 41, 59, 0.6))',
                      color: 'var(--accent-cyan, #38bdf8)',
                      border: '1px solid var(--card-border)'
                    }}
                  >
                    <span>Inspect Sample Points ({svcPoints.length})</span>
                    {isSvcPointsListOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {isSvcPointsListOpen && (
                    <div style={{ maxHeight: '110px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px', padding: '4px', background: 'var(--dropdown-bg, #0b1120)', borderRadius: '4px', border: '1px solid var(--card-border)' }}>
                      {svcAnalysis.pointsWithStatus.map((p, idx) => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.64rem', padding: '2px 4px', borderBottom: '1px solid rgba(30, 41, 59, 0.5)' }}>
                          <span style={{ color: p.label === 1 ? '#34d399' : '#f87171' }}>
                            #{idx + 1}: ({p.x1}, {p.x2}) [y={p.label > 0 ? '+1' : '-1'}] {p.isSupportVector ? '★ SV' : ''}
                          </span>
                          <button type="button" onClick={() => removeSvcPoint(p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Support Vector Telemetry */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', borderRadius: '6px', background: 'var(--dropdown-bg, #0b1120)', border: '1px solid var(--card-border)', fontSize: '0.70rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Support Vectors (α &gt; 0):</span>
                    <span style={{ color: '#fbbf24', fontWeight: 800 }}>{svcAnalysis.supportVectorCount} / {svcPoints.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Margin Violators:</span>
                    <span style={{ color: '#f87171', fontWeight: 800 }}>{svcAnalysis.marginViolatorCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Slack Penalty Σ ξᵢ:</span>
                    <span style={{ color: 'var(--accent-cyan, #38bdf8)', fontWeight: 800 }}>{svcAnalysis.totalSlack.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* PHASE 2: SUPPORT VECTOR REGRESSOR CONTROLS */}
            {activeModuleId === 'svr_regressor' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <DualParamControl label="Tube Width (ε):" value={svrEpsilon} min={0.05} max={1.5} step={0.05} onChange={setSvrEpsilon} color="#38bdf8" />
                <DualParamControl label="Slope (m):" value={svrSlopeM} min={-2.5} max={2.5} step={0.05} onChange={setSvrSlopeM} color="#34d399" />
                <DualParamControl label="Intercept (c):" value={svrInterceptC} min={-2.0} max={2.0} step={0.05} onChange={setSvrInterceptC} color="#ec4899" />
                <DualParamControl label="Box Constraint (C):" value={svrC} min={0.1} max={10.0} step={0.1} onChange={setSvrC} color="#f59e0b" />

                {/* SVR Sample Points Count Stepper */}
                <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--dropdown-bg, #0b1120)', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.70rem' }}>
                  <span style={{ color: 'var(--accent-cyan, #38bdf8)', fontWeight: 800 }}>Sample Points Count:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button type="button" onClick={() => adjustSvrPointsCount(-1)} style={{ width: '20px', height: '20px', borderRadius: '3px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', cursor: 'pointer' }}>-</button>
                    <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 800 }}>{svrPoints.length}</span>
                    <button type="button" onClick={() => adjustSvrPointsCount(1)} style={{ width: '20px', height: '20px', borderRadius: '3px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', cursor: 'pointer' }}>+</button>
                  </div>
                </div>

                {/* Add Custom Point */}
                <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--dropdown-bg, #0b1120)', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                    Add Sample Point (X, Y):
                  </span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input type="number" value={injectSvrX} step={0.1} onChange={(e) => setInjectSvrX(parseFloat(e.target.value) || 0)} placeholder="X" style={{ flex: 1, minWidth: '40px', padding: '4px', textAlign: 'center', borderRadius: '4px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', fontSize: '0.66rem' }} />
                    <input type="number" value={injectSvrY} step={0.1} onChange={(e) => setInjectSvrY(parseFloat(e.target.value) || 0)} placeholder="Y" style={{ flex: 1, minWidth: '40px', padding: '4px', textAlign: 'center', borderRadius: '4px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', fontSize: '0.66rem' }} />
                    <button type="button" onClick={handleInjectSvrPoint} style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--pill-active-bg, rgba(6, 182, 212, 0.3))', color: 'var(--accent-cyan, #38bdf8)', border: '1px solid var(--pill-border)', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}>+ Add</button>
                  </div>
                </div>

                {/* Expandable Points Inspector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setIsSvrPointsListOpen(!isSvrPointsListOpen)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--pill-bg, rgba(30, 41, 59, 0.6))',
                      color: 'var(--accent-cyan, #38bdf8)',
                      border: '1px solid var(--card-border)'
                    }}
                  >
                    <span>Inspect Sample Points ({svrPoints.length})</span>
                    {isSvrPointsListOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {isSvrPointsListOpen && (
                    <div style={{ maxHeight: '110px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px', padding: '4px', background: 'var(--dropdown-bg, #0b1120)', borderRadius: '4px', border: '1px solid var(--card-border)' }}>
                      {svrAnalysis.pointsWithStatus.map((p, idx) => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.64rem', padding: '2px 4px', borderBottom: '1px solid rgba(30, 41, 59, 0.5)' }}>
                          <span style={{ color: p.isOutsideTube ? '#f87171' : '#38bdf8' }}>
                            #{idx + 1}: (X: {p.x}, Y: {p.y}) {p.isOutsideTube ? `[ξ=${p.slack.toFixed(2)}]` : '[Inside Tube]'}
                          </span>
                          <button type="button" onClick={() => removeSvrPoint(p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SVR Telemetry */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', borderRadius: '6px', background: 'var(--dropdown-bg, #0b1120)', border: '1px solid var(--card-border)', fontSize: '0.70rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Inside ε-Tube (Zero Loss):</span>
                    <span style={{ color: '#34d399', fontWeight: 800 }}>{svrPoints.length - svrAnalysis.svCount} / {svrPoints.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Active Support Vectors (ξ &gt; 0):</span>
                    <span style={{ color: '#fbbf24', fontWeight: 800 }}>{svrAnalysis.svCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Slack Loss Σ ξᵢ:</span>
                    <span style={{ color: '#ec4899', fontWeight: 800 }}>{svrAnalysis.totalSlack.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* PHASE 3: MULTI-LINE CONTROLS */}
            {activeModuleId === 'multi_line_intersections' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 1. Problem Presets Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Problem Preset:</span>
                  <PillSelector
                    options={[
                      { id: 'custom', label: 'Custom' },
                      { id: 'resource_allocation', label: 'Factory LP' },
                      { id: 'triangle_orthocenter', label: 'Orthocenter' },
                      { id: 'least_squares', label: 'Least Sq' },
                      { id: 'optical_reflections', label: 'Optics' }
                    ]}
                    value={linePreset}
                    onChange={(val) => applyLinePreset(val as any)}
                    columns={3}
                    activeColor="var(--accent-cyan, #38bdf8)"
                  />
                </div>

                {/* 2. Mode Selector */}
                <PillSelector
                  options={[
                    { id: '2d_systems', label: '2D Systems' },
                    { id: 'feasible_polygon', label: 'Feasible Region (LP)' }
                  ]}
                  value={lineMode}
                  onChange={(val) => setLineMode(val as any)}
                  columns={2}
                  activeColor="var(--accent-cyan, #38bdf8)"
                />

                {/* 2b. Quick Layer Visibility Toggles */}
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'space-between', background: 'var(--dropdown-bg, #0b1120)', padding: '4px 8px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)' }}>VIEW LAYERS:</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {lineMode === '2d_systems' && (
                      <button
                        type="button"
                        onClick={() => setShowAngleBadges(prev => !prev)}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.60rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: showAngleBadges ? 'rgba(56, 189, 248, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                          color: showAngleBadges ? '#38bdf8' : 'var(--text-muted)',
                          border: showAngleBadges ? '1px solid #38bdf8' : '1px solid var(--card-border)'
                        }}
                      >
                        📐 θ Angles {showAngleBadges ? 'ON' : 'OFF'}
                      </button>
                    )}
                    {lineMode === 'feasible_polygon' && (
                      <button
                        type="button"
                        onClick={() => setShowVertexPills(prev => !prev)}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.60rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: showVertexPills ? 'rgba(52, 211, 153, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                          color: showVertexPills ? '#34d399' : 'var(--text-muted)',
                          border: showVertexPills ? '1px solid #34d399' : '1px solid var(--card-border)'
                        }}
                      >
                        🏷️ Vertices {showVertexPills ? 'ON' : 'OFF'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowLineLabels(prev => !prev)}
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.60rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: showLineLabels ? 'rgba(245, 158, 11, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                        color: showLineLabels ? '#f59e0b' : 'var(--text-muted)',
                        border: showLineLabels ? '1px solid #f59e0b' : '1px solid var(--card-border)'
                      }}
                    >
                      Lines {showLineLabels ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* 3. Equation Form & LaTeX Copier Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--dropdown-bg, #0b1120)', padding: '4px 8px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setEquationForm('slope_intercept')}
                      style={{
                        padding: '2px 5px',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        borderRadius: '3px',
                        cursor: 'pointer',
                        background: equationForm === 'slope_intercept' ? 'var(--pill-active-bg, rgba(56, 189, 248, 0.25))' : 'transparent',
                        color: equationForm === 'slope_intercept' ? 'var(--accent-cyan, #38bdf8)' : 'var(--text-muted)',
                        border: 'none'
                      }}
                    >
                      y=mx+c
                    </button>
                    <button
                      type="button"
                      onClick={() => setEquationForm('general_form')}
                      style={{
                        padding: '2px 5px',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        borderRadius: '3px',
                        cursor: 'pointer',
                        background: equationForm === 'general_form' ? 'var(--pill-active-bg, rgba(56, 189, 248, 0.25))' : 'transparent',
                        color: equationForm === 'general_form' ? 'var(--accent-cyan, #38bdf8)' : 'var(--text-muted)',
                        border: 'none'
                      }}
                    >
                      Ax+By=C
                    </button>
                    <button
                      type="button"
                      onClick={() => setEquationForm('normal_form')}
                      style={{
                        padding: '2px 5px',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        borderRadius: '3px',
                        cursor: 'pointer',
                        background: equationForm === 'normal_form' ? 'var(--pill-active-bg, rgba(56, 189, 248, 0.25))' : 'transparent',
                        color: equationForm === 'normal_form' ? 'var(--accent-cyan, #38bdf8)' : 'var(--text-muted)',
                        border: 'none'
                      }}
                    >
                      n·r=p
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={copyLatexSystem}
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: copiedLatexFeedback ? 'rgba(52, 211, 153, 0.3)' : 'rgba(51, 65, 85, 0.6)',
                      color: copiedLatexFeedback ? '#34d399' : 'var(--text-primary)',
                      border: '1px solid var(--card-border)'
                    }}
                  >
                    <span>{copiedLatexFeedback ? '✓ Copied' : 'Copy LaTeX'}</span>
                  </button>
                </div>

                {/* LINEAR PROGRAMMING OBJECTIVE FUNCTION, SIMPLEX STEPPER & TELEMETRY */}
                {lineMode === 'feasible_polygon' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', borderRadius: '8px', background: 'var(--pill-bg, rgba(30, 41, 59, 0.6))', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-cyan, #34d399)' }}>
                        🎯 Objective Function Z:
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setLpMaximize(true)}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            background: lpMaximize ? 'var(--pill-active-bg, rgba(52, 211, 153, 0.25))' : 'transparent',
                            color: lpMaximize ? 'var(--accent-cyan, #34d399)' : 'var(--text-muted)',
                            border: lpMaximize ? '1px solid var(--accent-cyan, #34d399)' : '1px solid var(--card-border)'
                          }}
                        >
                          Max Z
                        </button>
                        <button
                          type="button"
                          onClick={() => setLpMaximize(false)}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            background: !lpMaximize ? 'var(--pill-active-bg, rgba(236, 72, 153, 0.25))' : 'transparent',
                            color: !lpMaximize ? '#ec4899' : 'var(--text-muted)',
                            border: !lpMaximize ? '1px solid #ec4899' : '1px solid var(--card-border)'
                          }}
                        >
                          Min Z
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.70rem', fontFamily: 'monospace', color: 'var(--text-primary, #f8fafc)', background: 'var(--dropdown-bg, #0b1120)', padding: '4px 8px', borderRadius: '4px' }}>
                      Z = {lpObjCx.toFixed(1)}·x + {lpObjCy.toFixed(1)}·y
                    </div>

                    <DualParamControl label="Weight c_x:" value={lpObjCx} min={-3.0} max={3.0} step={0.1} onChange={setLpObjCx} color="#38bdf8" />
                    <DualParamControl label="Weight c_y:" value={lpObjCy} min={-3.0} max={3.0} step={0.1} onChange={setLpObjCy} color="#34d399" />

                    {/* Step-by-Step Simplex Vertex-Walking Stepper */}
                    {feasiblePolygon.vertices.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '6px', borderRadius: '6px', background: 'var(--dropdown-bg, #0b1120)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                            🚶 Simplex Pivot Stepper:
                          </span>
                          <span style={{ fontSize: '0.64rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            Vertex {((simplexStepIdx % feasiblePolygon.vertices.length) + 1)} / {feasiblePolygon.vertices.length}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'space-between' }}>
                          <button
                            type="button"
                            onClick={() => setSimplexStepIdx(prev => (prev - 1 + feasiblePolygon.vertices.length) % feasiblePolygon.vertices.length)}
                            style={{ padding: '2px 8px', fontSize: '0.66rem', borderRadius: '3px', background: 'rgba(51, 65, 85, 0.8)', color: '#ffffff', border: 'none', cursor: 'pointer' }}
                          >
                            ◀ Prev Pivot
                          </button>
                          {(() => {
                            const curV = feasiblePolygon.vertices[simplexStepIdx % feasiblePolygon.vertices.length];
                            const curZ = lpObjCx * curV.x + lpObjCy * curV.y;
                            return (
                              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>
                                Z = {curZ.toFixed(2)}
                              </span>
                            );
                          })()}
                          <button
                            type="button"
                            onClick={() => setSimplexStepIdx(prev => (prev + 1) % feasiblePolygon.vertices.length)}
                            style={{ padding: '2px 8px', fontSize: '0.66rem', borderRadius: '3px', background: 'var(--pill-active-bg, rgba(6, 182, 212, 0.3))', color: 'var(--accent-cyan, #38bdf8)', border: '1px solid var(--pill-border)', cursor: 'pointer' }}
                          >
                            Next Pivot ▶
                          </button>
                        </div>
                      </div>
                    )}

                    {/* LP Solution Summary */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '6px', borderTop: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', fontSize: '0.70rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Feasible Area:</span>
                        <span style={{ color: 'var(--accent-cyan, #38bdf8)', fontWeight: 800 }}>{feasiblePolygon.area.toFixed(2)} sq units</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Corner Vertices:</span>
                        <span style={{ color: '#f59e0b', fontWeight: 800 }}>{feasiblePolygon.vertices.length} vertices</span>
                      </div>
                      {feasiblePolygon.optimalVertex && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(52, 211, 153, 0.15)', padding: '4px 6px', borderRadius: '4px' }}>
                          <span style={{ color: 'var(--accent-cyan, #34d399)', fontWeight: 800 }}>Optimal {lpMaximize ? 'Max' : 'Min'} Z*:</span>
                          <span style={{ color: 'var(--accent-cyan, #34d399)', fontWeight: 800, fontFamily: 'monospace' }}>
                            {feasiblePolygon.optimalVertex.z.toFixed(2)} at ({feasiblePolygon.optimalVertex.x.toFixed(2)}, {feasiblePolygon.optimalVertex.y.toFixed(2)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* 2D LINEAR SYSTEMS MATRIX, LEAST SQUARES & CRAMER'S TELEMETRY */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', borderRadius: '8px', background: 'var(--pill-bg, rgba(30, 41, 59, 0.6))', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', fontSize: '0.70rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                        🔢 Linear System Matrix Analysis:
                      </span>
                      <span style={{ fontSize: '0.64rem', fontFamily: 'monospace', color: '#f59e0b' }}>
                        Intersections: {lineIntersections.length}
                      </span>
                    </div>

                    {dynamicLines.length >= 2 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--dropdown-bg, #0b1120)', padding: '5px 8px', borderRadius: '4px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>System Det |A| (L1 vs L2):</span>
                        <span style={{ fontWeight: 800, fontFamily: 'monospace', color: Math.abs(dynamicLines[1].m - dynamicLines[0].m) < 0.05 ? '#f87171' : 'var(--accent-cyan, #34d399)' }}>
                          {(dynamicLines[1].m - dynamicLines[0].m).toFixed(2)} {Math.abs(dynamicLines[1].m - dynamicLines[0].m) < 0.05 ? '(Singular/Parallel)' : '(Non-Singular)'}
                        </span>
                      </div>
                    )}

                    {/* Overdetermined Least Squares Pseudo-Inverse Card */}
                    {leastSquaresEstimate && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', background: 'rgba(168, 85, 247, 0.14)', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '5px 8px', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#c084fc', fontWeight: 800 }}>Least Squares Solution P_LS:</span>
                          <span style={{ color: '#c084fc', fontWeight: 800, fontFamily: 'monospace' }}>
                            ({leastSquaresEstimate.x.toFixed(2)}, {leastSquaresEstimate.y.toFixed(2)})
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.64rem' }}>
                          <span>Residual Error Σ d_i²:</span>
                          <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{leastSquaresEstimate.sumSquaredErrors.toFixed(3)}</span>
                        </div>
                      </div>
                    )}

                    {/* Geometric Relation Findings */}
                    {geometricRelations.parallels.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', color: '#f87171', fontSize: '0.66rem' }}>
                        <span>⚡ Parallel Pair:</span>
                        <span>{geometricRelations.parallels.map(p => `${p.lineA} ∥ ${p.lineB} (d=${p.dist.toFixed(2)})`).join(', ')}</span>
                      </div>
                    )}
                    {geometricRelations.orthogonals.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', color: '#34d399', fontSize: '0.66rem' }}>
                        <span>📐 Orthogonal Pair:</span>
                        <span>{geometricRelations.orthogonals.map(p => `${p.lineA} ⊥ ${p.lineB} (90°)`).join(', ')}</span>
                      </div>
                    )}
                    {geometricRelations.concurrents.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', color: '#fbbf24', fontSize: '0.66rem', fontWeight: 800 }}>
                        <span>🎯 3-Line Concurrency at ({geometricRelations.concurrents[0].x.toFixed(2)}, {geometricRelations.concurrents[0].y.toFixed(2)})</span>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Active Lines ({lines.length}/6):</span>
                  <button
                    type="button"
                    onClick={addLine}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'var(--pill-active-bg, rgba(6, 182, 212, 0.22))',
                      color: 'var(--accent-cyan, #38bdf8)',
                      border: '1px solid var(--pill-border, rgba(6, 182, 212, 0.4))'
                    }}
                  >
                    <PlusCircle size={11} />
                    <span>+ Add Line</span>
                  </button>
                </div>

                {lines.map((line) => {
                  const formattedEq = (() => {
                    if (line.isVertical) {
                      return `x ${lineMode === 'feasible_polygon' ? (line.ineq === 'le' ? '≤' : '≥') : '='} ${(line.xVal ?? 0).toFixed(2)}`;
                    }
                    if (equationForm === 'general_form') {
                      const aVal = -line.m;
                      const signA = aVal >= 0 ? '' : '-';
                      return `${signA}${Math.abs(aVal).toFixed(2)}x + y = ${line.c.toFixed(2)}`;
                    }
                    if (equationForm === 'normal_form') {
                      const len = Math.sqrt(line.m * line.m + 1);
                      return `n=(${-line.m / len >= 0 ? '+' : ''}${(-line.m / len).toFixed(2)}, ${(1 / len).toFixed(2)}) p=${(line.c / len).toFixed(2)}`;
                    }
                    return `y ${lineMode === 'feasible_polygon' ? (line.ineq === 'le' ? '≤' : '≥') : '='} ${line.m.toFixed(2)}x ${line.c >= 0 ? `+ ${line.c.toFixed(2)}` : `- ${Math.abs(line.c).toFixed(2)}`}`;
                  })();

                  return (
                    <div key={line.id} style={{ padding: '8px', borderRadius: '6px', background: 'var(--pill-bg, rgba(30, 41, 59, 0.6))', border: `1px solid ${line.color}40`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: line.color }}>
                          {line.label}: {formattedEq}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {lineMode === 'feasible_polygon' && (
                            <button
                              type="button"
                              onClick={() => setLines(prev => prev.map(l => l.id === line.id ? { ...l, ineq: l.ineq === 'le' ? 'ge' : 'le' } : l))}
                              style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.64rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                background: line.ineq === 'le' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(236, 72, 153, 0.2)',
                                color: line.ineq === 'le' ? '#38bdf8' : '#ec4899',
                                border: `1px solid ${line.ineq === 'le' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(236, 72, 153, 0.4)'}`
                              }}
                              title="Toggle Inequality Direction"
                            >
                              {line.isVertical ? (line.ineq === 'le' ? 'x ≤ x₀' : 'x ≥ x₀') : (line.ineq === 'le' ? 'y ≤ mx+c' : 'y ≥ mx+c')}
                            </button>
                          )}
                          {lines.length > 1 && (
                            <button type="button" onClick={() => removeLine(line.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      {line.isVertical ? (
                        <DualParamControl label="Vertical Bound (x₀):" value={line.xVal ?? 0} min={-4.0} max={4.0} step={0.1} onChange={(val) => setLines(prev => prev.map(l => l.id === line.id ? { ...l, xVal: val } : l))} color={line.color} />
                      ) : (
                        <>
                          <DualParamControl label="Slope (m):" value={line.m} min={-4.0} max={4.0} step={0.1} onChange={(val) => setLines(prev => prev.map(l => l.id === line.id ? { ...l, m: val } : l))} color={line.color} />
                          <DualParamControl label="Intercept (c):" value={line.c} min={-4.0} max={4.0} step={0.1} onChange={(val) => setLines(prev => prev.map(l => l.id === line.id ? { ...l, c: val } : l))} color={line.color} />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* PHASE 4: FOURIER & VECTOR SPACE CONTROLS */}
            {activeModuleId === 'mafs_curves' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <PillSelector
                  options={[
                    { id: 'time_domain', label: 'Waveform Synthesis' },
                    { id: 'epicycles', label: 'Rotating Epicycles' },
                    { id: 'vector_basis', label: '2D Matrix Transform' }
                  ]}
                  value={fourierMode}
                  onChange={(val) => setFourierMode(val as any)}
                  columns={3}
                  activeColor="var(--accent-cyan, #38bdf8)"
                />

                {fourierMode !== 'vector_basis' ? (
                  <>
                    <PillSelector
                      options={[
                        { id: 'square', label: 'Square Wave' },
                        { id: 'sawtooth', label: 'Sawtooth' },
                        { id: 'triangle', label: 'Triangle' }
                      ]}
                      value={fourierWaveType}
                      onChange={(val) => setFourierWaveType(val as any)}
                      columns={3}
                      activeColor="var(--accent-cyan, #38bdf8)"
                    />

                    <DualParamControl label="Harmonic Terms (N):" value={fourierHarmonics} min={1} max={16} step={1} precision={0} onChange={setFourierHarmonics} color="#a855f7" />
                    <DualParamControl label="Wave Speed (ω):" value={fourierWaveSpeed} min={0.2} max={3.0} step={0.1} onChange={setFourierWaveSpeed} color="#38bdf8" />

                    {/* Layer Visibility Toggles */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'space-between', background: 'var(--dropdown-bg, #0b1120)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))' }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)' }}>LAYERS:</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setShowIndividualHarmonics(prev => !prev)}
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.60rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            background: showIndividualHarmonics ? 'rgba(56, 189, 248, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                            color: showIndividualHarmonics ? '#38bdf8' : 'var(--text-muted)',
                            border: showIndividualHarmonics ? '1px solid #38bdf8' : '1px solid var(--card-border)'
                          }}
                        >
                          Harmonics {showIndividualHarmonics ? 'ON' : 'OFF'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowIdealTargetWave(prev => !prev)}
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.60rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            background: showIdealTargetWave ? 'rgba(52, 211, 153, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                            color: showIdealTargetWave ? '#34d399' : 'var(--text-muted)',
                            border: showIdealTargetWave ? '1px solid #34d399' : '1px solid var(--card-border)'
                          }}
                        >
                          Target {showIdealTargetWave ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>

                    {/* Mathematical Formula & Telemetry Card */}
                    <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--dropdown-bg, #0b1120)', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#a855f7' }}>
                        Active Fourier Series:
                      </div>
                      <div style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: '#f8fafc', background: 'rgba(15, 23, 42, 0.8)', padding: '4px 6px', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                        {fourierWaveType === 'square' && `S_N(x) = Σ_{n=1}^${fourierHarmonics} [4/((2n-1)π)] · sin((2n-1)x)`}
                        {fourierWaveType === 'sawtooth' && `S_N(x) = Σ_{n=1}^${fourierHarmonics} [2/(nπ)] · (-1)^{n+1} · sin(nx)`}
                        {fourierWaveType === 'triangle' && `S_N(x) = Σ_{n=1}^${fourierHarmonics} [8/((2n-1)π)²] · (-1)^{n-1} · sin((2n-1)x)`}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-muted)' }}>
                        <span>L₂ RMS Error:</span>
                        <span style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 800 }}>{fourierTelemetry.rmsError.toFixed(4)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-muted)' }}>
                        <span>Harmonic Decay Rate:</span>
                        <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 800 }}>{fourierTelemetry.decayRate}</span>
                      </div>
                      {fourierTelemetry.gibbsOvershootPct > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: '#fbbf24' }}>
                          <span>Gibbs Overshoot:</span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>+{fourierTelemetry.gibbsOvershootPct}%</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Matrix Transformation Quick Presets */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--text-muted)' }}>QUICK TRANSFORMATION PRESETS:</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {[
                          { label: 'Identity', a: 1.0, b: 0.0, c: 0.0, d: 1.0 },
                          { label: 'Rotate 45°', a: 0.71, b: -0.71, c: 0.71, d: 0.71 },
                          { label: 'Shear X', a: 1.0, b: 1.2, c: 0.0, d: 1.0 },
                          { label: 'Scaling', a: 1.5, b: 0.0, c: 0.0, d: 0.7 },
                          { label: 'Singular (0)', a: 1.2, b: 0.8, c: 0.6, d: 0.4 },
                          { label: 'Reflect Y', a: -1.0, b: 0.0, c: 0.0, d: 1.0 }
                        ].map((pr, pIdx) => (
                          <button
                            key={`pr-${pIdx}`}
                            type="button"
                            onClick={() => {
                              setMatrixA(pr.a);
                              setMatrixB(pr.b);
                              setMatrixC(pr.c);
                              setMatrixD(pr.d);
                            }}
                            style={{
                              padding: '4px',
                              borderRadius: '4px',
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              background: 'var(--dropdown-bg, #0b1120)',
                              color: 'var(--text-primary, #f8fafc)',
                              border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))',
                              textAlign: 'center'
                            }}
                          >
                            {pr.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Matrix Slider Inputs */}
                    <DualParamControl label="a (T î_x):" value={matrixA} min={-2.0} max={2.0} step={0.1} onChange={setMatrixA} color="#34d399" />
                    <DualParamControl label="b (T ĵ_x):" value={matrixB} min={-2.0} max={2.0} step={0.1} onChange={setMatrixB} color="#38bdf8" />
                    <DualParamControl label="c (T î_y):" value={matrixC} min={-2.0} max={2.0} step={0.1} onChange={setMatrixC} color="#f59e0b" />
                    <DualParamControl label="d (T ĵ_y):" value={matrixD} min={-2.0} max={2.0} step={0.1} onChange={setMatrixD} color="#ec4899" />

                    {/* Layer Visibility Toggles */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'space-between', background: 'var(--dropdown-bg, #0b1120)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))' }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)' }}>LAYERS:</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setShowTransformedGrid(prev => !prev)}
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.60rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            background: showTransformedGrid ? 'rgba(56, 189, 248, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                            color: showTransformedGrid ? '#38bdf8' : 'var(--text-muted)',
                            border: showTransformedGrid ? '1px solid #38bdf8' : '1px solid var(--card-border)'
                          }}
                        >
                          Grid {showTransformedGrid ? 'ON' : 'OFF'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeformationEllipse(prev => !prev)}
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.60rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            background: showDeformationEllipse ? 'rgba(52, 211, 153, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                            color: showDeformationEllipse ? '#34d399' : 'var(--text-muted)',
                            border: showDeformationEllipse ? '1px solid #34d399' : '1px solid var(--card-border)'
                          }}
                        >
                          Ellipse {showDeformationEllipse ? 'ON' : 'OFF'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEigenvectors(prev => !prev)}
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.60rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            background: showEigenvectors ? 'rgba(251, 191, 36, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                            color: showEigenvectors ? '#fbbf24' : 'var(--text-muted)',
                            border: showEigenvectors ? '1px solid #fbbf24' : '1px solid var(--card-border)'
                          }}
                        >
                          Eigen {showEigenvectors ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>

                    {/* Matrix Math & Eigensystem Card */}
                    <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--dropdown-bg, #0b1120)', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>Matrix Analysis:</span>
                        <span style={{ fontSize: '0.60rem', fontWeight: 800, padding: '1px 6px', borderRadius: '3px', background: matrixAnalysis.isSingular ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)', color: matrixAnalysis.isSingular ? '#f87171' : '#38bdf8' }}>
                          {matrixAnalysis.classification}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-muted)' }}>
                        <span>Determinant det(T):</span>
                        <span style={{ color: matrixAnalysis.det < 0 ? '#f87171' : matrixAnalysis.isSingular ? '#fbbf24' : '#34d399', fontFamily: 'monospace', fontWeight: 800 }}>
                          {matrixAnalysis.det.toFixed(3)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-muted)' }}>
                        <span>Trace tr(T):</span>
                        <span style={{ color: '#f8fafc', fontFamily: 'monospace', fontWeight: 800 }}>{matrixAnalysis.trace.toFixed(3)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-muted)' }}>
                        <span>Eigenvalues (λ₁, λ₂):</span>
                        <span style={{ color: matrixAnalysis.eigenvalues.length > 0 ? '#fbbf24' : '#94a3b8', fontFamily: 'monospace', fontWeight: 800 }}>
                          {matrixAnalysis.eigenvalues.length > 0
                            ? matrixAnalysis.eigenvalues.map(v => v.toFixed(2)).join(', ')
                            : 'Complex Conjugate'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PHASE 5: DYNAMIC CALCULUS CONTROLS */}
            {activeModuleId === 'jsxgraph_calculus' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <PillSelector
                  options={[
                    { id: 'tangent_secant', label: 'Secant Limit (h→0)' },
                    { id: 'riemann_sums', label: 'Riemann Sums' },
                    { id: 'derivatives', label: 'f & f\' Curves' }
                  ]}
                  value={calcMode}
                  onChange={(val) => setCalcMode(val as any)}
                  columns={3}
                  activeColor="var(--accent-cyan, #38bdf8)"
                />
                <PillSelector
                  options={[
                    { id: 'cubic', label: 'Cubic Polynomial' },
                    { id: 'sinusoid', label: 'Sinusoid' },
                    { id: 'bell', label: 'Gaussian Bell' }
                  ]}
                  value={calcPreset}
                  onChange={(val) => setCalcPreset(val as any)}
                  columns={3}
                  activeColor="var(--accent-cyan, #38bdf8)"
                />
                <DualParamControl label="Tangent Point (x₀):" value={calcX0} min={-2.5} max={2.5} step={0.05} onChange={setCalcX0} color="#38bdf8" />
                {calcMode === 'tangent_secant' ? (
                  <DualParamControl label="Secant Step (h):" value={calcH} min={0.02} max={1.5} step={0.02} onChange={setCalcH} color="#f59e0b" />
                ) : (
                  <DualParamControl label="Partitions (N):" value={calcIntegralN} min={4} max={50} step={2} precision={0} onChange={setCalcIntegralN} color="#34d399" />
                )}
              </div>
            )}

            {/* PHASE 6: MATHBOX 3D CONTROLS */}
            {activeModuleId === 'mathbox_3d' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* 1. Surface Preset Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--text-muted)' }}>SELECT 3D/4D MANIFOLD:</span>
                  <PillSelector
                    options={[
                      { id: 'hyper_4d', label: '🌌 4D Hyper-Slice' },
                      { id: 'saddle', label: '🐎 Saddle Paraboloid' },
                      { id: 'monkey', label: '🐒 Monkey Saddle' },
                      { id: 'torus', label: '🍩 Torus Donut' },
                      { id: 'mobius', label: '♾️ Möbius Strip' },
                      { id: 'himmelblau', label: '🏔️ Himmelblau 4-Well' }
                    ]}
                    value={surfaceType}
                    onChange={(val) => setSurfaceType(val as any)}
                    columns={2}
                    activeColor="var(--accent-cyan, #38bdf8)"
                  />
                </div>

                {/* 2. Shading Mode & Colormaps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--text-muted)' }}>SHADING & COLORMAP:</span>
                  <PillSelector
                    options={[
                      { id: 'solid', label: 'Solid Quads' },
                      { id: 'wireframe', label: 'Wireframe' },
                      { id: 'both', label: 'Solid + Wire' }
                    ]}
                    value={shadingMode}
                    onChange={(val) => setShadingMode(val as any)}
                    columns={3}
                    activeColor="var(--accent-cyan, #38bdf8)"
                  />
                  <PillSelector
                    options={[
                      { id: 'cyberpunk', label: 'Cyberpunk' },
                      { id: 'plasma', label: 'Plasma' },
                      { id: 'emerald', label: 'Emerald' },
                      { id: 'sunset', label: 'Sunset' }
                    ]}
                    value={surfaceColormap}
                    onChange={(val) => setSurfaceColormap(val as any)}
                    columns={4}
                    activeColor="#a855f7"
                  />
                </div>

                {/* 3. Sliders & 4D Controls */}
                {surfaceType === 'hyper_4d' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#ec4899' }}>4D HYPERPLANE SLICING (w):</span>
                      <button
                        type="button"
                        onClick={() => setAutoSlice4D(prev => !prev)}
                        style={{
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: autoSlice4D ? 'rgba(236, 72, 153, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                          color: autoSlice4D ? '#ec4899' : 'var(--text-muted)',
                          border: autoSlice4D ? '1px solid #ec4899' : '1px solid var(--card-border)'
                        }}
                      >
                        Auto-4D {autoSlice4D ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <DualParamControl label="w Slice Offset:" value={hyperW} min={-3.14} max={3.14} step={0.1} onChange={setHyperW} color="#ec4899" />
                  </div>
                )}
                <DualParamControl label="Pitch Angle (Rx):" value={rotX} min={-80} max={80} step={2} onChange={setRotX} color="#38bdf8" />
                <DualParamControl label="Yaw Angle (Ry):" value={rotY} min={-180} max={180} step={2} onChange={setRotY} color="#34d399" />
                <DualParamControl label="Mesh Density (N):" value={meshResolution} min={16} max={36} step={2} precision={0} onChange={setMeshResolution} color="#fbbf24" />

                {/* 4. Layer Visibility Toggles */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'space-between', background: 'var(--dropdown-bg, #0b1120)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)' }}>LAYERS:</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setShow3dAxes(prev => !prev)}
                      style={{
                        padding: '3px 7px',
                        borderRadius: '4px',
                        fontSize: '0.60rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: show3dAxes ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                        color: show3dAxes ? '#38bdf8' : 'var(--text-muted)',
                        border: show3dAxes ? '1px solid #38bdf8' : '1px solid var(--card-border)'
                      }}
                      title="Toggle 3D Axes Triad & Corner Orientation Gizmo"
                    >
                      Axes {show3dAxes ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFloorGrid(prev => !prev)}
                      style={{
                        padding: '3px 7px',
                        borderRadius: '4px',
                        fontSize: '0.60rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: showFloorGrid ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                        color: showFloorGrid ? '#34d399' : 'var(--text-muted)',
                        border: showFloorGrid ? '1px solid #34d399' : '1px solid var(--card-border)'
                      }}
                      title="Toggle Illuminated Isometric Floor Grid"
                    >
                      Floor {showFloorGrid ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSlicePlane(prev => !prev)}
                      style={{
                        padding: '3px 7px',
                        borderRadius: '4px',
                        fontSize: '0.60rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: showSlicePlane ? 'rgba(251, 191, 36, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                        color: showSlicePlane ? '#fbbf24' : 'var(--text-muted)',
                        border: showSlicePlane ? '1px solid #fbbf24' : '1px solid var(--card-border)'
                      }}
                      title="Toggle Horizontal Slicing Plane & Isocline Contours"
                    >
                      Slice {showSlicePlane ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRollingBall(prev => !prev)}
                      style={{
                        padding: '3px 7px',
                        borderRadius: '4px',
                        fontSize: '0.60rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: showRollingBall ? 'rgba(236, 72, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                        color: showRollingBall ? '#ec4899' : 'var(--text-muted)',
                        border: showRollingBall ? '1px solid #ec4899' : '1px solid var(--card-border)'
                      }}
                      title="Toggle 3D Ball & Trajectory Ribbon"
                    >
                      Ball {showRollingBall ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {showSlicePlane && (
                  <DualParamControl label="Isocline Slice (z₀):" value={sliceHeightZ} min={-1.4} max={1.4} step={0.05} onChange={setSliceHeightZ} color="#fbbf24" />
                )}

                {/* 5. 3D Gradient Descent / Geodesic Orbit Controller */}
                <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--dropdown-bg, #0b1120)', border: showRollingBall ? (surfaceType === 'torus' || surfaceType === 'mobius' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(251, 191, 36, 0.35)') : '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: showRollingBall ? (surfaceType === 'torus' || surfaceType === 'mobius' ? '#38bdf8' : '#fbbf24') : 'var(--text-muted)' }}>
                        {surfaceType === 'torus' || surfaceType === 'mobius' ? '🌀 Geodesic Orbit:' : '🟡 Gradient Descent:'}
                      </span>
                      <span style={{ fontSize: '0.55rem', fontWeight: 800, padding: '1px 5px', borderRadius: '3px', background: showRollingBall ? 'rgba(52, 211, 153, 0.2)' : 'rgba(100, 116, 139, 0.2)', color: showRollingBall ? '#34d399' : '#94a3b8' }}>
                        {showRollingBall ? 'ACTIVE' : 'MUTED'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => resetBall(true)}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: surfaceType === 'torus' || surfaceType === 'mobius' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(251, 191, 36, 0.18)',
                          color: surfaceType === 'torus' || surfaceType === 'mobius' ? '#38bdf8' : '#fbbf24',
                          border: surfaceType === 'torus' || surfaceType === 'mobius' ? '1px solid #38bdf8' : '1px solid #fbbf24'
                        }}
                      >
                        {surfaceType === 'torus' || surfaceType === 'mobius' ? '🎲 Random Orbit' : '🎲 Drop Random'}
                      </button>
                      <button
                        type="button"
                        onClick={() => resetBall(false)}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: 'rgba(30, 41, 59, 0.8)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--card-border)'
                        }}
                      >
                        ↺ Reset
                      </button>
                    </div>
                  </div>
                  {surfaceType === 'torus' || surfaceType === 'mobius' ? (
                    <div style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div>{surfaceType === 'torus' ? '🍩 Toroidal (p,q)=(1,2) Closed Geodesic Knot' : '♾️ Möbius Strip Double-Loop Non-Orientable Geodesic'}</div>
                      <div style={{ color: showRollingBall ? '#38bdf8' : '#64748b', fontWeight: 700 }}>
                        {showRollingBall ? 'Continuous 60 FPS trajectory tracing active.' : 'Particle layer is hidden. Toggle [Ball ON] in LAYERS to display.'}
                      </div>
                    </div>
                  ) : (
                    <>
                      <DualParamControl label="Learning Rate (η):" value={ballLearningRate} min={0.01} max={0.25} step={0.01} onChange={setBallLearningRate} color="#fbbf24" />
                      <DualParamControl label="Momentum (γ):" value={ballMomentum} min={0.0} max={0.95} step={0.05} onChange={setBallMomentum} color="#38bdf8" />
                    </>
                  )}
                </div>

                {/* 6. Mathematical Curvature & Hessian Telemetry Card */}
                <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--dropdown-bg, #0b1120)', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>Surface Geometry:</span>
                    <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '1px 6px', borderRadius: '3px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                      {surfaceTelemetry.curvatureClass}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: '#f8fafc', fontWeight: 700, padding: '4px 6px', borderRadius: '4px', background: 'rgba(15, 23, 42, 0.6)' }}>
                    {surfaceTelemetry.equationLatex}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                    {surfaceTelemetry.description}
                  </div>
                  <div style={{ fontSize: '0.60rem', color: '#fbbf24', fontWeight: 700 }}>
                    💡 {surfaceTelemetry.criticalPointInfo}
                  </div>
                </div>
              </div>
            )}

            {/* PHASE 7: VECTOR FIELDS CONTROLS */}
            {activeModuleId === 'vector_fields' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <PillSelector
                  options={[
                    { id: 'pendulum', label: 'Damped Pendulum' },
                    { id: 'lotka_volterra', label: 'Predator-Prey' },
                    { id: 'vanderpol', label: 'Van der Pol' }
                  ]}
                  value={odeSystem}
                  onChange={(val) => setOdeSystem(val as any)}
                  columns={3}
                  activeColor="var(--accent-cyan, #38bdf8)"
                />
                <DualParamControl label="Damping / System Coefficient:" value={dampingFactor} min={0.0} max={1.5} step={0.05} onChange={setDampingFactor} color="#38bdf8" />
                <DualParamControl label="Initial X₀ (Angle/Prey):" value={phaseX0} min={-2.5} max={2.5} step={0.1} onChange={setPhaseX0} color="#34d399" />
                <DualParamControl label="Initial Y₀ (Velocity/Pred):" value={phaseY0} min={-2.5} max={2.5} step={0.1} onChange={setPhaseY0} color="#f59e0b" />
              </div>
            )}

            {/* PHASE 8: FORMULA SANDBOX CONTROLS */}
            {activeModuleId === 'formula_sandbox' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <PillSelector
                  options={[
                    { id: 'cartesian', label: 'Cartesian y=f(x)' },
                    { id: 'polar', label: 'Polar r=f(θ)' },
                    { id: 'parametric', label: 'Parametric (x(t), y(t))' }
                  ]}
                  value={sandboxCoordType}
                  onChange={(val) => setSandboxCoordType(val as any)}
                  columns={3}
                  activeColor="var(--accent-cyan, #38bdf8)"
                />
                <DualParamControl label="Parameter k (Frequency):" value={paramK} min={0.5} max={8.0} step={0.1} onChange={setParamK} color="#38bdf8" />
                <DualParamControl label="Parameter a (Amplitude):" value={paramA} min={0.1} max={3.0} step={0.1} onChange={setParamA} color="#34d399" />
                <DualParamControl label="Parameter b (Phase Shift):" value={paramB} min={-3.14} max={3.14} step={0.1} onChange={setParamB} color="#ec4899" />
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Full Interactive Visualizer Deck ─── */}
        <div
          style={{
            flex: 1,
            height: '100%',
            minWidth: 0,
            background: currentCanvasTheme.plotBoxBg || 'var(--card-bg, rgba(15, 23, 42, 0.88))',
            borderRadius: '10px',
            border: `1px solid var(--card-border, rgba(51, 65, 85, 0.7))`,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Personalized Visualization Sheet Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
              borderBottom: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))',
              fontSize: '0.74rem',
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--accent-cyan, #38bdf8)' }}>📐 {activeMeta.name}</span>
              <span
                style={{
                  fontSize: '0.64rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'var(--pill-active-bg, rgba(6, 182, 212, 0.2))',
                  color: 'var(--accent-cyan, #38bdf8)',
                  border: '1px solid var(--pill-border, rgba(6, 182, 212, 0.4))'
                }}
              >
                {activeMeta.badge}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)' }}>
                • {activeMeta.framework}
              </span>
            </div>
          </div>

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
                <svg viewBox="-320 -200 640 400" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
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
                <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
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
                    🌐 {linSubMode === '4d_hyperplane' ? '4D Multivariable Hyperplane' : '3D Regression Plane'} • R² = {linStats.r2.toFixed(3)} • Mode: {linFitMode === 'manual_user' ? 'Manual' : 'Auto OLS'}
                  </div>
                </div>
              ) : (
                /* ─── 1D LINEAR REGRESSION SVG CARTESIAN PLOT ─── */
                <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
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

                  {/* Centroid Center-of-Mass Marker (X̄, Ȳ) */}
                  {linSubMode === '1d_linear' && (
                    <g>
                      <circle cx={linStats.meanX1 * 100} cy={-linStats.meanY * 80} r="8" fill="#fbbf24" stroke="#090d16" strokeWidth="2" />
                      <circle cx={linStats.meanX1 * 100} cy={-linStats.meanY * 80} r="3" fill="#090d16" />
                      <text x={linStats.meanX1 * 100 + 10} y={-linStats.meanY * 80 - 10} fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">Centroid (X̄, Ȳ)</text>
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

          {/* PHASE 1: GAUSSIAN & STUDENT-T VISUALIZER */}
          {activeModuleId === 'gaussian_ci' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              {gaussDimension === '3d_surface' ? (
                <div
                  style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
                  onMouseDown={(e) => {
                    setIsDraggingGauss3D(true);
                    dragGauss3dStartRef.current = { x: e.clientX, y: e.clientY, rx: gauss3dRotX, ry: gauss3dRotY };
                  }}
                  onMouseMove={(e) => {
                    if (!isDraggingGauss3D) return;
                    const dx = e.clientX - dragGauss3dStartRef.current.x;
                    const dy = e.clientY - dragGauss3dStartRef.current.y;
                    setGauss3dRotY(dragGauss3dStartRef.current.ry + dx * 0.5);
                    setGauss3dRotX(Math.max(-80, Math.min(80, dragGauss3dStartRef.current.rx - dy * 0.5)));
                  }}
                  onMouseUp={() => setIsDraggingGauss3D(false)}
                  onMouseLeave={() => setIsDraggingGauss3D(false)}
                >
                  <canvas ref={canvasGauss3dRef} width={700} height={480} style={{ width: '100%', height: '100%', cursor: isDraggingGauss3D ? 'grabbing' : 'grab' }} />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15, 23, 42, 0.85)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.4)', fontSize: '0.74rem', fontFamily: 'monospace', color: '#38bdf8' }}>
                    🪐 3D Bivariate Gaussian Hill • Drag to Rotate (rx: {gauss3dRotX.toFixed(0)}°, ry: {gauss3dRotY.toFixed(0)}°) • ρ = {activeRho.toFixed(2)}
                  </div>
                </div>
              ) : gaussDimension === '2d_bivariate' ? (
                <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
                  <g opacity="0.5">
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
                          const pVal = calcBivariatePdf(vx, vy, gaussMean, 0, gaussStd, activeRho) * 6.5;
                          const red = Math.round(15 + pVal * 230);
                          const green = Math.round(23 + pVal * 160);
                          const blue = Math.round(42 + pVal * 206);
                          cells.push(
                            <rect key={`bm-${c}-${r}`} x={-320 + c * dx} y={-240 + r * dy} width={dx + 0.5} height={dy + 0.5} fill={`rgb(${Math.min(255, red)}, ${Math.min(255, green)}, ${Math.min(255, blue)})`} />
                          );
                        }
                      }
                      return cells;
                    })()}
                  </g>
                  <line x1="-320" y1="0" x2="320" y2="0" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" />
                  <line x1="0" y1="-240" x2="0" y2="240" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" />
                  {[1, 2, 3].map(k => (
                    <ellipse
                      key={`ell-${k}`}
                      cx={gaussMean * 75}
                      cy={0}
                      rx={k * gaussStd * 75 * Math.sqrt(1 + Math.abs(activeRho))}
                      ry={k * gaussStd * 55 * Math.sqrt(1 - Math.abs(activeRho))}
                      transform={`rotate(${activeRho * 45} ${gaussMean * 75} 0)`}
                      fill="none"
                      stroke={k === 1 ? '#34d399' : k === 2 ? '#38bdf8' : '#f59e0b'}
                      strokeWidth="2.0"
                      strokeDasharray={k === 3 ? '4 4' : 'none'}
                    />
                  ))}
                  <text x={gaussMean * 75 + 10} y={-gaussStd * 55 - 10} fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">1σ</text>
                  <text x={gaussMean * 75 + 10} y={-2 * gaussStd * 55 - 10} fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">2σ</text>
                  <text x={gaussMean * 75 + 10} y={-3 * gaussStd * 55 - 10} fill="#f59e0b" fontSize="10" fontWeight="bold" fontFamily="monospace">3σ</text>
                </svg>
              ) : gaussDimension === '1d_cdf' ? (
                /* ─── 1D CDF S-CURVE VISUALIZER ─── */
                <svg viewBox="-320 -200 640 400" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
                  {/* Grid Lines */}
                  {[-100, -50, 0, 50, 100].map(gy => (
                    <line key={`cdf-gy-${gy}`} x1="-300" y1={gy} x2="300" y2={gy} stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" strokeDasharray="3 3" />
                  ))}
                  <line x1="-300" y1="100" x2="300" y2="100" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                  <line x1="-300" y1="-100" x2="300" y2="-100" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="-140" x2="0" y2="120" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />

                  <text x="-315" y="-95" fill="var(--text-muted)" fontSize="9" fontFamily="monospace">F=1.0</text>
                  <text x="-315" y="5" fill="var(--text-muted)" fontSize="9" fontFamily="monospace">F=0.5</text>
                  <text x="-315" y="105" fill="var(--text-muted)" fontSize="9" fontFamily="monospace">F=0.0</text>

                  {/* Student-t CDF Curve */}
                  <path
                    d={(() => {
                      let path = '';
                      for (let px = -300; px <= 300; px += 3) {
                        const x = px / 65;
                        const cdfVal = calcStudentTCdf(x, activeNu, gaussMean, gaussStd);
                        const py = 100 - cdfVal * 200;
                        if (px === -300) path += `M ${px} ${py}`;
                        else path += ` L ${px} ${py}`;
                      }
                      return path;
                    })()}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.8"
                    strokeDasharray="4 2"
                  />

                  {/* Gaussian CDF S-Curve */}
                  <path
                    d={(() => {
                      let path = '';
                      for (let px = -300; px <= 300; px += 3) {
                        const x = px / 65;
                        const cdfVal = calcGaussianCdf(x, gaussMean, gaussStd);
                        const py = 100 - cdfVal * 200;
                        if (px === -300) path += `M ${px} ${py}`;
                        else path += ` L ${px} ${py}`;
                      }
                      return path;
                    })()}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                  />

                  {/* Test Value x0 Horizontal & Vertical Projection */}
                  {(() => {
                    const cdfAtX0 = calcGaussianCdf(injectGaussX0, gaussMean, gaussStd);
                    const py = 100 - cdfAtX0 * 200;
                    const px = injectGaussX0 * 65;
                    return (
                      <g>
                        <line x1={px} y1="100" x2={px} y2={py} stroke="#34d399" strokeWidth="2" strokeDasharray="3 3" />
                        <line x1="-300" y1={py} x2={px} y2={py} stroke="#34d399" strokeWidth="2" strokeDasharray="3 3" />
                        <circle cx={px} cy={py} r="6.5" fill="#34d399" stroke="#ffffff" strokeWidth="2" />
                        <rect x={px + 10} y={py - 24} width="120" height="20" rx="4" fill="#0b1120" stroke="#34d399" strokeWidth="1.2" />
                        <text x={px + 16} y={py - 10} fill="#34d399" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                          P(X ≤ x₀) = {(cdfAtX0 * 100).toFixed(1)}%
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              ) : (
                /* ─── 1D PDF BELL CURVE VISUALIZER WITH SHADED TAILS & CLT HISTOGRAM ─── */
                <svg viewBox="-320 -200 640 400" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
                  {/* Grid Lines & Axes */}
                  <line x1="-300" y1="120" x2="300" y2="120" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                  <line x1="0" y1="-160" x2="0" y2="135" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />

                  {/* Empirical 68-95-99.7% Standard Deviation Bands */}
                  {gaussTailMode === 'empirical_bands' && (
                    <g>
                      {/* 3 Sigma Band (99.7%) */}
                      <polygon
                        points={(() => {
                          const pts: string[] = [];
                          for (let px = (gaussMean - 3 * gaussStd) * 65; px <= (gaussMean + 3 * gaussStd) * 65; px += 4) {
                            const x = px / 65;
                            const py = 120 - calcGaussianPdf(x, gaussMean, gaussStd) * 450;
                            pts.push(`${px},${py}`);
                          }
                          return `${(gaussMean - 3 * gaussStd) * 65},120 ` + pts.join(' ') + ` ${(gaussMean + 3 * gaussStd) * 65},120`;
                        })()}
                        fill="rgba(245, 158, 11, 0.14)"
                      />
                      {/* 2 Sigma Band (95.4%) */}
                      <polygon
                        points={(() => {
                          const pts: string[] = [];
                          for (let px = (gaussMean - 2 * gaussStd) * 65; px <= (gaussMean + 2 * gaussStd) * 65; px += 4) {
                            const x = px / 65;
                            const py = 120 - calcGaussianPdf(x, gaussMean, gaussStd) * 450;
                            pts.push(`${px},${py}`);
                          }
                          return `${(gaussMean - 2 * gaussStd) * 65},120 ` + pts.join(' ') + ` ${(gaussMean + 2 * gaussStd) * 65},120`;
                        })()}
                        fill="rgba(56, 189, 248, 0.20)"
                      />
                      {/* 1 Sigma Band (68.3%) */}
                      <polygon
                        points={(() => {
                          const pts: string[] = [];
                          for (let px = (gaussMean - gaussStd) * 65; px <= (gaussMean + gaussStd) * 65; px += 4) {
                            const x = px / 65;
                            const py = 120 - calcGaussianPdf(x, gaussMean, gaussStd) * 450;
                            pts.push(`${px},${py}`);
                          }
                          return `${(gaussMean - gaussStd) * 65},120 ` + pts.join(' ') + ` ${(gaussMean + gaussStd) * 65},120`;
                        })()}
                        fill="rgba(52, 211, 153, 0.28)"
                      />
                      {/* Empirical Standard Deviation Markers */}
                      <line x1={(gaussMean - gaussStd) * 65} y1="120" x2={(gaussMean - gaussStd) * 65} y2="120 - calcGaussianPdf(gaussMean - gaussStd, gaussMean, gaussStd) * 450" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" />
                      <line x1={(gaussMean + gaussStd) * 65} y1="120" x2={(gaussMean + gaussStd) * 65} y2="120 - calcGaussianPdf(gaussMean + gaussStd, gaussMean, gaussStd) * 450" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" />
                      <text x={gaussMean * 65} y="100" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">68.3% (±1σ)</text>
                      <text x={(gaussMean - 1.8 * gaussStd) * 65} y="100" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">95.4% (±2σ)</text>
                      <text x={(gaussMean + 1.8 * gaussStd) * 65} y="100" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">95.4% (±2σ)</text>
                    </g>
                  )}

                  {/* Rejection Tail Shading (Two-tailed, Left, Right) */}
                  {gaussTailMode !== 'empirical_bands' && (
                    <g>
                      {(() => {
                        const zCrit = ciConfidence === 90 ? 1.645 : ciConfidence === 99 ? 2.576 : 1.960;
                        const leftCut = (gaussMean - zCrit * gaussStd) * 65;
                        const rightCut = (gaussMean + zCrit * gaussStd) * 65;

                        return (
                          <>
                            {(gaussTailMode === 'two_tailed' || gaussTailMode === 'left_tailed') && (
                              <polygon
                                points={(() => {
                                  const pts: string[] = [];
                                  for (let px = -300; px <= leftCut; px += 3) {
                                    const x = px / 65;
                                    const py = 120 - calcGaussianPdf(x, gaussMean, gaussStd) * 450;
                                    pts.push(`${px},${py}`);
                                  }
                                  return `-300,120 ` + pts.join(' ') + ` ${leftCut},120`;
                                })()}
                                fill="rgba(239, 68, 68, 0.35)"
                              />
                            )}
                            {(gaussTailMode === 'two_tailed' || gaussTailMode === 'right_tailed') && (
                              <polygon
                                points={(() => {
                                  const pts: string[] = [];
                                  for (let px = rightCut; px <= 300; px += 3) {
                                    const x = px / 65;
                                    const py = 120 - calcGaussianPdf(x, gaussMean, gaussStd) * 450;
                                    pts.push(`${px},${py}`);
                                  }
                                  return `${rightCut},120 ` + pts.join(' ') + ` 300,120`;
                                })()}
                                fill="rgba(239, 68, 68, 0.35)"
                              />
                            )}
                            {gaussTailMode === 'two_tailed' && (
                              <>
                                <text x={leftCut - 15} y="112" fill="#f87171" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="end">α/2 = {((100 - ciConfidence) / 2).toFixed(1)}%</text>
                                <text x={rightCut + 15} y="112" fill="#f87171" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="start">α/2 = {((100 - ciConfidence) / 2).toFixed(1)}%</text>
                              </>
                            )}
                          </>
                        );
                      })()}
                    </g>
                  )}

                  {/* CLT Empirical Histogram Bars */}
                  {cltSamples.length > 0 && (
                    <g opacity="0.65">
                      {(() => {
                        const numBins = 16;
                        const binWidth = 600 / numBins;
                        const counts = new Array(numBins).fill(0);
                        cltSamples.forEach(s => {
                          const px = s * 65;
                          const binIdx = Math.floor((px + 300) / binWidth);
                          if (binIdx >= 0 && binIdx < numBins) counts[binIdx]++;
                        });
                        const maxCount = Math.max(1, ...counts);
                        return counts.map((cnt, bIdx) => {
                          const bx = -300 + bIdx * binWidth;
                          const bh = (cnt / maxCount) * 110;
                          return (
                            <rect
                              key={`clt-b-${bIdx}`}
                              x={bx + 1}
                              y={120 - bh}
                              width={binWidth - 2}
                              height={bh}
                              fill="rgba(52, 211, 153, 0.4)"
                              stroke="#34d399"
                              strokeWidth="1"
                            />
                          );
                        });
                      })()}
                    </g>
                  )}

                  {/* Student-t PDF Curve */}
                  <path
                    d={(() => {
                      let path = '';
                      for (let px = -300; px <= 300; px += 3) {
                        const x = px / 65;
                        const y = calcStudentTPdf(x, activeNu, gaussMean, gaussStd);
                        const py = 120 - y * 450;
                        if (px === -300) path += `M ${px} ${py}`;
                        else path += ` L ${px} ${py}`;
                      }
                      return path;
                    })()}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.8"
                    strokeDasharray="4 2"
                  />

                  {/* Gaussian PDF Curve */}
                  <path
                    d={(() => {
                      let path = '';
                      for (let px = -300; px <= 300; px += 3) {
                        const x = px / 65;
                        const y = calcGaussianPdf(x, gaussMean, gaussStd);
                        const py = 120 - y * 450;
                        if (px === -300) path += `M ${px} ${py}`;
                        else path += ` L ${px} ${py}`;
                      }
                      return path;
                    })()}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                  />

                  {/* Test Value x0 Marker & Drop-Line */}
                  {(() => {
                    const py = 120 - calcGaussianPdf(injectGaussX0, gaussMean, gaussStd) * 450;
                    const px = injectGaussX0 * 65;
                    const zScore = (injectGaussX0 - gaussMean) / gaussStd;
                    const pVal = 2 * (1 - calcGaussianCdf(Math.abs(injectGaussX0), gaussMean, gaussStd));
                    return (
                      <g>
                        <line x1={px} y1="120" x2={px} y2={py} stroke="#34d399" strokeWidth="2" strokeDasharray="3 3" />
                        <circle cx={px} cy={py} r="6.5" fill="#34d399" stroke="#ffffff" strokeWidth="2" />
                        <rect x={px + 8} y={py - 28} width="125" height="24" rx="4" fill="#0b1120" stroke="#34d399" strokeWidth="1.2" />
                        <text x={px + 14} y={py - 12} fill="#34d399" fontSize="9" fontWeight="bold" fontFamily="monospace">
                          x₀={injectGaussX0} • Z={zScore.toFixed(2)} • p={pVal.toFixed(3)}
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              )}
            </div>
          )}

          {/* PHASE 2: SVC VISUALIZER */}
          {activeModuleId === 'svc_classifier' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              {svcDimension === '1d_line' ? (
                /* ─── 1D NUMBER LINE SEPARATOR ─── */
                <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
                  <line x1="-300" y1="0" x2="300" y2="0" stroke="rgba(148, 163, 184, 0.6)" strokeWidth="2" />
                  {/* Margin Band */}
                  <rect x={-svcMarginW * 40 - svcBiasB * 40} y="-60" width={svcMarginW * 80} height="120" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
                  {/* Separator Threshold */}
                  <line x1={-svcBiasB * 40} y1="-90" x2={-svcBiasB * 40} y2="90" stroke="#f59e0b" strokeWidth="3.5" />
                  <text x={-svcBiasB * 40} y="-100" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Threshold (x = {(-svcBiasB).toFixed(2)})</text>
                  {/* 1D Points */}
                  {svcAnalysis.pointsWithStatus.map(p => (
                    <g key={`svc-1d-${p.id}`}>
                      {p.isSupportVector && (
                        <circle cx={p.x1 * 60} cy={p.label === 1 ? -30 : 30} r="14" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 2" fill="none" />
                      )}
                      <circle cx={p.x1 * 60} cy={p.label === 1 ? -30 : 30} r="7" fill={p.label === 1 ? '#34d399' : '#f87171'} stroke="#ffffff" strokeWidth="1.8" />
                    </g>
                  ))}
                </svg>
              ) : svcDimension === '3d_plane' ? (
                /* ─── 3D SEPARATING PLANE PROJECTION ─── */
                <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
                  <polygon points="-240,120 240,60 180,-140 -280,-80" fill="rgba(56, 189, 248, 0.22)" stroke="#38bdf8" strokeWidth="2" />
                  <line x1="-300" y1="0" x2="300" y2="0" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1" />
                  <line x1="0" y1="-200" x2="0" y2="200" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1" />
                  {svcAnalysis.pointsWithStatus.map(p => {
                    const px = p.x1 * 75 - p.x2 * 35;
                    const py = -p.x2 * 50 - p.x1 * 20;
                    return (
                      <g key={`svc-3d-${p.id}`}>
                        {p.isSupportVector && <circle cx={px} cy={py} r="14" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 2" fill="none" />}
                        <circle cx={px} cy={py} r="7" fill={p.label === 1 ? '#34d399' : '#f87171'} stroke="#ffffff" strokeWidth="1.8" />
                      </g>
                    );
                  })}
                </svg>
              ) : (
                /* ─── 2D MAXIMUM MARGIN HYPERPLANE & RBF CONTOUR HEATMAP ─── */
                <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
                  {/* RBF Non-Linear Contour Heatmap Grid */}
                  {svcKernel === 'rbf' && (
                    <g opacity="0.45">
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
                            let fVal = 0;
                            svcPoints.forEach(other => {
                              const dist2 = (vx - other.x1) * (vx - other.x1) + (vy - other.x2) * (vy - other.x2);
                              fVal += other.label * Math.exp(-svcGamma * dist2);
                            });
                            fVal += svcBiasB;
                            const prob = 1 / (1 + Math.exp(-fVal * 2));
                            const red = Math.round(248 * (1 - prob));
                            const green = Math.round(211 * prob);
                            const blue = Math.round(153);
                            cells.push(
                              <rect key={`rbf-c-${c}-${r}`} x={-320 + c * dx} y={-240 + r * dy} width={dx + 0.5} height={dy + 0.5} fill={`rgb(${red}, ${green}, ${blue})`} opacity={Math.abs(prob - 0.5) * 1.6} />
                            );
                          }
                        }
                        return cells;
                      })()}
                    </g>
                  )}

                  {/* Axes */}
                  <line x1="-320" y1="0" x2="320" y2="0" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" />
                  <line x1="0" y1="-240" x2="0" y2="240" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" />

                  {/* Linear Hyperplane & Margin Gutters */}
                  {svcKernel === 'linear' && (
                    <>
                      {/* Margin Ribbon Polygon */}
                      <polygon
                        points={`-300,${-(1.2 * -3.75 + svcBiasB + svcMarginW) * 50} 300,${-(1.2 * 3.75 + svcBiasB + svcMarginW) * 50} 300,${-(1.2 * 3.75 + svcBiasB - svcMarginW) * 50} -300,${-(1.2 * -3.75 + svcBiasB - svcMarginW) * 50}`}
                        fill="rgba(56, 189, 248, 0.12)"
                      />
                      {/* Dashed Margin Gutters */}
                      <line x1="-300" y1={-(1.2 * -3.75 + svcBiasB + svcMarginW) * 50} x2="300" y2={-(1.2 * 3.75 + svcBiasB + svcMarginW) * 50} stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 4" />
                      <line x1="-300" y1={-(1.2 * -3.75 + svcBiasB - svcMarginW) * 50} x2="300" y2={-(1.2 * 3.75 + svcBiasB - svcMarginW) * 50} stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 4" />
                      {/* Solid Maximum Margin Hyperplane */}
                      <line x1="-300" y1={-(1.2 * -3.75 + svcBiasB) * 50} x2="300" y2={-(1.2 * 3.75 + svcBiasB) * 50} stroke="#f59e0b" strokeWidth="3.5" />
                    </>
                  )}

                  {/* Polynomial Boundary Curve */}
                  {svcKernel === 'poly' && (
                    <path
                      d={(() => {
                        let path = '';
                        for (let px = -300; px <= 300; px += 6) {
                          const x1 = px / 75;
                          // Approx poly boundary curve
                          const y2 = Math.pow(x1, svcPolyDegree) * 0.25 - svcBiasB;
                          const py = -y2 * 55;
                          if (px === -300) path += `M ${px} ${py}`;
                          else path += ` L ${px} ${py}`;
                        }
                        return path;
                      })()}
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="3.5"
                    />
                  )}

                  {/* Sample Points, Support Vector Glowing Halos & Red Slack Drop-Lines */}
                  {svcAnalysis.pointsWithStatus.map(p => {
                    const px = p.x1 * 75;
                    const py = -p.x2 * 55;
                    const targetMarginPy = -(1.2 * p.x1 + svcBiasB + (p.label === 1 ? svcMarginW : -svcMarginW)) * 50;

                    return (
                      <g key={`svc-pt-${p.id}`}>
                        {/* Red Slack Variable Error Drop-Line for Margin Violators */}
                        {p.isMarginViolator && svcKernel === 'linear' && (
                          <g>
                            <line x1={px} y1={py} x2={px} y2={targetMarginPy} stroke="#ef4444" strokeWidth="1.8" strokeDasharray="3 3" />
                            <text x={px + 6} y={(py + targetMarginPy) / 2} fill="#ef4444" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                              ξ={p.slack.toFixed(2)}
                            </text>
                          </g>
                        )}

                        {/* Active Support Vector Golden Concentric Ring */}
                        {p.isSupportVector && (
                          <>
                            <circle cx={px} cy={py} r="15" stroke="#fbbf24" strokeWidth="2.2" strokeDasharray="4 2" fill="none" opacity="0.9" />
                            <circle cx={px} cy={py} r="10" stroke="#fbbf24" strokeWidth="1.2" fill="none" />
                          </>
                        )}

                        {/* Core Point Dot */}
                        <circle cx={px} cy={py} r="6.5" fill={p.label === 1 ? '#34d399' : '#f87171'} stroke="#ffffff" strokeWidth="1.8" />
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          )}

          {/* PHASE 2: SVR VISUALIZER */}
          {activeModuleId === 'svr_regressor' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
                <line x1="-320" y1="0" x2="320" y2="0" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" />
                <line x1="0" y1="-240" x2="0" y2="240" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" />

                {/* Shaded ε-Insensitive Tube Ribbon */}
                <polygon
                  points={`-300,${-(svrSlopeM * -3.75 + svrInterceptC + svrEpsilon) * 60} 300,${-(svrSlopeM * 3.75 + svrInterceptC + svrEpsilon) * 60} 300,${-(svrSlopeM * 3.75 + svrInterceptC - svrEpsilon) * 60} -300,${-(svrSlopeM * -3.75 + svrInterceptC - svrEpsilon) * 60}`}
                  fill="rgba(52, 211, 153, 0.16)"
                />
                {/* Dashed Tube Boundaries */}
                <line x1="-300" y1={-(svrSlopeM * -3.75 + svrInterceptC + svrEpsilon) * 60} x2="300" y2={-(svrSlopeM * 3.75 + svrInterceptC + svrEpsilon) * 60} stroke="#38bdf8" strokeWidth="1.6" strokeDasharray="4 4" />
                <line x1="-300" y1={-(svrSlopeM * -3.75 + svrInterceptC - svrEpsilon) * 60} x2="300" y2={-(svrSlopeM * 3.75 + svrInterceptC - svrEpsilon) * 60} stroke="#38bdf8" strokeWidth="1.6" strokeDasharray="4 4" />

                {/* Central Regression Line */}
                <line x1="-300" y1={-(svrSlopeM * -3.75 + svrInterceptC) * 60} x2="300" y2={-(svrSlopeM * 3.75 + svrInterceptC) * 60} stroke="#38bdf8" strokeWidth="3.2" />

                {/* SVR Data Points, Support Vectors & Vertical Slack Penalty Lines */}
                {svrAnalysis.pointsWithStatus.map(p => {
                  const px = p.x * 80;
                  const py = -p.y * 60;
                  const tubeEdgeY = p.y > p.predY
                    ? -(p.predY + svrEpsilon) * 60
                    : -(p.predY - svrEpsilon) * 60;

                  return (
                    <g key={`svr-pt-${p.id}`}>
                      {/* Slack Penalty Drop-Line (for points outside the tube) */}
                      {p.isOutsideTube && (
                        <g>
                          <line x1={px} y1={py} x2={px} y2={tubeEdgeY} stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />
                          <text x={px + 8} y={(py + tubeEdgeY) / 2} fill="#ef4444" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                            ξ={p.slack.toFixed(2)}
                          </text>
                        </g>
                      )}

                      {/* Active Support Vector Glow Halo */}
                      {p.isOutsideTube && (
                        <circle cx={px} cy={py} r="14" stroke="#fbbf24" strokeWidth="2.2" strokeDasharray="3 2" fill="none" />
                      )}

                      {/* Point Core */}
                      <circle cx={px} cy={py} r="6" fill={p.isOutsideTube ? '#f87171' : '#38bdf8'} stroke="#ffffff" strokeWidth="1.8" />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* PHASE 3: MULTI-LINE VISUALIZER */}
          {activeModuleId === 'multi_line_intersections' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
                <defs>
                  <linearGradient id="feasibleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.38" />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.18" />
                  </linearGradient>
                  <radialGradient id="optimalGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                  <marker id="arrowNormal" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                  </marker>
                </defs>

                {/* ─── ADAPTIVE ORIGIN & SCALING SYSTEM ─── */}
                {(() => {
                  const isResourceLp = linePreset === 'resource_allocation';
                  const origX = isResourceLp ? -190 : 0;
                  const origY = isResourceLp ? 130 : 18;
                  const scX = isResourceLp ? 64 : 68;
                  const scY = isResourceLp ? 50 : 44;

                  const toX = (x: number) => origX + x * scX;
                  const toY = (y: number) => origY - y * scY;

                  return (
                    <g>
                      {/* Coordinate Grid Lines & Axis Ticks */}
                      <g opacity="0.4">
                        {isResourceLp ? (
                          <>
                            {[0, 1, 2, 3, 4, 5, 6, 7].map(gx => (
                              <g key={`lpgx-${gx}`}>
                                <line x1={toX(gx)} y1="-230" x2={toX(gx)} y2="230" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
                                <text x={toX(gx)} y={toY(0) + 16} fill="rgba(148, 163, 184, 0.75)" fontSize="9" fontFamily="monospace" textAnchor="middle">{gx}</text>
                              </g>
                            ))}
                            {[0, 1, 2, 3, 4, 5, 6].map(gy => (
                              <g key={`lpgy-${gy}`}>
                                <line x1="-310" y1={toY(gy)} x2="310" y2={toY(gy)} stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
                                {gy > 0 && (
                                  <text x={toX(0) - 10} y={toY(gy) + 3} fill="rgba(148, 163, 184, 0.75)" fontSize="9" fontFamily="monospace" textAnchor="end">{gy}</text>
                                )}
                              </g>
                            ))}
                          </>
                        ) : (
                          <>
                            {[-4, -3, -2, -1, 1, 2, 3, 4].map(gx => (
                              <g key={`2dgx-${gx}`}>
                                <line x1={toX(gx)} y1="-230" x2={toX(gx)} y2="230" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
                                <text x={toX(gx)} y={toY(0) + 14} fill="rgba(148, 163, 184, 0.65)" fontSize="8.5" fontFamily="monospace" textAnchor="middle">{gx}</text>
                              </g>
                            ))}
                            {[-4, -3, -2, -1, 1, 2, 3, 4].map(gy => (
                              <g key={`2dgy-${gy}`}>
                                <line x1="-310" y1={toY(gy)} x2="310" y2={toY(gy)} stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
                                <text x={toX(0) - 8} y={toY(gy) + 3} fill="rgba(148, 163, 184, 0.65)" fontSize="8.5" fontFamily="monospace" textAnchor="end">{gy}</text>
                              </g>
                            ))}
                          </>
                        )}
                      </g>

                      {/* Main Axes */}
                      <line x1="-310" y1={toY(0)} x2="310" y2={toY(0)} stroke="rgba(148, 163, 184, 0.75)" strokeWidth="1.6" />
                      <line x1={toX(0)} y1="-230" x2={toX(0)} y2="230" stroke="rgba(148, 163, 184, 0.75)" strokeWidth="1.6" />
                      <text x={isResourceLp ? 285 : 295} y={toY(0) - 8} fill="var(--text-muted, #94a3b8)" fontSize="10" fontWeight="bold" fontFamily="monospace">X →</text>
                      <text x={toX(0) + 8} y="-215" fill="var(--text-muted, #94a3b8)" fontSize="10" fontWeight="bold" fontFamily="monospace">Y ↑</text>

                      {/* ─── 1. LINEAR PROGRAMMING FEASIBLE REGION SHADER ─── */}
                      {lineMode === 'feasible_polygon' && (
                        feasiblePolygon.vertices.length >= 3 ? (
                          <g>
                            <polygon
                              points={feasiblePolygon.vertices.map(v => `${toX(v.x)},${toY(v.y)}`).join(' ')}
                              fill="url(#feasibleGrad)"
                              stroke="#34d399"
                              strokeWidth="2.5"
                              strokeDasharray="6 3"
                            />
                            <circle cx={toX(feasiblePolygon.centroid.x)} cy={toY(feasiblePolygon.centroid.y)} r="4" fill="#34d399" opacity="0.85" />
                            <text
                              x={toX(feasiblePolygon.centroid.x) + 8}
                              y={toY(feasiblePolygon.centroid.y) + 4}
                              fill="#34d399"
                              fontSize="9.5"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              Feasible Region (A = {feasiblePolygon.area.toFixed(1)})
                            </text>

                            {/* Animated Sweeping Objective Function Isocost / Isoprofit Line */}
                            {(() => {
                              const sweepK = feasiblePolygon.optimalVertex
                                ? feasiblePolygon.optimalVertex.z + Math.sin(timeT * 2.0) * (feasiblePolygon.area * 0.4)
                                : Math.sin(timeT * 1.5) * 4;
                              if (Math.abs(lpObjCy) > 0.05) {
                                const xL = isResourceLp ? -0.5 : -4.5;
                                const xR = isResourceLp ? 7.0 : 4.5;
                                const y1 = (sweepK - lpObjCx * xL) / lpObjCy;
                                const y2 = (sweepK - lpObjCx * xR) / lpObjCy;
                                return (
                                  <g opacity="0.75">
                                    <line x1={toX(xL)} y1={toY(y1)} x2={toX(xR)} y2={toY(y2)} stroke="#38bdf8" strokeWidth="2.2" strokeDasharray="5 4" />
                                    <text x={toX(xL) + 10} y={toY(y1) - 8} fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                                      Z(t) = {sweepK.toFixed(1)}
                                    </text>
                                  </g>
                                );
                              }
                              return null;
                            })()}

                            {/* Corner Vertices with Outward Leader Lines */}
                            {showVertexPills && feasiblePolygon.vertices.map((v, vIdx) => {
                              const isOptimal = feasiblePolygon.optimalVertex &&
                                Math.abs(feasiblePolygon.optimalVertex.x - v.x) < 0.05 &&
                                Math.abs(feasiblePolygon.optimalVertex.y - v.y) < 0.05;
                              const isSimplexStep = vIdx === (simplexStepIdx % feasiblePolygon.vertices.length);
                              const curZ = lpObjCx * v.x + lpObjCy * v.y;

                              const dirX = v.x - feasiblePolygon.centroid.x;
                              const dirY = v.y - feasiblePolygon.centroid.y;
                              const dist = Math.hypot(dirX, dirY) || 1;
                              const uX = dirX / dist;
                              const uY = dirY / dist;

                              const pX = toX(v.x);
                              const pY = toY(v.y);
                              const bX = pX + uX * 38;
                              const bY = pY - uY * 38;

                              return (
                                <g key={`poly-v-${vIdx}`}>
                                  <line
                                    x1={pX}
                                    y1={pY}
                                    x2={bX}
                                    y2={bY}
                                    stroke={isOptimal ? '#fbbf24' : isSimplexStep ? '#38bdf8' : 'rgba(52, 211, 153, 0.45)'}
                                    strokeWidth="1.2"
                                    strokeDasharray="2 2"
                                  />
                                  {isOptimal ? (
                                    <>
                                      <circle cx={pX} cy={pY} r="18" fill="url(#optimalGlow)" />
                                      <circle cx={pX} cy={pY} r="8" fill="#fbbf24" stroke="#ffffff" strokeWidth="2.2" />
                                      <rect x={bX - 74} y={bY - 11} width="148" height="22" rx="5" fill="#0b1120" stroke="#fbbf24" strokeWidth="1.4" />
                                      <text x={bX} y={bY + 4} fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                        ★ ({v.x.toFixed(1)}, {v.y.toFixed(1)}) OPTIMAL Z* = {feasiblePolygon.optimalVertex.z.toFixed(1)}
                                      </text>
                                    </>
                                  ) : isSimplexStep ? (
                                    <>
                                      <circle cx={pX} cy={pY} r="15" stroke="#38bdf8" strokeWidth="2.2" strokeDasharray="3 2" fill="none" />
                                      <circle cx={pX} cy={pY} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.8" />
                                      <rect x={bX - 51} y={bY - 9} width="102" height="18" rx="4" fill="#0b1120" stroke="#38bdf8" strokeWidth="1.3" />
                                      <text x={bX} y={bY + 4} fill="#38bdf8" fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                        🎯 ({v.x.toFixed(1)}, {v.y.toFixed(1)}) Z = {curZ.toFixed(1)}
                                      </text>
                                    </>
                                  ) : (
                                    <>
                                      <circle cx={pX} cy={pY} r="5" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" />
                                      <rect x={bX - 28} y={bY - 8} width="56" height="16" rx="3" fill="rgba(11, 17, 32, 0.92)" stroke="rgba(52, 211, 153, 0.5)" strokeWidth="1" />
                                      <text x={bX} y={bY + 4} fill="#34d399" fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                        ({v.x.toFixed(1)}, {v.y.toFixed(1)})
                                      </text>
                                    </>
                                  )}
                                </g>
                              );
                            })}
                          </g>
                        ) : (
                          <g>
                            <rect x="-140" y="-30" width="280" height="60" rx="8" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1.5" />
                            <text x="0" y="-8" fill="#f87171" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                              ⚠️ INFEASIBLE REGION (Ø)
                            </text>
                            <text x="0" y="14" fill="#cbd5e1" fontSize="9.5" fontFamily="monospace" textAnchor="middle">
                              Constraint Inequalities Have No Overlap
                            </text>
                          </g>
                        )
                      )}

                      {/* ─── 2. LINE SEGMENTS, CONSTRAINT COMBS & NORMAL VECTORS ─── */}
                      {dynamicLines.map((line) => {
                        const isVert = line.isVertical;
                        const xPos = toX(line.xVal ?? 0);
                        const xMin = isResourceLp ? -0.5 : -4.5;
                        const xMax = isResourceLp ? 7.0 : 4.5;
                        const len = Math.sqrt(line.m * line.m + 1);
                        const normDx = isVert ? (line.ineq === 'ge' ? 35 : -35) : (-line.m / len) * 35;
                        const normDy = isVert ? 0 : -(1 / len) * 35;

                        const labelX = isResourceLp ? (line.m < -0.5 ? 4.2 : 5.0) : (line.m > 0 ? 3.0 : -3.0);
                        const rawLabelY = isVert ? (isResourceLp ? 5.2 : 3.5) : labelX * line.m + line.c;
                        const clampedLabelY = Math.max(isResourceLp ? 0.3 : -3.5, Math.min(isResourceLp ? 5.5 : 3.5, rawLabelY));
                        const finalLabelX = (!isVert && line.m !== 0) ? (clampedLabelY - line.c) / line.m : (isVert ? (line.xVal ?? 0) : labelX);

                        return (
                          <g key={line.id}>
                            {/* Primary Infinite Vector Line Segment */}
                            <line
                              x1={isVert ? xPos : toX(xMin)}
                              y1={isVert ? toY(isResourceLp ? -0.5 : -4.5) : toY(xMin * line.m + line.c)}
                              x2={isVert ? xPos : toX(xMax)}
                              y2={isVert ? toY(isResourceLp ? 6.5 : 4.5) : toY(xMax * line.m + line.c)}
                              stroke={line.color}
                              strokeWidth="3.2"
                              strokeLinecap="round"
                            />

                            {/* Normal Vector Arrow Indicator (at anchor center) */}
                            {equationForm === 'normal_form' && (() => {
                              const ancX = isVert ? (line.xVal ?? 0) : (isResourceLp ? 2.5 : 0);
                              const ancY = isVert ? (isResourceLp ? 2.5 : 0) : ancX * line.m + line.c;
                              return (
                                <g opacity="0.6">
                                  <line
                                    x1={toX(ancX)}
                                    y1={toY(ancY)}
                                    x2={toX(ancX) + normDx}
                                    y2={toY(ancY) + normDy}
                                    stroke={line.color}
                                    strokeWidth="1.8"
                                    strokeDasharray="2 2"
                                  />
                                  <circle cx={toX(ancX) + normDx} cy={toY(ancY) + normDy} r="2.5" fill={line.color} />
                                </g>
                              );
                            })()}

                            {/* Half-Plane Directional Feasibility Combs */}
                            {lineMode === 'feasible_polygon' && (
                              <g opacity="0.45">
                                {isVert ? (
                                  (isResourceLp ? [0.5, 1.5, 2.5, 3.5, 4.5, 5.5] : [-3, -1.5, 0, 1.5, 3]).map((hy, hIdx) => {
                                    const dirX = line.ineq === 'ge' ? 14 : -14;
                                    return (
                                      <line
                                        key={`comb-v-${hIdx}`}
                                        x1={xPos}
                                        y1={toY(hy)}
                                        x2={xPos + dirX}
                                        y2={toY(hy)}
                                        stroke={line.color}
                                        strokeWidth="1.6"
                                      />
                                    );
                                  })
                                ) : (
                                  (isResourceLp ? [0.5, 1.5, 2.5, 3.5, 4.5, 5.5] : [-3, -1.5, 0, 1.5, 3]).map((hx, hIdx) => {
                                    const hy = hx * line.m + line.c;
                                    const dir = line.ineq === 'le' ? 14 : -14;
                                    return (
                                      <line
                                        key={`comb-${hIdx}`}
                                        x1={toX(hx)}
                                        y1={toY(hy)}
                                        x2={toX(hx)}
                                        y2={toY(hy) + dir}
                                        stroke={line.color}
                                        strokeWidth="1.6"
                                      />
                                    );
                                  })
                                )}
                              </g>
                            )}

                            {/* Traveling Photon Laser Pulse Animation */}
                            {(() => {
                              let pulseX = 0;
                              let pulseY = 0;
                              if (isVert) {
                                pulseX = xPos;
                                const sinY = (isResourceLp ? 2.5 : 0) + (isResourceLp ? 2.5 : 3.0) * Math.sin(timeT * 2.2 + line.id * 1.6);
                                pulseY = toY(sinY);
                              } else {
                                const animX = (isResourceLp ? 3.0 : 0) + (isResourceLp ? 3.0 : 3.5) * Math.sin(timeT * 2.2 + line.id * 1.6);
                                pulseX = toX(animX);
                                pulseY = toY(line.m * animX + line.c);
                              }
                              return (
                                <g>
                                  <circle cx={pulseX} cy={pulseY} r="7" fill={line.color} opacity="0.4" />
                                  <circle cx={pulseX} cy={pulseY} r="3.5" fill="#ffffff" />
                                </g>
                              );
                            })()}

                            {/* Line Label */}
                            {showLineLabels && (() => {
                              const isNonNeg = line.label.includes('Non-negativity');
                              if (isNonNeg && isResourceLp) {
                                if (line.isVertical) {
                                  return (
                                    <text x={toX(0) + 8} y="-200" fill={line.color} fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                                      x ≥ 0
                                    </text>
                                  );
                                }
                                return (
                                  <text x="240" y={toY(0) + 16} fill={line.color} fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                                    y ≥ 0
                                  </text>
                                );
                              }
                              return (
                                <text
                                  x={toX(finalLabelX) + 8}
                                  y={toY(clampedLabelY) - 8}
                                  fill={line.color}
                                  fontSize="9.5"
                                  fontWeight="bold"
                                  fontFamily="monospace"
                                >
                                  {line.label}
                                </text>
                              );
                            })()}
                          </g>
                        );
                      })}

                      {/* ─── 3. OVERDETERMINED LEAST SQUARES SOLUTION & RESIDUALS ─── */}
                      {lineMode === '2d_systems' && leastSquaresEstimate && (() => {
                        const isPlsConcurrent = geometricRelations.concurrents.some(
                          cp => Math.hypot(cp.x - leastSquaresEstimate.x, cp.y - leastSquaresEstimate.y) < 0.25
                        );

                        return (
                          <g>
                            {/* Residual Drop-Lines to each non-vertical Line */}
                            {!isPlsConcurrent && dynamicLines.filter(l => !l.isVertical).map(l => {
                              const len2 = l.m * l.m + 1;
                              const projX = (leastSquaresEstimate.x + l.m * leastSquaresEstimate.y - l.m * l.c) / len2;
                              const projY = l.m * projX + l.c;
                              return (
                                <line
                                  key={`ls-res-${l.id}`}
                                  x1={toX(leastSquaresEstimate.x)}
                                  y1={toY(leastSquaresEstimate.y)}
                                  x2={toX(projX)}
                                  y2={toY(projY)}
                                  stroke="#c084fc"
                                  strokeWidth="1.6"
                                  strokeDasharray="3 3"
                                />
                              );
                            })}

                            {/* Least Squares Point Marker: Only show when NOT concurrent */}
                            {!isPlsConcurrent && (
                              <g>
                                <circle cx={toX(leastSquaresEstimate.x)} cy={toY(leastSquaresEstimate.y)} r="13" fill="rgba(168, 85, 247, 0.25)" />
                                <circle cx={toX(leastSquaresEstimate.x)} cy={toY(leastSquaresEstimate.y)} r="5.5" fill="#c084fc" stroke="#ffffff" strokeWidth="2" />
                                <g>
                                  <rect
                                    x={toX(leastSquaresEstimate.x) - 64}
                                    y={toY(leastSquaresEstimate.y) + 12}
                                    width="128"
                                    height="20"
                                    rx="4"
                                    fill="rgba(11, 17, 32, 0.92)"
                                    stroke="#c084fc"
                                    strokeWidth="1.3"
                                  />
                                  <text
                                    x={toX(leastSquaresEstimate.x)}
                                    y={toY(leastSquaresEstimate.y) + 26}
                                    fill="#c084fc"
                                    fontSize="9"
                                    fontWeight="bold"
                                    fontFamily="monospace"
                                    textAnchor="middle"
                                  >
                                    P_LS ({leastSquaresEstimate.x.toFixed(2)}, {leastSquaresEstimate.y.toFixed(2)})
                                  </text>
                                </g>
                              </g>
                            )}
                          </g>
                        );
                      })()}

                      {/* ─── 4. INTERSECTIONS, EXPANDING SHOCKWAVES & ORTHOGONAL INDICATORS (2D SYSTEMS ONLY) ─── */}
                      {lineMode === '2d_systems' && lineIntersections.map((pt, idx) => {
                        const shockRadius = 6 + ((timeT * 18 + idx * 7) % 22);
                        const shockOpacity = Math.max(0, 1 - shockRadius / 22);

                        return (
                          <g key={`inter-${idx}`}>
                            {/* Collision Shockwave Animation Ring */}
                            <circle
                              cx={toX(pt.x)}
                              cy={toY(pt.y)}
                              r={shockRadius}
                              stroke={pt.colorA}
                              strokeWidth="1.6"
                              opacity={shockOpacity}
                              fill="none"
                            />

                            {/* Intersection Halo & Core */}
                            <circle cx={toX(pt.x)} cy={toY(pt.y)} r="9" fill="rgba(255, 255, 255, 0.2)" />
                            <circle cx={toX(pt.x)} cy={toY(pt.y)} r="4.5" fill="#ffffff" stroke="#090d16" strokeWidth="1.8" />

                            {/* Orthogonal Right-Angle Square Marker (90°) */}
                            {pt.isOrthogonal && (
                              <rect
                                x={toX(pt.x) - 7}
                                y={toY(pt.y) - 7}
                                width="14"
                                height="14"
                                fill="rgba(52, 211, 153, 0.3)"
                                stroke="#34d399"
                                strokeWidth="1.5"
                              />
                            )}

                            {/* Angle Badge & Orthogonal Text (only when showAngleBadges is enabled and not inside a concurrency cluster) */}
                            {showAngleBadges && !pt.isPartOfConcurrency && (
                              pt.isOrthogonal ? (
                                <g>
                                  <rect
                                    x={toX(pt.x) + 10}
                                    y={toY(pt.y) - 22}
                                    width="145"
                                    height="20"
                                    rx="4"
                                    fill="rgba(11, 17, 32, 0.92)"
                                    stroke="#34d399"
                                    strokeWidth="1.2"
                                  />
                                  <text
                                    x={toX(pt.x) + 16}
                                    y={toY(pt.y) - 8}
                                    fill="#34d399"
                                    fontSize="9"
                                    fontWeight="bold"
                                    fontFamily="monospace"
                                  >
                                    90° ⊥ ({pt.lineA} ⊥ {pt.lineB})
                                  </text>
                                </g>
                              ) : (
                                <g>
                                  <rect
                                    x={toX(pt.x) + 10}
                                    y={toY(pt.y) - 20}
                                    width="68"
                                    height="18"
                                    rx="4"
                                    fill="rgba(11, 17, 32, 0.9)"
                                    stroke="rgba(148, 163, 184, 0.4)"
                                    strokeWidth="1"
                                  />
                                  <text
                                    x={toX(pt.x) + 16}
                                    y={toY(pt.y) - 7}
                                    fill="#f8fafc"
                                    fontSize="9"
                                    fontWeight="bold"
                                    fontFamily="monospace"
                                  >
                                    θ = {pt.angleDeg.toFixed(1)}°
                                  </text>
                                </g>
                              )
                            )}
                          </g>
                        );
                      })}

                      {/* ─── 5. 3-LINE CONCURRENCY GOLDEN BEACON (CLEAN UNIFIED NODE) ─── */}
                      {geometricRelations.concurrents.map((cp, cIdx) => (
                        <g key={`conc-${cIdx}`}>
                          <circle cx={toX(cp.x)} cy={toY(cp.y)} r="22" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4 2" fill="rgba(251, 191, 36, 0.2)" />
                          <circle cx={toX(cp.x)} cy={toY(cp.y)} r="6" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
                          <rect x={toX(cp.x) - 75} y={toY(cp.y) - 32} width="150" height="20" rx="4" fill="rgba(11, 17, 32, 0.95)" stroke="#fbbf24" strokeWidth="1.4" />
                          <text x={toX(cp.x)} y={toY(cp.y) - 18} fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            🎯 CONCURRENT ({cp.x.toFixed(2)}, {cp.y.toFixed(2)})
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })()}
              </svg>
            </div>
          )}

          {/* PHASE 4: FOURIER & HARMONICS VISUALIZER */}
          {activeModuleId === 'mafs_curves' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              {fourierMode === 'epicycles' ? (
                /* ─── ROTATING EPICYCLE PHASOR CHAIN & REAL-TIME TRACER ─── */
                <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
                  <defs>
                    <linearGradient id="epicycleWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="30%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                    <radialGradient id="tipGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                      <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Left-Right Workspace Separator Line */}
                  <line x1="-50" y1="-220" x2="-50" y2="220" stroke="rgba(51, 65, 85, 0.6)" strokeWidth="1.5" strokeDasharray="4 4" />

                  {/* Left Column Background Grid for Epicycles */}
                  <line x1="-290" y1="0" x2="-60" y2="0" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1" />
                  <line x1="-175" y1="-210" x2="-175" y2="210" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1" />

                  {/* Right Column Time-Domain Wave Grid */}
                  <line x1="-50" y1="0" x2="310" y2="0" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                  {[0, Math.PI, 2 * Math.PI, 3 * Math.PI].map((rad, rIdx) => {
                    const px = -50 + (rad / (3 * Math.PI)) * 340;
                    const labels = ['t₀', 'π', '2π', '3π'];
                    return (
                      <g key={`epi-grid-${rIdx}`}>
                        <line x1={px} y1="-210" x2={px} y2="210" stroke="rgba(51, 65, 85, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
                        <text x={px} y="226" fill="rgba(148, 163, 184, 0.7)" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          {labels[rIdx]}
                        </text>
                      </g>
                    );
                  })}

                  {/* Compute Epicycle Chain Joint Positions */}
                  {(() => {
                    const originX = -175;
                    const originY = 0;
                    const scale = 75;
                    const phase = timeT * fourierWaveSpeed;
                    const harmonicColors = ['#34d399', '#38bdf8', '#fbbf24', '#f472b6', '#a78bfa', '#fdba74', '#38bdf8', '#34d399'];

                    let curX = originX;
                    let curY = originY;
                    const joints: Array<{ prevX: number; prevY: number; nextX: number; nextY: number; radius: number; color: string; k: number }> = [];

                    const numEpi = Math.min(fourierHarmonics, 10);
                    for (let n = 1; n <= numEpi; n++) {
                      const h = evalFourierHarmonic(n, 0, 0, fourierWaveType);
                      const radius = h.amp * scale;
                      const angle = h.k * phase;
                      const nextX = curX + radius * Math.cos(angle);
                      const nextY = curY - radius * Math.sin(angle); // SVG inverted y
                      const col = harmonicColors[(n - 1) % harmonicColors.length];

                      joints.push({
                        prevX: curX,
                        prevY: curY,
                        nextX,
                        nextY,
                        radius,
                        color: col,
                        k: h.k
                      });

                      curX = nextX;
                      curY = nextY;
                    }

                    const tipX = curX;
                    const tipY = curY;
                    const waveStartX = -50;

                    return (
                      <g>
                        {/* 1. Draw Concentric Circles & Rotating Vectors */}
                        {joints.map((j, idx) => (
                          <g key={`epi-joint-${idx}`}>
                            {/* Circle Orbit */}
                            <circle
                              cx={j.prevX}
                              cy={j.prevY}
                              r={Math.max(1, j.radius)}
                              fill="none"
                              stroke={j.color}
                              strokeWidth="1.3"
                              opacity={0.35 + (0.4 / (idx + 1))}
                              strokeDasharray="3 2"
                            />
                            {/* Vector Arrow Line */}
                            <line
                              x1={j.prevX}
                              y1={j.prevY}
                              x2={j.nextX}
                              y2={j.nextY}
                              stroke={j.color}
                              strokeWidth={idx === 0 ? "2.6" : "1.8"}
                              strokeLinecap="round"
                            />
                            {/* Joint Pivot Bead */}
                            <circle cx={j.prevX} cy={j.prevY} r={idx === 0 ? "3.5" : "2.5"} fill={j.color} />
                          </g>
                        ))}

                        {/* 2. Final Tip Glowing Beacon */}
                        <circle cx={tipX} cy={tipY} r="16" fill="url(#tipGlow)" />
                        <circle cx={tipX} cy={tipY} r="5.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />

                        {/* 3. Live Horizontal Laser Leader Line */}
                        <line
                          x1={tipX}
                          y1={tipY}
                          x2={waveStartX}
                          y2={tipY}
                          stroke="#fbbf24"
                          strokeWidth="1.8"
                          strokeDasharray="3 3"
                          opacity="0.85"
                        />

                        {/* 4. Real-time Unrolling Waveform on Right Half */}
                        <path
                          d={(() => {
                            let path = '';
                            const totalPoints = 120;
                            for (let i = 0; i <= totalPoints; i++) {
                              const prog = i / totalPoints;
                              const px = waveStartX + prog * 345;
                              // Trace past waveform values backwards in phase
                              const pastPhase = phase - prog * (3 * Math.PI);
                              const yVal = evalFourierComposite(0, pastPhase, fourierWaveType, fourierHarmonics);
                              const py = -yVal * scale;
                              if (i === 0) path += `M ${px} ${py}`;
                              else path += ` L ${px} ${py}`;
                            }
                            return path;
                          })()}
                          fill="none"
                          stroke="url(#epicycleWaveGrad)"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* 5. Wave Tracing Pen Head at start of wave */}
                        <circle cx={waveStartX} cy={tipY} r="5.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />

                        {/* 6. Section Labels */}
                        <text x="-175" y="-215" fill="#a855f7" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          PHASOR EPICYCLE CHAIN (N={fourierHarmonics})
                        </text>
                        <text x="130" y="-215" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          TIME-HISTORY WAVE TRACER
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              ) : fourierMode === 'vector_basis' ? (
                /* ─── 2D MATRIX TRANSFORMATION & EIGENSPACE CANVAS ─── */
                <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
                  <defs>
                    <radialGradient id="matrixAreaGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)" />
                      <stop offset="100%" stopColor="rgba(168, 85, 247, 0.12)" />
                    </radialGradient>
                  </defs>

                  {/* 1. Background Cartesian Static Reference Grid (Faint) */}
                  {[-3, -2, -1, 1, 2, 3].map(g => (
                    <g key={`static-g-${g}`} opacity="0.2">
                      <line x1={g * 70} y1="-220" x2={g * 70} y2="220" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="0.8" strokeDasharray="3 3" />
                      <line x1="-300" y1={-g * 70} x2="300" y2={-g * 70} stroke="rgba(148, 163, 184, 0.4)" strokeWidth="0.8" strokeDasharray="3 3" />
                    </g>
                  ))}

                  {/* 2. Warped / Transformed Coordinate Grid Lines */}
                  {showTransformedGrid && (
                    <g opacity="0.45">
                      {[-3, -2, -1, 0, 1, 2, 3].map(k => {
                        const x1 = (matrixA * k + matrixB * -3) * 70;
                        const y1 = -(matrixC * k + matrixD * -3) * 70;
                        const x2 = (matrixA * k + matrixB * 3) * 70;
                        const y2 = -(matrixC * k + matrixD * 3) * 70;

                        const hx1 = (matrixA * -3 + matrixB * k) * 70;
                        const hy1 = -(matrixC * -3 + matrixD * k) * 70;
                        const hx2 = (matrixA * 3 + matrixB * k) * 70;
                        const hy2 = -(matrixC * 3 + matrixD * k) * 70;

                        return (
                          <g key={`warped-grid-${k}`}>
                            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#34d399" strokeWidth={k === 0 ? "1.5" : "0.9"} opacity={k === 0 ? "0.8" : "0.5"} />
                            <line x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke="#38bdf8" strokeWidth={k === 0 ? "1.5" : "0.9"} opacity={k === 0 ? "0.8" : "0.5"} />
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* 3. Ghost Standard Basis Reference Vectors (i=[1,0], j=[0,1]) */}
                  <g opacity="0.5">
                    <line x1="0" y1="0" x2="70" y2="0" stroke="rgba(248, 250, 252, 0.6)" strokeWidth="2" strokeDasharray="3 2" />
                    <text x="75" y="14" fill="rgba(248, 250, 252, 0.6)" fontSize="9" fontWeight="bold" fontFamily="monospace">î (1,0)</text>
                    <line x1="0" y1="0" x2="0" y2="-70" stroke="rgba(248, 250, 252, 0.6)" strokeWidth="2" strokeDasharray="3 2" />
                    <text x="6" y="-74" fill="rgba(248, 250, 252, 0.6)" fontSize="9" fontWeight="bold" fontFamily="monospace">ĵ (0,1)</text>
                  </g>

                  {/* 4. Transformed Unit Circle -> Ellipse */}
                  {showDeformationEllipse && (
                    <g>
                      <circle cx="0" cy="0" r="70" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.2" strokeDasharray="4 3" />
                      <path
                        d={(() => {
                          let path = '';
                          const steps = 72;
                          for (let i = 0; i <= steps; i++) {
                            const th = (i / steps) * 2 * Math.PI;
                            const ux = Math.cos(th);
                            const uy = Math.sin(th);
                            const tx = (matrixA * ux + matrixB * uy) * 70;
                            const ty = -(matrixC * ux + matrixD * uy) * 70;
                            if (i === 0) path += `M ${tx} ${ty}`;
                            else path += ` L ${tx} ${ty}`;
                          }
                          return path;
                        })()}
                        fill="rgba(56, 189, 248, 0.08)"
                        stroke="#38bdf8"
                        strokeWidth="1.8"
                        strokeDasharray="3 2"
                      />
                    </g>
                  )}

                  {/* 5. Transformed Unit Square Parallelogram & Area Inflation */}
                  {(() => {
                    const p0x = 0, p0y = 0;
                    const p1x = matrixA * 70, p1y = -matrixC * 70;
                    const p2x = (matrixA + matrixB) * 70, p2y = -(matrixC + matrixD) * 70;
                    const p3x = matrixB * 70, p3y = -matrixD * 70;
                    const centerX = (p1x + p3x) / 2;
                    const centerY = (p1y + p3y) / 2;

                    return (
                      <g>
                        <polygon
                          points={`${p0x},${p0y} ${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`}
                          fill="url(#matrixAreaGrad)"
                          stroke="#a855f7"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                        />
                        <g transform={`translate(${centerX}, ${centerY})`}>
                          <rect x="-42" y="-10" width="84" height="20" rx="4" fill="rgba(11, 17, 32, 0.95)" stroke="#a855f7" strokeWidth="1.3" />
                          <text x="0" y="4" fill="#a855f7" fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            Area = {Math.abs(matrixAnalysis.det).toFixed(2)}
                          </text>
                        </g>
                      </g>
                    );
                  })()}

                  {/* 6. Real Invariant Eigenvectors (T v = λ v) */}
                  {showEigenvectors && matrixAnalysis.eigenvectors.map((ev, idx) => {
                    const rayLen = 220;
                    const ex1 = -ev.x * rayLen;
                    const ey1 = ev.y * rayLen;
                    const ex2 = ev.x * rayLen;
                    const ey2 = -ev.y * rayLen;
                    const tipX = ev.x * 120;
                    const tipY = -ev.y * 120;

                    return (
                      <g key={`eigen-${idx}`}>
                        <line x1={ex1} y1={ey1} x2={ex2} y2={ey2} stroke="#fbbf24" strokeWidth="1.6" strokeDasharray="5 3" opacity="0.65" />
                        <line x1="0" y1="0" x2={tipX} y2={tipY} stroke="#fbbf24" strokeWidth="2.8" />
                        <circle cx={tipX} cy={tipY} r="4" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
                        <rect x={tipX + 8} y={tipY - 10} width="72" height="18" rx="3" fill="rgba(11, 17, 32, 0.92)" stroke="#fbbf24" strokeWidth="1.1" />
                        <text x={tipX + 44} y={tipY + 3} fill="#fbbf24" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          v_{idx+1} (λ={ev.val.toFixed(2)})
                        </text>
                      </g>
                    );
                  })}

                  {/* 7. Primary Transformed Basis Vectors (T î and T ĵ) */}
                  <line x1="0" y1="0" x2={matrixA * 70} y2={-matrixC * 70} stroke="#34d399" strokeWidth="4" />
                  <circle cx={matrixA * 70} cy={-matrixC * 70} r="5" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" />
                  <rect x={matrixA * 70 + 8} y={-matrixC * 70 - 10} width="78" height="20" rx="4" fill="rgba(11, 17, 32, 0.95)" stroke="#34d399" strokeWidth="1.3" />
                  <text x={matrixA * 70 + 47} y={-matrixC * 70 + 4} fill="#34d399" fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    T î = [{matrixA.toFixed(1)}, {matrixC.toFixed(1)}]
                  </text>

                  <line x1="0" y1="0" x2={matrixB * 70} y2={-matrixD * 70} stroke="#38bdf8" strokeWidth="4" />
                  <circle cx={matrixB * 70} cy={-matrixD * 70} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                  <rect x={matrixB * 70 + 8} y={-matrixD * 70 - 10} width="78" height="20" rx="4" fill="rgba(11, 17, 32, 0.95)" stroke="#38bdf8" strokeWidth="1.3" />
                  <text x={matrixB * 70 + 47} y={-matrixD * 70 + 4} fill="#38bdf8" fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    T ĵ = [{matrixB.toFixed(1)}, {matrixD.toFixed(1)}]
                  </text>

                  {/* 8. Singular Collapse Alert Overlay (when det = 0) */}
                  {matrixAnalysis.isSingular && (
                    <g transform="translate(0, 180)">
                      <rect x="-160" y="-18" width="320" height="36" rx="6" fill="rgba(239, 68, 68, 0.22)" stroke="#ef4444" strokeWidth="1.5" />
                      <text x="0" y="-1" fill="#f87171" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                        ⚠️ SINGULAR MATRIX: det(T) = 0
                      </text>
                      <text x="0" y="12" fill="#cbd5e1" fontSize="8" fontFamily="monospace" textAnchor="middle">
                        2D Space Collapses into a 1D Line (Rank 1 / Nullspace &gt; 0)
                      </text>
                    </g>
                  )}

                  {/* 9. Matrix Header Badge */}
                  <g transform="translate(-300, -200)">
                    <rect x="0" y="0" width="165" height="42" rx="6" fill="rgba(15, 23, 42, 0.92)" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />
                    <text x="10" y="16" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      T = [{matrixA.toFixed(1)} {matrixB.toFixed(1)}; {matrixC.toFixed(1)} {matrixD.toFixed(1)}]
                    </text>
                    <text x="10" y="32" fill={matrixAnalysis.det < 0 ? "#f87171" : matrixAnalysis.isSingular ? "#fbbf24" : "#34d399"} fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                      det(T) = {matrixAnalysis.det.toFixed(2)} • tr(T) = {matrixAnalysis.trace.toFixed(1)}
                    </text>
                  </g>
                </svg>
              ) : (
                /* ─── TIME-DOMAIN & SYNTHESIS CANVAS ─── */
                <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
                  <defs>
                    <linearGradient id="fourierWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <linearGradient id="fourierAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(168, 85, 247, 0.25)" />
                      <stop offset="100%" stopColor="rgba(168, 85, 247, 0.0)" />
                    </linearGradient>
                  </defs>

                  {/* Radian Grid Lines & Axis Markers */}
                  {[-2 * Math.PI, -Math.PI, 0, Math.PI, 2 * Math.PI].map((rad, rIdx) => {
                    const px = (rad / (2 * Math.PI)) * 260;
                    const labels = ['-2π', '-π', '0', 'π', '2π'];
                    return (
                      <g key={`grid-x-${rIdx}`}>
                        <line x1={px} y1="-210" x2={px} y2="210" stroke="rgba(51, 65, 85, 0.45)" strokeWidth="1" strokeDasharray="3 3" />
                        <text x={px} y="228" fill="rgba(148, 163, 184, 0.8)" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          {labels[rIdx]}
                        </text>
                      </g>
                    );
                  })}

                  {/* Amplitude Level Ticks (-1, 0, +1) */}
                  {[-1.0, 0, 1.0].map((amp, aIdx) => {
                    const py = -amp * 90;
                    return (
                      <g key={`grid-y-${aIdx}`}>
                        <line x1="-300" y1={py} x2="300" y2={py} stroke={amp === 0 ? "rgba(148, 163, 184, 0.6)" : "rgba(51, 65, 85, 0.45)"} strokeWidth={amp === 0 ? 1.5 : 1} strokeDasharray={amp === 0 ? "" : "3 3"} />
                        {amp !== 0 && (
                          <text x="-308" y={py + 3.5} fill="rgba(148, 163, 184, 0.7)" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="end">
                            {amp > 0 ? `+${amp.toFixed(1)}` : amp.toFixed(1)}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Primary Axes */}
                  <line x1="-310" y1="0" x2="310" y2="0" stroke="rgba(148, 163, 184, 0.6)" strokeWidth="1.5" />
                  <line x1="0" y1="-220" x2="0" y2="220" stroke="rgba(148, 163, 184, 0.6)" strokeWidth="1.5" />

                  {/* 1. Ideal Target Waveform (Dashed Ghost Reference) */}
                  {showIdealTargetWave && (
                    <path
                      d={(() => {
                        let path = '';
                        const phase = timeT * fourierWaveSpeed;
                        for (let px = -290; px <= 290; px += 2) {
                          const x = (px / 260) * 2 * Math.PI;
                          const targetY = evalIdealWave(x, phase, fourierWaveType);
                          const py = -targetY * 90;
                          if (px === -290) path += `M ${px} ${py}`;
                          else path += ` L ${px} ${py}`;
                        }
                        return path;
                      })()}
                      fill="none"
                      stroke="rgba(248, 250, 252, 0.4)"
                      strokeWidth="2"
                      strokeDasharray="5 4"
                    />
                  )}

                  {/* 2. Individual Harmonic Sub-Waves (Subtle Colored Overlays) */}
                  {showIndividualHarmonics && (() => {
                    const harmonicColors = ['#34d399', '#38bdf8', '#fbbf24', '#f472b6', '#a78bfa', '#fdba74'];
                    const maxSub = Math.min(fourierHarmonics, 6);
                    const phase = timeT * fourierWaveSpeed;
                    const paths = [];
                    for (let n = 1; n <= maxSub; n++) {
                      let path = '';
                      for (let px = -290; px <= 290; px += 4) {
                        const x = (px / 260) * 2 * Math.PI;
                        const subY = evalFourierHarmonic(n, x, phase, fourierWaveType).val;
                        const py = -subY * 90;
                        if (px === -290) path += `M ${px} ${py}`;
                        else path += ` L ${px} ${py}`;
                      }
                      const col = harmonicColors[(n - 1) % harmonicColors.length];
                      paths.push(
                        <path
                          key={`sub-h-${n}`}
                          d={path}
                          fill="none"
                          stroke={col}
                          strokeWidth="1.4"
                          opacity="0.55"
                          strokeDasharray={n > 1 ? "3 2" : ""}
                        />
                      );
                    }
                    return paths;
                  })()}

                  {/* 3. Master Composite Wave Shaded Area */}
                  <path
                    d={(() => {
                      let path = `M -290 0`;
                      const phase = timeT * fourierWaveSpeed;
                      for (let px = -290; px <= 290; px += 3) {
                        const x = (px / 260) * 2 * Math.PI;
                        const y = evalFourierComposite(x, phase, fourierWaveType, fourierHarmonics);
                        const py = -y * 90;
                        path += ` L ${px} ${py}`;
                      }
                      path += ` L 290 0 Z`;
                      return path;
                    })()}
                    fill="url(#fourierAreaGrad)"
                  />

                  {/* 4. Master Composite Fourier Waveform (Glowing Traveling Wave) */}
                  <path
                    d={(() => {
                      let path = '';
                      const phase = timeT * fourierWaveSpeed;
                      for (let px = -290; px <= 290; px += 3) {
                        const x = (px / 260) * 2 * Math.PI;
                        const y = evalFourierComposite(x, phase, fourierWaveType, fourierHarmonics);
                        const py = -y * 90;
                        if (px === -290) path += `M ${px} ${py}`;
                        else path += ` L ${px} ${py}`;
                      }
                      return path;
                    })()}
                    fill="none"
                    stroke="url(#fourierWaveGrad)"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* 5. Center-Origin Tracking Probe & Amplitude Beacon */}
                  {(() => {
                    const phase = timeT * fourierWaveSpeed;
                    const centerVal = evalFourierComposite(0, phase, fourierWaveType, fourierHarmonics);
                    const centerPy = -centerVal * 90;
                    return (
                      <g>
                        <line x1="0" y1="0" x2="0" y2={centerPy} stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="2 2" />
                        <circle cx="0" cy={centerPy} r="6" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
                        <rect x="8" y={centerPy - 10} width="85" height="20" rx="4" fill="rgba(11, 17, 32, 0.92)" stroke="#fbbf24" strokeWidth="1.2" />
                        <text x="50" y={centerPy + 4} fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          y(0) = {centerVal.toFixed(2)}
                        </text>
                      </g>
                    );
                  })()}

                  {/* 6. Mode & Parameter Legend Pill */}
                  <g transform="translate(180, -200)">
                    <rect x="0" y="0" width="130" height="34" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />
                    <text x="65" y="14" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                      {fourierWaveType.toUpperCase()} WAVE (N={fourierHarmonics})
                    </text>
                    <text x="65" y="27" fill="#cbd5e1" fontSize="8" fontFamily="monospace" textAnchor="middle">
                      v_phase = {fourierWaveSpeed.toFixed(1)} rad/s
                    </text>
                  </g>
                </svg>
              )}
            </div>
          )}

          {/* PHASE 5: DYNAMIC CALCULUS VISUALIZER */}
          {activeModuleId === 'jsxgraph_calculus' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16' }}>
                <line x1="-320" y1="0" x2="320" y2="0" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                <line x1="0" y1="-240" x2="0" y2="240" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                <path
                  d={(() => {
                    let path = '';
                    for (let px = -300; px <= 300; px += 4) {
                      const x = px / 80;
                      const y = evalCalcFunction(x);
                      const py = -y * 80;
                      if (px === -300) path += `M ${px} ${py}`;
                      else path += ` L ${px} ${py}`;
                    }
                    return path;
                  })()}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3.2"
                />
                {(() => {
                  const y0 = evalCalcFunction(calcX0);
                  const slope = evalCalcDerivative(calcX0);
                  return (
                    <>
                      <line x1={(calcX0 - 1.6) * 80} y1={-(y0 - 1.6 * slope) * 80} x2={(calcX0 + 1.6) * 80} y2={-(y0 + 1.6 * slope) * 80} stroke="#f59e0b" strokeWidth="2.8" />
                      <circle cx={calcX0 * 80} cy={-y0 * 80} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                    </>
                  );
                })()}
              </svg>
            </div>
          )}

          {/* PHASE 6: MATHBOX 3D VISUALIZER */}
          {activeModuleId === 'mathbox_3d' && (
            <div
              style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', touchAction: 'none' }}
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
              onTouchStart={(e) => {
                if (e.touches.length > 0) {
                  setIsDragging3D(true);
                  dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, rx: rotX, ry: rotY };
                }
              }}
              onTouchMove={(e) => {
                if (!isDragging3D || e.touches.length === 0) return;
                const dx = e.touches[0].clientX - dragStartRef.current.x;
                const dy = e.touches[0].clientY - dragStartRef.current.y;
                setRotY(dragStartRef.current.ry + dx * 0.6);
                setRotX(Math.max(-80, Math.min(80, dragStartRef.current.rx - dy * 0.6)));
              }}
              onTouchEnd={() => setIsDragging3D(false)}
              onTouchCancel={() => setIsDragging3D(false)}
            >
              <canvas
                ref={canvas3DRef}
                style={{ width: '100%', height: '100%', display: 'block', cursor: isDragging3D ? 'grabbing' : 'grab', touchAction: 'none' }}
              />
            </div>
          )}

          {/* PHASE 7: VECTOR FIELDS VISUALIZER */}
          {activeModuleId === 'vector_fields' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16' }}>
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

          {/* PHASE 8: FORMULA SANDBOX VISUALIZER */}
          {activeModuleId === 'formula_sandbox' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16' }}>
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

          {/* ARCHITECTURE GUIDE */}
          {activeModuleId === 'framework_compare' && (
            <div style={{ width: '100%', height: '100%', padding: '24px', overflowY: 'auto', background: currentCanvasTheme.bg || '#090d16' }}>
              <h3 style={{ color: 'var(--accent-cyan, #38bdf8)', marginTop: 0 }}>Client-Side Mathematical Frameworks Matrix</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem', color: '#f8fafc' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.8)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Framework</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Paradigm</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Core Strengths</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.4)' }}>
                    <td style={{ padding: '8px', fontWeight: 800, color: '#38bdf8' }}>Mafs</td>
                    <td style={{ padding: '8px' }}>Declarative React SVG</td>
                    <td style={{ padding: '8px' }}>Smooth animations, JSX vectors</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.4)' }}>
                    <td style={{ padding: '8px', fontWeight: 800, color: '#34d399' }}>JSXGraph</td>
                    <td style={{ padding: '8px' }}>Dynamic Geometry Canvas</td>
                    <td style={{ padding: '8px' }}>Interactive constraints, tangents</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', fontWeight: 800, color: '#ec4899' }}>MathBox / WebGL</td>
                    <td style={{ padding: '8px' }}>GPU Shader Pipeline</td>
                    <td style={{ padding: '8px' }}>3D Parametric Meshes, 4D Slicing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )}
</div>
);
};
