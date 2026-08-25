import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  Sliders,
  Sparkles,
  Layers,
  TrendingUp,
  Grid,
  Box,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Orbit,
  Square,
  Target,
  Cpu,
  Workflow,
  Network,
  GitBranch,
  SkipForward,
  SkipBack
} from 'lucide-react';
import { DualParamControl } from './common/DualParamControl';
import { PillSelector } from './common/PillSelector';

export type DeepLearningModuleId =
  | 'mlp_playground'
  | 'cnn_feature_maps'
  | 'rnn_lstm_unroll'
  | 'transformer_attention'
  | 'latent_space_embeddings'
  | 'training_dynamics'
  | 'vae_generative'
  | 'netron_graph';

export interface DLModuleMeta {
  id: DeepLearningModuleId;
  category: 'feedforward' | 'vision' | 'sequences' | 'transformers' | 'embeddings' | 'optimization' | 'generative' | 'architecture';
  categoryLabel: string;
  name: string;
  framework: string;
  badge: string;
  icon: React.ComponentType<{ size?: number }>;
  description: string;
}

export const DL_STUDIO_MODULES: DLModuleMeta[] = [
  {
    id: 'mlp_playground',
    category: 'feedforward',
    categoryLabel: '⚡ Feedforward Neural Networks',
    name: 'Multilayer Perceptron (MLP) Playground',
    framework: 'React SVG + Live Backprop',
    badge: 'FORWARD & BACKPROP FLOW',
    icon: Network,
    description: 'Dynamic hidden layers (1–2), customizable neuron widths, 5 activation functions, live forward activation glow, backprop gradient flow arrows, and 2D decision boundary heatmap.'
  },
  {
    id: 'cnn_feature_maps',
    category: 'vision',
    categoryLabel: '👁️ Computer Vision & CNNs',
    name: 'CNN Kernels & Feature Maps',
    framework: 'HTML5 2D Pixel Matrix',
    badge: '2D CONV & POOLING',
    icon: Grid,
    description: 'Sliding window convolution with Sobel, Edge Detect, and Gaussian kernels, Receptive Field tracking, Max/Average Pooling, and multi-channel feature maps.'
  },
  {
    id: 'rnn_lstm_unroll',
    category: 'sequences',
    categoryLabel: '🔄 Recurrent & Sequence Models',
    name: 'RNN & LSTM Unrolled Gating Lab',
    framework: 'Sequential Cell Unrolling',
    badge: 'GATES & VANISHING GRADIENT',
    icon: Workflow,
    description: 'Time-step sequence unrolling (t=1..T), LSTM cell state Cₜ, Forget/Input/Output gates, and live Vanishing/Exploding gradient flow simulation.'
  },
  {
    id: 'transformer_attention',
    category: 'transformers',
    categoryLabel: '🤖 Transformers & Self-Attention',
    name: 'Multi-Head Attention & QKV Lab',
    framework: 'Matrix Self-Attention',
    badge: 'SOFTMAX QKᵀ / √dₖ',
    icon: Cpu,
    description: 'Interactive Query, Key, Value matrix multiplication, Softmax scaling temperature √dₖ, multi-head attention weight heatmaps, and token sequence attention arc diagram.'
  },
  {
    id: 'latent_space_embeddings',
    category: 'embeddings',
    categoryLabel: '🌌 High-Dimensional Embeddings',
    name: '3D Latent Space & PCA/t-SNE Projector',
    framework: '3D WebGL / Canvas Point Cloud',
    badge: '3D CLUSTERS & REDUCTION',
    icon: Box,
    description: 'High-dimensional data projection with PCA and t-SNE, rotatable 3D cluster cloud, interactive cluster centroids, and variance explained bar chart.'
  },
  {
    id: 'training_dynamics',
    category: 'optimization',
    categoryLabel: '📈 Training Dynamics & Optimizers',
    name: 'Hyperparameter Tuning & Optimizers',
    framework: 'TensorBoard.ts Style Dashboard',
    badge: 'SGD / ADAM / LR SCHEDULES',
    icon: TrendingUp,
    description: 'Live epoch loss & accuracy curves, optimizer trajectory comparison (SGD vs Momentum vs Adam vs RMSprop), learning rate schedulers, and 2D loss landscape contours.'
  },
  {
    id: 'vae_generative',
    category: 'generative',
    categoryLabel: '🎨 Generative Deep Learning',
    name: 'Autoencoder & VAE Latent Manifold',
    framework: 'Manifold Sampling Grid',
    badge: '2D LATENT RECONSTRUCTION',
    icon: Sparkles,
    description: 'Encoder bottleneck, continuous 2D latent coordinate sampling (z₁, z₂), real-time reconstructed pixel output, and KL-divergence vs Reconstruction loss trade-off.'
  },
  {
    id: 'netron_graph',
    category: 'architecture',
    categoryLabel: '🏗️ Computational Architecture',
    name: 'Netron-Style Model DAG Inspector',
    framework: 'Declarative Computational Graph',
    badge: 'DAG TENSORS & FLOPS',
    icon: GitBranch,
    description: 'Interactive computational graph DAG for ResNet, MobileNet, and Mini-Transformer architectures with expandable tensor shapes, parameter counts, and memory footprint.'
  }
];

export const DeepLearningStudioView: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState<DeepLearningModuleId>('mlp_playground');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isAutoOrbit] = useState<boolean>(false);
  const [animSpeed] = useState<number>(1.0);
  const [timeT, setTimeT] = useState<number>(0);

  const activeMeta = useMemo(() => {
    return DL_STUDIO_MODULES.find(m => m.id === activeModuleId) || DL_STUDIO_MODULES[0];
  }, [activeModuleId]);

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
          setLatentRotY(prev => (prev + 0.4 * animSpeed) % 360);
        }
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isSimulating, isAutoOrbit, animSpeed]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. MLP PLAYGROUND STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [mlpActivation, setMlpActivation] = useState<'relu' | 'sigmoid' | 'tanh' | 'leaky_relu' | 'gelu'>('tanh');
  const [mlpHidden1Count, setMlpHidden1Count] = useState<number>(4);
  const [mlpHidden2Count, setMlpHidden2Count] = useState<number>(3);
  const [mlpLearningRate, setMlpLearningRate] = useState<number>(0.08);
  const [mlpEpoch, setMlpEpoch] = useState<number>(45);
  const [mlpDatasetPreset, setMlpDatasetPreset] = useState<'moons' | 'circles' | 'xor' | 'linear'>('moons');
  const [mlpWeightInitScale, setMlpWeightInitScale] = useState<number>(1.0);
  const [mlpGlobalBias, setMlpGlobalBias] = useState<number>(0.0);
  const [selectedSynapse, setSelectedSynapse] = useState<{ from: string; to: string; weight: number } | null>(null);

  const [customMlpPoints, setCustomMlpPoints] = useState<Array<{ id: number; x: number; y: number; label: 0 | 1 }>>([]);

  // Generate Dataset Presets
  const mlpPoints = useMemo(() => {
    let base: Array<{ id: number; x: number; y: number; label: 0 | 1 }> = [];
    if (mlpDatasetPreset === 'moons') {
      base = [
        { id: 1, x: -1.2, y: 0.8, label: 0 as const },
        { id: 2, x: -0.8, y: 1.1, label: 0 as const },
        { id: 3, x: -0.3, y: 0.9, label: 0 as const },
        { id: 4, x: -1.5, y: 0.4, label: 0 as const },
        { id: 5, x: 0.2, y: -0.5, label: 1 as const },
        { id: 6, x: 0.7, y: -0.8, label: 1 as const },
        { id: 7, x: 1.2, y: -0.6, label: 1 as const },
        { id: 8, x: 1.6, y: -0.1, label: 1 as const }
      ];
    } else if (mlpDatasetPreset === 'circles') {
      base = [
        { id: 1, x: 0.0, y: 0.0, label: 1 as const },
        { id: 2, x: 0.3, y: 0.2, label: 1 as const },
        { id: 3, x: -0.2, y: -0.3, label: 1 as const },
        { id: 4, x: 0.1, y: -0.2, label: 1 as const },
        { id: 5, x: -1.4, y: 1.3, label: 0 as const },
        { id: 6, x: 1.5, y: 1.2, label: 0 as const },
        { id: 7, x: -1.3, y: -1.4, label: 0 as const },
        { id: 8, x: 1.4, y: -1.3, label: 0 as const }
      ];
    } else if (mlpDatasetPreset === 'xor') {
      base = [
        { id: 1, x: 1.0, y: 1.0, label: 1 as const },
        { id: 2, x: 1.3, y: 0.8, label: 1 as const },
        { id: 3, x: -1.1, y: -1.0, label: 1 as const },
        { id: 4, x: -0.9, y: -1.3, label: 1 as const },
        { id: 5, x: -1.0, y: 1.0, label: 0 as const },
        { id: 6, x: -1.2, y: 0.9, label: 0 as const },
        { id: 7, x: 1.1, y: -1.0, label: 0 as const },
        { id: 8, x: 0.9, y: -1.2, label: 0 as const }
      ];
    } else {
      base = [
        { id: 1, x: -1.2, y: 1.2, label: 0 as const },
        { id: 2, x: -0.8, y: 0.6, label: 0 as const },
        { id: 3, x: -0.4, y: 1.5, label: 0 as const },
        { id: 4, x: -1.2, y: -0.8, label: 0 as const },
        { id: 5, x: 0.6, y: -0.7, label: 1 as const },
        { id: 6, x: 1.2, y: -1.1, label: 1 as const },
        { id: 7, x: 1.5, y: 0.4, label: 1 as const },
        { id: 8, x: 0.9, y: 1.1, label: 1 as const }
      ];
    }
    return [...base, ...customMlpPoints];
  }, [mlpDatasetPreset, customMlpPoints]);

  const [injectMlpX, setInjectMlpX] = useState<number>(0.2);
  const [injectMlpY, setInjectMlpY] = useState<number>(0.8);
  const [injectMlpLabel, setInjectMlpLabel] = useState<0 | 1>(0);

  const trainMlpStep = () => {
    setMlpEpoch(prev => prev + 1);
  };

  const resetMlp = () => {
    setMlpEpoch(0);
  };

  // Activation Function Math & Derivative Formulas
  const activationMeta = useMemo(() => {
    if (mlpActivation === 'relu') {
      return {
        formula: 'f(z) = max(0, z)',
        derivative: "f'(z) = 1 if z > 0 else 0",
        eval: (z: number) => Math.max(0, z),
        evalDeriv: (z: number) => (z > 0 ? 1 : 0),
        range: '[0, +∞)',
        advantage: 'Mitigates vanishing gradient in deep nets'
      };
    } else if (mlpActivation === 'sigmoid') {
      return {
        formula: 'f(z) = 1 / (1 + e⁻ᶻ)',
        derivative: "f'(z) = f(z)(1 - f(z))",
        eval: (z: number) => 1 / (1 + Math.exp(-z)),
        evalDeriv: (z: number) => {
          const s = 1 / (1 + Math.exp(-z));
          return s * (1 - s);
        },
        range: '(0, 1)',
        advantage: 'Interpretable as binary probability'
      };
    } else if (mlpActivation === 'gelu') {
      return {
        formula: 'f(z) = z · Φ(z) ≈ 0.5z(1 + tanh(√(2/π)(z + 0.044715z³)))',
        derivative: "f'(z) ≈ Φ(z) + z · ϕ(z)",
        eval: (z: number) => 0.5 * z * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (z + 0.044715 * Math.pow(z, 3)))),
        evalDeriv: (z: number) => 0.5 * (1 + Math.tanh(0.79788 * (z + 0.044715 * Math.pow(z, 3)))) + 0.39894 * z * (1 - Math.pow(Math.tanh(0.79788 * (z + 0.044715 * Math.pow(z, 3))), 2)),
        range: '[-0.17, +∞)',
        advantage: 'Transformer & LLM standard (BERT/GPT)'
      };
    } else if (mlpActivation === 'leaky_relu') {
      return {
        formula: 'f(z) = max(0.01z, z)',
        derivative: "f'(z) = 1 if z > 0 else 0.01",
        eval: (z: number) => (z > 0 ? z : 0.01 * z),
        evalDeriv: (z: number) => (z > 0 ? 1 : 0.01),
        range: '(-∞, +∞)',
        advantage: 'Prevents dying ReLU neuron problem'
      };
    } else {
      return {
        formula: 'f(z) = tanh(z) = (eᶻ - e⁻ᶻ) / (eᶻ + e⁻ᶻ)',
        derivative: "f'(z) = 1 - tanh²(z)",
        eval: (z: number) => Math.tanh(z),
        evalDeriv: (z: number) => 1 - Math.pow(Math.tanh(z), 2),
        range: '(-1, 1)',
        advantage: 'Zero-centered, smooth gradient convergence'
      };
    }
  }, [mlpActivation]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. CNN FEATURE MAPS STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [cnnImagePreset, setCnnImagePreset] = useState<'digit_8' | 'cat' | 'horiz_edge' | 'vert_edge' | 'diagonal_x' | 'blank'>('digit_8');
  const [cnnKernelPreset, setCnnKernelPreset] = useState<'edge_detect' | 'sobel_x' | 'sobel_y' | 'gaussian_blur' | 'sharpen' | 'emboss' | 'custom'>('edge_detect');
  const [cnnCustomKernel, setCnnCustomKernel] = useState<number[][]>([
    [-1, -1, -1],
    [-1, 8, -1],
    [-1, -1, -1]
  ]);
  const [cnnPoolingType, setCnnPoolingType] = useState<'max' | 'avg'>('max');
  const [cnnStride, setCnnStride] = useState<number>(1);
  const [cnnFilterStep, setCnnFilterStep] = useState<number>(0);
  const [cnnBias, setCnnBias] = useState<number>(0.0);

  // 6x6 Input Image Matrix with preset initialization
  const [userGrid6x6, setUserGrid6x6] = useState<number[][]>([
    [0.1, 0.9, 0.9, 0.9, 0.9, 0.1],
    [0.9, 0.1, 0.1, 0.1, 0.1, 0.9],
    [0.1, 0.9, 0.9, 0.9, 0.9, 0.1],
    [0.9, 0.1, 0.1, 0.1, 0.1, 0.9],
    [0.9, 0.1, 0.1, 0.1, 0.1, 0.9],
    [0.1, 0.9, 0.9, 0.9, 0.9, 0.1]
  ]);

  // Load Image Preset
  const applyImagePreset = (preset: 'digit_8' | 'cat' | 'horiz_edge' | 'vert_edge' | 'diagonal_x' | 'blank') => {
    setCnnImagePreset(preset);
    if (preset === 'digit_8') {
      setUserGrid6x6([
        [0.1, 0.9, 0.9, 0.9, 0.9, 0.1],
        [0.9, 0.1, 0.1, 0.1, 0.1, 0.9],
        [0.1, 0.9, 0.9, 0.9, 0.9, 0.1],
        [0.9, 0.1, 0.1, 0.1, 0.1, 0.9],
        [0.9, 0.1, 0.1, 0.1, 0.1, 0.9],
        [0.1, 0.9, 0.9, 0.9, 0.9, 0.1]
      ]);
    } else if (preset === 'cat') {
      setUserGrid6x6([
        [0.9, 0.1, 0.1, 0.1, 0.1, 0.9],
        [0.9, 0.9, 0.1, 0.1, 0.9, 0.9],
        [0.1, 0.9, 0.9, 0.9, 0.9, 0.1],
        [0.1, 0.9, 0.2, 0.2, 0.9, 0.1],
        [0.1, 0.9, 0.9, 0.9, 0.9, 0.1],
        [0.1, 0.1, 0.9, 0.9, 0.1, 0.1]
      ]);
    } else if (preset === 'horiz_edge') {
      setUserGrid6x6([
        [0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
        [0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
        [0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
        [0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
        [0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
        [0.1, 0.1, 0.1, 0.1, 0.1, 0.1]
      ]);
    } else if (preset === 'vert_edge') {
      setUserGrid6x6([
        [0.9, 0.9, 0.9, 0.1, 0.1, 0.1],
        [0.9, 0.9, 0.9, 0.1, 0.1, 0.1],
        [0.9, 0.9, 0.9, 0.1, 0.1, 0.1],
        [0.9, 0.9, 0.9, 0.1, 0.1, 0.1],
        [0.9, 0.9, 0.9, 0.1, 0.1, 0.1],
        [0.9, 0.9, 0.9, 0.1, 0.1, 0.1]
      ]);
    } else if (preset === 'diagonal_x') {
      setUserGrid6x6([
        [0.9, 0.1, 0.1, 0.1, 0.1, 0.9],
        [0.1, 0.9, 0.1, 0.1, 0.9, 0.1],
        [0.1, 0.1, 0.9, 0.9, 0.1, 0.1],
        [0.1, 0.1, 0.9, 0.9, 0.1, 0.1],
        [0.1, 0.9, 0.1, 0.1, 0.9, 0.1],
        [0.9, 0.1, 0.1, 0.1, 0.1, 0.9]
      ]);
    } else {
      setUserGrid6x6([
        [0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
        [0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
        [0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
        [0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
        [0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
        [0.1, 0.1, 0.1, 0.1, 0.1, 0.1]
      ]);
    }
  };

  const togglePixelCell = (r: number, c: number) => {
    setUserGrid6x6(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = next[r][c] > 0.5 ? 0.1 : 0.9;
      return next;
    });
  };

  const activeKernel3x3 = useMemo(() => {
    if (cnnKernelPreset === 'custom') return cnnCustomKernel;
    if (cnnKernelPreset === 'sobel_x') return [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    if (cnnKernelPreset === 'sobel_y') return [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
    if (cnnKernelPreset === 'gaussian_blur') return [[1/16, 2/16, 1/16], [2/16, 4/16, 2/16], [1/16, 2/16, 1/16]];
    if (cnnKernelPreset === 'sharpen') return [[0, -1, 0], [-1, 5, -1], [0, -1, 0]];
    if (cnnKernelPreset === 'emboss') return [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]];
    return [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]]; // edge detect
  }, [cnnKernelPreset, cnnCustomKernel]);

  // Convolved 4x4 Output Feature Map
  const convolved4x4 = useMemo(() => {
    const out = [];
    for (let r = 0; r < 4; r++) {
      const row = [];
      for (let c = 0; c < 4; c++) {
        let sum = 0;
        for (let kr = 0; kr < 3; kr++) {
          for (let kc = 0; kc < 3; kc++) {
            sum += userGrid6x6[r + kr][c + kc] * activeKernel3x3[kr][kc];
          }
        }
        sum += cnnBias;
        row.push(Math.max(0, Math.min(1, Math.abs(sum))));
      }
      out.push(row);
    }
    return out;
  }, [userGrid6x6, activeKernel3x3, cnnBias]);

  // Pooled 2x2 Feature Map
  const pooled2x2 = useMemo(() => {
    const out = [];
    for (let pr = 0; pr < 2; pr++) {
      const row = [];
      for (let pc = 0; pc < 2; pc++) {
        const p1 = convolved4x4[pr * 2][pc * 2];
        const p2 = convolved4x4[pr * 2][pc * 2 + 1];
        const p3 = convolved4x4[pr * 2 + 1][pc * 2];
        const p4 = convolved4x4[pr * 2 + 1][pc * 2 + 1];
        if (cnnPoolingType === 'max') {
          row.push(Math.max(p1, p2, p3, p4));
        } else {
          row.push((p1 + p2 + p3 + p4) / 4);
        }
      }
      out.push(row);
    }
    return out;
  }, [convolved4x4, cnnPoolingType]);

  // Current Sliding Step (0..15)
  const activeRow = Math.floor(cnnFilterStep / 4);
  const activeCol = cnnFilterStep % 4;

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. RNN / LSTM UNROLL STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [rnnSeqLength, setRnnSeqLength] = useState<number>(5);
  const [rnnCellType, setRnnCellType] = useState<'vanilla_rnn' | 'lstm' | 'gru'>('lstm');
  const [rnnGradientScale, setRnnGradientScale] = useState<number>(0.85);
  const [rnnForgetBias, setRnnForgetBias] = useState<number>(1.2);
  const [rnnInputWeight, setRnnInputWeight] = useState<number>(1.0);
  const [selectedRnnStep, setSelectedRnnStep] = useState<number>(2);

  // Gating Equations by Cell Type
  const rnnFormulas = useMemo(() => {
    if (rnnCellType === 'lstm') {
      return {
        title: 'Long Short-Term Memory (LSTM)',
        fGate: 'fₜ = σ(W_f xₜ + U_f hₜ₋₁ + b_f)',
        iGate: 'iₜ = σ(W_i xₜ + U_i hₜ₋₁ + b_i)',
        cCand: 'C̃ₜ = tanh(W_c xₜ + U_c hₜ₋₁ + b_c)',
        cUpdate: 'Cₜ = fₜ ⊙ Cₜ₋₁ + iₜ ⊙ C̃ₜ',
        oGate: 'oₜ = σ(W_o xₜ + U_o hₜ₋₁ + b_o)',
        hUpdate: 'hₜ = oₜ ⊙ tanh(Cₜ)',
        keyInsight: 'Additive linear cell state Cₜ prevents vanishing gradients.'
      };
    } else if (rnnCellType === 'gru') {
      return {
        title: 'Gated Recurrent Unit (GRU)',
        fGate: 'rₜ = σ(W_r xₜ + U_r hₜ₋₁ + b_r)  [Reset Gate]',
        iGate: 'zₜ = σ(W_z xₜ + U_z hₜ₋₁ + b_z)  [Update Gate]',
        cCand: 'h̃ₜ = tanh(W_h xₜ + U_h(rₜ ⊙ hₜ₋₁) + b_h)',
        cUpdate: 'hₜ = (1 - zₜ) ⊙ hₜ₋₁ + zₜ ⊙ h̃ₜ',
        oGate: '',
        hUpdate: '',
        keyInsight: 'Merges cell and hidden states into unified gating vector.'
      };
    } else {
      return {
        title: 'Vanilla Recurrent Neural Network (RNN)',
        fGate: 'hₜ = tanh(W_h xₜ + U_h hₜ₋₁ + b_h)',
        iGate: 'ŷₜ = softmax(V hₜ + c)',
        cCand: '',
        cUpdate: '',
        oGate: '',
        hUpdate: '',
        keyInsight: 'Repeated matrix multiplication Uⁿ causes vanishing/exploding gradients.'
      };
    }
  }, [rnnCellType]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. TRANSFORMER ATTENTION STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [attentionHeadCount, setAttentionHeadCount] = useState<number>(4);
  const [attentionTempScale, setAttentionTempScale] = useState<number>(1.0);
  const [sentencePreset, setSentencePreset] = useState<'neural_network' | 'attention_needed' | 'pronoun_coref' | 'custom'>('neural_network');
  const [customSentenceText, setCustomSentenceText] = useState<string>('Transformers learn representations through self attention');
  const [isCausalMasked, setIsCausalMasked] = useState<boolean>(false);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number>(1);
  const [activeHeadIdx, setActiveHeadIdx] = useState<number>(0);

  const activeTokens = useMemo(() => {
    if (sentencePreset === 'neural_network') {
      return ['The', 'neural', 'network', 'learns', 'deep', 'features'];
    } else if (sentencePreset === 'attention_needed') {
      return ['Attention', 'is', 'all', 'you', 'need', 'now'];
    } else if (sentencePreset === 'pronoun_coref') {
      return ['The', 'animal', 'slept', 'because', 'it', 'was', 'tired'];
    } else {
      const words = customSentenceText.trim().split(/\s+/).slice(0, 8);
      return words.length > 0 ? words : ['AI', 'model'];
    }
  }, [sentencePreset, customSentenceText]);

  // Softmax Attention Matrix (N x N)
  const attentionMatrix = useMemo(() => {
    const N = activeTokens.length;
    const mat: number[][] = [];
    for (let i = 0; i < N; i++) {
      const row: number[] = [];
      let sumExp = 0;
      for (let j = 0; j < N; j++) {
        // Causal Autoregressive Masking (GPT style)
        if (isCausalMasked && j > i) {
          row.push(0);
          continue;
        }

        // Head-specific learned attention bias
        let rawScore = 0;
        if (activeHeadIdx === 0) {
          // Head 1: Local / Positional syntax (attends to adjacent words)
          rawScore = 2.5 - Math.abs(i - j) * 1.4;
        } else if (activeHeadIdx === 1) {
          // Head 2: Subject-Verb / Global linkage
          rawScore = Math.sin((i + j) * 1.1) * 2.2;
        } else if (activeHeadIdx === 2) {
          // Head 3: Coreference (tokens link to first noun or pronoun)
          rawScore = (j === 0 || j === 1 || Math.abs(i - j) === 3) ? 2.8 : -1.2;
        } else {
          // Head 4: Uniform Contextual Diffusion
          rawScore = Math.cos((i - j) * 0.7) * 1.8;
        }

        const scaledScore = rawScore / attentionTempScale;
        const expVal = Math.exp(scaledScore);
        row.push(expVal);
        sumExp += expVal;
      }
      
      // Normalize with Softmax sum
      mat.push(row.map(v => (sumExp > 0 ? v / sumExp : 0)));
    }
    return mat;
  }, [activeTokens, activeHeadIdx, attentionTempScale, isCausalMasked]);

  // Query, Key, Value vectors for selected token
  const qkvVectors = useMemo(() => {
    const idx = selectedTokenIdx >= activeTokens.length ? 0 : selectedTokenIdx;
    return {
      query: [
        Math.sin(idx * 1.5 + activeHeadIdx).toFixed(2),
        Math.cos(idx * 1.2).toFixed(2),
        Math.sin(idx * 0.8 + 1.0).toFixed(2),
        Math.cos(idx * 2.0).toFixed(2)
      ],
      key: [
        Math.cos(idx * 1.1 + activeHeadIdx).toFixed(2),
        Math.sin(idx * 1.4).toFixed(2),
        Math.cos(idx * 0.9 + 0.5).toFixed(2),
        Math.sin(idx * 1.8).toFixed(2)
      ],
      value: [
        Math.sin(idx * 0.7 + 0.3).toFixed(2),
        Math.cos(idx * 0.5 + activeHeadIdx).toFixed(2),
        Math.sin(idx * 1.3).toFixed(2),
        Math.cos(idx * 1.1).toFixed(2)
      ]
    };
  }, [selectedTokenIdx, activeTokens, activeHeadIdx]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. 3D LATENT SPACE EMBEDDING PROJECTOR STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [latentDatasetPreset, setLatentDatasetPreset] = useState<'mnist_digits' | 'swiss_roll' | 'word2vec_analogies' | 'concentric_spheres'>('mnist_digits');
  const [latentProjectionMethod, setLatentProjectionMethod] = useState<'pca' | 'tsne' | 'umap'>('pca');
  const [latentPerplexity, setLatentPerplexity] = useState<number>(25);
  const [latentClusterSpread, setLatentClusterSpread] = useState<number>(1.2);
  const [latentRotX, setLatentRotX] = useState<number>(25);
  const [latentRotY, setLatentRotY] = useState<number>(40);
  const [isDraggingLatent, setIsDraggingLatent] = useState<boolean>(false);
  const [selectedLatentPoint] = useState<{ x: number; y: number; z: number; label: string; clusterId: number } | null>(null);
  const dragLatentStartRef = useRef<{ x: number; y: number; rx: number; ry: number }>({ x: 0, y: 0, rx: 25, ry: 40 });
  const canvasLatentRef = useRef<HTMLCanvasElement | null>(null);

  const embeddingClusters = useMemo(() => {
    const pts: Array<{ x: number; y: number; z: number; label: string; clusterId: number }> = [];

    if (latentDatasetPreset === 'mnist_digits') {
      // 5 distinct digit clusters in 3D
      const digitCenters = [
        { x: -1.4, y: 1.0, z: -0.8, label: 'Digit 0', id: 0 },
        { x: 1.2, y: -0.9, z: 0.9, label: 'Digit 1', id: 1 },
        { x: -0.2, y: -1.2, z: -1.1, label: 'Digit 4', id: 2 },
        { x: 1.4, y: 1.1, z: -0.5, label: 'Digit 7', id: 3 },
        { x: -0.8, y: 0.0, z: 1.3, label: 'Digit 8', id: 4 }
      ];
      digitCenters.forEach(c => {
        for (let i = 0; i < 18; i++) {
          const spread = (latentProjectionMethod === 'tsne' ? 0.35 : latentProjectionMethod === 'umap' ? 0.45 : 0.7) * latentClusterSpread;
          pts.push({
            x: c.x + (Math.sin(i * 1.7) * 0.5 + Math.cos(i * 0.8) * 0.3) * spread,
            y: c.y + (Math.cos(i * 2.1) * 0.5 + Math.sin(i * 1.3) * 0.3) * spread,
            z: c.z + (Math.sin(i * 0.9) * 0.5 + Math.cos(i * 2.4) * 0.3) * spread,
            label: c.label,
            clusterId: c.id
          });
        }
      });
    } else if (latentDatasetPreset === 'swiss_roll') {
      // 3D Swiss Roll Spiral
      for (let i = 0; i < 90; i++) {
        const t = 1.5 * Math.PI * (1 + (2 * i) / 90);
        const height = (Math.sin(i * 4) * 1.5);
        pts.push({
          x: (t * Math.cos(t)) * 0.25 * latentClusterSpread,
          y: height * 0.6,
          z: (t * Math.sin(t)) * 0.25 * latentClusterSpread,
          label: `Roll #${Math.floor(i / 18)}`,
          clusterId: Math.floor(i / 18)
        });
      }
    } else if (latentDatasetPreset === 'word2vec_analogies') {
      // Semantic word vector pairs (King - Man + Woman = Queen)
      const wordPairs = [
        { x: -1.2, y: 0.8, z: -0.4, label: '👑 King', clusterId: 0 },
        { x: -1.2, y: -0.6, z: -0.4, label: '👨 Man', clusterId: 0 },
        { x: 1.1, y: 0.8, z: 0.5, label: '👸 Queen', clusterId: 1 },
        { x: 1.1, y: -0.6, z: 0.5, label: '👩 Woman', clusterId: 1 },
        { x: -0.2, y: 1.3, z: 1.0, label: '🇫🇷 France', clusterId: 2 },
        { x: -0.2, y: 0.1, z: 1.0, label: '🗼 Paris', clusterId: 2 },
        { x: 1.3, y: 1.3, z: -1.1, label: '🇯🇵 Japan', clusterId: 3 },
        { x: 1.3, y: 0.1, z: -1.1, label: '🗾 Tokyo', clusterId: 3 }
      ];
      pts.push(...wordPairs);
    } else {
      // Concentric Spheres
      for (let i = 0; i < 50; i++) {
        const u = (i / 50) * Math.PI * 2;
        const v = ((i % 10) / 10) * Math.PI;
        // Inner sphere
        pts.push({
          x: 0.6 * Math.sin(v) * Math.cos(u),
          y: 0.6 * Math.sin(v) * Math.sin(u),
          z: 0.6 * Math.cos(v),
          label: 'Inner Core',
          clusterId: 0
        });
        // Outer shell
        pts.push({
          x: 1.6 * Math.sin(v) * Math.cos(u) * latentClusterSpread,
          y: 1.6 * Math.sin(v) * Math.sin(u) * latentClusterSpread,
          z: 1.6 * Math.cos(v) * latentClusterSpread,
          label: 'Outer Shell',
          clusterId: 1
        });
      }
    }
    return pts;
  }, [latentDatasetPreset, latentProjectionMethod, latentClusterSpread]);

  // 3D Canvas Projection for Latent Space
  useEffect(() => {
    if (activeModuleId !== 'latent_space_embeddings') return;
    const canvas = canvasLatentRef.current;
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

    const radX = (latentRotX * Math.PI) / 180;
    const radY = (latentRotY * Math.PI) / 180;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    const project3D = (x: number, y: number, z: number) => {
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const scale = 80;
      return { x: W / 2 + x1 * scale, y: H / 2 - y2 * scale, z: z2 };
    };

    // Draw Grid Floor
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    for (let gx = -2.0; gx <= 2.0; gx += 0.8) {
      const p1 = project3D(gx, -1.6, -2.0);
      const p2 = project3D(gx, -1.6, 2.0);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    for (let gz = -2.0; gz <= 2.0; gz += 0.8) {
      const p1 = project3D(-2.0, -1.6, gz);
      const p2 = project3D(2.0, -1.6, gz);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // In Word2Vec mode: Draw semantic vector direction lines
    if (latentDatasetPreset === 'word2vec_analogies') {
      const pKing = project3D(-1.2, 0.8, -0.4);
      const pMan = project3D(-1.2, -0.6, -0.4);
      const pQueen = project3D(1.1, 0.8, 0.5);
      const pWoman = project3D(1.1, -0.6, 0.5);

      ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      // King -> Man
      ctx.beginPath();
      ctx.moveTo(pKing.x, pKing.y);
      ctx.lineTo(pMan.x, pMan.y);
      ctx.stroke();
      // Queen -> Woman
      ctx.beginPath();
      ctx.moveTo(pQueen.x, pQueen.y);
      ctx.lineTo(pWoman.x, pWoman.y);
      ctx.stroke();
      // King -> Queen
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.beginPath();
      ctx.moveTo(pKing.x, pKing.y);
      ctx.lineTo(pQueen.x, pQueen.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw 3D Points sorted by Z depth
    const projectedPts = embeddingClusters.map(p => ({
      ...project3D(p.x, p.y, p.z),
      origX: p.x,
      origY: p.y,
      origZ: p.z,
      label: p.label,
      clusterId: p.clusterId
    }));
    projectedPts.sort((a, b) => a.z - b.z);

    const clusterColors = ['#38bdf8', '#34d399', '#ec4899', '#f59e0b', '#c084fc'];

    projectedPts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, latentDatasetPreset === 'word2vec_analogies' ? 7.5 : 5.5, 0, 2 * Math.PI);
      ctx.fillStyle = clusterColors[p.clusterId % clusterColors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Render Label text if Word2Vec or Selected
      if (latentDatasetPreset === 'word2vec_analogies' || selectedLatentPoint?.label === p.label) {
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(p.label, p.x + 8, p.y - 4);
      }
    });
  }, [activeModuleId, latentRotX, latentRotY, embeddingClusters, latentDatasetPreset, selectedLatentPoint]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. TRAINING DYNAMICS & LOSS LANDSCAPE STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [selectedOptimizer, setSelectedOptimizer] = useState<'sgd' | 'momentum' | 'adam' | 'rmsprop'>('adam');
  const [lrScheduler, setLrScheduler] = useState<'cosine' | 'steplr' | 'exponential' | 'onecycle'>('cosine');
  const [lossLandscapePreset, setLossLandscapePreset] = useState<'ravine' | 'saddle' | 'convex_bowl' | 'rastrigin'>('ravine');
  const [batchSize, setBatchSize] = useState<number>(32);
  const [trainMomentumBeta, setTrainMomentumBeta] = useState<number>(0.9);
  const [initialLr, setInitialLr] = useState<number>(0.03);
  const [weightDecayL2, setWeightDecayL2] = useState<number>(0.0005);

  // Optimizer Mathematical Formulas
  const optimizerFormulas = useMemo(() => {
    if (selectedOptimizer === 'adam') {
      return {
        title: 'Adaptive Moment Estimation (Adam)',
        mRule: 'mₜ = β₁ mₜ₋₁ + (1 - β₁) gₜ  [1st Moment / Mean]',
        vRule: 'vₜ = β₂ vₜ₋₁ + (1 - β₂) gₜ²  [2nd Moment / Uncentered Variance]',
        paramRule: 'θₜ = θₜ₋₁ - (η / (√(v̂ₜ) + ε)) · m̂ₜ',
        insight: 'Combines momentum with adaptive per-parameter learning rates.'
      };
    } else if (selectedOptimizer === 'momentum') {
      return {
        title: 'Stochastic Gradient Descent with Momentum',
        mRule: 'vₜ = γ vₜ₋₁ + η gₜ  [Velocity Buffer]',
        vRule: '',
        paramRule: 'θₜ = θₜ₋₁ - vₜ',
        insight: 'Accelerates in persistent gradient directions and dampens oscillations.'
      };
    } else if (selectedOptimizer === 'rmsprop') {
      return {
        title: 'Root Mean Square Propagation (RMSprop)',
        mRule: 'vₜ = γ vₜ₋₁ + (1 - γ) gₜ²  [Running Average of Squared Gradients]',
        vRule: '',
        paramRule: 'θₜ = θₜ₋₁ - (η / √(vₜ + ε)) · gₜ',
        insight: 'Divides gradient by root of running average of squared gradients.'
      };
    } else {
      return {
        title: 'Plain Stochastic Gradient Descent (SGD)',
        mRule: 'gₜ = ∇_θ L(θₜ₋₁; x_batch)',
        vRule: '',
        paramRule: 'θₜ = θₜ₋₁ - η · gₜ',
        insight: 'Vanilla first-order gradient step; susceptible to ravines and local minima.'
      };
    }
  }, [selectedOptimizer]);

  // 2D Contour Optimizer Trajectory
  const optimizerTrajectory = useMemo(() => {
    const pts: Array<{ x: number; y: number }> = [];
    let x = -2.2;
    let y = 1.6;
    let vx = 0;
    let vy = 0;
    let sx = 0;
    let sy = 0;

    for (let step = 0; step < 40; step++) {
      pts.push({ x, y });

      // Landscape gradient
      let gx = 0;
      let gy = 0;
      if (lossLandscapePreset === 'ravine') {
        // Ill-conditioned Rosenbrock valley: f(x, y) = (1-x)^2 + 10*(y - x^2)^2
        gx = -2 * (1 - x) - 40 * x * (y - x * x);
        gy = 20 * (y - x * x);
      } else if (lossLandscapePreset === 'saddle') {
        // Saddle point: f(x, y) = x^2 - y^2
        gx = 2 * x;
        gy = -2 * y;
      } else if (lossLandscapePreset === 'convex_bowl') {
        // Quadratic bowl: f(x, y) = 0.5*x^2 + 0.5*y^2
        gx = x;
        gy = y;
      } else {
        // Multi-modal Rastrigin
        gx = 2 * x + 4 * Math.sin(3 * x);
        gy = 2 * y + 4 * Math.sin(3 * y);
      }

      // Add mini-batch gradient noise inversely proportional to batch size
      const noiseLevel = (128 - batchSize) / 500;
      gx += (Math.random() - 0.5) * noiseLevel;
      gy += (Math.random() - 0.5) * noiseLevel;

      if (selectedOptimizer === 'adam') {
        const beta1 = trainMomentumBeta;
        const beta2 = 0.999;
        vx = beta1 * vx + (1 - beta1) * gx;
        vy = beta1 * vy + (1 - beta1) * gy;
        sx = beta2 * sx + (1 - beta2) * (gx * gx);
        sy = beta2 * sy + (1 - beta2) * (gy * gy);
        x -= (initialLr * 3.5 / (Math.sqrt(sx) + 1e-6)) * vx;
        y -= (initialLr * 3.5 / (Math.sqrt(sy) + 1e-6)) * vy;
      } else if (selectedOptimizer === 'momentum') {
        vx = trainMomentumBeta * vx + initialLr * gx;
        vy = trainMomentumBeta * vy + initialLr * gy;
        x -= vx;
        y -= vy;
      } else if (selectedOptimizer === 'rmsprop') {
        sx = 0.9 * sx + 0.1 * (gx * gx);
        sy = 0.9 * sy + 0.1 * (gy * gy);
        x -= (initialLr * 2.0 / (Math.sqrt(sx) + 1e-6)) * gx;
        y -= (initialLr * 2.0 / (Math.sqrt(sy) + 1e-6)) * gy;
      } else {
        x -= initialLr * gx * 0.8;
        y -= initialLr * gy * 0.8;
      }

      // Bound within [-3, 3]
      x = Math.max(-2.8, Math.min(2.8, x));
      y = Math.max(-2.8, Math.min(2.8, y));
    }
    return pts;
  }, [selectedOptimizer, lossLandscapePreset, batchSize, trainMomentumBeta, initialLr]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. VAE LATENT MANIFOLD & GENERATIVE STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [vaeDatasetPreset, setVaeDatasetPreset] = useState<'digits_morph' | 'face_features' | 'geometric_shapes' | 'gaussian_prior'>('digits_morph');
  const [latentCursorZ1, setLatentCursorZ1] = useState<number>(0.2);
  const [latentCursorZ2, setLatentCursorZ2] = useState<number>(-0.4);
  const [vaeBetaLoss, setVaeBetaLoss] = useState<number>(1.0);

  // Decoded 10x10 Pixel Matrix from Latent Coordinates (z1, z2)
  const decodedVaePixels = useMemo(() => {
    const grid: number[][] = [];
    const z1 = latentCursorZ1;
    const z2 = latentCursorZ2;

    for (let r = 0; r < 10; r++) {
      const row: number[] = [];
      for (let c = 0; c < 10; c++) {
        const nr = (r - 4.5) / 4.5;
        const nc = (c - 4.5) / 4.5;
        let val = 0;

        if (vaeDatasetPreset === 'digits_morph') {
          // Morph between 0, 1, 4, 8 based on (z1, z2)
          const distFromCenter = Math.sqrt(nr * nr + nc * nc);
          const ring = Math.exp(-Math.pow(distFromCenter - (0.6 + z1 * 0.2), 2) * 8);
          const bar = Math.exp(-Math.pow(nc - z2 * 0.3, 2) * 12);
          val = Math.max(0, Math.min(1, ring * (0.6 + z1 * 0.4) + bar * (0.5 - z1 * 0.3)));
        } else if (vaeDatasetPreset === 'face_features') {
          // Morph smile curve and eye tilt
          const isEye = (Math.abs(nr + 0.3) < 0.2) && (Math.abs(nc) > 0.3 && Math.abs(nc) < 0.6);
          const smileCurve = Math.pow(nc, 2) * (z1 * 1.2) - 0.4;
          const isMouth = Math.abs(nr - smileCurve) < 0.18 && Math.abs(nc) < 0.6;
          val = isEye ? 0.9 : isMouth ? 0.85 : Math.max(0, 0.4 - Math.sqrt(nr * nr + nc * nc) * 0.3);
        } else if (vaeDatasetPreset === 'geometric_shapes') {
          // Circle to Square to Star
          const radius = Math.sqrt(nr * nr + nc * nc);
          const angle = Math.atan2(nr, nc);
          const starFactor = 0.5 + 0.2 * Math.sin(angle * (z2 > 0 ? 5 : 4)) * Math.abs(z2);
          val = radius < starFactor + z1 * 0.2 ? 0.9 : 0.1;
        } else {
          // Gaussian Prior Probability Heatmap
          val = Math.exp(-(nr * nr + nc * nc) * (1.5 + z1 * 0.5));
        }

        row.push(val);
      }
      grid.push(row);
    }
    return grid;
  }, [latentCursorZ1, latentCursorZ2, vaeDatasetPreset]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. NETRON DAG INSPECTOR STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [netronModelPreset, setNetronModelPreset] = useState<'resnet18' | 'mobilenet' | 'vit' | 'unet'>('resnet18');
  const [selectedLayerId, setSelectedLayerId] = useState<string>('conv1');
  const [netronBatchSize, setNetronBatchSize] = useState<number>(32);

  // Architecture Models Data with Skip Connections & Math Specs
  const architectureModels = useMemo(() => {
    if (netronModelPreset === 'resnet18') {
      return {
        name: 'ResNet-18 (Deep Residual Network)',
        totalParams: '11.69M',
        totalFlops: '1.82 GFLOPs',
        memory: '46.8 MB',
        layers: [
          {
            id: 'input',
            name: 'Input Image Tensor',
            op: 'Tensor(Float32)',
            inShape: `[${netronBatchSize}, 3, 224, 224]`,
            outShape: `[${netronBatchSize}, 3, 224, 224]`,
            weights: '0',
            flops: '0',
            color: '#38bdf8',
            code: 'x = torch.randn(B, 3, 224, 224)',
            math: 'X ∈ ℝ^{B × C_{in} × H × W}'
          },
          {
            id: 'conv1',
            name: 'Conv2D (7×7, Stride=2, Pad=3)',
            op: 'nn.Conv2d(3, 64, kernel_size=7, stride=2, padding=3)',
            inShape: `[${netronBatchSize}, 3, 224, 224]`,
            outShape: `[${netronBatchSize}, 64, 112, 112]`,
            weights: '9,408 params',
            flops: '118 MFLOPs',
            color: '#34d399',
            code: 'self.conv1 = nn.Conv2d(3, 64, kernel_size=7, stride=2, padding=3, bias=False)',
            math: 'Y = W * X + b,  W ∈ ℝ^{64 × 3 × 7 × 7}'
          },
          {
            id: 'bn1_relu',
            name: 'BatchNorm2D + ReLU',
            op: 'nn.BatchNorm2d(64) + nn.ReLU(inplace=True)',
            inShape: `[${netronBatchSize}, 64, 112, 112]`,
            outShape: `[${netronBatchSize}, 64, 112, 112]`,
            weights: '128 params',
            flops: '1.6 MFLOPs',
            color: '#f59e0b',
            code: 'x = F.relu(self.bn1(x))',
            math: 'y = γ · (x - μ) / √(σ² + ε) + β'
          },
          {
            id: 'maxpool',
            name: 'MaxPool2D (3×3, Stride=2, Pad=1)',
            op: 'nn.MaxPool2d(kernel_size=3, stride=2, padding=1)',
            inShape: `[${netronBatchSize}, 64, 112, 112]`,
            outShape: `[${netronBatchSize}, 64, 56, 56]`,
            weights: '0',
            flops: '0.6 MFLOPs',
            color: '#ec4899',
            code: 'x = self.maxpool(x)',
            math: 'y_{i,j} = max_{p,q} x_{i·s + p, j·s + q}'
          },
          {
            id: 'res_block1',
            name: 'Residual Block 1 [Conv3×3 → BN → Conv3×3 + Skip]',
            op: 'BasicBlock(64 → 64, stride=1)',
            inShape: `[${netronBatchSize}, 64, 56, 56]`,
            outShape: `[${netronBatchSize}, 64, 56, 56]`,
            weights: '73,728 params',
            flops: '231 MFLOPs',
            color: '#a855f7',
            hasSkip: true,
            code: 'identity = x\nout = self.conv2(self.bn1(self.conv1(x)))\nout += identity\nout = F.relu(out)',
            math: 'H(x) = F(x, {W_i}) + x'
          },
          {
            id: 'res_block2',
            name: 'Residual Block 2 [Conv3×3 → BN → Conv3×3 + Skip]',
            op: 'BasicBlock(64 → 128, stride=2, downsample=True)',
            inShape: `[${netronBatchSize}, 64, 56, 56]`,
            outShape: `[${netronBatchSize}, 128, 28, 28]`,
            weights: '221,184 params',
            flops: '173 MFLOPs',
            color: '#a855f7',
            hasSkip: true,
            code: 'identity = self.downsample(x)\nout = self.conv2(self.bn1(self.conv1(x)))\nout += identity',
            math: 'H(x) = F(x, {W_i}) + W_s x'
          },
          {
            id: 'avgpool_fc',
            name: 'AdaptiveAvgPool2D + Linear(1000)',
            op: 'nn.AdaptiveAvgPool2d((1, 1)) + nn.Linear(512, 1000)',
            inShape: `[${netronBatchSize}, 512, 7, 7]`,
            outShape: `[${netronBatchSize}, 1000]`,
            weights: '513,000 params',
            flops: '1.0 MFLOPs',
            color: '#38bdf8',
            code: 'x = torch.flatten(self.avgpool(x), 1)\nlogits = self.fc(x)',
            math: 'y = x · W^T + b,  W ∈ ℝ^{1000 × 512}'
          }
        ]
      };
    } else if (netronModelPreset === 'mobilenet') {
      return {
        name: 'MobileNetV3-Small (Efficient Inverted Residuals)',
        totalParams: '2.54M',
        totalFlops: '0.06 GFLOPs',
        memory: '10.2 MB',
        layers: [
          {
            id: 'input',
            name: 'Input Image Tensor',
            op: 'Tensor(Float32)',
            inShape: `[${netronBatchSize}, 3, 224, 224]`,
            outShape: `[${netronBatchSize}, 3, 224, 224]`,
            weights: '0',
            flops: '0',
            color: '#38bdf8',
            code: 'x = torch.randn(B, 3, 224, 224)',
            math: 'X ∈ ℝ^{B × 3 × 224 × 224}'
          },
          {
            id: 'conv1',
            name: 'Conv2D (3×3, Stride=2) + HardSwish',
            op: 'nn.Conv2d(3, 16, 3, stride=2, padding=1) + HardSwish',
            inShape: `[${netronBatchSize}, 3, 224, 224]`,
            outShape: `[${netronBatchSize}, 16, 112, 112]`,
            weights: '432 params',
            flops: '5.4 MFLOPs',
            color: '#34d399',
            code: 'x = self.hardswish(self.bn1(self.conv1(x)))',
            math: 'h-swish(x) = x · ReLU6(x + 3) / 6'
          },
          {
            id: 'inv_res1',
            name: 'Inverted Residual + Squeeze-and-Excitation (SE)',
            op: 'InvertedResidual(16 → 72 → 24, stride=2, SE=True)',
            inShape: `[${netronBatchSize}, 16, 112, 112]`,
            outShape: `[${netronBatchSize}, 24, 56, 56]`,
            weights: '3,840 params',
            flops: '12.0 MFLOPs',
            color: '#f59e0b',
            hasSkip: true,
            code: 'out = self.expand(x)\nout = self.depthwise(out)\nout = self.se_block(out)\nout = self.project(out)',
            math: 'SE(X) = X ⊙ σ(W_2 · ReLU(W_1 · GAP(X)))'
          },
          {
            id: 'classifier',
            name: 'Conv 1×1 + HardSwish + Linear(1000)',
            op: 'nn.Conv2d(96, 576, 1) + nn.Linear(576, 1000)',
            inShape: `[${netronBatchSize}, 96, 7, 7]`,
            outShape: `[${netronBatchSize}, 1000]`,
            weights: '631,296 params',
            flops: '2.5 MFLOPs',
            color: '#ec4899',
            code: 'logits = self.fc(self.hardswish(self.conv_last(x)))',
            math: 'y = W_{fc} · GAP(H(x)) + b'
          }
        ]
      };
    } else if (netronModelPreset === 'vit') {
      return {
        name: 'Vision Transformer (ViT-Base / 16)',
        totalParams: '86.57M',
        totalFlops: '17.6 GFLOPs',
        memory: '346.2 MB',
        layers: [
          {
            id: 'input',
            name: 'Input Image Tensor',
            op: 'Tensor(Float32)',
            inShape: `[${netronBatchSize}, 3, 224, 224]`,
            outShape: `[${netronBatchSize}, 3, 224, 224]`,
            weights: '0',
            flops: '0',
            color: '#38bdf8',
            code: 'x = torch.randn(B, 3, 224, 224)',
            math: 'X ∈ ℝ^{B × 3 × 224 × 224}'
          },
          {
            id: 'patch_embed',
            name: 'Patch Embedding (Conv2D 16×16, Stride=16)',
            op: 'nn.Conv2d(3, 768, kernel_size=16, stride=16)',
            inShape: `[${netronBatchSize}, 3, 224, 224]`,
            outShape: `[${netronBatchSize}, 196, 768]`,
            weights: '590,592 params',
            flops: '115 MFLOPs',
            color: '#34d399',
            code: 'patches = self.patch_embed(x).flatten(2).transpose(1, 2)',
            math: 'z_0 = [x_{class}; x_p^1 E; ...; x_p^N E] + E_{pos}'
          },
          {
            id: 'transformer_block',
            name: 'Transformer Encoder Block (12×)',
            op: 'TransformerBlock(dim=768, heads=12, mlp_dim=3072)',
            inShape: `[${netronBatchSize}, 197, 768]`,
            outShape: `[${netronBatchSize}, 197, 768]`,
            weights: '7,087,872 params',
            flops: '1.4 GFLOPs',
            color: '#a855f7',
            hasSkip: true,
            code: 'x = x + self.attn(self.ln1(x))\nx = x + self.mlp(self.ln2(x))',
            math: 'z\'_l = MSA(LN(z_{l-1})) + z_{l-1},  z_l = MLP(LN(z\'_l)) + z\'_l'
          },
          {
            id: 'mlp_head',
            name: 'LayerNorm + Linear Classification Head',
            op: 'nn.LayerNorm(768) + nn.Linear(768, 1000)',
            inShape: `[${netronBatchSize}, 768]`,
            outShape: `[${netronBatchSize}, 1000]`,
            weights: '769,536 params',
            flops: '1.5 MFLOPs',
            color: '#ec4899',
            code: 'cls_token = self.ln(x[:, 0])\nlogits = self.head(cls_token)',
            math: 'y = LN(z_L^0) W_{head} + b'
          }
        ]
      };
    } else {
      return {
        name: 'U-Net Semantic Segmentation',
        totalParams: '31.03M',
        totalFlops: '4.88 GFLOPs',
        memory: '124.1 MB',
        layers: [
          {
            id: 'input',
            name: 'Input Image Tensor',
            op: 'Tensor(Float32)',
            inShape: `[${netronBatchSize}, 3, 256, 256]`,
            outShape: `[${netronBatchSize}, 3, 256, 256]`,
            weights: '0',
            flops: '0',
            color: '#38bdf8',
            code: 'x = torch.randn(B, 3, 256, 256)',
            math: 'X ∈ ℝ^{B × 3 × 256 × 256}'
          },
          {
            id: 'enc1',
            name: 'Encoder Double Conv 1',
            op: 'DoubleConv(3 → 64, 3×3)',
            inShape: `[${netronBatchSize}, 3, 256, 256]`,
            outShape: `[${netronBatchSize}, 64, 256, 256]`,
            weights: '38,720 params',
            flops: '2.5 GFLOPs',
            color: '#34d399',
            code: 'x1 = self.inc(x)',
            math: 'X_1 = Conv(Conv(X))'
          },
          {
            id: 'bottleneck',
            name: 'Contracting Bottleneck (MaxPool → DoubleConv)',
            op: 'Down(64 → 512, stride=2)',
            inShape: `[${netronBatchSize}, 64, 128, 128]`,
            outShape: `[${netronBatchSize}, 512, 32, 32]`,
            weights: '4,719,616 params',
            flops: '1.2 GFLOPs',
            color: '#f59e0b',
            code: 'xb = self.down4(x4)',
            math: 'X_{bottle} = DoubleConv(MaxPool(X_4))'
          },
          {
            id: 'dec_skip',
            name: 'Decoder Upsampling + Skip Concatenation',
            op: 'Up(512 → 64, concat_skip=True)',
            inShape: `[${netronBatchSize}, 512, 64, 64]`,
            outShape: `[${netronBatchSize}, 64, 256, 256]`,
            weights: '1,844,224 params',
            flops: '1.1 GFLOPs',
            color: '#a855f7',
            hasSkip: true,
            code: 'x = self.up1(xb, x1) # Skip concat along channel dim',
            math: 'X_{up} = Conv(Concat(UpSample(X_{prev}), X_{skip}))'
          },
          {
            id: 'out_conv',
            name: 'Final 1×1 Conv (Class Mask Projection)',
            op: 'nn.Conv2d(64, num_classes=21, 1)',
            inShape: `[${netronBatchSize}, 64, 256, 256]`,
            outShape: `[${netronBatchSize}, 21, 256, 256]`,
            weights: '1,365 params',
            flops: '89 MFLOPs',
            color: '#ec4899',
            code: 'logits = self.outc(x)',
            math: 'M = W_{out} * X_{dec} + b'
          }
        ]
      };
    }
  }, [netronModelPreset, netronBatchSize]);

  // Selected Layer Metadata
  const currentSelectedLayer = useMemo(() => {
    return architectureModels.layers.find(l => l.id === selectedLayerId) || architectureModels.layers[0];
  }, [architectureModels, selectedLayerId]);

  return (
    <div
      className="deep-learning-studio-container"
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
                Deep Learning & Neural Network Studio 🧠
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(168, 85, 247, 0.2)',
                  color: '#c084fc',
                  border: '1px solid rgba(168, 85, 247, 0.4)'
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
              onChange={(e) => setActiveModuleId(e.target.value as DeepLearningModuleId)}
              style={{
                height: '32px',
                padding: '0 32px 0 12px',
                borderRadius: '6px',
                background: 'var(--dropdown-bg, rgba(15, 23, 42, 0.96))',
                color: 'var(--text-primary, #f8fafc)',
                border: '1px solid var(--dropdown-border, rgba(168, 85, 247, 0.4))',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none'
              }}
            >
              <optgroup label="⚡ Feedforward & Vision">
                <option value="mlp_playground">Multilayer Perceptron (MLP) Playground</option>
                <option value="cnn_feature_maps">CNN Kernels & Feature Maps</option>
              </optgroup>
              <optgroup label="🔄 Sequences & Transformers">
                <option value="rnn_lstm_unroll">RNN & LSTM Unrolled Gating Lab</option>
                <option value="transformer_attention">Multi-Head Attention & QKV Lab</option>
              </optgroup>
              <optgroup label="🌌 Latent Spaces & Dynamics">
                <option value="latent_space_embeddings">3D Latent Space & PCA/t-SNE Projector</option>
                <option value="training_dynamics">Hyperparameter Tuning & Optimizers</option>
                <option value="vae_generative">Autoencoder & VAE Latent Manifold</option>
              </optgroup>
              <optgroup label="🏗️ Model Architecture">
                <option value="netron_graph">Netron-Style Model DAG Inspector</option>
              </optgroup>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: '#c084fc' }} />
          </div>

          <button
            type="button"
            onClick={() => setIsSimulating(!isSimulating)}
            style={{
              height: '32px',
              padding: '0 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: isSimulating ? 'rgba(52, 211, 153, 0.25)' : 'rgba(239, 68, 68, 0.2)',
              color: isSimulating ? '#34d399' : '#f87171',
              border: isSimulating ? '1px solid #34d399' : '1px solid rgba(239, 68, 68, 0.4)'
            }}
          >
            {isSimulating ? <Pause size={13} /> : <Play size={13} />}
            <span>{isSimulating ? 'Live Flow' : 'Paused'}</span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#c084fc', fontSize: '0.80rem', fontWeight: 800 }}>
              <activeMeta.icon size={15} />
              <span>{activeMeta.name}</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: '1.4', margin: 0 }}>
              {activeMeta.description}
            </p>
          </div>

          {/* Unified Controls Container */}
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
            {/* 1. MLP CONTROLS */}
            {activeModuleId === 'mlp_playground' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Dataset Preset Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#f59e0b' }}>Dataset Geometry Preset:</span>
                  <PillSelector
                    options={[
                      { id: 'moons', label: '🌙 Two Moons' },
                      { id: 'circles', label: '⭕ Circles' },
                      { id: 'xor', label: '✖️ XOR Spiral' },
                      { id: 'linear', label: '📐 Linear' }
                    ]}
                    value={mlpDatasetPreset}
                    onChange={(val) => setMlpDatasetPreset(val as any)}
                    columns={2}
                    activeColor="#f59e0b"
                  />
                </div>

                {/* Activation Function & Derivative Mini-Graph */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#38bdf8' }}>Activation Function:</span>
                  <PillSelector
                    options={[
                      { id: 'tanh', label: 'Tanh' },
                      { id: 'relu', label: 'ReLU' },
                      { id: 'sigmoid', label: 'Sigmoid' },
                      { id: 'leaky_relu', label: 'LeakyReLU' },
                      { id: 'gelu', label: 'GELU' }
                    ]}
                    value={mlpActivation}
                    onChange={(val) => setMlpActivation(val as any)}
                    columns={3}
                    activeColor="#38bdf8"
                  />
                </div>

                {/* Activation Curve & Derivative Diagram */}
                <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#38bdf8' }}>f(z) Curve & Derivative f'(z)</span>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontFamily: 'monospace' }}>Range: {activationMeta.range}</span>
                  </div>
                  <svg viewBox="-60 -35 120 70" style={{ width: '100%', height: '52px', background: '#020617', borderRadius: '4px' }}>
                    {/* Axes */}
                    <line x1="-55" y1="0" x2="55" y2="0" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.8" />
                    <line x1="0" y1="-30" x2="0" y2="30" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.8" />
                    {/* Function Curve f(z) */}
                    <path
                      d={(() => {
                        let p = '';
                        for (let x = -50; x <= 50; x += 2) {
                          const z = (x / 50) * 3;
                          const y = -activationMeta.eval(z) * 18;
                          p += `${x === -50 ? 'M' : ' L'} ${x} ${Math.max(-30, Math.min(30, y))}`;
                        }
                        return p;
                      })()}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                    {/* Derivative Curve f'(z) */}
                    <path
                      d={(() => {
                        let p = '';
                        for (let x = -50; x <= 50; x += 2) {
                          const z = (x / 50) * 3;
                          const y = -activationMeta.evalDeriv(z) * 18;
                          p += `${x === -50 ? 'M' : ' L'} ${x} ${Math.max(-30, Math.min(30, y))}`;
                        }
                        return p;
                      })()}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.6"
                      strokeDasharray="2 1.5"
                    />
                  </svg>
                  <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontFamily: 'monospace', lineHeight: '1.2' }}>
                    <span style={{ color: '#38bdf8' }}>f(z):</span> {activationMeta.formula}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#f59e0b', fontFamily: 'monospace', lineHeight: '1.2' }}>
                    <span>f'(z):</span> {activationMeta.derivative}
                  </div>
                </div>

                {/* Architecture Sliders */}
                <DualParamControl label="Hidden Layer 1 Neurons:" value={mlpHidden1Count} min={2} max={8} step={1} precision={0} onChange={setMlpHidden1Count} color="#34d399" />
                <DualParamControl label="Hidden Layer 2 Neurons:" value={mlpHidden2Count} min={0} max={6} step={1} precision={0} onChange={setMlpHidden2Count} color="#f59e0b" />
                <DualParamControl label="Weight Init Scale (σ):" value={mlpWeightInitScale} min={0.2} max={2.5} step={0.1} onChange={setMlpWeightInitScale} color="#a855f7" />
                <DualParamControl label="Global Bias Offset (b):" value={mlpGlobalBias} min={-2.0} max={2.0} step={0.1} onChange={setMlpGlobalBias} color="#38bdf8" />
                <DualParamControl label="Learning Rate (η):" value={mlpLearningRate} min={0.01} max={0.5} step={0.01} onChange={setMlpLearningRate} color="#ec4899" />

                {/* Training Step Actions */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={trainMlpStep} style={{ flex: 1, padding: '6px', borderRadius: '4px', background: 'rgba(52, 211, 153, 0.25)', color: '#34d399', border: '1px solid #34d399', fontSize: '0.70rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Play size={11} />
                    <span>Train Epoch (+1)</span>
                  </button>
                  <button type="button" onClick={resetMlp} style={{ padding: '6px 10px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', fontSize: '0.70rem', fontWeight: 800, cursor: 'pointer' }}>
                    Reset
                  </button>
                </div>

                {/* Selected Synapse Inspector */}
                {selectedSynapse && (
                  <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.4)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#c084fc' }}>Synapse: {selectedSynapse.from} → {selectedSynapse.to}</span>
                      <button type="button" onClick={() => setSelectedSynapse(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.65rem' }}>✕</button>
                    </div>
                    <div style={{ fontSize: '0.64rem', color: '#f8fafc', fontFamily: 'monospace' }}>
                      Weight w = {selectedSynapse.weight.toFixed(3)} | ∂L/∂w = {(Math.sin(timeT) * 0.04).toFixed(4)}
                    </div>
                  </div>
                )}

                {/* Inject Point */}
                <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#38bdf8' }}>Inject Custom Data Point:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input type="number" step="0.1" value={injectMlpX} onChange={(e) => setInjectMlpX(parseFloat(e.target.value) || 0)} placeholder="X₁" style={{ width: '40%', padding: '4px', textAlign: 'center', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #334155', fontSize: '0.72rem' }} />
                    <input type="number" step="0.1" value={injectMlpY} onChange={(e) => setInjectMlpY(parseFloat(e.target.value) || 0)} placeholder="X₂" style={{ width: '40%', padding: '4px', textAlign: 'center', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #334155', fontSize: '0.72rem' }} />
                    <button type="button" onClick={() => setInjectMlpLabel(injectMlpLabel === 0 ? 1 : 0)} style={{ padding: '0 8px', borderRadius: '4px', background: injectMlpLabel === 1 ? '#34d399' : '#38bdf8', color: '#000', fontWeight: 800, fontSize: '0.70rem', border: 'none', cursor: 'pointer' }}>
                      C{injectMlpLabel}
                    </button>
                  </div>
                  <button type="button" onClick={() => {
                    setCustomMlpPoints(prev => [...prev, { id: Date.now(), x: parseFloat(injectMlpX.toFixed(2)), y: parseFloat(injectMlpY.toFixed(2)), label: injectMlpLabel }]);
                  }} style={{ padding: '5px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.25)', color: '#38bdf8', border: '1px solid #38bdf8', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}>
                    + Add Point
                  </button>
                </div>
              </div>
            )}

            {/* 2. CNN CONTROLS */}
            {activeModuleId === 'cnn_feature_maps' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Input Image Preset Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#38bdf8' }}>Input Image Preset:</span>
                  <PillSelector
                    options={[
                      { id: 'digit_8', label: '🔢 Digit 8' },
                      { id: 'cat', label: '🐱 Cat Silhouette' },
                      { id: 'horiz_edge', label: '➖ Horiz Edge' },
                      { id: 'vert_edge', label: '┃ Vert Edge' },
                      { id: 'diagonal_x', label: '✖️ Cross (X)' },
                      { id: 'blank', label: '🎨 Clear Blank' }
                    ]}
                    value={cnnImagePreset}
                    onChange={(val) => applyImagePreset(val as any)}
                    columns={2}
                    activeColor="#38bdf8"
                  />
                </div>

                {/* Convolution Kernel Preset Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#34d399' }}>Convolution 3×3 Kernel Filter:</span>
                  <PillSelector
                    options={[
                      { id: 'edge_detect', label: 'Laplacian Edge' },
                      { id: 'sobel_x', label: 'Sobel Horiz (X)' },
                      { id: 'sobel_y', label: 'Sobel Vert (Y)' },
                      { id: 'gaussian_blur', label: 'Gaussian Blur' },
                      { id: 'sharpen', label: 'Sharpen 3×3' },
                      { id: 'emboss', label: 'Emboss 3×3' },
                      { id: 'custom', label: '✏️ Custom Matrix' }
                    ]}
                    value={cnnKernelPreset}
                    onChange={(val) => setCnnKernelPreset(val as any)}
                    columns={2}
                    activeColor="#34d399"
                  />
                </div>

                {/* Custom 3x3 Matrix Number Inputs if 'custom' is selected */}
                {cnnKernelPreset === 'custom' && (
                  <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(52, 211, 153, 0.3)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#34d399' }}>Custom 3×3 Weight Matrix:</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                      {cnnCustomKernel.map((row, r) =>
                        row.map((val, c) => (
                          <input
                            key={`ck-${r}-${c}`}
                            type="number"
                            step="0.5"
                            value={val}
                            onChange={(e) => {
                              const nextVal = parseFloat(e.target.value) || 0;
                              setCnnCustomKernel(prev => {
                                const next = prev.map(krow => [...krow]);
                                next[r][c] = nextVal;
                                return next;
                              });
                            }}
                            style={{
                              width: '100%',
                              padding: '4px 2px',
                              textAlign: 'center',
                              borderRadius: '4px',
                              background: '#1e293b',
                              color: '#fff',
                              border: '1px solid #334155',
                              fontSize: '0.70rem',
                              fontFamily: 'monospace'
                            }}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Pooling & Hyperparameters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#f59e0b' }}>Downsampling Pooling Operation:</span>
                  <PillSelector
                    options={[
                      { id: 'max', label: 'Max Pooling 2×2' },
                      { id: 'avg', label: 'Average Pooling 2×2' }
                    ]}
                    value={cnnPoolingType}
                    onChange={(val) => setCnnPoolingType(val as any)}
                    columns={2}
                    activeColor="#f59e0b"
                  />
                </div>

                <DualParamControl label="Convolution Bias (b):" value={cnnBias} min={-2.0} max={2.0} step={0.1} onChange={setCnnBias} color="#a855f7" />
                <DualParamControl label="Sliding Stride (S):" value={cnnStride} min={1} max={2} step={1} precision={0} onChange={setCnnStride} color="#ec4899" />
                <DualParamControl label="Receptive Step (0..15):" value={cnnFilterStep} min={0} max={15} step={1} precision={0} onChange={setCnnFilterStep} color="#38bdf8" />
                
                {/* Step Traversal Navigation */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={() => setCnnFilterStep(prev => Math.max(0, prev - 1))} style={{ flex: 1, padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', fontSize: '0.68rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <SkipBack size={11} />
                    <span>Prev Receptive Patch</span>
                  </button>
                  <button type="button" onClick={() => setCnnFilterStep(prev => (prev + 1) % 16)} style={{ flex: 1, padding: '6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid #38bdf8', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span>Next Patch</span>
                    <SkipForward size={11} />
                  </button>
                </div>
              </div>
            )}

            {/* 3. RNN / LSTM CONTROLS */}
            {activeModuleId === 'rnn_lstm_unroll' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#38bdf8' }}>Recurrent Cell Architecture:</span>
                  <PillSelector
                    options={[
                      { id: 'lstm', label: 'LSTM Cell' },
                      { id: 'gru', label: 'GRU Cell' },
                      { id: 'vanilla_rnn', label: 'Vanilla RNN' }
                    ]}
                    value={rnnCellType}
                    onChange={(val) => setRnnCellType(val as any)}
                    columns={3}
                    activeColor="#38bdf8"
                  />
                </div>

                {/* Mathematical Gating Equations Card */}
                <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#38bdf8' }}>{rnnFormulas.title} Equations:</span>
                  {rnnFormulas.fGate && <div style={{ fontSize: '0.60rem', color: '#f87171', fontFamily: 'monospace' }}>{rnnFormulas.fGate}</div>}
                  {rnnFormulas.iGate && <div style={{ fontSize: '0.60rem', color: '#34d399', fontFamily: 'monospace' }}>{rnnFormulas.iGate}</div>}
                  {rnnFormulas.cCand && <div style={{ fontSize: '0.60rem', color: '#38bdf8', fontFamily: 'monospace' }}>{rnnFormulas.cCand}</div>}
                  {rnnFormulas.cUpdate && <div style={{ fontSize: '0.60rem', color: '#f59e0b', fontFamily: 'monospace' }}>{rnnFormulas.cUpdate}</div>}
                  {rnnFormulas.oGate && <div style={{ fontSize: '0.60rem', color: '#c084fc', fontFamily: 'monospace' }}>{rnnFormulas.oGate}</div>}
                  {rnnFormulas.hUpdate && <div style={{ fontSize: '0.60rem', color: '#ec4899', fontFamily: 'monospace' }}>{rnnFormulas.hUpdate}</div>}
                  <div style={{ fontSize: '0.58rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>💡 {rnnFormulas.keyInsight}</div>
                </div>

                {/* Gating Hyperparameters */}
                {rnnCellType === 'lstm' && (
                  <DualParamControl label="Forget Gate Bias (b_f):" value={rnnForgetBias} min={-3.0} max={3.0} step={0.1} onChange={setRnnForgetBias} color="#f87171" />
                )}
                <DualParamControl label="Input Weight Sensitivity (w_i):" value={rnnInputWeight} min={0.1} max={2.0} step={0.1} onChange={setRnnInputWeight} color="#34d399" />
                <DualParamControl label="Sequence Time Steps (T):" value={rnnSeqLength} min={2} max={8} step={1} precision={0} onChange={setRnnSeqLength} color="#38bdf8" />
                <DualParamControl label="BPTT Gradient Decay Factor (γ):" value={rnnGradientScale} min={0.2} max={1.8} step={0.05} onChange={setRnnGradientScale} color="#ec4899" />

                {/* Time Step Inspector Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#f59e0b' }}>Inspect Time Step (t):</span>
                  <PillSelector
                    options={Array.from({ length: rnnSeqLength }).map((_, idx) => ({ id: String(idx + 1), label: `t = ${idx + 1}` }))}
                    value={String(selectedRnnStep)}
                    onChange={(val) => setSelectedRnnStep(Number(val))}
                    columns={4}
                    activeColor="#f59e0b"
                  />
                </div>
              </div>
            )}

            {/* 4. TRANSFORMER ATTENTION CONTROLS */}
            {activeModuleId === 'transformer_attention' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Sentence Presets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#38bdf8' }}>Input Sentence Preset:</span>
                  <PillSelector
                    options={[
                      { id: 'neural_network', label: '🧠 Deep Nets' },
                      { id: 'attention_needed', label: '🤖 Attention Is All' },
                      { id: 'pronoun_coref', label: '🐱 Coreference' },
                      { id: 'custom', label: '✏️ Custom Input' }
                    ]}
                    value={sentencePreset}
                    onChange={(val) => setSentencePreset(val as any)}
                    columns={2}
                    activeColor="#38bdf8"
                  />
                </div>

                {/* Custom Sentence Input Box */}
                {sentencePreset === 'custom' && (
                  <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8' }}>Custom Sentence (up to 8 tokens):</span>
                    <input
                      type="text"
                      value={customSentenceText}
                      onChange={(e) => setCustomSentenceText(e.target.value)}
                      placeholder="e.g. AI models learn semantic patterns"
                      style={{
                        width: '100%',
                        padding: '6px',
                        borderRadius: '4px',
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid #334155',
                        fontSize: '0.72rem'
                      }}
                    />
                  </div>
                )}

                {/* Attention Mode & Causal Masking */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#f59e0b' }}>Self-Attention Masking Mode:</span>
                  <PillSelector
                    options={[
                      { id: 'bidirectional', label: 'BERT Bidirectional' },
                      { id: 'causal', label: 'GPT Causal Mask' }
                    ]}
                    value={isCausalMasked ? 'causal' : 'bidirectional'}
                    onChange={(val) => setIsCausalMasked(val === 'causal')}
                    columns={2}
                    activeColor="#f59e0b"
                  />
                </div>

                <DualParamControl label="Attention Heads (H):" value={attentionHeadCount} min={1} max={8} step={1} precision={0} onChange={setAttentionHeadCount} color="#a855f7" />
                <DualParamControl label="Temperature Scaling (√dₖ):" value={attentionTempScale} min={0.5} max={3.5} step={0.1} onChange={setAttentionTempScale} color="#38bdf8" />
                
                {/* Active Head Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#a855f7' }}>Active Attention Head:</span>
                  <PillSelector
                    options={Array.from({ length: attentionHeadCount }).map((_, idx) => ({
                      id: String(idx),
                      label: idx === 0 ? 'H1: Syntax' : idx === 1 ? 'H2: Global' : idx === 2 ? 'H3: Coref' : `H${idx + 1}`
                    }))}
                    value={String(activeHeadIdx)}
                    onChange={(val) => setActiveHeadIdx(Number(val))}
                    columns={4}
                    activeColor="#a855f7"
                  />
                </div>

                {/* Selected Query Token */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#34d399' }}>Query Token (q_i):</span>
                  <PillSelector
                    options={activeTokens.map((t, idx) => ({ id: String(idx), label: t }))}
                    value={String(selectedTokenIdx >= activeTokens.length ? 0 : selectedTokenIdx)}
                    onChange={(val) => setSelectedTokenIdx(Number(val))}
                    columns={3}
                    activeColor="#34d399"
                  />
                </div>

                {/* Live QKV Vector Projections */}
                <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem', fontFamily: 'monospace' }}>
                  <span style={{ fontWeight: 800, color: '#c084fc' }}>Q, K, V Projections for "{activeTokens[selectedTokenIdx >= activeTokens.length ? 0 : selectedTokenIdx]}":</span>
                  <div style={{ color: '#38bdf8' }}>Q: [{qkvVectors.query.join(', ')}]</div>
                  <div style={{ color: '#34d399' }}>K: [{qkvVectors.key.join(', ')}]</div>
                  <div style={{ color: '#f59e0b' }}>V: [{qkvVectors.value.join(', ')}]</div>
                </div>
              </div>
            )}

            {/* 5. 3D LATENT SPACE CONTROLS */}
            {activeModuleId === 'latent_space_embeddings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Dataset Preset Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#38bdf8' }}>High-Dim Embedding Dataset:</span>
                  <PillSelector
                    options={[
                      { id: 'mnist_digits', label: '🔢 MNIST 10-Class' },
                      { id: 'swiss_roll', label: '🪐 Swiss Roll 3D' },
                      { id: 'word2vec_analogies', label: '👑 Word2Vec Analogy' },
                      { id: 'concentric_spheres', label: '🌀 Spheres Shell' }
                    ]}
                    value={latentDatasetPreset}
                    onChange={(val) => setLatentDatasetPreset(val as any)}
                    columns={2}
                    activeColor="#38bdf8"
                  />
                </div>

                {/* Dimensionality Reduction Technique */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#34d399' }}>Projection Method:</span>
                  <PillSelector
                    options={[
                      { id: 'pca', label: 'PCA (Linear)' },
                      { id: 'tsne', label: 't-SNE (Manifold)' },
                      { id: 'umap', label: 'UMAP (Topology)' }
                    ]}
                    value={latentProjectionMethod}
                    onChange={(val) => setLatentProjectionMethod(val as any)}
                    columns={3}
                    activeColor="#34d399"
                  />
                </div>

                <DualParamControl label="Cluster Spread (σ):" value={latentClusterSpread} min={0.5} max={2.5} step={0.1} onChange={setLatentClusterSpread} color="#ec4899" />
                <DualParamControl label="Perplexity / k-Neighbors:" value={latentPerplexity} min={5} max={50} step={1} precision={0} onChange={setLatentPerplexity} color="#f59e0b" />
                <DualParamControl label="Camera Pitch (Rx):" value={latentRotX} min={-80} max={80} step={2} onChange={setLatentRotX} color="#38bdf8" />
                <DualParamControl label="Camera Yaw (Ry):" value={latentRotY} min={-180} max={180} step={2} onChange={setLatentRotY} color="#a855f7" />

                {/* Mathematical Theory Card */}
                <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#38bdf8' }}>
                    {latentProjectionMethod === 'pca' ? 'PCA Maximizing Variance:' : latentProjectionMethod === 'tsne' ? 't-SNE Divergence Minimization:' : 'UMAP Fuzzy Simplicial Set:'}
                  </span>
                  <div style={{ fontSize: '0.60rem', color: '#f59e0b', fontFamily: 'monospace' }}>
                    {latentProjectionMethod === 'pca' ? 'w₁ = argmax { w^T X^T X w } / ||w||²' : latentProjectionMethod === 'tsne' ? 'KL(P || Q) = ∑ p_ij log( p_ij / q_ij )' : 'C(X, Y) = ∑ (p_ij log(p_ij/q_ij) + (1-p_ij)log((1-p_ij)/(1-q_ij)))'}
                  </div>
                </div>
              </div>
            )}

            {/* 6. TRAINING DYNAMICS CONTROLS */}
            {activeModuleId === 'training_dynamics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Optimizer Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#34d399' }}>Gradient Optimizer:</span>
                  <PillSelector
                    options={[
                      { id: 'adam', label: '⚡ Adam' },
                      { id: 'momentum', label: '🏎️ SGD Momentum' },
                      { id: 'rmsprop', label: '📉 RMSprop' },
                      { id: 'sgd', label: '🐢 Plain SGD' }
                    ]}
                    value={selectedOptimizer}
                    onChange={(val) => setSelectedOptimizer(val as any)}
                    columns={2}
                    activeColor="#34d399"
                  />
                </div>

                {/* LR Scheduler */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#f59e0b' }}>LR Scheduler Policy:</span>
                  <PillSelector
                    options={[
                      { id: 'cosine', label: '🌊 Cosine Anneal' },
                      { id: 'onecycle', label: '⚡ OneCycleLR' },
                      { id: 'steplr', label: '🪜 Step Decay' },
                      { id: 'exponential', label: '📉 Exponential' }
                    ]}
                    value={lrScheduler}
                    onChange={(val) => setLrScheduler(val as any)}
                    columns={2}
                    activeColor="#f59e0b"
                  />
                </div>

                {/* Loss Landscape Terrain */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#ec4899' }}>Loss Landscape Terrain:</span>
                  <PillSelector
                    options={[
                      { id: 'ravine', label: '🏔️ Rosenbrock Ravine' },
                      { id: 'saddle', label: '🕳️ Saddle Point' },
                      { id: 'convex_bowl', label: '🌋 Convex Bowl' },
                      { id: 'rastrigin', label: '🌀 Rugged Rastrigin' }
                    ]}
                    value={lossLandscapePreset}
                    onChange={(val) => setLossLandscapePreset(val as any)}
                    columns={2}
                    activeColor="#ec4899"
                  />
                </div>

                <DualParamControl label="Initial Learning Rate (η₀):" value={initialLr} min={0.001} max={0.1} step={0.005} onChange={setInitialLr} color="#38bdf8" />
                <DualParamControl label="Mini-Batch Size (B):" value={batchSize} min={8} max={128} step={8} precision={0} onChange={setBatchSize} color="#34d399" />
                <DualParamControl label="Momentum Coeff (β₁):" value={trainMomentumBeta} min={0.5} max={0.99} step={0.01} onChange={setTrainMomentumBeta} color="#ec4899" />
                <DualParamControl label="Weight Decay / L2 (λ):" value={weightDecayL2} min={0.0} max={0.005} step={0.0005} precision={4} onChange={setWeightDecayL2} color="#a855f7" />

                {/* Mathematical Optimizer Update Rule Box */}
                <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(52, 211, 153, 0.3)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#34d399' }}>{optimizerFormulas.title} Update Rule:</span>
                  {optimizerFormulas.mRule && <div style={{ fontSize: '0.60rem', color: '#38bdf8', fontFamily: 'monospace' }}>{optimizerFormulas.mRule}</div>}
                  {optimizerFormulas.vRule && <div style={{ fontSize: '0.60rem', color: '#f59e0b', fontFamily: 'monospace' }}>{optimizerFormulas.vRule}</div>}
                  {optimizerFormulas.paramRule && <div style={{ fontSize: '0.60rem', color: '#ec4899', fontFamily: 'monospace', fontWeight: 'bold' }}>{optimizerFormulas.paramRule}</div>}
                  <div style={{ fontSize: '0.58rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>💡 {optimizerFormulas.insight}</div>
                </div>
              </div>
            )}

            {/* 7. VAE LATENT MANIFOLD CONTROLS */}
            {activeModuleId === 'vae_generative' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Generative Dataset Preset */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#ec4899' }}>Generative Latent Manifold:</span>
                  <PillSelector
                    options={[
                      { id: 'digits_morph', label: '🔢 Digits (0..9)' },
                      { id: 'face_features', label: '😃 Face Features' },
                      { id: 'geometric_shapes', label: '🌸 Morph Shapes' },
                      { id: 'gaussian_prior', label: '🌀 Prior N(0, I)' }
                    ]}
                    value={vaeDatasetPreset}
                    onChange={(val) => setVaeDatasetPreset(val as any)}
                    columns={2}
                    activeColor="#ec4899"
                  />
                </div>

                <DualParamControl label="Latent Z₁ (Coordinate):" value={latentCursorZ1} min={-2.5} max={2.5} step={0.05} onChange={setLatentCursorZ1} color="#38bdf8" />
                <DualParamControl label="Latent Z₂ (Coordinate):" value={latentCursorZ2} min={-2.5} max={2.5} step={0.05} onChange={setLatentCursorZ2} color="#ec4899" />

                {/* Quick Target Presets */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Origin (0,0)', z1: 0, z2: 0 },
                    { label: 'Q1 (1.5, 1.5)', z1: 1.5, z2: 1.5 },
                    { label: 'Q2 (-1.5, 1.5)', z1: -1.5, z2: 1.5 },
                    { label: 'Q3 (-1.5, -1.5)', z1: -1.5, z2: -1.5 }
                  ].map((preset, idx) => (
                    <button
                      key={`qp-${idx}`}
                      type="button"
                      onClick={() => {
                        setLatentCursorZ1(preset.z1);
                        setLatentCursorZ2(preset.z2);
                      }}
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        borderRadius: '4px',
                        background: '#1e293b',
                        color: '#f8fafc',
                        border: '1px solid #334155',
                        fontSize: '0.62rem',
                        cursor: 'pointer'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <DualParamControl label="KL Divergence Weight (β):" value={vaeBetaLoss} min={0.1} max={5.0} step={0.1} onChange={setVaeBetaLoss} color="#34d399" />

                {/* Reparameterization Trick Box */}
                <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(236, 72, 153, 0.3)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#ec4899' }}>Reparameterization Trick:</span>
                  <div style={{ fontSize: '0.62rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                    z = μ(x) + σ(x) ⊙ ε,  where ε ~ N(0, I)
                  </div>
                  <div style={{ fontSize: '0.58rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    Enables deterministic backpropagation gradients by isolating stochasticity into independent standard normal noise ε.
                  </div>
                </div>
              </div>
            )}

            {/* 8. NETRON DAG CONTROLS */}
            {activeModuleId === 'netron_graph' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Architecture Preset */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#a855f7' }}>Deep Neural Architecture:</span>
                  <PillSelector
                    options={[
                      { id: 'resnet18', label: '🖼️ ResNet-18 (Skips)' },
                      { id: 'mobilenet', label: '⚡ MobileNetV3 (SE)' },
                      { id: 'vit', label: '🤖 Vision Transformer' },
                      { id: 'unet', label: '🧬 U-Net (U-Skip)' }
                    ]}
                    value={netronModelPreset}
                    onChange={(val) => {
                      setNetronModelPreset(val as any);
                      setSelectedLayerId('input');
                    }}
                    columns={2}
                    activeColor="#a855f7"
                  />
                </div>

                {/* Batch Size Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#38bdf8' }}>Inference Batch Dimension (B):</span>
                  <PillSelector
                    options={[
                      { id: '1', label: 'B=1 (Edge)' },
                      { id: '8', label: 'B=8 (Mobile)' },
                      { id: '32', label: 'B=32 (Default)' },
                      { id: '64', label: 'B=64 (Server)' }
                    ]}
                    value={String(netronBatchSize)}
                    onChange={(val) => setNetronBatchSize(Number(val))}
                    columns={2}
                    activeColor="#38bdf8"
                  />
                </div>

                {/* Model Complexity & Hardware Footprint HUD */}
                <div style={{ padding: '10px', borderRadius: '8px', background: '#090d16', border: '1px solid rgba(168, 85, 247, 0.35)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#a855f7' }}>{architectureModels.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.62rem', fontFamily: 'monospace' }}>
                    <div style={{ padding: '4px 6px', borderRadius: '4px', background: '#0f172a', border: '1px solid #334155' }}>
                      <span style={{ color: '#94a3b8' }}>Params: </span>
                      <strong style={{ color: '#34d399' }}>{architectureModels.totalParams}</strong>
                    </div>
                    <div style={{ padding: '4px 6px', borderRadius: '4px', background: '#0f172a', border: '1px solid #334155' }}>
                      <span style={{ color: '#94a3b8' }}>Compute: </span>
                      <strong style={{ color: '#f59e0b' }}>{architectureModels.totalFlops}</strong>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.60rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                    Peak Activations Memory: <span style={{ color: '#38bdf8', fontWeight: 800 }}>{architectureModels.memory}</span>
                  </div>
                </div>

                {/* Selected Layer PyTorch Code Snippet */}
                <div style={{ padding: '8px', borderRadius: '6px', background: '#090d16', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#38bdf8' }}>PyTorch Implementation:</span>
                    <span style={{ fontSize: '0.58rem', color: '#94a3b8', fontFamily: 'monospace' }}>{currentSelectedLayer.name.split(' ')[0]}</span>
                  </div>
                  <pre style={{ margin: 0, padding: '6px', borderRadius: '4px', background: '#020617', color: '#34d399', fontSize: '0.58rem', fontFamily: 'monospace', overflowX: 'auto', lineHeight: '1.4' }}>
                    {currentSelectedLayer.code}
                  </pre>
                  <div style={{ fontSize: '0.58rem', color: '#c084fc', fontFamily: 'monospace', marginTop: '2px' }}>
                    📐 {currentSelectedLayer.math}
                  </div>
                </div>
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
            background: 'var(--card-bg, rgba(15, 23, 42, 0.88))',
            borderRadius: '10px',
            border: '1px solid var(--card-border, rgba(51, 65, 85, 0.7))',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* 1. MLP VISUALIZER */}
          {activeModuleId === 'mlp_playground' && (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              {/* Telemetry Status Bar Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '14px',
                  display: 'flex',
                  gap: '8px',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
              >
                <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(56, 189, 248, 0.4)', backdropFilter: 'blur(6px)', display: 'flex', gap: '6px', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#94a3b8' }}>Epoch:</span>
                  <span style={{ color: '#38bdf8', fontWeight: 800 }}>{mlpEpoch}</span>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(52, 211, 153, 0.4)', backdropFilter: 'blur(6px)', display: 'flex', gap: '6px', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#94a3b8' }}>Loss (BCE):</span>
                  <span style={{ color: '#34d399', fontWeight: 800 }}>{(0.68 * Math.exp(-0.04 * mlpEpoch) + 0.08).toFixed(4)}</span>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(245, 158, 11, 0.4)', backdropFilter: 'blur(6px)', display: 'flex', gap: '6px', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#94a3b8' }}>Accuracy:</span>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>{Math.min(99.4, 52.0 + mlpEpoch * 0.95).toFixed(1)}%</span>
                </div>
              </div>

              <svg viewBox="-340 -200 680 400" style={{ width: '100%', height: '100%', background: '#090d16' }}>
                {/* 2D Decision Landscape Split Background (Left Side) */}
                <g>
                  <rect x="-320" y="-180" width="220" height="360" rx="8" fill="rgba(15, 23, 42, 0.95)" stroke="rgba(51, 65, 85, 0.7)" strokeWidth="1.2" />
                  
                  {/* Contour Background Regions based on Preset */}
                  {mlpDatasetPreset === 'moons' && (
                    <>
                      <path d="M -320 -40 Q -220 -140 -100 -20 L -100 180 L -320 180 Z" fill="rgba(56, 189, 248, 0.22)" />
                      <path d="M -320 -180 L -100 -180 L -100 -20 Q -220 -140 -320 -40 Z" fill="rgba(52, 211, 153, 0.22)" />
                    </>
                  )}
                  {mlpDatasetPreset === 'circles' && (
                    <>
                      <circle cx="-210" cy="0" r="100" fill="rgba(56, 189, 248, 0.22)" />
                      <circle cx="-210" cy="0" r="45" fill="rgba(52, 211, 153, 0.35)" />
                    </>
                  )}
                  {mlpDatasetPreset === 'xor' && (
                    <>
                      <rect x="-320" y="-180" width="110" height="180" fill="rgba(56, 189, 248, 0.22)" />
                      <rect x="-210" y="0" width="110" height="180" fill="rgba(56, 189, 248, 0.22)" />
                      <rect x="-210" y="-180" width="110" height="180" fill="rgba(52, 211, 153, 0.22)" />
                      <rect x="-320" y="0" width="110" height="180" fill="rgba(52, 211, 153, 0.22)" />
                    </>
                  )}
                  {mlpDatasetPreset === 'linear' && (
                    <>
                      <polygon points="-320,-180 -100,-40 -100,180 -320,180" fill="rgba(56, 189, 248, 0.22)" />
                      <polygon points="-320,-180 -100,-40 -100,-180" fill="rgba(52, 211, 153, 0.22)" />
                    </>
                  )}

                  {/* Decision Boundary Line */}
                  <line x1="-320" y1="0" x2="-100" y2="0" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="-210" y1="-180" x2="-210" y2="180" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="0.8" strokeDasharray="3 3" />

                  {/* Data Points */}
                  {mlpPoints.map(p => (
                    <g key={p.id}>
                      <circle cx={-210 + p.x * 45} cy={-p.y * 45} r="6.5" fill={p.label === 1 ? '#34d399' : '#38bdf8'} stroke="#ffffff" strokeWidth="1.8" />
                      <circle cx={-210 + p.x * 45} cy={-p.y * 45} r="10" fill="none" stroke={p.label === 1 ? '#34d399' : '#38bdf8'} strokeWidth="0.8" strokeOpacity="0.4" />
                    </g>
                  ))}

                  <text x="-310" y="-160" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="bold">2D DECISION MANIFOLD</text>
                  <text x="-310" y="170" fill="#38bdf8" fontSize="8" fontFamily="monospace">● Class 0 (Cyan) | ● Class 1 (Emerald)</text>
                </g>

                {/* Neural Network Architecture DAG (Right Side) */}
                {/* Input Layer (2 nodes: X1, X2) */}
                {[-45, 45].map((y, idx) => (
                  <g key={`in-${idx}`}>
                    <circle cx="-30" cy={y} r="15" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.2" />
                    <text x="-30" y={y + 4} fill="#f8fafc" fontSize="10" textAnchor="middle" fontWeight="bold">X{idx + 1}</text>
                  </g>
                ))}

                {/* Hidden Layer 1 */}
                {Array.from({ length: mlpHidden1Count }).map((_, idx) => {
                  const y = -((mlpHidden1Count - 1) * 24) + idx * 48;
                  const h1X = mlpHidden2Count > 0 ? 80 : 130;
                  return (
                    <g key={`h1-${idx}`}>
                      {/* Synapse Lines from Inputs */}
                      {[-45, 45].map((iy, inIdx) => {
                        const isSelected = selectedSynapse?.from === `X${inIdx + 1}` && selectedSynapse?.to === `h1_${idx + 1}`;
                        const weightVal = (Math.sin(idx * 1.5 + inIdx) * mlpWeightInitScale);
                        return (
                          <g key={`w1-${inIdx}-${idx}`} style={{ cursor: 'pointer' }} onClick={() => setSelectedSynapse({ from: `X${inIdx + 1}`, to: `h1_${idx + 1}`, weight: weightVal })}>
                            <line
                              x1="-15"
                              y1={iy}
                              x2={h1X - 15}
                              y2={y}
                              stroke={isSelected ? '#c084fc' : weightVal > 0 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(239, 68, 68, 0.45)'}
                              strokeWidth={isSelected ? 3.5 : Math.max(1.2, Math.abs(weightVal) * 2)}
                            />
                            {/* Forward pulse bead */}
                            {isSimulating && (
                              <circle
                                cx={-15 + ((timeT * 1.5 + inIdx * 0.3 + idx * 0.2) % 1) * (h1X)}
                                cy={iy + ((timeT * 1.5 + inIdx * 0.3 + idx * 0.2) % 1) * (y - iy)}
                                r="2.5"
                                fill="#38bdf8"
                              />
                            )}
                          </g>
                        );
                      })}
                      <circle cx={h1X} cy={y} r="14" fill="#0f172a" stroke="#34d399" strokeWidth="2.2" />
                      <text x={h1X} y={y + 4} fill="#34d399" fontSize="10" textAnchor="middle" fontWeight="bold">h{idx + 1}</text>
                    </g>
                  );
                })}

                {/* Hidden Layer 2 (Optional) */}
                {mlpHidden2Count > 0 && Array.from({ length: mlpHidden2Count }).map((_, idx) => {
                  const y = -((mlpHidden2Count - 1) * 26) + idx * 52;
                  const h2X = 190;
                  return (
                    <g key={`h2-${idx}`}>
                      {/* Synapses from H1 */}
                      {Array.from({ length: mlpHidden1Count }).map((_, h1Idx) => {
                        const h1Y = -((mlpHidden1Count - 1) * 24) + h1Idx * 48;
                        const weightVal = Math.cos(idx + h1Idx) * mlpWeightInitScale;
                        return (
                          <line
                            key={`w2-${h1Idx}-${idx}`}
                            x1="94"
                            y1={h1Y}
                            x2={h2X - 15}
                            y2={y}
                            stroke="rgba(245, 158, 11, 0.4)"
                            strokeWidth={Math.max(1, Math.abs(weightVal) * 1.8)}
                          />
                        );
                      })}
                      <circle cx={h2X} cy={y} r="14" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.2" />
                      <text x={h2X} y={y + 4} fill="#f59e0b" fontSize="10" textAnchor="middle" fontWeight="bold">g{idx + 1}</text>
                    </g>
                  );
                })}

                {/* Output Node (Ŷ) */}
                <g>
                  <circle cx="290" cy="0" r="17" fill="#1e293b" stroke="#ec4899" strokeWidth="2.8" />
                  <text x="290" y="4" fill="#ec4899" fontSize="11" textAnchor="middle" fontWeight="bold">Ŷ</text>

                  {/* Synapses to Output Node */}
                  {(mlpHidden2Count > 0
                    ? Array.from({ length: mlpHidden2Count }).map((_, idx) => ({ y: -((mlpHidden2Count - 1) * 26) + idx * 52, x: 190 }))
                    : Array.from({ length: mlpHidden1Count }).map((_, idx) => ({ y: -((mlpHidden1Count - 1) * 24) + idx * 48, x: 130 }))
                  ).map((pos, idx) => (
                    <line
                      key={`wout-${idx}`}
                      x1={pos.x + 14}
                      y1={pos.y}
                      x2="273"
                      y2="0"
                      stroke="rgba(236, 72, 153, 0.55)"
                      strokeWidth="1.8"
                    />
                  ))}
                </g>
              </svg>
            </div>
          )}

          {/* 2. CNN VISUALIZER */}
          {activeModuleId === 'cnn_feature_maps' && (
            <div style={{ width: '100%', height: '100%', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#090d16', overflowY: 'auto' }}>
              {/* Top 4-Stage Pipeline Grid */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '14px' }}>
                {/* 1. Input Grid 6x6 with Clickable Drawing */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38bdf8' }}>1. Input Image I (6×6)</span>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>(Click cell to paint)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 26px)', gap: '2px', padding: '6px', background: '#1e293b', borderRadius: '6px', border: '1px solid #334155', position: 'relative' }}>
                    {userGrid6x6.map((row, r) =>
                      row.map((val, c) => {
                        const isInsideReceptive = r >= activeRow && r < activeRow + 3 && c >= activeCol && c < activeCol + 3;
                        return (
                          <div
                            key={`cell-${r}-${c}`}
                            onClick={() => togglePixelCell(r, c)}
                            style={{
                              width: '26px',
                              height: '26px',
                              background: `rgba(56, 189, 248, ${val})`,
                              borderRadius: '2px',
                              border: isInsideReceptive ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.55rem',
                              color: val > 0.5 ? '#000' : '#94a3b8',
                              fontWeight: 700
                            }}
                          >
                            {val.toFixed(1)}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div style={{ color: 'rgba(148, 163, 184, 0.4)', fontSize: '1.2rem', fontWeight: 800 }}>✱</div>

                {/* 2. Convolution Kernel 3x3 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#34d399' }}>2. Kernel K (3×3)</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 30px)', gap: '3px', padding: '6px', background: '#1e293b', borderRadius: '6px', border: '1px solid #334155' }}>
                    {activeKernel3x3.flat().map((val, idx) => (
                      <div key={`k-${idx}`} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.66rem', fontFamily: 'monospace', fontWeight: 800, color: '#f8fafc', background: val > 0 ? 'rgba(52, 211, 153, 0.4)' : val < 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(100, 116, 139, 0.3)', borderRadius: '2px' }}>
                        {typeof val === 'number' ? val.toFixed(1) : val}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ color: 'rgba(148, 163, 184, 0.4)', fontSize: '1.2rem', fontWeight: 800 }}>➔</div>

                {/* 3. Convolved Feature Map 4x4 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#ec4899' }}>3. Feature Map (4×4)</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 28px)', gap: '2px', padding: '6px', background: '#1e293b', borderRadius: '6px', border: '1px solid #334155' }}>
                    {convolved4x4.map((row, r) =>
                      row.map((val, c) => {
                        const isActiveCell = r === activeRow && c === activeCol;
                        return (
                          <div
                            key={`out-${r}-${c}`}
                            style={{
                              width: '28px',
                              height: '28px',
                              background: `rgba(236, 72, 153, ${val})`,
                              borderRadius: '2px',
                              border: isActiveCell ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.58rem',
                              color: '#fff',
                              fontWeight: 800,
                              fontFamily: 'monospace'
                            }}
                          >
                            {val.toFixed(1)}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div style={{ color: 'rgba(148, 163, 184, 0.4)', fontSize: '1.2rem', fontWeight: 800 }}>➔</div>

                {/* 4. Pooled Output 2x2 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f59e0b' }}>4. {cnnPoolingType === 'max' ? 'Max Pooled (2×2)' : 'Avg Pooled (2×2)'}</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 36px)', gap: '3px', padding: '6px', background: '#1e293b', borderRadius: '6px', border: '1px solid #334155' }}>
                    {pooled2x2.flat().map((val, idx) => (
                      <div
                        key={`pool-${idx}`}
                        style={{
                          width: '36px',
                          height: '36px',
                          background: `rgba(245, 158, 11, ${val})`,
                          borderRadius: '3px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.64rem',
                          color: '#fff',
                          fontWeight: 800,
                          fontFamily: 'monospace'
                        }}
                      >
                        {val.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Receptive Field Arithmetic Breakdown Card */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>
                    📐 Receptive Field Convolution Computation at ({activeRow}, {activeCol}):
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#ec4899', fontFamily: 'monospace', fontWeight: 800 }}>
                    Output = {convolved4x4[activeRow][activeCol].toFixed(3)}
                  </span>
                </div>
                <div style={{ fontSize: '0.64rem', color: '#94a3b8', fontFamily: 'monospace', lineHeight: '1.4' }}>
                  <span style={{ color: '#f59e0b' }}>Dot Product: </span>
                  {activeKernel3x3.map((krow, kr) =>
                    krow.map((kval, kc) => {
                      const ival = userGrid6x6[activeRow + kr][activeCol + kc];
                      return `(${ival.toFixed(1)} × ${typeof kval === 'number' ? kval.toFixed(1) : kval})`;
                    }).join(' + ')
                  ).join(' + ')} + Bias({cnnBias.toFixed(1)})
                </div>
                <div style={{ fontSize: '0.64rem', color: '#34d399', fontFamily: 'monospace' }}>
                  <span>Formula: </span> O[r, c] = ReLU( ∑_{'{'}i,j{'}'} I[r+i, c+j] · K[i, j] + b )
                </div>
              </div>
            </div>
          )}

          {/* 3. RNN / LSTM UNROLL VISUALIZER */}
          {activeModuleId === 'rnn_lstm_unroll' && (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              {/* Telemetry Status Bar Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '14px',
                  display: 'flex',
                  gap: '8px',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
              >
                <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(56, 189, 248, 0.4)', backdropFilter: 'blur(6px)', display: 'flex', gap: '6px', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#94a3b8' }}>Selected:</span>
                  <span style={{ color: '#38bdf8', fontWeight: 800 }}>t = {selectedRnnStep}</span>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.85)', border: `1px solid ${rnnGradientScale < 1 ? '#38bdf8' : '#ef4444'}`, backdropFilter: 'blur(6px)', display: 'flex', gap: '6px', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#94a3b8' }}>BPTT Mode:</span>
                  <span style={{ color: rnnGradientScale < 1 ? '#38bdf8' : '#ef4444', fontWeight: 800 }}>
                    {rnnGradientScale < 0.95 ? 'Vanishing 📉' : rnnGradientScale > 1.05 ? 'Exploding 🔥' : 'Stable ⚖️'}
                  </span>
                </div>
              </div>

              <svg viewBox="-340 -200 680 400" style={{ width: '100%', height: '100%', background: '#090d16' }}>
                <defs>
                  <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                  </marker>
                </defs>

                {/* Top Cell State Highway for LSTM (Constant Error Carousel) */}
                {rnnCellType === 'lstm' && (
                  <g>
                    <line x1="-280" y1="-50" x2="280" y2="-50" stroke="rgba(52, 211, 153, 0.35)" strokeWidth="3.5" strokeDasharray="4 2" />
                    <text x="-310" y="-46" fill="#34d399" fontSize="9" fontWeight="bold" fontFamily="monospace">Cell Cₜ</text>
                  </g>
                )}

                {/* Main Hidden State Highway */}
                <line x1="-280" y1="20" x2="280" y2="20" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="2.5" />
                <text x="-310" y="24" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">Hidden hₜ</text>

                {/* Unrolled Time Step Cells */}
                {Array.from({ length: rnnSeqLength }).map((_, t) => {
                  const x = -220 + t * (440 / (rnnSeqLength - 1 || 1));
                  const isSelected = selectedRnnStep === t + 1;
                  const gradAlpha = Math.max(0.08, Math.min(1.0, Math.pow(rnnGradientScale, rnnSeqLength - 1 - t)));
                  const gradThickness = rnnGradientScale > 1.0 ? Math.min(8, 2.5 * Math.pow(rnnGradientScale, t)) : 2.5;

                  return (
                    <g key={`cell-${t}`} style={{ cursor: 'pointer' }} onClick={() => setSelectedRnnStep(t + 1)}>
                      {/* Cell Container Box */}
                      <rect
                        x={x - 30}
                        y="-70"
                        width="60"
                        height="120"
                        rx="8"
                        fill={isSelected ? 'rgba(56, 189, 248, 0.15)' : '#1e293b'}
                        stroke={isSelected ? '#38bdf8' : 'rgba(51, 65, 85, 0.8)'}
                        strokeWidth={isSelected ? 2.5 : 1.2}
                      />
                      
                      <text x={x} y="-48" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
                        {rnnCellType === 'lstm' ? 'LSTM' : rnnCellType === 'gru' ? 'GRU' : 'RNN'}
                      </text>
                      <text x={x} y="-32" fill="#34d399" fontSize="9" fontWeight="bold" textAnchor="middle">t = {t + 1}</text>

                      {/* Internal Gating Circles for LSTM */}
                      {rnnCellType === 'lstm' && (
                        <g>
                          {/* Forget Gate */}
                          <circle cx={x - 14} cy="-10" r="7" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="1" />
                          <text x={x - 14} y="-7" fill="#ef4444" fontSize="7" fontWeight="bold" textAnchor="middle">f</text>
                          {/* Input Gate */}
                          <circle cx={x} cy="-10" r="7" fill="rgba(52, 211, 153, 0.3)" stroke="#34d399" strokeWidth="1" />
                          <text x={x} y="-7" fill="#34d399" fontSize="7" fontWeight="bold" textAnchor="middle">i</text>
                          {/* Output Gate */}
                          <circle cx={x + 14} cy="-10" r="7" fill="rgba(192, 132, 252, 0.3)" stroke="#c084fc" strokeWidth="1" />
                          <text x={x + 14} y="-7" fill="#c084fc" fontSize="7" fontWeight="bold" textAnchor="middle">o</text>
                          {/* Cell State Multiplier */}
                          <circle cx={x} cy="25" r="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                          <text x={x} y="28" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">tanh</text>
                        </g>
                      )}

                      {/* Input Vector X_t (Bottom) */}
                      <line x1={x} y1="120" x2={x} y2="50" stroke="#f59e0b" strokeWidth="2" />
                      <circle cx={x} cy="120" r="12" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                      <text x={x} y="124" fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle">X{t + 1}</text>

                      {/* Output Vector h_t (Top) */}
                      <line x1={x} y1="-70" x2={x} y2="-120" stroke="#ec4899" strokeWidth="2" />
                      <circle cx={x} cy="-120" r="12" fill="#1e293b" stroke="#ec4899" strokeWidth="2" />
                      <text x={x} y="-116" fill="#ec4899" fontSize="9" fontWeight="bold" textAnchor="middle">h{t + 1}</text>

                      {/* BPTT Gradient Backprop Flow Arrow */}
                      {t > 0 && (
                        <g>
                          <path
                            d={`M ${x - 30} 80 Q ${(x - 30 + (x - 220 + (t - 1) * (440 / (rnnSeqLength - 1 || 1)) + 30)) / 2} 95 ${x - 220 + (t - 1) * (440 / (rnnSeqLength - 1 || 1)) + 30} 80`}
                            fill="none"
                            stroke={`rgba(239, 68, 68, ${gradAlpha})`}
                            strokeWidth={gradThickness}
                          />
                        </g>
                      )}

                      {/* Live Data Pulse Animation along time chain */}
                      {isSimulating && t < rnnSeqLength - 1 && (
                        <circle
                          cx={x + 30 + ((timeT * 1.5 + t * 0.4) % 1) * ((440 / (rnnSeqLength - 1 || 1)) - 60)}
                          cy="20"
                          r="3"
                          fill="#38bdf8"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Bottom BPTT Legend */}
                <text x="-310" y="165" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  ◄ BACKPROPAGATION THROUGH TIME (BPTT): ∂L/∂h_t = (∂L/∂h_T) · ∏ W^T
                </text>
              </svg>

              {/* Step Inspector Card */}
              <div
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.66rem',
                  fontFamily: 'monospace'
                }}
              >
                <div>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>X_{selectedRnnStep}: </span>
                  <span style={{ color: '#fff' }}>[{Math.sin(selectedRnnStep * 1.2).toFixed(2)}, {Math.cos(selectedRnnStep * 0.9).toFixed(2)}]</span>
                </div>
                {rnnCellType === 'lstm' && (
                  <div>
                    <span style={{ color: '#ef4444', fontWeight: 800 }}>f_{selectedRnnStep}: </span>
                    <span style={{ color: '#fff' }}>{(1 / (1 + Math.exp(-rnnForgetBias))).toFixed(3)}</span>
                  </div>
                )}
                <div>
                  <span style={{ color: '#ec4899', fontWeight: 800 }}>h_{selectedRnnStep}: </span>
                  <span style={{ color: '#fff' }}>[{Math.tanh(selectedRnnStep * 0.5).toFixed(2)}, {Math.tanh(-selectedRnnStep * 0.3).toFixed(2)}]</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. TRANSFORMER ATTENTION VISUALIZER */}
          {activeModuleId === 'transformer_attention' && (
            <div style={{ width: '100%', height: '100%', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#090d16', overflowY: 'auto' }}>
              {/* Top Attention Arc Diagram */}
              <div style={{ width: '100%', height: '220px', position: 'relative', background: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b', overflow: 'hidden' }}>
                {/* HUD Overlay */}
                <div style={{ position: 'absolute', top: '8px', right: '12px', display: 'flex', gap: '6px', fontSize: '0.66rem', fontFamily: 'monospace', zIndex: 10 }}>
                  <div style={{ padding: '3px 8px', borderRadius: '4px', background: '#1e293b', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.4)' }}>
                    Head {activeHeadIdx + 1}
                  </div>
                  <div style={{ padding: '3px 8px', borderRadius: '4px', background: '#1e293b', color: isCausalMasked ? '#f59e0b' : '#34d399', border: '1px solid #334155' }}>
                    {isCausalMasked ? 'Causal (GPT)' : 'Bidirectional (BERT)'}
                  </div>
                </div>

                <svg viewBox="-320 -130 640 220" style={{ width: '100%', height: '100%' }}>
                  {/* Attention Arcs */}
                  {activeTokens.map((_, idx) => {
                    const N = activeTokens.length;
                    const spacing = Math.min(85, 540 / (N || 1));
                    const startX = -((N - 1) * spacing) / 2;
                    const queryX = startX + selectedTokenIdx * spacing;
                    const targetX = startX + idx * spacing;
                    const weight = attentionMatrix[selectedTokenIdx >= N ? 0 : selectedTokenIdx]?.[idx] || 0;
                    if (weight < 0.01) return null;

                    const arcHeight = -25 - Math.abs(selectedTokenIdx - idx) * 22;
                    return (
                      <g key={`arc-${idx}`}>
                        <path
                          d={`M ${queryX} 35 Q ${(queryX + targetX) / 2} ${arcHeight} ${targetX} 35`}
                          fill="none"
                          stroke={activeHeadIdx === 0 ? 'rgba(56, 189, 248, 0.7)' : activeHeadIdx === 1 ? 'rgba(168, 85, 247, 0.7)' : 'rgba(52, 211, 153, 0.7)'}
                          strokeWidth={Math.max(1.2, weight * 7)}
                        />
                        {/* Live flow bead */}
                        {isSimulating && (
                          <circle
                            cx={(queryX + targetX) / 2 + Math.sin(timeT * 3 + idx) * 15}
                            cy={arcHeight + 10}
                            r="2.5"
                            fill="#fff"
                          />
                        )}
                      </g>
                    );
                  })}

                  {/* Token Nodes (Bottom) */}
                  {activeTokens.map((tok, idx) => {
                    const N = activeTokens.length;
                    const spacing = Math.min(85, 540 / (N || 1));
                    const startX = -((N - 1) * spacing) / 2;
                    const x = startX + idx * spacing;
                    const isSelected = idx === (selectedTokenIdx >= N ? 0 : selectedTokenIdx);
                    const weight = attentionMatrix[selectedTokenIdx >= N ? 0 : selectedTokenIdx]?.[idx] || 0;

                    return (
                      <g key={`tok-${idx}`} style={{ cursor: 'pointer' }} onClick={() => setSelectedTokenIdx(idx)}>
                        <rect
                          x={x - 34}
                          y="35"
                          width="68"
                          height="30"
                          rx="6"
                          fill={isSelected ? '#38bdf8' : '#1e293b'}
                          stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.1)'}
                          strokeWidth={isSelected ? 2 : 1}
                        />
                        <text
                          x={x}
                          y="54"
                          fill={isSelected ? '#000' : '#f8fafc'}
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {tok}
                        </text>
                        {/* Attention score badge */}
                        <text
                          x={x}
                          y="78"
                          fill={isSelected ? '#38bdf8' : '#94a3b8'}
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {(weight * 100).toFixed(0)}%
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Bottom N x N Attention Heatmap & Mathematical Formula Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px', alignItems: 'center' }}>
                {/* Attention Matrix Grid */}
                <div style={{ padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#a855f7' }}>Attention Heatmap (Softmax α_ij):</span>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeTokens.length}, 26px)`, gap: '2px' }}>
                    {attentionMatrix.map((row, r) =>
                      row.map((val, c) => {
                        const isSelectedRow = r === (selectedTokenIdx >= activeTokens.length ? 0 : selectedTokenIdx);
                        return (
                          <div
                            key={`attn-${r}-${c}`}
                            onClick={() => setSelectedTokenIdx(r)}
                            title={`Query: "${activeTokens[r]}" -> Key: "${activeTokens[c]}" = ${(val * 100).toFixed(1)}%`}
                            style={{
                              width: '26px',
                              height: '26px',
                              background: `rgba(168, 85, 247, ${val * 1.1})`,
                              borderRadius: '2px',
                              border: isSelectedRow ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.52rem',
                              color: '#fff',
                              fontWeight: 800,
                              fontFamily: 'monospace',
                              cursor: 'pointer'
                            }}
                          >
                            {(val * 100).toFixed(0)}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Mathematical Equation & Scaled Dot Product Box */}
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>
                      📐 Scaled Dot-Product Attention Equation:
                    </span>
                    <span style={{ fontSize: '0.66rem', color: '#34d399', fontFamily: 'monospace', fontWeight: 800 }}>
                      d_k = 64 | √d_k = {attentionTempScale.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#c084fc', fontFamily: 'monospace' }}>
                    Attention(Q, K, V) = softmax( (Q · K^T) / √d_k ) · V
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#94a3b8', lineHeight: '1.4' }}>
                    Each attention head projects input embeddings into separate Query, Key, and Value subspaces, capturing orthogonal syntactic, positional, and semantic dependencies simultaneously.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. 3D LATENT SPACE VISUALIZER */}
          {activeModuleId === 'latent_space_embeddings' && (
            <div
              style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#090d16' }}
              onMouseDown={(e) => {
                setIsDraggingLatent(true);
                dragLatentStartRef.current = { x: e.clientX, y: e.clientY, rx: latentRotX, ry: latentRotY };
              }}
              onMouseMove={(e) => {
                if (!isDraggingLatent) return;
                const dx = e.clientX - dragLatentStartRef.current.x;
                const dy = e.clientY - dragLatentStartRef.current.y;
                setLatentRotY(dragLatentStartRef.current.ry + dx * 0.5);
                setLatentRotX(Math.max(-80, Math.min(80, dragLatentStartRef.current.rx - dy * 0.5)));
              }}
              onMouseUp={() => setIsDraggingLatent(false)}
              onMouseLeave={() => setIsDraggingLatent(false)}
            >
              {/* Top HUD Telemetry */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '14px',
                  display: 'flex',
                  gap: '8px',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
              >
                <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(56, 189, 248, 0.4)', backdropFilter: 'blur(6px)', display: 'flex', gap: '6px', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#94a3b8' }}>3D Orbit:</span>
                  <span style={{ color: '#38bdf8', fontWeight: 800 }}>Pitch {latentRotX.toFixed(0)}° | Yaw {latentRotY.toFixed(0)}°</span>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(52, 211, 153, 0.4)', backdropFilter: 'blur(6px)', display: 'flex', gap: '6px', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#94a3b8' }}>Points:</span>
                  <span style={{ color: '#34d399', fontWeight: 800 }}>{embeddingClusters.length}</span>
                </div>
              </div>

              {/* Bottom Instructions / Hint */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '14px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(6px)',
                  fontSize: '0.64rem',
                  color: '#94a3b8',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ color: '#38bdf8', fontWeight: 800 }}>🖱️ Click & Drag:</span> Rotate 3D space |
                <span style={{ color: '#f59e0b', fontWeight: 800 }}>
                  {latentDatasetPreset === 'word2vec_analogies'
                    ? '👑 King - 👨 Man + 👩 Woman ≈ 👸 Queen'
                    : latentDatasetPreset === 'mnist_digits'
                    ? 'Clusters separated by semantic class'
                    : 'Nonlinear manifold projected onto 3D'}
                </span>
              </div>

              <canvas
                ref={canvasLatentRef}
                width={700}
                height={480}
                style={{ width: '100%', height: '100%', cursor: isDraggingLatent ? 'grabbing' : 'grab' }}
              />
            </div>
          )}

          {/* 6. TRAINING DYNAMICS VISUALIZER */}
          {activeModuleId === 'training_dynamics' && (
            <div style={{ width: '100%', height: '100%', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#090d16', overflowY: 'auto' }}>
              {/* Top HUD Telemetry Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                  <div style={{ padding: '4px 10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#38bdf8' }}>
                    Optimizer: <strong style={{ color: '#fff' }}>{selectedOptimizer.toUpperCase()}</strong>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#34d399' }}>
                    Scheduler: <strong style={{ color: '#fff' }}>{lrScheduler.toUpperCase()}</strong>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#f59e0b' }}>
                    Terrain: <strong style={{ color: '#fff' }}>{lossLandscapePreset.toUpperCase()}</strong>
                  </div>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: '6px', background: '#0f172a', border: '1px solid rgba(236, 72, 153, 0.4)', color: '#ec4899', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                  Generalization Gap: <strong>0.13 BCE</strong>
                </div>
              </div>

              {/* Dual Panel Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', flex: 1, minHeight: '260px' }}>
                {/* Panel A: 2D Loss Landscape Contour Trajectory */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b', padding: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399' }}>2D Contour Landscape & Trajectory:</span>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontFamily: 'monospace' }}>θ₀ → θ_min</span>
                  </div>

                  <svg viewBox="-120 -120 240 240" style={{ width: '100%', height: '100%', minHeight: '190px' }}>
                    {/* Concentric Loss Contours */}
                    {lossLandscapePreset === 'ravine' ? (
                      [20, 40, 60, 80, 100].map((r, idx) => (
                        <ellipse key={`c-${idx}`} cx="0" cy="0" rx={r * 1.1} ry={r * 0.45} fill="none" stroke="rgba(51, 65, 85, 0.5)" strokeWidth="1" strokeDasharray="3 3" />
                      ))
                    ) : lossLandscapePreset === 'saddle' ? (
                      [-80, -40, 0, 40, 80].map((y, idx) => (
                        <path key={`s-${idx}`} d={`M -110 ${y} Q 0 0 110 ${-y}`} fill="none" stroke="rgba(51, 65, 85, 0.45)" strokeWidth="1" strokeDasharray="3 3" />
                      ))
                    ) : lossLandscapePreset === 'convex_bowl' ? (
                      [25, 45, 65, 85, 105].map((r, idx) => (
                        <circle key={`b-${idx}`} cx="0" cy="0" r={r} fill="none" stroke="rgba(51, 65, 85, 0.5)" strokeWidth="1" strokeDasharray="3 3" />
                      ))
                    ) : (
                      [15, 30, 45, 60, 75, 90, 105].map((r, idx) => (
                        <circle key={`r-${idx}`} cx="0" cy="0" r={r} fill="none" stroke="rgba(51, 65, 85, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
                      ))
                    )}

                    {/* Global Minimum Star */}
                    <circle cx="0" cy="0" r="4" fill="#34d399" />
                    <text x="0" y="-8" fill="#34d399" fontSize="8" fontWeight="bold" textAnchor="middle">θ* (Global Min)</text>

                    {/* Optimizer Trajectory Line */}
                    <path
                      d={optimizerTrajectory.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x * 40} ${-p.y * 40}`).join(' ')}
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="2.4"
                    />

                    {/* Trajectory Step Markers */}
                    {optimizerTrajectory.filter((_, idx) => idx % 5 === 0).map((p, idx) => (
                      <circle key={`step-${idx}`} cx={p.x * 40} cy={-p.y * 40} r="2.5" fill="#38bdf8" />
                    ))}

                    {/* Current Position Pulse */}
                    {optimizerTrajectory.length > 0 && (
                      <circle
                        cx={optimizerTrajectory[optimizerTrajectory.length - 1].x * 40}
                        cy={-optimizerTrajectory[optimizerTrajectory.length - 1].y * 40}
                        r="5"
                        fill="#ec4899"
                        stroke="#fff"
                        strokeWidth="1.5"
                      />
                    )}
                  </svg>
                </div>

                {/* Panel B: Epoch Loss & LR Schedule Curves */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b', padding: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>Loss Convergence & LR Schedule:</span>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.60rem', fontFamily: 'monospace' }}>
                      <span style={{ color: '#38bdf8' }}>━ Train</span>
                      <span style={{ color: '#f59e0b' }}>┄ Val</span>
                      <span style={{ color: '#c084fc' }}>─ η(t)</span>
                    </div>
                  </div>

                  <svg viewBox="-300 -120 600 240" style={{ width: '100%', height: '100%', minHeight: '190px' }}>
                    {/* Axes */}
                    <line x1="-260" y1="80" x2="260" y2="80" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1.5" />
                    <line x1="-260" y1="-100" x2="-260" y2="80" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1.5" />
                    
                    {/* Train Loss Curve */}
                    <path
                      d={(() => {
                        let p = 'M -260 -70';
                        for (let ep = 1; ep <= 50; ep++) {
                          const x = -260 + ep * 10;
                          const rate = selectedOptimizer === 'adam' ? 0.08 : selectedOptimizer === 'momentum' ? 0.06 : 0.035;
                          const loss = 2.4 * Math.exp(-rate * ep) + 0.15 + (Math.sin(ep * 2) * (selectedOptimizer === 'sgd' ? 0.08 : 0.03));
                          const y = 80 - loss * 55;
                          p += ` L ${x} ${y}`;
                        }
                        return p;
                      })()}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.8"
                    />

                    {/* Val Loss Curve */}
                    <path
                      d={(() => {
                        let p = 'M -260 -50';
                        for (let ep = 1; ep <= 50; ep++) {
                          const x = -260 + ep * 10;
                          const rate = selectedOptimizer === 'adam' ? 0.07 : selectedOptimizer === 'momentum' ? 0.05 : 0.03;
                          const loss = 2.2 * Math.exp(-rate * ep) + 0.28 + (Math.sin(ep * 1.5) * 0.06);
                          const y = 80 - loss * 55;
                          p += ` L ${x} ${y}`;
                        }
                        return p;
                      })()}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.2"
                      strokeDasharray="4 2"
                    />

                    {/* LR Schedule Curve (Purple) */}
                    <path
                      d={(() => {
                        let p = 'M -260 70';
                        for (let ep = 1; ep <= 50; ep++) {
                          const x = -260 + ep * 10;
                          let lrVal = initialLr;
                          if (lrScheduler === 'cosine') {
                            lrVal = initialLr * 0.5 * (1 + Math.cos((ep / 50) * Math.PI));
                          } else if (lrScheduler === 'steplr') {
                            lrVal = initialLr * Math.pow(0.5, Math.floor(ep / 15));
                          } else if (lrScheduler === 'onecycle') {
                            lrVal = ep < 15 ? (initialLr * ep) / 15 : initialLr * (1 - (ep - 15) / 35);
                          } else {
                            lrVal = initialLr * Math.exp(-0.04 * ep);
                          }
                          const y = 80 - (lrVal / initialLr) * 45;
                          p += ` L ${x} ${y}`;
                        }
                        return p;
                      })()}
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="1.8"
                    />

                    <text x="240" y="100" fill="#94a3b8" fontSize="9" textAnchor="end">Epochs (1..50)</text>
                    <text x="-270" y="-90" fill="#94a3b8" fontSize="9" textAnchor="end">Loss</text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* 7. VAE LATENT MANIFOLD VISUALIZER */}
          {activeModuleId === 'vae_generative' && (
            <div style={{ width: '100%', height: '100%', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#090d16', overflowY: 'auto' }}>
              {/* Top HUD Telemetry Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                  <div style={{ padding: '4px 10px', borderRadius: '6px', background: '#0f172a', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}>
                    Latent: <strong>z₁ = {latentCursorZ1.toFixed(2)}, z₂ = {latentCursorZ2.toFixed(2)}</strong>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: '6px', background: '#0f172a', border: '1px solid rgba(236, 72, 153, 0.4)', color: '#ec4899' }}>
                    KL Loss: <strong>{(0.5 * (latentCursorZ1 * latentCursorZ1 + latentCursorZ2 * latentCursorZ2)).toFixed(3)}</strong>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: '6px', background: '#0f172a', border: '1px solid rgba(52, 211, 153, 0.4)', color: '#34d399' }}>
                    Recon Loss: <strong>{(0.12 * Math.exp(Math.abs(latentCursorZ1) * 0.2)).toFixed(3)} BCE</strong>
                  </div>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: '6px', background: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#f59e0b', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                  Total ELBO: <strong>{(0.12 + vaeBetaLoss * 0.5 * (latentCursorZ1 * latentCursorZ1 + latentCursorZ2 * latentCursorZ2)).toFixed(3)}</strong>
                </div>
              </div>

              {/* Dual Panel Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', flex: 1, minHeight: '260px' }}>
                {/* Panel A: 2D Continuous Latent Manifold Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b', padding: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ec4899' }}>2D Latent Manifold (z₁, z₂ ∈ [-2.5, 2.5]):</span>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontFamily: 'monospace' }}>Prior p(z) ~ N(0, I)</span>
                  </div>

                  <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '210px' }}>
                    <svg viewBox="-140 -140 280 280" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                      {/* Axes */}
                      <line x1="-120" y1="0" x2="120" y2="0" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" />
                      <line x1="0" y1="-120" x2="0" y2="120" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" />

                      {/* Gaussian Prior Contour Rings */}
                      {[0.5, 1.0, 1.5, 2.0].map((r, idx) => (
                        <circle key={`pr-${idx}`} cx="0" cy="0" r={r * 45} fill="none" stroke="rgba(168, 85, 247, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
                      ))}

                      {/* 7x7 Latent Sample Tiles */}
                      {[-2, -1.33, -0.66, 0, 0.66, 1.33, 2].map((gz1, rIdx) =>
                        [-2, -1.33, -0.66, 0, 0.66, 1.33, 2].map((gz2, cIdx) => (
                          <circle
                            key={`tile-${rIdx}-${cIdx}`}
                            cx={gz1 * 45}
                            cy={-gz2 * 45}
                            r="3"
                            fill="rgba(56, 189, 248, 0.4)"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setLatentCursorZ1(gz1);
                              setLatentCursorZ2(gz2);
                            }}
                          />
                        ))
                      )}

                      {/* Active Cursor Crosshairs */}
                      <line x1={latentCursorZ1 * 45} y1="-130" x2={latentCursorZ1 * 45} y2="130" stroke="rgba(236, 72, 153, 0.5)" strokeWidth="1.2" strokeDasharray="2 2" />
                      <line x1="-130" y1={-latentCursorZ2 * 45} x2="130" y2={-latentCursorZ2 * 45} stroke="rgba(236, 72, 153, 0.5)" strokeWidth="1.2" strokeDasharray="2 2" />

                      {/* Active Latent Cursor Puck */}
                      <circle
                        cx={latentCursorZ1 * 45}
                        cy={-latentCursorZ2 * 45}
                        r="7"
                        fill="#ec4899"
                        stroke="#ffffff"
                        strokeWidth="2"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(236, 72, 153, 0.8))' }}
                      />

                      <text x={latentCursorZ1 * 45 + 10} y={-latentCursorZ2 * 45 - 6} fill="#ec4899" fontSize="8" fontWeight="bold" fontFamily="monospace">
                        z({latentCursorZ1.toFixed(1)}, {latentCursorZ2.toFixed(1)})
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Panel B: High-Res Decoded Output Matrix */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>Decoder Reconstruction p_θ(x | z):</span>
                    <span style={{ fontSize: '0.62rem', color: '#34d399', fontFamily: 'monospace' }}>10×10 Pixels</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px', background: '#020617', padding: '8px', borderRadius: '8px', border: '1px solid #334155' }}>
                      {decodedVaePixels.map((row, r) =>
                        row.map((val, c) => (
                          <div
                            key={`px-${r}-${c}`}
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '2px',
                              background: `rgba(56, 189, 248, ${val.toFixed(2)})`,
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              transition: 'background 0.15s ease'
                            }}
                            title={`Pixel (${r},${c}): ${val.toFixed(2)}`}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.60rem', color: '#94a3b8', lineHeight: '1.4', background: '#090d16', padding: '6px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                    <strong style={{ color: '#38bdf8' }}>Generative Morphing:</strong> Moving the latent coordinate (z₁, z₂) navigates the learned manifold. β-VAE forces independent semantic axes.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. NETRON DAG VISUALIZER */}
          {activeModuleId === 'netron_graph' && (
            <div style={{ width: '100%', height: '100%', padding: '16px', overflowY: 'auto', background: '#090d16', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Top Architecture Summary Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#a855f7' }}>🧬 Computational Graph: {architectureModels.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.66rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#94a3b8' }}>Batch Size: <strong style={{ color: '#38bdf8' }}>B = {netronBatchSize}</strong></span>
                  <span style={{ color: '#94a3b8' }}>|</span>
                  <span style={{ color: '#94a3b8' }}>Layers: <strong style={{ color: '#34d399' }}>{architectureModels.layers.length}</strong></span>
                </div>
              </div>

              {/* Computational Graph DAG Flow */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', flex: 1 }}>
                {architectureModels.layers.map((layer, idx) => {
                  const isSelected = selectedLayerId === layer.id;
                  return (
                    <React.Fragment key={`layer-${layer.id}`}>
                      <div
                        onClick={() => setSelectedLayerId(layer.id)}
                        style={{
                          width: '100%',
                          maxWidth: '520px',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(30, 41, 59, 0.95)' : '#0f172a',
                          border: isSelected ? `2px solid ${layer.color}` : `1px solid ${layer.color}50`,
                          boxShadow: isSelected ? `0 0 12px ${layer.color}40` : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: layer.color }}>{layer.name}</span>
                            {layer.hasSkip && (
                              <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.25)', border: '1px solid #a855f7', color: '#c084fc', fontSize: '0.58rem', fontWeight: 800 }}>
                                ↷ Skip Shortcut
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                            Op: <span style={{ color: '#f8fafc' }}>{layer.op}</span>
                          </div>
                          <div style={{ fontSize: '0.62rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                            {layer.inShape} ➔ {layer.outShape}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <div style={{ fontSize: '0.64rem', color: '#34d399', fontFamily: 'monospace', fontWeight: 700 }}>
                            {layer.weights}
                          </div>
                          <div style={{ fontSize: '0.60rem', color: '#f59e0b', fontFamily: 'monospace' }}>
                            {layer.flops}
                          </div>
                        </div>
                      </div>

                      {/* Directed Arrow / Skip Bridge */}
                      {idx < architectureModels.layers.length - 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                          <div style={{ width: '2px', height: '14px', background: 'rgba(148, 163, 184, 0.4)' }} />
                          <div style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '5px solid rgba(148, 163, 184, 0.6)' }} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Floating Selected Operator Inspector Card */}
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#020617', border: `1px solid ${currentSelectedLayer.color}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: currentSelectedLayer.color }}>
                    🔍 Selected Operator: {currentSelectedLayer.name}
                  </span>
                  <span style={{ fontSize: '0.64rem', color: '#34d399', fontFamily: 'monospace', fontWeight: 800 }}>
                    {currentSelectedLayer.weights} | {currentSelectedLayer.flops}
                  </span>
                </div>
                <div style={{ fontSize: '0.64rem', color: '#f59e0b', fontFamily: 'monospace' }}>
                  Forward Transform: {currentSelectedLayer.inShape} ➔ {currentSelectedLayer.outShape}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontFamily: 'monospace', background: '#0f172a', padding: '6px', borderRadius: '4px' }}>
                  📐 Operator Formula: <strong style={{ color: '#fff' }}>{currentSelectedLayer.math}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
