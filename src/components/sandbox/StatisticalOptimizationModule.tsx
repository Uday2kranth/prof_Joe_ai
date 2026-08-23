import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  MousePointer,
  ChevronRight,
  Sliders,
  Sparkles,
  Activity,
  BarChart2
} from 'lucide-react';

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
  const [mobileActiveTab, setMobileActiveTab] = useState<'canvas' | 'controls' | 'telemetry'>('canvas');

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

  // ─── Pillar 4: SVD State ───
  const [svdSingular1, setSvdSingular1] = useState<number>(1.85);
  const [svdSingular2, setSvdSingular2] = useState<number>(0.65);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Master Simulation Ref State
  const stateRef = useRef<{
    timeT: number;
    cltMeans: number[];
    cltHistogram: number[];
    mcmcCurrent: number;
    mcmcHistory: { x: number; accepted: boolean }[];
    mcmcHistogram: number[];
    gmmParams: {
      mu1: number; sig1: number; pi1: number;
      mu2: number; sig2: number; pi2: number;
    };
    gmmPoints: number[];
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
    mcParticles: { from: number; to: number; progress: number; speed: number }[];
    pcaPoints: { x: number; y: number }[];
    ldaPoints: { x: number; y: number; cls: 0 | 1 }[];
  }>({
    timeT: 0,
    cltMeans: [],
    cltHistogram: new Array(50).fill(0),
    mcmcCurrent: 0.0,
    mcmcHistory: [],
    mcmcHistogram: new Array(50).fill(0),
    gmmParams: { mu1: -0.6, sig1: 0.25, pi1: 0.5, mu2: 0.7, sig2: 0.35, pi2: 0.5 },
    gmmPoints: [],
    sgdPos: { x: -1.4, y: 1.1 },
    momentumPos: { x: -1.4, y: 1.1, vx: 0, vy: 0 },
    rmspropPos: { x: -1.4, y: 1.1, sx: 0, sy: 0 },
    adamPos: { x: -1.4, y: 1.1, m: { x: 0, y: 0 }, v: { x: 0, y: 0 }, t: 0 },
    optHistory: { sgd: [], momentum: [], rmsprop: [], adam: [] },
    mlePoints: [],
    bootSamples: [],
    bootReplicas: [],
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

  // Canvas Mouse Coordinates
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) * 0.38;

    const mouseX = ((e.clientX - rect.left) / rect.width) * w;
    const mouseY = ((e.clientY - rect.top) / rect.height) * h;

    return {
      x: (mouseX - cx) / scale,
      y: (cy - mouseY) / scale
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

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    const { x, y } = getCanvasCoords(e);
    handleCanvasInteraction(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const { x, y } = getCanvasCoords(e);
    if (['hypothesis_power', 'first_order_optimizers', 'newton_raphson', 'lagrange_kkt', 'svd_decomposition', 'bayesian_beta_binomial'].includes(selectedModel)) {
      handleCanvasInteraction(x, y);
    }
  };

  const handleMouseUp = () => {
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

      setEmIterations(prev => {
        const next = prev + 1;
        if (next > 12) setEmConverged(true);
        return next;
      });
      setEmLogLikelihood(prev => prev + 1.2);
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
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.38;

      ctx.clearRect(0, 0, w, h);

      // Cyber Grid Background
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 40) {
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
      }
      for (let y = 0; y <= h; y += 40) {
        ctx.moveTo(0, y); ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Axis lines
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.6)';
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
        if (isSimulating && localFrame % Math.max(1, 12 - cltDrawSpeed * 2) === 0) {
          drawCltBatch(1);
        }

        // Top Panel: Parent Population Curve
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 1.5 * scale, cy - 0.7 * scale);
        for (let t = -1.5; t <= 1.5; t += 0.05) {
          let dens = 0;
          if (cltPopDist === 'uniform') dens = Math.abs(t) <= 1.2 ? 0.4 : 0;
          else if (cltPopDist === 'exponential') dens = t >= -1.0 ? Math.exp(-(t + 1.0) / 0.65) * 0.8 : 0;
          else if (cltPopDist === 'bimodal') dens = (Math.exp(-Math.pow((t + 0.75) / 0.3, 2)) + Math.exp(-Math.pow((t - 0.75) / 0.3, 2))) * 0.45;
          else dens = Math.max(0, 1.2 - Math.abs(t)) * 0.5;

          const px = cx + t * scale;
          const py = cy - 0.7 * scale - dens * scale * 0.7;
          if (t === -1.5) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`Parent Population: ${cltPopDist.toUpperCase()}`, cx - 1.4 * scale, cy - 0.75 * scale);

        // Bottom Panel: Sampling Distribution Histogram
        const hist = stateRef.current.cltHistogram;
        const maxBin = Math.max(...hist, 1);
        const binW = (3.0 * scale) / 50;

        for (let i = 0; i < 50; i++) {
          const binVal = hist[i];
          const barH = (binVal / maxBin) * (0.65 * scale);
          const bx = cx - 1.5 * scale + i * binW;
          const by = cy + 0.85 * scale - barH;

          ctx.fillStyle = 'rgba(16, 185, 129, 0.65)';
          ctx.fillRect(bx, by, binW - 1, barH);
        }

        // Overlay Theoretical Gaussian Curve N(μ, σ²/N)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const se = 0.55 / Math.sqrt(cltSampleSize);
        for (let t = -1.5; t <= 1.5; t += 0.05) {
          const gaussian = (1 / (se * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow(t / se, 2));
          const gx = cx + t * scale;
          const gy = cy + 0.85 * scale - Math.min(1.4, gaussian * 0.18) * scale * 0.65;
          if (t === -1.5) ctx.moveTo(gx, gy);
          else ctx.lineTo(gx, gy);
        }
        ctx.stroke();

        // Telemetry text
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`Sample Size N = ${cltSampleSize} • Total Draws: ${cltTotalDraws}`, cx - 1.4 * scale, cy + 0.95 * scale);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`Theoretical SE = σ/√N = ${(0.55 / Math.sqrt(cltSampleSize)).toFixed(3)}`, cx + 0.3 * scale, cy + 0.95 * scale);
      }

      // ────────────────────────────────────────────────────────────────────────
      // 2. HYPOTHESIS TESTING, P-VALUES & POWER ANALYSIS
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'hypothesis_power') {
        const delta = hypoEffectSize * 0.8;
        const se = 1.0 / Math.sqrt(hypoSampleSize / 25);
        const zCrit = hypoTails === 'two' ? 1.96 : 1.645;

        // Draw H0 Null Curve N(0, se)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let t = -3.5; t <= 3.5; t += 0.05) {
          const pdf0 = (1 / (se * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow(t / se, 2));
          const px = cx + t * 0.35 * scale;
          const py = cy + 0.2 * scale - pdf0 * 0.7 * scale;
          if (t === -3.5) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Draw H1 Alternative Curve N(delta, se)
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let t = -3.5; t <= 3.5; t += 0.05) {
          const pdf1 = (1 / (se * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - delta) / se, 2));
          const px = cx + t * 0.35 * scale;
          const py = cy + 0.2 * scale - pdf1 * 0.7 * scale;
          if (t === -3.5) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Shade Alpha Rejection Region (Red)
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        for (let t = zCrit * se; t <= 3.5; t += 0.05) {
          const pdf0 = (1 / (se * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow(t / se, 2));
          ctx.fillRect(cx + t * 0.35 * scale, cy + 0.2 * scale - pdf0 * 0.7 * scale, 3, pdf0 * 0.7 * scale);
        }

        // Shade Power Region (Green under H1 beyond zCrit)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
        for (let t = zCrit * se; t <= 3.5; t += 0.05) {
          const pdf1 = (1 / (se * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - delta) / se, 2));
          ctx.fillRect(cx + t * 0.35 * scale, cy + 0.2 * scale - pdf1 * 0.7 * scale, 3, pdf1 * 0.7 * scale);
        }

        // Test Statistic Line Z_calc
        const zx = cx + hypoObservedZ * se * 0.35 * scale;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(zx, cy - 0.7 * scale);
        ctx.lineTo(zx, cy + 0.2 * scale);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`Observed Z = ${hypoObservedZ.toFixed(2)}`, zx + 8, cy - 0.6 * scale);

        // Labels
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('H₀: Null Dist (μ=0)', cx - 1.2 * scale, cy - 0.45 * scale);
        ctx.fillStyle = '#a855f7';
        ctx.fillText(`H₁: Alt Dist (μ=${hypoEffectSize})`, cx + 0.4 * scale, cy - 0.45 * scale);
      }

      // ────────────────────────────────────────────────────────────────────────
      // 3. MARKOV CHAINS & STATIONARY TRANSITIONS
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'markov_chains') {
        const nodes = [
          { name: 'S₁ (Bull/Sun)', x: cx - 0.8 * scale, y: cy - 0.4 * scale, color: '#38bdf8', pi: mcStateDist[0] },
          { name: 'S₂ (Bear/Rain)', x: cx + 0.8 * scale, y: cy - 0.4 * scale, color: '#f59e0b', pi: mcStateDist[1] },
          { name: 'S₃ (Stagnant)', x: cx, y: cy + 0.6 * scale, color: '#a855f7', pi: mcStateDist[2] }
        ];

        // Draw Directed Transition Edges
        nodes.forEach((n1, i) => {
          nodes.forEach((n2, j) => {
            if (i !== j) {
              ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.stroke();
            }
          });
        });

        // Animated Traveling Probability Particles
        stateRef.current.mcParticles.forEach(p => {
          p.progress += p.speed;
          if (p.progress >= 1) p.progress = 0;
          const fromNode = nodes[p.from];
          const toNode = nodes[p.to];
          const px = fromNode.x + (toNode.x - fromNode.x) * p.progress;
          const py = fromNode.y + (toNode.y - fromNode.y) * p.progress;

          ctx.fillStyle = fromNode.color;
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Draw Nodes
        nodes.forEach(n => {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
          ctx.strokeStyle = n.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 36, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = n.color;
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(n.name, n.x, n.y - 6);
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 13px monospace';
          ctx.fillText(`π=${(n.pi * 100).toFixed(1)}%`, n.x, n.y + 12);
        });
        ctx.textAlign = 'left';
      }

      // ────────────────────────────────────────────────────────────────────────
      // 4. BAYESIAN BETA-BINOMIAL CONJUGATE ENGINE
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'bayesian_beta_binomial') {
        const a0 = bayesPriorAlpha;
        const b0 = bayesPriorBeta;
        const k = bayesFlipsHeads;
        const n = bayesFlipsHeads + bayesFlipsTails;
        const postA = a0 + k;
        const postB = b0 + (n - k);

        const betaPdf = (theta: number, a: number, b: number): number => {
          if (theta <= 0 || theta >= 1) return 0;
          const logB = (a - 1) * Math.log(theta) + (b - 1) * Math.log(1 - theta);
          return Math.exp(logB);
        };

        let maxPost = 1;
        for (let t = 0.01; t <= 0.99; t += 0.02) {
          maxPost = Math.max(maxPost, betaPdf(t, postA, postB));
        }

        // Draw Prior
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let t = 0.01; t <= 0.99; t += 0.02) {
          const val = (betaPdf(t, a0, b0) / Math.max(1, betaPdf(0.5, a0, b0))) * 0.4 * scale;
          const px = cx - 1.2 * scale + t * 2.4 * scale;
          const py = cy + 0.6 * scale - val;
          if (t === 0.01) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Draw Posterior
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 1.2 * scale, cy + 0.6 * scale);
        for (let t = 0.01; t <= 0.99; t += 0.01) {
          const val = (betaPdf(t, postA, postB) / maxPost) * 0.8 * scale;
          const px = cx - 1.2 * scale + t * 2.4 * scale;
          const py = cy + 0.6 * scale - val;
          ctx.lineTo(px, py);
        }
        ctx.lineTo(cx + 1.2 * scale, cy + 0.6 * scale);
        ctx.fill();
        ctx.stroke();

        // True Theta Marker
        const trueX = cx - 1.2 * scale + bayesTrueTheta * 2.4 * scale;
        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(trueX, cy - 0.4 * scale);
        ctx.lineTo(trueX, cy + 0.6 * scale);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`True θ = ${bayesTrueTheta.toFixed(2)}`, trueX - 30, cy - 0.45 * scale);
        ctx.fillStyle = '#10b981';
        ctx.fillText(`Posterior Mode = ${((postA - 1) / (postA + postB - 2 || 1)).toFixed(3)}`, cx + 0.2 * scale, cy - 0.2 * scale);
      }

      // ────────────────────────────────────────────────────────────────────────
      // 5. 2D LINEAR PROGRAMMING & SIMPLEX FEASIBLE POLYGON
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'linear_programming_simplex') {
        const b1 = lpB1;
        const b2 = lpB2;

        const v0 = { x: 0, y: 0 };
        const v1 = { x: b1 / 2, y: 0 };
        const v2 = { x: (2 * b1 - b2) / 3, y: (2 * b2 - b1) / 3 };
        const v3 = { x: 0, y: b2 / 2 };

        const toCanvas = (vx: number, vy: number) => ({
          x: cx - 0.8 * scale + (vx / 6) * 1.6 * scale,
          y: cy + 0.8 * scale - (vy / 6) * 1.6 * scale
        });

        const p0 = toCanvas(v0.x, v0.y);
        const p1 = toCanvas(v1.x, v1.y);
        const p2 = toCanvas(Math.max(0, v2.x), Math.max(0, v2.y));
        const p3 = toCanvas(v3.x, v3.y);

        ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const corners = [
          { name: 'A(0,0)', pt: p0, z: 0 },
          { name: `B(${v1.x.toFixed(1)}, 0)`, pt: p1, z: lpC1 * v1.x },
          { name: `C(${v2.x.toFixed(1)}, ${v2.y.toFixed(1)})`, pt: p2, z: lpC1 * v2.x + lpC2 * v2.y },
          { name: `D(0, ${v3.y.toFixed(1)})`, pt: p3, z: lpC2 * v3.y }
        ];

        let bestCorner = corners[0];
        corners.forEach(c => {
          if (lpOptType === 'max' ? c.z >= bestCorner.z : c.z <= bestCorner.z) {
            bestCorner = c;
          }
        });

        corners.forEach(c => {
          ctx.fillStyle = c === bestCorner ? '#22c55e' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(c.pt.x, c.pt.y, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(`${c.name} [Z=${c.z.toFixed(1)}]`, c.pt.x + 8, c.pt.y - 6);
        });

        const objSlope = -lpC1 / (lpC2 || 1);
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(bestCorner.pt.x - 0.6 * scale, bestCorner.pt.y - 0.6 * scale * objSlope);
        ctx.lineTo(bestCorner.pt.x + 0.6 * scale, bestCorner.pt.y + 0.6 * scale * objSlope);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ────────────────────────────────────────────────────────────────────────
      // 6. PRINCIPAL COMPONENT ANALYSIS (PCA)
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'pca_projection') {
        const pts = stateRef.current.pcaPoints;
        const angle = Math.atan2(pcaCorrelation * pcaVarY, pcaVarX);
        const u1 = { x: Math.cos(angle), y: Math.sin(angle) };

        pts.forEach(p => {
          const px = cx + p.x * 0.6 * scale;
          const py = cy - p.y * 0.6 * scale;

          const projLen = p.x * u1.x + p.y * u1.y;
          const projX = cx + projLen * u1.x * 0.6 * scale;
          const projY = cy - projLen * u1.y * 0.6 * scale;

          ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(projX, projY);
          ctx.stroke();

          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
          ctx.fill();
        });

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(cx - u1.x * scale, cy + u1.y * scale);
        ctx.lineTo(cx + u1.x * scale, cy - u1.y * scale);
        ctx.stroke();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx + u1.y * 0.5 * scale, cy + u1.x * 0.5 * scale);
        ctx.lineTo(cx - u1.y * 0.5 * scale, cy - u1.x * 0.5 * scale);
        ctx.stroke();

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`PC₁ (${pcaExplainedVar}% Var)`, cx + u1.x * 0.9 * scale + 10, cy - u1.y * 0.9 * scale);
      }

      // ────────────────────────────────────────────────────────────────────────
      // 7. FIRST-ORDER OPTIMIZERS (SGD, Momentum, RMSprop, Adam)
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'first_order_optimizers') {
        for (let r = 0.2; r <= 1.8; r += 0.22) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.12 + (1.8 - r) * 0.25})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          if (optLossSurface === 'saddle') {
            ctx.ellipse(cx, cy, r * scale * 1.2, r * scale * 0.7, 0, 0, 2 * Math.PI);
          } else if (optLossSurface === 'rosenbrock') {
            ctx.ellipse(cx + 0.3 * scale, cy - 0.2 * scale, r * scale * 1.1, r * scale * 0.5, 0.45, 0, 2 * Math.PI);
          } else {
            ctx.ellipse(cx, cy, r * scale, r * scale * 0.8, 0, 0, 2 * Math.PI);
          }
          ctx.stroke();
        }

        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('Global Min (0, 0)', cx + 12, cy - 10);

        if (isSimulating && localFrame % 2 === 0) {
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

        const drawTrajectory = (hist: { x: number; y: number }[], color: string, name: string) => {
          if (hist.length < 2) return;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          hist.forEach((pt, i) => {
            const px = cx + pt.x * scale;
            const py = cy - pt.y * scale;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();

          const last = hist[hist.length - 1];
          const px = cx + last.x * scale;
          const py = cy - last.y * scale;

          // Head dot
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, 2 * Math.PI);
          ctx.fill();

          // High-contrast floating pill badge with exact optimizer color
          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          const textWidth = ctx.measureText(name).width || 35;
          ctx.fillRect(px + 10, py - 14, textWidth + 14, 18);
          ctx.strokeRect(px + 10, py - 14, textWidth + 14, 18);

          ctx.fillStyle = color;
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(name, px + 17, py);
        };

        drawTrajectory(stateRef.current.optHistory.sgd, '#ef4444', 'SGD');
        drawTrajectory(stateRef.current.optHistory.momentum, '#f59e0b', 'Momentum');
        drawTrajectory(stateRef.current.optHistory.rmsprop, '#06b6d4', 'RMSprop');
        drawTrajectory(stateRef.current.optHistory.adam, '#a855f7', 'Adam');
      }

      // ────────────────────────────────────────────────────────────────────────
      // 8. MLE & MAP ESTIMATION
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'mle_map') {
        stateRef.current.mlePoints.forEach(p => {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(cx + p * scale, cy + 0.3 * scale, 4, 0, 2 * Math.PI);
          ctx.fill();
        });

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let t = -2.0; t <= 2.0; t += 0.05) {
          const yVal = Math.exp(-0.5 * Math.pow((t - mleSampleMean) / mleSampleStd, 2));
          const px = cx + t * scale;
          const py = cy + 0.3 * scale - yVal * scale * 0.8;
          if (t === -2.0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let t = -2.0; t <= 2.0; t += 0.05) {
          const yVal = Math.exp(-0.5 * Math.pow((t - mapPriorMean) / 0.5, 2)) * mapPriorWeight;
          const px = cx + t * scale;
          const py = cy + 0.3 * scale - yVal * scale * 0.8;
          if (t === -2.0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // ────────────────────────────────────────────────────────────────────────
      // 9. NEWTON-RAPHSON & HESSIAN CURVATURE
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'newton_raphson') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let t = -2.2; t <= 2.2; t += 0.05) {
          const yVal = Math.pow(t, 4) - 2 * Math.pow(t, 2);
          const px = cx + t * scale * 0.8;
          const py = cy - yVal * scale * 0.35;
          if (t === -2.2) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        const x0 = newtonCurrentX;
        const f0 = Math.pow(x0, 4) - 2 * Math.pow(x0, 2);
        const f1 = 4 * Math.pow(x0, 3) - 4 * x0;
        const f2 = 12 * Math.pow(x0, 2) - 4 || 1e-4;

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let t = -2.0; t <= 2.0; t += 0.05) {
          const dx = t - x0;
          const qVal = f0 + f1 * dx + 0.5 * f2 * dx * dx;
          const px = cx + t * scale * 0.8;
          const py = cy - qVal * scale * 0.35;
          if (t === -2.0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ────────────────────────────────────────────────────────────────────────
      // 10. LAGRANGE MULTIPLIERS & KKT
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'lagrange_kkt') {
        for (let r = 0.4; r <= 2.2; r += 0.35) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.beginPath();
          ctx.arc(cx, cy, r * scale, 0, 2 * Math.PI);
          ctx.stroke();
        }

        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, lagrangeLevelC * scale, 0, 2 * Math.PI);
        ctx.stroke();

        const contactX = cx + (lagrangeLevelC * scale) / Math.SQRT2;
        const contactY = cy - (lagrangeLevelC * scale) / Math.SQRT2;

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(contactX, contactY);
        ctx.lineTo(contactX + 40, contactY - 40);
        ctx.stroke();

        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(contactX, contactY);
        ctx.lineTo(contactX + 40 * lagrangeLambda, contactY - 40 * lagrangeLambda);
        ctx.stroke();
      }

      // ────────────────────────────────────────────────────────────────────────
      // 11. EM ALGORITHM ON GAUSSIAN MIXTURES
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'em_gmm') {
        const { gmmPoints, gmmParams } = stateRef.current;
        gmmPoints.forEach(p => {
          const p1 = gmmParams.pi1 * Math.exp(-0.5 * Math.pow((p - gmmParams.mu1) / gmmParams.sig1, 2));
          const p2 = gmmParams.pi2 * Math.exp(-0.5 * Math.pow((p - gmmParams.mu2) / gmmParams.sig2, 2));
          const r1 = p1 / (p1 + p2 || 1);

          ctx.fillStyle = r1 > 0.5 ? '#38bdf8' : '#a855f7';
          ctx.beginPath();
          ctx.arc(cx + p * scale, cy + 0.4 * scale, 4.5, 0, 2 * Math.PI);
          ctx.fill();
        });

        // GMM Density curve
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let t = -2.0; t <= 2.0; t += 0.04) {
          const d1 = gmmParams.pi1 * (1 / (gmmParams.sig1 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - gmmParams.mu1) / gmmParams.sig1, 2));
          const d2 = gmmParams.pi2 * (1 / (gmmParams.sig2 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((t - gmmParams.mu2) / gmmParams.sig2, 2));
          const totalDens = (d1 + d2) * 0.4 * scale;
          const px = cx + t * scale;
          const py = cy + 0.4 * scale - totalDens;
          if (t === -2.0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // ────────────────────────────────────────────────────────────────────────
      // 12. MCMC METROPOLIS-HASTINGS
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'mcmc_metropolis') {
        if (isSimulating && localFrame % 4 === 0) {
          performStep();
        }

        // Draw Bimodal Target
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let t = -2.0; t <= 2.0; t += 0.05) {
          const pdf = 0.6 * Math.exp(-0.5 * Math.pow((t + 0.8) / 0.35, 2)) + 0.4 * Math.exp(-0.5 * Math.pow((t - 0.8) / 0.4, 2));
          const px = cx + t * scale;
          const py = cy - 0.2 * scale - pdf * scale * 0.6;
          if (t === -2.0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Draw Empirical Histogram
        const hist = stateRef.current.mcmcHistogram;
        const maxBin = Math.max(...hist, 1);
        const binW = (4.0 * scale) / 50;
        for (let i = 0; i < 50; i++) {
          const val = hist[i];
          const barH = (val / maxBin) * (0.5 * scale);
          const bx = cx - 2.0 * scale + i * binW;
          const by = cy + 0.7 * scale - barH;
          ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
          ctx.fillRect(bx, by, binW - 1, barH);
        }

        // Current MCMC state marker
        const curX = cx + stateRef.current.mcmcCurrent * scale;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(curX, cy + 0.7 * scale, 6, 0, 2 * Math.PI);
        ctx.fill();
      }

      // ────────────────────────────────────────────────────────────────────────
      // 13. BOOTSTRAP RESAMPLING
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'bootstrap_resampling') {
        stateRef.current.bootSamples.forEach(p => {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(cx + p * scale * 1.5, cy - 0.4 * scale, 4, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Bootstrap Replicates Histogram
        const reps = stateRef.current.bootReplicas;
        if (reps.length > 0) {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
          reps.forEach(r => {
            const bx = cx + r * scale * 1.5;
            ctx.fillRect(bx, cy + 0.4 * scale, 2, -20);
          });

          // CI Shading
          const ciLowX = cx + bootCI95.low * scale * 1.5;
          const ciHighX = cx + bootCI95.high * scale * 1.5;

          ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
          ctx.fillRect(ciLowX, cy + 0.45 * scale, ciHighX - ciLowX, -40);

          ctx.strokeStyle = '#10b981';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(ciLowX, cy + 0.6 * scale); ctx.lineTo(ciLowX, cy + 0.1 * scale);
          ctx.moveTo(ciHighX, cy + 0.6 * scale); ctx.lineTo(ciHighX, cy + 0.1 * scale);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // ────────────────────────────────────────────────────────────────────────
      // 14. FISHER'S LINEAR DISCRIMINANT (LDA)
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'fisher_lda') {
        const pts = stateRef.current.ldaPoints;
        pts.forEach(p => {
          ctx.fillStyle = p.cls === 0 ? '#38bdf8' : '#f59e0b';
          ctx.beginPath();
          ctx.arc(cx + p.x * scale, cy - p.y * scale, 4.5, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Optimal discriminant line w*
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 1.2 * scale, cy + 0.8 * scale);
        ctx.lineTo(cx + 1.2 * scale, cy - 0.8 * scale);
        ctx.stroke();

        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Optimal w* (Rayleigh Max)', cx + 0.7 * scale, cy - 0.7 * scale);
      }

      // ────────────────────────────────────────────────────────────────────────
      // 15. SINGULAR VALUE DECOMPOSITION (SVD)
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'svd_decomposition') {
        // Unit circle
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx - 0.7 * scale, cy, 0.5 * scale, 0, 2 * Math.PI);
        ctx.stroke();

        // Transformed Ellipse A = U Σ V^T
        ctx.save();
        ctx.translate(cx + 0.7 * scale, cy);
        ctx.rotate(0.35);
        ctx.strokeStyle = '#d946ef';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, (svdSingular1 / 2) * scale, (svdSingular2 / 2) * scale, 0, 0, 2 * Math.PI);
        ctx.stroke();

        // Singular Axes
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo((svdSingular1 / 2) * scale, 0);
        ctx.stroke();

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(0, -(svdSingular2 / 2) * scale);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Unit Circle x', cx - 0.9 * scale, cy + 0.65 * scale);
        ctx.fillText('Transformed Ellipse Ax', cx + 0.45 * scale, cy + 0.65 * scale);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [
    selectedModel,
    isSimulating,
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
    svdSingular2
  ]);

  const activeModelMeta = STAT_OPT_MODELS.find(m => m.id === selectedModel) || STAT_OPT_MODELS[0];

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
        className="dsa-header-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '8px 12px',
          background: 'var(--card-bg, rgba(15, 23, 42, 0.85))',
          borderRadius: '12px',
          border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))',
          backdropFilter: 'blur(10px)',
          minWidth: 0,
          maxWidth: '100%',
          flexShrink: 0
        }}
      >
        {/* Mobile & Compact View: Grouped Model Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 260px', minWidth: 0, maxWidth: '100%' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
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
              minHeight: '36px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'var(--dropdown-bg, rgba(30, 41, 59, 0.95))',
              border: '1.5px solid var(--accent-cyan, #38bdf8)',
              color: 'var(--text-primary, #f8fafc)',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.25)',
              minWidth: 0,
              width: '100%'
            }}
          >
            <optgroup label="1. 📊 Statistical Inference & Sampling">
              <option value="clt_simulation">Central Limit Theorem (Sampling Distributions)</option>
              <option value="hypothesis_testing">Hypothesis Testing (Z-Test, T-Test, Type I/II)</option>
              <option value="confidence_intervals">Confidence Intervals (Frequentist Coverage)</option>
              <option value="mle_estimator">Maximum Likelihood Estimation (Likelihood Surfaces)</option>
              <option value="bayesian_inference">Bayesian Inference (Beta-Binomial Conjugate)</option>
              <option value="bootstrap_resampling">Bootstrap Resampling (Empirical Confidence)</option>
            </optgroup>
            <optgroup label="2. 🎲 Stochastic Processes & Bayesian Probability">
              <option value="mcmc_metropolis">MCMC Metropolis-Hastings (Target Sampler)</option>
              <option value="em_algorithm">Expectation-Maximization (Gaussian Mixture)</option>
            </optgroup>
            <optgroup label="3. ⚡ Continuous & Numerical Optimization">
              <option value="gradient_descent_variants">Gradient Descent Variants (SGD, Momentum, Adam)</option>
              <option value="newton_raphson">Newton-Raphson Optimization (Quadratic Fit)</option>
              <option value="lagrange_multipliers">Lagrange Multipliers (Constrained Contours)</option>
            </optgroup>
            <optgroup label="4. 📐 Operations Research & Matrix Decompositions">
              <option value="simplex_lp">Simplex Linear Programming (Feasible Polytope)</option>
              <option value="pca_svd">PCA & SVD (Variance Ellipsoids)</option>
              <option value="lda_analysis">Linear Discriminant Analysis (Fisher Criterion)</option>
              <option value="kalman_filter">Kalman Filter (Dynamic State Estimation)</option>
            </optgroup>
          </select>
        </div>

        {/* Global Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setIsSimulating(!isSimulating)}
            className="dsa-action-btn"
            style={{
              background: isSimulating ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: isSimulating ? '#f87171' : '#34d399',
              border: isSimulating ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)'
            }}
            title={isSimulating ? 'Pause Loop' : 'Run Live'}
          >
            {isSimulating ? <Pause size={15} /> : <Play size={15} />}
            <span className="dsa-btn-label">{isSimulating ? 'Pause' : 'Run'}</span>
          </button>

          <button
            type="button"
            onClick={performStep}
            className="dsa-action-btn"
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.4)'
            }}
            title="Step Simulation Forward (+1)"
          >
            <ChevronRight size={15} />
            <span className="dsa-btn-label">Step +1</span>
          </button>

          <button
            type="button"
            onClick={reseedData}
            className="dsa-action-btn"
            style={{
              background: 'rgba(51, 65, 85, 0.5)',
              color: '#cbd5e1',
              border: '1px solid rgba(100, 116, 139, 0.4)'
            }}
            title="Reset Simulation & Reseed"
          >
            <RotateCcw size={15} />
            <span className="dsa-btn-label">Reset</span>
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
      <div className="stat-opt-workbench-grid">
        {/* Left Interactive Canvas Viewport */}
        <div className={`stat-opt-canvas-panel ${mobileActiveTab === 'canvas' ? 'mobile-active' : 'mobile-hidden'}`}>
          <canvas
            ref={canvasRef}
            width={900}
            height={660}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              cursor: 'crosshair'
            }}
          />

          {/* Floating Instructions Banner */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
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
              gap: '6px'
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
              {selectedModel === 'first_order_optimizers' && '💡 Click canvas to reposition all 4 racing optimizers'}
              {selectedModel === 'newton_raphson' && '💡 Click to set initial x₀ • Hessian quadratic Taylor jump'}
              {selectedModel === 'lagrange_kkt' && '💡 Tangency contact point: ∇f is collinear to λ∇g'}
              {selectedModel === 'mle_map' && '💡 Click canvas to add sample points • Bayesian Shrinkage'}
              {selectedModel === 'em_gmm' && '💡 E-Step (responsibilities) & M-Step (parameters)'}
              {selectedModel === 'mcmc_metropolis' && '💡 Green = Accepted jumps • Red = Rejected proposals'}
              {selectedModel === 'bootstrap_resampling' && '💡 95% Percentile Confidence Band [q0.025, q0.975]'}
              {selectedModel === 'fisher_lda' && '💡 Maximizing between-class over within-class scatter'}
              {selectedModel === 'svd_decomposition' && '💡 Drag axes: Unit Circle to Ellipse transformation A = U Σ Vᵀ'}
            </span>
          </div>

          {/* Floating Pill for Fisher LDA */}
          {selectedModel === 'fisher_lda' && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 6px',
                background: 'var(--card-bg, rgba(15, 23, 42, 0.9))',
                borderRadius: '8px',
                border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))'
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
        <div className={`stat-opt-controls-panel ${mobileActiveTab !== 'canvas' ? 'mobile-active' : 'mobile-hidden'}`}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))', paddingBottom: '10px' }}>
            <Activity size={16} color="#38bdf8" />
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', margin: 0, textTransform: 'uppercase' }}>
                {activeModelMeta.name}
              </h4>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>{activeModelMeta.pillarTitle}</span>
            </div>
          </div>

          {/* TELEMETRY CARDS */}
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
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: Math.abs(hypoObservedZ) >= (hypoTails === 'two' ? 1.96 : 1.645) ? '#22c55e' : '#ef4444' }}>
                  {Math.abs(hypoObservedZ) >= (hypoTails === 'two' ? 1.96 : 1.645) ? 'REJECT H₀ (Sig)' : 'FAIL TO REJECT'}
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

          {/* DYNAMIC CONTROLS SECTION */}
          <div className={`stat-opt-card-params ${mobileActiveTab === 'controls' ? 'mobile-card-visible' : 'mobile-card-hidden'}`} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1' }}>
              <Sliders size={13} color="#38bdf8" />
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
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Sample Spread (σ_sample): <strong>{mleSampleStd.toFixed(2)}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.15}
                    max={1.0}
                    step={0.05}
                    value={mleSampleStd}
                    onChange={e => setMleSampleStd(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Bayesian Prior Mean (μ_prior): <strong>{mapPriorMean.toFixed(2)}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={-1.5}
                    max={1.5}
                    step={0.1}
                    value={mapPriorMean}
                    onChange={e => setMapPriorMean(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#f59e0b' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Prior Regularization Weight: <strong>{mapPriorWeight.toFixed(2)}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={mapPriorWeight}
                    onChange={e => setMapPriorWeight(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#f59e0b' }}
                  />
                </div>
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

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Learning Rate (η): <strong>{optLearningRate}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.005}
                    max={0.1}
                    step={0.005}
                    value={optLearningRate}
                    onChange={e => setOptLearningRate(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#34d399' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Momentum Beta (β): <strong>{optMomentumBeta}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={0.98}
                    step={0.02}
                    value={optMomentumBeta}
                    onChange={e => setOptMomentumBeta(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#fbbf24' }}
                  />
                </div>
              </>
            )}

            {selectedModel === 'newton_raphson' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Newton Damping Factor: <strong>{newtonDamping}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={1.5}
                    step={0.1}
                    value={newtonDamping}
                    onChange={e => setNewtonDamping(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#14b8a6' }}
                  />
                </div>
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
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Feature Correlation (ρ): <strong>{pcaCorrelation.toFixed(2)}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={-0.95}
                    max={0.95}
                    step={0.05}
                    value={pcaCorrelation}
                    onChange={e => setPcaCorrelation(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#22c55e' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Variance X (Var[X₁]): <strong>{pcaVarX.toFixed(2)}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={pcaVarX}
                    onChange={e => setPcaVarX(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Variance Y (Var[X₂]): <strong>{pcaVarY.toFixed(2)}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={pcaVarY}
                    onChange={e => setPcaVarY(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                </div>
              </>
            )}

            {selectedModel === 'svd_decomposition' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Singular Value σ₁: <strong>{svdSingular1.toFixed(2)}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={3.0}
                    step={0.1}
                    value={svdSingular1}
                    onChange={e => setSvdSingular1(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#d946ef' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>Singular Value σ₂: <strong>{svdSingular2.toFixed(2)}</strong></span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={2.0}
                    step={0.1}
                    value={svdSingular2}
                    onChange={e => setSvdSingular2(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Academic & University Exam Takeaway Box */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>
              <Sparkles size={13} />
              <span>Exam & Mathematical Intuition</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.4', margin: 0 }}>
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
        </div>
      </div>
    </div>
  );
};
