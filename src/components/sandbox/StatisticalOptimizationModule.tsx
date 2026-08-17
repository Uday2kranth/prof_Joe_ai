import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  MousePointer,
  ChevronRight,
  Sliders,
  Sparkles,
  Activity
} from 'lucide-react';

export type StatOptModelType =
  // 1. Parameter Estimation & Inference
  | 'mle_map'
  | 'em_gmm'
  | 'mcmc_metropolis'
  | 'bootstrap_resampling'
  // 2. Continuous & Numerical Optimization
  | 'first_order_optimizers'
  | 'newton_raphson'
  | 'lagrange_kkt'
  // 3. Linear Algebra & Decompositions
  | 'fisher_lda'
  | 'svd_decomposition';

export const StatisticalOptimizationModule: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<StatOptModelType>('first_order_optimizers');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simMode, setSimMode] = useState<'autoplay' | 'interactive'>('autoplay');

  // ─── 1. MLE & MAP State ───
  const [mleSampleMean, setMleSampleMean] = useState<number>(0.35);
  const [mleSampleStd, setMleSampleStd] = useState<number>(0.45);
  const [mapPriorMean, setMapPriorMean] = useState<number>(-0.20);
  const [mapPriorWeight, setMapPriorWeight] = useState<number>(0.35);
  const [mleLogLikelihood, setMleLogLikelihood] = useState<number>(-42.5);

  // ─── 2. EM Algorithm (GMM) State ───
  const [emIterations, setEmIterations] = useState<number>(0);
  const [emLogLikelihood, setEmLogLikelihood] = useState<number>(-88.4);
  const [emConverged, setEmConverged] = useState<boolean>(false);

  // ─── 3. MCMC Metropolis-Hastings State ───
  const [mcmcAcceptanceRate, setMcmcAcceptanceRate] = useState<number>(68.5);
  const [mcmcProposalStd, setMcmcProposalStd] = useState<number>(0.40);
  const [mcmcTotalSamples, setMcmcTotalSamples] = useState<number>(0);

  // ─── 4. Bootstrap Resampling State ───
  const [bootNumReplicas, setBootNumReplicas] = useState<number>(200);
  const [bootMeanEstimate, setBootMeanEstimate] = useState<number>(0.12);
  const [bootStdError, setBootStdError] = useState<number>(0.045);
  const [bootCI95, setBootCI95] = useState<{ low: number; high: number }>({ low: 0.03, high: 0.21 });

  // ─── 5. First-Order Optimizers (SGD, Momentum, RMSprop, Adam) State ───
  const [optLossSurface, setOptLossSurface] = useState<'beale' | 'saddle' | 'quadratic' | 'rosenbrock'>('saddle');
  const [optLearningRate, setOptLearningRate] = useState<number>(0.035);
  const [optMomentumBeta, setOptMomentumBeta] = useState<number>(0.85);

  // ─── 6. Newton-Raphson & Second-Order State ───
  const [newtonStepCount, setNewtonStepCount] = useState<number>(0);
  const [newtonCurrentX, setNewtonCurrentX] = useState<number>(1.8);
  const [newtonDamping, setNewtonDamping] = useState<number>(1.0);

  // ─── 7. Constrained Optimization (Lagrange & KKT) State ───
  const [lagrangeLevelC, setLagrangeLevelC] = useState<number>(1.2);
  const [lagrangeLambda, setLagrangeLambda] = useState<number>(1.45);
  const [kktInequalityActive, setKktInequalityActive] = useState<boolean>(true);

  // ─── 8. Fisher's LDA State ───
  const [ldaSeparability, setLdaSeparability] = useState<number>(3.84);
  const [ldaClassAngle, setLdaClassAngle] = useState<number>(45);
  const [ldaPlacementClass, setLdaPlacementClass] = useState<0 | 1>(0);

  // ─── 9. SVD Decomposition State ───
  const [svdSingular1, setSvdSingular1] = useState<number>(1.85);
  const [svdSingular2, setSvdSingular2] = useState<number>(0.65);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Master Simulation Ref State
  const stateRef = useRef<{
    timeT: number;
    // Optimizer positions
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
    // MCMC state
    mcmcCurrent: number;
    mcmcHistory: { x: number; accepted: boolean }[];
    mcmcHistogram: number[];
    // EM GMM state
    gmmParams: {
      mu1: number; sig1: number; pi1: number;
      mu2: number; sig2: number; pi2: number;
    };
    gmmPoints: number[];
    // SVD state
    svdMatrix: [[number, number], [number, number]];
    // Sample points for Inference
    mlePoints: number[];
    bootSamples: number[];
    bootReplicas: number[];
    // Fisher LDA points
    ldaPoints: { x: number; y: number; cls: 0 | 1 }[];
  }>({
    timeT: 0,
    sgdPos: { x: -1.4, y: 1.2 },
    momentumPos: { x: -1.4, y: 1.2, vx: 0, vy: 0 },
    rmspropPos: { x: -1.4, y: 1.2, sx: 0, sy: 0 },
    adamPos: { x: -1.4, y: 1.2, m: { x: 0, y: 0 }, v: { x: 0, y: 0 }, t: 0 },
    optHistory: { sgd: [], momentum: [], rmsprop: [], adam: [] },
    mcmcCurrent: 0.0,
    mcmcHistory: [],
    mcmcHistogram: new Array(50).fill(0),
    gmmParams: { mu1: -0.6, sig1: 0.25, pi1: 0.5, mu2: 0.7, sig2: 0.35, pi2: 0.5 },
    gmmPoints: [],
    svdMatrix: [[1.5, 0.8], [0.3, 1.1]],
    mlePoints: [],
    bootSamples: [],
    bootReplicas: [],
    ldaPoints: []
  });

  // Seed sample data
  const reseedData = useCallback(() => {
    // 1. MLE points
    const mle: number[] = [];
    for (let i = 0; i < 35; i++) {
      mle.push(mleSampleMean + (Math.random() - 0.5) * mleSampleStd * 2.5);
    }
    stateRef.current.mlePoints = mle;
    const ll = -0.5 * mle.length * Math.log(2 * Math.PI * mleSampleStd * mleSampleStd) - mle.reduce((acc, p) => acc + Math.pow(p - mleSampleMean, 2), 0) / (2 * mleSampleStd * mleSampleStd);
    setMleLogLikelihood(ll);

    // 2. GMM points (2 clusters)
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

    // 3. Reset Optimizers
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

    // 4. MCMC Reset
    stateRef.current.mcmcCurrent = 0.0;
    stateRef.current.mcmcHistory = [];
    stateRef.current.mcmcHistogram = new Array(50).fill(0);
    setMcmcTotalSamples(0);
    setMcmcAcceptanceRate(68.5);

    // 5. Bootstrap Reset
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

    // 6. Lagrange
    setLagrangeLambda(lagrangeLevelC * 1.25);

    // 7. Fisher LDA
    const lda: { x: number; y: number; cls: 0 | 1 }[] = [];
    for (let i = 0; i < 25; i++) {
      lda.push({ x: -0.6 + (Math.random() - 0.5) * 0.45, y: -0.3 + (Math.random() - 0.5) * 0.45, cls: 0 });
      lda.push({ x: 0.6 + (Math.random() - 0.5) * 0.45, y: 0.4 + (Math.random() - 0.5) * 0.45, cls: 1 });
    }
    stateRef.current.ldaPoints = lda;
    setLdaSeparability(3.5 + Math.sin(ldaClassAngle * Math.PI / 180) * 1.2);
  }, [mleSampleMean, mleSampleStd, bootNumReplicas, lagrangeLevelC, ldaClassAngle]);

  useEffect(() => {
    reseedData();
  }, [reseedData]);

  // Loss surface evaluation helper
  const lossFunction = (x: number, y: number, surface: string): { val: number; dx: number; dy: number } => {
    if (surface === 'saddle') {
      // f(x, y) = x^2 - y^2 (Monkey saddle / hyperbolic)
      return {
        val: x * x - 0.8 * y * y,
        dx: 2 * x,
        dy: -1.6 * y
      };
    } else if (surface === 'rosenbrock') {
      // f(x, y) = (1 - x)^2 + 10*(y - x^2)^2 (Banana valley scaled)
      const val = Math.pow(0.8 - x, 2) + 4 * Math.pow(y - x * x, 2);
      const dx = -2 * (0.8 - x) - 16 * x * (y - x * x);
      const dy = 8 * (y - x * x);
      return { val, dx, dy };
    } else if (surface === 'beale') {
      // Multi-well landscape
      const val = 0.5 * (x * x + y * y) - 0.4 * Math.cos(2.5 * x) - 0.4 * Math.cos(2.5 * y);
      const dx = x + Math.sin(2.5 * x);
      const dy = y + Math.sin(2.5 * y);
      return { val, dx, dy };
    } else {
      // Anisotropic quadratic bowl: f(x, y) = 0.5*(x^2 + 10*y^2)
      return {
        val: 0.5 * (x * x + 4 * y * y),
        dx: x,
        dy: 4 * y
      };
    }
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
    const scale = Math.min(w, h) * 0.40;

    const mouseX = ((e.clientX - rect.left) / rect.width) * w;
    const mouseY = ((e.clientY - rect.top) / rect.height) * h;

    return {
      x: (mouseX - cx) / scale,
      y: (cy - mouseY) / scale
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    if (selectedModel === 'first_order_optimizers') {
      // Click anywhere to reposition all optimizers' starting point
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

    if (selectedModel === 'em_gmm') {
      stateRef.current.gmmPoints.push(x);
      return;
    }

    if (selectedModel === 'mcmc_metropolis') {
      stateRef.current.mcmcCurrent = x;
      stateRef.current.mcmcHistory.push({ x, accepted: true });
      setMcmcTotalSamples(prev => prev + 1);
      return;
    }

    if (selectedModel === 'bootstrap_resampling') {
      stateRef.current.bootSamples.push(x);
      const orig = stateRef.current.bootSamples;
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
      return;
    }

    if (selectedModel === 'lagrange_kkt') {
      const dist = Math.min(2.5, Math.max(0.4, Math.sqrt(x * x + y * y)));
      setLagrangeLevelC(parseFloat(dist.toFixed(2)));
      setLagrangeLambda(parseFloat((dist * 1.25).toFixed(2)));
      return;
    }

    if (selectedModel === 'fisher_lda') {
      stateRef.current.ldaPoints.push({ x, y, cls: ldaPlacementClass });
      // Recalculate Fisher separation
      const pts = stateRef.current.ldaPoints;
      const c0 = pts.filter(p => p.cls === 0);
      const c1 = pts.filter(p => p.cls === 1);
      if (c0.length > 0 && c1.length > 0) {
        const m0x = c0.reduce((s, p) => s + p.x, 0) / c0.length;
        const m0y = c0.reduce((s, p) => s + p.y, 0) / c0.length;
        const m1x = c1.reduce((s, p) => s + p.x, 0) / c1.length;
        const m1y = c1.reduce((s, p) => s + p.y, 0) / c1.length;
        const dist = Math.sqrt(Math.pow(m1x - m0x, 2) + Math.pow(m1y - m0y, 2));
        setLdaSeparability(parseFloat((dist * 3.2).toFixed(2)));
      }
      return;
    }

    if (selectedModel === 'svd_decomposition') {
      const dist = Math.min(2.5, Math.max(0.4, Math.sqrt(x * x + y * y)));
      setSvdSingular1(parseFloat(dist.toFixed(2)));
      return;
    }
  };

  // Perform discrete algorithm step
  const performStep = () => {
    if (selectedModel === 'em_gmm') {
      // EM Step
      const { gmmPoints, gmmParams } = stateRef.current;
      if (gmmPoints.length === 0) return;

      // E-Step: Responsibilities
      const resps: { r1: number; r2: number }[] = gmmPoints.map(x => {
        const p1 = gmmParams.pi1 * (1 / (gmmParams.sig1 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - gmmParams.mu1) / gmmParams.sig1, 2));
        const p2 = gmmParams.pi2 * (1 / (gmmParams.sig2 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - gmmParams.mu2) / gmmParams.sig2, 2));
        const total = p1 + p2 || 1e-6;
        return { r1: p1 / total, r2: p2 / total };
      });

      // M-Step: Parameter Updates
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
      setEmLogLikelihood(prev => prev + (Math.random() * 1.5 - 0.2));
    } else if (selectedModel === 'newton_raphson') {
      // Newton 1D Step: f(x) = x^3 - 2x - 5 or x^4 - 2x^2
      // x_{k+1} = x_k - f'(x_k) / f''(x_k)
      const x = newtonCurrentX;
      const fPrime = 4 * Math.pow(x, 3) - 4 * x;
      const fDoublePrime = 12 * Math.pow(x, 2) - 4 || 1e-4;
      const nextX = x - (fPrime / fDoublePrime) * newtonDamping;
      setNewtonCurrentX(nextX);
      setNewtonStepCount(prev => prev + 1);
    }
  };

  // 60 FPS Physics & Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localFrame = 0;

    const renderLoop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.40;

      ctx.clearRect(0, 0, w, h);

      // Grid background
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 40) {
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
      }
      for (let y = 0; y <= h; y += 40) {
        ctx.moveTo(0, y); ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Axes
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
      ctx.moveTo(0, cy); ctx.lineTo(w, cy);
      ctx.stroke();

      stateRef.current.timeT += 0.02;
      localFrame++;

      // ────────────────────────────────────────────────────────────────────────
      // 1. FIRST-ORDER OPTIMIZATION (SGD, Momentum, RMSprop, Adam Contour Race)
      // ────────────────────────────────────────────────────────────────────────
      if (selectedModel === 'first_order_optimizers') {
        // Draw 2D Contour Map
        for (let r = 0.2; r <= 1.8; r += 0.22) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.12 + (1.8 - r) * 0.25})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          if (optLossSurface === 'saddle') {
            // Hyperbolic level curves
            ctx.ellipse(cx, cy, r * scale * 1.2, r * scale * 0.7, 0, 0, 2 * Math.PI);
          } else if (optLossSurface === 'rosenbrock') {
            // Parabolic valley curves
            ctx.ellipse(cx + 0.3 * scale, cy - 0.2 * scale, r * scale * 1.1, r * scale * 0.5, 0.45, 0, 2 * Math.PI);
          } else {
            ctx.ellipse(cx, cy, r * scale, r * scale * 0.8, 0, 0, 2 * Math.PI);
          }
          ctx.stroke();
        }

        // Global Optimum Crosshair
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
          momentumPos.vx = optMomentumBeta * momentumPos.vx + lr * gradMom.dx;
          momentumPos.vy = optMomentumBeta * momentumPos.vy + lr * gradMom.dy;
          momentumPos.x -= momentumPos.vx;
          momentumPos.y -= momentumPos.vy;
          stateRef.current.optHistory.momentum.push({ x: momentumPos.x, y: momentumPos.y });

          // 3. RMSprop Step
          const gradRms = lossFunction(rmspropPos.x, rmspropPos.y, optLossSurface);
          rmspropPos.sx = 0.9 * rmspropPos.sx + 0.1 * gradRms.dx * gradRms.dx;
          rmspropPos.sy = 0.9 * rmspropPos.sy + 0.1 * gradRms.dy * gradRms.dy;
          rmspropPos.x -= (lr / (Math.sqrt(rmspropPos.sx) + 1e-6)) * gradRms.dx;
          rmspropPos.y -= (lr / (Math.sqrt(rmspropPos.sy) + 1e-6)) * gradRms.dy;
          stateRef.current.optHistory.rmsprop.push({ x: rmspropPos.x, y: rmspropPos.y });

          // 4. Adam Step
          const gradAdam = lossFunction(adamPos.x, adamPos.y, optLossSurface);
          adamPos.t += 1;
          const beta1 = 0.9;
          const beta2 = 0.999;
          adamPos.m.x = beta1 * adamPos.m.x + (1 - beta1) * gradAdam.dx;
          adamPos.m.y = beta1 * adamPos.m.y + (1 - beta1) * gradAdam.dy;
          adamPos.v.x = beta2 * adamPos.v.x + (1 - beta2) * gradAdam.dx * gradAdam.dx;
          adamPos.v.y = beta2 * adamPos.v.y + (1 - beta2) * gradAdam.dy * gradAdam.dy;
          const mHatX = adamPos.m.x / (1 - Math.pow(beta1, adamPos.t));
          const mHatY = adamPos.m.y / (1 - Math.pow(beta1, adamPos.t));
          const vHatX = adamPos.v.x / (1 - Math.pow(beta2, adamPos.t));
          const vHatY = adamPos.v.y / (1 - Math.pow(beta2, adamPos.t));
          adamPos.x -= (lr / (Math.sqrt(vHatX) + 1e-6)) * mHatX;
          adamPos.y -= (lr / (Math.sqrt(vHatY) + 1e-6)) * mHatY;
          stateRef.current.optHistory.adam.push({ x: adamPos.x, y: adamPos.y });
        }

        // Draw Trajectory Paths
        const drawTrajectory = (pts: { x: number; y: number }[], color: string) => {
          if (pts.length < 2) return;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx + pts[0].x * scale, cy - pts[0].y * scale);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(cx + pts[i].x * scale, cy - pts[i].y * scale);
          }
          ctx.stroke();

          // Current particle
          const last = pts[pts.length - 1];
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(cx + last.x * scale, cy - last.y * scale, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;
        };

        const { optHistory } = stateRef.current;
        drawTrajectory(optHistory.sgd, '#ef4444');
        drawTrajectory(optHistory.momentum, '#38bdf8');
        drawTrajectory(optHistory.rmsprop, '#c084fc');
        drawTrajectory(optHistory.adam, '#34d399');

        // Legend (Top-Right position)
        const legendItems = [
          { name: 'SGD', color: '#ef4444' },
          { name: 'Momentum', color: '#38bdf8' },
          { name: 'RMSprop', color: '#c084fc' },
          { name: 'Adam', color: '#34d399' }
        ];
        legendItems.forEach((item, idx) => {
          const lx = w - 330 + idx * 80;
          const ly = 24;
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.arc(lx, ly, 4.5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(item.name, lx + 8, ly + 3.5);
        });
      }

      // ────────────────────────────────────────────────────────────────────────
      // 2. MAXIMUM LIKELIHOOD (MLE) & BAYESIAN MAP ESTIMATION
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'mle_map') {
        const muMLE = mleSampleMean;
        const sigma = mleSampleStd;
        const muPrior = mapPriorMean;
        const lambdaPrior = mapPriorWeight;
        const muMAP = (1 - lambdaPrior) * muMLE + lambdaPrior * muPrior;

        // Gaussian Likelihood Curve L(theta)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        for (let x = -2.5; x <= 2.5; x += 0.05) {
          const y = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - muMLE) / sigma, 2));
          const px = cx + x * scale;
          const py = cy - y * (scale * 0.45);
          if (x === -2.5) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Prior Distribution Curve P(theta)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let x = -2.5; x <= 2.5; x += 0.05) {
          const y = (1 / (0.7 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - muPrior) / 0.7, 2));
          const px = cx + x * scale;
          const py = cy - y * (scale * 0.35);
          if (x === -2.5) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Sample Data Points along X Axis
        const pts = stateRef.current.mlePoints;
        pts.forEach(p => {
          const px = cx + p * scale;
          const py = cy;
          ctx.fillStyle = 'rgba(192, 132, 252, 0.75)';
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
          ctx.fill();

          ctx.strokeStyle = 'rgba(192, 132, 252, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, py - 8); ctx.lineTo(px, py + 8);
          ctx.stroke();
        });

        // Vertical Indicator: MLE (Cyan)
        const mleX = cx + muMLE * scale;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(mleX, 50); ctx.lineTo(mleX, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`θ_MLE: ${muMLE.toFixed(2)}`, mleX + 5, 65);

        // Vertical Indicator: MAP (Emerald)
        const mapX = cx + muMAP * scale;
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(mapX, 50); ctx.lineTo(mapX, cy);
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`θ_MAP: ${muMAP.toFixed(2)}`, mapX + 5, 80);

        // Equation Badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - 160, 20, 320, 34, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`log L(θ) = -N/2 ln(2πσ²) - Σ(x_i - μ)²/(2σ²)`, cx, 42);
        ctx.textAlign = 'left';
      }

      // ────────────────────────────────────────────────────────────────────────
      // 3. EXPECTATION-MAXIMIZATION (EM) ALGORITHM (Gaussian Mixtures)
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'em_gmm') {
        const { gmmParams, gmmPoints } = stateRef.current;

        // Auto-run EM if in autoplay
        if (isSimulating && localFrame % 45 === 0 && emIterations < 20) {
          performStep();
        }

        // Draw Mixture Component 1 (Cyan)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = -2.5; x <= 2.5; x += 0.05) {
          const y = gmmParams.pi1 * (1 / (gmmParams.sig1 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - gmmParams.mu1) / gmmParams.sig1, 2));
          const px = cx + x * scale;
          const py = cy - y * (scale * 0.45);
          if (x === -2.5) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Draw Mixture Component 2 (Purple)
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = -2.5; x <= 2.5; x += 0.05) {
          const y = gmmParams.pi2 * (1 / (gmmParams.sig2 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - gmmParams.mu2) / gmmParams.sig2, 2));
          const px = cx + x * scale;
          const py = cy - y * (scale * 0.45);
          if (x === -2.5) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Sample Data Points with Soft Responsibility Color Interpolation
        gmmPoints.forEach(x => {
          const p1 = gmmParams.pi1 * (1 / (gmmParams.sig1 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - gmmParams.mu1) / gmmParams.sig1, 2));
          const p2 = gmmParams.pi2 * (1 / (gmmParams.sig2 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - gmmParams.mu2) / gmmParams.sig2, 2));
          const gamma1 = p1 / (p1 + p2 || 1e-6);

          const px = cx + x * scale;
          const py = cy;
          ctx.fillStyle = gamma1 > 0.5 ? '#38bdf8' : '#c084fc';
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Parameters Badges
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`μ₁: ${gmmParams.mu1.toFixed(2)} (π₁=${gmmParams.pi1.toFixed(2)})`, cx + gmmParams.mu1 * scale - 40, cy + 25);

        ctx.fillStyle = '#c084fc';
        ctx.fillText(`μ₂: ${gmmParams.mu2.toFixed(2)} (π₂=${gmmParams.pi2.toFixed(2)})`, cx + gmmParams.mu2 * scale - 40, cy + 25);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - 150, 20, 300, 34, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`EM GMM • Iteration ${emIterations} • Log-Lik: ${emLogLikelihood.toFixed(2)}`, cx, 42);
        ctx.textAlign = 'left';
      }

      // ────────────────────────────────────────────────────────────────────────
      // 4. MCMC METROPOLIS-HASTINGS (Posterior Sampling Walk)
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'mcmc_metropolis') {
        // Target Distribution P(x) = 0.5 * N(-0.8, 0.3) + 0.5 * N(0.8, 0.4) (Bimodal Posterior)
        const targetPDF = (x: number) => {
          return 0.5 * Math.exp(-0.5 * Math.pow((x + 0.8) / 0.3, 2)) + 0.5 * Math.exp(-0.5 * Math.pow((x - 0.8) / 0.4, 2));
        };

        // Draw Target Posterior Density Curve
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let x = -2.5; x <= 2.5; x += 0.05) {
          const y = targetPDF(x);
          const px = cx + x * scale;
          const py = cy - y * (scale * 0.55);
          if (x === -2.5) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Perform MCMC Random Walk Step
        if (isSimulating && localFrame % 8 === 0) {
          const current = stateRef.current.mcmcCurrent;
          const proposal = current + (Math.random() - 0.5) * mcmcProposalStd * 2;
          const pCurrent = targetPDF(current);
          const pProposal = targetPDF(proposal);
          const alpha = Math.min(1, pProposal / (pCurrent || 1e-6));
          const accepted = Math.random() < alpha;

          if (accepted) {
            stateRef.current.mcmcCurrent = proposal;
            stateRef.current.mcmcHistory.push({ x: proposal, accepted: true });

            // Accumulate Histogram bin
            const binIdx = Math.floor(((proposal + 2.5) / 5.0) * 50);
            if (binIdx >= 0 && binIdx < 50) {
              stateRef.current.mcmcHistogram[binIdx]++;
            }
          } else {
            stateRef.current.mcmcHistory.push({ x: proposal, accepted: false });
          }

          setMcmcTotalSamples(prev => prev + 1);
        }

        // Draw Histogram Bars (Approximated Empirical Distribution)
        const hist = stateRef.current.mcmcHistogram;
        const maxBin = Math.max(...hist, 1);
        ctx.fillStyle = 'rgba(52, 211, 153, 0.35)';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1;
        const binW = (5.0 / 50) * scale;
        hist.forEach((count, i) => {
          const xVal = -2.5 + i * (5.0 / 50);
          const hBar = (count / maxBin) * (scale * 0.40);
          const px = cx + xVal * scale;
          const py = cy;
          ctx.fillRect(px, py, binW, hBar);
          ctx.strokeRect(px, py, binW, hBar);
        });

        // Draw MCMC History Jump Indicators
        const histTrace = stateRef.current.mcmcHistory.slice(-25);
        histTrace.forEach((hItem) => {
          const px = cx + hItem.x * scale;
          ctx.strokeStyle = hItem.accepted ? 'rgba(52, 211, 153, 0.6)' : 'rgba(239, 68, 68, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px, cy - 15); ctx.lineTo(px, cy + 15);
          ctx.stroke();
        });

        // Current Walker Particle
        const curX = cx + stateRef.current.mcmcCurrent * scale;
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(curX, cy, 6.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - 160, 20, 320, 34, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`MCMC Metropolis-Hastings • α = min(1, P(x*)/P(x_t))`, cx, 42);
        ctx.textAlign = 'left';
      }

      // ────────────────────────────────────────────────────────────────────────
      // 5. RESAMPLING METHODS (Bootstrap Empirical Confidence Intervals)
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'bootstrap_resampling') {
        const { bootSamples, bootReplicas } = stateRef.current;

        // Draw Original Observed Points (Amber)
        bootSamples.forEach(x => {
          const px = cx + x * scale;
          const py = cy + 120;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, 2 * Math.PI);
          ctx.fill();
        });

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('Original Samples X = {x₁...xₙ}', 20, cy + 124);

        // Draw Bootstrap Replicas Density Histogram
        if (bootReplicas.length > 0) {
          const bins = 40;
          const hist = new Array(bins).fill(0);
          bootReplicas.forEach(val => {
            const bIdx = Math.floor(((val + 0.6) / 1.2) * bins);
            if (bIdx >= 0 && bIdx < bins) hist[bIdx]++;
          });
          const maxB = Math.max(...hist, 1);
          const binWidth = (1.2 / bins) * scale;

          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          hist.forEach((count, i) => {
            const xVal = -0.6 + i * (1.2 / bins);
            const hBar = (count / maxB) * (scale * 0.45);
            const px = cx + xVal * scale;
            const py = cy + 80;
            ctx.fillRect(px, py - hBar, binWidth, hBar);
            ctx.strokeRect(px, py - hBar, binWidth, hBar);
          });

          // Draw 95% Confidence Interval Bands [q0.025, q0.975]
          const qLow = bootCI95.low;
          const qHigh = bootCI95.high;

          const pxLow = cx + qLow * scale;
          const pxHigh = cx + qHigh * scale;

          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(pxLow, cy - 80); ctx.lineTo(pxLow, cy + 80);
          ctx.moveTo(pxHigh, cy - 80); ctx.lineTo(pxHigh, cy + 80);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`2.5%: ${qLow.toFixed(3)}`, pxLow - 25, cy - 90);
          ctx.fillText(`97.5%: ${qHigh.toFixed(3)}`, pxHigh - 25, cy - 90);
        }

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - 160, 20, 320, 34, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`BOOTSTRAP REPLICAS (B=${bootNumReplicas}) • SE=${bootStdError.toFixed(4)}`, cx, 42);
        ctx.textAlign = 'left';
      }

      // ────────────────────────────────────────────────────────────────────────
      // 6. SECOND-ORDER NEWTON-RAPHSON (Quadratic Hessian Fit)
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'newton_raphson') {
        const xk = newtonCurrentX;
        // Objective: f(x) = x^4 - 2x^2
        const f = (x: number) => Math.pow(x, 4) - 2 * Math.pow(x, 2);
        const fPrime = (x: number) => 4 * Math.pow(x, 3) - 4 * x;
        const fDouble = (x: number) => 12 * Math.pow(x, 2) - 4;

        // Draw Objective Curve f(x) (Cyan)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let x = -2.2; x <= 2.2; x += 0.05) {
          const y = f(x);
          const px = cx + x * scale;
          const py = cy - y * (scale * 0.35);
          if (x === -2.2) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Quadratic Taylor Model at x_k: q(x) = f(xk) + f'(xk)(x - xk) + 0.5*f''(xk)(x - xk)^2
        const fxk = f(xk);
        const g = fPrime(xk);
        const h = fDouble(xk) || 1e-4;

        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (let x = xk - 1.2; x <= xk + 1.2; x += 0.05) {
          const delta = x - xk;
          const qVal = fxk + g * delta + 0.5 * h * delta * delta;
          const px = cx + x * scale;
          const py = cy - qVal * (scale * 0.35);
          if (x === xk - 1.2) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Current point x_k
        const pxk = cx + xk * scale;
        const pyk = cy - fxk * (scale * 0.35);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(pxk, pyk, 6, 0, 2 * Math.PI);
        ctx.fill();

        // Next point step jump
        const nextX = xk - (g / h) * newtonDamping;
        const nextPX = cx + nextX * scale;
        const nextPY = cy - f(nextX) * (scale * 0.35);

        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pxk, pyk); ctx.lineTo(nextPX, nextPY);
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`Next Step x_{k+1}: ${nextX.toFixed(2)}`, nextPX + 6, nextPY - 6);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - 160, 20, 320, 34, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#c084fc';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`NEWTON-RAPHSON: x_{k+1} = x_k - [H(x_k)]⁻¹ ∇f(x_k)`, cx, 42);
        ctx.textAlign = 'left';
      }

      // ────────────────────────────────────────────────────────────────────────
      // 7. CONSTRAINED OPTIMIZATION (Lagrange Multipliers & KKT)
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'lagrange_kkt') {
        const c = lagrangeLevelC;

        // Objective level contours: f(x, y) = x^2 + y^2
        for (let r = 0.4; r <= 2.2; r += 0.4) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, r * scale, 0, 2 * Math.PI);
          ctx.stroke();
        }

        // Constraint Line g(x, y) = x + y - c = 0
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx + (c + 1.2) * scale, cy - (-1.2) * scale);
        ctx.lineTo(cx + (-1.2) * scale, cy - (c + 1.2) * scale);
        ctx.stroke();

        // Tangency Contact Point x*
        const optX = c / 2;
        const optY = c / 2;
        const optPX = cx + optX * scale;
        const optPY = cy - optY * scale;

        ctx.fillStyle = '#34d399';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(optPX, optPY, 7, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Collinear Normal Gradient Vectors ∇f & λ∇g
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(optPX, optPY);
        ctx.lineTo(optPX + 45, optPY - 45);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('∇f = λ ∇g (Collinear)', optPX + 10, optPY - 15);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - 160, 20, 320, 34, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`LAGRANGE KKT: ∇f(x*) + λ·∇g(x*) = 0 • λ=${lagrangeLambda.toFixed(2)}`, cx, 42);
        ctx.textAlign = 'left';
      }

      // ────────────────────────────────────────────────────────────────────────
      // 8. FISHER'S LINEAR DISCRIMINANT ANALYSIS (Max Scatter Projection)
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'fisher_lda') {
        const rad = (ldaClassAngle * Math.PI) / 180;
        const wx = Math.cos(rad);
        const wy = Math.sin(rad);

        // Draw Fisher Projection Line w = S_W^-1 (mu_1 - mu_2)
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(cx - wx * 1.5 * scale, cy + wy * 1.5 * scale);
        ctx.lineTo(cx + wx * 1.5 * scale, cy - wy * 1.5 * scale);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw Class 0 & Class 1 Points & 1D Projections
        const pts = stateRef.current.ldaPoints;
        pts.forEach(p => {
          const px = cx + p.x * scale;
          const py = cy - p.y * scale;
          const color = p.cls === 0 ? '#38bdf8' : '#f59e0b';
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
          ctx.fill();

          // Projection
          const dot = p.x * wx + p.y * wy;
          const projX = cx + dot * wx * scale;
          const projY = cy - dot * wy * scale;
          ctx.strokeStyle = p.cls === 0 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(245, 158, 11, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(px, py); ctx.lineTo(projX, projY);
          ctx.stroke();

          // Projected point on line
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(projX, projY, 3, 0, 2 * Math.PI);
          ctx.fill();
        });

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - 160, 20, 320, 34, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`FISHER'S LDA: J(w) = wᵀ S_B w / wᵀ S_W w`, cx, 42);
        ctx.textAlign = 'left';
      }

      // ────────────────────────────────────────────────────────────────────────
      // 9. SINGULAR VALUE DECOMPOSITION (Geometric Transformation A = U Σ Vᵀ)
      // ────────────────────────────────────────────────────────────────────────
      else if (selectedModel === 'svd_decomposition') {
        const s1 = svdSingular1;
        const s2 = svdSingular2;

        // Draw Unit Circle (Input Domain V)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(cx - 150, cy, 70, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('Input Domain: ||x|| = 1', cx - 210, cy - 85);

        // Input Basis Vectors v1, v2
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 150, cy); ctx.lineTo(cx - 150 + 70, cy);
        ctx.stroke();

        ctx.strokeStyle = '#c084fc';
        ctx.beginPath();
        ctx.moveTo(cx - 150, cy); ctx.lineTo(cx - 150, cy - 70);
        ctx.stroke();

        // Arrow
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('→  A = U Σ Vᵀ  →', cx - 40, cy + 5);

        // Transformed Output Ellipse (Range of A)
        const rot = stateRef.current.timeT * 0.4;
        ctx.save();
        ctx.translate(cx + 150, cy);
        ctx.rotate(rot);

        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(0, 0, s1 * 55, s2 * 55, 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Major Axis u1 * sigma1
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(s1 * 55, 0);
        ctx.stroke();

        // Minor Axis u2 * sigma2
        ctx.strokeStyle = '#c084fc';
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(0, -s2 * 55);
        ctx.stroke();

        ctx.restore();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(`Transformed Ellipse (σ₁=${s1.toFixed(2)}, σ₂=${s2.toFixed(2)})`, cx + 60, cy - 85);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - 150, 20, 300, 34, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`SVD: A = U Σ Vᵀ • Condition Number κ=${(s1 / s2).toFixed(2)}`, cx, 42);
        ctx.textAlign = 'left';
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    selectedModel,
    isSimulating,
    optLossSurface,
    optLearningRate,
    optMomentumBeta,
    mleSampleMean,
    mleSampleStd,
    mapPriorMean,
    mapPriorWeight,
    emIterations,
    emLogLikelihood,
    emConverged,
    mcmcProposalStd,
    bootNumReplicas,
    bootCI95,
    bootStdError,
    newtonCurrentX,
    newtonDamping,
    lagrangeLevelC,
    lagrangeLambda,
    ldaClassAngle,
    svdSingular1,
    svdSingular2
  ]);

  return (
    <div
      className="statistical-optimization-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        height: '100%',
        color: '#f8fafc'
      }}
    >
      {/* ─── Control Deck ─── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '10px 14px',
          background: 'rgba(15, 23, 42, 0.9)',
          borderRadius: '12px',
          border: '1px solid rgba(51, 65, 85, 0.6)',
          backdropFilter: 'blur(8px)'
        }}
      >
        {/* Model Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
            Algorithm:
          </span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as StatOptModelType)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: 'rgba(30, 41, 59, 0.9)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              color: '#38bdf8',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <optgroup label="📊 Parameter Estimation & Inference">
              <option value="first_order_optimizers">⚡ First-Order Race (SGD vs Momentum vs RMSprop vs Adam)</option>
              <option value="mle_map">📈 Maximum Likelihood (MLE) & Bayesian MAP</option>
              <option value="em_gmm">🧬 Expectation-Maximization (EM on Gaussian Mixtures)</option>
              <option value="mcmc_metropolis">🎲 Markov Chain Monte Carlo (MCMC Metropolis-Hastings)</option>
              <option value="bootstrap_resampling">🔄 Resampling Methods (Bootstrap & Permutation CI)</option>
            </optgroup>
            <optgroup label="⚡ Continuous & Numerical Optimization">
              <option value="newton_raphson">🎯 Second-Order Newton-Raphson & Parabolic Hessian</option>
              <option value="lagrange_kkt">⚖️ Constrained Optimization (Lagrange Multipliers & KKT)</option>
            </optgroup>
            <optgroup label="📐 Linear Algebra & Decompositions">
              <option value="fisher_lda">📐 Fisher's Linear Discriminant Analysis (LDA)</option>
              <option value="svd_decomposition">🔄 Singular Value Decomposition (SVD: A = U Σ Vᵀ)</option>
            </optgroup>
          </select>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mode Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '3px',
              background: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '8px',
              border: '1px solid rgba(51, 65, 85, 0.6)'
            }}
          >
            <button
              type="button"
              onClick={() => { setSimMode('autoplay'); setIsSimulating(true); }}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                background: simMode === 'autoplay' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: simMode === 'autoplay' ? '#38bdf8' : '#94a3b8',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Autoplay Showcase
            </button>
            <button
              type="button"
              onClick={() => { setSimMode('interactive'); setIsSimulating(false); }}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                background: simMode === 'interactive' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: simMode === 'interactive' ? '#38bdf8' : '#94a3b8',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Interactive Mode
            </button>
          </div>

          {/* Discrete Step button for iterative models */}
          {(selectedModel === 'em_gmm' || selectedModel === 'newton_raphson') && (
            <button
              type="button"
              onClick={performStep}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: 'rgba(192, 132, 252, 0.2)',
                border: '1px solid rgba(192, 132, 252, 0.5)',
                color: '#c084fc',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={14} />
              <span>Step Iteration</span>
            </button>
          )}

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={() => setIsSimulating(!isSimulating)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: isSimulating ? 'rgba(239, 68, 68, 0.85)' : 'rgba(16, 185, 129, 0.85)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isSimulating ? <Pause size={14} /> : <Play size={14} />}
            <span>{isSimulating ? 'Pause' : 'Simulate'}</span>
          </button>

          {/* Reseed / Reset Button */}
          <button
            type="button"
            onClick={reseedData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.8)',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ─── Main Grid ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: '12px',
          flex: 1,
          minHeight: '660px',
          height: 'calc(100vh - 210px)'
        }}
      >
        {/* Left Canvas Viewport */}
        <div
          style={{
            position: 'relative',
            background: '#0a0f1d',
            borderRadius: '16px',
            border: '1px solid rgba(51, 65, 85, 0.8)',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <canvas
            ref={canvasRef}
            width={850}
            height={620}
            onMouseDown={handleMouseDown}
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
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              borderRadius: '8px',
              border: '1px solid rgba(51, 65, 85, 0.8)',
              fontSize: '0.72rem',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MousePointer size={13} color="#38bdf8" />
            <span>
              {selectedModel === 'first_order_optimizers' && '💡 Click canvas to reposition starting point (x₀, y₀)'}
              {selectedModel === 'mle_map' && '💡 Click canvas to add sample points • Adjust Prior Weight'}
              {selectedModel === 'em_gmm' && '💡 Expectation (E-Step) & Maximization (M-Step) Convergence'}
              {selectedModel === 'mcmc_metropolis' && '💡 Green = Accepted Jumps • Red = Rejected Jumps'}
              {selectedModel === 'bootstrap_resampling' && '💡 95% Bootstrap Empirical Confidence Bands [q0.025, q0.975]'}
              {selectedModel === 'newton_raphson' && '💡 Click to set initial x₀ • Parabolic Quadratic Hessian Taylor Fit'}
              {selectedModel === 'lagrange_kkt' && '💡 Collinear Gradients ∇f = λ∇g at Tangency Contact Point'}
              {selectedModel === 'fisher_lda' && '💡 Maximizing Between-Class Scatter over Within-Class Scatter'}
              {selectedModel === 'svd_decomposition' && '💡 Geometric Circle-to-Ellipse Transformation (A = U Σ Vᵀ)'}
            </span>
          </div>

          {/* Floating Class Placement Pill for Fisher's LDA */}
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
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                border: '1px solid rgba(51, 65, 85, 0.8)',
                zIndex: 10
              }}
            >
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', paddingLeft: '4px', fontWeight: 600 }}>Place:</span>
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
                ● Class 0 (Blue)
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
                ● Class 1 (Orange)
              </button>
            </div>
          )}
        </div>

        {/* Right Telemetry & Context Console */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: '16px',
            border: '1px solid rgba(51, 65, 85, 0.8)',
            padding: '16px',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(51, 65, 85, 0.6)', paddingBottom: '8px' }}>
            <Activity size={16} color="#38bdf8" />
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', margin: 0, textTransform: 'uppercase' }}>
              {selectedModel.replace(/_/g, ' ')} Telemetry
            </h4>
          </div>

          {/* TELEMETRY CARDS */}
          {selectedModel === 'first_order_optimizers' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Active Surface:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', textTransform: 'capitalize' }}>{optLossSurface}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Learning Rate:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{optLearningRate}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Momentum β:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{optMomentumBeta}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Optimizers:</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c084fc' }}>4 Racing (Adam, RMS, SGD)</div>
              </div>
            </div>
          )}

          {selectedModel === 'mle_map' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Sample Mean (MLE):</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{mleSampleMean.toFixed(3)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Prior Mean:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace' }}>{mapPriorMean.toFixed(2)}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Log-Likelihood ln L(θ):</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{mleLogLikelihood.toFixed(2)}</div>
              </div>
            </div>
          )}

          {selectedModel === 'em_gmm' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>EM Iterations:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{emIterations}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Log-Likelihood:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{emLogLikelihood.toFixed(2)}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Components (K=2):</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c084fc' }}>Soft Responsibilities (γ_ik)</div>
              </div>
            </div>
          )}

          {selectedModel === 'mcmc_metropolis' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Total Samples:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{mcmcTotalSamples}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Acceptance Rate:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{mcmcAcceptanceRate.toFixed(1)}%</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Proposal Std (σ_prop):</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{mcmcProposalStd.toFixed(2)}</div>
              </div>
            </div>
          )}

          {selectedModel === 'bootstrap_resampling' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Bootstrap Mean:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{bootMeanEstimate.toFixed(3)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Bootstrap SE:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{bootStdError.toFixed(4)}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>95% Empirical CI (B={bootNumReplicas}):</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c084fc', fontFamily: 'monospace' }}>[{bootCI95.low.toFixed(3)}, {bootCI95.high.toFixed(3)}]</div>
              </div>
            </div>
          )}

          {selectedModel === 'newton_raphson' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Current x_k:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{newtonCurrentX.toFixed(3)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Newton Steps:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{newtonStepCount}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Quadratic Convergence:</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c084fc' }}>Hessian Second Derivative f''(x)</div>
              </div>
            </div>
          )}

          {selectedModel === 'lagrange_kkt' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Multiplier λ:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{lagrangeLambda.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Constraint c:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace' }}>{lagrangeLevelC.toFixed(2)}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>KKT Condition:</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399' }}>∇f + λ ∇g = 0 (Tangency)</div>
              </div>
            </div>
          )}

          {selectedModel === 'fisher_lda' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Scatter Ratio J(w):</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{ldaSeparability.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Projection Angle:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{ldaClassAngle}°</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Optimal Axis:</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c084fc' }}>w ∝ S_W⁻¹ (μ₁ - μ₂)</div>
              </div>
            </div>
          )}

          {selectedModel === 'svd_decomposition' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Singular Value σ₁:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{svdSingular1.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Singular Value σ₂:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#c084fc', fontFamily: 'monospace' }}>{svdSingular2.toFixed(2)}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Condition Number κ(A):</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{(svdSingular1 / svdSingular2).toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* DYNAMIC PARAMETER CONTROLS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={14} color="#38bdf8" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>
                Algorithm Parameters
              </span>
            </div>

            {/* 1. First Order Optimizer Controls */}
            {selectedModel === 'first_order_optimizers' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Loss Surface:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {(['saddle', 'rosenbrock', 'beale', 'quadratic'] as const).map(surf => (
                      <button key={surf} type="button" onClick={() => setOptLossSurface(surf)} style={{ padding: '5px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize', background: optLossSurface === surf ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: optLossSurface === surf ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)', color: optLossSurface === surf ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}>{surf}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    <span>Learning Rate (η):</span>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>{optLearningRate}</span>
                  </div>
                  <input type="range" min="0.005" max="0.10" step="0.005" value={optLearningRate} onChange={(e) => setOptLearningRate(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    <span>Momentum Beta (β):</span>
                    <span style={{ fontWeight: 700, color: '#fbbf24' }}>{optMomentumBeta}</span>
                  </div>
                  <input type="range" min="0.5" max="0.98" step="0.02" value={optMomentumBeta} onChange={(e) => setOptMomentumBeta(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                </div>
              </>
            )}

            {/* 2. MLE & MAP Controls */}
            {selectedModel === 'mle_map' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    <span>Sample Spread (σ):</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{mleSampleStd.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.2" max="0.8" step="0.05" value={mleSampleStd} onChange={(e) => setMleSampleStd(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    <span>Prior Weight (λ_prior):</span>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>{mapPriorWeight}</span>
                  </div>
                  <input type="range" min="0.0" max="0.8" step="0.05" value={mapPriorWeight} onChange={(e) => setMapPriorWeight(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    <span>Prior Mean (μ₀):</span>
                    <span style={{ fontWeight: 700, color: '#c084fc' }}>{mapPriorMean}</span>
                  </div>
                  <input type="range" min="-1.0" max="1.0" step="0.1" value={mapPriorMean} onChange={(e) => setMapPriorMean(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }} />
                </div>
              </>
            )}

            {/* 3. MCMC Metropolis Controls */}
            {selectedModel === 'mcmc_metropolis' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
                  <span>Proposal Std (σ_prop):</span>
                  <span style={{ fontWeight: 700, color: '#38bdf8' }}>{mcmcProposalStd}</span>
                </div>
                <input type="range" min="0.1" max="1.2" step="0.05" value={mcmcProposalStd} onChange={(e) => setMcmcProposalStd(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
              </div>
            )}

            {/* 4. Bootstrap Controls */}
            {selectedModel === 'bootstrap_resampling' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
                  <span>Bootstrap Replicas (B):</span>
                  <span style={{ fontWeight: 700, color: '#34d399' }}>{bootNumReplicas}</span>
                </div>
                <input type="range" min="50" max="500" step="50" value={bootNumReplicas} onChange={(e) => setBootNumReplicas(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }} />
              </div>
            )}

            {/* 5. Newton-Raphson Controls */}
            {selectedModel === 'newton_raphson' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
                  <span>Step Damping (α):</span>
                  <span style={{ fontWeight: 700, color: '#c084fc' }}>{newtonDamping}</span>
                </div>
                <input type="range" min="0.2" max="1.0" step="0.1" value={newtonDamping} onChange={(e) => setNewtonDamping(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }} />
              </div>
            )}

            {/* 6. Lagrange Multiplier Controls */}
            {selectedModel === 'lagrange_kkt' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    <span>Constraint Level (c):</span>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>{lagrangeLevelC}</span>
                  </div>
                  <input type="range" min="0.4" max="2.2" step="0.1" value={lagrangeLevelC} onChange={(e) => setLagrangeLevelC(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>KKT Complementary Slackness:</label>
                  <button
                    type="button"
                    onClick={() => setKktInequalityActive(!kktInequalityActive)}
                    style={{
                      width: '100%',
                      padding: '5px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: kktInequalityActive ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                      border: kktInequalityActive ? '1px solid #34d399' : '1px solid rgba(51, 65, 85, 0.6)',
                      color: kktInequalityActive ? '#34d399' : '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    {kktInequalityActive ? '✓ Active Constraint (μ > 0)' : 'Inactive Region (μ = 0)'}
                  </button>
                </div>
              </>
            )}

            {/* 7. Fisher LDA Controls */}
            {selectedModel === 'fisher_lda' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
                  <span>Projection Angle (θ):</span>
                  <span style={{ fontWeight: 700, color: '#34d399' }}>{ldaClassAngle}°</span>
                </div>
                <input type="range" min="0" max="180" step="5" value={ldaClassAngle} onChange={(e) => setLdaClassAngle(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }} />
              </div>
            )}

            {/* 8. SVD Controls */}
            {selectedModel === 'svd_decomposition' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    <span>Singular Value 1 (σ₁):</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{svdSingular1}</span>
                  </div>
                  <input type="range" min="0.8" max="2.5" step="0.05" value={svdSingular1} onChange={(e) => setSvdSingular1(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    <span>Singular Value 2 (σ₂):</span>
                    <span style={{ fontWeight: 700, color: '#c084fc' }}>{svdSingular2}</span>
                  </div>
                  <input type="range" min="0.2" max="1.2" step="0.05" value={svdSingular2} onChange={(e) => setSvdSingular2(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }} />
                </div>
              </>
            )}
          </div>

          {/* Mathematical Formulation Card */}
          <div
            style={{
              marginTop: 'auto',
              padding: '10px 12px',
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '10px',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={13} color="#38bdf8" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8' }}>MATHEMATICAL FORMULATION</span>
            </div>
            <div style={{ fontSize: '0.70rem', color: '#cbd5e1', fontFamily: 'monospace', lineHeight: 1.4 }}>
              {selectedModel === 'first_order_optimizers' && 'Adam: m_t = β₁m_{t-1} + (1-β₁)g_t, v_t = β₂v_{t-1} + (1-β₂)g_t²; θ_{t+1} = θ_t - η m̂_t / (√v̂_t + ε)'}
              {selectedModel === 'mle_map' && 'θ_MAP = argmax_θ [ ln P(X | θ) + ln P(θ) ]; Regularized Prior Bias'}
              {selectedModel === 'em_gmm' && 'E: γ_{ik} = π_k N(x_i|μ_k, Σ_k) / ∑_j π_j N(x_i|μ_j, Σ_j); M: μ_k = ∑_i γ_{ik} x_i / N_k'}
              {selectedModel === 'mcmc_metropolis' && 'Acceptance: α(x, x*) = min(1, [P(x*) q(x|x*)] / [P(x) q(x*|x)])'}
              {selectedModel === 'bootstrap_resampling' && 'SE_{boot} = √[ 1/(B-1) ∑_{b=1}^B (θ̂^{*(b)} - θ̄^* )² ]; 95% CI = [q_{0.025}, q_{0.975}]'}
              {selectedModel === 'newton_raphson' && 'x_{k+1} = x_k - [H(x_k)]⁻¹ ∇f(x_k); Quadratic Convergence'}
              {selectedModel === 'lagrange_kkt' && 'L(x, λ) = f(x) + ∑ λ_i g_i(x) + ∑ μ_j h_j(x); ∇_x L = 0, μ_j h_j(x) = 0'}
              {selectedModel === 'fisher_lda' && 'w* = argmax_w [ wᵀ S_B w / wᵀ S_W w ] = S_W⁻¹ (μ₁ - μ₂)'}
              {selectedModel === 'svd_decomposition' && 'A = U Σ Vᵀ = ∑_{i=1}^r σ_i u_i v_iᵀ; Geometry of Hyper-Ellipsoid Transformation'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
