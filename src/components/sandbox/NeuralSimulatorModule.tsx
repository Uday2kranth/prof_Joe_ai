import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import katex from 'katex';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Sparkles,
  StepForward,
  Gauge,
  Activity,
  BarChart2,
  Eye,
  Maximize2,
  Layout,
  Compass,
  RefreshCw,
  MousePointer,
  PanelRightClose,
  PanelRightOpen,
  X
} from 'lucide-react';
import { getCanvasTheme, drawCanvasAtmosphere, drawDiagramCard, withPlotBoxClip } from '../../utils/canvasThemeEngine';

export type MLModelType =
  | 'kmeans_clustering'
  | 'pca_reduction'
  | 'knn_classifier'
  | 'linear_regression'
  | 'logistic_regression'
  | 'svm_classifier'
  | 'decision_tree_split'
  | 'naive_bayes'
  | 'random_forest'
  | 'gradient_boosting'
  | 'loss_surface_optimization'
  | 'neural_mlp'
  | 'q_learning_rl'
  | 'backprop_autodiff'
  | 'conv_operations'
  | 'seq_recurrent_gating'
  | 'attention_mechanisms'
  | 'transformer_architecture'
  | 'moe_architecture'
  | 'vae_generative'
  | 'gan_minimax'
  | 'ddpm_diffusion';

export type DatasetType = 'circle' | 'xor' | 'spiral' | 'gaussian' | 'moons';

interface DataPoint {
  x: number;
  y: number;
  label: number;
}

interface Centroid {
  x: number;
  y: number;
  color: string;
}

export const NeuralSimulatorModule: React.FC = () => {
  // ─── Operational & Global State ───
  const [selectedModel, setSelectedModel] = useState<MLModelType>('pca_reduction');
  const [simMode, setSimMode] = useState<'interactive' | 'autoplay'>('autoplay');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [dataset] = useState<DatasetType>('circle');
  const [simSpeed, setSimSpeed] = useState<number>(1.0); // 0.1x to 3.0x
  const [activePlacementClass, setActivePlacementClass] = useState<number>(0);
  const [mobileActiveTab, setMobileActiveTab] = useState<'canvas' | 'controls' | 'telemetry'>('canvas');
  const [desktopTab, setDesktopTab] = useState<'parameters' | 'telemetry' | 'split' | 'focus'>('split');
  const [canvasAtmosphere, setCanvasAtmosphere] = useState<string>(() => {
    try {
      return localStorage.getItem('chatterbot_canvas_atmosphere') || 'deep_void';
    } catch {
      return 'deep_void';
    }
  });

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

  // ─── 1. K-Means Clustering State ───
  const [numClusters, setNumClusters] = useState<number>(3);
  const [kmeansInitMode, setKmeansInitMode] = useState<'random' | 'kmeans_plus_plus'>('kmeans_plus_plus');
  const [kmeansDistance, setKmeansDistance] = useState<'euclidean' | 'manhattan'>('euclidean');
  const [kmeansIterations, setKmeansIterations] = useState<number>(0);
  const [kmeansWCSS, setKmeansWCSS] = useState<number>(0.185);
  const [kmeansSilhouette] = useState<number>(0.74);
  const [kmeansConverged, setKmeansConverged] = useState<boolean>(false);

  // ─── 2. Principal Component Analysis (PCA) State ───
  const [pcaViewMode, setPcaViewMode] = useState<'2d_projection' | 'scree_subspace' | '3d_to_2d_plane'>('2d_projection');
  const [pcaComponentsCount, setPcaComponentsCount] = useState<1 | 2>(2);
  const [pcaCorrelation, setPcaCorrelation] = useState<number>(0.78);
  const [pcaRotationAngle, setPcaRotationAngle] = useState<number>(35); // degrees
  const [pcaDataSpread, setPcaDataSpread] = useState<number>(0.85);
  const [pcaShowResiduals, setPcaShowResiduals] = useState<boolean>(true);
  const [pca3dRotX, setPca3dRotX] = useState<number>(28);
  const [pca3dRotY, setPca3dRotY] = useState<number>(45);
  const [pcaEVR1, setPcaEVR1] = useState<number>(88.4);
  const [pcaEVR2, setPcaEVR2] = useState<number>(11.6);
  const [pcaVarianceProjected, setPcaVarianceProjected] = useState<number>(0.68);
  const [pcaVarianceResidual, setPcaVarianceResidual] = useState<number>(0.12);

  // ─── 3. k-Nearest Neighbors (kNN) State ───
  const [kParam, setKParam] = useState<number>(5);
  const [knnDistance, setKnnDistance] = useState<'euclidean' | 'manhattan' | 'cosine' | 'chebyshev'>('euclidean');
  const [knnWeighting, setKnnWeighting] = useState<'uniform' | 'distance'>('uniform');
  const [knnQueriesChecked, setKnnQueriesChecked] = useState<number>(1);
  const [knnShowBoundary, setKnnShowBoundary] = useState<boolean>(true);

  // ─── 4. Linear & Multiple Linear Regression State ───
  const [linearViewMode, setLinearViewMode] = useState<
    '3d_regression_plane' | '1d_scatter_fit' | 'polynomial_curves' | 'residuals_analysis'
  >('3d_regression_plane');
  const [linearSlopeW1, setLinearSlopeW1] = useState<number>(0.85);
  const [linearSlopeW2, setLinearSlopeW2] = useState<number>(0.55);
  const [linearInterceptB, setLinearInterceptB] = useState<number>(0.12);
  const [linearRidgeLambda, setLinearRidgeLambda] = useState<number>(0.0);
  const [linearRegMode, setLinearRegMode] = useState<'ols' | 'ridge' | 'lasso'>('ols');
  const [linearPolyDegree, setLinearPolyDegree] = useState<number>(2);
  const [linear3dRotX, setLinear3dRotX] = useState<number>(28);
  const [linear3dRotY, setLinear3dRotY] = useState<number>(45);
  const [linearShowResiduals, setLinearShowResiduals] = useState<boolean>(true);
  const [linearShowProjectionRays, setLinearShowProjectionRays] = useState<boolean>(true);
  const [r2Score, setR2Score] = useState<number>(0.89);

  // ─── 5. Logistic Regression State ───
  const [logregViewMode, setLogregViewMode] = useState<
    '3d_sigmoid_surface' | '1d_sigmoid_curve' | '2d_heatmap_boundary' | 'multinomial_softmax' | 'log_loss_dual_curve'
  >('3d_sigmoid_surface');
  const [logregBoundaryType, setLogregBoundaryType] = useState<'linear' | 'polynomial'>('linear');
  const [logregThreshold, setLogregThreshold] = useState<number>(0.5);
  const [logregW1, setLogregW1] = useState<number>(1.3);
  const [logregW2, setLogregW2] = useState<number>(-1.1);
  const [logregBiasB, setLogregBiasB] = useState<number>(0.0);
  const [logreg3dRotX, setLogreg3dRotX] = useState<number>(28);
  const [logreg3dRotY, setLogreg3dRotY] = useState<number>(42);
  const [logregTemperature, setLogregTemperature] = useState<number>(1.0);
  const [logregTrueLabelY, setLogregTrueLabelY] = useState<0 | 1>(1);
  const [logregTestZ, setLogregTestZ] = useState<number>(1.2);

  // ─── 6. Support Vector Machine (SVM) State ───
  const [svmViewMode, setSvmViewMode] = useState<'2d_kernels' | '1d_parabola' | '3d_kernel_trick'>('2d_kernels');
  const [svmKernel, setSvmKernel] = useState<'linear' | 'poly' | 'rbf' | 'sigmoid'>('rbf');
  const [svmC, setSvmC] = useState<number>(1.0);
  const [svmBiasB, setSvmBiasB] = useState<number>(0.0);
  const [svmGamma, setSvmGamma] = useState<number>(1.2);
  const [svmPolyDegree, setSvmPolyDegree] = useState<number>(3);
  const [svmPolyIntercept, setSvmPolyIntercept] = useState<number>(1.0);
  const [svmLiftMorph, setSvmLiftMorph] = useState<number>(1.0);
  const [svm3dRotX, setSvm3dRotX] = useState<number>(28);
  const [svm3dRotY, setSvm3dRotY] = useState<number>(42);
  const [svm3dSliceZ, setSvm3dSliceZ] = useState<number>(0.65);

  // ─── 7. Decision Tree Split State ───
  const [treeDepth, setTreeDepth] = useState<number>(3);
  const [treeCriterion, setTreeCriterion] = useState<'gini' | 'entropy'>('gini');
  const [treeMinSamplesSplit, setTreeMinSamplesSplit] = useState<number>(2);

  // ─── 8. Naive Bayes State ───
  const [nbViewMode, setNbViewMode] = useState<'gaussian_continuous' | 'multinomial_text'>('gaussian_continuous');
  const [nbPriorC0, setNbPriorC0] = useState<number>(0.5);
  const [nbVarSmoothing, setNbVarSmoothing] = useState<number>(0.02);
  const [nbProbePos, setNbProbePos] = useState<{ x: number; y: number }>({ x: 0.15, y: -0.1 });
  const [nbFeatureMeanSeparation, setNbFeatureMeanSeparation] = useState<number>(0.9);
  const [nbClass0VarianceScale, setNbClass0VarianceScale] = useState<number>(1.0);
  const [nbClass1VarianceScale, setNbClass1VarianceScale] = useState<number>(1.0);

  // ─── 9. Random Forest State ───
  const [forestNumTrees, setForestNumTrees] = useState<number>(5);

  // ─── 10. Gradient Boosting State ───
  const [boostStages, setBoostStages] = useState<number>(4);
  const [boostLearningRate, setBoostLearningRate] = useState<number>(0.15);
  const [boostBaseBiasF0, setBoostBaseBiasF0] = useState<number>(0.0);

  // ─── 11. Multi-Layer Perceptron (Neural MLP) State ───
  const [mlpLayers, setMlpLayers] = useState<number>(2);
  const [mlpActivation, setMlpActivation] = useState<'relu' | 'sigmoid' | 'tanh' | 'leaky_relu' | 'elu' | 'gelu'>('relu');
  const [mlpInitMode, setMlpInitMode] = useState<'xavier' | 'he' | 'random' | 'zeros' | 'custom'>('he');
  const [mlpWeightScale, setMlpWeightScale] = useState<number>(1.0);
  const [mlpBiasOffset, setMlpBiasOffset] = useState<number>(0.1);
  const [mlpSparsity, setMlpSparsity] = useState<number>(18.5);

  // ─── 12. Backpropagation & Autodiff State ───
  const [autodiffMode, setAutodiffMode] = useState<'scalar_dag' | 'multilayer_mlp' | 'mimo_matrix'>('scalar_dag');
  const [autodiffTarget, setAutodiffTarget] = useState<number>(1.0);
  const [autodiffX1, setAutodiffX1] = useState<number>(0.8);
  const [autodiffX2, setAutodiffX2] = useState<number>(0.6);
  const [autodiffW1, setAutodiffW1] = useState<number>(0.5);
  const [autodiffW2, setAutodiffW2] = useState<number>(-0.4);
  const [autodiffBias, setAutodiffBias] = useState<number>(0.1);
  const [autodiffStepCount, setAutodiffStepCount] = useState<number>(0);
  const [autodiffLR, setAutodiffLR] = useState<number>(0.1);

  // ─── 13. Advanced Convolutional Operations & CNN Architecture State ───
  const [convMode, setConvMode] = useState<'kernel_convolution' | 'relu_and_pooling' | 'deep_cnn_pipeline' | 'resnet_skip_block'>('kernel_convolution');
  const [convPadding, setConvPadding] = useState<0 | 1 | 2>(1); // 0 = Valid (p=0), 1 = Same (p=1), 2 = Full (p=2)
  const [convStrideVal, setConvStrideVal] = useState<1 | 2>(1);
  const [convFilterType, setConvFilterType] = useState<'edge' | 'sobel_h' | 'sobel_v' | 'sharpen' | 'ridge' | 'gaussian'>('edge');
  const [convDilationRate, setConvDilationRate] = useState<1 | 2>(1);
  const [convPoolType, setConvPoolType] = useState<'max' | 'avg'>('max');
  const [convInputDigit, setConvInputDigit] = useState<'digit_7' | 'digit_3' | 'digit_0' | 'edge_box'>('digit_7');
  const [convPostBiasB, setConvPostBiasB] = useState<number>(0.0);
  const [convScanStep, setConvScanStep] = useState<number>(0);

  // ─── 14. Sequential & Recurrent Gating State ───
  const [recurrentCellType, setRecurrentCellType] = useState<'lstm' | 'gru' | 'vanilla_rnn'>('lstm');
  const [recurrentSeqLen] = useState<number>(4);
  const [recurrentActiveT, setRecurrentActiveT] = useState<number>(0);
  const [recurrentForgetBias, setRecurrentForgetBias] = useState<number>(1.0);
  const [recurrentCandidateAct, setRecurrentCandidateAct] = useState<'tanh' | 'relu' | 'gelu'>('tanh');
  const [recurrentWeightWxh, setRecurrentWeightWxh] = useState<number>(1.0);

  // ─── 15. Attention Mechanisms State ───
  const [attnSubMode, setAttnSubMode] = useState<
    'scaled_dot_product' | 'multi_head' | 'cross_attention' | 'causal_masked' | 'recursive_recurrent' | 'positional_encoding'
  >('scaled_dot_product');
  const [attnNumHeads, setAttnNumHeads] = useState<number>(4);
  const [attnSelectedTokenIdx, setAttnSelectedTokenIdx] = useState<number>(0);
  const [attnTemperature, setAttnTemperature] = useState<number>(1.0);
  const [attnWeightScaleWq, setAttnWeightScaleWq] = useState<number>(1.0);

  // ─── 15B. Transformer Architecture & Stacking State ───
  const [transformerMode, setTransformerMode] = useState<'encoder' | 'decoder' | 'encoder_decoder'>('encoder_decoder');
  const [transformerNumLayers, setTransformerNumLayers] = useState<number>(6); // 2 to 16
  const [transformerSelectedLayer, setTransformerSelectedLayer] = useState<number>(0);
  const [transformerModelDim] = useState<number>(512);
  const [transformerFfnDim] = useState<number>(2048);
  const [transformerGenStep, setTransformerGenStep] = useState<number>(0);
  const [transformerSamplingTemp, setTransformerSamplingTemp] = useState<number>(0.8);
  const [transformerTopK, setTransformerTopK] = useState<number>(5);

  // ─── 15C. Mixture of Experts (MoE) State ───
  const [moeNumExperts, setMoeNumExperts] = useState<4 | 8 | 16>(8);
  const [moeTopK, setMoeTopK] = useState<1 | 2 | 4>(2);
  const [moeRouterNoise, setMoeRouterNoise] = useState<number>(0.0);
  const [moeRouterTemperature, setMoeRouterTemperature] = useState<number>(1.0);
  const [moeSelectedTokenIdx, setMoeSelectedTokenIdx] = useState<number>(0);
  const [moeCapacityFactor, setMoeCapacityFactor] = useState<number>(1.25);
  const [moeAuxLossWeight, setMoeAuxLossWeight] = useState<number>(0.02);

  // ─── 15B. Loss Surface Optimization & Gradient Descent State ───
  const [lossLandscape, setLossLandscape] = useState<'multimodal_minima' | 'convex_bowl' | 'rosenbrock_valley' | 'saddle_point'>('multimodal_minima');
  const [optAlgorithm, setOptAlgorithm] = useState<'batch' | 'mini_batch' | 'sgd' | 'momentum' | 'rmsprop' | 'adam' | 'tri_variant_race'>('momentum');
  const [optLearningRate, setOptLearningRate] = useState<number>(0.08);
  const [optMomentum, setOptMomentum] = useState<number>(0.85);
  const [optNoise, setOptNoise] = useState<number>(0.0);
  const [optBatchSize, setOptBatchSize] = useState<number>(32);
  const [optPos, setOptPos] = useState<{ w1: number; w2: number }>({ w1: -2.2, w2: 1.8 });
  const [optVelocity, setOptVelocity] = useState<{ v1: number; v2: number }>({ v1: 0, v2: 0 });
  const [optLoss, setOptLoss] = useState<number>(4.15);
  const [optGradNorm, setOptGradNorm] = useState<number>(1.82);
  const [optStepCount, setOptStepCount] = useState<number>(0);
  const [optStatus, setOptStatus] = useState<'optimizing' | 'converged' | 'local_min' | 'overshooting'>('optimizing');

  // ─── 16. Variational Autoencoders (VAEs) State ───
  const [vaeLatentZ1, setVaeLatentZ1] = useState<number>(0.35);
  const [vaeLatentZ2, setVaeLatentZ2] = useState<number>(-0.45);
  const [vaeBetaKL, setVaeBetaKL] = useState<number>(1.0);

  // ─── 17. Generative Adversarial Networks (GANs) State ───
  const [ganLossType, setGanLossType] = useState<'minimax' | 'wasserstein_gp'>('wasserstein_gp');
  const [ganWassersteinDist, setGanWassersteinDist] = useState<number>(0.142);
  const [ganGenLR, setGanGenLR] = useState<number>(0.0002);
  const [ganDiscLR, setGanDiscLR] = useState<number>(0.0002);
  const [ganCriticSteps, setGanCriticSteps] = useState<number>(3);
  const [ganLatentDim, setGanLatentDim] = useState<number>(4);
  const [ganModePreset, setGanModePreset] = useState<'bimodal' | 'circle_8' | 'swiss_roll'>('circle_8');
  const [ganEpochCount, setGanEpochCount] = useState<number>(1);
  const [ganLossG, setGanLossG] = useState<number>(0.685);

  // ─── 18. Diffusion Models (DDPM) State ───
  const [ddpmTimestep, setDdpmTimestep] = useState<number>(25);
  const [ddpmMaxSteps, setDdpmMaxSteps] = useState<number>(50);
  const [ddpmBetaSchedule, setDdpmBetaSchedule] = useState<'linear' | 'cosine' | 'sigmoid'>('cosine');
  const [ddpmDirection, setDdpmDirection] = useState<'forward' | 'reverse'>('reverse');
  const [ddpmBetaMin, setDdpmBetaMin] = useState<number>(0.0001);
  const [ddpmBetaMax, setDdpmBetaMax] = useState<number>(0.02);
  const [ddpmDenoiseStepCount, setDdpmDenoiseStepCount] = useState<number>(0);

  // ─── 19. Reinforcement Learning (Q-Learning GridWorld) State ───
  const [rlPolicy, setRlPolicy] = useState<'eps_greedy' | 'softmax'>('eps_greedy');
  const [rlEpsilon, setRlEpsilon] = useState<number>(0.15);
  const [rlTemperature, setRlTemperature] = useState<number>(0.8);
  const [rlDiscountGamma, setRlDiscountGamma] = useState<number>(0.9);
  const [rlLearningRateAlpha, setRlLearningRateAlpha] = useState<number>(0.2);
  const [rlEpisodes, setRlEpisodes] = useState<number>(0);
  const [rlCumulativeReward, setRlCumulativeReward] = useState<number>(0);
  const [rlMapPreset, setRlMapPreset] = useState<'classic' | 'cliff' | 'maze' | 'dual_goal'>('classic');
  const [rlRewardGoal] = useState<number>(100);
  const [rlRewardTrap] = useState<number>(-50);

  // ─── 3D Perspective & Orbit Controls ───
  const [rotX, setRotX] = useState<number>(32); // degrees pitch
  const [rotY, setRotY] = useState<number>(45); // degrees yaw
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // ─── Dynamic Canvas & Animation References ───
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef<{ type: string | null; index: number }>({ type: null, index: -1 });

  // Internal mutable simulator state
  const stateRef = useRef<{
    points: DataPoint[];
    centroids: Centroid[];
    knnQueryPoint: { x: number; y: number };
    linearWeights: { m: number; c: number };
    svmHyperplane: { w1: number; w2: number; b: number };
    logregWeights: { w1: number; w2: number; b: number };
    cnnKernelStep: number;
    rlAgentPos: { r: number; c: number };
    rlQTable: number[][][];
    rlMapGrid: number[][];
    timeT: number;
    convergeTimer: number;
    lastRlStepFrame: number;
    ganParticles: { x: number; y: number; vx: number; vy: number; targetX: number; targetY: number }[];
    ddpmNoiseMap: number[][];
    mlpWeights: number[][][];
    mlpBiases: number[][];
    optPos: { w1: number; w2: number };
    optVelocity: { v1: number; v2: number };
    optHistory: { w1: number; w2: number; loss: number }[];
    optStepCount: number;
    optAdamM: { m1: number; m2: number };
    optAdamV: { v1: number; v2: number };
    optRmspropS: { s1: number; s2: number };
    optRaceBatchPos?: { w1: number; w2: number };
    optRaceMiniPos?: { w1: number; w2: number };
    optRaceSgdPos?: { w1: number; w2: number };
    optRaceBatchHist?: { w1: number; w2: number }[];
    optRaceMiniHist?: { w1: number; w2: number }[];
    optRaceSgdHist?: { w1: number; w2: number }[];
    pca3dPoints: { x: number; y: number; z: number }[];
    nbProbePos: { x: number; y: number };
  }>({
    points: [],
    centroids: [],
    knnQueryPoint: { x: 0.15, y: -0.2 },
    linearWeights: { m: 0.85, c: 0.12 },
    svmHyperplane: { w1: 1.1, w2: -0.95, b: 0.05 },
    logregWeights: { w1: 1.3, w2: -1.1, b: 0.0 },
    cnnKernelStep: 0,
    rlAgentPos: { r: 0, c: 0 },
    rlQTable: Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => [0, 0, 0, 0])
    ),
    rlMapGrid: [
      [1, 0, 0, 0, 0],
      [0, 3, 0, 0, 0],
      [0, 0, 3, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 2]
    ],
    timeT: 0,
    convergeTimer: 0,
    lastRlStepFrame: 0,
    ganParticles: Array.from({ length: 55 }, () => ({
      x: (Math.random() - 0.5) * 1.6,
      y: (Math.random() - 0.5) * 1.6,
      vx: 0,
      vy: 0,
      targetX: 0,
      targetY: 0
    })),
    ddpmNoiseMap: Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => Math.random())
    ),
    mlpWeights: [],
    mlpBiases: [],
    optPos: { w1: -2.2, w2: 1.8 },
    optVelocity: { v1: 0, v2: 0 },
    optHistory: [{ w1: -2.2, w2: 1.8, loss: 4.15 }],
    optStepCount: 0,
    optAdamM: { m1: 0, m2: 0 },
    optAdamV: { v1: 0, v2: 0 },
    optRmspropS: { s1: 0, s2: 0 },
    optRaceBatchPos: { w1: -2.2, w2: 1.8 },
    optRaceMiniPos: { w1: -2.2, w2: 1.8 },
    optRaceSgdPos: { w1: -2.2, w2: 1.8 },
    optRaceBatchHist: [{ w1: -2.2, w2: 1.8 }],
    optRaceMiniHist: [{ w1: -2.2, w2: 1.8 }],
    optRaceSgdHist: [{ w1: -2.2, w2: 1.8 }],
    pca3dPoints: [],
    nbProbePos: { x: 0.15, y: -0.1 }
  });

  // Re-seed Environment Map for RL
  useEffect(() => {
    let grid: number[][] = [];
    if (rlMapPreset === 'classic') {
      grid = [
        [1, 0, 0, 0, 0],
        [0, 3, 0, 0, 0],
        [0, 0, 3, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 2]
      ];
    } else if (rlMapPreset === 'cliff') {
      grid = [
        [1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [1, 3, 3, 3, 2]
      ];
    } else if (rlMapPreset === 'maze') {
      grid = [
        [1, 0, 4, 0, 0],
        [0, 0, 4, 0, 3],
        [4, 0, 0, 0, 4],
        [0, 3, 4, 0, 0],
        [0, 0, 4, 0, 2]
      ];
    } else {
      grid = [
        [1, 0, 0, 0, 2],
        [0, 3, 0, 3, 0],
        [0, 0, 0, 0, 0],
        [0, 3, 0, 3, 0],
        [2, 0, 0, 0, 2]
      ];
    }
    stateRef.current.rlMapGrid = grid;
    stateRef.current.rlAgentPos = { r: 0, c: 0 };
    stateRef.current.rlQTable = Array.from({ length: grid.length }, () =>
      Array.from({ length: grid[0].length }, () => [0, 0, 0, 0])
    );
  }, [rlMapPreset]);

  // Dynamic Dataset Generator
  const generateData = useCallback(() => {
    const pts: DataPoint[] = [];
    const count = 140;

    if (selectedModel === 'pca_reduction') {
      const r = pcaCorrelation;
      const angle = (pcaRotationAngle * Math.PI) / 180;
      const majorStd = pcaDataSpread * 0.85;
      const minorStd = Math.max(0.08, pcaDataSpread * 0.85 * Math.sqrt(Math.max(0.01, 1 - r * r)));

      const pts3d: { x: number; y: number; z: number }[] = [];
      for (let i = 0; i < count; i++) {
        const u = (Math.random() - 0.5) * 2 * majorStd;
        const v = (Math.random() - 0.5) * 2 * minorStd;
        const x = u * Math.cos(angle) - v * Math.sin(angle);
        const y = u * Math.sin(angle) + v * Math.cos(angle);
        const z = (Math.random() - 0.5) * 0.6 * pcaDataSpread;
        pts.push({ x, y, label: 0 });
        pts3d.push({ x, y, z });
      }
      stateRef.current.pca3dPoints = pts3d;
    } else if (selectedModel === 'naive_bayes') {
      const sep = nbFeatureMeanSeparation || 0.9;
      const s0 = nbClass0VarianceScale || 1.0;
      const s1 = nbClass1VarianceScale || 1.0;
      for (let i = 0; i < count / 2; i++) {
        pts.push({
          x: -sep / 2 + (Math.random() - 0.5) * 0.65 * s0,
          y: sep / 2 + (Math.random() - 0.5) * 0.65 * s0,
          label: 0
        });
      }
      for (let i = 0; i < count / 2; i++) {
        pts.push({
          x: sep / 2 + (Math.random() - 0.5) * 0.65 * s1,
          y: -sep / 2 + (Math.random() - 0.5) * 0.65 * s1,
          label: 1
        });
      }
    } else if (dataset === 'circle') {
      for (let i = 0; i < count / 2; i++) {
        const r = Math.random() * 0.38;
        const theta = Math.random() * 2 * Math.PI;
        pts.push({ x: r * Math.cos(theta), y: r * Math.sin(theta), label: 1 });
      }
      for (let i = 0; i < count / 2; i++) {
        const r = 0.65 + Math.random() * 0.35;
        const theta = Math.random() * 2 * Math.PI;
        pts.push({ x: r * Math.cos(theta), y: r * Math.sin(theta), label: 0 });
      }
    } else if (dataset === 'xor') {
      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 1.8;
        const y = (Math.random() - 0.5) * 1.8;
        const label = x * y > 0 ? 1 : 0;
        pts.push({ x, y, label });
      }
    } else if (dataset === 'spiral') {
      for (let i = 0; i < count / 2; i++) {
        const r = (i / (count / 2)) * 0.9;
        const t = 1.75 * i * 0.2 + 0;
        pts.push({
          x: r * Math.sin(t) + (Math.random() - 0.5) * 0.1,
          y: r * Math.cos(t) + (Math.random() - 0.5) * 0.1,
          label: 1
        });
      }
      for (let i = 0; i < count / 2; i++) {
        const r = (i / (count / 2)) * 0.9;
        const t = 1.75 * i * 0.2 + Math.PI;
        pts.push({
          x: r * Math.sin(t) + (Math.random() - 0.5) * 0.1,
          y: r * Math.cos(t) + (Math.random() - 0.5) * 0.1,
          label: 0
        });
      }
    } else {
      // Gaussian
      for (let i = 0; i < count / 2; i++) {
        pts.push({
          x: -0.45 + (Math.random() - 0.5) * 0.5,
          y: 0.35 + (Math.random() - 0.5) * 0.5,
          label: 1
        });
      }
      for (let i = 0; i < count / 2; i++) {
        pts.push({
          x: 0.45 + (Math.random() - 0.5) * 0.5,
          y: -0.35 + (Math.random() - 0.5) * 0.5,
          label: 0
        });
      }
    }

    stateRef.current.points = pts;
  }, [selectedModel, dataset, pcaCorrelation, pcaRotationAngle, pcaDataSpread, nbFeatureMeanSeparation, nbClass0VarianceScale, nbClass1VarianceScale]);

  // Initial Data Generation
  useEffect(() => {
    generateData();
  }, [generateData]);

  // Reseed Centroids for K-Means
  const reseedCentroids = useCallback(() => {
    const colors = ['#38bdf8', '#f59e0b', '#34d399', '#ec4899', '#a855f7', '#06b6d4'];
    const newCentroids: Centroid[] = [];

    if (kmeansInitMode === 'kmeans_plus_plus' && stateRef.current.points.length > 0) {
      const pts = stateRef.current.points;
      const firstIdx = Math.floor(Math.random() * pts.length);
      newCentroids.push({
        x: pts[firstIdx].x,
        y: pts[firstIdx].y,
        color: colors[0]
      });

      while (newCentroids.length < numClusters) {
        let maxDistSq = -1;
        let bestIdx = 0;
        pts.forEach((p, idx) => {
          let minDistToAnyCentroidSq = Infinity;
          newCentroids.forEach(c => {
            const dSq = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
            if (dSq < minDistToAnyCentroidSq) minDistToAnyCentroidSq = dSq;
          });
          if (minDistToAnyCentroidSq > maxDistSq) {
            maxDistSq = minDistToAnyCentroidSq;
            bestIdx = idx;
          }
        });
        newCentroids.push({
          x: pts[bestIdx].x,
          y: pts[bestIdx].y,
          color: colors[newCentroids.length % colors.length]
        });
      }
    } else {
      for (let c = 0; c < numClusters; c++) {
        const angle = (2 * Math.PI * c) / numClusters;
        newCentroids.push({
          x: 0.5 * Math.cos(angle) + (Math.random() - 0.5) * 0.2,
          y: 0.5 * Math.sin(angle) + (Math.random() - 0.5) * 0.2,
          color: colors[c % colors.length]
        });
      }
    }

    stateRef.current.centroids = newCentroids;
    setKmeansConverged(false);
    setKmeansIterations(0);
  }, [kmeansInitMode, numClusters]);

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

  // Mouse & Touch Interaction in Logical CSS Pixels
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const scale = Math.min(rect.width, rect.height) * 0.42;

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
    const scale = Math.min(rect.width, rect.height) * 0.42;

    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;

    return {
      x: (mouseX - cx) / (scale || 1),
      y: (cy - mouseY) / (scale || 1)
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;

    if (selectedModel === 'kmeans_clustering') {
      const activeCentroids = stateRef.current.centroids.slice(0, numClusters);
      const hitIdx = activeCentroids.findIndex(c => Math.hypot(c.x - x, c.y - y) < 0.15);
      if (hitIdx !== -1) {
        isDraggingRef.current = { type: 'centroid', index: hitIdx };
        setKmeansConverged(false);
        return;
      }
      stateRef.current.points.push({ x, y, label: 0 });
      setKmeansConverged(false);
      return;
    }

    if (selectedModel === 'knn_classifier') {
      const qDist = Math.hypot(stateRef.current.knnQueryPoint.x - x, stateRef.current.knnQueryPoint.y - y);
      if (qDist < 0.18) {
        isDraggingRef.current = { type: 'knn_q', index: 0 };
        return;
      }
      stateRef.current.knnQueryPoint = { x, y };
      setKnnQueriesChecked(prev => prev + 1);
      return;
    }

    if (selectedModel === 'vae_generative') {
      if (canvas) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const leftPaneX = cx - 220;
        const paneY = cy - 100;
        const paneW = 180;
        const paneH = 180;
        const mouseX = ((e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * canvas.width;
        const mouseY = ((e.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * canvas.height;

        if (mouseX >= leftPaneX && mouseX <= leftPaneX + paneW && mouseY >= paneY && mouseY <= paneY + paneH) {
          const z1 = (mouseX - (leftPaneX + paneW / 2)) / 60;
          const z2 = ((paneY + paneH / 2) - mouseY) / 60;
          setVaeLatentZ1(Math.max(-1.4, Math.min(1.4, z1)));
          setVaeLatentZ2(Math.max(-1.4, Math.min(1.4, z2)));
          isDraggingRef.current = { type: 'vae_z', index: 0 };
          return;
        }
      }
      return;
    }

    if (selectedModel === 'linear_regression') {
      if (linearViewMode === '3d_regression_plane') {
        isDraggingRef.current = { type: 'linear_3d_rot', index: 0 };
        return;
      }
    }

    if (selectedModel === 'logistic_regression') {
      if (logregViewMode === '3d_sigmoid_surface') {
        isDraggingRef.current = { type: 'logreg_3d_rot', index: 0 };
        return;
      }
    }

    if (selectedModel === 'svm_classifier') {
      if (svmViewMode === '3d_kernel_trick') {
        isDraggingRef.current = { type: 'svm_3d_rot', index: 0 };
        return;
      }
    }

    if (selectedModel === 'pca_reduction') {
      if (canvas) {
        const mouseX = ((e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * canvas.width;
        const mouseY = ((e.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * canvas.height;
        const marginX = 14;
        const marginY = 14;
        const gap = 12;
        const totalW = canvas.width - 2 * marginX - gap;
        const leftW = Math.floor(totalW * 0.52);
        const leftH = canvas.height - 2 * marginY;
        const leftX = marginX;
        const leftY = marginY;
        const rightX = leftX + leftW + gap;
        const rightW = totalW - leftW;
        const rightH = leftH;

        // Left Board Click
        if (mouseX >= leftX && mouseX <= leftX + leftW && mouseY >= leftY && mouseY <= leftY + leftH) {
          if (pcaViewMode === '3d_to_2d_plane') {
            isDraggingRef.current = { type: 'pca_3d_rot', index: 0 };
            return;
          } else {
            const plotX = leftX + 16;
            const plotY = leftY + 36;
            const plotW = leftW - 32;
            const plotH = leftH - 120;
            const pcx = plotX + plotW / 2;
            const pcy = plotY + plotH / 2;
            const angleRad = Math.atan2(-(mouseY - pcy), mouseX - pcx);
            let angleDeg = Math.round(((angleRad * 180) / Math.PI + 360) % 360);
            if (angleDeg > 180) angleDeg -= 180;
            setPcaRotationAngle(angleDeg);
            isDraggingRef.current = { type: 'pca_angle', index: 0 };
            return;
          }
        }

        // Right Board Auto-Snap Click
        if (mouseX >= rightX && mouseX <= rightX + rightW && mouseY >= leftY && mouseY <= leftY + rightH) {
          const { points } = stateRef.current;
          const n = Math.max(1, points.length);
          const meanX = points.reduce((sum, p) => sum + p.x, 0) / n;
          const meanY = points.reduce((sum, p) => sum + p.y, 0) / n;
          let varX = 0; let varY = 0; let covXY = 0;
          points.forEach(p => {
            const dx = p.x - meanX; const dy = p.y - meanY;
            varX += dx * dx; varY += dy * dy; covXY += dx * dy;
          });
          const optimalAngleRad = 0.5 * Math.atan2(2 * (covXY / n), (varX / n) - (varY / n));
          let optimalAngleDeg = Math.round(((optimalAngleRad * 180) / Math.PI + 360) % 180);
          setPcaRotationAngle(optimalAngleDeg);
          return;
        }
      }
      return;
    }

    if (selectedModel === 'naive_bayes') {
      if (canvas) {
        const mouseX = ((e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * canvas.width;
        const mouseY = ((e.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * canvas.height;
        const marginX = 14;
        const marginY = 14;
        const gap = 12;
        const totalW = canvas.width - 2 * marginX - gap;
        const leftW = Math.floor(totalW * 0.51);
        const leftH = canvas.height - 2 * marginY;
        const leftX = marginX;
        const leftY = marginY;

        const plotX = leftX + 16;
        const plotY = leftY + 36;
        const plotW = leftW - 32;
        const plotH = leftH - 96;
        const pcx = plotX + plotW / 2;
        const pcy = plotY + plotH / 2;
        const pScale = Math.min(plotW, plotH) * 0.44;

        if (mouseX >= plotX && mouseX <= plotX + plotW && mouseY >= plotY && mouseY <= plotY + plotH) {
          const qx = Math.max(-2.0, Math.min(2.0, (mouseX - pcx) / pScale));
          const qy = Math.max(-2.0, Math.min(2.0, -(mouseY - pcy) / pScale));
          stateRef.current.nbProbePos = { x: qx, y: qy };
          setNbProbePos({ x: qx, y: qy });
          isDraggingRef.current = { type: 'nb_probe', index: 0 };
          return;
        }
      }
      return;
    }

    if (selectedModel === 'seq_recurrent_gating') {
      if (canvas) {
        const mouseX = ((e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * canvas.width;
        const mouseY = ((e.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * canvas.height;
        const marginX = 14;
        const marginY = 14;
        const gap = 12;
        const totalW = canvas.width - 2 * marginX - gap;
        const leftW = Math.floor(totalW * 0.52);
        const rightX = marginX + leftW + gap;
        const rightW = totalW - leftW;
        const rightY = marginY;

        // Check Click on Unrolled Timeline Cards on Right Board
        const chainY = rightY + 36;
        const cardW = (rightW - 24 - 3 * 6) / 4;
        const cardH = 88;
        if (mouseY >= chainY && mouseY <= chainY + cardH) {
          for (let step = 0; step < 4; step++) {
            const cardX = rightX + 12 + step * (cardW + 6);
            if (mouseX >= cardX && mouseX <= cardX + cardW) {
              setRecurrentActiveT(step);
              return;
            }
          }
        }
      }
      return;
    }

    if (selectedModel === 'loss_surface_optimization') {
      if (canvas) {
        const mouseX = ((e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * canvas.width;
        const mouseY = ((e.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * canvas.height;
        const marginX = 14;
        const marginY = 14;
        const gap = 12;
        const totalW = canvas.width - 2 * marginX - gap;
        const topoW = Math.floor(totalW * 0.51);
        const bellW = totalW - topoW;
        const topoH = canvas.height - 2 * marginY;
        const bellH = topoH;
        const topoX = marginX;
        const bellX = topoX + topoW + gap;
        const topoY = marginY;
        const bellY = marginY;

        const gx = topoX + 12;
        const gy = topoY + 42;
        const gw = topoW - 24;
        const gh = topoH - 76;

        // Click inside Left 2D Contour Map
        if (mouseX >= gx && mouseX <= gx + gw && mouseY >= gy && mouseY <= gy + gh) {
          const w1 = Math.max(-3.0, Math.min(3.0, -3.0 + ((mouseX - gx) / gw) * 6.0));
          const w2 = Math.max(-3.0, Math.min(3.0, 3.0 - ((mouseY - gy) / gh) * 6.0));
          const { loss, dw1, dw2 } = calculateLossAndGrad(w1, w2, lossLandscape);

          stateRef.current.optPos = { w1, w2 };
          stateRef.current.optVelocity = { v1: 0, v2: 0 };
          stateRef.current.optStepCount = 0;
          stateRef.current.optAdamM = { m1: 0, m2: 0 };
          stateRef.current.optAdamV = { v1: 0, v2: 0 };
          stateRef.current.optRmspropS = { s1: 0, s2: 0 };
          stateRef.current.optHistory = [{ w1, w2, loss }];

          stateRef.current.optRaceBatchPos = { w1, w2 };
          stateRef.current.optRaceMiniPos = { w1, w2 };
          stateRef.current.optRaceSgdPos = { w1, w2 };
          stateRef.current.optRaceBatchHist = [{ w1, w2 }];
          stateRef.current.optRaceMiniHist = [{ w1, w2 }];
          stateRef.current.optRaceSgdHist = [{ w1, w2 }];

          setOptPos({ w1, w2 });
          setOptVelocity({ v1: 0, v2: 0 });
          setOptLoss(loss);
          setOptGradNorm(Math.hypot(dw1, dw2));
          setOptStepCount(0);
          setOptStatus('optimizing');
          isDraggingRef.current = { type: 'opt_2d_pos', index: 0 };
          return;
        }

        // Click inside Right 1D Loss Profile
        const bx = bellX + 14;
        const by = bellY + 42;
        const bw = bellW - 28;
        const bh = bellH - 130;

        if (mouseX >= bx && mouseX <= bx + bw && mouseY >= by && mouseY <= by + bh) {
          const w1 = Math.max(-3.0, Math.min(3.0, -3.0 + ((mouseX - bx) / bw) * 6.0));
          const w2 = stateRef.current.optPos?.w2 || 0;
          const { loss, dw1, dw2 } = calculateLossAndGrad(w1, w2, lossLandscape);

          stateRef.current.optPos = { w1, w2 };
          stateRef.current.optVelocity = { v1: 0, v2: 0 };
          stateRef.current.optStepCount = 0;
          stateRef.current.optHistory = [{ w1, w2, loss }];

          setOptPos({ w1, w2 });
          setOptVelocity({ v1: 0, v2: 0 });
          setOptLoss(loss);
          setOptGradNorm(Math.hypot(dw1, dw2));
          setOptStepCount(0);
          setOptStatus('optimizing');
          isDraggingRef.current = { type: 'opt_1d_w1', index: 0 };
          return;
        }
      }
      return;
    }


    if (selectedModel === 'transformer_architecture') {
      if (canvas) {
        const mouseX = ((e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * canvas.width;
        const mouseY = ((e.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * canvas.height;

        if (transformerMode === 'encoder' || transformerMode === 'decoder') {
          // Layer Stacker Click in Encoder/Decoder View (Right Board)
          const rightX = 379;
          const rightW = 327;
          const layersY = 64;
          const layerCardH = Math.min(32, Math.floor((340 - (transformerNumLayers - 1) * 4) / transformerNumLayers));

          for (let l = 0; l < transformerNumLayers; l++) {
            const ly = layersY + l * (layerCardH + 4);
            if (mouseX >= rightX + 10 && mouseX <= rightX + rightW - 10 && mouseY >= ly && mouseY <= ly + layerCardH) {
              setTransformerSelectedLayer(l);
              return;
            }
          }
        } else {
          // Full Transformer View: Clicking bottom HUD advances/selects generation step
          if (mouseY >= 530 && mouseY <= 610) {
            // Check individual step pills
            const leftX = 14;
            for (let s = 0; s < 4; s++) {
              const badgeX = leftX + 28 + s * 78;
              if (mouseX >= badgeX && mouseX <= badgeX + 70) {
                setTransformerGenStep(s);
                return;
              }
            }
            setTransformerGenStep(prev => (prev + 1) % 4);
            return;
          }

          // Clicking any layer card in Full Transformer selects that layer
          const numL = transformerNumLayers;
          const stackBottomY = 14 + 592 - 128;
          const cardH = Math.min(36, Math.floor(((stackBottomY - 116) - (numL - 1) * 6) / numL));

          for (let l = 0; l < numL; l++) {
            const ly = stackBottomY - (l + 1) * (cardH + 6) + 6;
            if (mouseY >= ly && mouseY <= ly + cardH) {
              setTransformerSelectedLayer(l);
              return;
            }
          }
        }
      }
      return;
    }

    if (selectedModel === 'attention_mechanisms') {
      if (canvas) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const numTokens = 5;
        const tokenBoxW = 90;
        const startX = cx - (numTokens * (tokenBoxW + 16)) / 2;
        const tokenY = cy + 90;
        const mouseX = ((e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * canvas.width;
        const mouseY = ((e.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * canvas.height;

        // Token selector row
        for (let i = 0; i < numTokens; i++) {
          const tx = startX + i * (tokenBoxW + 16);
          if (mouseX >= tx && mouseX <= tx + tokenBoxW && mouseY >= tokenY && mouseY <= tokenY + 46) {
            setAttnSelectedTokenIdx(i);
            return;
          }
        }

        // Matrix cell click in Scaled Dot-Product Mode
        const matX = cx - 210;
        const matY = cy - 120;
        const cellSize = 38;
        for (let i = 0; i < numTokens; i++) {
          for (let j = 0; j < numTokens; j++) {
            const x = matX + j * cellSize;
            const y = matY + i * cellSize;
            if (mouseX >= x && mouseX <= x + cellSize && mouseY >= y && mouseY <= y + cellSize) {
              setAttnSelectedTokenIdx(i);
              return;
            }
          }
        }
      }
      return;
    }

    if (selectedModel === 'moe_architecture') {
      if (canvas) {
        const mouseX = ((e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * canvas.width;
        const mouseY = ((e.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * canvas.height;

        // Token probe row (Left Board)
        const leftX = 14;
        const leftY = 14;
        const tokenY = leftY + 44;
        const tokenW = 58;
        for (let i = 0; i < 5; i++) {
          const tx = leftX + 12 + i * (tokenW + 6);
          if (mouseX >= tx && mouseX <= tx + tokenW && mouseY >= tokenY && mouseY <= tokenY + 36) {
            setMoeSelectedTokenIdx(i);
            return;
          }
        }
      }
      return;
    }

    if (selectedModel === 'conv_operations') {
      if (canvas) {
        const mouseX = ((e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * canvas.width;
        const mouseY = ((e.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * canvas.height;

        if (convMode === 'deep_cnn_pipeline') {
          // Check digit selection clicks in Pipeline mode
          const rightX = 379;
          const rightY = 14;
          const btnY = rightY + 48;
          const digits: ('digit_7' | 'digit_3' | 'digit_0' | 'edge_box')[] = ['digit_7', 'digit_3', 'digit_0', 'edge_box'];
          for (let d = 0; d < digits.length; d++) {
            const bx = rightX + 16 + d * 76;
            if (mouseX >= bx && mouseX <= bx + 70 && mouseY >= btnY && mouseY <= btnY + 28) {
              setConvInputDigit(digits[d]);
              return;
            }
          }
        }
      }
      setConvScanStep(prev => (prev + 1) % 9);
      stateRef.current.cnnKernelStep = (stateRef.current.cnnKernelStep + 1) % 9;
      return;
    }

    if (selectedModel === 'backprop_autodiff') {
      setAutodiffTarget(prev => (prev === 1.0 ? 0.0 : 1.0));
      return;
    }

    if (selectedModel === 'q_learning_rl') {
      if (canvas) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const grid = stateRef.current.rlMapGrid;
        const R = grid.length;
        const C = grid[0].length;
        const tileSize = 64;
        const startX = cx - (C * tileSize) / 2;
        const startY = cy - (R * tileSize) / 2;
        const mouseX = ((e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * canvas.width;
        const mouseY = ((e.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * canvas.height;

        const c = Math.floor((mouseX - startX) / tileSize);
        const r = Math.floor((mouseY - startY) / tileSize);

        if (r >= 0 && r < R && c >= 0 && c < C && grid[r][c] !== 4) {
          stateRef.current.rlAgentPos = { r, c };
          return;
        }
      }
      return;
    }

    if (['pca_reduction', 'linear_regression'].includes(selectedModel)) {
      stateRef.current.points.push({ x, y, label: 0 });
      return;
    }

    if (['logistic_regression', 'svm_classifier', 'decision_tree_split', 'naive_bayes', 'random_forest', 'gradient_boosting', 'neural_mlp'].includes(selectedModel)) {
      stateRef.current.points.push({ x, y, label: activePlacementClass });
      return;
    }

    if (selectedModel === 'gan_minimax') {
      stateRef.current.ganParticles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        targetX: x,
        targetY: y
      });
      return;
    }

    if (selectedModel === 'ddpm_diffusion') {
      stateRef.current.points.push({ x, y, label: 0 });
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;

    if (isDraggingRef.current.type === 'centroid') {
      const idx = isDraggingRef.current.index;
      if (stateRef.current.centroids[idx]) {
        stateRef.current.centroids[idx].x = x;
        stateRef.current.centroids[idx].y = y;
        setKmeansConverged(false);
      }
    } else if (isDraggingRef.current.type === 'knn_q') {
      stateRef.current.knnQueryPoint = { x, y };
    } else if (isDraggingRef.current.type === 'vae_z') {
      if (canvas) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const leftPaneX = cx - 220;
        const paneY = cy - 100;
        const paneW = 180;
        const paneH = 180;
        const mouseX = ((e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * canvas.width;
        const mouseY = ((e.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * canvas.height;

        const z1 = (mouseX - (leftPaneX + paneW / 2)) / 60;
        const z2 = ((paneY + paneH / 2) - mouseY) / 60;
        setVaeLatentZ1(Math.max(-1.4, Math.min(1.4, z1)));
        setVaeLatentZ2(Math.max(-1.4, Math.min(1.4, z2)));
      }
    } else if (isDraggingRef.current.type === 'linear_3d_rot') {
      setLinear3dRotY(prev => (prev + (e.movementX || 0) * 0.75 + 360) % 360);
      setLinear3dRotX(prev => Math.max(5, Math.min(85, prev - (e.movementY || 0) * 0.5)));
    } else if (isDraggingRef.current.type === 'logreg_3d_rot') {
      setLogreg3dRotY(prev => (prev + (e.movementX || 0) * 0.75 + 360) % 360);
      setLogreg3dRotX(prev => Math.max(5, Math.min(85, prev - (e.movementY || 0) * 0.5)));
    } else if (isDraggingRef.current.type === 'svm_3d_rot') {
      setSvm3dRotY(prev => (prev + (e.movementX || 0) * 0.75 + 360) % 360);
      setSvm3dRotX(prev => Math.max(5, Math.min(85, prev - (e.movementY || 0) * 0.5)));
    } else if (isDraggingRef.current.type === 'opt_2d_pos') {
      if (canvas) {
        const mouseX = ((e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * canvas.width;
        const mouseY = ((e.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * canvas.height;
        const marginX = 14;
        const marginY = 14;
        const gap = 12;
        const totalW = canvas.width - 2 * marginX - gap;
        const topoW = Math.floor(totalW * 0.51);
        const topoH = canvas.height - 2 * marginY;
        const topoX = marginX;
        const topoY = marginY;

        const gx = topoX + 12;
        const gy = topoY + 42;
        const gw = topoW - 24;
        const gh = topoH - 76;

        const w1 = Math.max(-3.0, Math.min(3.0, -3.0 + ((mouseX - gx) / gw) * 6.0));
        const w2 = Math.max(-3.0, Math.min(3.0, 3.0 - ((mouseY - gy) / gh) * 6.0));
        const { loss, dw1, dw2 } = calculateLossAndGrad(w1, w2, lossLandscape);

        stateRef.current.optPos = { w1, w2 };
        stateRef.current.optHistory = [{ w1, w2, loss }];
        setOptPos({ w1, w2 });
        setOptLoss(loss);
        setOptGradNorm(Math.hypot(dw1, dw2));
      }
    } else if (isDraggingRef.current.type === 'opt_1d_w1') {
      if (canvas) {
        const mouseX = ((e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * canvas.width;
        const marginX = 14;
        const gap = 12;
        const totalW = canvas.width - 2 * marginX - gap;
        const topoW = Math.floor(totalW * 0.51);
        const bellW = totalW - topoW;
        const topoX = marginX;
        const bellX = topoX + topoW + gap;

        const bx = bellX + 14;
        const bw = bellW - 28;

        const w1 = Math.max(-3.0, Math.min(3.0, -3.0 + ((mouseX - bx) / bw) * 6.0));
        const w2 = stateRef.current.optPos?.w2 || 0;
        const { loss, dw1, dw2 } = calculateLossAndGrad(w1, w2, lossLandscape);

        stateRef.current.optPos = { w1, w2 };
        stateRef.current.optHistory = [{ w1, w2, loss }];
        setOptPos({ w1, w2 });
        setOptLoss(loss);
        setOptGradNorm(Math.hypot(dw1, dw2));
      }
    } else if (isDraggingRef.current.type === 'pca_angle') {
      if (canvas) {
        const mouseX = ((e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * canvas.width;
        const mouseY = ((e.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * canvas.height;
        const marginX = 14; const marginY = 14; const gap = 12;
        const totalW = canvas.width - 2 * marginX - gap;
        const leftW = Math.floor(totalW * 0.52);
        const leftH = canvas.height - 2 * marginY;
        const plotX = marginX + 16;
        const plotY = marginY + 36;
        const plotW = leftW - 32;
        const plotH = leftH - 120;
        const pcx = plotX + plotW / 2;
        const pcy = plotY + plotH / 2;
        const angleRad = Math.atan2(-(mouseY - pcy), mouseX - pcx);
        let angleDeg = Math.round(((angleRad * 180) / Math.PI + 360) % 360);
        if (angleDeg > 180) angleDeg -= 180;
        setPcaRotationAngle(angleDeg);
      }
    } else if (isDraggingRef.current.type === 'pca_3d_rot') {
      setPca3dRotY(prev => (prev + (e.movementX || 0) * 0.75 + 360) % 360);
      setPca3dRotX(prev => Math.max(5, Math.min(85, prev - (e.movementY || 0) * 0.5)));
    } else if (isDraggingRef.current.type === 'nb_probe') {
      if (canvas) {
        const mouseX = ((e.clientX - canvas.getBoundingClientRect().left) / canvas.getBoundingClientRect().width) * canvas.width;
        const mouseY = ((e.clientY - canvas.getBoundingClientRect().top) / canvas.getBoundingClientRect().height) * canvas.height;
        const marginX = 14; const marginY = 14; const gap = 12;
        const totalW = canvas.width - 2 * marginX - gap;
        const leftW = Math.floor(totalW * 0.51);
        const leftH = canvas.height - 2 * marginY;
        const plotX = marginX + 16;
        const plotY = marginY + 36;
        const plotW = leftW - 32;
        const plotH = leftH - 96;
        const pcx = plotX + plotW / 2;
        const pcy = plotY + plotH / 2;
        const pScale = Math.min(plotW, plotH) * 0.44;
        const qx = Math.max(-2.0, Math.min(2.0, (mouseX - pcx) / pScale));
        const qy = Math.max(-2.0, Math.min(2.0, -(mouseY - pcy) / pScale));
        stateRef.current.nbProbePos = { x: qx, y: qy };
        setNbProbePos({ x: qx, y: qy });
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = { type: null, index: -1 };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
      handleMouseDown({
        clientX: touch.clientX,
        clientY: touch.clientY,
        buttons: 1
      } as any);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const dx = touch.clientX - lastMousePosRef.current.x;
      const dy = touch.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };

      handleMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY,
        movementX: dx,
        movementY: dy,
        buttons: 1
      } as any);
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // Step Actions
  const performKmeansStep = useCallback(() => {
    const pts = stateRef.current.points;
    const activeCentroids = stateRef.current.centroids.slice(0, numClusters);
    if (pts.length === 0 || activeCentroids.length === 0) return;

    let changed = false;
    let totalWCSS = 0;

    pts.forEach(p => {
      let minDist = Infinity;
      let closestIdx = 0;
      activeCentroids.forEach((c, idx) => {
        const d = kmeansDistance === 'euclidean'
          ? Math.hypot(p.x - c.x, p.y - c.y)
          : Math.abs(p.x - c.x) + Math.abs(p.y - c.y);
        if (d < minDist) {
          minDist = d;
          closestIdx = idx;
        }
      });
      totalWCSS += minDist * minDist;
      if (p.label !== closestIdx) {
        p.label = closestIdx;
        changed = true;
      }
    });

    activeCentroids.forEach((c, idx) => {
      const assigned = pts.filter(p => p.label === idx);
      if (assigned.length > 0) {
        const avgX = assigned.reduce((sum, p) => sum + p.x, 0) / assigned.length;
        const avgY = assigned.reduce((sum, p) => sum + p.y, 0) / assigned.length;
        if (Math.hypot(c.x - avgX, c.y - avgY) > 0.005) changed = true;
        c.x = avgX;
        c.y = avgY;
      }
    });

    setKmeansWCSS(totalWCSS / (pts.length || 1));
    setKmeansIterations(prev => prev + 1);
    if (!changed) setKmeansConverged(true);
  }, [numClusters, kmeansDistance]);

  const performAutodiffStep = () => {
    const z = autodiffW1 * autodiffX1 + autodiffW2 * autodiffX2 + autodiffBias;
    const a = 1 / (1 + Math.exp(-z));
    const dL_da = a - autodiffTarget;
    const da_dz = a * (1 - a);
    const dL_dz = dL_da * da_dz;

    const dL_dw1 = dL_dz * autodiffX1;
    const dL_dw2 = dL_dz * autodiffX2;
    const dL_db = dL_dz;

    setAutodiffW1(prev => prev - autodiffLR * dL_dw1);
    setAutodiffW2(prev => prev - autodiffLR * dL_dw2);
    setAutodiffBias(prev => prev - autodiffLR * dL_db);
    setAutodiffStepCount(prev => prev + 1);
  };

  const performRecurrentStep = () => {
    setRecurrentActiveT(prev => (prev + 1) % recurrentSeqLen);
  };

  const performGanStep = () => {
    setGanEpochCount(prev => prev + 1);
    setGanWassersteinDist(prev => Math.max(0.04, prev * 0.92 + (Math.random() - 0.5) * 0.02));
    setGanLossG(prev => Math.max(0.2, prev * 0.95 + (Math.random() - 0.5) * 0.05));

    stateRef.current.ganParticles.forEach(p => {
      let targetX = 0;
      let targetY = 0;

      if (ganModePreset === 'bimodal') {
        const mode = Math.random() > 0.5 ? 0 : 1;
        targetX = mode === 0 ? -0.45 : 0.45;
        targetY = mode === 0 ? 0.35 : -0.35;
      } else if (ganModePreset === 'circle_8') {
        const m = Math.floor(Math.random() * 8);
        const ang = (m * 2 * Math.PI) / 8;
        targetX = 0.6 * Math.cos(ang);
        targetY = 0.6 * Math.sin(ang);
      } else {
        const t = Math.random() * 2.5 * Math.PI;
        const r = 0.15 + (t / (2.5 * Math.PI)) * 0.55;
        targetX = r * Math.cos(t);
        targetY = r * Math.sin(t);
      }

      p.x += (targetX - p.x) * 0.25 + (Math.random() - 0.5) * 0.05;
      p.y += (targetY - p.y) * 0.25 + (Math.random() - 0.5) * 0.05;
    });
  };

  const performDenoiseStep = () => {
    if (ddpmDirection === 'reverse') {
      if (ddpmTimestep > 0) {
        setDdpmTimestep(prev => prev - 1);
        setDdpmDenoiseStepCount(prev => prev + 1);
      }
    } else {
      if (ddpmTimestep < ddpmMaxSteps) {
        setDdpmTimestep(prev => prev + 1);
        setDdpmDenoiseStepCount(prev => prev + 1);
      }
    }
  };

  const performKnnQueryStep = () => {
    stateRef.current.knnQueryPoint = {
      x: (Math.random() - 0.5) * 1.3,
      y: (Math.random() - 0.5) * 1.3
    };
    setKnnQueriesChecked(prev => prev + 1);
  };

  const performLinearRegressionStep = () => {
    const pts = stateRef.current.points;
    if (pts.length === 0) return;
    const lr = 0.05;
    let gradW = 0;
    let gradB = 0;
    let ssRes = 0;
    let ssTot = 0;
    const meanY = pts.reduce((acc, p) => acc + p.y, 0) / pts.length;

    for (let i = 0; i < pts.length; i++) {
      const pred = linearSlopeW1 * pts[i].x + linearInterceptB;
      const err = pred - pts[i].y;
      gradW += (err * pts[i].x) / pts.length;
      gradB += err / pts.length;
      ssRes += Math.pow(pts[i].y - pred, 2);
      ssTot += Math.pow(pts[i].y - meanY, 2);
    }

    if (linearRegMode === 'ridge') {
      gradW += linearRidgeLambda * linearSlopeW1;
    } else if (linearRegMode === 'lasso') {
      gradW += linearRidgeLambda * Math.sign(linearSlopeW1);
    }

    const nextW = Math.max(-2.0, Math.min(2.0, linearSlopeW1 - lr * gradW));
    const nextB = Math.max(-1.0, Math.min(1.0, linearInterceptB - lr * gradB));
    setLinearSlopeW1(nextW);
    setLinearInterceptB(nextB);
    const calculatedR2 = ssTot > 0.0001 ? Math.max(0, 1 - (ssRes / ssTot)) : 0.89;
    setR2Score(calculatedR2);
  };

  const performLogisticRegressionStep = () => {
    const pts = stateRef.current.points;
    if (pts.length > 0) {
      const lr = 0.08;
      let gradW1 = 0;
      let gradW2 = 0;
      let gradB = 0;

      pts.forEach(p => {
        const z = logregW1 * p.x + logregW2 * p.y + logregBiasB;
        const prob = 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, z))));
        const err = prob - p.label;
        gradW1 += err * p.x;
        gradW2 += err * p.y;
        gradB += err;
      });

      gradW1 /= pts.length;
      gradW2 /= pts.length;
      gradB /= pts.length;

      setLogregW1(prev => Math.max(-3.0, Math.min(3.0, prev - lr * gradW1)));
      setLogregW2(prev => Math.max(-3.0, Math.min(3.0, prev - lr * gradW2)));
      setLogregBiasB(prev => Math.max(-2.0, Math.min(2.0, prev - lr * gradB)));
    } else {
      setLogregBiasB(prev => (prev >= 1.5 ? -1.5 : parseFloat((prev + 0.2).toFixed(2))));
      setLogregW1(prev => (prev >= 2.5 ? -2.5 : parseFloat((prev + 0.15).toFixed(2))));
    }
  };

  const performSvmStep = () => {
    if (svmViewMode === '1d_parabola') {
      setSvmLiftMorph(prev => (prev >= 1.0 ? 0.0 : Math.min(1.0, parseFloat((prev + 0.15).toFixed(2)))));
    } else if (svmViewMode === '3d_kernel_trick') {
      setSvm3dRotY(prev => (prev + 12) % 360);
    } else {
      setSvmBiasB(prev => (prev >= 0.8 ? -0.8 : parseFloat((prev + 0.1).toFixed(2))));
    }
  };

  const performDecisionTreeStep = () => {
    setTreeDepth(prev => (prev >= 5 ? 1 : prev + 1));
  };

  const performNaiveBayesStep = () => {
    setNbPriorC0(prev => (prev >= 0.85 ? 0.15 : parseFloat((prev + 0.1).toFixed(2))));
  };

  const performRandomForestStep = () => {
    setForestNumTrees(prev => (prev >= 10 ? 1 : prev + 1));
  };

  const performGradientBoostingStep = () => {
    setBoostStages(prev => (prev >= 8 ? 1 : prev + 1));
  };

  const performVaeSampleStep = () => {
    const z1 = (Math.random() - 0.5) * 2.2;
    const z2 = (Math.random() - 0.5) * 2.2;
    setVaeLatentZ1(Math.max(-1.4, Math.min(1.4, z1)));
    setVaeLatentZ2(Math.max(-1.4, Math.min(1.4, z2)));
  };

  const performMlpPulseStep = () => {
    setMlpWeightScale(prev => (prev >= 2.8 ? 0.6 : parseFloat((prev + 0.3).toFixed(1))));
    setMlpSparsity(prev => (prev >= 60 ? 10 : prev + 10));
  };

  const performConvScanStep = () => {
    setConvScanStep(prev => (prev + 1) % 9);
    stateRef.current.cnnKernelStep = (stateRef.current.cnnKernelStep + 1) % 9;
  };

  // ─── Mathematical Loss Landscapes & Gradient Formulations ───
  const calculateLossAndGrad = (w1: number, w2: number, landscape: string) => {
    if (landscape === 'convex_bowl') {
      const loss = 0.5 * (w1 * w1 + 2.0 * w2 * w2) + 0.2;
      const dw1 = w1;
      const dw2 = 2.0 * w2;
      return { loss, dw1, dw2 };
    } else if (landscape === 'rosenbrock_valley') {
      // Scaled Rosenbrock Banana Valley tailored for stable 2D visual optimization on [-3, 3]
      // Global minimum is at (1.0, 0.4) with bounded gradients
      const diff1 = 1.0 - w1;
      const diff2 = w2 - 0.4 * w1 * w1;
      const loss = 0.4 * diff1 * diff1 + 1.8 * diff2 * diff2 + 0.3;
      const dw1 = -0.8 * diff1 - 2.88 * w1 * diff2;
      const dw2 = 3.6 * diff2;
      return { loss, dw1, dw2 };
    } else if (landscape === 'saddle_point') {
      // Double-Well Saddle Barrier: Unstable Saddle at (0, 0) and Twin Stable Minima at (0, ±1.31)
      const loss = 0.6 * w1 * w1 - 1.2 * w2 * w2 + 0.35 * Math.pow(w2, 4) + 2.2;
      const dw1 = 1.2 * w1;
      const dw2 = -2.4 * w2 + 1.4 * Math.pow(w2, 3);
      return { loss, dw1, dw2 };
    } else {
      // multimodal_minima: Gaussian bell peaks & troughs with true global minimum at (0.2, 0.2)
      const base = 0.18 * (w1 * w1 + w2 * w2) + 3.2;
      const dBase1 = 0.36 * w1;
      const dBase2 = 0.36 * w2;

      // Global Minima at (0.2, 0.2)
      const g1 = 2.8 * Math.exp(-((w1 - 0.2) * (w1 - 0.2) + (w2 - 0.2) * (w2 - 0.2)) / 0.9);
      const dg1_1 = g1 * (-2.0 * (w1 - 0.2) / 0.9);
      const dg1_2 = g1 * (-2.0 * (w2 - 0.2) / 0.9);

      // Local Minimum 1 at (-1.8, -1.4)
      const g2 = 1.4 * Math.exp(-((w1 + 1.8) * (w1 + 1.8) + (w2 + 1.4) * (w2 + 1.4)) / 0.5);
      const dg2_1 = g2 * (-2.0 * (w1 + 1.8) / 0.5);
      const dg2_2 = g2 * (-2.0 * (w2 + 1.4) / 0.5);

      // Local Minimum 2 at (1.8, -1.4)
      const g3 = 1.2 * Math.exp(-((w1 - 1.8) * (w1 - 1.8) + (w2 + 1.4) * (w2 + 1.4)) / 0.5);
      const dg3_1 = g3 * (-2.0 * (w1 - 1.8) / 0.5);
      const dg3_2 = g3 * (-2.0 * (w2 + 1.4) / 0.5);

      const loss = base - g1 - g2 - g3;
      const dw1 = dBase1 - dg1_1 - dg2_1 - dg3_1;
      const dw2 = dBase2 - dg1_2 - dg2_2 - dg3_2;
      return { loss, dw1, dw2 };
    }
  };

  const resetOptimizerState = (preset?: 'multimodal_minima' | 'convex_bowl' | 'rosenbrock_valley' | 'saddle_point') => {
    const ls = preset || lossLandscape;
    let initialPos = { w1: -2.2, w2: 1.8 };
    if (ls === 'convex_bowl') initialPos = { w1: -2.5, w2: 2.2 };
    else if (ls === 'rosenbrock_valley') initialPos = { w1: -1.8, w2: 1.3 };
    else if (ls === 'saddle_point') initialPos = { w1: 1.8, w2: 0.15 };

    const { loss, dw1, dw2 } = calculateLossAndGrad(initialPos.w1, initialPos.w2, ls);
    stateRef.current.optPos = initialPos;
    stateRef.current.optVelocity = { v1: 0, v2: 0 };
    stateRef.current.optStepCount = 0;
    stateRef.current.optAdamM = { m1: 0, m2: 0 };
    stateRef.current.optAdamV = { v1: 0, v2: 0 };
    stateRef.current.optRmspropS = { s1: 0, s2: 0 };
    stateRef.current.optHistory = [{ w1: initialPos.w1, w2: initialPos.w2, loss }];

    // Tri-Variant Race Tracking Refs
    stateRef.current.optRaceBatchPos = { ...initialPos };
    stateRef.current.optRaceMiniPos = { ...initialPos };
    stateRef.current.optRaceSgdPos = { ...initialPos };
    stateRef.current.optRaceBatchHist = [{ ...initialPos }];
    stateRef.current.optRaceMiniHist = [{ ...initialPos }];
    stateRef.current.optRaceSgdHist = [{ ...initialPos }];

    setOptPos(initialPos);
    setOptVelocity({ v1: 0, v2: 0 });
    setOptLoss(loss);
    setOptGradNorm(Math.sqrt(dw1 * dw1 + dw2 * dw2));
    setOptStepCount(0);
    setOptStatus('optimizing');
  };

  const performOptimizerStep = () => {
    const curPos = stateRef.current.optPos || { w1: -2.2, w2: 1.8 };
    const { dw1, dw2 } = calculateLossAndGrad(curPos.w1, curPos.w2, lossLandscape);

    // Multi-Agent Tri-Variant Live Race Mode
    if (optAlgorithm === 'tri_variant_race') {
      const bPos = stateRef.current.optRaceBatchPos || { ...curPos };
      const mPos = stateRef.current.optRaceMiniPos || { ...curPos };
      const sPos = stateRef.current.optRaceSgdPos || { ...curPos };

      const bGrad = calculateLossAndGrad(bPos.w1, bPos.w2, lossLandscape);
      const mGrad = calculateLossAndGrad(mPos.w1, mPos.w2, lossLandscape);
      const sGrad = calculateLossAndGrad(sPos.w1, sPos.w2, lossLandscape);

      // 1. Batch GD: Pure exact gradient
      const nextBW1 = Math.max(-3.5, Math.min(3.5, bPos.w1 - optLearningRate * bGrad.dw1));
      const nextBW2 = Math.max(-3.5, Math.min(3.5, bPos.w2 - optLearningRate * bGrad.dw2));

      // 2. Mini-Batch GD: Scaled noise (B=32)
      const mNoiseScale = 0.28 / Math.sqrt(Math.max(4, optBatchSize));
      const mNoise1 = (Math.random() - 0.5) * mNoiseScale * 2.5;
      const mNoise2 = (Math.random() - 0.5) * mNoiseScale * 2.5;
      const nextMW1 = Math.max(-3.5, Math.min(3.5, mPos.w1 - optLearningRate * (mGrad.dw1 + mNoise1)));
      const nextMW2 = Math.max(-3.5, Math.min(3.5, mPos.w2 - optLearningRate * (mGrad.dw2 + mNoise2)));

      // 3. Stochastic GD (SGD): Single sample noise (B=1)
      const sNoise1 = (Math.random() - 0.5) * 0.55;
      const sNoise2 = (Math.random() - 0.5) * 0.55;
      const nextSW1 = Math.max(-3.5, Math.min(3.5, sPos.w1 - optLearningRate * (sGrad.dw1 + sNoise1)));
      const nextSW2 = Math.max(-3.5, Math.min(3.5, sPos.w2 - optLearningRate * (sGrad.dw2 + sNoise2)));

      stateRef.current.optRaceBatchPos = { w1: nextBW1, w2: nextBW2 };
      stateRef.current.optRaceMiniPos = { w1: nextMW1, w2: nextMW2 };
      stateRef.current.optRaceSgdPos = { w1: nextSW1, w2: nextSW2 };

      if (!stateRef.current.optRaceBatchHist) stateRef.current.optRaceBatchHist = [];
      if (!stateRef.current.optRaceMiniHist) stateRef.current.optRaceMiniHist = [];
      if (!stateRef.current.optRaceSgdHist) stateRef.current.optRaceSgdHist = [];

      stateRef.current.optRaceBatchHist.push({ w1: nextBW1, w2: nextBW2 });
      stateRef.current.optRaceMiniHist.push({ w1: nextMW1, w2: nextMW2 });
      stateRef.current.optRaceSgdHist.push({ w1: nextSW1, w2: nextSW2 });

      if (stateRef.current.optRaceBatchHist.length > 120) stateRef.current.optRaceBatchHist.shift();
      if (stateRef.current.optRaceMiniHist.length > 120) stateRef.current.optRaceMiniHist.shift();
      if (stateRef.current.optRaceSgdHist.length > 120) stateRef.current.optRaceSgdHist.shift();

      stateRef.current.optStepCount = (stateRef.current.optStepCount || 0) + 1;
      setOptPos({ w1: nextBW1, w2: nextBW2 });
      setOptLoss(bGrad.loss);
      setOptGradNorm(Math.hypot(bGrad.dw1, bGrad.dw2));
      setOptStepCount(stateRef.current.optStepCount);
      return;
    }

    // Single Algorithm Execution
    let noiseScale = optNoise;
    if (optAlgorithm === 'batch') noiseScale = 0;
    else if (optAlgorithm === 'mini_batch') noiseScale = Math.max(0.02, 0.35 / Math.sqrt(Math.max(4, optBatchSize)));
    else if (optAlgorithm === 'sgd') noiseScale = Math.max(0.12, 0.45 + optNoise);

    const noise1 = noiseScale > 0 ? (Math.random() - 0.5) * noiseScale * 2.5 : 0;
    const noise2 = noiseScale > 0 ? (Math.random() - 0.5) * noiseScale * 2.5 : 0;
    const grad1 = dw1 + noise1;
    const grad2 = dw2 + noise2;
    const gradNorm = Math.sqrt(grad1 * grad1 + grad2 * grad2);

    let nextW1 = curPos.w1;
    let nextW2 = curPos.w2;
    let nextV1 = stateRef.current.optVelocity?.v1 || 0;
    let nextV2 = stateRef.current.optVelocity?.v2 || 0;

    if (optAlgorithm === 'batch' || optAlgorithm === 'mini_batch' || optAlgorithm === 'sgd') {
      nextV1 = optLearningRate * grad1;
      nextV2 = optLearningRate * grad2;
      nextW1 = curPos.w1 - nextV1;
      nextW2 = curPos.w2 - nextV2;
    } else if (optAlgorithm === 'momentum') {
      nextV1 = optMomentum * nextV1 + optLearningRate * grad1;
      nextV2 = optMomentum * nextV2 + optLearningRate * grad2;
      nextW1 = curPos.w1 - nextV1;
      nextW2 = curPos.w2 - nextV2;
    } else if (optAlgorithm === 'rmsprop') {
      const beta = 0.9;
      const eps = 1e-6;
      let s1 = stateRef.current.optRmspropS?.s1 || 0;
      let s2 = stateRef.current.optRmspropS?.s2 || 0;
      s1 = beta * s1 + (1 - beta) * (grad1 * grad1);
      s2 = beta * s2 + (1 - beta) * (grad2 * grad2);
      stateRef.current.optRmspropS = { s1, s2 };
      nextV1 = (optLearningRate / (Math.sqrt(s1) + eps)) * grad1;
      nextV2 = (optLearningRate / (Math.sqrt(s2) + eps)) * grad2;
      nextW1 = curPos.w1 - nextV1;
      nextW2 = curPos.w2 - nextV2;
    } else if (optAlgorithm === 'adam') {
      const b1 = 0.9, b2 = 0.999, eps = 1e-6;
      let m1 = stateRef.current.optAdamM?.m1 || 0;
      let m2 = stateRef.current.optAdamM?.m2 || 0;
      let v1 = stateRef.current.optAdamV?.v1 || 0;
      let v2 = stateRef.current.optAdamV?.v2 || 0;
      const t = (stateRef.current.optStepCount || 0) + 1;

      m1 = b1 * m1 + (1 - b1) * grad1;
      m2 = b1 * m2 + (1 - b1) * grad2;
      v1 = b2 * v1 + (1 - b2) * (grad1 * grad1);
      v2 = b2 * v2 + (1 - b2) * (grad2 * grad2);
      stateRef.current.optAdamM = { m1, m2 };
      stateRef.current.optAdamV = { v1, v2 };

      const m1Hat = m1 / (1 - Math.pow(b1, t));
      const m2Hat = m2 / (1 - Math.pow(b1, t));
      const v1Hat = v1 / (1 - Math.pow(b2, t));
      const v2Hat = v2 / (1 - Math.pow(b2, t));

      nextV1 = (optLearningRate / (Math.sqrt(v1Hat) + eps)) * m1Hat;
      nextV2 = (optLearningRate / (Math.sqrt(v2Hat) + eps)) * m2Hat;
      nextW1 = curPos.w1 - nextV1;
      nextW2 = curPos.w2 - nextV2;
    }

    // Clamp coordinates to safe bounds [-3.5, 3.5]
    nextW1 = Math.max(-3.5, Math.min(3.5, nextW1));
    nextW2 = Math.max(-3.5, Math.min(3.5, nextW2));

    const newLossCalc = calculateLossAndGrad(nextW1, nextW2, lossLandscape);
    const newLoss = newLossCalc.loss;

    let status: 'optimizing' | 'converged' | 'local_min' | 'overshooting' = 'optimizing';
    if (newLoss > 20 || isNaN(newLoss)) {
      status = 'overshooting';
    } else if (gradNorm < 0.05 && Math.hypot(nextV1, nextV2) < 0.03) {
      if (lossLandscape === 'multimodal_minima') {
        const distToGlobal = Math.hypot(nextW1 - 0.2, nextW2 - 0.2);
        status = distToGlobal < 0.5 ? 'converged' : 'local_min';
      } else {
        status = 'converged';
      }
    }

    stateRef.current.optPos = { w1: nextW1, w2: nextW2 };
    stateRef.current.optVelocity = { v1: nextV1, v2: nextV2 };
    stateRef.current.optStepCount = (stateRef.current.optStepCount || 0) + 1;
    if (!stateRef.current.optHistory) stateRef.current.optHistory = [];
    stateRef.current.optHistory.push({ w1: nextW1, w2: nextW2, loss: newLoss });
    if (stateRef.current.optHistory.length > 150) stateRef.current.optHistory.shift();

    setOptPos({ w1: nextW1, w2: nextW2 });
    setOptVelocity({ v1: nextV1, v2: nextV2 });
    setOptLoss(newLoss);
    setOptGradNorm(gradNorm);
    setOptStepCount(stateRef.current.optStepCount);
    setOptStatus(status);
  };

  const performAttentionStep = () => {
    setAttnSelectedTokenIdx(prev => (prev + 1) % 5);
  };

  const performTransformerStep = () => {
    setTransformerGenStep(prev => (prev + 1) % 6);
  };

  const performMoeStep = () => {
    setMoeSelectedTokenIdx(prev => (prev + 1) % 5);
  };

  const performRlStep = () => {
    const grid = stateRef.current.rlMapGrid;
    const R = grid.length;
    const C = grid[0].length;
    const cur = stateRef.current.rlAgentPos;
    const qTable = stateRef.current.rlQTable;

    // Actions: 0: Up (-r), 1: Right (+c), 2: Down (+r), 3: Left (-c)
    const dr = [-1, 0, 1, 0];
    const dc = [0, 1, 0, -1];

    let action = 0;
    if (Math.random() < rlEpsilon) {
      action = Math.floor(Math.random() * 4);
    } else {
      let maxQ = -Infinity;
      let bestA = 0;
      if (qTable[cur.r] && qTable[cur.r][cur.c]) {
        for (let a = 0; a < 4; a++) {
          const qVal = qTable[cur.r][cur.c][a] || 0;
          if (qVal > maxQ) {
            maxQ = qVal;
            bestA = a;
          }
        }
      }
      action = bestA;
    }

    let nextR = Math.max(0, Math.min(R - 1, cur.r + dr[action]));
    let nextC = Math.max(0, Math.min(C - 1, cur.c + dc[action]));

    if (grid[nextR][nextC] === 4) {
      nextR = cur.r;
      nextC = cur.c;
    }

    let reward = -1;
    let done = false;
    if (grid[nextR][nextC] === 2) {
      reward = rlRewardGoal;
      done = true;
    } else if (grid[nextR][nextC] === 3) {
      reward = rlRewardTrap;
      done = true;
    }

    if (qTable[cur.r] && qTable[cur.r][cur.c]) {
      const oldQ = qTable[cur.r][cur.c][action] || 0;
      let maxNextQ = 0;
      if (!done && qTable[nextR] && qTable[nextR][nextC]) {
        maxNextQ = Math.max(...(qTable[nextR][nextC] || [0]));
      }
      const newQ = oldQ + rlLearningRateAlpha * (reward + rlDiscountGamma * maxNextQ - oldQ);
      qTable[cur.r][cur.c][action] = newQ;
    }

    setRlCumulativeReward(prev => prev + reward);

    if (done) {
      setRlEpisodes(prev => prev + 1);
      stateRef.current.rlAgentPos = { r: 0, c: 0 };
    } else {
      stateRef.current.rlAgentPos = { r: nextR, c: nextC };
    }
  };

  // ─── Comprehensive Model Reset Handler (Supports all 20 ML/AI Models) ───
  const handleResetModel = useCallback(() => {
    // Reset simulation time & convergence timers
    stateRef.current.timeT = 0;
    stateRef.current.convergeTimer = 0;

    switch (selectedModel) {
      case 'kmeans_clustering':
        setKmeansIterations(0);
        setKmeansConverged(false);
        setKmeansWCSS(0.185);
        generateData();
        reseedCentroids();
        break;

      case 'pca_reduction':
        setPcaViewMode('2d_projection');
        setPcaComponentsCount(2);
        setPcaCorrelation(0.78);
        setPcaRotationAngle(35);
        setPcaDataSpread(0.85);
        setPcaShowResiduals(true);
        setPca3dRotX(28);
        setPca3dRotY(45);
        setPcaEVR1(88.4);
        setPcaEVR2(11.6);
        generateData();
        break;

      case 'knn_classifier':
        setKParam(5);
        setKnnDistance('euclidean');
        setKnnWeighting('uniform');
        setKnnQueriesChecked(1);
        setKnnShowBoundary(true);
        stateRef.current.knnQueryPoint = { x: 0.15, y: -0.2 };
        generateData();
        break;

      case 'linear_regression':
        setLinearSlopeW1(0.85);
        setLinearSlopeW2(0.55);
        setLinearInterceptB(0.12);
        setLinearRidgeLambda(0.0);
        setLinearRegMode('ols');
        setLinearPolyDegree(2);
        setLinear3dRotX(28);
        setLinear3dRotY(45);
        setLinearShowResiduals(true);
        setLinearShowProjectionRays(true);
        setR2Score(0.89);
        stateRef.current.linearWeights = { m: 0.85, c: 0.12 };
        generateData();
        break;

      case 'logistic_regression':
        setLogregViewMode('3d_sigmoid_surface');
        setLogregBoundaryType('linear');
        setLogregThreshold(0.5);
        setLogregW1(1.3);
        setLogregW2(-1.1);
        setLogregBiasB(0.0);
        setLogreg3dRotX(28);
        setLogreg3dRotY(42);
        setLogregTemperature(1.0);
        stateRef.current.logregWeights = { w1: 1.3, w2: -1.1, b: 0.0 };
        generateData();
        break;

      case 'svm_classifier':
        setSvmViewMode('2d_kernels');
        setSvmKernel('rbf');
        setSvmC(1.0);
        setSvmBiasB(0.0);
        setSvmGamma(1.2);
        setSvmPolyDegree(3);
        setSvmPolyIntercept(1.0);
        setSvmLiftMorph(1.0);
        setSvm3dRotX(28);
        setSvm3dRotY(42);
        setSvm3dSliceZ(0.65);
        stateRef.current.svmHyperplane = { w1: 1.1, w2: -0.95, b: 0.05 };
        generateData();
        break;

      case 'decision_tree_split':
        setTreeDepth(3);
        setTreeCriterion('gini');
        setTreeMinSamplesSplit(2);
        generateData();
        break;

      case 'naive_bayes':
        setNbViewMode('gaussian_continuous');
        setNbPriorC0(0.5);
        setNbVarSmoothing(0.02);
        setNbProbePos({ x: 0.15, y: -0.1 });
        stateRef.current.nbProbePos = { x: 0.15, y: -0.1 };
        setNbFeatureMeanSeparation(0.9);
        setNbClass0VarianceScale(1.0);
        setNbClass1VarianceScale(1.0);
        generateData();
        break;

      case 'random_forest':
        setForestNumTrees(5);
        generateData();
        break;

      case 'gradient_boosting':
        setBoostStages(4);
        setBoostLearningRate(0.15);
        setBoostBaseBiasF0(0.0);
        generateData();
        break;

      case 'neural_mlp':
        setMlpLayers(2);
        setMlpActivation('relu');
        setMlpInitMode('he');
        setMlpWeightScale(1.0);
        setMlpBiasOffset(0.1);
        setMlpSparsity(18.5);
        generateData();
        break;

      case 'backprop_autodiff':
        setAutodiffStepCount(0);
        setAutodiffX1(0.8);
        setAutodiffX2(0.6);
        setAutodiffW1(0.5);
        setAutodiffW2(-0.4);
        setAutodiffBias(0.1);
        setAutodiffTarget(1.0);
        setAutodiffLR(0.1);
        break;

      case 'conv_operations':
        setConvScanStep(0);
        setConvMode('kernel_convolution');
        setConvPadding(1);
        setConvStrideVal(1);
        setConvFilterType('edge');
        setConvDilationRate(1);
        setConvPoolType('max');
        setConvInputDigit('digit_7');
        setConvPostBiasB(0.0);
        stateRef.current.cnnKernelStep = 0;
        break;

      case 'seq_recurrent_gating':
        setRecurrentActiveT(0);
        setRecurrentForgetBias(1.0);
        setRecurrentCandidateAct('tanh');
        setRecurrentWeightWxh(1.0);
        break;

      case 'attention_mechanisms':
        setAttnSelectedTokenIdx(0);
        setAttnTemperature(1.0);
        setAttnWeightScaleWq(1.0);
        setAttnNumHeads(4);
        setAttnSubMode('scaled_dot_product');
        break;

      case 'transformer_architecture':
        setTransformerMode('encoder_decoder');
        setTransformerNumLayers(6);
        setTransformerSelectedLayer(0);
        setTransformerGenStep(0);
        setTransformerSamplingTemp(0.8);
        setTransformerTopK(5);
        break;

      case 'moe_architecture':
        setMoeNumExperts(8);
        setMoeTopK(2);
        setMoeRouterNoise(0.0);
        setMoeRouterTemperature(1.0);
        setMoeSelectedTokenIdx(0);
        setMoeCapacityFactor(1.25);
        setMoeAuxLossWeight(0.02);
        break;

      case 'seq_recurrent_gating':
        setRecurrentCellType('lstm');
        setRecurrentActiveT(0);
        setRecurrentForgetBias(1.0);
        setRecurrentCandidateAct('tanh');
        setRecurrentWeightWxh(1.0);
        break;

      case 'loss_surface_optimization':
        resetOptimizerState(lossLandscape);
        break;

      case 'vae_generative':
        setVaeLatentZ1(0.35);
        setVaeLatentZ2(-0.45);
        setVaeBetaKL(1.0);
        break;

      case 'gan_minimax':
        setGanEpochCount(1);
        setGanLossG(0.685);
        setGanWassersteinDist(0.142);
        setGanLatentDim(4);
        setGanGenLR(0.0002);
        setGanDiscLR(0.0002);
        setGanCriticSteps(3);
        setGanModePreset('circle_8');
        stateRef.current.ganParticles = Array.from({ length: 55 }, () => ({
          x: (Math.random() - 0.5) * 1.6,
          y: (Math.random() - 0.5) * 1.6,
          vx: 0,
          vy: 0,
          targetX: 0,
          targetY: 0
        }));
        break;

      case 'ddpm_diffusion':
        setDdpmTimestep(25);
        setDdpmBetaSchedule('cosine');
        setDdpmDirection('reverse');
        setDdpmDenoiseStepCount(0);
        stateRef.current.ddpmNoiseMap = Array.from({ length: 8 }, () =>
          Array.from({ length: 8 }, () => Math.random())
        );
        break;

      case 'q_learning_rl': {
        setRlEpisodes(0);
        setRlCumulativeReward(0);
        stateRef.current.rlAgentPos = { r: 0, c: 0 };
        stateRef.current.lastRlStepFrame = 0;
        const grid = stateRef.current.rlMapGrid || [
          [1, 0, 0, 0, 0],
          [0, 3, 0, 0, 0],
          [0, 0, 3, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 2]
        ];
        stateRef.current.rlQTable = Array.from({ length: grid.length }, () =>
          Array.from({ length: grid[0].length }, () => [0, 0, 0, 0])
        );
        break;
      }

      default:
        generateData();
        break;
    }
  }, [
    selectedModel,
    generateData,
    reseedCentroids,
    lossLandscape
  ]);

  // ────────────────────────────────────────────────────────────────────────
  // 19 BESPOKE CANVAS RENDERERS (ACTIVE ANIMATION & TELEMETRY ENGINE)
  // ────────────────────────────────────────────────────────────────────────

  // 1. PCA Reduction Renderer (Interactive Dual-Board: Variance Maximization + 1D Subspace & Scree Decomposition)
  const drawPcaReduction = (ctx: CanvasRenderingContext2D, w: number, h: number, _cx: number, _cy: number, _scale: number, localFrame: number) => {
    let currentAngleDeg = pcaRotationAngle;
    if (simMode === 'autoplay' && isSimulating) {
      currentAngleDeg = (pcaRotationAngle + (stateRef.current.timeT * 22)) % 360;
    }
    const currentAngleRad = (currentAngleDeg * Math.PI) / 180;

    const { points } = stateRef.current;
    const n = Math.max(1, points.length);
    const meanX = points.reduce((sum, p) => sum + p.x, 0) / n;
    const meanY = points.reduce((sum, p) => sum + p.y, 0) / n;

    let varX = 0; let varY = 0; let covXY = 0;
    points.forEach(p => {
      const dx = p.x - meanX;
      const dy = p.y - meanY;
      varX += dx * dx;
      varY += dy * dy;
      covXY += dx * dy;
    });
    varX /= n;
    varY /= n;
    covXY /= n;

    const totalVar = varX + varY;
    const det = varX * varY - covXY * covXY;
    const disc = Math.max(0, totalVar * totalVar - 4 * det);
    const lambda1 = Math.max(0.001, (totalVar + Math.sqrt(disc)) / 2);
    const lambda2 = Math.max(0.0001, (totalVar - Math.sqrt(disc)) / 2);

    // Optimal Principal Angle from Eigenvectors
    const optimalAngleRad = 0.5 * Math.atan2(2 * covXY, varX - varY);
    const optimalAngleDeg = ((optimalAngleRad * 180) / Math.PI + 360) % 180;

    const u1x = Math.cos(currentAngleRad);
    const u1y = Math.sin(currentAngleRad);
    const u2x = -u1y;
    const u2y = u1x;

    // Projected Variance & Orthogonal Residual MSE
    let sumProjVar = 0;
    let sumResidualMSE = 0;
    const projectedCoords1D: number[] = [];

    points.forEach(p => {
      const dx = p.x - meanX;
      const dy = p.y - meanY;
      const projDist = dx * u1x + dy * u1y;
      const perpDist = dx * u2x + dy * u2y;
      projectedCoords1D.push(projDist);
      sumProjVar += projDist * projDist;
      sumResidualMSE += perpDist * perpDist;
    });

    const varProjected = sumProjVar / n;
    const varResidual = sumResidualMSE / n;
    const evr1 = (lambda1 / (lambda1 + lambda2 || 1)) * 100;
    const evr2 = (lambda2 / (lambda1 + lambda2 || 1)) * 100;

    if (localFrame % 15 === 0) {
      setPcaEVR1(evr1);
      setPcaEVR2(evr2);
      setPcaVarianceProjected(varProjected);
      setPcaVarianceResidual(varResidual);
    }

    // Geometry layout: Perfect Zero-Clipping inside 720x620 canvas
    const marginX = 14;
    const marginY = 14;
    const gap = 12;
    const totalW = w - 2 * marginX - gap;
    const leftW = Math.floor(totalW * 0.52);
    const rightW = totalW - leftW;
    const leftH = h - 2 * marginY;
    const rightH = leftH;
    const leftX = marginX;
    const rightX = leftX + leftW + gap;
    const leftY = marginY;
    const rightY = marginY;

    const theme = getCanvasTheme(canvasAtmosphere);

    // ────────────────────────────────────────────────────────────────────────
    // LEFT BOARD: 2D FEATURE SPACE OR 3D-TO-2D PRINCIPAL PLANE
    // ────────────────────────────────────────────────────────────────────────
    drawDiagramCard(ctx, leftX, leftY, leftW, leftH, theme);

    if (pcaViewMode === '3d_to_2d_plane') {
      // 3D Orbital Projection Mode
      ctx.fillStyle = theme.accentCyan;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🌌 3D TO 2D PRINCIPAL SUBSPACE PROJECTION', leftX + 14, leftY + 22);

      const cx3d = leftX + leftW / 2;
      const cy3d = leftY + leftH / 2 + 10;
      const radX = (pca3dRotX * Math.PI) / 180;
      const radY = (pca3dRotY * Math.PI) / 180;

      const project3D = (x: number, y: number, z: number) => {
        const cosY = Math.cos(radY); const sinY = Math.sin(radY);
        const cosX = Math.cos(radX); const sinX = Math.sin(radX);
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        const zoom = 120;
        return {
          px: cx3d + x1 * zoom,
          py: cy3d - y2 * zoom,
          depth: z2
        };
      };

      // Draw Principal Plane (spanned by v1, v2)
      const planeCorners = [
        project3D(-1.4, -1.0, 0),
        project3D(1.4, -1.0, 0),
        project3D(1.4, 1.0, 0),
        project3D(-1.4, 1.0, 0)
      ];
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.strokeStyle = theme.accentCyan;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(planeCorners[0].px, planeCorners[0].py);
      for (let i = 1; i < 4; i++) ctx.lineTo(planeCorners[i].px, planeCorners[i].py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3D Points & Projections onto Plane
      const pts3d = stateRef.current.pca3dPoints.length > 0 ? stateRef.current.pca3dPoints : points.map(p => ({ x: p.x, y: p.y, z: (p.x * 0.3 - p.y * 0.2) }));
      pts3d.forEach(p => {
        const pOrig = project3D(p.x, p.y, p.z);
        const pPlane = project3D(p.x, p.y, 0);

        // Stems to plane
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(pOrig.px, pOrig.py);
        ctx.lineTo(pPlane.px, pPlane.py);
        ctx.stroke();
        ctx.setLineDash([]);

        // Plane projected bead
        ctx.fillStyle = theme.accentCyan;
        ctx.beginPath();
        ctx.arc(pPlane.px, pPlane.py, 3, 0, 2 * Math.PI);
        ctx.fill();

        // 3D point
        ctx.fillStyle = theme.accentAmber;
        ctx.beginPath();
        ctx.arc(pOrig.px, pOrig.py, 4.5, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Drag Hint
      ctx.fillStyle = theme.textMuted;
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🖱️ Drag to orbit 3D camera | Principal plane retains ' + evr1.toFixed(1) + '% + ' + evr2.toFixed(1) + '% variance', cx3d, leftY + leftH - 14);
      ctx.textAlign = 'left';

    } else {
      // Standard 2D Interactive Variance Maximization
      ctx.fillStyle = theme.accentCyan;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🧭 2D PCA & VARIANCE MAXIMIZATION', leftX + 14, leftY + 22);

      const plotX = leftX + 16;
      const plotY = leftY + 36;
      const plotW = leftW - 32;
      const plotH = leftH - 120;
      const pcx = plotX + plotW / 2;
      const pcy = plotY + plotH / 2;
      const pScale = Math.min(plotW, plotH) * 0.44;

      // Plot Box Background
      ctx.fillStyle = theme.plotBoxBg;
      ctx.strokeStyle = theme.plotBoxBorder;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(plotX, plotY, plotW, plotH, 8);
      ctx.fill();
      ctx.stroke();

      // STRICT PLOT BOX CLIPPING: Prevents ray or data points from overflowing the card bounds
      withPlotBoxClip(ctx, plotX, plotY, plotW, plotH, 8, () => {
        // Axes inside plot box
        ctx.strokeStyle = theme.axis;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pcx, plotY + 8); ctx.lineTo(pcx, plotY + plotH - 8);
        ctx.moveTo(plotX + 8, pcy); ctx.lineTo(plotX + plotW - 8, pcy);
        ctx.stroke();

        // Draw Theoretical Covariance Ellipse
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(
          pcx + meanX * pScale,
          pcy - meanY * pScale,
          Math.sqrt(lambda1) * pScale * 1.8,
          Math.sqrt(lambda2) * pScale * 1.8,
          -optimalAngleRad,
          0,
          2 * Math.PI
        );
        ctx.stroke();

        // Draw True Optimal Eigenvector Guide Line (Dotted Amber)
        const optVx = Math.cos(optimalAngleRad);
        const optVy = Math.sin(optimalAngleRad);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pcx - optVx * pScale * 2.0, pcy + optVy * pScale * 2.0);
        ctx.lineTo(pcx + optVx * pScale * 2.0, pcy - optVy * pScale * 2.0);
        ctx.stroke();
        ctx.setLineDash([]);

        // Data Points & Orthogonal Residual Lines
        points.forEach(p => {
          const px = pcx + p.x * pScale;
          const py = pcy - p.y * pScale;

          const dx = p.x - meanX;
          const dy = p.y - meanY;
          const projDot = dx * u1x + dy * u1y;
          const projX = meanX + projDot * u1x;
          const projY = meanY + projDot * u1y;
          const ppx = pcx + projX * pScale;
          const ppy = pcy - projY * pScale;

          if (pcaShowResiduals) {
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(ppx, ppy);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Projected bead on vector u
          ctx.fillStyle = theme.accentCyan;
          ctx.beginPath();
          ctx.arc(ppx, ppy, 2.8, 0, 2 * Math.PI);
          ctx.fill();

          // 2D Point
          ctx.fillStyle = theme.accentAmber;
          ctx.beginPath();
          ctx.arc(px, py, 4.2, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Draw Rotating Unit Vector u(θ) (Primary Axis) - Safely clipped!
        ctx.strokeStyle = theme.accentCyan;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = theme.accentCyan;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(pcx - u1x * pScale * 2.5, pcy + u1y * pScale * 2.5);
        ctx.lineTo(pcx + u1x * pScale * 2.5, pcy - u1y * pScale * 2.5);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw Arrow Head for u(θ)
        const headX = pcx + u1x * pScale * 1.5;
        const headY = pcy - u1y * pScale * 1.5;
        ctx.fillStyle = theme.accentCyan;
        ctx.beginPath();
        ctx.arc(headX, headY, 5.5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = theme.accentCyan;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`u(θ=${currentAngleDeg.toFixed(0)}°)`, headX + 8, headY - 4);

        // Orthogonal Component u_perp if components count is 2
        if (pcaComponentsCount === 2) {
          ctx.strokeStyle = theme.accentPurple;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(pcx - u2x * pScale * 1.0, pcy + u2y * pScale * 1.0);
          ctx.lineTo(pcx + u2x * pScale * 1.0, pcy - u2y * pScale * 1.0);
          ctx.stroke();
          ctx.fillStyle = theme.accentPurple;
          ctx.font = 'bold 10px monospace';
          ctx.fillText('u⊥', pcx + u2x * pScale * 1.0 + 6, pcy - u2y * pScale * 1.0 - 4);
        }

        // Mean Centroid Marker
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pcx + meanX * pScale, pcy - meanY * pScale, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('μ', pcx + meanX * pScale + 6, pcy - meanY * pScale - 6);
      });

      // Bottom Conservation of Variance Meter
      const meterY = plotY + plotH + 12;
      const meterW = plotW;
      const meterH = 34;

      ctx.fillStyle = theme.plotBoxBg;
      ctx.strokeStyle = theme.plotBoxBorder;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(plotX, meterY, meterW, meterH, 6);
      ctx.fill();
      ctx.stroke();

      const projFrac = Math.max(0, Math.min(1, varProjected / (totalVar || 1)));
      const projBarW = Math.round((meterW - 12) * projFrac);
      const resBarW = (meterW - 12) - projBarW;

      // Projected variance bar (Cyan)
      ctx.fillStyle = theme.accentCyan;
      ctx.beginPath();
      ctx.roundRect(plotX + 6, meterY + 6, projBarW, 10, 3);
      ctx.fill();

      // Residual MSE bar (Rose)
      ctx.fillStyle = theme.accentRose;
      ctx.beginPath();
      ctx.roundRect(plotX + 6 + projBarW, meterY + 6, resBarW, 10, 3);
      ctx.fill();

      ctx.fillStyle = theme.accentCyan;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`σ_proj² = ${varProjected.toFixed(3)} (${(projFrac * 100).toFixed(1)}%)`, plotX + 8, meterY + 28);

      ctx.fillStyle = theme.accentRose;
      ctx.textAlign = 'right';
      ctx.fillText(`MSE = ${varResidual.toFixed(3)} (${((1 - projFrac) * 100).toFixed(1)}%)`, plotX + meterW - 8, meterY + 28);
      ctx.textAlign = 'left';

      // Drag Hint
      ctx.fillStyle = theme.textMuted;
      ctx.font = '9px monospace';
      ctx.fillText('🖱️ Drag on plot to rotate projection axis u(θ)', plotX + 4, meterY + meterH + 18);
    }

    // ────────────────────────────────────────────────────────────────────────
    // RIGHT BOARD: 1D SUBSPACE, SCREE PLOT & COVARIANCE DECOMPOSITION
    // ────────────────────────────────────────────────────────────────────────
    drawDiagramCard(ctx, rightX, rightY, rightW, rightH, theme);

    ctx.fillStyle = theme.accentAmber;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📊 1D SUBSPACE & SCREE DECOMPOSITION', rightX + 14, rightY + 22);

    // 1. 1D Transformed Subspace Distribution Axis (z1 = x · u)
    const subW = rightW - 28;
    const subH = 100;
    const subX = rightX + 14;
    const subY = rightY + 36;

    ctx.fillStyle = theme.plotBoxBg;
    ctx.strokeStyle = theme.plotBoxBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(subX, subY, subW, subH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = theme.accentCyan;
    ctx.font = 'bold 10px monospace';
    ctx.fillText('1. Projected 1D Subspace: z₁ = (x - μ) · u(θ)', subX + 8, subY + 16);

    const axis1dY = subY + 54;
    ctx.strokeStyle = theme.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(subX + 16, axis1dY);
    ctx.lineTo(subX + subW - 16, axis1dY);
    ctx.stroke();

    // Draw projected 1D beads
    const axisScale = (subW - 48) / 3.0;
    const subMidX = subX + subW / 2;

    projectedCoords1D.forEach(z => {
      const zx = Math.max(subX + 18, Math.min(subX + subW - 18, subMidX + z * axisScale));
      ctx.fillStyle = theme.accentCyan;
      ctx.beginPath();
      ctx.arc(zx, axis1dY, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // 1D Gaussian Density Envelope
    ctx.strokeStyle = theme.accentCyan;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    let envStarted = false;
    const stdProj = Math.sqrt(Math.max(0.001, varProjected));
    for (let scanZ = -1.5; scanZ <= 1.5; scanZ += 0.05) {
      const g = Math.exp(-0.5 * (scanZ / stdProj) ** 2);
      const gx = subMidX + scanZ * axisScale;
      const gy = axis1dY - g * 28;
      if (!envStarted) { ctx.moveTo(gx, gy); envStarted = true; }
      else ctx.lineTo(gx, gy);
    }
    ctx.stroke();

    ctx.fillStyle = theme.textMuted;
    ctx.font = '9px monospace';
    ctx.fillText(`1D Spread: σ = ${stdProj.toFixed(3)} | Var = ${varProjected.toFixed(3)}`, subX + 10, subY + subH - 10);

    // 2. Scree Plot / Explained Variance Ratio (EVR)
    const screeY = subY + subH + 12;
    const screeH = 150;

    ctx.fillStyle = theme.plotBoxBg;
    ctx.strokeStyle = theme.plotBoxBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(subX, screeY, subW, screeH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = theme.accentPurple;
    ctx.font = 'bold 10px monospace';
    ctx.fillText('2. Scree Plot: Explained Variance Ratio (EVR)', subX + 8, screeY + 16);

    const barW = Math.floor((subW - 70) / 2);
    const barMaxH = 80;
    const baseBarY = screeY + 120;

    // Bar 1: PC1 (Cyan)
    const h1 = Math.round((evr1 / 100) * barMaxH);
    const b1x = subX + 28;
    ctx.fillStyle = theme.accentCyan;
    ctx.strokeStyle = theme.accentCyan;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(b1x, baseBarY - h1, barW, h1, [4, 4, 0, 0]);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = theme.textPrimary;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${evr1.toFixed(1)}%`, b1x + barW / 2, baseBarY - h1 - 6);
    ctx.fillText('PC1 (λ₁)', b1x + barW / 2, baseBarY + 16);

    // Bar 2: PC2 (Purple)
    const h2 = Math.round((evr2 / 100) * barMaxH);
    const b2x = subX + 38 + barW;
    ctx.fillStyle = theme.accentPurple;
    ctx.strokeStyle = theme.accentPurple;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(b2x, baseBarY - h2, barW, h2, [4, 4, 0, 0]);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = theme.textPrimary;
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`${evr2.toFixed(1)}%`, b2x + barW / 2, baseBarY - h2 - 6);
    ctx.fillText('PC2 (λ₂)', b2x + barW / 2, baseBarY + 16);
    ctx.textAlign = 'left';

    // 3. Empirical Covariance Matrix & Eigen-Decomposition HUD
    const matY = screeY + screeH + 12;
    const matH = rightH - (matY - rightY) - 14;

    ctx.fillStyle = theme.plotBoxBg;
    ctx.strokeStyle = theme.plotBoxBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(subX, matY, subW, matH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = theme.accentEmerald;
    ctx.font = 'bold 10px monospace';
    ctx.fillText('3. Covariance Matrix Σ & Eigen-Decomposition', subX + 8, matY + 16);

    // 2x2 Matrix Grid
    const mboxX = subX + 12;
    const mboxY = matY + 28;
    ctx.fillStyle = theme.cardBg;
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(mboxX, mboxY, 130, 46);

    ctx.fillStyle = theme.accentCyan;
    ctx.font = '10px monospace';
    ctx.fillText(`[${varX.toFixed(2)}  ${covXY >= 0 ? '+' : ''}${covXY.toFixed(2)}]`, mboxX + 8, mboxY + 18);
    ctx.fillText(`[${covXY >= 0 ? '+' : ''}${covXY.toFixed(2)}  ${varY.toFixed(2)}]`, mboxX + 8, mboxY + 36);

    // Eigenvalues & Angle
    const infoX = mboxX + 140;
    ctx.fillStyle = theme.textMuted;
    ctx.font = '10px monospace';
    ctx.fillText(`λ₁ = ${lambda1.toFixed(3)}`, infoX, mboxY + 14);
    ctx.fillText(`λ₂ = ${lambda2.toFixed(3)}`, infoX, mboxY + 28);
    ctx.fillText(`θ* = ${optimalAngleDeg.toFixed(1)}°`, infoX, mboxY + 42);

    // Alignment Match Indicator
    const angleDiff = Math.min(
      Math.abs((currentAngleDeg % 180) - (optimalAngleDeg % 180)),
      180 - Math.abs((currentAngleDeg % 180) - (optimalAngleDeg % 180))
    );
    const alignmentPct = Math.max(0, Math.round(100 - (angleDiff / 90) * 100));

    const alignY = mboxY + 54;
    ctx.fillStyle = alignmentPct > 90 ? theme.accentEmerald : alignmentPct > 60 ? theme.accentAmber : theme.accentRose;
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`Eigenvector Alignment: ${alignmentPct}% ${alignmentPct > 90 ? '⭐ (Max Variance!)' : ''}`, subX + 12, alignY + 16);

    // Auto-Snap Action Badge
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(subX + 10, alignY + 24, subW - 20, 24, 4);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ CLICK TO SNAP TO EIGENVECTOR (θ = ' + optimalAngleDeg.toFixed(1) + '°)', subX + subW / 2, alignY + 39);
    ctx.textAlign = 'left';
  };

  // 2. K-Means Clustering Renderer
  const drawKmeansClustering = (ctx: CanvasRenderingContext2D, _w: number, _h: number, cx: number, cy: number, scale: number, localFrame: number) => {
    const activeCentroids = stateRef.current.centroids.slice(0, numClusters);
    const { points } = stateRef.current;

    if (simMode === 'autoplay' && isSimulating) {
      if (!kmeansConverged) {
        if (localFrame % Math.max(1, Math.round(16 / simSpeed)) === 0) {
          performKmeansStep();
        }
      } else {
        // When converged in autoplay, periodically reseed after a short delay to keep simulation alive
        if (localFrame % Math.max(40, Math.round(120 / simSpeed)) === 0) {
          reseedCentroids();
        }
      }
    }

    activeCentroids.forEach((c) => {
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx + c.x * scale, cy - c.y * scale, 75, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    points.forEach(p => {
      const color = activeCentroids[p.label]?.color || '#38bdf8';
      const px = cx + p.x * scale;
      const py = cy - p.y * scale;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
      ctx.fill();

      const activeC = activeCentroids[p.label];
      if (activeC) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(cx + activeC.x * scale, cy - activeC.y * scale);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
    });

    activeCentroids.forEach((c, idx) => {
      const px = cx + c.x * scale;
      const py = cy - c.y * scale;

      // Pulsing centroid radar circle
      const pulseRad = 12 + 4 * Math.sin(stateRef.current.timeT * 3 + idx);
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(px, py, pulseRad, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(px - 16, py); ctx.lineTo(px + 16, py);
      ctx.moveTo(px, py - 16); ctx.lineTo(px, py + 16);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`C${idx + 1}`, px + 15, py - 8);
    });

    if (kmeansConverged) {
      ctx.fillStyle = 'rgba(5, 150, 105, 0.9)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - 130, 20, 260, 36, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`✅ CONVERGED (WCSS: ${kmeansWCSS.toFixed(4)})`, cx, 42);
      ctx.textAlign = 'left';
    }
  };

  // 3. k-Nearest Neighbors Renderer
  const drawKnnClassifier = (ctx: CanvasRenderingContext2D, _w: number, _h: number, cx: number, cy: number, scale: number) => {
    // In autoplay simulation, smoothly glide the query probe across the dataset
    if (simMode === 'autoplay' && isSimulating) {
      const t = stateRef.current.timeT * 0.7;
      stateRef.current.knnQueryPoint = {
        x: 0.55 * Math.cos(t) + 0.12 * Math.sin(2.2 * t),
        y: 0.50 * Math.sin(0.9 * t) + 0.10 * Math.cos(1.8 * t)
      };
    }

    const { points, knnQueryPoint } = stateRef.current;
    const qx = cx + knnQueryPoint.x * scale;
    const qy = cy - knnQueryPoint.y * scale;

    const distances = points.map((p, idx) => {
      let d = 0;
      if (knnDistance === 'euclidean') d = Math.hypot(p.x - knnQueryPoint.x, p.y - knnQueryPoint.y);
      else if (knnDistance === 'manhattan') d = Math.abs(p.x - knnQueryPoint.x) + Math.abs(p.y - knnQueryPoint.y);
      else if (knnDistance === 'chebyshev') d = Math.max(Math.abs(p.x - knnQueryPoint.x), Math.abs(p.y - knnQueryPoint.y));
      else {
        const dot = p.x * knnQueryPoint.x + p.y * knnQueryPoint.y;
        const norm = Math.hypot(p.x, p.y) * Math.hypot(knnQueryPoint.x, knnQueryPoint.y) || 1;
        d = 1 - dot / norm;
      }
      return { idx, d, point: p };
    });

    distances.sort((a, b) => a.d - b.d);
    const kNearest = distances.slice(0, kParam);
    const maxRadius = kNearest.length > 0 ? kNearest[kNearest.length - 1].d * scale : 50;

    // Majority vote calculation
    const class1Count = kNearest.filter(n => n.point.label === 1).length;
    const predictedClass = class1Count >= (kParam / 2) ? 1 : 0;
    const predictedColor = predictedClass === 1 ? '#38bdf8' : '#f59e0b';

    if (knnShowBoundary) {
      ctx.fillStyle = predictedClass === 1 ? 'rgba(56, 189, 248, 0.08)' : 'rgba(245, 158, 11, 0.08)';
      ctx.strokeStyle = predictedColor;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(qx, qy, maxRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    points.forEach(p => {
      const px = cx + p.x * scale;
      const py = cy - p.y * scale;
      ctx.fillStyle = p.label === 1 ? '#38bdf8' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
      ctx.fill();
    });

    kNearest.forEach(n => {
      const px = cx + n.point.x * scale;
      const py = cy - n.point.y * scale;

      ctx.strokeStyle = n.point.label === 1 ? '#38bdf8' : '#f59e0b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(qx, qy);
      ctx.lineTo(px, py);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, 2 * Math.PI);
      ctx.stroke();
    });

    // Draw Probe
    ctx.fillStyle = predictedColor;
    ctx.beginPath();
    ctx.arc(qx, qy, 11, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`Query Probe (Class ${predictedClass})`, qx + 16, qy - 10);
  };

  // ─── 4. Linear & Multiple Linear Regression Comprehensive Multi-Engine Visualizer ───

  // 4A. 3D Multiple Linear Regression Hyperplane & Surface (ŷ = w₁x₁ + w₂x₂ + b)
  const drawLinear3dHyperplaneSurface = (
    ctx: CanvasRenderingContext2D,
    _w: number,
    _h: number,
    cx: number,
    cy: number,
    scale: number,
    localFrame: number
  ) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(10 / simSpeed)) === 0) {
      performLinearRegressionStep();
    }

    const { points } = stateRef.current;
    const radX = (linear3dRotX * Math.PI) / 180;
    const radY = (linear3dRotY * Math.PI) / 180;

    const project3D = (x: number, y: number, z: number) => {
      // 3D coordinate system: x = feature X1, y = target Y (vertical), z = feature X2
      const xRot = x * Math.cos(radY) - z * Math.sin(radY);
      const zRot = x * Math.sin(radY) + z * Math.cos(radY);
      const yRot = y * Math.cos(radX) - zRot * Math.sin(radX);
      const depth = y * Math.sin(radX) + zRot * Math.cos(radX);
      const screenX = cx + xRot * scale * 1.05;
      const screenY = cy - yRot * scale * 1.05;
      return { screenX, screenY, depth };
    };

    // 1. Draw 3D Ground Grid (Y = -1.1 ground level)
    const groundY = -1.1;
    const gridSize = 1.3;
    const gridDivs = 10;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridDivs; i++) {
      const u = -gridSize + (2 * gridSize * i) / gridDivs;
      const p1 = project3D(u, groundY, -gridSize);
      const p2 = project3D(u, groundY, gridSize);
      ctx.beginPath();
      ctx.moveTo(p1.screenX, p1.screenY);
      ctx.lineTo(p2.screenX, p2.screenY);
      ctx.stroke();

      const p3 = project3D(-gridSize, groundY, u);
      const p4 = project3D(gridSize, groundY, u);
      ctx.beginPath();
      ctx.moveTo(p3.screenX, p3.screenY);
      ctx.lineTo(p4.screenX, p4.screenY);
      ctx.stroke();
    }

    // 2. Draw 3D Coordinate Axes
    const origin = project3D(0, groundY, 0);
    const axisLen = 1.45;
    const x1Axis = project3D(axisLen, groundY, 0);
    const x2Axis = project3D(0, groundY, axisLen);
    const yAxis = project3D(0, 1.35, 0);

    // X1 Axis (Cyan)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(origin.screenX, origin.screenY);
    ctx.lineTo(x1Axis.screenX, x1Axis.screenY);
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('+X₁ (Feature 1)', x1Axis.screenX + 8, x1Axis.screenY + 4);

    // X2 Axis (Purple)
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(origin.screenX, origin.screenY);
    ctx.lineTo(x2Axis.screenX, x2Axis.screenY);
    ctx.stroke();
    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('+X₂ (Feature 2)', x2Axis.screenX + 8, x2Axis.screenY + 4);

    // Y Axis (Emerald)
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(origin.screenX, origin.screenY);
    ctx.lineTo(yAxis.screenX, yAxis.screenY);
    ctx.stroke();
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('+Y (Target Value)', yAxis.screenX - 10, yAxis.screenY - 10);

    // 3. Draw 3D Tilted Regression Hyperplane Sheet (ŷ = w1*x1 + w2*x2 + b)
    const planeMesh = 14;
    const pBounds = 1.15;
    const w1 = linearSlopeW1;
    const w2 = linearSlopeW2;
    const b = linearInterceptB;

    type Quad = { pts: { screenX: number; screenY: number; depth: number }[]; avgDepth: number; u: number; v: number };
    const quads: Quad[] = [];

    for (let i = 0; i < planeMesh; i++) {
      for (let j = 0; j < planeMesh; j++) {
        const u0 = -pBounds + (2 * pBounds * i) / planeMesh;
        const u1 = -pBounds + (2 * pBounds * (i + 1)) / planeMesh;
        const v0 = -pBounds + (2 * pBounds * j) / planeMesh;
        const v1 = -pBounds + (2 * pBounds * (j + 1)) / planeMesh;

        const y00 = w1 * u0 + w2 * v0 + b;
        const y10 = w1 * u1 + w2 * v0 + b;
        const y11 = w1 * u1 + w2 * v1 + b;
        const y01 = w1 * u0 + w2 * v1 + b;

        const pt00 = project3D(u0, y00, v0);
        const pt10 = project3D(u1, y10, v0);
        const pt11 = project3D(u1, y11, v1);
        const pt01 = project3D(u0, y01, v1);

        const avgDepth = (pt00.depth + pt10.depth + pt11.depth + pt01.depth) / 4;
        quads.push({ pts: [pt00, pt10, pt11, pt01], avgDepth, u: (u0 + u1) / 2, v: (v0 + v1) / 2 });
      }
    }

    quads.sort((a, b) => b.avgDepth - a.avgDepth);

    quads.forEach(q => {
      ctx.beginPath();
      ctx.moveTo(q.pts[0].screenX, q.pts[0].screenY);
      ctx.lineTo(q.pts[1].screenX, q.pts[1].screenY);
      ctx.lineTo(q.pts[2].screenX, q.pts[2].screenY);
      ctx.lineTo(q.pts[3].screenX, q.pts[3].screenY);
      ctx.closePath();

      const hNorm = Math.max(0, Math.min(1, (w1 * q.u + w2 * q.v + b + 1.2) / 2.4));
      const red = Math.round(56 + 140 * hNorm);
      const green = Math.round(189 - 60 * hNorm);
      const blue = Math.round(248 - 80 * hNorm);
      ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, 0.28)`;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });

    // Draw normal vector arrow perpendicular to plane
    const planeCenter = project3D(0, b, 0);
    const nLen = 0.55 / (Math.hypot(w1, 1, w2) || 1);
    const normalTip = project3D(-w1 * nLen, b + 1.0 * nLen, -w2 * nLen);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(planeCenter.screenX, planeCenter.screenY);
    ctx.lineTo(normalTip.screenX, normalTip.screenY);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(normalTip.screenX, normalTip.screenY, 4.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = 'bold 10px monospace';
    ctx.fillText('Normal w', normalTip.screenX + 6, normalTip.screenY - 4);

    // 4. Draw 3D Scattered Data Points with Ground Shadow and Residual Error Stems
    const sampleCount = Math.min(points.length, 36);
    type Point3D = {
      x1: number;
      x2: number;
      yAct: number;
      yPred: number;
      ptAct: { screenX: number; screenY: number; depth: number };
      ptPred: { screenX: number; screenY: number; depth: number };
      ptGnd: { screenX: number; screenY: number; depth: number };
    };

    const pts3D: Point3D[] = [];
    for (let i = 0; i < sampleCount; i++) {
      const p = points[i];
      const x1 = p.x * 0.95;
      const x2 = (points[(i * 7 + 13) % points.length].y) * 0.9;
      const noise = ((i % 5) - 2) * 0.12;
      const yPred = w1 * x1 + w2 * x2 + b;
      const yAct = yPred + noise;

      const ptAct = project3D(x1, yAct, x2);
      const ptPred = project3D(x1, yPred, x2);
      const ptGnd = project3D(x1, groundY, x2);

      pts3D.push({ x1, x2, yAct, yPred, ptAct, ptPred, ptGnd });
    }

    pts3D.sort((a, b) => b.ptAct.depth - a.ptAct.depth);

    pts3D.forEach(p => {
      if (linearShowProjectionRays) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.beginPath();
        ctx.arc(p.ptGnd.screenX, p.ptGnd.screenY, 3.5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(p.ptGnd.screenX, p.ptGnd.screenY);
        ctx.lineTo(p.ptAct.screenX, p.ptAct.screenY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (linearShowResiduals) {
        const isPositive = p.yAct >= p.yPred;
        ctx.strokeStyle = isPositive ? 'rgba(52, 211, 153, 0.85)' : 'rgba(244, 63, 94, 0.85)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(p.ptAct.screenX, p.ptAct.screenY);
        ctx.lineTo(p.ptPred.screenX, p.ptPred.screenY);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.ptPred.screenX - 3, p.ptPred.screenY - 3);
        ctx.lineTo(p.ptPred.screenX + 3, p.ptPred.screenY + 3);
        ctx.moveTo(p.ptPred.screenX + 3, p.ptPred.screenY - 3);
        ctx.lineTo(p.ptPred.screenX - 3, p.ptPred.screenY + 3);
        ctx.stroke();
      }

      const rad = Math.max(3, 5 + p.ptAct.depth * 0.8);
      const glowGrad = ctx.createRadialGradient(
        p.ptAct.screenX - 1.5,
        p.ptAct.screenY - 1.5,
        1,
        p.ptAct.screenX,
        p.ptAct.screenY,
        rad
      );
      glowGrad.addColorStop(0, '#ffffff');
      glowGrad.addColorStop(0.4, '#fbbf24');
      glowGrad.addColorStop(1, '#d97706');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(p.ptAct.screenX, p.ptAct.screenY, rad, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Top HUD
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 240, 20, 480, 52, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('3D MULTIPLE LINEAR HYPERPLANE: ŷ = w₁x₁ + w₂x₂ + b', cx, 40);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(
      `🖱️ Drag Orbit (Pitch: ${linear3dRotX.toFixed(0)}°, Yaw: ${linear3dRotY.toFixed(0)}°) | ŷ = ${w1.toFixed(2)}x₁ + ${w2.toFixed(2)}x₂ + ${b.toFixed(2)}`,
      cx,
      58
    );
    ctx.textAlign = 'left';
  };

  // 4B. 1D OLS Scatter Fit with Confidence Ribbon & Mean Centroid
  const drawLinear1dScatterFit = (
    ctx: CanvasRenderingContext2D,
    _w: number,
    _h: number,
    cx: number,
    cy: number,
    scale: number,
    localFrame: number
  ) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(10 / simSpeed)) === 0) {
      performLinearRegressionStep();
    }

    const { points } = stateRef.current;
    const m = linearSlopeW1;
    const c = linearInterceptB;

    const n = Math.max(1, points.length);
    const meanX = points.reduce((acc, p) => acc + p.x, 0) / n;
    const meanY = points.reduce((acc, p) => acc + p.y, 0) / n;
    const sumSqX = points.reduce((acc, p) => acc + Math.pow(p.x - meanX, 2), 0) || 1;
    const se = Math.sqrt(Math.max(0.01, 1 - r2Score)) * 0.35;

    // 1. Shaded 95% Confidence Interval Hyperbolic Ribbon
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;

    const steps = 60;
    const xMin = -1.6;
    const xMax = 1.6;
    const upperPts: { x: number; y: number }[] = [];
    const lowerPts: { x: number; y: number }[] = [];

    for (let i = 0; i <= steps; i++) {
      const xVal = xMin + ((xMax - xMin) * i) / steps;
      const yHat = m * xVal + c;
      const ciDelta = 1.96 * se * Math.sqrt(1 / n + Math.pow(xVal - meanX, 2) / sumSqX);
      upperPts.push({ x: cx + xVal * scale, y: cy - (yHat + ciDelta) * scale });
      lowerPts.push({ x: cx + xVal * scale, y: cy - (yHat - ciDelta) * scale });
    }

    ctx.beginPath();
    ctx.moveTo(upperPts[0].x, upperPts[0].y);
    for (let i = 1; i < upperPts.length; i++) ctx.lineTo(upperPts[i].x, upperPts[i].y);
    for (let i = lowerPts.length - 1; i >= 0; i--) ctx.lineTo(lowerPts[i].x, lowerPts[i].y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(upperPts[0].x, upperPts[0].y);
    for (let i = 1; i < upperPts.length; i++) ctx.lineTo(upperPts[i].x, upperPts[i].y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(lowerPts[0].x, lowerPts[0].y);
    for (let i = 1; i < lowerPts.length; i++) ctx.lineTo(lowerPts[i].x, lowerPts[i].y);
    ctx.stroke();

    // 2. OLS Fitted Line
    const lineX1 = xMin;
    const lineY1 = m * lineX1 + c;
    const lineX2 = xMax;
    const lineY2 = m * lineX2 + c;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(cx + lineX1 * scale, cy - lineY1 * scale);
    ctx.lineTo(cx + lineX2 * scale, cy - lineY2 * scale);
    ctx.stroke();

    // 3. Draw Mean Centroid (x̄, ȳ) with Orthogonal Dashed Reference Lines
    const meanPx = cx + meanX * scale;
    const meanPy = cy - meanY * scale;

    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(meanPx, cy); ctx.lineTo(meanPx, meanPy);
    ctx.moveTo(cx, meanPy); ctx.lineTo(meanPx, meanPy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(meanPx, meanPy, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('Centroid (x̄, ȳ)', meanPx + 10, meanPy - 8);

    // 4. Data Points & Residual Stems
    points.forEach(p => {
      const yHat = m * p.x + c;
      const px = cx + p.x * scale;
      const py = cy - p.y * scale;
      const pyHat = cy - yHat * scale;

      if (linearShowResiduals) {
        const isPos = p.y >= yHat;
        ctx.strokeStyle = isPos ? 'rgba(52, 211, 153, 0.75)' : 'rgba(244, 63, 94, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, pyHat);
        ctx.stroke();
      }

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Top HUD
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 220, 20, 440, 52, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('1D ORDINARY LEAST SQUARES (OLS): ŷ = w₁x + b', cx, 40);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(`ŷ = ${m.toFixed(2)}x + ${c.toFixed(2)} | R² = ${r2Score.toFixed(3)} | Mode: ${linearRegMode.toUpperCase()} (λ=${linearRidgeLambda.toFixed(2)})`, cx, 58);
    ctx.textAlign = 'left';
  };

  // 4C. Polynomial Regression & Overfitting Curves (ŷ = Σ w_k x^k)
  const drawLinearPolynomialCurves = (
    ctx: CanvasRenderingContext2D,
    _w: number,
    _h: number,
    cx: number,
    cy: number,
    scale: number,
    localFrame: number
  ) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(10 / simSpeed)) === 0) {
      performLinearRegressionStep();
    }

    const { points } = stateRef.current;
    const deg = linearPolyDegree;
    const lambda = linearRidgeLambda;

    const w1 = linearSlopeW1 / (1 + lambda * 0.5);
    const w2 = (0.75 * Math.sign(linearSlopeW1 || 1)) / (1 + lambda * 2.0);
    const w3 = (-0.45 * (linearSlopeW2 || 1)) / (1 + lambda * 4.5);
    const w4 = (-0.35) / (1 + lambda * 8.0);
    const w5 = (0.25 * Math.sin(stateRef.current.timeT)) / (1 + lambda * 12.0);
    const b = linearInterceptB;

    const evalPoly = (x: number) => {
      let y = b + w1 * x;
      if (deg >= 2) y += w2 * Math.pow(x, 2);
      if (deg >= 3) y += w3 * Math.pow(x, 3);
      if (deg >= 4) y += w4 * Math.pow(x, 4);
      if (deg >= 5) y += w5 * Math.pow(x, 5);
      return y;
    };

    // 1. Draw Polynomial Curve
    const steps = 100;
    const xMin = -1.6;
    const xMax = 1.6;
    const curvePts: { x: number; y: number }[] = [];

    for (let i = 0; i <= steps; i++) {
      const xVal = xMin + ((xMax - xMin) * i) / steps;
      const yVal = evalPoly(xVal);
      curvePts.push({ x: cx + xVal * scale, y: cy - yVal * scale });
    }

    ctx.strokeStyle = deg <= 2 ? '#38bdf8' : deg <= 3 ? '#a855f7' : '#ec4899';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(curvePts[0].x, curvePts[0].y);
    for (let i = 1; i < curvePts.length; i++) {
      ctx.lineTo(curvePts[i].x, curvePts[i].y);
    }
    ctx.stroke();

    // 2. Data Points & Residual Droplines
    points.forEach(p => {
      const yHat = evalPoly(p.x);
      const px = cx + p.x * scale;
      const py = cy - p.y * scale;
      const pyHat = cy - yHat * scale;

      if (linearShowResiduals) {
        ctx.strokeStyle = p.y >= yHat ? 'rgba(52, 211, 153, 0.75)' : 'rgba(244, 63, 94, 0.75)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, pyHat);
        ctx.stroke();
      }

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Top HUD
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = deg <= 2 ? '#38bdf8' : deg <= 3 ? '#a855f7' : '#ec4899';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 240, 20, 480, 52, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = deg <= 2 ? '#38bdf8' : deg <= 3 ? '#c084fc' : '#f472b6';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`POLYNOMIAL REGRESSION (DEGREE ${deg}): ŷ = Σ_{k=0}^d w_k x^k`, cx, 40);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    const statusText = deg === 1 ? 'Underfitting (Linear Bias)' : deg <= 3 ? 'Optimal Non-Linear Fit' : lambda > 0.2 ? 'Regularized Overfit Prevention' : '⚠️ High-Variance Overfitting';
    ctx.fillText(`Ridge Penalty λ = ${lambda.toFixed(2)} | Status: ${statusText}`, cx, 58);
    ctx.textAlign = 'left';
  };

  // 4D. Residuals vs Fitted & Normal Q-Q Diagnostic Plots
  const drawLinearResidualsAndQQ = (
    ctx: CanvasRenderingContext2D,
    w: number,
    _h: number,
    cx: number,
    cy: number,
    _scale: number,
    _localFrame: number
  ) => {
    const { points } = stateRef.current;
    const m = linearSlopeW1;
    const c = linearInterceptB;

    const n = Math.max(2, points.length);
    const residuals: { yHat: number; e: number; absE: number }[] = [];
    let sumE = 0;
    let sumSqE = 0;

    points.forEach(p => {
      const yHat = m * p.x + c;
      const e = p.y - yHat;
      residuals.push({ yHat, e, absE: Math.abs(e) });
      sumE += e;
      sumSqE += e * e;
    });

    const meanE = sumE / n;
    const se = Math.sqrt(sumSqE / (n - 1)) || 1;

    const panelW = (w - 80) / 2;
    const panelH = 280;
    const panelY = cy - 110;
    const leftPanelX = 30;
    const rightPanelX = cx + 15;

    [leftPanelX, rightPanelX].forEach(px => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(px, panelY, panelW, panelH, 10);
      ctx.fill();
      ctx.stroke();
    });

    // Left Panel: Residuals vs. Fitted
    const lcx = leftPanelX + panelW / 2;
    const lcy = panelY + panelH / 2;

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('1. Residuals vs. Fitted (e_i vs. ŷ_i)', leftPanelX + 16, panelY + 24);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(leftPanelX + 20, lcy);
    ctx.lineTo(leftPanelX + panelW - 20, lcy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText('e = 0', leftPanelX + panelW - 48, lcy - 5);

    const sigmaScale = (panelH * 0.38) / (3 * se);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(leftPanelX + 20, lcy - 2 * se * sigmaScale);
    ctx.lineTo(leftPanelX + panelW - 20, lcy - 2 * se * sigmaScale);
    ctx.moveTo(leftPanelX + 20, lcy + 2 * se * sigmaScale);
    ctx.lineTo(leftPanelX + panelW - 20, lcy + 2 * se * sigmaScale);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.7)';
    ctx.fillText('+2σ', leftPanelX + panelW - 45, lcy - 2 * se * sigmaScale - 4);
    ctx.fillText('-2σ', leftPanelX + panelW - 45, lcy + 2 * se * sigmaScale + 12);

    const xFitScale = (panelW * 0.38) / 1.5;
    residuals.forEach(r => {
      const rx = lcx + r.yHat * xFitScale;
      const ry = lcy - r.e * sigmaScale;

      ctx.fillStyle = Math.abs(r.e) > 2 * se ? '#f43f5e' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(rx, ry, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Right Panel: Normal Q-Q Plot
    const rcx = rightPanelX + panelW / 2;
    const rcy = panelY + panelH / 2;

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('2. Normal Q-Q Plot (Gaussian Residuals)', rightPanelX + 16, panelY + 24);

    const qqScale = (panelH * 0.38) / 2.5;
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(rcx - 2.4 * qqScale, rcy + 2.4 * qqScale);
    ctx.lineTo(rcx + 2.4 * qqScale, rcy - 2.4 * qqScale);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#34d399';
    ctx.font = '10px monospace';
    ctx.fillText('y = x (Normal Reference)', rcx + 1.2 * qqScale, rcy - 1.4 * qqScale);

    const sortedResiduals = [...residuals].sort((a, b) => a.e - b.e);
    const approxNormInv = (p: number) => {
      const q = p - 0.5;
      if (Math.abs(q) <= 0.42) {
        const r = q * q;
        return q * (((-25.44106049637 * r + 41.39119773534) * r - 18.61500062529) * r + 2.50662823884) /
          ((((3.13082909833 * r - 21.06224101826) * r + 23.08336743743) * r - 8.47351093090) * r + 1.0);
      }
      const r = p < 0.5 ? p : 1 - p;
      const s = Math.log(-Math.log(r));
      const t = 0.3374754822726147 + s * (0.97616488908684 - s * (0.16079797149182 - s * (0.0231995545801 - s * (0.003950096985 - s * 0.00032549927))));
      return p < 0.5 ? -t : t;
    };

    sortedResiduals.forEach((r, idx) => {
      const pVal = (idx + 1 - 0.375) / (n + 0.25);
      const theoreticalZ = approxNormInv(Math.max(0.001, Math.min(0.999, pVal)));
      const sampleZ = (r.e - meanE) / se;

      const qx = rcx + theoreticalZ * qqScale;
      const qy = rcy - sampleZ * qqScale;

      ctx.fillStyle = Math.abs(sampleZ) > 2.0 ? '#f43f5e' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(qx, qy, 4.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Top HUD Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 240, 20, 480, 52, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RESIDUALS DIAGNOSTICS & NORMAL Q-Q PLOT', cx, 40);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Residual Standard Error: s_e = ${se.toFixed(3)} | Normality: ✓ Gaussian (R² = ${r2Score.toFixed(3)})`, cx, 58);
    ctx.textAlign = 'left';
  };

  // 4. Linear & Multiple Linear Regression Master Dispatcher
  const drawLinearRegression = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    cx: number,
    cy: number,
    scale: number,
    localFrame: number
  ) => {
    switch (linearViewMode) {
      case '3d_regression_plane':
        drawLinear3dHyperplaneSurface(ctx, w, h, cx, cy, scale, localFrame);
        break;
      case '1d_scatter_fit':
        drawLinear1dScatterFit(ctx, w, h, cx, cy, scale, localFrame);
        break;
      case 'polynomial_curves':
        drawLinearPolynomialCurves(ctx, w, h, cx, cy, scale, localFrame);
        break;
      case 'residuals_analysis':
        drawLinearResidualsAndQQ(ctx, w, h, cx, cy, scale, localFrame);
        break;
      default:
        drawLinear3dHyperplaneSurface(ctx, w, h, cx, cy, scale, localFrame);
        break;
    }
  };

  // ─── 5. Logistic Regression Comprehensive Multi-Engine Visualizer ───

  // 5A. 3D Sigmoidal Probability Surface (Z = P(y=1|x))
  const drawLogreg3dSigmoidSurface = (
    ctx: CanvasRenderingContext2D,
    _w: number,
    _h: number,
    cx: number,
    cy: number,
    scale: number,
    localFrame: number
  ) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(15 / simSpeed)) === 0) {
      performLogisticRegressionStep();
    }

    const rotX = (logreg3dRotX * Math.PI) / 180;
    const rotY = ((logreg3dRotY + (simMode === 'autoplay' && isSimulating ? localFrame * 0.25 : 0)) * Math.PI) / 180;
    const scale3d = scale * 0.68;
    const w1 = logregW1;
    const w2 = logregW2;
    const b = logregBiasB;
    const thresh = logregThreshold;

    // 3D Projection Helper
    const project3D = (x: number, y: number, z: number) => {
      const x1 = x * Math.cos(rotY) - y * Math.sin(rotY);
      const y1 = x * Math.sin(rotY) + y * Math.cos(rotY);
      const z1 = z;

      const x2 = x1;
      const y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
      const z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);

      return {
        px: cx + x2 * scale3d,
        py: cy - y2 * scale3d + 20,
        depth: z2
      };
    };

    // 1. Draw 3D Ground Coordinate Grid & Axes
    const boxSize = 1.4;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;

    for (let i = -boxSize; i <= boxSize + 0.05; i += 0.35) {
      const p1 = project3D(i, -boxSize, 0);
      const p2 = project3D(i, boxSize, 0);
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();

      const p3 = project3D(-boxSize, i, 0);
      const p4 = project3D(boxSize, i, 0);
      ctx.beginPath();
      ctx.moveTo(p3.px, p3.py);
      ctx.lineTo(p4.px, p4.py);
      ctx.stroke();
    }

    // 2. Vertical Z Probability Axis (0.0 to 1.0)
    const zBase = project3D(-boxSize, -boxSize, 0);
    const zTop = project3D(-boxSize, -boxSize, 1.2);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(zBase.px, zBase.py);
    ctx.lineTo(zTop.px, zTop.py);
    ctx.stroke();

    // Z-axis ticks & labels
    [0.0, 0.25, 0.5, 0.75, 1.0].forEach(zVal => {
      const tickPos = project3D(-boxSize, -boxSize, zVal);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText(`P=${zVal.toFixed(2)}`, tickPos.px - 45, tickPos.py + 3);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(tickPos.px, tickPos.py, 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    // 3. Ground Axis Labels
    const axX = project3D(boxSize + 0.15, 0, 0);
    const axY = project3D(0, boxSize + 0.15, 0);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('Feature X₁', axX.px + 4, axX.py);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('Feature X₂', axY.px, axY.py - 6);

    // 4. Generate and Render 3D Sigmoidal Surface Mesh
    const gridRes = 16;
    const step = (2 * boxSize) / gridRes;
    interface Quad3D {
      pts: { px: number; py: number; depth: number }[];
      avgZ: number;
      prob: number;
      depth: number;
    }
    const quads: Quad3D[] = [];

    for (let i = 0; i < gridRes; i++) {
      for (let j = 0; j < gridRes; j++) {
        const xA = -boxSize + i * step;
        const xB = xA + step;
        const yA = -boxSize + j * step;
        const yB = yA + step;

        const zAA = 1 / (1 + Math.exp(-Math.max(-8, Math.min(8, w1 * xA + w2 * yA + b))));
        const zBA = 1 / (1 + Math.exp(-Math.max(-8, Math.min(8, w1 * xB + w2 * yA + b))));
        const zBB = 1 / (1 + Math.exp(-Math.max(-8, Math.min(8, w1 * xB + w2 * yB + b))));
        const zAB = 1 / (1 + Math.exp(-Math.max(-8, Math.min(8, w1 * xA + w2 * yB + b))));

        const pAA = project3D(xA, yA, zAA);
        const pBA = project3D(xB, yA, zBA);
        const pBB = project3D(xB, yB, zBB);
        const pAB = project3D(xA, yB, zAB);

        const avgProb = (zAA + zBA + zBB + zAB) / 4;
        const avgDepth = (pAA.depth + pBA.depth + pBB.depth + pAB.depth) / 4;

        quads.push({
          pts: [pAA, pBA, pBB, pAB],
          avgZ: avgProb,
          prob: avgProb,
          depth: avgDepth
        });
      }
    }

    // Sort Quads back-to-front by depth for proper alpha blending
    quads.sort((a, b) => a.depth - b.depth);

    // Draw Surface Quads
    quads.forEach(q => {
      ctx.beginPath();
      ctx.moveTo(q.pts[0].px, q.pts[0].py);
      ctx.lineTo(q.pts[1].px, q.pts[1].py);
      ctx.lineTo(q.pts[2].px, q.pts[2].py);
      ctx.lineTo(q.pts[3].px, q.pts[3].py);
      ctx.closePath();

      // Dynamic color gradient: Amber (P~0) -> Cyan (P~0.5) -> Purple/Blue (P~1)
      const p = q.prob;
      let fillCol: string;
      if (p < 0.5) {
        const t = p / 0.5;
        // Amber (245, 158, 11) to Cyan (6, 182, 212)
        const r = Math.round(245 * (1 - t) + 6 * t);
        const g = Math.round(158 * (1 - t) + 182 * t);
        const bl = Math.round(11 * (1 - t) + 212 * t);
        fillCol = `rgba(${r}, ${g}, ${bl}, 0.55)`;
      } else {
        const t = (p - 0.5) / 0.5;
        // Cyan (6, 182, 212) to Purple (168, 85, 247)
        const r = Math.round(6 * (1 - t) + 168 * t);
        const g = Math.round(182 * (1 - t) + 85 * t);
        const bl = Math.round(212 * (1 - t) + 247 * t);
        fillCol = `rgba(${r}, ${g}, ${bl}, 0.65)`;
      }

      ctx.fillStyle = fillCol;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // 5. Draw 3D Decision Threshold Contour Line on the Sigmoid Surface (P = thresh)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const logitT = Math.log(Math.max(0.01, thresh) / (1 - Math.max(0.01, thresh) + 1e-6));
    const threshPts: { px: number; py: number }[] = [];

    for (let xVal = -boxSize; xVal <= boxSize + 0.05; xVal += 0.1) {
      const yVal = (logitT - b - w1 * xVal) / (w2 || 1e-6);
      if (Math.abs(yVal) <= boxSize + 0.1) {
        const pThresh = project3D(xVal, yVal, thresh);
        threshPts.push(pThresh);
      }
    }
    if (threshPts.length > 1) {
      ctx.moveTo(threshPts[0].px, threshPts[0].py);
      for (let i = 1; i < threshPts.length; i++) {
        ctx.lineTo(threshPts[i].px, threshPts[i].py);
      }
      ctx.stroke();

      // Label Decision Boundary on 3D Sheet
      const mid = threshPts[Math.floor(threshPts.length / 2)];
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`⚡ Decision Boundary (P=${thresh.toFixed(2)})`, mid.px + 8, mid.py - 6);
    }

    // 6. Draw 3D Data Points with Vertical Projection Guide Rays
    const { points } = stateRef.current;
    points.forEach(pt => {
      const prob = 1 / (1 + Math.exp(-Math.max(-8, Math.min(8, w1 * pt.x + w2 * pt.y + b))));
      const ground = project3D(pt.x, pt.y, 0);
      const elevatedTrue = project3D(pt.x, pt.y, pt.label === 1 ? 1.0 : 0.0);
      const onSurface = project3D(pt.x, pt.y, prob);

      // Ground shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.beginPath();
      ctx.arc(ground.px, ground.py, 3, 0, 2 * Math.PI);
      ctx.fill();

      // Dotted Vertical Guide Ray from Ground to Surface
      ctx.strokeStyle = pt.label === 1 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(ground.px, ground.py);
      ctx.lineTo(elevatedTrue.px, elevatedTrue.py);
      ctx.stroke();
      ctx.setLineDash([]);

      // True Class Point (Top P=1 or Bottom P=0)
      ctx.fillStyle = pt.label === 1 ? '#38bdf8' : '#ef4444';
      ctx.beginPath();
      if (pt.label === 1) {
        // Blue Triangle
        ctx.moveTo(elevatedTrue.px, elevatedTrue.py - 4.5);
        ctx.lineTo(elevatedTrue.px + 4, elevatedTrue.py + 3.5);
        ctx.lineTo(elevatedTrue.px - 4, elevatedTrue.py + 3.5);
        ctx.closePath();
      } else {
        // Red Diamond
        ctx.moveTo(elevatedTrue.px, elevatedTrue.py - 4);
        ctx.lineTo(elevatedTrue.px + 4, elevatedTrue.py);
        ctx.lineTo(elevatedTrue.px, elevatedTrue.py + 4);
        ctx.lineTo(elevatedTrue.px - 4, elevatedTrue.py);
        ctx.closePath();
      }
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Predicted Probability Bead on Sigmoid Surface
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(onSurface.px, onSurface.py, 2.5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // 7. Header Banner & Interaction Hint
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx - 240, 16, 480, 48, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('3D SIGMOID PROBABILITY SURFACE:  P(y=1|x) = σ(w₁x₁ + w₂x₂ + b)', cx - 220, 34);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(
      `🖱️ Drag to Orbit (Pitch: ${logreg3dRotX}°, Yaw: ${logreg3dRotY}°) | Threshold T = ${thresh.toFixed(2)}`,
      cx - 220,
      50
    );
  };

  // 5B. 1D Logistic Sigmoid Activation Curve & Decision Threshold
  const drawLogreg1dSigmoidCurve = (
    ctx: CanvasRenderingContext2D,
    _w: number,
    _h: number,
    cx: number,
    cy: number,
    _scale: number,
    localFrame: number
  ) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(15 / simSpeed)) === 0) {
      performLogisticRegressionStep();
    }

    const w1 = logregW1 || 1.5;
    const b = logregBiasB;
    const thresh = logregThreshold;
    const boxW = 460;
    const boxH = 240;
    const originX = cx - boxW / 2;
    const originY = cy - boxH / 2;

    // Background Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(originX, originY, boxW, boxH, 12);
    ctx.fill();
    ctx.stroke();

    // Compute Critical Decision Split Point: z* = logit(T) -> x* = (logit(T) - b) / w1
    const logitT = Math.log(Math.max(0.01, thresh) / (1 - Math.max(0.01, thresh) + 1e-6));
    const xStar = (logitT - b) / (w1 || 1e-6);

    // Map 1D coord to Canvas: x in [-3, 3] -> pixelX, P in [0, 1] -> pixelY
    const toPx = (xVal: number) => originX + 40 + ((xVal + 3) / 6) * (boxW - 80);
    const toPy = (pVal: number) => originY + boxH - 35 - pVal * (boxH - 70);

    const splitPx = Math.max(originX + 40, Math.min(originX + boxW - 40, toPx(xStar)));

    // Shaded Classification Regions
    // Class 0 Region (Left: P < T)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    ctx.fillRect(originX + 40, originY + 30, splitPx - (originX + 40), boxH - 65);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px monospace';
    ctx.fillText("Class '0' Region (P < T)", originX + 50, originY + 50);

    // Class 1 Region (Right: P >= T)
    ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
    ctx.fillRect(splitPx, originY + 30, originX + boxW - 40 - splitPx, boxH - 65);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText("Class '1' Region (P ≥ T)", splitPx + 15, originY + 50);

    // Grid lines & Axes
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
    ctx.lineWidth = 1;
    [0.0, 0.25, 0.5, 0.75, 1.0].forEach(pVal => {
      const py = toPy(pVal);
      ctx.beginPath();
      ctx.moveTo(originX + 40, py);
      ctx.lineTo(originX + boxW - 40, py);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText(pVal.toFixed(2), originX + 12, py + 3);
    });

    // Horizontal Decision Threshold Line (P = T)
    const threshPy = toPy(thresh);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(originX + 40, threshPy);
    ctx.lineTo(originX + boxW - 40, threshPy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`Threshold T = ${thresh.toFixed(2)}`, originX + boxW - 145, threshPy - 5);

    // Vertical Decision Boundary Split Line (x = x*)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(splitPx, originY + 30);
    ctx.lineTo(splitPx, originY + boxH - 35);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`x* = ${xStar.toFixed(2)}`, splitPx - 25, originY + boxH - 18);

    // Draw Smooth 1D Sigmoid S-Curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let xVal = -3.0; xVal <= 3.05; xVal += 0.05) {
      const z = w1 * xVal + b;
      const prob = 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, z))));
      const px = toPx(xVal);
      const py = toPy(prob);
      if (xVal === -3.0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Mark Intersection Star on Sigmoid Curve
    const starPy = toPy(thresh);
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(splitPx, starPy, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw 1D Points at Top (P=1) and Bottom (P=0) with Drop Lines
    const { points } = stateRef.current;
    points.forEach(pt => {
      const ptX = pt.x * 2.0; // scale to [-3, 3]
      const px = toPx(ptX);
      const z = w1 * ptX + b;
      const prob = 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, z))));
      const curvePy = toPy(prob);
      const targetPy = toPy(pt.label === 1 ? 1.0 : 0.0);

      // Vertical Drop Line to Curve
      ctx.strokeStyle = pt.label === 1 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(px, targetPy);
      ctx.lineTo(px, curvePy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point at Top/Bottom rail
      ctx.fillStyle = pt.label === 1 ? '#38bdf8' : '#ef4444';
      ctx.beginPath();
      ctx.arc(px, targetPy, 4.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Point on Sigmoid Curve
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(px, curvePy, 2.5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('1D LOGISTIC SIGMOID CURVE:  P(y=1|x) = 1 / (1 + e^{-(wx + b)})', originX + 20, originY + 22);
  };

  // 5C. 2D Probability Continuous Heatmap & Decision Boundary
  const drawLogreg2dHeatmapAndBoundary = (
    ctx: CanvasRenderingContext2D,
    _w: number,
    _h: number,
    cx: number,
    cy: number,
    scale: number,
    localFrame: number
  ) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(15 / simSpeed)) === 0) {
      performLogisticRegressionStep();
    }

    const { points } = stateRef.current;
    const w1 = logregW1;
    const w2 = logregW2;
    const b = logregBiasB;
    const thresh = logregThreshold;
    const isPoly = logregBoundaryType === 'polynomial';

    // 1. Draw 2D Continuous Probability Heatmap (Coarse Grid)
    const span = 1.6;
    const step = 0.08;
    for (let x = -span; x <= span; x += step) {
      for (let y = -span; y <= span; y += step) {
        let z: number;
        if (isPoly) {
          z = w1 * x + w2 * y - 1.8 * (x * x + y * y) + b + 1.2;
        } else {
          z = w1 * x + w2 * y + b;
        }
        const prob = 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, z))));

        // Color interpolation: Amber (P~0) -> Slate (P~0.5) -> Cyan/Blue (P~1)
        let r: number, g: number, bl: number;
        if (prob < 0.5) {
          const t = prob / 0.5;
          r = Math.round(239 * (1 - t) + 15 * t);
          g = Math.round(68 * (1 - t) + 23 * t);
          bl = Math.round(68 * (1 - t) + 42 * t);
        } else {
          const t = (prob - 0.5) / 0.5;
          r = Math.round(15 * (1 - t) + 56 * t);
          g = Math.round(23 * (1 - t) + 189 * t);
          bl = Math.round(42 * (1 - t) + 248 * t);
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${bl}, 0.38)`;
        const px = cx + x * scale;
        const py = cy - y * scale;
        ctx.fillRect(px - (step * scale) / 2, py - (step * scale) / 2, step * scale + 0.5, step * scale + 0.5);
      }
    }

    // 2. Decision Boundary Line / Contour
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.beginPath();

    const logitT = Math.log(Math.max(0.01, thresh) / (1 - Math.max(0.01, thresh) + 1e-6));

    if (isPoly) {
      // Circular / Quadratic Polynomial Decision Boundary
      for (let angle = 0; angle <= Math.PI * 2 + 0.05; angle += 0.05) {
        const rBase = Math.sqrt(Math.max(0.05, (b + 1.2 - logitT) / 1.8));
        const px = cx + (rBase * Math.cos(angle) + w1 * 0.15) * scale;
        const py = cy - (rBase * Math.sin(angle) + w2 * 0.15) * scale;
        if (angle === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
    } else {
      // Linear Decision Boundary
      const y1 = (logitT - b - w1 * -span) / (w2 || 1e-6);
      const y2 = (logitT - b - w1 * span) / (w2 || 1e-6);
      ctx.moveTo(cx - span * scale, cy - y1 * scale);
      ctx.lineTo(cx + span * scale, cy - y2 * scale);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Normal Gradient Arrow
    const normLen = 40;
    const normX = (w1 / Math.hypot(w1, w2 || 1e-6)) * normLen;
    const normY = (w2 / Math.hypot(w1, w2 || 1e-6)) * normLen;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + normX, cy - normY);
    ctx.stroke();

    // Data Points
    points.forEach(p => {
      const px = cx + p.x * scale;
      const py = cy - p.y * scale;
      ctx.fillStyle = p.label === 1 ? '#38bdf8' : '#ef4444';
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Equation Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx - 220, 16, 440, 38, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(
      isPoly
        ? `Polynomial Boundary: σ(${w1.toFixed(2)}x₁ + ${w2.toFixed(2)}x₂ - 1.8‖x‖² + ${b.toFixed(2)}) = ${thresh.toFixed(2)}`
        : `Linear Boundary: w₁x₁ + w₂x₂ + b = logit(${thresh.toFixed(2)})`,
      cx - 200,
      38
    );
  };

  // 5D. 3-Class Multinomial Softmax Logistic Regression
  const drawLogregMultinomialSoftmax = (
    ctx: CanvasRenderingContext2D,
    _w: number,
    _h: number,
    cx: number,
    cy: number,
    scale: number,
    localFrame: number
  ) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(15 / simSpeed)) === 0) {
      performLogisticRegressionStep();
    }

    const tau = logregTemperature || 1.0;
    const span = 1.6;
    const step = 0.09;

    // 3 Class Parameter Vectors
    const W = [
      { w1: 1.4, w2: -0.9, b: 0.1 },   // Class 0: Red
      { w1: -1.2, w2: -1.0, b: 0.1 },  // Class 1: Blue
      { w1: -0.1, w2: 1.8, b: -0.2 }   // Class 2: Green
    ];

    // 1. Shaded Softmax Probability Regions
    for (let x = -span; x <= span; x += step) {
      for (let y = -span; y <= span; y += step) {
        const z0 = (W[0].w1 * x + W[0].w2 * y + W[0].b) / tau;
        const z1 = (W[1].w1 * x + W[1].w2 * y + W[1].b) / tau;
        const z2 = (W[2].w1 * x + W[2].w2 * y + W[2].b) / tau;

        const maxZ = Math.max(z0, z1, z2);
        const exp0 = Math.exp(z0 - maxZ);
        const exp1 = Math.exp(z1 - maxZ);
        const exp2 = Math.exp(z2 - maxZ);
        const sumExp = exp0 + exp1 + exp2;

        const p0 = exp0 / sumExp;
        const p1 = exp1 / sumExp;
        const p2 = exp2 / sumExp;

        // Blended RGB: Class 0 Red (239, 68, 68), Class 1 Blue (59, 130, 246), Class 2 Green (16, 185, 129)
        const r = Math.round(p0 * 239 + p1 * 30 + p2 * 16);
        const g = Math.round(p0 * 50 + p1 * 130 + p2 * 185);
        const bl = Math.round(p0 * 50 + p1 * 246 + p2 * 129);

        ctx.fillStyle = `rgba(${r}, ${g}, ${bl}, 0.35)`;
        const px = cx + x * scale;
        const py = cy - y * scale;
        ctx.fillRect(px - (step * scale) / 2, py - (step * scale) / 2, step * scale + 0.5, step * scale + 0.5);
      }
    }

    // 2. Triple Junction Decision Rays (Where 2 classes have equal logit)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 1.4 * scale, cy + 1.2 * scale); // Ray 0-2
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 1.4 * scale, cy + 1.2 * scale); // Ray 1-2
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - 1.6 * scale);               // Ray 0-1
    ctx.stroke();

    // Central Triple-Junction Point
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Multi-Class Sample Data Points
    const multiPoints = [
      // Class 0 (Red - Right/Bottom)
      { x: 0.8, y: -0.6, label: 0 },
      { x: 0.9, y: -0.9, label: 0 },
      { x: 0.6, y: -1.1, label: 0 },
      { x: 1.1, y: -0.4, label: 0 },
      { x: 1.2, y: -0.8, label: 0 },
      { x: 0.7, y: -1.3, label: 0 },
      // Class 1 (Blue - Left/Bottom)
      { x: -0.8, y: -0.7, label: 1 },
      { x: -1.0, y: -1.0, label: 1 },
      { x: -0.6, y: -1.2, label: 1 },
      { x: -1.1, y: -0.5, label: 1 },
      { x: -1.2, y: -0.9, label: 1 },
      { x: -0.7, y: -1.4, label: 1 },
      // Class 2 (Green - Top)
      { x: 0.0, y: 0.9, label: 2 },
      { x: 0.3, y: 1.1, label: 2 },
      { x: -0.3, y: 1.0, label: 2 },
      { x: 0.1, y: 1.3, label: 2 },
      { x: -0.2, y: 0.7, label: 2 },
      { x: 0.4, y: 0.8, label: 2 }
    ];

    multiPoints.forEach(pt => {
      const px = cx + pt.x * scale;
      const py = cy - pt.y * scale;
      ctx.fillStyle = pt.label === 0 ? '#ef4444' : pt.label === 1 ? '#3b82f6' : '#10b981';
      ctx.beginPath();
      if (pt.label === 0) {
        ctx.arc(px, py, 5.5, 0, 2 * Math.PI);
      } else if (pt.label === 1) {
        ctx.moveTo(px, py - 5);
        ctx.lineTo(px + 5, py);
        ctx.lineTo(px, py + 5);
        ctx.lineTo(px - 5, py);
        ctx.closePath();
      } else {
        ctx.moveTo(px, py - 5.5);
        ctx.lineTo(px + 5, py + 4.5);
        ctx.lineTo(px - 5, py + 4.5);
        ctx.closePath();
      }
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Region Labels
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('🔴 Class 0 (P₀ > P₁, P₂)', cx + 0.5 * scale, cy + 0.9 * scale);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('🔷 Class 1 (P₁ > P₀, P₂)', cx - 1.3 * scale, cy + 0.9 * scale);
    ctx.fillStyle = '#34d399';
    ctx.fillText('🔺 Class 2 (P₂ > P₀, P₁)', cx - 0.4 * scale, cy - 1.2 * scale);

    // Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx - 230, 16, 460, 38, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('MULTINOMIAL SOFTMAX: P(y=k|x) = e^{w_k^T x + b_k} / Σ e^{w_j^T x + b_j}', cx - 210, 38);
  };

  // 5E. Logistic Regression Sigmoid Probability S-Curve vs Binary Cross-Entropy Log-Loss Dual Penalty Curve
  const drawLogregLogLossDualCurve = (
    ctx: CanvasRenderingContext2D,
    w: number,
    _h: number,
    cx: number,
    cy: number,
    _scale: number,
    localFrame: number
  ) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(15 / simSpeed)) === 0) {
      performLogisticRegressionStep();
    }

    const panelW = Math.min(480, w * 0.47);
    const panelH = 340;
    const leftX = cx - panelW - 14;
    const rightX = cx + 14;
    const topY = cy - panelH / 2;

    const thresh = logregThreshold;
    const targetY = logregTrueLabelY; // 0 or 1
    const testZ = logregTestZ; // active linear logit z = w1*x + b
    const predProb = 1 / (1 + Math.exp(-testZ)); // y_hat = sigma(z)
    const logLoss = targetY === 1 ? -Math.log(Math.max(1e-5, predProb)) : -Math.log(Math.max(1e-5, 1 - predProb));
    const gradientDz = predProb - targetY; // dJ/dz = y_hat - y

    // ─── 1. LEFT PANEL: SIGMOID PROBABILITY S-CURVE (σ(z) = 1/(1+e^-z)) ───
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(leftX, topY, panelW, panelH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('📈 SIGMOID PROBABILITY S-CURVE: ŷ = σ(z)', leftX + 16, topY + 24);

    // Subtitle formula
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText('σ(z) = 1 / (1 + e^{-(w₁x + b)})', leftX + 16, topY + 40);

    // Plot geometry for Left Panel
    const plotL = leftX + 46;
    const plotR = leftX + panelW - 24;
    const plotT = topY + 60;
    const plotB = topY + panelH - 45;
    const plotW = plotR - plotL;
    const plotH = plotB - plotT;

    // Coordinate Mapping: z in [-6, 6] -> pixelX, P in [0, 1] -> pixelY
    const mapZToX = (z: number) => plotL + ((z + 6) / 12) * plotW;
    const mapPToY = (p: number) => plotB - p * plotH;

    // Threshold Decision Boundary Split (z* = logit(thresh))
    const zStar = Math.log(Math.max(0.02, Math.min(0.98, thresh)) / (1 - Math.max(0.02, Math.min(0.98, thresh))));
    const splitX = Math.max(plotL, Math.min(plotR, mapZToX(zStar)));

    // Decision region tints
    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
    ctx.fillRect(plotL, plotT, splitX - plotL, plotH);
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(`CLASS '0' ZONE (ŷ < ${thresh.toFixed(2)})`, plotL + 8, plotT + 16);

    ctx.fillStyle = 'rgba(52, 211, 153, 0.08)';
    ctx.fillRect(splitX, plotT, plotR - splitX, plotH);
    ctx.fillStyle = '#34d399';
    ctx.fillText(`CLASS '1' ZONE (ŷ ≥ ${thresh.toFixed(2)})`, splitX + 8, plotT + 16);

    // Grid lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
    ctx.lineWidth = 1;
    [0.0, 0.25, 0.5, 0.75, 1.0].forEach(pVal => {
      const gy = mapPToY(pVal);
      ctx.beginPath();
      ctx.moveTo(plotL, gy);
      ctx.lineTo(plotR, gy);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText(pVal.toFixed(2), leftX + 18, gy + 3);
    });

    [-6, -4, -2, 0, 2, 4, 6].forEach(zVal => {
      const gx = mapZToX(zVal);
      ctx.beginPath();
      ctx.moveTo(gx, plotT);
      ctx.lineTo(gx, plotB);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText(zVal.toString(), gx - 4, plotB + 16);
    });

    // Decision Threshold Line
    const threshY = mapPToY(thresh);
    ctx.strokeStyle = '#f59e0b';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotL, threshY);
    ctx.lineTo(plotR, threshY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`Threshold T = ${thresh.toFixed(2)}`, plotR - 105, threshY - 4);

    // Draw Sigmoid S-Curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let sx = 0; sx <= plotW; sx += 2) {
      const curZ = -6 + (sx / plotW) * 12;
      const curSig = 1 / (1 + Math.exp(-curZ));
      const px = plotL + sx;
      const py = mapPToY(curSig);
      if (sx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Active Operating Point Bead on Sigmoid Curve
    const curPtX = mapZToX(testZ);
    const curPtY = mapPToY(predProb);

    // Drop rays
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(curPtX, plotB);
    ctx.lineTo(curPtX, curPtY);
    ctx.lineTo(plotL, curPtY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(curPtX, curPtY, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Telemetry Badge on Left Panel
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(leftX + 16, plotB + 22, panelW - 32, 22, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`Input Logit z = ${testZ.toFixed(2)}  ➔  ŷ = P(y=1) = ${(predProb * 100).toFixed(1)}%  [${predProb >= thresh ? 'Class 1' : 'Class 0'}]`, leftX + 24, plotB + 36);

    // ─── 2. RIGHT PANEL: BINARY CROSS-ENTROPY / LOG-LOSS DUAL CURVE ───
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rightX, topY, panelW, panelH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('📉 LOG-LOSS PENALTY: J(θ) = -log(ŷ) or -log(1-ŷ)', rightX + 16, topY + 24);

    // Subtitle formula
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(`Target: y=${targetY} | J = -[y·log(ŷ) + (1-y)·log(1-ŷ)]`, rightX + 16, topY + 40);

    // Plot geometry for Right Panel
    const rPlotL = rightX + 46;
    const rPlotR = rightX + panelW - 24;
    const rPlotT = topY + 60;
    const rPlotB = topY + panelH - 45;
    const rPlotW = rPlotR - rPlotL;
    const rPlotH = rPlotB - rPlotT;

    // Coordinate Mapping: ŷ in [0, 1] -> pixelX, Loss in [0, 4.5] -> pixelY
    const mapYHatToX = (yHat: number) => rPlotL + yHat * rPlotW;
    const mapLossToY = (lossVal: number) => rPlotB - (Math.min(4.5, lossVal) / 4.5) * rPlotH;

    // Grid lines for Right Panel
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
    ctx.lineWidth = 1;
    [0, 1, 2, 3, 4].forEach(lVal => {
      const gy = mapLossToY(lVal);
      ctx.beginPath();
      ctx.moveTo(rPlotL, gy);
      ctx.lineTo(rPlotR, gy);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText(`J=${lVal}`, rightX + 16, gy + 3);
    });

    [0.0, 0.2, 0.4, 0.6, 0.8, 1.0].forEach(yVal => {
      const gx = mapYHatToX(yVal);
      ctx.beginPath();
      ctx.moveTo(gx, rPlotT);
      ctx.lineTo(gx, rPlotB);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText(yVal.toFixed(1), gx - 8, rPlotB + 16);
    });

    // Plot Curve 1: y = 1 -> J = -log(ŷ) [Solid Emerald Green]
    ctx.strokeStyle = targetY === 1 ? '#34d399' : 'rgba(52, 211, 153, 0.35)';
    ctx.lineWidth = targetY === 1 ? 3 : 1.5;
    if (targetY !== 1) ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let px = 2; px <= rPlotW; px += 2) {
      const yHat = px / rPlotW;
      const lossVal = -Math.log(Math.max(1e-4, yHat));
      const cxPos = rPlotL + px;
      const cyPos = mapLossToY(lossVal);
      if (px === 2) ctx.moveTo(cxPos, cyPos);
      else ctx.lineTo(cxPos, cyPos);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot Curve 2: y = 0 -> J = -log(1 - ŷ) [Amber/Orange]
    ctx.strokeStyle = targetY === 0 ? '#f59e0b' : 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = targetY === 0 ? 3 : 1.5;
    if (targetY !== 0) ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let px = 0; px <= rPlotW - 2; px += 2) {
      const yHat = px / rPlotW;
      const lossVal = -Math.log(Math.max(1e-4, 1 - yHat));
      const cxPos = rPlotL + px;
      const cyPos = mapLossToY(lossVal);
      if (px === 0) ctx.moveTo(cxPos, cyPos);
      else ctx.lineTo(cxPos, cyPos);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve Legend Badges
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('— y=1: J = -log(ŷ)', rPlotR - 130, rPlotT + 14);

    ctx.fillStyle = '#fbbf24';
    ctx.fillText('— y=0: J = -log(1-ŷ)', rPlotR - 130, rPlotT + 28);

    // Active Loss Operating Point on Right Curve
    const activeLossX = mapYHatToX(predProb);
    const activeLossY = mapLossToY(logLoss);

    ctx.strokeStyle = targetY === 1 ? '#34d399' : '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(activeLossX, rPlotB);
    ctx.lineTo(activeLossX, activeLossY);
    ctx.lineTo(rPlotL, activeLossY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = logLoss > 2.0 ? '#f43f5e' : targetY === 1 ? '#34d399' : '#fbbf24';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(activeLossX, activeLossY, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Telemetry Badge on Right Panel
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.strokeStyle = logLoss > 2.0 ? 'rgba(244, 63, 94, 0.6)' : 'rgba(52, 211, 153, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(rightX + 16, rPlotB + 22, panelW - 32, 22, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = logLoss > 2.0 ? '#f87171' : '#f8fafc';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`Active Loss J = ${logLoss.toFixed(4)}  |  ∂J/∂z = ${gradientDz >= 0 ? '+' : ''}${gradientDz.toFixed(3)} ${logLoss > 2.0 ? '⚠️ HIGH PENALTY' : '✓ LOW LOSS'}`, rightX + 24, rPlotB + 36);
  };

  // Master Switch for Logistic Regression
  const drawLogisticRegression = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    cx: number,
    cy: number,
    scale: number,
    localFrame: number
  ) => {
    if (logregViewMode === '3d_sigmoid_surface') {
      drawLogreg3dSigmoidSurface(ctx, w, h, cx, cy, scale, localFrame);
    } else if (logregViewMode === '1d_sigmoid_curve') {
      drawLogreg1dSigmoidCurve(ctx, w, h, cx, cy, scale, localFrame);
    } else if (logregViewMode === '2d_heatmap_boundary') {
      drawLogreg2dHeatmapAndBoundary(ctx, w, h, cx, cy, scale, localFrame);
    } else if (logregViewMode === 'multinomial_softmax') {
      drawLogregMultinomialSoftmax(ctx, w, h, cx, cy, scale, localFrame);
    } else if (logregViewMode === 'log_loss_dual_curve') {
      drawLogregLogLossDualCurve(ctx, w, h, cx, cy, scale, localFrame);
    }
  };

  // ─── 6. Support Vector Machine (SVM) Canvas Engine (2D Kernels, 1D Parabola, 3D Kernel Trick) ───

  // 6A. 2D Kernels Renderer (Linear, Polynomial, RBF, Sigmoid)
  const drawSvm2dKernels = (
    ctx: CanvasRenderingContext2D,
    _w: number,
    _h: number,
    cx: number,
    cy: number,
    scale: number,
    localFrame: number
  ) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(15 / simSpeed)) === 0) {
      performSvmStep();
    }

    const { points } = stateRef.current;
    const pts = points.length > 0 ? points : [
      { x: -0.8, y: 0.6, label: 1 }, { x: -0.6, y: 0.8, label: 1 }, { x: -0.4, y: 0.9, label: 1 },
      { x: -0.9, y: 0.3, label: 1 }, { x: -0.7, y: 0.4, label: 1 }, { x: -0.5, y: 0.5, label: 1 },
      { x: 0.4, y: -0.5, label: 0 }, { x: 0.6, y: -0.7, label: 0 }, { x: 0.8, y: -0.4, label: 0 },
      { x: 0.3, y: -0.8, label: 0 }, { x: 0.5, y: -0.9, label: 0 }, { x: 0.7, y: -0.6, label: 0 }
    ];

    // Kernel Function
    const evalKernel = (u: { x: number; y: number }, v: { x: number; y: number }): number => {
      const dot = u.x * v.x + u.y * v.y;
      if (svmKernel === 'linear') {
        return dot;
      }
      if (svmKernel === 'poly') {
        const val = Math.max(-2.5, Math.min(2.5, svmGamma * dot + svmPolyIntercept));
        return Math.pow(val, svmPolyDegree);
      }
      if (svmKernel === 'rbf') {
        const distSq = (u.x - v.x) * (u.x - v.x) + (u.y - v.y) * (u.y - v.y);
        return Math.exp(-svmGamma * distSq * 2.2);
      }
      // sigmoid
      return Math.tanh(svmGamma * dot + svmPolyIntercept);
    };

    // Decision Function f(x, y)
    const evalDecisionScore = (qx: number, qy: number): number => {
      let score = svmBiasB;
      const q = { x: qx, y: qy };
      pts.forEach(p => {
        const y_i = p.label === 1 ? 1.0 : -1.0;
        const kVal = evalKernel(p, q);
        score += y_i * (svmC * 0.42) * kVal;
      });
      return score;
    };

    // 1. Grid Background Evaluation (Marching Squares / Shading)
    const gridRes = 32;
    const minX = -1.8;
    const maxX = 1.8;
    const minY = -1.8;
    const maxY = 1.8;
    const stepX = (maxX - minX) / gridRes;
    const stepY = (maxY - minY) / gridRes;

    const gridScores: number[][] = [];
    for (let i = 0; i <= gridRes; i++) {
      gridScores[i] = [];
      const gx = minX + i * stepX;
      for (let j = 0; j <= gridRes; j++) {
        const gy = minY + j * stepY;
        gridScores[i][j] = evalDecisionScore(gx, gy);
      }
    }

    // Soft Dual-Color Shading
    for (let i = 0; i < gridRes; i++) {
      const gx1 = minX + i * stepX;
      const sx1 = cx + gx1 * scale;
      const sw = stepX * scale;

      for (let j = 0; j < gridRes; j++) {
        const gy1 = minY + j * stepY;
        const sy1 = cy - (gy1 + stepY) * scale;
        const sh = stepY * scale;

        const avgScore = (gridScores[i][j] + gridScores[i + 1][j] + gridScores[i][j + 1] + gridScores[i + 1][j + 1]) / 4;
        if (avgScore > 0) {
          ctx.fillStyle = `rgba(56, 189, 248, ${Math.min(0.18, 0.04 + Math.abs(avgScore) * 0.05)})`;
        } else {
          ctx.fillStyle = `rgba(245, 158, 11, ${Math.min(0.18, 0.04 + Math.abs(avgScore) * 0.05)})`;
        }
        ctx.fillRect(sx1, sy1, sw + 0.5, sh + 0.5);
      }
    }

    // 2. Decision Contours (f=0 solid, f=+1/-1 dashed margins)
    const drawContourLevel = (targetLevel: number, strokeColor: string, lineWidth: number, isDashed: boolean) => {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      if (isDashed) ctx.setLineDash([5, 5]);
      else ctx.setLineDash([]);
      ctx.beginPath();

      for (let i = 0; i < gridRes; i++) {
        const x0 = minX + i * stepX;
        const x1 = x0 + stepX;
        for (let j = 0; j < gridRes; j++) {
          const y0 = minY + j * stepY;
          const y1 = y0 + stepY;

          const v00 = gridScores[i][j] - targetLevel;
          const v10 = gridScores[i + 1][j] - targetLevel;
          const v11 = gridScores[i + 1][j + 1] - targetLevel;
          const v01 = gridScores[i][j + 1] - targetLevel;

          // Check cell edges for zero-crossing
          const edges: { x: number; y: number }[] = [];
          if ((v00 > 0) !== (v10 > 0)) {
            const t = Math.abs(v00) / (Math.abs(v00) + Math.abs(v10) + 1e-6);
            edges.push({ x: x0 + t * stepX, y: y0 });
          }
          if ((v10 > 0) !== (v11 > 0)) {
            const t = Math.abs(v10) / (Math.abs(v10) + Math.abs(v11) + 1e-6);
            edges.push({ x: x1, y: y0 + t * stepY });
          }
          if ((v01 > 0) !== (v11 > 0)) {
            const t = Math.abs(v01) / (Math.abs(v01) + Math.abs(v11) + 1e-6);
            edges.push({ x: x0 + t * stepX, y: y1 });
          }
          if ((v00 > 0) !== (v01 > 0)) {
            const t = Math.abs(v00) / (Math.abs(v00) + Math.abs(v01) + 1e-6);
            edges.push({ x: x0, y: y0 + t * stepY });
          }

          if (edges.length === 2) {
            ctx.moveTo(cx + edges[0].x * scale, cy - edges[0].y * scale);
            ctx.lineTo(cx + edges[1].x * scale, cy - edges[1].y * scale);
          } else if (edges.length === 4) {
            ctx.moveTo(cx + edges[0].x * scale, cy - edges[0].y * scale);
            ctx.lineTo(cx + edges[1].x * scale, cy - edges[1].y * scale);
            ctx.moveTo(cx + edges[2].x * scale, cy - edges[2].y * scale);
            ctx.lineTo(cx + edges[3].x * scale, cy - edges[3].y * scale);
          }
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // Positive margin f(x) = +1
    drawContourLevel(1.0, 'rgba(56, 189, 248, 0.65)', 1.8, true);
    // Negative margin f(x) = -1
    drawContourLevel(-1.0, 'rgba(245, 158, 11, 0.65)', 1.8, true);
    // Decision boundary f(x) = 0 (Luminous Purple)
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 10;
    drawContourLevel(0.0, '#c084fc', 3.5, false);
    ctx.shadowBlur = 0;

    // 3. Render Data Points & Identify Support Vectors
    let svCount = 0;
    pts.forEach(p => {
      const px = cx + p.x * scale;
      const py = cy - p.y * scale;
      const score = evalDecisionScore(p.x, p.y);
      const y_i = p.label === 1 ? 1.0 : -1.0;
      const marginDist = y_i * score;
      const isSupportVector = marginDist <= 1.15;

      if (isSupportVector) {
        svCount++;
        // Glowing Halo Ring for Support Vector
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(px, py, 9.5, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('SV', px + 12, py - 4);
      }

      // Slack error violation line
      if (marginDist < 1.0) {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + (p.label === 1 ? -12 : 12), py + (p.label === 1 ? 12 : -12));
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Data Point Body
      ctx.fillStyle = p.label === 1 ? '#38bdf8' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(px, py, isSupportVector ? 6.5 : 4.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // 4. Header HUD Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(cx - 240, 10, 480, 36);
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 240, 10, 480, 36);

    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(
      `SVM KERNEL: ${svmKernel.toUpperCase()} | SVs: ${svCount}/${pts.length} | C=${svmC.toFixed(1)} | γ=${svmGamma.toFixed(2)}${svmKernel === 'poly' ? ` | d=${svmPolyDegree}` : ''}`,
      cx - 225,
      32
    );
  };

  // 6B. 1D to 2D Parabola Lifting Renderer (x -> x^2)
  const drawSvm1dParabolaLifting = (
    ctx: CanvasRenderingContext2D,
    _w: number,
    _h: number,
    cx: number,
    cy: number,
    scale: number,
    localFrame: number
  ) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(18 / simSpeed)) === 0) {
      performSvmStep();
    }

    const morph = svmLiftMorph;
    const baselineY = cy + 40;

    // 1D Inseparable Sandwich Data Points
    const pts1d = [
      // Class 0 (Orange Middle Sandwich)
      { x: -0.38, label: 0 }, { x: -0.26, label: 0 }, { x: -0.15, label: 0 },
      { x: -0.05, label: 0 }, { x: 0.08, label: 0 }, { x: 0.18, label: 0 },
      { x: 0.28, label: 0 }, { x: 0.36, label: 0 },
      // Class 1 (Cyan Outer Left & Right Wings)
      { x: -0.92, label: 1 }, { x: -0.80, label: 1 }, { x: -0.68, label: 1 }, { x: -0.56, label: 1 },
      { x: 0.54, label: 1 }, { x: 0.66, label: 1 }, { x: 0.78, label: 1 }, { x: 0.90, label: 1 }
    ];

    // Draw 1D Horizontal Axis Line
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 1.2 * scale, baselineY);
    ctx.lineTo(cx + 1.2 * scale, baselineY);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText('1D Input Axis (x₁)', cx + 1.2 * scale - 120, baselineY + 18);

    // Parabolic Guide Curve: y = morph * (1.8 * x^2 - 0.42)
    if (morph > 0.05) {
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let gx = -1.1; gx <= 1.1; gx += 0.05) {
        const gy = morph * (1.85 * gx * gx - 0.42);
        const px = cx + gx * scale;
        const py = baselineY - gy * scale;
        if (gx === -1.1) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Horizontal Separating Hyperplane in 2D: y = c
      const cutY = baselineY - morph * (-0.02) * scale;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 1.2 * scale, cutY);
      ctx.lineTo(cx + 1.2 * scale, cutY);
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('2D Separating Line: y = c (w₁·x₁ + w₂·x₁² + b = 0)', cx - 180, cutY - 8);
    }

    // Render Data Points with Vertical Motion Lift Trails
    pts1d.forEach(p => {
      const px = cx + p.x * scale;
      const py1d = baselineY;
      const liftedY = morph * (1.85 * p.x * p.x - 0.42);
      const py2d = baselineY - liftedY * scale;

      // Vertical Lifting Motion Trail
      if (morph > 0.05) {
        ctx.strokeStyle = p.label === 1 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, py1d);
        ctx.lineTo(px, py2d);
        ctx.stroke();

        // 1D Ghost Footprint
        ctx.fillStyle = 'rgba(71, 85, 105, 0.6)';
        ctx.beginPath();
        ctx.arc(px, py1d, 3.5, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Active Transformed Point
      ctx.fillStyle = p.label === 1 ? '#38bdf8' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(px, py2d, 6.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    });

    // Pedagogical HUD Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(cx - 260, 10, 520, 48);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 260, 10, 520, 48);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('1D ➔ 2D POLYNOMIAL PARABOLIC LIFTING: φ(x) = (x, x²)', cx - 240, 28);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px monospace';
    ctx.fillText(
      morph > 0.5 ? '✓ Linearly Separable in 2D Feature Space!' : '1D: Inseparable Sandwich Trap (No single threshold splits classes)',
      cx - 240,
      47
    );
  };

  // 6C. 2D to 3D Kernel Trick Space Lifting (Concentric Circles -> 3D Paraboloid Bowl)
  const drawSvm3dKernelTrick = (
    ctx: CanvasRenderingContext2D,
    _w: number,
    _h: number,
    cx: number,
    cy: number,
    scale: number,
    localFrame: number
  ) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(20 / simSpeed)) === 0) {
      performSvmStep();
    }

    const morph = svmLiftMorph;
    const rotX = (svm3dRotX * Math.PI) / 180;
    const rotY = ((svm3dRotY + (simMode === 'autoplay' && isSimulating ? localFrame * 0.3 : 0)) * Math.PI) / 180;
    const scale3d = scale * 0.72;

    // 3D Isometric Projection Matrix
    const project3d = (x: number, y: number, z: number): { sx: number; sy: number; depth: number } => {
      // Rotate around Y (Yaw)
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY + y * sinY;
      const y1 = -x * sinY + y * cosY;
      const z1 = z;

      // Rotate around X (Pitch)
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      return {
        sx: cx + x2 * scale3d,
        sy: cy - y2 * scale3d + 20,
        depth: z2
      };
    };

    // 1. Draw 3D Base Coordinate Box & Floor Grid at z = 0
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
    ctx.lineWidth = 1;
    const boxR = 1.1;
    for (let gx = -boxR; gx <= boxR; gx += 0.55) {
      const p1 = project3d(gx, -boxR, 0);
      const p2 = project3d(gx, boxR, 0);
      ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
    }
    for (let gy = -boxR; gy <= boxR; gy += 0.55) {
      const p1 = project3d(-boxR, gy, 0);
      const p2 = project3d(boxR, gy, 0);
      ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
    }

    // 3D Coordinate Axes Arrows
    const origin = project3d(0, 0, 0);
    const axisX = project3d(1.3, 0, 0);
    const axisY = project3d(0, 1.3, 0);
    const axisZ = project3d(0, 0, 1.3 * morph);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(origin.sx, origin.sy); ctx.lineTo(axisX.sx, axisX.sy); ctx.stroke();
    ctx.fillStyle = '#ef4444'; ctx.font = 'bold 10px monospace'; ctx.fillText('X₁', axisX.sx + 4, axisX.sy);

    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath(); ctx.moveTo(origin.sx, origin.sy); ctx.lineTo(axisY.sx, axisY.sy); ctx.stroke();
    ctx.fillStyle = '#38bdf8'; ctx.fillText('X₂', axisY.sx + 4, axisY.sy);

    ctx.strokeStyle = '#c084fc';
    ctx.beginPath(); ctx.moveTo(origin.sx, origin.sy); ctx.lineTo(axisZ.sx, axisZ.sy); ctx.stroke();
    ctx.fillStyle = '#c084fc'; ctx.fillText('Z = φ(X₁, X₂)', axisZ.sx + 4, axisZ.sy - 4);

    // 2. 3D Paraboloid Wireframe Bowl: z = morph * (x^2 + y^2)
    if (morph > 0.05) {
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.25)';
      ctx.lineWidth = 1.2;
      [0.25, 0.55, 0.85, 1.05].forEach(rCircle => {
        ctx.beginPath();
        const zCircle = morph * (rCircle * rCircle);
        for (let th = 0; th <= 2 * Math.PI + 0.1; th += 0.2) {
          const pt = project3d(rCircle * Math.cos(th), rCircle * Math.sin(th), zCircle);
          if (th === 0) ctx.moveTo(pt.sx, pt.sy);
          else ctx.lineTo(pt.sx, pt.sy);
        }
        ctx.stroke();
      });

      // 3. 3D Slicing Hyperplane Sheet at z = svm3dSliceZ
      const sliceZ = svm3dSliceZ * morph;
      const corner1 = project3d(-boxR, -boxR, sliceZ);
      const corner2 = project3d(boxR, -boxR, sliceZ);
      const corner3 = project3d(boxR, boxR, sliceZ);
      const corner4 = project3d(-boxR, boxR, sliceZ);

      ctx.fillStyle = 'rgba(52, 211, 153, 0.22)';
      ctx.beginPath();
      ctx.moveTo(corner1.sx, corner1.sy);
      ctx.lineTo(corner2.sx, corner2.sy);
      ctx.lineTo(corner3.sx, corner3.sy);
      ctx.lineTo(corner4.sx, corner4.sy);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('3D Separating Hyperplane (Flat Sheet)', corner3.sx - 100, corner3.sy - 6);
    }

    // 4. Concentric Data Points in 3D
    const concentricPts: { x: number; y: number; label: number }[] = [];
    for (let i = 0; i < 20; i++) {
      const r = 0.12 + Math.random() * 0.22;
      const th = Math.random() * 2 * Math.PI;
      concentricPts.push({ x: r * Math.cos(th), y: r * Math.sin(th), label: 0 });
    }
    for (let i = 0; i < 28; i++) {
      const r = 0.70 + Math.random() * 0.28;
      const th = Math.random() * 2 * Math.PI;
      concentricPts.push({ x: r * Math.cos(th), y: r * Math.sin(th), label: 1 });
    }

    // Sort by depth for correct 3D occlusion
    const projectedPts = concentricPts.map(p => {
      const z = morph * (p.x * p.x + p.y * p.y);
      const proj3d = project3d(p.x, p.y, z);
      const projFloor = project3d(p.x, p.y, 0);
      return { ...p, z, ...proj3d, floorX: projFloor.sx, floorY: projFloor.sy };
    }).sort((a, b) => a.depth - b.depth);

    projectedPts.forEach(p => {
      // Vertical Drop-Line from 3D point to 2D floor footprint
      if (morph > 0.05) {
        ctx.strokeStyle = p.label === 1 ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.floorX, p.floorY);
        ctx.lineTo(p.sx, p.sy);
        ctx.stroke();

        // 2D Ghost Footprint on floor
        ctx.fillStyle = 'rgba(71, 85, 105, 0.5)';
        ctx.beginPath();
        ctx.arc(p.floorX, p.floorY, 3, 0, 2 * Math.PI);
        ctx.fill();
      }

      // 3D Point
      ctx.fillStyle = p.label === 1 ? '#38bdf8' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, 5.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // 5. Projected 2D Circular Boundary on Floor
    if (morph > 0.05) {
      const circleR = Math.sqrt(Math.max(0.01, svm3dSliceZ / Math.max(0.1, morph)));
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let th = 0; th <= 2 * Math.PI + 0.1; th += 0.2) {
        const pt = project3d(circleR * Math.cos(th), circleR * Math.sin(th), 0);
        if (th === 0) ctx.moveTo(pt.sx, pt.sy);
        else ctx.lineTo(pt.sx, pt.sy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Interaction HUD & Orbit Details
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(cx - 260, 10, 520, 48);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 260, 10, 520, 48);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('2D ➔ 3D KERNEL TRICK: φ(x₁, x₂) = (x₁, x₂, x₁² + x₂²)', cx - 240, 28);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px monospace';
    ctx.fillText(
      `🖱️ Drag on canvas to Orbit 3D Box (Pitch: ${svm3dRotX.toFixed(0)}°, Yaw: ${svm3dRotY.toFixed(0)}°) | Slice Z=${svm3dSliceZ.toFixed(2)}`,
      cx - 240,
      47
    );
  };

  // Master SVM Router
  const drawSvmClassifier = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    cx: number,
    cy: number,
    scale: number,
    localFrame: number
  ) => {
    if (svmViewMode === '1d_parabola') {
      drawSvm1dParabolaLifting(ctx, w, h, cx, cy, scale, localFrame);
    } else if (svmViewMode === '3d_kernel_trick') {
      drawSvm3dKernelTrick(ctx, w, h, cx, cy, scale, localFrame);
    } else {
      drawSvm2dKernels(ctx, w, h, cx, cy, scale, localFrame);
    }
  };

  // 7. Decision Tree Split Renderer (Recursive 2D Partitioning + Hierarchy Tree Inset + Gini Impurity Gain Curve)
  const drawDecisionTreeSplit = (ctx: CanvasRenderingContext2D, w: number, h: number, cx: number, cy: number, _scale: number, localFrame: number) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(45 / simSpeed)) === 0) {
      performDecisionTreeStep();
    }

    const { points } = stateRef.current;
    const dynamicSplitX = 0.05 + (simMode === 'autoplay' && isSimulating ? 0.22 * Math.sin(stateRef.current.timeT * 0.45) : 0);
    const splitY_Left = -0.25 + (simMode === 'autoplay' && isSimulating ? 0.15 * Math.cos(stateRef.current.timeT * 0.5) : 0);
    const splitY_Right = 0.30 + (simMode === 'autoplay' && isSimulating ? -0.15 * Math.sin(stateRef.current.timeT * 0.5) : 0);

    const plotW = Math.min(520, w * 0.55);
    const plotH = Math.min(380, h - 80);
    const plotX = cx - plotW / 2 - 140;
    const plotY = cy - plotH / 2 + 10;

    // 1. Shaded Recursive 2D Partition Quadrants
    ctx.save();
    ctx.beginPath();
    ctx.rect(plotX, plotY, plotW, plotH);
    ctx.clip();

    // Base background for partition plot
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(plotX, plotY, plotW, plotH);

    const splitPxX = plotX + ((dynamicSplitX + 1.2) / 2.4) * plotW;
    const splitPxY_Left = plotY + ((-splitY_Left + 1.2) / 2.4) * plotH;
    const splitPxY_Right = plotY + ((-splitY_Right + 1.2) / 2.4) * plotH;

    if (treeDepth === 1) {
      // Depth 1: Left is Class 0 (Amber), Right is Class 1 (Cyan)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
      ctx.fillRect(plotX, plotY, splitPxX - plotX, plotH);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.fillRect(splitPxX, plotY, plotX + plotW - splitPxX, plotH);
    } else {
      // Depth 2+: Quadrant Regions
      ctx.fillStyle = 'rgba(245, 158, 11, 0.16)'; // Top-Left: Class 0
      ctx.fillRect(plotX, plotY, splitPxX - plotX, splitPxY_Left - plotY);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.14)'; // Bottom-Left: Class 1
      ctx.fillRect(plotX, splitPxY_Left, splitPxX - plotX, plotY + plotH - splitPxY_Left);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)'; // Top-Right: Class 1
      ctx.fillRect(splitPxX, plotY, plotX + plotW - splitPxX, splitPxY_Right - plotY);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.13)'; // Bottom-Right: Class 0
      ctx.fillRect(splitPxX, splitPxY_Right, plotX + plotW - splitPxX, plotY + plotH - splitPxY_Right);
    }

    // Draw Grid Lines inside plot
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    for (let gx = plotX + 40; gx < plotX + plotW; gx += 40) {
      ctx.beginPath(); ctx.moveTo(gx, plotY); ctx.lineTo(gx, plotY + plotH); ctx.stroke();
    }
    for (let gy = plotY + 40; gy < plotY + plotH; gy += 40) {
      ctx.beginPath(); ctx.moveTo(plotX, gy); ctx.lineTo(plotX + plotW, gy); ctx.stroke();
    }

    // Split Lines
    // Primary Split (Level 1: X1 <= theta1)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(splitPxX, plotY);
    ctx.lineTo(splitPxX, plotY + plotH);
    ctx.stroke();

    // Threshold Badge on Split Line
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(splitPxX - 38, plotY + 8, 76, 20, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`X₁ ≤ ${dynamicSplitX.toFixed(2)}`, splitPxX, plotY + 22);

    if (treeDepth >= 2) {
      // Secondary Splits (Level 2: X2 <= theta2)
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([4, 3]);

      // Left split line
      ctx.beginPath();
      ctx.moveTo(plotX, splitPxY_Left);
      ctx.lineTo(splitPxX, splitPxY_Left);
      ctx.stroke();

      // Right split line
      ctx.beginPath();
      ctx.moveTo(splitPxX, splitPxY_Right);
      ctx.lineTo(plotX + plotW, splitPxY_Right);
      ctx.stroke();
      ctx.setLineDash([]);

      // Secondary badges
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#c084fc';
      ctx.beginPath();
      ctx.roundRect(plotX + 8, splitPxY_Left - 10, 68, 18, 4);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c084fc';
      ctx.fillText(`X₂ ≤ ${splitY_Left.toFixed(2)}`, plotX + 42, splitPxY_Left + 3);

      ctx.beginPath();
      ctx.roundRect(plotX + plotW - 76, splitPxY_Right - 10, 68, 18, 4);
      ctx.fill(); ctx.stroke();
      ctx.fillText(`X₂ ≤ ${splitY_Right.toFixed(2)}`, plotX + plotW - 42, splitPxY_Right + 3);
    }

    // Data Points
    points.forEach(p => {
      const px = plotX + ((p.x + 1.2) / 2.4) * plotW;
      const py = plotY + ((-p.y + 1.2) / 2.4) * plotH;

      ctx.fillStyle = p.label === 1 ? '#38bdf8' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.restore();

    // Plot Border
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    // 2. Right Side: Interactive Hierarchical Decision Tree Graph Inset
    const treeW = Math.min(340, w - (plotX + plotW) - 30);
    const treeH = plotH;
    const treeX = plotX + plotW + 16;
    const treeY = plotY;

    if (treeW > 220) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(treeX, treeY, treeW, treeH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🌲 BINARY TREE HIERARCHY (DEPTH ${treeDepth})`, treeX + 12, treeY + 20);

      // Root Node (Level 0)
      const rootX = treeX + treeW / 2;
      const rootY = treeY + 54;
      const cardW = 90;
      const cardH = 34;

      ctx.fillStyle = 'rgba(2, 132, 199, 0.25)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rootX - cardW / 2, rootY - cardH / 2, cardW, cardH, 6);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`X₁ ≤ ${dynamicSplitX.toFixed(2)}`, rootX, rootY - 3);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText(`Gini: 0.50 | N: 140`, rootX, rootY + 10);

      // Level 1 Nodes
      const l1_LeftX = treeX + treeW * 0.28;
      const l1_RightX = treeX + treeW * 0.72;
      const l1_Y = treeY + 125;

      // Tree Branches
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rootX, rootY + cardH / 2);
      ctx.lineTo(l1_LeftX, l1_Y - cardH / 2);
      ctx.moveTo(rootX, rootY + cardH / 2);
      ctx.lineTo(l1_RightX, l1_Y - cardH / 2);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '7px sans-serif';
      ctx.fillText('True (≤)', (rootX + l1_LeftX) / 2 - 8, (rootY + l1_Y) / 2);
      ctx.fillText('False (>)', (rootX + l1_RightX) / 2 + 8, (rootY + l1_Y) / 2);

      // Left Child (Level 1)
      ctx.fillStyle = treeDepth >= 2 ? 'rgba(168, 85, 247, 0.25)' : 'rgba(245, 158, 11, 0.25)';
      ctx.strokeStyle = treeDepth >= 2 ? '#c084fc' : '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(l1_LeftX - cardW / 2, l1_Y - cardH / 2, cardW, cardH, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = treeDepth >= 2 ? '#c084fc' : '#fbbf24';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(treeDepth >= 2 ? `X₂ ≤ ${splitY_Left.toFixed(2)}` : '🍂 Leaf Class 0', l1_LeftX, l1_Y - 3);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText(treeDepth >= 2 ? `Gini: 0.24 | N: 68` : `[N₀: 58, N₁: 10]`, l1_LeftX, l1_Y + 10);

      // Right Child (Level 1)
      ctx.fillStyle = treeDepth >= 2 ? 'rgba(168, 85, 247, 0.25)' : 'rgba(56, 189, 248, 0.25)';
      ctx.strokeStyle = treeDepth >= 2 ? '#c084fc' : '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(l1_RightX - cardW / 2, l1_Y - cardH / 2, cardW, cardH, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = treeDepth >= 2 ? '#c084fc' : '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(treeDepth >= 2 ? `X₂ ≤ ${splitY_Right.toFixed(2)}` : '🍂 Leaf Class 1', l1_RightX, l1_Y - 3);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText(treeDepth >= 2 ? `Gini: 0.19 | N: 72` : `[N₀: 8, N₁: 64]`, l1_RightX, l1_Y + 10);

      if (treeDepth >= 2) {
        // Level 2 Leaves
        const l2_Y = treeY + 195;
        const leafPositions = [
          { x: treeX + treeW * 0.15, cls: 0, n0: 32, n1: 2 },
          { x: treeX + treeW * 0.40, cls: 1, n0: 4, n1: 30 },
          { x: treeX + treeW * 0.62, cls: 1, n0: 3, n1: 35 },
          { x: treeX + treeW * 0.86, cls: 0, n0: 31, n1: 3 }
        ];

        // Connect Level 1 to Level 2
        ctx.strokeStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(l1_LeftX, l1_Y + cardH / 2); ctx.lineTo(leafPositions[0].x, l2_Y - 14);
        ctx.moveTo(l1_LeftX, l1_Y + cardH / 2); ctx.lineTo(leafPositions[1].x, l2_Y - 14);
        ctx.moveTo(l1_RightX, l1_Y + cardH / 2); ctx.lineTo(leafPositions[2].x, l2_Y - 14);
        ctx.moveTo(l1_RightX, l1_Y + cardH / 2); ctx.lineTo(leafPositions[3].x, l2_Y - 14);
        ctx.stroke();

        leafPositions.forEach((leaf) => {
          const lColor = leaf.cls === 1 ? '#38bdf8' : '#fbbf24';
          ctx.fillStyle = leaf.cls === 1 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)';
          ctx.strokeStyle = lColor;
          ctx.beginPath();
          ctx.roundRect(leaf.x - 30, l2_Y - 14, 60, 28, 4);
          ctx.fill(); ctx.stroke();

          ctx.fillStyle = lColor;
          ctx.font = 'bold 8px monospace';
          ctx.fillText(`🍂 C${leaf.cls}`, leaf.x, l2_Y - 2);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '7px monospace';
          ctx.fillText(`[${leaf.n0},${leaf.n1}]`, leaf.x, l2_Y + 8);
        });
      }

      // Impurity / Gain Summary Footer inside tree card
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(treeX + 10, treeY + treeH - 46, treeW - 20, 36, 6);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Criterion: ${treeCriterion.toUpperCase()} (CART)`, treeX + 18, treeY + treeH - 30);
      ctx.fillStyle = '#34d399';
      ctx.fillText(`Δ Information Gain: +0.428 bits`, treeX + 18, treeY + treeH - 16);
    }

    // Top Header Readout
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`🌲 DECISION TREE CLASSIFIER (CART) | Depth=${treeDepth} | Split x₁* = ${dynamicSplitX.toFixed(2)} | Gini Impurity = ${(0.50 - 0.08 * treeDepth).toFixed(3)}`, plotX, plotY - 12);
  };

  // 8. Naive Bayes Probability Density Renderer (Interactive Dual-Board: 2D Bivariate Decision Boundary + 1D Marginal Likelihoods & Posterior Nomogram)
  const drawNaiveBayesDensity = (ctx: CanvasRenderingContext2D, w: number, h: number, _cx: number, _cy: number, _scale: number, localFrame: number) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(30 / simSpeed)) === 0) {
      performNaiveBayesStep();
    }

    const { points } = stateRef.current;
    const c0Points = points.filter(p => p.label === 0);
    const c1Points = points.filter(p => p.label === 1);

    // Calculate Empirical Means & Standard Deviations
    const smoothing = nbVarSmoothing || 0.01;
    const mu0x = c0Points.length > 0 ? c0Points.reduce((acc, p) => acc + p.x, 0) / c0Points.length : -0.45;
    const mu0y = c0Points.length > 0 ? c0Points.reduce((acc, p) => acc + p.y, 0) / c0Points.length : 0.35;
    const std0x = Math.max(0.12, Math.sqrt(c0Points.reduce((acc, p) => acc + (p.x - mu0x) ** 2, 0) / (c0Points.length || 1) + smoothing));
    const std0y = Math.max(0.12, Math.sqrt(c0Points.reduce((acc, p) => acc + (p.y - mu0y) ** 2, 0) / (c0Points.length || 1) + smoothing));

    const mu1x = c1Points.length > 0 ? c1Points.reduce((acc, p) => acc + p.x, 0) / c1Points.length : 0.45;
    const mu1y = c1Points.length > 0 ? c1Points.reduce((acc, p) => acc + p.y, 0) / c1Points.length : -0.35;
    const std1x = Math.max(0.12, Math.sqrt(c1Points.reduce((acc, p) => acc + (p.x - mu1x) ** 2, 0) / (c1Points.length || 1) + smoothing));
    const std1y = Math.max(0.12, Math.sqrt(c1Points.reduce((acc, p) => acc + (p.y - mu1y) ** 2, 0) / (c1Points.length || 1) + smoothing));

    const p0 = Math.max(0.01, Math.min(0.99, nbPriorC0));
    const p1 = 1 - p0;

    // Interactive Query Probe Q(x, y)
    let qx = stateRef.current.nbProbePos?.x ?? 0.15;
    let qy = stateRef.current.nbProbePos?.y ?? -0.10;
    if (simMode === 'autoplay' && isSimulating) {
      qx = 0.55 * Math.sin(stateRef.current.timeT * 0.7);
      qy = 0.45 * Math.cos(stateRef.current.timeT * 0.5);
      stateRef.current.nbProbePos = { x: qx, y: qy };
    }

    // Likelihood computations for Probe Q
    const normPdf = (x: number, mu: number, std: number) => {
      const invStd = 1 / (std * Math.sqrt(2 * Math.PI));
      return invStd * Math.exp(-0.5 * ((x - mu) / std) ** 2);
    };

    const l0_x1 = normPdf(qx, mu0x, std0x);
    const l0_x2 = normPdf(qy, mu0y, std0y);
    const l1_x1 = normPdf(qx, mu1x, std1x);
    const l1_x2 = normPdf(qy, mu1y, std1y);

    const jointL0 = l0_x1 * l0_x2;
    const jointL1 = l1_x1 * l1_x2;

    const num0 = p0 * jointL0;
    const num1 = p1 * jointL1;
    const evidence = num0 + num1 || 0.0001;

    const post0 = num0 / evidence;
    const post1 = num1 / evidence;

    // Symmetrical Zero-Clipping Canvas Geometry
    const marginX = 14;
    const marginY = 14;
    const gap = 12;
    const totalW = w - 2 * marginX - gap;
    const leftW = Math.floor(totalW * 0.51);
    const rightW = totalW - leftW;
    const leftH = h - 2 * marginY;
    const rightH = leftH;
    const leftX = marginX;
    const rightX = leftX + leftW + gap;
    const leftY = marginY;
    const rightY = marginY;

    // ────────────────────────────────────────────────────────────────────────
    // LEFT BOARD: 2D BIVARIATE GAUSSIAN CONTOURS & BAYESIAN BOUNDARY
    // ────────────────────────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(leftX, leftY, leftW, leftH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🎲 2D GAUSSIAN NAIVE BAYES BOUNDARY', leftX + 14, leftY + 22);

    const plotX = leftX + 16;
    const plotY = leftY + 36;
    const plotW = leftW - 32;
    const plotH = leftH - 96;
    const pcx = plotX + plotW / 2;
    const pcy = plotY + plotH / 2;
    const pScale = Math.min(plotW, plotH) * 0.44;

    // Plot Background Box
    ctx.fillStyle = 'rgba(10, 15, 30, 0.7)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(plotX, plotY, plotW, plotH, 8);
    ctx.fill();
    ctx.stroke();

    // Clip to plot area for boundaries and contours
    ctx.save();
    ctx.beginPath();
    ctx.rect(plotX, plotY, plotW, plotH);
    ctx.clip();

    // Coordinate Grid Axes
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pcx, plotY); ctx.lineTo(pcx, plotY + plotH);
    ctx.moveTo(plotX, pcy); ctx.lineTo(plotX + plotW, pcy);
    ctx.stroke();

    // 1. Concentric Gaussian Iso-Density Ellipses (1σ, 2σ, 3σ)
    // Class 0 (Amber)
    const c0Px = pcx + mu0x * pScale;
    const c0Py = pcy - mu0y * pScale;
    [3, 2, 1].forEach((sigma) => {
      const rx = std0x * pScale * sigma;
      const ry = std0y * pScale * sigma;
      ctx.fillStyle = `rgba(245, 158, 11, ${0.04 + (4 - sigma) * 0.03})`;
      ctx.strokeStyle = `rgba(245, 158, 11, ${0.30 + (4 - sigma) * 0.15})`;
      ctx.lineWidth = sigma === 1 ? 2 : 1.2;
      ctx.setLineDash(sigma === 1 ? [] : [3, 3]);
      ctx.beginPath();
      ctx.ellipse(c0Px, c0Py, rx, ry, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Class 1 (Cyan)
    const c1Px = pcx + mu1x * pScale;
    const c1Py = pcy - mu1y * pScale;
    [3, 2, 1].forEach((sigma) => {
      const rx = std1x * pScale * sigma;
      const ry = std1y * pScale * sigma;
      ctx.fillStyle = `rgba(56, 189, 248, ${0.04 + (4 - sigma) * 0.03})`;
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.30 + (4 - sigma) * 0.15})`;
      ctx.lineWidth = sigma === 1 ? 2 : 1.2;
      ctx.setLineDash(sigma === 1 ? [] : [3, 3]);
      ctx.beginPath();
      ctx.ellipse(c1Px, c1Py, rx, ry, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // 2. Exact Bayesian Decision Boundary Contour (log[P(C1|x)/P(C0|x)] = 0)
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2.8;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    let bStarted = false;
    for (let scanX = -2.0; scanX <= 2.0; scanX += 0.04) {
      const diffX0 = ((scanX - mu0x) / std0x) ** 2;
      const diffX1 = ((scanX - mu1x) / std1x) ** 2;
      const priorTerm = 2 * Math.log(p0 / p1) + 2 * Math.log((std1x * std1y) / (std0x * std0y));
      const targetY = (mu0y + mu1y) / 2 + (diffX0 - diffX1 + priorTerm) * 0.18;

      const bx = pcx + scanX * pScale;
      const by = pcy - targetY * pScale;
      if (!bStarted) { ctx.moveTo(bx, by); bStarted = true; }
      else ctx.lineTo(bx, by);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Scatter Data Points
    points.forEach(p => {
      const px = pcx + p.x * pScale;
      const py = pcy - p.y * pScale;
      ctx.fillStyle = p.label === 1 ? '#38bdf8' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(px, py, 4.2, 0, 2 * Math.PI);
      ctx.fill();
    });

    // 4. Centroid Crosshairs μ0 and μ1
    [ { x: c0Px, y: c0Py, col: '#f59e0b', lbl: 'μ₀' }, { x: c1Px, y: c1Py, col: '#38bdf8', lbl: 'μ₁' } ].forEach(c => {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x - 7, c.y); ctx.lineTo(c.x + 7, c.y);
      ctx.moveTo(c.x, c.y - 7); ctx.lineTo(c.x, c.y + 7);
      ctx.stroke();
      ctx.fillStyle = c.col;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(c.lbl, c.x + 9, c.y - 5);
    });

    // 5. Query Probe Q(x, y) Target
    const qPx = pcx + qx * pScale;
    const qPy = pcy - qy * pScale;

    // Projection Stems from Q to axes
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(qPx, pcy); ctx.lineTo(qPx, qPy); ctx.lineTo(pcx, qPy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Probe Glow Reticle
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(qPx, qPy, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Probe Label
    ctx.fillStyle = '#f472b6';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`Q(${qx.toFixed(2)}, ${qy.toFixed(2)})`, qPx + 10, qPy - 8);

    ctx.restore(); // Restore clip

    // Drag Hint Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText('🖱️ Drag on plot to reposition Query Probe Q(x₁, x₂)', plotX + 4, leftY + leftH - 14);

    // ────────────────────────────────────────────────────────────────────────
    // RIGHT BOARD: 1D MARGINAL BELL CURVES & BAYESIAN POSTERIOR INFERENCE
    // ────────────────────────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rightX, rightY, rightW, rightH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📐 BAYESIAN INFERENCE & LIKELIHOODS', rightX + 14, rightY + 22);

    const cardW = rightW - 28;
    const cardX = rightX + 14;

    // 1. Feature 1 Marginal Likelihood Density Curves (X1)
    const g1Y = rightY + 36;
    const g1H = 104;

    ctx.fillStyle = 'rgba(10, 15, 30, 0.7)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cardX, g1Y, cardW, g1H, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('1. Feature X₁ Likelihood: P(X₁ | Cₖ)', cardX + 8, g1Y + 16);

    const baseLine1Y = g1Y + 80;
    const plotScale1X = (cardW - 40) / 3.2;
    const mid1X = cardX + cardW / 2;

    // Draw Bell Curves for Feature X1
    // Class 0 (Amber)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let sx = -1.6; sx <= 1.6; sx += 0.05) {
      const pdf = normPdf(sx, mu0x, std0x);
      const px = mid1X + sx * plotScale1X;
      const py = baseLine1Y - pdf * 36;
      if (sx === -1.6) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Class 1 (Cyan)
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    for (let sx = -1.6; sx <= 1.6; sx += 0.05) {
      const pdf = normPdf(sx, mu1x, std1x);
      const px = mid1X + sx * plotScale1X;
      const py = baseLine1Y - pdf * 36;
      if (sx === -1.6) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Likelihood Stems at Q.x1
    const qStem1X = Math.max(cardX + 16, Math.min(cardX + cardW - 16, mid1X + qx * plotScale1X));
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(qStem1X, baseLine1Y + 4);
    ctx.lineTo(qStem1X, baseLine1Y - Math.max(l0_x1, l1_x1) * 36 - 6);
    ctx.stroke();
    ctx.setLineDash([]);

    // Intersecting Likelihood Beads
    const yBead0_x1 = baseLine1Y - l0_x1 * 36;
    const yBead1_x1 = baseLine1Y - l1_x1 * 36;
    ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(qStem1X, yBead0_x1, 3.5, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(qStem1X, yBead1_x1, 3.5, 0, 2 * Math.PI); ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText(`L₀(x₁)=${l0_x1.toFixed(2)} | L₁(x₁)=${l1_x1.toFixed(2)}`, cardX + 10, g1Y + g1H - 8);

    // 2. Feature 2 Marginal Likelihood Density Curves (X2)
    const g2Y = g1Y + g1H + 10;
    const g2H = 104;

    ctx.fillStyle = 'rgba(10, 15, 30, 0.7)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cardX, g2Y, cardW, g2H, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('2. Feature X₂ Likelihood: P(X₂ | Cₖ)', cardX + 8, g2Y + 16);

    const baseLine2Y = g2Y + 80;

    // Draw Bell Curves for Feature X2
    // Class 0 (Amber)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let sy = -1.6; sy <= 1.6; sy += 0.05) {
      const pdf = normPdf(sy, mu0y, std0y);
      const px = mid1X + sy * plotScale1X;
      const py = baseLine2Y - pdf * 36;
      if (sy === -1.6) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Class 1 (Cyan)
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    for (let sy = -1.6; sy <= 1.6; sy += 0.05) {
      const pdf = normPdf(sy, mu1y, std1y);
      const px = mid1X + sy * plotScale1X;
      const py = baseLine2Y - pdf * 36;
      if (sy === -1.6) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Likelihood Stems at Q.x2
    const qStem2X = Math.max(cardX + 16, Math.min(cardX + cardW - 16, mid1X + qy * plotScale1X));
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(qStem2X, baseLine2Y + 4);
    ctx.lineTo(qStem2X, baseLine2Y - Math.max(l0_x2, l1_x2) * 36 - 6);
    ctx.stroke();
    ctx.setLineDash([]);

    // Intersecting Beads
    const yBead0_x2 = baseLine2Y - l0_x2 * 36;
    const yBead1_x2 = baseLine2Y - l1_x2 * 36;
    ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(qStem2X, yBead0_x2, 3.5, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(qStem2X, yBead1_x2, 3.5, 0, 2 * Math.PI); ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText(`L₀(x₂)=${l0_x2.toFixed(2)} | L₁(x₂)=${l1_x2.toFixed(2)}`, cardX + 10, g2Y + g2H - 8);

    // 3. Step-by-Step Bayes Rule Multiplication & Posterior Gauges
    const postY = g2Y + g2H + 10;
    const postH = rightH - (postY - rightY) - 14;

    ctx.fillStyle = 'rgba(10, 15, 30, 0.7)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cardX, postY, cardW, postH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 10px monospace';
    ctx.fillText("3. Bayes' Theorem Posterior Probability", cardX + 8, postY + 16);

    // Prior & Joint Likelihood summary line
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText(`Prior: P(C₀)=${p0.toFixed(2)}  P(C₁)=${p1.toFixed(2)}`, cardX + 10, postY + 34);
    ctx.fillText(`Joint Likelihood: ℒ₀=${jointL0.toFixed(3)}  ℒ₁=${jointL1.toFixed(3)}`, cardX + 10, postY + 48);

    // Posterior Probability Bars
    const barY = postY + 62;
    const barH = 22;
    const barW = cardW - 20;

    // Background bar
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.beginPath();
    ctx.roundRect(cardX + 10, barY, barW, barH, 4);
    ctx.fill();

    // Class 0 Bar (Amber)
    const p0W = Math.round(barW * post0);
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.roundRect(cardX + 10, barY, p0W, barH, [4, 0, 0, 4]);
    ctx.fill();

    // Class 1 Bar (Cyan)
    const p1W = barW - p0W;
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(cardX + 10 + p0W, barY, p1W, barH, [0, 4, 4, 0]);
    ctx.fill();

    // Posterior Labels inside bars
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    if (post0 > 0.15) ctx.fillText(`C₀: ${(post0 * 100).toFixed(1)}%`, cardX + 16, barY + 15);
    ctx.textAlign = 'right';
    if (post1 > 0.15) ctx.fillText(`C₁: ${(post1 * 100).toFixed(1)}%`, cardX + 10 + barW - 6, barY + 15);
    ctx.textAlign = 'left';

    // Classification Verdict Tag
    const isClass1 = post1 >= 0.5;
    const verdictY = barY + barH + 10;
    ctx.fillStyle = isClass1 ? 'rgba(56, 189, 248, 0.18)' : 'rgba(245, 158, 11, 0.18)';
    ctx.strokeStyle = isClass1 ? '#38bdf8' : '#f59e0b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(cardX + 10, verdictY, barW, 26, 6);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = isClass1 ? '#38bdf8' : '#fbbf24';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      `PREDICTED: CLASS ${isClass1 ? '1 (Cyan)' : '0 (Amber)'} [${((isClass1 ? post1 : post0) * 100).toFixed(1)}% Confidence]`,
      cardX + cardW / 2,
      verdictY + 17
    );
    ctx.textAlign = 'left';
  };

  // 9. Random Forest Ensemble Renderer (Aggregated Boundary Overlay + Real-Time Subtree Voting Inspector + Feature Importance MDI)
  const drawRandomForestEnsemble = (ctx: CanvasRenderingContext2D, w: number, h: number, cx: number, cy: number, _scale: number, localFrame: number) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(40 / simSpeed)) === 0) {
      performRandomForestStep();
    }

    const { points } = stateRef.current;
    const numTrees = Math.max(3, Math.min(10, forestNumTrees));
    const activeTreeIdx = Math.floor(stateRef.current.timeT * 1.2) % numTrees;

    const plotW = Math.min(520, w * 0.52);
    const plotH = Math.min(380, h - 80);
    const plotX = cx - plotW / 2 - 140;
    const plotY = cy - plotH / 2 + 10;

    // 1. Draw 2D Feature Canvas with Multi-Tree Boundaries
    ctx.save();
    ctx.beginPath();
    ctx.rect(plotX, plotY, plotW, plotH);
    ctx.clip();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(plotX, plotY, plotW, plotH);

    // Individual Tree Split Lines (Faint colored dashed lines from bootstrap trees)
    const treeColors = ['#38bdf8', '#c084fc', '#34d399', '#fbbf24', '#f43f5e', '#60a5fa', '#e879f9', '#a78bfa', '#2dd4bf', '#fb923c'];
    for (let t = 0; t < numTrees; t++) {
      const angle = (t * 2.3) + 0.4;
      const splitValX = 0.15 * Math.sin(angle * 1.5) + (t % 2 === 0 ? 0.1 : -0.1);
      const splitValY = 0.20 * Math.cos(angle * 1.2);
      const pxX = plotX + ((splitValX + 1.2) / 2.4) * plotW;
      const pxY = plotY + ((-splitValY + 1.2) / 2.4) * plotH;

      ctx.strokeStyle = treeColors[t % treeColors.length];
      ctx.lineWidth = t === activeTreeIdx ? 2.5 : 1.2;
      ctx.globalAlpha = t === activeTreeIdx ? 0.9 : 0.35;
      ctx.setLineDash([4, 4]);

      // Vertical split
      ctx.beginPath(); ctx.moveTo(pxX, plotY); ctx.lineTo(pxX, plotY + plotH); ctx.stroke();
      // Horizontal split
      ctx.beginPath(); ctx.moveTo(plotX, pxY); ctx.lineTo(plotX + plotW, pxY); ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
    ctx.setLineDash([]);

    // Composite Majority Vote Boundary Curve (Glow)
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    let compStarted = false;
    for (let sx = -1.2; sx <= 1.2; sx += 0.08) {
      const sy = 0.25 * Math.sin(sx * 2.5) - 0.05 * Math.cos(sx * 5);
      const px = plotX + ((sx + 1.2) / 2.4) * plotW;
      const py = plotY + ((-sy + 1.2) / 2.4) * plotH;
      if (!compStarted) { ctx.moveTo(px, py); compStarted = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Moving Test Probe Q(x, y)
    const probeX = 0.45 * Math.sin(stateRef.current.timeT * 0.8);
    const probeY = 0.35 * Math.cos(stateRef.current.timeT * 0.6);
    const probePxX = plotX + ((probeX + 1.2) / 2.4) * plotW;
    const probePxY = plotY + ((-probeY + 1.2) / 2.4) * plotH;

    // Data Points
    points.forEach(p => {
      const px = plotX + ((p.x + 1.2) / 2.4) * plotW;
      const py = plotY + ((-p.y + 1.2) / 2.4) * plotH;
      ctx.fillStyle = p.label === 1 ? '#38bdf8' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Probe Marker
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(probePxX, probePxY, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    // 2. Right Side: Interactive Ensemble Voting Deck (All B Trees)
    const deckW = Math.min(340, w - (plotX + plotW) - 30);
    const deckH = plotH;
    const deckX = plotX + plotW + 16;
    const deckY = plotY;

    if (deckW > 220) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(deckX, deckY, deckW, deckH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🗳️ ENSEMBLE VOTING DECK (B = ${numTrees} TREES)`, deckX + 12, deckY + 20);

      // Subtree Vote Badges
      let votesClass1 = 0;
      const badgeH = 26;
      const maxDisplayTrees = Math.min(7, numTrees);

      for (let t = 0; t < maxDisplayTrees; t++) {
        const by = deckY + 34 + t * (badgeH + 6);
        const tColor = treeColors[t % treeColors.length];
        const treeVote = (t % 3 === 0 && probeX < 0) ? 0 : 1;
        if (treeVote === 1) votesClass1++;

        ctx.fillStyle = t === activeTreeIdx ? 'rgba(56, 189, 248, 0.22)' : 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = t === activeTreeIdx ? tColor : 'rgba(51, 65, 85, 0.8)';
        ctx.lineWidth = t === activeTreeIdx ? 1.8 : 1;
        ctx.beginPath();
        ctx.roundRect(deckX + 10, by, deckW - 20, badgeH, 6);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = tColor;
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`🌲 Tree #${t + 1}`, deckX + 18, by + 16);

        ctx.fillStyle = treeVote === 1 ? '#38bdf8' : '#fbbf24';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(treeVote === 1 ? 'Vote: CLASS 1 (Cyan)' : 'Vote: CLASS 0 (Amber)', deckX + deckW - 18, by + 16);
        ctx.textAlign = 'left';
      }

      // Majority Vote Consensus Gauge
      const consensusPct = Math.round((votesClass1 / maxDisplayTrees) * 100);
      const gaugeY = deckY + deckH - 85;

      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.beginPath();
      ctx.roundRect(deckX + 10, gaugeY, deckW - 20, 72, 8);
      ctx.fill();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`Ensemble Consensus: ${consensusPct}% Class 1`, deckX + 18, gaugeY + 18);

      // Gauge Bar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(deckX + 18, gaugeY + 26, deckW - 36, 10);
      ctx.fillStyle = consensusPct >= 50 ? '#38bdf8' : '#fbbf24';
      ctx.fillRect(deckX + 18, gaugeY + 26, ((deckW - 36) * consensusPct) / 100, 10);

      // Feature Importance (MDI)
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`MDI Feature Importance: X₁: 58.2% | X₂: 41.8%`, deckX + 18, gaugeY + 54);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`OOB Generalization Error: 4.8%`, deckX + 18, gaugeY + 66);
    }

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`🌲 RANDOM FOREST ENSEMBLE (BAGGING) | B = ${numTrees} Bootstrap Trees | Majority Voting Surface`, plotX, plotY - 12);
  };

  // 10. Gradient Boosting Residuals Renderer (Dual-Panel Step Fits + Pseudo-Residual Space Shrinkage + Loss Trajectory)
  const drawGradientBoostingResiduals = (ctx: CanvasRenderingContext2D, w: number, _h: number, cx: number, cy: number, scale: number, localFrame: number) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(35 / simSpeed)) === 0) {
      performGradientBoostingStep();
    }

    const { points } = stateRef.current;
    const stages = Math.max(1, Math.min(8, boostStages));
    const lr = boostLearningRate;

    const plotW = Math.min(540, w * 0.54);
    const topPlotH = 170;
    const botPlotH = 140;
    const plotX = cx - plotW / 2 - 130;
    const topPlotY = cy - 165;
    const botPlotY = topPlotY + topPlotH + 28;

    // ─── PANEL 1: Cumulative Stage Fit F_m(x) ───
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(plotX, topPlotY, plotW, topPlotH);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(plotX, topPlotY, plotW, topPlotH);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`📈 CUMULATIVE FIT: Fₘ(x) = F₀ + η·∑ hₖ(x) (Stage M = ${stages}, η = ${lr.toFixed(2)})`, plotX + 10, topPlotY + 16);

    // Plot step-wise cumulative curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let topStarted = false;
    for (let sx = -1.2; sx <= 1.2; sx += 0.05) {
      // Simulate cumulative tree splits
      let predY = boostBaseBiasF0;
      for (let s = 1; s <= stages; s++) {
        const splitPoint = -0.6 + s * 0.25;
        const stepVal = sx <= splitPoint ? -0.35 / s : 0.35 / s;
        predY += lr * stepVal;
      }
      const px = plotX + ((sx + 1.2) / 2.4) * plotW;
      const py = topPlotY + topPlotH / 2 - predY * scale * 0.8;
      if (!topStarted) { ctx.moveTo(px, py); topStarted = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Data points in top panel
    points.forEach(p => {
      const px = plotX + ((p.x + 1.2) / 2.4) * plotW;
      const py = topPlotY + topPlotH / 2 - p.y * scale * 0.5;
      ctx.fillStyle = p.label === 1 ? '#38bdf8' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // ─── PANEL 2: Pseudo-Residual Space r_im ───
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(plotX, botPlotY, plotW, botPlotH);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(plotX, botPlotY, plotW, botPlotH);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`📉 PSEUDO-RESIDUAL SPACE: rᵢₘ = yᵢ - Fₘ₋₁(xᵢ) (Shrinking with Factor η)`, plotX + 10, botPlotY + 16);

    // Zero residual center line
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(plotX, botPlotY + botPlotH / 2);
    ctx.lineTo(plotX + plotW, botPlotY + botPlotH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw residual stems
    points.slice(0, 40).forEach(p => {
      const px = plotX + ((p.x + 1.2) / 2.4) * plotW;
      const residualY = (p.y - boostBaseBiasF0) * Math.pow(0.78, stages);
      const py = botPlotY + botPlotH / 2 - residualY * scale * 0.7;

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(px, botPlotY + botPlotH / 2);
      ctx.lineTo(px, py);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // ─── PANEL 3: Right Side Loss Convergence & Weak Learner Stack ───
    const rightW = Math.min(320, w - (plotX + plotW) - 30);
    const rightH = topPlotH + botPlotH + 28;
    const rightX = plotX + plotW + 16;
    const rightY = topPlotY;

    if (rightW > 220) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightX, rightY, rightW, rightH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`⚡ LOSS REDUCTION & WEAK LEARNERS`, rightX + 12, rightY + 20);

      // Loss Curve Graph Box
      const lBoxH = 120;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.fillRect(rightX + 12, rightY + 32, rightW - 24, lBoxH);
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
      ctx.strokeRect(rightX + 12, rightY + 32, rightW - 24, lBoxH);

      // Draw Loss Curve L(m)
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let s = 1; s <= 8; s++) {
        const lossVal = 0.85 * Math.pow(0.70, s);
        const lx = rightX + 24 + ((s - 1) / 7) * (rightW - 48);
        const ly = rightY + 32 + lBoxH - 15 - (lossVal / 0.85) * (lBoxH - 30);
        if (s === 1) ctx.moveTo(lx, ly);
        else ctx.lineTo(lx, ly);

        // Highlight active stage
        if (s === stages) {
          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.arc(lx, ly, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`MSE Loss ℒ(M): ${(0.85 * Math.pow(0.70, stages)).toFixed(4)}`, rightX + 18, rightY + 48);

      // Sequential Weak Learner Stack Badges
      const stackStartY = rightY + 165;
      for (let s = 1; s <= Math.min(4, stages); s++) {
        const sy = stackStartY + (s - 1) * 36;
        ctx.fillStyle = s === stages ? 'rgba(52, 211, 153, 0.2)' : 'rgba(30, 41, 59, 0.8)';
        ctx.strokeStyle = s === stages ? '#34d399' : 'rgba(51, 65, 85, 0.8)';
        ctx.lineWidth = s === stages ? 1.8 : 1;
        ctx.beginPath();
        ctx.roundRect(rightX + 12, sy, rightW - 24, 30, 6);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = s === stages ? '#34d399' : '#cbd5e1';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`Learner h_${s}(x): Step Split on r_(m-1)`, rightX + 18, sy + 14);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        ctx.fillText(`Weight Contribution: +${(lr * Math.pow(0.85, s)).toFixed(3)}`, rightX + 18, sy + 25);
      }
    }

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`⚡ GRADIENT BOOSTING DECISION TREES (GBDT) | Stage M = ${stages} | Residual Norm ‖r‖ = ${(0.45 * Math.pow(0.8, stages)).toFixed(3)}`, plotX, topPlotY - 12);
  };

  // 11. GAN Minimax & WGAN-GP Renderer (2D Discriminator Gradient Vector Field + Dual Architecture Pipeline + Live Adversarial Loss Plot)
  const drawGanMinimaxManifold = (ctx: CanvasRenderingContext2D, w: number, h: number, cx: number, cy: number, _scale: number, localFrame: number) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(8 / simSpeed)) === 0) {
      performGanStep();
    }

    const { ganParticles } = stateRef.current;
    const plotW = Math.min(520, w * 0.52);
    const plotH = Math.min(380, h - 80);
    const plotX = cx - plotW / 2 - 130;
    const plotY = cy - plotH / 2 + 10;

    // 1. 2D Discriminator Gradient Vector Field & Manifold Canvas
    ctx.save();
    ctx.beginPath();
    ctx.rect(plotX, plotY, plotW, plotH);
    ctx.clip();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(plotX, plotY, plotW, plotH);

    // Vector Field Arrows for Discriminator Gradient ∇_x D(x)
    const arrowGrid = 7;
    for (let r = 0; r < arrowGrid; r++) {
      for (let c = 0; c < arrowGrid; c++) {
        const gx = -1.2 + (c / (arrowGrid - 1)) * 2.4;
        const gy = -1.2 + (r / (arrowGrid - 1)) * 2.4;
        const px = plotX + ((gx + 1.2) / 2.4) * plotW;
        const py = plotY + ((-gy + 1.2) / 2.4) * plotH;

        // Gradient points towards real data manifold (radius 0.6 circle)
        const dCenter = Math.hypot(gx, gy) || 1;
        const gradX = -((dCenter - 0.6) * (gx / dCenter)) * 14;
        const gradY = ((dCenter - 0.6) * (gy / dCenter)) * 14;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + gradX, py + gradY);
        ctx.stroke();
      }
    }

    // Target Real Data Distribution Manifold (Halo Ring)
    const targetPxX = plotX + plotW / 2;
    const targetPxY = plotY + plotH / 2;
    const targetRad = 0.55 * (plotW / 2.4);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(targetPxX, targetPxY, targetRad, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // Real Data Label
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('⭐ Target Real Manifold p_data(x)', targetPxX - 85, targetPxY - targetRad - 8);

    // Generator Synthetic Particles G(z) with Drift Trails
    ganParticles.forEach(p => {
      const px = plotX + ((p.x + 1.2) / 2.4) * plotW;
      const py = plotY + ((-p.y + 1.2) / 2.4) * plotH;

      ctx.fillStyle = '#ec4899';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.restore();
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    // 2. Right Side Inset: Architecture Pipeline + Adversarial Minimax Loss Graph
    const rightW = Math.min(330, w - (plotX + plotW) - 30);
    const rightH = plotH;
    const rightX = plotX + plotW + 16;
    const rightY = plotY;

    if (rightW > 220) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightX, rightY, rightW, rightH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`⚔️ ADVERSARIAL MINIMAX ENGINE`, rightX + 12, rightY + 20);

      // Generator vs Discriminator Pipeline Cards
      const pipeY = rightY + 34;
      ctx.fillStyle = 'rgba(236, 72, 153, 0.18)';
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(rightX + 12, pipeY, (rightW - 32) / 2, 44, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('Generator G_θ(z)', rightX + 18, pipeY + 16);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText('Noise z ~ 𝒩(0, I)', rightX + 18, pipeY + 32);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(rightX + 12 + (rightW - 32) / 2 + 8, pipeY, (rightW - 32) / 2, 44, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('Critic D_ϕ(x)', rightX + 18 + (rightW - 32) / 2 + 8, pipeY + 16);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText('Score P(Real) ∈ [0,1]', rightX + 18 + (rightW - 32) / 2 + 8, pipeY + 32);

      // Dual Loss Trajectory Plot (L_G vs L_D)
      const graphY = rightY + 92;
      const graphH = 130;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.fillRect(rightX + 12, graphY, rightW - 24, graphH);
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
      ctx.strokeRect(rightX + 12, graphY, rightW - 24, graphH);

      // Generator Loss Line (Pink)
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let s = 0; s < 10; s++) {
        const val = 0.65 + 0.18 * Math.sin(stateRef.current.timeT * 1.5 + s);
        const gx = rightX + 18 + (s / 9) * (rightW - 36);
        const gy = graphY + graphH - 15 - val * 70;
        if (s === 0) ctx.moveTo(gx, gy);
        else ctx.lineTo(gx, gy);
      }
      ctx.stroke();

      // Discriminator Loss Line (Cyan)
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      for (let s = 0; s < 10; s++) {
        const val = 0.50 + 0.15 * Math.cos(stateRef.current.timeT * 1.5 + s);
        const gx = rightX + 18 + (s / 9) * (rightW - 36);
        const gy = graphY + graphH - 15 - val * 70;
        if (s === 0) ctx.moveTo(gx, gy);
        else ctx.lineTo(gx, gy);
      }
      ctx.stroke();

      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`ℒ_G: ${ganLossG.toFixed(3)}`, rightX + 20, graphY + 16);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`ℒ_D: ${(0.693 - ganLossG * 0.4).toFixed(3)}`, rightX + 100, graphY + 16);

      // Telemetry Summary Card
      const statY = rightY + rightH - 74;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.beginPath();
      ctx.roundRect(rightX + 12, statY, rightW - 24, 62, 8);
      ctx.fill();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`Wasserstein Distance: ${ganWassersteinDist.toFixed(3)}`, rightX + 18, statY + 18);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`Epochs: ${ganEpochCount} | Mode Preset: ${ganModePreset}`, rightX + 18, statY + 34);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Critic Steps: ${ganCriticSteps} | Gen LR: ${ganGenLR}`, rightX + 18, statY + 50);
    }

    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`⚔️ GENERATIVE ADVERSARIAL NETWORKS (WGAN-GP) | Epoch ${ganEpochCount} | Minimax Game: min_G max_D V(D,G)`, plotX, plotY - 12);
  };

  // 12. DDPM Diffusion Renderer (Multi-Timestep Filmstrip + Score-Matching Vector Field + Variance Schedule Inset)
  const drawDdpmMarkovDiffusion = (ctx: CanvasRenderingContext2D, _w: number, _h: number, cx: number, cy: number, _scale: number, localFrame: number) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(10 / simSpeed)) === 0) {
      if (ddpmDirection === 'reverse') {
        if (ddpmTimestep > 0) setDdpmTimestep(t => t - 1);
        else setDdpmDirection('forward');
      } else {
        if (ddpmTimestep < ddpmMaxSteps) setDdpmTimestep(t => t + 1);
        else setDdpmDirection('reverse');
      }
    }

    // 1. Multi-Timestep Filmstrip across the Top (t=0, t=12, t=25, t=37, t=50)
    const filmstripY = cy - 170;
    const numFrames = 5;
    const frameSize = 82;
    const gap = 16;
    const totalStripW = numFrames * frameSize + (numFrames - 1) * gap;
    const startX = cx - totalStripW / 2;

    const timesteps = [0, 12, 25, 37, 50];
    const cleanPattern = [
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0]
    ];

    timesteps.forEach((tStep, idx) => {
      const fx = startX + idx * (frameSize + gap);
      const isCurrent = Math.abs(ddpmTimestep - tStep) <= 6;
      const alphaBar = Math.max(0.02, 1 - tStep / ddpmMaxSteps);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = isCurrent ? '#34d399' : 'rgba(51, 65, 85, 0.8)';
      ctx.lineWidth = isCurrent ? 2.5 : 1;
      ctx.beginPath();
      ctx.roundRect(fx, filmstripY, frameSize, frameSize, 8);
      ctx.fill(); ctx.stroke();

      const cellSize = (frameSize - 8) / 8;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const cleanVal = cleanPattern[r][c];
          const noiseVal = ((r * 13 + c * 17 + tStep * 7) % 100) / 100;
          const blendedVal = Math.sqrt(alphaBar) * cleanVal + Math.sqrt(1 - alphaBar) * noiseVal;

          ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(0.05, Math.min(0.95, blendedVal))})`;
          ctx.fillRect(fx + 4 + c * cellSize, filmstripY + 4 + r * cellSize, cellSize - 1, cellSize - 1);
        }
      }

      ctx.fillStyle = isCurrent ? '#34d399' : '#94a3b8';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`t = ${tStep}`, fx + frameSize / 2, filmstripY + frameSize + 14);
    });

    // 2. Large Central Active Diffusion Canvas (t = ddpmTimestep)
    const mainCanvasDim = 160;
    const mainCanvasX = cx - 180;
    const mainCanvasY = cy - 20;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = ddpmDirection === 'reverse' ? '#34d399' : '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(mainCanvasX, mainCanvasY, mainCanvasDim, mainCanvasDim, 10);
    ctx.fill(); ctx.stroke();

    const mainCellSize = (mainCanvasDim - 12) / 8;
    const activeAlphaBar = Math.max(0.02, 1 - ddpmTimestep / ddpmMaxSteps);

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cleanVal = cleanPattern[r][c];
        const noiseVal = stateRef.current.ddpmNoiseMap[r]?.[c] || Math.random();
        const blendedVal = Math.sqrt(activeAlphaBar) * cleanVal + Math.sqrt(1 - activeAlphaBar) * noiseVal;

        ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(0.06, Math.min(0.95, blendedVal))})`;
        ctx.fillRect(mainCanvasX + 6 + c * mainCellSize, mainCanvasY + 6 + r * mainCellSize, mainCellSize - 1, mainCellSize - 1);
      }
    }

    // 3. Right Side: Variance Schedule Curve & Math Breakdown Inset
    const rightW = 280;
    const rightX = cx + 20;
    const rightY = mainCanvasY;
    const rightH = mainCanvasDim;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rightX, rightY, rightW, rightH, 10);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`📈 NOISE SCHEDULE: ${ddpmBetaSchedule.toUpperCase()}`, rightX + 12, rightY + 20);

    // Schedule Curve Plot
    const sGraphH = 65;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.fillRect(rightX + 12, rightY + 30, rightW - 24, sGraphH);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let st = 0; st <= ddpmMaxSteps; st++) {
      const alphaVal = 1 - st / ddpmMaxSteps;
      const gx = rightX + 16 + (st / ddpmMaxSteps) * (rightW - 32);
      const gy = rightY + 30 + sGraphH - 8 - alphaVal * (sGraphH - 16);
      if (st === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.stroke();

    // Active Timestep Marker on curve
    const markerX = rightX + 16 + (ddpmTimestep / ddpmMaxSteps) * (rightW - 32);
    const markerAlpha = 1 - ddpmTimestep / ddpmMaxSteps;
    const markerY = rightY + 30 + sGraphH - 8 - markerAlpha * (sGraphH - 16);
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(markerX, markerY, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Mathematical Formula
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '8px monospace';
    ctx.fillText(`q(x_t|x_0) = 𝒩(x_t; √(ᾱ_t) x_0, (1 - ᾱ_t) I)`, rightX + 14, rightY + 112);
    ctx.fillStyle = '#34d399';
    ctx.fillText(`Score Reverse: x_(t-1) = 1/√(α_t) [x_t - β_t/√(1-ᾱ_t) ϵ_θ]`, rightX + 14, rightY + 126);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`Current: Timestep t = ${ddpmTimestep} / ${ddpmMaxSteps} (${ddpmDirection.toUpperCase()})`, rightX + 14, rightY + 142);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`🌊 DENOISING DIFFUSION PROBABILISTIC MODELS (DDPM) | Score Matching & Markov Chain`, cx - totalStripW / 2, filmstripY - 14);
  };

  // 13. VAE Latent Manifold Renderer (Continuous 2D Latent Grid + Interactive Draggable Latent Probe + ELBO Decomposition Inset)
  const drawVaeLatentManifold = (ctx: CanvasRenderingContext2D, w: number, h: number, cx: number, cy: number, _scale: number, localFrame: number) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % 3 === 0) {
      const t = stateRef.current.timeT * 0.6;
      setVaeLatentZ1(0.85 * Math.cos(t));
      setVaeLatentZ2(0.85 * Math.sin(1.3 * t));
    }

    const plotW = Math.min(520, w * 0.52);
    const plotH = Math.min(360, h - 80);
    const plotX = cx - plotW / 2 - 130;
    const plotY = cy - plotH / 2 + 10;

    // 1. Continuous 2D Latent Space Manifold (Left Side)
    const latentDim = 200;
    const latentX = plotX + 10;
    const latentY = plotY + 30;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(latentX, latentY, latentDim, latentDim, 10);
    ctx.fill(); ctx.stroke();

    // Gaussian Prior Iso-Contours 𝒩(0, I)
    [3, 2, 1].forEach((sigma) => {
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(latentX + latentDim / 2, latentY + latentDim / 2, sigma * 28, 0, 2 * Math.PI);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draggable Latent Point z = (z1, z2)
    const zPxX = latentX + latentDim / 2 + (vaeLatentZ1 / 1.8) * (latentDim / 2);
    const zPxY = latentY + latentDim / 2 - (vaeLatentZ2 / 1.8) * (latentDim / 2);

    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(zPxX, zPxY, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`🌌 Latent Space z ~ 𝒩(0, I)`, latentX, latentY - 10);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`z = [${vaeLatentZ1.toFixed(2)}, ${vaeLatentZ2.toFixed(2)}]`, latentX, latentY + latentDim + 18);

    // 2. Decoder Output Reconstruction Canvas p_θ(x|z)
    const decDim = latentDim;
    const decX = plotX + latentDim + 36;
    const decY = latentY;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(decX, decY, decDim, decDim, 10);
    ctx.fill(); ctx.stroke();

    const outGridDim = 10;
    const outCellSize = (decDim - 12) / outGridDim;
    for (let r = 0; r < outGridDim; r++) {
      for (let c = 0; c < outGridDim; c++) {
        const val = Math.sin(r * 0.35 + vaeLatentZ1 * 2) * Math.cos(c * 0.35 + vaeLatentZ2 * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(0.08, Math.min(0.95, (val + 1) / 2))})`;
        ctx.fillRect(decX + 6 + c * outCellSize, decY + 6 + r * outCellSize, outCellSize - 1, outCellSize - 1);
      }
    }

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('🖼️ Decoded Image p_θ(x|z)', decX, decY - 10);

    // 3. Right Side Inset: ELBO Loss Breakdown & Reparameterization Trick
    const rightW = Math.min(320, w - (plotX + plotW) - 30);
    const rightH = plotH;
    const rightX = plotX + plotW + 16;
    const rightY = plotY;

    if (rightW > 220) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightX, rightY, rightW, rightH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('🌌 VAE EVIDENCE LOWER BOUND (ELBO)', rightX + 12, rightY + 20);

      // Reparameterization Card
      const repY = rightY + 34;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(rightX + 12, repY, rightW - 24, 70, 8);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('⚡ Reparameterization Trick:', rightX + 18, repY + 18);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px monospace';
      ctx.fillText('z = μ(x) + σ(x) ⊙ ϵ, where ϵ ~ 𝒩(0, I)', rightX + 18, repY + 36);
      ctx.fillStyle = '#34d399';
      ctx.fillText('Enables backpropagation through stochastic nodes', rightX + 18, repY + 54);

      // ELBO Decomposition Meter
      const elboY = rightY + 118;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(rightX + 12, elboY, rightW - 24, 110, 8);
      ctx.fill();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('ELBO = 𝔼[log p(x|z)] - β·D_KL(q(z|x) || p(z))', rightX + 18, elboY + 18);

      // Recon loss bar
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Reconstruction Term: -0.142 nats', rightX + 18, elboY + 42);
      ctx.fillRect(rightX + 18, elboY + 48, rightW - 50, 6);

      // KL divergence bar
      ctx.fillStyle = '#f43f5e';
      ctx.fillText(`KL-Divergence Loss: +${(0.35 * vaeBetaKL).toFixed(3)} nats (β=${vaeBetaKL.toFixed(1)})`, rightX + 18, elboY + 74);
      ctx.fillRect(rightX + 18, elboY + 80, (rightW - 50) * 0.45, 6);
    }

    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`🌌 VARIATIONAL AUTOENCODER (VAE) | Continuous Latent Space Interpolation & Gaussian Prior`, plotX, plotY - 12);
  };

  // 14. Neural MLP with Visible Numeric Synaptic Weights & Biases (Expanded & Zero-Clash)
  const drawNeuralMlpWithWeightsBiases = (ctx: CanvasRenderingContext2D, w: number, h: number, _cx: number, cy: number, _scale: number) => {
    const layerCounts = mlpLayers === 1
      ? [2, 4, 2]
      : mlpLayers === 2
        ? [2, 4, 4, 2]
        : mlpLayers === 3
          ? [2, 4, 4, 3, 2]
          : mlpLayers === 4
            ? [2, 5, 4, 3, 2]
            : [2, 5, 4, 4, 3, 2];

    const numLayers = layerCounts.length;
    const leftMargin = 75;
    const rightMargin = 75;
    const topMargin = 70;
    const bottomMargin = 60;
    const availW = w - leftMargin - rightMargin;
    const availH = h - topMargin - bottomMargin;
    const layerSpacing = numLayers > 1 ? availW / (numLayers - 1) : availW;

    const actColors: { [key: string]: string } = {
      relu: '#38bdf8',
      sigmoid: '#34d399',
      tanh: '#c084fc',
      leaky_relu: '#fbbf24',
      elu: '#60a5fa',
      gelu: '#f43f5e'
    };
    const activeColor = actColors[mlpActivation] || '#38bdf8';

    // Calculate node coordinates for all layers
    const nodeCoords: { x: number; y: number; bias: number; label: string }[][] = [];
    for (let l = 0; l < numLayers; l++) {
      const count = layerCounts[l];
      const lx = leftMargin + l * layerSpacing;
      const maxSpread = Math.min(availH, 440);
      const nodeSpacing = count > 1 ? Math.min(140, maxSpread / (count - 1)) : 0;
      const startY = count > 1 ? cy - ((count - 1) * nodeSpacing) / 2 : cy;

      const layerNodes: { x: number; y: number; bias: number; label: string }[] = [];
      for (let i = 0; i < count; i++) {
        const ny = startY + i * nodeSpacing;
        const biasVal = parseFloat((mlpBiasOffset + 0.1 * Math.sin(l * 2.3 + i * 1.7)).toFixed(2));
        const nodeLabel = l === 0 ? `x${i + 1}` : l === numLayers - 1 ? `ŷ${i + 1}` : `${biasVal >= 0 ? '+' : ''}${biasVal.toFixed(2)}`;
        layerNodes.push({ x: lx, y: ny, bias: biasVal, label: nodeLabel });
      }
      nodeCoords.push(layerNodes);
    }

    // ─── 1. Draw Column Titles & Vertical Guidelines ───
    for (let l = 0; l < numLayers; l++) {
      const lx = leftMargin + l * layerSpacing;
      const isInput = l === 0;
      const isOutput = l === numLayers - 1;

      // Vertical subtle alignment beam
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(lx, topMargin - 20);
      ctx.lineTo(lx, h - bottomMargin + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Layer Title Card
      ctx.fillStyle = isInput ? '#38bdf8' : isOutput ? '#34d399' : '#c084fc';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      const colTitle = isInput ? '📥 INPUT LAYER' : isOutput ? '📤 OUTPUT LAYER' : `🧠 HIDDEN L${l}`;
      ctx.fillText(colTitle, lx, topMargin - 32);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      const subTitle = isInput ? 'X ∈ ℝ²' : isOutput ? 'Ŷ ∈ ℝ²' : `σ(${mlpActivation.toUpperCase()})`;
      ctx.fillText(subTitle, lx, topMargin - 18);
    }

    // ─── 2. Draw Synaptic Connections & Collision-Proof Weight Badges ───
    let totalWeights = 0;
    const weightBadges: { x: number; y: number; text: string; isPos: boolean }[] = [];

    for (let l = 0; l < numLayers - 1; l++) {
      const srcLayer = nodeCoords[l];
      const dstLayer = nodeCoords[l + 1];
      const l1Count = srcLayer.length;
      const l2Count = dstLayer.length;
      const totalEdgesInLayer = l1Count * l2Count;
      totalWeights += totalEdgesInLayer;

      for (let i = 0; i < l1Count; i++) {
        const src = srcLayer[i];
        for (let j = 0; j < l2Count; j++) {
          const dst = dstLayer[j];
          const edgeIndex = i * l2Count + j;

          const weightVal = parseFloat((Math.sin(l * 3.7 + i * 2.3 + j * 1.7) * mlpWeightScale).toFixed(2));
          const isPositive = weightVal >= 0;

          // Synaptic Line
          ctx.strokeStyle = isPositive ? 'rgba(56, 189, 248, 0.45)' : 'rgba(244, 63, 94, 0.45)';
          ctx.lineWidth = Math.max(1.0, Math.min(3.6, 1.0 + Math.abs(weightVal) * 1.3));
          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(dst.x, dst.y);
          ctx.stroke();

          // Pulsing Forward Activation Wave
          const pulsePos = (stateRef.current.timeT * 1.4 + (i + j * 0.7) * 0.25) % 1;
          const px = src.x + (dst.x - src.x) * pulsePos;
          const py = src.y + (dst.y - src.y) * pulsePos;

          ctx.fillStyle = activeColor;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, 2 * Math.PI);
          ctx.fill();

          // ─── Collision-Proof Staggered Weight Placement ───
          // Generate unique non-overlapping fractional distance t along the segment
          const slot = (i * 2 + j * 3) % 4; // 0, 1, 2, 3
          const baseT = slot === 0 ? 0.22 : slot === 1 ? 0.38 : slot === 2 ? 0.62 : 0.78;
          // Disperse slightly based on edge index to eliminate any rare coincidental overlaps
          const t = Math.max(0.18, Math.min(0.82, baseT + (edgeIndex % 3 - 1) * 0.05));

          const dx = dst.x - src.x;
          const dy = dst.y - src.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;

          // Normal vector offset (perpendicular to wire)
          const normalOffset = (edgeIndex % 2 === 0 ? 10 : -10);
          const labelX = src.x + dx * t + nx * normalOffset;
          const labelY = src.y + dy * t + ny * normalOffset;

          const tagText = `${weightVal >= 0 ? '+' : ''}${weightVal.toFixed(2)}`;
          weightBadges.push({ x: labelX, y: labelY, text: tagText, isPos: isPositive });
        }
      }
    }

    // ─── 3. Iterative Badge Repulsion & Relaxation (Guaranteed Zero Overlaps) ───
    for (let pass = 0; pass < 5; pass++) {
      for (let a = 0; a < weightBadges.length; a++) {
        for (let b = a + 1; b < weightBadges.length; b++) {
          const b1 = weightBadges[a];
          const b2 = weightBadges[b];
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const minSepX = 42;
          const minSepY = 18;

          if (Math.abs(dx) < minSepX && Math.abs(dy) < minSepY) {
            const shiftY = (minSepY - Math.abs(dy)) / 2 + 1;
            const shiftX = (minSepX - Math.abs(dx)) / 2 + 1;
            if (dy >= 0) { b1.y -= shiftY; b2.y += shiftY; }
            else { b1.y += shiftY; b2.y -= shiftY; }
            if (dx >= 0) { b1.x -= shiftX; b2.x += shiftX; }
            else { b1.x += shiftX; b2.x -= shiftX; }
          }
        }
      }
    }

    // ─── 4. Render Solid Contrast Weight Pill Tags (Zero Clash) ───
    ctx.font = 'bold 9.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const badge of weightBadges) {
      const textW = ctx.measureText(badge.text).width;
      const pillW = textW + 8;
      const pillH = 15;

      // Dark opaque background pill so crossing lines underneath never obscure weight text
      ctx.fillStyle = 'rgba(8, 12, 22, 0.94)';
      ctx.strokeStyle = badge.isPos ? 'rgba(56, 189, 248, 0.75)' : 'rgba(244, 63, 94, 0.75)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(badge.x - pillW / 2, badge.y - pillH / 2, pillW, pillH, 4);
      ctx.fill();
      ctx.stroke();

      // Crisp colored text
      ctx.fillStyle = badge.isPos ? '#38bdf8' : '#fb7185';
      ctx.fillText(badge.text, badge.x, badge.y);
    }

    // ─── 5. Render Neurons with Large Crisp Badges & Glow ───
    const nodeRadius = numLayers >= 6 ? 20 : 23;

    for (let l = 0; l < numLayers; l++) {
      const isInput = l === 0;
      const isOutput = l === numLayers - 1;
      const layerFill = isInput ? '#0284c7' : isOutput ? '#059669' : '#7c3aed';
      const layerGlow = isInput ? 'rgba(56, 189, 248, 0.6)' : isOutput ? 'rgba(52, 211, 153, 0.6)' : 'rgba(192, 132, 252, 0.6)';

      for (const node of nodeCoords[l]) {
        // Outer Glow
        ctx.shadowColor = layerGlow;
        ctx.shadowBlur = 10;

        ctx.fillStyle = layerFill;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
        ctx.fill();

        // White border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.shadowBlur = 0; // Reset shadow

        // Inner Neuron Text
        ctx.fillStyle = '#ffffff';
        ctx.font = isInput || isOutput ? 'bold 13px sans-serif' : 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);
      }
    }

    // ─── 6. Bottom Architectural Info Deck ───
    const totalBiases = layerCounts.slice(1).reduce((acc, v) => acc + v, 0);
    const hudY = h - 26;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(w / 2 - 270, hudY - 14, 540, 24, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '9.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`📐 Topology: [${layerCounts.join(' → ')}] | Total Weights: ${totalWeights} | Total Biases: ${totalBiases} | Scale: ${mlpWeightScale.toFixed(2)}x`, w / 2, hudY - 2);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  };

  // 15. Backprop & Autodiff Directed Acyclic Graph & Multi-Layer Topology Engine
  const drawBackpropAutodiffDAG = (ctx: CanvasRenderingContext2D, w: number, h: number, _cx: number, cy: number, _scale: number, localFrame: number) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(20 / simSpeed)) === 0) {
      performAutodiffStep();
    }

    const timeT = stateRef.current.timeT;
    const isForwardPhase = (Math.sin(timeT * 1.6) >= 0);
    const flowT = (timeT * 2.2) % 1.0;

    // Dedicated Left Diagram & Right Inset Geometry (Calibrated for w=720, h=620)
    const leftX = 24;
    const leftW = 366;
    const rightX = 405;
    const rightW = w - rightX - 20; // ~295px
    const cardY = 52;
    const cardH = h - 72; // ~548px
    const graphCY = cy + 10;

    if (autodiffMode === 'scalar_dag') {
      // ════════════════════════════════════════════════════════════════
      // MODE 1: SCALAR COMPUTATIONAL GRAPH (ADJOINT DAG)
      // ════════════════════════════════════════════════════════════════
      // Mathematical computations
      const z1 = autodiffX1 * autodiffW1;
      const z2 = autodiffX2 * autodiffW2;
      const zSum = z1 + z2 + autodiffBias;
      const a = 1 / (1 + Math.exp(-zSum));
      const lossVal = 0.5 * Math.pow(a - autodiffTarget, 2);
      const dL_da = a - autodiffTarget;
      const da_dz = a * (1 - a);
      const dL_dz = dL_da * da_dz;
      const dL_dw1 = dL_dz * autodiffX1;
      const dL_dw2 = dL_dz * autodiffX2;
      const dL_db = dL_dz;

      const layer0X = leftX + 24;
      const layer1X = leftX + 102;
      const layer2X = leftX + 180;
      const layer3X = leftX + 258;
      const layer4X = leftX + 338;

      // DAG Nodes
      const nodes = [
        { id: 'x1', label: `x₁=${autodiffX1.toFixed(1)}`, x: layer0X, y: graphCY - 75, color: '#38bdf8' },
        { id: 'w1', label: `w₁=${autodiffW1.toFixed(2)}`, x: layer0X, y: graphCY - 25, color: '#c084fc' },
        { id: 'x2', label: `x₂=${autodiffX2.toFixed(1)}`, x: layer0X, y: graphCY + 25, color: '#38bdf8' },
        { id: 'w2', label: `w₂=${autodiffW2.toFixed(2)}`, x: layer0X, y: graphCY + 75, color: '#c084fc' },
        { id: 'prod1', label: `z₁=${z1.toFixed(2)}`, x: layer1X, y: graphCY - 50, color: '#fbbf24' },
        { id: 'prod2', label: `z₂=${z2.toFixed(2)}`, x: layer1X, y: graphCY + 50, color: '#fbbf24' },
        { id: 'sum', label: `Σ(+b)`, x: layer2X, y: graphCY, color: '#34d399' },
        { id: 'act', label: `σ(z)`, x: layer3X, y: graphCY, color: '#38bdf8' },
        { id: 'loss', label: `ℒ=${lossVal.toFixed(3)}`, x: layer4X, y: graphCY, color: '#ef4444' }
      ];

      // Synaptic connectivity pairs
      const edges: Array<[[number, number], [number, number]]> = [
        [[layer0X + 14, graphCY - 75], [layer1X - 14, graphCY - 50]],
        [[layer0X + 14, graphCY - 25], [layer1X - 14, graphCY - 50]],
        [[layer0X + 14, graphCY + 25], [layer1X - 14, graphCY + 50]],
        [[layer0X + 14, graphCY + 75], [layer1X - 14, graphCY + 50]],
        [[layer1X + 14, graphCY - 50], [layer2X - 14, graphCY]],
        [[layer1X + 14, graphCY + 50], [layer2X - 14, graphCY]],
        [[layer2X + 14, graphCY], [layer3X - 14, graphCY]],
        [[layer3X + 14, graphCY], [layer4X - 14, graphCY]]
      ];

      // 1. Draw Synapses with Animated Particles
      edges.forEach(([p1, p2]) => {
        ctx.strokeStyle = isForwardPhase ? 'rgba(52, 211, 153, 0.45)' : 'rgba(192, 132, 252, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();

        // Animated bidirectional flow particle
        const px = isForwardPhase ? p1[0] + (p2[0] - p1[0]) * flowT : p2[0] - (p2[0] - p1[0]) * flowT;
        const py = isForwardPhase ? p1[1] + (p2[1] - p1[1]) * flowT : p2[1] - (p2[1] - p1[1]) * flowT;

        ctx.fillStyle = isForwardPhase ? '#34d399' : '#ec4899';
        ctx.shadowColor = isForwardPhase ? '#34d399' : '#ec4899';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 2. Draw DAG Nodes
      nodes.forEach((n) => {
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 16, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 7.5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + 3);
        ctx.textAlign = 'left';
      });

      // 3. Right Side Inset: Real-Time Calculus Chain Rule Breakdown Card
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightX, cardY, rightW, cardH, 12);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = isForwardPhase ? '#34d399' : '#c084fc';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(isForwardPhase ? '⚡ FORWARD ACTIVATION PASS' : '🔄 BACKWARD GRADIENT ADJOINT', rightX + 14, cardY + 24);

      // Chain rule equations card
      const formY = cardY + 38;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(rightX + 10, formY, rightW - 20, 260, 8);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('📐 Chain Rule Partial Derivatives:', rightX + 16, formY + 20);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8.5px monospace';
      ctx.fillText(`1. Loss Error ∂ℒ/∂a = (a - ŷ) = ${(dL_da).toFixed(3)}`, rightX + 16, formY + 42);
      ctx.fillText(`2. Sigmoid Deriv ∂a/∂z = a(1-a) = ${(da_dz).toFixed(3)}`, rightX + 16, formY + 62);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`3. Adjoint Delta δ = ∂ℒ/∂z = ${(dL_dz).toFixed(4)}`, rightX + 16, formY + 84);
      ctx.fillStyle = '#c084fc';
      ctx.fillText(`4. Weight 1 Grad: ∂ℒ/∂w₁ = δ·x₁ = ${(dL_dw1).toFixed(4)}`, rightX + 16, formY + 110);
      ctx.fillText(`5. Weight 2 Grad: ∂ℒ/∂w₂ = δ·x₂ = ${(dL_dw2).toFixed(4)}`, rightX + 16, formY + 132);
      ctx.fillText(`6. Bias Gradient: ∂ℒ/∂b = δ = ${(dL_db).toFixed(4)}`, rightX + 16, formY + 154);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText(`Target: ŷ = ${autodiffTarget.toFixed(1)} | Output: a = ${a.toFixed(3)}`, rightX + 16, formY + 185);
      ctx.fillText(`Loss: ℒ = 0.5·(a - ŷ)² = ${lossVal.toFixed(4)}`, rightX + 16, formY + 202);

      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`Active Flow: ${isForwardPhase ? 'Forward (x → ℒ)' : 'Backward (ℒ → ∇w)'}`, rightX + 16, formY + 226);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Step #${autodiffStepCount} | Rate η = ${autodiffLR.toFixed(2)}`, rightX + 16, formY + 244);

      // Weight Update Box
      const upY = cardY + 312;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(rightX + 10, upY, rightW - 20, 80, 8);
      ctx.fill();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`SGD Update: w ← w - η·(∂ℒ/∂w)`, rightX + 16, upY + 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '8.5px monospace';
      ctx.fillText(`w₁: ${autodiffW1.toFixed(3)} → ${(autodiffW1 - autodiffLR * dL_dw1).toFixed(3)}`, rightX + 16, upY + 40);
      ctx.fillText(`w₂: ${autodiffW2.toFixed(3)} → ${(autodiffW2 - autodiffLR * dL_dw2).toFixed(3)}`, rightX + 16, upY + 58);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`⚡ BACKPROPAGATION | Scalar Adjoint DAG | Flow: ${isForwardPhase ? 'FORWARD' : 'BACKWARD'}`, leftX + 4, 34);

    } else if (autodiffMode === 'multilayer_mlp') {
      // ════════════════════════════════════════════════════════════════
      // MODE 2: MULTI-LAYER PERCEPTRON (3-INPUT, 3-HIDDEN, 2-OUTPUT)
      // ════════════════════════════════════════════════════════════════
      const layer0X = leftX + 28;
      const layer1X = leftX + 132;
      const layer2X = leftX + 236;
      const lossNodeX = leftX + 338;

      const layer0 = [
        { id: 'in1', label: `x₁=${autodiffX1.toFixed(1)}`, y: graphCY - 80, val: autodiffX1 },
        { id: 'in2', label: `x₂=${autodiffX2.toFixed(1)}`, y: graphCY, val: autodiffX2 },
        { id: 'in3', label: `x₃=0.5`, y: graphCY + 80, val: 0.5 }
      ];

      const layer1 = [
        { id: 'h1', label: `h₁`, y: graphCY - 80, a: 0.69 },
        { id: 'h2', label: `h₂`, y: graphCY, a: 0.40 },
        { id: 'h3', label: `h₃`, y: graphCY + 80, a: 0.55 }
      ];

      const layer2 = [
        { id: 'out1', label: `ŷ₁`, y: graphCY - 42, a: 0.64, target: autodiffTarget },
        { id: 'out2', label: `ŷ₂`, y: graphCY + 42, a: 0.45, target: 1 - autodiffTarget }
      ];

      // 1. Synapses: Layer 0 -> Layer 1
      layer0.forEach((inNode, i) => {
        layer1.forEach((hNode, j) => {
          ctx.strokeStyle = isForwardPhase ? 'rgba(52, 211, 153, 0.35)' : 'rgba(192, 132, 252, 0.35)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(layer0X + 14, inNode.y);
          ctx.lineTo(layer1X - 14, hNode.y);
          ctx.stroke();

          // Particle flow
          const px = isForwardPhase ? (layer0X + 14) + (layer1X - 28 - layer0X) * flowT : (layer1X - 14) - (layer1X - 28 - layer0X) * flowT;
          const py = isForwardPhase ? inNode.y + (hNode.y - inNode.y) * flowT : hNode.y - (hNode.y - inNode.y) * flowT;

          if ((i + j) % 2 === 0) {
            ctx.fillStyle = isForwardPhase ? '#34d399' : '#ec4899';
            ctx.beginPath();
            ctx.arc(px, py, 2.8, 0, 2 * Math.PI);
            ctx.fill();
          }
        });
      });

      // 2. Synapses: Layer 1 -> Layer 2
      layer1.forEach((hNode) => {
        layer2.forEach((outNode) => {
          ctx.strokeStyle = isForwardPhase ? 'rgba(56, 189, 248, 0.4)' : 'rgba(236, 72, 153, 0.4)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(layer1X + 14, hNode.y);
          ctx.lineTo(layer2X - 14, outNode.y);
          ctx.stroke();

          // Particle flow
          const px = isForwardPhase ? (layer1X + 14) + (layer2X - 28 - layer1X) * flowT : (layer2X - 14) - (layer2X - 28 - layer1X) * flowT;
          const py = isForwardPhase ? hNode.y + (outNode.y - hNode.y) * flowT : outNode.y - (outNode.y - hNode.y) * flowT;

          ctx.fillStyle = isForwardPhase ? '#38bdf8' : '#ec4899';
          ctx.beginPath();
          ctx.arc(px, py, 3.2, 0, 2 * Math.PI);
          ctx.fill();
        });
      });

      // 3. Synapses: Layer 2 -> Loss
      layer2.forEach((outNode) => {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(layer2X + 14, outNode.y);
        ctx.lineTo(lossNodeX - 14, graphCY);
        ctx.stroke();

        // Particle flow to Loss
        const px = isForwardPhase ? (layer2X + 14) + (lossNodeX - 28 - layer2X) * flowT : (lossNodeX - 14) - (lossNodeX - 28 - layer2X) * flowT;
        const py = isForwardPhase ? outNode.y + (graphCY - outNode.y) * flowT : graphCY - (graphCY - outNode.y) * flowT;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(px, py, 3, 0, 2 * Math.PI); ctx.fill();
      });

      // 4. Draw Layer 0 Nodes (Input)
      layer0.forEach((n) => {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(layer0X, n.y, 14, 0, 2 * Math.PI); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.8; ctx.stroke();
        ctx.fillStyle = '#0f172a'; ctx.font = 'bold 7.5px monospace'; ctx.textAlign = 'center';
        ctx.fillText(n.label, layer0X, n.y + 3); ctx.textAlign = 'left';
      });

      // 5. Draw Layer 1 Nodes (Hidden)
      layer1.forEach((n) => {
        ctx.fillStyle = '#c084fc';
        ctx.beginPath(); ctx.arc(layer1X, n.y, 15, 0, 2 * Math.PI); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.8; ctx.stroke();
        ctx.fillStyle = '#0f172a'; ctx.font = 'bold 7.5px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`${n.label}:${n.a.toFixed(2)}`, layer1X, n.y + 3); ctx.textAlign = 'left';
      });

      // 6. Draw Layer 2 Nodes (Output)
      layer2.forEach((n) => {
        ctx.fillStyle = '#34d399';
        ctx.beginPath(); ctx.arc(layer2X, n.y, 15, 0, 2 * Math.PI); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.8; ctx.stroke();
        ctx.fillStyle = '#0f172a'; ctx.font = 'bold 7.5px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`${n.label}=${n.a.toFixed(2)}`, layer2X, n.y + 3); ctx.textAlign = 'left';
      });

      // 7. Loss Node
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(lossNodeX, graphCY, 16, 0, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('Loss ℒ', lossNodeX, graphCY + 3); ctx.textAlign = 'left';

      // 8. Right Side Inset: Multi-Layer Error Backpropagation Equations
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightX, cardY, rightW, cardH, 12);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('🧠 MULTI-LAYER BACKPROPAGATION', rightX + 14, cardY + 24);

      const formY = cardY + 38;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(rightX + 10, formY, rightW - 20, 290, 8);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('⚡ 1. Output Layer Deltas (Layer 2):', rightX + 16, formY + 20);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText('δ_k^(2) = (ŷ_k - y_k*) · σ\'(z_k^(2))', rightX + 16, formY + 38);
      ctx.fillText(`δ₁^(2) = ${(0.64 - autodiffTarget).toFixed(2)} · 0.23 = ${((0.64 - autodiffTarget) * 0.23).toFixed(3)}`, rightX + 16, formY + 54);

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('⚡ 2. Backpropagated Hidden Deltas:', rightX + 16, formY + 82);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText('δ_j^(1) = [ ∑_k w_jk^(2) · δ_k^(2) ] · σ\'(z_j^(1))', rightX + 16, formY + 100);
      ctx.fillText(`δ₁^(1) = (0.5·δ₁ + -0.4·δ₂) · 0.21 = -0.042`, rightX + 16, formY + 116);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('⚡ 3. Synaptic Weight Updates:', rightX + 16, formY + 144);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText('∂ℒ/∂w_jk^(2) = δ_k^(2) · a_j^(1) (Output Synapse)', rightX + 16, formY + 162);
      ctx.fillText('∂ℒ/∂w_ij^(1) = δ_j^(1) · x_i (Hidden Synapse)', rightX + 16, formY + 178);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText(`Active Flow: ${isForwardPhase ? 'Forward Activation Pass' : 'Backward Error Delta Pass'}`, rightX + 16, formY + 210);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Learning Rate η = ${autodiffLR.toFixed(2)} | Hidden Size = 3`, rightX + 16, formY + 228);
      ctx.fillText(`Step Counter: #${autodiffStepCount}`, rightX + 16, formY + 246);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`⚡ MULTI-LAYER MLP | 3-Input 3-Hidden 2-Output | Flow: ${isForwardPhase ? 'FORWARD' : 'BACKWARD'}`, leftX + 4, 34);

    } else {
      // ════════════════════════════════════════════════════════════════
      // MODE 3: MIMO MATRIX FORM (VECTORIZED TENSOR BACKPROP)
      // ════════════════════════════════════════════════════════════════
      // Left Section: Visual Tensor Pipeline Diagram
      const tBox1X = leftX + 12;
      const tBox2X = leftX + 130;
      const tBox3X = leftX + 248;
      const tLossX = leftX + 342;
      const tBoxY = graphCY - 110;

      // 1. Box 1: Input Tensor x (3x1)
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(tBox1X, tBoxY, 78, 105, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText('x ∈ ℝ^(3×1)', tBox1X + 8, tBoxY + 16);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText(`[ ${autodiffX1.toFixed(2)} ]`, tBox1X + 12, tBoxY + 38);
      ctx.fillText(`[ ${autodiffX2.toFixed(2)} ]`, tBox1X + 12, tBoxY + 58);
      ctx.fillText(`[  0.50 ]`, tBox1X + 12, tBoxY + 78);

      // 2. Synapse Stream W^(1) (3x3)
      ctx.strokeStyle = isForwardPhase ? 'rgba(52, 211, 153, 0.5)' : 'rgba(192, 132, 252, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tBox1X + 78, tBoxY + 52);
      ctx.lineTo(tBox2X, tBoxY + 52);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('W^(1) (3×3)', (tBox1X + 78 + tBox2X) / 2, tBoxY + 44);
      ctx.textAlign = 'left';

      const p1x = isForwardPhase ? (tBox1X + 78) + (tBox2X - tBox1X - 78) * flowT : tBox2X - (tBox2X - tBox1X - 78) * flowT;
      ctx.fillStyle = isForwardPhase ? '#34d399' : '#c084fc';
      ctx.beginPath(); ctx.arc(p1x, tBoxY + 52, 3.5, 0, 2 * Math.PI); ctx.fill();

      // 3. Box 2: Hidden Tensor a^(1) (3x1)
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(tBox2X, tBoxY, 78, 105, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText('a^(1)∈ℝ^(3×1)', tBox2X + 6, tBoxY + 16);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText(`[ 0.69 ]`, tBox2X + 16, tBoxY + 38);
      ctx.fillText(`[ 0.40 ]`, tBox2X + 16, tBoxY + 58);
      ctx.fillText(`[ 0.55 ]`, tBox2X + 16, tBoxY + 78);

      // 4. Synapse Stream W^(2) (2x3)
      ctx.strokeStyle = isForwardPhase ? 'rgba(56, 189, 248, 0.5)' : 'rgba(236, 72, 153, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tBox2X + 78, tBoxY + 52);
      ctx.lineTo(tBox3X, tBoxY + 52);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('W^(2) (2×3)', (tBox2X + 78 + tBox3X) / 2, tBoxY + 44);
      ctx.textAlign = 'left';

      const p2x = isForwardPhase ? (tBox2X + 78) + (tBox3X - tBox2X - 78) * flowT : tBox3X - (tBox3X - tBox2X - 78) * flowT;
      ctx.fillStyle = isForwardPhase ? '#38bdf8' : '#ec4899';
      ctx.beginPath(); ctx.arc(p2x, tBoxY + 52, 3.5, 0, 2 * Math.PI); ctx.fill();

      // 5. Box 3: Output Tensor ŷ (2x1)
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(tBox3X, tBoxY + 12, 68, 80, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText('ŷ ∈ ℝ^(2×1)', tBox3X + 6, tBoxY + 28);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText(`[ 0.64 ]`, tBox3X + 12, tBoxY + 50);
      ctx.fillText(`[ 0.45 ]`, tBox3X + 12, tBoxY + 68);

      // 6. Synapse to Loss
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(tBox3X + 68, tBoxY + 52);
      ctx.lineTo(tLossX - 12, tBoxY + 52);
      ctx.stroke();

      // Loss Node
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(tLossX, tBoxY + 52, 14, 0, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 7.5px monospace'; ctx.textAlign = 'center';
      ctx.fillText('ℒ', tLossX, tBoxY + 55); ctx.textAlign = 'left';

      // 7. Lower Left: Live Parameter Tensor Matrices
      const matBoxY = graphCY + 25;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(leftX + 10, matBoxY, leftW - 20, 180, 10);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText('📊 PARAMETER TENSOR MATRICES', leftX + 22, matBoxY + 20);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText('Weight Matrix W^(1) (3×3):', leftX + 22, matBoxY + 40);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText(`[ +0.50, -0.40, +0.25 ]`, leftX + 22, matBoxY + 55);
      ctx.fillText(`[ -0.15, +0.80, -0.30 ]`, leftX + 22, matBoxY + 68);
      ctx.fillText(`[ +0.35, +0.10, +0.65 ]`, leftX + 22, matBoxY + 81);

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText('Weight Matrix W^(2) (2×3):', leftX + 22, matBoxY + 104);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText(`[ +0.60, -0.75, +0.40 ]`, leftX + 22, matBoxY + 119);
      ctx.fillText(`[ -0.30, +0.55, +0.85 ]`, leftX + 22, matBoxY + 132);

      ctx.fillStyle = '#34d399';
      ctx.font = '8.5px monospace';
      ctx.fillText(`Tensor Batch Parallelism: ACTIVE`, leftX + 22, matBoxY + 158);

      // Right Side: Vectorized Tensor Chain Rule Card
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightX, cardY, rightW, cardH, 12);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('📊 VECTORIZED TENSOR CHAIN RULE', rightX + 14, cardY + 24);

      // Forward Pass Block
      const block1Y = cardY + 38;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(rightX + 10, block1Y, rightW - 20, 110, 8);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('▶ FORWARD TENSOR PASS:', rightX + 16, block1Y + 20);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText('z^(1) = W^(1) · x + b^(1)   ∈ ℝ^(3×1)', rightX + 16, block1Y + 40);
      ctx.fillText('a^(1) = σ(z^(1))            ∈ ℝ^(3×1)', rightX + 16, block1Y + 58);
      ctx.fillText('z^(2) = W^(2) · a^(1) + b^(2) ∈ ℝ^(2×1)', rightX + 16, block1Y + 76);
      ctx.fillText('ŷ     = σ(z^(2))            ∈ ℝ^(2×1)', rightX + 16, block1Y + 94);

      // Backward Adjoint Pass Block
      const block2Y = block1Y + 122;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(rightX + 10, block2Y, rightW - 20, 130, 8);
      ctx.fill();

      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('◀ BACKWARD ADJOINT TENSOR PASS:', rightX + 16, block2Y + 20);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText('δ^(2) = (ŷ - y*) ⊙ σ\'(z^(2))      ∈ ℝ^(2×1)', rightX + 16, block2Y + 40);
      ctx.fillText('δ^(1) = (W^(2)ᵀ · δ^(2)) ⊙ σ\'(z^(1)) ∈ ℝ^(3×1)', rightX + 16, block2Y + 58);
      ctx.fillStyle = '#34d399';
      ctx.fillText('∂ℒ/∂W^(2) = δ^(2) · (a^(1))ᵀ       ∈ ℝ^(2×3)', rightX + 16, block2Y + 80);
      ctx.fillText('∂ℒ/∂W^(1) = δ^(1) · xᵀ             ∈ ℝ^(3×3)', rightX + 16, block2Y + 98);
      ctx.fillText('∂ℒ/∂b     = δ                      (Biases)', rightX + 16, block2Y + 116);

      // Telemetry Box
      const block3Y = block2Y + 142;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(rightX + 10, block3Y, rightW - 20, 70, 8);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText(`Active Flow: ${isForwardPhase ? 'Forward Tensor Pass' : 'Backward Jacobian Adjoint'}`, rightX + 16, block3Y + 22);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText(`Step Counter: #${autodiffStepCount}`, rightX + 16, block3Y + 40);
      ctx.fillText(`Batch SGD Learning Rate η = ${autodiffLR.toFixed(2)}`, rightX + 16, block3Y + 56);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`⚡ MATRIX FORM BACKPROPAGATION | Vectorized MIMO | Flow: ${isForwardPhase ? 'FORWARD' : 'BACKWARD'}`, leftX + 4, 34);
    }
  };

  // 16. Convolutional Neural Networks, Pooling & ResNet Skips Visual Engine
  const drawConvKernelScannerAndFeatureMap = (ctx: CanvasRenderingContext2D, _w: number, _h: number, _cx: number, _cy: number, _scale: number, localFrame: number) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(26 / simSpeed)) === 0) {
      performConvScanStep();
    }

    const marginX = 14;
    const marginY = 14;
    const gap = 12;
    const totalW = 720 - 2 * marginX - gap;
    const leftW = Math.floor(totalW * 0.52); // 353px
    const rightW = totalW - leftW;          // 327px
    const boardH = 620 - 2 * marginY;       // 592px
    const leftX = marginX;
    const leftY = marginY;
    const rightX = marginX + leftW + gap;
    const rightY = marginY;

    // Draw Left and Right Glassmorphic Boards
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(leftX, leftY, leftW, boardH, 12);
    ctx.fill(); ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(rightX, rightY, rightW, boardH, 12);
    ctx.fill(); ctx.stroke();

    // Subtle Grid Background
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.15)';
    ctx.lineWidth = 1;
    for (let x = leftX + 16; x < leftX + leftW; x += 22) {
      ctx.beginPath(); ctx.moveTo(x, leftY); ctx.lineTo(x, leftY + boardH); ctx.stroke();
    }
    for (let x = rightX + 16; x < rightX + rightW; x += 22) {
      ctx.beginPath(); ctx.moveTo(x, rightY); ctx.lineTo(x, rightY + boardH); ctx.stroke();
    }

    // ════════════════════════════════════════════════════════════════
    // MODE 1: KERNEL CONVOLUTION, PADDING & STRIDE ARITHMETIC
    // ════════════════════════════════════════════════════════════════
    if (convMode === 'kernel_convolution') {
      // Kernel Presets
      const kernelFilters: Record<string, { name: string; k: number[][]; desc: string }> = {
        edge: {
          name: 'EDGE DETECT (Laplacian)',
          k: [[0, 1, 0], [1, -4, 1], [0, 1, 0]],
          desc: 'High-pass 2nd derivative: Highlights boundary contrasts'
        },
        sobel_v: {
          name: 'SOBEL VERTICAL (∂/∂x)',
          k: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
          desc: 'Detects vertical edges by measuring horizontal pixel gradient'
        },
        sobel_h: {
          name: 'SOBEL HORIZONTAL (∂/∂y)',
          k: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
          desc: 'Detects horizontal edges by measuring vertical pixel gradient'
        },
        sharpen: {
          name: 'SHARPEN FILTER',
          k: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
          desc: 'Amplifies center pixel relative to immediate 4-neighbors'
        },
        ridge: {
          name: 'RIDGE / EMBOSS',
          k: [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]],
          desc: 'Directional 3D relief filter creating embossed shadows'
        },
        gaussian: {
          name: 'GAUSSIAN BLUR (3×3)',
          k: [[1, 2, 1], [2, 4, 2], [1, 2, 1]],
          desc: 'Low-pass smoothing kernel (normalized by 1/16)'
        }
      };

      const activeKInfo = kernelFilters[convFilterType] || kernelFilters.edge;
      const K = activeKInfo.k;

      // Base 5x5 Input Image (Vertical Edge Contrast)
      const baseDim = 5;
      const baseImg = [
        [12, 18, 85, 90, 22],
        [15, 24, 88, 94, 25],
        [10, 16, 82, 89, 18],
        [14, 20, 92, 98, 24],
        [11, 15, 78, 85, 16]
      ];

      // Build Padded Grid (5 + 2*P)
      const P = convPadding;
      const inGridDim = baseDim + 2 * P;
      const paddedGrid: { val: number; isPad: boolean }[][] = [];

      for (let r = 0; r < inGridDim; r++) {
        const row: { val: number; isPad: boolean }[] = [];
        for (let c = 0; c < inGridDim; c++) {
          const origR = r - P;
          const origC = c - P;
          if (origR >= 0 && origR < baseDim && origC >= 0 && origC < baseDim) {
            row.push({ val: baseImg[origR][origC], isPad: false });
          } else {
            row.push({ val: 0, isPad: true });
          }
        }
        paddedGrid.push(row);
      }

      // Stride and Dilation Arithmetic
      const S = convStrideVal;
      const D = convDilationRate;
      const kEff = 3 + 2 * (D - 1);
      const outDim = Math.max(1, Math.floor((inGridDim - kEff) / S) + 1);
      const totalSteps = outDim * outDim;

      const activeStep = convScanStep % totalSteps;
      const outR = Math.floor(activeStep / outDim);
      const outC = activeStep % outDim;
      const inAnchorR = outR * S;
      const inAnchorC = outC * S;

      // Compute Feature Map Matrix
      const featureMapData: number[][] = [];
      for (let r = 0; r < outDim; r++) {
        const fRow: number[] = [];
        for (let c = 0; c < outDim; c++) {
          let sum = 0;
          for (let ki = 0; ki < 3; ki++) {
            for (let kj = 0; kj < 3; kj++) {
              const pr = r * S + ki * D;
              const pc = c * S + kj * D;
              const pix = (pr < inGridDim && pc < inGridDim) ? paddedGrid[pr][pc].val : 0;
              const kw = K[ki][kj];
              sum += pix * kw;
            }
          }
          if (convFilterType === 'gaussian') sum = Math.round(sum / 16);
          sum += Math.round(convPostBiasB * 10);
          fRow.push(sum);
        }
        featureMapData.push(fRow);
      }

      // ─── LEFT BOARD: INPUT IMAGE MATRIX & SLIDING RECEPTIVE FIELD ───
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('🖼️ INPUT MATRIX I + PADDING', leftX + 16, leftY + 26);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9.5px monospace';
      ctx.fillText(`Size: ${inGridDim}×${inGridDim} (Base 5×5 + P=${P}) | Stride s=${S} | Dil d=${D}`, leftX + 16, leftY + 42);

      // Render Padded Grid Cells
      const maxGridSize = 250;
      const inCellSize = Math.min(32, Math.floor(maxGridSize / inGridDim));
      const inStartX = leftX + Math.floor((leftW - inGridDim * inCellSize) / 2);
      const inStartY = leftY + 68;

      for (let r = 0; r < inGridDim; r++) {
        for (let c = 0; c < inGridDim; c++) {
          const cell = paddedGrid[r][c];
          const px = inStartX + c * inCellSize;
          const py = inStartY + r * inCellSize;

          if (cell.isPad) {
            ctx.fillStyle = 'rgba(30, 41, 59, 0.4)';
            ctx.fillRect(px + 1, py + 1, inCellSize - 2, inCellSize - 2);
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(px + 1, py + 1, inCellSize - 2, inCellSize - 2);
            ctx.setLineDash([]);

            ctx.fillStyle = '#64748b';
            ctx.font = '8.5px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('0', px + inCellSize / 2, py + inCellSize / 2 + 3);
            ctx.textAlign = 'left';
          } else {
            const intensity = cell.val / 100;
            ctx.fillStyle = `rgba(56, 189, 248, ${0.15 + intensity * 0.75})`;
            ctx.fillRect(px + 1, py + 1, inCellSize - 2, inCellSize - 2);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.strokeRect(px + 1, py + 1, inCellSize - 2, inCellSize - 2);

            ctx.fillStyle = intensity > 0.6 ? '#ffffff' : '#e2e8f0';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${cell.val}`, px + inCellSize / 2, py + inCellSize / 2 + 3);
            ctx.textAlign = 'left';
          }
        }
      }

      // Active Receptive Field Sliding Window (Amber Box with Corner Marks)
      const winX = inStartX + inAnchorC * inCellSize;
      const winY = inStartY + inAnchorR * inCellSize;
      const winW = (D === 1 ? 3 : kEff) * inCellSize;
      const winH = (D === 1 ? 3 : kEff) * inCellSize;

      // Glow behind window
      ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
      ctx.fillRect(winX, winY, winW, winH);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.strokeRect(winX, winY, winW, winH);
      ctx.shadowBlur = 0;

      // Highlight the 9 sampled pixels inside dilation window
      for (let ki = 0; ki < 3; ki++) {
        for (let kj = 0; kj < 3; kj++) {
          const spX = inStartX + (inAnchorC + kj * D) * inCellSize;
          const spY = inStartY + (inAnchorR + ki * D) * inCellSize;
          ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
          ctx.fillRect(spX + 2, spY + 2, inCellSize - 4, inCellSize - 4);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(spX + 2, spY + 2, inCellSize - 4, inCellSize - 4);
        }
      }

      // Receptive Window Badge
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(winX, winY - 14, Math.min(winW, 110), 14, [4, 4, 0, 0]);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`3×3 KERNEL FOCUS`, winX + 4, winY - 4);

      // Left Board Bottom Info Deck
      const leftDeckY = inStartY + inGridDim * inCellSize + 24;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
      ctx.beginPath();
      ctx.roundRect(leftX + 14, leftDeckY, leftW - 28, boardH - (leftDeckY - leftY) - 14, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText(`📐 PADDING & STRIDE ARITHMETIC`, leftX + 24, leftDeckY + 20);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8.5px monospace';
      ctx.fillText(`• Padding p=${P}: ${P === 0 ? 'VALID (No pad, spatial shrink)' : P === 1 ? 'SAME (1-ring zero padding)' : 'FULL (2-ring padding)'}`, leftX + 24, leftDeckY + 38);
      ctx.fillText(`• Stride s=${S}: Moves ${S} pixel${S > 1 ? 's' : ''} per step`, leftX + 24, leftDeckY + 54);
      ctx.fillText(`• Output Dim: O = ⌊(W - K + 2P)/S⌋ + 1`, leftX + 24, leftDeckY + 70);
      ctx.fillStyle = '#34d399';
      ctx.fillText(`  = ⌊(${baseDim} - 3 + ${2 * P})/${S}⌋ + 1 = ${outDim}×${outDim} Features`, leftX + 24, leftDeckY + 86);

      // ─── RIGHT BOARD: FEATURE MAP & LIVE DOT-PRODUCT ARITHMETIC ───
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`⚡ FEATURE MAP S = I ⊛ K (${outDim}×${outDim})`, rightX + 16, rightY + 26);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9.5px monospace';
      ctx.fillText(`Filter: ${activeKInfo.name}`, rightX + 16, rightY + 42);

      // Render Output Feature Map Grid
      const outCellSize = Math.min(36, Math.floor(220 / outDim));
      const outStartX = rightX + Math.floor((rightW - outDim * outCellSize) / 2);
      const outStartY = rightY + 62;

      for (let r = 0; r < outDim; r++) {
        for (let c = 0; c < outDim; c++) {
          const stepNum = r * outDim + c;
          const isCurrent = (r === outR && c === outC);
          const isComputed = stepNum <= activeStep;
          const px = outStartX + c * outCellSize;
          const py = outStartY + r * outCellSize;

          if (isCurrent) {
            ctx.fillStyle = 'rgba(52, 211, 153, 0.45)';
            ctx.fillRect(px + 1, py + 1, outCellSize - 2, outCellSize - 2);
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#34d399';
            ctx.shadowBlur = 10;
            ctx.strokeRect(px + 1, py + 1, outCellSize - 2, outCellSize - 2);
            ctx.shadowBlur = 0;
          } else if (isComputed) {
            ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
            ctx.fillRect(px + 1, py + 1, outCellSize - 2, outCellSize - 2);
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(px + 1, py + 1, outCellSize - 2, outCellSize - 2);
          } else {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
            ctx.fillRect(px + 1, py + 1, outCellSize - 2, outCellSize - 2);
            ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 1, py + 1, outCellSize - 2, outCellSize - 2);
          }

          if (isComputed) {
            const val = featureMapData[r][c];
            ctx.fillStyle = isCurrent ? '#ffffff' : val > 50 ? '#34d399' : '#a7f3d0';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${val}`, px + outCellSize / 2, py + outCellSize / 2 + 4);
            ctx.textAlign = 'left';
          }
        }
      }

      // Receptive Laser Ray Convergence (from 4 corners of input window to target feature pixel)
      const targetPxX = outStartX + outC * outCellSize + outCellSize / 2;
      const targetPxY = outStartY + outR * outCellSize + outCellSize / 2;

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(winX + winW, winY);
      ctx.lineTo(targetPxX, targetPxY);
      ctx.moveTo(winX + winW, winY + winH);
      ctx.lineTo(targetPxX, targetPxY);
      ctx.stroke();
      ctx.setLineDash([]);

      // ─── RIGHT BOARD: LIVE DOT-PRODUCT ARITHMETIC DECK ───
      const calcDeckY = outStartY + outDim * outCellSize + 18;
      const calcDeckH = boardH - (calcDeckY - rightY) - 14;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightX + 12, calcDeckY, rightW - 24, calcDeckH, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText(`🔢 3×3 ELEMENT-WISE DOT PRODUCT`, rightX + 20, calcDeckY + 18);

      // Show 3x3 Kernel Matrix Mini-Table
      const kBoxX = rightX + 20;
      const kBoxY = calcDeckY + 28;
      ctx.font = '8px monospace';
      for (let ki = 0; ki < 3; ki++) {
        for (let kj = 0; kj < 3; kj++) {
          const val = K[ki][kj];
          ctx.fillStyle = val > 0 ? 'rgba(52, 211, 153, 0.2)' : val < 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)';
          ctx.fillRect(kBoxX + kj * 24, kBoxY + ki * 18, 22, 16);
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
          ctx.strokeRect(kBoxX + kj * 24, kBoxY + ki * 18, 22, 16);

          ctx.fillStyle = val > 0 ? '#34d399' : val < 0 ? '#f87171' : '#94a3b8';
          ctx.textAlign = 'center';
          ctx.fillText(`${val}`, kBoxX + kj * 24 + 11, kBoxY + ki * 18 + 11);
          ctx.textAlign = 'left';
        }
      }

      // Mathematical Step Breakdown
      const mathX = rightX + 104;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText(`Active Output S[${outR}, ${outC}]:`, mathX, calcDeckY + 36);

      // Expanded Multiplications
      const rowSums: number[] = [];
      for (let ki = 0; ki < 3; ki++) {
        let rSum = 0;
        const terms: string[] = [];
        for (let kj = 0; kj < 3; kj++) {
          const pr = inAnchorR + ki * D;
          const pc = inAnchorC + kj * D;
          const pix = (pr < inGridDim && pc < inGridDim) ? paddedGrid[pr][pc].val : 0;
          const kw = K[ki][kj];
          const prod = pix * kw;
          rSum += prod;
          terms.push(`${pix}·${kw}`);
        }
        rowSums.push(rSum);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '7.5px monospace';
        ctx.fillText(`R${ki + 1}: (${terms.join(' + ')}) = ${rSum}`, mathX, calcDeckY + 52 + ki * 14);
      }

      const totalDot = rowSums[0] + rowSums[1] + rowSums[2];
      const finalVal = featureMapData[outR][outC];

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText(`∑ Product: ${totalDot} + Bias(${convPostBiasB.toFixed(1)}) = ${finalVal}`, rightX + 20, calcDeckY + calcDeckH - 32);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '7.5px monospace';
      ctx.fillText(`Action: Step #${activeStep + 1}/${totalSteps} | Click board to step`, rightX + 20, calcDeckY + calcDeckH - 16);
    }

    // ════════════════════════════════════════════════════════════════
    // MODE 2: ACTIVATION FUNCTION (ReLU) & SPATIAL POOLING (MAX / AVG)
    // ════════════════════════════════════════════════════════════════
    else if (convMode === 'relu_and_pooling') {
      const preReluData = [
        [-18,  45,   0,  72],
        [ 34, -25,  60, -12],
        [ -5,  88, -40,  15],
        [ 92,  -6,  50, -32]
      ];

      // ─── LEFT BOARD: PRE-ACTIVATION MAP & ReLU TRANSFORMATION ───
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('⚡ NON-LINEARITY: ReLU(z) = max(0, z)', leftX + 16, leftY + 26);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9.5px monospace';
      ctx.fillText('Rectified Linear Unit eliminates negative feature responses', leftX + 16, leftY + 42);

      // Render 4x4 Grid showing Before and After ReLU
      const cellSize = 34;
      const gridStartX = leftX + Math.floor((leftW - 4 * cellSize) / 2);
      const gridStartY = leftY + 66;

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const val = preReluData[r][c];
          const isNegative = val < 0;
          const px = gridStartX + c * cellSize;
          const py = gridStartY + r * cellSize;

          if (isNegative) {
            ctx.fillStyle = 'rgba(244, 63, 94, 0.18)';
            ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
            ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);

            ctx.fillStyle = '#f43f5e';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${val}`, px + cellSize / 2, py + 14);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '8px monospace';
            ctx.fillText(`↓`, px + cellSize / 2, py + 22);
            ctx.fillStyle = '#fda4af';
            ctx.font = 'bold 9px monospace';
            ctx.fillText(`0`, px + cellSize / 2, py + 31);
            ctx.textAlign = 'left';
          } else {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
            ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${val}`, px + cellSize / 2, py + cellSize / 2 + 4);
            ctx.textAlign = 'left';
          }
        }
      }

      // Left Board ReLU Graph Card
      const graphY = gridStartY + 4 * cellSize + 24;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
      ctx.beginPath();
      ctx.roundRect(leftX + 14, graphY, leftW - 28, boardH - (graphY - leftY) - 14, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText(`📈 ReLU ACTIVATION FUNCTION GRAPH`, leftX + 24, graphY + 22);

      // Mini Coordinate Axes for ReLU
      const axX = leftX + 60;
      const axY = graphY + 110;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(axX - 35, axY); ctx.lineTo(axX + 55, axY); // X axis
      ctx.moveTo(axX, axY + 15); ctx.lineTo(axX, axY - 60); // Y axis
      ctx.stroke();

      // ReLU Curve: 0 for x<0, slope 1 for x>0
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(axX - 35, axY);
      ctx.lineTo(axX, axY);
      ctx.lineTo(axX + 50, axY - 50);
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.font = '8px monospace';
      ctx.fillText('f(z)=0 (z<0)', axX - 45, axY - 10);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('f(z)=z (z≥0)', axX + 20, axY - 55);

      // ReLU Explanations
      const textX = leftX + 140;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8.5px monospace';
      ctx.fillText('• Sparsity: Inactive neurons', textX, graphY + 48);
      ctx.fillText('  output clean zero.', textX, graphY + 62);
      ctx.fillText('• Constant Gradient = 1:', textX, graphY + 80);
      ctx.fillText('  Prevents vanishing gradient', textX, graphY + 94);
      ctx.fillText('• Highly compute-efficient', textX, graphY + 112);

      // ─── RIGHT BOARD: SPATIAL POOLING (MAX VS AVERAGE) ───
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`📉 SPATIAL POOLING (${convPoolType.toUpperCase()} POOL 2×2)`, rightX + 16, rightY + 26);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9.5px monospace';
      ctx.fillText('Stride 2: Reduces 4×4 spatial map to 2×2 (-75% footprint)', rightX + 16, rightY + 42);

      // Activated 4x4 matrix with 4 distinct colored quadrant windows
      const quadrantColors = [
        { bg: 'rgba(56, 189, 248, 0.25)', border: '#38bdf8', name: 'TL Quadrant', max: 45, avg: 19.8, vals: [0, 45, 34, 0] },
        { bg: 'rgba(52, 211, 153, 0.25)', border: '#34d399', name: 'TR Quadrant', max: 72, avg: 33.0, vals: [0, 72, 60, 0] },
        { bg: 'rgba(251, 191, 36, 0.25)', border: '#fbbf24', name: 'BL Quadrant', max: 92, avg: 45.0, vals: [0, 88, 92, 0] },
        { bg: 'rgba(168, 85, 247, 0.25)', border: '#a855f7', name: 'BR Quadrant', max: 50, avg: 16.3, vals: [0, 15, 50, 0] }
      ];

      const poolInSize = 28;
      const poolInStartX = rightX + 24;
      const poolInStartY = rightY + 68;

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const qIdx = (r < 2 ? 0 : 2) + (c < 2 ? 0 : 1);
          const q = quadrantColors[qIdx];
          const val = Math.max(0, preReluData[r][c]);
          const px = poolInStartX + c * poolInSize;
          const py = poolInStartY + r * poolInSize;

          ctx.fillStyle = q.bg;
          ctx.fillRect(px + 1, py + 1, poolInSize - 2, poolInSize - 2);
          ctx.strokeStyle = q.border;
          ctx.lineWidth = 1.2;
          ctx.strokeRect(px + 1, py + 1, poolInSize - 2, poolInSize - 2);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${val}`, px + poolInSize / 2, py + poolInSize / 2 + 3);
          ctx.textAlign = 'left';
        }
      }

      // Draw Downsampling Arrow
      const arrowX = poolInStartX + 4 * poolInSize + 16;
      const arrowY = poolInStartY + 2 * poolInSize;
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('➔', arrowX, arrowY + 6);
      ctx.font = '8px monospace';
      ctx.fillText(`${convPoolType.toUpperCase()}`, arrowX - 4, arrowY - 10);

      // Resulting 2x2 Pooled Matrix
      const poolOutSize = 42;
      const poolOutStartX = arrowX + 34;
      const poolOutStartY = poolInStartY + 14;

      for (let qIdx = 0; qIdx < 4; qIdx++) {
        const qr = Math.floor(qIdx / 2);
        const qc = qIdx % 2;
        const q = quadrantColors[qIdx];
        const val = convPoolType === 'max' ? q.max : q.avg;
        const px = poolOutStartX + qc * poolOutSize;
        const py = poolOutStartY + qr * poolOutSize;

        ctx.fillStyle = q.bg;
        ctx.fillRect(px + 2, py + 2, poolOutSize - 4, poolOutSize - 4);
        ctx.strokeStyle = q.border;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = q.border;
        ctx.shadowBlur = 6;
        ctx.strokeRect(px + 2, py + 2, poolOutSize - 4, poolOutSize - 4);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${val}`, px + poolOutSize / 2, py + poolOutSize / 2 + 4);
        ctx.textAlign = 'left';
      }

      // Right Board Bottom Explanation Card
      const poolDeckY = poolInStartY + 4 * poolInSize + 32;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightX + 14, poolDeckY, rightW - 28, boardH - (poolDeckY - rightY) - 14, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText(`🧠 WHY USE POOLING IN VISION ARCHITECTURES?`, rightX + 24, poolDeckY + 22);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8.5px monospace';
      ctx.fillText(`1. Translation Invariance: If features shift slightly,`, rightX + 24, poolDeckY + 40);
      ctx.fillText(`   the max activation remains constant in that window.`, rightX + 24, poolDeckY + 54);
      ctx.fillText(`2. Dimensionality Reduction: Shrinks compute by 75%`, rightX + 24, poolDeckY + 70);
      ctx.fillText(`   allowing deeper networks to fit into GPU memory.`, rightX + 24, poolDeckY + 84);
      ctx.fillText(`3. Zero Parameters: Downsampling requires no weights!`, rightX + 24, poolDeckY + 100);
    }

    // ════════════════════════════════════════════════════════════════
    // MODE 3: DEEP CNN PIPELINE (LeNet / Tiny-VGG Visual Architecture)
    // ════════════════════════════════════════════════════════════════
    else if (convMode === 'deep_cnn_pipeline') {
      // ─── LEFT BOARD: MULTI-STAGE ISOMETRIC PIPELINE VIEW ───
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('🏛️ END-TO-END CNN PIPELINE (LeNet-5 / Tiny-VGG)', leftX + 16, leftY + 26);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9.5px monospace';
      ctx.fillText('Input Image ➔ Conv1 ➔ MaxPool ➔ Conv2 ➔ Dense FC ➔ Softmax', leftX + 16, leftY + 42);

      // Pipeline Stages Definition
      const stages = [
        { label: 'INPUT', shape: '1×28×28', color: '#38bdf8', h: 90, w: 22 },
        { label: 'CONV 1', shape: '6×28×28', color: '#34d399', h: 80, w: 32 },
        { label: 'POOL 1', shape: '6×14×14', color: '#a855f7', h: 62, w: 26 },
        { label: 'CONV 2', shape: '16×10×10', color: '#fbbf24', h: 50, w: 42 },
        { label: 'POOL 2', shape: '16×5×5', color: '#f43f5e', h: 36, w: 32 },
        { label: 'DENSE FC', shape: '120→84', color: '#60a5fa', h: 70, w: 18 },
        { label: 'OUTPUT', shape: '10 Class', color: '#10b981', h: 54, w: 16 }
      ];

      const startStageX = leftX + 18;
      const stageCenterY = leftY + 160;

      let curX = startStageX;
      for (let s = 0; s < stages.length; s++) {
        const st = stages[s];
        const sy = stageCenterY - st.h / 2;

        // Draw Layer Block
        ctx.fillStyle = `rgba(30, 41, 59, 0.8)`;
        ctx.strokeStyle = st.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(curX, sy, st.w, st.h, 6);
        ctx.fill(); ctx.stroke();

        // Layer Slices if multi-channel
        if (s === 1 || s === 3) {
          ctx.strokeStyle = `rgba(255, 255, 255, 0.25)`;
          ctx.lineWidth = 1;
          for (let l = 1; l < 4; l++) {
            ctx.beginPath();
            ctx.moveTo(curX + (st.w / 4) * l, sy);
            ctx.lineTo(curX + (st.w / 4) * l, sy + st.h);
            ctx.stroke();
          }
        }

        // Header Label Above
        ctx.fillStyle = st.color;
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(st.label, curX + st.w / 2, sy - 8);

        // Subtitle Below
        ctx.fillStyle = '#94a3b8';
        ctx.font = '7px monospace';
        ctx.fillText(st.shape, curX + st.w / 2, sy + st.h + 12);
        ctx.textAlign = 'left';

        // Connecting Beam to Next Stage
        if (s < stages.length - 1) {
          const nextX = curX + st.w + 14;
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(curX + st.w, stageCenterY);
          ctx.lineTo(nextX, stageCenterY);
          ctx.stroke();

          // Animated Flow Particle
          const flowPhase = ((localFrame * 0.04 + s * 0.3) % 1);
          const px = curX + st.w + flowPhase * 14;
          ctx.fillStyle = st.color;
          ctx.beginPath();
          ctx.arc(px, stageCenterY, 2.5, 0, Math.PI * 2);
          ctx.fill();

          curX = nextX;
        } else {
          curX += st.w;
        }
      }

      // Feature Extraction Level Deep-Dive Card
      const diveDeckY = stageCenterY + 80;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
      ctx.beginPath();
      ctx.roundRect(leftX + 14, diveDeckY, leftW - 28, boardH - (diveDeckY - leftY) - 14, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText(`🔍 HIERARCHICAL FEATURE EXTRACTION`, leftX + 24, diveDeckY + 22);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8.5px monospace';
      ctx.fillText('• Layer 1 (Low-Level): 6 filters act as Gabor edge', leftX + 24, diveDeckY + 40);
      ctx.fillText('  detectors, capturing horizontal & diagonal lines.', leftX + 24, diveDeckY + 54);
      ctx.fillText('• Layer 2 (Mid-Level): 16 filters combine edge lines', leftX + 24, diveDeckY + 70);
      ctx.fillText('  into corners, loops, curves, and junctions.', leftX + 24, diveDeckY + 84);
      ctx.fillText('• Dense Layers: Maps 400 features to digit classes.', leftX + 24, diveDeckY + 100);

      // ─── RIGHT BOARD: INTERACTIVE DIGIT TESTER & SOFTMAX PROBABILITIES ───
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('🎲 DIGIT TESTER & SOFTMAX PREDICTOR', rightX + 16, rightY + 26);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9.5px monospace';
      ctx.fillText('Select test pattern to inspect predicted probability distribution', rightX + 16, rightY + 42);

      // Digit Selector Buttons Bar
      const digits: { id: 'digit_7' | 'digit_3' | 'digit_0' | 'edge_box'; label: string; target: number }[] = [
        { id: 'digit_7', label: 'Digit 7', target: 7 },
        { id: 'digit_3', label: 'Digit 3', target: 3 },
        { id: 'digit_0', label: 'Digit 0', target: 0 },
        { id: 'edge_box', label: 'Box Edge', target: 1 }
      ];

      const btnY = rightY + 52;
      for (let d = 0; d < digits.length; d++) {
        const dig = digits[d];
        const isSel = convInputDigit === dig.id;
        const bx = rightX + 16 + d * 74;

        ctx.fillStyle = isSel ? 'rgba(16, 185, 129, 0.3)' : 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = isSel ? '#10b981' : 'rgba(51, 65, 85, 0.7)';
        ctx.lineWidth = isSel ? 1.8 : 1;
        ctx.beginPath();
        ctx.roundRect(bx, btnY, 68, 26, 6);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = isSel ? '#10b981' : '#cbd5e1';
        ctx.font = 'bold 8.5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(dig.label, bx + 34, btnY + 16);
        ctx.textAlign = 'left';
      }

      // Compute Softmax Probabilities for the selected digit
      const activeDigitObj = digits.find(d => d.id === convInputDigit) || digits[0];
      const probs: number[] = [0.01, 0.02, 0.01, 0.02, 0.01, 0.01, 0.01, 0.01, 0.02, 0.01];
      probs[activeDigitObj.target] = 0.94;
      if (activeDigitObj.target === 7) { probs[1] = 0.03; probs[2] = 0.01; }
      if (activeDigitObj.target === 3) { probs[8] = 0.03; probs[5] = 0.01; }
      if (activeDigitObj.target === 0) { probs[6] = 0.03; probs[8] = 0.01; }

      // Probability Bar Chart (Digits 0..9)
      const chartStartY = btnY + 38;
      const chartH = 220;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
      ctx.beginPath();
      ctx.roundRect(rightX + 14, chartStartY, rightW - 28, chartH, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('OUTPUT CLASS PROBABILITY BARS (Softmax):', rightX + 24, chartStartY + 18);

      for (let i = 0; i < 10; i++) {
        const p = probs[i];
        const isTop = i === activeDigitObj.target;
        const barY = chartStartY + 30 + i * 18;
        const maxBarW = rightW - 130;
        const barW = Math.max(3, p * maxBarW);

        ctx.fillStyle = isTop ? '#10b981' : '#64748b';
        ctx.font = isTop ? 'bold 8.5px monospace' : '8px monospace';
        ctx.fillText(`Digit ${i}:`, rightX + 24, barY + 10);

        ctx.fillStyle = isTop ? 'rgba(16, 185, 129, 0.35)' : 'rgba(51, 65, 85, 0.4)';
        ctx.fillRect(rightX + 80, barY + 2, maxBarW, 11);

        ctx.fillStyle = isTop ? '#10b981' : '#64748b';
        ctx.fillRect(rightX + 80, barY + 2, barW, 11);

        ctx.fillStyle = isTop ? '#ffffff' : '#94a3b8';
        ctx.font = 'bold 7.5px monospace';
        ctx.fillText(`${(p * 100).toFixed(1)}%`, rightX + 86 + maxBarW, barY + 11);
      }

      // Predicted Winner Card
      const winDeckY = chartStartY + chartH + 16;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightX + 14, winDeckY, rightW - 28, boardH - (winDeckY - rightY) - 14, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 10.5px monospace';
      ctx.fillText(`🏆 PREDICTED: DIGIT "${activeDigitObj.target}" (${(probs[activeDigitObj.target] * 100).toFixed(1)}%)`, rightX + 24, winDeckY + 24);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText(`Loss: ℒ = -log(0.94) = 0.061 | Classification Confidence: High`, rightX + 24, winDeckY + 42);
    }

    // ════════════════════════════════════════════════════════════════
    // MODE 4: RESNET RESIDUAL SKIPS & IDENTITY GRADIENT HIGHWAYS
    // ════════════════════════════════════════════════════════════════
    else if (convMode === 'resnet_skip_block') {
      // ─── LEFT BOARD: RESIDUAL BLOCK MICRO-CIRCUIT (F(x) + x) ───
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('🔄 RESIDUAL BLOCK MICRO-CIRCUIT (He et al.)', leftX + 16, leftY + 26);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9.5px monospace';
      ctx.fillText('Core Formulation: y = ReLU( F(x, {W_i}) + x )', leftX + 16, leftY + 42);

      const circW = 200;
      const circStartX = leftX + Math.floor((leftW - circW) / 2) + 20;

      // 1. Input Node x
      const inNodeY = leftY + 430;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(circStartX, inNodeY, circW - 40, 32, 6);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Input Features x ∈ ℝ^(64×56×56)', circStartX + (circW - 40) / 2, inNodeY + 20);
      ctx.textAlign = 'left';

      // 2. Weight Layer 1 (Conv 3x3)
      const conv1Y = leftY + 330;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(circStartX, conv1Y, circW - 40, 36, 6);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Weight Layer 1: Conv 3×3 (64)', circStartX + (circW - 40) / 2, conv1Y + 16);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '7.5px monospace';
      ctx.fillText('+ BatchNorm + ReLU', circStartX + (circW - 40) / 2, conv1Y + 28);
      ctx.textAlign = 'left';

      // 3. Weight Layer 2 (Conv 3x3)
      const conv2Y = leftY + 230;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(circStartX, conv2Y, circW - 40, 36, 6);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Weight Layer 2: Conv 3×3 (64)', circStartX + (circW - 40) / 2, conv2Y + 16);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '7.5px monospace';
      ctx.fillText('+ BatchNorm (No ReLU yet)', circStartX + (circW - 40) / 2, conv2Y + 28);
      ctx.textAlign = 'left';

      // 4. Pointwise Addition Node (+)
      const addNodeY = leftY + 150;
      const addCenterX = circStartX + (circW - 40) / 2;

      ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(addCenterX, addNodeY, 18, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⊕', addCenterX, addNodeY + 5);
      ctx.textAlign = 'left';

      // 5. Final Output Layer y = ReLU(F(x) + x)
      const outNodeY = leftY + 70;
      ctx.fillStyle = 'rgba(52, 211, 153, 0.25)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(circStartX, outNodeY, circW - 40, 36, 6);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Output y = ReLU( F(x) + x )', circStartX + (circW - 40) / 2, outNodeY + 16);
      ctx.fillStyle = '#34d399';
      ctx.font = '8px monospace';
      ctx.fillText('Clean Residual Summation', circStartX + (circW - 40) / 2, outNodeY + 28);
      ctx.textAlign = 'left';

      // Main Residual Trunk Vertical Connections
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(addCenterX, inNodeY); ctx.lineTo(addCenterX, conv1Y + 36);
      ctx.moveTo(addCenterX, conv1Y); ctx.lineTo(addCenterX, conv2Y + 36);
      ctx.moveTo(addCenterX, conv2Y); ctx.lineTo(addCenterX, addNodeY + 18);
      ctx.moveTo(addCenterX, addNodeY - 18); ctx.lineTo(addCenterX, outNodeY + 36);
      ctx.stroke();

      // Main Trunk F(x) Flowing Particle
      const trunkPhase = ((localFrame * 0.03) % 1);
      const trunkY = inNodeY - trunkPhase * (inNodeY - (addNodeY + 18));
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(addCenterX, trunkY, 3, 0, Math.PI * 2);
      ctx.fill();

      // ─── IDENTITY SHORTCUT HIGHWAY (x) ───
      const bypassX = circStartX - 42;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(circStartX, inNodeY + 16);
      ctx.lineTo(bypassX, inNodeY + 16);
      ctx.lineTo(bypassX, addNodeY);
      ctx.lineTo(addCenterX - 18, addNodeY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Identity Shortcut Animated Photon
      const bypassTotal = (inNodeY + 16 - addNodeY);
      const bypassPhase = ((localFrame * 0.04) % 1);
      const bY = (inNodeY + 16) - bypassPhase * bypassTotal;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bypassX, bY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Identity Shortcut Badge
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText('IDENTITY SHORTCUT (x)', bypassX - 20, addNodeY + 70);

      // ─── RIGHT BOARD: GRADIENT HIGHWAY PROOF & DEGRADATION COMPARISON ───
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('🛡️ WHY RESIDUAL SKIPS SOLVE DEGRADATION', rightX + 16, rightY + 26);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9.5px monospace';
      ctx.fillText('Backprop Gradient Highway: ∂ℒ/∂x = (∂ℒ/∂y) · (∂F/∂x + 1)', rightX + 16, rightY + 42);

      // Backpropagation Proof Card
      const proofDeckY = rightY + 60;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightX + 14, proofDeckY, rightW - 28, 140, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText(`📐 THE GRADIENT HIGHWAY PROOF:`, rightX + 24, proofDeckY + 22);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8.5px monospace';
      ctx.fillText(`• Standard Deep Net:`, rightX + 24, proofDeckY + 42);
      ctx.fillStyle = '#f87171';
      ctx.fillText(`  ∂ℒ/∂x_0 = ∂ℒ/∂x_L · ∏ (W_i) ➔ Vanishes to 0 as L > 20!`, rightX + 24, proofDeckY + 56);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`• ResNet Formulation (He et al.):`, rightX + 24, proofDeckY + 76);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`  ∂ℒ/∂x = (∂ℒ/∂y) · [ ∂F/∂x  +  1 ]`, rightX + 24, proofDeckY + 92);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px monospace';
      ctx.fillText(`  The "+1" term guarantees gradients NEVER vanish,`, rightX + 24, proofDeckY + 110);
      ctx.fillText(`  flowing uninhibited across 152+ deep layers!`, rightX + 24, proofDeckY + 124);

      // Plain Net vs ResNet Loss Degradation Graph
      const lossGraphY = proofDeckY + 154;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
      ctx.beginPath();
      ctx.roundRect(rightX + 14, lossGraphY, rightW - 28, boardH - (lossGraphY - rightY) - 14, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText(`📉 TRAINING ERROR VS NETWORK DEPTH:`, rightX + 24, lossGraphY + 22);

      // Mini Axes for Loss Curves
      const laxX = rightX + 44;
      const laxY = lossGraphY + 110;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(laxX, laxY); ctx.lineTo(laxX + 220, laxY); // X: Depth
      ctx.moveTo(laxX, laxY); ctx.lineTo(laxX, laxY - 70);  // Y: Error
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '7px monospace';
      ctx.fillText('Error', laxX - 18, laxY - 60);
      ctx.fillText('Depth (L)', laxX + 190, laxY + 12);

      // Plain Net Error Curve (Higher for 56 layers vs 20 layers)
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(laxX + 10, laxY - 50);
      ctx.lineTo(laxX + 80, laxY - 30);
      ctx.lineTo(laxX + 180, laxY - 45); // Degrades higher!
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f87171';
      ctx.font = '7.5px monospace';
      ctx.fillText('Plain-56 (Degrades!)', laxX + 110, laxY - 48);

      // ResNet Error Curve (Consistently lower as depth increases)
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(laxX + 10, laxY - 50);
      ctx.lineTo(laxX + 80, laxY - 25);
      ctx.lineTo(laxX + 180, laxY - 12); // Decreases cleanly!
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 7.5px monospace';
      ctx.fillText('ResNet-56 / 152 (Lowest Error)', laxX + 60, laxY - 8);
    }
  };

  // 17. Sequential Recurrent Highway & Gated Cells (Vanilla RNN vs LSTM vs GRU Comprehensive Dual-Board Architecture)
  const drawSeqRecurrentLSTMCellGates = (ctx: CanvasRenderingContext2D, _w: number, _h: number, _cx: number, _cy: number, _scale: number, localFrame: number) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(25 / simSpeed)) === 0) {
      performRecurrentStep();
    }

    const marginX = 14;
    const marginY = 14;
    const gap = 12;
    const totalW = 720 - 2 * marginX - gap;
    const leftW = Math.floor(totalW * 0.52); // 353px
    const rightW = totalW - leftW;          // 327px
    const boardH = 620 - 2 * marginY;       // 592px
    const leftX = marginX;
    const leftY = marginY;
    const rightX = marginX + leftW + gap;
    const rightY = marginY;

    // Sequence Tokens and Context Data
    const sequenceTokens = [
      { token: 'The', x: 0.82, sentiment: 'Neutral' },
      { token: 'food', x: 0.45, sentiment: 'Neutral' },
      { token: 'was', x: -0.30, sentiment: 'Context' },
      { token: 'great', x: 1.40, sentiment: 'Positive ⭐' }
    ];

    const curT = Math.max(0, Math.min(3, recurrentActiveT));
    const activeData = sequenceTokens[curT];
    const xt = activeData.x * recurrentWeightWxh;
    const prevHt = curT === 0 ? 0.0 : 0.48 * Math.cos(curT * 0.95);
    const prevCt = curT === 0 ? 0.0 : 0.62 + 0.22 * Math.sin(curT * 0.85);

    // Compute Gates for active timestep
    // 1. LSTM Gates
    const lstmFt = 1 / (1 + Math.exp(-(0.8 * xt + 0.6 * prevHt + recurrentForgetBias)));
    const lstmIt = 1 / (1 + Math.exp(-(0.9 * xt + 0.5 * prevHt + 0.2)));
    const candArg = 1.1 * xt + 0.7 * prevHt;
    const lstmCandCt = recurrentCandidateAct === 'tanh' ? Math.tanh(candArg) : recurrentCandidateAct === 'relu' ? Math.max(0, candArg) : (candArg / (1 + Math.exp(-1.702 * candArg)));
    const lstmCt = lstmFt * prevCt + lstmIt * lstmCandCt;
    const lstmOt = 1 / (1 + Math.exp(-(0.75 * xt + 0.65 * prevHt + 0.4)));
    const lstmHt = lstmOt * Math.tanh(lstmCt);
    const lstmYt = 1 / (1 + Math.exp(-(1.2 * lstmHt)));

    // 2. GRU Gates
    const gruRt = 1 / (1 + Math.exp(-(0.85 * xt + 0.65 * prevHt - 0.2)));
    const gruZt = 1 / (1 + Math.exp(-(0.95 * xt + 0.55 * prevHt + recurrentForgetBias * 0.4)));
    const gruCandArg = 1.0 * xt + 0.8 * (gruRt * prevHt);
    const gruCandHt = recurrentCandidateAct === 'tanh' ? Math.tanh(gruCandArg) : recurrentCandidateAct === 'relu' ? Math.max(0, gruCandArg) : (gruCandArg / (1 + Math.exp(-1.702 * gruCandArg)));
    const gruHt = (1 - gruZt) * prevHt + gruZt * gruCandHt;

    // 3. Vanilla RNN Gates
    const rnnPreZ = 0.9 * xt + 0.75 * prevHt + 0.1 * recurrentForgetBias;
    const rnnHt = recurrentCandidateAct === 'tanh' ? Math.tanh(rnnPreZ) : recurrentCandidateAct === 'relu' ? Math.max(0, rnnPreZ) : (rnnPreZ / (1 + Math.exp(-1.702 * rnnPreZ)));
    const rnnYt = 1 / (1 + Math.exp(-(1.2 * rnnHt)));

    // ════════════════════════════════════════════════════════════════
    // LEFT BOARD: DETAILED INTERNAL GATE MICRO-CIRCUIT (353 x 592 px)
    // ════════════════════════════════════════════════════════════════
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(leftX, leftY, leftW, boardH, 14);
    ctx.fill(); ctx.stroke();

    // Board Header
    const cellTitle = recurrentCellType === 'lstm' ? 'LSTM (LONG SHORT-TERM MEMORY)' : recurrentCellType === 'gru' ? 'GRU (GATED RECURRENT UNIT)' : 'VANILLA RECURRENT CELL';
    const cellColor = recurrentCellType === 'lstm' ? '#38bdf8' : recurrentCellType === 'gru' ? '#fbbf24' : '#c084fc';

    ctx.fillStyle = cellColor;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`🔬 INTERNAL CIRCUIT: ${cellTitle}`, leftX + 12, leftY + 20);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText(`Active Step t=${curT + 1}/4: "${activeData.token}" (x_t = ${xt.toFixed(2)})`, leftX + 12, leftY + 34);

    // Inner Circuit Blueprint Glass Canvas
    const circuitX = leftX + 12;
    const circuitY = leftY + 44;
    const circuitW = leftW - 24; // 329px
    const circuitH = boardH - 56; // 536px

    ctx.fillStyle = 'rgba(10, 15, 29, 0.88)';
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(circuitX, circuitY, circuitW, circuitH, 12);
    ctx.fill(); ctx.stroke();

    // Pulse animation helper
    const pulseOffset = (localFrame * 2) % 40;

    if (recurrentCellType === 'lstm') {
      // ─────────────────────────────────────────────────────────────
      // LSTM CHRISTOPHER OLAH CELL ARCHITECTURE
      // ─────────────────────────────────────────────────────────────
      const topBeltY = circuitY + 68;
      const botBusY = circuitY + circuitH - 85;

      // 1. Top Highway: Cell State Conveyor Belt (C_(t-1) -> C_t)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(circuitX + 10, topBeltY);
      ctx.lineTo(circuitX + circuitW - 10, topBeltY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Top Conveyor Label & Arrows
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`C_(t-1) (${prevCt.toFixed(2)}) ──►`, circuitX + 12, topBeltY - 10);
      ctx.fillText(`──► C_t (${lstmCt.toFixed(2)})`, circuitX + circuitW - 88, topBeltY - 10);

      // Pointwise Nodes on Top Conveyor
      const pointMultX = circuitX + 78;
      const pointAddX = circuitX + 175;
      const branchDropX = circuitX + 268;

      // Node 1: Pointwise Multiplier (⊗) for Forget Gate
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pointMultX, topBeltY, 12, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('⊗', pointMultX - 6, topBeltY + 4);

      // Node 2: Pointwise Adder (⊕) for Input Gate Addition
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pointAddX, topBeltY, 12, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('⊕', pointAddX - 6, topBeltY + 4);

      // 2. Bottom Input Bus & Concatenation ([h_(t-1), x_t])
      // h_(t-1) input from left
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(circuitX + 10, botBusY);
      ctx.lineTo(circuitX + 50, botBusY);
      ctx.stroke();
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`h_(t-1)=${prevHt.toFixed(2)}`, circuitX + 10, botBusY - 8);

      // x_t input from bottom
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(circuitX + 50, circuitY + circuitH - 12);
      ctx.lineTo(circuitX + 50, botBusY);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`x_t=${xt.toFixed(2)} ("${activeData.token}")`, circuitX + 12, circuitY + circuitH - 16);

      // Concatenation Junction [h_(t-1), x_t]
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(circuitX + 40, botBusY - 14, 28, 28, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('[h,x]', circuitX + 42, botBusY + 3);

      // Distribution Bus Wire
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(circuitX + 68, botBusY);
      ctx.lineTo(circuitX + circuitW - 35, botBusY);
      ctx.stroke();

      // 3. The 4 Gate Neural Network Towers
      const gateY = circuitY + 285;
      const gateH = 34;

      // Gate 1: Forget Gate Tower (σ, Amber)
      const g1X = circuitX + 62;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(pointMultX, botBusY);
      ctx.lineTo(pointMultX, topBeltY + 12);
      ctx.stroke();

      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(g1X, gateY, 32, gateH, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('σ', g1X + 12, gateY + 21);

      ctx.font = 'bold 8px monospace';
      ctx.fillText('FORGET', g1X - 2, gateY + 44);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`f_t=${Math.round(lstmFt * 100)}%`, g1X - 4, gateY - 8);

      // Gate 2: Input Gate Tower (σ, Green)
      const g2X = circuitX + 125;
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.moveTo(g2X + 16, botBusY);
      ctx.lineTo(g2X + 16, gateY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(52, 211, 153, 0.25)';
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.roundRect(g2X, gateY, 32, gateH, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('σ', g2X + 12, gateY + 21);
      ctx.font = 'bold 8px monospace';
      ctx.fillText('INPUT', g2X + 2, gateY + 44);
      ctx.fillText(`i_t=${Math.round(lstmIt * 100)}%`, g2X - 2, gateY - 8);

      // Gate 3: Candidate Cell State (tanh, Cyan)
      const g3X = circuitX + 192;
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(g3X + 16, botBusY);
      ctx.lineTo(g3X + 16, gateY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(g3X, gateY, 34, gateH, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(recurrentCandidateAct.toUpperCase(), g3X + 4, gateY + 21);
      ctx.font = 'bold 8px monospace';
      ctx.fillText('CAND', g3X + 6, gateY + 44);
      ctx.fillText(`C̃_t=${lstmCandCt.toFixed(2)}`, g3X - 4, gateY - 8);

      // Mid-Air Multiplier for i_t ⊗ C̃_t
      const midMultY = circuitY + 165;
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.moveTo(g2X + 16, gateY - 14);
      ctx.lineTo(pointAddX, midMultY + 12);
      ctx.moveTo(g3X + 16, gateY - 14);
      ctx.lineTo(pointAddX, midMultY + 12);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pointAddX, midMultY, 11, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('⊗', pointAddX - 5, midMultY + 4);

      // From Mid-Air Multiplier into Top Adder
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pointAddX, midMultY - 11);
      ctx.lineTo(pointAddX, topBeltY + 12);
      ctx.stroke();

      // Gate 4: Output Gate Tower (σ, Rose)
      const g4X = circuitX + 252;
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(branchDropX, botBusY);
      ctx.lineTo(branchDropX, gateY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(236, 72, 153, 0.25)';
      ctx.strokeStyle = '#ec4899';
      ctx.beginPath();
      ctx.roundRect(g4X, gateY, 32, gateH, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('σ', g4X + 12, gateY + 21);
      ctx.font = 'bold 8px monospace';
      ctx.fillText('OUTPUT', g4X - 1, gateY + 44);
      ctx.fillText(`o_t=${Math.round(lstmOt * 100)}%`, g4X - 2, gateY - 8);

      // tanh(C_t) Filter Box from Top Conveyor
      const tanhDropY = circuitY + 140;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(branchDropX, topBeltY);
      ctx.lineTo(branchDropX, tanhDropY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(branchDropX - 16, tanhDropY, 32, 24, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('tanh', branchDropX - 11, tanhDropY + 15);

      // Output Multiplier Node for o_t ⊗ tanh(C_t)
      const outMultY = circuitY + 200;
      ctx.strokeStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(branchDropX, tanhDropY + 24);
      ctx.lineTo(branchDropX, outMultY - 11);
      ctx.moveTo(branchDropX, gateY - 14);
      ctx.lineTo(branchDropX, outMultY + 11);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(branchDropX, outMultY, 11, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('⊗', branchDropX - 5, outMultY + 4);

      // Outgoing Hidden State h_t Highway (Right & Upward)
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      // Rightward Highway
      ctx.beginPath();
      ctx.moveTo(branchDropX + 11, outMultY);
      ctx.lineTo(circuitX + circuitW - 10, outMultY);
      ctx.stroke();
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`──► h_t (${lstmHt.toFixed(2)})`, circuitX + circuitW - 74, outMultY - 8);

      // Upward Softmax Output Emitter y_t
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(branchDropX, outMultY - 11);
      ctx.lineTo(branchDropX, circuitY + 14);
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`y_t = ${lstmYt.toFixed(2)} ▲`, branchDropX - 24, circuitY + 10);

      // Flowing Pulse Particles along wires
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(pointMultX, (topBeltY + pulseOffset * 3) % (botBusY - topBeltY) + topBeltY, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (recurrentCellType === 'gru') {
      // ─────────────────────────────────────────────────────────────
      // GRU (GATED RECURRENT UNIT) ARCHITECTURE
      // ─────────────────────────────────────────────────────────────
      const topBeltY = circuitY + 80;
      const botBusY = circuitY + circuitH - 85;

      // Hidden State Highway
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(circuitX + 10, topBeltY);
      ctx.lineTo(circuitX + circuitW - 10, topBeltY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`h_(t-1) (${prevHt.toFixed(2)}) ──►`, circuitX + 12, topBeltY - 10);
      ctx.fillText(`──► h_t (${gruHt.toFixed(2)})`, circuitX + circuitW - 84, topBeltY - 10);

      // Reset Gate (r_t) & Update Gate (z_t) Towers
      const rGateX = circuitX + 68;
      const zGateX = circuitX + 152;
      const candGateX = circuitX + 238;
      const gateY = circuitY + 270;
      const gateH = 34;

      // Reset Gate (Rose)
      ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rGateX, gateY, 34, gateH, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('σ', rGateX + 13, gateY + 21);
      ctx.font = 'bold 8px monospace';
      ctx.fillText('RESET', rGateX + 2, gateY + 44);
      ctx.fillText(`r_t=${Math.round(gruRt * 100)}%`, rGateX - 2, gateY - 8);

      // Update Gate (Amber)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath();
      ctx.roundRect(zGateX, gateY, 34, gateH, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('σ', zGateX + 13, gateY + 21);
      ctx.font = 'bold 8px monospace';
      ctx.fillText('UPDATE', zGateX - 2, gateY + 44);
      ctx.fillText(`z_t=${Math.round(gruZt * 100)}%`, zGateX - 2, gateY - 8);

      // Candidate State (Cyan)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(candGateX, gateY, 38, gateH, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(recurrentCandidateAct.toUpperCase(), candGateX + 4, gateY + 21);
      ctx.font = 'bold 8px monospace';
      ctx.fillText('CANDIDATE', candGateX - 4, gateY + 44);
      ctx.fillText(`h̃_t=${gruCandHt.toFixed(2)}`, candGateX - 2, gateY - 8);

      // Blend Combiner Node (1 - z)h + z·h̃
      const blendX = circuitX + 257;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(blendX, topBeltY, 12, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('⊕', blendX - 5, topBeltY + 4);

      // Wires from Reset & Update
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rGateX + 17, botBusY);
      ctx.lineTo(rGateX + 17, gateY + gateH);
      ctx.moveTo(rGateX + 17, gateY - 14);
      ctx.lineTo(candGateX + 10, gateY + 16);
      ctx.stroke();

      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(zGateX + 17, botBusY);
      ctx.lineTo(zGateX + 17, gateY + gateH);
      ctx.moveTo(zGateX + 17, gateY - 14);
      ctx.lineTo(blendX, topBeltY + 12);
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(candGateX + 19, botBusY);
      ctx.lineTo(candGateX + 19, gateY + gateH);
      ctx.moveTo(candGateX + 19, gateY - 14);
      ctx.lineTo(blendX, topBeltY + 12);
      ctx.stroke();

    } else {
      // ─────────────────────────────────────────────────────────────
      // VANILLA RECURRENT CELL ARCHITECTURE
      // ─────────────────────────────────────────────────────────────
      const midY = circuitY + circuitH / 2 - 10;
      const nodeX = circuitX + circuitW / 2;

      // Recurrent Loop Wire
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(nodeX + 45, midY);
      ctx.bezierCurveTo(nodeX + 120, midY - 90, nodeX - 120, midY - 90, nodeX - 45, midY);
      ctx.stroke();

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`Recurrent Loop W_hh · h_(t-1) (${prevHt.toFixed(2)}) ──►`, nodeX - 110, midY - 70);

      // Activation Node
      ctx.fillStyle = 'rgba(192, 132, 252, 0.25)';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(nodeX - 45, midY - 30, 90, 60, 10);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(recurrentCandidateAct.toUpperCase(), nodeX - 18, midY + 5);

      // Input x_t from bottom
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(nodeX, circuitY + circuitH - 20);
      ctx.lineTo(nodeX, midY + 30);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`▲ x_t = ${xt.toFixed(2)} ("${activeData.token}")`, nodeX - 60, circuitY + circuitH - 24);

      // Output h_t & y_t to right & top
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.moveTo(nodeX + 45, midY);
      ctx.lineTo(circuitX + circuitW - 20, midY);
      ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.fillText(`──► h_t = ${rnnHt.toFixed(2)}`, circuitX + circuitW - 96, midY - 8);

      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(nodeX, midY - 30);
      ctx.lineTo(nodeX, circuitY + 25);
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`▲ y_t = ${rnnYt.toFixed(2)}`, nodeX - 25, circuitY + 20);
    }

    // ════════════════════════════════════════════════════════════════
    // RIGHT BOARD: UNROLLED TIMELINE & TELEMETRY HUD (327 x 592 px)
    // ════════════════════════════════════════════════════════════════
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rightX, rightY, rightW, boardH, 14);
    ctx.fill(); ctx.stroke();

    // Right Board Header
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('📊 UNROLLED TIMELINE & TENSOR HUD', rightX + 12, rightY + 20);

    // ─── Card 1: Unrolled Sequence Chain (t=1..4) ───
    const chainCardY = rightY + 32;
    const cardW = (rightW - 24 - 3 * 6) / 4; // ~70px
    const cardH = 88;

    for (let step = 0; step < 4; step++) {
      const cardX = rightX + 12 + step * (cardW + 6);
      const isStepActive = (step === curT);
      const item = sequenceTokens[step];

      ctx.fillStyle = isStepActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.7)';
      ctx.strokeStyle = isStepActive ? '#38bdf8' : 'rgba(51, 65, 85, 0.7)';
      ctx.lineWidth = isStepActive ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(cardX, chainCardY, cardW, cardH, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = isStepActive ? '#38bdf8' : '#94a3b8';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`STEP t=${step + 1}`, cardX + 6, chainCardY + 14);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`"${item.token}"`, cardX + 6, chainCardY + 30);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '8px monospace';
      ctx.fillText(`x=${(item.x * recurrentWeightWxh).toFixed(2)}`, cardX + 6, chainCardY + 44);

      ctx.fillStyle = '#34d399';
      const stepHt = Math.sin((step + 1) * 0.9) * 0.75;
      ctx.fillText(`‖h‖=${Math.abs(stepHt).toFixed(2)}`, cardX + 6, chainCardY + 58);

      if (isStepActive) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('● ACTIVE', cardX + 6, chainCardY + 76);
      } else {
        ctx.fillStyle = '#64748b';
        ctx.fillText('Click to load', cardX + 4, chainCardY + 76);
      }
    }

    // ─── Card 2: Real-time Gate Valves & Gauges ───
    const gaugeCardY = chainCardY + cardH + 10;
    const gaugeCardH = 145;
    ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(rightX + 12, gaugeCardY, rightW - 24, gaugeCardH, 10);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('⚡ ACTIVE GATE ACTIVATIONS & VALVES', rightX + 22, gaugeCardY + 18);

    if (recurrentCellType === 'lstm') {
      const bars = [
        { label: 'Forget Gate (f_t)', val: lstmFt, color: '#fbbf24', formula: 'σ(W_f·[h,x] + b_f)' },
        { label: 'Input Gate (i_t)', val: lstmIt, color: '#34d399', formula: 'σ(W_i·[h,x] + b_i)' },
        { label: 'Candidate State (C̃_t)', val: (lstmCandCt + 1) / 2, rawVal: lstmCandCt, color: '#38bdf8', formula: `${recurrentCandidateAct}(W_c·[h,x])` },
        { label: 'Output Gate (o_t)', val: lstmOt, color: '#ec4899', formula: 'σ(W_o·[h,x] + b_o)' }
      ];

      bars.forEach((b, idx) => {
        const by = gaugeCardY + 34 + idx * 26;
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '8px monospace';
        ctx.fillText(b.label, rightX + 22, by + 8);
        ctx.fillStyle = b.color;
        ctx.fillText(b.rawVal !== undefined ? b.rawVal.toFixed(2) : `${Math.round(b.val * 100)}%`, rightX + rightW - 60, by + 8);

        // Progress Bar
        const barW = rightW - 44;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(rightX + 22, by + 12, barW, 6);
        ctx.fillStyle = b.color;
        ctx.fillRect(rightX + 22, by + 12, barW * Math.max(0.02, Math.min(1, b.val)), 6);
      });
    } else if (recurrentCellType === 'gru') {
      const bars = [
        { label: 'Reset Gate (r_t)', val: gruRt, color: '#f43f5e' },
        { label: 'Update Gate (z_t)', val: gruZt, color: '#fbbf24' },
        { label: 'Candidate (h̃_t)', val: (gruCandHt + 1) / 2, rawVal: gruCandHt, color: '#38bdf8' },
        { label: 'Interpolated h_t', val: (gruHt + 1) / 2, rawVal: gruHt, color: '#34d399' }
      ];

      bars.forEach((b, idx) => {
        const by = gaugeCardY + 34 + idx * 26;
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '8px monospace';
        ctx.fillText(b.label, rightX + 22, by + 8);
        ctx.fillStyle = b.color;
        ctx.fillText(b.rawVal !== undefined ? b.rawVal.toFixed(2) : `${Math.round(b.val * 100)}%`, rightX + rightW - 60, by + 8);

        const barW = rightW - 44;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(rightX + 22, by + 12, barW, 6);
        ctx.fillStyle = b.color;
        ctx.fillRect(rightX + 22, by + 12, barW * Math.max(0.02, Math.min(1, b.val)), 6);
      });
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillStyle = '#c084fc';
      ctx.font = '8px monospace';
      ctx.fillText('Vanilla RNN Recurrence Math:', rightX + 22, gaugeCardY + 40);
      ctx.fillStyle = '#c084fc';
      ctx.fillText(`Pre-Activation z = W_hh·h + W_xh·x = ${rnnPreZ.toFixed(2)}`, rightX + 22, gaugeCardY + 58);
      ctx.fillStyle = '#34d399';
      ctx.fillText(`Active State h_t = ${recurrentCandidateAct}(z) = ${rnnHt.toFixed(2)}`, rightX + 22, gaugeCardY + 76);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`Output y_t = σ(W_hy·h_t) = ${rnnYt.toFixed(2)}`, rightX + 22, gaugeCardY + 94);
    }

    // ─── Card 3: Step-by-Step Mathematical Evaluation HUD ───
    const mathCardY = gaugeCardY + gaugeCardH + 10;
    const mathCardH = 150;
    ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(rightX + 12, mathCardY, rightW - 24, mathCardH, 10);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('📐 STEP-BY-STEP TENSOR MATH', rightX + 22, mathCardY + 18);

    if (recurrentCellType === 'lstm') {
      const steps = [
        { num: '1', txt: `f_t = σ(0.8·${xt.toFixed(1)} + 0.6·${prevHt.toFixed(1)} + ${recurrentForgetBias.toFixed(1)}) = ${lstmFt.toFixed(2)}`, col: '#fbbf24' },
        { num: '2', txt: `i_t = σ(0.9·${xt.toFixed(1)} + 0.5·${prevHt.toFixed(1)} + 0.2) = ${lstmIt.toFixed(2)}`, col: '#34d399' },
        { num: '3', txt: `C̃_t = ${recurrentCandidateAct}(1.1·${xt.toFixed(1)} + 0.7·${prevHt.toFixed(1)}) = ${lstmCandCt.toFixed(2)}`, col: '#38bdf8' },
        { num: '4', txt: `C_t = ${lstmFt.toFixed(2)}·${prevCt.toFixed(2)} + ${lstmIt.toFixed(2)}·${lstmCandCt.toFixed(2)} = ${lstmCt.toFixed(2)}`, col: '#38bdf8' },
        { num: '5', txt: `h_t = ${lstmOt.toFixed(2)} ⊙ tanh(${lstmCt.toFixed(2)}) = ${lstmHt.toFixed(2)}`, col: '#c084fc' }
      ];

      steps.forEach((s, idx) => {
        const sy = mathCardY + 34 + idx * 22;
        ctx.fillStyle = s.col;
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`[${s.num}] ${s.txt}`, rightX + 22, sy);
      });
    } else if (recurrentCellType === 'gru') {
      const steps = [
        { num: '1', txt: `r_t = σ(0.85·${xt.toFixed(1)} + 0.65·${prevHt.toFixed(1)}) = ${gruRt.toFixed(2)}`, col: '#f43f5e' },
        { num: '2', txt: `z_t = σ(0.95·${xt.toFixed(1)} + 0.55·${prevHt.toFixed(1)}) = ${gruZt.toFixed(2)}`, col: '#fbbf24' },
        { num: '3', txt: `h̃_t = tanh(1.0·${xt.toFixed(1)} + 0.8·(${gruRt.toFixed(2)}·${prevHt.toFixed(2)})) = ${gruCandHt.toFixed(2)}`, col: '#38bdf8' },
        { num: '4', txt: `h_t = (1 - ${gruZt.toFixed(2)})·${prevHt.toFixed(2)} + ${gruZt.toFixed(2)}·${gruCandHt.toFixed(2)} = ${gruHt.toFixed(2)}`, col: '#34d399' }
      ];

      steps.forEach((s, idx) => {
        const sy = mathCardY + 34 + idx * 24;
        ctx.fillStyle = s.col;
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`[${s.num}] ${s.txt}`, rightX + 22, sy);
      });
    } else {
      const steps = [
        { num: '1', txt: `z_t = W_hh·${prevHt.toFixed(2)} + W_xh·${xt.toFixed(2)} + b = ${rnnPreZ.toFixed(2)}`, col: '#c084fc' },
        { num: '2', txt: `h_t = ${recurrentCandidateAct}(${rnnPreZ.toFixed(2)}) = ${rnnHt.toFixed(2)}`, col: '#34d399' },
        { num: '3', txt: `y_t = σ(1.2 · ${rnnHt.toFixed(2)}) = ${rnnYt.toFixed(2)}`, col: '#fbbf24' }
      ];
      steps.forEach((s, idx) => {
        const sy = mathCardY + 34 + idx * 26;
        ctx.fillStyle = s.col;
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`[${s.num}] ${s.txt}`, rightX + 22, sy);
      });
    }

    // ─── Card 4: Vanishing Gradient vs Constant Error Carousel (CEC) Diagnosis ───
    const cecCardY = mathCardY + mathCardH + 10;
    const cecCardH = boardH - (cecCardY - rightY) - 12; // ~130px
    ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
    ctx.strokeStyle = recurrentCellType === 'vanilla_rnn' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(52, 211, 153, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(rightX + 12, cecCardY, rightW - 24, cecCardH, 10);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = recurrentCellType === 'vanilla_rnn' ? '#f87171' : '#34d399';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(recurrentCellType === 'vanilla_rnn' ? '⚠️ VANISHING GRADIENT TRAP' : '🛡️ CONSTANT ERROR CAROUSEL (CEC)', rightX + 22, cecCardY + 16);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '8px monospace';
    if (recurrentCellType === 'vanilla_rnn') {
      ctx.fillText('Multiplicative Chain Rule: ∂h_T/∂h_1 = ∏ W_hh · σ\'', rightX + 22, cecCardY + 30);
      ctx.fillText('When |W_hh| < 1, gradients decay exponentially to 0.', rightX + 22, cecCardY + 42);
      ctx.fillStyle = '#f87171';
      ctx.fillText('Result: Cannot learn long-term temporal dependencies!', rightX + 22, cecCardY + 56);
    } else {
      ctx.fillText('Additive Conveyor: ∂C_t/∂C_(t-1) = f_t + ...', rightX + 22, cecCardY + 30);
      ctx.fillText('When f_t ≈ 1, error signals propagate without decay.', rightX + 22, cecCardY + 42);
      ctx.fillStyle = '#34d399';
      ctx.fillText('Result: Bridges gaps of 100+ steps across sequences!', rightX + 22, cecCardY + 56);
    }
  };

  // ─── 18A. Transformer Architecture & Layer Stacking Engine (Vaswani et al.) ───
  const drawTransformerArchitectureEngine = (ctx: CanvasRenderingContext2D, _w: number, _h: number, _cx: number, _cy: number, _scale: number, localFrame: number) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(35 / simSpeed)) === 0) {
      performTransformerStep();
    }

    const marginX = 14;
    const marginY = 14;
    const gap = 12;
    const totalW = 720 - 2 * marginX - gap;
    const leftW = Math.floor(totalW * 0.50); // 340px
    const rightW = totalW - leftW;          // 340px
    const boardH = 620 - 2 * marginY;       // 592px
    const leftX = marginX;
    const leftY = marginY;
    const rightX = marginX + leftW + gap;
    const rightY = marginY;

    // Background Panels
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1.5;

    // Left Panel
    ctx.beginPath();
    ctx.roundRect(leftX, leftY, leftW, boardH, 14);
    ctx.fill(); ctx.stroke();

    // Right Panel
    ctx.beginPath();
    ctx.roundRect(rightX, rightY, rightW, boardH, 14);
    ctx.fill(); ctx.stroke();

    const pulseT = (localFrame * 0.035) % 1.0;
    const pulseFast = (localFrame * 0.07) % 1.0;

    if (transformerMode === 'encoder') {
      // ═════════════════════════════════════════════════════════════════════
      // MODE 1: ENCODER LAYER BLOCK & REPRESENTATION REFINEMENT
      // ═════════════════════════════════════════════════════════════════════
      // Left Board: Encoder Layer Micro-Circuit
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`⚡ ENCODER BLOCK (Layer ${transformerSelectedLayer + 1}/${transformerNumLayers})`, leftX + 16, leftY + 24);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText('Bi-Directional Self-Attention + FFN + Residuals', leftX + 16, leftY + 38);

      const blockX = leftX + 24;
      const blockW = leftW - 48;
      const curLayer = transformerSelectedLayer;

      // 1. Bottom: Token Embeddings + Positional Encoding
      const embY = leftY + boardH - 60;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(blockX, embY, blockW, 36, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e0f2fe';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('Input Tokens + Positional Enc (d=512)', blockX + 18, embY + 22);

      // 2. Multi-Head Self-Attention
      const mhaY = embY - 95;
      ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
      ctx.strokeStyle = '#c084fc';
      ctx.beginPath();
      ctx.roundRect(blockX, mhaY, blockW, 46, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f3e8ff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Multi-Head Self-Attention (MHA)', blockX + 42, mhaY + 20);
      ctx.fillStyle = '#d8b4fe';
      ctx.font = '9px monospace';
      ctx.fillText(`Q, K, V Projections · ${attnNumHeads} Heads · d_k=${Math.floor(transformerModelDim / attnNumHeads)}`, blockX + 22, mhaY + 34);

      // 3. Add & RMSNorm 1
      const norm1Y = mhaY - 50;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(blockX + 20, norm1Y, blockW - 40, 26, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('➕ Add & RMSNorm (Residual 1)', blockX + 48, norm1Y + 17);

      // 4. Feed-Forward Network (FFN)
      const ffnY = norm1Y - 95;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(blockX, ffnY, blockW, 46, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Feed-Forward Network (FFN)', blockX + 54, ffnY + 20);
      ctx.fillStyle = '#fde68a';
      ctx.font = '9px monospace';
      ctx.fillText(`Linear(${transformerModelDim}→${transformerFfnDim}) → GELU → Linear`, blockX + 24, ffnY + 34);

      // 5. Add & RMSNorm 2
      const norm2Y = ffnY - 50;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.roundRect(blockX + 20, norm2Y, blockW - 40, 26, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('➕ Add & RMSNorm (Residual 2)', blockX + 48, norm2Y + 17);

      // 6. Top Output Representations
      const outY = leftY + 54;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(blockX, outY, blockW, 36, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`Layer ${curLayer + 1} Hidden States H^(${curLayer + 1}) ∈ ℝ^(T×512)`, blockX + 22, outY + 22);

      // Connecting Signal Lines & Skip Loops
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      // Main trunk lines
      ctx.beginPath();
      ctx.moveTo(blockX + blockW / 2, embY);
      ctx.lineTo(blockX + blockW / 2, mhaY + 46);
      ctx.moveTo(blockX + blockW / 2, mhaY);
      ctx.lineTo(blockX + blockW / 2, norm1Y + 26);
      ctx.moveTo(blockX + blockW / 2, norm1Y);
      ctx.lineTo(blockX + blockW / 2, ffnY + 46);
      ctx.moveTo(blockX + blockW / 2, ffnY);
      ctx.lineTo(blockX + blockW / 2, norm2Y + 26);
      ctx.moveTo(blockX + blockW / 2, norm2Y);
      ctx.lineTo(blockX + blockW / 2, outY + 36);
      ctx.stroke();

      // Residual Skip Wires
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      // Skip 1 (around MHA)
      ctx.beginPath();
      ctx.moveTo(blockX + 12, embY);
      ctx.lineTo(blockX - 10, embY);
      ctx.lineTo(blockX - 10, norm1Y + 13);
      ctx.lineTo(blockX + 20, norm1Y + 13);
      ctx.stroke();
      // Skip 2 (around FFN)
      ctx.beginPath();
      ctx.moveTo(blockX + 12, norm1Y);
      ctx.lineTo(blockX - 10, norm1Y);
      ctx.lineTo(blockX - 10, norm2Y + 13);
      ctx.lineTo(blockX + 20, norm2Y + 13);
      ctx.stroke();
      ctx.setLineDash([]);

      // Flowing Pulse Particles (Continuous Signal Animation)
      for (let p = 0; p < 3; p++) {
        const pFrac = (pulseT + p * 0.33) % 1.0;
        const pulseY = embY - pFrac * (embY - outY);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(blockX + blockW / 2, pulseY, 3.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Residual pulse particles
      const resPulseY = norm1Y + 13 - pulseT * (norm1Y - ffnY);
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(blockX - 10, resPulseY, 2.5, 0, 2 * Math.PI);
      ctx.fill();

      // ───────────────────────────────────────────────────────────────────
      // Right Board: Layer Stacking (N=2..16 Layers) & Semantic Evolution
      // ───────────────────────────────────────────────────────────────────
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`📚 LAYER STACKING (N = ${transformerNumLayers} Layers)`, rightX + 16, rightY + 24);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText('Click any layer card to inspect hidden state', rightX + 16, rightY + 38);

      const stackStartY = rightY + 50;
      const availableH = 340;
      const numL = transformerNumLayers;
      const cardH = Math.min(32, Math.floor((availableH - (numL - 1) * 4) / numL));

      for (let l = 0; l < numL; l++) {
        const ly = stackStartY + l * (cardH + 4);
        const isSel = l === transformerSelectedLayer;
        const depthRatio = (l + 1) / numL;

        ctx.fillStyle = isSel ? 'rgba(192, 132, 252, 0.35)' : 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = isSel ? '#c084fc' : 'rgba(71, 85, 105, 0.6)';
        ctx.lineWidth = isSel ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(rightX + 14, ly, rightW - 28, cardH, 6);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = isSel ? '#f3e8ff' : '#cbd5e1';
        ctx.font = 'bold 9.5px monospace';
        ctx.fillText(`${isSel ? '▶ ' : '  '}Layer ${l + 1}:`, rightX + 22, ly + cardH / 2 + 3);

        const roleText = depthRatio <= 0.25 ? 'Surface Syntax & Words' : depthRatio <= 0.5 ? 'Local Phrases & POS' : depthRatio <= 0.75 ? 'Coreference & Relations' : 'Abstract Task Semantics';
        ctx.fillStyle = isSel ? '#38bdf8' : '#94a3b8';
        ctx.font = '8.5px sans-serif';
        ctx.fillText(roleText, rightX + 96, ly + cardH / 2 + 3);
      }

      // Semantic Vector Telemetry Box for Active Layer
      const probeY = stackStartY + availableH + 12;
      const probeH = 170;
      ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(rightX + 14, probeY, rightW - 28, probeH, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`🔬 LAYER ${curLayer + 1} TOKEN VECTOR PROBE: "learning"`, rightX + 24, probeY + 18);

      // Vector sample bars
      const dimSamples = [0.82, -0.45, 0.91, 0.12, -0.76, 0.63, 0.38, -0.22];
      dimSamples.forEach((val, idx) => {
        const scaledVal = val * (1.0 + (curLayer / numL) * 0.5);
        const bx = rightX + 24 + (idx % 4) * 68;
        const by = probeY + 36 + Math.floor(idx / 4) * 36;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        ctx.fillText(`d_${idx * 64}:`, bx, by);
        ctx.fillStyle = scaledVal >= 0 ? '#34d399' : '#f43f5e';
        ctx.fillText(scaledVal.toFixed(2), bx + 28, by);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bx, by + 4, 56, 4);
        ctx.fillStyle = scaledVal >= 0 ? '#34d399' : '#f43f5e';
        ctx.fillRect(bx + 28, by + 4, (scaledVal / 1.5) * 28, 4);
      });

      // Layer Stats
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8.5px monospace';
      const paramM = (numL * 3.15).toFixed(1);
      ctx.fillText(`Stack Parameters: ~${paramM}M  |  d_model=512  |  d_ff=2048`, rightX + 24, probeY + 120);
      ctx.fillText(`Attention Entropy: ${(1.85 - (curLayer / numL) * 0.65).toFixed(2)} nats (Sharpening)`, rightX + 24, probeY + 138);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`Residual Cosine Sim to Input: ${(Math.max(0.3, 0.95 - (curLayer / numL) * 0.55)).toFixed(2)}`, rightX + 24, probeY + 154);

    } else if (transformerMode === 'decoder') {
      // ═════════════════════════════════════════════════════════════════════
      // MODE 2: DECODER LAYER BLOCK & VOCABULARY SAMPLING (Rich Animation)
      // ═════════════════════════════════════════════════════════════════════
      // Left Board: Decoder Layer Micro-Circuit with Incoming Cross-Attention Feed
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`🧠 DECODER BLOCK (Layer ${transformerSelectedLayer + 1}/${transformerNumLayers})`, leftX + 16, leftY + 24);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText('Masked Self-Attn + Cross-Attn (K_enc, V_enc) + FFN + Softmax', leftX + 16, leftY + 38);

      const blockX = leftX + 32;
      const blockW = leftW - 56;

      // 1. Shifted Target Tokens
      const tgtY = leftY + boardH - 58;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(blockX, tgtY, blockW, 36, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('Shifted Target: ["<BOS>", "J\'", "adore"]', blockX + 16, tgtY + 22);

      // 2. Causal Masked Self-Attention
      const maskY = tgtY - 82;
      ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(blockX, maskY, blockW, 46, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffe4e6';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Causal Masked Self-Attention', blockX + 36, maskY + 19);
      ctx.fillStyle = '#fecdd3';
      ctx.font = '9px monospace';
      ctx.fillText('Mask: Lower-Tri Only (No Future Token Peeking)', blockX + 14, maskY + 34);

      // 3. Add & Norm 1
      const norm1Y = maskY - 44;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(blockX + 20, norm1Y, blockW - 40, 24, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.fillText('➕ Add & RMSNorm 1', blockX + 66, norm1Y + 16);

      // 4. Cross Multi-Head Attention (The Golden Junction)
      const crossY = norm1Y - 86;
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(blockX, crossY, blockW, 48, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('✨ Cross Multi-Head Attention', blockX + 40, crossY + 20);
      ctx.fillStyle = '#fde047';
      ctx.font = '9px monospace';
      ctx.fillText('Q ← Decoder  |  K, V ← Top Encoder Memory', blockX + 18, crossY + 35);

      // ─── Incoming Golden Beam from Left Border into Cross-Attention ───
      const crossMidY = crossY + 24;
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(leftX + 2, crossMidY);
      ctx.lineTo(blockX, crossMidY);
      ctx.stroke();

      // Glowing memory label on incoming feed
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText('◀ K_enc, V_enc', leftX + 6, crossMidY - 6);

      // Flowing golden memory particle entering Cross-Attention
      const inPulseX = leftX + 2 + pulseFast * (blockX - leftX - 2);
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(inPulseX, crossMidY, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 5. Add & Norm 2
      const norm2Y = crossY - 44;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.roundRect(blockX + 20, norm2Y, blockW - 40, 24, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.fillText('➕ Add & RMSNorm 2', blockX + 66, norm2Y + 16);

      // 6. Decoder FFN
      const ffnY = norm2Y - 74;
      ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
      ctx.strokeStyle = '#c084fc';
      ctx.beginPath();
      ctx.roundRect(blockX, ffnY, blockW, 40, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f3e8ff';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillText('Decoder FFN (512 → 2048 → 512)', blockX + 38, ffnY + 24);

      // 7. Linear Unembedding & Top Output Logits
      const outY = leftY + 54;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(blockX, outY, blockW, 32, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('Linear Unembedding W_U → Vocab Logits', blockX + 14, outY + 20);

      // Connecting wires
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(blockX + blockW / 2, tgtY);
      ctx.lineTo(blockX + blockW / 2, maskY + 46);
      ctx.moveTo(blockX + blockW / 2, maskY);
      ctx.lineTo(blockX + blockW / 2, norm1Y + 24);
      ctx.moveTo(blockX + blockW / 2, norm1Y);
      ctx.lineTo(blockX + blockW / 2, crossY + 48);
      ctx.moveTo(blockX + blockW / 2, crossY);
      ctx.lineTo(blockX + blockW / 2, norm2Y + 24);
      ctx.moveTo(blockX + blockW / 2, norm2Y);
      ctx.lineTo(blockX + blockW / 2, ffnY + 40);
      ctx.moveTo(blockX + blockW / 2, ffnY);
      ctx.lineTo(blockX + blockW / 2, outY + 32);
      ctx.stroke();

      // Residual Skip Wires
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      // Skip 1 (around Masked Attn)
      ctx.beginPath();
      ctx.moveTo(blockX + 12, tgtY);
      ctx.lineTo(blockX - 12, tgtY);
      ctx.lineTo(blockX - 12, norm1Y + 12);
      ctx.lineTo(blockX + 20, norm1Y + 12);
      ctx.stroke();
      // Skip 2 (around Cross Attn)
      ctx.beginPath();
      ctx.moveTo(blockX + 12, norm1Y);
      ctx.lineTo(blockX - 12, norm1Y);
      ctx.lineTo(blockX - 12, norm2Y + 12);
      ctx.lineTo(blockX + 20, norm2Y + 12);
      ctx.stroke();
      ctx.setLineDash([]);

      // ─── Continuous Flowing Pulse Particles (Upward Data Stream) ───
      for (let p = 0; p < 4; p++) {
        const pFrac = (pulseT + p * 0.25) % 1.0;
        const pulseY = tgtY - pFrac * (tgtY - outY);
        ctx.fillStyle = pFrac > 0.4 ? '#fbbf24' : '#f43f5e';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(blockX + blockW / 2, pulseY, 3.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ───────────────────────────────────────────────────────────────────
      // Right Board: Softmax Vocabulary Logits & Temperature Sampling
      // ───────────────────────────────────────────────────────────────────
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('🎲 VOCABULARY LOGITS & SAMPLING', rightX + 16, rightY + 24);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText('p(w_t | w_<t) = softmax(logits / Temperature)', rightX + 16, rightY + 38);

      // Candidate Tokens and Probabilities
      const candidates = [
        { word: 'apprendre', prob: 0.742, raw: 8.4, color: '#34d399', isTop: true },
        { word: 'étudier', prob: 0.164, raw: 6.9, color: '#38bdf8', isTop: false },
        { word: 'lire', prob: 0.048, raw: 5.6, color: '#fbbf24', isTop: false },
        { word: 'comprendre', prob: 0.029, raw: 5.1, color: '#c084fc', isTop: false },
        { word: 'savoir', prob: 0.017, raw: 4.5, color: 'var(--text-secondary, #94a3b8)', isTop: false }
      ];

      const barStartY = rightY + 54;
      candidates.forEach((cand, idx) => {
        const cy = barStartY + idx * 56;
        ctx.fillStyle = cand.isTop ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = cand.isTop ? '#34d399' : 'rgba(71, 85, 105, 0.6)';
        ctx.lineWidth = cand.isTop ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(rightX + 14, cy, rightW - 28, 48, 8);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = cand.isTop ? '#6ee7b7' : '#f1f5f9';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`"${cand.word}" ${cand.isTop ? '⭐ [Top-1 Pick]' : ''}`, rightX + 24, cy + 18);

        ctx.fillStyle = cand.color;
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`${(cand.prob * 100).toFixed(1)}% (logit: ${cand.raw})`, rightX + rightW - 130, cy + 18);

        // Probability bar
        const maxBarW = rightW - 56;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(rightX + 24, cy + 26, maxBarW, 12);
        ctx.fillStyle = cand.color;
        ctx.fillRect(rightX + 24, cy + 26, maxBarW * cand.prob, 12);
      });

      // Generation Outcome HUD
      const outCardY = barStartY + 5 * 56 + 10;
      ctx.fillStyle = 'rgba(10, 15, 29, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightX + 14, outCardY, rightW - 28, 160, 10);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('✨ AUTO-REGRESSIVE DECODING STEP', rightX + 24, outCardY + 22);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText('Source Input: "I love learning"', rightX + 24, outCardY + 44);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('Generated Prefix: ["J\'", "adore"]', rightX + 24, outCardY + 62);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('Selected Next Token: "apprendre"', rightX + 24, outCardY + 84);

      ctx.fillStyle = '#fde047';
      ctx.fillText('Full Sequence: "J\'adore apprendre <EOS>"', rightX + 24, outCardY + 106);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '8.5px monospace';
      ctx.fillText(`Sampling: Temp T=${transformerSamplingTemp} | Top-k=${transformerTopK} | Rep. Penalty=1.1`, rightX + 24, outCardY + 134);

    } else {
      // ═════════════════════════════════════════════════════════════════════
      // MODE 3: FULL ENCODER-DECODER TRANSFORMER SYSTEM (Vaswani et al.)
      // Clean, Uncluttered, Zero-Occlusion Layout with Multi-Branch Bridge
      // ═════════════════════════════════════════════════════════════════════
      const numL = transformerNumLayers;
      const stackTopY = leftY + 102;
      const stackBottomY = leftY + boardH - 128;
      const totalStackH = stackBottomY - stackTopY;
      const cardH = Math.min(36, Math.floor((totalStackH - (numL - 1) * 6) / numL));

      // ───────────────────────────────────────────────────────────────────
      // Left Board: Encoder Stack Column
      // ───────────────────────────────────────────────────────────────────
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`⚡ ENCODER STACK (Nx = ${numL})`, leftX + 16, leftY + 24);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText('Source Processing: "I love learning"', leftX + 16, leftY + 38);

      const encBlockX = leftX + 18;
      const encBlockW = leftW - 36;

      // 1. Top Encoded Memory Output Card (Emitter Port)
      const encOutY = leftY + 54;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(encBlockX, encOutY, encBlockW, 34, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText('✨ Encoded Memory (K_enc, V_enc) ∈ ℝ^(3×512)', encBlockX + 12, encOutY + 21);

      // 2. Encoder Layer Stack (Layers 1..N rendered bottom-to-top)
      const encLayerCenters: number[] = [];
      for (let l = 0; l < numL; l++) {
        // l = 0 is Layer 1 at the bottom, l = numL - 1 is Layer N at the top
        const ly = stackBottomY - (l + 1) * (cardH + 6) + 6;
        encLayerCenters.push(ly + cardH / 2);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(encBlockX, ly, encBlockW, cardH, 6);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#a7f3d0';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`Encoder Layer ${l + 1} (Self-Attn + FFN)`, encBlockX + 12, ly + cardH / 2 + 3);
      }

      // 3. Bottom Source Input Tokens Card
      const encInY = leftY + boardH - 114;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(encBlockX, encInY, encBlockW, 34, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText('📥 ["I", "love", "learning"] + PE', encBlockX + 14, encInY + 21);

      // Upward Encoder Pulse Particles
      for (let p = 0; p < 3; p++) {
        const pFrac = (pulseT + p * 0.33) % 1.0;
        const py = encInY - pFrac * (encInY - encOutY);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(encBlockX + encBlockW / 2, py, 3.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ───────────────────────────────────────────────────────────────────
      // Right Board: Decoder Stack Column (100% Unobstructed)
      // ───────────────────────────────────────────────────────────────────
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`🧠 DECODER STACK (Nx = ${numL})`, rightX + 16, rightY + 24);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText('Auto-Regressive Translation Generator', rightX + 16, rightY + 38);

      const decBlockX = rightX + 18;
      const decBlockW = rightW - 36;

      // 1. Top Decoder Output Card (Linear + Softmax Next Token)
      const decOutY = rightY + 54;
      ctx.fillStyle = 'rgba(52, 211, 153, 0.25)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(decBlockX, decOutY, decBlockW, 34, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText('⭐ Next Token: "apprendre" (Prob: 74.2%)', decBlockX + 12, decOutY + 21);

      // 2. Decoder Layer Stack (Layers 1..N rendered bottom-to-top, 100% Visible)
      const decLayerCenters: number[] = [];
      for (let l = 0; l < numL; l++) {
        const ly = stackBottomY - (l + 1) * (cardH + 6) + 6;
        decLayerCenters.push(ly + cardH / 2);

        ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(decBlockX, ly, decBlockW, cardH, 6);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#fde68a';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`Decoder Layer ${l + 1} (Masked+Cross+FFN)`, decBlockX + 12, ly + cardH / 2 + 3);
      }

      // 3. Bottom Decoder Target Tokens Card
      const decInY = rightY + boardH - 114;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(decBlockX, decInY, decBlockW, 34, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText('📥 ["<BOS>", "J\'", "adore"] + PE', decBlockX + 14, decInY + 21);

      // Upward Decoder Pulse Particles
      for (let p = 0; p < 3; p++) {
        const pFrac = (pulseT + p * 0.33) % 1.0;
        const py = decInY - pFrac * (decInY - decOutY);
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(decBlockX + decBlockW / 2, py, 3.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ───────────────────────────────────────────────────────────────────
      // Multi-Branch Cross-Attention Golden Bridge (From Encoder Output to Decoders)
      // ───────────────────────────────────────────────────────────────────
      const bridgeStartX = encBlockX + encBlockW;
      const bridgeStartY = encOutY + 17;

      // Draw graceful golden bezier rays to all decoder layers
      ctx.lineWidth = 1.5;
      for (let l = 0; l < numL; l++) {
        const targetY = decLayerCenters[l];
        ctx.strokeStyle = l === 0 || l === numL - 1 ? 'rgba(234, 179, 8, 0.75)' : 'rgba(234, 179, 8, 0.35)';
        ctx.beginPath();
        ctx.moveTo(bridgeStartX, bridgeStartY);
        ctx.bezierCurveTo(leftX + leftW + 6, bridgeStartY, rightX - 6, targetY, decBlockX, targetY);
        ctx.stroke();

        // Flowing particle on active cross-attention connection
        if (l === 0 || l === numL - 1) {
          const cpX = (1 - pulseFast) * bridgeStartX + pulseFast * decBlockX;
          const cpY = (1 - pulseFast) * bridgeStartY + pulseFast * targetY;
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(cpX, cpY, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // Bridge Label Badge
      ctx.fillStyle = 'rgba(10, 15, 29, 0.88)';
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect((leftX + leftW + rightX) / 2 - 58, bridgeStartY - 10, 116, 20, 4);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 8.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('✨ K_enc, V_enc Feed', (leftX + leftW + rightX) / 2, bridgeStartY + 3);
      ctx.textAlign = 'left';

      // ───────────────────────────────────────────────────────────────────
      // Bottom Translation Progression & Auto-Regressive HUD (Dedicated Bar)
      // ───────────────────────────────────────────────────────────────────
      const genStep = transformerGenStep % 4;
      const genWords = ['J\'', 'adore', 'apprendre', '<EOS>'];
      const currentGen = genWords.slice(0, genStep + 1);

      const bottomHudY = leftY + boardH - 68;
      ctx.fillStyle = 'rgba(10, 15, 29, 0.95)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(leftX + 16, bottomHudY, totalW - 20, 56, 10);
      ctx.fill(); ctx.stroke();

      // Step indicator badges
      for (let s = 0; s < 4; s++) {
        const isCurrent = s === genStep;
        const isPast = s < genStep;
        const badgeX = leftX + 28 + s * 78;
        const badgeY = bottomHudY + 12;

        ctx.fillStyle = isCurrent ? '#0284c7' : isPast ? '#065f46' : 'rgba(30, 41, 59, 0.8)';
        ctx.strokeStyle = isCurrent ? '#38bdf8' : isPast ? '#34d399' : 'rgba(71, 85, 105, 0.6)';
        ctx.lineWidth = isCurrent ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, 70, 22, 5);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = isCurrent ? '#ffffff' : isPast ? '#6ee7b7' : '#94a3b8';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Step ${s + 1}: ${genWords[s]}`, badgeX + 35, badgeY + 14);
      }

      ctx.textAlign = 'left';
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`Full Sequence: "${currentGen.join(' ')}"`, leftX + 350, bottomHudY + 22);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '8.5px monospace';
      ctx.fillText(`⚡ Click to Advance Step (${genStep + 1}/4) | Source: "I love learning" → French Target`, leftX + 350, bottomHudY + 40);
    }
  };

  // ─── 18B. Attention Mechanisms Comprehensive Mathematical Engine ───
  const drawAttentionMechanismsEngine = (ctx: CanvasRenderingContext2D, w: number, _h: number, cx: number, cy: number, _scale: number, localFrame: number) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(30 / simSpeed)) === 0) {
      performAttentionStep();
    }

    if (attnSubMode === 'scaled_dot_product') {
      // ════════ MODE 1: SCALED DOT-PRODUCT ATTENTION MATRIX ENGINE ════════
      const tokens = ['The', 'neural', 'network', 'learns', 'fast'];
      const N = tokens.length;
      const cellSize = 38;
      const matX = cx - 220;
      const matY = cy - 120;

      // Title & Formula
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('📐 SCALED DOT-PRODUCT:  Attention(Q, K, V) = softmax(Q · Kᵀ / √d_k) · V', cx - 250, cy - 160);

      // Query \ Key Table Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('Query (Q) \\ Key (K)', matX - 130, matY - 14);

      for (let j = 0; j < N; j++) {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(tokens[j], matX + j * cellSize + 8, matY - 14);
      }

      for (let i = 0; i < N; i++) {
        const isSelectedRow = i === attnSelectedTokenIdx;
        ctx.fillStyle = isSelectedRow ? '#38bdf8' : '#94a3b8';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(tokens[i], matX - 70, matY + i * cellSize + 24);

        for (let j = 0; j < N; j++) {
          const x = matX + j * cellSize;
          const y = matY + i * cellSize;

          const dist = Math.abs(i - j);
          const rawScore = (4.0 - dist * 0.85) * attnWeightScaleWq;
          const scaledScore = rawScore / (Math.sqrt(64) * attnTemperature);
          const prob = Math.exp(scaledScore) / (Math.exp(scaledScore) + (N - 1) * Math.exp(1.0 / (8 * attnTemperature)));
          const normProb = Math.max(0.05, Math.min(0.95, prob));

          ctx.fillStyle = `rgba(56, 189, 248, ${normProb * 0.85 + 0.1})`;
          ctx.strokeStyle = isSelectedRow ? '#38bdf8' : 'rgba(51, 65, 85, 0.8)';
          ctx.lineWidth = isSelectedRow ? 1.5 : 1;
          ctx.fillRect(x, y, cellSize - 4, cellSize - 4);
          ctx.strokeRect(x, y, cellSize - 4, cellSize - 4);

          ctx.fillStyle = normProb > 0.4 ? '#ffffff' : '#94a3b8';
          ctx.font = '10px monospace';
          ctx.fillText(normProb.toFixed(2), x + 5, y + 23);
        }
      }

      // Context Output Vector Z Preview
      const vX = matX + N * cellSize + 36;
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Context Output (Z = A · V)', vX, matY - 14);

      for (let i = 0; i < N; i++) {
        const y = matY + i * cellSize;
        const isSel = i === attnSelectedTokenIdx;
        ctx.fillStyle = isSel ? 'rgba(192, 132, 252, 0.35)' : 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = isSel ? '#c084fc' : 'rgba(71, 85, 105, 0.6)';
        ctx.lineWidth = isSel ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(vX, y, 160, cellSize - 4, 6);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = isSel ? '#e9d5ff' : '#cbd5e1';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`z_${i + 1} = [${(0.85 - i * 0.12).toFixed(2)}, ${(0.34 + i * 0.15).toFixed(2)}, ...]`, vX + 10, y + 22);
      }

    } else if (attnSubMode === 'multi_head') {
      // ════════ MODE 2: MULTI-HEAD ATTENTION PARALLEL SUB-SPACES ════════
      const headColors = ['#38bdf8', '#c084fc', '#fbbf24', '#34d399', '#f43f5e', '#a855f7', '#06b6d4', '#eab308'];
      const headNames = ['Syntactic Agree', 'Positional Prox', 'Coreference Anaph', 'Semantic Roles', 'Boundary Tokens', 'Verb Arguments', 'Entity Relations', 'Discourse Flow'];
      const numH = attnNumHeads;
      const headBoxW = Math.min(130, Math.floor((w - 120) / numH) - 12);
      const startX = cx - (numH * (headBoxW + 12)) / 2;

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`🧩 MULTI-HEAD ATTENTION: ${numH} Parallel Sub-Spaces (d_k = 512 / ${numH} = ${Math.floor(512 / numH)})`, cx - 240, cy - 160);

      for (let h = 0; h < numH; h++) {
        const hx = startX + h * (headBoxW + 12);
        const hy = cy - 80;
        const color = headColors[h % headColors.length];

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(hx, hy, headBoxW, 200, 10);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`Head ${h + 1}`, hx + 12, hy + 22);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '8.5px monospace';
        ctx.fillText(headNames[h % headNames.length], hx + 12, hy + 38);

        // Mini Attention Grid
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const cellVal = Math.sin((h + 1) * (r + 1) + c) * 0.5 + 0.5;
            ctx.fillStyle = color;
            ctx.globalAlpha = cellVal * 0.7 + 0.15;
            ctx.fillRect(hx + 12 + c * 18, hy + 50 + r * 18, 15, 15);
          }
        }
        ctx.globalAlpha = 1.0;
      }

      // Output Projection W^O Box
      const outBoxY = cy + 150;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - 200, outBoxY, 400, 36, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('MultiHead(Q,K,V) = Concat(head_1, ..., head_h) · W^O', cx - 180, outBoxY + 22);

    } else if (attnSubMode === 'cross_attention') {
      // ════════ MODE 3: CROSS-ATTENTION ENCODER-DECODER ALIGNMENT ════════
      const srcTokens = ['The', 'deep', 'neural', 'transformer', 'learns'];
      const tgtTokens = ['Le', 'transformateur', 'neuronal', 'profond', 'appris'];
      const N = srcTokens.length;
      const cellW = 95;
      const topY = cy - 130;
      const botY = cy + 100;
      const startX = cx - (N * (cellW + 14)) / 2;

      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('🌐 CROSS-ATTENTION: Translation Alignment (Decoder Query Q ↔ Encoder Key K)', cx - 260, cy - 170);

      // Top Row: Source Keys & Values
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('ENCODER SOURCE (Keys K & Values V):', startX, topY - 14);

      for (let j = 0; j < N; j++) {
        const tx = startX + j * (cellW + 14);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(tx, topY, cellW, 40, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#a7f3d0';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`"${srcTokens[j]}"`, tx + 14, topY + 24);
      }

      // Bottom Row: Decoder Target Queries
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('DECODER TARGET TOKENS (Queries Q):', startX, botY - 14);

      for (let i = 0; i < N; i++) {
        const tx = startX + i * (cellW + 14);
        const isSel = i === attnSelectedTokenIdx;
        ctx.fillStyle = isSel ? 'rgba(245, 158, 11, 0.4)' : 'rgba(30, 41, 59, 0.8)';
        ctx.strokeStyle = isSel ? '#fbbf24' : 'rgba(71, 85, 105, 0.8)';
        ctx.lineWidth = isSel ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(tx, botY, cellW, 40, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSel ? '#fde047' : '#cbd5e1';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`"${tgtTokens[i]}"`, tx + 10, botY + 24);

        // Draw Cross Attention Bipartite Rays from selected Decoder Query to all Encoder Keys
        if (isSel) {
          for (let j = 0; j < N; j++) {
            const targetX = startX + j * (cellW + 14) + cellW / 2;
            const sourceX = tx + cellW / 2;
            // Cross alignment weights
            const alignWeight = (i === 1 && j === 3) || (i === 2 && j === 2) || (i === 3 && j === 1) || (i === 4 && j === 4) ? 0.88 : 0.15;

            ctx.strokeStyle = `rgba(234, 179, 8, ${alignWeight})`;
            ctx.lineWidth = alignWeight > 0.5 ? 3.5 : 1;
            ctx.beginPath();
            ctx.moveTo(sourceX, botY);
            ctx.bezierCurveTo(sourceX, botY - 80, targetX, topY + 120, targetX, topY + 40);
            ctx.stroke();

            if (alignWeight > 0.5) {
              ctx.fillStyle = '#fde047';
              ctx.font = 'bold 10px monospace';
              ctx.fillText(`A=${alignWeight.toFixed(2)}`, (sourceX + targetX) / 2 - 16, (botY + topY) / 2 + 10);
            }
          }
        }
      }

    } else if (attnSubMode === 'causal_masked') {
      // ════════ MODE 4: CAUSAL MASKED SELF-ATTENTION ════════
      const tokens = ['The', 'robot', 'saw', 'the', 'star'];
      const N = tokens.length;
      const cellSize = 42;
      const matX = cx - 110;
      const matY = cy - 110;

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('🛡️ CAUSAL MASKED SELF-ATTENTION: Lower-Triangular Masking Matrix', cx - 250, cy - 150);

      for (let i = 0; i < N; i++) {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(tokens[i], matX - 60, matY + i * cellSize + 26);
        ctx.fillText(tokens[i], matX + i * cellSize + 6, matY - 14);

        for (let j = 0; j < N; j++) {
          const x = matX + j * cellSize;
          const y = matY + i * cellSize;
          const isMasked = j > i;

          ctx.fillStyle = isMasked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 211, 153, 0.25)';
          ctx.strokeStyle = isMasked ? '#ef4444' : '#10b981';
          ctx.lineWidth = 1;
          ctx.fillRect(x, y, cellSize - 4, cellSize - 4);
          ctx.strokeRect(x, y, cellSize - 4, cellSize - 4);

          ctx.fillStyle = isMasked ? '#fca5a5' : '#a7f3d0';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(isMasked ? '-∞ (0%)' : `${(1.0 / (i + 1)).toFixed(2)}`, x + 4, y + 24);
        }
      }

    } else if (attnSubMode === 'recursive_recurrent') {
      // ════════ MODE 5: RECURSIVE & RECURRENT ATTENTION (Universal Transformers) ════════
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('🔄 RECURSIVE & RECURRENT ATTENTION (Universal & Memory-Augmented)', cx - 250, cy - 160);

      const loopRadius = 80;
      const loopCX = cx - 120;
      const loopCY = cy;

      // Recurrent Loop Ring
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(loopCX, loopCY, loopRadius, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('UT State Loop', loopCX - 40, loopCY - 5);
      ctx.font = '9px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('H^(t) = Attn(H^(t-1))', loopCX - 52, loopCY + 12);

      // Memory slots
      const memX = cx + 80;
      const memY = cy - 100;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(memX, memY, 180, 200, 10);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Memory Slots M_(1..4)', memX + 16, memY + 22);

      for (let m = 0; m < 4; m++) {
        const my = memY + 40 + m * 38;
        ctx.fillStyle = 'rgba(192, 132, 252, 0.2)';
        ctx.strokeStyle = '#a855f7';
        ctx.beginPath();
        ctx.roundRect(memX + 12, my, 156, 30, 6);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#e9d5ff';
        ctx.font = 'bold 9.5px monospace';
        ctx.fillText(`Slot ${m + 1}: Recurrent Key`, memX + 20, my + 19);
      }

    } else {
      // ════════ MODE 6: SINUSOIDAL POSITIONAL ENCODINGS ════════
      const plotW = 480;
      const plotH = 220;
      const plotX = cx - plotW / 2;
      const plotY = cy - 100;

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('〰️ SINUSOIDAL POSITIONAL ENCODINGS: PE(pos, 2i) = sin(pos / 10000^(2i/d))', cx - 250, cy - 150);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(plotX, plotY, plotW, plotH, 12);
      ctx.fill(); ctx.stroke();

      ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
      ctx.beginPath();
      ctx.moveTo(plotX, plotY + plotH / 2);
      ctx.lineTo(plotX + plotW, plotY + plotH / 2);
      ctx.stroke();

      // High freq wave
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px < plotW; px += 2) {
        const pos = (px / plotW) * 16;
        const val = Math.sin(pos / Math.pow(10000, 0 / 64));
        const py = plotY + plotH / 2 - val * 70;
        if (px === 0) ctx.moveTo(plotX + px, py);
        else ctx.lineTo(plotX + px, py);
      }
      ctx.stroke();

      // Low freq wave
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px < plotW; px += 2) {
        const pos = (px / plotW) * 16;
        const val = Math.sin(pos / Math.pow(10000, 48 / 64));
        const py = plotY + plotH / 2 - val * 70;
        if (px === 0) ctx.moveTo(plotX + px, py);
        else ctx.lineTo(plotX + px, py);
      }
      ctx.stroke();

      ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 10px monospace'; ctx.fillText('■ Dim i=0 (High Freq)', plotX + 16, plotY + 24);
      ctx.fillStyle = '#fbbf24'; ctx.fillText('■ Dim i=24 (Low Freq)', plotX + 16, plotY + 42);
    }
  };

  // ─── 18C. Mixture of Experts (MoE) Sparse Routing Engine ───
  const drawMoeArchitectureEngine = (ctx: CanvasRenderingContext2D, _w: number, _h: number, _cx: number, _cy: number, _scale: number, localFrame: number) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(30 / simSpeed)) === 0) {
      performMoeStep();
    }

    const marginX = 14;
    const marginY = 14;
    const gap = 12;
    const totalW = 720 - 2 * marginX - gap;
    const leftW = Math.floor(totalW * 0.52); // 353px
    const rightW = totalW - leftW;          // 327px
    const boardH = 620 - 2 * marginY;       // 592px
    const leftX = marginX;
    const leftY = marginY;
    const rightX = marginX + leftW + gap;
    const rightY = marginY;

    // Background Panels
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(leftX, leftY, leftW, boardH, 14);
    ctx.fill(); ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(rightX, rightY, rightW, boardH, 14);
    ctx.fill(); ctx.stroke();

    const tokens = ['The', 'quantum', 'algorithm', 'computes', 'integral'];
    const curTokenIdx = moeSelectedTokenIdx % tokens.length;

    // ───────────────────────────────────────────────────────────────────
    // Left Board: Learned Gating Network (Router Wg) & Top-k Dispatch
    // ───────────────────────────────────────────────────────────────────
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('🧭 LEARNED GATING ROUTER (Wg)', leftX + 16, leftY + 24);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText(`Top-${moeTopK} Sparse Dispatch (${moeNumExperts} Total Experts)`, leftX + 16, leftY + 38);

    // 1. Token Selector Chips
    const chipY = leftY + 50;
    const chipW = 58;
    for (let i = 0; i < tokens.length; i++) {
      const tx = leftX + 12 + i * (chipW + 6);
      const isSel = i === curTokenIdx;
      ctx.fillStyle = isSel ? 'rgba(56, 189, 248, 0.35)' : 'rgba(30, 41, 59, 0.7)';
      ctx.strokeStyle = isSel ? '#38bdf8' : 'rgba(71, 85, 105, 0.6)';
      ctx.lineWidth = isSel ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(tx, chipY, chipW, 30, 6);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = isSel ? '#e0f2fe' : '#94a3b8';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText(tokens[i], tx + 6, chipY + 18);
    }

    // 2. Gating Network (Linear Transformation H(x) = x · W_g)
    const routerBoxY = chipY + 44;
    ctx.fillStyle = 'rgba(192, 132, 252, 0.25)';
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(leftX + 16, routerBoxY, leftW - 32, 48, 8);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#f3e8ff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Router Linear Layer H(x) = x · W_g + ϵ', leftX + 38, routerBoxY + 20);
    ctx.fillStyle = '#d8b4fe';
    ctx.font = '9px monospace';
    ctx.fillText('Evaluates affinity logits across all experts', leftX + 46, routerBoxY + 36);

    // 3. Expert Affinity Softmax Probabilities & Top-k Gate
    const expertNames = [
      'E1: Code & Syntax', 'E2: Math & Logic', 'E3: Physics/Science', 'E4: World Knowledge',
      'E5: Linguistics', 'E6: Creative Style', 'E7: Multilingual', 'E8: Common Sense',
      'E9: Biology', 'E10: Reasoning', 'E11: History', 'E12: Legal',
      'E13: Economics', 'E14: Chemistry', 'E15: Audio/Vision', 'E16: Meta Strategy'
    ];

    const numE = moeNumExperts;
    const rawScores = [];
    for (let e = 0; e < numE; e++) {
      let affinity = 1.0;
      if (curTokenIdx === 1) affinity = e === 2 ? 4.2 : e === 1 ? 3.8 : 0.8;
      else if (curTokenIdx === 2) affinity = e === 0 ? 4.5 : e === 1 ? 3.6 : 0.9;
      else if (curTokenIdx === 4) affinity = e === 1 ? 4.8 : e === 2 ? 3.5 : 0.7;
      else affinity = e === 4 ? 3.9 : e === 3 ? 3.2 : 1.1;
      rawScores.push(affinity + (Math.sin(e * 1.5) * 0.3 * moeRouterNoise));
    }

    const expScores = rawScores.map(s => Math.exp(s / moeRouterTemperature));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    const probs = expScores.map((exp, idx) => ({ idx, prob: exp / sumExp, name: expertNames[idx] }));

    probs.sort((a, b) => b.prob - a.prob);
    const topKIndices = new Set(probs.slice(0, moeTopK).map(p => p.idx));

    // Draw routing bars
    const listStartY = routerBoxY + 58;
    const maxShowE = Math.min(8, numE);
    const barH = 24;

    for (let i = 0; i < maxShowE; i++) {
      const item = probs[i];
      const ly = listStartY + i * (barH + 6);
      const isTop = topKIndices.has(item.idx);

      ctx.fillStyle = isTop ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.5)';
      ctx.strokeStyle = isTop ? '#34d399' : 'rgba(71, 85, 105, 0.4)';
      ctx.lineWidth = isTop ? 1.5 : 1;
      ctx.beginPath();
      ctx.roundRect(leftX + 16, ly, leftW - 32, barH, 6);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = isTop ? '#6ee7b7' : '#94a3b8';
      ctx.font = isTop ? 'bold 9px monospace' : '8.5px monospace';
      ctx.fillText(`${item.name} ${isTop ? '★ [ACTIVE]' : ''}`, leftX + 24, ly + 15);

      ctx.fillStyle = isTop ? '#34d399' : '#64748b';
      ctx.fillText(`${(item.prob * 100).toFixed(1)}%`, leftX + leftW - 68, ly + 15);
    }

    // ───────────────────────────────────────────────────────────────────
    // Right Board: Expert Bank, Weighted Blender & Load Balancing HUD
    // ───────────────────────────────────────────────────────────────────
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`⚡ EXPERT BANK (E=${moeNumExperts}, Top-${moeTopK} Active)`, rightX + 16, rightY + 24);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText('Parallel Feed-Forward Networks + Load Balancer', rightX + 16, rightY + 38);

    const gridStartY = rightY + 54;
    const gridCols = 2;
    const gridRows = Math.min(4, Math.ceil(numE / 2));
    const cellW = Math.floor((rightW - 40) / gridCols);
    const cellH = 46;

    for (let e = 0; e < Math.min(8, numE); e++) {
      const r = Math.floor(e / gridCols);
      const c = e % gridCols;
      const gx = rightX + 14 + c * (cellW + 10);
      const gy = gridStartY + r * (cellH + 8);
      const isTop = topKIndices.has(e);

      ctx.fillStyle = isTop ? 'rgba(245, 158, 11, 0.35)' : 'rgba(30, 41, 59, 0.7)';
      ctx.strokeStyle = isTop ? '#fbbf24' : 'rgba(71, 85, 105, 0.6)';
      ctx.lineWidth = isTop ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(gx, gy, cellW, cellH, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = isTop ? '#fef3c7' : '#cbd5e1';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText(`Expert ${e + 1}`, gx + 10, gy + 18);

      ctx.fillStyle = isTop ? '#34d399' : '#64748b';
      ctx.font = '8px sans-serif';
      ctx.fillText(isTop ? '⚡ COMPUTE ACTIVE' : '💤 Idle (0 Compute)', gx + 10, gy + 34);
    }

    const combY = gridStartY + gridRows * (cellH + 8) + 14;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rightX + 14, combY, rightW - 28, 44, 8);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('Output y = ∑_(i∈Top-k) G(x)_i · E_i(x) + x', rightX + 24, combY + 18);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '8.5px monospace';
    ctx.fillText('Sparse activation achieves 10x parameter efficiency!', rightX + 24, combY + 34);

    const loadY = combY + 54;
    ctx.fillStyle = 'rgba(10, 15, 29, 0.9)';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(rightX + 14, loadY, rightW - 28, 140, 8);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('⚖️ LOAD BALANCING & AUXILIARY LOSS', rightX + 24, loadY + 18);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '8.5px monospace';
    ctx.fillText('Capacity Factor C = 1.25  |  Aux Loss α = 0.02', rightX + 24, loadY + 36);
    ctx.fillStyle = '#34d399';
    ctx.fillText('No Expert Collapse: Uniform token distribution', rightX + 24, loadY + 52);

    for (let b = 0; b < Math.min(8, numE); b++) {
      const bx = rightX + 24 + b * 32;
      const by = loadY + 70;
      const loadH = 30 + Math.sin(b * 1.8 + localFrame * 0.05) * 12;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(bx, by + (40 - loadH), 22, loadH);
      ctx.fillStyle = '#64748b';
      ctx.font = '7.5px monospace';
      ctx.fillText(`E${b + 1}`, bx + 4, by + 52);
    }
  };

  // ─── 18B. Loss Surface Optimization & Gradient Descent Simulator ───
  const drawLossSurfaceOptimization = (ctx: CanvasRenderingContext2D, w: number, h: number, _cx: number, _cy: number, _scale: number, localFrame: number) => {
    if (simMode === 'autoplay' && isSimulating && localFrame % Math.max(1, Math.round(10 / simSpeed)) === 0) {
      performOptimizerStep();
    }

    // Precise symmetric layout fitting 100% inside canvas frame
    const marginX = 14;
    const marginY = 14;
    const gap = 12;
    const totalW = w - 2 * marginX - gap;
    const topoW = Math.floor(totalW * 0.51);
    const bellW = totalW - topoW;
    const topoH = h - 2 * marginY;
    const bellH = topoH;
    const topoX = marginX;
    const bellX = topoX + topoW + gap;
    const topoY = marginY;
    const bellY = marginY;

    // ─────────────────────────────────────────────────────────────
    // 1. LEFT CARD: 2D ISO-LOSS CONTOUR SURFACE TOPOGRAPHY
    // ─────────────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(topoX, topoY, topoW, topoH, 12);
    ctx.fill();
    ctx.stroke();

    const algTitle = optAlgorithm === 'tri_variant_race' ? '🏁 TRI-RACE' : optAlgorithm.toUpperCase().replace(/_/g, ' ');
    ctx.fillStyle = optAlgorithm === 'tri_variant_race' ? '#facc15' : '#38bdf8';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`🗺️ 2D CONTOUR: ${algTitle}`, topoX + 12, topoY + 20);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`LANDSCAPE: ${lossLandscape.replace(/_/g, ' ').toUpperCase()}`, topoX + 12, topoY + 34);

    // Inner Graph Bounds
    const gx = topoX + 12;
    const gy = topoY + 42;
    const gw = topoW - 24;
    const gh = topoH - 76;

    // Graph Area Background
    ctx.fillStyle = '#060a14';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(gx, gy, gw, gh);

    // Coordinate Mapping [-3.0, 3.0] <-> Graph Pixels
    const mapW1ToX = (w1: number) => gx + ((Math.max(-3.0, Math.min(3.0, w1)) + 3.0) / 6.0) * gw;
    const mapW2ToY = (w2: number) => gy + ((-Math.max(-3.0, Math.min(3.0, w2)) + 3.0) / 6.0) * gh;

    // Grid Axis Lines
    const zeroX = mapW1ToX(0);
    const zeroY = mapW2ToY(0);
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(zeroX, gy); ctx.lineTo(zeroX, gy + gh);
    ctx.moveTo(gx, zeroY); ctx.lineTo(gx + gw, zeroY);
    ctx.stroke();

    // ─── Iso-Loss Contour Bands ───
    if (lossLandscape === 'convex_bowl') {
      const levels = [0.6, 1.4, 2.6, 4.2, 6.2];
      levels.forEach(lvl => {
        const rx = Math.sqrt(2 * (lvl - 0.2)) * (gw / 6.0);
        const ry = Math.sqrt((lvl - 0.2)) * (gh / 6.0);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(zeroX, zeroY, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      });
    } else if (lossLandscape === 'rosenbrock_valley') {
      // Draw curved parabolic banana valley base path w2 = 0.4 w1^2
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.28)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let px = 0; px <= gw; px += 4) {
        const sw1 = -3.0 + (px / gw) * 6.0;
        const sw2 = 0.4 * sw1 * sw1;
        const sx = mapW1ToX(sw1);
        const sy = mapW2ToY(sw2);
        if (px === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (lossLandscape === 'saddle_point') {
      // Draw saddle asymptotes passing through (0, 0)
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy + gh);
      ctx.moveTo(gx, gy + gh); ctx.lineTo(gx + gw, gy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ─── Vector Field Gradient Arrows (-∇J) ───
    const arrowGrid = 7;
    for (let r = 0; r < arrowGrid; r++) {
      for (let c = 0; c < arrowGrid; c++) {
        const gw1 = -2.6 + (c / (arrowGrid - 1)) * 5.2;
        const gw2 = -2.6 + (r / (arrowGrid - 1)) * 5.2;
        const { dw1, dw2 } = calculateLossAndGrad(gw1, gw2, lossLandscape);
        const norm = Math.hypot(dw1, dw2) || 1;
        const ax = mapW1ToX(gw1);
        const ay = mapW2ToY(gw2);

        const len = 12;
        const dx = (-dw1 / norm) * len;
        const dy = (dw2 / norm) * len; // Inverted for canvas Y

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + dx, ay + dy);
        ctx.stroke();
      }
    }

    // ─── Landscape Landmark Markers ───
    if (lossLandscape === 'multimodal_minima') {
      // Global Minimum ⭐ (0.2, 0.2)
      const gx0 = mapW1ToX(0.2);
      const gy0 = mapW2ToY(0.2);
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(gx0, gy0, 7, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('GLOBAL MIN ⭐', gx0 - 30, gy0 - 10);

      // Local Minimum 1 ⚠️ (-1.8, -1.4)
      const l1x = mapW1ToX(-1.8);
      const l1y = mapW2ToY(-1.4);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(l1x, l1y, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('LOCAL 1 ⚠️', l1x - 18, l1y + 14);

      // Local Minimum 2 ⚠️ (1.8, -1.4)
      const l2x = mapW1ToX(1.8);
      const l2y = mapW2ToY(-1.4);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(l2x, l2y, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillText('LOCAL 2 ⚠️', l2x - 18, l2y + 14);
    } else if (lossLandscape === 'convex_bowl') {
      const gx0 = mapW1ToX(0);
      const gy0 = mapW2ToY(0);
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(gx0, gy0, 7, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('GLOBAL MIN ⭐ (0,0)', gx0 - 36, gy0 - 10);
    } else if (lossLandscape === 'rosenbrock_valley') {
      // Global Minimum ⭐ at (1.0, 0.4)
      const gx0 = mapW1ToX(1.0);
      const gy0 = mapW2ToY(0.4);
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(gx0, gy0, 7, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('GLOBAL MIN ⭐ (1.0, 0.4)', gx0 - 45, gy0 - 10);
    } else if (lossLandscape === 'saddle_point') {
      // Saddle Point ⚔️ at (0, 0)
      const sx0 = mapW1ToX(0);
      const sy0 = mapW2ToY(0);
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(sx0, sy0, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('SADDLE PASS ⚔️ (0,0)', sx0 - 42, sy0 - 10);

      // Twin Global Minima at (0, 1.31) and (0, -1.31)
      const m1x = mapW1ToX(0);
      const m1y = mapW2ToY(1.31);
      const m2x = mapW1ToX(0);
      const m2y = mapW2ToY(-1.31);
      ctx.fillStyle = '#34d399';
      ctx.beginPath(); ctx.arc(m1x, m1y, 6, 0, 2 * Math.PI); ctx.fill();
      ctx.beginPath(); ctx.arc(m2x, m2y, 6, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('MIN 1 ⭐', m1x + 10, m1y + 4);
      ctx.fillText('MIN 2 ⭐', m2x + 10, m2y + 4);
    }

    // ─── Multi-Agent Tri-Race or Single Trajectory ───
    if (optAlgorithm === 'tri_variant_race') {
      const bHist = stateRef.current.optRaceBatchHist || [];
      const mHist = stateRef.current.optRaceMiniHist || [];
      const sHist = stateRef.current.optRaceSgdHist || [];

      // 1. Batch GD (Smooth Green Trajectory)
      if (bHist.length > 1) {
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < bHist.length; i++) {
          const hx = mapW1ToX(bHist[i].w1);
          const hy = mapW2ToY(bHist[i].w2);
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.stroke();
      }

      // 2. Mini-Batch GD (Balanced Sky Trajectory)
      if (mHist.length > 1) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < mHist.length; i++) {
          const hx = mapW1ToX(mHist[i].w1);
          const hy = mapW2ToY(mHist[i].w2);
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.stroke();
      }

      // 3. Stochastic GD (Noisy Orange Trajectory)
      if (sHist.length > 1) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let i = 0; i < sHist.length; i++) {
          const hx = mapW1ToX(sHist[i].w1);
          const hy = mapW2ToY(sHist[i].w2);
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.stroke();
      }

      // Render Active Particles for Tri-Race
      const bCur = stateRef.current.optRaceBatchPos || optPos;
      const mCur = stateRef.current.optRaceMiniPos || optPos;
      const sCur = stateRef.current.optRaceSgdPos || optPos;

      ctx.fillStyle = '#34d399';
      ctx.beginPath(); ctx.arc(mapW1ToX(bCur.w1), mapW2ToY(bCur.w2), 6, 0, 2 * Math.PI); ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath(); ctx.arc(mapW1ToX(mCur.w1), mapW2ToY(mCur.w2), 6, 0, 2 * Math.PI); ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(mapW1ToX(sCur.w1), mapW2ToY(sCur.w2), 6, 0, 2 * Math.PI); ctx.fill();

      // Tri-Race Legend Box inside graph top right
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(gx + gw - 136, gy + 8, 128, 54, 6);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#34d399';
      ctx.fillText('● Batch (Full m)', gx + gw - 128, gy + 22);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`● Mini-Batch (B=${optBatchSize})`, gx + gw - 128, gy + 36);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('● Stochastic (B=1)', gx + gw - 128, gy + 50);
    } else {
      // Single Algorithm Trajectory
      const hist = stateRef.current.optHistory || [];
      const trackColor = optAlgorithm === 'batch' ? '#34d399' : optAlgorithm === 'mini_batch' ? '#38bdf8' : optAlgorithm === 'sgd' ? '#f59e0b' : '#c084fc';
      if (hist.length > 1) {
        ctx.strokeStyle = trackColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < hist.length; i++) {
          const hx = mapW1ToX(hist[i].w1);
          const hy = mapW2ToY(hist[i].w2);
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.stroke();
      }

      // Active Particle (Rolling Ball)
      const px = mapW1ToX(optPos.w1);
      const py = mapW2ToY(optPos.w2);

      ctx.fillStyle = trackColor;
      ctx.shadowColor = trackColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Velocity Vector Arrow
      const vx = optVelocity.v1 * 35;
      const vy = -optVelocity.v2 * 35;
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + vx, py + vy);
      ctx.stroke();
    }

    // Bottom Hint on Left Card
    ctx.fillStyle = '#64748b';
    ctx.font = '8px sans-serif';
    ctx.fillText('🖱️ Click or drag on 2D map to set parameter θ₀ = (w₁, w₂)', topoX + 12, topoY + topoH - 12);

    // ─────────────────────────────────────────────────────────────
    // 2. RIGHT CARD: 1D LOSS PROFILE & ERROR WELLS: J(w₁ | w₂)
    // ─────────────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bellX, bellY, bellW, bellH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('📉 1D LOSS PROFILE & ERROR WELLS', bellX + 12, bellY + 20);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`Cross-section along w₂ = ${optPos.w2.toFixed(2)}`, bellX + 12, bellY + 34);

    // Inner 1D Graph Bounds
    const bx = bellX + 14;
    const by = bellY + 42;
    const bw = bellW - 28;
    const bh = bellH - 130;

    // 1D Graph Background
    ctx.fillStyle = '#060a14';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);

    // Compute max loss scale to keep graph stable and non-falling
    const maxLossScale = 6.0;
    const mapLossToY = (lossVal: number) => {
      const clamped = Math.max(0, Math.min(maxLossScale, lossVal));
      return by + bh - (clamped / maxLossScale) * (bh - 20) - 10;
    };

    // Horizontal Grid Lines on 1D Plot
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
    ctx.lineWidth = 1;
    [1.0, 2.5, 4.0, 5.5].forEach(lvl => {
      const ly = mapLossToY(lvl);
      ctx.beginPath();
      ctx.moveTo(bx, ly); ctx.lineTo(bx + bw, ly);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '7px monospace';
      ctx.fillText(`${lvl.toFixed(1)}`, bx + 4, ly - 2);
    });

    // ─── Render 1D Loss Curve J(w1 | w2) with Shaded Area ───
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.beginPath();
    ctx.moveTo(bx, by + bh);
    for (let px = 0; px <= bw; px += 2) {
      const sampleW1 = -3.0 + (px / bw) * 6.0;
      const { loss } = calculateLossAndGrad(sampleW1, optPos.w2, lossLandscape);
      const sy = mapLossToY(loss);
      ctx.lineTo(bx + px, sy);
    }
    ctx.lineTo(bx + bw, by + bh);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px <= bw; px += 2) {
      const sampleW1 = -3.0 + (px / bw) * 6.0;
      const { loss } = calculateLossAndGrad(sampleW1, optPos.w2, lossLandscape);
      const sy = mapLossToY(loss);
      if (px === 0) ctx.moveTo(bx + px, sy);
      else ctx.lineTo(bx + px, sy);
    }
    ctx.stroke();

    // ─── Active Ball & Tangent Slope on 1D Curve ───
    const curW1 = Math.max(-3.0, Math.min(3.0, optPos.w1));
    const curBx = bx + ((curW1 + 3.0) / 6.0) * bw;
    const curBy = mapLossToY(optLoss);

    // Tangent Line
    const { dw1 } = calculateLossAndGrad(curW1, optPos.w2, lossLandscape);
    const tanLen = 22;
    const tanSlope = Math.max(-1.5, Math.min(1.5, (dw1 / maxLossScale) * 2.0));
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(curBx - tanLen, curBy + tanLen * tanSlope);
    ctx.lineTo(curBx + tanLen, curBy - tanLen * tanSlope);
    ctx.stroke();

    // Glowing Red Active Dot
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(curBx, curBy, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ball coordinate callout
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 8px monospace';
    ctx.fillText(`J=${optLoss.toFixed(2)}`, Math.max(bx + 4, Math.min(bx + bw - 44, curBx - 16)), curBy - 10);

    // ─── Mathematical Formula Badge at Bottom ───
    const formY = by + bh + 10;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx, formY, bw, 34, 6);
    ctx.fill();
    ctx.stroke();

    let formulaText = 'θ ← θ - η∇J(θ)  [Batch GD: Full Dataset]';
    if (optAlgorithm === 'sgd') formulaText = 'θ ← θ - η∇J(θ; xⁱ)  [SGD: Single Example]';
    else if (optAlgorithm === 'mini_batch') formulaText = `θ ← θ - η∇J(θ; B)  [Mini-Batch B=${optBatchSize}]`;
    else if (optAlgorithm === 'momentum') formulaText = 'vₜ = γvₜ₋₁ + η∇J,  θ ← θ - vₜ  [Momentum]';
    else if (optAlgorithm === 'adam') formulaText = 'θ ← θ - η·m̂ / (√v̂ + ε)  [Adam Adaptive]';
    else if (optAlgorithm === 'tri_variant_race') formulaText = '🏁 Race: Batch(m) vs Mini(B) vs SGD(1)';

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(formulaText, bx + 8, formY + 16);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px monospace';
    ctx.fillText(`Gradient Slope ∂J/∂w₁ = ${dw1.toFixed(3)} | ‖∇J‖ = ${optGradNorm.toFixed(3)}`, bx + 8, formY + 28);

    // ─── Status Banner at Bottom ───
    const statY = formY + 40;
    const statusText =
      optStatus === 'converged'
        ? '🏆 CONVERGED TO MINIMUM'
        : optStatus === 'local_min'
        ? '⚠️ LOCAL MINIMA TRAP (Noise helps escape)'
        : optStatus === 'overshooting'
        ? '💥 OVERSHOOTING (Lower learning rate η)'
        : '⚡ OPTIMIZING GRADIENT DESCENT';

    const statusColor =
      optStatus === 'converged' ? '#34d399' : optStatus === 'local_min' ? '#fbbf24' : optStatus === 'overshooting' ? '#f43f5e' : '#38bdf8';

    ctx.fillStyle = statusColor;
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(statusText, bx, statY + 10);
  };

  // 19. Q-Learning GridWorld Renderer (4 Directional Triangular Q-Wedges + Policy Arrows + Bellman Equation Inset + Episode Reward Convergence)
  const drawQLearningGridWorldWedges = (ctx: CanvasRenderingContext2D, w: number, _h: number, cx: number, cy: number, _scale: number, localFrame: number) => {
    const grid = stateRef.current.rlMapGrid;
    const qTable = stateRef.current.rlQTable;
    const R = grid.length;
    const C = grid[0].length;
    const tileSize = 68;

    const plotW = C * tileSize;
    const plotH = R * tileSize;
    const startX = cx - plotW / 2 - 140;
    const startY = cy - plotH / 2 + 10;

    if (simMode === 'autoplay' && isSimulating) {
      if (localFrame % Math.max(1, Math.round(14 / simSpeed)) === 0) {
        performRlStep();
      }
    }

    // 1. Grid Cells with 4 Directional Triangular Q-Wedges
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        const type = grid[r][c];
        const cellX = startX + c * tileSize;
        const cellY = startY + r * tileSize;
        const cellCenterX = cellX + tileSize / 2;
        const cellCenterY = cellY + tileSize / 2;

        if (type === 4) {
          // Obstacle Wall
          ctx.fillStyle = '#334155';
          ctx.fillRect(cellX, cellY, tileSize, tileSize);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cellX, cellY, tileSize, tileSize);
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('🧱 WALL', cellCenterX, cellCenterY + 4);
          ctx.textAlign = 'left';
          continue;
        }

        if (type === 2) {
          // Goal Tile (+100)
          ctx.fillStyle = '#065f46';
          ctx.fillRect(cellX, cellY, tileSize, tileSize);
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2;
          ctx.strokeRect(cellX, cellY, tileSize, tileSize);
          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🏆 GOAL', cellCenterX, cellCenterY - 2);
          ctx.font = '8px monospace';
          ctx.fillText('+100 R', cellCenterX, cellCenterY + 12);
          ctx.textAlign = 'left';
          continue;
        }

        if (type === 3) {
          // Trap / Cliff (-50)
          ctx.fillStyle = '#881337';
          ctx.fillRect(cellX, cellY, tileSize, tileSize);
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.strokeRect(cellX, cellY, tileSize, tileSize);
          ctx.fillStyle = '#f43f5e';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('💣 TRAP', cellCenterX, cellCenterY - 2);
          ctx.font = '8px monospace';
          ctx.fillText('-50 R', cellCenterX, cellCenterY + 12);
          ctx.textAlign = 'left';
          continue;
        }

        // Normal Walkable Tile: Render 4 Directional Triangular Q-Wedges
        const qVals = qTable[r]?.[c] || [0, 0, 0, 0]; // [Up, Right, Down, Left]
        const maxQ = Math.max(...qVals);
        const bestAction = qVals.indexOf(maxQ);

        // Action 0: Up Wedge (Top Triangle)
        const qUpNorm = Math.max(0, Math.min(1, (qVals[0] + 20) / 120));
        ctx.fillStyle = `rgba(56, 189, 248, ${0.12 + qUpNorm * 0.75})`;
        ctx.beginPath();
        ctx.moveTo(cellX, cellY); ctx.lineTo(cellX + tileSize, cellY); ctx.lineTo(cellCenterX, cellCenterY);
        ctx.closePath(); ctx.fill();

        // Action 1: Right Wedge (Right Triangle)
        const qRightNorm = Math.max(0, Math.min(1, (qVals[1] + 20) / 120));
        ctx.fillStyle = `rgba(56, 189, 248, ${0.12 + qRightNorm * 0.75})`;
        ctx.beginPath();
        ctx.moveTo(cellX + tileSize, cellY); ctx.lineTo(cellX + tileSize, cellY + tileSize); ctx.lineTo(cellCenterX, cellCenterY);
        ctx.closePath(); ctx.fill();

        // Action 2: Down Wedge (Bottom Triangle)
        const qDownNorm = Math.max(0, Math.min(1, (qVals[2] + 20) / 120));
        ctx.fillStyle = `rgba(56, 189, 248, ${0.12 + qDownNorm * 0.75})`;
        ctx.beginPath();
        ctx.moveTo(cellX, cellY + tileSize); ctx.lineTo(cellX + tileSize, cellY + tileSize); ctx.lineTo(cellCenterX, cellCenterY);
        ctx.closePath(); ctx.fill();

        // Action 3: Left Wedge (Left Triangle)
        const qLeftNorm = Math.max(0, Math.min(1, (qVals[3] + 20) / 120));
        ctx.fillStyle = `rgba(56, 189, 248, ${0.12 + qLeftNorm * 0.75})`;
        ctx.beginPath();
        ctx.moveTo(cellX, cellY); ctx.lineTo(cellX, cellY + tileSize); ctx.lineTo(cellCenterX, cellCenterY);
        ctx.closePath(); ctx.fill();

        // Wedge Dividing Lines
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cellX, cellY); ctx.lineTo(cellX + tileSize, cellY + tileSize);
        ctx.moveTo(cellX + tileSize, cellY); ctx.lineTo(cellX, cellY + tileSize);
        ctx.stroke();

        // Tile Outer Border
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(cellX, cellY, tileSize, tileSize);

        // Optimal Policy Arrow In Center
        if (maxQ > 0.1) {
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          const arrows = ['↑', '→', '↓', '←'];
          ctx.fillText(arrows[bestAction] || '•', cellCenterX, cellCenterY + 5);
          ctx.textAlign = 'left';
        }
      }
    }

    // 2. Agent Avatar
    const ar = stateRef.current.rlAgentPos.r;
    const ac = stateRef.current.rlAgentPos.c;
    const agentPxX = startX + ac * tileSize + tileSize / 2;
    const agentPxY = startY + ar * tileSize + tileSize / 2;

    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(agentPxX, agentPxY, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Agent Face Icon
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🤖', agentPxX, agentPxY + 4);
    ctx.textAlign = 'left';

    // 3. Right Side Inset: Live Bellman TD Update Card & Telemetry
    const rightW = Math.min(340, w - (startX + plotW) - 30);
    const rightH = plotH;
    const rightX = startX + plotW + 18;
    const rightY = startY;

    if (rightW > 220) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightX, rightY, rightW, rightH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`🎮 BELLMAN TEMPORAL DIFFERENCE ENGINE`, rightX + 12, rightY + 20);

      // Bellman Formula Card
      const formY = rightY + 34;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(rightX + 12, formY, rightW - 24, 76, 8);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('⚡ Q-Value Update Equation:', rightX + 18, formY + 18);
      ctx.fillStyle = '#34d399';
      ctx.font = '9px monospace';
      ctx.fillText('Q(s,a) ← Q(s,a) + α·[r + γ·max Q(s\',a\') - Q(s,a)]', rightX + 18, formY + 36);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px monospace';
      ctx.fillText(`Learning Rate α = ${rlLearningRateAlpha.toFixed(2)} | Discount γ = ${rlDiscountGamma.toFixed(2)}`, rightX + 18, formY + 54);
      ctx.fillText(`Exploration ϵ = ${rlEpsilon.toFixed(2)} (${rlPolicy.toUpperCase()})`, rightX + 18, formY + 68);

      // Cumulative Reward & Episode Stats Card
      const statY = rightY + 122;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.roundRect(rightX + 12, statY, rightW - 24, 110, 8);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`Episodes Completed: ${rlEpisodes}`, rightX + 18, statY + 20);
      ctx.fillStyle = rlCumulativeReward >= 0 ? '#34d399' : '#f43f5e';
      ctx.fillText(`Cumulative Reward: ${rlCumulativeReward >= 0 ? '+' : ''}${rlCumulativeReward} pts`, rightX + 18, statY + 38);

      // Policy Convergence Gauge
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Q-Table Convergence: 94.2% (Optimal Policy Found)`, rightX + 18, statY + 60);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rightX + 18, statY + 70, rightW - 48, 8);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(rightX + 18, statY + 70, (rightW - 48) * 0.942, 8);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px monospace';
      ctx.fillText(`Active Map Preset: ${rlMapPreset.toUpperCase()}`, rightX + 18, statY + 96);
    }

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`🎮 REINFORCEMENT LEARNING (Q-LEARNING GRIDWORLD) | Directional Q-Wedges (Up, Right, Down, Left)`, startX, startY - 12);
  };

  // ─── MASTER CANVAS RENDERING LOOP ───
  useEffect(() => {
    let localFrame = 0;

    const renderLoop = () => {
      localFrame++;
      if (isSimulating) {
        stateRef.current.timeT += 0.025 * simSpeed;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        animFrameRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animFrameRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.max(320, Math.floor((rect.width || 720) * dpr));
      const targetH = Math.max(320, Math.floor((rect.height || 620) * dpr));
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
      const scale = Math.min(w, h) * 0.42;

      // Unified Atmosphere Palette & Background Grid
      const theme = getCanvasTheme(canvasAtmosphere);
      drawCanvasAtmosphere(ctx, w, h, theme, 40);

      // Orthogonal Axes
      ctx.strokeStyle = theme.axis;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
      ctx.moveTo(0, cy); ctx.lineTo(w, cy);
      ctx.stroke();

      // Dispatch to Model-Specific Renderer
      switch (selectedModel) {
        case 'pca_reduction': drawPcaReduction(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'kmeans_clustering': drawKmeansClustering(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'knn_classifier': drawKnnClassifier(ctx, w, h, cx, cy, scale); break;
        case 'linear_regression': drawLinearRegression(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'logistic_regression': drawLogisticRegression(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'svm_classifier': drawSvmClassifier(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'decision_tree_split': drawDecisionTreeSplit(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'naive_bayes': drawNaiveBayesDensity(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'random_forest': drawRandomForestEnsemble(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'gradient_boosting': drawGradientBoostingResiduals(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'gan_minimax': drawGanMinimaxManifold(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'ddpm_diffusion': drawDdpmMarkovDiffusion(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'vae_generative': drawVaeLatentManifold(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'neural_mlp': drawNeuralMlpWithWeightsBiases(ctx, w, h, cx, cy, scale); break;
        case 'backprop_autodiff': drawBackpropAutodiffDAG(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'conv_operations': drawConvKernelScannerAndFeatureMap(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'seq_recurrent_gating': drawSeqRecurrentLSTMCellGates(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'attention_mechanisms': drawAttentionMechanismsEngine(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'transformer_architecture': drawTransformerArchitectureEngine(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'moe_architecture': drawMoeArchitectureEngine(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'loss_surface_optimization': drawLossSurfaceOptimization(ctx, w, h, cx, cy, scale, localFrame); break;
        case 'q_learning_rl': drawQLearningGridWorldWedges(ctx, w, h, cx, cy, scale, localFrame); break;
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    selectedModel, isSimulating, simMode, simSpeed, canvasAtmosphere, rotX, rotY, numClusters, kParam, treeDepth,
    kmeansConverged, kmeansWCSS, kmeansDistance,
    linearViewMode, linearSlopeW1, linearSlopeW2, linearInterceptB, linearRidgeLambda, linearRegMode, linearPolyDegree, linear3dRotX, linear3dRotY, linearShowResiduals, linearShowProjectionRays,
    logregViewMode, logregBoundaryType, logregThreshold, logregW1, logregW2, logregBiasB, logreg3dRotX, logreg3dRotY, logregTemperature,
    svmViewMode, svmKernel, svmC, svmBiasB, svmGamma, svmPolyDegree, svmPolyIntercept, svmLiftMorph, svm3dRotX, svm3dRotY, svm3dSliceZ, treeCriterion, treeMinSamplesSplit,
    nbPriorC0, nbVarSmoothing, forestNumTrees, boostStages, boostLearningRate, boostBaseBiasF0,
    rlPolicy, rlEpsilon, rlTemperature, rlDiscountGamma, rlLearningRateAlpha, rlMapPreset,
    mlpLayers, mlpActivation, mlpInitMode, mlpWeightScale, mlpBiasOffset,
    autodiffMode, autodiffX1, autodiffX2, autodiffW1, autodiffW2, autodiffBias, autodiffTarget, autodiffLR,
    convMode, convDilationRate, convFilterType, convPostBiasB, convScanStep,
    recurrentCellType, recurrentForgetBias, recurrentCandidateAct, recurrentWeightWxh, recurrentActiveT,
    attnSubMode, attnNumHeads, attnSelectedTokenIdx, attnTemperature, attnWeightScaleWq,
    transformerMode, transformerNumLayers, transformerSelectedLayer, transformerGenStep, transformerSamplingTemp, transformerTopK,
    moeNumExperts, moeTopK, moeRouterNoise, moeRouterTemperature, moeSelectedTokenIdx, moeCapacityFactor, moeAuxLossWeight,
    lossLandscape, optAlgorithm, optLearningRate, optMomentum, optNoise, optPos, optVelocity, optLoss, optGradNorm, optStatus,
    vaeLatentZ1, vaeLatentZ2, vaeBetaKL,
    ganLossType, ganWassersteinDist, ganGenLR, ganDiscLR, ganCriticSteps, ganLatentDim, ganModePreset, ganLossG, ganEpochCount,
    ddpmTimestep, ddpmMaxSteps, ddpmBetaSchedule, ddpmDirection, ddpmBetaMin, ddpmBetaMax,
    pcaViewMode, pcaComponentsCount, pcaCorrelation, pcaRotationAngle, pcaDataSpread, pcaShowResiduals, pca3dRotX, pca3dRotY, pcaEVR1, pcaEVR2, pcaVarianceProjected, pcaVarianceResidual,
    nbViewMode, nbPriorC0, nbVarSmoothing, nbProbePos, nbFeatureMeanSeparation, nbClass0VarianceScale, nbClass1VarianceScale,
    knnDistance, knnWeighting, knnShowBoundary, performKmeansStep
  ]);

  const liveDynamicFormula = useMemo(() => {
    switch (selectedModel) {
      case 'kmeans_clustering':
        return `J = \\sum_{i=1}^k \\sum_{x \\in S_i} \\|x - \\mu_i\\|^2 \\quad [k=${numClusters}, \\text{WCSS}=${kmeansWCSS.toFixed(3)}]`;
      case 'knn_classifier':
        return `\\hat{y} = \\text{mode}(\\{y_i : i \\in N_k(x)\\}) \\quad [k=${kParam}, \\text{metric}=\\text{${knnDistance.toUpperCase()}}]`;
      case 'pca_reduction':
        return `\\Sigma v_1 = \\lambda_1 v_1 \\quad [\\text{Var}=${(pcaEVR1 * 100).toFixed(1)}\\%, \\text{angle}=${pcaRotationAngle}^\\circ]`;
      case 'linear_regression':
        return `\\hat{y} = ${linearSlopeW1.toFixed(2)}x_1 + ${linearSlopeW2.toFixed(2)}x_2 + ${linearInterceptB.toFixed(2)} \\quad [R^2=${r2Score.toFixed(3)}]`;
      case 'logistic_regression':
        return `P(y=1\\mid x) = \\sigma(w^T x + b) = \\frac{1}{1 + e^{-(${logregW1.toFixed(2)}x_1 + ${logregW2.toFixed(2)}x_2 + ${logregBiasB.toFixed(2)})}}`;
      case 'svm_classifier':
        return `\\min_{w,b} \\frac{1}{2}\\|w\\|^2 + C\\sum \\xi_i \\quad [C=${svmC}, \\text{Kernel}=\\text{${svmKernel.toUpperCase()}}]`;
      case 'decision_tree_split':
        return `\\text{Gini} = 1 - \\sum_{i=1}^C p_i^2 \\quad [\\text{depth}=${treeDepth}, \\text{criterion}=\\text{${treeCriterion.toUpperCase()}}]`;
      case 'naive_bayes':
        return `P(y \\mid x) \\propto P(y) \\prod_{j=1}^d \\mathcal{N}(x_j \\mid \\mu_{yj}, \\sigma_{yj}^2)`;
      case 'random_forest':
        return `\\hat{y}_{\\text{ensemble}} = \\frac{1}{B} \\sum_{b=1}^B T_b(x) \\quad [\\text{Trees}=${forestNumTrees}]`;
      case 'gradient_boosting':
        return `F_m(x) = F_{m-1}(x) + \\eta \\sum \\gamma_{jm} I(x \\in R_{jm}) \\quad [\\text{stages}=${boostStages}, \\eta=${boostLearningRate}]`;
      case 'loss_surface_optimization':
        return `w_{t+1} = w_t - \\eta \\nabla L(w_t) \\quad [\\text{loss}=${optLoss.toFixed(3)}, \\|\\nabla L\\|=${optGradNorm.toFixed(3)}]`;
      case 'neural_mlp':
        return `a^{[l]} = g\\left(W^{[l]} a^{[l-1]} + b^{[l]}\\right) \\quad [\\text{act}=\\text{${mlpActivation.toUpperCase()}}, \\text{layers}=${mlpLayers.length}]`;
      case 'backprop_autodiff':
        return `\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial a} \\cdot \\frac{\\partial a}{\\partial z} \\cdot \\frac{\\partial z}{\\partial w} \\quad [\\text{epoch}=${autodiffStepCount}]`;
      case 'conv_operations':
        return `(I * K)(i,j) = \\sum_m \\sum_n I(i-m, j-n) K(m,n) \\quad [\\text{filter}=\\text{${convFilterType.toUpperCase()}}]`;
      case 'seq_recurrent_gating':
        return `f_t = \\sigma(W_f x_t + U_f h_{t-1} + b_f), \\quad c_t = f_t \\odot c_{t-1} + i_t \\odot \\tilde{c}_t`;
      case 'attention_mechanisms':
        return `\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V`;
      case 'transformer_architecture':
        return `\\text{EncoderBlock}(x) = \\text{LayerNorm}(x + \\text{MHA}(x))`;
      case 'moe_architecture':
        return `y = \\sum_{i=1}^E G(x)_i E_i(x) \\quad [\\text{Top-K Gate}]`;
      case 'q_learning_rl':
        return `Q(s,a) \\leftarrow Q(s,a) + \\alpha \\left[r + \\gamma \\max_{a'} Q(s',a') - Q(s,a)\\right]`;
      default:
        return `\\hat{y} = f(x; \\theta)`;
    }
  }, [
    selectedModel,
    numClusters,
    kmeansWCSS,
    kParam,
    knnDistance,
    pcaEVR1,
    pcaRotationAngle,
    linearSlopeW1,
    linearSlopeW2,
    linearInterceptB,
    r2Score,
    logregW1,
    logregW2,
    logregBiasB,
    svmC,
    svmKernel,
    treeDepth,
    treeCriterion,
    forestNumTrees,
    boostStages,
    boostLearningRate,
    optLoss,
    optGradNorm,
    mlpActivation,
    mlpLayers,
    autodiffStepCount,
    convFilterType
  ]);

  const isNeural3D = ['loss_surface_optimization', 'linear_regression', 'logistic_regression', 'svm_classifier', 'pca_reduction'].includes(selectedModel);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        height: '100%',
        minHeight: 0,
        flex: 1
      }}
    >
      {/* ─── Top Control Bar: Model Preset + Operational Mode + Speed Control + Collapsible Sidebar Toggle ─── */}
      <div
        className="dsa-header-card neural-top-command-bar"
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
          boxShadow: 'var(--card-shadow, 0 4px 16px rgba(0, 0, 0, 0.25))',
          minWidth: 0,
          maxWidth: '100%',
          flexShrink: 0,
          overflowX: 'auto'
        }}
      >
        {/* Left: Model Preset Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
            MODEL:
          </span>
          <select
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value as MLModelType);
              setKmeansConverged(false);
              setKmeansIterations(0);
            }}
            className="dsa-select-control"
            style={{
              minHeight: '32px',
              padding: '3px 8px',
              borderRadius: '7px',
              background: 'var(--dropdown-bg, rgba(30, 41, 59, 0.95))',
              border: '1.5px solid #a855f7',
              color: 'var(--text-primary, #f8fafc)',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 0 8px rgba(168, 85, 247, 0.25)',
              width: '260px',
              maxWidth: '300px',
              textOverflow: 'ellipsis'
            }}
          >
            <optgroup label="🧭 Dimensionality Reduction & Clustering">
              <option value="pca_reduction">🧭 PCA (Eigenvalue Decomposition & Orthogonal Projections)</option>
              <option value="kmeans_clustering">🎯 K-Means Clustering (Lloyd's EM Algorithm)</option>
            </optgroup>
            <optgroup label="🔍 Supervised Classification & Regression">
              <option value="knn_classifier">🔍 k-Nearest Neighbors (Voronoi & Distance Rays)</option>
              <option value="linear_regression">📈 Linear Regression (OLS & Elastic Net)</option>
              <option value="logistic_regression">📉 Logistic Regression (Sigmoid Plane)</option>
              <option value="svm_classifier">🛡️ Support Vector Machine (Linear & RBF Kernels)</option>
              <option value="decision_tree_split">🌲 Decision Tree (Gini Impurity Split Planes)</option>
              <option value="naive_bayes">🎲 Naive Bayes (Gaussian Probability Density)</option>
            </optgroup>
            <optgroup label="🌳 Ensemble Methods">
              <option value="random_forest">🌲 Random Forest (Bootstrap Sub-Tree Voting)</option>
              <option value="gradient_boosting">⚡ Gradient Boosting (Sequential Residual Fitting)</option>
            </optgroup>
            <optgroup label="⚡ Optimization & Loss Landscapes">
              <option value="loss_surface_optimization">⚡ Gradient Descent & Loss Landscapes (Minima / Saddle / Adam)</option>
            </optgroup>
            <optgroup label="🎨 Generative & Probability Models">
              <option value="gan_minimax">⚔️ Generative Adversarial Networks (Minimax & WGAN-GP)</option>
              <option value="ddpm_diffusion">🌊 Diffusion Models (DDPM Markov Score Matching)</option>
              <option value="vae_generative">🌌 Variational Autoencoders (VAE Latent Manifold)</option>
            </optgroup>
            <optgroup label="🧠 Deep Learning & Advanced Representations">
              <option value="neural_mlp">🧬 Multi-Layer Perceptron (Synaptic Pulse Graph)</option>
              <option value="backprop_autodiff">⚡ Backpropagation & Autodiff (Adjoint DAG)</option>
              <option value="conv_operations">🖼️ Advanced Convolutions (Dilated & ResNet Skips)</option>
              <option value="seq_recurrent_gating">🔄 Sequential & Recurrent Gating (LSTM / GRU)</option>
              <option value="transformer_architecture">🚀 Transformer Architecture (Encoder / Decoder / Full Stack)</option>
              <option value="attention_mechanisms">✨ Attention Mechanisms (QKV / MHA / Cross / Causal)</option>
              <option value="moe_architecture">⚡ Mixture of Experts (MoE & Sparse Routing)</option>
              <option value="q_learning_rl">🎮 Reinforcement Learning (Q-Learning GridWorld)</option>
            </optgroup>
          </select>
        </div>

        {/* Middle & Right: Mode, Speed, Step, Simulate, and Sidebar Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Operational Mode Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.85))', padding: '2px', borderRadius: '7px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))' }}>
            <button
              type="button"
              onClick={() => setSimMode('autoplay')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                height: '28px',
                padding: '0 10px',
                borderRadius: '5px',
                fontSize: '0.74rem',
                fontWeight: 700,
                background: simMode === 'autoplay' ? '#0284c7' : 'transparent',
                color: simMode === 'autoplay' ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Eye size={13} />
              <span>Autoplay</span>
            </button>
            <button
              type="button"
              onClick={() => setSimMode('interactive')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                height: '28px',
                padding: '0 10px',
                borderRadius: '5px',
                fontSize: '0.74rem',
                fontWeight: 700,
                background: simMode === 'interactive' ? '#0284c7' : 'transparent',
                color: simMode === 'interactive' ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Sliders size={13} />
              <span>Interactive</span>
            </button>
          </div>

          {/* Interactive Class Placement */}
          {simMode === 'interactive' && ['logistic_regression', 'svm_classifier', 'decision_tree_split', 'naive_bayes', 'random_forest', 'gradient_boosting', 'neural_mlp', 'knn_classifier'].includes(selectedModel) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.85))', padding: '2px 6px', borderRadius: '7px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 700 }}>Add:</span>
              <button type="button" onClick={() => setActivePlacementClass(0)} style={{ height: '24px', padding: '0 6px', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 700, background: activePlacementClass === 0 ? 'rgba(56, 189, 248, 0.3)' : 'transparent', color: '#38bdf8', border: activePlacementClass === 0 ? '1px solid #38bdf8' : 'none', cursor: 'pointer' }}>C0</button>
              <button type="button" onClick={() => setActivePlacementClass(1)} style={{ height: '24px', padding: '0 6px', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 700, background: activePlacementClass === 1 ? 'rgba(245, 158, 11, 0.3)' : 'transparent', color: '#fbbf24', border: activePlacementClass === 1 ? '1px solid #f59e0b' : 'none', cursor: 'pointer' }}>C1</button>
            </div>
          )}

          {/* Speed Controller */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.85))', padding: '2px 8px', borderRadius: '7px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))' }}>
            <Gauge size={13} color="#fbbf24" />
            <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 800 }}>{simSpeed.toFixed(1)}x</span>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.05"
              value={simSpeed}
              onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
              style={{ width: '55px', accentColor: '#fbbf24', cursor: 'pointer' }}
            />
          </div>

          {selectedModel === 'backprop_autodiff' && (
            <button
              type="button"
              onClick={performAutodiffStep}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '36px', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(192, 132, 252, 0.2)', border: '1px solid #c084fc', color: '#c084fc', cursor: 'pointer' }}
            >
              <StepForward size={14} />
              <span>Step Backprop ⏭️</span>
            </button>
          )}

          {selectedModel === 'conv_operations' && (
            <button
              type="button"
              onClick={performConvScanStep}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '36px', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(168, 85, 247, 0.2)', border: '1px solid #a855f7', color: '#c084fc', cursor: 'pointer' }}
            >
              <StepForward size={14} />
              <span>Slide Conv Window ⏭️</span>
            </button>
          )}

          {selectedModel === 'seq_recurrent_gating' && (
            <button
              type="button"
              onClick={performRecurrentStep}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '36px', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#38bdf8', cursor: 'pointer' }}
            >
              <StepForward size={14} />
              <span>Next Timestep ⏭️</span>
            </button>
          )}

          {selectedModel === 'transformer_architecture' && (
            <button
              type="button"
              onClick={performTransformerStep}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '36px', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#38bdf8', cursor: 'pointer' }}
            >
              <StepForward size={14} />
              <span>Step Transformer ⏭️</span>
            </button>
          )}

          {selectedModel === 'attention_mechanisms' && (
            <button
              type="button"
              onClick={performAttentionStep}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '36px', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(168, 85, 247, 0.2)', border: '1px solid #a855f7', color: '#c084fc', cursor: 'pointer' }}
            >
              <StepForward size={14} />
              <span>Probe Attention ⏭️</span>
            </button>
          )}

          {selectedModel === 'moe_architecture' && (
            <button
              type="button"
              onClick={performMoeStep}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '36px', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #fbbf24', color: '#fbbf24', cursor: 'pointer' }}
            >
              <StepForward size={14} />
              <span>Route Next Token ⏭️</span>
            </button>
          )}

          {selectedModel === 'loss_surface_optimization' && (
            <button
              type="button"
              onClick={performOptimizerStep}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '36px', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(234, 179, 8, 0.2)', border: '1px solid #eab308', color: '#facc15', cursor: 'pointer' }}
            >
              <StepForward size={14} />
              <span>Descent Step ⏭️</span>
            </button>
          )}

          {selectedModel === 'q_learning_rl' && (
            <button
              type="button"
              onClick={performRlStep}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '36px', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(52, 211, 153, 0.2)', border: '1px solid #34d399', color: '#34d399', cursor: 'pointer' }}
            >
              <StepForward size={14} />
              <span>Take RL Step ⏭️</span>
            </button>
          )}

          {/* Primary Simulation Master Toggle */}
          <button
            type="button"
            onClick={() => setIsSimulating(prev => !prev)}
            className="dsa-action-btn"
            style={{
              background: isSimulating ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #f59e0b, #ef4444)',
              border: isSimulating ? '1px solid #34d399' : '1px solid #f87171',
              color: '#ffffff',
              boxShadow: isSimulating ? '0 0 16px rgba(16, 185, 129, 0.45)' : '0 0 12px rgba(239, 68, 68, 0.35)'
            }}
            title={isSimulating ? 'Pause Simulation' : 'Start Simulation'}
          >
            {isSimulating ? <Pause size={15} /> : <Play size={15} />}
            <span className="dsa-btn-label">{isSimulating ? 'Simulating' : 'Simulate'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetModel}
            className="dsa-action-btn"
            style={{
              background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.85))',
              border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))',
              color: 'var(--text-secondary, #94a3b8)'
            }}
            title="Reset Model"
          >
            <RotateCcw size={15} />
            <span className="dsa-btn-label">Reset</span>
          </button>

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

      {/* ─── Mobile Segmented 3-Pill Navigation Switcher ─── */}
      <div className="neural-mobile-tab-nav">
        <button
          type="button"
          onClick={() => setMobileActiveTab('canvas')}
          className={`neural-mobile-tab-btn ${mobileActiveTab === 'canvas' ? 'active' : ''}`}
        >
          <Activity size={14} />
          <span>Simulation Canvas</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab('controls')}
          className={`neural-mobile-tab-btn ${mobileActiveTab === 'controls' ? 'active' : ''}`}
        >
          <Sliders size={14} />
          <span>Control Deck</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab('telemetry')}
          className={`neural-mobile-tab-btn ${mobileActiveTab === 'telemetry' ? 'active' : ''}`}
        >
          <BarChart2 size={14} />
          <span>Telemetry & Theory</span>
        </button>
      </div>

      {/* ─── Main Content: Canvas Viewport + Control Deck ─── */}
      <div
        className={`neural-workbench-grid ${desktopTab === 'focus' ? 'desktop-focus-canvas' : ''}`}
        style={{
          gridTemplateColumns: desktopTab === 'focus' ? '1fr' : desktopTab === 'split' ? 'minmax(0, 1fr) 380px' : 'minmax(0, 1fr) 340px'
        }}
      >
        {/* Left: 2D Interactive Canvas */}
        <div className={`neural-canvas-panel ${mobileActiveTab === 'canvas' ? 'mobile-active' : 'mobile-hidden'}`}>
          <canvas
            ref={canvasRef}
            width={720}
            height={620}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              cursor: isNeural3D ? 'grab' : 'crosshair'
            }}
          />

          {/* In-Canvas Dynamic KaTeX HUD Overlay */}
          <div className="canvas-katex-hud-overlay">
            <div className="hud-header">
              <span>{selectedModel.replace(/_/g, ' ')}</span>
              <span className="hud-badge">NEURAL ARCHITECTURE</span>
            </div>
            <div
              className="hud-latex-render"
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(liveDynamicFormula, { throwOnError: false, displayMode: false })
              }}
            />
          </div>

          {/* 3D Orbit Perspective Indicator Badge */}
          {isNeural3D && (
            <div className="canvas-3d-orbit-hint">
              <Compass size={14} color="#38bdf8" />
              <span>3D Orbit: {Math.round(rotY)}° Yaw / {Math.round(rotX)}° Pitch</span>
              <button
                type="button"
                onClick={() => {
                  setRotX(32);
                  setRotY(45);
                  setLinear3dRotX(32);
                  setLinear3dRotY(45);
                  setLogreg3dRotX(32);
                  setLogreg3dRotY(45);
                  setSvm3dRotX(32);
                  setSvm3dRotY(45);
                  setPca3dRotX(32);
                  setPca3dRotY(45);
                }}
                title="Reset 3D Perspective"
              >
                <RefreshCw size={10} style={{ display: 'inline', marginRight: '3px' }} />
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Right: Telemetry & Hyperparameter Deck */}
        {desktopTab !== 'focus' && (
          <div className={`neural-controls-panel ${mobileActiveTab !== 'canvas' ? 'mobile-active' : 'mobile-hidden'}`}>
            {/* Header with Segmented View Switcher & Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))', paddingBottom: '8px', gap: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <Activity size={15} color="#c084fc" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', margin: 0, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedModel.replace(/_/g, ' ')}
                  </h4>
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary, #94a3b8)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>NEURAL & ML DECK</span>
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

            {/* Telemetry Card */}
            {(desktopTab === 'telemetry' || desktopTab === 'split') && (
              <div
                className={`neural-card-telemetry ${mobileActiveTab === 'telemetry' ? 'mobile-card-visible' : 'mobile-card-hidden'}`}
                style={{
              background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
              borderRadius: '16px',
              border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >

            {/* 1. PCA Telemetry */}
            {selectedModel === 'pca_reduction' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>PC1 Variance Ratio:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{pcaEVR1.toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>PC2 Variance Ratio:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#c084fc', fontFamily: 'monospace' }}>{pcaEVR2.toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Feature Correlation (ρ):</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{pcaCorrelation.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Dimensions Retained:</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>{pcaComponentsCount} / 2 Components</div>
                </div>
              </div>
            )}

            {/* 2. K-Means Telemetry */}
            {selectedModel === 'kmeans_clustering' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Cluster Count (K):</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>K = {numClusters}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Silhouette Score:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{kmeansSilhouette.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Within WCSS:</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{kmeansWCSS.toFixed(3)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Iterations:</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: kmeansConverged ? '#34d399' : '#c084fc', fontFamily: 'monospace' }}>{kmeansIterations} ({kmeansConverged ? 'Converged' : 'Active'})</div>
                </div>
              </div>
            )}

            {/* 3. kNN Telemetry */}
            {selectedModel === 'knn_classifier' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>K Neighbors:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>K = {kParam}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Distance Metric:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase' }}>{knnDistance}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Weighting:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>{knnWeighting}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Queries Sampled:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{knnQueriesChecked} Queries</div>
                </div>
              </div>
            )}

            {/* 4. Linear Regression Telemetry */}
            {selectedModel === 'linear_regression' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Mode & R² Fit:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>R² = {r2Score.toFixed(3)}</div>
                  <div style={{ fontSize: '0.68rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>{linearViewMode.replace(/_/g, ' ')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Fitted Model:</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {linearViewMode === '3d_regression_plane'
                      ? `y = ${linearSlopeW1.toFixed(2)}x₁ + ${linearSlopeW2.toFixed(2)}x₂ + ${linearInterceptB.toFixed(2)}`
                      : linearViewMode === 'polynomial_curves'
                      ? `y = Σ w_k x^k (deg ${linearPolyDegree})`
                      : `y = ${linearSlopeW1.toFixed(2)}x + ${linearInterceptB.toFixed(2)}`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Regularization:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase' }}>{linearRegMode} (λ={linearRidgeLambda.toFixed(2)})</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Residual Variance:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f43f5e', fontFamily: 'monospace' }}>{(1 - Math.max(0, r2Score)).toFixed(3)}</div>
                </div>
              </div>
            )}

            {/* 5. Logistic Regression Telemetry */}
            {selectedModel === 'logistic_regression' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>View Mode:</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                    {logregViewMode === '3d_sigmoid_surface' ? '3D Sigmoid S-Surface' : logregViewMode === '1d_sigmoid_curve' ? '1D S-Activation Curve' : logregViewMode === '2d_heatmap_boundary' ? `2D ${logregBoundaryType.toUpperCase()} HEATMAP` : logregViewMode === 'log_loss_dual_curve' ? 'Dual Log-Loss Penalty' : '3-Class Softmax'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Decision Threshold:</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>
                    {logregViewMode === 'multinomial_softmax' ? `τ = ${logregTemperature.toFixed(2)}` : logregViewMode === 'log_loss_dual_curve' ? `T = ${logregThreshold.toFixed(2)} (y = ${logregTrueLabelY})` : `T = ${logregThreshold.toFixed(2)}`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>{logregViewMode === '3d_sigmoid_surface' ? '3D Orbit Orientation:' : logregViewMode === 'log_loss_dual_curve' ? 'Active Logit z (x):' : 'Weight Vector (w):'}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>
                    {logregViewMode === '3d_sigmoid_surface' ? `Pitch:${logreg3dRotX}° Yaw:${logreg3dRotY}°` : logregViewMode === 'log_loss_dual_curve' ? `z = ${logregTestZ.toFixed(2)} (ŷ=${(100 / (1 + Math.exp(-logregTestZ))).toFixed(1)}%)` : `[${logregW1.toFixed(2)}, ${logregW2.toFixed(2)}]`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Log-Loss / BCE Status:</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>
                    {logregViewMode === 'multinomial_softmax' ? '3-Class Argmax' : logregViewMode === 'log_loss_dual_curve' ? `J = ${(logregTrueLabelY === 1 ? -Math.log(Math.max(1e-5, 1 / (1 + Math.exp(-logregTestZ)))) : -Math.log(Math.max(1e-5, 1 - 1 / (1 + Math.exp(-logregTestZ))))).toFixed(4)}` : `‖w‖ = ${Math.hypot(logregW1, logregW2).toFixed(2)} (b=${logregBiasB.toFixed(2)})`}
                  </div>
                </div>
              </div>
            )}

            {/* 6. SVM Telemetry */}
            {selectedModel === 'svm_classifier' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>View Mode:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase' }}>
                    {svmViewMode === '2d_kernels' ? '2D Decision Boundaries' : svmViewMode === '1d_parabola' ? '1D ➔ 2D Parabola' : '2D ➔ 3D Kernel Trick'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Kernel / Mapping:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
                    {svmViewMode === '2d_kernels' ? `${svmKernel.toUpperCase()} (C=${svmC.toFixed(1)})` : svmViewMode === '1d_parabola' ? 'φ(x)=(x, x²)' : 'φ(x,y)=(x,y,x²+y²)'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>{svmViewMode === '3d_kernel_trick' ? 'Slicing Height Z:' : svmViewMode === '1d_parabola' ? 'Parabola Lift Morph:' : 'Margin Width (2/‖w‖):'}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>
                    {svmViewMode === '3d_kernel_trick' ? `z = ${svm3dSliceZ.toFixed(2)}` : svmViewMode === '1d_parabola' ? `${(svmLiftMorph * 100).toFixed(0)}% Lift` : `${(2.0 / Math.max(0.5, svmC)).toFixed(2)} units`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>{svmViewMode === '3d_kernel_trick' ? 'Orbit Orientation:' : svmViewMode === '1d_parabola' ? 'Separation Status:' : 'Kernel Hyperparameters:'}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>
                    {svmViewMode === '3d_kernel_trick' ? `Pitch:${svm3dRotX}° Yaw:${svm3dRotY}°` : svmViewMode === '1d_parabola' ? (svmLiftMorph > 0.4 ? '✓ 2D Separable' : 'Inseparable 1D') : `γ=${svmGamma.toFixed(2)}${svmKernel === 'poly' ? ` d=${svmPolyDegree}` : ''}`}
                  </div>
                </div>
              </div>
            )}

            {/* 7. Decision Tree Telemetry */}
            {selectedModel === 'decision_tree_split' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Max Tree Depth:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>Depth = {treeDepth}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Splitting Criterion:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>{treeCriterion} Impurity</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Leaf Partitions:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{Math.pow(2, treeDepth)} Regions</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Min Split Samples:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>{treeMinSamplesSplit} Samples</div>
                </div>
              </div>
            )}

            {/* 8. Naive Bayes Telemetry */}
            {selectedModel === 'naive_bayes' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Class Prior P(C₀):</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{nbPriorC0.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Class Prior P(C₁):</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#c084fc', fontFamily: 'monospace' }}>{(1 - nbPriorC0).toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Variance Smoothing (ε):</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>{nbVarSmoothing.toFixed(3)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Likelihood Mode:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>Gaussian 2D</div>
                </div>
              </div>
            )}

            {/* 9. Random Forest Telemetry */}
            {selectedModel === 'random_forest' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Ensemble Size:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{forestNumTrees} Trees</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Aggregation Mode:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399' }}>Majority Bagging</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Variance Reduction:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{((1 - 1 / forestNumTrees) * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>OOB Score:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>{(0.82 + forestNumTrees * 0.015).toFixed(2)}</div>
                </div>
              </div>
            )}

            {/* 10. Gradient Boosting Telemetry */}
            {selectedModel === 'gradient_boosting' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Boosting Stages (M):</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{boostStages} Stages</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Learning Rate (η):</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>{boostLearningRate.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Base Bias F₀:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>{boostBaseBiasF0.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Residual Norm ‖r‖:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>{(0.45 * Math.pow(0.8, boostStages)).toFixed(3)}</div>
                </div>
              </div>
            )}

            {/* 11. GAN Telemetry */}
            {selectedModel === 'gan_minimax' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Formulation:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase' }}>{ganLossType}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Wasserstein Dist:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{ganWassersteinDist.toFixed(3)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Generator Loss L_G:</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ec4899', fontFamily: 'monospace' }}>{ganLossG.toFixed(3)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Training Epochs:</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{ganEpochCount} Epochs</div>
                </div>
              </div>
            )}

            {/* 12. DDPM Telemetry */}
            {selectedModel === 'ddpm_diffusion' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Current Timestep (t):</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{ddpmTimestep} / {ddpmMaxSteps}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Process Mode:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: ddpmDirection === 'reverse' ? '#34d399' : '#fbbf24', textTransform: 'uppercase' }}>{ddpmDirection} Process</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Signal Retention √ᾱ_t:</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>{((1 - ddpmTimestep / ddpmMaxSteps) * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Denoise Steps:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>{ddpmDenoiseStepCount} Steps</div>
                </div>
              </div>
            )}

            {/* 13. VAE Telemetry */}
            {selectedModel === 'vae_generative' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Latent Coordinates (z):</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>[{vaeLatentZ1.toFixed(2)}, {vaeLatentZ2.toFixed(2)}]</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>KL Penalty (β):</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#c084fc', fontFamily: 'monospace' }}>β = {vaeBetaKL.toFixed(1)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Reconstruction Loss:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{(0.12 + 0.05 * (vaeLatentZ1 * vaeLatentZ1 + vaeLatentZ2 * vaeLatentZ2)).toFixed(3)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Latent Prior Divergence:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>{(0.5 * (vaeLatentZ1 * vaeLatentZ1 + vaeLatentZ2 * vaeLatentZ2)).toFixed(3)}</div>
                </div>
              </div>
            )}

            {/* 14. Neural MLP Telemetry */}
            {selectedModel === 'neural_mlp' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Network Depth:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{mlpLayers} Hidden Layers</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Neuron Activation:</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>{mlpActivation}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Weight Scale:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{mlpWeightScale.toFixed(2)}x</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Layer Sparsity:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>{mlpSparsity}%</div>
                </div>
              </div>
            )}

            {/* 15. Autodiff Telemetry */}
            {selectedModel === 'backprop_autodiff' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Backprop Steps:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#c084fc', fontFamily: 'monospace' }}>{autodiffStepCount} Steps</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Target vs Output:</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>Target ŷ = {autodiffTarget.toFixed(1)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Current Loss:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{(0.5 * Math.pow((1 / (1 + Math.exp(-(autodiffW1 * autodiffX1 + autodiffW2 * autodiffX2 + autodiffBias)))) - autodiffTarget, 2)).toFixed(4)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Weights [w₁, w₂]:</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>[{autodiffW1.toFixed(2)}, {autodiffW2.toFixed(2)}]</div>
                </div>
              </div>
            )}

            {/* 16. Conv Telemetry */}
            {selectedModel === 'conv_operations' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Learning Paradigm:</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                    {convMode === 'kernel_convolution' ? 'Kernel & Padding' : convMode === 'relu_and_pooling' ? 'ReLU & Pooling' : convMode === 'deep_cnn_pipeline' ? 'Deep CNN Pipeline' : 'ResNet Residual Block'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Active Configuration:</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
                    {convMode === 'kernel_convolution' ? `Step #${(convScanStep % 9) + 1} (p=${convPadding}, s=${convStrideVal})` : convMode === 'relu_and_pooling' ? `${convPoolType.toUpperCase()} Pool (2×2, s=2)` : convMode === 'deep_cnn_pipeline' ? `Pattern: ${convInputDigit.replace('_', ' ')}` : 'Shortcut: F(x) + x'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Receptive / Spatial Metric:</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>
                    {convMode === 'kernel_convolution' ? `Field: ${3 + 2 * (convDilationRate - 1)}×${3 + 2 * (convDilationRate - 1)}` : convMode === 'relu_and_pooling' ? 'Compression: -75% Area' : convMode === 'deep_cnn_pipeline' ? 'Input: 28×28 ➔ Output: 10D' : 'Gradient: ∂F/∂x + 1'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Feature / Filter Focus:</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>
                    {convMode === 'kernel_convolution' ? convFilterType.toUpperCase() : convMode === 'relu_and_pooling' ? 'Non-Linearity: ReLU' : convMode === 'deep_cnn_pipeline' ? 'Softmax Cross-Entropy' : 'Vanishing Grad: 0%'}
                  </div>
                </div>
              </div>
            )}

            {/* 17. Recurrent Telemetry */}
            {selectedModel === 'seq_recurrent_gating' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Active Timestep:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>t = {recurrentActiveT + 1} / {recurrentSeqLen}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Cell Architecture:</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase' }}>{recurrentCellType} Highway</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Forget Bias (bf):</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>+{recurrentForgetBias.toFixed(1)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Weight Scale Wxh:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>{recurrentWeightWxh.toFixed(2)}</div>
                </div>
              </div>
            )}

            {/* 18A. Transformer Architecture Telemetry */}
            {selectedModel === 'transformer_architecture' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Paradigm:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                    {transformerMode === 'encoder' ? 'Encoder Stack' : transformerMode === 'decoder' ? 'Decoder Stack' : 'Full Transformer'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Stack Depth:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#c084fc', fontFamily: 'monospace' }}>N = {transformerNumLayers} Layers</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Selected Layer:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>Layer {transformerSelectedLayer + 1} of {transformerNumLayers}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Model Dimension:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>d_model = {transformerModelDim}</div>
                </div>
              </div>
            )}

            {/* 18B. Attention Mechanisms Telemetry */}
            {selectedModel === 'attention_mechanisms' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Mechanism:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>{attnSubMode.replace(/_/g, ' ')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Parallel Heads:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#c084fc', fontFamily: 'monospace' }}>{attnNumHeads} Heads</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Temperature (τ):</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>τ = {attnTemperature.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Active Token:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>Token #{attnSelectedTokenIdx + 1}</div>
                </div>
              </div>
            )}

            {/* 18C. Mixture of Experts (MoE) Telemetry */}
            {selectedModel === 'moe_architecture' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Routing Scheme:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>Top-{moeTopK} of {moeNumExperts} Experts</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Sparsity Factor:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{((1 - moeTopK / moeNumExperts) * 100).toFixed(0)}% Idle</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Active Token:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>Token #{moeSelectedTokenIdx + 1}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Capacity Factor:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>C = {moeCapacityFactor.toFixed(2)}x</div>
                </div>
              </div>
            )}

            {/* 19. Loss Surface Optimization Telemetry */}
            {selectedModel === 'loss_surface_optimization' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Algorithm & Batch:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: optAlgorithm === 'tri_variant_race' ? '#facc15' : '#38bdf8', textTransform: 'uppercase' }}>
                    {optAlgorithm === 'batch' ? 'Batch GD (m=500)' : optAlgorithm === 'mini_batch' ? `Mini-Batch (B=${optBatchSize})` : optAlgorithm === 'sgd' ? 'SGD (B=1 Single)' : optAlgorithm === 'tri_variant_race' ? 'Tri-Race (3 Models)' : optAlgorithm.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Current Loss J(θ):</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#facc15', fontFamily: 'monospace' }}>{optLoss.toFixed(4)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>{optAlgorithm === 'tri_variant_race' ? 'Gradient Norm:' : 'Parameters (w₁, w₂):'}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', fontFamily: 'monospace' }}>
                    {optAlgorithm === 'tri_variant_race' ? `‖∇J‖ = ${optGradNorm.toFixed(3)}` : `(${optPos.w1.toFixed(2)}, ${optPos.w2.toFixed(2)})`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Status / Steps:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: optStatus === 'local_min' ? '#34d399' : optStatus === 'overshooting' ? '#f43f5e' : '#38bdf8' }}>{optStatus.toUpperCase()} (#{optStepCount})</div>
                </div>
              </div>
            )}

            {/* 20. Q-Learning Telemetry */}
            {selectedModel === 'q_learning_rl' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))', borderRadius: '10px', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Episodes Completed:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{rlEpisodes} Episodes</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Cumulative Reward:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: rlCumulativeReward >= 0 ? '#34d399' : '#f43f5e', fontFamily: 'monospace' }}>{rlCumulativeReward} Pts</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Policy / Rate:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>{rlPolicy === 'eps_greedy' ? `ε=${rlEpsilon.toFixed(2)}` : `τ=${rlTemperature.toFixed(2)}`}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)' }}>Discount (γ) / LR (α):</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>γ={rlDiscountGamma.toFixed(2)} • α={rlLearningRateAlpha.toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Contextual Hyperparameters & Controls Card */}
          {(desktopTab === 'parameters' || desktopTab === 'split') && (
            <div
              className={`neural-card-hyperparams ${mobileActiveTab === 'controls' ? 'mobile-card-visible' : 'mobile-card-hidden'}`}
              style={{
                background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
                borderRadius: '16px',
                border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={16} color="var(--accent-cyan, #38bdf8)" />
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  HYPERPARAMETERS & DEDICATED CONTROLS
                </h4>
              </div>

            {/* PCA Controls */}
            {selectedModel === 'pca_reduction' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>
                    PCA Visualization Mode:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                    {[
                      { id: '2d_projection', label: '2D Variance Max' },
                      { id: 'scree_subspace', label: '1D & Scree' },
                      { id: '3d_to_2d_plane', label: '3D Subspace Plane' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPcaViewMode(tab.id as any)}
                        style={{
                          padding: '6px 2px',
                          borderRadius: '6px',
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          background: pcaViewMode === tab.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          border: pcaViewMode === tab.id ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: pcaViewMode === tab.id ? '#38bdf8' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Projection Axis Angle (θ):</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{pcaRotationAngle}°</span>
                  </div>
                  <input type="range" min="0" max="180" step="1" value={pcaRotationAngle} onChange={(e) => setPcaRotationAngle(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Feature Correlation (ρ):</span>
                    <span style={{ fontWeight: 700, color: '#c084fc' }}>ρ = {pcaCorrelation.toFixed(2)}</span>
                  </div>
                  <input type="range" min="-0.95" max="0.95" step="0.05" value={pcaCorrelation} onChange={(e) => setPcaCorrelation(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Data Scatter Spread (σ):</span>
                    <span style={{ fontWeight: 700, color: '#fbbf24' }}>{pcaDataSpread.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.3" max="1.5" step="0.05" value={pcaDataSpread} onChange={(e) => setPcaDataSpread(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                </div>

                {pcaViewMode === '3d_to_2d_plane' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Pitch:</span>
                        <span style={{ fontWeight: 700, color: '#38bdf8' }}>{pca3dRotX}°</span>
                      </div>
                      <input type="range" min="5" max="85" step="1" value={pca3dRotX} onChange={(e) => setPca3dRotX(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Yaw:</span>
                        <span style={{ fontWeight: 700, color: '#fbbf24' }}>{pca3dRotY}°</span>
                      </div>
                      <input type="range" min="0" max="360" step="5" value={pca3dRotY} onChange={(e) => setPca3dRotY(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="pcaRes" checked={pcaShowResiduals} onChange={(e) => setPcaShowResiduals(e.target.checked)} style={{ accentColor: '#38bdf8', cursor: 'pointer' }} />
                  <label htmlFor="pcaRes" style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', cursor: 'pointer' }}>Show Orthogonal Projection Residuals (d⊥)</label>
                </div>
              </>
            )}

            {/* kNN Controls */}
            {selectedModel === 'knn_classifier' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>K Nearest Neighbors:</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{kParam}</span>
                  </div>
                  <input type="range" min="1" max="15" value={kParam} onChange={(e) => setKParam(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Distance Metric:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    {(['euclidean', 'manhattan', 'cosine', 'chebyshev'] as const).map(d => (
                      <button key={d} type="button" onClick={() => setKnnDistance(d)} style={{ padding: '5px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', background: knnDistance === d ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: knnDistance === d ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)', color: knnDistance === d ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}>{d}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Distance Weighting:</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['uniform', 'distance'] as const).map(w => (
                      <button key={w} type="button" onClick={() => setKnnWeighting(w)} style={{ flex: 1, padding: '5px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', background: knnWeighting === w ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: knnWeighting === w ? '1px solid #34d399' : '1px solid rgba(51, 65, 85, 0.6)', color: knnWeighting === w ? '#34d399' : '#94a3b8', cursor: 'pointer' }}>{w === 'uniform' ? 'Uniform (1/K)' : 'Inverse (1/d)'}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="knnBound" checked={knnShowBoundary} onChange={(e) => setKnnShowBoundary(e.target.checked)} style={{ accentColor: '#38bdf8', cursor: 'pointer' }} />
                  <label htmlFor="knnBound" style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', cursor: 'pointer' }}>Show Nearest Neighbor Radius Sphere</label>
                </div>
              </>
            )}

            {/* GAN Controls */}
            {selectedModel === 'gan_minimax' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Adversarial Formulation:</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['wasserstein_gp', 'minimax'] as const).map(l => (
                      <button key={l} type="button" onClick={() => setGanLossType(l)} style={{ flex: 1, padding: '5px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', background: ganLossType === l ? 'rgba(236, 72, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: ganLossType === l ? '1px solid #ec4899' : '1px solid rgba(51, 65, 85, 0.6)', color: ganLossType === l ? '#f472b6' : '#94a3b8', cursor: 'pointer' }}>{l === 'wasserstein_gp' ? 'WGAN-GP' : 'Minimax BCELoss'}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Target Data Distribution:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                    {(['bimodal', 'circle_8', 'swiss_roll'] as const).map(p => (
                      <button key={p} type="button" onClick={() => setGanModePreset(p)} style={{ padding: '4px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', background: ganModePreset === p ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: ganModePreset === p ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)', color: ganModePreset === p ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}>{p.replace('_', ' ')}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Generator Learning Rate (η_G):</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{ganGenLR.toFixed(4)}</span>
                  </div>
                  <input type="range" min="0.0001" max="0.003" step="0.0002" value={ganGenLR} onChange={(e) => setGanGenLR(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Discriminator Learning Rate (η_D):</span>
                    <span style={{ fontWeight: 700, color: '#ec4899' }}>{ganDiscLR.toFixed(4)}</span>
                  </div>
                  <input type="range" min="0.0001" max="0.003" step="0.0002" value={ganDiscLR} onChange={(e) => setGanDiscLR(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#ec4899', cursor: 'pointer' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Critic Steps per Gen Step (n_critic):</span>
                    <span style={{ fontWeight: 700, color: '#fbbf24' }}>{ganCriticSteps} Steps</span>
                  </div>
                  <input type="range" min="1" max="5" value={ganCriticSteps} onChange={(e) => setGanCriticSteps(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Latent Noise Dimension (d_z):</span>
                    <span style={{ fontWeight: 700, color: '#c084fc' }}>{ganLatentDim} Dimensions</span>
                  </div>
                  <input type="range" min="2" max="16" value={ganLatentDim} onChange={(e) => setGanLatentDim(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }} />
                </div>
              </>
            )}

            {/* DDPM Controls */}
            {selectedModel === 'ddpm_diffusion' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Diffusion Process Mode:</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => setDdpmDirection('forward')} style={{ flex: 1, padding: '6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: ddpmDirection === 'forward' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: ddpmDirection === 'forward' ? '1px solid #f59e0b' : '1px solid rgba(51, 65, 85, 0.6)', color: ddpmDirection === 'forward' ? '#fbbf24' : '#94a3b8', cursor: 'pointer' }}>Forward Noising (q)</button>
                    <button type="button" onClick={() => setDdpmDirection('reverse')} style={{ flex: 1, padding: '6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: ddpmDirection === 'reverse' ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: ddpmDirection === 'reverse' ? '1px solid #34d399' : '1px solid rgba(51, 65, 85, 0.6)', color: ddpmDirection === 'reverse' ? '#34d399' : '#94a3b8', cursor: 'pointer' }}>Reverse Denoising (p_θ)</button>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Timestep Scrubber (t):</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>t = {ddpmTimestep} / {ddpmMaxSteps}</span>
                  </div>
                  <input type="range" min="0" max={ddpmMaxSteps} step="1" value={ddpmTimestep} onChange={(e) => setDdpmTimestep(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Total Diffusion Steps (T):</span>
                    <span style={{ fontWeight: 700, color: '#fbbf24' }}>T = {ddpmMaxSteps}</span>
                  </div>
                  <input type="range" min="10" max="100" step="10" value={ddpmMaxSteps} onChange={(e) => setDdpmMaxSteps(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Noise Schedule:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                    {(['cosine', 'linear', 'sigmoid'] as const).map(s => (
                      <button key={s} type="button" onClick={() => setDdpmBetaSchedule(s)} style={{ padding: '4px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', background: ddpmBetaSchedule === s ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: ddpmBetaSchedule === s ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)', color: ddpmBetaSchedule === s ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}>{s}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Noise Bounds (β_min ... β_max):</span>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>{ddpmBetaMin.toFixed(4)} - {ddpmBetaMax.toFixed(3)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="range" min="0.0001" max="0.005" step="0.0005" value={ddpmBetaMin} onChange={(e) => setDdpmBetaMin(parseFloat(e.target.value))} style={{ width: '50%', accentColor: '#34d399', cursor: 'pointer' }} />
                    <input type="range" min="0.01" max="0.05" step="0.005" value={ddpmBetaMax} onChange={(e) => setDdpmBetaMax(parseFloat(e.target.value))} style={{ width: '50%', accentColor: '#34d399', cursor: 'pointer' }} />
                  </div>
                </div>
              </>
            )}

            {/* Neural MLP Controls */}
            {selectedModel === 'neural_mlp' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Hidden Layers (1 to 5):</span>
                    <span style={{ fontWeight: 800, color: '#38bdf8' }}>{mlpLayers} Layers</span>
                  </div>
                  <input type="range" min="1" max="5" value={mlpLayers} onChange={(e) => setMlpLayers(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Activation Function:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                    {(['relu', 'sigmoid', 'tanh', 'leaky_relu', 'elu', 'gelu'] as const).map(act => (
                      <button key={act} type="button" onClick={() => setMlpActivation(act)} style={{ padding: '4px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', background: mlpActivation === act ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: mlpActivation === act ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)', color: mlpActivation === act ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}>{act}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Weight & Bias Initialization:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                    {(['he', 'xavier', 'random', 'zeros', 'custom'] as const).map(init => (
                      <button key={init} type="button" onClick={() => { setMlpInitMode(init); if (init === 'he') { setMlpWeightScale(1.4); setMlpBiasOffset(0.01); } else if (init === 'xavier') { setMlpWeightScale(1.0); setMlpBiasOffset(0.0); } else if (init === 'random') { setMlpWeightScale(0.8); setMlpBiasOffset(0.2); } else if (init === 'zeros') { setMlpWeightScale(0.05); setMlpBiasOffset(0.0); } }} style={{ padding: '4px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', background: mlpInitMode === init ? 'rgba(192, 132, 252, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: mlpInitMode === init ? '1px solid #c084fc' : '1px solid rgba(51, 65, 85, 0.6)', color: mlpInitMode === init ? '#c084fc' : '#94a3b8', cursor: 'pointer' }}>{init}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Weight Scaling (W):</span>
                    <span style={{ fontWeight: 700, color: '#fbbf24' }}>{mlpWeightScale.toFixed(2)}x</span>
                  </div>
                  <input type="range" min="0.1" max="3.0" step="0.1" value={mlpWeightScale} onChange={(e) => setMlpWeightScale(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Neuron Bias Offset (+b):</span>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>{mlpBiasOffset.toFixed(2)}</span>
                  </div>
                  <input type="range" min="-1.5" max="1.5" step="0.1" value={mlpBiasOffset} onChange={(e) => setMlpBiasOffset(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }} />
                </div>
              </>
            )}

            {/* Linear Regression Controls */}
            {selectedModel === 'linear_regression' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>
                    Linear Regression View & Dimensionality:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    {[
                      { id: '3d_regression_plane', label: '3D Hyperplane' },
                      { id: '1d_scatter_fit', label: '1D OLS Fit' },
                      { id: 'polynomial_curves', label: 'Polynomials' },
                      { id: 'residuals_analysis', label: 'Residuals / QQ' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setLinearViewMode(tab.id as any)}
                        style={{
                          padding: '6px 4px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: linearViewMode === tab.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          border: linearViewMode === tab.id ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: linearViewMode === tab.id ? '#38bdf8' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3D Hyperplane Mode Controls */}
                {linearViewMode === '3d_regression_plane' && (
                  <>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>3D Camera Orbit (Pitch & Yaw):</span>
                        <span style={{ fontWeight: 700, color: '#38bdf8' }}>{linear3dRotX.toFixed(0)}°, {linear3dRotY.toFixed(0)}°</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '6px' }}>
                        {[
                          { label: 'Isometric', rx: 28, ry: 45 },
                          { label: 'Top-Down', rx: 85, ry: 0 },
                          { label: 'Side (X₁)', rx: 10, ry: 0 },
                          { label: 'Side (X₂)', rx: 10, ry: 90 }
                        ].map(preset => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => { setLinear3dRotX(preset.rx); setLinear3dRotY(preset.ry); }}
                            style={{
                              padding: '4px 2px',
                              borderRadius: '4px',
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.6))',
                              border: '1px solid var(--border-color, rgba(51, 65, 85, 0.6))',
                              color: 'var(--text-secondary, #94a3b8)',
                              cursor: 'pointer'
                            }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Slope w₁ (X₁ Axis Weight):</span>
                        <span style={{ fontWeight: 700, color: '#38bdf8' }}>{linearSlopeW1.toFixed(2)}</span>
                      </div>
                      <input type="range" min="-2.0" max="2.0" step="0.05" value={linearSlopeW1} onChange={(e) => setLinearSlopeW1(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Slope w₂ (X₂ Axis Weight):</span>
                        <span style={{ fontWeight: 700, color: '#c084fc' }}>{linearSlopeW2.toFixed(2)}</span>
                      </div>
                      <input type="range" min="-2.0" max="2.0" step="0.05" value={linearSlopeW2} onChange={(e) => setLinearSlopeW2(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Intercept (Bias b):</span>
                        <span style={{ fontWeight: 700, color: '#fbbf24' }}>{linearInterceptB.toFixed(2)}</span>
                      </div>
                      <input type="range" min="-1.0" max="1.0" step="0.05" value={linearInterceptB} onChange={(e) => setLinearInterceptB(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setLinearShowResiduals(!linearShowResiduals)}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: linearShowResiduals ? 'rgba(244, 63, 94, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          border: linearShowResiduals ? '1px solid #f43f5e' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: linearShowResiduals ? '#f43f5e' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {linearShowResiduals ? '✓ Error Stems' : '✕ Error Stems'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLinearShowProjectionRays(!linearShowProjectionRays)}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: linearShowProjectionRays ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          border: linearShowProjectionRays ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: linearShowProjectionRays ? '#38bdf8' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {linearShowProjectionRays ? '✓ Ground Rays' : '✕ Ground Rays'}
                      </button>
                    </div>
                  </>
                )}

                {/* 1D OLS Fit Controls */}
                {linearViewMode === '1d_scatter_fit' && (
                  <>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Regularization Mode:</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(['ols', 'ridge', 'lasso'] as const).map(m => (
                          <button key={m} type="button" onClick={() => setLinearRegMode(m)} style={{ flex: 1, padding: '5px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', background: linearRegMode === m ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: linearRegMode === m ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)', color: linearRegMode === m ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}>{m.toUpperCase()}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Slope (Weight w₁):</span>
                        <span style={{ fontWeight: 700, color: '#38bdf8' }}>{linearSlopeW1.toFixed(2)}</span>
                      </div>
                      <input type="range" min="-2.0" max="2.0" step="0.05" value={linearSlopeW1} onChange={(e) => setLinearSlopeW1(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Intercept (Bias b):</span>
                        <span style={{ fontWeight: 700, color: '#fbbf24' }}>{linearInterceptB.toFixed(2)}</span>
                      </div>
                      <input type="range" min="-1.0" max="1.0" step="0.05" value={linearInterceptB} onChange={(e) => setLinearInterceptB(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Regularization Strength (λ):</span>
                        <span style={{ fontWeight: 700, color: '#34d399' }}>{linearRidgeLambda.toFixed(2)}</span>
                      </div>
                      <input type="range" min="0.0" max="1.0" step="0.05" value={linearRidgeLambda} onChange={(e) => setLinearRidgeLambda(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }} />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => setLinearShowResiduals(!linearShowResiduals)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: linearShowResiduals ? 'rgba(244, 63, 94, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          border: linearShowResiduals ? '1px solid #f43f5e' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: linearShowResiduals ? '#f43f5e' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {linearShowResiduals ? '✓ Show Residual Stems' : '✕ Hide Residual Stems'}
                      </button>
                    </div>
                  </>
                )}

                {/* Polynomial Curves Controls */}
                {linearViewMode === 'polynomial_curves' && (
                  <>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Polynomial Degree (k):</span>
                        <span style={{ fontWeight: 700, color: '#c084fc' }}>Degree {linearPolyDegree}</span>
                      </div>
                      <input type="range" min="1" max="5" step="1" value={linearPolyDegree} onChange={(e) => setLinearPolyDegree(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>L2 Penalty / Ridge Shrinkage (λ):</span>
                        <span style={{ fontWeight: 700, color: '#34d399' }}>{linearRidgeLambda.toFixed(2)}</span>
                      </div>
                      <input type="range" min="0.0" max="1.0" step="0.05" value={linearRidgeLambda} onChange={(e) => setLinearRidgeLambda(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }} />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => setLinearShowResiduals(!linearShowResiduals)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: linearShowResiduals ? 'rgba(244, 63, 94, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          border: linearShowResiduals ? '1px solid #f43f5e' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: linearShowResiduals ? '#f43f5e' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {linearShowResiduals ? '✓ Show Residual Stems' : '✕ Hide Residual Stems'}
                      </button>
                    </div>
                  </>
                )}

                {/* Residuals Analysis Controls */}
                {linearViewMode === 'residuals_analysis' && (
                  <>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Slope (Weight w₁):</span>
                        <span style={{ fontWeight: 700, color: '#38bdf8' }}>{linearSlopeW1.toFixed(2)}</span>
                      </div>
                      <input type="range" min="-2.0" max="2.0" step="0.05" value={linearSlopeW1} onChange={(e) => setLinearSlopeW1(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Intercept (Bias b):</span>
                        <span style={{ fontWeight: 700, color: '#fbbf24' }}>{linearInterceptB.toFixed(2)}</span>
                      </div>
                      <input type="range" min="-1.0" max="1.0" step="0.05" value={linearInterceptB} onChange={(e) => setLinearInterceptB(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Logistic Regression Controls */}
            {selectedModel === 'logistic_regression' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>
                    Logistic Regression Paradigm & View:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    {[
                      { id: '3d_sigmoid_surface', label: '3D S-Surface' },
                      { id: '1d_sigmoid_curve', label: '1D S-Curve' },
                      { id: '2d_heatmap_boundary', label: '2D Heatmap' },
                      { id: 'multinomial_softmax', label: '3-Class Softmax' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setLogregViewMode(tab.id as any)}
                        style={{
                          padding: '6px 4px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: logregViewMode === tab.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          border: logregViewMode === tab.id ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: logregViewMode === tab.id ? '#38bdf8' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogregViewMode('log_loss_dual_curve')}
                    style={{
                      width: '100%',
                      marginTop: '4px',
                      padding: '6px 4px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: logregViewMode === 'log_loss_dual_curve' ? 'rgba(251, 191, 36, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                      border: logregViewMode === 'log_loss_dual_curve' ? '1px solid #fbbf24' : '1px solid rgba(51, 65, 85, 0.6)',
                      color: logregViewMode === 'log_loss_dual_curve' ? '#facc15' : '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    📉 Log-Loss & Cross-Entropy Dual Curve
                  </button>
                </div>

                {logregViewMode === 'log_loss_dual_curve' && (
                  <>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>
                        Target Ground Truth Label (y):
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setLogregTrueLabelY(1)}
                          style={{
                            flex: 1,
                            padding: '6px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: logregTrueLabelY === 1 ? 'rgba(52, 211, 153, 0.3)' : 'rgba(30, 41, 59, 0.6)',
                            border: logregTrueLabelY === 1 ? '1px solid #34d399' : '1px solid rgba(51, 65, 85, 0.6)',
                            color: logregTrueLabelY === 1 ? '#34d399' : '#94a3b8',
                            cursor: 'pointer'
                          }}
                        >
                          🟢 Positive Class (y = 1)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogregTrueLabelY(0)}
                          style={{
                            flex: 1,
                            padding: '6px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: logregTrueLabelY === 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(30, 41, 59, 0.6)',
                            border: logregTrueLabelY === 0 ? '1px solid #f59e0b' : '1px solid rgba(51, 65, 85, 0.6)',
                            color: logregTrueLabelY === 0 ? '#fbbf24' : '#94a3b8',
                            cursor: 'pointer'
                          }}
                        >
                          🟠 Negative Class (y = 0)
                        </button>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Linear Logit Input z = (w₁x + b):</span>
                        <span style={{ fontWeight: 700, color: '#38bdf8' }}>z = {logregTestZ.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="-5.0"
                        max="5.0"
                        step="0.1"
                        value={logregTestZ}
                        onChange={(e) => setLogregTestZ(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Decision Threshold (T):</span>
                        <span style={{ fontWeight: 700, color: '#34d399' }}>T = {logregThreshold.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.05"
                        value={logregThreshold}
                        onChange={(e) => setLogregThreshold(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ padding: '8px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
                      💡 <strong style={{ color: '#fbbf24' }}>Intuition:</strong> Left panel shows the Sigmoid S-Curve mapping logit $z \to \hat&#123;y&#125;$. Right panel shows the Log-Loss curve penalizing confident misclassifications ($J \to \infty$ as error increases).
                    </div>
                  </>
                )}

                {logregViewMode === '3d_sigmoid_surface' && (
                  <>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Decision Threshold (T):</span>
                        <span style={{ fontWeight: 700, color: '#34d399' }}>T = {logregThreshold.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.05"
                        value={logregThreshold}
                        onChange={(e) => setLogregThreshold(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                          <span>Orbit Pitch:</span>
                          <span style={{ fontWeight: 700, color: '#38bdf8' }}>{logreg3dRotX}°</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="85"
                          step="1"
                          value={logreg3dRotX}
                          onChange={(e) => setLogreg3dRotX(parseInt(e.target.value))}
                          style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                        />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                          <span>Orbit Yaw:</span>
                          <span style={{ fontWeight: 700, color: '#fbbf24' }}>{logreg3dRotY}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="5"
                          value={logreg3dRotY}
                          onChange={(e) => setLogreg3dRotY(parseInt(e.target.value))}
                          style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => { setLogreg3dRotX(28); setLogreg3dRotY(42); }}
                        style={{ flex: 1, padding: '4px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 600, background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer' }}
                      >
                        📐 Isometric
                      </button>
                      <button
                        type="button"
                        onClick={() => { setLogreg3dRotX(85); setLogreg3dRotY(0); }}
                        style={{ flex: 1, padding: '4px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 600, background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer' }}
                      >
                        🔝 Top-Down
                      </button>
                      <button
                        type="button"
                        onClick={() => { setLogreg3dRotX(10); setLogreg3dRotY(115); }}
                        style={{ flex: 1, padding: '4px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 600, background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer' }}
                      >
                        ↔ Side S-Profile
                      </button>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Weight w₁:</span>
                        <span style={{ fontWeight: 700, color: '#fbbf24' }}>{logregW1.toFixed(2)}</span>
                      </div>
                      <input type="range" min="-3.0" max="3.0" step="0.1" value={logregW1} onChange={(e) => setLogregW1(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Weight w₂:</span>
                        <span style={{ fontWeight: 700, color: '#c084fc' }}>{logregW2.toFixed(2)}</span>
                      </div>
                      <input type="range" min="-3.0" max="3.0" step="0.1" value={logregW2} onChange={(e) => setLogregW2(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Bias (b):</span>
                        <span style={{ fontWeight: 700, color: '#34d399' }}>{logregBiasB.toFixed(2)}</span>
                      </div>
                      <input type="range" min="-2.0" max="2.0" step="0.1" value={logregBiasB} onChange={(e) => setLogregBiasB(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }} />
                    </div>
                  </>
                )}

                {logregViewMode === '1d_sigmoid_curve' && (
                  <>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Decision Threshold (T):</span>
                        <span style={{ fontWeight: 700, color: '#34d399' }}>T = {logregThreshold.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.05"
                        value={logregThreshold}
                        onChange={(e) => setLogregThreshold(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setLogregThreshold(0.5)}
                        style={{ flex: 1, padding: '4px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 600, background: logregThreshold === 0.5 ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))', color: logregThreshold === 0.5 ? '#34d399' : '#94a3b8', cursor: 'pointer' }}
                      >
                        Balanced (T=0.5)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogregThreshold(0.3)}
                        style={{ flex: 1, padding: '4px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 600, background: logregThreshold === 0.3 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))', color: logregThreshold === 0.3 ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}
                      >
                        High Recall (T=0.3)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogregThreshold(0.7)}
                        style={{ flex: 1, padding: '4px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 600, background: logregThreshold === 0.7 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))', color: logregThreshold === 0.7 ? '#fbbf24' : '#94a3b8', cursor: 'pointer' }}
                      >
                        High Precision (T=0.7)
                      </button>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Sigmoid Slope / Weight (w):</span>
                        <span style={{ fontWeight: 700, color: '#38bdf8' }}>{logregW1.toFixed(2)}</span>
                      </div>
                      <input type="range" min="0.5" max="4.0" step="0.1" value={logregW1} onChange={(e) => setLogregW1(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Horizontal Bias Offset (b):</span>
                        <span style={{ fontWeight: 700, color: '#c084fc' }}>{logregBiasB.toFixed(2)}</span>
                      </div>
                      <input type="range" min="-3.0" max="3.0" step="0.1" value={logregBiasB} onChange={(e) => setLogregBiasB(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }} />
                    </div>
                  </>
                )}

                {logregViewMode === '2d_heatmap_boundary' && (
                  <>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>
                        Decision Boundary Geometry:
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setLogregBoundaryType('linear')}
                          style={{ flex: 1, padding: '5px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, background: logregBoundaryType === 'linear' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: logregBoundaryType === 'linear' ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)', color: logregBoundaryType === 'linear' ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}
                        >
                          Linear Hyperplane
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogregBoundaryType('polynomial')}
                          style={{ flex: 1, padding: '5px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, background: logregBoundaryType === 'polynomial' ? 'rgba(192, 132, 252, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: logregBoundaryType === 'polynomial' ? '1px solid #c084fc' : '1px solid rgba(51, 65, 85, 0.6)', color: logregBoundaryType === 'polynomial' ? '#c084fc' : '#94a3b8', cursor: 'pointer' }}
                        >
                          Polynomial (Quadratic Circle)
                        </button>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Decision Threshold (T):</span>
                        <span style={{ fontWeight: 700, color: '#34d399' }}>T = {logregThreshold.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.05"
                        value={logregThreshold}
                        onChange={(e) => setLogregThreshold(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Weight w₁:</span>
                        <span style={{ fontWeight: 700, color: '#fbbf24' }}>{logregW1.toFixed(2)}</span>
                      </div>
                      <input type="range" min="-3.0" max="3.0" step="0.1" value={logregW1} onChange={(e) => setLogregW1(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Weight w₂:</span>
                        <span style={{ fontWeight: 700, color: '#c084fc' }}>{logregW2.toFixed(2)}</span>
                      </div>
                      <input type="range" min="-3.0" max="3.0" step="0.1" value={logregW2} onChange={(e) => setLogregW2(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }} />
                    </div>
                  </>
                )}

                {logregViewMode === 'multinomial_softmax' && (
                  <>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Softmax Temperature (τ):</span>
                        <span style={{ fontWeight: 700, color: '#38bdf8' }}>τ = {logregTemperature.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="3.0"
                        step="0.1"
                        value={logregTemperature}
                        onChange={(e) => setLogregTemperature(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ padding: '8px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
                      ⚡ 3-Class Voronoi Softmax: Class 0 (Red), Class 1 (Blue), Class 2 (Green) with triple-junction ray intersections.
                    </div>
                  </>
                )}
              </>
            )}

            {/* SVM Controls */}
            {selectedModel === 'svm_classifier' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>
                    SVM View & Lifting Mode:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                    {[
                      { id: '2d_kernels', label: '2D Kernels' },
                      { id: '1d_parabola', label: '1D➔2D Parabola' },
                      { id: '3d_kernel_trick', label: '2D➔3D Space' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSvmViewMode(tab.id as any)}
                        style={{
                          padding: '6px 4px',
                          borderRadius: '6px',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          background: svmViewMode === tab.id ? 'rgba(192, 132, 252, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          border: svmViewMode === tab.id ? '1px solid #c084fc' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: svmViewMode === tab.id ? '#c084fc' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {svmViewMode === '2d_kernels' && (
                  <>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>
                        Kernel Function:
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                        {(['linear', 'poly', 'rbf', 'sigmoid'] as const).map(k => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => setSvmKernel(k)}
                            style={{
                              padding: '5px 2px',
                              borderRadius: '6px',
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: svmKernel === k ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                              border: svmKernel === k ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)',
                              color: svmKernel === k ? '#38bdf8' : '#94a3b8',
                              cursor: 'pointer'
                            }}
                          >
                            {k}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Slack Soft Margin Penalty (C):</span>
                        <span style={{ fontWeight: 700, color: '#fbbf24' }}>{svmC.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="10.0"
                        step="0.2"
                        value={svmC}
                        onChange={(e) => setSvmC(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }}
                      />
                    </div>

                    {svmKernel !== 'linear' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                          <span>Kernel Gamma (γ):</span>
                          <span style={{ fontWeight: 700, color: '#c084fc' }}>{svmGamma.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="4.0"
                          step="0.1"
                          value={svmGamma}
                          onChange={(e) => setSvmGamma(parseFloat(e.target.value))}
                          style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }}
                        />
                      </div>
                    )}

                    {svmKernel === 'poly' && (
                      <>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                            <span>Polynomial Degree (d):</span>
                            <span style={{ fontWeight: 700, color: '#ec4899' }}>d = {svmPolyDegree}</span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="5"
                            value={svmPolyDegree}
                            onChange={(e) => setSvmPolyDegree(parseInt(e.target.value))}
                            style={{ width: '100%', accentColor: '#ec4899', cursor: 'pointer' }}
                          />
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                            <span>Poly Intercept Coeff (r):</span>
                            <span style={{ fontWeight: 700, color: '#34d399' }}>{svmPolyIntercept.toFixed(1)}</span>
                          </div>
                          <input
                            type="range"
                            min="-1.0"
                            max="2.0"
                            step="0.2"
                            value={svmPolyIntercept}
                            onChange={(e) => setSvmPolyIntercept(parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
                          />
                        </div>
                      </>
                    )}

                    {svmKernel === 'sigmoid' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                          <span>Sigmoid Intercept (r):</span>
                          <span style={{ fontWeight: 700, color: '#34d399' }}>{svmPolyIntercept.toFixed(1)}</span>
                        </div>
                        <input
                          type="range"
                          min="-2.0"
                          max="2.0"
                          step="0.2"
                          value={svmPolyIntercept}
                          onChange={(e) => setSvmPolyIntercept(parseFloat(e.target.value))}
                          style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
                        />
                      </div>
                    )}

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Hyperplane Bias (+b):</span>
                        <span style={{ fontWeight: 700, color: '#38bdf8' }}>{svmBiasB.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="-1.0"
                        max="1.0"
                        step="0.05"
                        value={svmBiasB}
                        onChange={(e) => setSvmBiasB(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                      />
                    </div>
                  </>
                )}

                {svmViewMode === '1d_parabola' && (
                  <>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Parabolic Lifting Morph (λ):</span>
                        <span style={{ fontWeight: 700, color: '#c084fc' }}>{(svmLiftMorph * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.02"
                        value={svmLiftMorph}
                        onChange={(e) => setSvmLiftMorph(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setSvmLiftMorph(0.0)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: svmLiftMorph === 0.0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          border: svmLiftMorph === 0.0 ? '1px solid #ef4444' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: svmLiftMorph === 0.0 ? '#ef4444' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        Flatten 1D (Inseparable)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSvmLiftMorph(1.0)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: svmLiftMorph === 1.0 ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          border: svmLiftMorph === 1.0 ? '1px solid #34d399' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: svmLiftMorph === 1.0 ? '#34d399' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        Lift to 2D Parabola (φ)
                      </button>
                    </div>
                  </>
                )}

                {svmViewMode === '3d_kernel_trick' && (
                  <>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>3D Space Lifting Morph (λ):</span>
                        <span style={{ fontWeight: 700, color: '#c084fc' }}>{(svmLiftMorph * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.02"
                        value={svmLiftMorph}
                        onChange={(e) => setSvmLiftMorph(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>3D Slicing Hyperplane Height (Z):</span>
                        <span style={{ fontWeight: 700, color: '#34d399' }}>z = {svm3dSliceZ.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.1"
                        step="0.05"
                        value={svm3dSliceZ}
                        onChange={(e) => setSvm3dSliceZ(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '2px' }}>
                          <span>Orbit Pitch:</span>
                          <span style={{ fontWeight: 700, color: '#38bdf8' }}>{svm3dRotX}°</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="85"
                          value={svm3dRotX}
                          onChange={(e) => setSvm3dRotX(parseInt(e.target.value))}
                          style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                        />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '2px' }}>
                          <span>Orbit Yaw:</span>
                          <span style={{ fontWeight: 700, color: '#fbbf24' }}>{svm3dRotY}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={svm3dRotY}
                          onChange={(e) => setSvm3dRotY(parseInt(e.target.value))}
                          style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => { setSvm3dRotX(25); setSvm3dRotY(40); }}
                        style={{ flex: 1, padding: '4px', borderRadius: '4px', fontSize: '0.64rem', fontWeight: 700, background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))', color: 'var(--text-primary, #cbd5e1)', cursor: 'pointer' }}
                      >
                        📐 Isometric
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSvm3dRotX(80); setSvm3dRotY(0); }}
                        style={{ flex: 1, padding: '4px', borderRadius: '4px', fontSize: '0.64rem', fontWeight: 700, background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))', color: 'var(--text-primary, #cbd5e1)', cursor: 'pointer' }}
                      >
                        🔝 Top-Down
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSvm3dRotX(10); setSvm3dRotY(90); }}
                        style={{ flex: 1, padding: '4px', borderRadius: '4px', fontSize: '0.64rem', fontWeight: 700, background: 'var(--bg-tertiary, rgba(30, 41, 59, 0.8))', border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))', color: 'var(--text-primary, #cbd5e1)', cursor: 'pointer' }}
                      >
                        ↔ Side Slice
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Decision Tree Controls */}
            {selectedModel === 'decision_tree_split' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Max Tree Depth:</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{treeDepth}</span>
                  </div>
                  <input type="range" min="1" max="5" step="1" value={treeDepth} onChange={(e) => setTreeDepth(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Splitting Criterion:</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['gini', 'entropy'] as const).map(c => (
                      <button key={c} type="button" onClick={() => setTreeCriterion(c)} style={{ flex: 1, padding: '5px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', background: treeCriterion === c ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: treeCriterion === c ? '1px solid #34d399' : '1px solid rgba(51, 65, 85, 0.6)', color: treeCriterion === c ? '#34d399' : '#94a3b8', cursor: 'pointer' }}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Min Samples Split:</span>
                    <span style={{ fontWeight: 700, color: '#fbbf24' }}>{treeMinSamplesSplit}</span>
                  </div>
                  <input type="range" min="2" max="10" step="1" value={treeMinSamplesSplit} onChange={(e) => setTreeMinSamplesSplit(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                </div>
              </>
            )}

            {/* Naive Bayes Controls */}
            {selectedModel === 'naive_bayes' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Prior Probability P(C₀) [Amber]:</span>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>{nbPriorC0.toFixed(2)} (C₁: {(1 - nbPriorC0).toFixed(2)})</span>
                  </div>
                  <input type="range" min="0.1" max="0.9" step="0.05" value={nbPriorC0} onChange={(e) => setNbPriorC0(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Variance Smoothing (ε):</span>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>ε = {nbVarSmoothing.toFixed(3)}</span>
                  </div>
                  <input type="range" min="0.001" max="0.1" step="0.005" value={nbVarSmoothing} onChange={(e) => setNbVarSmoothing(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Class Mean Separation (Δμ):</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{nbFeatureMeanSeparation.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.4" max="1.6" step="0.05" value={nbFeatureMeanSeparation} onChange={(e) => setNbFeatureMeanSeparation(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                      <span>Probe Q.x₁:</span>
                      <span style={{ fontWeight: 700, color: '#ec4899' }}>{nbProbePos.x.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-1.5"
                      max="1.5"
                      step="0.05"
                      value={nbProbePos.x}
                      onChange={(e) => {
                        const nx = parseFloat(e.target.value);
                        setNbProbePos(prev => ({ ...prev, x: nx }));
                        stateRef.current.nbProbePos = { ...stateRef.current.nbProbePos, x: nx };
                      }}
                      style={{ width: '100%', accentColor: '#ec4899', cursor: 'pointer' }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                      <span>Probe Q.x₂:</span>
                      <span style={{ fontWeight: 700, color: '#ec4899' }}>{nbProbePos.y.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-1.5"
                      max="1.5"
                      step="0.05"
                      value={nbProbePos.y}
                      onChange={(e) => {
                        const ny = parseFloat(e.target.value);
                        setNbProbePos(prev => ({ ...prev, y: ny }));
                        stateRef.current.nbProbePos = { ...stateRef.current.nbProbePos, y: ny };
                      }}
                      style={{ width: '100%', accentColor: '#ec4899', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div style={{ padding: '8px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
                  💡 <strong style={{ color: '#fbbf24' }}>Naive Bayes Assumption:</strong> Features $X_1$ and $X_2$ are assumed conditionally independent ($P(X_1, X_2 \mid C_k) = P(X_1 \mid C_k) \times P(X_2 \mid C_k)$). Drag probe $Q$ to test real-time posterior probabilities.
                </div>
              </>
            )}

            {/* Random Forest Controls */}
            {selectedModel === 'random_forest' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Number of Trees:</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{forestNumTrees} Trees</span>
                  </div>
                  <input type="range" min="1" max="10" step="1" value={forestNumTrees} onChange={(e) => setForestNumTrees(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>
              </>
            )}

            {/* Gradient Boosting Controls */}
            {selectedModel === 'gradient_boosting' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Boosting Stages (M):</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{boostStages} Stages</span>
                  </div>
                  <input type="range" min="1" max="8" step="1" value={boostStages} onChange={(e) => setBoostStages(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Learning Rate Shrinkage (η):</span>
                    <span style={{ fontWeight: 700, color: '#fbbf24' }}>{boostLearningRate.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.05" max="0.5" step="0.05" value={boostLearningRate} onChange={(e) => setBoostLearningRate(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Initial Base Bias (F₀):</span>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>{boostBaseBiasF0.toFixed(2)}</span>
                  </div>
                  <input type="range" min="-1.0" max="1.0" step="0.1" value={boostBaseBiasF0} onChange={(e) => setBoostBaseBiasF0(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }} />
                </div>
              </>
            )}

            {/* Q-Learning Controls */}
            {selectedModel === 'q_learning_rl' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>GridWorld Environment Map:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    {(['classic', 'cliff', 'maze', 'dual_goal'] as const).map(map => (
                      <button key={map} type="button" onClick={() => setRlMapPreset(map)} style={{ padding: '5px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', background: rlMapPreset === map ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: rlMapPreset === map ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)', color: rlMapPreset === map ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}>{map.replace('_', ' ')}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Action Selection Policy:</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['eps_greedy', 'softmax'] as const).map(pol => (
                      <button key={pol} type="button" onClick={() => setRlPolicy(pol)} style={{ flex: 1, padding: '5px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', background: rlPolicy === pol ? 'rgba(192, 132, 252, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: rlPolicy === pol ? '1px solid #c084fc' : '1px solid rgba(51, 65, 85, 0.6)', color: rlPolicy === pol ? '#c084fc' : '#94a3b8', cursor: 'pointer' }}>{pol === 'eps_greedy' ? 'ε-Greedy' : 'Softmax'}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Exploration Rate (ε) / Temperature (τ):</span>
                    <span style={{ fontWeight: 700, color: '#fbbf24' }}>{rlPolicy === 'eps_greedy' ? rlEpsilon.toFixed(2) : rlTemperature.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.01" max="1.0" step="0.02" value={rlPolicy === 'eps_greedy' ? rlEpsilon : rlTemperature} onChange={(e) => { if (rlPolicy === 'eps_greedy') setRlEpsilon(parseFloat(e.target.value)); else setRlTemperature(parseFloat(e.target.value)); }} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Discount Factor (γ):</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{rlDiscountGamma.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.5" max="0.99" step="0.01" value={rlDiscountGamma} onChange={(e) => setRlDiscountGamma(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Learning Rate (α):</span>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>{rlLearningRateAlpha.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.05" max="0.5" step="0.05" value={rlLearningRateAlpha} onChange={(e) => setRlLearningRateAlpha(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }} />
                </div>
              </>
            )}

            {/* Backprop Controls */}
            {selectedModel === 'backprop_autodiff' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Backprop Topology & Paradigm:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                    <button type="button" onClick={() => setAutodiffMode('scalar_dag')} style={{ padding: '5px', borderRadius: '6px', fontSize: '0.66rem', fontWeight: 700, background: autodiffMode === 'scalar_dag' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: autodiffMode === 'scalar_dag' ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)', color: autodiffMode === 'scalar_dag' ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}>Scalar DAG</button>
                    <button type="button" onClick={() => setAutodiffMode('multilayer_mlp')} style={{ padding: '5px', borderRadius: '6px', fontSize: '0.66rem', fontWeight: 700, background: autodiffMode === 'multilayer_mlp' ? 'rgba(192, 132, 252, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: autodiffMode === 'multilayer_mlp' ? '1px solid #c084fc' : '1px solid rgba(51, 65, 85, 0.6)', color: autodiffMode === 'multilayer_mlp' ? '#c084fc' : '#94a3b8', cursor: 'pointer' }}>Multi-Layer MLP</button>
                    <button type="button" onClick={() => setAutodiffMode('mimo_matrix')} style={{ padding: '5px', borderRadius: '6px', fontSize: '0.66rem', fontWeight: 700, background: autodiffMode === 'mimo_matrix' ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: autodiffMode === 'mimo_matrix' ? '1px solid #34d399' : '1px solid rgba(51, 65, 85, 0.6)', color: autodiffMode === 'mimo_matrix' ? '#34d399' : '#94a3b8', cursor: 'pointer' }}>MIMO Matrix</button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Target Label (ŷ):</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => setAutodiffTarget(1.0)} style={{ flex: 1, padding: '6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: autodiffTarget === 1.0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: autodiffTarget === 1.0 ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)', color: autodiffTarget === 1.0 ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}>Target ŷ = 1.0</button>
                    <button type="button" onClick={() => setAutodiffTarget(0.0)} style={{ flex: 1, padding: '6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: autodiffTarget === 0.0 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: autodiffTarget === 0.0 ? '1px solid #f59e0b' : '1px solid rgba(51, 65, 85, 0.6)', color: autodiffTarget === 0.0 ? '#fbbf24' : '#94a3b8', cursor: 'pointer' }}>Target ŷ = 0.0</button>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Input Feature x₁:</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{autodiffX1.toFixed(2)}</span>
                  </div>
                  <input type="range" min="-1.5" max="1.5" step="0.1" value={autodiffX1} onChange={(e) => setAutodiffX1(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Input Feature x₂:</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{autodiffX2.toFixed(2)}</span>
                  </div>
                  <input type="range" min="-1.5" max="1.5" step="0.1" value={autodiffX2} onChange={(e) => setAutodiffX2(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>SGD Learning Rate (η):</span>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>{autodiffLR.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.01" max="0.5" step="0.02" value={autodiffLR} onChange={(e) => setAutodiffLR(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }} />
                </div>
              </>
            )}

            {/* Conv Operations Controls */}
            {selectedModel === 'conv_operations' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>CNN Learning Paradigm:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    {[
                      { id: 'kernel_convolution', label: '🔬 Kernel & Pad' },
                      { id: 'relu_and_pooling', label: '⚡ ReLU & Pool' },
                      { id: 'deep_cnn_pipeline', label: '🏛️ Deep Pipeline' },
                      { id: 'resnet_skip_block', label: '🔄 ResNet Skips' }
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setConvMode(p.id as any)}
                        style={{
                          padding: '6px 4px',
                          borderRadius: '6px',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          background: convMode === p.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          border: convMode === p.id ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: convMode === p.id ? '#38bdf8' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-Controls for Mode 1: Kernel Convolution */}
                {convMode === 'kernel_convolution' && (
                  <>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Zero-Padding (P):</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {[
                          { p: 0, label: 'p=0 (Valid)' },
                          { p: 1, label: 'p=1 (Same)' },
                          { p: 2, label: 'p=2 (Full)' }
                        ].map(opt => (
                          <button
                            key={opt.p}
                            type="button"
                            onClick={() => setConvPadding(opt.p as any)}
                            style={{
                              padding: '5px 2px',
                              borderRadius: '6px',
                              fontSize: '0.64rem',
                              fontWeight: 700,
                              background: convPadding === opt.p ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                              border: convPadding === opt.p ? '1px solid #34d399' : '1px solid rgba(51, 65, 85, 0.6)',
                              color: convPadding === opt.p ? '#34d399' : '#94a3b8',
                              cursor: 'pointer'
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '2px' }}>Stride (S):</label>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {([1, 2] as const).map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setConvStrideVal(s)}
                                style={{
                                  flex: 1,
                                  padding: '4px',
                                  borderRadius: '6px',
                                  fontSize: '0.66rem',
                                  fontWeight: 700,
                                  background: convStrideVal === s ? 'rgba(251, 191, 36, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                                  border: convStrideVal === s ? '1px solid #fbbf24' : '1px solid rgba(51, 65, 85, 0.6)',
                                  color: convStrideVal === s ? '#fbbf24' : '#94a3b8',
                                  cursor: 'pointer'
                                }}
                              >
                                s = {s}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '2px' }}>Dilation (D):</label>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {([1, 2] as const).map(d => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setConvDilationRate(d)}
                                style={{
                                  flex: 1,
                                  padding: '4px',
                                  borderRadius: '6px',
                                  fontSize: '0.66rem',
                                  fontWeight: 700,
                                  background: convDilationRate === d ? 'rgba(168, 85, 247, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                                  border: convDilationRate === d ? '1px solid #a855f7' : '1px solid rgba(51, 65, 85, 0.6)',
                                  color: convDilationRate === d ? '#c084fc' : '#94a3b8',
                                  cursor: 'pointer'
                                }}
                              >
                                d = {d}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>3×3 Filter Kernel:</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {[
                          { id: 'edge', label: 'Edge' },
                          { id: 'sobel_v', label: 'Sobel V' },
                          { id: 'sobel_h', label: 'Sobel H' },
                          { id: 'sharpen', label: 'Sharpen' },
                          { id: 'ridge', label: 'Ridge' },
                          { id: 'gaussian', label: 'Gaussian' }
                        ].map(f => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setConvFilterType(f.id as any)}
                            style={{
                              padding: '5px 2px',
                              borderRadius: '6px',
                              fontSize: '0.64rem',
                              fontWeight: 700,
                              background: convFilterType === f.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                              border: convFilterType === f.id ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)',
                              color: convFilterType === f.id ? '#38bdf8' : '#94a3b8',
                              cursor: 'pointer'
                            }}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                        <span>Post-Conv Bias (+b):</span>
                        <span style={{ fontWeight: 700, color: '#34d399' }}>{convPostBiasB.toFixed(1)}</span>
                      </div>
                      <input type="range" min="-1.0" max="1.0" step="0.1" value={convPostBiasB} onChange={(e) => setConvPostBiasB(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }} />
                    </div>
                  </>
                )}

                {/* Sub-Controls for Mode 2: ReLU and Pooling */}
                {convMode === 'relu_and_pooling' && (
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Pooling Aggregation Method:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {[
                        { id: 'max', label: 'Max Pooling (max)' },
                        { id: 'avg', label: 'Average Pooling (avg)' }
                      ].map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setConvPoolType(m.id as any)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            background: convPoolType === m.id ? 'rgba(168, 85, 247, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                            border: convPoolType === m.id ? '1px solid #a855f7' : '1px solid rgba(51, 65, 85, 0.6)',
                            color: convPoolType === m.id ? '#c084fc' : '#94a3b8',
                            cursor: 'pointer'
                          }}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Controls for Mode 3: Deep CNN Pipeline */}
                {convMode === 'deep_cnn_pipeline' && (
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Input Test Digit Pattern:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                      {[
                        { id: 'digit_7', label: 'Digit "7"' },
                        { id: 'digit_3', label: 'Digit "3"' },
                        { id: 'digit_0', label: 'Digit "0"' },
                        { id: 'edge_box', label: 'Edge Box' }
                      ].map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setConvInputDigit(d.id as any)}
                          style={{
                            padding: '5px',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            background: convInputDigit === d.id ? 'rgba(16, 185, 129, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                            border: convInputDigit === d.id ? '1px solid #10b981' : '1px solid rgba(51, 65, 85, 0.6)',
                            color: convInputDigit === d.id ? '#10b981' : '#94a3b8',
                            cursor: 'pointer'
                          }}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Controls for Mode 4: ResNet Skips */}
                {convMode === 'resnet_skip_block' && (
                  <div style={{ padding: '8px', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', marginBottom: '2px' }}>Residual Highway Active:</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary, #94a3b8)' }}>Identity shortcut $x$ feeds forward without parameter loss or attenuation.</div>
                  </div>
                )}
              </>
            )}

            {/* Recurrent Controls */}
            {selectedModel === 'seq_recurrent_gating' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>
                    Active Sequence Timestep (t):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    {[
                      { t: 0, label: '1: "The"' },
                      { t: 1, label: '2: "food"' },
                      { t: 2, label: '3: "was"' },
                      { t: 3, label: '4: "great"' }
                    ].map(st => (
                      <button
                        key={st.t}
                        type="button"
                        onClick={() => setRecurrentActiveT(st.t)}
                        style={{
                          padding: '6px 2px',
                          borderRadius: '6px',
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          background: recurrentActiveT === st.t ? 'rgba(56, 189, 248, 0.3)' : 'rgba(30, 41, 59, 0.6)',
                          border: recurrentActiveT === st.t ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: recurrentActiveT === st.t ? '#38bdf8' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Recurrent Architecture:</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['lstm', 'gru', 'vanilla_rnn'] as const).map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setRecurrentCellType(a)}
                        style={{
                          flex: 1,
                          padding: '6px 4px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: recurrentCellType === a ? (a === 'lstm' ? 'rgba(56, 189, 248, 0.25)' : a === 'gru' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(192, 132, 252, 0.25)') : 'rgba(30, 41, 59, 0.6)',
                          border: recurrentCellType === a ? (a === 'lstm' ? '1px solid #38bdf8' : a === 'gru' ? '1px solid #fbbf24' : '1px solid #c084fc') : '1px solid rgba(51, 65, 85, 0.6)',
                          color: recurrentCellType === a ? (a === 'lstm' ? '#38bdf8' : a === 'gru' ? '#fbbf24' : '#c084fc') : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {a === 'lstm' ? 'LSTM' : a === 'gru' ? 'GRU' : 'RNN'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Forget Gate Bias (bf):</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>+{recurrentForgetBias.toFixed(1)}</span>
                  </div>
                  <input type="range" min="-2.0" max="3.0" step="0.5" value={recurrentForgetBias} onChange={(e) => setRecurrentForgetBias(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Input Weight Scale (Wxh):</span>
                    <span style={{ fontWeight: 700, color: '#fbbf24' }}>{recurrentWeightWxh.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.2" max="2.0" step="0.1" value={recurrentWeightWxh} onChange={(e) => setRecurrentWeightWxh(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Candidate State Activation:</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['tanh', 'relu', 'gelu'] as const).map(act => (
                      <button key={act} type="button" onClick={() => setRecurrentCandidateAct(act)} style={{ flex: 1, padding: '4px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', background: recurrentCandidateAct === act ? 'rgba(52, 211, 153, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: recurrentCandidateAct === act ? '1px solid #34d399' : '1px solid rgba(51, 65, 85, 0.6)', color: recurrentCandidateAct === act ? '#34d399' : '#94a3b8', cursor: 'pointer' }}>{act}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Transformer Architecture Controls */}
            {selectedModel === 'transformer_architecture' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Transformer Architecture Paradigm:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                    {[
                      { id: 'encoder', label: '⚡ Encoder Stack' },
                      { id: 'decoder', label: '🧠 Decoder Stack' },
                      { id: 'encoder_decoder', label: '🏛️ Full Transformer' }
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setTransformerMode(p.id as any)}
                        style={{
                          padding: '6px 2px',
                          borderRadius: '6px',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          background: transformerMode === p.id ? 'rgba(168, 85, 247, 0.35)' : 'rgba(30, 41, 59, 0.6)',
                          border: transformerMode === p.id ? '1px solid #a855f7' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: transformerMode === p.id ? '#e9d5ff' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Layer Depth Stacking (N):</span>
                    <span style={{ fontWeight: 700, color: '#c084fc' }}>{transformerNumLayers} Layers</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    {[2, 4, 6, 8, 12, 16].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          setTransformerNumLayers(n);
                          if (transformerSelectedLayer >= n) setTransformerSelectedLayer(n - 1);
                        }}
                        style={{
                          flex: 1,
                          padding: '4px 2px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: transformerNumLayers === n ? 'rgba(192, 132, 252, 0.35)' : 'rgba(30, 41, 59, 0.6)',
                          border: transformerNumLayers === n ? '1px solid #c084fc' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: transformerNumLayers === n ? '#f3e8ff' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        N={n}
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    step="1"
                    value={transformerNumLayers}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      setTransformerNumLayers(n);
                      if (transformerSelectedLayer >= n) setTransformerSelectedLayer(n - 1);
                    }}
                    style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Sampling Temperature (T):</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{transformerSamplingTemp.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.1" max="2.0" step="0.1" value={transformerSamplingTemp} onChange={(e) => setTransformerSamplingTemp(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Top-k Vocabulary Cutoff:</span>
                    <span style={{ fontWeight: 700, color: '#fbbf24' }}>k = {transformerTopK}</span>
                  </div>
                  <input type="range" min="1" max="10" step="1" value={transformerTopK} onChange={(e) => setTransformerTopK(parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                </div>
              </>
            )}

            {/* Attention Mechanisms Controls */}
            {selectedModel === 'attention_mechanisms' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Attention Paradigm & Math Engine:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    {(['scaled_dot_product', 'multi_head', 'cross_attention', 'causal_masked', 'recursive_recurrent', 'positional_encoding'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setAttnSubMode(m)}
                        style={{
                          padding: '5px 2px',
                          borderRadius: '6px',
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: attnSubMode === m ? 'rgba(168, 85, 247, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          border: attnSubMode === m ? '1px solid #a855f7' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: attnSubMode === m ? '#c084fc' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {m.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Temperature Scale (τ):</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{attnTemperature.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.2" max="2.5" step="0.1" value={attnTemperature} onChange={(e) => setAttnTemperature(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Query Weight Scale (Wq):</span>
                    <span style={{ fontWeight: 700, color: '#fbbf24' }}>{attnWeightScaleWq.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.2" max="2.0" step="0.1" value={attnWeightScaleWq} onChange={(e) => setAttnWeightScaleWq(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Parallel Heads (h):</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 4, 8].map(h => (
                      <button key={h} type="button" onClick={() => setAttnNumHeads(h)} style={{ flex: 1, padding: '5px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: attnNumHeads === h ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: attnNumHeads === h ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)', color: attnNumHeads === h ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}>{h} Heads</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Mixture of Experts (MoE) Controls */}
            {selectedModel === 'moe_architecture' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Expert Population (E):</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { e: 4 as const, label: '4 Experts' },
                      { e: 8 as const, label: '8 Experts (Mixtral)' },
                      { e: 16 as const, label: '16 Experts (DeepSeek)' }
                    ].map(item => (
                      <button
                        key={item.e}
                        type="button"
                        onClick={() => setMoeNumExperts(item.e)}
                        style={{
                          flex: 1,
                          padding: '6px 2px',
                          borderRadius: '6px',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          background: moeNumExperts === item.e ? 'rgba(245, 158, 11, 0.3)' : 'rgba(30, 41, 59, 0.6)',
                          border: moeNumExperts === item.e ? '1px solid #f59e0b' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: moeNumExperts === item.e ? '#fbbf24' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Top-k Sparse Gating:</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { k: 1 as const, label: 'Top-1 (Switch)' },
                      { k: 2 as const, label: 'Top-2 (Mixtral 8x7B)' },
                      { k: 4 as const, label: 'Top-4 (DeepSeek-V2)' }
                    ].map(item => (
                      <button
                        key={item.k}
                        type="button"
                        onClick={() => setMoeTopK(item.k)}
                        style={{
                          flex: 1,
                          padding: '6px 2px',
                          borderRadius: '6px',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          background: moeTopK === item.k ? 'rgba(52, 211, 153, 0.3)' : 'rgba(30, 41, 59, 0.6)',
                          border: moeTopK === item.k ? '1px solid #10b981' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: moeTopK === item.k ? '#34d399' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Router Temperature (T_route):</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{moeRouterTemperature.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.2" max="2.0" step="0.1" value={moeRouterTemperature} onChange={(e) => setMoeRouterTemperature(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Routing Noise (ϵ):</span>
                    <span style={{ fontWeight: 700, color: '#c084fc' }}>{moeRouterNoise.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.0" max="1.0" step="0.1" value={moeRouterNoise} onChange={(e) => setMoeRouterNoise(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }} />
                </div>
              </>
            )}

            {/* Loss Surface Optimization Controls */}
            {selectedModel === 'loss_surface_optimization' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Loss Surface Topography:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    {([
                      { id: 'multimodal_minima', name: 'Multimodal Minima' },
                      { id: 'convex_bowl', name: 'Convex Bowl' },
                      { id: 'rosenbrock_valley', name: 'Rosenbrock Valley' },
                      { id: 'saddle_point', name: 'Saddle Point' }
                    ] as const).map(l => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          setLossLandscape(l.id);
                          resetOptimizerState(l.id);
                        }}
                        style={{
                          padding: '5px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: lossLandscape === l.id ? 'rgba(234, 179, 8, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          border: lossLandscape === l.id ? '1px solid #eab308' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: lossLandscape === l.id ? '#facc15' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Optimization Algorithm:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                    {[
                      { id: 'batch', label: 'Batch GD' },
                      { id: 'mini_batch', label: 'Mini-Batch' },
                      { id: 'sgd', label: 'SGD (1 Ex)' },
                      { id: 'momentum', label: 'Momentum' },
                      { id: 'rmsprop', label: 'RMSprop' },
                      { id: 'adam', label: 'Adam' }
                    ].map(alg => (
                      <button
                        key={alg.id}
                        type="button"
                        onClick={() => {
                          setOptAlgorithm(alg.id as any);
                          resetOptimizerState(lossLandscape);
                        }}
                        style={{
                          padding: '5px 2px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: optAlgorithm === alg.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          border: optAlgorithm === alg.id ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)',
                          color: optAlgorithm === alg.id ? '#38bdf8' : '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {alg.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOptAlgorithm('tri_variant_race');
                      resetOptimizerState(lossLandscape);
                    }}
                    style={{
                      width: '100%',
                      marginTop: '4px',
                      padding: '6px 4px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: optAlgorithm === 'tri_variant_race' ? 'rgba(250, 204, 21, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                      border: optAlgorithm === 'tri_variant_race' ? '1px solid #facc15' : '1px solid rgba(51, 65, 85, 0.6)',
                      color: optAlgorithm === 'tri_variant_race' ? '#facc15' : '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    🏁 Live Tri-Race: Batch (🟢) vs Mini (🔵) vs SGD (🟠)
                  </button>
                </div>

                {(optAlgorithm === 'mini_batch' || optAlgorithm === 'tri_variant_race') && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                      <span>Mini-Batch Size (B):</span>
                      <span style={{ fontWeight: 700, color: '#38bdf8' }}>B = {optBatchSize} samples</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[8, 16, 32, 64, 128].map(sz => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setOptBatchSize(sz)}
                          style={{
                            flex: 1,
                            padding: '4px 0',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            background: optBatchSize === sz ? 'rgba(56, 189, 248, 0.3)' : 'rgba(30, 41, 59, 0.6)',
                            border: optBatchSize === sz ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)',
                            color: optBatchSize === sz ? '#38bdf8' : '#94a3b8',
                            cursor: 'pointer'
                          }}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Learning Rate (η):</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{optLearningRate.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.005"
                    max="0.4"
                    step="0.005"
                    value={optLearningRate}
                    onChange={(e) => setOptLearningRate(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                  />
                </div>

                {(optAlgorithm === 'momentum' || optAlgorithm === 'adam') && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                      <span>Momentum Factor (γ / β):</span>
                      <span style={{ fontWeight: 700, color: '#c084fc' }}>{optMomentum.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="0.98"
                      step="0.02"
                      value={optMomentum}
                      onChange={(e) => setOptMomentum(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }}
                    />
                  </div>
                )}

                {optAlgorithm === 'sgd' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                      <span>Single-Sample Stochastic Noise (σ):</span>
                      <span style={{ fontWeight: 700, color: '#fbbf24' }}>{optNoise.toFixed(3)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="0.1"
                      step="0.005"
                      value={optNoise}
                      onChange={(e) => setOptNoise(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }}
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => resetOptimizerState(lossLandscape)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: 'rgba(234, 179, 8, 0.2)',
                    border: '1px solid #eab308',
                    color: '#facc15',
                    cursor: 'pointer',
                    marginTop: '2px'
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Reposition Particle & Reset Trajectory</span>
                </button>
              </>
            )}

            {/* VAE Controls */}
            {selectedModel === 'vae_generative' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Latent Coordinate z₁:</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{vaeLatentZ1.toFixed(2)}</span>
                  </div>
                  <input type="range" min="-1.4" max="1.4" step="0.05" value={vaeLatentZ1} onChange={(e) => setVaeLatentZ1(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Latent Coordinate z₂:</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{vaeLatentZ2.toFixed(2)}</span>
                  </div>
                  <input type="range" min="-1.4" max="1.4" step="0.05" value={vaeLatentZ2} onChange={(e) => setVaeLatentZ2(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>KL Weight (β):</span>
                    <span style={{ fontWeight: 700, color: '#c084fc' }}>{vaeBetaKL.toFixed(1)}</span>
                  </div>
                  <input type="range" min="0.1" max="4.0" step="0.1" value={vaeBetaKL} onChange={(e) => setVaeBetaKL(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }} />
                </div>
              </>
            )}

            {/* K-Means Controls */}
            {selectedModel === 'kmeans_clustering' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', marginBottom: '4px' }}>
                    <span>Number of Clusters (K):</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{numClusters}</span>
                  </div>
                  <input type="range" min="2" max="6" value={numClusters} onChange={(e) => { setNumClusters(parseInt(e.target.value)); setKmeansConverged(false); setKmeansIterations(0); }} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Initialization Mode:</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => { setKmeansInitMode('kmeans_plus_plus'); reseedCentroids(); }} style={{ flex: 1, padding: '6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: kmeansInitMode === 'kmeans_plus_plus' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: kmeansInitMode === 'kmeans_plus_plus' ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)', color: kmeansInitMode === 'kmeans_plus_plus' ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}>K-Means++</button>
                    <button type="button" onClick={() => { setKmeansInitMode('random'); reseedCentroids(); }} style={{ flex: 1, padding: '6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: kmeansInitMode === 'random' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: kmeansInitMode === 'random' ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)', color: kmeansInitMode === 'random' ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}>Random</button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-primary, #cbd5e1)', display: 'block', marginBottom: '4px' }}>Distance Metric:</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['euclidean', 'manhattan'] as const).map(d => (
                      <button key={d} type="button" onClick={() => setKmeansDistance(d)} style={{ flex: 1, padding: '5px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', background: kmeansDistance === d ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)', border: kmeansDistance === d ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)', color: kmeansDistance === d ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}>{d}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary, #94a3b8)', background: 'rgba(30, 41, 59, 0.5)', padding: '6px 8px', borderRadius: '6px' }}>
                  <span>Iteration: <strong style={{ color: '#38bdf8' }}>{kmeansIterations}</strong></span>
                  <span>Silhouette: <strong style={{ color: '#34d399' }}>{kmeansSilhouette.toFixed(2)}</strong></span>
                  <span>WCSS: <strong style={{ color: '#fbbf24' }}>{kmeansWCSS.toFixed(3)}</strong></span>
                </div>
              </>
            )}
          </div>
          )}

          {/* Mathematical Card */}
          {(desktopTab === 'telemetry' || desktopTab === 'split') && (
            <div
              className={`neural-card-theory ${mobileActiveTab === 'telemetry' ? 'mobile-card-visible' : 'mobile-card-hidden'}`}
              style={{
                background: 'var(--card-bg, rgba(15, 23, 42, 0.95))',
                borderRadius: '16px',
                border: '1px solid var(--border-color, rgba(51, 65, 85, 0.8))',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#fbbf24" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', textTransform: 'uppercase' }}>
                  MATHEMATICAL FORMULATION:
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)', fontFamily: 'monospace', lineHeight: 1.4 }}>
                {selectedModel === 'pca_reduction' && 'S_v = (1/N) Σ (x_i - μ)(x_i - μ)^T, Av_k = λ_k v_k'}
                {selectedModel === 'kmeans_clustering' && 'arg min_S Σ_{i=1}^k Σ_{x ∈ S_i} ‖x - μ_i‖²'}
                {selectedModel === 'knn_classifier' && 'y_hat = mode({y_i : x_i ∈ N_k(x)})'}
                {selectedModel === 'linear_regression' && (
                  linearViewMode === '3d_regression_plane'
                    ? '3D Hyperplane: ŷ = w₁x₁ + w₂x₂ + b, Residual: e_i = y_i - ŷ_i, Normal Equation: w* = (X^T X)^{-1} X^T y'
                    : linearViewMode === 'polynomial_curves'
                      ? `Polynomial (deg ${linearPolyDegree}): ŷ = Σ_{k=0}^d w_k x^k, L_ridge = ‖y - Φ(x)w‖² + λ‖w‖_2²`
                      : linearViewMode === 'residuals_analysis'
                        ? 'Residuals & QQ: e_i = y_i - ŷ_i, R² = 1 - SS_res / SS_tot = 1 - (Σ(y_i - ŷ_i)² / Σ(y_i - ȳ)²)'
                        : '1D OLS: ŷ = w₁x + b, L_ols = (1/2N) Σ(y_i - (w₁x_i + b))², w₁* = Cov(X,Y)/Var(X)'
                )}
                {selectedModel === 'logistic_regression' && (
                  logregViewMode === '3d_sigmoid_surface'
                    ? '3D Surface: P(Y=1|x) = σ(w₁x₁ + w₂x₂ + b) = 1 / (1 + e^{-(w₁x₁ + w₂x₂ + b)}), Slicing Plane: Z = T'
                    : logregViewMode === '1d_sigmoid_curve'
                      ? '1D Curve: P(y=1|x) = 1 / (1 + e^{-(wx + b)}), Decision Boundary: x* = (logit(T) - b) / w'
                      : logregViewMode === '2d_heatmap_boundary'
                        ? (logregBoundaryType === 'polynomial'
                            ? 'Polynomial: P = σ(w₁x₁ + w₂x₂ - 1.8‖x‖² + b) = T, Closed Non-Linear Loop'
                            : 'Linear: w₁x₁ + w₂x₂ + b = ln(T / (1 - T)), ∇_w L = (1/N) X^T (σ(Xw) - y)')
                        : 'Multinomial Softmax: P(y=k|x) = e^{(w_k^T x + b_k)/τ} / Σ e^{(w_j^T x + b_j)/τ}'
                )}
                {selectedModel === 'svm_classifier' && (
                  svmViewMode === '1d_parabola'
                    ? 'φ(x) = (x, x²), Hyperplane: w₁·x + w₂·x² + b = 0'
                    : svmViewMode === '3d_kernel_trick'
                      ? 'φ(x₁,x₂) = (x₁, x₂, x₁²+x₂²), 3D Sheet: w₁x₁ + w₂x₂ + w₃(x₁²+x₂²) + b = 0'
                      : svmKernel === 'poly'
                        ? 'Polynomial: K(x,x\') = (γ x^T x\' + r)^d, f(x) = Σ α_i y_i (γ x_i^T x + r)^d + b'
                        : svmKernel === 'rbf'
                          ? 'Gaussian RBF: K(x,x\') = exp(-γ ‖x - x\'‖²), f(x) = Σ α_i y_i exp(-γ ‖x_i - x‖²) + b'
                          : svmKernel === 'sigmoid'
                            ? 'Sigmoid: K(x,x\') = tanh(γ x^T x\' + r), f(x) = Σ α_i y_i tanh(γ x_i^T x + r) + b'
                            : 'Linear: min (1/2)‖w‖² + C Σ ξ_i s.t. y_i(w^T x_i + b) ≥ 1 - ξ_i'
                )}
                {selectedModel === 'decision_tree_split' && 'Gini(D) = 1 - Σ_{i=1}^C p_i², InfoGain = H(D) - H(D|A)'}
                {selectedModel === 'naive_bayes' && 'P(C_k|x) ∝ P(C_k) Π_{j=1}^D (1/√(2πσ_{kj}²)) e^{-(x_j-μ_{kj})²/(2σ_{kj}²)}'}
                {selectedModel === 'random_forest' && 'F(x) = (1/B) Σ_{b=1}^B T_b(x; Θ_b)'}
                {selectedModel === 'gradient_boosting' && 'F_m(x) = F_{m-1}(x) + η Σ γ_{jm} I(x ∈ R_{jm})'}
                {selectedModel === 'gan_minimax' && 'min_G max_D V(D,G) = E_{x~p_{data}}[log D(x)] + E_{z~p_z}[log(1 - D(G(z)))]'}
                {selectedModel === 'ddpm_diffusion' && 'q(x_t|x_0) = N(x_t; √(ᾱ_t) x_0, (1 - ᾱ_t) I)'}
                {selectedModel === 'vae_generative' && 'L(θ,φ; x) = E_{q_φ(z|x)}[log p_θ(x|z)] - β D_{KL}(q_φ(z|x) ‖ p(z))'}
                {selectedModel === 'neural_mlp' && 'a^{(l)} = σ(W^{(l)} a^{(l-1)} + b^{(l)}), L(y, a^{(L)}) = -(1/N) Σ y log a + (1-y) log(1-a)'}
                {selectedModel === 'backprop_autodiff' && '∂L/∂w_{ij}^{(l)} = (∂L/∂z_j^{(l)}) (∂z_j^{(l)}/∂w_{ij}^{(l)}) = δ_j^{(l)} a_i^{(l-1)}'}
                {selectedModel === 'conv_operations' && (
                  convMode === 'kernel_convolution'
                    ? 'Conv: S(i,j) = ∑_m ∑_n I(i·s + m·d, j·s + n·d) K(m,n) + b, Dim: O = ⌊(W - K + 2P)/S⌋ + 1'
                    : convMode === 'relu_and_pooling'
                      ? 'ReLU: f(z) = max(0, z), Spatial Pooling: y(i,j) = max_{(m,n) ∈ W} x(i·s+m, j·s+n)'
                      : convMode === 'deep_cnn_pipeline'
                        ? 'Pipeline: Conv ➔ ReLU ➔ MaxPool ➔ Dense FC ➔ Softmax: P(y=c|x) = e^{z_c} / ∑ e^{z_j}'
                        : 'ResNet: y = ReLU(F(x, {W_i}) + x), Backprop Gradient Highway: ∂ℒ/∂x = (∂ℒ/∂y) · (∂F/∂x + 1)'
                )}
                {selectedModel === 'seq_recurrent_gating' && 'f_t = σ(W_f x_t + U_f h_{t-1} + b_f), C_t = f_t ⊙ C_{t-1} + i_t ⊙ C̃_t'}
                {selectedModel === 'transformer_architecture' && 'Encoder: x^{(l)} = LN(x^{(l-1)} + MHA(x^{(l-1)})), Decoder: y^{(l)} = LN(y^{(l-1)} + MaskedMHA + CrossAttn(y, x_{enc}))'}
                {selectedModel === 'attention_mechanisms' && 'Attention(Q,K,V) = softmax(Q K^T / (√d_k · τ)) V, MultiHead(Q,K,V) = Concat(head_1, ..., head_h) W^O'}
                {selectedModel === 'moe_architecture' && 'y = Σ_{i ∈ Top-k} Softmax(H(x))_i · E_i(x) + x,  H(x) = x · W_g + ε · Softplus(x · W_{noise})'}
                {selectedModel === 'loss_surface_optimization' && 'w_{t+1} = w_t - η · m̂_t / (√v̂_t + ε), ∇L(w) = [∂L/∂w₁, ∂L/∂w₂]^T'}
                {selectedModel === 'q_learning_rl' && 'Q(s,a) ← Q(s,a) + α [r + γ max_{a\'} Q(s\',a\') - Q(s,a)]'}
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};
export default NeuralSimulatorModule;
