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
  ArrowRight,
  Grid,
  Sparkles,
  RotateCcw,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { DualParamControl } from './common/DualParamControl';
import { PillSelector } from './common/PillSelector';
import { getCanvasTheme } from '../utils/canvasThemeEngine';
import { normalPdf, normalCdf, studentTPdf, studentTCdf, bivariateNormalPdf, getStudentTCrit, calcGaussianQuantile, calcStudentTQuantile } from '../utils/math_studio/gaussianStats';
import { evaluateKernel, computeLinearDecision, computeKernelDecision, calculatePointSlackAndAlpha } from '../utils/math_studio/svcEngine';
import { epsilonLoss, calculateSvrSlacks, computeSvrLoss } from '../utils/math_studio/svrEngine';
import { sigmoid, softmax, binaryCrossEntropy, categoricalCrossEntropy } from '../utils/math_studio/logisticSoftmax';
import { computeOLS, gradientDescentStep } from '../utils/math_studio/linearRegression';
import { intersectLines, isPointFeasible } from '../utils/math_studio/multilineSystems';
import { getFourierHarmonics, evaluateFourierSeries, apply2DTransform } from '../utils/math_studio/fourierHarmonics';
import { numericalDerivative, computeRiemannSum } from '../utils/math_studio/tangentsRiemann';
import { rk4Step, computeJacobian, classifyFixedPoint } from '../utils/math_studio/odeVectorFields';
import { generateIsoSegments, interpolateEdge } from '../utils/math_studio/marchingContours';

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
      setSvc3dRotY(prev => (prev + rotDelta) % 360);
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
  const [gaussDimension, setGaussDimension] = useState<'1d_pdf_compare' | '1d_cdf' | '1d_qqplot' | '2d_bivariate' | '3d_surface'>('1d_pdf_compare');
  const [gaussTailMode, setGaussTailMode] = useState<'two_tailed' | 'left_tailed' | 'right_tailed' | 'empirical_bands'>('two_tailed');
  const [gaussMean, setGaussMean] = useState<number>(0.0);
  const [gaussStd, setGaussStd] = useState<number>(1.0);
  const [gaussStdY, setGaussStdY] = useState<number>(1.0);
  const [studentNu, setStudentNu] = useState<number>(4);
  const [bivariateRho, setBivariateRho] = useState<number>(0.6);
  const [ciConfidence, setCiConfidence] = useState<number>(95);
  const [injectGaussX0, setInjectGaussX0] = useState<number>(1.96);
  const [cltSource, setCltSource] = useState<'uniform' | 'exponential' | 'bimodal' | 'discrete_die'>('uniform');

  // One-Sample Hypothesis Testing & Confidence Interval States
  const [hypoSampleMean, setHypoSampleMean] = useState<number>(1.8);
  const [hypoSampleSize, setHypoSampleSize] = useState<number>(10);
  const [hypoSampleStd, setHypoSampleStd] = useState<number>(1.2);
  const [hypoNullMu, setHypoNullMu] = useState<number>(0.0);
  const [showHypoTestOverlay, setShowHypoTestOverlay] = useState<boolean>(true);
  const [showCiBrackets, setShowCiBrackets] = useState<boolean>(true);
  const [showPcaVectors, setShowPcaVectors] = useState<boolean>(true);
  const [isNuSweeping, setIsNuSweeping] = useState<boolean>(false);

  const [gauss3dRotX, setGauss3dRotX] = useState<number>(30);
  const [gauss3dRotY, setGauss3dRotY] = useState<number>(45);
  const [gauss3dZoom, setGauss3dZoom] = useState<number>(1.0);
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
        let draw = 0;
        if (cltSource === 'exponential') {
          // Standard Exponential Exp(1) centered & scaled (mean=1, std=1)
          const u = Math.max(1e-6, Math.random());
          draw = -Math.log(u) - 1.0;
        } else if (cltSource === 'bimodal') {
          // 50/50 mixture of N(-1.5, 0.5) and N(1.5, 0.5)
          const peak = Math.random() > 0.5 ? 1.5 : -1.5;
          const u1 = Math.max(1e-6, Math.random());
          const u2 = Math.random();
          const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
          draw = (peak + z0 * 0.5) / 1.58; // normalized variance approx 1
        } else if (cltSource === 'discrete_die') {
          // 6-sided die {1, 2, 3, 4, 5, 6}: Mean=3.5, Std=sqrt(35/12)=1.7078
          const dieRoll = Math.floor(Math.random() * 6) + 1;
          draw = (dieRoll - 3.5) / 1.7078;
        } else {
          // Standard Uniform [-sqrt(3), +sqrt(3)] (mean=0, std=1)
          draw = (Math.random() - 0.5) * 3.4641;
        }
        sum += draw;
      }
      const sampleMean = gaussMean + (sum / sampleSize) * gaussStd;
      newMeans.push(parseFloat(sampleMean.toFixed(3)));
    }
    setCltSamples(prev => [...prev.slice(-180), ...newMeans]);
  };

  const resetCltSamples = () => {
    setCltSamples([]);
  };

  const calcGaussianPdf = (x: number, mu: number, sigma: number): number => normalPdf(x, mu, sigma);
  const calcGaussianCdf = (x: number, mu: number, sigma: number): number => normalCdf(x, mu, sigma);
  const calcStudentTPdf = (x: number, nu: number, mu: number, sigma: number): number => studentTPdf(x, nu, mu, sigma);
  const calcStudentTCdf = (x: number, nu: number, mu: number, sigma: number): number => studentTCdf(x, nu, mu, sigma);
  const calcBivariatePdf = (x: number, y: number, muX: number, muY: number, sigmaX: number, sigmaY: number, rho: number): number =>
    bivariateNormalPdf(x, y, muX, muY, sigmaX, sigmaY, rho);


  const activeNu = isBendingAnim || isNuSweeping ? Math.round(1 + (Math.sin(timeT * 1.8) + 1) * 14.5) : studentNu;
  const activeRho = isBendingAnim ? Math.sin(timeT * 1.5) * 0.85 : bivariateRho;

  // One-Sample Hypothesis Testing (Z-Test vs Student's t-Test) & CI Margin of Error Analysis
  const gaussHypoAnalysis = useMemo(() => {
    const n = Math.max(2, hypoSampleSize);
    const se = hypoSampleStd / Math.sqrt(n);
    const seKnown = gaussStd / Math.sqrt(n);
    const tStat = (hypoSampleMean - hypoNullMu) / (se || 1e-5);
    const zStat = (hypoSampleMean - hypoNullMu) / (seKnown || 1e-5);
    const df = Math.max(1, n - 1);

    const zCrit = ciConfidence === 90 ? 1.64485 : ciConfidence === 99 ? 2.57583 : 1.95996;
    const tCrit = getStudentTCrit(df, ciConfidence);

    const pValT = Math.max(0.0001, Math.min(1.0, 2 * (1 - calcStudentTCdf(Math.abs(tStat), df, 0, 1))));
    const pValZ = Math.max(0.0001, Math.min(1.0, 2 * (1 - calcGaussianCdf(Math.abs(zStat), 0, 1))));

    const isRejectedT = Math.abs(tStat) > tCrit;
    const isRejectedZ = Math.abs(zStat) > zCrit;

    const zMargin = zCrit * seKnown;
    const tMargin = tCrit * se;
    const zCiLow = hypoSampleMean - zMargin;
    const zCiHigh = hypoSampleMean + zMargin;
    const tCiLow = hypoSampleMean - tMargin;
    const tCiHigh = hypoSampleMean + tMargin;
    const ciInflationPct = zMargin > 0 ? ((tMargin / zMargin) - 1) * 100 : 0;

    return {
      n,
      se,
      seKnown,
      tStat,
      zStat,
      df,
      zCrit,
      tCrit,
      pValT,
      pValZ,
      isRejectedT,
      isRejectedZ,
      zMargin,
      tMargin,
      zCiLow,
      zCiHigh,
      tCiLow,
      tCiHigh,
      ciInflationPct
    };
  }, [hypoSampleMean, hypoSampleSize, hypoSampleStd, hypoNullMu, gaussStd, ciConfidence]);

  // 2D Bivariate Normal PCA & Eigen-Decomposition Analysis
  const gaussPcaAnalysis = useMemo(() => {
    const varX = gaussStd * gaussStd;
    const varY = gaussStdY * gaussStdY;
    const covXY = activeRho * gaussStd * gaussStdY;
    const trace = varX + varY;
    const diff = varX - varY;
    const disc = Math.sqrt(Math.max(0, diff * diff + 4 * covXY * covXY));
    const lambda1 = Math.max(0.001, (trace + disc) / 2);
    const lambda2 = Math.max(0.001, (trace - disc) / 2);
    const thetaRad = 0.5 * Math.atan2(2 * covXY, diff);
    const thetaDeg = (thetaRad * 180) / Math.PI;
    const totalVar = lambda1 + lambda2;
    const pc1Ratio = (lambda1 / totalVar) * 100;
    const pc2Ratio = (lambda2 / totalVar) * 100;

    return {
      varX,
      varY,
      covXY,
      lambda1,
      lambda2,
      thetaRad,
      thetaDeg,
      totalVar,
      pc1Ratio,
      pc2Ratio
    };
  }, [gaussStd, gaussStdY, activeRho]);

  // Information-Theoretic KL Divergence & Differential Entropy
  const gaussInfoAnalysis = useMemo(() => {
    let klDiv = 0;
    const step = 0.08;
    for (let x = -5 * gaussStd; x <= 5 * gaussStd; x += step) {
      const pN = calcGaussianPdf(x, 0, gaussStd);
      const pT = calcStudentTPdf(x, activeNu, 0, gaussStd);
      if (pN > 1e-7 && pT > 1e-7) {
        klDiv += pN * Math.log(pN / pT) * step;
      }
    }
    const normalEntropy = 0.5 * Math.log(2 * Math.PI * Math.E * gaussStd * gaussStd);
    return {
      klDivergence: Math.max(0, klDiv),
      normalEntropy
    };
  }, [gaussStd, activeNu]);

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

      const scale = 52 * gauss3dZoom;
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
        const zVal = calcBivariatePdf(x, y, gaussMean, 0, gaussStd, gaussStdY, activeRho) * 8.5;
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
  }, [activeModuleId, gaussDimension, gauss3dRotX, gauss3dRotY, gauss3dZoom, gaussMean, gaussStd, gaussStdY, activeRho]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. PHASE 2: SUPPORT VECTOR MACHINES (SVC & SVR)
  // ─────────────────────────────────────────────────────────────────────────────
  const [svcDimension, setSvcDimension] = useState<'2d_margin' | '1d_line' | '3d_plane' | '4d_slice'>('2d_margin');
  const [svcKernel, setSvcKernel] = useState<'linear' | 'rbf' | 'poly'>('linear');
  const [svcC, setSvcC] = useState<number>(1.0);
  const [svcMarginW, setSvcMarginW] = useState<number>(1.2);
  const [svcBiasB, setSvcBiasB] = useState<number>(0.2);
  const [svcGamma, setSvcGamma] = useState<number>(0.8);
  const [svcPolyDegree, setSvcPolyDegree] = useState<number>(2);
  const [svcDatasetPreset, setSvcDatasetPreset] = useState<'separable' | 'overlapping' | 'circles' | 'xor_moons' | 'outlier_stress'>('separable');
  const [draggingSvcPointId, setDraggingSvcPointId] = useState<number | null>(null);
  const svcSvgRef = useRef<SVGSVGElement | null>(null);

  // 3D & 4D SVC Orbit Camera & Canvas State
  const [svc3dRotX, setSvc3dRotX] = useState<number>(26);
  const [svc3dRotY, setSvc3dRotY] = useState<number>(40);
  const [svc3dZoom, setSvc3dZoom] = useState<number>(1.0);
  const [isDraggingSvc3D, setIsDraggingSvc3D] = useState<boolean>(false);
  const dragSvc3dStartRef = useRef<{ x: number; y: number; rx: number; ry: number }>({ x: 0, y: 0, rx: 26, ry: 40 });
  const canvasSvc3dRef = useRef<HTMLCanvasElement | null>(null);
  const [svc3dFeatureMap, setSvc3dFeatureMap] = useState<'paraboloid' | 'rbf_pot' | 'decision_plane'>('paraboloid');
  const [dragging3dPointId, setDragging3dPointId] = useState<number | null>(null);

  // 4D Hyperplane Slicing State
  const [svc4dSliceX4, setSvc4dSliceX4] = useState<number>(0.0);
  const [svc4dAutoSlice, setSvc4dAutoSlice] = useState<boolean>(true);
  const [svc4dSliceThickness, setSvc4dSliceThickness] = useState<number>(1.2);
  const [svc4dPoints, setSvc4dPoints] = useState<Array<{ id: number; x1: number; x2: number; x3: number; x4: number; label: 1 | -1 }>>([
    { id: 1, x1: -1.2, x2: 1.0, x3: 0.8, x4: -1.0, label: 1 },
    { id: 2, x1: -0.8, x2: 1.5, x3: 1.2, x4: -0.5, label: 1 },
    { id: 3, x1: -1.5, x2: 0.5, x3: 0.2, x4: 0.0, label: 1 },
    { id: 4, x1: -1.0, x2: 1.2, x3: -0.5, x4: 0.5, label: 1 },
    { id: 5, x1: -0.5, x2: 0.8, x3: 1.0, x4: 1.0, label: 1 },
    { id: 6, x1: -1.8, x2: 1.8, x3: 0.5, x4: -0.8, label: 1 },
    { id: 7, x1: 1.2, x2: -1.0, x3: -0.8, x4: -1.0, label: -1 },
    { id: 8, x1: 0.8, x2: -1.5, x3: -1.2, x4: -0.5, label: -1 },
    { id: 9, x1: 1.5, x2: -0.5, x3: -0.2, x4: 0.0, label: -1 },
    { id: 10, x1: 1.0, x2: -1.2, x3: 0.5, x4: 0.5, label: -1 },
    { id: 11, x1: 0.5, x2: -0.8, x3: -1.0, x4: 1.0, label: -1 },
    { id: 12, x1: 1.8, x2: -1.8, x3: -0.5, x4: 0.8, label: -1 }
  ]);

  const [injectSvcX1, setInjectSvcX1] = useState<number>(0.5);
  const [injectSvcX2, setInjectSvcX2] = useState<number>(0.5);
  const [injectSvcClass, setInjectSvcClass] = useState<1 | -1>(1);
  const [showSvcFormulaHud, setShowSvcFormulaHud] = useState<boolean>(true);
  const [showSvcPointLabels, setShowSvcPointLabels] = useState<boolean>(false);
  const [hoveredSvcPointId, setHoveredSvcPointId] = useState<number | null>(null);
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

  const loadSvcPreset = (preset: 'separable' | 'overlapping' | 'circles' | 'xor_moons' | 'outlier_stress') => {
    setSvcDatasetPreset(preset);
    if (preset === 'separable') {
      setSvcPoints([
        { id: 1, x1: -2.2, x2: 1.8, label: 1 },
        { id: 2, x1: -1.5, x2: 1.0, label: 1 },
        { id: 3, x1: -0.8, x2: 2.2, label: 1 },
        { id: 4, x1: -2.0, x2: -0.2, label: 1 },
        { id: 5, x1: 0.8, x2: -1.2, label: -1 },
        { id: 6, x1: 1.5, x2: -0.5, label: -1 },
        { id: 7, x1: 2.2, x2: -1.8, label: -1 },
        { id: 8, x1: 1.2, x2: 0.4, label: -1 }
      ]);
      setSvcKernel('linear');
      setSvcBiasB(0.2);
      setSvcMarginW(1.2);
      setSvcC(1.0);
      setSvc3dFeatureMap('decision_plane');
    } else if (preset === 'overlapping') {
      setSvcPoints([
        { id: 1, x1: -2.0, x2: 1.5, label: 1 },
        { id: 2, x1: -1.2, x2: 0.8, label: 1 },
        { id: 3, x1: -0.5, x2: 1.8, label: 1 },
        { id: 4, x1: -1.8, x2: -0.5, label: 1 },
        { id: 5, x1: 0.2, x2: 0.2, label: 1 },
        { id: 6, x1: 0.8, x2: -1.2, label: -1 },
        { id: 7, x1: 1.5, x2: -0.5, label: -1 },
        { id: 8, x1: 2.0, x2: -1.8, label: -1 },
        { id: 9, x1: 1.2, x2: 0.2, label: -1 },
        { id: 10, x1: -0.3, x2: 0.5, label: -1 }
      ]);
      setSvcKernel('linear');
      setSvcBiasB(0.2);
      setSvcMarginW(1.2);
      setSvcC(1.0);
      setSvc3dFeatureMap('decision_plane');
    } else if (preset === 'circles') {
      setSvcPoints([
        { id: 1, x1: 0.0, x2: 0.0, label: 1 },
        { id: 2, x1: 0.7, x2: 0.6, label: 1 },
        { id: 3, x1: -0.7, x2: 0.6, label: 1 },
        { id: 4, x1: 0.6, x2: -0.7, label: 1 },
        { id: 5, x1: -0.6, x2: -0.7, label: 1 },
        { id: 6, x1: 2.3, x2: 0.0, label: -1 },
        { id: 7, x1: -2.3, x2: 0.0, label: -1 },
        { id: 8, x1: 0.0, x2: 2.3, label: -1 },
        { id: 9, x1: 0.0, x2: -2.3, label: -1 },
        { id: 10, x1: 1.7, x2: 1.7, label: -1 },
        { id: 11, x1: -1.7, x2: 1.7, label: -1 },
        { id: 12, x1: 1.7, x2: -1.7, label: -1 },
        { id: 13, x1: -1.7, x2: -1.7, label: -1 }
      ]);
      setSvcKernel('rbf');
      setSvcGamma(1.2);
      setSvcBiasB(-0.5);
      setSvc3dFeatureMap('paraboloid');
    } else if (preset === 'xor_moons') {
      setSvcPoints([
        { id: 1, x1: -1.6, x2: 1.4, label: 1 },
        { id: 2, x1: -1.0, x2: 1.8, label: 1 },
        { id: 3, x1: -0.4, x2: 1.1, label: 1 },
        { id: 4, x1: 1.2, x2: -1.4, label: 1 },
        { id: 5, x1: 1.8, x2: -1.0, label: 1 },
        { id: 6, x1: 0.9, x2: -1.8, label: 1 },
        { id: 7, x1: 1.3, x2: 1.3, label: -1 },
        { id: 8, x1: 1.8, x2: 1.6, label: -1 },
        { id: 9, x1: 0.8, x2: 1.9, label: -1 },
        { id: 10, x1: -1.2, x2: -1.3, label: -1 },
        { id: 11, x1: -1.8, x2: -1.5, label: -1 },
        { id: 12, x1: -0.9, x2: -1.9, label: -1 }
      ]);
      setSvcKernel('rbf');
      setSvcGamma(1.4);
      setSvcBiasB(0.0);
      setSvc3dFeatureMap('rbf_pot');
    } else if (preset === 'outlier_stress') {
      setSvcPoints([
        { id: 1, x1: -2.2, x2: 1.6, label: 1 },
        { id: 2, x1: -1.6, x2: 0.9, label: 1 },
        { id: 3, x1: -1.0, x2: 1.9, label: 1 },
        { id: 4, x1: -2.3, x2: 0.3, label: 1 },
        { id: 5, x1: 1.0, x2: -1.3, label: -1 },
        { id: 6, x1: 1.6, x2: -0.6, label: -1 },
        { id: 7, x1: 2.1, x2: -1.9, label: -1 },
        { id: 8, x1: 1.3, x2: 0.3, label: -1 },
        { id: 9, x1: -1.4, x2: 1.1, label: -1 }
      ]);
      setSvcKernel('linear');
      setSvcMarginW(1.2);
      setSvcBiasB(0.2);
      setSvcC(1.0);
      setSvc3dFeatureMap('decision_plane');
    }
  };

  const handleSvcPointerDown = (e: React.PointerEvent, pointId: number) => {
    e.stopPropagation();
    try {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    setDraggingSvcPointId(pointId);
  };

  const handleSvcPointerMove = (e: React.PointerEvent) => {
    if (draggingSvcPointId === null || !svcSvgRef.current) return;
    const svg = svcSvgRef.current;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 640 - 320;
    const svgY = ((e.clientY - rect.top) / rect.height) * 480 - 240;
    const x1 = parseFloat(Math.max(-4.8, Math.min(4.8, svgX / 60)).toFixed(2));
    const x2 = parseFloat(Math.max(-3.5, Math.min(3.5, -svgY / 60)).toFixed(2));

    setSvcPoints(prev => prev.map(p => p.id === draggingSvcPointId ? { ...p, x1, x2 } : p));
  };

  const handleSvcPointerUp = (e: React.PointerEvent) => {
    if (draggingSvcPointId !== null) {
      try {
        (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
      setDraggingSvcPointId(null);
    }
  };

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

  // SVC Decision Function, Lagrange Multipliers (αᵢ), Confusion Matrix & 2D Iso-Contour Engine
  const svcAnalysis = useMemo(() => {
    const w1 = -1.2;
    const w2 = 1.0;
    const wNormSq = w1 * w1 + w2 * w2; // 2.44
    const wNorm = Math.sqrt(wNormSq); // 1.56205
    const effectiveBias = isBendingAnim ? -svcBiasB + Math.sin(timeT * 2.2) * 0.45 : -svcBiasB;

    // Decision Function Evaluator: f(x1, x2)
    const evalDecisionF = (x1: number, x2: number): number => {
      if (svcKernel === 'linear') {
        return w1 * x1 + w2 * x2 + effectiveBias;
      } else if (svcKernel === 'rbf') {
        let rbfSum = 0;
        svcPoints.forEach(p => {
          const dist2 = (x1 - p.x1) * (x1 - p.x1) + (x2 - p.x2) * (x2 - p.x2);
          rbfSum += p.label * Math.exp(-svcGamma * dist2);
        });
        return rbfSum + effectiveBias;
      } else {
        // Polynomial Kernel: (xᵀ x' + 1)^d representation
        let polySum = 0;
        svcPoints.forEach(p => {
          const dot = x1 * p.x1 + x2 * p.x2 + 1;
          polySum += p.label * Math.pow(Math.max(0, dot * 0.35), svcPolyDegree);
        });
        return polySum * 0.4 + effectiveBias;
      }
    };

    let totalSlack = 0;
    let supportVectorCount = 0;
    let marginViolatorCount = 0;
    let truePositives = 0;
    let trueNegatives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    const pointsWithStatus = svcPoints.map(p => {
      const fVal = evalDecisionF(p.x1, p.x2);
      const functionalMargin = p.label * fVal;
      const isMarginViolator = functionalMargin < 1.0;
      const slack = Math.max(0, 1.0 - functionalMargin);

      // Lagrange Multipliers: αᵢ ∈ [0, C]
      let alpha = 0;
      let svCategory: 'interior' | 'marginal_sv' | 'bounded_sv' = 'interior';

      if (functionalMargin < 0.98) {
        alpha = svcC; // Bounded Support Vector (Slack penalty active)
        svCategory = 'bounded_sv';
      } else if (Math.abs(functionalMargin - 1.0) <= 0.45) {
        alpha = parseFloat((svcC * Math.max(0.15, 1.0 - Math.abs(functionalMargin - 1.0) / 0.45)).toFixed(3));
        svCategory = 'marginal_sv';
      } else {
        alpha = 0;
        svCategory = 'interior';
      }

      const isSupportVector = svCategory !== 'interior';

      // Classification Matrix
      const predClass = fVal >= 0 ? 1 : -1;
      if (p.label === 1) {
        if (predClass === 1) truePositives++;
        else falseNegatives++;
      } else {
        if (predClass === -1) trueNegatives++;
        else falsePositives++;
      }

      // Exact perpendicular projection to target margin gutter (Linear)
      const gutterTarget = p.label * 1.0;
      const deltaScale = (gutterTarget - fVal) / wNormSq;
      const projX1 = p.x1 + deltaScale * w1;
      const projX2 = p.x2 + deltaScale * w2;

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
        svCategory,
        alpha,
        slack,
        projX1,
        projX2
      };
    });

    const totalPoints = svcPoints.length || 1;
    const accuracy = ((truePositives + trueNegatives) / totalPoints) * 100;
    const precision = (truePositives + falsePositives) > 0 ? (truePositives / (truePositives + falsePositives)) * 100 : 100;
    const recall = (truePositives + falseNegatives) > 0 ? (truePositives / (truePositives + falseNegatives)) * 100 : 100;
    const f1Score = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const objectiveLoss = 0.5 * wNormSq + svcC * totalSlack;

    // ─── 2D MARCHING SQUARES ISO-CONTOURS (f(x)=0, f(x)=+1, f(x)=-1) ───
    const cols = 44;
    const rows = 32;
    const xMin = -5.33;
    const xMax = 5.33;
    const yMin = -4.0;
    const yMax = 4.0;
    const dx = (xMax - xMin) / cols;
    const dy = (yMax - yMin) / rows;

    const gridValues: number[][] = [];
    for (let r = 0; r <= rows; r++) {
      gridValues[r] = [];
      const y = yMax - r * dy;
      for (let c = 0; c <= cols; c++) {
        const x = xMin + c * dx;
        gridValues[r][c] = evalDecisionF(x, y);
      }
    }

    const extractContourSegments = (targetIso: number): Array<{ x1: number; y1: number; x2: number; y2: number }> => {
      const segs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v0 = gridValues[r][c] - targetIso;
          const v1 = gridValues[r][c + 1] - targetIso;
          const v2 = gridValues[r + 1][c + 1] - targetIso;
          const v3 = gridValues[r + 1][c] - targetIso;

          const cellX = xMin + c * dx;
          const cellY = yMax - r * dy;

          let cellIndex = 0;
          if (v0 > 0) cellIndex |= 1;
          if (v1 > 0) cellIndex |= 2;
          if (v2 > 0) cellIndex |= 4;
          if (v3 > 0) cellIndex |= 8;

          if (cellIndex === 0 || cellIndex === 15) continue;

          // Edge linear interpolators
          const topEdge = { x: cellX + (Math.abs(v0) / (Math.abs(v0) + Math.abs(v1) || 1e-5)) * dx, y: cellY };
          const rightEdge = { x: cellX + dx, y: cellY - (Math.abs(v1) / (Math.abs(v1) + Math.abs(v2) || 1e-5)) * dy };
          const bottomEdge = { x: cellX + (Math.abs(v3) / (Math.abs(v3) + Math.abs(v2) || 1e-5)) * dx, y: cellY - dy };
          const leftEdge = { x: cellX, y: cellY - (Math.abs(v0) / (Math.abs(v0) + Math.abs(v3) || 1e-5)) * dy };

          const addSeg = (pA: { x: number; y: number }, pB: { x: number; y: number }) => {
            segs.push({
              x1: pA.x * 60,
              y1: -pA.y * 60,
              x2: pB.x * 60,
              y2: -pB.y * 60
            });
          };

          switch (cellIndex) {
            case 1: case 14: addSeg(leftEdge, topEdge); break;
            case 2: case 13: addSeg(topEdge, rightEdge); break;
            case 3: case 12: addSeg(leftEdge, rightEdge); break;
            case 4: case 11: addSeg(rightEdge, bottomEdge); break;
            case 5: addSeg(leftEdge, topEdge); addSeg(rightEdge, bottomEdge); break;
            case 6: case 9: addSeg(topEdge, bottomEdge); break;
            case 7: case 8: addSeg(leftEdge, bottomEdge); break;
            case 10: addSeg(leftEdge, bottomEdge); addSeg(topEdge, rightEdge); break;
          }
        }
      }
      return segs;
    };

    const segsToSvgPath = (segs: Array<{ x1: number; y1: number; x2: number; y2: number }>): string => {
      return segs.map(s => `M ${s.x1.toFixed(1)} ${s.y1.toFixed(1)} L ${s.x2.toFixed(1)} ${s.y2.toFixed(1)}`).join(' ');
    };

    const decisionBoundaryContours = svcKernel !== 'linear' ? extractContourSegments(0.0) : [];
    const upperGutterContours = svcKernel !== 'linear' ? extractContourSegments(1.0) : [];
    const lowerGutterContours = svcKernel !== 'linear' ? extractContourSegments(-1.0) : [];

    const marchingZeroContour = segsToSvgPath(decisionBoundaryContours);
    const marchingUpperMarginContour = segsToSvgPath(upperGutterContours);
    const marchingLowerMarginContour = segsToSvgPath(lowerGutterContours);

    return {
      pointsWithStatus,
      supportVectorCount,
      marginViolatorCount,
      totalSlack,
      objectiveLoss,
      accuracy,
      precision,
      recall,
      f1Score,
      truePositives,
      trueNegatives,
      falsePositives,
      falseNegatives,
      w1,
      w2,
      wNorm,
      wNormSq,
      effectiveBias,
      evalDecisionF,
      decisionBoundaryContours,
      upperGutterContours,
      lowerGutterContours,
      marchingZeroContour,
      marchingUpperMarginContour,
      marchingLowerMarginContour
    };
  }, [svcPoints, svcMarginW, svcBiasB, svcC, svcKernel, svcGamma, svcPolyDegree, isBendingAnim, timeT]);

  // 3D & 4D SVC Interactive Feature-Space & Hyperplane Slicing Canvas Rendering Effect
  useEffect(() => {
    if (activeModuleId !== 'svc_classifier' || (svcDimension !== '3d_plane' && svcDimension !== '4d_slice')) return;
    const canvas = canvasSvc3dRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
    ctx.clearRect(0, 0, width, height);

    const radX = (svc3dRotX * Math.PI) / 180;
    const radY = (svc3dRotY * Math.PI) / 180;

    const project3D = (x: number, y: number, z: number) => {
      const x1 = x * Math.cos(radY) + y * Math.sin(radY);
      const y1 = -x * Math.sin(radY) + y * Math.cos(radY);
      const y2 = y1 * Math.cos(radX) - z * Math.sin(radX);
      const z2 = y1 * Math.sin(radX) + z * Math.cos(radX);

      const distance = 8.0;
      const factor = distance / (z2 + distance);
      const scale = 56 * svc3dZoom;

      const sx = width / 2 + x1 * factor * scale;
      const sy = height / 2 + y2 * factor * scale * 0.7 - z2 * factor * scale * 0.55;
      return { sx, sy, depth: z2 };
    };

    if (svcDimension === '4d_slice') {
      // ═══════════════════════════════════════════════════════════════════════════
      // 4D HYPERPLANE SLICING ENGINE: w₁X₁ + w₂X₂ + w₃X₃ + w₄X₄ + b = 0
      // ═══════════════════════════════════════════════════════════════════════════
      const effSliceX4 = svc4dAutoSlice || isBendingAnim ? svc4dSliceX4 + Math.sin(timeT * 1.5) * 1.8 : svc4dSliceX4;
      const w1 = -1.2;
      const w2 = 1.0;
      const w3 = 0.85;
      const w4 = 0.95;
      const effB = isBendingAnim ? -svcBiasB + Math.sin(timeT * 2.2) * 0.45 : -svcBiasB;

      // 1. Draw 3D Ground Floor Grid (X3 = 0)
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
      ctx.lineWidth = 1.0;
      for (let gx = -2.8; gx <= 2.8; gx += 0.9) {
        const p1 = project3D(gx, -2.8, 0);
        const p2 = project3D(gx, 2.8, 0);
        ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
      }
      for (let gy = -2.8; gy <= 2.8; gy += 0.9) {
        const p1 = project3D(-2.8, gy, 0);
        const p2 = project3D(2.8, gy, 0);
        ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
      }

      // 2. Coordinate Axes (X₁, X₂, X₃)
      const origin = project3D(0, 0, 0);
      const x1Axis = project3D(3.2, 0, 0);
      const x2Axis = project3D(0, 3.2, 0);
      const x3Axis = project3D(0, 0, 3.2);

      ctx.lineWidth = 2.2;
      // X1 Axis (Gold)
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath(); ctx.moveTo(origin.sx, origin.sy); ctx.lineTo(x1Axis.sx, x1Axis.sy); ctx.stroke();
      ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 10px monospace';
      ctx.fillText('X₁ →', x1Axis.sx + 4, x1Axis.sy + 3);

      // X2 Axis (Emerald)
      ctx.strokeStyle = '#34d399';
      ctx.beginPath(); ctx.moveTo(origin.sx, origin.sy); ctx.lineTo(x2Axis.sx, x2Axis.sy); ctx.stroke();
      ctx.fillStyle = '#34d399'; ctx.font = 'bold 10px monospace';
      ctx.fillText('X₂ →', x2Axis.sx + 4, x2Axis.sy + 3);

      // X3 Axis (Purple)
      ctx.strokeStyle = '#a855f7';
      ctx.beginPath(); ctx.moveTo(origin.sx, origin.sy); ctx.lineTo(x3Axis.sx, x3Axis.sy); ctx.stroke();
      ctx.fillStyle = '#a855f7'; ctx.font = 'bold 10px monospace';
      ctx.fillText('X₃ ↑', x3Axis.sx + 4, x3Axis.sy - 4);

      // 3. 3D Separating Hyperplane Slicing Quad in (X₁, X₂, X₃) space
      const evalPlaneX3 = (x1: number, x2: number) => {
        return -(w1 * x1 + w2 * x2 + w4 * effSliceX4 + effB) / w3;
      };

      const range4D = 2.4;
      const steps = 10;
      const planeQuads: Array<{ p0: any; p1: any; p2: any; p3: any; avgZ: number; depth: number }> = [];

      for (let i = 0; i < steps; i++) {
        for (let j = 0; j < steps; j++) {
          const u1 = -range4D + (i / steps) * (2 * range4D);
          const u2 = -range4D + ((i + 1) / steps) * (2 * range4D);
          const v1 = -range4D + (j / steps) * (2 * range4D);
          const v2 = -range4D + ((j + 1) / steps) * (2 * range4D);

          const z1 = Math.max(-2.5, Math.min(2.5, evalPlaneX3(u1, v1)));
          const z2 = Math.max(-2.5, Math.min(2.5, evalPlaneX3(u2, v1)));
          const z3 = Math.max(-2.5, Math.min(2.5, evalPlaneX3(u2, v2)));
          const z4 = Math.max(-2.5, Math.min(2.5, evalPlaneX3(u1, v2)));

          const p0 = project3D(u1, v1, z1);
          const p1 = project3D(u2, v1, z2);
          const p2 = project3D(u2, v2, z3);
          const p3 = project3D(u1, v2, z4);

          planeQuads.push({
            p0, p1, p2, p3,
            avgZ: (z1 + z2 + z3 + z4) / 4,
            depth: (p0.depth + p1.depth + p2.depth + p3.depth) / 4
          });
        }
      }

      planeQuads.sort((a, b) => a.depth - b.depth);
      planeQuads.forEach(q => {
        ctx.beginPath();
        ctx.moveTo(q.p0.sx, q.p0.sy);
        ctx.lineTo(q.p1.sx, q.p1.sy);
        ctx.lineTo(q.p2.sx, q.p2.sy);
        ctx.lineTo(q.p3.sx, q.p3.sy);
        ctx.closePath();
        ctx.fillStyle = 'rgba(236, 72, 153, 0.24)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.65)';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      });

      // 4. Render 4D Data Spheres projected in (X₁, X₂, X₃) with 4D distance fading
      svc4dPoints.forEach(p => {
        const dist4D = Math.abs(p.x4 - effSliceX4);
        const inSliceWindow = dist4D <= svc4dSliceThickness;
        const opacity = inSliceWindow ? Math.max(0.25, 1.0 - (dist4D / svc4dSliceThickness) * 0.75) : 0.12;
        const radFactor = inSliceWindow ? 1.0 - (dist4D / svc4dSliceThickness) * 0.35 : 0.5;

        const spherePt = project3D(p.x1, p.x2, p.x3);
        const planeZ = evalPlaneX3(p.x1, p.x2);
        const planePt = project3D(p.x1, p.x2, planeZ);

        // Drop line to 3D separating hyperplane if in active slice
        if (inSliceWindow) {
          ctx.beginPath();
          ctx.moveTo(spherePt.sx, spherePt.sy);
          ctx.lineTo(planePt.sx, planePt.sy);
          ctx.strokeStyle = p.label === 1 ? `rgba(52, 211, 153, ${opacity * 0.7})` : `rgba(248, 113, 113, ${opacity * 0.7})`;
          ctx.lineWidth = 1.4;
          ctx.setLineDash([2, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 4D Point Sphere
        ctx.beginPath();
        ctx.arc(spherePt.sx, spherePt.sy, 7 * radFactor, 0, 2 * Math.PI);
        ctx.fillStyle = p.label === 1 ? `rgba(52, 211, 153, ${opacity})` : `rgba(248, 113, 113, ${opacity})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // 4D Tag for active points
        if (inSliceWindow && (showSvcPointLabels || hoveredSvcPointId === p.id)) {
          ctx.fillStyle = '#ec4899';
          ctx.font = 'bold 8px monospace';
          ctx.fillText(`P${p.id}[X₄=${p.x4.toFixed(1)}]`, spherePt.sx + 8, spherePt.sy - 2);
        }
      });
    } else {
      // ═══════════════════════════════════════════════════════════════════════════
      // 3D FEATURE SPACE LIFT ENGINE: Φ(X) Paraboloid / RBF Potential / Decision
      // ═══════════════════════════════════════════════════════════════════════════
      // 1. Draw 3D Ground Floor Grid (Z = 0)
      const floorZ = 0;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.20)';
      ctx.lineWidth = 1.0;
      for (let gx = -3.0; gx <= 3.0; gx += 1.0) {
        const p1 = project3D(gx, -3.0, floorZ);
        const p2 = project3D(gx, 3.0, floorZ);
        ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
      }
      for (let gy = -3.0; gy <= 3.0; gy += 1.0) {
        const p1 = project3D(-3.0, gy, floorZ);
        const p2 = project3D(3.0, gy, floorZ);
        ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
      }

      // 2. Coordinate Axes (X₁, X₂, Φ(X))
      const origin = project3D(0, 0, 0);
      const x1Axis = project3D(3.4, 0, 0);
      const x2Axis = project3D(0, 3.4, 0);
      const zAxis = project3D(0, 0, 4.2);

      ctx.lineWidth = 2.2;
      // X1 Axis (Gold)
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath(); ctx.moveTo(origin.sx, origin.sy); ctx.lineTo(x1Axis.sx, x1Axis.sy); ctx.stroke();
      ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 10px monospace';
      ctx.fillText('X₁ →', x1Axis.sx + 4, x1Axis.sy + 3);

      // X2 Axis (Emerald)
      ctx.strokeStyle = '#34d399';
      ctx.beginPath(); ctx.moveTo(origin.sx, origin.sy); ctx.lineTo(x2Axis.sx, x2Axis.sy); ctx.stroke();
      ctx.fillStyle = '#34d399'; ctx.font = 'bold 10px monospace';
      ctx.fillText('X₂ →', x2Axis.sx + 4, x2Axis.sy + 3);

      // Z / Phi Axis (Purple)
      ctx.strokeStyle = '#a855f7';
      ctx.beginPath(); ctx.moveTo(origin.sx, origin.sy); ctx.lineTo(zAxis.sx, zAxis.sy); ctx.stroke();
      ctx.fillStyle = '#a855f7'; ctx.font = 'bold 10px monospace';
      ctx.fillText(svc3dFeatureMap === 'paraboloid' ? 'Φ(X) = X₁²+X₂² ↑' : svc3dFeatureMap === 'rbf_pot' ? 'RBF Potential ↑' : 'Decision Output ↑', zAxis.sx + 4, zAxis.sy - 4);

      // 3. Feature-Space 3D Paraboloid / Kernel Manifold Mesh
      const N = 18;
      const range = 2.8;
      const meshQuads: Array<{ p0: any; p1: any; p2: any; p3: any; avgZ: number; depth: number }> = [];

      const eval3DHeight = (x: number, y: number): number => {
        const waveTerm = isBendingAnim ? Math.sin(timeT * 2.5 + x * 0.8 + y * 0.8) * 0.08 : 0;
        if (svc3dFeatureMap === 'paraboloid') {
          return 0.32 * (x * x + y * y) + waveTerm;
        } else if (svc3dFeatureMap === 'rbf_pot') {
          let pot = 0;
          svcPoints.forEach(p => {
            const d2 = (x - p.x1) * (x - p.x1) + (y - p.x2) * (y - p.x2);
            pot += p.label * Math.exp(-svcGamma * d2);
          });
          return Math.max(0, pot * 1.5 + 1.2 + waveTerm);
        } else {
          const effectiveB = isBendingAnim ? -svcBiasB + Math.sin(timeT * 2.2) * 0.45 : -svcBiasB;
          return Math.max(0, 0.4 * (1.2 * x - 1.0 * y - effectiveB) + 1.2);
        }
      };

      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const u1 = -range + (i / N) * (2 * range);
          const u2 = -range + ((i + 1) / N) * (2 * range);
          const v1 = -range + (j / N) * (2 * range);
          const v2 = -range + ((j + 1) / N) * (2 * range);

          const z1 = eval3DHeight(u1, v1);
          const z2 = eval3DHeight(u2, v1);
          const z3 = eval3DHeight(u2, v2);
          const z4 = eval3DHeight(u1, v2);

          const p0 = project3D(u1, v1, z1);
          const p1 = project3D(u2, v1, z2);
          const p2 = project3D(u2, v2, z3);
          const p3 = project3D(u1, v2, z4);

          meshQuads.push({
            p0, p1, p2, p3,
            avgZ: (z1 + z2 + z3 + z4) / 4,
            depth: (p0.depth + p1.depth + p2.depth + p3.depth) / 4
          });
        }
      }

      // Depth Sorting
      meshQuads.sort((a, b) => a.depth - b.depth);

      // Render 3D Feature Mesh
      meshQuads.forEach(q => {
        ctx.beginPath();
        ctx.moveTo(q.p0.sx, q.p0.sy);
        ctx.lineTo(q.p1.sx, q.p1.sy);
        ctx.lineTo(q.p2.sx, q.p2.sy);
        ctx.lineTo(q.p3.sx, q.p3.sy);
        ctx.closePath();

        const normZ = Math.min(1, q.avgZ / 3.0);
        ctx.fillStyle = `rgba(${Math.round(20 + normZ * 80)}, ${Math.round(180 - normZ * 80)}, ${Math.round(240 - normZ * 60)}, 0.18)`;
        ctx.fill();
        ctx.strokeStyle = `rgba(56, 189, 248, 0.28)`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // 4. Glowing 3D Separating Hyperplane Slicing Plane
      const sliceZ = svc3dFeatureMap === 'paraboloid' ? 1.4 + (isBendingAnim ? Math.sin(timeT * 2.0) * 0.45 : 0) : 1.2;
      const sp0 = project3D(-2.8, -2.8, sliceZ);
      const sp1 = project3D(2.8, -2.8, sliceZ);
      const sp2 = project3D(2.8, 2.8, sliceZ);
      const sp3 = project3D(-2.8, 2.8, sliceZ);

      ctx.beginPath();
      ctx.moveTo(sp0.sx, sp0.sy);
      ctx.lineTo(sp1.sx, sp1.sy);
      ctx.lineTo(sp2.sx, sp2.sy);
      ctx.lineTo(sp3.sx, sp3.sy);
      ctx.closePath();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // 5. Render Lifted 3D Data Spheres with Vertical Drop Stalks
      svcAnalysis.pointsWithStatus.forEach(p => {
        const zHeight = eval3DHeight(p.x1, p.x2);
        const groundPt = project3D(p.x1, p.x2, 0);
        const spherePt = project3D(p.x1, p.x2, zHeight);

        // Vertical Stalk
        ctx.beginPath();
        ctx.moveTo(groundPt.sx, groundPt.sy);
        ctx.lineTo(spherePt.sx, spherePt.sy);
        ctx.strokeStyle = p.label === 1 ? 'rgba(52, 211, 153, 0.7)' : 'rgba(248, 113, 113, 0.7)';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ground Footprint
        ctx.beginPath();
        ctx.arc(groundPt.sx, groundPt.sy, 4, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.fill();

        // Support Vector Halo Ring
        if (p.isSupportVector) {
          ctx.beginPath();
          ctx.arc(spherePt.sx, spherePt.sy, 14, 0, 2 * Math.PI);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2.2;
          ctx.setLineDash([4, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Core 3D Point Sphere
        ctx.beginPath();
        ctx.arc(spherePt.sx, spherePt.sy, 7, 0, 2 * Math.PI);
        ctx.fillStyle = p.label === 1 ? '#34d399' : '#f87171';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Lagrange Multiplier Tag
        if (p.isSupportVector) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.font = 'bold 8.5px monospace';
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(`α=${p.alpha.toFixed(2)}`, spherePt.sx + 9, spherePt.sy - 3);
        }
      });
    }

    ctx.restore();
  }, [activeModuleId, svcDimension, svc3dRotX, svc3dRotY, svc3dZoom, svc3dFeatureMap, svcPoints, svc4dPoints, svc4dSliceX4, svc4dAutoSlice, svc4dSliceThickness, svcKernel, svcGamma, svcPolyDegree, svcBiasB, isBendingAnim, timeT, svcAnalysis]);

  // 3D Canvas Mouse Interaction Handlers (Orbit & Zoom)
  const handleSvc3dMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDraggingSvc3D(true);
    dragSvc3dStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rx: svc3dRotX,
      ry: svc3dRotY
    };
  };

  const handleSvc3dMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingSvc3D) return;
    const dx = e.clientX - dragSvc3dStartRef.current.x;
    const dy = e.clientY - dragSvc3dStartRef.current.y;
    setSvc3dRotX(Math.max(-85, Math.min(85, dragSvc3dStartRef.current.rx - dy * 0.4)));
    setSvc3dRotY((dragSvc3dStartRef.current.ry + dx * 0.4) % 360);
  };

  const handleSvc3dMouseUp = () => {
    setIsDraggingSvc3D(false);
  };

  const handleSvc3dWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setSvc3dZoom(prev => Math.max(0.4, Math.min(2.5, prev - e.deltaY * 0.0012)));
  };

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
  type CalcModeType = 'tangent_secant' | 'riemann_sums' | 'derivatives';
  type CalcPresetType = 'cubic' | 'sinusoid' | 'bell' | 'quartic' | 'rational' | 'damped';
  type RiemannMethodType = 'left' | 'right' | 'midpoint' | 'trapezoid' | 'simpson';

  const [calcMode, setCalcMode] = useState<CalcModeType>('tangent_secant');
  const [calcPreset, setCalcPreset] = useState<CalcPresetType>('cubic');
  const [calcX0, setCalcX0] = useState<number>(0.8);
  const [calcH, setCalcH] = useState<number>(0.5);
  const [calcIntegralN, setCalcIntegralN] = useState<number>(12);
  const [riemannMethod, setRiemannMethod] = useState<RiemannMethodType>('midpoint');
  const [calcBoundA, setCalcBoundA] = useState<number>(-2.0);
  const [calcBoundB, setCalcBoundB] = useState<number>(2.0);
  const [showDeriv1Curve, setShowDeriv1Curve] = useState<boolean>(true);
  const [showDeriv2Curve, setShowDeriv2Curve] = useState<boolean>(true);
  const [showCritPoints, setShowCritPoints] = useState<boolean>(true);
  const [showInflectionPoints, setShowInflectionPoints] = useState<boolean>(true);
  const [showCalcFormulaHud, setShowCalcFormulaHud] = useState<boolean>(true);
  const [isAnimateH, setIsAnimateH] = useState<boolean>(false);

  // Auto-converge animation for Secant Step h -> 0
  useEffect(() => {
    if (!isAnimateH || calcMode !== 'tangent_secant') return;
    let animH = calcH;
    let dir = -1;
    const interval = setInterval(() => {
      if (dir === -1) {
        animH -= 0.025;
        if (animH <= 0.02) {
          animH = 0.02;
          dir = 1;
        }
      } else {
        animH += 0.025;
        if (animH >= 1.2) {
          animH = 1.2;
          dir = -1;
        }
      }
      setCalcH(Number(animH.toFixed(2)));
    }, 45);
    return () => clearInterval(interval);
  }, [isAnimateH, calcMode]);

  const evalCalcFunction = (x: number, preset: CalcPresetType = calcPreset): number => {
    switch (preset) {
      case 'sinusoid':
        return 1.5 * Math.sin(1.8 * x);
      case 'bell':
        return 2.2 * Math.exp(-0.8 * x * x);
      case 'quartic':
        return 0.25 * Math.pow(x, 4) - Math.pow(x, 2) + 0.5;
      case 'rational':
        return 2.5 / (1 + x * x);
      case 'damped':
        return 2.0 * Math.exp(-0.4 * x) * Math.cos(2.2 * x);
      case 'cubic':
      default:
        return 0.35 * Math.pow(x, 3) - 0.8 * x;
    }
  };

  const evalCalcDerivative = (x: number, preset: CalcPresetType = calcPreset): number => {
    switch (preset) {
      case 'sinusoid':
        return 2.7 * Math.cos(1.8 * x);
      case 'bell':
        return -3.52 * x * Math.exp(-0.8 * x * x);
      case 'quartic':
        return Math.pow(x, 3) - 2 * x;
      case 'rational':
        return (-5.0 * x) / Math.pow(1 + x * x, 2);
      case 'damped':
        return 2.0 * Math.exp(-0.4 * x) * (-0.4 * Math.cos(2.2 * x) - 2.2 * Math.sin(2.2 * x));
      case 'cubic':
      default:
        return 1.05 * Math.pow(x, 2) - 0.8;
    }
  };

  const evalCalcSecondDerivative = (x: number, preset: CalcPresetType = calcPreset): number => {
    switch (preset) {
      case 'sinusoid':
        return -4.86 * Math.sin(1.8 * x);
      case 'bell':
        return 3.52 * (1.6 * x * x - 1) * Math.exp(-0.8 * x * x);
      case 'quartic':
        return 3 * Math.pow(x, 2) - 2;
      case 'rational':
        return (5.0 * (3 * x * x - 1)) / Math.pow(1 + x * x, 3);
      case 'damped':
        return 2.0 * Math.exp(-0.4 * x) * (-4.68 * Math.cos(2.2 * x) + 1.76 * Math.sin(2.2 * x));
      case 'cubic':
      default:
        return 2.1 * x;
    }
  };

  const evalCalcAntiDerivative = (x: number, preset: CalcPresetType = calcPreset): number => {
    switch (preset) {
      case 'sinusoid':
        return -(5.0 / 6.0) * Math.cos(1.8 * x);
      case 'bell': {
        // High-precision Simpson integration of 2.2 * exp(-0.8 u^2) from 0 to x
        const steps = 64;
        const h = x / steps;
        let sum = 2.2 + 2.2 * Math.exp(-0.8 * x * x);
        for (let i = 1; i < steps; i++) {
          const u = i * h;
          sum += (i % 2 === 0 ? 2 : 4) * 2.2 * Math.exp(-0.8 * u * u);
        }
        return (sum * h) / 3;
      }
      case 'quartic':
        return 0.05 * Math.pow(x, 5) - (1.0 / 3.0) * Math.pow(x, 3) + 0.5 * x;
      case 'rational':
        return 2.5 * Math.atan(x);
      case 'damped':
        return (2.0 * Math.exp(-0.4 * x) / 5.0) * (-0.4 * Math.cos(2.2 * x) + 2.2 * Math.sin(2.2 * x));
      case 'cubic':
      default:
        return 0.0875 * Math.pow(x, 4) - 0.4 * Math.pow(x, 2);
    }
  };

  const getCalcTelemetry = (
    preset: CalcPresetType,
    x0: number,
    h: number,
    a: number,
    b: number,
    n: number,
    method: RiemannMethodType
  ) => {
    // 1. Tangent & Secant Limit
    const y0 = evalCalcFunction(x0, preset);
    const y1 = evalCalcFunction(x0 + h, preset);
    const deltaY = y1 - y0;
    const secantSlope = deltaY / h;
    const tangentSlope = evalCalcDerivative(x0, preset);
    const secantError = Math.abs(secantSlope - tangentSlope);

    // 2. Exact Definite Integral
    const exactIntegral = evalCalcAntiDerivative(b, preset) - evalCalcAntiDerivative(a, preset);

    // 3. Numerical Riemann Sum
    const effA = Math.min(a, b);
    const effB = Math.max(a, b);
    const dx = (effB - effA) / n;
    let riemannSum = 0;

    if (method === 'left') {
      for (let i = 0; i < n; i++) {
        riemannSum += evalCalcFunction(effA + i * dx, preset) * dx;
      }
    } else if (method === 'right') {
      for (let i = 0; i < n; i++) {
        riemannSum += evalCalcFunction(effA + (i + 1) * dx, preset) * dx;
      }
    } else if (method === 'midpoint') {
      for (let i = 0; i < n; i++) {
        riemannSum += evalCalcFunction(effA + (i + 0.5) * dx, preset) * dx;
      }
    } else if (method === 'trapezoid') {
      for (let i = 0; i < n; i++) {
        const yL = evalCalcFunction(effA + i * dx, preset);
        const yR = evalCalcFunction(effA + (i + 1) * dx, preset);
        riemannSum += ((yL + yR) / 2) * dx;
      }
    } else if (method === 'simpson') {
      const effN = n % 2 === 0 ? n : n + 1;
      const sDx = (effB - effA) / effN;
      let sSum = evalCalcFunction(effA, preset) + evalCalcFunction(effB, preset);
      for (let i = 1; i < effN; i++) {
        const u = effA + i * sDx;
        sSum += (i % 2 === 0 ? 2 : 4) * evalCalcFunction(u, preset);
      }
      riemannSum = (sSum * sDx) / 3;
    }

    const integralError = Math.abs(riemannSum - exactIntegral);
    const relativeErrorPct = exactIntegral !== 0 ? (integralError / Math.abs(exactIntegral)) * 100 : 0;

    // 4. Formula LaTeX representation
    let formulaLatex = 'f(x) = 0.35x^3 - 0.8x';
    let derivLatex = "f'(x) = 1.05x^2 - 0.8";
    let deriv2Latex = "f''(x) = 2.1x";

    if (preset === 'sinusoid') {
      formulaLatex = 'f(x) = 1.5\\sin(1.8x)';
      derivLatex = "f'(x) = 2.7\\cos(1.8x)";
      deriv2Latex = "f''(x) = -4.86\\sin(1.8x)";
    } else if (preset === 'bell') {
      formulaLatex = 'f(x) = 2.2e^{-0.8x^2}';
      derivLatex = "f'(x) = -3.52xe^{-0.8x^2}";
      deriv2Latex = "f''(x) = 3.52(1.6x^2-1)e^{-0.8x^2}";
    } else if (preset === 'quartic') {
      formulaLatex = 'f(x) = 0.25x^4 - x^2 + 0.5';
      derivLatex = "f'(x) = x^3 - 2x";
      deriv2Latex = "f''(x) = 3x^2 - 2";
    } else if (preset === 'rational') {
      formulaLatex = 'f(x) = \\frac{2.5}{1 + x^2}';
      derivLatex = "f'(x) = \\frac{-5x}{(1+x^2)^2}";
      deriv2Latex = "f''(x) = \\frac{5(3x^2-1)}{(1+x^2)^3}";
    } else if (preset === 'damped') {
      formulaLatex = 'f(x) = 2.0e^{-0.4x}\\cos(2.2x)';
      derivLatex = "f'(x) = e^{-0.4x}(-0.8\\cos(2.2x) - 4.4\\sin(2.2x))";
      deriv2Latex = "f''(x) = 2e^{-0.4x}(-4.68\\cos(2.2x) + 1.76\\sin(2.2x))";
    }

    return {
      y0,
      y1,
      deltaY,
      secantSlope,
      tangentSlope,
      secantError,
      exactIntegral,
      riemannSum,
      integralError,
      relativeErrorPct,
      formulaLatex,
      derivLatex,
      deriv2Latex
    };
  };

  const getCalcKeyPoints = (preset: CalcPresetType) => {
    const points: Array<{ x: number; y: number; type: 'max' | 'min' | 'inflection'; label: string }> = [];
    if (preset === 'cubic') {
      const root = Math.sqrt(0.8 / 1.05); // ~0.873
      points.push({ x: -root, y: evalCalcFunction(-root, preset), type: 'max', label: '▲ MAX (-0.87)' });
      points.push({ x: root, y: evalCalcFunction(root, preset), type: 'min', label: '▼ MIN (+0.87)' });
      points.push({ x: 0, y: 0, type: 'inflection', label: '◆ INFLECTION (0, 0)' });
    } else if (preset === 'sinusoid') {
      const r1 = Math.PI / (2 * 1.8);
      const r2 = (3 * Math.PI) / (2 * 1.8);
      points.push({ x: -r2, y: evalCalcFunction(-r2, preset), type: 'max', label: '▲ MAX (-2.62)' });
      points.push({ x: -r1, y: evalCalcFunction(-r1, preset), type: 'min', label: '▼ MIN (-0.87)' });
      points.push({ x: r1, y: evalCalcFunction(r1, preset), type: 'max', label: '▲ MAX (+0.87)' });
      points.push({ x: r2, y: evalCalcFunction(r2, preset), type: 'min', label: '▼ MIN (+2.62)' });
      points.push({ x: 0, y: 0, type: 'inflection', label: '◆ INFLECTION (0)' });
      points.push({ x: -Math.PI / 1.8, y: 0, type: 'inflection', label: '◆ INFLECTION (-1.75)' });
      points.push({ x: Math.PI / 1.8, y: 0, type: 'inflection', label: '◆ INFLECTION (+1.75)' });
    } else if (preset === 'bell') {
      points.push({ x: 0, y: 2.2, type: 'max', label: '▲ GLOBAL MAX (0, 2.2)' });
      const infl = 1 / Math.sqrt(1.6);
      points.push({ x: -infl, y: evalCalcFunction(-infl, preset), type: 'inflection', label: '◆ INFLECTION (-0.79)' });
      points.push({ x: infl, y: evalCalcFunction(infl, preset), type: 'inflection', label: '◆ INFLECTION (+0.79)' });
    } else if (preset === 'quartic') {
      points.push({ x: 0, y: 0.5, type: 'max', label: '▲ LOCAL MAX (0, 0.5)' });
      const r = Math.SQRT2;
      points.push({ x: -r, y: evalCalcFunction(-r, preset), type: 'min', label: '▼ MIN (-1.41, -0.5)' });
      points.push({ x: r, y: evalCalcFunction(r, preset), type: 'min', label: '▼ MIN (+1.41, -0.5)' });
      const inf = Math.sqrt(2 / 3);
      points.push({ x: -inf, y: evalCalcFunction(-inf, preset), type: 'inflection', label: '◆ INFLECTION (-0.82)' });
      points.push({ x: inf, y: evalCalcFunction(inf, preset), type: 'inflection', label: '◆ INFLECTION (+0.82)' });
    } else if (preset === 'rational') {
      points.push({ x: 0, y: 2.5, type: 'max', label: '▲ MAX (0, 2.5)' });
      const inf = 1 / Math.sqrt(3);
      points.push({ x: -inf, y: evalCalcFunction(-inf, preset), type: 'inflection', label: '◆ INFLECTION (-0.58)' });
      points.push({ x: inf, y: evalCalcFunction(inf, preset), type: 'inflection', label: '◆ INFLECTION (+0.58)' });
    } else if (preset === 'damped') {
      points.push({ x: 0, y: 2.0, type: 'max', label: '▲ PEAK (0, 2.0)' });
      points.push({ x: 1.34, y: evalCalcFunction(1.34, preset), type: 'min', label: '▼ MIN (+1.34)' });
      points.push({ x: -1.34, y: evalCalcFunction(-1.34, preset), type: 'min', label: '▼ MIN (-1.34)' });
    }
    return points;
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
  const [zoom3D, setZoom3D] = useState<number>(1.0);
  const [shadingMode, setShadingMode] = useState<'solid' | 'wireframe' | 'both'>('solid');
  const [surfaceColormap, setSurfaceColormap] = useState<'cyberpunk' | 'plasma' | 'emerald' | 'sunset'>('cyberpunk');
  const [show3dAxes, setShow3dAxes] = useState<boolean>(true);
  const [showFloorGrid, setShowFloorGrid] = useState<boolean>(true);
  const [showCriticalPoints, setShowCriticalPoints] = useState<boolean>(true);
  const [showGradientQuiver, setShowGradientQuiver] = useState<boolean>(false);
  const [meshResolution, setMeshResolution] = useState<number>(26);
  const [showRollingBall, setShowRollingBall] = useState<boolean>(true);
  type OptimizerType = 'sgd' | 'momentum' | 'adam' | 'race';
  const [optimizerMode, setOptimizerMode] = useState<OptimizerType>('momentum');
  const [isBallPaused, setIsBallPaused] = useState<boolean>(false);
  const [ballLearningRate, setBallLearningRate] = useState<number>(0.07);
  const [ballMomentum, setBallMomentum] = useState<number>(0.72);
  const [ballPhysicsTick, setBallPhysicsTick] = useState<number>(0);
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
    // Multi-Optimizer Race Agents
    sgd: { x: number; y: number; z: number; history: Array<{ x: number; y: number; z: number }>; gradNorm: number; stepCount: number };
    momentum: { x: number; y: number; z: number; vx: number; vy: number; history: Array<{ x: number; y: number; z: number }>; gradNorm: number; stepCount: number };
    adam: { x: number; y: number; z: number; mX: number; mY: number; vX: number; vY: number; t: number; history: Array<{ x: number; y: number; z: number }>; gradNorm: number; stepCount: number };
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
    isActive: true,
    sgd: { x: -1.3, y: 1.1, z: 0.2, history: [{ x: -1.3, y: 1.1, z: 0.2 }], gradNorm: 0, stepCount: 0 },
    momentum: { x: -1.3, y: 1.1, z: 0.2, vx: 0, vy: 0, history: [{ x: -1.3, y: 1.1, z: 0.2 }], gradNorm: 0, stepCount: 0 },
    adam: { x: -1.3, y: 1.1, z: 0.2, mX: 0, mY: 0, vX: 0, vY: 0, t: 0, history: [{ x: -1.3, y: 1.1, z: 0.2 }], gradNorm: 0, stepCount: 0 }
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
      isActive: true,
      sgd: { x: rx, y: ry, z: pz, history: [{ x: rx, y: ry, z: pz }], gradNorm: 0, stepCount: 0 },
      momentum: { x: rx, y: ry, z: pz, vx: 0, vy: 0, history: [{ x: rx, y: ry, z: pz }], gradNorm: 0, stepCount: 0 },
      adam: { x: rx, y: ry, z: pz, mX: 0, mY: 0, vX: 0, vY: 0, t: 0, history: [{ x: rx, y: ry, z: pz }], gradNorm: 0, stepCount: 0 }
    };
    setBallPhysicsTick(prev => prev + 1);
  };

  // Discrete single-step manual gradient calculation
  const stepSingleOptimizerIteration = (customSpeed: number = 1.0) => {
    const phys = ballPhysicsRef.current;
    if (!phys) return;
    const effW = surfaceType === 'hyper_4d' ? (autoSlice4D || isBendingAnim ? hyperW + timeT * 0.7 : hyperW) : 0;
    const eps = 0.005;

    if (surfaceType === 'torus') {
      phys.u = (phys.u + 0.04 * customSpeed * 1.4) % (2 * Math.PI);
      phys.v = (phys.v + 0.04 * customSpeed * 2.8) % (2 * Math.PI);
      const pt = eval3DSurface(phys.u, phys.v, 'torus', 0, timeT, isBendingAnim);
      phys.x = pt.x;
      phys.y = pt.y;
      phys.history.push({ x: pt.x, y: pt.y, z: pt.z });
      if (phys.history.length > 90) phys.history.shift();
      phys.stepCount += 1;
      setBallPhysicsTick(prev => prev + 1);
      return;
    }

    if (surfaceType === 'mobius') {
      phys.u = (phys.u + 0.04 * customSpeed * 1.2) % (4 * Math.PI);
      phys.v = 0.55 * Math.sin(phys.u * 1.5);
      const pt = eval3DSurface(phys.u, phys.v, 'mobius', 0, timeT, isBendingAnim);
      phys.x = pt.x;
      phys.y = pt.y;
      phys.history.push({ x: pt.x, y: pt.y, z: pt.z });
      if (phys.history.length > 90) phys.history.shift();
      phys.stepCount += 1;
      setBallPhysicsTick(prev => prev + 1);
      return;
    }

    // Explicit surface descent step
    if (optimizerMode === 'sgd' || optimizerMode === 'race') {
      const zXp = eval3DSurface(phys.sgd.x + eps, phys.sgd.y, surfaceType, effW, timeT, isBendingAnim).z;
      const zXm = eval3DSurface(phys.sgd.x - eps, phys.sgd.y, surfaceType, effW, timeT, isBendingAnim).z;
      const zYp = eval3DSurface(phys.sgd.x, phys.sgd.y + eps, surfaceType, effW, timeT, isBendingAnim).z;
      const zYm = eval3DSurface(phys.sgd.x, phys.sgd.y - eps, surfaceType, effW, timeT, isBendingAnim).z;
      const gx = (zXp - zXm) / (2 * eps);
      const gy = (zYp - zYm) / (2 * eps);
      phys.sgd.gradNorm = Math.hypot(gx, gy);
      if (phys.sgd.gradNorm > 0.0005) {
        const nx = Math.max(-2.0, Math.min(2.0, phys.sgd.x - ballLearningRate * gx * customSpeed));
        const ny = Math.max(-2.0, Math.min(2.0, phys.sgd.y - ballLearningRate * gy * customSpeed));
        const nz = eval3DSurface(nx, ny, surfaceType, effW, timeT, isBendingAnim).z;
        phys.sgd.x = nx;
        phys.sgd.y = ny;
        phys.sgd.z = nz;
        phys.sgd.history.push({ x: nx, y: ny, z: nz });
        if (phys.sgd.history.length > 80) phys.sgd.history.shift();
        phys.sgd.stepCount += 1;
      }
    }

    if (optimizerMode === 'momentum' || optimizerMode === 'race') {
      const zXp = eval3DSurface(phys.momentum.x + eps, phys.momentum.y, surfaceType, effW, timeT, isBendingAnim).z;
      const zXm = eval3DSurface(phys.momentum.x - eps, phys.momentum.y, surfaceType, effW, timeT, isBendingAnim).z;
      const zYp = eval3DSurface(phys.momentum.x, phys.momentum.y + eps, surfaceType, effW, timeT, isBendingAnim).z;
      const zYm = eval3DSurface(phys.momentum.x, phys.momentum.y - eps, surfaceType, effW, timeT, isBendingAnim).z;
      const gx = (zXp - zXm) / (2 * eps);
      const gy = (zYp - zYm) / (2 * eps);
      phys.momentum.gradNorm = Math.hypot(gx, gy);
      if (phys.momentum.gradNorm > 0.0005) {
        phys.momentum.vx = phys.momentum.vx * ballMomentum - ballLearningRate * gx;
        phys.momentum.vy = phys.momentum.vy * ballMomentum - ballLearningRate * gy;
        const nx = Math.max(-2.0, Math.min(2.0, phys.momentum.x + phys.momentum.vx * customSpeed));
        const ny = Math.max(-2.0, Math.min(2.0, phys.momentum.y + phys.momentum.vy * customSpeed));
        const nz = eval3DSurface(nx, ny, surfaceType, effW, timeT, isBendingAnim).z;
        phys.momentum.x = nx;
        phys.momentum.y = ny;
        phys.momentum.z = nz;
        phys.momentum.history.push({ x: nx, y: ny, z: nz });
        if (phys.momentum.history.length > 80) phys.momentum.history.shift();
        phys.momentum.stepCount += 1;
      }
    }

    if (optimizerMode === 'adam' || optimizerMode === 'race') {
      const zXp = eval3DSurface(phys.adam.x + eps, phys.adam.y, surfaceType, effW, timeT, isBendingAnim).z;
      const zXm = eval3DSurface(phys.adam.x - eps, phys.adam.y, surfaceType, effW, timeT, isBendingAnim).z;
      const zYp = eval3DSurface(phys.adam.x, phys.adam.y + eps, surfaceType, effW, timeT, isBendingAnim).z;
      const zYm = eval3DSurface(phys.adam.x, phys.adam.y - eps, surfaceType, effW, timeT, isBendingAnim).z;
      const gx = (zXp - zXm) / (2 * eps);
      const gy = (zYp - zYm) / (2 * eps);
      phys.adam.gradNorm = Math.hypot(gx, gy);
      if (phys.adam.gradNorm > 0.0005) {
        phys.adam.t += 1;
        const beta1 = 0.9, beta2 = 0.999, epsAdam = 1e-7;
        phys.adam.mX = beta1 * phys.adam.mX + (1 - beta1) * gx;
        phys.adam.mY = beta1 * phys.adam.mY + (1 - beta1) * gy;
        phys.adam.vX = beta2 * phys.adam.vX + (1 - beta2) * gx * gx;
        phys.adam.vY = beta2 * phys.adam.vY + (1 - beta2) * gy * gy;
        const mHatX = phys.adam.mX / (1 - Math.pow(beta1, phys.adam.t));
        const mHatY = phys.adam.mY / (1 - Math.pow(beta1, phys.adam.t));
        const vHatX = phys.adam.vX / (1 - Math.pow(beta2, phys.adam.t));
        const vHatY = phys.adam.vY / (1 - Math.pow(beta2, phys.adam.t));
        const stepX = (ballLearningRate * 0.95 / (Math.sqrt(vHatX) + epsAdam)) * mHatX;
        const stepY = (ballLearningRate * 0.95 / (Math.sqrt(vHatY) + epsAdam)) * mHatY;
        const nx = Math.max(-2.0, Math.min(2.0, phys.adam.x - stepX * customSpeed));
        const ny = Math.max(-2.0, Math.min(2.0, phys.adam.y - stepY * customSpeed));
        const nz = eval3DSurface(nx, ny, surfaceType, effW, timeT, isBendingAnim).z;
        phys.adam.x = nx;
        phys.adam.y = ny;
        phys.adam.z = nz;
        phys.adam.history.push({ x: nx, y: ny, z: nz });
        if (phys.adam.history.length > 80) phys.adam.history.shift();
        phys.adam.stepCount += 1;
      }
    }

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
      const baseZ = 0.42 * (u * u - v * v);
      const z = hasWave
        ? baseZ * Math.cos(waveT * 1.2) + 0.14 * Math.sin(2.2 * u + waveT * 2.0) * Math.cos(2.2 * v)
        : baseZ;
      return { x, y, z };
    } else if (type === 'monkey') {
      const x = u;
      const y = v;
      const baseZ = 0.22 * (Math.pow(u, 3) - 3 * u * Math.pow(v, 2));
      const z = hasWave
        ? 0.22 * ((Math.pow(u, 3) - 3 * u * Math.pow(v, 2)) * Math.cos(waveT * 1.2) + (3 * Math.pow(u, 2) * v - Math.pow(v, 3)) * Math.sin(waveT * 1.2))
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
      const baseZ = 0.014 * rawZ - 1.2;
      const z = hasWave
        ? baseZ + 0.14 * Math.sin(2 * u + waveT * 1.8) * Math.sin(2 * v + waveT * 1.4)
        : baseZ;
      return { x, y, z };
    } else {
      // 4D Hyperplane Slicing: z = (x^2 - y^2) * cos(w) + 2xy * sin(w)
      const x = u;
      const y = v;
      const baseZ = 0.42 * ((u * u - v * v) * Math.cos(w) + 2 * u * v * Math.sin(w));
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

      const dist = 7.5;
      const baseScale = Math.min(width, height) * 0.165 * zoom3D;
      const factor = dist / (z2 + dist);
      const px = cx + x1 * factor * baseScale;
      const py = cy - y2 * factor * baseScale;

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

    // 7c. Draw Critical Points & Hessian Stationary Markers (Minima, Maxima, Saddles)
    if (showCriticalPoints) {
      interface CriticalPointDef {
        x: number;
        y: number;
        label: string;
        type: 'min' | 'max' | 'saddle' | 'monkey';
      }

      const critPts: CriticalPointDef[] = [];
      if (surfaceType === 'saddle') {
        critPts.push({ x: 0, y: 0, label: 'Saddle (0, 0) [det(H)<0]', type: 'saddle' });
      } else if (surfaceType === 'monkey') {
        critPts.push({ x: 0, y: 0, label: 'Monkey Saddle (0, 0) [det(H)=0]', type: 'monkey' });
      } else if (surfaceType === 'hyper_4d') {
        critPts.push({ x: 0, y: 0, label: `Hyper-Saddle (0, 0)`, type: 'saddle' });
      } else if (surfaceType === 'himmelblau') {
        critPts.push({ x: 3.0, y: 2.0, label: 'Min (3, 2)', type: 'min' });
        critPts.push({ x: -2.805, y: 3.131, label: 'Min (-2.8, 3.1)', type: 'min' });
        critPts.push({ x: -3.779, y: -3.283, label: 'Min (-3.8, -3.3)', type: 'min' });
        critPts.push({ x: 3.584, y: -1.848, label: 'Min (3.6, -1.8)', type: 'min' });
        critPts.push({ x: -0.27, y: -0.92, label: 'Local Max', type: 'max' });
        critPts.push({ x: 0.086, y: 2.884, label: 'Saddle A', type: 'saddle' });
        critPts.push({ x: -3.073, y: -0.081, label: 'Saddle B', type: 'saddle' });
        critPts.push({ x: -0.124, y: -1.953, label: 'Saddle C', type: 'saddle' });
        critPts.push({ x: 3.385, y: 0.073, label: 'Saddle D', type: 'saddle' });
      }

      critPts.forEach(cp => {
        const cz = eval3DSurface(cp.x, cp.y, surfaceType, effectiveW, timeT, isBendingAnim).z;
        const cProj = project(cp.x, cz, cp.y);

        let mainColor = '#34d399'; // min
        let badgeText = 'MIN';
        if (cp.type === 'max') { mainColor = '#f87171'; badgeText = 'MAX'; }
        else if (cp.type === 'saddle') { mainColor = '#fbbf24'; badgeText = 'SADDLE'; }
        else if (cp.type === 'monkey') { mainColor = '#ec4899'; badgeText = 'MONKEY'; }

        // Glow Aura Ring
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(cProj.px, cProj.py, 8 + Math.sin(timeT * 3.0) * 1.5, 0, 2 * Math.PI);
        ctx.stroke();

        // Solid Center Marker
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(cProj.px, cProj.py, 4.5, 0, 2 * Math.PI);
        ctx.fill();

        // Tooltip badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 0.9;
        const txt = `${badgeText}: ${cp.label}`;
        ctx.font = 'bold 8.5px monospace';
        const tw = ctx.measureText(txt).width;
        ctx.fillRect(cProj.px + 8, cProj.py - 12, tw + 8, 14);
        ctx.strokeRect(cProj.px + 8, cProj.py - 12, tw + 8, 14);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(txt, cProj.px + 12, cProj.py - 2);
      });
    }

    // 7d. Draw 3D Gradient Vector Quiver Field (-∇f Tangent Arrows)
    if (showGradientQuiver && (surfaceType === 'saddle' || surfaceType === 'monkey' || surfaceType === 'himmelblau' || surfaceType === 'hyper_4d')) {
      const qDelta = 0.005;
      const qStep = 0.55;
      for (let qu = -1.65; qu <= 1.65; qu += qStep) {
        for (let qv = -1.65; qv <= 1.65; qv += qStep) {
          const zBase = eval3DSurface(qu, qv, surfaceType, effectiveW, timeT, isBendingAnim).z;
          const zUPlus = eval3DSurface(qu + qDelta, qv, surfaceType, effectiveW, timeT, isBendingAnim).z;
          const zUMinus = eval3DSurface(qu - qDelta, qv, surfaceType, effectiveW, timeT, isBendingAnim).z;
          const zVPlus = eval3DSurface(qu, qv + qDelta, surfaceType, effectiveW, timeT, isBendingAnim).z;
          const zVMinus = eval3DSurface(qu, qv - qDelta, surfaceType, effectiveW, timeT, isBendingAnim).z;

          const dfdu = (zUPlus - zUMinus) / (2 * qDelta);
          const dfdv = (zVPlus - zVMinus) / (2 * qDelta);

          const gradLen = Math.sqrt(dfdu * dfdu + dfdv * dfdv);
          if (gradLen > 0.05) {
            const du = -dfdu / gradLen;
            const dv = -dfdv / gradLen;
            const arrowLen = Math.min(0.24, 0.10 + 0.05 * Math.min(gradLen, 3.0));

            const quTip = qu + du * arrowLen;
            const qvTip = qv + dv * arrowLen;
            const zTip = eval3DSurface(quTip, qvTip, surfaceType, effectiveW, timeT, isBendingAnim).z;

            const pBase = project(qu, zBase + 0.03, qv);
            const pTip = project(quTip, zTip + 0.03, qvTip);

            let quiverColor = '#38bdf8';
            if (gradLen > 1.2) quiverColor = '#f87171';
            else if (gradLen > 0.5) quiverColor = '#fbbf24';

            ctx.strokeStyle = quiverColor;
            ctx.fillStyle = quiverColor;
            ctx.lineWidth = 1.4;

            ctx.beginPath();
            ctx.moveTo(pBase.px, pBase.py);
            ctx.lineTo(pTip.px, pTip.py);
            ctx.stroke();

            const angle = Math.atan2(pTip.py - pBase.py, pTip.px - pBase.px);
            const headLen = 4.5;
            ctx.beginPath();
            ctx.moveTo(pTip.px, pTip.py);
            ctx.lineTo(pTip.px - headLen * Math.cos(angle - Math.PI / 6), pTip.py - headLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(pTip.px - headLen * Math.cos(angle + Math.PI / 6), pTip.py - headLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(pBase.px, pBase.py, 1.4, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }
    }

    // 8. Draw 3D Gradient Descent Rolling Ball / Geodesic Particle / Multi-Optimizer Race
    const phys = ballPhysicsRef.current;
    if (showRollingBall && phys) {
      if (optimizerMode === 'race' && surfaceType !== 'torus' && surfaceType !== 'mobius') {
        // Multi-Optimizer Race: 1. SGD (Blue), 2. Momentum (Green), 3. Adam (Orange)
        const runners = [
          { name: 'SGD', data: phys.sgd, color: '#38bdf8', aura: 'rgba(56, 189, 248, 0.35)', badge: '#0284c7' },
          { name: 'Momentum', data: phys.momentum, color: '#34d399', aura: 'rgba(52, 211, 153, 0.35)', badge: '#059669' },
          { name: 'Adam', data: phys.adam, color: '#fb923c', aura: 'rgba(251, 146, 60, 0.35)', badge: '#ea580c' }
        ];

        runners.forEach(r => {
          // Trailing ribbon
          if (r.data.history.length >= 2) {
            ctx.strokeStyle = r.color;
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            for (let h = 0; h < r.data.history.length; h++) {
              const hp = r.data.history[h];
              const hProj = project(hp.x, hp.z, hp.y);
              if (h === 0) ctx.moveTo(hProj.px, hProj.py);
              else ctx.lineTo(hProj.px, hProj.py);
            }
            ctx.stroke();

            ctx.strokeStyle = r.aura;
            ctx.lineWidth = 4.5;
            ctx.stroke();
          }

          // Active ball
          const bProj = project(r.data.x, r.data.z, r.data.y);
          const fProj = project(r.data.x, -1.8, r.data.y);

          // Drop line
          ctx.strokeStyle = r.aura;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(bProj.px, bProj.py);
          ctx.lineTo(fProj.px, fProj.py);
          ctx.stroke();
          ctx.setLineDash([]);

          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.ellipse(fProj.px, fProj.py, 6, 3, 0, 0, 2 * Math.PI);
          ctx.fill();

          // Ball
          const radGrad = ctx.createRadialGradient(bProj.px - 2, bProj.py - 2, 1, bProj.px, bProj.py, 7);
          radGrad.addColorStop(0, '#ffffff');
          radGrad.addColorStop(0.35, r.color);
          radGrad.addColorStop(1, r.badge);

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(bProj.px, bProj.py, 6.5, 0, 2 * Math.PI);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Runner label tag
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = r.color;
          ctx.lineWidth = 0.8;
          ctx.font = 'bold 8px monospace';
          const rtw = ctx.measureText(r.name).width;
          ctx.fillRect(bProj.px + 7, bProj.py - 10, rtw + 6, 12);
          ctx.strokeRect(bProj.px + 7, bProj.py - 10, rtw + 6, 12);
          ctx.fillStyle = r.color;
          ctx.fillText(r.name, bProj.px + 10, bProj.py - 1);
        });
      } else {
        // Individual Optimizer or Parametric Geodesic Mode
        if (surfaceType === 'torus' || surfaceType === 'mobius') {
          // Parametric Knot / Twist Particle
          if (phys.history.length >= 2) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            for (let h = 0; h < phys.history.length; h++) {
              const hp = phys.history[h];
              const hProj = project(hp.x, hp.z, hp.y);
              if (h === 0) ctx.moveTo(hProj.px, hProj.py);
              else ctx.lineTo(hProj.px, hProj.py);
            }
            ctx.stroke();

            ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
            ctx.lineWidth = 5.0;
            ctx.stroke();
          }

          const currentZ = phys.history[phys.history.length - 1]?.z ?? 0;
          const ballProj = project(phys.x, currentZ, phys.y);
          const floorProj = project(phys.x, -1.8, phys.y);

          ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
          ctx.lineWidth = 1.4;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(ballProj.px, ballProj.py);
          ctx.lineTo(floorProj.px, floorProj.py);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.ellipse(floorProj.px, floorProj.py, 8, 4, 0, 0, 2 * Math.PI);
          ctx.fill();

          const radGrad = ctx.createRadialGradient(ballProj.px - 2.5, ballProj.py - 2.5, 1, ballProj.px, ballProj.py, 8);
          radGrad.addColorStop(0, '#ffffff');
          radGrad.addColorStop(0.3, '#38bdf8');
          radGrad.addColorStop(0.8, '#0284c7');
          radGrad.addColorStop(1, '#0369a1');

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(ballProj.px, ballProj.py, 7.5, 0, 2 * Math.PI);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          // Explicit surface descent: SGD, Momentum, or Adam
          const activeRunner = optimizerMode === 'sgd'
            ? { name: 'SGD', data: phys.sgd, color: '#38bdf8', aura: 'rgba(56, 189, 248, 0.35)', badge: '#0284c7' }
            : optimizerMode === 'adam'
            ? { name: 'Adam', data: phys.adam, color: '#fb923c', aura: 'rgba(251, 146, 60, 0.35)', badge: '#ea580c' }
            : { name: 'Momentum', data: phys.momentum, color: '#34d399', aura: 'rgba(52, 211, 153, 0.35)', badge: '#059669' };

          if (activeRunner.data.history.length >= 2) {
            ctx.strokeStyle = activeRunner.color;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            for (let h = 0; h < activeRunner.data.history.length; h++) {
              const hp = activeRunner.data.history[h];
              const hProj = project(hp.x, hp.z, hp.y);
              if (h === 0) ctx.moveTo(hProj.px, hProj.py);
              else ctx.lineTo(hProj.px, hProj.py);
            }
            ctx.stroke();

            ctx.strokeStyle = activeRunner.aura;
            ctx.lineWidth = 5.5;
            ctx.stroke();
          }

          const ballProj = project(activeRunner.data.x, activeRunner.data.z, activeRunner.data.y);
          const floorProj = project(activeRunner.data.x, -1.8, activeRunner.data.y);

          ctx.strokeStyle = activeRunner.aura;
          ctx.lineWidth = 1.4;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(ballProj.px, ballProj.py);
          ctx.lineTo(floorProj.px, floorProj.py);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.ellipse(floorProj.px, floorProj.py, 8, 4, 0, 0, 2 * Math.PI);
          ctx.fill();

          const radGrad = ctx.createRadialGradient(ballProj.px - 2.5, ballProj.py - 2.5, 1, ballProj.px, ballProj.py, 8);
          radGrad.addColorStop(0, '#ffffff');
          radGrad.addColorStop(0.35, activeRunner.color);
          radGrad.addColorStop(1, activeRunner.badge);

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(ballProj.px, ballProj.py, 7.5, 0, 2 * Math.PI);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Runner label tag
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = activeRunner.color;
          ctx.lineWidth = 0.8;
          ctx.font = 'bold 8.5px monospace';
          const rtw = ctx.measureText(activeRunner.name).width;
          ctx.fillRect(ballProj.px + 9, ballProj.py - 11, rtw + 8, 14);
          ctx.strokeRect(ballProj.px + 9, ballProj.py - 11, rtw + 8, 14);
          ctx.fillStyle = activeRunner.color;
          ctx.fillText(activeRunner.name, ballProj.px + 13, ballProj.py);
        }
      }
    }

    // 9. On-Canvas Telemetry HUD Badge
    const isRaceActive = showRollingBall && optimizerMode === 'race' && surfaceType !== 'torus' && surfaceType !== 'mobius';
    const hudHeight = isRaceActive ? 104 : (showRollingBall ? 72 : 56);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(14, 14, 255, hudHeight, 6);
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
      if (isRaceActive) {
        ctx.font = '8.5px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`🔵 SGD:      z=${phys.sgd.z.toFixed(2)} |∇f|=${phys.sgd.gradNorm.toFixed(2)} (${phys.sgd.stepCount}s)`, 24, 72);
        ctx.fillStyle = '#34d399';
        ctx.fillText(`🟢 Momentum: z=${phys.momentum.z.toFixed(2)} |∇f|=${phys.momentum.gradNorm.toFixed(2)} (${phys.momentum.stepCount}s)`, 24, 84);
        ctx.fillStyle = '#fb923c';
        ctx.fillText(`🟠 Adam:     z=${phys.adam.z.toFixed(2)} |∇f|=${phys.adam.gradNorm.toFixed(2)} (${phys.adam.stepCount}s)`, 24, 96);
      } else if (surfaceType === 'torus' || surfaceType === 'mobius') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`● Geodesic Orbit: Toroidal Knot (step ${phys.stepCount})`, 24, 72);
      } else if (optimizerMode === 'sgd') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`🔵 SGD Descent: z=${phys.sgd.z.toFixed(2)} |∇f|=${phys.sgd.gradNorm.toFixed(3)} (${phys.sgd.stepCount}s)${isBallPaused ? ' [PAUSED]' : ''}`, 24, 72);
      } else if (optimizerMode === 'adam') {
        ctx.fillStyle = '#fb923c';
        ctx.fillText(`🟠 Adam Descent: z=${phys.adam.z.toFixed(2)} |∇f|=${phys.adam.gradNorm.toFixed(3)} (${phys.adam.stepCount}s)${isBallPaused ? ' [PAUSED]' : ''}`, 24, 72);
      } else {
        ctx.fillStyle = '#34d399';
        ctx.fillText(`🟢 Momentum: z=${phys.momentum.z.toFixed(2)} |∇f|=${phys.momentum.gradNorm.toFixed(3)} (${phys.momentum.stepCount}s)${isBallPaused ? ' [PAUSED]' : ''}`, 24, 72);
      }
    }

    ctx.restore();

  }, [activeModuleId, surfaceType, hyperW, autoSlice4D, showSlicePlane, sliceHeightZ, rotX, rotY, zoom3D, shadingMode, surfaceColormap, show3dAxes, showFloorGrid, showCriticalPoints, showGradientQuiver, meshResolution, currentCanvasTheme, isBendingAnim, timeT, surfaceTelemetry, showRollingBall, optimizerMode, ballPhysicsTick]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. PHASE 7: VECTOR FIELDS & PHASE SPACE ORBITS
  // ─────────────────────────────────────────────────────────────────────────────
  type OdeSystemType = 'pendulum' | 'vanderpol' | 'lotka_volterra' | 'duffing';
  const [odeSystem, setOdeSystem] = useState<OdeSystemType>('pendulum');
  const [dampingFactor, setDampingFactor] = useState<number>(0.25);
  const [phaseX0, setPhaseX0] = useState<number>(1.2);
  const [phaseY0, setPhaseY0] = useState<number>(0.5);
  const [showOdeTrajectory, setShowOdeTrajectory] = useState<boolean>(true);
  const [showOdeStreamlines, setShowOdeStreamlines] = useState<boolean>(true);
  const [showOdeNullclines, setShowOdeNullclines] = useState<boolean>(true);
  const [showOdeFixedPoints, setShowOdeFixedPoints] = useState<boolean>(true);
  const [odeGridDensity, setOdeGridDensity] = useState<'coarse' | 'medium' | 'fine'>('medium');
  const [showOdeFormulaHud, setShowOdeFormulaHud] = useState<boolean>(true);

  // Mathematical ODE Velocity Field Evaluator
  const evalOdeDerivatives = (x: number, y: number, system: OdeSystemType, param: number): { dx: number; dy: number } => {
    switch (system) {
      case 'vanderpol':
        // x' = y, y' = mu * (1 - x^2) * y - x
        return {
          dx: y,
          dy: param * (1 - x * x) * y - x
        };
      case 'lotka_volterra': {
        // Centered Predator-Prey (Shifted so coexistence fixed point is near (0, 0))
        const px = x + 1.8;
        const py = y + 1.5;
        if (px <= 0.05 || py <= 0.05) return { dx: 0, dy: 0 };
        return {
          dx: px * (1.2 - 0.8 * py),
          dy: -py * (1.0 - 0.6 * px)
        };
      }
      case 'duffing':
        // Double-well oscillator: x' = y, y' = x - x^3 - d * y
        return {
          dx: y,
          dy: x - Math.pow(x, 3) - param * y
        };
      case 'pendulum':
      default:
        // Non-linear damped pendulum: x' = y, y' = -sin(x) - d * y
        return {
          dx: y,
          dy: -Math.sin(x) - param * y
        };
    }
  };

  // Runge-Kutta 4th Order (RK4) Numerical Trajectory Integrator
  const computeRk4Trajectory = (
    x0: number,
    y0: number,
    system: OdeSystemType,
    param: number,
    steps: number = 320,
    dt: number = 0.025
  ): Array<{ x: number; y: number }> => {
    const pts: Array<{ x: number; y: number }> = [{ x: x0, y: y0 }];
    let cx = x0;
    let cy = y0;

    for (let i = 0; i < steps; i++) {
      const k1 = evalOdeDerivatives(cx, cy, system, param);
      const k2 = evalOdeDerivatives(cx + 0.5 * dt * k1.dx, cy + 0.5 * dt * k1.dy, system, param);
      const k3 = evalOdeDerivatives(cx + 0.5 * dt * k2.dx, cy + 0.5 * dt * k2.dy, system, param);
      const k4 = evalOdeDerivatives(cx + dt * k3.dx, cy + dt * k3.dy, system, param);

      cx += (dt / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx);
      cy += (dt / 6) * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy);

      if (Math.abs(cx) > 4.5 || Math.abs(cy) > 3.5 || isNaN(cx) || isNaN(cy)) break;
      pts.push({ x: cx, y: cy });
    }
    return pts;
  };

  // Fixed Equilibrium Points & Linear Stability Classification
  const getOdeFixedPoints = (
    system: OdeSystemType,
    param: number
  ): Array<{ x: number; y: number; label: string; type: 'sink' | 'source' | 'saddle' | 'center'; badge: string }> => {
    switch (system) {
      case 'vanderpol':
        return [
          {
            x: 0,
            y: 0,
            label: 'Origin (0,0)',
            type: 'source',
            badge: 'UNSTABLE SPIRAL (SOURCE)'
          }
        ];
      case 'lotka_volterra':
        return [
          {
            x: 1.67 - 1.8,
            y: 1.5 - 1.5,
            label: 'Coexistence Center',
            type: 'center',
            badge: 'CENTER (CLOSED CYCLES)'
          },
          {
            x: -1.8,
            y: -1.5,
            label: 'Extinction Saddle',
            type: 'saddle',
            badge: 'SADDLE (EXTINCTION)'
          }
        ];
      case 'duffing':
        return [
          {
            x: 0,
            y: 0,
            label: 'Saddle Separatrix (0,0)',
            type: 'saddle',
            badge: 'SADDLE (SEPARATRIX)'
          },
          {
            x: 1,
            y: 0,
            label: 'Right Well (+1,0)',
            type: param > 0 ? 'sink' : 'center',
            badge: param > 0 ? 'STABLE SPIRAL (SINK)' : 'CENTER'
          },
          {
            x: -1,
            y: 0,
            label: 'Left Well (-1,0)',
            type: param > 0 ? 'sink' : 'center',
            badge: param > 0 ? 'STABLE SPIRAL (SINK)' : 'CENTER'
          }
        ];
      case 'pendulum':
      default:
        return [
          {
            x: 0,
            y: 0,
            label: 'Downward Equilibrium (0,0)',
            type: param > 0 ? 'sink' : 'center',
            badge: param > 0 ? 'STABLE FOCUS (SINK)' : 'CENTER (HAMILTONIAN)'
          },
          {
            x: Math.PI,
            y: 0,
            label: 'Inverted Pendulum (+π,0)',
            type: 'saddle',
            badge: 'SADDLE (UNSTABLE)'
          },
          {
            x: -Math.PI,
            y: 0,
            label: 'Inverted Pendulum (-π,0)',
            type: 'saddle',
            badge: 'SADDLE (UNSTABLE)'
          }
        ];
    }
  };

  // LaTeX Mathematical Formulation & Energy Metric
  const getOdeTelemetry = (
    system: OdeSystemType,
    param: number,
    x0: number,
    y0: number
  ): { title: string; eq1: string; eq2: string; energy: string; jacobian: string } => {
    switch (system) {
      case 'vanderpol':
        return {
          title: 'Van der Pol Oscillator (Nonlinear Limit Cycle)',
          eq1: 'ẋ = y',
          eq2: `ẏ = ${param.toFixed(2)}(1 - x²)y - x`,
          energy: 'Self-Excited Dissipative Limit Cycle (Radius R ≈ 2.0)',
          jacobian: `tr(J) = ${param.toFixed(2)}, det(J) = 1.00 (Unstable Repeller at Origin)`
        };
      case 'lotka_volterra':
        return {
          title: 'Lotka-Volterra Predator-Prey Dynamics',
          eq1: 'ẋ = x(1.2 - 0.8y)',
          eq2: 'ẏ = -y(1.0 - 0.6x)',
          energy: `First Integral: V(x,y) = 0.6x - 1.0 ln(x) + 0.8y - 1.2 ln(y)`,
          jacobian: 'tr(J) = 0, det(J) = 1.20 (Conservative Center)'
        };
      case 'duffing': {
        const energyVal = 0.5 * y0 * y0 - 0.5 * x0 * x0 + 0.25 * Math.pow(x0, 4);
        return {
          title: 'Duffing Double-Well Oscillator',
          eq1: 'ẋ = y',
          eq2: `ẏ = x - x³ - ${param.toFixed(2)}y`,
          energy: `Hamiltonian H(x,y) = ½y² - ½x² + ¼x⁴ = ${energyVal.toFixed(3)}`,
          jacobian: `tr(J) = -${param.toFixed(2)}, det(J) = 3x² - 1`
        };
      }
      case 'pendulum':
      default: {
        const energyVal = 0.5 * y0 * y0 - Math.cos(x0);
        return {
          title: 'Nonlinear Damped Pendulum',
          eq1: 'ẋ = y (Angular Velocity)',
          eq2: `ẏ = -sin(x) - ${param.toFixed(2)}y (Torque + Drag)`,
          energy: `Total Energy E = ½y² - cos(x) = ${energyVal.toFixed(3)}`,
          jacobian: `tr(J) = -${param.toFixed(2)}, det(J) = cos(x) = ${Math.cos(x0).toFixed(2)}`
        };
      }
    }
  };
  // ─────────────────────────────────────────────────────────────────────────────
  // 10. PHASE 8: MULTIVARIABLE FORMULA SANDBOX STATES & EVALUATORS
  // ─────────────────────────────────────────────────────────────────────────────
  type SandboxCoordType = 'cartesian' | 'polar' | 'parametric';
  type CartesianPreset = 'harmonic' | 'damped' | 'gaussian' | 'cubic' | 'chirp' | 'beating';
  type PolarPreset = 'rose' | 'cardioid' | 'spiral' | 'lemniscate' | 'butterfly';
  type ParametricPreset = 'lissajous' | 'hypotrochoid' | 'astroid' | 'cycloid' | 'butterfly_param';

  const [sandboxCoordType, setSandboxCoordType] = useState<SandboxCoordType>('cartesian');
  const [cartesianPreset, setCartesianPreset] = useState<CartesianPreset>('harmonic');
  const [polarPreset, setPolarPreset] = useState<PolarPreset>('rose');
  const [parametricPreset, setParametricPreset] = useState<ParametricPreset>('lissajous');

  // Interactive Parameters
  const [paramK, setParamK] = useState<number>(2.0); // Frequency / Petals / kx
  const [paramK2, setParamK2] = useState<number>(3.0); // Secondary Freq / ky / Modulation
  const [paramA, setParamA] = useState<number>(1.3); // Amplitude / Main Radius
  const [paramB, setParamB] = useState<number>(0.0); // Phase Shift / Minor scale
  const [paramC, setParamC] = useState<number>(0.0); // Vertical Offset / DC Bias
  const [sandboxZoom, setSandboxZoom] = useState<number>(1.0); // Viewport Zoom (0.5x to 2.2x)

  // Multi-Curve Layer Visibility
  const [showCurve1, setShowCurve1] = useState<boolean>(true); // C1: Emerald (#34d399)
  const [showCurve2, setShowCurve2] = useState<boolean>(true); // C2: Cyan (#38bdf8)
  const [showCurve3, setShowCurve3] = useState<boolean>(false); // C3: Pink (#ec4899)
  const [showCompositeSum, setShowCompositeSum] = useState<boolean>(false); // Composite Superposition (#fbbf24)

  // Diagnostics & Calculus Toggles
  const [showTangentVector, setShowTangentVector] = useState<boolean>(true); // Velocity & Tangent Vector v(t)
  const [showAreaShading, setShowAreaShading] = useState<boolean>(true); // Definite Integral / Sector Area Shading
  const [showGridRings, setShowGridRings] = useState<boolean>(true); // Cartesian ticks or Polar rings/rays
  const [showTracerDot, setShowTracerDot] = useState<boolean>(true); // Live Animated Tracer Node
  const [showRootsAndExtrema, setShowRootsAndExtrema] = useState<boolean>(true); // Roots (y=0) & Critical Extrema (f'=0)
  const [showOsculatingCircle, setShowOsculatingCircle] = useState<boolean>(false); // Curvature κ(t) & Osculating Circle

  // Mathematical Evaluators (Declared first for use in memoized hooks)
  const evalCartesian = (x: number, curveIdx: 1 | 2 | 3, preset: CartesianPreset): number => {
    switch (preset) {
      case 'damped':
        if (curveIdx === 1) return paramA * Math.exp(-0.35 * paramK * Math.abs(x)) * Math.cos(paramK * x + paramB) + paramC;
        if (curveIdx === 2) return paramA * Math.exp(-0.35 * paramK * Math.abs(x)) + paramC;
        return -paramA * Math.exp(-0.35 * paramK * Math.abs(x)) + paramC;
      case 'gaussian':
        if (curveIdx === 1) return paramA * Math.exp(-Math.pow(0.45 * paramK * x, 2)) * Math.cos(paramK2 * x + paramB) + paramC;
        if (curveIdx === 2) return paramA * Math.exp(-Math.pow(0.45 * paramK * x, 2)) + paramC;
        return -paramA * Math.exp(-Math.pow(0.45 * paramK * x, 2)) + paramC;
      case 'cubic':
        if (curveIdx === 1) return paramA * (0.18 * Math.pow(x, 3) - 0.75 * paramK * x) + paramC;
        if (curveIdx === 2) return paramA * (0.54 * Math.pow(x, 2) - 0.75 * paramK); // 1st derivative f'
        return paramA * (1.08 * x); // 2nd derivative f''
      case 'chirp':
        if (curveIdx === 1) return paramA * Math.sin(0.22 * paramK * Math.pow(x, 2) + paramB) + paramC;
        if (curveIdx === 2) return paramA * Math.cos(0.22 * paramK * Math.pow(x, 2) + paramB) + paramC;
        return 0.5 * paramA * Math.sin(0.44 * paramK * Math.pow(x, 2)) + paramC;
      case 'beating':
        if (curveIdx === 1) return paramA * Math.sin(paramK * x) + paramA * Math.sin(paramK2 * x) + paramC;
        if (curveIdx === 2) return 2 * paramA * Math.cos(((paramK - paramK2) / 2) * x) + paramC;
        return -2 * paramA * Math.cos(((paramK - paramK2) / 2) * x) + paramC;
      case 'harmonic':
      default:
        if (curveIdx === 1) return paramA * Math.sin(paramK * x + paramB) + paramC;
        if (curveIdx === 2) return 0.6 * paramA * Math.cos(2 * paramK * x + paramB) + paramC;
        return 0.35 * paramA * Math.sin(3 * paramK * x) + paramC;
    }
  };

  const evalPolar = (theta: number, curveIdx: 1 | 2 | 3, preset: PolarPreset): number => {
    switch (preset) {
      case 'cardioid':
        if (curveIdx === 1) return paramA * (1 + Math.cos(paramK * theta)) + paramC;
        if (curveIdx === 2) return paramA * (1 - Math.sin(paramK * theta)) + paramC;
        return paramA * (1 + 0.6 * Math.cos(2 * paramK * theta)) + paramC;
      case 'spiral':
        if (curveIdx === 1) return paramA * 0.22 * theta + paramC;
        if (curveIdx === 2) return paramA * Math.exp(0.08 * paramK * theta) * 0.3 + paramC;
        return (paramA * 1.8) / Math.sqrt(theta + 0.3) + paramC;
      case 'lemniscate':
        if (curveIdx === 1) return paramA * Math.sqrt(Math.max(0, Math.cos(2 * paramK * theta))) + paramC;
        if (curveIdx === 2) return paramA * Math.sqrt(Math.max(0, -Math.cos(2 * paramK * theta))) + paramC;
        return 1.2 * paramA * Math.cos(paramK * theta) + paramC;
      case 'butterfly':
        if (curveIdx === 1) return paramA * 0.45 * (Math.exp(Math.cos(theta)) - 2 * Math.cos(4 * theta) + Math.pow(Math.sin((2 * theta - Math.PI) / 24), 5)) + paramC;
        if (curveIdx === 2) return paramA * 0.6 * Math.cos(3 * theta) + paramC;
        return paramA * 0.6 * Math.sin(5 * theta) + paramC;
      case 'rose':
      default:
        if (curveIdx === 1) return paramA * Math.cos(paramK * theta) + paramC;
        if (curveIdx === 2) return paramA * Math.sin(paramK * theta) + paramC;
        return paramA * Math.cos((paramK / Math.max(1, paramK2)) * theta) + paramC;
    }
  };

  const evalParametric = (t: number, curveIdx: 1 | 2 | 3, preset: ParametricPreset): { x: number; y: number } => {
    switch (preset) {
      case 'hypotrochoid': {
        const R = 1.8 * paramA;
        const r = 0.6 * paramA;
        const d = 0.5 * paramK;
        if (curveIdx === 1) {
          return {
            x: (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t),
            y: (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t)
          };
        }
        if (curveIdx === 2) {
          return { x: R * Math.cos(t), y: R * Math.sin(t) };
        }
        return {
          x: (R - r) * Math.cos(t) + 0.8 * d * Math.cos(((R - r) / r) * t),
          y: (R - r) * Math.sin(t) - 0.8 * d * Math.sin(((R - r) / r) * t)
        };
      }
      case 'astroid':
        if (curveIdx === 1) {
          return { x: paramA * Math.pow(Math.cos(paramK * t), 3), y: paramA * Math.pow(Math.sin(paramK * t), 3) };
        }
        if (curveIdx === 2) {
          return { x: paramA * Math.cos(paramK * t), y: paramA * Math.sin(paramK * t) };
        }
        return { x: 0.6 * paramA * Math.pow(Math.cos(paramK * t), 5), y: 0.6 * paramA * Math.pow(Math.sin(paramK * t), 5) };
      case 'cycloid':
        if (curveIdx === 1) {
          return { x: 0.45 * paramA * (paramK * t - Math.sin(paramK * t)) - 1.8, y: 0.45 * paramA * (1 - Math.cos(paramK * t)) - 0.9 };
        }
        if (curveIdx === 2) {
          return { x: 0.45 * paramA * (paramK * t + Math.sin(paramK * t)) - 1.8, y: -0.45 * paramA * (1 - Math.cos(paramK * t)) + 0.9 };
        }
        return { x: 0.45 * paramA * (paramK * t) - 1.8, y: 0 };
      case 'butterfly_param': {
        const factor = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5);
        if (curveIdx === 1) return { x: 0.4 * paramA * Math.sin(t) * factor, y: 0.4 * paramA * Math.cos(t) * factor };
        if (curveIdx === 2) return { x: 0.5 * paramA * Math.sin(3 * t), y: 0.5 * paramA * Math.cos(3 * t) };
        return { x: 0.8 * paramA * Math.sin(t), y: 0.8 * paramA * Math.cos(2 * t) };
      }
      case 'lissajous':
      default:
        if (curveIdx === 1) {
          return { x: paramA * Math.sin(paramK * t + paramB), y: paramA * Math.cos(paramK2 * t) };
        }
        if (curveIdx === 2) {
          return { x: paramA * Math.cos(paramK * t + paramB), y: paramA * Math.sin(paramK2 * t) };
        }
        return { x: 0.7 * paramA * Math.sin((paramK + 1) * t), y: 0.7 * paramA * Math.sin((paramK2 + 1) * t) };
    }
  };

  // Formatted Mathematical LaTeX-Style Formula String Generator
  const getSandboxFormulaString = (
    coordType: SandboxCoordType,
    cartPreset: CartesianPreset,
    polPreset: PolarPreset,
    parPreset: ParametricPreset,
    k: number,
    k2: number,
    a: number,
    b: number,
    c: number
  ): { main: string; sub?: string; env?: string } => {
    const cStr = c !== 0 ? (c > 0 ? ` + ${c.toFixed(1)}` : ` - ${Math.abs(c).toFixed(1)}`) : '';
    const bStr = b !== 0 ? (b > 0 ? ` + ${b.toFixed(2)}` : ` - ${Math.abs(b).toFixed(2)}`) : '';

    if (coordType === 'cartesian') {
      switch (cartPreset) {
        case 'damped':
          return {
            main: `y = ${a.toFixed(1)} e^{-${(0.35 * k).toFixed(2)}|x|} cos(${k.toFixed(1)}x${bStr})${cStr}`,
            sub: `Envelope: ±${a.toFixed(1)} e^{-${(0.35 * k).toFixed(2)}|x|}`
          };
        case 'gaussian':
          return {
            main: `y = ${a.toFixed(1)} e^{-(${ (0.45 * k).toFixed(2) }x)^2} cos(${k2.toFixed(1)}x${bStr})${cStr}`,
            sub: `Bell Envelope: ${a.toFixed(1)} e^{-(${ (0.45 * k).toFixed(2) }x)^2}`
          };
        case 'cubic':
          return {
            main: `f(x) = ${a.toFixed(1)} (0.18 x^3 - ${(0.75 * k).toFixed(2)} x)${cStr}`,
            sub: `f'(x) = ${a.toFixed(1)} (0.54 x^2 - ${(0.75 * k).toFixed(2)})`,
            env: `f''(x) = ${(1.08 * a).toFixed(2)} x`
          };
        case 'chirp':
          return {
            main: `y = ${a.toFixed(1)} sin(${(0.22 * k).toFixed(2)} x^2${bStr})${cStr}`,
            sub: `Phase Carrier: ${(0.22 * k).toFixed(2)} x^2 rad`
          };
        case 'beating':
          return {
            main: `y = ${a.toFixed(1)} [sin(${k.toFixed(1)}x) + sin(${k2.toFixed(1)}x)]${cStr}`,
            sub: `Modulation Envelope: 2·${a.toFixed(1)} cos(${ (Math.abs(k - k2) / 2).toFixed(2) }x)`
          };
        case 'harmonic':
        default:
          return {
            main: `y = ${a.toFixed(1)} sin(${k.toFixed(1)}x${bStr})${cStr}`,
            sub: `Harmonic: ${(0.6 * a).toFixed(2)} cos(${(2 * k).toFixed(1)}x${bStr})`
          };
      }
    } else if (coordType === 'polar') {
      switch (polPreset) {
        case 'cardioid':
          return {
            main: `r(θ) = ${a.toFixed(1)} [1 + cos(${k.toFixed(1)}θ)]${cStr}`,
            sub: `Limaçon / Cardioid Family`
          };
        case 'spiral':
          return {
            main: `r(θ) = ${ (0.22 * a).toFixed(2) } θ${cStr}`,
            sub: `Archimedean: r ∝ θ`
          };
        case 'lemniscate':
          return {
            main: `r^2(θ) = ${ (a * a).toFixed(2) } cos(${ (2 * k).toFixed(1) }θ)`,
            sub: `Bernoulli Dual-Lobe Figure Eight`
          };
        case 'butterfly':
          return {
            main: `r(θ) = ${ (0.45 * a).toFixed(2) } [e^{cos θ} - 2 cos 4θ + sin^5(\\frac{2θ-π}{24})]`,
            sub: `Transcendental Butterfly Profile`
          };
        case 'rose':
        default:
          return {
            main: `r(θ) = ${a.toFixed(1)} cos(${k.toFixed(1)}θ)${cStr}`,
            sub: `Petals: ${Number.isInteger(k) ? (k % 2 === 0 ? 2 * k : k) : `${k.toFixed(1)} (Fractional)`} Petals`
          };
      }
    } else {
      switch (parPreset) {
        case 'hypotrochoid':
          return {
            main: `x(t) = ${(1.2 * a).toFixed(1)} cos t + ${(0.5 * k).toFixed(1)} cos(2t), y(t) = ${(1.2 * a).toFixed(1)} sin t - ${(0.5 * k).toFixed(1)} sin(2t)`,
            sub: `Spirograph Hypotrochoid (R=${(1.8 * a).toFixed(1)}, r=${(0.6 * a).toFixed(1)})`
          };
        case 'astroid':
          return {
            main: `x(t) = ${a.toFixed(1)} cos^3(${k.toFixed(1)}t), y(t) = ${a.toFixed(1)} sin^3(${k.toFixed(1)}t)`,
            sub: `Hypocycloid of 4 Cusps: x^{2/3} + y^{2/3} = a^{2/3}`
          };
        case 'cycloid':
          return {
            main: `x(t) = ${(0.45 * a).toFixed(2)}(${k.toFixed(1)}t - sin ${k.toFixed(1)}t), y(t) = ${(0.45 * a).toFixed(2)}(1 - cos ${k.toFixed(1)}t)`,
            sub: `Brachistochrone / Rolling Wheel Trajectory`
          };
        case 'butterfly_param':
          return {
            main: `x(t) = ${(0.4 * a).toFixed(2)} sin t · F(t), y(t) = ${(0.4 * a).toFixed(2)} cos t · F(t)`,
            sub: `Parametric Butterfly Orbit`
          };
        case 'lissajous':
        default:
          return {
            main: `x(t) = ${a.toFixed(1)} sin(${k.toFixed(1)}t${bStr}), y(t) = ${a.toFixed(1)} cos(${k2.toFixed(1)}t)`,
            sub: `Frequency Ratio kx : ky = ${k.toFixed(1)} : ${k2.toFixed(1)}`
          };
      }
    }
  };

  // Numerical Definite Integral / Enclosed Area Metric
  const sandboxAreaMetric = useMemo(() => {
    if (sandboxCoordType === 'cartesian') {
      // Numerical Riemann Trapezoidal Integral ∫_{-3}^{3} f(x) dx
      let integral = 0;
      let posArea = 0;
      const steps = 200;
      const xMin = -3.0;
      const xMax = 3.0;
      const dx = (xMax - xMin) / steps;
      for (let i = 0; i < steps; i++) {
        const x1 = xMin + i * dx;
        const x2 = x1 + dx;
        const y1 = evalCartesian(x1, 1, cartesianPreset);
        const y2 = evalCartesian(x2, 1, cartesianPreset);
        integral += 0.5 * (y1 + y2) * dx;
        posArea += 0.5 * (Math.abs(y1) + Math.abs(y2)) * dx;
      }
      return {
        label: '∫_{-3}^{3} f(x) dx',
        value: integral.toFixed(3),
        totalAbsArea: posArea.toFixed(3),
        unit: 'sq. units'
      };
    } else if (sandboxCoordType === 'polar') {
      // Numerical Polar Enclosed Area A = 1/2 ∫_{0}^{2π} r(θ)^2 dθ
      let area = 0;
      const steps = 360;
      const maxTh = polarPreset === 'spiral' ? 4 * Math.PI : 2 * Math.PI;
      const dTh = maxTh / steps;
      for (let i = 0; i < steps; i++) {
        const th1 = i * dTh;
        const th2 = (i + 1) * dTh;
        const r1 = Math.max(0, evalPolar(th1, 1, polarPreset));
        const r2 = Math.max(0, evalPolar(th2, 1, polarPreset));
        area += 0.25 * (r1 * r1 + r2 * r2) * dTh;
      }
      return {
        label: 'Enclosed Area A = ½∫ r² dθ',
        value: area.toFixed(3),
        totalAbsArea: area.toFixed(3),
        unit: 'sq. units'
      };
    } else {
      // Parametric Arc Length L = ∫ √((dx/dt)² + (dy/dt)²) dt
      let arcLength = 0;
      const steps = 300;
      const maxT = parametricPreset === 'hypotrochoid' || parametricPreset === 'cycloid' ? 4 * Math.PI : 2 * Math.PI;
      const dt = maxT / steps;
      for (let i = 0; i < steps; i++) {
        const t1 = i * dt;
        const t2 = (i + 1) * dt;
        const p1 = evalParametric(t1, 1, parametricPreset);
        const p2 = evalParametric(t2, 1, parametricPreset);
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        arcLength += dist;
      }
      return {
        label: 'Trajectory Arc Length L',
        value: arcLength.toFixed(3),
        totalAbsArea: arcLength.toFixed(3),
        unit: 'length units'
      };
    }
  }, [sandboxCoordType, cartesianPreset, polarPreset, parametricPreset, paramK, paramK2, paramA, paramB, paramC]);

  // Roots (Zero Crossings) & Critical Points (Extrema) Locator
  const sandboxKeyPoints = useMemo(() => {
    if (sandboxCoordType !== 'cartesian') return { roots: [], extrema: [] };

    const roots: Array<{ x: number; y: number }> = [];
    const extrema: Array<{ x: number; y: number; type: 'max' | 'min' | 'inflection'; label: string }> = [];

    const xMin = -3.5;
    const xMax = 3.5;
    const steps = 140;
    const dx = (xMax - xMin) / steps;

    for (let i = 0; i < steps; i++) {
      const x1 = xMin + i * dx;
      const x2 = x1 + dx;
      const y1 = evalCartesian(x1, 1, cartesianPreset);
      const y2 = evalCartesian(x2, 1, cartesianPreset);

      // Root detection via sign change
      if (y1 * y2 <= 0 && Math.abs(y2 - y1) > 1e-6) {
        const rootX = x1 - y1 * (dx / (y2 - y1));
        if (!roots.some(r => Math.abs(r.x - rootX) < 0.15)) {
          roots.push({ x: rootX, y: 0 });
        }
      }

      // Extrema detection via numerical derivative sign change
      const delta = 0.005;
      const dy1 = (evalCartesian(x1 + delta, 1, cartesianPreset) - evalCartesian(x1 - delta, 1, cartesianPreset)) / (2 * delta);
      const dy2 = (evalCartesian(x2 + delta, 1, cartesianPreset) - evalCartesian(x2 - delta, 1, cartesianPreset)) / (2 * delta);

      if (dy1 * dy2 <= 0 && Math.abs(dy2 - dy1) > 1e-6) {
        const critX = x1 - dy1 * (dx / (dy2 - dy1));
        const critY = evalCartesian(critX, 1, cartesianPreset);
        const d2y = (evalCartesian(critX + delta, 1, cartesianPreset) - 2 * critY + evalCartesian(critX - delta, 1, cartesianPreset)) / (delta * delta);

        const type: 'max' | 'min' | 'inflection' = d2y < -0.01 ? 'max' : d2y > 0.01 ? 'min' : 'inflection';
        const label = type === 'max' ? `Local Max (${critX.toFixed(2)}, ${critY.toFixed(2)})` : type === 'min' ? `Local Min (${critX.toFixed(2)}, ${critY.toFixed(2)})` : `Inflection (${critX.toFixed(2)}, ${critY.toFixed(2)})`;

        if (!extrema.some(e => Math.abs(e.x - critX) < 0.15)) {
          extrema.push({ x: critX, y: critY, type, label });
        }
      }
    }

    return {
      roots: roots.slice(0, 8),
      extrema: extrema.slice(0, 8)
    };
  }, [sandboxCoordType, cartesianPreset, paramK, paramK2, paramA, paramB, paramC]);

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
          setSvc3dRotY(prev => (prev + 0.4 * animSpeed) % 360);
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
        if (activeModuleId === 'mathbox_3d' && showRollingBall && !isBallPaused) {
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
            const eps = 0.005;

            // 1. Vanilla SGD
            if (optimizerMode === 'sgd' || optimizerMode === 'race') {
              const sgdZxp = eval3DSurface(phys.sgd.x + eps, phys.sgd.y, surfaceType, effW, timeT, isBendingAnim).z;
              const sgdZxm = eval3DSurface(phys.sgd.x - eps, phys.sgd.y, surfaceType, effW, timeT, isBendingAnim).z;
              const sgdZyp = eval3DSurface(phys.sgd.x, phys.sgd.y + eps, surfaceType, effW, timeT, isBendingAnim).z;
              const sgdZym = eval3DSurface(phys.sgd.x, phys.sgd.y - eps, surfaceType, effW, timeT, isBendingAnim).z;
              const sgdGx = (sgdZxp - sgdZxm) / (2 * eps);
              const sgdGy = (sgdZyp - sgdZym) / (2 * eps);
              phys.sgd.gradNorm = Math.hypot(sgdGx, sgdGy);
              if (phys.sgd.gradNorm > 0.0005) {
                const nextSgdX = Math.max(-2.0, Math.min(2.0, phys.sgd.x - ballLearningRate * sgdGx * animSpeed));
                const nextSgdY = Math.max(-2.0, Math.min(2.0, phys.sgd.y - ballLearningRate * sgdGy * animSpeed));
                const nextSgdZ = eval3DSurface(nextSgdX, nextSgdY, surfaceType, effW, timeT, isBendingAnim).z;
                phys.sgd.x = nextSgdX;
                phys.sgd.y = nextSgdY;
                phys.sgd.z = nextSgdZ;
                phys.sgd.history.push({ x: nextSgdX, y: nextSgdY, z: nextSgdZ });
                if (phys.sgd.history.length > 80) phys.sgd.history.shift();
                phys.sgd.stepCount += 1;
              }
            }

            // 2. Momentum / Heavy Ball
            if (optimizerMode === 'momentum' || optimizerMode === 'race') {
              const momZxp = eval3DSurface(phys.momentum.x + eps, phys.momentum.y, surfaceType, effW, timeT, isBendingAnim).z;
              const momZxm = eval3DSurface(phys.momentum.x - eps, phys.momentum.y, surfaceType, effW, timeT, isBendingAnim).z;
              const momZyp = eval3DSurface(phys.momentum.x, phys.momentum.y + eps, surfaceType, effW, timeT, isBendingAnim).z;
              const momZym = eval3DSurface(phys.momentum.x, phys.momentum.y - eps, surfaceType, effW, timeT, isBendingAnim).z;
              const momGx = (momZxp - momZxm) / (2 * eps);
              const momGy = (momZyp - momZym) / (2 * eps);
              phys.momentum.gradNorm = Math.hypot(momGx, momGy);
              if (phys.momentum.gradNorm > 0.0005) {
                phys.momentum.vx = phys.momentum.vx * ballMomentum - ballLearningRate * momGx;
                phys.momentum.vy = phys.momentum.vy * ballMomentum - ballLearningRate * momGy;
                const nextMomX = Math.max(-2.0, Math.min(2.0, phys.momentum.x + phys.momentum.vx * animSpeed));
                const nextMomY = Math.max(-2.0, Math.min(2.0, phys.momentum.y + phys.momentum.vy * animSpeed));
                const nextMomZ = eval3DSurface(nextMomX, nextMomY, surfaceType, effW, timeT, isBendingAnim).z;
                phys.momentum.x = nextMomX;
                phys.momentum.y = nextMomY;
                phys.momentum.z = nextMomZ;
                phys.momentum.history.push({ x: nextMomX, y: nextMomY, z: nextMomZ });
                if (phys.momentum.history.length > 80) phys.momentum.history.shift();
                phys.momentum.stepCount += 1;
              }
            }

            // 3. Adam Optimizer
            if (optimizerMode === 'adam' || optimizerMode === 'race') {
              const adamZxp = eval3DSurface(phys.adam.x + eps, phys.adam.y, surfaceType, effW, timeT, isBendingAnim).z;
              const adamZxm = eval3DSurface(phys.adam.x - eps, phys.adam.y, surfaceType, effW, timeT, isBendingAnim).z;
              const adamZyp = eval3DSurface(phys.adam.x, phys.adam.y + eps, surfaceType, effW, timeT, isBendingAnim).z;
              const adamZym = eval3DSurface(phys.adam.x, phys.adam.y - eps, surfaceType, effW, timeT, isBendingAnim).z;
              const adamGx = (adamZxp - adamZxm) / (2 * eps);
              const adamGy = (adamZyp - adamZym) / (2 * eps);
              phys.adam.gradNorm = Math.hypot(adamGx, adamGy);
              if (phys.adam.gradNorm > 0.0005) {
                phys.adam.t += 1;
                const beta1 = 0.9, beta2 = 0.999, epsAdam = 1e-7;
                phys.adam.mX = beta1 * phys.adam.mX + (1 - beta1) * adamGx;
                phys.adam.mY = beta1 * phys.adam.mY + (1 - beta1) * adamGy;
                phys.adam.vX = beta2 * phys.adam.vX + (1 - beta2) * adamGx * adamGx;
                phys.adam.vY = beta2 * phys.adam.vY + (1 - beta2) * adamGy * adamGy;
                const mHatX = phys.adam.mX / (1 - Math.pow(beta1, phys.adam.t));
                const mHatY = phys.adam.mY / (1 - Math.pow(beta1, phys.adam.t));
                const vHatX = phys.adam.vX / (1 - Math.pow(beta2, phys.adam.t));
                const vHatY = phys.adam.vY / (1 - Math.pow(beta2, phys.adam.t));
                const stepX = (ballLearningRate * 0.95 / (Math.sqrt(vHatX) + epsAdam)) * mHatX;
                const stepY = (ballLearningRate * 0.95 / (Math.sqrt(vHatY) + epsAdam)) * mHatY;
                const nextAdamX = Math.max(-2.0, Math.min(2.0, phys.adam.x - stepX * animSpeed));
                const nextAdamY = Math.max(-2.0, Math.min(2.0, phys.adam.y - stepY * animSpeed));
                const nextAdamZ = eval3DSurface(nextAdamX, nextAdamY, surfaceType, effW, timeT, isBendingAnim).z;
                phys.adam.x = nextAdamX;
                phys.adam.y = nextAdamY;
                phys.adam.z = nextAdamZ;
                phys.adam.history.push({ x: nextAdamX, y: nextAdamY, z: nextAdamZ });
                if (phys.adam.history.length > 80) phys.adam.history.shift();
                phys.adam.stepCount += 1;
              }
            }
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isSimulating, isAutoOrbit, isBendingAnim, isGradDescentRunning, learningRateEta, manualBeta0, manualBeta1, linPoints, animSpeed, activeModuleId, showRollingBall, isBallPaused, optimizerMode, ballMomentum, ballLearningRate, surfaceType, autoSlice4D, hyperW, timeT]);

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <PillSelector
                  options={[
                    { id: '1d_pdf_compare', label: '1D PDF Norm vs t' },
                    { id: '1d_cdf', label: '1D CDF S-Curve' },
                    { id: '1d_qqplot', label: '1D QQ-Plot Diagnostic' },
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
                <DualParamControl
                  label={gaussDimension === '2d_bivariate' || gaussDimension === '3d_surface' ? "Std Dev X (σ_X):" : "Standard Deviation (σ):"}
                  value={gaussStd}
                  min={0.2}
                  max={3.0}
                  step={0.1}
                  onChange={setGaussStd}
                  color="#34d399"
                />

                {(gaussDimension === '2d_bivariate' || gaussDimension === '3d_surface') && (
                  <>
                    <DualParamControl label="Std Dev Y (σ_Y):" value={gaussStdY} min={0.2} max={3.0} step={0.1} onChange={setGaussStdY} color="#a855f7" />
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
                  </>
                )}

                {gaussDimension === '2d_bivariate' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--dropdown-bg, #0b1120)', padding: '8px', borderRadius: '8px', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>🔀 PCA & COVARIANCE DECOMPOSITION:</span>
                      <button
                        type="button"
                        onClick={() => setShowPcaVectors(prev => !prev)}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: showPcaVectors ? 'rgba(56, 189, 248, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                          color: showPcaVectors ? '#38bdf8' : 'var(--text-muted)',
                          border: showPcaVectors ? '1px solid #38bdf8' : '1px solid var(--card-border)'
                        }}
                      >
                        Vectors {showPcaVectors ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-muted)' }}>
                      <span>Eigenvalue λ₁ (Major Axis):</span>
                      <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 800 }}>{gaussPcaAnalysis.lambda1.toFixed(3)} ({gaussPcaAnalysis.pc1Ratio.toFixed(1)}% Var)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-muted)' }}>
                      <span>Eigenvalue λ₂ (Minor Axis):</span>
                      <span style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 800 }}>{gaussPcaAnalysis.lambda2.toFixed(3)} ({gaussPcaAnalysis.pc2Ratio.toFixed(1)}% Var)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-muted)' }}>
                      <span>Principal Orientation (θ):</span>
                      <span style={{ color: '#f59e0b', fontFamily: 'monospace', fontWeight: 800 }}>{gaussPcaAnalysis.thetaDeg.toFixed(1)}°</span>
                    </div>
                  </div>
                )}

                {gaussDimension === '3d_surface' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Camera View Angles Quick Presets */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--dropdown-bg, #0b1120)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)' }}>CAMERA VIEW:</span>
                        <span style={{ fontSize: '0.58rem', color: '#38bdf8', fontFamily: 'monospace' }}>Rx:{gauss3dRotX.toFixed(0)}° Ry:{gauss3dRotY.toFixed(0)}° Z:{(gauss3dZoom * 100).toFixed(0)}%</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => { setGauss3dRotX(30); setGauss3dRotY(45); setGauss3dZoom(1.0); }}
                          style={{
                            padding: '4px 2px',
                            borderRadius: '4px',
                            fontSize: '0.58rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: Math.abs(gauss3dRotX - 30) < 3 && Math.abs(gauss3dRotY - 45) < 3 && Math.abs(gauss3dZoom - 1.0) < 0.1 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                            color: Math.abs(gauss3dRotX - 30) < 3 && Math.abs(gauss3dRotY - 45) < 3 && Math.abs(gauss3dZoom - 1.0) < 0.1 ? '#38bdf8' : 'var(--text-primary)',
                            border: Math.abs(gauss3dRotX - 30) < 3 && Math.abs(gauss3dRotY - 45) < 3 && Math.abs(gauss3dZoom - 1.0) < 0.1 ? '1px solid #38bdf8' : '1px solid var(--card-border)'
                          }}
                          title="Isometric 3D View (30°, 45°)"
                        >
                          📐 Iso
                        </button>
                        <button
                          type="button"
                          onClick={() => { setGauss3dRotX(82); setGauss3dRotY(0); setGauss3dZoom(1.1); }}
                          style={{
                            padding: '4px 2px',
                            borderRadius: '4px',
                            fontSize: '0.58rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: Math.abs(gauss3dRotX - 82) < 4 && Math.abs(gauss3dRotY - 0) < 4 ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                            color: Math.abs(gauss3dRotX - 82) < 4 && Math.abs(gauss3dRotY - 0) < 4 ? '#34d399' : 'var(--text-primary)',
                            border: Math.abs(gauss3dRotX - 82) < 4 && Math.abs(gauss3dRotY - 0) < 4 ? '1px solid #34d399' : '1px solid var(--card-border)'
                          }}
                          title="Top-Down 2D Contour View (82°, 0°)"
                        >
                          🎯 Top 2D
                        </button>
                        <button
                          type="button"
                          onClick={() => { setGauss3dRotX(0); setGauss3dRotY(90); setGauss3dZoom(1.0); }}
                          style={{
                            padding: '4px 2px',
                            borderRadius: '4px',
                            fontSize: '0.58rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: Math.abs(gauss3dRotX - 0) < 3 && Math.abs(gauss3dRotY - 90) < 3 ? 'rgba(251, 191, 36, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                            color: Math.abs(gauss3dRotX - 0) < 3 && Math.abs(gauss3dRotY - 90) < 3 ? '#fbbf24' : 'var(--text-primary)',
                            border: Math.abs(gauss3dRotX - 0) < 3 && Math.abs(gauss3dRotY - 90) < 3 ? '1px solid #fbbf24' : '1px solid var(--card-border)'
                          }}
                          title="Side Profile View (0°, 90°)"
                        >
                          ↔️ Side
                        </button>
                        <button
                          type="button"
                          onClick={() => { setGauss3dRotX(30); setGauss3dRotY(45); setGauss3dZoom(1.0); }}
                          style={{
                            padding: '4px 2px',
                            borderRadius: '4px',
                            fontSize: '0.58rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: 'rgba(30, 41, 59, 0.6)',
                            color: '#a855f7',
                            border: '1px solid var(--card-border)'
                          }}
                          title="Reset to Default Angle (30°, 45°)"
                        >
                          🔄 Reset
                        </button>
                      </div>
                    </div>

                    <DualParamControl label="Pitch Angle (Rx):" value={gauss3dRotX} min={-80} max={80} step={2} onChange={setGauss3dRotX} color="#38bdf8" />
                    <DualParamControl label="Yaw Angle (Ry):" value={gauss3dRotY} min={-180} max={180} step={2} onChange={setGauss3dRotY} color="#34d399" />
                    <DualParamControl label="3D View Zoom:" value={gauss3dZoom} min={0.5} max={2.2} step={0.05} onChange={setGauss3dZoom} color="#a855f7" />
                  </div>
                )}

                {(gaussDimension === '1d_pdf_compare' || gaussDimension === '1d_cdf' || gaussDimension === '1d_qqplot') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#f59e0b' }}>STUDENT-T DEGREES OF FREEDOM (ν):</span>
                      <button
                        type="button"
                        onClick={() => setIsNuSweeping(prev => !prev)}
                        style={{
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: isNuSweeping ? 'rgba(245, 158, 11, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          color: isNuSweeping ? '#f59e0b' : 'var(--text-muted)',
                          border: isNuSweeping ? '1px solid #f59e0b' : '1px solid var(--card-border)'
                        }}
                        title="Animate ν from 1 to 30 to see asymptotic convergence to Gaussian"
                      >
                        🎬 Sweep ν {isNuSweeping ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <DualParamControl
                      label="Degrees of Freedom (ν):"
                      value={activeNu}
                      min={1}
                      max={30}
                      step={1}
                      precision={0}
                      onChange={(val) => {
                        setStudentNu(val);
                        setIsNuSweeping(false);
                        setIsBendingAnim(false);
                      }}
                      color="#f59e0b"
                    />
                  </div>
                )}

                {/* ONE-SAMPLE HYPOTHESIS TESTING & CI SUITE */}
                {gaussDimension === '1d_pdf_compare' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--dropdown-bg, #0b1120)', padding: '8px', borderRadius: '8px', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#38bdf8' }}>🧪 HYPOTHESIS TEST & CI ENGINE:</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setShowHypoTestOverlay(prev => !prev)}
                          style={{
                            padding: '2px 5px',
                            borderRadius: '3px',
                            fontSize: '0.56rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            background: showHypoTestOverlay ? 'rgba(56, 189, 248, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                            color: showHypoTestOverlay ? '#38bdf8' : 'var(--text-muted)',
                            border: showHypoTestOverlay ? '1px solid #38bdf8' : '1px solid var(--card-border)'
                          }}
                        >
                          Test {showHypoTestOverlay ? 'ON' : 'OFF'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCiBrackets(prev => !prev)}
                          style={{
                            padding: '2px 5px',
                            borderRadius: '3px',
                            fontSize: '0.56rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            background: showCiBrackets ? 'rgba(52, 211, 153, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                            color: showCiBrackets ? '#34d399' : 'var(--text-muted)',
                            border: showCiBrackets ? '1px solid #34d399' : '1px solid var(--card-border)'
                          }}
                        >
                          CI {showCiBrackets ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>

                    {showHypoTestOverlay && (
                      <>
                        <DualParamControl label="Sample Mean (x̄):" value={hypoSampleMean} min={-3.0} max={3.0} step={0.1} onChange={setHypoSampleMean} color="#38bdf8" />
                        <DualParamControl label="Sample Size (n):" value={hypoSampleSize} min={2} max={40} step={1} precision={0} onChange={setHypoSampleSize} color="#34d399" />
                        <DualParamControl label="Sample Std Dev (s):" value={hypoSampleStd} min={0.2} max={3.0} step={0.1} onChange={setHypoSampleStd} color="#f59e0b" />
                        <DualParamControl label="Null Mean (μ₀):" value={hypoNullMu} min={-3.0} max={3.0} step={0.1} onChange={setHypoNullMu} color="#94a3b8" />

                        {/* Exam Verdict Card */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(15, 23, 42, 0.9)', padding: '6px', borderRadius: '5px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.62rem', color: '#cbd5e1', fontWeight: 800 }}>EXAM DECISION:</span>
                            <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '1px 5px', borderRadius: '3px', background: gaussHypoAnalysis.isRejectedT ? 'rgba(239, 68, 68, 0.25)' : 'rgba(52, 211, 153, 0.25)', color: gaussHypoAnalysis.isRejectedT ? '#f87171' : '#34d399' }}>
                              {gaussHypoAnalysis.isRejectedT ? '🚨 REJECT H₀ (p < α)' : '✅ FAIL TO REJECT H₀'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                            <span>t-Statistic:</span>
                            <span style={{ color: '#f59e0b', fontFamily: 'monospace', fontWeight: 800 }}>t = {gaussHypoAnalysis.tStat.toFixed(2)} (t_crit = ±{gaussHypoAnalysis.tCrit.toFixed(2)})</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                            <span>Two-Sided p-value:</span>
                            <span style={{ color: gaussHypoAnalysis.pValT < 0.05 ? '#f87171' : '#34d399', fontFamily: 'monospace', fontWeight: 800 }}>p = {gaussHypoAnalysis.pValT.toFixed(4)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                            <span>t-CI Small-Sample Penalty:</span>
                            <span style={{ color: '#ec4899', fontFamily: 'monospace', fontWeight: 800 }}>+{gaussHypoAnalysis.ciInflationPct.toFixed(1)}% wider than Z-CI</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* INFORMATION THEORY & ENTROPY CARD */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--dropdown-bg, #0b1120)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#a855f7' }}>🧠 INFORMATION THEORY & ENTROPY:</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                    <span>KL Divergence D_KL(N || t):</span>
                    <span style={{ color: '#a855f7', fontFamily: 'monospace', fontWeight: 800 }}>{gaussInfoAnalysis.klDivergence.toFixed(4)} nats</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                    <span>Gaussian Entropy H(X):</span>
                    <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 800 }}>{gaussInfoAnalysis.normalEntropy.toFixed(3)} nats</span>
                  </div>
                </div>

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

                {/* CLT Multi-Distribution Sampling Generator */}
                <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--pill-bg, rgba(30, 41, 59, 0.6))', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #34d399)' }}>
                      🎲 CLT Sampling Generator:
                    </span>
                    <span style={{ fontSize: '0.64rem', color: '#f59e0b', fontFamily: 'monospace' }}>
                      Draws: {cltSamples.length}
                    </span>
                  </div>

                  {/* Population Source Switcher */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px' }}>
                    <button
                      type="button"
                      onClick={() => { setCltSource('uniform'); resetCltSamples(); }}
                      style={{
                        padding: '3px 2px',
                        borderRadius: '3px',
                        fontSize: '0.56rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: cltSource === 'uniform' ? 'rgba(56, 189, 248, 0.28)' : 'rgba(15, 23, 42, 0.6)',
                        color: cltSource === 'uniform' ? '#38bdf8' : 'var(--text-muted)',
                        border: cltSource === 'uniform' ? '1px solid #38bdf8' : '1px solid transparent',
                        textAlign: 'center'
                      }}
                      title="Parent Population: Uniform U[-√3, +√3]"
                    >
                      🎲 Uniform
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCltSource('exponential'); resetCltSamples(); }}
                      style={{
                        padding: '3px 2px',
                        borderRadius: '3px',
                        fontSize: '0.56rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: cltSource === 'exponential' ? 'rgba(245, 158, 11, 0.28)' : 'rgba(15, 23, 42, 0.6)',
                        color: cltSource === 'exponential' ? '#f59e0b' : 'var(--text-muted)',
                        border: cltSource === 'exponential' ? '1px solid #f59e0b' : '1px solid transparent',
                        textAlign: 'center'
                      }}
                      title="Parent Population: Skewed Exponential Exp(1)"
                    >
                      📉 Exp
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCltSource('bimodal'); resetCltSamples(); }}
                      style={{
                        padding: '3px 2px',
                        borderRadius: '3px',
                        fontSize: '0.56rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: cltSource === 'bimodal' ? 'rgba(236, 72, 153, 0.28)' : 'rgba(15, 23, 42, 0.6)',
                        color: cltSource === 'bimodal' ? '#ec4899' : 'var(--text-muted)',
                        border: cltSource === 'bimodal' ? '1px solid #ec4899' : '1px solid transparent',
                        textAlign: 'center'
                      }}
                      title="Parent Population: Bimodal Two-Peak Gaussian Mixture"
                    >
                      🐫 Bimodal
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCltSource('discrete_die'); resetCltSamples(); }}
                      style={{
                        padding: '3px 2px',
                        borderRadius: '3px',
                        fontSize: '0.56rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: cltSource === 'discrete_die' ? 'rgba(52, 211, 153, 0.28)' : 'rgba(15, 23, 42, 0.6)',
                        color: cltSource === 'discrete_die' ? '#34d399' : 'var(--text-muted)',
                        border: cltSource === 'discrete_die' ? '1px solid #34d399' : '1px solid transparent',
                        textAlign: 'center'
                      }}
                      title="Parent Population: Discrete 6-Sided Die {1,2,3,4,5,6}"
                    >
                      🎲 Die
                    </button>
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
                      <span>Draw 15 Means</span>
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

                {/* Mathematical Kurtosis & Heavy-Tail Diagnostic Card */}
                {gaussDimension === '1d_pdf_compare' && (
                  <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--dropdown-bg, #0b1120)', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#f59e0b' }}>Heavy-Tail Diagnostic:</span>
                      <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '1px 5px', borderRadius: '3px', background: activeNu <= 4 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(52, 211, 153, 0.2)', color: activeNu <= 4 ? '#f87171' : '#34d399' }}>
                        {activeNu <= 4 ? 'LEPTOKURTIC (∞)' : `γ₂ = ${(6 / (activeNu - 4)).toFixed(2)}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', fontFamily: 'monospace' }}>
                      <span style={{ color: '#38bdf8' }}>Z_crit ({ciConfidence}%): ±{(ciConfidence === 90 ? 1.645 : ciConfidence === 99 ? 2.576 : 1.960).toFixed(3)}</span>
                      <span style={{ color: '#f59e0b' }}>t_crit (ν={activeNu}): ±{getStudentTCrit(activeNu, ciConfidence).toFixed(3)}</span>
                    </div>
                    <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>
                      {activeNu === 1 ? 'Cauchy Distribution (No finite Mean or Variance).' : activeNu <= 2 ? 'Infinite Variance (Var → ∞).' : activeNu <= 4 ? 'Finite Mean & Var, Infinite 4th Moment.' : `As ν → ∞, t(ν) converges asymptotically to N(μ, σ²).`}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PHASE 2: SUPPORT VECTOR CLASSIFIER CONTROLS */}
            {activeModuleId === 'svc_classifier' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Dataset Presets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                    Dataset Distribution Presets:
                  </span>
                  <PillSelector
                    options={[
                      { id: 'separable', label: 'Separable' },
                      { id: 'overlapping', label: 'Overlap (Soft)' },
                      { id: 'circles', label: 'Circles (RBF)' },
                      { id: 'xor_moons', label: 'XOR / Moons' },
                      { id: 'outlier_stress', label: 'Outlier Stress' }
                    ]}
                    value={svcDatasetPreset}
                    onChange={(val) => loadSvcPreset(val as any)}
                    columns={3}
                    activeColor="#fbbf24"
                  />
                </div>

                {/* Drag Hint Badge */}
                <div style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.10)', border: '1px solid rgba(56, 189, 248, 0.25)', fontSize: '0.62rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🖱️ <b>Interactive Canvas:</b> Drag any sample point directly to update the margin & slack in real time!</span>
                </div>

                {/* Display & Declutter Controls (Formulas HUD & Data Point Labels) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowSvcFormulaHud(prev => !prev)}
                    style={{
                      padding: '5px 6px',
                      borderRadius: '5px',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: showSvcFormulaHud ? 'rgba(56, 189, 248, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                      color: showSvcFormulaHud ? '#38bdf8' : 'var(--text-muted)',
                      border: showSvcFormulaHud ? '1px solid #38bdf8' : '1px solid var(--card-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                    title="Show or hide the on-canvas mathematical formulas badge"
                  >
                    <span>📐 Formula HUD:</span>
                    <b>{showSvcFormulaHud ? 'ON' : 'OFF'}</b>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSvcPointLabels(prev => !prev)}
                    style={{
                      padding: '5px 6px',
                      borderRadius: '5px',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: showSvcPointLabels ? 'rgba(251, 191, 36, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                      color: showSvcPointLabels ? '#fbbf24' : 'var(--text-muted)',
                      border: showSvcPointLabels ? '1px solid #fbbf24' : '1px solid var(--card-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                    title="Toggle data point coordinate and slack tags to prevent obscuring point clusters"
                  >
                    <span>🏷️ Point Labels:</span>
                    <b>{showSvcPointLabels ? 'ON' : 'OFF (CLEAN)'}</b>
                  </button>
                </div>

                <PillSelector
                  options={[
                    { id: '2d_margin', label: '2D Margin' },
                    { id: '1d_line', label: '1D Threshold' },
                    { id: '3d_plane', label: '3D Lift' },
                    { id: '4d_slice', label: '4D Hyper-Slice' }
                  ]}
                  value={svcDimension}
                  onChange={(val) => setSvcDimension(val as any)}
                  columns={2}
                  activeColor="var(--accent-cyan, #38bdf8)"
                />

                {/* 3D Feature-Space Lift Selector (when in 3D mode) */}
                {svcDimension === '3d_plane' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#a855f7' }}>
                      3D Feature-Space Lift Φ(X):
                    </span>
                    <PillSelector
                      options={[
                        { id: 'paraboloid', label: 'Paraboloid (X₁²+X₂²)' },
                        { id: 'rbf_pot', label: 'RBF Potential' },
                        { id: 'decision_plane', label: 'Decision Output' }
                      ]}
                      value={svc3dFeatureMap}
                      onChange={(val) => setSvc3dFeatureMap(val as any)}
                      columns={1}
                      activeColor="#a855f7"
                    />
                  </div>
                )}

                {/* 4D Hyperplane Slicing Controls (when in 4D mode) */}
                {svcDimension === '4d_slice' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', borderRadius: '6px', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#ec4899' }}>
                        🌌 4D HYPERPLANE SLICER
                      </span>
                      <button
                        type="button"
                        onClick={() => setSvc4dAutoSlice(!svc4dAutoSlice)}
                        style={{
                          padding: '2px 7px',
                          borderRadius: '3px',
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: svc4dAutoSlice ? 'rgba(52, 211, 153, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                          color: svc4dAutoSlice ? '#34d399' : 'var(--text-muted)',
                          border: svc4dAutoSlice ? '1px solid #34d399' : '1px solid transparent'
                        }}
                      >
                        Auto-Slice: {svc4dAutoSlice ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <DualParamControl
                      label="Slice Coordinate (X₄):"
                      value={svc4dSliceX4}
                      min={-2.5}
                      max={2.5}
                      step={0.1}
                      onChange={setSvc4dSliceX4}
                      color="#ec4899"
                    />
                    <DualParamControl
                      label="Slice Window (±ΔX₄):"
                      value={svc4dSliceThickness}
                      min={0.4}
                      max={2.5}
                      step={0.1}
                      onChange={setSvc4dSliceThickness}
                      color="#a855f7"
                    />
                  </div>
                )}

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

                {/* Classification Scorecard & Dual SV Breakdown */}
                <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--dropdown-bg, #0b1120)', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8' }}>Classification Telemetry:</span>
                    <span style={{ fontSize: '0.60rem', fontWeight: 800, padding: '1px 6px', borderRadius: '3px', background: svcAnalysis.accuracy >= 90 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: svcAnalysis.accuracy >= 90 ? '#34d399' : '#f59e0b' }}>
                      Acc: {svcAnalysis.accuracy.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.60rem', fontFamily: 'monospace' }}>
                    <span style={{ color: '#94a3b8' }}>Precision: <b style={{ color: '#34d399' }}>{svcAnalysis.precision.toFixed(1)}%</b></span>
                    <span style={{ color: '#94a3b8' }}>Recall: <b style={{ color: '#38bdf8' }}>{svcAnalysis.recall.toFixed(1)}%</b></span>
                    <span style={{ color: '#94a3b8' }}>F1-Score: <b style={{ color: '#fbbf24' }}>{svcAnalysis.f1Score.toFixed(1)}%</b></span>
                    <span style={{ color: '#94a3b8' }}>Obj Loss: <b style={{ color: '#f87171' }}>{svcAnalysis.objectiveLoss.toFixed(2)}</b></span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(51, 65, 85, 0.4)', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#cbd5e1', fontFamily: 'monospace' }}>
                    <span>SVs: <b style={{ color: '#fbbf24' }}>{svcAnalysis.supportVectorCount}</b>/{svcPoints.length}</span>
                    <span>Slack Violators: <b style={{ color: '#f87171' }}>{svcAnalysis.marginViolatorCount}</b> (Σξ={svcAnalysis.totalSlack.toFixed(2)})</span>
                  </div>
                </div>

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
                            #{idx + 1}: ({p.x1}, {p.x2}) [y={p.label > 0 ? '+1' : '-1'}] {p.isSupportVector ? `★ SV (α=${p.alpha.toFixed(2)})` : ''}
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
                {/* 1. Mode Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--text-muted)' }}>CALCULUS INVESTIGATION MODE:</span>
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
                </div>

                {/* 2. Function Preset Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--text-muted)' }}>FUNCTION PRESET:</span>
                  <PillSelector
                    options={[
                      { id: 'cubic', label: 'Cubic Polynomial' },
                      { id: 'sinusoid', label: 'Sinusoidal Wave' },
                      { id: 'bell', label: 'Gaussian Bell' },
                      { id: 'quartic', label: 'Quartic W-Well' },
                      { id: 'rational', label: 'Witch of Agnesi' },
                      { id: 'damped', label: 'Damped Wave' }
                    ]}
                    value={calcPreset}
                    onChange={(val) => setCalcPreset(val as any)}
                    columns={3}
                    activeColor="#a855f7"
                  />
                </div>

                {/* 3. Mode-Specific Controls */}
                {calcMode === 'tangent_secant' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <DualParamControl label="Tangent Point (x₀):" value={calcX0} min={-2.5} max={2.5} step={0.05} onChange={setCalcX0} color="#38bdf8" />
                    <DualParamControl label="Secant Step (h):" value={calcH} min={0.02} max={1.5} step={0.02} onChange={setCalcH} color="#f59e0b" />
                    <button
                      type="button"
                      onClick={() => setIsAnimateH(prev => !prev)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: isAnimateH ? 'rgba(245, 158, 11, 0.25)' : 'rgba(15, 23, 42, 0.65)',
                        border: `1px solid ${isAnimateH ? '#f59e0b' : 'rgba(148, 163, 184, 0.3)'}`,
                        color: isAnimateH ? '#f59e0b' : 'var(--text-main)',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{isAnimateH ? '⏸ Pause Convergence' : '⚡ Auto-Converge Limit (h → 0)'}</span>
                    </button>
                  </div>
                )}

                {calcMode === 'riemann_sums' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--text-muted)' }}>RIEMANN PARTITION RULE:</span>
                      <PillSelector
                        options={[
                          { id: 'left', label: 'Left (L_N)' },
                          { id: 'right', label: 'Right (R_N)' },
                          { id: 'midpoint', label: 'Midpoint (M_N)' },
                          { id: 'trapezoid', label: 'Trapezoid (T_N)' },
                          { id: 'simpson', label: 'Simpson (S_N)' }
                        ]}
                        value={riemannMethod}
                        onChange={(val) => setRiemannMethod(val as any)}
                        columns={3}
                        activeColor="#10b981"
                      />
                    </div>
                    <DualParamControl label="Lower Bound (a):" value={calcBoundA} min={-2.8} max={calcBoundB - 0.2} step={0.1} onChange={setCalcBoundA} color="#38bdf8" />
                    <DualParamControl label="Upper Bound (b):" value={calcBoundB} min={calcBoundA + 0.2} max={2.8} step={0.1} onChange={setCalcBoundB} color="#ec4899" />
                    <DualParamControl label="Partitions (N):" value={calcIntegralN} min={4} max={60} step={2} precision={0} onChange={setCalcIntegralN} color="#34d399" />
                  </div>
                )}

                {calcMode === 'derivatives' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <DualParamControl label="Tracer Point (x₀):" value={calcX0} min={-2.5} max={2.5} step={0.05} onChange={setCalcX0} color="#38bdf8" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setShowDeriv1Curve(prev => !prev)}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '5px',
                          background: showDeriv1Curve ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.65)',
                          border: `1px solid ${showDeriv1Curve ? '#10b981' : 'rgba(148, 163, 184, 0.3)'}`,
                          color: showDeriv1Curve ? '#10b981' : '#94a3b8',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        📈 f'(x) Slope Curve
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeriv2Curve(prev => !prev)}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '5px',
                          background: showDeriv2Curve ? 'rgba(168, 85, 247, 0.2)' : 'rgba(15, 23, 42, 0.65)',
                          border: `1px solid ${showDeriv2Curve ? '#a855f7' : 'rgba(148, 163, 184, 0.3)'}`,
                          color: showDeriv2Curve ? '#a855f7' : '#94a3b8',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        🌀 f''(x) Concavity
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCritPoints(prev => !prev)}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '5px',
                          background: showCritPoints ? 'rgba(251, 191, 36, 0.2)' : 'rgba(15, 23, 42, 0.65)',
                          border: `1px solid ${showCritPoints ? '#fbbf24' : 'rgba(148, 163, 184, 0.3)'}`,
                          color: showCritPoints ? '#fbbf24' : '#94a3b8',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        ▲ Extrema (f'=0)
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInflectionPoints(prev => !prev)}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '5px',
                          background: showInflectionPoints ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.65)',
                          border: `1px solid ${showInflectionPoints ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}`,
                          color: showInflectionPoints ? '#38bdf8' : '#94a3b8',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        ◆ Inflections (f''=0)
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. On-Canvas HUD Toggle */}
                <button
                  type="button"
                  onClick={() => setShowCalcFormulaHud(prev => !prev)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: showCalcFormulaHud ? 'rgba(192, 132, 252, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${showCalcFormulaHud ? '#c084fc' : 'rgba(148, 163, 184, 0.3)'}`,
                    color: showCalcFormulaHud ? '#c084fc' : 'var(--text-muted)',
                    fontSize: '0.70rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>📜 On-Canvas Formula HUD {showCalcFormulaHud ? 'VISIBLE (ON)' : 'HIDDEN (OFF)'}</span>
                </button>

                {/* 5. Sidebar Analytical Telemetry Card */}
                {(() => {
                  const telem = getCalcTelemetry(calcPreset, calcX0, calcH, calcBoundA, calcBoundB, calcIntegralN, riemannMethod);
                  return (
                    <div
                      style={{
                        background: 'rgba(15, 23, 42, 0.85)',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.04em' }}>
                          CALCULUS TELEMETRY:
                        </span>
                        <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 800 }}>
                          {calcMode.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#f8fafc', background: 'rgba(11, 17, 32, 0.75)', padding: '5px 8px', borderRadius: '4px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                        <div>{telem.formulaLatex}</div>
                      </div>

                      {calcMode === 'tangent_secant' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                            <span>Secant Slope (m_sec):</span>
                            <span style={{ fontWeight: 800 }}>{telem.secantSlope.toFixed(4)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                            <span>Tangent Slope (f'(x₀)):</span>
                            <span style={{ fontWeight: 800 }}>{telem.tangentSlope.toFixed(4)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: telem.secantError < 0.05 ? '#34d399' : '#f87171' }}>
                            <span>Limit Error (|Δm|):</span>
                            <span style={{ fontWeight: 800 }}>{telem.secantError.toFixed(4)} (h={calcH.toFixed(2)})</span>
                          </div>
                        </div>
                      )}

                      {calcMode === 'riemann_sums' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                            <span>Exact Definite Integral:</span>
                            <span style={{ fontWeight: 800 }}>{telem.exactIntegral.toFixed(4)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                            <span>{riemannMethod.toUpperCase()} Sum (N={calcIntegralN}):</span>
                            <span style={{ fontWeight: 800 }}>{telem.riemannSum.toFixed(4)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: telem.relativeErrorPct < 1.0 ? '#34d399' : '#fbbf24' }}>
                            <span>Approximation Error:</span>
                            <span style={{ fontWeight: 800 }}>{telem.integralError.toFixed(4)} ({telem.relativeErrorPct.toFixed(2)}%)</span>
                          </div>
                        </div>
                      )}

                      {calcMode === 'derivatives' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                            <span>f(x₀={calcX0.toFixed(2)}):</span>
                            <span style={{ fontWeight: 800 }}>{telem.y0.toFixed(3)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                            <span>f'(x₀) Slope:</span>
                            <span style={{ fontWeight: 800 }}>{telem.tangentSlope.toFixed(3)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a855f7' }}>
                            <span>f''(x₀) Concavity:</span>
                            <span style={{ fontWeight: 800 }}>
                              {evalCalcSecondDerivative(calcX0, calcPreset).toFixed(3)}{' '}
                              ({evalCalcSecondDerivative(calcX0, calcPreset) > 0.05 ? '∪ Up' : evalCalcSecondDerivative(calcX0, calcPreset) < -0.05 ? '∩ Down' : '∼ Flat'})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
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
                {/* Camera View Angles Quick Presets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--dropdown-bg, #0b1120)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)' }}>CAMERA VIEW:</span>
                    <span style={{ fontSize: '0.58rem', color: '#38bdf8', fontFamily: 'monospace' }}>Rx:{rotX.toFixed(0)}° Ry:{rotY.toFixed(0)}°</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => { setRotX(30); setRotY(45); setZoom3D(1.0); }}
                      style={{
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: Math.abs(rotX - 30) < 3 && Math.abs(rotY - 45) < 3 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                        color: Math.abs(rotX - 30) < 3 && Math.abs(rotY - 45) < 3 ? '#38bdf8' : 'var(--text-primary)',
                        border: Math.abs(rotX - 30) < 3 && Math.abs(rotY - 45) < 3 ? '1px solid #38bdf8' : '1px solid var(--card-border)'
                      }}
                      title="Isometric 3D View (30°, 45°)"
                    >
                      📐 Iso
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRotX(82); setRotY(0); setZoom3D(1.1); }}
                      style={{
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: Math.abs(rotX - 82) < 4 && Math.abs(rotY - 0) < 4 ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                        color: Math.abs(rotX - 82) < 4 && Math.abs(rotY - 0) < 4 ? '#34d399' : 'var(--text-primary)',
                        border: Math.abs(rotX - 82) < 4 && Math.abs(rotY - 0) < 4 ? '1px solid #34d399' : '1px solid var(--card-border)'
                      }}
                      title="Top-Down 2D Contour View (82°, 0°)"
                    >
                      🎯 Top 2D
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRotX(0); setRotY(90); setZoom3D(1.0); }}
                      style={{
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: Math.abs(rotX - 0) < 3 && Math.abs(rotY - 90) < 3 ? 'rgba(251, 191, 36, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                        color: Math.abs(rotX - 0) < 3 && Math.abs(rotY - 90) < 3 ? '#fbbf24' : 'var(--text-primary)',
                        border: Math.abs(rotX - 0) < 3 && Math.abs(rotY - 90) < 3 ? '1px solid #fbbf24' : '1px solid var(--card-border)'
                      }}
                      title="Side Profile View (0°, 90°)"
                    >
                      ↔️ Side
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRotX(26); setRotY(42); setZoom3D(1.0); }}
                      style={{
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: Math.abs(rotX - 26) < 3 && Math.abs(rotY - 42) < 3 ? 'rgba(168, 85, 247, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                        color: Math.abs(rotX - 26) < 3 && Math.abs(rotY - 42) < 3 ? '#a855f7' : 'var(--text-primary)',
                        border: Math.abs(rotX - 26) < 3 && Math.abs(rotY - 42) < 3 ? '1px solid #a855f7' : '1px solid var(--card-border)'
                      }}
                      title="Reset to Default Angle (26°, 42°)"
                    >
                      🔄 Default
                    </button>
                  </div>
                </div>

                <DualParamControl label="Pitch Angle (Rx):" value={rotX} min={-80} max={80} step={2} onChange={setRotX} color="#38bdf8" />
                <DualParamControl label="Yaw Angle (Ry):" value={rotY} min={-180} max={180} step={2} onChange={setRotY} color="#34d399" />
                <DualParamControl label="View Zoom:" value={zoom3D} min={0.5} max={2.2} step={0.05} onChange={setZoom3D} color="#a855f7" />
                <DualParamControl label="Mesh Density (N):" value={meshResolution} min={16} max={36} step={2} precision={0} onChange={setMeshResolution} color="#fbbf24" />

                {/* 4. Layer Visibility Toggles (2x3 Grid to avoid any overflow) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: 'var(--dropdown-bg, #0b1120)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)' }}>LAYERS (3D OVERLAYS):</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setShow3dAxes(prev => !prev)}
                      style={{
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: show3dAxes ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                        color: show3dAxes ? '#38bdf8' : 'var(--text-muted)',
                        border: show3dAxes ? '1px solid #38bdf8' : '1px solid var(--card-border)',
                        textAlign: 'center'
                      }}
                      title="Toggle 3D Axes Triad & Corner Orientation Gizmo"
                    >
                      📐 Axes {show3dAxes ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFloorGrid(prev => !prev)}
                      style={{
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: showFloorGrid ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                        color: showFloorGrid ? '#34d399' : 'var(--text-muted)',
                        border: showFloorGrid ? '1px solid #34d399' : '1px solid var(--card-border)',
                        textAlign: 'center'
                      }}
                      title="Toggle Illuminated Isometric Floor Grid"
                    >
                      🌐 Floor {showFloorGrid ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSlicePlane(prev => !prev)}
                      style={{
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: showSlicePlane ? 'rgba(251, 191, 36, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                        color: showSlicePlane ? '#fbbf24' : 'var(--text-muted)',
                        border: showSlicePlane ? '1px solid #fbbf24' : '1px solid var(--card-border)',
                        textAlign: 'center'
                      }}
                      title="Toggle Horizontal Slicing Plane & Isocline Contours"
                    >
                      ✂️ Slice {showSlicePlane ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCriticalPoints(prev => !prev)}
                      style={{
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: showCriticalPoints ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                        color: showCriticalPoints ? '#34d399' : 'var(--text-muted)',
                        border: showCriticalPoints ? '1px solid #34d399' : '1px solid var(--card-border)',
                        textAlign: 'center'
                      }}
                      title="Toggle Critical Points & Hessian Stationary Markers (Min/Max/Saddle)"
                    >
                      🏷️ Crit {showCriticalPoints ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGradientQuiver(prev => !prev)}
                      style={{
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: showGradientQuiver ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                        color: showGradientQuiver ? '#38bdf8' : 'var(--text-muted)',
                        border: showGradientQuiver ? '1px solid #38bdf8' : '1px solid var(--card-border)',
                        textAlign: 'center'
                      }}
                      title="Toggle 3D Gradient Vector Quiver Field (-∇f arrows on surface)"
                    >
                      🏹 Quiver {showGradientQuiver ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRollingBall(prev => !prev)}
                      style={{
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: showRollingBall ? 'rgba(236, 72, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                        color: showRollingBall ? '#ec4899' : 'var(--text-muted)',
                        border: showRollingBall ? '1px solid #ec4899' : '1px solid var(--card-border)',
                        textAlign: 'center'
                      }}
                      title="Toggle 3D Ball & Trajectory Ribbon"
                    >
                      ⚽ Ball {showRollingBall ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {showSlicePlane && (
                  <DualParamControl label="Isocline Slice (z₀):" value={sliceHeightZ} min={-1.4} max={1.4} step={0.05} onChange={setSliceHeightZ} color="#fbbf24" />
                )}

                {/* 5. 3D Gradient Descent / Geodesic Orbit Controller */}
                <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--dropdown-bg, #0b1120)', border: showRollingBall ? (surfaceType === 'torus' || surfaceType === 'mobius' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(251, 191, 36, 0.35)') : '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: showRollingBall ? (surfaceType === 'torus' || surfaceType === 'mobius' ? '#38bdf8' : '#fbbf24') : 'var(--text-muted)' }}>
                        {surfaceType === 'torus' || surfaceType === 'mobius' ? '🌀 Geodesic Orbit:' : '🟡 Gradient Descent:'}
                      </span>
                      <span style={{ fontSize: '0.55rem', fontWeight: 800, padding: '1px 5px', borderRadius: '3px', background: showRollingBall ? 'rgba(52, 211, 153, 0.2)' : 'rgba(100, 116, 139, 0.2)', color: showRollingBall ? '#34d399' : '#94a3b8' }}>
                        {showRollingBall ? (isBallPaused ? 'PAUSED' : 'ACTIVE') : 'MUTED'}
                      </span>
                    </div>
                    {/* Action Controls: Drop Random, Play/Pause, Step 1x, Reset */}
                    <div style={{ display: 'flex', gap: '3px' }}>
                      <button
                        type="button"
                        onClick={() => resetBall(true)}
                        style={{
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontSize: '0.56rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: surfaceType === 'torus' || surfaceType === 'mobius' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(251, 191, 36, 0.18)',
                          color: surfaceType === 'torus' || surfaceType === 'mobius' ? '#38bdf8' : '#fbbf24',
                          border: surfaceType === 'torus' || surfaceType === 'mobius' ? '1px solid #38bdf8' : '1px solid #fbbf24'
                        }}
                        title="Randomize starting position (x₀, y₀)"
                      >
                        🎲 Drop
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsBallPaused(prev => !prev)}
                        style={{
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontSize: '0.56rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: isBallPaused ? 'rgba(52, 211, 153, 0.22)' : 'rgba(236, 72, 153, 0.22)',
                          color: isBallPaused ? '#34d399' : '#ec4899',
                          border: isBallPaused ? '1px solid #34d399' : '1px solid #ec4899'
                        }}
                        title={isBallPaused ? 'Resume continuous descent' : 'Pause descent to step manually'}
                      >
                        {isBallPaused ? '▶ Play' : '⏸ Pause'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsBallPaused(true); stepSingleOptimizerIteration(1.0); }}
                        style={{
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontSize: '0.56rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: 'rgba(56, 189, 248, 0.22)',
                          color: '#38bdf8',
                          border: '1px solid #38bdf8'
                        }}
                        title="Execute exactly 1 discrete gradient descent iteration"
                      >
                        ⏭ Step
                      </button>
                      <button
                        type="button"
                        onClick={() => resetBall(false)}
                        style={{
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontSize: '0.56rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: 'rgba(30, 41, 59, 0.8)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--card-border)'
                        }}
                        title="Reset ball to origin / default start"
                      >
                        ↺
                      </button>
                    </div>
                  </div>

                  {surfaceType === 'torus' || surfaceType === 'mobius' ? (
                    <div style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div>{surfaceType === 'torus' ? '🍩 Toroidal (p,q)=(1,2) Closed Geodesic Knot' : '♾️ Möbius Strip Double-Loop Non-Orientable Geodesic'}</div>
                      <div style={{ color: showRollingBall ? '#38bdf8' : '#64748b', fontWeight: 700 }}>
                        {showRollingBall ? (isBallPaused ? 'Descent paused. Click [▶ Play] or [⏭ Step].' : 'Continuous 60 FPS trajectory tracing active.') : 'Particle layer is hidden. Toggle [⚽ Ball ON] in LAYERS.'}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 4-Way Optimizer Selector */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '0.58rem', fontWeight: 800, color: 'var(--text-muted)' }}>ACTIVE OPTIMIZER:</span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px', background: 'rgba(15, 23, 42, 0.7)', padding: '3px', borderRadius: '6px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
                          <button
                            type="button"
                            onClick={() => { setOptimizerMode('sgd'); resetBall(false); }}
                            style={{
                              padding: '4px 2px',
                              borderRadius: '4px',
                              fontSize: '0.57rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              background: optimizerMode === 'sgd' ? 'rgba(56, 189, 248, 0.28)' : 'transparent',
                              color: optimizerMode === 'sgd' ? '#38bdf8' : 'var(--text-muted)',
                              border: optimizerMode === 'sgd' ? '1px solid #38bdf8' : '1px solid transparent',
                              textAlign: 'center'
                            }}
                            title="Pure Stochastic / Batch Gradient Descent (xₜ₊₁ = xₜ - η∇f)"
                          >
                            🔵 SGD
                          </button>
                          <button
                            type="button"
                            onClick={() => { setOptimizerMode('momentum'); resetBall(false); }}
                            style={{
                              padding: '4px 2px',
                              borderRadius: '4px',
                              fontSize: '0.57rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              background: optimizerMode === 'momentum' ? 'rgba(52, 211, 153, 0.28)' : 'transparent',
                              color: optimizerMode === 'momentum' ? '#34d399' : 'var(--text-muted)',
                              border: optimizerMode === 'momentum' ? '1px solid #34d399' : '1px solid transparent',
                              textAlign: 'center'
                            }}
                            title="Polyak Heavy-Ball Momentum (vₜ₊₁ = γvₜ - η∇f)"
                          >
                            🟢 Mom
                          </button>
                          <button
                            type="button"
                            onClick={() => { setOptimizerMode('adam'); resetBall(false); }}
                            style={{
                              padding: '4px 2px',
                              borderRadius: '4px',
                              fontSize: '0.57rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              background: optimizerMode === 'adam' ? 'rgba(251, 146, 60, 0.28)' : 'transparent',
                              color: optimizerMode === 'adam' ? '#fb923c' : 'var(--text-muted)',
                              border: optimizerMode === 'adam' ? '1px solid #fb923c' : '1px solid transparent',
                              textAlign: 'center'
                            }}
                            title="Adaptive Moment Estimation (mₜ, vₜ with bias correction)"
                          >
                            🟠 Adam
                          </button>
                          <button
                            type="button"
                            onClick={() => { setOptimizerMode('race'); resetBall(false); }}
                            style={{
                              padding: '4px 2px',
                              borderRadius: '4px',
                              fontSize: '0.57rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              background: optimizerMode === 'race' ? 'rgba(168, 85, 247, 0.28)' : 'transparent',
                              color: optimizerMode === 'race' ? '#a855f7' : 'var(--text-muted)',
                              border: optimizerMode === 'race' ? '1px solid #a855f7' : '1px solid transparent',
                              textAlign: 'center'
                            }}
                            title="Simultaneous 3-Way Optimizer Race from same starting coordinates"
                          >
                            🏎️ Race
                          </button>
                        </div>
                      </div>

                      {/* Algorithm Formula & Description Pill */}
                      <div style={{ fontSize: '0.58rem', fontFamily: 'monospace', color: optimizerMode === 'sgd' ? '#38bdf8' : optimizerMode === 'adam' ? '#fb923c' : optimizerMode === 'race' ? '#a855f7' : '#34d399', background: 'rgba(15, 23, 42, 0.65)', padding: '4px 6px', borderRadius: '4px', border: '1px solid rgba(51, 65, 85, 0.4)' }}>
                        {optimizerMode === 'sgd' && 'Formula: x(t+1) = x(t) - η · ∇f(x(t))'}
                        {optimizerMode === 'momentum' && 'Formula: v(t+1) = γ·v(t) - η·∇f,  x(t+1) = x(t) + v(t+1)'}
                        {optimizerMode === 'adam' && 'Formula: m̂/(√v̂ + ε),  β₁=0.90,  β₂=0.999,  ε=1e-7'}
                        {optimizerMode === 'race' && 'Race Mode: SGD (Blue) vs Momentum (Green) vs Adam (Orange)'}
                      </div>

                      {/* Hyperparameter Sliders */}
                      <DualParamControl label="Learning Rate (η):" value={ballLearningRate} min={0.01} max={0.25} step={0.01} onChange={setBallLearningRate} color="#fbbf24" />
                      {(optimizerMode === 'momentum' || optimizerMode === 'race') && (
                        <DualParamControl label="Momentum Coeff (γ):" value={ballMomentum} min={0.0} max={0.95} step={0.05} onChange={setBallMomentum} color="#34d399" />
                      )}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 1. ODE System Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                    Dynamical System Family:
                  </span>
                  <PillSelector
                    options={[
                      { id: 'pendulum', label: 'Pendulum' },
                      { id: 'vanderpol', label: 'Van der Pol' },
                      { id: 'lotka_volterra', label: 'Lotka-Volterra' },
                      { id: 'duffing', label: 'Duffing Well' }
                    ]}
                    value={odeSystem}
                    onChange={(val) => setOdeSystem(val as any)}
                    columns={2}
                    activeColor="var(--accent-cyan, #38bdf8)"
                  />
                </div>

                {/* 2. System Parameter & Initial State Sliders */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <DualParamControl
                    label={odeSystem === 'vanderpol' ? 'Nonlinearity Param (μ):' : odeSystem === 'lotka_volterra' ? 'Interaction Scaling (γ):' : 'Damping Coefficient (d):'}
                    value={dampingFactor}
                    min={0.0}
                    max={1.5}
                    step={0.05}
                    onChange={setDampingFactor}
                    color="#38bdf8"
                  />
                  <DualParamControl
                    label={odeSystem === 'pendulum' ? 'Initial Angle θ₀ (X₀):' : odeSystem === 'lotka_volterra' ? 'Initial Prey (X₀):' : 'Initial Position (X₀):'}
                    value={phaseX0}
                    min={-2.8}
                    max={2.8}
                    step={0.1}
                    onChange={setPhaseX0}
                    color="#34d399"
                  />
                  <DualParamControl
                    label={odeSystem === 'pendulum' ? 'Initial Velocity ω₀ (Y₀):' : odeSystem === 'lotka_volterra' ? 'Initial Predator (Y₀):' : 'Initial Velocity (Y₀):'}
                    value={phaseY0}
                    min={-2.8}
                    max={2.8}
                    step={0.1}
                    onChange={setPhaseY0}
                    color="#f59e0b"
                  />
                </div>

                {/* 3. Grid Vector Density */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                    Vector Grid Resolution:
                  </span>
                  <PillSelector
                    options={[
                      { id: 'coarse', label: 'Coarse (10×8)' },
                      { id: 'medium', label: 'Medium (16×12)' },
                      { id: 'fine', label: 'Fine (22×16)' }
                    ]}
                    value={odeGridDensity}
                    onChange={(val) => setOdeGridDensity(val as any)}
                    columns={3}
                    activeColor="var(--accent-cyan, #38bdf8)"
                  />
                </div>

                {/* 4. Calculus & Flow Diagnostics Toggles */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowOdeTrajectory(!showOdeTrajectory)}
                    style={{
                      padding: '5px 4px',
                      borderRadius: '4px',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: showOdeTrajectory ? 'rgba(52, 211, 153, 0.22)' : 'rgba(30, 41, 59, 0.4)',
                      color: showOdeTrajectory ? '#34d399' : '#64748b',
                      border: showOdeTrajectory ? '1px solid #34d399' : '1px solid rgba(51, 65, 85, 0.4)'
                    }}
                  >
                    💫 RK4 Orbit {showOdeTrajectory ? 'ON' : 'OFF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOdeStreamlines(!showOdeStreamlines)}
                    style={{
                      padding: '5px 4px',
                      borderRadius: '4px',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: showOdeStreamlines ? 'rgba(56, 189, 248, 0.22)' : 'rgba(30, 41, 59, 0.4)',
                      color: showOdeStreamlines ? '#38bdf8' : '#64748b',
                      border: showOdeStreamlines ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.4)'
                    }}
                  >
                    🌊 Streamlines {showOdeStreamlines ? 'ON' : 'OFF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOdeNullclines(!showOdeNullclines)}
                    style={{
                      padding: '5px 4px',
                      borderRadius: '4px',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: showOdeNullclines ? 'rgba(236, 72, 153, 0.22)' : 'rgba(30, 41, 59, 0.4)',
                      color: showOdeNullclines ? '#ec4899' : '#64748b',
                      border: showOdeNullclines ? '1px solid #ec4899' : '1px solid rgba(51, 65, 85, 0.4)'
                    }}
                  >
                    🎯 Nullclines {showOdeNullclines ? 'ON' : 'OFF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOdeFixedPoints(!showOdeFixedPoints)}
                    style={{
                      padding: '5px 4px',
                      borderRadius: '4px',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: showOdeFixedPoints ? 'rgba(251, 191, 36, 0.22)' : 'rgba(30, 41, 59, 0.4)',
                      color: showOdeFixedPoints ? '#fbbf24' : '#64748b',
                      border: showOdeFixedPoints ? '1px solid #fbbf24' : '1px solid rgba(51, 65, 85, 0.4)'
                    }}
                  >
                    📍 Fixed Points {showOdeFixedPoints ? 'ON' : 'OFF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOdeFormulaHud(!showOdeFormulaHud)}
                    style={{
                      gridColumn: 'span 2',
                      padding: '6px 4px',
                      borderRadius: '4px',
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: showOdeFormulaHud ? 'rgba(168, 85, 247, 0.22)' : 'rgba(30, 41, 59, 0.4)',
                      color: showOdeFormulaHud ? '#c084fc' : '#64748b',
                      border: showOdeFormulaHud ? '1px solid #c084fc' : '1px solid rgba(51, 65, 85, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                  >
                    📜 On-Canvas Formula HUD {showOdeFormulaHud ? 'VISIBLE (ON)' : 'HIDDEN (OFF)'}
                  </button>
                </div>

                {/* 5. Real-Time Analytical ODE Telemetry Card */}
                {(() => {
                  const telem = getOdeTelemetry(odeSystem, dampingFactor, phaseX0, phaseY0);
                  return (
                    <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--dropdown-bg, #0b1120)', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>Analytical Telemetry:</span>
                        <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '1px 6px', borderRadius: '3px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                          RK-4 ODE
                        </span>
                      </div>
                      <div style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: '#f8fafc', fontWeight: 700, padding: '4px 6px', borderRadius: '4px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                        {telem.eq1} <br /> {telem.eq2}
                      </div>
                      <div style={{ fontSize: '0.60rem', color: '#34d399', fontFamily: 'monospace' }}>
                        {telem.energy}
                      </div>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                        Jacobian: {telem.jacobian}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* PHASE 8: FORMULA SANDBOX CONTROLS */}
            {activeModuleId === 'formula_sandbox' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 1. Coordinate System Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>
                    Coordinate Framework:
                  </span>
                  <PillSelector
                    options={[
                      { id: 'cartesian', label: 'Cartesian y=f(x)' },
                      { id: 'polar', label: 'Polar r=f(θ)' },
                      { id: 'parametric', label: 'Parametric (x,y)' }
                    ]}
                    value={sandboxCoordType}
                    onChange={(val) => setSandboxCoordType(val as any)}
                    columns={3}
                    activeColor="var(--accent-cyan, #38bdf8)"
                  />
                </div>

                {/* 2. Function Preset Catalog */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#34d399' }}>
                    Mathematical Preset Family:
                  </span>
                  {sandboxCoordType === 'cartesian' && (
                    <PillSelector
                      options={[
                        { id: 'harmonic', label: '🌊 Harmonic' },
                        { id: 'damped', label: '📉 Damped' },
                        { id: 'gaussian', label: '🔔 Gaussian' },
                        { id: 'cubic', label: '⚡ Cubic f, f\', f\'\'' },
                        { id: 'chirp', label: '🔊 Chirp' },
                        { id: 'beating', label: '🎶 Beating' }
                      ]}
                      value={cartesianPreset}
                      onChange={(val) => setCartesianPreset(val as any)}
                      columns={2}
                      activeColor="#34d399"
                    />
                  )}
                  {sandboxCoordType === 'polar' && (
                    <PillSelector
                      options={[
                        { id: 'rose', label: '🌸 Rose Petals' },
                        { id: 'cardioid', label: '❤️ Cardioid' },
                        { id: 'spiral', label: '🌀 Spiral' },
                        { id: 'lemniscate', label: '♾️ Lemniscate' },
                        { id: 'butterfly', label: '🦋 Butterfly' }
                      ]}
                      value={polarPreset}
                      onChange={(val) => setPolarPreset(val as any)}
                      columns={2}
                      activeColor="#38bdf8"
                    />
                  )}
                  {sandboxCoordType === 'parametric' && (
                    <PillSelector
                      options={[
                        { id: 'lissajous', label: '🎛️ Lissajous' },
                        { id: 'hypotrochoid', label: '⭕ Spirograph' },
                        { id: 'astroid', label: '⭐ Astroid' },
                        { id: 'cycloid', label: '🚲 Cycloid' },
                        { id: 'butterfly_param', label: '🦋 Butterfly' }
                      ]}
                      value={parametricPreset}
                      onChange={(val) => setParametricPreset(val as any)}
                      columns={2}
                      activeColor="#ec4899"
                    />
                  )}
                </div>

                {/* 3. Simultaneous Multi-Curve Layers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--text-muted, #94a3b8)' }}>
                    Active Curve Layers (3 Simultaneous):
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setShowCurve1(!showCurve1)}
                      style={{
                        padding: '5px 4px',
                        borderRadius: '4px',
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: showCurve1 ? 'rgba(52, 211, 153, 0.22)' : 'rgba(30, 41, 59, 0.4)',
                        color: showCurve1 ? '#34d399' : '#64748b',
                        border: showCurve1 ? '1px solid #34d399' : '1px solid rgba(51, 65, 85, 0.4)'
                      }}
                    >
                      ● C1 (Main)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCurve2(!showCurve2)}
                      style={{
                        padding: '5px 4px',
                        borderRadius: '4px',
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: showCurve2 ? 'rgba(56, 189, 248, 0.22)' : 'rgba(30, 41, 59, 0.4)',
                        color: showCurve2 ? '#38bdf8' : '#64748b',
                        border: showCurve2 ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.4)'
                      }}
                    >
                      ● C2 (Sub)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCurve3(!showCurve3)}
                      style={{
                        padding: '5px 4px',
                        borderRadius: '4px',
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: showCurve3 ? 'rgba(236, 72, 153, 0.22)' : 'rgba(30, 41, 59, 0.4)',
                        color: showCurve3 ? '#ec4899' : '#64748b',
                        border: showCurve3 ? '1px solid #ec4899' : '1px solid rgba(51, 65, 85, 0.4)'
                      }}
                    >
                      ● C3 (Env)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCompositeSum(!showCompositeSum)}
                      style={{
                        padding: '5px 4px',
                        borderRadius: '4px',
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: showCompositeSum ? 'rgba(251, 191, 36, 0.22)' : 'rgba(30, 41, 59, 0.4)',
                        color: showCompositeSum ? '#fbbf24' : '#64748b',
                        border: showCompositeSum ? '1px solid #fbbf24' : '1px solid rgba(51, 65, 85, 0.4)'
                      }}
                    >
                      ➕ Sum
                    </button>
                  </div>
                </div>

                {/* 4. Live Bound Dials (k, k2, a, b, c) */}
                <DualParamControl
                  label={sandboxCoordType === 'polar' ? 'Petals / Wavenumber (k):' : sandboxCoordType === 'parametric' ? 'X Frequency (kx):' : 'Frequency / Wavenumber (k):'}
                  value={paramK}
                  min={0.5}
                  max={8.0}
                  step={0.1}
                  onChange={setParamK}
                  color="#38bdf8"
                />

                {(sandboxCoordType === 'parametric' || (sandboxCoordType === 'cartesian' && (cartesianPreset === 'gaussian' || cartesianPreset === 'beating')) || (sandboxCoordType === 'polar' && polarPreset === 'rose')) && (
                  <DualParamControl
                    label={sandboxCoordType === 'parametric' ? 'Y Frequency (ky):' : sandboxCoordType === 'polar' ? 'Denominator / Mod (k₂):' : 'Secondary Frequency (k₂):'}
                    value={paramK2}
                    min={1.0}
                    max={8.0}
                    step={0.5}
                    onChange={setParamK2}
                    color="#f59e0b"
                  />
                )}

                <DualParamControl
                  label="Amplitude / Scale (a):"
                  value={paramA}
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  onChange={setParamA}
                  color="#34d399"
                />

                <DualParamControl
                  label="Phase Shift (b):"
                  value={paramB}
                  min={-3.14}
                  max={3.14}
                  step={0.1}
                  onChange={setParamB}
                  color="#ec4899"
                />

                <DualParamControl
                  label="Vertical Shift / Bias (c):"
                  value={paramC}
                  min={-2.0}
                  max={2.0}
                  step={0.1}
                  onChange={setParamC}
                  color="#a855f7"
                />

                <DualParamControl
                  label="Canvas Viewport Zoom:"
                  value={sandboxZoom}
                  min={0.5}
                  max={2.2}
                  step={0.05}
                  onChange={setSandboxZoom}
                  color="#38bdf8"
                />

                {/* 5. Diagnostic Feature Toggles (3x2 Grid) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px' }}>
                  <button
                    type="button"
                    onClick={() => setShowTangentVector(!showTangentVector)}
                    style={{
                      padding: '5px 4px',
                      borderRadius: '4px',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: showTangentVector ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.4)',
                      color: showTangentVector ? '#38bdf8' : '#64748b',
                      border: showTangentVector ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.4)'
                    }}
                  >
                    🚀 Velocity v(t) {showTangentVector ? 'ON' : 'OFF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAreaShading(!showAreaShading)}
                    style={{
                      padding: '5px 4px',
                      borderRadius: '4px',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: showAreaShading ? 'rgba(52, 211, 153, 0.2)' : 'rgba(30, 41, 59, 0.4)',
                      color: showAreaShading ? '#34d399' : '#64748b',
                      border: showAreaShading ? '1px solid #34d399' : '1px solid rgba(51, 65, 85, 0.4)'
                    }}
                  >
                    🎨 Area Fill {showAreaShading ? 'ON' : 'OFF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGridRings(!showGridRings)}
                    style={{
                      padding: '5px 4px',
                      borderRadius: '4px',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: showGridRings ? 'rgba(251, 191, 36, 0.2)' : 'rgba(30, 41, 59, 0.4)',
                      color: showGridRings ? '#fbbf24' : '#64748b',
                      border: showGridRings ? '1px solid #fbbf24' : '1px solid rgba(51, 65, 85, 0.4)'
                    }}
                  >
                    📐 Grid & Rays {showGridRings ? 'ON' : 'OFF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTracerDot(!showTracerDot)}
                    style={{
                      padding: '5px 4px',
                      borderRadius: '4px',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: showTracerDot ? 'rgba(236, 72, 153, 0.2)' : 'rgba(30, 41, 59, 0.4)',
                      color: showTracerDot ? '#ec4899' : '#64748b',
                      border: showTracerDot ? '1px solid #ec4899' : '1px solid rgba(51, 65, 85, 0.4)'
                    }}
                  >
                    📍 Tracer Dot {showTracerDot ? 'ON' : 'OFF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRootsAndExtrema(!showRootsAndExtrema)}
                    style={{
                      padding: '5px 4px',
                      borderRadius: '4px',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: showRootsAndExtrema ? 'rgba(56, 189, 248, 0.22)' : 'rgba(30, 41, 59, 0.4)',
                      color: showRootsAndExtrema ? '#38bdf8' : '#64748b',
                      border: showRootsAndExtrema ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.4)'
                    }}
                  >
                    🎯 Roots & Crit {showRootsAndExtrema ? 'ON' : 'OFF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOsculatingCircle(!showOsculatingCircle)}
                    style={{
                      padding: '5px 4px',
                      borderRadius: '4px',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: showOsculatingCircle ? 'rgba(251, 191, 36, 0.22)' : 'rgba(30, 41, 59, 0.4)',
                      color: showOsculatingCircle ? '#fbbf24' : '#64748b',
                      border: showOsculatingCircle ? '1px solid #fbbf24' : '1px solid rgba(51, 65, 85, 0.4)'
                    }}
                  >
                    ⭕ Curvature κ {showOsculatingCircle ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* 6. Real-Time Telemetry & Analytical Card */}
                {(() => {
                  const formulaObj = getSandboxFormulaString(
                    sandboxCoordType,
                    cartesianPreset,
                    polarPreset,
                    parametricPreset,
                    paramK,
                    paramK2,
                    paramA,
                    paramB,
                    paramC
                  );
                  return (
                    <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--dropdown-bg, #0b1120)', border: '1px solid var(--card-border, rgba(51, 65, 85, 0.6))', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-cyan, #38bdf8)' }}>Analytical Telemetry:</span>
                        <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '1px 6px', borderRadius: '3px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>
                          {sandboxCoordType.toUpperCase()}
                        </span>
                      </div>

                      {/* LaTeX Mathematical Formula Badge */}
                      <div style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: '#f8fafc', fontWeight: 700, padding: '4px 6px', borderRadius: '4px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                        {formulaObj.main}
                      </div>
                      {formulaObj.sub && (
                        <div style={{ fontSize: '0.60rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                          {formulaObj.sub}
                        </div>
                      )}
                      {formulaObj.env && (
                        <div style={{ fontSize: '0.60rem', color: '#ec4899', fontFamily: 'monospace' }}>
                          {formulaObj.env}
                        </div>
                      )}

                      {/* Live Area / Integral / Arc Length Metric */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)', paddingTop: '4px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{sandboxAreaMetric.label}:</span>
                        <span style={{ color: '#fbbf24', fontWeight: 800, fontFamily: 'monospace' }}>
                          {sandboxAreaMetric.value} {sandboxAreaMetric.unit}
                        </span>
                      </div>

                      {/* Roots & Critical Points Count */}
                      {sandboxCoordType === 'cartesian' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                          <span>Calculus Extrema:</span>
                          <span style={{ color: '#38bdf8', fontWeight: 800, fontFamily: 'monospace' }}>
                            {sandboxKeyPoints.roots.length} Roots • {sandboxKeyPoints.extrema.length} Crit Points
                          </span>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                        <span>Wavelength / Period λ:</span>
                        <span style={{ color: '#34d399', fontWeight: 800, fontFamily: 'monospace' }}>
                          {(2 * Math.PI / Math.max(0.1, paramK)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
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
                  onWheel={(e) => {
                    e.preventDefault();
                    setGauss3dZoom(prev => Math.max(0.4, Math.min(2.5, parseFloat((prev - e.deltaY * 0.001).toFixed(2)))));
                  }}
                >
                  <canvas ref={canvasGauss3dRef} width={700} height={480} style={{ width: '100%', height: '100%', cursor: isDraggingGauss3D ? 'grabbing' : 'grab' }} />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15, 23, 42, 0.85)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.4)', fontSize: '0.74rem', fontFamily: 'monospace', color: '#38bdf8' }}>
                    🪐 3D Bivariate Gaussian Hill • Drag to Rotate (rx: {gauss3dRotX.toFixed(0)}°, ry: {gauss3dRotY.toFixed(0)}°) • Zoom: {(gauss3dZoom * 100).toFixed(0)}% • ρ = {activeRho.toFixed(2)}
                  </div>
                </div>
              ) : gaussDimension === '2d_bivariate' ? (
                <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
                  <defs>
                    <marker id="gauss-arrow-cyan" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L8,3 z" fill="#38bdf8" />
                    </marker>
                    <marker id="gauss-arrow-emerald" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L8,3 z" fill="#34d399" />
                    </marker>
                  </defs>

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
                          const pVal = calcBivariatePdf(vx, vy, gaussMean, 0, gaussStd, gaussStdY, activeRho) * 6.5;
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
                      ry={k * gaussStdY * 55 * Math.sqrt(1 - Math.abs(activeRho))}
                      transform={`rotate(${activeRho * 45} ${gaussMean * 75} 0)`}
                      fill="none"
                      stroke={k === 1 ? '#34d399' : k === 2 ? '#38bdf8' : '#f59e0b'}
                      strokeWidth="2.0"
                      strokeDasharray={k === 3 ? '4 4' : 'none'}
                    />
                  ))}
                  <text x={gaussMean * 75 + 10} y={-gaussStdY * 55 - 10} fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">1σ</text>
                  <text x={gaussMean * 75 + 10} y={-2 * gaussStdY * 55 - 10} fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">2σ</text>
                  <text x={gaussMean * 75 + 10} y={-3 * gaussStdY * 55 - 10} fill="#f59e0b" fontSize="10" fontWeight="bold" fontFamily="monospace">3σ</text>

                  {/* 2D PCA Eigenvector Axes */}
                  {showPcaVectors && (
                    <g>
                      {(() => {
                        const cx = gaussMean * 75;
                        const cy = 0;
                        const len1 = Math.min(170, Math.sqrt(gaussPcaAnalysis.lambda1) * 75);
                        const len2 = Math.min(130, Math.sqrt(gaussPcaAnalysis.lambda2) * 55);
                        const cosT = Math.cos(gaussPcaAnalysis.thetaRad);
                        const sinT = Math.sin(gaussPcaAnalysis.thetaRad);

                        const v1x = cx + len1 * cosT;
                        const v1y = cy - len1 * sinT;
                        const v2x = cx - len2 * sinT;
                        const v2y = cy - len2 * cosT;

                        return (
                          <>
                            {/* Major Eigenvector v1 */}
                            <line x1={cx} y1={cy} x2={v1x} y2={v1y} stroke="#38bdf8" strokeWidth="3" markerEnd="url(#gauss-arrow-cyan)" />
                            <circle cx={v1x} cy={v1y} r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                            <text x={v1x + 8} y={v1y - 4} fill="#38bdf8" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                              v₁ (λ₁={gaussPcaAnalysis.lambda1.toFixed(2)})
                            </text>

                            {/* Minor Eigenvector v2 */}
                            <line x1={cx} y1={cy} x2={v2x} y2={v2y} stroke="#34d399" strokeWidth="3" markerEnd="url(#gauss-arrow-emerald)" />
                            <circle cx={v2x} cy={v2y} r="4" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" />
                            <text x={v2x + 8} y={v2y - 4} fill="#34d399" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                              v₂ (λ₂={gaussPcaAnalysis.lambda2.toFixed(2)})
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  )}

                  <g transform="translate(-300, -220)">
                    <rect x="0" y="0" width="240" height="26" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />
                    <text x="10" y="17" fill="#38bdf8" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                      Cov Matrix: σ_x={gaussStd.toFixed(1)}, σ_y={gaussStdY.toFixed(1)}, ρ={activeRho.toFixed(2)}
                    </text>
                  </g>
                </svg>
              ) : gaussDimension === '1d_qqplot' ? (
                /* ─── 1D QQ-PLOT NORMALITY DIAGNOSTIC VISUALIZER ─── */
                <svg viewBox="-320 -200 640 400" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none' }}>
                  {/* Grid Lines */}
                  {[-150, -100, -50, 0, 50, 100, 150].map(val => (
                    <g key={`qq-grid-${val}`}>
                      <line x1="-280" y1={val} x2="280" y2={val} stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1={val * 1.6} y1="-170" x2={val * 1.6} y2="170" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" strokeDasharray="3 3" />
                    </g>
                  ))}

                  {/* Coordinate Axes */}
                  <line x1="-280" y1="0" x2="280" y2="0" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />
                  <line x1="0" y1="-170" x2="0" y2="170" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1.5" />

                  {/* 45-Degree Standard Normal Reference Line (y = x) */}
                  <line x1="-240" y1="150" x2="240" y2="-150" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3" />
                  <text x="210" y="-155" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">Normal 45° Line (y = x)</text>

                  {/* Quantile Points */}
                  {(() => {
                    const M = 36;
                    const pts = [];
                    for (let i = 1; i <= M; i++) {
                      const p = (i - 0.5) / M;
                      const zNorm = calcGaussianQuantile(p, 0, 1);
                      const tSample = calcStudentTQuantile(p, activeNu, 0, 1);

                      const px = zNorm * 65;
                      const py = -tSample * 42;

                      pts.push(
                        <g key={`qq-pt-${i}`}>
                          <circle
                            cx={px}
                            cy={py}
                            r="4.5"
                            fill={activeNu <= 4 && (p < 0.1 || p > 0.9) ? '#f87171' : '#f59e0b'}
                            stroke="#ffffff"
                            strokeWidth="1.2"
                          />
                        </g>
                      );
                    }
                    return pts;
                  })()}

                  {/* Axis Labels */}
                  <text x="270" y="16" fill="var(--text-muted)" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="end">Theoretical Normal Quantiles (Z)</text>
                  <text x="-10" y="-155" fill="var(--text-muted)" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="end">Sample Quantiles (t_ν)</text>

                  {/* Diagnostic HUD Badge */}
                  <g transform="translate(-305, -185)">
                    <rect x="0" y="0" width="310" height="42" rx="6" fill="rgba(11, 17, 32, 0.92)" stroke="rgba(245, 158, 11, 0.5)" strokeWidth="1" />
                    <text x="10" y="14" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      📉 QQ-Plot Normality Diagnosis: {activeNu <= 5 ? 'Heavy Tails (Fat Tails / Leptokurtic)' : 'Approx. Gaussian (Thin Tails)'}
                    </text>
                    <text x="10" y="26" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                      ν = {activeNu} • Non-linearity in tails reveals outlier risk
                    </text>
                    <text x="10" y="36" fill={activeNu <= 5 ? '#f87171' : '#34d399'} fontSize="7.5" fontFamily="monospace">
                      {activeNu <= 5 ? '⚠️ S-Curve Bowing: Heavy tails violate normality' : '✅ Linearity: Closely tracks theoretical Gaussian'}
                    </text>
                  </g>
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

                  {/* Top-Left Telemetry HUD Badge */}
                  <g transform="translate(-305, -185)">
                    <rect x="0" y="0" width="280" height="42" rx="6" fill="rgba(11, 17, 32, 0.92)" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />
                    <text x="10" y="14" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      🔵 Gaussian N(μ={gaussMean.toFixed(1)}, σ={gaussStd.toFixed(1)})
                    </text>
                    <text x="155" y="14" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      🟠 Student-t (ν={activeNu})
                    </text>
                    <text x="10" y="26" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                      Z_crit = ±{(ciConfidence === 90 ? 1.645 : ciConfidence === 99 ? 2.576 : 1.960).toFixed(2)}  •  t_crit = ±{getStudentTCrit(activeNu, ciConfidence).toFixed(2)}
                    </text>
                    <text x="10" y="36" fill={activeNu <= 4 ? '#f87171' : '#34d399'} fontSize="7.5" fontFamily="monospace">
                      Kurtosis: {activeNu <= 4 ? 'Leptokurtic (Heavy Tails, γ₂=∞)' : `Excess γ₂ = +${(6 / (activeNu - 4)).toFixed(2)}`}
                    </text>
                  </g>

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

                  {/* Rejection Tail Shading (Two-tailed, Left, Right) with Dual Z-crit and t-crit */}
                  {gaussTailMode !== 'empirical_bands' && (
                    <g>
                      {(() => {
                        const zCrit = ciConfidence === 90 ? 1.645 : ciConfidence === 99 ? 2.576 : 1.960;
                        const tCrit = getStudentTCrit(activeNu, ciConfidence);
                        const leftCutZ = (gaussMean - zCrit * gaussStd) * 65;
                        const rightCutZ = (gaussMean + zCrit * gaussStd) * 65;
                        const leftCutT = (gaussMean - tCrit * gaussStd) * 65;
                        const rightCutT = (gaussMean + tCrit * gaussStd) * 65;

                        return (
                          <>
                            {(gaussTailMode === 'two_tailed' || gaussTailMode === 'left_tailed') && (
                              <>
                                <polygon
                                  points={(() => {
                                    const pts: string[] = [];
                                    for (let px = -300; px <= leftCutZ; px += 3) {
                                      const x = px / 65;
                                      const py = 120 - calcGaussianPdf(x, gaussMean, gaussStd) * 450;
                                      pts.push(`${px},${py}`);
                                    }
                                    return `-300,120 ` + pts.join(' ') + ` ${leftCutZ},120`;
                                  })()}
                                  fill="rgba(56, 189, 248, 0.22)"
                                />
                                <polygon
                                  points={(() => {
                                    const pts: string[] = [];
                                    for (let px = -300; px <= leftCutT; px += 3) {
                                      const x = px / 65;
                                      const py = 120 - calcStudentTPdf(x, activeNu, gaussMean, gaussStd) * 450;
                                      pts.push(`${px},${py}`);
                                    }
                                    return `-300,120 ` + pts.join(' ') + ` ${leftCutT},120`;
                                  })()}
                                  fill="rgba(245, 158, 11, 0.22)"
                                />
                                <line x1={leftCutZ} y1="120" x2={leftCutZ} y2={120 - calcGaussianPdf(gaussMean - zCrit * gaussStd, gaussMean, gaussStd) * 450} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
                                <line x1={leftCutT} y1="120" x2={leftCutT} y2={120 - calcStudentTPdf(gaussMean - tCrit * gaussStd, activeNu, gaussMean, gaussStd) * 450} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
                              </>
                            )}
                            {(gaussTailMode === 'two_tailed' || gaussTailMode === 'right_tailed') && (
                              <>
                                <polygon
                                  points={(() => {
                                    const pts: string[] = [];
                                    for (let px = rightCutZ; px <= 300; px += 3) {
                                      const x = px / 65;
                                      const py = 120 - calcGaussianPdf(x, gaussMean, gaussStd) * 450;
                                      pts.push(`${px},${py}`);
                                    }
                                    return `${rightCutZ},120 ` + pts.join(' ') + ` 300,120`;
                                  })()}
                                  fill="rgba(56, 189, 248, 0.22)"
                                />
                                <polygon
                                  points={(() => {
                                    const pts: string[] = [];
                                    for (let px = rightCutT; px <= 300; px += 3) {
                                      const x = px / 65;
                                      const py = 120 - calcStudentTPdf(x, activeNu, gaussMean, gaussStd) * 450;
                                      pts.push(`${px},${py}`);
                                    }
                                    return `${rightCutT},120 ` + pts.join(' ') + ` 300,120`;
                                  })()}
                                  fill="rgba(245, 158, 11, 0.22)"
                                />
                                <line x1={rightCutZ} y1="120" x2={rightCutZ} y2={120 - calcGaussianPdf(gaussMean + zCrit * gaussStd, gaussMean, gaussStd) * 450} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
                                <line x1={rightCutT} y1="120" x2={rightCutT} y2={120 - calcStudentTPdf(gaussMean + tCrit * gaussStd, activeNu, gaussMean, gaussStd) * 450} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
                              </>
                            )}
                            {gaussTailMode === 'two_tailed' && (
                              <>
                                <text x={leftCutT - 4} y="112" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="end">-t_crit</text>
                                <text x={leftCutZ + 4} y="112" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="start">-z_crit</text>
                                <text x={rightCutZ - 4} y="112" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="end">+z_crit</text>
                                <text x={rightCutT + 4} y="112" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="start">+t_crit</text>
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

                  {/* Dual Confidence Interval Comparison Brackets (Z-CI vs t-CI) */}
                  {showCiBrackets && (
                    <g transform="translate(0, 140)">
                      <line x1="-280" y1="0" x2="280" y2="0" stroke="rgba(51, 65, 85, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
                      {/* Z-CI Bracket (Cyan) */}
                      <g>
                        <line x1={gaussHypoAnalysis.zCiLow * 65} y1="-6" x2={gaussHypoAnalysis.zCiHigh * 65} y2="-6" stroke="#38bdf8" strokeWidth="2.2" />
                        <line x1={gaussHypoAnalysis.zCiLow * 65} y1="-10" x2={gaussHypoAnalysis.zCiLow * 65} y2="-2" stroke="#38bdf8" strokeWidth="1.8" />
                        <line x1={gaussHypoAnalysis.zCiHigh * 65} y1="-10" x2={gaussHypoAnalysis.zCiHigh * 65} y2="-2" stroke="#38bdf8" strokeWidth="1.8" />
                        <text x={(gaussHypoAnalysis.zCiLow + gaussHypoAnalysis.zCiHigh) * 32.5} y="-9" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          {ciConfidence}% Z-CI: [{(gaussHypoAnalysis.zCiLow).toFixed(2)}, {(gaussHypoAnalysis.zCiHigh).toFixed(2)}]
                        </text>
                      </g>
                      {/* t-CI Bracket (Amber) */}
                      <g>
                        <line x1={gaussHypoAnalysis.tCiLow * 65} y1="12" x2={gaussHypoAnalysis.tCiHigh * 65} y2="12" stroke="#f59e0b" strokeWidth="2.2" />
                        <line x1={gaussHypoAnalysis.tCiLow * 65} y1="8" x2={gaussHypoAnalysis.tCiLow * 65} y2="16" stroke="#f59e0b" strokeWidth="1.8" />
                        <line x1={gaussHypoAnalysis.tCiHigh * 65} y1="8" x2={gaussHypoAnalysis.tCiHigh * 65} y2="16" stroke="#f59e0b" strokeWidth="1.8" />
                        <text x={(gaussHypoAnalysis.tCiLow + gaussHypoAnalysis.tCiHigh) * 32.5} y="23" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          {ciConfidence}% t-CI: [{(gaussHypoAnalysis.tCiLow).toFixed(2)}, {(gaussHypoAnalysis.tCiHigh).toFixed(2)}] (+{gaussHypoAnalysis.ciInflationPct.toFixed(1)}% wider)
                        </text>
                      </g>
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

                  {/* Hypothesis Testing Sample Mean Pin & Verdict Overlay */}
                  {showHypoTestOverlay && (
                    <g>
                      {(() => {
                        const xPos = hypoSampleMean * 65;
                        const pdfY = 120 - calcStudentTPdf(hypoSampleMean, activeNu, gaussMean, gaussStd) * 450;
                        return (
                          <g>
                            <line x1={xPos} y1="120" x2={xPos} y2={pdfY} stroke={gaussHypoAnalysis.isRejectedT ? '#f87171' : '#34d399'} strokeWidth="2.5" strokeDasharray="3 2" />
                            <circle cx={xPos} cy={pdfY} r="7" fill={gaussHypoAnalysis.isRejectedT ? '#f87171' : '#34d399'} stroke="#ffffff" strokeWidth="2" />
                            <g transform={`translate(${Math.max(-280, Math.min(160, xPos - 60))}, ${Math.max(-140, pdfY - 32)})`}>
                              <rect x="0" y="0" width="130" height="24" rx="4" fill="rgba(15, 23, 42, 0.94)" stroke={gaussHypoAnalysis.isRejectedT ? '#f87171' : '#34d399'} strokeWidth="1.2" />
                              <text x="6" y="10" fill={gaussHypoAnalysis.isRejectedT ? '#f87171' : '#34d399'} fontSize="7.5" fontWeight="bold" fontFamily="monospace">
                                x̄={hypoSampleMean.toFixed(2)} • t={gaussHypoAnalysis.tStat.toFixed(2)}
                              </text>
                              <text x="6" y="20" fill="#cbd5e1" fontSize="7" fontFamily="monospace">
                                p={gaussHypoAnalysis.pValT.toFixed(4)} ({gaussHypoAnalysis.isRejectedT ? 'REJECT H₀' : 'FAIL TO REJECT'})
                              </text>
                            </g>
                          </g>
                        );
                      })()}
                    </g>
                  )}

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
              {/* On-Canvas Quick Display Controls (Formulas & Point Labels Toggles) */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 20,
                  display: 'flex',
                  gap: '6px',
                  pointerEvents: 'auto'
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowSvcFormulaHud(prev => !prev)}
                  style={{
                    background: showSvcFormulaHud ? 'rgba(15, 23, 42, 0.88)' : 'rgba(30, 41, 59, 0.80)',
                    border: `1px solid ${showSvcFormulaHud ? 'rgba(56, 189, 248, 0.5)' : 'rgba(148, 163, 184, 0.3)'}`,
                    color: showSvcFormulaHud ? '#38bdf8' : '#94a3b8',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.35)'
                  }}
                  title="Toggle Math Formula & Telemetry HUD on canvas"
                >
                  <span>📐 Math HUD:</span>
                  <b>{showSvcFormulaHud ? 'ON' : 'OFF'}</b>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSvcPointLabels(prev => !prev)}
                  style={{
                    background: showSvcPointLabels ? 'rgba(15, 23, 42, 0.88)' : 'rgba(30, 41, 59, 0.80)',
                    border: `1px solid ${showSvcPointLabels ? 'rgba(251, 191, 36, 0.5)' : 'rgba(148, 163, 184, 0.3)'}`,
                    color: showSvcPointLabels ? '#fbbf24' : '#94a3b8',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.35)'
                  }}
                  title="Toggle static data point labels and slack tags to prevent obscuring point clusters"
                >
                  <span>🏷️ Point Labels:</span>
                  <b>{showSvcPointLabels ? 'ON' : 'OFF (CLEAN)'}</b>
                </button>
              </div>

              {svcDimension === '1d_line' ? (
                /* ─── 1D NUMBER LINE SEPARATOR ─── */
                <svg
                  ref={svcSvgRef}
                  viewBox="-320 -240 640 480"
                  onPointerMove={handleSvcPointerMove}
                  onPointerUp={handleSvcPointerUp}
                  onPointerCancel={handleSvcPointerUp}
                  style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none', touchAction: 'none' }}
                >
                  {/* Axis line */}
                  <line x1="-300" y1="0" x2="300" y2="0" stroke="rgba(148, 163, 184, 0.6)" strokeWidth="2" />
                  {/* Axis tick marks */}
                  {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(tick => (
                    <g key={`svc-1d-tick-${tick}`} transform={`translate(${tick * 55}, 0)`}>
                      <line x1="0" y1="-6" x2="0" y2="6" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" />
                      <text y="20" fill="var(--text-muted, #94a3b8)" fontSize="8.5" fontFamily="monospace" textAnchor="middle">{tick}</text>
                    </g>
                  ))}

                  {/* Margin Band around threshold */}
                  <rect
                    x={(svcAnalysis.effectiveBias * 55) - (svcMarginW * 55) / 2}
                    y="-80"
                    width={svcMarginW * 55}
                    height="160"
                    fill="rgba(56, 189, 248, 0.14)"
                    stroke="#38bdf8"
                    strokeWidth="1.8"
                    strokeDasharray="4 3"
                    rx="4"
                  />

                  {/* Separator Threshold Line */}
                  <line x1={svcAnalysis.effectiveBias * 55} y1="-105" x2={svcAnalysis.effectiveBias * 55} y2="105" stroke="#f59e0b" strokeWidth="3.5" />
                  <text x={svcAnalysis.effectiveBias * 55} y="-115" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    Threshold (X₁ = {svcAnalysis.effectiveBias.toFixed(2)})
                  </text>

                  {/* Positive / Negative Rails */}
                  <line x1="-300" y1="-45" x2="300" y2="-45" stroke="rgba(52, 211, 153, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="-300" y1="45" x2="300" y2="45" stroke="rgba(248, 113, 113, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="-310" y="-41" fill="#34d399" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="end">Class +1</text>
                  <text x="-310" y="49" fill="#f87171" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="end">Class -1</text>

                  {/* 1D Points */}
                  {svcAnalysis.pointsWithStatus.map(p => {
                    const cx = p.x1 * 55;
                    const cy = p.label === 1 ? -45 : 45;
                    return (
                      <g
                        key={`svc-1d-${p.id}`}
                        style={{ cursor: draggingSvcPointId === p.id ? 'grabbing' : 'grab' }}
                        onPointerDown={(e) => handleSvcPointerDown(e, p.id)}
                        onPointerEnter={() => setHoveredSvcPointId(p.id)}
                        onPointerLeave={() => setHoveredSvcPointId(null)}
                      >
                        {/* SV Halo */}
                        {p.isSupportVector && (
                          <>
                            <circle cx={cx} cy={cy} r="16" stroke="#fbbf24" strokeWidth="2.2" strokeDasharray="4 2" fill="none" opacity="0.9" />
                            <circle cx={cx} cy={cy} r="11" stroke="#fbbf24" strokeWidth="1.2" fill="none" />
                          </>
                        )}
                        {/* Slack drop-line if violator */}
                        {p.isMarginViolator && (
                          <line x1={cx} y1={cy} x2={svcAnalysis.effectiveBias * 55} y2={cy} stroke="#ef4444" strokeWidth="1.8" strokeDasharray="2 2" />
                        )}
                        <circle cx={cx} cy={cy} r="8" fill={p.label === 1 ? '#34d399' : '#f87171'} stroke="#ffffff" strokeWidth="2" />

                        {/* Point Label / Tag */}
                        {showSvcPointLabels && (
                          <text x={cx} y={p.label === 1 ? cy - 14 : cy + 20} fill="#cbd5e1" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                            P{p.id} ({p.x1.toFixed(1)})
                          </text>
                        )}

                        {/* Interactive On-Hover Micro-Tooltip */}
                        {hoveredSvcPointId === p.id && (
                          <g transform={`translate(${cx}, ${p.label === 1 ? cy - 24 : cy + 26})`}>
                            <rect x="-42" y="-12" width="84" height="15" rx="3" fill="rgba(11, 17, 32, 0.95)" stroke="#fbbf24" strokeWidth="1.2" />
                            <text x="0" y="-1" fill="#fbbf24" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                              P{p.id} • X₁={p.x1.toFixed(2)}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Top-Left Telemetry HUD Badge */}
                  {showSvcFormulaHud ? (
                    <g transform="translate(-305, -225)">
                      <rect width="250" height="74" rx="6" fill="rgba(11, 17, 32, 0.90)" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.2" />
                      <text x="10" y="16" fill="var(--accent-cyan, #38bdf8)" fontSize="9" fontWeight="bold" fontFamily="monospace">
                        🛡️ 1D THRESHOLD CLASSIFIER
                      </text>
                      <g onClick={() => setShowSvcFormulaHud(false)} style={{ cursor: 'pointer' }}>
                        <rect x="195" y="6" width="48" height="14" rx="3" fill="rgba(148, 163, 184, 0.15)" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.8" />
                        <text x="219" y="16" fill="#94a3b8" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">✕ Hide</text>
                      </g>
                      <text x="10" y="32" fill="#cbd5e1" fontSize="8.5" fontFamily="monospace">
                        Decision Rule: f(x) = sign(X₁ {svcAnalysis.effectiveBias >= 0 ? '- ' + svcAnalysis.effectiveBias.toFixed(2) : '+ ' + (-svcAnalysis.effectiveBias).toFixed(2)})
                      </text>
                      <text x="10" y="48" fill="#fbbf24" fontSize="8.5" fontFamily="monospace">
                        Margin M = {svcMarginW.toFixed(2)} • Box C = {svcC.toFixed(1)}
                      </text>
                      <text x="10" y="64" fill={svcAnalysis.marginViolatorCount > 0 ? '#f87171' : '#34d399'} fontSize="8" fontWeight="bold" fontFamily="monospace">
                        SVs: {svcAnalysis.supportVectorCount}/{svcPoints.length} • Slack Violators: {svcAnalysis.marginViolatorCount}
                      </text>
                    </g>
                  ) : (
                    <g onClick={() => setShowSvcFormulaHud(true)} style={{ cursor: 'pointer' }} transform="translate(-305, -225)">
                      <rect width="112" height="22" rx="4" fill="rgba(11, 17, 32, 0.85)" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="1" />
                      <text x="8" y="15" fill="#38bdf8" fontSize="8.5" fontWeight="bold" fontFamily="monospace">📜 Show Math HUD</text>
                    </g>
                  )}
                </svg>
              ) : (svcDimension === '3d_plane' || svcDimension === '4d_slice') ? (
                /* ─── 3D & 4D INTERACTIVE PERSPECTIVE CANVAS ENGINE ─── */
                <div
                  style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
                  onMouseDown={(e) => {
                    setIsDraggingSvc3D(true);
                    dragSvc3dStartRef.current = { x: e.clientX, y: e.clientY, rx: svc3dRotX, ry: svc3dRotY };
                  }}
                  onMouseMove={(e) => {
                    if (!isDraggingSvc3D) return;
                    const dx = e.clientX - dragSvc3dStartRef.current.x;
                    const dy = e.clientY - dragSvc3dStartRef.current.y;
                    setSvc3dRotY(dragSvc3dStartRef.current.ry + dx * 0.5);
                    setSvc3dRotX(Math.max(-85, Math.min(85, dragSvc3dStartRef.current.rx - dy * 0.5)));
                  }}
                  onMouseUp={() => setIsDraggingSvc3D(false)}
                  onMouseLeave={() => setIsDraggingSvc3D(false)}
                  onWheel={(e) => {
                    e.preventDefault();
                    setSvc3dZoom(prev => Math.max(0.5, Math.min(2.5, prev - e.deltaY * 0.001)));
                  }}
                >
                  <canvas
                    ref={canvasSvc3dRef}
                    width={720}
                    height={480}
                    style={{ width: '100%', height: '100%', display: 'block', cursor: isDraggingSvc3D ? 'grabbing' : 'grab' }}
                  />

                  {/* 3D & 4D Interactive Telemetry & Controls Badge */}
                  {showSvcFormulaHud ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(11, 17, 32, 0.90)',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: `1px solid ${svcDimension === '4d_slice' ? 'rgba(236, 72, 153, 0.5)' : 'rgba(168, 85, 247, 0.5)'}`,
                        fontSize: '0.72rem',
                        fontFamily: 'monospace',
                        color: '#e2e8f0',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        pointerEvents: 'auto'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: svcDimension === '4d_slice' ? '#ec4899' : '#a855f7' }}>
                          {svcDimension === '4d_slice'
                            ? `🌌 4D Hyperplane Slice [X₄=${(svc4dAutoSlice || isBendingAnim ? svc4dSliceX4 + Math.sin(timeT * 1.5) * 1.8 : svc4dSliceX4).toFixed(2)}]`
                            : `🔮 3D Feature Space Lift: ${svc3dFeatureMap === 'paraboloid' ? 'Paraboloid (X₁²+X₂²)' : svc3dFeatureMap === 'rbf_pot' ? 'RBF Potential' : 'Decision Output'}`}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSvc3dRotX(26);
                              setSvc3dRotY(40);
                              setSvc3dZoom(1.0);
                            }}
                            style={{
                              background: svcDimension === '4d_slice' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                              border: `1px solid ${svcDimension === '4d_slice' ? 'rgba(236, 72, 153, 0.4)' : 'rgba(168, 85, 247, 0.4)'}`,
                              color: svcDimension === '4d_slice' ? '#f472b6' : '#c084fc',
                              borderRadius: '4px',
                              padding: '1px 6px',
                              fontSize: '0.62rem',
                              cursor: 'pointer'
                            }}
                          >
                            Reset Cam
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowSvcFormulaHud(false);
                            }}
                            style={{
                              background: 'rgba(148, 163, 184, 0.15)',
                              border: '1px solid rgba(148, 163, 184, 0.3)',
                              color: '#94a3b8',
                              borderRadius: '4px',
                              padding: '1px 5px',
                              fontSize: '0.62rem',
                              cursor: 'pointer'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'flex', gap: '10px' }}>
                        <span>Pitch: {svc3dRotX.toFixed(0)}°</span>
                        <span>Yaw: {svc3dRotY.toFixed(0)}°</span>
                        <span>Zoom: {(svc3dZoom * 100).toFixed(0)}%</span>
                        {svcDimension === '4d_slice' ? (
                          <>
                            <span style={{ color: '#ec4899' }}>Slice Window: ±{svc4dSliceThickness.toFixed(1)}</span>
                            <span style={{ color: svc4dAutoSlice ? '#34d399' : '#94a3b8' }}>Auto-Sweep: {svc4dAutoSlice ? 'ON' : 'OFF'}</span>
                          </>
                        ) : (
                          <>
                            <span style={{ color: '#fbbf24' }}>SVs: {svcAnalysis.supportVectorCount}</span>
                            <span style={{ color: '#34d399' }}>Acc: {svcAnalysis.accuracy.toFixed(1)}%</span>
                          </>
                        )}
                      </div>
                      <div style={{ fontSize: '0.58rem', color: '#64748b' }}>
                        🖱️ Drag to rotate • Scroll wheel to zoom • Top toolbar Orbit/Wave supported
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSvcFormulaHud(true)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(11, 17, 32, 0.88)',
                        border: `1px solid ${svcDimension === '4d_slice' ? 'rgba(236, 72, 153, 0.5)' : 'rgba(168, 85, 247, 0.5)'}`,
                        color: svcDimension === '4d_slice' ? '#f472b6' : '#c084fc',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                        pointerEvents: 'auto'
                      }}
                    >
                      <span>📜 Show {svcDimension === '4d_slice' ? '4D Slicer HUD' : '3D Telemetry HUD'}</span>
                    </button>
                  )}
                </div>
              ) : (
                /* ─── 2D MAXIMUM MARGIN HYPERPLANE & CONTINUOUS CONTOUR VISUALIZER ─── */
                <svg
                  ref={svcSvgRef}
                  viewBox="-320 -240 640 480"
                  onPointerMove={handleSvcPointerMove}
                  onPointerUp={handleSvcPointerUp}
                  onPointerCancel={handleSvcPointerUp}
                  style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', userSelect: 'none', touchAction: 'none' }}
                >
                  <defs>
                    <marker id="svc-w-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                      <path d="M 0 0 L 8 4 L 0 8 z" fill="#f59e0b" />
                    </marker>
                  </defs>

                  {/* Soft 2D Non-Linear Contour Heatmap Grid */}
                  {(svcKernel === 'rbf' || svcKernel === 'poly') && (
                    <g opacity="0.38" style={{ pointerEvents: 'none' }}>
                      {(() => {
                        const cells = [];
                        const cols = 28;
                        const rows = 20;
                        const dx = 640 / cols;
                        const dy = 480 / rows;
                        for (let c = 0; c < cols; c++) {
                          for (let r = 0; r < rows; r++) {
                            const vx = -5.33 + (c / cols) * 10.66;
                            const vy = 4.0 - (r / rows) * 8.0;
                            let fVal = 0;
                            if (svcKernel === 'rbf') {
                              svcPoints.forEach(other => {
                                const dist2 = (vx - other.x1) * (vx - other.x1) + (vy - other.x2) * (vy - other.x2);
                                fVal += other.label * Math.exp(-svcGamma * dist2);
                              });
                              fVal += svcAnalysis.effectiveBias;
                            } else {
                              fVal = vy - (Math.pow(vx * 0.7, svcPolyDegree) * 0.3 + svcAnalysis.effectiveBias);
                            }
                            const prob = 1 / (1 + Math.exp(-fVal * 2));
                            const red = Math.round(248 * (1 - prob));
                            const green = Math.round(211 * prob);
                            const blue = Math.round(153);
                            cells.push(
                              <rect key={`rbf-c-${c}-${r}`} x={-320 + c * dx} y={-240 + r * dy} width={dx + 0.5} height={dy + 0.5} fill={`rgb(${red}, ${green}, ${blue})`} opacity={Math.abs(prob - 0.5) * 1.5} />
                            );
                          }
                        }
                        return cells;
                      })()}
                    </g>
                  )}

                  {/* Grid Lines & Axes */}
                  <g style={{ pointerEvents: 'none' }}>
                    <line x1="-320" y1="0" x2="320" y2="0" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1.2" />
                    <line x1="0" y1="-240" x2="0" y2="240" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1.2" />
                  </g>

                  {/* Linear Hyperplane & Margin Gutters */}
                  {svcKernel === 'linear' && (
                    <g style={{ pointerEvents: 'none' }}>
                      {/* Margin Ribbon Polygon & Gutters */}
                      {(() => {
                        const xA = -5.5;
                        const xB = 5.5;
                        const marginOffset = (svcMarginW * 1.56205) / 2;
                        const effectiveB = -svcAnalysis.effectiveBias;
                        const pyCenterA = -(1.2 * xA + effectiveB) * 60;
                        const pyCenterB = -(1.2 * xB + effectiveB) * 60;
                        const pyUpperA = -(1.2 * xA + effectiveB - marginOffset) * 60;
                        const pyUpperB = -(1.2 * xB + effectiveB - marginOffset) * 60;
                        const pyLowerA = -(1.2 * xA + effectiveB + marginOffset) * 60;
                        const pyLowerB = -(1.2 * xB + effectiveB + marginOffset) * 60;
                        return (
                          <>
                            <polygon
                              points={`${xA * 60},${pyLowerA} ${xB * 60},${pyLowerB} ${xB * 60},${pyUpperB} ${xA * 60},${pyUpperA}`}
                              fill="rgba(56, 189, 248, 0.12)"
                            />
                            <line x1={xA * 60} y1={pyUpperA} x2={xB * 60} y2={pyUpperB} stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 4" />
                            <line x1={xA * 60} y1={pyLowerA} x2={xB * 60} y2={pyLowerB} stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 4" />
                            <line x1={xA * 60} y1={pyCenterA} x2={xB * 60} y2={pyCenterB} stroke="#f59e0b" strokeWidth="3.5" />
                          </>
                        );
                      })()}

                      {/* Weight Vector w Arrow (Normal to Hyperplane) */}
                      {(() => {
                        const ox = 0;
                        const effectiveB = -svcAnalysis.effectiveBias;
                        const oy = -effectiveB * 60;
                        const arrowLen = 50;
                        const nx = (-1.2 / 1.56205) * arrowLen;
                        const ny = (-1.0 / 1.56205) * arrowLen;
                        return (
                          <g>
                            <line x1={ox} y1={oy} x2={ox + nx} y2={oy + ny} stroke="#f59e0b" strokeWidth="2.5" markerEnd="url(#svc-w-arrow)" />
                            <circle cx={ox} cy={oy} r="3.5" fill="#f59e0b" />
                            <rect x={ox + nx - 128} y={oy + ny - 14} width="124" height="18" rx="3" fill="rgba(15, 23, 42, 0.88)" stroke="rgba(245, 158, 11, 0.5)" strokeWidth="1" />
                            <text x={ox + nx - 66} y={oy + ny - 2} fill="#f59e0b" fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                              w=[-1.2, 1.0]ᵀ (||w||=1.56)
                            </text>
                          </g>
                        );
                      })()}
                    </g>
                  )}

                  {/* Smooth Marching Contours for Non-Linear Kernels (RBF & Polynomial) */}
                  {(svcKernel === 'rbf' || svcKernel === 'poly') && (
                    <g style={{ pointerEvents: 'none' }}>
                      {/* Margin Lower Contour f(x) = -1 (Red Dash) */}
                      {svcAnalysis.marchingLowerMarginContour && (
                        <path
                          d={svcAnalysis.marchingLowerMarginContour}
                          fill="none"
                          stroke="#f87171"
                          strokeWidth="1.8"
                          strokeDasharray="4 3"
                          opacity="0.8"
                        />
                      )}
                      {/* Margin Upper Contour f(x) = +1 (Cyan Dash) */}
                      {svcAnalysis.marchingUpperMarginContour && (
                        <path
                          d={svcAnalysis.marchingUpperMarginContour}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.8"
                          strokeDasharray="4 3"
                          opacity="0.8"
                        />
                      )}
                      {/* Central Zero Decision Contour f(x) = 0 (Solid Amber) */}
                      {svcAnalysis.marchingZeroContour && (
                        <path
                          d={svcAnalysis.marchingZeroContour}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                      )}
                    </g>
                  )}

                  {/* Sample Points, Support Vector Glowing Halos & Exact Perpendicular Slack Drop-Lines */}
                  {svcAnalysis.pointsWithStatus.map(p => {
                    const px = p.x1 * 60;
                    const py = -p.x2 * 60;
                    const projPx = (p.projX1 ?? p.x1) * 60;
                    const projPy = -((p.projX2 ?? p.x2) * 60);

                    return (
                      <g
                        key={`svc-pt-${p.id}`}
                        style={{ cursor: draggingSvcPointId === p.id ? 'grabbing' : 'grab', pointerEvents: 'all' }}
                        onPointerDown={(e) => handleSvcPointerDown(e, p.id)}
                        onPointerEnter={() => setHoveredSvcPointId(p.id)}
                        onPointerLeave={() => setHoveredSvcPointId(null)}
                      >
                        {/* Red Perpendicular Slack Variable Error Drop-Line for Margin Violators */}
                        {p.isMarginViolator && svcKernel === 'linear' && (
                          <g>
                            <line x1={px} y1={py} x2={projPx} y2={projPy} stroke="#ef4444" strokeWidth="2.0" strokeDasharray="3 3" />
                            <circle cx={projPx} cy={projPy} r="3" fill="#ef4444" opacity="0.8" />
                            {(showSvcPointLabels || hoveredSvcPointId === p.id) && (
                              <text x={(px + projPx) / 2 + 5} y={(py + projPy) / 2 - 3} fill="#ef4444" fontSize="8" fontWeight="bold" fontFamily="monospace">
                                ξ={p.slack.toFixed(2)}
                              </text>
                            )}
                          </g>
                        )}

                        {/* Active Support Vector Golden Concentric Ring */}
                        {p.isSupportVector && (
                          <>
                            <circle cx={px} cy={py} r="15" stroke="#fbbf24" strokeWidth="2.2" strokeDasharray="4 2" fill="none" opacity="0.95" />
                            <circle cx={px} cy={py} r="10" stroke="#fbbf24" strokeWidth="1.2" fill="none" />
                            {p.svCategory === 'bounded_sv' && (
                              <circle cx={px} cy={py} r="19" stroke="#ef4444" strokeWidth="1.0" strokeDasharray="2 2" fill="none" opacity="0.7" />
                            )}
                          </>
                        )}

                        {/* Core Point Dot */}
                        <circle cx={px} cy={py} r="7" fill={p.label === 1 ? '#34d399' : '#f87171'} stroke="#ffffff" strokeWidth="1.8" />

                        {/* Optional Static Point Tag (When showSvcPointLabels is ON) */}
                        {showSvcPointLabels && (
                          <g transform={`translate(${px}, ${py - 12})`}>
                            <text
                              x="0"
                              y="0"
                              fill="#cbd5e1"
                              fontSize="7"
                              fontWeight="bold"
                              fontFamily="monospace"
                              textAnchor="middle"
                              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                            >
                              P{p.id} ({p.x1.toFixed(1)},{p.x2.toFixed(1)})
                            </text>
                          </g>
                        )}

                        {/* Interactive Floating Hover Micro-Tooltip */}
                        {hoveredSvcPointId === p.id && (
                          <g transform={`translate(${px}, ${py - 22})`}>
                            <rect
                              x="-62"
                              y="-15"
                              width="124"
                              height="16"
                              rx="4"
                              fill="rgba(11, 17, 32, 0.95)"
                              stroke="#fbbf24"
                              strokeWidth="1.2"
                            />
                            <text
                              x="0"
                              y="-3"
                              fill="#fbbf24"
                              fontSize="7.5"
                              fontWeight="bold"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              P{p.id} • y={p.label > 0 ? '+1' : '-1'} • α={p.alpha.toFixed(2)}{p.slack > 0 ? ` • ξ=${p.slack.toFixed(2)}` : ''}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Glassmorphic LaTeX Mathematical Formula HUD */}
                  {showSvcFormulaHud ? (
                    <g transform="translate(-305, -225)">
                      <rect width="265" height="96" rx="7" fill="rgba(11, 17, 32, 0.88)" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.2" />
                      <text x="10" y="18" fill="var(--accent-cyan, #38bdf8)" fontSize="9" fontWeight="bold" fontFamily="monospace">
                        🛡️ SUPPORT VECTOR CLASSIFIER (SVC)
                      </text>
                      <g onClick={() => setShowSvcFormulaHud(false)} style={{ cursor: 'pointer' }}>
                        <rect x="210" y="7" width="48" height="14" rx="3" fill="rgba(148, 163, 184, 0.15)" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.8" />
                        <text x="234" y="17" fill="#94a3b8" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">✕ Hide</text>
                      </g>
                      <text x="10" y="34" fill="#cbd5e1" fontSize="8.5" fontFamily="monospace">
                        {svcKernel === 'linear'
                          ? `Boundary: wᵀx + b = 0 ⇔ -1.2X₁ + X₂ - (${svcBiasB.toFixed(2)}) = 0`
                          : svcKernel === 'rbf'
                          ? `Kernel: K(x, x') = exp(-γ||x-x'||²)  [γ = ${svcGamma.toFixed(2)}]`
                          : `Kernel: K(x, x') = (xᵀx' + 1)^d  [d = ${svcPolyDegree}]`}
                      </text>
                      <text x="10" y="50" fill="#fbbf24" fontSize="8.5" fontFamily="monospace">
                        Margin: M = 2/||w|| = {svcMarginW.toFixed(2)}  •  Loss: C = {svcC.toFixed(1)}
                      </text>
                      <text x="10" y="66" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                        Obj: min ½||w||² + C Σ ξᵢ  (s.t. yᵢ(wᵀxᵢ+b) ≥ 1 - ξᵢ)
                      </text>
                      <text x="10" y="80" fill={svcAnalysis.marginViolatorCount > 0 ? '#f87171' : '#34d399'} fontSize="8" fontWeight="bold" fontFamily="monospace">
                        SVs: {svcAnalysis.supportVectorCount}/{svcPoints.length}  •  Violators: {svcAnalysis.marginViolatorCount}  •  Σ ξᵢ = {svcAnalysis.totalSlack.toFixed(2)}
                      </text>
                      <text x="10" y="91" fill="#38bdf8" fontSize="7.5" fontFamily="monospace">
                        Acc: {svcAnalysis.accuracy.toFixed(1)}% • Prec: {svcAnalysis.precision.toFixed(1)}% • Rec: {svcAnalysis.recall.toFixed(1)}% • F1: {svcAnalysis.f1Score.toFixed(1)}%
                      </text>
                    </g>
                  ) : (
                    <g onClick={() => setShowSvcFormulaHud(true)} style={{ cursor: 'pointer' }} transform="translate(-305, -225)">
                      <rect width="118" height="22" rx="4" fill="rgba(11, 17, 32, 0.85)" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="1" />
                      <text x="8" y="15" fill="#38bdf8" fontSize="8.5" fontWeight="bold" fontFamily="monospace">📜 Show Math HUD</text>
                    </g>
                  )}
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
                                        ★ ({v.x.toFixed(1)}, {v.y.toFixed(1)}) OPTIMAL Z* = {feasiblePolygon.optimalVertex?.z?.toFixed(1) ?? 'N/A'}
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
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', userSelect: 'none' }}>
              <svg
                viewBox="-320 -240 640 480"
                style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16', cursor: 'crosshair' }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const svgX = (clickX / rect.width) * 640 - 320;
                  const mathX = Math.max(-2.8, Math.min(2.8, Number((svgX / 80).toFixed(2))));
                  if (calcMode === 'tangent_secant' || calcMode === 'derivatives') {
                    setCalcX0(mathX);
                  }
                }}
              >
                <defs>
                  {/* Clip Path for Safe Plot Bounding */}
                  <clipPath id="calcPlotClip">
                    <rect x="-310" y="-230" width="620" height="460" rx="8" />
                  </clipPath>

                  {/* Gradient for Riemann Bars */}
                  <linearGradient id="riemannBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(52, 211, 153, 0.45)" />
                    <stop offset="100%" stopColor="rgba(5, 150, 105, 0.15)" />
                  </linearGradient>

                  {/* Gradient for Negative Riemann Bars */}
                  <linearGradient id="riemannBarNegGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(244, 63, 94, 0.15)" />
                    <stop offset="100%" stopColor="rgba(244, 63, 94, 0.45)" />
                  </linearGradient>

                  {/* Gradient for Differential Triangle */}
                  <linearGradient id="slopeTriangleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(245, 158, 11, 0.35)" />
                    <stop offset="100%" stopColor="rgba(236, 72, 153, 0.2)" />
                  </linearGradient>

                  {/* Gradient for Definite Integral Silhouette */}
                  <linearGradient id="exactAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(56, 189, 248, 0.25)" />
                    <stop offset="100%" stopColor="rgba(56, 189, 248, 0.04)" />
                  </linearGradient>
                </defs>

                <g clipPath="url(#calcPlotClip)">
                  {/* 1. Background Coordinate Grid Lines */}
                  {[-3, -2, -1, 1, 2, 3].map(gx => (
                    <g key={`cgrid-x-${gx}`}>
                      <line x1={gx * 80} y1="-230" x2={gx * 80} y2="230" stroke="rgba(51, 65, 85, 0.45)" strokeWidth="0.8" strokeDasharray="3 3" />
                      <text x={gx * 80} y="14" fill="rgba(148, 163, 184, 0.7)" fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                        {gx > 0 ? `+${gx}` : gx}
                      </text>
                    </g>
                  ))}

                  {[-2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5].map(gy => (
                    <g key={`cgrid-y-${gy}`}>
                      <line x1="-310" y1={-gy * 80} x2="310" y2={-gy * 80} stroke="rgba(51, 65, 85, 0.35)" strokeWidth="0.8" strokeDasharray="3 3" />
                      {Math.abs(gy % 1) < 0.01 && (
                        <text x="-8" y={-gy * 80 + 3} fill="rgba(148, 163, 184, 0.7)" fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="end">
                          {gy > 0 ? `+${gy}` : gy}
                        </text>
                      )}
                    </g>
                  ))}

                  {/* Primary Axes */}
                  <line x1="-310" y1="0" x2="310" y2="0" stroke="rgba(148, 163, 184, 0.6)" strokeWidth="1.6" />
                  <line x1="0" y1="-230" x2="0" y2="230" stroke="rgba(148, 163, 184, 0.6)" strokeWidth="1.6" />
                  <text x="300" y="-8" fill="rgba(148, 163, 184, 0.9)" fontSize="9.5" fontWeight="bold" fontFamily="monospace">+X</text>
                  <text x="8" y="-218" fill="rgba(148, 163, 184, 0.9)" fontSize="9.5" fontWeight="bold" fontFamily="monospace">+Y (f)</text>

                  {/* ─────────────────────────────────────────────────────────────
                      MODE 2: RIEMANN SUMS & DEFINITE INTEGRALS
                     ───────────────────────────────────────────────────────────── */}
                  {calcMode === 'riemann_sums' && (() => {
                    const effA = Math.min(calcBoundA, calcBoundB);
                    const effB = Math.max(calcBoundA, calcBoundB);
                    const n = calcIntegralN;
                    const dx = (effB - effA) / n;
                    const bars = [];

                    for (let i = 0; i < n; i++) {
                      const xL = effA + i * dx;
                      const xR = effA + (i + 1) * dx;
                      const pxL = xL * 80;
                      const pxR = xR * 80;
                      const pWidth = pxR - pxL;

                      if (riemannMethod === 'trapezoid') {
                        const yL = evalCalcFunction(xL, calcPreset);
                        const yR = evalCalcFunction(xR, calcPreset);
                        const pyL = -yL * 80;
                        const pyR = -yR * 80;

                        bars.push(
                          <g key={`r-trap-${i}`}>
                            <polygon
                              points={`${pxL},0 ${pxL},${pyL} ${pxR},${pyR} ${pxR},0`}
                              fill="url(#riemannBarGrad)"
                              stroke="#34d399"
                              strokeWidth="1.2"
                              opacity="0.85"
                            />
                            <line x1={pxL} y1={pyL} x2={pxR} y2={pyR} stroke="#10b981" strokeWidth="2" />
                          </g>
                        );
                      } else if (riemannMethod === 'simpson') {
                        const xMid = (xL + xR) / 2;
                        const yL = evalCalcFunction(xL, calcPreset);
                        const yMid = evalCalcFunction(xMid, calcPreset);
                        const yR = evalCalcFunction(xR, calcPreset);
                        const pyL = -yL * 80;
                        const pyMid = -yMid * 80;
                        const pyR = -yR * 80;
                        const pxMid = xMid * 80;

                        bars.push(
                          <g key={`r-simp-${i}`}>
                            <path
                              d={`M ${pxL} 0 L ${pxL} ${pyL} Q ${pxMid} ${2 * pyMid - 0.5 * (pyL + pyR)} ${pxR} ${pyR} L ${pxR} 0 Z`}
                              fill="url(#riemannBarGrad)"
                              stroke="#38bdf8"
                              strokeWidth="1.2"
                              opacity="0.85"
                            />
                            <circle cx={pxMid} cy={pyMid} r="2.5" fill="#38bdf8" />
                          </g>
                        );
                      } else {
                        // Left, Right, Midpoint rectangular bars
                        let sampleX = xL;
                        if (riemannMethod === 'right') sampleX = xR;
                        else if (riemannMethod === 'midpoint') sampleX = (xL + xR) / 2;

                        const sampleY = evalCalcFunction(sampleX, calcPreset);
                        const py = -sampleY * 80;
                        const isNeg = sampleY < 0;

                        bars.push(
                          <g key={`r-bar-${i}`}>
                            <rect
                              x={pxL}
                              y={isNeg ? 0 : py}
                              width={pWidth}
                              height={Math.abs(py)}
                              fill={isNeg ? "url(#riemannBarNegGrad)" : "url(#riemannBarGrad)"}
                              stroke={isNeg ? "#f43f5e" : "#34d399"}
                              strokeWidth="1.2"
                              opacity="0.85"
                            />
                            <line x1={pxL} y1={py} x2={pxR} y2={py} stroke={isNeg ? "#fb7185" : "#6ee7b7"} strokeWidth="2" />
                            <circle cx={sampleX * 80} cy={py} r="2.8" fill={isNeg ? "#fb7185" : "#34d399"} stroke="#ffffff" strokeWidth="1" />
                          </g>
                        );
                      }
                    }

                    return (
                      <g>
                        {/* Shaded Exact Integral Area Silhouette */}
                        <path
                          d={(() => {
                            let p = `M ${effA * 80} 0`;
                            for (let px = effA * 80; px <= effB * 80; px += 2) {
                              const x = px / 80;
                              const y = evalCalcFunction(x, calcPreset);
                              p += ` L ${px} ${-y * 80}`;
                            }
                            p += ` L ${effB * 80} 0 Z`;
                            return p;
                          })()}
                          fill="url(#exactAreaGrad)"
                        />

                        {/* Partition Bars */}
                        {bars}

                        {/* Integration Boundary Lines x=a and x=b */}
                        <g>
                          <line x1={effA * 80} y1="-210" x2={effA * 80} y2="210" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 3" />
                          <rect x={effA * 80 - 24} y="-226" width="48" height="18" rx="4" fill="rgba(15, 23, 42, 0.92)" stroke="#38bdf8" strokeWidth="1.2" />
                          <text x={effA * 80} y="-214" fill="#38bdf8" fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            a={effA.toFixed(1)}
                          </text>

                          <line x1={effB * 80} y1="-210" x2={effB * 80} y2="210" stroke="#ec4899" strokeWidth="1.8" strokeDasharray="4 3" />
                          <rect x={effB * 80 - 24} y="-226" width="48" height="18" rx="4" fill="rgba(15, 23, 42, 0.92)" stroke="#ec4899" strokeWidth="1.2" />
                          <text x={effB * 80} y="-214" fill="#ec4899" fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            b={effB.toFixed(1)}
                          </text>
                        </g>
                      </g>
                    );
                  })()}

                  {/* ─────────────────────────────────────────────────────────────
                      MODE 3: DERIVATIVES (f' and f'' CURVES & EXTREMA)
                     ───────────────────────────────────────────────────────────── */}
                  {calcMode === 'derivatives' && (
                    <g>
                      {/* 1. First Derivative f'(x) Curve (Emerald Dashed) */}
                      {showDeriv1Curve && (
                        <path
                          d={(() => {
                            let p = '';
                            for (let px = -300; px <= 300; px += 3) {
                              const x = px / 80;
                              const y = evalCalcDerivative(x, calcPreset);
                              const py = -y * 80;
                              if (px === -300) p += `M ${px} ${py}`;
                              else p += ` L ${px} ${py}`;
                            }
                            return p;
                          })()}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.4"
                          strokeDasharray="5 3"
                          opacity="0.85"
                        />
                      )}

                      {/* 2. Second Derivative f''(x) Curve (Purple Dotted) */}
                      {showDeriv2Curve && (
                        <path
                          d={(() => {
                            let p = '';
                            for (let px = -300; px <= 300; px += 3) {
                              const x = px / 80;
                              const y = evalCalcSecondDerivative(x, calcPreset);
                              const py = -y * 80;
                              if (px === -300) p += `M ${px} ${py}`;
                              else p += ` L ${px} ${py}`;
                            }
                            return p;
                          })()}
                          fill="none"
                          stroke="#c084fc"
                          strokeWidth="2.0"
                          strokeDasharray="2 3"
                          opacity="0.75"
                        />
                      )}

                      {/* 3. Critical Stationary & Inflection Points */}
                      {getCalcKeyPoints(calcPreset).map((kp, kIdx) => {
                        if (kp.type === 'inflection' && !showInflectionPoints) return null;
                        if ((kp.type === 'max' || kp.type === 'min') && !showCritPoints) return null;

                        const kpx = kp.x * 80;
                        const kpy = -kp.y * 80;
                        const isMax = kp.type === 'max';
                        const isMin = kp.type === 'min';
                        const color = isMax ? '#fbbf24' : isMin ? '#34d399' : '#38bdf8';

                        return (
                          <g key={`kp-${kIdx}`} transform={`translate(${kpx}, ${kpy})`}>
                            <line x1="0" y1="0" x2="0" y2={isMax ? -22 : 22} stroke={color} strokeWidth="1.4" strokeDasharray="2 2" />
                            <circle cx="0" cy="0" r="4.5" fill={color} stroke="#ffffff" strokeWidth="1.5" />
                            <rect
                              x="-42"
                              y={isMax ? -36 : 10}
                              width="84"
                              height="16"
                              rx="3"
                              fill="rgba(11, 17, 32, 0.94)"
                              stroke={color}
                              strokeWidth="1.1"
                            />
                            <text
                              x="0"
                              y={isMax ? -25 : 21}
                              fill={color}
                              fontSize="7.5"
                              fontWeight="bold"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              {kp.label}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* ─────────────────────────────────────────────────────────────
                      PRIMARY FUNCTION CURVE f(x) (Cyan Glowing Ribbon)
                     ───────────────────────────────────────────────────────────── */}
                  <path
                    d={(() => {
                      let path = '';
                      for (let px = -300; px <= 300; px += 3) {
                        const x = px / 80;
                        const y = evalCalcFunction(x, calcPreset);
                        const py = -y * 80;
                        if (px === -300) path += `M ${px} ${py}`;
                        else path += ` L ${px} ${py}`;
                      }
                      return path;
                    })()}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* ─────────────────────────────────────────────────────────────
                      MODE 1: SECANT LIMIT (h → 0) & DIFFERENTIAL TRIANGLE
                     ───────────────────────────────────────────────────────────── */}
                  {calcMode === 'tangent_secant' && (() => {
                    const x0 = calcX0;
                    const x1 = calcX0 + calcH;
                    const y0 = evalCalcFunction(x0, calcPreset);
                    const y1 = evalCalcFunction(x1, calcPreset);
                    const mTan = evalCalcDerivative(x0, calcPreset);
                    const mSec = (y1 - y0) / calcH;

                    const px0 = x0 * 80;
                    const py0 = -y0 * 80;
                    const px1 = x1 * 80;
                    const py1 = -y1 * 80;

                    // Tangent line endpoints
                    const span = 2.4;
                    const tX1 = (x0 - span) * 80;
                    const tY1 = -(y0 - span * mTan) * 80;
                    const tX2 = (x0 + span) * 80;
                    const tY2 = -(y0 + span * mTan) * 80;

                    // Secant line endpoints
                    const sX1 = (x0 - span) * 80;
                    const sY1 = -(y0 - span * mSec) * 80;
                    const sX2 = (x0 + span) * 80;
                    const sY2 = -(y0 + span * mSec) * 80;

                    return (
                      <g>
                        {/* 1. Shaded Differential Triangle Δx, Δy */}
                        <polygon
                          points={`${px0},${py0} ${px1},${py0} ${px1},${py1}`}
                          fill="url(#slopeTriangleGrad)"
                          stroke="rgba(245, 158, 11, 0.4)"
                          strokeWidth="1.2"
                          strokeDasharray="3 2"
                        />

                        {/* Horizontal Δx = h */}
                        <line x1={px0} y1={py0} x2={px1} y2={py0} stroke="#34d399" strokeWidth="2.2" />
                        <rect x={(px0 + px1) / 2 - 24} y={py0 > 0 ? py0 + 5 : py0 - 18} width="48" height="15" rx="3" fill="rgba(11, 17, 32, 0.9)" stroke="#34d399" strokeWidth="1" />
                        <text x={(px0 + px1) / 2} y={py0 > 0 ? py0 + 15 : py0 - 7} fill="#34d399" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          Δx={calcH.toFixed(2)}
                        </text>

                        {/* Vertical Δy = f(x0+h) - f(x0) */}
                        <line x1={px1} y1={py0} x2={px1} y2={py1} stroke="#ec4899" strokeWidth="2.2" />
                        <rect x={px1 > 0 ? px1 + 6 : px1 - 56} y={(py0 + py1) / 2 - 8} width="50" height="15" rx="3" fill="rgba(11, 17, 32, 0.9)" stroke="#ec4899" strokeWidth="1" />
                        <text x={px1 > 0 ? px1 + 31 : px1 - 31} y={(py0 + py1) / 2 + 3} fill="#ec4899" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          Δy={(y1 - y0).toFixed(2)}
                        </text>

                        {/* 2. Secant Line through P0 and P1 (Dashed Pink) */}
                        <line x1={sX1} y1={sY1} x2={sX2} y2={sY2} stroke="#ec4899" strokeWidth="2.0" strokeDasharray="5 3" opacity="0.9" />

                        {/* 3. Tangent Line through P0 (Solid Glowing Amber) */}
                        <line x1={tX1} y1={tY1} x2={tX2} y2={tY2} stroke="#f59e0b" strokeWidth="3.0" opacity="0.95" />

                        {/* 4. Secondary Secant Point P1(x0+h, y1) */}
                        <circle cx={px1} cy={py1} r="5.5" fill="#ec4899" stroke="#ffffff" strokeWidth="1.8" />
                        <rect x={px1 + 8} y={py1 - 10} width="72" height="18" rx="4" fill="rgba(15, 23, 42, 0.94)" stroke="#ec4899" strokeWidth="1.2" />
                        <text x={px1 + 44} y={py1 + 2.5} fill="#ec4899" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          P₁({x1.toFixed(2)}, {y1.toFixed(2)})
                        </text>

                        {/* 5. Primary Tangent Point P0(x0, y0) */}
                        <circle cx={px0} cy={py0} r="6.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                        <rect x={px0 - 80} y={py0 - 10} width="72" height="18" rx="4" fill="rgba(15, 23, 42, 0.94)" stroke="#f59e0b" strokeWidth="1.2" />
                        <text x={px0 - 44} y={py0 + 2.5} fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          P₀({x0.toFixed(2)}, {y0.toFixed(2)})
                        </text>
                      </g>
                    );
                  })()}

                  {/* ─────────────────────────────────────────────────────────────
                      DERIVATIVE MODE TRACER BEAD (AT x0)
                     ───────────────────────────────────────────────────────────── */}
                  {calcMode === 'derivatives' && (() => {
                    const x0 = calcX0;
                    const y0 = evalCalcFunction(x0, calcPreset);
                    const slope = evalCalcDerivative(x0, calcPreset);
                    const px0 = x0 * 80;
                    const py0 = -y0 * 80;
                    const span = 1.8;

                    return (
                      <g>
                        {/* Tangent line at tracer point */}
                        <line
                          x1={(x0 - span) * 80}
                          y1={-(y0 - span * slope) * 80}
                          x2={(x0 + span) * 80}
                          y2={-(y0 + span * slope) * 80}
                          stroke="#f59e0b"
                          strokeWidth="2.6"
                        />
                        <circle cx={px0} cy={py0} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                        <rect x={px0 + 8} y={py0 - 10} width="78" height="18" rx="4" fill="rgba(15, 23, 42, 0.94)" stroke="#f59e0b" strokeWidth="1.2" />
                        <text x={px0 + 47} y={py0 + 2.5} fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          f'({x0.toFixed(2)}) = {slope.toFixed(2)}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              </svg>

              {/* ─────────────────────────────────────────────────────────────
                  FLOATING GLASSMORPHIC FORMULA & LIMIT HUD
                 ───────────────────────────────────────────────────────────── */}
              <div
                className="calc-hud-interactive"
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  zIndex: 20,
                  maxWidth: '340px',
                  pointerEvents: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {showCalcFormulaHud ? (
                  <div
                    style={{
                      background: 'rgba(11, 17, 32, 0.88)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.04em' }}>
                        {calcMode === 'tangent_secant' ? '⚡ SECANT-TO-TANGENT LIMIT' : calcMode === 'riemann_sums' ? '📐 RIEMANN DEFINITE INTEGRAL' : '📈 MULTI-ORDER DERIVATIVES'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCalcFormulaHud(false);
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#f87171',
                          borderRadius: '4px',
                          padding: '1px 6px',
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        ✕ Hide HUD
                      </button>
                    </div>

                    {/* Mode Equations */}
                    {(() => {
                      const telem = getCalcTelemetry(calcPreset, calcX0, calcH, calcBoundA, calcBoundB, calcIntegralN, riemannMethod);
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                          <div style={{ color: '#38bdf8', fontWeight: 800 }}>{telem.formulaLatex}</div>
                          {calcMode === 'tangent_secant' && (
                            <>
                              <div style={{ color: '#cbd5e1' }}>
                                lim_{'{h→0}'} [f(x₀+h)-f(x₀)]/h = f'(x₀)
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                                <span>m_sec = {telem.secantSlope.toFixed(3)}</span>
                                <span style={{ color: '#38bdf8' }}>m_tan = {telem.tangentSlope.toFixed(3)}</span>
                                <span style={{ color: telem.secantError < 0.05 ? '#34d399' : '#f87171' }}>Δm = {telem.secantError.toFixed(3)}</span>
                              </div>
                            </>
                          )}
                          {calcMode === 'riemann_sums' && (
                            <>
                              <div style={{ color: '#38bdf8' }}>
                                ∫_{'{' + calcBoundA.toFixed(1) + '}'}^{'{' + calcBoundB.toFixed(1) + '}'} f(x)dx = {telem.exactIntegral.toFixed(3)}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                                <span>{riemannMethod.toUpperCase()}_N = {telem.riemannSum.toFixed(3)}</span>
                                <span style={{ color: telem.relativeErrorPct < 1 ? '#34d399' : '#fbbf24' }}>
                                  ε = {telem.relativeErrorPct.toFixed(2)}%
                                </span>
                              </div>
                            </>
                          )}
                          {calcMode === 'derivatives' && (
                            <>
                              <div style={{ color: '#10b981' }}>{telem.derivLatex}</div>
                              <div style={{ color: '#c084fc' }}>{telem.deriv2Latex}</div>
                            </>
                          )}
                        </div>
                      );
                    })()}

                    <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(148, 163, 184, 0.15)', paddingTop: '3px' }}>
                      Click Canvas to Reposition x₀ / Tangent Point
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCalcFormulaHud(true);
                    }}
                    style={{
                      background: 'rgba(11, 17, 32, 0.85)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      borderRadius: '20px',
                      padding: '4px 10px',
                      color: '#38bdf8',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <span>📜</span>
                    <span>Show Formulas & Integrals</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PHASE 6: MATHBOX 3D VISUALIZER */}
          {activeModuleId === 'mathbox_3d' && (
            <div
              style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', touchAction: 'none' }}
              onWheel={(e) => {
                e.preventDefault();
                setZoom3D(prev => Math.max(0.4, Math.min(2.5, Number((prev - e.deltaY * 0.0015).toFixed(2)))));
              }}
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

          {/* PHASE 7: VECTOR FIELDS & PHASE SPACE ORBITS VISUALIZER */}
          {activeModuleId === 'vector_fields' && (
            <div
              style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', cursor: 'crosshair' }}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('.ode-hud-interactive')) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                // Convert viewport (0..rect.width, 0..rect.height) to SVG coordinate space (-320..320, -240..240)
                const svgX = ((clickX / rect.width) * 640 - 320);
                const svgY = ((clickY / rect.height) * 480 - 240);
                const scale = 80;
                const newX0 = Number(Math.max(-2.8, Math.min(2.8, svgX / scale)).toFixed(2));
                const newY0 = Number(Math.max(-2.8, Math.min(2.8, -svgY / scale)).toFixed(2));
                setPhaseX0(newX0);
                setPhaseY0(newY0);
              }}
            >
              {/* Glassmorphic On-Canvas Floating Formula HUD (HTML Overlay) */}
              <div
                className="ode-hud-interactive"
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  zIndex: 25,
                  pointerEvents: 'auto',
                  userSelect: 'none'
                }}
              >
                {showOdeFormulaHud ? (() => {
                  const telem = getOdeTelemetry(odeSystem, dampingFactor, phaseX0, phaseY0);
                  return (
                    <div
                      style={{
                        background: 'rgba(11, 17, 32, 0.90)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(192, 132, 252, 0.45)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        maxWidth: '310px',
                        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.45)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#c084fc', letterSpacing: '0.04em' }}>
                          🌀 {odeSystem.toUpperCase()} SYSTEM
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowOdeFormulaHud(false);
                          }}
                          style={{
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: 'rgba(244, 63, 94, 0.18)',
                            border: '1px solid rgba(244, 63, 94, 0.6)',
                            color: '#f43f5e',
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          ✕ Hide HUD
                        </button>
                      </div>

                      {/* LaTeX Differential Equations */}
                      <div
                        style={{
                          background: 'rgba(15, 23, 42, 0.85)',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          borderRadius: '5px',
                          padding: '5px 8px',
                          fontFamily: 'monospace',
                          fontSize: '0.73rem',
                          color: '#f8fafc',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                      >
                        <span style={{ color: '#38bdf8' }}>{telem.eq1}</span>
                        <span style={{ color: '#34d399' }}>{telem.eq2}</span>
                      </div>

                      {/* Energy & Jacobian */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.67rem', fontFamily: 'monospace' }}>
                        <span style={{ color: '#fbbf24' }}>{telem.energy}</span>
                        <span style={{ color: '#94a3b8' }}>Jacobian: {telem.jacobian}</span>
                      </div>

                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace', borderTop: '1px solid rgba(51, 65, 85, 0.4)', paddingTop: '4px' }}>
                        Start: ({phaseX0.toFixed(2)}, {phaseY0.toFixed(2)}) • Click Canvas to Drop
                      </div>
                    </div>
                  );
                })() : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOdeFormulaHud(true);
                    }}
                    style={{
                      background: 'rgba(11, 17, 32, 0.90)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(192, 132, 252, 0.6)',
                      borderRadius: '20px',
                      padding: '5px 12px',
                      color: '#c084fc',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)'
                    }}
                  >
                    <span>📜</span>
                    <span>Show Formulas & Equations</span>
                  </button>
                )}
              </div>

              <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16' }}>
                <defs>
                  {/* Trajectory & Particle Glow */}
                  <filter id="odeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  {/* Marker Arrow for Vectors */}
                  <marker id="odeArrowCyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                  </marker>
                  <marker id="odeArrowEmerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#34d399" />
                  </marker>
                  <marker id="odeArrowAmber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#fbbf24" />
                  </marker>
                  <marker id="odeArrowRose" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
                  </marker>

                  {/* RK4 Path Gradient */}
                  <linearGradient id="rk4Grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                    <stop offset="60%" stopColor="#34d399" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* 1. COORDINATE GRID & AXES */}
                <g opacity="0.35">
                  {[-3, -2, -1, 1, 2, 3].map(tick => (
                    <g key={`x-grid-${tick}`}>
                      <line x1={tick * 80} y1="-230" x2={tick * 80} y2="230" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
                      <text x={tick * 80} y="15" fill="#94a3b8" fontSize="8.5" fontFamily="monospace" textAnchor="middle">{tick > 0 ? `+${tick}` : tick}</text>
                    </g>
                  ))}
                  {[-2, -1, 1, 2].map(tick => (
                    <g key={`y-grid-${tick}`}>
                      <line x1="-310" y1={-tick * 80} x2="310" y2={-tick * 80} stroke="rgba(148, 163, 184, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="-12" y={-tick * 80 + 3} fill="#94a3b8" fontSize="8.5" fontFamily="monospace" textAnchor="end">{tick > 0 ? `+${tick}` : tick}</text>
                    </g>
                  ))}
                </g>

                {/* Primary Axes */}
                <line x1="-315" y1="0" x2="315" y2="0" stroke="rgba(148, 163, 184, 0.65)" strokeWidth="1.6" />
                <line x1="0" y1="-235" x2="0" y2="235" stroke="rgba(148, 163, 184, 0.65)" strokeWidth="1.6" />
                <text x="305" y="-8" fill="#38bdf8" fontSize="9.5" fontWeight="bold" fontFamily="monospace">+X</text>
                <text x="8" y="-225" fill="#38bdf8" fontSize="9.5" fontWeight="bold" fontFamily="monospace">+Y (ẋ)</text>

                {/* 2. VECTOR FIELD ARROWS GRID */}
                {(() => {
                  const scale = 80;
                  const step = odeGridDensity === 'coarse' ? 0.6 : odeGridDensity === 'fine' ? 0.28 : 0.42;
                  const arrowLen = odeGridDensity === 'fine' ? 12 : 16;
                  const arrows = [];

                  for (let gx = -3.4; gx <= 3.4; gx += step) {
                    for (let gy = -2.6; gy <= 2.6; gy += step) {
                      const deriv = evalOdeDerivatives(gx, gy, odeSystem, dampingFactor);
                      const speed = Math.hypot(deriv.dx, deriv.dy);
                      if (speed < 0.001) continue;

                      const udx = (deriv.dx / speed);
                      const udy = (deriv.dy / speed);

                      const px = gx * scale;
                      const py = -gy * scale;
                      const tipX = px + udx * arrowLen;
                      const tipY = py - udy * arrowLen;

                      let strokeColor = '#38bdf8';
                      let markerUrl = 'url(#odeArrowCyan)';
                      if (speed > 2.5) {
                        strokeColor = '#f43f5e';
                        markerUrl = 'url(#odeArrowRose)';
                      } else if (speed > 1.4) {
                        strokeColor = '#fbbf24';
                        markerUrl = 'url(#odeArrowAmber)';
                      } else if (speed > 0.6) {
                        strokeColor = '#34d399';
                        markerUrl = 'url(#odeArrowEmerald)';
                      }

                      arrows.push(
                        <g key={`arrow-${gx.toFixed(2)}-${gy.toFixed(2)}`} opacity="0.65">
                          <line
                            x1={px - udx * (arrowLen * 0.4)}
                            y1={py + udy * (arrowLen * 0.4)}
                            x2={tipX}
                            y2={tipY}
                            stroke={strokeColor}
                            strokeWidth="1.4"
                            markerEnd={markerUrl}
                          />
                        </g>
                      );
                    }
                  }
                  return arrows;
                })()}

                {/* 3. NULLCLINES OVERLAY (ẋ = 0 and ẏ = 0) */}
                {showOdeNullclines && (() => {
                  const scale = 80;
                  return (
                    <g opacity="0.85">
                      {/* X-Nullcline (ẋ = 0) where arrows are purely vertical */}
                      <line x1="-310" y1="0" x2="310" y2="0" stroke="#10b981" strokeWidth="2" strokeDasharray="5 3" />
                      <g transform="translate(220, -10)">
                        <rect x="0" y="0" width="76" height="15" rx="3" fill="rgba(15, 23, 42, 0.88)" stroke="#10b981" strokeWidth="1" />
                        <text x="38" y="11" fill="#10b981" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">ẋ = 0 Nullcline</text>
                      </g>

                      {/* Y-Nullcline (ẏ = 0) where arrows are purely horizontal */}
                      {odeSystem === 'pendulum' && dampingFactor > 0.01 && (
                        <path
                          d={(() => {
                            let p = '';
                            for (let px = -3.4; px <= 3.4; px += 0.05) {
                              const ny = -Math.sin(px) / dampingFactor;
                              const sx = px * scale;
                              const sy = -ny * scale;
                              if (sy >= -240 && sy <= 240) {
                                if (!p) p += `M ${sx} ${sy}`;
                                else p += ` L ${sx} ${sy}`;
                              }
                            }
                            return p;
                          })()}
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="2"
                          strokeDasharray="5 3"
                        />
                      )}
                      {odeSystem === 'vanderpol' && (
                        <path
                          d={(() => {
                            let p = '';
                            for (let px = -2.8; px <= 2.8; px += 0.05) {
                              if (Math.abs(1 - px * px) < 0.08) continue;
                              const ny = px / (dampingFactor * (1 - px * px));
                              const sx = px * scale;
                              const sy = -ny * scale;
                              if (sy >= -240 && sy <= 240) {
                                if (!p) p += `M ${sx} ${sy}`;
                                else p += ` L ${sx} ${sy}`;
                              }
                            }
                            return p;
                          })()}
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="2"
                          strokeDasharray="5 3"
                        />
                      )}
                      {odeSystem === 'duffing' && dampingFactor > 0.01 && (
                        <path
                          d={(() => {
                            let p = '';
                            for (let px = -2.4; px <= 2.4; px += 0.05) {
                              const ny = (px - Math.pow(px, 3)) / dampingFactor;
                              const sx = px * scale;
                              const sy = -ny * scale;
                              if (sy >= -240 && sy <= 240) {
                                if (!p) p += `M ${sx} ${sy}`;
                                else p += ` L ${sx} ${sy}`;
                              }
                            }
                            return p;
                          })()}
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="2"
                          strokeDasharray="5 3"
                        />
                      )}
                    </g>
                  );
                })()}

                {/* 4. STREAMING ADVECTION PARTICLES */}
                {showOdeStreamlines && (() => {
                  const scale = 80;
                  const particleSeeds = [
                    { x: -2.0, y: 1.2 }, { x: -1.5, y: -1.2 }, { x: 0.8, y: 1.6 }, { x: 1.8, y: -1.0 },
                    { x: -0.8, y: 0.9 }, { x: 0.5, y: -0.8 }, { x: -2.2, y: -0.5 }, { x: 2.2, y: 0.8 },
                    { x: -1.0, y: 1.8 }, { x: 1.2, y: 1.1 }, { x: -0.3, y: -1.6 }, { x: 1.5, y: -1.8 }
                  ];

                  return particleSeeds.map((seed, sIdx) => {
                    // Integrate a micro-trail of 8 steps along velocity field
                    const offsetT = (timeT * 1.5 + sIdx * 0.45) % 2.5;
                    const trail = computeRk4Trajectory(seed.x, seed.y, odeSystem, dampingFactor, 18, 0.04);
                    const headIdx = Math.min(trail.length - 1, Math.floor((offsetT / 2.5) * (trail.length - 1)));
                    const headPt = trail[headIdx];
                    if (!headPt) return null;

                    return (
                      <g key={`particle-${sIdx}`}>
                        <circle
                          cx={headPt.x * scale}
                          cy={-headPt.y * scale}
                          r="3"
                          fill="#38bdf8"
                          opacity="0.8"
                          filter="url(#odeGlow)"
                        />
                      </g>
                    );
                  });
                })()}

                {/* 5. NUMERICAL RK4 PHASE TRAJECTORY */}
                {showOdeTrajectory && (() => {
                  const scale = 80;
                  const trajectory = computeRk4Trajectory(phaseX0, phaseY0, odeSystem, dampingFactor, 360, 0.022);

                  let pathD = '';
                  trajectory.forEach((pt, idx) => {
                    const sx = pt.x * scale;
                    const sy = -pt.y * scale;
                    if (idx === 0) pathD += `M ${sx} ${sy}`;
                    else pathD += ` L ${sx} ${sy}`;
                  });

                  // Live animated tracer bead index along the trajectory
                  const activeBeadIdx = Math.min(
                    trajectory.length - 1,
                    Math.floor(((timeT * 2.0) % 5.0 / 5.0) * (trajectory.length - 1))
                  );
                  const beadPt = trajectory[activeBeadIdx] || trajectory[0];
                  const beadV = evalOdeDerivatives(beadPt.x, beadPt.y, odeSystem, dampingFactor);
                  const beadSpeed = Math.hypot(beadV.dx, beadV.dy) || 1;

                  return (
                    <g>
                      {/* Flowing Trajectory Ribbon */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="url(#rk4Grad)"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#odeGlow)"
                      />

                      {/* Direction Flow Arrows along Trajectory */}
                      {trajectory.filter((_, idx) => idx > 0 && idx % 45 === 0).map((pt, aIdx) => {
                        const nextPt = trajectory[aIdx * 45 + 1] || pt;
                        const dx = nextPt.x - pt.x;
                        const dy = nextPt.y - pt.y;
                        const len = Math.hypot(dx, dy) || 1;
                        return (
                          <line
                            key={`traj-arrow-${aIdx}`}
                            x1={pt.x * scale}
                            y1={-pt.y * scale}
                            x2={pt.x * scale + (dx / len) * 10}
                            y2={-pt.y * scale - (dy / len) * 10}
                            stroke="#fbbf24"
                            strokeWidth="2"
                            markerEnd="url(#odeArrowAmber)"
                          />
                        );
                      })}

                      {/* Initial Condition Marker (X₀, Y₀) */}
                      <g transform={`translate(${phaseX0 * scale}, ${-phaseY0 * scale})`}>
                        <circle cx="0" cy="0" r="10" fill="rgba(251, 191, 36, 0.3)" />
                        <circle cx="0" cy="0" r="5.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
                        <g transform="translate(10, -12)">
                          <rect x="0" y="0" width="92" height="17" rx="3" fill="rgba(15, 23, 42, 0.92)" stroke="#fbbf24" strokeWidth="1" />
                          <text x="46" y="12" fill="#fbbf24" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            Start ({phaseX0.toFixed(2)}, {phaseY0.toFixed(2)})
                          </text>
                        </g>
                      </g>

                      {/* Live Animated Tracer Node */}
                      <g transform={`translate(${beadPt.x * scale}, ${-beadPt.y * scale})`}>
                        <circle cx="0" cy="0" r="7" fill="rgba(52, 211, 153, 0.35)" />
                        <circle cx="0" cy="0" r="4.5" fill="#34d399" stroke="#ffffff" strokeWidth="1.8" />
                        {/* Tangent Velocity Vector */}
                        <line
                          x1="0"
                          y1="0"
                          x2={(beadV.dx / beadSpeed) * 24}
                          y2={-(beadV.dy / beadSpeed) * 24}
                          stroke="#34d399"
                          strokeWidth="2"
                          markerEnd="url(#odeArrowEmerald)"
                        />
                        <g transform="translate(10, 14)">
                          <rect x="0" y="0" width="110" height="16" rx="3" fill="rgba(15, 23, 42, 0.92)" stroke="#34d399" strokeWidth="1" />
                          <text x="55" y="11.5" fill="#34d399" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            ({beadPt.x.toFixed(2)}, {beadPt.y.toFixed(2)}) • |v|={beadSpeed.toFixed(2)}
                          </text>
                        </g>
                      </g>
                    </g>
                  );
                })()}

                {/* 6. FIXED EQUILIBRIUM POINTS & STABILITY CLASSIFICATION */}
                {showOdeFixedPoints && (() => {
                  const scale = 80;
                  const fixPts = getOdeFixedPoints(odeSystem, dampingFactor);

                  return fixPts.map((fp, idx) => {
                    const sx = fp.x * scale;
                    const sy = -fp.y * scale;
                    let dotColor = '#34d399';
                    if (fp.type === 'source') dotColor = '#38bdf8';
                    else if (fp.type === 'saddle') dotColor = '#fbbf24';
                    else if (fp.type === 'center') dotColor = '#a855f7';

                    return (
                      <g key={`fixpt-${idx}`} transform={`translate(${sx}, ${sy})`}>
                        {/* Pulsing Aura */}
                        <circle cx="0" cy="0" r={8 + Math.sin(timeT * 3.5 + idx) * 1.5} fill="none" stroke={dotColor} strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="4.5" fill={dotColor} stroke="#ffffff" strokeWidth="1.5" />
                        {/* Tooltip Badge */}
                        <g transform="translate(8, -12)">
                          <rect x="0" y="0" width="130" height="16" rx="3" fill="rgba(15, 23, 42, 0.92)" stroke={dotColor} strokeWidth="1" />
                          <text x="65" y="11.5" fill={dotColor} fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            {fp.badge}
                          </text>
                        </g>
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>
          )}

          {/* PHASE 8: MULTIVARIABLE FORMULA SANDBOX VISUALIZER */}
          {activeModuleId === 'formula_sandbox' && (
            <div
              style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
              onWheel={(e) => {
                e.preventDefault();
                setSandboxZoom(prev => Math.max(0.5, Math.min(2.2, Number((prev - e.deltaY * 0.0012).toFixed(2)))));
              }}
            >
              <svg viewBox="-320 -240 640 480" style={{ width: '100%', height: '100%', background: currentCanvasTheme.bg || '#090d16' }}>
                <defs>
                  {/* Glowing Filter */}
                  <filter id="sandboxGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  {/* Shaded Area Gradients */}
                  <linearGradient id="sbGradC1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="sbGradC2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="sbGradC3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="sbGradSum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.02" />
                  </linearGradient>
                  {/* Polar Sector Radial Gradient */}
                  <radialGradient id="sbPolarGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                    <stop offset="85%" stopColor="#38bdf8" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </radialGradient>
                  {/* Viewport Plot Bounding Box ClipPath */}
                  <clipPath id="sbPlotClip">
                    <rect x="-312" y="-232" width="624" height="464" rx="8" />
                  </clipPath>
                </defs>

                {(() => {
                  const scale = 72 * sandboxZoom;
                  const phaseShift = isSimulating ? timeT * 0.9 : 0;

                  return (
                    <g>
                      {/* 1. COORDINATE GRID SYSTEMS */}
                      {showGridRings && sandboxCoordType === 'cartesian' && (
                        <g opacity="0.8">
                          {/* Horizontal Grid lines */}
                          {[-3, -2, -1, 1, 2, 3].map((yVal) => {
                            const py = -yVal * scale;
                            return (
                              <g key={`cg-h-${yVal}`}>
                                <line x1="-310" y1={py} x2="310" y2={py} stroke="rgba(51, 65, 85, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
                                <text x="-314" y={py + 3.5} fill="rgba(148, 163, 184, 0.6)" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="end">
                                  {yVal > 0 ? `+${yVal}` : yVal}
                                </text>
                              </g>
                            );
                          })}
                          {/* Vertical Grid lines (at multiples of pi/2) */}
                          {[-Math.PI, -Math.PI / 2, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI].map((xVal, idx) => {
                            const px = xVal * scale;
                            if (px < -310 || px > 310) return null;
                            const label = idx === 0 ? '-π' : idx === 1 ? '-π/2' : idx === 2 ? 'π/2' : idx === 3 ? 'π' : idx === 4 ? '3π/2' : '2π';
                            return (
                              <g key={`cg-v-${idx}`}>
                                <line x1={px} y1="-230" x2={px} y2="230" stroke="rgba(51, 65, 85, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
                                <text x={px} y="235" fill="rgba(148, 163, 184, 0.6)" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                  {label}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      )}

                      {showGridRings && (sandboxCoordType === 'polar' || sandboxCoordType === 'parametric') && (
                        <g opacity="0.8">
                          {/* Concentric Polar Circles */}
                          {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((rVal) => {
                            const rPx = rVal * scale;
                            if (rPx > 310) return null;
                            return (
                              <g key={`pg-r-${rVal}`}>
                                <circle cx="0" cy="0" r={rPx} fill="none" stroke="rgba(51, 65, 85, 0.45)" strokeWidth="1" strokeDasharray={rVal === 1.0 || rVal === 2.0 ? "" : "3 3"} />
                                <text x={rPx + 3} y="-4" fill="rgba(148, 163, 184, 0.55)" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                                  r={rVal.toFixed(1)}
                                </text>
                              </g>
                            );
                          })}
                          {/* Radial Angle Spokes */}
                          {[0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330].map((deg) => {
                            const rad = (deg * Math.PI) / 180;
                            const rMax = 230;
                            const sx = Math.cos(rad) * rMax;
                            const sy = -Math.sin(rad) * rMax;
                            const isMajor = deg % 90 === 0;
                            const isSemi = deg % 45 === 0;
                            return (
                              <g key={`pg-deg-${deg}`}>
                                <line x1="0" y1="0" x2={sx} y2={sy} stroke={isMajor ? "rgba(148, 163, 184, 0.3)" : "rgba(51, 65, 85, 0.25)"} strokeWidth={isMajor ? 1.2 : 0.8} strokeDasharray={isMajor ? "" : "2 2"} />
                                {isSemi && (
                                  <text x={sx * 0.92} y={sy * 0.92} fill="rgba(148, 163, 184, 0.45)" fontSize="8" fontFamily="monospace" textAnchor="middle">
                                    {deg}°
                                  </text>
                                )}
                              </g>
                            );
                          })}
                        </g>
                      )}

                      {/* Main Coordinate Axis Lines */}
                      <g>
                        <line x1="-310" y1="0" x2="310" y2="0" stroke="rgba(148, 163, 184, 0.6)" strokeWidth="1.6" />
                        <line x1="0" y1="-230" x2="0" y2="230" stroke="rgba(148, 163, 184, 0.6)" strokeWidth="1.6" />
                        <text x="305" y="-6" fill="rgba(148, 163, 184, 0.9)" fontSize="9.5" fontWeight="bold" fontFamily="monospace" textAnchor="end">
                          {sandboxCoordType === 'polar' ? '+X (0°)' : '+X'}
                        </text>
                        <text x="6" y="-218" fill="rgba(148, 163, 184, 0.9)" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                          {sandboxCoordType === 'polar' ? '+Y (90°)' : '+Y'}
                        </text>
                      </g>

                      {/* 2. PLOT CURVES WITH BOUNDED CLIP-PATH */}
                      <g clipPath="url(#sbPlotClip)">
                        {/* A. CARTESIAN MODE y = f(x) */}
                        {sandboxCoordType === 'cartesian' && (
                          <g>
                            {/* Shaded Area Under Curve 1 */}
                            {showAreaShading && showCurve1 && (
                              <path
                                d={(() => {
                                  let path = 'M -300 0';
                                  for (let px = -300; px <= 300; px += 3) {
                                    const x = px / scale;
                                    const y = evalCartesian(x, 1, cartesianPreset);
                                    const py = -y * scale;
                                    path += ` L ${px} ${py}`;
                                  }
                                  path += ' L 300 0 Z';
                                  return path;
                                })()}
                                fill="url(#sbGradC1)"
                              />
                            )}

                            {/* Curve 3 (Envelope / 2nd Derivative) */}
                            {showCurve3 && (
                              <path
                                d={(() => {
                                  let path = '';
                                  for (let px = -300; px <= 300; px += 3) {
                                    const x = px / scale;
                                    const y = evalCartesian(x, 3, cartesianPreset);
                                    const py = -y * scale;
                                    if (px === -300) path += `M ${px} ${py}`;
                                    else path += ` L ${px} ${py}`;
                                  }
                                  return path;
                                })()}
                                fill="none"
                                stroke="#ec4899"
                                strokeWidth="2.0"
                                strokeDasharray="4 3"
                                opacity="0.85"
                              />
                            )}

                            {/* Curve 2 (Modulation / Derivative) */}
                            {showCurve2 && (
                              <path
                                d={(() => {
                                  let path = '';
                                  for (let px = -300; px <= 300; px += 3) {
                                    const x = px / scale;
                                    const y = evalCartesian(x, 2, cartesianPreset);
                                    const py = -y * scale;
                                    if (px === -300) path += `M ${px} ${py}`;
                                    else path += ` L ${px} ${py}`;
                                  }
                                  return path;
                                })()}
                                fill="none"
                                stroke="#38bdf8"
                                strokeWidth="2.4"
                                strokeDasharray={cartesianPreset === 'damped' || cartesianPreset === 'gaussian' ? "4 3" : ""}
                                opacity="0.9"
                              />
                            )}

                            {/* Curve 1 (Primary Function) */}
                            {showCurve1 && (
                              <path
                                d={(() => {
                                  let path = '';
                                  for (let px = -300; px <= 300; px += 2) {
                                    const x = px / scale;
                                    const y = evalCartesian(x, 1, cartesianPreset);
                                    const py = -y * scale;
                                    if (px === -300) path += `M ${px} ${py}`;
                                    else path += ` L ${px} ${py}`;
                                  }
                                  return path;
                                })()}
                                fill="none"
                                stroke="#34d399"
                                strokeWidth="3.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#sandboxGlow)"
                              />
                            )}

                            {/* Composite Superposition (Sum = C1 + C2) */}
                            {showCompositeSum && (
                              <path
                                d={(() => {
                                  let path = '';
                                  for (let px = -300; px <= 300; px += 2) {
                                    const x = px / scale;
                                    const y = evalCartesian(x, 1, cartesianPreset) + evalCartesian(x, 2, cartesianPreset);
                                    const py = -y * scale;
                                    if (px === -300) path += `M ${px} ${py}`;
                                    else path += ` L ${px} ${py}`;
                                  }
                                  return path;
                                })()}
                                fill="none"
                                stroke="#fbbf24"
                                strokeWidth="3.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray="6 2"
                              />
                            )}

                            {/* Roots & Critical Points Extrema Overlay */}
                            {showRootsAndExtrema && (
                              <g>
                                {/* Zero Crossings / Roots */}
                                {sandboxKeyPoints.roots.map((root, rIdx) => {
                                  const rpx = root.x * scale;
                                  if (rpx < -305 || rpx > 305) return null;
                                  return (
                                    <g key={`root-${rIdx}`}>
                                      <circle cx={rpx} cy="0" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                                      <text x={rpx} y="14" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                        x={root.x.toFixed(2)}
                                      </text>
                                    </g>
                                  );
                                })}

                                {/* Local Extrema / Stationary Points */}
                                {sandboxKeyPoints.extrema.map((ext, eIdx) => {
                                  const epx = ext.x * scale;
                                  const epy = -ext.y * scale;
                                  if (epx < -305 || epx > 305 || epy < -225 || epy > 225) return null;
                                  const extColor = ext.type === 'max' ? '#fb923c' : ext.type === 'min' ? '#a855f7' : '#fbbf24';
                                  return (
                                    <g key={`ext-${eIdx}`}>
                                      <circle cx={epx} cy={epy} r="5" fill={extColor} stroke="#ffffff" strokeWidth="1.8" />
                                      <circle cx={epx} cy={epy} r="8" fill="none" stroke={extColor} strokeWidth="1" opacity="0.6" />
                                      <g transform={`translate(${epx}, ${epy + (ext.type === 'max' ? -10 : 16)})`}>
                                        <rect x="-36" y="-8" width="72" height="15" rx="3" fill="rgba(15, 23, 42, 0.9)" stroke={extColor} strokeWidth="0.8" />
                                        <text x="0" y="2.5" fill={extColor} fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                          {ext.type === 'max' ? '▲ MAX' : '▼ MIN'} ({ext.x.toFixed(1)}, {ext.y.toFixed(1)})
                                        </text>
                                      </g>
                                    </g>
                                  );
                                })}
                              </g>
                            )}
                          </g>
                        )}

                        {/* B. POLAR MODE r = f(θ) */}
                        {sandboxCoordType === 'polar' && (
                          <g>
                            {/* Polar Sector Shading */}
                            {showAreaShading && showCurve1 && (
                              <path
                                d={(() => {
                                  let path = 'M 0 0';
                                  const steps = 360;
                                  for (let i = 0; i <= steps; i++) {
                                    const th = (i / steps) * 2 * Math.PI;
                                    const r = Math.max(0, evalPolar(th, 1, polarPreset));
                                    const px = r * Math.cos(th) * scale;
                                    const py = -r * Math.sin(th) * scale;
                                    path += ` L ${px} ${py}`;
                                  }
                                  path += ' Z';
                                  return path;
                                })()}
                                fill="url(#sbPolarGrad)"
                              />
                            )}

                            {/* Polar Curve 3 */}
                            {showCurve3 && (
                              <path
                                d={(() => {
                                  let path = '';
                                  const steps = 360;
                                  for (let i = 0; i <= steps; i++) {
                                    const th = (i / steps) * 2 * Math.PI;
                                    const r = Math.max(0, evalPolar(th, 3, polarPreset));
                                    const px = r * Math.cos(th) * scale;
                                    const py = -r * Math.sin(th) * scale;
                                    if (i === 0) path += `M ${px} ${py}`;
                                    else path += ` L ${px} ${py}`;
                                  }
                                  return path;
                                })()}
                                fill="none"
                                stroke="#ec4899"
                                strokeWidth="2.0"
                                strokeDasharray="4 3"
                                opacity="0.85"
                              />
                            )}

                            {/* Polar Curve 2 */}
                            {showCurve2 && (
                              <path
                                d={(() => {
                                  let path = '';
                                  const steps = 360;
                                  for (let i = 0; i <= steps; i++) {
                                    const th = (i / steps) * 2 * Math.PI;
                                    const r = Math.max(0, evalPolar(th, 2, polarPreset));
                                    const px = r * Math.cos(th) * scale;
                                    const py = -r * Math.sin(th) * scale;
                                    if (i === 0) path += `M ${px} ${py}`;
                                    else path += ` L ${px} ${py}`;
                                  }
                                  return path;
                                })()}
                                fill="none"
                                stroke="#38bdf8"
                                strokeWidth="2.4"
                                opacity="0.9"
                              />
                            )}

                            {/* Polar Curve 1 (Primary) */}
                            {showCurve1 && (
                              <path
                                d={(() => {
                                  let path = '';
                                  const steps = 480;
                                  for (let i = 0; i <= steps; i++) {
                                    const th = (i / steps) * (polarPreset === 'spiral' ? 4 * Math.PI : 2 * Math.PI);
                                    const r = Math.max(0, evalPolar(th, 1, polarPreset));
                                    const px = r * Math.cos(th) * scale;
                                    const py = -r * Math.sin(th) * scale;
                                    if (i === 0) path += `M ${px} ${py}`;
                                    else path += ` L ${px} ${py}`;
                                  }
                                  return path;
                                })()}
                                fill="none"
                                stroke="#34d399"
                                strokeWidth="3.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#sandboxGlow)"
                              />
                            )}
                          </g>
                        )}

                        {/* C. PARAMETRIC MODE (x(t), y(t)) */}
                        {sandboxCoordType === 'parametric' && (
                          <g>
                            {/* Parametric Curve 3 */}
                            {showCurve3 && (
                              <path
                                d={(() => {
                                  let path = '';
                                  const steps = 400;
                                  for (let i = 0; i <= steps; i++) {
                                    const t = (i / steps) * 2 * Math.PI;
                                    const pt = evalParametric(t, 3, parametricPreset);
                                    const px = pt.x * scale;
                                    const py = -pt.y * scale;
                                    if (i === 0) path += `M ${px} ${py}`;
                                    else path += ` L ${px} ${py}`;
                                  }
                                  return path;
                                })()}
                                fill="none"
                                stroke="#ec4899"
                                strokeWidth="2.0"
                                strokeDasharray="4 3"
                                opacity="0.85"
                              />
                            )}

                            {/* Parametric Curve 2 */}
                            {showCurve2 && (
                              <path
                                d={(() => {
                                  let path = '';
                                  const steps = 400;
                                  for (let i = 0; i <= steps; i++) {
                                    const t = (i / steps) * 2 * Math.PI;
                                    const pt = evalParametric(t, 2, parametricPreset);
                                    const px = pt.x * scale;
                                    const py = -pt.y * scale;
                                    if (i === 0) path += `M ${px} ${py}`;
                                    else path += ` L ${px} ${py}`;
                                  }
                                  return path;
                                })()}
                                fill="none"
                                stroke="#38bdf8"
                                strokeWidth="2.4"
                                opacity="0.9"
                              />
                            )}

                            {/* Parametric Curve 1 (Primary) */}
                            {showCurve1 && (
                              <path
                                d={(() => {
                                  let path = '';
                                  const steps = 500;
                                  const maxT = parametricPreset === 'hypotrochoid' || parametricPreset === 'cycloid' ? 4 * Math.PI : 2 * Math.PI;
                                  for (let i = 0; i <= steps; i++) {
                                    const t = (i / steps) * maxT;
                                    const pt = evalParametric(t, 1, parametricPreset);
                                    const px = pt.x * scale;
                                    const py = -pt.y * scale;
                                    if (i === 0) path += `M ${px} ${py}`;
                                    else path += ` L ${px} ${py}`;
                                  }
                                  return path;
                                })()}
                                fill="none"
                                stroke="#34d399"
                                strokeWidth="3.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#sandboxGlow)"
                              />
                            )}
                          </g>
                        )}
                      </g>

                      {/* 3. LIVE TRACER BEAD, TANGENT, VELOCITY VECTOR & OSCULATING CIRCLE */}
                      {showTracerDot && (() => {
                        let tPos = { px: 0, py: 0, rawX: 0, rawY: 0, vx: 0, vy: 0, label: '', kappa: 0, oscR: 0, oscCx: 0, oscCy: 0 };

                        if (sandboxCoordType === 'cartesian') {
                          const xTrace = -3.0 + (((phaseShift * 0.7) % 6.0) + 6.0) % 6.0;
                          const yTrace = evalCartesian(xTrace, 1, cartesianPreset);
                          const delta = 0.01;
                          const yNext = evalCartesian(xTrace + delta, 1, cartesianPreset);
                          const yPrev = evalCartesian(xTrace - delta, 1, cartesianPreset);
                          const dy = (yNext - yPrev) / (2 * delta);
                          const d2y = (yNext - 2 * yTrace + yPrev) / (delta * delta);
                          const len = Math.sqrt(1 + dy * dy) || 1;

                          // Curvature κ = |f''| / (1 + f'^2)^(3/2)
                          const kappa = Math.abs(d2y) / Math.pow(1 + dy * dy, 1.5);
                          const oscR = Math.min(240, (1 / Math.max(0.004, kappa)) * scale);
                          const normSign = d2y >= 0 ? 1 : -1;
                          const oscCx = xTrace * scale - normSign * (dy / len) * oscR;
                          const oscCy = -yTrace * scale - normSign * (1 / len) * oscR;

                          tPos = {
                            px: xTrace * scale,
                            py: -yTrace * scale,
                            rawX: xTrace,
                            rawY: yTrace,
                            vx: (1 / len) * 36,
                            vy: (-dy / len) * 36,
                            label: `(${xTrace.toFixed(2)}, ${yTrace.toFixed(2)}) • f'=${dy.toFixed(2)}`,
                            kappa,
                            oscR,
                            oscCx,
                            oscCy
                          };
                        } else if (sandboxCoordType === 'polar') {
                          const th = (phaseShift * 0.8) % (2 * Math.PI);
                          const r = Math.max(0, evalPolar(th, 1, polarPreset));
                          const xTrace = r * Math.cos(th);
                          const yTrace = r * Math.sin(th);
                          const delta = 0.01;
                          const rNext = evalPolar(th + delta, 1, polarPreset);
                          const rPrev = evalPolar(th - delta, 1, polarPreset);
                          const vxRaw = (rNext * Math.cos(th + delta) - rPrev * Math.cos(th - delta)) / (2 * delta);
                          const vyRaw = (rNext * Math.sin(th + delta) - rPrev * Math.sin(th - delta)) / (2 * delta);
                          const len = Math.sqrt(vxRaw * vxRaw + vyRaw * vyRaw) || 1;
                          tPos = {
                            px: xTrace * scale,
                            py: -yTrace * scale,
                            rawX: xTrace,
                            rawY: yTrace,
                            vx: (vxRaw / len) * 36,
                            vy: (-vyRaw / len) * 36,
                            label: `r=${r.toFixed(2)}, θ=${((th * 180) / Math.PI).toFixed(0)}°`,
                            kappa: 0.5,
                            oscR: 45 * sandboxZoom,
                            oscCx: xTrace * scale - (vyRaw / len) * 45 * sandboxZoom,
                            oscCy: -yTrace * scale + (vxRaw / len) * 45 * sandboxZoom
                          };
                        } else {
                          const maxT = parametricPreset === 'hypotrochoid' || parametricPreset === 'cycloid' ? 4 * Math.PI : 2 * Math.PI;
                          const tVal = (phaseShift * 0.8) % maxT;
                          const pt = evalParametric(tVal, 1, parametricPreset);
                          const delta = 0.01;
                          const ptNext = evalParametric(tVal + delta, 1, parametricPreset);
                          const ptPrev = evalParametric(tVal - delta, 1, parametricPreset);
                          const vxRaw = (ptNext.x - ptPrev.x) / (2 * delta);
                          const vyRaw = (ptNext.y - ptPrev.y) / (2 * delta);
                          const len = Math.sqrt(vxRaw * vxRaw + vyRaw * vyRaw) || 1;
                          tPos = {
                            px: pt.x * scale,
                            py: -pt.y * scale,
                            rawX: pt.x,
                            rawY: pt.y,
                            vx: (vxRaw / len) * 36,
                            vy: (-vyRaw / len) * 36,
                            label: `(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}) • t=${tVal.toFixed(2)}`,
                            kappa: 0.6,
                            oscR: 40 * sandboxZoom,
                            oscCx: pt.x * scale - (vyRaw / len) * 40 * sandboxZoom,
                            oscCy: -pt.y * scale + (vxRaw / len) * 40 * sandboxZoom
                          };
                        }

                        return (
                          <g>
                            {/* Drop-line to Axis */}
                            <line x1={tPos.px} y1={tPos.py} x2={tPos.px} y2="0" stroke="rgba(251, 191, 36, 0.45)" strokeWidth="1.2" strokeDasharray="3 3" />

                            {/* Velocity & Tangent Vector v(t) */}
                            {showTangentVector && (
                              <g>
                                <line x1={tPos.px} y1={tPos.py} x2={tPos.px + tPos.vx} y2={tPos.py + tPos.vy} stroke="#38bdf8" strokeWidth="2.4" />
                                <circle cx={tPos.px + tPos.vx} cy={tPos.py + tPos.vy} r="3" fill="#38bdf8" />
                                {/* Orthogonal Normal Vector N */}
                                <line x1={tPos.px} y1={tPos.py} x2={tPos.px - tPos.vy * 0.65} y2={tPos.py + tPos.vx * 0.65} stroke="#ec4899" strokeWidth="1.8" />
                              </g>
                            )}

                            {/* Osculating Circle κ(t) & Center of Curvature */}
                            {showOsculatingCircle && tPos.oscR > 2 && tPos.oscR < 320 && (
                              <g opacity="0.9">
                                <circle
                                  cx={tPos.oscCx}
                                  cy={tPos.oscCy}
                                  r={tPos.oscR}
                                  fill="rgba(236, 72, 153, 0.07)"
                                  stroke="#ec4899"
                                  strokeWidth="1.6"
                                  strokeDasharray="4 3"
                                />
                                <line
                                  x1={tPos.px}
                                  y1={tPos.py}
                                  x2={tPos.oscCx}
                                  y2={tPos.oscCy}
                                  stroke="#ec4899"
                                  strokeWidth="1.2"
                                  strokeDasharray="2 2"
                                />
                                <circle cx={tPos.oscCx} cy={tPos.oscCy} r="3.5" fill="#ec4899" stroke="#ffffff" strokeWidth="1" />
                                <g transform={`translate(${tPos.oscCx + 6}, ${tPos.oscCy - 6})`}>
                                  <rect x="0" y="0" width="85" height="15" rx="3" fill="rgba(15, 23, 42, 0.9)" stroke="#ec4899" strokeWidth="0.8" />
                                  <text x="42" y="10.5" fill="#ec4899" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                    κ={(tPos.kappa || 0.5).toFixed(2)} (R={Math.round(tPos.oscR)}px)
                                  </text>
                                </g>
                              </g>
                            )}

                            {/* Tracer Bead */}
                            <circle cx={tPos.px} cy={tPos.py} r="8" fill="rgba(251, 191, 36, 0.3)" />
                            <circle cx={tPos.px} cy={tPos.py} r="5" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />

                            {/* Live Floating Coordinate Callout */}
                            <g transform={`translate(${tPos.px + 10}, ${tPos.py - 14})`}>
                              <rect x="0" y="0" width="135" height="22" rx="4" fill="rgba(15, 23, 42, 0.92)" stroke="#fbbf24" strokeWidth="1.2" />
                              <text x="67" y="14" fill="#fbbf24" fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                {tPos.label}
                              </text>
                            </g>
                          </g>
                        );
                      })()}

                      {/* 4. ON-CANVAS MATHEMATICAL HUD BADGE */}
                      <g transform="translate(-305, -225)">
                        <rect x="0" y="0" width="280" height="42" rx="6" fill="rgba(15, 23, 42, 0.92)" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />
                        <text x="12" y="16" fill="#38bdf8" fontSize="10.5" fontWeight="bold" fontFamily="monospace">
                          🪐 {sandboxCoordType.toUpperCase()}: {sandboxCoordType === 'cartesian' ? cartesianPreset.toUpperCase() : sandboxCoordType === 'polar' ? polarPreset.toUpperCase() : parametricPreset.toUpperCase()}
                        </text>
                        <text x="12" y="32" fill="#cbd5e1" fontSize="9" fontFamily="monospace">
                          k = {paramK.toFixed(1)} • a = {paramA.toFixed(1)} • b = {paramB.toFixed(2)} • Zoom = {Math.round(sandboxZoom * 100)}%
                        </text>
                      </g>
                    </g>
                  );
                })()}
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
