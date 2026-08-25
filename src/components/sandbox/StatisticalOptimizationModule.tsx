import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import katex from 'katex';
import {
  Play,
  Pause,
  RotateCcw,
  MousePointer,
  ChevronRight,
  Sliders,
  Sparkles,
  Activity,
  BarChart2,
  Layout,
  Compass,
  RefreshCw,
  PanelRightClose,
  PanelRightOpen,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { getCanvasTheme, drawCanvasAtmosphere, drawDiagramCard, withPlotBoxClip } from '../../utils/canvasThemeEngine';
import { DualParamControl } from '../common/DualParamControl';

export type StatOptPillarType =
  | 'inference'
  | 'stochastic'
  | 'continuous_opt'
  | 'linear_matrix';

export type StatOptModelType =
  // Pillar 1: Statistical Inference & Sampling
  | 'clt_sampling'
  | 'hypothesis_power'
  | 'mle_map'
  | 'em_gmm'
  | 'mcmc_metropolis'
  | 'bootstrap_resampling'
  // Pillar 2: Stochastic Processes & Bayesian Probability
  | 'markov_chains'
  | 'bayesian_beta_binomial'
  // Pillar 3: Continuous & Numerical Optimization
  | 'first_order_optimizers'
  | 'newton_raphson'
  | 'lagrange_kkt'
  // Pillar 4: Operations Research & Matrix Decompositions
  | 'linear_programming_simplex'
  | 'pca_projection'
  | 'fisher_lda'
  | 'svd_decomposition';

export interface ModelMetadata {
  id: StatOptModelType;
  name: string;
  pillar: StatOptPillarType;
  pillarTitle: string;
  badge: string;
  badgeColor: string;
  description: string;
  formula: string;
}

export const STAT_OPT_MODELS: ModelMetadata[] = [
  // Pillar 1: Inference & Sampling
  {
    id: 'clt_sampling',
    name: 'Central Limit Theorem & Sampling Dist.',
    pillar: 'inference',
    pillarTitle: 'Statistical Inference',
    badge: 'CORE UG/PG',
    badgeColor: '#38bdf8',
    description: 'Regardless of parent population shape, sample means converge asymptotically to Gaussian N(μ, σ²/N).',
    formula: '\\bar{X}_N \\xrightarrow{d} \\mathcal{N}\\left(\\mu, \\frac{\\sigma^2}{N}\\right)'
  },
  {
    id: 'hypothesis_power',
    name: 'Hypothesis Testing & Power Analysis',
    pillar: 'inference',
    pillarTitle: 'Statistical Inference',
    badge: 'INFERENCE',
    badgeColor: '#ec4899',
    description: 'Visualizing Type I error (α), Type II error (β), Statistical Power (1-β), and P-Values under H₀ vs H₁.',
    formula: 'Z = \\frac{\\bar{X} - \\mu_0}{\\sigma / \\sqrt{n}}, \\quad \\text{Power} = 1 - \\beta'
  },
  {
    id: 'mle_map',
    name: 'Maximum Likelihood vs MAP Estimation',
    pillar: 'inference',
    pillarTitle: 'Statistical Inference',
    badge: 'ESTIMATION',
    badgeColor: '#38bdf8',
    description: 'Frequentist Likelihood maximization vs Bayesian prior regularized maximum a posteriori estimation.',
    formula: '\\hat{\\theta}_{\\text{MAP}} = \\arg\\max_\\theta \\left[\\ln p(X|\\theta) + \\ln p(\\theta)\\right]'
  },
  {
    id: 'em_gmm',
    name: 'Expectation-Maximization (GMMs)',
    pillar: 'inference',
    pillarTitle: 'Statistical Inference',
    badge: 'LATENT VARS',
    badgeColor: '#a855f7',
    description: 'Iterative E-Step (soft responsibilities γ_ik) and M-Step (parameter update) on Gaussian Mixture Models.',
    formula: '\\gamma_{ik} = \\frac{\\pi_k \\mathcal{N}(x_i | \\mu_k, \\Sigma_k)}{\\sum_j \\pi_j \\mathcal{N}(x_i | \\mu_j, \\Sigma_j)}'
  },
  {
    id: 'mcmc_metropolis',
    name: 'MCMC Metropolis-Hastings Sampling',
    pillar: 'inference',
    pillarTitle: 'Statistical Inference',
    badge: 'SAMPLING',
    badgeColor: '#10b981',
    description: 'Drawing samples from intractable target posteriors via Markov proposal jumps & acceptance probability.',
    formula: '\\alpha(x, x\') = \\min\\left(1, \\frac{p(x\') q(x | x\')}{p(x) q(x\' | x)}\\right)'
  },
  {
    id: 'bootstrap_resampling',
    name: 'Bootstrap & Empirical Confidence Bands',
    pillar: 'inference',
    pillarTitle: 'Statistical Inference',
    badge: 'NON-PARAMETRIC',
    badgeColor: '#f59e0b',
    description: 'Resampling with replacement to approximate sampling distribution & percentile confidence intervals.',
    formula: '\\widehat{\\text{SE}}_B = \\sqrt{\\frac{1}{B-1}\\sum_{b=1}^B (\\hat{\\theta}^{*b} - \\bar{\\theta}^*)^2}'
  },

  // Pillar 2: Stochastic & Bayesian
  {
    id: 'markov_chains',
    name: 'Markov Chains & Stationary Dynamics',
    pillar: 'stochastic',
    pillarTitle: 'Stochastic & Bayesian',
    badge: 'STOCHASTIC',
    badgeColor: '#6366f1',
    description: 'Discrete state transitions, transition matrix powers P^t, and long-term convergence to stationary vector π*.',
    formula: '\\pi^{(t+1)} = \\pi^{(t)} P, \\quad \\pi^* P = \\pi^*'
  },
  {
    id: 'bayesian_beta_binomial',
    name: 'Bayesian Beta-Binomial Conjugate Engine',
    pillar: 'stochastic',
    pillarTitle: 'Stochastic & Bayesian',
    badge: 'BAYESIAN',
    badgeColor: '#8b5cf6',
    description: 'Conjugate prior updating: Beta(α₀, β₀) + Binomial(n, k) → Beta(α₀+k, β₀+n-k) with live coin tosses.',
    formula: 'p(\\theta | k, n) = \\text{Beta}(\\alpha_0 + k, \\beta_0 + n - k)'
  },

  // Pillar 3: Continuous Optimization
  {
    id: 'first_order_optimizers',
    name: 'First-Order Optimizer Race (Adam/SGD)',
    pillar: 'continuous_opt',
    pillarTitle: 'Continuous Optimization',
    badge: 'GRADIENTS',
    badgeColor: '#06b6d4',
    description: 'Real-time contour trajectories of Vanilla SGD, Polyak Momentum, RMSprop, and Adam on non-convex surfaces.',
    formula: '\\theta_{t+1} = \\theta_t - \\frac{\\eta}{\\sqrt{\\hat{v}_t} + \\epsilon} \\hat{m}_t'
  },
  {
    id: 'newton_raphson',
    name: 'Newton-Raphson & Second-Order Hessian',
    pillar: 'continuous_opt',
    pillarTitle: 'Continuous Optimization',
    badge: '2ND ORDER',
    badgeColor: '#14b8a6',
    description: 'Quadratic Taylor series osculating fit utilizing gradient and second derivative/Hessian curvature.',
    formula: 'x_{k+1} = x_k - [\\nabla^2 f(x_k)]^{-1} \\nabla f(x_k)'
  },
  {
    id: 'lagrange_kkt',
    name: 'Constrained Optimization & KKT Tangency',
    pillar: 'continuous_opt',
    pillarTitle: 'Continuous Optimization',
    badge: 'CONSTRAINED',
    badgeColor: '#f97316',
    description: 'Finding extrema subject to constraints via collinear gradients ∇f = λ∇g at level curve contact points.',
    formula: '\\mathcal{L}(x, \\lambda, \\mu) = f(x) + \\sum \\lambda_i g_i(x) + \\sum \\mu_j h_j(x)'
  },

  // Pillar 4: Operations Research & Matrix Decompositions
  {
    id: 'linear_programming_simplex',
    name: '2D Linear Programming & Simplex Polygon',
    pillar: 'linear_matrix',
    pillarTitle: 'Operations Research',
    badge: 'SIMPLEX',
    badgeColor: '#eab308',
    description: 'Convex feasible polyhedron, constraint half-planes, extreme corner points, and sweeping objective line.',
    formula: '\\max Z = c^T x \\quad \\text{s.t.} \\quad A x \\le b, \\; x \\ge 0'
  },
  {
    id: 'pca_projection',
    name: 'Principal Component Analysis (PCA)',
    pillar: 'linear_matrix',
    pillarTitle: 'Linear Algebra',
    badge: 'EIGEN VALUES',
    badgeColor: '#22c55e',
    description: 'Orthogonal covariance eigenvectors (PC₁, PC₂), variance maximization, and dimensionality reduction projections.',
    formula: '\\mathbf{\\Sigma} v_i = \\lambda_i v_i, \\quad \\text{Var Explained} = \\frac{\\lambda_1}{\\sum \\lambda_i}'
  },
  {
    id: 'fisher_lda',
    name: "Fisher's Linear Discriminant Analysis",
    pillar: 'linear_matrix',
    pillarTitle: 'Classification',
    badge: 'SCATTER RATIO',
    badgeColor: '#3b82f6',
    description: 'Maximizing Rayleigh quotient: between-class scatter matrix S_B over within-class scatter matrix S_W.',
    formula: 'J(w) = \\frac{w^T S_B w}{w^T S_W w}, \\quad w^* \\propto S_W^{-1} (\\mu_1 - \\mu_0)'
  },
  {
    id: 'svd_decomposition',
    name: 'Singular Value Decomposition (SVD)',
    pillar: 'linear_matrix',
    pillarTitle: 'Matrix Decompositions',
    badge: 'GEOMETRIC',
    badgeColor: '#d946ef',
    description: 'Geometric circle-to-ellipse linear transformation A = U Σ Vᵀ via orthogonal rotations and principal stretches.',
    formula: 'A = U \\mathbf{\\Sigma} V^T = \\sum_{i=1}^r \\sigma_i u_i v_i^T'
  }
];

export const StatisticalOptimizationModule: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<StatOptModelType>('clt_sampling');
  const [activePillar, setActivePillar] = useState<StatOptPillarType>('inference');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simMode, setSimMode] = useState<'interactive' | 'autoplay'>('autoplay');
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [mleMapViewMode, setMleMapViewMode] = useState<'triad' | 'mle_only' | 'map_only'>('triad');
  const [mobileActiveTab, setMobileActiveTab] = useState<'canvas' | 'controls' | 'telemetry'>('canvas');
  const [desktopTab, setDesktopTab] = useState<'parameters' | 'telemetry' | 'split' | 'focus'>('split');
  const [canvasAtmosphere, setCanvasAtmosphere] = useState<string>(() => {
    try {
      return localStorage.getItem('chatterbot_canvas_atmosphere') || 'deep_void';
    } catch {
      return 'deep_void';
    }
  });
  const [isHudMinimized, setIsHudMinimized] = useState<boolean>(false);

  const getHypoZCrit = useCallback((alpha: number, tails: 'one' | 'two'): number => {
    if (tails === 'two') {
      if (alpha <= 0.015) return 2.576;
      if (alpha <= 0.07) return 1.960;
      return 1.645;
    } else {
      if (alpha <= 0.015) return 2.326;
      if (alpha <= 0.07) return 1.645;
      return 1.282;
    }
  }, []);

  useEffect(() => {
    const handleAtmosphereUpdate = () => {
      try {
        const atmo = localStorage.getItem('chatterbot_canvas_atmosphere') || 'deep_void';
        setCanvasAtmosphere(atmo);
      } catch {}
    };
    window.addEventListener('chatterbot_canvas_atmosphere_updated', handleAtmosphereUpdate);
    return () => {
      window.removeEventListener('chatterbot_canvas_atmosphere_updated', handleAtmosphereUpdate);
    };
  }, []);

  // ─── Pillar 1: CLT State ───
  const [cltPopDist, setCltPopDist] = useState<'uniform' | 'exponential' | 'bimodal' | 'triangular'>('exponential');
  const [cltSampleSize, setCltSampleSize] = useState<number>(30);
  const [cltTotalDraws, setCltTotalDraws] = useState<number>(0);
  const [cltDrawSpeed, setCltDrawSpeed] = useState<number>(5);

  // ─── Pillar 1: Hypothesis Testing & Power State ───
  const [hypoAlpha, setHypoAlpha] = useState<number>(0.05);
  const [hypoEffectSize, setHypoEffectSize] = useState<number>(0.80);
  const [hypoSampleSize, setHypoSampleSize] = useState<number>(35);
  const [hypoTails, setHypoTails] = useState<'one' | 'two'>('two');
  const [hypoObservedZ, setHypoObservedZ] = useState<number>(2.15);

  // ─── Pillar 1: MLE & MAP State ───
  const [mleSampleMean, setMleSampleMean] = useState<number>(0.35);
  const [mleSampleStd, setMleSampleStd] = useState<number>(0.45);
  const [mapPriorMean, setMapPriorMean] = useState<number>(-0.25);
  const [mapPriorWeight, setMapPriorWeight] = useState<number>(0.40);
  const [mleLogLikelihood, setMleLogLikelihood] = useState<number>(-42.5);

  // ─── Pillar 1: EM GMM State ───
  const [emIterations, setEmIterations] = useState<number>(0);
  const [emLogLikelihood, setEmLogLikelihood] = useState<number>(-88.4);
  const [emConverged, setEmConverged] = useState<boolean>(false);

  // ─── Pillar 1: MCMC State ───
  const [mcmcAcceptanceRate, setMcmcAcceptanceRate] = useState<number>(68.5);
  const [mcmcProposalStd, setMcmcProposalStd] = useState<number>(0.45);
  const [mcmcTotalSamples, setMcmcTotalSamples] = useState<number>(0);

  // ─── Pillar 1: Bootstrap State ───
  const [bootNumReplicas, setBootNumReplicas] = useState<number>(250);
  const [bootMeanEstimate, setBootMeanEstimate] = useState<number>(0.12);
  const [bootStdError, setBootStdError] = useState<number>(0.045);
  const [bootCI95, setBootCI95] = useState<{ low: number; high: number }>({ low: 0.03, high: 0.21 });

  // ─── Pillar 2: Markov Chains State ───
  const [mcP12, setMcP12] = useState<number>(0.35);
  const [mcP23, setMcP23] = useState<number>(0.40);
  const [mcP31, setMcP31] = useState<number>(0.45);
  const [mcStepCount, setMcStepCount] = useState<number>(0);
  const [mcStateDist, setMcStateDist] = useState<[number, number, number]>([1, 0, 0]);

  // ─── Pillar 2: Bayesian Beta-Binomial State ───
  const [bayesPriorAlpha, setBayesPriorAlpha] = useState<number>(2);
  const [bayesPriorBeta, setBayesPriorBeta] = useState<number>(2);
  const [bayesFlipsHeads, setBayesFlipsHeads] = useState<number>(14);
  const [bayesFlipsTails, setBayesFlipsTails] = useState<number>(8);
  const [bayesTrueTheta, setBayesTrueTheta] = useState<number>(0.65);

  // ─── Pillar 3: First-Order Optimizers State ───
  const [optLossSurface, setOptLossSurface] = useState<'saddle' | 'rosenbrock' | 'beale' | 'quadratic'>('saddle');
  const [optLearningRate, setOptLearningRate] = useState<number>(0.035);
  const [optMomentumBeta, setOptMomentumBeta] = useState<number>(0.85);

  // ─── Pillar 3: Newton-Raphson State ───
  const [newtonStepCount, setNewtonStepCount] = useState<number>(0);
  const [newtonCurrentX, setNewtonCurrentX] = useState<number>(1.85);
  const [newtonDamping, setNewtonDamping] = useState<number>(1.0);

  // ─── Pillar 3: Lagrange / KKT State ───
  const [lagrangeLevelC, setLagrangeLevelC] = useState<number>(1.2);
  const [lagrangeLambda, setLagrangeLambda] = useState<number>(1.45);

  // ─── Pillar 4: Linear Programming & Simplex State ───
  const [lpC1, setLpC1] = useState<number>(3.0);
  const [lpC2, setLpC2] = useState<number>(4.0);
  const [lpB1, setLpB1] = useState<number>(6.0);
  const [lpB2, setLpB2] = useState<number>(8.0);
  const [lpOptType, setLpOptType] = useState<'max' | 'min'>('max');

  // ─── Pillar 4: PCA State ───
  const [pcaCorrelation, setPcaCorrelation] = useState<number>(0.82);
  const [pcaVarX, setPcaVarX] = useState<number>(1.25);
  const [pcaVarY, setPcaVarY] = useState<number>(0.65);
  const [pcaExplainedVar, setPcaExplainedVar] = useState<number>(88.4);

  // ─── Pillar 4: Fisher LDA State ───
  const [ldaSeparability, setLdaSeparability] = useState<number>(3.84);
  const [ldaPlacementClass, setLdaPlacementClass] = useState<0 | 1>(0);

  const [svdSingular1, setSvdSingular1] = useState<number>(1.85);
  const [svdSingular2, setSvdSingular2] = useState<number>(0.65);

  // ─── 3D Perspective & Orbit Controls ───
  const [rotX, setRotX] = useState<number>(32); // degrees pitch
  const [rotY, setRotY] = useState<number>(45); // degrees yaw
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Master Simulation Ref State
  const stateRef = useRef<{
    timeT: number;
    cltMeans: number[];
    cltHistogram: number[];
    cltBalls: { x: number; y: number; vx: number; vy: number; radius: number; color: string; bin: number; targetX: number; targetY: number; settled: boolean }[];
    mcmcCurrent: number;
    mcmcHistory: { x: number; accepted: boolean }[];
    mcmcHistogram: number[];
    mcmcProposal: { x: number; prevX: number; alpha: number; accepted: boolean; animProgress: number } | null;
    mcmcTrace: number[];
    gmmParams: {
      mu1: number; sig1: number; pi1: number;
      mu2: number; sig2: number; pi2: number;
    };
    gmmPoints: number[];
    gmmHistory: number[];
    sgdPos: { x: number; y: number };
    momentumPos: { x: number; y: number; vx: number; vy: number };
    rmspropPos: { x: number; y: number; sx: number; sy: number };
    adamPos: { x: number; y: number; m: { x: number; y: number }; v: { x: number; y: number }; t: number };
    optHistory: {
      sgd: { x: number; y: number }[];
      momentum: { x: number; y: number }[];
      rmsprop: { x: number; y: number }[];
      adam: { x: number; y: number }[];
    };
    mlePoints: number[];
    bootSamples: number[];
    bootReplicas: number[];
    bayesCoins: { id: number; isHeads: boolean; x: number; y: number; vy: number; rot: number; settled: boolean }[];
    mcParticles: { from: number; to: number; progress: number; speed: number }[];
    pcaPoints: { x: number; y: number }[];
    ldaPoints: { x: number; y: number; cls: 0 | 1 }[];
  }>({
    timeT: 0,
    cltMeans: [],
    cltHistogram: new Array(50).fill(0),
    cltBalls: [],
    mcmcCurrent: 0.0,
    mcmcHistory: [],
    mcmcHistogram: new Array(50).fill(0),
    mcmcProposal: null,
    mcmcTrace: [0.0],
    gmmParams: { mu1: -0.6, sig1: 0.25, pi1: 0.5, mu2: 0.7, sig2: 0.35, pi2: 0.5 },
    gmmPoints: [],
    gmmHistory: [-88.4],
    sgdPos: { x: -1.4, y: 1.1 },
    momentumPos: { x: -1.4, y: 1.1, vx: 0, vy: 0 },
    rmspropPos: { x: -1.4, y: 1.1, sx: 0, sy: 0 },
    adamPos: { x: -1.4, y: 1.1, m: { x: 0, y: 0 }, v: { x: 0, y: 0 }, t: 0 },
    optHistory: { sgd: [], momentum: [], rmsprop: [], adam: [] },
    mlePoints: [],
    bootSamples: [],
    bootReplicas: [],
    bayesCoins: [],
    mcParticles: [],
    pcaPoints: [],
    ldaPoints: []
  });

  // Keep Pillar in sync when selectedModel changes
  useEffect(() => {
    const found = STAT_OPT_MODELS.find(m => m.id === selectedModel);
    if (found && found.pillar !== activePillar) {
      setActivePillar(found.pillar);
    }
  }, [selectedModel, activePillar]);

  // Seed / Reseed sample data for active models
  const reseedData = useCallback(() => {
    // 1. CLT Reset
    stateRef.current.cltMeans = [];
    stateRef.current.cltHistogram = new Array(50).fill(0);
    setCltTotalDraws(0);

    // 2. MLE sample points
    const mle: number[] = [];
    for (let i = 0; i < 35; i++) {
      mle.push(mleSampleMean + (Math.random() - 0.5) * mleSampleStd * 2.5);
    }
    stateRef.current.mlePoints = mle;
    const ll = -0.5 * mle.length * Math.log(2 * Math.PI * mleSampleStd * mleSampleStd) - mle.reduce((acc, p) => acc + Math.pow(p - mleSampleMean, 2), 0) / (2 * mleSampleStd * mleSampleStd);
    setMleLogLikelihood(ll);

    // 3. GMM 2-cluster data
    const gmm: number[] = [];
    for (let i = 0; i < 60; i++) {
      if (Math.random() < 0.55) {
        gmm.push(-0.6 + (Math.random() - 0.5) * 0.45);
      } else {
        gmm.push(0.7 + (Math.random() - 0.5) * 0.55);
      }
    }
    stateRef.current.gmmPoints = gmm;
    setEmIterations(0);
    setEmConverged(false);
    setEmLogLikelihood(-88.4);

    // 4. Reset Optimizers
    const startX = -1.4;
    const startY = 1.1;
    stateRef.current.sgdPos = { x: startX, y: startY };
    stateRef.current.momentumPos = { x: startX, y: startY, vx: 0, vy: 0 };
    stateRef.current.rmspropPos = { x: startX, y: startY, sx: 0, sy: 0 };
    stateRef.current.adamPos = { x: startX, y: startY, m: { x: 0, y: 0 }, v: { x: 0, y: 0 }, t: 0 };
    stateRef.current.optHistory = {
      sgd: [{ x: startX, y: startY }],
      momentum: [{ x: startX, y: startY }],
      rmsprop: [{ x: startX, y: startY }],
      adam: [{ x: startX, y: startY }]
    };

    // 5. MCMC Reset
    stateRef.current.mcmcCurrent = 0.0;
    stateRef.current.mcmcHistory = [];
    stateRef.current.mcmcHistogram = new Array(50).fill(0);
    setMcmcTotalSamples(0);
    setMcmcAcceptanceRate(68.5);

    // 6. Bootstrap Reset
    const orig: number[] = [];
    for (let i = 0; i < 40; i++) {
      orig.push(0.12 + (Math.random() - 0.5) * 0.6);
    }
    stateRef.current.bootSamples = orig;
    const reps: number[] = [];
    for (let b = 0; b < bootNumReplicas; b++) {
      let sum = 0;
      for (let i = 0; i < orig.length; i++) {
        sum += orig[Math.floor(Math.random() * orig.length)];
      }
      reps.push(sum / orig.length);
    }
    stateRef.current.bootReplicas = reps.sort((a, b) => a - b);
    const mean = reps.reduce((a, b) => a + b, 0) / reps.length;
    const std = Math.sqrt(reps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / reps.length);
    setBootMeanEstimate(mean);
    setBootStdError(std);
    setBootCI95({
      low: reps[Math.floor(reps.length * 0.025)],
      high: reps[Math.floor(reps.length * 0.975)]
    });

    // 7. Markov particles
    stateRef.current.mcParticles = [];
    for (let i = 0; i < 22; i++) {
      const from = Math.floor(Math.random() * 3);
      const to = (from + 1 + Math.floor(Math.random() * 2)) % 3;
      stateRef.current.mcParticles.push({ from, to, progress: Math.random(), speed: 0.012 + Math.random() * 0.018 });
    }

    // 8. PCA Points
    const pca: { x: number; y: number }[] = [];
    for (let i = 0; i < 70; i++) {
      const u = (Math.random() - 0.5) * 2;
      const v = (Math.random() - 0.5) * 2;
      const px = u * pcaVarX;
      const py = (pcaCorrelation * u + Math.sqrt(Math.max(0.01, 1 - pcaCorrelation * pcaCorrelation)) * v) * pcaVarY;
      pca.push({ x: px, y: py });
    }
    stateRef.current.pcaPoints = pca;
    setPcaExplainedVar(parseFloat(((1 + Math.abs(pcaCorrelation)) / 2 * 100).toFixed(1)));

    // 9. Fisher LDA Points
    const lda: { x: number; y: number; cls: 0 | 1 }[] = [];
    for (let i = 0; i < 28; i++) {
      lda.push({ x: -0.6 + (Math.random() - 0.5) * 0.45, y: -0.3 + (Math.random() - 0.5) * 0.45, cls: 0 });
      lda.push({ x: 0.6 + (Math.random() - 0.5) * 0.45, y: 0.4 + (Math.random() - 0.5) * 0.45, cls: 1 });
    }
    stateRef.current.ldaPoints = lda;
    setLdaSeparability(3.84);
  }, [mleSampleMean, mleSampleStd, bootNumReplicas, pcaCorrelation, pcaVarX, pcaVarY]);

  useEffect(() => {
    reseedData();
  }, [reseedData]);

  // Sampling generator for parent population in CLT
  const drawPopulationSample = useCallback((): number => {
    if (cltPopDist === 'uniform') {
      return (Math.random() - 0.5) * 2.4;
    } else if (cltPopDist === 'exponential') {
      return -1.0 + (-Math.log(1 - Math.random()) * 0.65);
    } else if (cltPopDist === 'bimodal') {
      return Math.random() < 0.5
        ? -0.75 + (Math.random() - 0.5) * 0.4
        : 0.75 + (Math.random() - 0.5) * 0.4;
    } else {
      return (Math.random() + Math.random() - 1.0) * 1.2;
    }
  }, [cltPopDist]);

  // Batch sample draw for CLT
  const drawCltBatch = useCallback((count: number) => {
    for (let c = 0; c < count; c++) {
      let sum = 0;
      for (let i = 0; i < cltSampleSize; i++) {
        sum += drawPopulationSample();
      }
      const sampleMean = sum / cltSampleSize;
      stateRef.current.cltMeans.push(sampleMean);

      const binIdx = Math.floor(((sampleMean + 1.5) / 3.0) * 50);
      if (binIdx >= 0 && binIdx < 50) {
        stateRef.current.cltHistogram[binIdx] += 1;
      }
    }
    setCltTotalDraws(prev => prev + count);
  }, [cltSampleSize, drawPopulationSample]);

  // Coin flip action for Bayesian updating
  const handleCoinFlip = (isHeads: boolean) => {
    if (isHeads) {
      setBayesFlipsHeads(prev => prev + 1);
    } else {
      setBayesFlipsTails(prev => prev + 1);
    }
  };

  const handleBurstFlips = (count: number) => {
    let heads = 0;
    for (let i = 0; i < count; i++) {
      if (Math.random() < bayesTrueTheta) heads++;
    }
    setBayesFlipsHeads(prev => prev + heads);
    setBayesFlipsTails(prev => prev + (count - heads));
  };

  // 3D Perspective Projection Engine (Euler Angle Yaw & Pitch)
  const project3D = (
    x: number,
    y: number,
    z: number,
    cx: number,
    cy: number,
    scale: number,
    pitchDeg: number,
    yawDeg: number
  ) => {
    const radX = (pitchDeg * Math.PI) / 180;
    const radY = (yawDeg * Math.PI) / 180;

    // 1. Yaw Rotation around Y-axis
    const x1 = x * Math.cos(radY) - y * Math.sin(radY);
    const y1 = x * Math.sin(radY) + y * Math.cos(radY);
    const z1 = z;

    // 2. Pitch Rotation around X-axis
    const x2 = x1;
    const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

    // 3. Perspective Depth Scaling
    const distance = 4.2;
    const fov = distance / (distance + z2 * 0.45);

    return {
      px: cx + x2 * scale * fov,
      py: cy - y2 * scale * fov,
      depth: z2,
      fov
    };
  };

  // Canvas Mouse & Touch Coordinates in Logical CSS Pixels
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const scale = Math.min(rect.width, rect.height) * 0.38;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    return {
      x: (mouseX - cx) / (scale || 1),
      y: (cy - mouseY) / (scale || 1)
    };
  };

  const getCanvasCoordsFromTouch = (touch: React.Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const scale = Math.min(rect.width, rect.height) * 0.38;

    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;

    return {
      x: (mouseX - cx) / (scale || 1),
      y: (cy - mouseY) / (scale || 1)
    };
  };

  const handleCanvasInteraction = (x: number, y: number) => {
    if (selectedModel === 'first_order_optimizers') {
      stateRef.current.sgdPos = { x, y };
      stateRef.current.momentumPos = { x, y, vx: 0, vy: 0 };
      stateRef.current.rmspropPos = { x, y, sx: 0, sy: 0 };
      stateRef.current.adamPos = { x, y, m: { x: 0, y: 0 }, v: { x: 0, y: 0 }, t: 0 };
      stateRef.current.optHistory = {
        sgd: [{ x, y }],
        momentum: [{ x, y }],
        rmsprop: [{ x, y }],
        adam: [{ x, y }]
      };
      return;
    }

    if (selectedModel === 'newton_raphson') {
      setNewtonCurrentX(x);
      setNewtonStepCount(0);
      return;
    }

    if (selectedModel === 'mle_map') {
      stateRef.current.mlePoints.push(x);
      const pts = stateRef.current.mlePoints;
      const mean = pts.reduce((a, b) => a + b, 0) / pts.length;
      setMleSampleMean(mean);
      const ll = -0.5 * pts.length * Math.log(2 * Math.PI * mleSampleStd * mleSampleStd) - pts.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / (2 * mleSampleStd * mleSampleStd);
      setMleLogLikelihood(ll);
      return;
    }

    if (selectedModel === 'hypothesis_power') {
      setHypoObservedZ(parseFloat(Math.max(-3.5, Math.min(3.5, x * 2.0)).toFixed(2)));
      return;
    }

    if (selectedModel === 'clt_sampling') {
      drawCltBatch(1);
      return;
    }

    if (selectedModel === 'pca_projection') {
      stateRef.current.pcaPoints.push({ x, y });
      return;
    }

    if (selectedModel === 'fisher_lda') {
      stateRef.current.ldaPoints.push({ x, y, cls: ldaPlacementClass });
      return;
    }

    if (selectedModel === 'em_gmm') {
      stateRef.current.gmmPoints.push(x);
      return;
    }

    if (selectedModel === 'mcmc_metropolis') {
      stateRef.current.mcmcCurrent = x;
      return;
    }

    if (selectedModel === 'bootstrap_resampling') {
      stateRef.current.bootSamples.push(x);
      return;
    }

    if (selectedModel === 'bayesian_beta_binomial') {
      const clamped = Math.max(0.05, Math.min(0.95, (x + 1.2) / 2.4));
      setBayesTrueTheta(parseFloat(clamped.toFixed(2)));
      return;
    }

    if (selectedModel === 'lagrange_kkt') {
      const radius = Math.sqrt(x * x + y * y);
      setLagrangeLevelC(parseFloat(Math.max(0.4, Math.min(2.2, radius)).toFixed(2)));
      return;
    }

    if (selectedModel === 'svd_decomposition') {
      const s1 = Math.max(0.5, Math.min(3.0, Math.abs(x) * 1.5));
      const s2 = Math.max(0.2, Math.min(2.0, Math.abs(y) * 1.5));
      setSvdSingular1(parseFloat(s1.toFixed(2)));
      setSvdSingular2(parseFloat(s2.toFixed(2)));
      return;
    }
  };

  const is3DModel = ['first_order_optimizers', 'newton_raphson', 'lagrange_kkt', 'svd_decomposition'].includes(selectedModel);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    const { x, y } = getCanvasCoords(e);
    handleCanvasInteraction(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    if (is3DModel && (e.buttons === 1 || e.buttons === 2)) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      setRotY(prev => (prev + dx * 0.65) % 360);
      setRotX(prev => Math.max(8, Math.min(82, prev + dy * 0.65)));
      return;
    }
    const { x, y } = getCanvasCoords(e);
    if (['hypothesis_power', 'bayesian_beta_binomial'].includes(selectedModel)) {
      handleCanvasInteraction(x, y);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
      const { x, y } = getCanvasCoordsFromTouch(touch);
      handleCanvasInteraction(x, y);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (is3DModel) {
      const dx = touch.clientX - lastMousePosRef.current.x;
      const dy = touch.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
      setRotY(prev => (prev + dx * 0.8) % 360);
      setRotX(prev => Math.max(8, Math.min(82, prev + dy * 0.8)));
      return;
    }
    const { x, y } = getCanvasCoordsFromTouch(touch);
    if (['hypothesis_power', 'bayesian_beta_binomial'].includes(selectedModel)) {
      handleCanvasInteraction(x, y);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Perform discrete algorithm step
  const performStep = () => {
    if (selectedModel === 'clt_sampling') {
      drawCltBatch(1);
    } else if (selectedModel === 'markov_chains') {
      const P = [
        [1 - mcP12, mcP12, 0],
        [0, 1 - mcP23, mcP23],
        [mcP31, 0, 1 - mcP31]
      ];
      const cur = mcStateDist;
      const next: [number, number, number] = [
        cur[0] * P[0][0] + cur[1] * P[1][0] + cur[2] * P[2][0],
        cur[0] * P[0][1] + cur[1] * P[1][1] + cur[2] * P[2][1],
        cur[0] * P[0][2] + cur[1] * P[1][2] + cur[2] * P[2][2]
      ];
      setMcStateDist(next);
      setMcStepCount(prev => prev + 1);
    } else if (selectedModel === 'em_gmm') {
      const { gmmPoints, gmmParams } = stateRef.current;
      if (gmmPoints.length === 0) return;

      const resps = gmmPoints.map(x => {
        const p1 = gmmParams.pi1 * (1 / (gmmParams.sig1 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - gmmParams.mu1) / gmmParams.sig1, 2));
        const p2 = gmmParams.pi2 * (1 / (gmmParams.sig2 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - gmmParams.mu2) / gmmParams.sig2, 2));
        const total = p1 + p2 || 1e-6;
        return { r1: p1 / total, r2: p2 / total };
      });

      const N1 = resps.reduce((s, r) => s + r.r1, 0);
      const N2 = resps.reduce((s, r) => s + r.r2, 0);
      const totalN = gmmPoints.length;

      const newMu1 = resps.reduce((s, r, i) => s + r.r1 * gmmPoints[i], 0) / (N1 || 1);
      const newMu2 = resps.reduce((s, r, i) => s + r.r2 * gmmPoints[i], 0) / (N2 || 1);

      const newSig1 = Math.max(0.12, Math.sqrt(resps.reduce((s, r, i) => s + r.r1 * Math.pow(gmmPoints[i] - newMu1, 2), 0) / (N1 || 1)));
      const newSig2 = Math.max(0.12, Math.sqrt(resps.reduce((s, r, i) => s + r.r2 * Math.pow(gmmPoints[i] - newMu2, 2), 0) / (N2 || 1)));

      stateRef.current.gmmParams = {
        mu1: newMu1, sig1: newSig1, pi1: N1 / totalN,
        mu2: newMu2, sig2: newSig2, pi2: N2 / totalN
      };

      // Compute exact total log-likelihood
      let exactLL = 0;
      gmmPoints.forEach(x => {
        const d1 = (N1 / totalN) * (1 / (newSig1 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - newMu1) / newSig1, 2));
        const d2 = (N2 / totalN) * (1 / (newSig2 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - newMu2) / newSig2, 2));
        exactLL += Math.log(Math.max(1e-12, d1 + d2));
      });

      stateRef.current.gmmHistory.push(exactLL);

      setEmIterations(prev => {
        const next = prev + 1;
        if (next > 12) setEmConverged(true);
        return next;
      });
      setEmLogLikelihood(parseFloat(exactLL.toFixed(2)));
    } else if (selectedModel === 'newton_raphson') {
      const x = newtonCurrentX;
      const fPrime = 4 * Math.pow(x, 3) - 4 * x;
      const fDoublePrime = 12 * Math.pow(x, 2) - 4 || 1e-4;
      const nextX = x - (fPrime / fDoublePrime) * newtonDamping;
      setNewtonCurrentX(nextX);
      setNewtonStepCount(prev => prev + 1);
    } else if (selectedModel === 'mcmc_metropolis') {
      const cur = stateRef.current.mcmcCurrent;
      const prop = cur + (Math.random() - 0.5) * mcmcProposalStd * 2;
      const targetPdf = (val: number) => 0.6 * Math.exp(-0.5 * Math.pow((val + 0.8) / 0.35, 2)) + 0.4 * Math.exp(-0.5 * Math.pow((val - 0.8) / 0.4, 2));
      const pCur = targetPdf(cur);
      const pProp = targetPdf(prop);
      const alpha = Math.min(1, pProp / (pCur || 1e-6));
      const accepted = Math.random() < alpha;

      if (accepted) {
        stateRef.current.mcmcCurrent = prop;
        const bin = Math.floor(((prop + 2.0) / 4.0) * 50);
        if (bin >= 0 && bin < 50) stateRef.current.mcmcHistogram[bin]++;
      }
      stateRef.current.mcmcHistory.push({ x: accepted ? prop : cur, accepted });
      setMcmcTotalSamples(prev => prev + 1);
    }
  };

  // Loss surface evaluation helper
  const lossFunction = (x: number, y: number, surface: string): { val: number; dx: number; dy: number } => {
    if (surface === 'saddle') {
      return {
        val: x * x - 0.8 * y * y,
        dx: 2 * x,
        dy: -1.6 * y
      };
    } else if (surface === 'rosenbrock') {
      const val = Math.pow(0.8 - x, 2) + 4 * Math.pow(y - x * x, 2);
      const dx = -2 * (0.8 - x) - 16 * x * (y - x * x);
      const dy = 8 * (y - x * x);
      return { val, dx, dy };
    } else if (surface === 'beale') {
      const val = 0.5 * (x * x + y * y) - 0.4 * Math.cos(2.5 * x) - 0.4 * Math.cos(2.5 * y);
      const dx = x + Math.sin(2.5 * x);
      const dy = y + Math.sin(2.5 * y);
      return { val, dx, dy };
    } else {
      return {
        val: 0.5 * (x * x + 4 * y * y),
        dx: x,
        dy: 4 * y
      };
    }
  };

  // 60 FPS Canvas Animation & Simulation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let localFrame = 0;

    const renderLoop = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.max(320, Math.floor((rect.width || 900) * dpr));
      const targetH = Math.max(320, Math.floor((rect.height || 660) * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.38;

      // Unified Atmosphere Palette & Background Grid
      const theme = getCanvasTheme(canvasAtmosphere);
      drawCanvasAtmosphere(ctx, w, h, theme, 40);

      // Axis lines
      ctx.strokeStyle = theme.axis;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
      ctx.moveTo(0, cy); ctx.lineTo(w, cy);
      ctx.stroke();

      stateRef.current.timeT += 0.02;
      localFrame++;

      // ────────────────────────────────────────────────────────────────────────
      // 1. CENTRAL LIMIT THEOREM & SAMPLING DISTRIBUTION (CLT)
      // ────────────────────────────────────────────────────────────────────────
      if (selectedModel === 'clt_sampling') {
        if (isSimulating && localFrame % Math.max(1, Math.round((10 - cltDrawSpeed * 2) / simSpeed)) === 0) {
          drawCltBatch(1);
        }

        const marginX = 14;
        const marginY = 14;
        const totalW = Math.max(680, w - 2 * marginX);
        const cardH = Math.max(480, h - 2 * marginY - 10);
        const topH = Math.floor((cardH - 16) * 0.44);
        const botH = cardH - topH - 16;
        const leftX = cx - totalW / 2;
        const topY = cy - cardH / 2 + 6;
        const botY = topY + topH + 16;

        // 1. Top Card: Parent Population Distribution & Galton Particle Drop
        drawDiagramCard(ctx, leftX, topY, totalW, topH, theme, '🎲 1. PARENT POPULATION & GALTON BOARD CASCADE');

        const topPlotX = leftX + 10;
        const topPlotY = topY + 34;
        const topPlotW = totalW - 20;
        const topPlotH = topH - 44;

        withPlotBoxClip(ctx, topPlotX, topPlotY, topPlotW, topPlotH, 6, () => {
          // Population density curve
          ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.2;
          ctx.beginPath();

          const baseY = topPlotY + topPlotH - 8;
          ctx.moveTo(topPlotX, baseY);

          const stepCount = 60;
          for (let i = 0; i <= stepCount; i++) {
            const t = -1.8 + (i / stepCount) * 3.6;
            let dens = 0;
            if (cltPopDist === 'uniform') dens = Math.abs(t) <= 1.2 ? 0.5 : 0;
            else if (cltPopDist === 'exponential') dens = t >= -1.0 ? Math.exp(-(t + 1.0) / 0.65) * 0.85 : 0;
            else if (cltPopDist === 'bimodal') dens = (Math.exp(-Math.pow((t + 0.75) / 0.3, 2)) + Math.exp(-Math.pow((t - 0.75) / 0.3, 2))) * 0.5;
            else dens = Math.max(0, 1.3 - Math.abs(t)) * 0.55;

            const px = topPlotX + (i / stepCount) * topPlotW;
            const py = baseY - dens * (topPlotH - 24);
            ctx.lineTo(px, py);
          }
          ctx.lineTo(topPlotX + topPlotW, baseY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Animated Galton Pegs Grid
          const pegRows = 3;
          const pegCols = 15;
          ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
          for (let r = 0; r < pegRows; r++) {
            const rowY = topPlotY + 12 + r * 16;
            const xOffset = (r % 2) * (topPlotW / pegCols / 2);
            for (let c = 0; c < pegCols; c++) {
              const pegX = topPlotX + 16 + c * (topPlotW / pegCols) + xOffset;
              ctx.beginPath();
              ctx.arc(pegX, rowY, 2, 0, 2 * Math.PI);
              ctx.fill();
            }
          }

          // Animated Sampling Droplets
          if (isSimulating && localFrame % Math.max(1, Math.round(4 / simSpeed)) === 0) {
            const sampleVal = drawPopulationSample();
            const sx = topPlotX + ((sampleVal + 1.8) / 3.6) * topPlotW;
            stateRef.current.cltBalls.push({
              x: sx,
              y: topPlotY + 6,
              vx: (Math.random() - 0.5) * 0.8,
              vy: (2.2 + Math.random() * 1.5) * Math.min(2.0, simSpeed),
              radius: 3,
              color: '#34d399',
              bin: Math.floor(((sampleVal + 1.5) / 3.0) * 50),
              targetX: sx,
              targetY: baseY,
              settled: false
            });
            if (stateRef.current.cltBalls.length > 25) {
              stateRef.current.cltBalls.shift();
            }
          }

          // Draw active falling balls
          stateRef.current.cltBalls.forEach(b => {
            if (!b.settled) {
              b.y += b.vy;
              b.x += b.vx;
              if (b.y >= baseY) {
                b.y = baseY;
                b.settled = true;
              }
            }
            ctx.fillStyle = b.color;
            ctx.shadowColor = b.color;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;
          });
        });

        // 2. Bottom Card: Empirical Sampling Distribution vs Theoretical Gaussian
        drawDiagramCard(ctx, leftX, botY, totalW, botH, theme, '📊 2. SAMPLING DISTRIBUTION OF THE MEAN (CENTRAL LIMIT THEOREM)');

        const botPlotX = leftX + 10;
        const botPlotY = botY + 34;
        const botPlotW = totalW - 20;
        const botPlotH = botH - 44;

        withPlotBoxClip(ctx, botPlotX, botPlotY, botPlotW, botPlotH, 6, () => {
          const hist = stateRef.current.cltHistogram;
          const maxBin = Math.max(...hist, 1);
          const binW = botPlotW / 50;
          const histBaseY = botPlotY + botPlotH - 8;

          // Histogram Bars with Emerald Gradient
          for (let i = 0; i < 50; i++) {
            const binVal = hist[i];
            const barH = (binVal / maxBin) * (botPlotH - 24);
            const bx = botPlotX + i * binW;
            const by = histBaseY - barH;

            const grad = ctx.createLinearGradient(0, by, 0, histBaseY);
            grad.addColorStop(0, 'rgba(52, 211, 153, 0.85)');
            grad.addColorStop(1, 'rgba(16, 185, 129, 0.25)');
            ctx.fillStyle = grad;
            ctx.fillRect(bx, by, binW - 0.8, barH);
          }

          // Theoretical Gaussian Envelope Curve N(μ, σ²/N)
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          const se = 0.55 / Math.sqrt(cltSampleSize);
          for (let i = 0; i <= 60; i++) {
            const t = -1.5 + (i / 60) * 3.0;
            const gaussian = (1 / (se * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow(t / se, 2));
            const gx = botPlotX + (i / 60) * botPlotW;
            const gy = histBaseY - Math.min(1.0, gaussian * 0.22) * (botPlotH - 24);
            if (i === 0) ctx.moveTo(gx, gy);
            else ctx.lineTo(gx, gy);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        });
      }

      // ────────────────────────────────────────────────────────────────────────
      // 2. HYPOTHESIS TESTING, P-VALUES & POWER ANALYSIS
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'hypothesis_power') {
        if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(5 / simSpeed)) === 0) {
          setHypoObservedZ(parseFloat((1.0 + 1.8 * Math.sin(stateRef.current.timeT * 0.7)).toFixed(2)));
        }

        const marginX = 14;
        const marginY = 14;
        const totalW = Math.max(680, w - 2 * marginX);
        const cardH = Math.max(480, h - 2 * marginY - 10);
        const leftX = cx - totalW / 2;
        const topY = cy - cardH / 2 + 6;

        drawDiagramCard(ctx, leftX, topY, totalW, cardH, theme, `📊 HYPOTHESIS TESTING & STATISTICAL POWER (${hypoTails === 'two' ? 'TWO-TAILED' : 'ONE-TAILED'})`);

        const plotX = leftX + 10;
        const plotY = topY + 36;
        const plotW = totalW - 20;
        const plotH = cardH - 46;
        const pBaseY = plotY + plotH - 24;
        const pCx = plotX + plotW / 2;

        const delta = hypoEffectSize * 0.9;
        const se = 1.0 / Math.sqrt(hypoSampleSize / 25);
        const zCrit = getHypoZCrit(hypoAlpha, hypoTails);
        const zScale = plotW * 0.115;

        withPlotBoxClip(ctx, plotX, plotY, plotW, plotH, 6, () => {
          // 1. Shading Rejection Region(s) Alpha in Red Hatch/Bars
          ctx.fillStyle = 'rgba(239, 68, 68, 0.42)';

          // Right Rejection Tail [ +zCrit * se, +4.0 ]
          for (let t = zCrit * se; t <= 4.0; t += 0.04) {
            const pdf0 = (1 / (se * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow(t / se, 2));
            const bx = pCx + t * zScale;
            const bh = pdf0 * (plotH * 0.65);
            ctx.fillRect(bx, pBaseY - bh, 2.5, bh);
          }

          // Left Rejection Tail [ -4.0, -zCrit * se ] (Only when Two-Tailed)
          if (hypoTails === 'two') {
            for (let t = -4.0; t <= -zCrit * se; t += 0.04) {
              const pdf0 = (1 / (se * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow(t / se, 2));
              const bx = pCx + t * zScale;
              const bh = pdf0 * (plotH * 0.65);
              ctx.fillRect(bx, pBaseY - bh, 2.5, bh);
            }
          }

          // 2. Shading Statistical Power (1 - Beta) Region under H1 in Emerald Green
          ctx.fillStyle = 'rgba(52, 211, 153, 0.38)';
          for (let t = zCrit * se; t <= 4.0; t += 0.04) {
            const pdf1 = (1 / (se * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - delta) / se, 2));
            const bx = pCx + t * zScale;
            const bh = pdf1 * (plotH * 0.65);
            ctx.fillRect(bx, pBaseY - bh, 2.5, bh);
          }
          if (hypoTails === 'two') {
            for (let t = -4.0; t <= -zCrit * se; t += 0.04) {
              const pdf1 = (1 / (se * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - delta) / se, 2));
              const bx = pCx + t * zScale;
              const bh = pdf1 * (plotH * 0.65);
              ctx.fillRect(bx, pBaseY - bh, 2.5, bh);
            }
          }

          // 3. Draw H0 Null Curve N(0, se)
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          for (let i = 0; i <= 80; i++) {
            const t = -4.0 + (i / 80) * 8.0;
            const pdf0 = (1 / (se * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow(t / se, 2));
            const px = pCx + t * zScale;
            const py = pBaseY - pdf0 * (plotH * 0.65);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();

          // 4. Draw H1 Alternative Curve N(delta, se)
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          for (let i = 0; i <= 80; i++) {
            const t = -4.0 + (i / 80) * 8.0;
            const pdf1 = (1 / (se * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - delta) / se, 2));
            const px = pCx + t * zScale;
            const py = pBaseY - pdf1 * (plotH * 0.65);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();

          // 5. Critical Boundary Vertical Lines (Red Dashed)
          // Right Critical Boundary +zCrit
          const rightCritX = pCx + zCrit * se * zScale;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(rightCritX, plotY + 16);
          ctx.lineTo(rightCritX, pBaseY);
          ctx.stroke();

          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`+Z_crit = +${zCrit.toFixed(2)}`, rightCritX + 4, plotY + 28);

          // Left Critical Boundary -zCrit (if Two-Tailed)
          if (hypoTails === 'two') {
            const leftCritX = pCx - zCrit * se * zScale;
            ctx.beginPath();
            ctx.moveTo(leftCritX, plotY + 16);
            ctx.lineTo(leftCritX, pBaseY);
            ctx.stroke();

            ctx.fillText(`-Z_crit = -${zCrit.toFixed(2)}`, leftCritX - 85, plotY + 28);
          }
          ctx.setLineDash([]);

          // 6. Observed Test Statistic Line Z_calc (Yellow Gold)
          const zx = pCx + hypoObservedZ * se * zScale;
          const isSignificant = hypoTails === 'two' ? Math.abs(hypoObservedZ) >= zCrit : hypoObservedZ >= zCrit;

          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(zx, plotY + 8);
          ctx.lineTo(zx, pBaseY);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Movable Handle on Observed Z
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(zx, pBaseY - 8, 6, 0, 2 * Math.PI);
          ctx.fill();

          // High-contrast Pill Badge for Observed Z
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = isSignificant ? '#22c55e' : '#fbbf24';
          ctx.lineWidth = 1.5;
          const badgeText = `Observed Z = ${hypoObservedZ > 0 ? '+' : ''}${hypoObservedZ.toFixed(2)} [${isSignificant ? 'REJECT H₀ (p < α)' : 'FAIL TO REJECT'}]`;
          ctx.font = 'bold 10px monospace';
          const badgeW = ctx.measureText(badgeText).width + 16;
          ctx.fillRect(zx - badgeW / 2, plotY + 8, badgeW, 20);
          ctx.strokeRect(zx - badgeW / 2, plotY + 8, badgeW, 20);

          ctx.fillStyle = isSignificant ? '#22c55e' : '#fbbf24';
          ctx.fillText(badgeText, zx - badgeW / 2 + 8, plotY + 22);

          // Legend Labels
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('H₀: Null Distribution (μ = 0)', pCx - 2.8 * zScale, plotY + plotH - 10);
          ctx.fillStyle = '#c084fc';
          ctx.fillText(`H₁: Alternative Distribution (μ = ${hypoEffectSize})`, pCx + 0.8 * zScale, plotY + plotH - 10);
        });
      }

      // ────────────────────────────────────────────────────────────────────────
      // 3. MARKOV CHAINS & STATIONARY TRANSITIONS
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'markov_chains') {
        if (isSimulating && localFrame % Math.max(1, Math.round(16 / simSpeed)) === 0) {
          performStep();
        }

        const marginX = 14;
        const marginY = 14;
        const gap = 12;
        const totalW = Math.max(680, w - 2 * marginX);
        const leftW = Math.floor((totalW - gap) * 0.58);
        const rightW = totalW - gap - leftW;
        const cardH = Math.max(480, h - 2 * marginY - 10);
        const leftX = cx - totalW / 2;
        const leftY = cy - cardH / 2 + 6;
        const rightX = leftX + leftW + gap;
        const rightY = leftY;

        // 1. Left Diagram Card: Directed Graph with Flowing Probability Tokens
        drawDiagramCard(ctx, leftX, leftY, leftW, cardH, theme, '🔄 DIRECTED MARKOV TRANSITIONS');

        const graphPlotX = leftX + 10;
        const graphPlotY = leftY + 36;
        const graphPlotW = leftW - 20;
        const graphPlotH = cardH - 46;

        const nodeR = 30;
        const nCenterX = graphPlotX + graphPlotW / 2;
        const nCenterY = graphPlotY + graphPlotH / 2 + 10;
        const nRadius = Math.min(graphPlotW, graphPlotH) * 0.36;

        const nodes = [
          { name: 'S₁ (Bull)', angle: -Math.PI / 2, color: '#38bdf8', pi: mcStateDist[0] },
          { name: 'S₂ (Bear)', angle: Math.PI / 6, color: '#f59e0b', pi: mcStateDist[1] },
          { name: 'S₃ (Stagnant)', angle: (5 * Math.PI) / 6, color: '#a855f7', pi: mcStateDist[2] }
        ].map(n => ({
          ...n,
          x: nCenterX + Math.cos(n.angle) * nRadius,
          y: nCenterY + Math.sin(n.angle) * nRadius
        }));

        withPlotBoxClip(ctx, graphPlotX, graphPlotY, graphPlotW, graphPlotH, 6, () => {
          // Directed Curved Arcs between nodes
          nodes.forEach((n1, i) => {
            nodes.forEach((n2, j) => {
              if (i !== j) {
                const midX = (n1.x + n2.x) / 2 + (nCenterY - (n1.y + n2.y) / 2) * 0.35;
                const midY = (n1.y + n2.y) / 2 + ((n1.x + n2.x) / 2 - nCenterX) * 0.35;

                ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.quadraticCurveTo(midX, midY, n2.x, n2.y);
                ctx.stroke();

                // Arrow tip at target node perimeter
                const angle = Math.atan2(n2.y - midY, n2.x - midX);
                const tipX = n2.x - Math.cos(angle) * (nodeR + 2);
                const tipY = n2.y - Math.sin(angle) * (nodeR + 2);

                ctx.fillStyle = n1.color;
                ctx.beginPath();
                ctx.arc(tipX, tipY, 3.5, 0, 2 * Math.PI);
                ctx.fill();
              }
            });

            // Self-loop circle
            const loopX = n1.x + Math.cos(n1.angle) * (nodeR + 14);
            const loopY = n1.y + Math.sin(n1.angle) * (nodeR + 14);
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(loopX, loopY, 12, 0, 2 * Math.PI);
            ctx.stroke();
          });

          // Animated Probability Flow Particles
          stateRef.current.mcParticles.forEach(p => {
            p.progress += p.speed * Math.min(2.5, simSpeed);
            if (p.progress >= 1) p.progress = 0;
            const fromN = nodes[p.from];
            const toN = nodes[p.to];

            let px: number, py: number;
            if (p.from === p.to) {
              const angle = fromN.angle + p.progress * 2 * Math.PI;
              px = fromN.x + Math.cos(fromN.angle) * (nodeR + 14) + Math.cos(angle) * 12;
              py = fromN.y + Math.sin(fromN.angle) * (nodeR + 14) + Math.sin(angle) * 12;
            } else {
              const midX = (fromN.x + toN.x) / 2 + (nCenterY - (fromN.y + toN.y) / 2) * 0.35;
              const midY = (fromN.y + toN.y) / 2 + ((fromN.x + toN.x) / 2 - nCenterX) * 0.35;
              const t = p.progress;
              px = (1 - t) * (1 - t) * fromN.x + 2 * (1 - t) * t * midX + t * t * toN.x;
              py = (1 - t) * (1 - t) * fromN.y + 2 * (1 - t) * t * midY + t * t * toN.y;
            }

            ctx.fillStyle = fromN.color;
            ctx.shadowColor = fromN.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;
          });

          // State Nodes with Concentric Rings
          nodes.forEach(n => {
            // Outer Halo
            ctx.fillStyle = theme.cardBg;
            ctx.strokeStyle = n.color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(n.x, n.y, nodeR, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // Inner fill
            ctx.fillStyle = `${n.color}22`;
            ctx.beginPath();
            ctx.arc(n.x, n.y, nodeR - 3, 0, 2 * Math.PI);
            ctx.fill();

            // Labels
            ctx.fillStyle = n.color;
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(n.name, n.x, n.y - 4);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px monospace';
            ctx.fillText(`π=${(n.pi * 100).toFixed(1)}%`, n.x, n.y + 10);
          });
          ctx.textAlign = 'left';
        });

        // 2. Right Diagram Card: Transition Matrix & Stationary Distribution Gauge
        drawDiagramCard(ctx, rightX, rightY, rightW, cardH, theme, '⚡ TRANSITION MATRIX & STATIONARY DYNAMICS');

        // Transition Matrix Box
        const matY = rightY + 36;
        const matH = 100;
        ctx.fillStyle = theme.plotBoxBg;
        ctx.strokeStyle = theme.plotBoxBorder;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(rightX + 10, matY, rightW - 20, matH, 8);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('Transition Matrix P (Row Stochastic):', rightX + 18, matY + 18);

        const P = [
          [(1 - mcP12).toFixed(2), mcP12.toFixed(2), '0.00'],
          ['0.00', (1 - mcP23).toFixed(2), mcP23.toFixed(2)],
          [mcP31.toFixed(2), '0.00', (1 - mcP31).toFixed(2)]
        ];

        const cellW = (rightW - 48) / 3;
        P.forEach((row, r) => {
          row.forEach((val, c) => {
            const cxBox = rightX + 24 + c * cellW;
            const cyBox = matY + 28 + r * 22;
            ctx.fillStyle = parseFloat(val) > 0 ? '#38bdf8' : theme.textMuted;
            ctx.font = '9px monospace';
            ctx.fillText(`P${r+1}${c+1}=${val}`, cxBox, cyBox + 12);
          });
        });

        // Stationary Distribution Bar Gauge
        const gaugeY = matY + matH + 12;
        const gaugeH = cardH - (gaugeY - rightY) - 12;
        ctx.fillStyle = theme.plotBoxBg;
        ctx.strokeStyle = theme.plotBoxBorder;
        ctx.beginPath();
        ctx.roundRect(rightX + 10, gaugeY, rightW - 20, gaugeH, 8);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('Stationary Vector π* (π* P = π*):', rightX + 18, gaugeY + 20);

        nodes.forEach((n, idx) => {
          const barY = gaugeY + 34 + idx * 28;
          ctx.fillStyle = n.color;
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`${n.name.split(' ')[0]}:`, rightX + 18, barY + 10);

          // Background track
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.fillRect(rightX + 64, barY, rightW - 90, 12);

          // Filled bar
          ctx.fillStyle = n.color;
          ctx.fillRect(rightX + 64, barY, (rightW - 90) * n.pi, 12);

          ctx.fillStyle = '#ffffff';
          ctx.font = '8px monospace';
          ctx.fillText(`${(n.pi * 100).toFixed(1)}%`, rightX + 70 + (rightW - 90) * n.pi, barY + 9);
        });

        ctx.fillStyle = theme.textMuted;
        ctx.font = '9px monospace';
        ctx.fillText(`Step t = ${mcStepCount} | Convergence: 99.8%`, rightX + 18, gaugeY + gaugeH - 12);
      }

      // ────────────────────────────────────────────────────────────────────────
      // 4. BAYESIAN BETA-BINOMIAL CONJUGATE ENGINE
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'bayesian_beta_binomial') {
        if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(15 / simSpeed)) === 0) {
          const isH = Math.random() < bayesTrueTheta;
          if (isH) setBayesFlipsHeads(prev => prev + 1);
          else setBayesFlipsTails(prev => prev + 1);
          if (bayesFlipsHeads + bayesFlipsTails > 120) {
            setBayesFlipsHeads(14);
            setBayesFlipsTails(8);
          }
        }
        const marginX = 14;
        const marginY = 14;
        const gap = 12;
        const totalW = Math.max(680, w - 2 * marginX);
        const leftW = Math.floor((totalW - gap) * 0.42);
        const rightW = totalW - gap - leftW;
        const cardH = Math.max(480, h - 2 * marginY - 10);
        const leftX = cx - totalW / 2;
        const leftY = cy - cardH / 2 + 6;
        const rightX = leftX + leftW + gap;
        const rightY = leftY;

        const a0 = bayesPriorAlpha;
        const b0 = bayesPriorBeta;
        const k = bayesFlipsHeads;
        const n = bayesFlipsHeads + bayesFlipsTails;
        const postA = a0 + k;
        const postB = b0 + (n - k);

        const priorMean = a0 / (a0 + b0);
        const mleMean = n > 0 ? k / n : 0.5;
        const postMean = postA / (postA + postB);

        // 1. Left Diagram Card: Coin Evidence Stream & Bin Counters
        drawDiagramCard(ctx, leftX, leftY, leftW, cardH, theme, '🪙 COIN EVIDENCE STREAM');

        const coinPlotX = leftX + 10;
        const coinPlotY = leftY + 36;
        const coinPlotW = leftW - 20;
        const coinPlotH = cardH - 46;

        ctx.fillStyle = theme.plotBoxBg;
        ctx.fillRect(coinPlotX, coinPlotY, coinPlotW, coinPlotH);
        ctx.strokeStyle = theme.plotBoxBorder;
        ctx.strokeRect(coinPlotX, coinPlotY, coinPlotW, coinPlotH);

        withPlotBoxClip(ctx, coinPlotX, coinPlotY, coinPlotW, coinPlotH, 6, () => {
          // Bin 1: Heads (Gold)
          const binW = (coinPlotW - 30) / 2;
          const headsBinX = coinPlotX + 10;
          const tailsBinX = coinPlotX + 20 + binW;
          const binY = coinPlotY + 20;
          const binH = coinPlotH - 70;

          // Heads Bin
          ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.fillRect(headsBinX, binY, binW, binH);
          ctx.strokeRect(headsBinX, binY, binW, binH);

          // Tails Bin
          ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
          ctx.strokeStyle = '#94a3b8';
          ctx.fillRect(tailsBinX, binY, binW, binH);
          ctx.strokeRect(tailsBinX, binY, binW, binH);

          // Bin Titles
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#f59e0b';
          ctx.fillText(`HEADS: ${k}`, headsBinX + 10, binY + 22);

          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`TAILS: ${n - k}`, tailsBinX + 10, binY + 22);

          // Draw stacked coin tokens in bins
          const maxVisibleCoins = Math.min(25, Math.max(k, n - k, 1));
          const coinR = 7;

          // Stacked Heads
          const hCount = Math.min(k, 30);
          for (let i = 0; i < hCount; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const cx_ = headsBinX + 16 + col * 18;
            const cy_ = binY + binH - 16 - row * 16;
            ctx.fillStyle = '#fbbf24';
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx_, cy_, coinR, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#78350f';
            ctx.font = 'bold 7px sans-serif';
            ctx.fillText('H', cx_ - 3, cy_ + 3);
          }

          // Stacked Tails
          const tCount = Math.min(n - k, 30);
          for (let i = 0; i < tCount; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const cx_ = tailsBinX + 16 + col * 18;
            const cy_ = binY + binH - 16 - row * 16;
            ctx.fillStyle = '#cbd5e1';
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx_, cy_, coinR, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#334155';
            ctx.font = 'bold 7px sans-serif';
            ctx.fillText('T', cx_ - 2.5, cy_ + 3);
          }

          // Bottom Telemetry
          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(`Total Flips: ${n}`, coinPlotX + 10, coinPlotY + coinPlotH - 30);
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(`Sample MLE θ̂ = ${mleMean.toFixed(3)}`, coinPlotX + 10, coinPlotY + coinPlotH - 14);
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(`True Bias θ* = ${bayesTrueTheta.toFixed(2)}`, coinPlotX + 10, coinPlotY + coinPlotH + 2);
        });

        // 2. Right Diagram Card: Conjugate Beta-Binomial Posterior Triad
        drawDiagramCard(ctx, rightX, rightY, rightW, cardH, theme, '🎯 CONJUGATE BETA-BINOMIAL POSTERIOR TRIAD');

        const betaPlotX = rightX + 10;
        const betaPlotY = rightY + 36;
        const betaPlotW = rightW - 20;
        const betaPlotH = cardH - 46;
        const bBaseY = betaPlotY + betaPlotH - 30;

        const betaPdf = (theta: number, a: number, b: number): number => {
          if (theta <= 0.001 || theta >= 0.999) return 0;
          const logB = (a - 1) * Math.log(theta) + (b - 1) * Math.log(1 - theta);
          return Math.exp(logB);
        };

        const priorPeak = Math.max(1e-6, betaPdf(priorMean, a0, b0));
        const postPeak = Math.max(1e-6, betaPdf(postMean, postA, postB));
        const likePeak = n > 0 ? Math.max(1e-6, betaPdf(mleMean, k + 1, n - k + 1)) : 1e-6;

        withPlotBoxClip(ctx, betaPlotX, betaPlotY, betaPlotW, betaPlotH, 6, () => {
          // Axis baseline
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(betaPlotX, bBaseY);
          ctx.lineTo(betaPlotX + betaPlotW, bBaseY);
          ctx.stroke();

          // 1. Prior Distribution Beta(a0, b0) [Amber Dashed]
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          for (let i = 0; i <= 80; i++) {
            const t = 0.01 + (i / 80) * 0.98;
            const pdf = betaPdf(t, a0, b0);
            const px = betaPlotX + t * betaPlotW;
            const py = bBaseY - (pdf / priorPeak) * (betaPlotH * 0.60);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();

          // 2. Likelihood Function (Binomial Normalized) [Cyan Dashed]
          if (n > 0) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            for (let i = 0; i <= 80; i++) {
              const t = 0.01 + (i / 80) * 0.98;
              const likePdf = betaPdf(t, k + 1, n - k + 1);
              const px = betaPlotX + t * betaPlotW;
              const py = bBaseY - (likePdf / likePeak) * (betaPlotH * 0.60);
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
          }
          ctx.setLineDash([]);

          // 3. Posterior Distribution Beta(a0+k, b0+n-k) [Emerald Solid with Translucent Fill]
          ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(betaPlotX, bBaseY);
          for (let i = 0; i <= 80; i++) {
            const t = 0.01 + (i / 80) * 0.98;
            const pdf = betaPdf(t, postA, postB);
            const px = betaPlotX + t * betaPlotW;
            const py = bBaseY - (pdf / postPeak) * (betaPlotH * 0.72);
            ctx.lineTo(px, py);
          }
          ctx.lineTo(betaPlotX + betaPlotW, bBaseY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Vertical Threshold Boundary Markers
          // True Theta Line (Gold Dashed)
          const trueX = betaPlotX + bayesTrueTheta * betaPlotW;
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(trueX, betaPlotY + 16);
          ctx.lineTo(trueX, bBaseY);
          ctx.stroke();

          // Prior Mean Line
          const priorX = betaPlotX + priorMean * betaPlotW;
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(priorX, betaPlotY + 24);
          ctx.lineTo(priorX, bBaseY);
          ctx.stroke();

          // Posterior Mean Line
          const postX = betaPlotX + postMean * betaPlotW;
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(postX, betaPlotY + 12);
          ctx.lineTo(postX, bBaseY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Text Badges
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#f59e0b';
          ctx.fillText(`Prior: Beta(${a0},${b0}) [μ=${priorMean.toFixed(2)}]`, priorX - 45, betaPlotY + 32);

          ctx.fillStyle = '#10b981';
          ctx.fillText(`Posterior: Beta(${postA},${postB}) [μ=${postMean.toFixed(3)}]`, postX - 55, betaPlotY + 14);

          ctx.fillStyle = '#fbbf24';
          ctx.fillText(`True θ* = ${bayesTrueTheta.toFixed(2)}`, trueX + 4, betaPlotY + 48);

          // Legend
          ctx.fillStyle = '#f59e0b';
          ctx.fillText('━ ━ Prior', betaPlotX + 16, betaPlotY + betaPlotH - 10);
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('━ ━ Likelihood', betaPlotX + 90, betaPlotY + betaPlotH - 10);
          ctx.fillStyle = '#10b981';
          ctx.fillText('━━ Posterior (Conjugate Update)', betaPlotX + 200, betaPlotY + betaPlotH - 10);
        });
      }

      // ────────────────────────────────────────────────────────────────────────
      // 5. 2D LINEAR PROGRAMMING & SIMPLEX FEASIBLE POLYGON
      // ────────────────────────────────────────────────────────────────────────
      // ────────────────────────────────────────────────────────────────────────
      // 5. 2D LINEAR PROGRAMMING & SIMPLEX FEASIBLE POLYTOPE
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'linear_programming_simplex') {
        if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(6 / simSpeed)) === 0) {
          setLpC1(parseFloat((3.0 + 1.8 * Math.sin(stateRef.current.timeT * 0.4)).toFixed(1)));
          setLpC2(parseFloat((4.0 + 1.8 * Math.cos(stateRef.current.timeT * 0.4)).toFixed(1)));
        }

        const marginX = 14;
        const marginY = 14;
        const gap = 12;
        const totalW = Math.max(680, w - 2 * marginX);
        const cardH = Math.max(480, h - 2 * marginY - 10);
        const cardW = (totalW - gap) / 2;
        const leftX = cx - totalW / 2;
        const topY = cy - cardH / 2 + 6;
        const rightX = leftX + cardW + gap;

        // LEFT CARD: Feasible Polytope & Objective Isoline
        drawDiagramCard(ctx, leftX, topY, cardW, cardH, theme, '📐 SIMPLEX CONVEX FEASIBLE POLYTOPE Ax ≤ b');

        const plotX = leftX + 10;
        const plotY = topY + 36;
        const plotW = cardW - 20;
        const plotH = cardH - 46;
        const pCx = plotX + 40;
        const pCy = plotY + plotH - 40;
        const pScale = Math.min(plotW - 60, plotH - 60) / 6;

        const b1 = lpB1;
        const b2 = lpB2;

        const v0 = { x: 0, y: 0, name: 'A(0,0)' };
        const v1 = { x: b1 / 2, y: 0, name: `B(${(b1 / 2).toFixed(1)}, 0)` };
        const v2x = Math.max(0, (2 * b1 - b2) / 3);
        const v2y = Math.max(0, (2 * b2 - b1) / 3);
        const v2 = { x: v2x, y: v2y, name: `C(${v2x.toFixed(1)}, ${v2y.toFixed(1)})` };
        const v3 = { x: 0, y: b2 / 2, name: `D(0, ${(b2 / 2).toFixed(1)})` };

        const toCanvas = (vx: number, vy: number) => ({
          x: pCx + vx * pScale,
          y: pCy - vy * pScale
        });

        const p0 = toCanvas(v0.x, v0.y);
        const p1 = toCanvas(v1.x, v1.y);
        const p2 = toCanvas(v2.x, v2.y);
        const p3 = toCanvas(v3.x, v3.y);

        const corners = [
          { ...v0, pt: p0, z: 0 },
          { ...v1, pt: p1, z: lpC1 * v1.x },
          { ...v2, pt: p2, z: lpC1 * v2.x + lpC2 * v2.y },
          { ...v3, pt: p3, z: lpC2 * v3.y }
        ];

        let bestCorner = corners[0];
        corners.forEach(c => {
          if (lpOptType === 'max' ? c.z >= bestCorner.z : c.z <= bestCorner.z) {
            bestCorner = c;
          }
        });

        withPlotBoxClip(ctx, plotX, plotY, plotW, plotH, 6, () => {
          // Grid lines
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
          ctx.lineWidth = 1;
          for (let gx = 0; gx <= 6; gx++) {
            const px = pCx + gx * pScale;
            ctx.beginPath(); ctx.moveTo(px, plotY); ctx.lineTo(px, plotY + plotH); ctx.stroke();
            ctx.font = '8px monospace';
            ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
            ctx.fillText(`${gx}`, px - 3, pCy + 14);
          }
          for (let gy = 0; gy <= 6; gy++) {
            const py = pCy - gy * pScale;
            ctx.beginPath(); ctx.moveTo(plotX, py); ctx.lineTo(plotX + plotW, py); ctx.stroke();
            if (gy > 0) ctx.fillText(`${gy}`, pCx - 14, py + 3);
          }

          // Coordinate Axes
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(plotX, pCy); ctx.lineTo(plotX + plotW, pCy);
          ctx.moveTo(pCx, plotY); ctx.lineTo(pCx, plotY + plotH);
          ctx.stroke();

          // 1. Constraint Lines Extended
          // 2x1 + x2 = b1
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const cl1_p0 = toCanvas(0, b1);
          const cl1_p1 = toCanvas(b1 / 2, 0);
          ctx.moveTo(cl1_p0.x, cl1_p0.y); ctx.lineTo(cl1_p1.x, cl1_p1.y);
          ctx.stroke();

          // x1 + 2x2 = b2
          ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const cl2_p0 = toCanvas(0, b2 / 2);
          const cl2_p1 = toCanvas(b2, 0);
          ctx.moveTo(cl2_p0.x, cl2_p0.y); ctx.lineTo(cl2_p1.x, cl2_p1.y);
          ctx.stroke();

          // 2. Feasible Polytope (Filled Translucent Emerald Polygon)
          ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 3. Simplex Traversal Pivot Edges
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // 4. Objective Isoline Passing Through Optimal Vertex
          const objSlope = -lpC1 / (lpC2 || 1);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(bestCorner.pt.x - 120, bestCorner.pt.y - 120 * objSlope);
          ctx.lineTo(bestCorner.pt.x + 120, bestCorner.pt.y + 120 * objSlope);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // 5. Objective Gradient Vector c
          const gradLen = 45;
          const gradNorm = Math.sqrt(lpC1 * lpC1 + lpC2 * lpC2) || 1;
          const gVecX = (lpC1 / gradNorm) * gradLen;
          const gVecY = -(lpC2 / gradNorm) * gradLen;
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p0.x + gVecX, p0.y + gVecY);
          ctx.stroke();

          ctx.fillStyle = '#ec4899';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`∇Z=[${lpC1}, ${lpC2}]`, p0.x + gVecX + 6, p0.y + gVecY);

          // 6. Corner Point Badges
          corners.forEach(c => {
            const isOpt = c === bestCorner;
            ctx.fillStyle = isOpt ? '#10b981' : '#38bdf8';
            ctx.shadowColor = isOpt ? '#10b981' : '#38bdf8';
            ctx.shadowBlur = isOpt ? 10 : 4;
            ctx.beginPath();
            ctx.arc(c.pt.x, c.pt.y, isOpt ? 7 : 4.5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.font = isOpt ? 'bold 10px monospace' : '9px monospace';
            ctx.fillStyle = isOpt ? '#34d399' : '#cbd5e1';
            ctx.fillText(`${c.name} [Z=${c.z.toFixed(1)}]`, c.pt.x + 8, c.pt.y - (isOpt ? 8 : 4));
          });
        });

        // RIGHT CARD: Simplex Tableau & Mathematical Decomposition
        drawDiagramCard(ctx, rightX, topY, cardW, cardH, theme, '📋 SIMPLEX TABLEAU & OPTIMAL BASIS STATUS');

        const rightPlotX = rightX + 10;
        const rightPlotY = topY + 36;
        const rightPlotW = cardW - 20;
        const rightPlotH = cardH - 46;

        withPlotBoxClip(ctx, rightPlotX, rightPlotY, rightPlotW, rightPlotH, 6, () => {
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('OPTIMAL SOLUTION & BASIS:', rightPlotX + 14, rightPlotY + 22);

          // Solution Highlight Card
          ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(rightPlotX + 12, rightPlotY + 32, rightPlotW - 24, 64, 6);
          ctx.fill(); ctx.stroke();

          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = '#34d399';
          ctx.fillText(`Optimal Objective Z* = ${bestCorner.z.toFixed(2)} (${lpOptType.toUpperCase()})`, rightPlotX + 22, rightPlotY + 54);
          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#cbd5e1';
          ctx.fillText(`Optimal Point x* = (${bestCorner.x.toFixed(2)}, ${bestCorner.y.toFixed(2)})`, rightPlotX + 22, rightPlotY + 76);

          // Simplex Tableau Matrix Box
          const tabY = rightPlotY + 110;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.strokeStyle = theme.plotBoxBorder;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(rightPlotX + 12, tabY, rightPlotW - 24, 130, 6);
          ctx.fill(); ctx.stroke();

          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#fbbf24';
          ctx.fillText('STANDARD FORM SIMPLEX TABLEAU:', rightPlotX + 20, tabY + 18);

          // Table Header
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('Basic |   x₁    x₂    s₁    s₂  |   RHS', rightPlotX + 20, tabY + 36);
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
          ctx.beginPath();
          ctx.moveTo(rightPlotX + 20, tabY + 42); ctx.lineTo(rightPlotX + rightPlotW - 32, tabY + 42); ctx.stroke();

          // Row 1
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(`  s₁  |  2.0   1.0   1.0   0.0  |  ${b1.toFixed(1)}`, rightPlotX + 20, tabY + 58);
          // Row 2
          ctx.fillText(`  s₂  |  1.0   2.0   0.0   1.0  |  ${b2.toFixed(1)}`, rightPlotX + 20, tabY + 74);
          // Z Row
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(`  -Z  | -${lpC1.toFixed(1)}  -${lpC2.toFixed(1)}   0.0   0.0  |  0.0`, rightPlotX + 20, tabY + 92);

          // Slack Values
          const s1Val = Math.max(0, b1 - 2 * bestCorner.x - bestCorner.y);
          const s2Val = Math.max(0, b2 - bestCorner.x - 2 * bestCorner.y);
          ctx.fillStyle = '#a855f7';
          ctx.fillText(`Slack Variables at x*: s₁ = ${s1Val.toFixed(2)}, s₂ = ${s2Val.toFixed(2)}`, rightPlotX + 20, tabY + 114);

          // Pivoting explanation
          ctx.fillStyle = theme.textMuted;
          ctx.font = '8px monospace';
          ctx.fillText('• Vertices satisfy Ax + Is = b, x ≥ 0, s ≥ 0', rightPlotX + 14, rightPlotY + rightPlotH - 24);
          ctx.fillText('• Simplex visits extreme points along edges of steepest ascent', rightPlotX + 14, rightPlotY + rightPlotH - 10);
        });
      }

      // ────────────────────────────────────────────────────────────────────────
      // 6. PRINCIPAL COMPONENT ANALYSIS (PCA)
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'pca_projection') {
        if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(5 / simSpeed)) === 0) {
          const nextRho = 0.85 * Math.sin(stateRef.current.timeT * 0.4);
          setPcaCorrelation(parseFloat(nextRho.toFixed(2)));
        }

        const marginX = 14;
        const marginY = 14;
        const gap = 12;
        const totalW = Math.max(680, w - 2 * marginX);
        const cardH = Math.max(480, h - 2 * marginY - 10);
        const cardW = (totalW - gap) / 2;
        const leftX = cx - totalW / 2;
        const topY = cy - cardH / 2 + 6;
        const rightX = leftX + cardW + gap;

        // LEFT CARD: 2D Scatter & Principal Components
        drawDiagramCard(ctx, leftX, topY, cardW, cardH, theme, '🌌 2D PCA & MAXIMUM VARIANCE PROJECTION');

        const plotX = leftX + 10;
        const plotY = topY + 36;
        const plotW = cardW - 20;
        const plotH = cardH - 46;
        const pCx = plotX + plotW / 2;
        const pCy = plotY + plotH / 2;
        const pScale = Math.min(plotW, plotH) * 0.42;

        const pts = stateRef.current.pcaPoints;
        const angle = Math.atan2(pcaCorrelation * pcaVarY, pcaVarX);
        const u1 = { x: Math.cos(angle), y: Math.sin(angle) };
        const u2 = { x: -Math.sin(angle), y: Math.cos(angle) };

        // Eigenvalues
        const eig1 = pcaVarX * pcaVarX + Math.abs(pcaCorrelation) * pcaVarY * pcaVarY;
        const eig2 = Math.max(0.04, (1 - Math.abs(pcaCorrelation)) * pcaVarY * pcaVarY);
        const totalVar = eig1 + eig2;
        const evr1 = (eig1 / totalVar) * 100;
        const evr2 = (eig2 / totalVar) * 100;

        withPlotBoxClip(ctx, plotX, plotY, plotW, plotH, 6, () => {
          // Coordinate Axes
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(plotX, pCy); ctx.lineTo(plotX + plotW, pCy);
          ctx.moveTo(pCx, plotY); ctx.lineTo(pCx, plotY + plotH);
          ctx.stroke();

          // 1. Covariance Ellipse
          ctx.save();
          ctx.translate(pCx, pCy);
          ctx.rotate(-angle);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, Math.sqrt(eig1) * pScale * 1.5, Math.sqrt(eig2) * pScale * 1.5, 0, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.restore();

          // 2. Data Points & Orthogonal Residual Projections
          pts.forEach(p => {
            const px = pCx + p.x * pScale;
            const py = pCy - p.y * pScale;

            const projLen = p.x * u1.x + p.y * u1.y;
            const projX = pCx + projLen * u1.x * pScale;
            const projY = pCy - projLen * u1.y * pScale;

            // Orthogonal Projection Drop Line
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.22)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(projX, projY);
            ctx.stroke();

            // Raw Scatter Dot
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
            ctx.fill();

            // Projected 1D Dot on PC1 Axis
            ctx.fillStyle = 'rgba(52, 211, 153, 0.6)';
            ctx.beginPath();
            ctx.arc(projX, projY, 2.5, 0, 2 * Math.PI);
            ctx.fill();
          });

          // 3. First Principal Component PC1 (Cyan Solid with Glow)
          const axisLen = pScale * 1.8;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(pCx - u1.x * axisLen, pCy + u1.y * axisLen);
          ctx.lineTo(pCx + u1.x * axisLen, pCy - u1.y * axisLen);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // 4. Second Principal Component PC2 (Purple Dashed)
          const axis2Len = pScale * 1.2;
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2.2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(pCx - u2.x * axis2Len, pCy + u2.y * axis2Len);
          ctx.lineTo(pCx + u2.x * axis2Len, pCy - u2.y * axis2Len);
          ctx.stroke();
          ctx.setLineDash([]);

          // Axis Labels
          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(`PC₁ (${evr1.toFixed(1)}% Var)`, pCx + u1.x * axisLen + 8, pCy - u1.y * axisLen);

          ctx.fillStyle = '#c084fc';
          ctx.fillText(`PC₂ (${evr2.toFixed(1)}% Var)`, pCx + u2.x * axis2Len + 8, pCy - u2.y * axis2Len);
        });

        // RIGHT CARD: Scree Plot & Variance Breakdown
        drawDiagramCard(ctx, rightX, topY, cardW, cardH, theme, '📊 SCREE PLOT & EIGEN-DECOMPOSITION');

        const rPlotX = rightX + 10;
        const rPlotY = topY + 36;
        const rPlotW = cardW - 20;
        const rPlotH = cardH - 46;

        withPlotBoxClip(ctx, rPlotX, rPlotY, rPlotW, rPlotH, 6, () => {
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('EXPLAINED VARIANCE RATIO (SCREE PLOT):', rPlotX + 14, rPlotY + 22);

          // Bar Chart: PC1 vs PC2
          const barW = (rPlotW - 60) / 2;
          const maxBarH = 120;
          const barBaseY = rPlotY + 160;

          // Bar 1: PC1
          const b1H = (evr1 / 100) * maxBarH;
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.roundRect(rPlotX + 25, barBaseY - b1H, barW, b1H, [4, 4, 0, 0]);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`${evr1.toFixed(1)}%`, rPlotX + 25 + barW / 4, barBaseY - b1H - 8);
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('PC₁ (λ₁)', rPlotX + 25 + barW / 4, barBaseY + 16);

          // Bar 2: PC2
          const b2H = (evr2 / 100) * maxBarH;
          ctx.fillStyle = '#c084fc';
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.roundRect(rPlotX + 45 + barW, barBaseY - b2H, barW, b2H, [4, 4, 0, 0]);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = '#ffffff';
          ctx.fillText(`${evr2.toFixed(1)}%`, rPlotX + 45 + barW + barW / 4, barBaseY - b2H - 8);
          ctx.fillStyle = '#c084fc';
          ctx.fillText('PC₂ (λ₂)', rPlotX + 45 + barW + barW / 4, barBaseY + 16);

          // Covariance Matrix Box
          const covY = rPlotY + 195;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.strokeStyle = theme.plotBoxBorder;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(rPlotX + 12, covY, rPlotW - 24, 80, 6);
          ctx.fill(); ctx.stroke();

          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#fbbf24';
          ctx.fillText('SAMPLE COVARIANCE MATRIX Σ:', rPlotX + 20, covY + 18);

          ctx.fillStyle = '#cbd5e1';
          ctx.fillText(`[ ${(pcaVarX * pcaVarX).toFixed(2)}    ${(pcaCorrelation * pcaVarX * pcaVarY).toFixed(2)} ]`, rPlotX + 20, covY + 38);
          ctx.fillText(`[ ${(pcaCorrelation * pcaVarX * pcaVarY).toFixed(2)}    ${(pcaVarY * pcaVarY).toFixed(2)} ]`, rPlotX + 20, covY + 54);

          ctx.fillStyle = '#34d399';
          ctx.fillText(`λ₁ = ${eig1.toFixed(3)}, λ₂ = ${eig2.toFixed(3)} | Tr(Σ) = ${totalVar.toFixed(3)}`, rPlotX + 20, covY + 70);
        });
      }

      // ────────────────────────────────────────────────────────────────────────
      // 7. FIRST-ORDER OPTIMIZERS (SGD, Momentum, RMSprop, Adam)
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'first_order_optimizers') {
        if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(280 / simSpeed)) === 0) {
          reseedData();
        }

        const marginX = 14;
        const marginY = 14;
        const gap = 12;
        const totalW = Math.max(680, w - 2 * marginX);
        const leftW = Math.floor((totalW - gap) * 0.62);
        const rightW = totalW - gap - leftW;
        const cardH = Math.max(480, h - 2 * marginY - 10);
        const leftX = cx - totalW / 2;
        const leftY = cy - cardH / 2 + 6;
        const rightX = leftX + leftW + gap;
        const rightY = leftY;

        // 1. Left Diagram Card: 2D/3D Contour Loss Surface Race Track
        drawDiagramCard(ctx, leftX, leftY, leftW, cardH, theme, `🏎️ MULTI-OPTIMIZER RACE: ${optLossSurface.toUpperCase()}`);

        const trackPlotX = leftX + 10;
        const trackPlotY = leftY + 36;
        const trackPlotW = leftW - 20;
        const trackPlotH = cardH - 46;
        const trackCx = trackPlotX + trackPlotW / 2;
        const trackCy = trackPlotY + trackPlotH / 2;
        const trackScale = Math.min(trackPlotW, trackPlotH) * 0.36;

        withPlotBoxClip(ctx, trackPlotX, trackPlotY, trackPlotW, trackPlotH, 6, () => {
          // Shaded Loss Landscape Contours
          for (let r = 0.2; r <= 2.2; r += 0.25) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.1 + (2.2 - r) * 0.22})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            if (optLossSurface === 'saddle') {
              ctx.ellipse(trackCx, trackCy, r * trackScale * 1.3, r * trackScale * 0.7, 0, 0, 2 * Math.PI);
            } else if (optLossSurface === 'rosenbrock') {
              ctx.ellipse(trackCx + 0.2 * trackScale, trackCy - 0.2 * trackScale, r * trackScale * 1.2, r * trackScale * 0.5, 0.45, 0, 2 * Math.PI);
            } else {
              ctx.ellipse(trackCx, trackCy, r * trackScale, r * trackScale * 0.85, 0, 0, 2 * Math.PI);
            }
            ctx.stroke();
          }

          // Global Minimum Target Star
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(trackCx, trackCy, 7, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.fillStyle = '#34d399';
          ctx.fillText('★ Global Optimum θ*', trackCx + 12, trackCy - 6);
          ctx.shadowBlur = 0;

          // Simulation Step updates
          if (isSimulating && localFrame % Math.max(1, Math.round(2 / simSpeed)) === 0) {
            const lr = optLearningRate;
            const { sgdPos, momentumPos, rmspropPos, adamPos } = stateRef.current;

            // 1. SGD Step
            const gradSgd = lossFunction(sgdPos.x, sgdPos.y, optLossSurface);
            sgdPos.x -= lr * gradSgd.dx;
            sgdPos.y -= lr * gradSgd.dy;
            stateRef.current.optHistory.sgd.push({ x: sgdPos.x, y: sgdPos.y });

            // 2. Momentum Step
            const gradMom = lossFunction(momentumPos.x, momentumPos.y, optLossSurface);
            momentumPos.vx = optMomentumBeta * momentumPos.vx - lr * gradMom.dx;
            momentumPos.vy = optMomentumBeta * momentumPos.vy - lr * gradMom.dy;
            momentumPos.x += momentumPos.vx;
            momentumPos.y += momentumPos.vy;
            stateRef.current.optHistory.momentum.push({ x: momentumPos.x, y: momentumPos.y });

            // 3. RMSprop Step
            const gradRms = lossFunction(rmspropPos.x, rmspropPos.y, optLossSurface);
            rmspropPos.sx = 0.9 * rmspropPos.sx + 0.1 * gradRms.dx * gradRms.dx;
            rmspropPos.sy = 0.9 * rmspropPos.sy + 0.1 * gradRms.dy * gradRms.dy;
            rmspropPos.x -= (lr / (Math.sqrt(rmspropPos.sx) + 1e-6)) * gradRms.dx;
            rmspropPos.y -= (lr / (Math.sqrt(rmspropPos.sy) + 1e-6)) * gradRms.dy;
            stateRef.current.optHistory.rmsprop.push({ x: rmspropPos.x, y: rmspropPos.y });

            // 4. Adam Step
            adamPos.t += 1;
            const gradAdam = lossFunction(adamPos.x, adamPos.y, optLossSurface);
            adamPos.m.x = 0.9 * adamPos.m.x + 0.1 * gradAdam.dx;
            adamPos.m.y = 0.9 * adamPos.m.y + 0.1 * gradAdam.dy;
            adamPos.v.x = 0.999 * adamPos.v.x + 0.001 * gradAdam.dx * gradAdam.dx;
            adamPos.v.y = 0.999 * adamPos.v.y + 0.001 * gradAdam.dy * gradAdam.dy;

            const mHatX = adamPos.m.x / (1 - Math.pow(0.9, adamPos.t));
            const mHatY = adamPos.m.y / (1 - Math.pow(0.9, adamPos.t));
            const vHatX = adamPos.v.x / (1 - Math.pow(0.999, adamPos.t));
            const vHatY = adamPos.v.y / (1 - Math.pow(0.999, adamPos.t));

            adamPos.x -= (lr / (Math.sqrt(vHatX) + 1e-8)) * mHatX;
            adamPos.y -= (lr / (Math.sqrt(vHatY) + 1e-8)) * mHatY;
            stateRef.current.optHistory.adam.push({ x: adamPos.x, y: adamPos.y });
          }

          // Trajectory renderer
          const drawOptTrajectory = (hist: { x: number; y: number }[], color: string, name: string) => {
            if (hist.length < 2) return;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            hist.forEach((pt, i) => {
              const px = trackCx + pt.x * trackScale;
              const py = trackCy - pt.y * trackScale;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            });
            ctx.stroke();

            const last = hist[hist.length - 1];
            const px = trackCx + last.x * trackScale;
            const py = trackCy - last.y * trackScale;

            // Head dot with glow
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Head Badge
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.2;
            const textWidth = ctx.measureText(name).width || 35;
            ctx.fillRect(px + 8, py - 12, textWidth + 12, 16);
            ctx.strokeRect(px + 8, py - 12, textWidth + 12, 16);

            ctx.fillStyle = color;
            ctx.font = 'bold 9px monospace';
            ctx.fillText(name, px + 14, py);
          };

          drawOptTrajectory(stateRef.current.optHistory.sgd, '#ef4444', 'SGD');
          drawOptTrajectory(stateRef.current.optHistory.momentum, '#f59e0b', 'Momentum');
          drawOptTrajectory(stateRef.current.optHistory.rmsprop, '#06b6d4', 'RMSprop');
          drawOptTrajectory(stateRef.current.optHistory.adam, '#a855f7', 'Adam');
        });

        // 2. Right Diagram Card: Live Leaderboard & Formula Telemetry
        drawDiagramCard(ctx, rightX, rightY, rightW, cardH, theme, '🏆 OPTIMIZER LEADERBOARD & TELEMETRY');

        const sgdLoss = lossFunction(stateRef.current.sgdPos.x, stateRef.current.sgdPos.y, optLossSurface).val;
        const momLoss = lossFunction(stateRef.current.momentumPos.x, stateRef.current.momentumPos.y, optLossSurface).val;
        const rmsLoss = lossFunction(stateRef.current.rmspropPos.x, stateRef.current.rmspropPos.y, optLossSurface).val;
        const adamLoss = lossFunction(stateRef.current.adamPos.x, stateRef.current.adamPos.y, optLossSurface).val;

        const competitors = [
          { name: 'Adam', color: '#a855f7', loss: adamLoss, formula: 'θ -= η·m̂ / (√v̂ + ϵ)' },
          { name: 'RMSprop', color: '#06b6d4', loss: rmsLoss, formula: 'θ -= η·g / (√s + ϵ)' },
          { name: 'Momentum', color: '#f59e0b', loss: momLoss, formula: 'v = βv - ηg; θ += v' },
          { name: 'SGD', color: '#ef4444', loss: sgdLoss, formula: 'θ -= η·∇f(θ)' }
        ].sort((a, b) => a.loss - b.loss);

        competitors.forEach((c, idx) => {
          const cardBoxY = rightY + 36 + idx * 56;
          ctx.fillStyle = theme.plotBoxBg;
          ctx.strokeStyle = idx === 0 ? '#34d399' : theme.plotBoxBorder;
          ctx.lineWidth = idx === 0 ? 2 : 1;
          ctx.beginPath();
          ctx.roundRect(rightX + 8, cardBoxY, rightW - 16, 50, 6);
          ctx.fill(); ctx.stroke();

          ctx.fillStyle = c.color;
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`#${idx + 1} ${c.name}`, rightX + 14, cardBoxY + 16);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`Loss f(θ) = ${c.loss.toFixed(4)}`, rightX + 14, cardBoxY + 30);

          ctx.fillStyle = theme.textMuted;
          ctx.font = '8px monospace';
          ctx.fillText(c.formula, rightX + 14, cardBoxY + 44);
        });

        // Parameters Summary
        const sumY = rightY + 36 + 4 * 56 + 6;
        const sumH = Math.max(40, cardH - (sumY - rightY) - 10);
        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = theme.plotBoxBorder;
        ctx.beginPath();
        ctx.roundRect(rightX + 8, sumY, rightW - 16, sumH, 6);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`Learning Rate η = ${optLearningRate.toFixed(3)}`, rightX + 14, sumY + 16);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`Momentum β = ${optMomentumBeta.toFixed(2)} | Surface: ${optLossSurface}`, rightX + 14, sumY + 30);
      }

      // ────────────────────────────────────────────────────────────────────────
      // 8. MLE & MAP ESTIMATION
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'mle_map') {
        if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(35 / simSpeed)) === 0) {
          const newP = mleSampleMean + (Math.random() - 0.5) * mleSampleStd * 2.5;
          stateRef.current.mlePoints.push(newP);
          if (stateRef.current.mlePoints.length > 50) {
            stateRef.current.mlePoints = stateRef.current.mlePoints.slice(-35);
          }
        }

        const marginX = 14;
        const marginY = 14;
        const totalW = Math.max(680, w - 2 * marginX);
        const cardH = Math.max(480, h - 2 * marginY - 10);
        const leftX = cx - totalW / 2;
        const topY = cy - cardH / 2 + 6;

        const cardTitle = mleMapViewMode === 'mle_only'
          ? '🎯 PURE MAXIMUM LIKELIHOOD ESTIMATION (MLE)'
          : mleMapViewMode === 'map_only'
          ? '🔮 PURE BAYESIAN MAXIMUM A POSTERIORI (MAP)'
          : '🎯 MAXIMUM LIKELIHOOD (MLE) vs BAYESIAN MAP ESTIMATION';

        drawDiagramCard(ctx, leftX, topY, totalW, cardH, theme, cardTitle);

        const plotX = leftX + 10;
        const plotY = topY + 36;
        const plotW = totalW - 20;
        const plotH = cardH - 46;
        const pBaseY = plotY + plotH - 30;
        const pCx = plotX + plotW / 2;
        const pScale = plotW * 0.22;

        const pts = stateRef.current.mlePoints;
        const N = Math.max(3, pts.length);
        const mleMu = mleSampleMean;
        const mleSigma = mleSampleStd;
        const priorMu = mapPriorMean;
        const priorSigma = 0.55 / Math.sqrt(mapPriorWeight * 2 + 0.1);

        // Gaussian-Gaussian Conjugacy exact formulas
        const tauLikelihood = N / (mleSigma * mleSigma);
        const tauPrior = 1 / (priorSigma * priorSigma);
        const tauPost = tauLikelihood + tauPrior;
        const mapSigma = Math.sqrt(1 / tauPost);
        const mapMu = (tauLikelihood * mleMu + tauPrior * priorMu) / tauPost;

        const maxPdfPrior = 1 / (priorSigma * Math.sqrt(2 * Math.PI));
        const maxPdfMle = 1 / (mleSigma * Math.sqrt(2 * Math.PI));
        const maxPdfMap = 1 / (mapSigma * Math.sqrt(2 * Math.PI));

        withPlotBoxClip(ctx, plotX, plotY, plotW, plotH, 6, () => {
          // Axis baseline
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(plotX, pBaseY);
          ctx.lineTo(plotX + plotW, pBaseY);
          ctx.stroke();

          // 1. Data Points on Baseline
          if (mleMapViewMode !== 'map_only') {
            pts.forEach((p, idx) => {
              const px = pCx + p * pScale;
              const py = pBaseY - 6 - (idx % 3) * 6;
              ctx.fillStyle = '#38bdf8';
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 4;
              ctx.beginPath();
              ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
              ctx.fill();
              ctx.shadowBlur = 0;
            });
          }

          // 2. Prior Distribution N(priorMu, priorSigma) [Amber Dashed]
          if (mleMapViewMode !== 'mle_only') {
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2.2;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            for (let i = 0; i <= 80; i++) {
              const t = -2.5 + (i / 80) * 5.0;
              const pdf = (1 / (priorSigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - priorMu) / priorSigma, 2));
              const px = pCx + t * pScale;
              const py = pBaseY - (pdf / maxPdfPrior) * (plotH * 0.58);
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // 3. Likelihood Function L(theta) [Cyan Dashed]
          if (mleMapViewMode !== 'map_only') {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            for (let i = 0; i <= 80; i++) {
              const t = -2.5 + (i / 80) * 5.0;
              const pdf = (1 / (mleSigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - mleMu) / mleSigma, 2));
              const px = pCx + t * pScale;
              const py = pBaseY - (pdf / maxPdfMle) * (plotH * 0.58);
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // 4. Posterior MAP Distribution [Emerald Solid with Glow]
          if (mleMapViewMode !== 'mle_only') {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            for (let i = 0; i <= 80; i++) {
              const t = -2.5 + (i / 80) * 5.0;
              const pdf = (1 / (mapSigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - mapMu) / mapSigma, 2));
              const px = pCx + t * pScale;
              const py = pBaseY - (pdf / maxPdfMap) * (plotH * 0.72);
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
          }

          // Vertical Threshold Boundary Markers
          // Prior Mean Line
          const priorX = pCx + priorMu * pScale;
          if (mleMapViewMode !== 'mle_only') {
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(priorX, plotY + 24);
            ctx.lineTo(priorX, pBaseY);
            ctx.stroke();
          }

          // MLE Mean Line
          const mleX = pCx + mleMu * pScale;
          if (mleMapViewMode !== 'map_only') {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(mleX, plotY + 24);
            ctx.lineTo(mleX, pBaseY);
            ctx.stroke();
          }

          // MAP Mode Line (Emerald Gold)
          const mapX = pCx + mapMu * pScale;
          if (mleMapViewMode !== 'mle_only') {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(mapX, plotY + 12);
            ctx.lineTo(mapX, pBaseY);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Bayesian Shrinkage Vector Arrow (MLE -> MAP)
          if (mleMapViewMode === 'triad') {
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(mleX, plotY + 20);
            ctx.lineTo(mapX, plotY + 20);
            ctx.stroke();
          }

          // Peak Badges
          ctx.font = 'bold 9px monospace';
          if (mleMapViewMode !== 'mle_only') {
            ctx.fillStyle = '#f59e0b';
            ctx.fillText(`μ_prior = ${priorMu.toFixed(2)}`, priorX - 35, plotY + 36);
          }

          if (mleMapViewMode !== 'map_only') {
            ctx.fillStyle = '#38bdf8';
            ctx.fillText(`θ_MLE = ${mleMu.toFixed(2)}`, mleX - 30, plotY + 48);
          }

          if (mleMapViewMode !== 'mle_only') {
            ctx.fillStyle = '#10b981';
            ctx.fillText(`θ_MAP = ${mapMu.toFixed(2)} ${mleMapViewMode === 'triad' ? '(Shrunk)' : ''}`, mapX - 45, plotY + 12);
          }

          // Legend
          if (mleMapViewMode === 'triad') {
            ctx.fillStyle = '#f59e0b';
            ctx.fillText('━ ━ Prior p(θ)', plotX + 16, plotY + plotH - 10);
            ctx.fillStyle = '#38bdf8';
            ctx.fillText('━ ━ Likelihood p(X|θ)', plotX + 130, plotY + plotH - 10);
            ctx.fillStyle = '#10b981';
            ctx.fillText('━━ Posterior p(θ|X) (MAP)', plotX + 270, plotY + plotH - 10);
          } else if (mleMapViewMode === 'mle_only') {
            ctx.fillStyle = '#38bdf8';
            ctx.fillText('● Observed Samples X_i', plotX + 16, plotY + plotH - 10);
            ctx.fillText('━ ━ Sample Likelihood L(θ|X)', plotX + 180, plotY + plotH - 10);
            ctx.fillText(`θ̂_MLE = ${mleMu.toFixed(2)} (Sample Mean)`, plotX + 380, plotY + plotH - 10);
          } else {
            ctx.fillStyle = '#f59e0b';
            ctx.fillText('━ ━ Prior Belief p(θ)', plotX + 16, plotY + plotH - 10);
            ctx.fillStyle = '#10b981';
            ctx.fillText('━━ Posterior Estimate p(θ|X)', plotX + 180, plotY + plotH - 10);
          }
        });
      }

      // ────────────────────────────────────────────────────────────────────────
      // 9. NEWTON-RAPHSON & HESSIAN CURVATURE
      // ────────────────────────────────────────────────────────────────────────
      // 9. NEWTON-RAPHSON & HESSIAN CURVATURE
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'newton_raphson') {
        if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(35 / simSpeed)) === 0) {
          if (Math.abs(newtonCurrentX - 1.0) < 0.04 || Math.abs(newtonCurrentX + 1.0) < 0.04 || newtonStepCount > 7) {
            setNewtonCurrentX(parseFloat((1.85 + (Math.random() - 0.5) * 0.4).toFixed(3)));
            setNewtonStepCount(0);
          } else {
            performStep();
          }
        }

        const marginX = 14;
        const marginY = 14;
        const totalW = Math.max(680, w - 2 * marginX);
        const cardH = Math.max(480, h - 2 * marginY - 10);
        const leftX = cx - totalW / 2;
        const topY = cy - cardH / 2 + 6;

        drawDiagramCard(ctx, leftX, topY, totalW, cardH, theme, '⚡ SECOND-ORDER NEWTON-RAPHSON & HESSIAN DYNAMICS');

        const plotX = leftX + 10;
        const plotY = topY + 36;
        const plotW = totalW - 20;
        const plotH = cardH - 46;
        const pCx = plotX + plotW / 2;
        const pCy = plotY + plotH / 2 + 10;
        const pScaleX = plotW * 0.22;
        const pScaleY = plotH * 0.18;

        const x0 = newtonCurrentX;
        const f0 = Math.pow(x0, 4) - 2 * Math.pow(x0, 2) + 0.2 * x0;
        const f1 = 4 * Math.pow(x0, 3) - 4 * x0 + 0.2;
        const f2 = 12 * Math.pow(x0, 2) - 4 || 1e-4;
        const xNext = x0 - (f1 / f2) * newtonDamping;
        const fNext = Math.pow(xNext, 4) - 2 * Math.pow(xNext, 2) + 0.2 * xNext;

        withPlotBoxClip(ctx, plotX, plotY, plotW, plotH, 6, () => {
          // X-Axis Baseline
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(plotX, pCy);
          ctx.lineTo(plotX + plotW, pCy);
          ctx.stroke();

          // Ticks along X-Axis
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
          for (let tx = -2; tx <= 2; tx += 1) {
            const px = pCx + tx * pScaleX;
            ctx.beginPath();
            ctx.moveTo(px, pCy - 4);
            ctx.lineTo(px, pCy + 4);
            ctx.stroke();
            ctx.fillText(`x=${tx}`, px - 10, pCy + 16);
          }

          // 1. Objective Function Curve f(x) = x^4 - 2x^2 + 0.2x [Cyan Solid with Glow]
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          for (let i = 0; i <= 100; i++) {
            const t = -2.2 + (i / 100) * 4.4;
            const yVal = Math.pow(t, 4) - 2 * Math.pow(t, 2) + 0.2 * t;
            const px = pCx + t * pScaleX;
            const py = pCy - yVal * pScaleY;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;

          // 2. Osculating Quadratic Parabola q(x) [Amber Dashed]
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.2;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          for (let i = 0; i <= 100; i++) {
            const t = -2.2 + (i / 100) * 4.4;
            const dx = t - x0;
            const qVal = f0 + f1 * dx + 0.5 * f2 * dx * dx;
            const px = pCx + t * pScaleX;
            const py = pCy - qVal * pScaleY;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.setLineDash([]);

          // 3. First-Order Tangent Slope Line [Emerald Dashed]
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          const tanDx1 = -0.8;
          const tanDx2 = 0.8;
          ctx.moveTo(pCx + (x0 + tanDx1) * pScaleX, pCy - (f0 + f1 * tanDx1) * pScaleY);
          ctx.lineTo(pCx + (x0 + tanDx2) * pScaleX, pCy - (f0 + f1 * tanDx2) * pScaleY);
          ctx.stroke();
          ctx.setLineDash([]);

          // 4. Step Jump Trajectory Vector (x_k, f(x_k)) -> (x_next, f(x_next)) [Gold Arrow]
          const curPx = pCx + x0 * pScaleX;
          const curPy = pCy - f0 * pScaleY;
          const nextPx = pCx + xNext * pScaleX;
          const nextPy = pCy - fNext * pScaleY;

          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(curPx, curPy);
          ctx.quadraticCurveTo((curPx + nextPx) / 2, Math.min(curPy, nextPy) - 25, nextPx, nextPy);
          ctx.stroke();

          // 5. Current Position Handle (Pulsing Gold Marker)
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(curPx, curPy, 7, 0, 2 * Math.PI);
          ctx.fill();

          // Next Step Target Marker (Emerald Ring)
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(nextPx, nextPy, 6, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Badges & Telemetry Overlays
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(`Current x_${newtonStepCount} = ${x0.toFixed(3)}`, curPx + 10, curPy - 10);

          ctx.fillStyle = '#10b981';
          ctx.fillText(`Next x_${newtonStepCount + 1} = ${xNext.toFixed(3)} (Δx = -f'/f'')`, nextPx + 10, nextPy + 16);

          // Curvature Status Badge
          const isConvex = f2 > 0;
          ctx.fillStyle = isConvex ? '#22c55e' : '#ef4444';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`Hessian H = ∇²f(x) = ${f2.toFixed(2)} [${isConvex ? '✓ Local Convex Bowl' : '⚠️ Non-Convex / Saddle Danger'}]`, plotX + 14, plotY + 20);

          ctx.fillStyle = '#38bdf8';
          ctx.fillText(`Gradient g = ∇f(x) = ${f1.toFixed(3)} | Step Count: ${newtonStepCount}`, plotX + 14, plotY + 36);

          // Legend
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('━━ Objective f(x)', plotX + 14, plotY + plotH - 10);
          ctx.fillStyle = '#f59e0b';
          ctx.fillText('━ ━ Taylor Parabola q(x)', plotX + 150, plotY + plotH - 10);
          ctx.fillStyle = '#fbbf24';
          ctx.fillText('→ Newton Jump Trajectory', plotX + 320, plotY + plotH - 10);
        });
      }

      // ────────────────────────────────────────────────────────────────────────
      // 10. LAGRANGE MULTIPLIERS & KKT
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'lagrange_kkt') {
        if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(5 / simSpeed)) === 0) {
          setLagrangeLevelC(parseFloat((1.2 + 0.6 * Math.sin(stateRef.current.timeT * 0.5)).toFixed(2)));
        }

        const marginX = 14;
        const marginY = 14;
        const totalW = Math.max(680, w - 2 * marginX);
        const cardH = Math.max(480, h - 2 * marginY - 10);
        const leftX = cx - totalW / 2;
        const topY = cy - cardH / 2 + 6;

        drawDiagramCard(ctx, leftX, topY, totalW, cardH, theme, '⚖️ CONSTRAINED OPTIMIZATION & KKT GRADIENT TANGENCY');

        const plotX = leftX + 10;
        const plotY = topY + 36;
        const plotW = totalW - 20;
        const plotH = cardH - 46;
        const pCx = plotX + plotW / 2;
        const pCy = plotY + plotH / 2;
        const pScale = Math.min(plotW, plotH) * 0.36;

        const cConstraint = lagrangeLevelC;
        // Constraint: x1 + 1.2 x2 = cConstraint
        // Objective: f(x1, x2) = 0.5 * x1^2 + x2^2
        // Optimal contact: x1* = cConstraint / 1.72, x2* = 0.6 * cConstraint / 1.72, lambda* = cConstraint / 1.72
        const x1Star = cConstraint / 1.72;
        const x2Star = (0.6 * cConstraint) / 1.72;
        const optLevel = 0.5 * x1Star * x1Star + x2Star * x2Star;
        const lambdaStar = cConstraint / 1.72;

        withPlotBoxClip(ctx, plotX, plotY, plotW, plotH, 6, () => {
          // Coordinate Axes
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(plotX, pCy); ctx.lineTo(plotX + plotW, pCy);
          ctx.moveTo(pCx, plotY); ctx.lineTo(pCx, plotY + plotH);
          ctx.stroke();

          // 1. Objective Elliptical Level Contours f(x1, x2) = c
          const contourLevels = [0.2, 0.5, 0.9, 1.4, 2.0, 2.8];
          contourLevels.forEach(lvl => {
            const rx = Math.sqrt(lvl * 2.0) * pScale;
            const ry = Math.sqrt(lvl) * pScale;
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(pCx, pCy, rx, ry, 0, 0, 2 * Math.PI);
            ctx.stroke();
          });

          // 2. Active Optimal Tangent Level Curve (Cyan Glow)
          const rxOpt = Math.sqrt(optLevel * 2.0) * pScale;
          const ryOpt = Math.sqrt(optLevel) * pScale;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.ellipse(pCx, pCy, rxOpt, ryOpt, 0, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // 3. Affine Constraint Line: x1 + 1.2 x2 = cConstraint [Pink Solid with Glow]
          // When x1 = -2.5 -> x2 = (c - x1)/1.2
          // When x1 = +2.5 -> x2 = (c - x1)/1.2
          const lx1 = -2.5;
          const ly1 = (cConstraint - lx1) / 1.2;
          const lx2 = 2.5;
          const ly2 = (cConstraint - lx2) / 1.2;

          const pLx1 = pCx + lx1 * pScale;
          const pLy1 = pCy - ly1 * pScale;
          const pLx2 = pCx + lx2 * pScale;
          const pLy2 = pCy - ly2 * pScale;

          // Infeasible Region Shading (Above the constraint line g(x) > 0)
          ctx.fillStyle = 'rgba(236, 72, 153, 0.08)';
          ctx.beginPath();
          ctx.moveTo(pLx1, pLy1);
          ctx.lineTo(pLx2, pLy2);
          ctx.lineTo(plotX + plotW, plotY);
          ctx.lineTo(plotX, plotY);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(pLx1, pLy1);
          ctx.lineTo(pLx2, pLy2);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // 4. Optimal Tangency Contact Point x* (Emerald Pulse Ring)
          const contactPx = pCx + x1Star * pScale;
          const contactPy = pCy - x2Star * pScale;

          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(contactPx, contactPy, 7, 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;

          // 5. Collinear Gradient Vectors at Contact Point
          // ∇f(x*) = [x1*, 2 x2*] (Cyan Arrow)
          const gradFx = x1Star * 50;
          const gradFy = -2 * x2Star * 50;

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(contactPx, contactPy);
          ctx.lineTo(contactPx + gradFx, contactPy + gradFy);
          ctx.stroke();

          // Arrow tip for ∇f
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(contactPx + gradFx, contactPy + gradFy, 4, 0, 2 * Math.PI);
          ctx.fill();

          // -λ ∇g(x*) = -λ [1, 1.2] (Pink Arrow Collinear in opposite direction)
          const gradGx = -lambdaStar * 30;
          const gradGy = 1.2 * lambdaStar * 30;

          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(contactPx, contactPy);
          ctx.lineTo(contactPx + gradGx, contactPy + gradGy);
          ctx.stroke();

          // Arrow tip for -λ∇g
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.arc(contactPx + gradGx, contactPy + gradGy, 4, 0, 2 * Math.PI);
          ctx.fill();

          // Labels & KKT Checklist Badge
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#10b981';
          ctx.fillText(`Optimal Contact x* = (${x1Star.toFixed(2)}, ${x2Star.toFixed(2)})`, contactPx + 12, contactPy - 12);

          ctx.fillStyle = '#38bdf8';
          ctx.fillText('∇f(x*)', contactPx + gradFx + 6, contactPy + gradFy);

          ctx.fillStyle = '#ec4899';
          ctx.fillText('-λ*∇g(x*)', contactPx + gradGx - 60, contactPy + gradGy);

          // KKT Checklist Panel (Top Left)
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.5;
          ctx.fillRect(plotX + 12, plotY + 12, 230, 70);
          ctx.strokeRect(plotX + 12, plotY + 12, 230, 70);

          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText('KKT CONDITIONS & STATIONARITY:', plotX + 20, plotY + 26);
          ctx.fillStyle = '#10b981';
          ctx.fillText('✓ Stationarity: ∇f + λ*∇g = 0', plotX + 20, plotY + 40);
          ctx.fillText('✓ Primal Feasibility: g(x*) ≤ 0', plotX + 20, plotY + 52);
          ctx.fillText(`✓ Multiplier λ* = ${lambdaStar.toFixed(2)} (Dual λ ≥ 0)`, plotX + 20, plotY + 64);
          ctx.fillText('✓ Complementary Slackness: λ*g(x*) = 0', plotX + 20, plotY + 76);

          // Legend
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('━━ Contours f(x) = c', plotX + 14, plotY + plotH - 10);
          ctx.fillStyle = '#ec4899';
          ctx.fillText('━━ Constraint g(x) = 0', plotX + 170, plotY + plotH - 10);
          ctx.fillStyle = '#10b981';
          ctx.fillText('● Tangency Point (∇f = -λ∇g)', plotX + 340, plotY + plotH - 10);
        });
      }

      // ────────────────────────────────────────────────────────────────────────
      // 11. EM ALGORITHM ON GAUSSIAN MIXTURES
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'em_gmm') {
        if (isSimulating && localFrame % Math.max(1, Math.round(25 / simSpeed)) === 0) {
          if (!emConverged) {
            performStep();
          } else if (simMode === 'autoplay' && localFrame % Math.max(1, Math.round(180 / simSpeed)) === 0) {
            reseedData();
          }
        }

        const marginX = 14;
        const marginY = 14;
        const gap = 12;
        const totalW = Math.max(680, w - 2 * marginX);
        const leftW = Math.floor((totalW - gap) * 0.58);
        const rightW = totalW - gap - leftW;
        const cardH = Math.max(480, h - 2 * marginY - 10);
        const leftX = cx - totalW / 2;
        const leftY = cy - cardH / 2 + 6;
        const rightX = leftX + leftW + gap;
        const rightY = leftY;

        const { gmmPoints, gmmParams } = stateRef.current;

        // 1. Left Diagram Card: GMM Mixture Density & Soft Responsibilities
        drawDiagramCard(ctx, leftX, leftY, leftW, cardH, theme, '🎯 GMM MIXTURE DENSITY & SOFT RESPONSIBILITIES');

        const gmmPlotX = leftX + 10;
        const gmmPlotY = leftY + 36;
        const gmmPlotW = leftW - 20;
        const gmmPlotH = cardH - 46;
        const gBaseY = gmmPlotY + gmmPlotH - 30;
        const gCx = gmmPlotX + gmmPlotW / 2;
        const gScale = gmmPlotW * 0.24;

        withPlotBoxClip(ctx, gmmPlotX, gmmPlotY, gmmPlotW, gmmPlotH, 6, () => {
          // Axis baseline
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(gmmPlotX, gBaseY);
          ctx.lineTo(gmmPlotX + gmmPlotW, gBaseY);
          ctx.stroke();

          // Component 1 Curve N(mu1, sig1) [Cyan Dashed]
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          for (let i = 0; i <= 80; i++) {
            const t = -2.2 + (i / 80) * 4.4;
            const pdf1 = gmmParams.pi1 * (1 / (gmmParams.sig1 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - gmmParams.mu1) / gmmParams.sig1, 2));
            const px = gCx + t * gScale;
            const py = gBaseY - Math.min(1.0, pdf1 * 0.42) * (gmmPlotH * 0.7);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();

          // Component 2 Curve N(mu2, sig2) [Purple Dashed]
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          for (let i = 0; i <= 80; i++) {
            const t = -2.2 + (i / 80) * 4.4;
            const pdf2 = gmmParams.pi2 * (1 / (gmmParams.sig2 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - gmmParams.mu2) / gmmParams.sig2, 2));
            const px = gCx + t * gScale;
            const py = gBaseY - Math.min(1.0, pdf2 * 0.42) * (gmmPlotH * 0.7);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.setLineDash([]);

          // Total Mixture Curve sum(pi_k * N_k) [Emerald Solid with Glow]
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          for (let i = 0; i <= 80; i++) {
            const t = -2.2 + (i / 80) * 4.4;
            const pdf1 = gmmParams.pi1 * (1 / (gmmParams.sig1 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - gmmParams.mu1) / gmmParams.sig1, 2));
            const pdf2 = gmmParams.pi2 * (1 / (gmmParams.sig2 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - gmmParams.mu2) / gmmParams.sig2, 2));
            const totalPdf = pdf1 + pdf2;
            const px = gCx + t * gScale;
            const py = gBaseY - Math.min(1.0, totalPdf * 0.42) * (gmmPlotH * 0.75);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Means Vertical Markers
          const mu1X = gCx + gmmParams.mu1 * gScale;
          const mu2X = gCx + gmmParams.mu2 * gScale;

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(mu1X, gmmPlotY + 20);
          ctx.lineTo(mu1X, gBaseY);
          ctx.stroke();

          ctx.strokeStyle = '#c084fc';
          ctx.beginPath();
          ctx.moveTo(mu2X, gmmPlotY + 20);
          ctx.lineTo(mu2X, gBaseY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Data Points with Soft Responsibility Color Blending (r1 * Cyan + r2 * Purple)
          gmmPoints.forEach((p, idx) => {
            const p1 = gmmParams.pi1 * (1 / (gmmParams.sig1 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((p - gmmParams.mu1) / gmmParams.sig1, 2));
            const p2 = gmmParams.pi2 * (1 / (gmmParams.sig2 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((p - gmmParams.mu2) / gmmParams.sig2, 2));
            const r1 = p1 / (p1 + p2 || 1e-6);

            const red = Math.round(56 * r1 + 192 * (1 - r1));
            const green = Math.round(189 * r1 + 132 * (1 - r1));
            const blue = Math.round(248 * r1 + 252 * (1 - r1));

            const px = gCx + p * gScale;
            const py = gBaseY - 6 - (idx % 3) * 6;

            ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
            ctx.shadowColor = `rgb(${red}, ${green}, ${blue})`;
            ctx.shadowBlur = 3;
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;
          });

          // Legend & Component Means
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(`μ₁=${gmmParams.mu1.toFixed(2)} (π₁=${(gmmParams.pi1 * 100).toFixed(0)}%)`, mu1X - 35, gmmPlotY + 16);

          ctx.fillStyle = '#c084fc';
          ctx.fillText(`μ₂=${gmmParams.mu2.toFixed(2)} (π₂=${(gmmParams.pi2 * 100).toFixed(0)}%)`, mu2X - 35, gmmPlotY + 16);

          ctx.fillStyle = '#10b981';
          ctx.fillText('━━ Total Mixture p(x)', gmmPlotX + 16, gmmPlotY + gmmPlotH - 10);
        });

        // 2. Right Diagram Card: Monotonic Log-Likelihood Ascent
        drawDiagramCard(ctx, rightX, rightY, rightW, cardH, theme, '📈 LOG-LIKELIHOOD ASCENT ln L(θ)');

        const llPlotX = rightX + 10;
        const llPlotY = rightY + 36;
        const llPlotW = rightW - 20;
        const llPlotH = cardH - 46;

        // Top Telemetry Card Deck
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = theme.plotBoxBorder;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(llPlotX, llPlotY, llPlotW, 68, 6);
        ctx.fill(); ctx.stroke();

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(`EM Iterations: ${emIterations}`, llPlotX + 12, llPlotY + 20);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`Log-Likelihood ln L(θ): ${emLogLikelihood}`, llPlotX + 12, llPlotY + 38);
        ctx.fillStyle = emConverged ? '#22c55e' : '#fbbf24';
        ctx.fillText(emConverged ? '✓ EM CONVERGED (ΔL < 1e-4)' : '⚡ ITERATING E-STEP & M-STEP...', llPlotX + 12, llPlotY + 56);

        // Lower Ascent Plot Area (Confined strictly below top telemetry)
        const chartY = llPlotY + 78;
        const chartH = llPlotH - 88;

        ctx.fillStyle = theme.plotBoxBg;
        ctx.fillRect(llPlotX, chartY, llPlotW, chartH);
        ctx.strokeStyle = theme.plotBoxBorder;
        ctx.strokeRect(llPlotX, chartY, llPlotW, chartH);

        withPlotBoxClip(ctx, llPlotX, chartY, llPlotW, chartH, 6, () => {
          const hist = stateRef.current.gmmHistory;
          // Grid line
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(llPlotX, chartY + chartH / 2); ctx.lineTo(llPlotX + llPlotW, chartY + chartH / 2);
          ctx.stroke();

          if (hist.length > 1) {
            const minLL = Math.min(...hist);
            const maxLL = Math.max(...hist);
            const rangeLL = maxLL - minLL || 1.0;

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            hist.forEach((val, idx) => {
              const lx = llPlotX + 14 + (idx / Math.max(1, hist.length - 1)) * (llPlotW - 28);
              const ly = (chartY + chartH - 14) - ((val - minLL) / rangeLL) * (chartH - 28);
              if (idx === 0) ctx.moveTo(lx, ly);
              else ctx.lineTo(lx, ly);
            });
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Mark current iteration point
            const lastVal = hist[hist.length - 1];
            const lastX = llPlotX + 14 + (llPlotW - 28);
            const lastY = (chartY + chartH - 14) - ((lastVal - minLL) / rangeLL) * (chartH - 28);

            ctx.fillStyle = '#22c55e';
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(lastX, lastY, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('Monotonic Ascent ln L(θ)', llPlotX + 12, chartY + 16);
          ctx.fillText('Iter 0 ━━► Max', llPlotX + llPlotW - 95, chartY + chartH - 8);
        });
      }

      // ────────────────────────────────────────────────────────────────────────
      // 12. MCMC METROPOLIS-HASTINGS
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'mcmc_metropolis') {
        if (isSimulating && localFrame % Math.max(1, Math.round(4 / simSpeed)) === 0) {
          performStep();
        }

        const marginX = 14;
        const marginY = 14;
        const gap = 12;
        const totalW = Math.max(680, w - 2 * marginX);
        const leftW = Math.floor((totalW - gap) * 0.55);
        const rightW = totalW - gap - leftW;
        const cardH = Math.max(480, h - 2 * marginY - 10);
        const leftX = cx - totalW / 2;
        const leftY = cy - cardH / 2 + 6;
        const rightX = leftX + leftW + gap;
        const rightY = leftY;

        // 1. Left Diagram Card: Target Density & Active Proposal Jump
        drawDiagramCard(ctx, leftX, leftY, leftW, cardH, theme, '🎯 METROPOLIS PROPOSAL & ACCEPTANCE');

        const leftPlotX = leftX + 10;
        const leftPlotY = leftY + 36;
        const leftPlotW = leftW - 20;
        const leftPlotH = cardH - 46;
        const baseY = leftPlotY + leftPlotH - 16;

        withPlotBoxClip(ctx, leftPlotX, leftPlotY, leftPlotW, leftPlotH, 6, () => {
          // Bimodal Target Distribution Curve
          ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(leftPlotX, baseY);

          for (let i = 0; i <= 60; i++) {
            const t = -2.2 + (i / 60) * 4.4;
            const pdf = 0.6 * Math.exp(-0.5 * Math.pow((t + 0.8) / 0.35, 2)) + 0.4 * Math.exp(-0.5 * Math.pow((t - 0.8) / 0.4, 2));
            const px = leftPlotX + (i / 60) * leftPlotW;
            const py = baseY - pdf * (leftPlotH - 36);
            ctx.lineTo(px, py);
          }
          ctx.lineTo(leftPlotX + leftPlotW, baseY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Current MCMC Sample Marker x_t
          const curVal = stateRef.current.mcmcCurrent;
          const curPx = leftPlotX + ((curVal + 2.2) / 4.4) * leftPlotW;
          const curTargetPdf = 0.6 * Math.exp(-0.5 * Math.pow((curVal + 0.8) / 0.35, 2)) + 0.4 * Math.exp(-0.5 * Math.pow((curVal - 0.8) / 0.4, 2));
          const curPy = baseY - curTargetPdf * (leftPlotH - 36);

          ctx.fillStyle = '#34d399';
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(curPx, curPy, 7, 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Proposal Jump Vector
          const lastHist = stateRef.current.mcmcHistory[stateRef.current.mcmcHistory.length - 1];
          if (lastHist) {
            const propPx = leftPlotX + ((lastHist.x + 2.2) / 4.4) * leftPlotW;
            ctx.strokeStyle = lastHist.accepted ? '#34d399' : '#f43f5e';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(curPx, curPy);
            ctx.lineTo(propPx, baseY - 8);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = lastHist.accepted ? '#34d399' : '#f43f5e';
            ctx.font = 'bold 9px monospace';
            ctx.fillText(lastHist.accepted ? '✓ ACCEPT' : '✗ REJECT', propPx - 16, baseY - 18);
          }
        });

        // 2. Right Diagram Card: Trace Plot & Empirical Posterior Histogram
        drawDiagramCard(ctx, rightX, rightY, rightW, cardH, theme, '📈 TRACE PLOT & EMPIRICAL POSTERIOR');

        // Upper Box: MCMC Chain Trace Plot
        const traceY = rightY + 36;
        const traceH = Math.floor((cardH - 58) * 0.46);
        ctx.fillStyle = theme.plotBoxBg;
        ctx.fillRect(rightX + 10, traceY, rightW - 20, traceH);
        ctx.strokeStyle = theme.plotBoxBorder;
        ctx.strokeRect(rightX + 10, traceY, rightW - 20, traceH);

        withPlotBoxClip(ctx, rightX + 10, traceY, rightW - 20, traceH, 6, () => {
          const histArr = stateRef.current.mcmcHistory.slice(-50);
          if (histArr.length > 1) {
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            histArr.forEach((h, idx) => {
              const tx = rightX + 14 + (idx / Math.max(1, histArr.length - 1)) * (rightW - 28);
              const ty = traceY + traceH / 2 - (h.x / 2.5) * (traceH / 2 - 8);
              if (idx === 0) ctx.moveTo(tx, ty);
              else ctx.lineTo(tx, ty);
            });
            ctx.stroke();
          }
        });

        ctx.fillStyle = '#c084fc';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('MCMC State Trace Plot x_t', rightX + 16, traceY + 14);

        // Lower Box: Empirical Histogram
        const postY = traceY + traceH + 12;
        const postH = cardH - (postY - rightY) - 10;
        ctx.fillStyle = theme.plotBoxBg;
        ctx.fillRect(rightX + 10, postY, rightW - 20, postH);
        ctx.strokeStyle = theme.plotBoxBorder;
        ctx.strokeRect(rightX + 10, postY, rightW - 20, postH);

        withPlotBoxClip(ctx, rightX + 10, postY, rightW - 20, postH, 6, () => {
          const hist = stateRef.current.mcmcHistogram;
          const maxBin = Math.max(...hist, 1);
          const binW = (rightW - 20) / 50;
          const histBaseY = postY + postH - 6;

          for (let i = 0; i < 50; i++) {
            const val = hist[i];
            const barH = (val / maxBin) * (postH - 20);
            const bx = rightX + 10 + i * binW;
            const by = histBaseY - barH;

            ctx.fillStyle = 'rgba(52, 211, 153, 0.75)';
            ctx.fillRect(bx, by, binW - 0.5, barH);
          }
        });

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`Acceptance Rate: ${mcmcAcceptanceRate}% | Samples: ${mcmcTotalSamples}`, rightX + 16, postY + 14);
      }

      // ────────────────────────────────────────────────────────────────────────
      // 13. BOOTSTRAP RESAMPLING
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'bootstrap_resampling') {
        if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(10 / simSpeed)) === 0) {
          if (stateRef.current.bootReplicas.length < 350) {
            const orig = stateRef.current.bootSamples;
            if (orig.length > 0) {
              for (let b = 0; b < 6; b++) {
                let sum = 0;
                for (let i = 0; i < orig.length; i++) {
                  sum += orig[Math.floor(Math.random() * orig.length)];
                }
                stateRef.current.bootReplicas.push(sum / orig.length);
              }
              setBootNumReplicas(stateRef.current.bootReplicas.length);
            }
          } else {
            stateRef.current.bootReplicas = [];
            setBootNumReplicas(0);
          }
        }

        const marginX = 14;
        const marginY = 14;
        const totalW = Math.max(680, w - 2 * marginX);
        const cardH = Math.max(480, h - 2 * marginY - 10);
        const leftX = cx - totalW / 2;
        const topY = cy - cardH / 2 + 6;

        drawDiagramCard(ctx, leftX, topY, totalW, cardH, theme, '📊 BOOTSTRAP NON-PARAMETRIC RESAMPLING & 95% CI');

        const plotX = leftX + 10;
        const plotY = topY + 36;
        const plotW = totalW - 20;
        const plotH = cardH - 46;

        // Top Box: Original Empirical Dataset X
        const topBoxH = Math.floor(plotH * 0.32);
        ctx.fillStyle = theme.plotBoxBg;
        ctx.fillRect(plotX, plotY, plotW, topBoxH);
        ctx.strokeStyle = theme.plotBoxBorder;
        ctx.strokeRect(plotX, plotY, plotW, topBoxH);

        const sampleCx = plotX + plotW / 2;
        const sampleBaseY = plotY + topBoxH - 18;
        const sampleScale = plotW * 0.38;

        const orig = stateRef.current.bootSamples;
        const origMean = orig.length > 0 ? orig.reduce((a, b) => a + b, 0) / orig.length : 0.12;

        withPlotBoxClip(ctx, plotX, plotY, plotW, topBoxH, 6, () => {
          // Axis baseline
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(plotX, sampleBaseY);
          ctx.lineTo(plotX + plotW, sampleBaseY);
          ctx.stroke();

          // Data Points
          orig.forEach((p, idx) => {
            const px = sampleCx + p * sampleScale;
            const py = sampleBaseY - 6 - (idx % 3) * 6;
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;
          });

          // Original Sample Mean Line
          const origMeanX = sampleCx + origMean * sampleScale;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(origMeanX, plotY + 12);
          ctx.lineTo(origMeanX, sampleBaseY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`Sample Mean x̄ = ${origMean.toFixed(3)} (N = ${orig.length})`, origMeanX + 6, plotY + 20);
        });

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('Original Empirical Dataset X ~ F_emp', plotX + 12, plotY + 14);

        // Lower Box: Bootstrap Replicates Distribution Histogram p(θ*)
        const botBoxY = plotY + topBoxH + 12;
        const botBoxH = plotH - topBoxH - 12;

        ctx.fillStyle = theme.plotBoxBg;
        ctx.fillRect(plotX, botBoxY, plotW, botBoxH);
        ctx.strokeStyle = theme.plotBoxBorder;
        ctx.strokeRect(plotX, botBoxY, plotW, botBoxH);

        const reps = stateRef.current.bootReplicas;
        const botBaseY = botBoxY + botBoxH - 24;

        withPlotBoxClip(ctx, plotX, botBoxY, plotW, botBoxH, 6, () => {
          if (reps.length > 0) {
            const numBins = 36;
            const minVal = -0.15;
            const maxVal = 0.40;
            const binWidthVal = (maxVal - minVal) / numBins;
            const bins = new Array(numBins).fill(0);

            reps.forEach(r => {
              const bIdx = Math.floor((r - minVal) / binWidthVal);
              if (bIdx >= 0 && bIdx < numBins) bins[bIdx]++;
            });

            const maxBinCount = Math.max(...bins, 1);
            const pxPerBin = plotW / numBins;

            // 1. Shaded 95% Confidence Interval Background
            const ciLowVal = bootCI95.low;
            const ciHighVal = bootCI95.high;
            const ciLowPx = plotX + ((ciLowVal - minVal) / (maxVal - minVal)) * plotW;
            const ciHighPx = plotX + ((ciHighVal - minVal) / (maxVal - minVal)) * plotW;

            ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
            ctx.fillRect(ciLowPx, botBoxY + 16, Math.max(2, ciHighPx - ciLowPx), botBaseY - botBoxY - 16);

            // 2. Draw Histogram Bars
            for (let i = 0; i < numBins; i++) {
              const count = bins[i];
              if (count === 0) continue;
              const barH = (count / maxBinCount) * (botBoxH - 46);
              const bx = plotX + i * pxPerBin;
              const by = botBaseY - barH;
              const binVal = minVal + (i + 0.5) * binWidthVal;
              const inCI = binVal >= ciLowVal && binVal <= ciHighVal;

              ctx.fillStyle = inCI ? 'rgba(245, 158, 11, 0.75)' : 'rgba(148, 163, 184, 0.35)';
              ctx.fillRect(bx + 1, by, pxPerBin - 2, barH);
            }

            // 3. Boundary Dashed Lines at q0.025 and q0.975
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(ciLowPx, botBoxY + 16);
            ctx.lineTo(ciLowPx, botBaseY);
            ctx.moveTo(ciHighPx, botBoxY + 16);
            ctx.lineTo(ciHighPx, botBaseY);
            ctx.stroke();

            // 4. Mean of Bootstrap Estimates
            const bootMeanVal = bootMeanEstimate;
            const bootMeanPx = plotX + ((bootMeanVal - minVal) / (maxVal - minVal)) * plotW;
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(bootMeanPx, botBoxY + 12);
            ctx.lineTo(bootMeanPx, botBaseY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Text Badges
            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#10b981';
            ctx.fillText(`q(0.025) = ${ciLowVal.toFixed(3)}`, ciLowPx - 40, botBoxY + 28);
            ctx.fillText(`q(0.975) = ${ciHighVal.toFixed(3)}`, ciHighPx + 6, botBoxY + 28);

            ctx.fillStyle = '#f59e0b';
            ctx.fillText(`θ̄* = ${bootMeanVal.toFixed(3)}`, bootMeanPx - 25, botBoxY + 14);

            ctx.fillStyle = '#f8fafc';
            ctx.fillText(`95% Percentile CI: [${ciLowVal.toFixed(3)}, ${ciHighVal.toFixed(3)}] | SE_B = ${bootStdError.toFixed(4)} | B = ${reps.length}`, plotX + 12, botBoxY + botBoxH - 8);
          }
        });

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('Bootstrap Distribution p(θ*) & 95% Percentile Band', plotX + 12, botBoxY + 14);
      }

      // ────────────────────────────────────────────────────────────────────────
      // 14. FISHER'S LINEAR DISCRIMINANT (LDA)
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'fisher_lda') {
        if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(5 / simSpeed)) === 0) {
          setLdaSeparability(parseFloat((3.5 + 1.2 * Math.sin(stateRef.current.timeT * 0.5)).toFixed(2)));
        }

        const marginX = 14;
        const marginY = 14;
        const gap = 12;
        const totalW = Math.max(680, w - 2 * marginX);
        const cardH = Math.max(480, h - 2 * marginY - 10);
        const cardW = (totalW - gap) / 2;
        const leftX = cx - totalW / 2;
        const topY = cy - cardH / 2 + 6;
        const rightX = leftX + cardW + gap;

        // LEFT CARD: 2D Class Clusters & Optimal Fisher Discriminant Axis
        drawDiagramCard(ctx, leftX, topY, cardW, cardH, theme, '🎯 FISHER 2D CLASS SCATTER & DISCRIMINANT w*');

        const plotX = leftX + 10;
        const plotY = topY + 36;
        const plotW = cardW - 20;
        const plotH = cardH - 46;
        const pCx = plotX + plotW / 2;
        const pCy = plotY + plotH / 2;
        const pScale = Math.min(plotW, plotH) * 0.42;

        const pts = stateRef.current.ldaPoints;
        // Means
        const c0Pts = pts.filter(p => p.cls === 0);
        const c1Pts = pts.filter(p => p.cls === 1);
        const mu0 = {
          x: c0Pts.length ? c0Pts.reduce((acc, p) => acc + p.x, 0) / c0Pts.length : -0.6,
          y: c0Pts.length ? c0Pts.reduce((acc, p) => acc + p.y, 0) / c0Pts.length : -0.3
        };
        const mu1 = {
          x: c1Pts.length ? c1Pts.reduce((acc, p) => acc + p.x, 0) / c1Pts.length : 0.6,
          y: c1Pts.length ? c1Pts.reduce((acc, p) => acc + p.y, 0) / c1Pts.length : 0.4
        };

        // Fisher vector w* = Sw^-1 (mu1 - mu0)
        const dMu = { x: mu1.x - mu0.x, y: mu1.y - mu0.y };
        const wAngle = Math.atan2(dMu.y * 1.4, dMu.x * 0.8);
        const wVec = { x: Math.cos(wAngle), y: Math.sin(wAngle) };

        withPlotBoxClip(ctx, plotX, plotY, plotW, plotH, 6, () => {
          // Coordinate Axes
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(plotX, pCy); ctx.lineTo(plotX + plotW, pCy);
          ctx.moveTo(pCx, plotY); ctx.lineTo(pCx, plotY + plotH);
          ctx.stroke();

          // 1. Covariance Ellipses for Class 0 and Class 1
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(pCx + mu0.x * pScale, pCy - mu0.y * pScale, 0.35 * pScale, 0.22 * pScale, 0.2, 0, 2 * Math.PI);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(pCx + mu1.x * pScale, pCy - mu1.y * pScale, 0.35 * pScale, 0.22 * pScale, 0.2, 0, 2 * Math.PI);
          ctx.stroke();

          // 2. Data Points & Projection Lines
          pts.forEach(p => {
            const px = pCx + p.x * pScale;
            const py = pCy - p.y * pScale;

            const projLen = p.x * wVec.x + p.y * wVec.y;
            const projX = pCx + projLen * wVec.x * pScale;
            const projY = pCy - projLen * wVec.y * pScale;

            // Projection dropped line
            ctx.strokeStyle = p.cls === 0 ? 'rgba(56, 189, 248, 0.18)' : 'rgba(244, 63, 94, 0.18)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, py); ctx.lineTo(projX, projY); ctx.stroke();

            // Scatter Dot
            ctx.fillStyle = p.cls === 0 ? '#38bdf8' : '#f43f5e';
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, 2 * Math.PI);
            ctx.fill();

            // Projected dot on w*
            ctx.fillStyle = p.cls === 0 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(244, 63, 94, 0.7)';
            ctx.beginPath();
            ctx.arc(projX, projY, 2.5, 0, 2 * Math.PI);
            ctx.fill();
          });

          // 3. Class Means
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(pCx + mu0.x * pScale, pCy - mu0.y * pScale, 6, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(pCx + mu1.x * pScale, pCy - mu1.y * pScale, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;

          // 4. Optimal Fisher Discriminant Vector w* (Pink Glowing Line)
          const axisLen = pScale * 1.8;
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(pCx - wVec.x * axisLen, pCy + wVec.y * axisLen);
          ctx.lineTo(pCx + wVec.x * axisLen, pCy - wVec.y * axisLen);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // 5. Decision Threshold Boundary (Orthogonal to w* at midpoint)
          const midProj = ((mu0.x + mu1.x) / 2) * wVec.x + ((mu0.y + mu1.y) / 2) * wVec.y;
          const midX = pCx + midProj * wVec.x * pScale;
          const midY = pCy - midProj * wVec.y * pScale;
          const perpVec = { x: -wVec.y, y: wVec.x };

          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(midX - perpVec.x * 60, midY + perpVec.y * 60);
          ctx.lineTo(midX + perpVec.x * 60, midY - perpVec.y * 60);
          ctx.stroke();
          ctx.setLineDash([]);

          // Labels
          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#ec4899';
          ctx.fillText('Optimal w* (LDA Axis)', pCx + wVec.x * axisLen + 8, pCy - wVec.y * axisLen);
          ctx.fillStyle = '#10b981';
          ctx.fillText('Bayes Boundary y_th', midX + perpVec.x * 60 + 6, midY - perpVec.y * 60);
        });

        // RIGHT CARD: 1D Projected Density Distributions & Rayleigh Criterion
        drawDiagramCard(ctx, rightX, topY, cardW, cardH, theme, '📈 1D PROJECTED DISTRIBUTIONS & RAYLEIGH SCORE');

        const rPlotX = rightX + 10;
        const rPlotY = topY + 36;
        const rPlotW = cardW - 20;
        const rPlotH = cardH - 46;
        const rBaseY = rPlotY + rPlotH - 30;

        withPlotBoxClip(ctx, rPlotX, rPlotY, rPlotW, rPlotH, 6, () => {
          // Axis baseline
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(rPlotX, rBaseY);
          ctx.lineTo(rPlotX + rPlotW, rBaseY);
          ctx.stroke();

          // 1. 1D Projected Density Curve for Class 0 (Cyan)
          const projMu0 = mu0.x * wVec.x + mu0.y * wVec.y;
          const projSig0 = 0.28;
          ctx.strokeStyle = '#38bdf8';
          ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(rPlotX, rBaseY);
          for (let i = 0; i <= 80; i++) {
            const t = -1.8 + (i / 80) * 3.6;
            const pdf = (1 / (projSig0 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - projMu0) / projSig0, 2));
            const px = rPlotX + (t + 1.8) * (rPlotW / 3.6);
            const py = rBaseY - Math.min(1.0, pdf * 0.45) * (rPlotH * 0.55);
            ctx.lineTo(px, py);
          }
          ctx.lineTo(rPlotX + rPlotW, rBaseY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 2. 1D Projected Density Curve for Class 1 (Rose)
          const projMu1 = mu1.x * wVec.x + mu1.y * wVec.y;
          const projSig1 = 0.28;
          ctx.strokeStyle = '#f43f5e';
          ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(rPlotX, rBaseY);
          for (let i = 0; i <= 80; i++) {
            const t = -1.8 + (i / 80) * 3.6;
            const pdf = (1 / (projSig1 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - projMu1) / projSig1, 2));
            const px = rPlotX + (t + 1.8) * (rPlotW / 3.6);
            const py = rBaseY - Math.min(1.0, pdf * 0.45) * (rPlotH * 0.55);
            ctx.lineTo(px, py);
          }
          ctx.lineTo(rPlotX + rPlotW, rBaseY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 3. Optimal Bayes Decision Threshold Line
          const midProjT = (projMu0 + projMu1) / 2;
          const threshPx = rPlotX + (midProjT + 1.8) * (rPlotW / 3.6);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(threshPx, rBaseY);
          ctx.lineTo(threshPx, rPlotY + 20);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#10b981';
          ctx.fillText(`Boundary y* = ${midProjT.toFixed(2)}`, threshPx - 45, rPlotY + 32);

          // 4. Rayleigh Quotient Telemetry Box (Top Left)
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = theme.plotBoxBorder;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(rPlotX + 12, rPlotY + 12, rPlotW - 24, 60, 6);
          ctx.fill(); ctx.stroke();

          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#fbbf24';
          ctx.fillText('RAYLEIGH QUOTIENT SEPARABILITY:', rPlotX + 20, rPlotY + 28);
          ctx.fillStyle = '#34d399';
          ctx.fillText(`J(w) = (wᵀ S_B w) / (wᵀ S_W w) = ${ldaSeparability.toFixed(2)} [Maximized]`, rPlotX + 20, rPlotY + 44);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillText(`Between Scatter S_B = ${(Math.pow(projMu1 - projMu0, 2)).toFixed(2)} | Within S_W = ${(projSig0*projSig0 + projSig1*projSig1).toFixed(2)}`, rPlotX + 20, rPlotY + 58);
        });
      }

      // ────────────────────────────────────────────────────────────────────────
      // 15. SINGULAR VALUE DECOMPOSITION (SVD)
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'svd_decomposition') {
        if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(4 / simSpeed)) === 0) {
          setSvdSingular1(parseFloat((1.85 + 0.55 * Math.sin(stateRef.current.timeT * 0.6)).toFixed(2)));
          setSvdSingular2(parseFloat((0.65 + 0.35 * Math.cos(stateRef.current.timeT * 0.6)).toFixed(2)));
        }

        const marginX = 14;
        const marginY = 14;
        const totalW = Math.max(680, w - 2 * marginX);
        const cardH = Math.max(480, h - 2 * marginY - 10);
        const leftX = cx - totalW / 2;
        const topY = cy - cardH / 2 + 6;

        drawDiagramCard(ctx, leftX, topY, totalW, cardH, theme, '🌀 SINGULAR VALUE DECOMPOSITION: 4-STAGE GEOMETRIC PIPELINE (A = U Σ Vᵀ)');

        const plotX = leftX + 10;
        const plotY = topY + 36;
        const plotW = totalW - 20;
        const plotH = cardH - 46;

        const s1 = svdSingular1;
        const s2 = svdSingular2;
        const vAngle = 0.45;
        const uAngle = 0.72;

        const stageW = (plotW - 60) / 4;
        const stageCy = plotY + (plotH - 80) / 2 + 10;
        const rUnit = stageW * 0.38;

        withPlotBoxClip(ctx, plotX, plotY, plotW, plotH, 6, () => {
          const stages = [
            { num: 1, title: '1. Domain S¹ (Basis V)', desc: 'Unit Circle {x : ||x||=1}', rot: vAngle, sx: 1.0, sy: 1.0 },
            { num: 2, title: '2. Rotation Vᵀ', desc: 'Aligns with canonical axes', rot: 0, sx: 1.0, sy: 1.0 },
            { num: 3, title: '3. Scaling Σ', desc: `Stretched by (σ₁=${s1.toFixed(1)}, σ₂=${s2.toFixed(1)})`, rot: 0, sx: s1 / 1.8, sy: s2 / 1.8 },
            { num: 4, title: '4. Range Ellipse (U)', desc: 'Final Matrix Action Ax = UΣVᵀx', rot: uAngle, sx: s1 / 1.8, sy: s2 / 1.8 }
          ];

          stages.forEach((st, idx) => {
            const stCx = plotX + 15 + idx * (stageW + 15) + stageW / 2;

            // Stage Card Background
            ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
            ctx.strokeStyle = theme.plotBoxBorder;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(stCx - stageW / 2, plotY + 10, stageW, plotH - 95, 6);
            ctx.fill(); ctx.stroke();

            // Stage Title
            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#fbbf24';
            ctx.fillText(st.title, stCx - stageW / 2 + 8, plotY + 26);
            ctx.font = '8px monospace';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(st.desc, stCx - stageW / 2 + 8, plotY + 38);

            // Subspace Axes
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(stCx - stageW / 2 + 6, stageCy); ctx.lineTo(stCx + stageW / 2 - 6, stageCy);
            ctx.moveTo(stCx, stageCy - rUnit * 1.3); ctx.lineTo(stCx, stageCy + rUnit * 1.3);
            ctx.stroke();

            // Transformed Geometry
            ctx.save();
            ctx.translate(stCx, stageCy);
            ctx.rotate(st.rot);

            ctx.strokeStyle = idx === 3 ? '#d946ef' : (idx === 2 ? '#38bdf8' : 'rgba(56, 189, 248, 0.6)');
            ctx.lineWidth = idx === 3 ? 3 : 2;
            if (idx === 3) {
              ctx.shadowColor = '#d946ef';
              ctx.shadowBlur = 8;
            }
            ctx.beginPath();
            ctx.ellipse(0, 0, rUnit * st.sx, rUnit * st.sy, 0, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Vector 1 (Major axis)
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(rUnit * st.sx, 0); ctx.stroke();
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath(); ctx.arc(rUnit * st.sx, 0, 3.5, 0, 2 * Math.PI); ctx.fill();

            // Vector 2 (Minor axis)
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(0, -rUnit * st.sy); ctx.stroke();
            ctx.fillStyle = '#c084fc';
            ctx.beginPath(); ctx.arc(0, -rUnit * st.sy, 3.5, 0, 2 * Math.PI); ctx.fill();

            ctx.restore();

            // Inter-stage flow arrow
            if (idx < 3) {
              const arrowX = stCx + stageW / 2 + 7.5;
              ctx.fillStyle = '#34d399';
              ctx.font = 'bold 12px sans-serif';
              ctx.fillText('→', arrowX - 6, stageCy + 4);
            }
          });

          // Bottom SVD Formula HUD Box
          const hudY = plotY + plotH - 75;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.strokeStyle = theme.plotBoxBorder;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(plotX + 10, hudY, plotW - 20, 68, 6);
          ctx.fill(); ctx.stroke();

          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#fbbf24';
          ctx.fillText('GILBERT STRANG SVD FACTORIZATION:', plotX + 20, hudY + 18);

          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(`A = [U] · [Σ] · [Vᵀ]  =  [Rot(${uAngle.toFixed(2)})] · [diag(${s1.toFixed(2)}, ${s2.toFixed(2)})] · [Rot(-${vAngle.toFixed(2)})]`, plotX + 20, hudY + 36);

          const condNum = s1 / Math.max(0.01, s2);
          const frobNorm = Math.sqrt(s1 * s1 + s2 * s2);
          ctx.fillStyle = '#34d399';
          ctx.fillText(`Condition Number κ(A) = σ₁/σ₂ = ${condNum.toFixed(2)} | Frobenius Norm ||A||_F = ${frobNorm.toFixed(2)}`, plotX + 20, hudY + 54);
        });
      }

      ctx.restore();
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [
    selectedModel,
    isSimulating,
    canvasAtmosphere,
    rotX,
    rotY,
    cltPopDist,
    cltSampleSize,
    cltDrawSpeed,
    drawCltBatch,
    hypoEffectSize,
    hypoSampleSize,
    hypoTails,
    hypoObservedZ,
    mleSampleMean,
    mleSampleStd,
    mapPriorMean,
    mapPriorWeight,
    mcStateDist,
    bayesPriorAlpha,
    bayesPriorBeta,
    bayesFlipsHeads,
    bayesFlipsTails,
    bayesTrueTheta,
    optLossSurface,
    optLearningRate,
    optMomentumBeta,
    newtonCurrentX,
    newtonDamping,
    lagrangeLevelC,
    lagrangeLambda,
    lpC1,
    lpC2,
    lpB1,
    lpB2,
    lpOptType,
    pcaCorrelation,
    pcaVarX,
    pcaVarY,
    pcaExplainedVar,
    ldaPlacementClass,
    mcmcProposalStd,
    bootCI95,
    svdSingular1,
    svdSingular2,
    simMode,
    simSpeed,
    mleMapViewMode
  ]);

  const activeModelMeta = STAT_OPT_MODELS.find(m => m.id === selectedModel) || STAT_OPT_MODELS[0];

  const liveDynamicFormula = useMemo(() => {
    switch (selectedModel) {
      case 'clt_sampling':
        return `\\bar{X}_{${cltSampleSize}} \\sim \\mathcal{N}\\left(\\mu, \\frac{\\sigma^2}{${cltSampleSize}}\\right) \\quad [\\text{SE}=${(0.55 / Math.sqrt(cltSampleSize)).toFixed(3)}, \\text{Draws}=${cltTotalDraws}]`;
      case 'hypothesis_power': {
        const zCrit = getHypoZCrit(hypoAlpha, hypoTails);
        return `Z_{\\text{obs}} = ${hypoObservedZ > 0 ? '+' : ''}${hypoObservedZ.toFixed(2)} \\quad [Z_{\\text{crit}}=${hypoTails === 'two' ? `\\pm ${zCrit.toFixed(2)}` : `+${zCrit.toFixed(2)}`}, \\alpha=${hypoAlpha}]`;
      }
      case 'mle_map':
        return `\\hat{\\theta}_{\\text{MAP}} = \\frac{N\\bar{X} + \\lambda\\mu_0}{N + \\lambda} \\quad [\\bar{X}=${mleSampleMean.toFixed(2)}, \\mu_0=${mapPriorMean.toFixed(2)}]`;
      case 'em_gmm':
        return `\\gamma_{ik} = \\frac{\\pi_k \\mathcal{N}(x_i \\mid \\mu_k, \\sigma_k^2)}{\\sum_j \\pi_j \\mathcal{N}(x_i \\mid \\mu_j, \\sigma_j^2)} \\quad [\\text{Iter}=${emIterations}]`;
      case 'mcmc_metropolis':
        return `\\alpha(x_t, x^*) = \\min\\left(1, \\frac{\\pi(x^*)}{\\pi(x_t)}\\right) \\quad [\\text{Accept}=${mcmcTotalSamples > 0 ? ((stateRef.current.mcmcHistory.filter(h => h.accepted).length / mcmcTotalSamples) * 100).toFixed(1) : 0}\\%]`;
      case 'bootstrap_resampling':
        return `\\hat{\\theta}^*_b = g(X^{*b}) \\quad [B=${bootNumReplicas}, \\text{CI}_{95\\%} = [q_{0.025}, q_{0.975}]]`;
      case 'markov_chains':
        return `\\pi P = \\pi \\implies \\pi = [${mcStateDist.map(v => v.toFixed(2)).join(', ')}] \\quad [\\text{Steps}=${mcStepCount}]`;
      case 'bayesian_beta_binomial':
        return `\\text{Beta}(\\alpha + k, \\beta + n - k) \\quad [\\alpha=${bayesPriorAlpha + bayesFlipsHeads}, \\beta=${bayesPriorBeta + bayesFlipsTails}]`;
      case 'first_order_optimizers':
        return `\\theta_{t+1} = \\theta_t - \\eta \\cdot \\frac{\\hat{m}_t}{\\sqrt{\\hat{v}_t} + \\epsilon} \\quad [\\eta=${optLearningRate}, \\text{Surface}=\\text{${optLossSurface.toUpperCase()}}]`;
      case 'newton_raphson':
        return `x_{t+1} = x_t - \\left[\\nabla^2 f(x_t)\\right]^{-1} \\nabla f(x_t) \\quad [x=${newtonCurrentX.toFixed(3)}]`;
      case 'lagrange_kkt':
        return `\\nabla f(x^*) + \\lambda \\nabla g(x^*) = 0 \\quad [\\lambda^*=${(lagrangeLevelC * 0.85).toFixed(2)}]`;
      case 'linear_programming_simplex':
        return `\\max \\; c^T x \\;\\text{s.t.}\\; Ax \\le b \\quad [Z^*=${(lpC1 * 1.8 + lpC2 * 1.5).toFixed(1)}]`;
      case 'pca_projection':
        return `\\Sigma u_1 = \\lambda_1 u_1 \\quad [\\text{Explained Var}=${pcaExplainedVar}\\%]`;
      case 'fisher_lda':
        return `w^* = S_W^{-1} (\\mu_1 - \\mu_2) \\quad [J(w)=${ldaSeparability.toFixed(2)}]`;
      case 'svd_decomposition':
        return `A = U \\mathbf{\\Sigma} V^T \\quad [\\sigma_1=${svdSingular1.toFixed(2)}, \\sigma_2=${svdSingular2.toFixed(2)}]`;
      default:
        return activeModelMeta?.formula || '\\hat{\\theta} = f(X)';
    }
  }, [
    selectedModel,
    cltSampleSize,
    cltTotalDraws,
    hypoObservedZ,
    hypoAlpha,
    mleSampleMean,
    mapPriorMean,
    emIterations,
    mcmcTotalSamples,
    bootNumReplicas,
    mcStateDist,
    mcStepCount,
    bayesPriorAlpha,
    bayesPriorBeta,
    bayesFlipsHeads,
    bayesFlipsTails,
    optLearningRate,
    optLossSurface,
    newtonCurrentX,
    lagrangeLevelC,
    lpC1,
    lpC2,
    pcaExplainedVar,
    ldaSeparability,
    svdSingular1,
    svdSingular2,
    activeModelMeta.formula
  ]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        height: '100%',
        minHeight: 0,
        flex: 1,
        color: 'var(--text-primary, #f8fafc)',
        userSelect: 'none'
      }}
    >
      {/* ─── Top Category / Pillar Bar ─── */}
      {/* ─── Top Control Bar: Pillar Selector + Model Dropdown + Global Actions ─── */}
      <div
        className="dsa-header-card stat-opt-top-command-bar"
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '5px 12px',
          background: 'var(--card-bg, rgba(15, 23, 42, 0.88))',
          borderRadius: '10px',
          border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))',
          backdropFilter: 'blur(10px)',
          minWidth: 0,
          maxWidth: '100%',
          flexShrink: 0,
          overflowX: 'auto'
        }}
      >
        {/* Left: Compact Model Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
            MODEL:
          </span>
          <select
            value={selectedModel}
            onChange={(e) => {
              const newModelId = e.target.value as StatOptModelType;
              setSelectedModel(newModelId);
              const found = STAT_OPT_MODELS.find(m => m.id === newModelId);
              if (found) setActivePillar(found.pillar);
            }}
            className="dsa-select-control"
            style={{
              minHeight: '32px',
              padding: '3px 8px',
              borderRadius: '7px',
              background: 'var(--dropdown-bg, rgba(30, 41, 59, 0.95))',
              border: '1.5px solid var(--accent-cyan, #38bdf8)',
              color: 'var(--text-primary, #f8fafc)',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 0 8px rgba(56, 189, 248, 0.25)',
              width: '260px',
              maxWidth: '320px',
              textOverflow: 'ellipsis'
            }}
          >
            <optgroup label="1. 📊 Statistical Inference & Sampling">
              <option value="clt_sampling">Central Limit Theorem (Sampling Distributions)</option>
              <option value="hypothesis_power">Hypothesis Testing & Power (Z-Test, T-Test, Type I/II)</option>
              <option value="mle_map">Maximum Likelihood vs MAP Estimation</option>
              <option value="em_gmm">Expectation-Maximization (Gaussian Mixture Models)</option>
              <option value="mcmc_metropolis">MCMC Metropolis-Hastings Sampling</option>
              <option value="bootstrap_resampling">Bootstrap Resampling (Empirical Confidence)</option>
            </optgroup>
            <optgroup label="2. 🎲 Stochastic Processes & Bayesian Probability">
              <option value="markov_chains">Markov Chains (State Transitions & Stationary π)</option>
              <option value="bayesian_beta_binomial">Bayesian Beta-Binomial Conjugate Updating</option>
            </optgroup>
            <optgroup label="3. ⚡ Continuous & Numerical Optimization">
              <option value="first_order_optimizers">Gradient Descent Variants (SGD, Momentum, Adam)</option>
              <option value="newton_raphson">Newton-Raphson Optimization (Quadratic Fit)</option>
              <option value="lagrange_kkt">Lagrange Multipliers (Constrained Contours)</option>
            </optgroup>
            <optgroup label="4. 📐 Operations Research & Matrix Decompositions">
              <option value="linear_programming_simplex">Simplex Linear Programming (Feasible Polytope)</option>
              <option value="pca_projection">PCA Variance Projection (Principal Components)</option>
              <option value="fisher_lda">Linear Discriminant Analysis (Fisher Criterion)</option>
              <option value="svd_decomposition">Singular Value Decomposition (A = U Σ Vᵀ)</option>
            </optgroup>
          </select>
        </div>

        {/* Middle: Interactive vs Autoplay Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(30, 41, 59, 0.7)', padding: '2px 4px', borderRadius: '8px', border: '1px solid rgba(51, 65, 85, 0.6)', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setSimMode('interactive')}
            style={{
              height: '26px',
              padding: '0 8px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: simMode === 'interactive' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              color: simMode === 'interactive' ? '#38bdf8' : '#94a3b8'
            }}
            title="Manual Interactive Mode (Direct Parameter Manipulation & Click-to-Add Points)"
          >
            <MousePointer size={12} />
            <span>Interactive</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSimMode('autoplay');
              if (!isSimulating) setIsSimulating(true);
            }}
            style={{
              height: '26px',
              padding: '0 8px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: simMode === 'autoplay' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              color: simMode === 'autoplay' ? '#c084fc' : '#94a3b8'
            }}
            title="Live Autoplay Mode (Automated continuous dynamic parameter sweeping & sampling loops)"
          >
            <Sparkles size={12} />
            <span>Autoplay</span>
          </button>
        </div>

        {/* Speed Multipliers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(30, 41, 59, 0.7)', padding: '2px 4px', borderRadius: '8px', border: '1px solid rgba(51, 65, 85, 0.6)', flexShrink: 0 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', padding: '0 4px' }}>SPD:</span>
          {([0.5, 1.0, 2.0] as const).map(spd => (
            <button
              key={spd}
              type="button"
              onClick={() => setSimSpeed(spd)}
              style={{
                height: '24px',
                padding: '0 6px',
                borderRadius: '5px',
                border: 'none',
                fontSize: '0.70rem',
                fontWeight: 800,
                cursor: 'pointer',
                background: simSpeed === spd ? 'rgba(52, 211, 153, 0.25)' : 'transparent',
                color: simSpeed === spd ? '#34d399' : '#94a3b8'
              }}
              title={`Set Simulation Speed to ${spd}x`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Dynamic Context Controls */}
        {selectedModel === 'mle_map' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(30, 41, 59, 0.7)', padding: '2px 4px', borderRadius: '8px', border: '1px solid rgba(51, 65, 85, 0.6)', flexShrink: 0 }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', padding: '0 4px' }}>VIEW:</span>
            <button
              type="button"
              onClick={() => setMleMapViewMode('triad')}
              style={{
                height: '24px',
                padding: '0 6px',
                borderRadius: '5px',
                border: 'none',
                fontSize: '0.70rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: mleMapViewMode === 'triad' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                color: mleMapViewMode === 'triad' ? '#38bdf8' : '#94a3b8'
              }}
              title="Show Comparative Triad (Prior + Likelihood + Posterior Together)"
            >
              Triad (All)
            </button>
            <button
              type="button"
              onClick={() => setMleMapViewMode('mle_only')}
              style={{
                height: '24px',
                padding: '0 6px',
                borderRadius: '5px',
                border: 'none',
                fontSize: '0.70rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: mleMapViewMode === 'mle_only' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                color: mleMapViewMode === 'mle_only' ? '#38bdf8' : '#94a3b8'
              }}
              title="Isolate Pure Frequentist Maximum Likelihood Estimation (MLE)"
            >
              MLE Only
            </button>
            <button
              type="button"
              onClick={() => setMleMapViewMode('map_only')}
              style={{
                height: '24px',
                padding: '0 6px',
                borderRadius: '5px',
                border: 'none',
                fontSize: '0.70rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: mleMapViewMode === 'map_only' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                color: mleMapViewMode === 'map_only' ? '#10b981' : '#94a3b8'
              }}
              title="Isolate Bayesian Maximum A Posteriori (MAP) with Regularizing Prior"
            >
              MAP Only
            </button>
          </div>
        )}

        {selectedModel === 'fisher_lda' && simMode === 'interactive' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(30, 41, 59, 0.7)', padding: '2px 4px', borderRadius: '8px', border: '1px solid rgba(51, 65, 85, 0.6)', flexShrink: 0 }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', padding: '0 4px' }}>PLACE:</span>
            <button
              type="button"
              onClick={() => setLdaPlacementClass(0)}
              style={{
                height: '24px',
                padding: '0 6px',
                borderRadius: '5px',
                border: 'none',
                fontSize: '0.70rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: ldaPlacementClass === 0 ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                color: ldaPlacementClass === 0 ? '#38bdf8' : '#94a3b8'
              }}
              title="Click on Left Canvas to Place Class 0 Sample Points"
            >
              ● Class 0
            </button>
            <button
              type="button"
              onClick={() => setLdaPlacementClass(1)}
              style={{
                height: '24px',
                padding: '0 6px',
                borderRadius: '5px',
                border: 'none',
                fontSize: '0.70rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: ldaPlacementClass === 1 ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                color: ldaPlacementClass === 1 ? '#f59e0b' : '#94a3b8'
              }}
              title="Click on Left Canvas to Place Class 1 Sample Points"
            >
              ▲ Class 1
            </button>
          </div>
        )}

        {/* Middle & Right: Transport Buttons & Collapsible Sidebar Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Simulation Transport */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <button
              type="button"
              onClick={() => setIsSimulating(!isSimulating)}
              className="dsa-action-btn"
              style={{
                height: '30px',
                padding: '0 10px',
                background: isSimulating ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: isSimulating ? '#f87171' : '#34d399',
                border: isSimulating ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)'
              }}
              title={isSimulating ? 'Pause Loop' : 'Run Live'}
            >
              {isSimulating ? <Pause size={13} /> : <Play size={13} />}
              <span className="dsa-btn-label">{isSimulating ? 'Pause' : 'Run'}</span>
            </button>

            <button
              type="button"
              onClick={performStep}
              className="dsa-action-btn"
              style={{
                height: '30px',
                padding: '0 10px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent-cyan, #38bdf8)',
                border: '1px solid var(--accent-cyan, rgba(56, 189, 248, 0.4))'
              }}
              title="Step Simulation Forward (+1)"
            >
              <ChevronRight size={13} />
              <span className="dsa-btn-label">Step +1</span>
            </button>

            <button
              type="button"
              onClick={reseedData}
              className="dsa-action-btn"
              style={{
                height: '30px',
                padding: '0 10px',
                background: 'var(--bg-tertiary, rgba(51, 65, 85, 0.5))',
                color: 'var(--text-secondary, #cbd5e1)',
                border: '1px solid var(--border-color, rgba(100, 116, 139, 0.4))'
              }}
              title="Reset Simulation & Reseed"
            >
              <RotateCcw size={13} />
              <span className="dsa-btn-label">Reset</span>
            </button>
          </div>

          <div style={{ width: '1px', height: '18px', background: 'var(--border-color, rgba(51, 65, 85, 0.6))', margin: '0 2px' }} />

          {/* Collapsible Sidebar Toggle Pill */}
          <button
            type="button"
            onClick={() => setDesktopTab(desktopTab === 'focus' ? 'split' : 'focus')}
            style={{
              height: '30px',
              padding: '0 10px',
              borderRadius: '7px',
              fontSize: '0.74rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: desktopTab !== 'focus' ? '1px solid var(--accent-cyan, #38bdf8)' : '1px solid var(--border-color, rgba(51, 65, 85, 0.8))',
              background: desktopTab !== 'focus' ? 'var(--pill-active-bg, rgba(56, 189, 248, 0.22))' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))',
              color: desktopTab !== 'focus' ? 'var(--accent-cyan, #38bdf8)' : 'var(--text-secondary, #94a3b8)',
              transition: 'all 0.15s ease'
            }}
            title={desktopTab === 'focus' ? 'Expand Controls & Telemetry Panel' : 'Collapse Sidebar to Full-Bleed Canvas'}
          >
            {desktopTab === 'focus' ? <PanelRightOpen size={14} /> : <PanelRightClose size={14} />}
            <span>{desktopTab === 'focus' ? 'Expand Controls' : 'Hide Sidebar'}</span>
          </button>
        </div>
      </div>

      {/* ─── Mobile Segmented 3-Pill Switcher ─── */}
      <div className="stat-opt-mobile-tab-nav">
        <button
          type="button"
          onClick={() => setMobileActiveTab('canvas')}
          className={`stat-opt-mobile-tab-btn ${mobileActiveTab === 'canvas' ? 'active' : ''}`}
        >
          <BarChart2 size={14} />
          <span>Simulation Canvas</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab('controls')}
          className={`stat-opt-mobile-tab-btn ${mobileActiveTab === 'controls' ? 'active' : ''}`}
        >
          <Sliders size={14} />
          <span>Model Parameters</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab('telemetry')}
          className={`stat-opt-mobile-tab-btn ${mobileActiveTab === 'telemetry' ? 'active' : ''}`}
        >
          <Sparkles size={14} />
          <span>Telemetry & Theory</span>
        </button>
      </div>

      {/* ─── Main 2-Column Lab Grid ─── */}
      <div
        className={`stat-opt-workbench-grid ${desktopTab === 'focus' ? 'desktop-focus-canvas' : ''}`}
        style={{
          gridTemplateColumns: desktopTab === 'focus' ? '1fr' : desktopTab === 'split' ? 'minmax(0, 1fr) 360px' : 'minmax(0, 1fr) 320px'
        }}
      >
        {/* Left Interactive Canvas Viewport */}
        <div className={`stat-opt-canvas-panel ${mobileActiveTab === 'canvas' ? 'mobile-active' : 'mobile-hidden'}`}>
          <canvas
            ref={canvasRef}
            width={900}
            height={660}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              cursor: is3DModel ? 'grab' : 'crosshair'
            }}
          />

          {/* In-Canvas Dynamic KaTeX HUD Overlay */}
          <div className={`canvas-katex-hud-overlay ${isHudMinimized ? 'minimized' : ''}`}>
            <div className="hud-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{activeModelMeta.name}</span>
                {!isHudMinimized && <span className="hud-badge">{activePillar.toUpperCase().replace('_', ' ')}</span>}
              </div>
              <button
                type="button"
                className="hud-toggle-btn"
                onClick={() => setIsHudMinimized(prev => !prev)}
                title={isHudMinimized ? 'Expand Math Formula HUD' : 'Minimize Math Formula HUD'}
              >
                {isHudMinimized ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
            </div>
            {!isHudMinimized && (
              <div
                className="hud-latex-render"
                dangerouslySetInnerHTML={{
                  __html: katex.renderToString(liveDynamicFormula, { throwOnError: false, displayMode: false })
                }}
              />
            )}
          </div>

          {/* 3D Orbit Perspective Indicator Badge */}
          {is3DModel && (
            <div className="canvas-3d-orbit-hint">
              <Compass size={14} color="#38bdf8" />
              <span>3D Orbit: {Math.round(rotY)}° Yaw / {Math.round(rotX)}° Pitch</span>
              <button
                type="button"
                onClick={() => {
                  setRotX(32);
                  setRotY(45);
                }}
                title="Reset 3D Perspective"
              >
                <RefreshCw size={10} style={{ display: 'inline', marginRight: '3px' }} />
                Reset
              </button>
            </div>
          )}

          {/* Floating Instructions Banner */}
          <div
            style={{
              position: 'absolute',
              bottom: is3DModel ? '44px' : '12px',
              left: '12px',
              padding: '6px 12px',
              background: 'var(--card-bg, rgba(15, 23, 42, 0.9))',
              backdropFilter: 'blur(8px)',
              borderRadius: '8px',
              border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))',
              fontSize: '0.72rem',
              color: 'var(--text-secondary, #94a3b8)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              maxWidth: 'calc(100% - 24px)',
              zIndex: 5
            }}
          >
            <MousePointer size={13} color="#38bdf8" />
            <span>
              {selectedModel === 'clt_sampling' && '💡 Click canvas or draw batch • Observe Bell curve overlay'}
              {selectedModel === 'hypothesis_power' && '💡 Click/drag canvas to reposition Observed Test Statistic Z'}
              {selectedModel === 'markov_chains' && '💡 Watch probability particles flow between state nodes'}
              {selectedModel === 'bayesian_beta_binomial' && '💡 Flip coins or run bursts • Watch Beta curve shift'}
              {selectedModel === 'linear_programming_simplex' && '💡 Feasible polygon corner points & sweeping line'}
              {selectedModel === 'pca_projection' && '💡 Click to add data points • PC₁ maximizes variance'}
              {selectedModel === 'first_order_optimizers' && '💡 Drag to orbit 3D loss surface • Watch all 4 optimizers race'}
              {selectedModel === 'newton_raphson' && '💡 Drag to orbit 3D surface • Hessian quadratic Taylor jump'}
              {selectedModel === 'lagrange_kkt' && '💡 Drag to orbit • Tangency point: ∇f is collinear to λ∇g'}
              {selectedModel === 'mle_map' && '💡 Click canvas to add sample points • Bayesian Shrinkage'}
              {selectedModel === 'em_gmm' && '💡 E-Step (responsibilities) & M-Step (parameters)'}
              {selectedModel === 'mcmc_metropolis' && '💡 Green = Accepted jumps • Red = Rejected proposals'}
              {selectedModel === 'bootstrap_resampling' && '💡 95% Percentile Confidence Band [q0.025, q0.975]'}
              {selectedModel === 'fisher_lda' && '💡 Maximizing between-class over within-class scatter'}
              {selectedModel === 'svd_decomposition' && '💡 Drag to orbit 3D transformation A = U Σ Vᵀ'}
            </span>
          </div>

          {/* Floating Pill for Fisher LDA */}
          {selectedModel === 'fisher_lda' && (
            <div
              style={{
                position: 'absolute',
                top: '54px',
                right: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 6px',
                background: 'var(--card-bg, rgba(15, 23, 42, 0.9))',
                borderRadius: '8px',
                border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))',
                zIndex: 10
              }}
            >
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>Add:</span>
              <button
                type="button"
                onClick={() => setLdaPlacementClass(0)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: ldaPlacementClass === 0 ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  border: ldaPlacementClass === 0 ? '1px solid #38bdf8' : '1px solid transparent',
                  color: ldaPlacementClass === 0 ? '#38bdf8' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                ● Class 0
              </button>
              <button
                type="button"
                onClick={() => setLdaPlacementClass(1)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: ldaPlacementClass === 1 ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                  border: ldaPlacementClass === 1 ? '1px solid #f59e0b' : '1px solid transparent',
                  color: ldaPlacementClass === 1 ? '#f59e0b' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                ● Class 1
              </button>
            </div>
          )}
        </div>

        {/* Right Telemetry, Controls & Exam Notes Panel */}
        {desktopTab !== 'focus' && (
          <div className={`stat-opt-controls-panel ${mobileActiveTab !== 'canvas' ? 'mobile-active' : 'mobile-hidden'}`}>
            {/* Header with Segmented View Switcher & Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))', paddingBottom: '8px', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <Activity size={15} color="var(--accent-cyan, #38bdf8)" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', margin: 0, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeModelMeta.name}
                  </h4>
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary, #94a3b8)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeModelMeta.pillarTitle}</span>
                </div>
              </div>

              {/* Segmented Mode Selector + Close Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <div style={{ display: 'flex', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.7))', padding: '2px', borderRadius: '7px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                  <button
                    type="button"
                    onClick={() => setDesktopTab('parameters')}
                    style={{
                      padding: '3px 7px',
                      borderRadius: '5px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      border: desktopTab === 'parameters' ? '1px solid var(--accent-cyan, #38bdf8)' : '1px solid transparent',
                      background: desktopTab === 'parameters' ? 'var(--pill-active-bg, rgba(56, 189, 248, 0.25))' : 'transparent',
                      color: desktopTab === 'parameters' ? 'var(--accent-cyan, #38bdf8)' : 'var(--text-secondary, #94a3b8)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                    title="Show Parameters only"
                  >
                    <Sliders size={11} />
                    <span>Controls</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDesktopTab('telemetry')}
                    style={{
                      padding: '3px 7px',
                      borderRadius: '5px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      border: desktopTab === 'telemetry' ? '1px solid var(--accent-cyan, #38bdf8)' : '1px solid transparent',
                      background: desktopTab === 'telemetry' ? 'var(--pill-active-bg, rgba(56, 189, 248, 0.25))' : 'transparent',
                      color: desktopTab === 'telemetry' ? 'var(--accent-cyan, #38bdf8)' : 'var(--text-secondary, #94a3b8)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                    title="Show Telemetry & Proofs only"
                  >
                    <Activity size={11} />
                    <span>Telemetry</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDesktopTab('split')}
                    style={{
                      padding: '3px 7px',
                      borderRadius: '5px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      border: desktopTab === 'split' ? '1px solid var(--accent-cyan, #38bdf8)' : '1px solid transparent',
                      background: desktopTab === 'split' ? 'var(--pill-active-bg, rgba(56, 189, 248, 0.25))' : 'transparent',
                      color: desktopTab === 'split' ? 'var(--accent-cyan, #38bdf8)' : 'var(--text-secondary, #94a3b8)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                    title="Show Both Controls & Telemetry"
                  >
                    <Layout size={11} />
                    <span>Both</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setDesktopTab('focus')}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))',
                    border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))',
                    color: 'var(--text-secondary, #94a3b8)',
                    cursor: 'pointer'
                  }}
                  title="Collapse Sidebar"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* TELEMETRY CARDS */}
            {(desktopTab === 'telemetry' || desktopTab === 'split') && (
              <div className={`stat-opt-card-telemetry ${mobileActiveTab === 'telemetry' ? 'mobile-card-visible' : 'mobile-card-hidden'}`} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {selectedModel === 'clt_sampling' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Parent Dist:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', textTransform: 'capitalize' }}>{cltPopDist}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Sample Size (N):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{cltSampleSize}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Total Draws:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{cltTotalDraws}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Std Error (σ/√N):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>{(0.55 / Math.sqrt(cltSampleSize)).toFixed(3)}</div>
              </div>
            </div>
          )}

          {selectedModel === 'hypothesis_power' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Significance (α):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ef4444', fontFamily: 'monospace' }}>{hypoAlpha}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Effect Size (d):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#a855f7', fontFamily: 'monospace' }}>{hypoEffectSize}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Observed Z:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>{hypoObservedZ.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Decision:</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: (hypoTails === 'two' ? Math.abs(hypoObservedZ) >= getHypoZCrit(hypoAlpha, hypoTails) : hypoObservedZ >= getHypoZCrit(hypoAlpha, hypoTails)) ? '#22c55e' : '#ef4444' }}>
                  {(hypoTails === 'two' ? Math.abs(hypoObservedZ) >= getHypoZCrit(hypoAlpha, hypoTails) : hypoObservedZ >= getHypoZCrit(hypoAlpha, hypoTails)) ? 'REJECT H₀ (Sig)' : 'FAIL TO REJECT'}
                </div>
              </div>
            </div>
          )}

          {selectedModel === 'linear_programming_simplex' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Objective:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#eab308' }}>{lpOptType.toUpperCase()} Z = {lpC1}x₁ + {lpC2}x₂</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Constraint 1:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>2x₁ + x₂ ≤ {lpB1}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Constraint 2:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>x₁ + 2x₂ ≤ {lpB2}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Optimum Vertex:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#22c55e' }}>Point C (Simplex)</div>
              </div>
            </div>
          )}

          {selectedModel === 'bayesian_beta_binomial' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Flips (H / T):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8' }}>{bayesFlipsHeads} Heads / {bayesFlipsTails} Tails</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>MLE θ̂ = k/n:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace' }}>{(bayesFlipsHeads / (bayesFlipsHeads + bayesFlipsTails || 1)).toFixed(3)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Prior Beta:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a855f7' }}>Beta({bayesPriorAlpha}, {bayesPriorBeta})</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Posterior Mean:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', fontFamily: 'monospace' }}>{((bayesPriorAlpha + bayesFlipsHeads) / (bayesPriorAlpha + bayesPriorBeta + bayesFlipsHeads + bayesFlipsTails)).toFixed(3)}</div>
              </div>
            </div>
          )}

          {selectedModel === 'pca_projection' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Correlation ρ:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{pcaCorrelation}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>PC₁ Var Explained:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#22c55e', fontFamily: 'monospace' }}>{pcaExplainedVar}%</div>
              </div>
            </div>
          )}

          {selectedModel === 'mle_map' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Sample Mean (MLE):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{mleSampleMean.toFixed(3)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Prior Mean:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace' }}>{mapPriorMean.toFixed(2)}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Log-Likelihood ln L(θ):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{mleLogLikelihood.toFixed(2)}</div>
              </div>
            </div>
          )}

          {selectedModel === 'em_gmm' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>EM Iterations:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{emIterations}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Log-Likelihood:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{emLogLikelihood.toFixed(2)}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Status:</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: emConverged ? '#22c55e' : '#f59e0b' }}>
                  {emConverged ? '✓ Converged to Local Maximum' : 'Iterating E-Step & M-Step...'}
                </div>
              </div>
            </div>
          )}

          {selectedModel === 'mcmc_metropolis' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Acceptance Rate:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{mcmcAcceptanceRate}%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Proposal Std (σ_prop):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{mcmcProposalStd}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Total Samples:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>{mcmcTotalSamples} Samples Drawn</div>
              </div>
            </div>
          )}

          {selectedModel === 'bootstrap_resampling' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Replicas (B):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{bootNumReplicas}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Bootstrap Mean:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{bootMeanEstimate.toFixed(3)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Std Error (SE_B):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{bootStdError.toFixed(3)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>95% Percentile CI:</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>[{bootCI95.low.toFixed(2)}, {bootCI95.high.toFixed(2)}]</div>
              </div>
            </div>
          )}

          {selectedModel === 'markov_chains' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Step Count (t):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{mcStepCount}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>P₁₂ (Bull → Bear):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace' }}>{mcP12}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>P₂₃ (Bear → Stagnant):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a855f7', fontFamily: 'monospace' }}>{mcP23}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>P₃₁ (Stagnant → Bull):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>{mcP31}</div>
              </div>
            </div>
          )}

          {selectedModel === 'first_order_optimizers' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Active Surface:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', textTransform: 'capitalize' }}>{optLossSurface}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Learning Rate (η):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{optLearningRate}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Momentum β:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{optMomentumBeta}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Racers Legend:</div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                  <span style={{ color: '#ef4444' }}>● SGD</span>
                  <span style={{ color: '#f59e0b' }}>● Mom</span>
                  <span style={{ color: '#06b6d4' }}>● RMS</span>
                  <span style={{ color: '#a855f7' }}>● Adam</span>
                </div>
              </div>
            </div>
          )}

          {selectedModel === 'newton_raphson' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Newton Steps:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{newtonStepCount}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Current x_k:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{newtonCurrentX.toFixed(4)}</div>
              </div>
            </div>
          )}

          {selectedModel === 'lagrange_kkt' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Constraint Radius c:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ec4899', fontFamily: 'monospace' }}>{lagrangeLevelC}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Multiplier λ:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{lagrangeLambda}</div>
              </div>
            </div>
          )}

          {selectedModel === 'fisher_lda' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Scatter Ratio J(w):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{ldaSeparability}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Active Class:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: ldaPlacementClass === 0 ? '#38bdf8' : '#f59e0b' }}>
                  Class {ldaPlacementClass}
                </div>
              </div>
            </div>
          )}

          {selectedModel === 'svd_decomposition' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Singular Value σ₁:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#d946ef', fontFamily: 'monospace' }}>{svdSingular1}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Singular Value σ₂:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{svdSingular2}</div>
              </div>
            </div>
          )}
          </div>
          )}

          {/* DYNAMIC CONTROLS SECTION */}
          {(desktopTab === 'parameters' || desktopTab === 'split') && (
            <div className={`stat-opt-card-params ${mobileActiveTab === 'controls' ? 'mobile-card-visible' : 'mobile-card-hidden'}`} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary, #cbd5e1)' }}>
                <Sliders size={13} color="var(--accent-cyan, #38bdf8)" />
                <span>Interactive Controls</span>
              </div>

            {selectedModel === 'clt_sampling' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Parent Population Shape</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                    {(['uniform', 'exponential', 'bimodal', 'triangular'] as const).map(shape => (
                      <button
                        key={shape}
                        type="button"
                        onClick={() => {
                          setCltPopDist(shape);
                          stateRef.current.cltMeans = [];
                          stateRef.current.cltHistogram = new Array(50).fill(0);
                          setCltTotalDraws(0);
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          background: cltPopDist === shape ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))',
                          color: cltPopDist === shape ? '#38bdf8' : 'var(--text-secondary, #94a3b8)',
                          border: cltPopDist === shape ? '1px solid #38bdf8' : '1px solid var(--border-color, rgba(51, 65, 85, 0.6))',
                          cursor: 'pointer'
                        }}
                      >
                        {shape}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Sample Size N: <strong>{cltSampleSize}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={cltSampleSize}
                    onChange={e => {
                      setCltSampleSize(Number(e.target.value));
                      stateRef.current.cltMeans = [];
                      stateRef.current.cltHistogram = new Array(50).fill(0);
                      setCltTotalDraws(0);
                    }}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Simulation Speed: <strong>{cltDrawSpeed}x</strong></span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={cltDrawSpeed}
                    onChange={e => setCltDrawSpeed(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => drawCltBatch(10)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      cursor: 'pointer'
                    }}
                  >
                    +10 Draws
                  </button>
                  <button
                    type="button"
                    onClick={() => drawCltBatch(100)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      cursor: 'pointer'
                    }}
                  >
                    +100 Draws
                  </button>
                </div>
              </>
            )}

            {selectedModel === 'hypothesis_power' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Significance Level (α): <strong>{hypoAlpha}</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    {[0.01, 0.05, 0.10].map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setHypoAlpha(a)}
                        style={{
                          flex: 1,
                          padding: '4px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: hypoAlpha === a ? 'rgba(239, 68, 68, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))',
                          color: hypoAlpha === a ? '#ef4444' : 'var(--text-secondary, #94a3b8)',
                          border: hypoAlpha === a ? '1px solid #ef4444' : '1px solid var(--border-color, rgba(51, 65, 85, 0.6))',
                          cursor: 'pointer'
                        }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Hypothesis Tails: <strong>{hypoTails === 'two' ? 'Two-Tailed' : 'One-Tailed'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    {(['two', 'one'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setHypoTails(t)}
                        style={{
                          flex: 1,
                          padding: '4px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: hypoTails === t ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))',
                          color: hypoTails === t ? '#38bdf8' : 'var(--text-secondary, #94a3b8)',
                          border: hypoTails === t ? '1px solid #38bdf8' : '1px solid var(--border-color, rgba(51, 65, 85, 0.6))',
                          cursor: 'pointer'
                        }}
                      >
                        {t === 'two' ? '2-Tailed (±1.96)' : '1-Tailed (+1.645)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Sample Size (n): <strong>{hypoSampleSize}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={hypoSampleSize}
                    onChange={e => setHypoSampleSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Effect Size (Cohen d): <strong>{hypoEffectSize}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={2.0}
                    step={0.1}
                    value={hypoEffectSize}
                    onChange={e => setHypoEffectSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#a855f7' }}
                  />
                </div>
              </>
            )}

            {selectedModel === 'mle_map' && (
              <>
                <DualParamControl
                  label="Sample Spread (σ_sample):"
                  value={mleSampleStd}
                  min={0.15}
                  max={1.0}
                  step={0.05}
                  onChange={setMleSampleStd}
                  color="#38bdf8"
                />

                <DualParamControl
                  label="Bayesian Prior Mean (μ_prior):"
                  value={mapPriorMean}
                  min={-1.5}
                  max={1.5}
                  step={0.1}
                  onChange={setMapPriorMean}
                  color="#f59e0b"
                />

                <DualParamControl
                  label="Prior Regularization Weight:"
                  value={mapPriorWeight}
                  min={0.0}
                  max={1.0}
                  step={0.05}
                  onChange={setMapPriorWeight}
                  color="#f59e0b"
                />
              </>
            )}

            {selectedModel === 'mcmc_metropolis' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Proposal Std (σ_proposal): <strong>{mcmcProposalStd.toFixed(2)}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={1.5}
                    step={0.05}
                    value={mcmcProposalStd}
                    onChange={e => setMcmcProposalStd(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                </div>
              </>
            )}

            {selectedModel === 'bootstrap_resampling' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Number of Replicas (B): <strong>{bootNumReplicas}</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    {[100, 250, 500, 1000].map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBootNumReplicas(b)}
                        style={{
                          flex: 1,
                          padding: '4px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: bootNumReplicas === b ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))',
                          color: bootNumReplicas === b ? '#38bdf8' : 'var(--text-secondary, #94a3b8)',
                          border: bootNumReplicas === b ? '1px solid #38bdf8' : '1px solid var(--border-color, rgba(51, 65, 85, 0.6))',
                          cursor: 'pointer'
                        }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedModel === 'markov_chains' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>P₁₂ (Bull → Bear): <strong>{mcP12}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={0.95}
                    step={0.05}
                    value={mcP12}
                    onChange={e => setMcP12(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>P₂₃ (Bear → Stagnant): <strong>{mcP23}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={0.95}
                    step={0.05}
                    value={mcP23}
                    onChange={e => setMcP23(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#f59e0b' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>P₃₁ (Stagnant → Bull): <strong>{mcP31}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={0.95}
                    step={0.05}
                    value={mcP31}
                    onChange={e => setMcP31(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#a855f7' }}
                  />
                </div>
              </>
            )}

            {selectedModel === 'bayesian_beta_binomial' && (
              <>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleCoinFlip(true)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                      border: '1px solid #38bdf8',
                      cursor: 'pointer'
                    }}
                  >
                    🪙 Flip Heads
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCoinFlip(false)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#f59e0b',
                      border: '1px solid #f59e0b',
                      cursor: 'pointer'
                    }}
                  >
                    🪙 Flip Tails
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleBurstFlips(10)}
                    style={{
                      flex: 1,
                      padding: '5px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      cursor: 'pointer'
                    }}
                  >
                    +10 Flips
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBurstFlips(100)}
                    style={{
                      flex: 1,
                      padding: '5px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: 'rgba(168, 85, 247, 0.2)',
                      color: '#c084fc',
                      border: '1px solid rgba(168, 85, 247, 0.4)',
                      cursor: 'pointer'
                    }}
                  >
                    +100 Flips
                  </button>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Prior Beta(α, β): <strong>Beta({bayesPriorAlpha}, {bayesPriorBeta})</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={bayesPriorAlpha}
                      onChange={e => setBayesPriorAlpha(Number(e.target.value))}
                      style={{ flex: 1, accentColor: '#38bdf8' }}
                    />
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={bayesPriorBeta}
                      onChange={e => setBayesPriorBeta(Number(e.target.value))}
                      style={{ flex: 1, accentColor: '#a855f7' }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>True θ (Coin Bias): <strong>{bayesTrueTheta.toFixed(2)}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={0.9}
                    step={0.05}
                    value={bayesTrueTheta}
                    onChange={e => setBayesTrueTheta(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#f59e0b' }}
                  />
                </div>
              </>
            )}

            {selectedModel === 'first_order_optimizers' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Loss Surface</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                    {(['saddle', 'rosenbrock', 'beale', 'quadratic'] as const).map(surf => (
                      <button
                        key={surf}
                        type="button"
                        onClick={() => {
                          setOptLossSurface(surf);
                          reseedData();
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          background: optLossSurface === surf ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))',
                          color: optLossSurface === surf ? '#38bdf8' : 'var(--text-secondary, #94a3b8)',
                          border: optLossSurface === surf ? '1px solid #38bdf8' : '1px solid var(--border-color, rgba(51, 65, 85, 0.6))',
                          cursor: 'pointer'
                        }}
                      >
                        {surf}
                      </button>
                    ))}
                  </div>
                </div>

                <DualParamControl
                  label="Learning Rate (η):"
                  value={optLearningRate}
                  min={0.005}
                  max={0.1}
                  step={0.005}
                  precision={3}
                  onChange={setOptLearningRate}
                  color="#34d399"
                />

                <DualParamControl
                  label="Momentum Beta (β):"
                  value={optMomentumBeta}
                  min={0.5}
                  max={0.98}
                  step={0.02}
                  precision={2}
                  onChange={setOptMomentumBeta}
                  color="#fbbf24"
                />
              </>
            )}

            {selectedModel === 'newton_raphson' && (
              <>
                <DualParamControl
                  label="Newton Damping Factor:"
                  value={newtonDamping}
                  min={0.2}
                  max={1.5}
                  step={0.1}
                  precision={2}
                  onChange={setNewtonDamping}
                  color="#14b8a6"
                />
              </>
            )}

            {selectedModel === 'lagrange_kkt' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Constraint Radius (c): <strong>{lagrangeLevelC}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={lagrangeLevelC}
                    onChange={e => setLagrangeLevelC(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#ec4899' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Multiplier (λ): <strong>{lagrangeLambda}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    value={lagrangeLambda}
                    onChange={e => setLagrangeLambda(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                </div>
              </>
            )}

            {selectedModel === 'linear_programming_simplex' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Objective: <strong>{lpOptType.toUpperCase()}</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    {(['max', 'min'] as const).map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setLpOptType(opt)}
                        style={{
                          flex: 1,
                          padding: '4px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: lpOptType === opt ? 'rgba(234, 179, 8, 0.25)' : 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))',
                          color: lpOptType === opt ? '#eab308' : 'var(--text-secondary, #94a3b8)',
                          border: lpOptType === opt ? '1px solid #eab308' : '1px solid var(--border-color, rgba(51, 65, 85, 0.6))',
                          cursor: 'pointer'
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Obj Coeff c₁: <strong>{lpC1}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={0.5}
                    value={lpC1}
                    onChange={e => setLpC1(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#eab308' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Obj Coeff c₂: <strong>{lpC2}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={0.5}
                    value={lpC2}
                    onChange={e => setLpC2(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#eab308' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Constraint 1 Limit (b₁): <strong>{lpB1}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={12}
                    step={0.5}
                    value={lpB1}
                    onChange={e => setLpB1(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Constraint 2 Limit (b₂): <strong>{lpB2}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={12}
                    step={0.5}
                    value={lpB2}
                    onChange={e => setLpB2(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                </div>
              </>
            )}

            {selectedModel === 'pca_projection' && (
              <>
                <DualParamControl
                  label="Feature Correlation (ρ):"
                  value={pcaCorrelation}
                  min={-0.95}
                  max={0.95}
                  step={0.05}
                  precision={2}
                  onChange={setPcaCorrelation}
                  color="#22c55e"
                />

                <DualParamControl
                  label="Variance X (Var[X₁]):"
                  value={pcaVarX}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  precision={2}
                  onChange={setPcaVarX}
                  color="#38bdf8"
                />

                <DualParamControl
                  label="Variance Y (Var[X₂]):"
                  value={pcaVarY}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  precision={2}
                  onChange={setPcaVarY}
                  color="#38bdf8"
                />
              </>
            )}

            {selectedModel === 'svd_decomposition' && (
              <>
                <DualParamControl
                  label="Singular Value σ₁:"
                  value={svdSingular1}
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  precision={2}
                  onChange={setSvdSingular1}
                  color="#d946ef"
                />

                <DualParamControl
                  label="Singular Value σ₂:"
                  value={svdSingular2}
                  min={0.2}
                  max={2.0}
                  step={0.1}
                  precision={2}
                  onChange={setSvdSingular2}
                  color="#38bdf8"
                />
              </>
            )}
          </div>
          )}

          {/* Academic & University Exam Takeaway Box */}
          {(desktopTab === 'telemetry' || desktopTab === 'split') && (
            <div
              className={`stat-opt-card-theory ${mobileActiveTab === 'telemetry' ? 'mobile-card-visible' : 'mobile-card-hidden'}`}
              style={{
                marginTop: 'auto',
                padding: '12px',
                borderRadius: '10px',
                background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.5))',
                border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan, #38bdf8)' }}>
                <Sparkles size={13} />
                <span>Exam & Mathematical Intuition</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #cbd5e1)', lineHeight: '1.4', margin: 0 }}>
                {activeModelMeta.description}
              </p>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: '#34d399',
                  background: 'var(--card-bg, rgba(15, 23, 42, 0.8))',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, rgba(51, 65, 85, 0.5))',
                  marginTop: '4px'
                }}
              >
                {activeModelMeta.formula}
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};
