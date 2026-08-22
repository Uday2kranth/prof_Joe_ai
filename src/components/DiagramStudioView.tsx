import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Layers, Download, RefreshCw, Code2, Sparkles, Image as ImageIcon,
  FileImage, ChevronDown, Bot, Send, Copy, Check, ChevronUp, Search
} from 'lucide-react';
import { fetchKrokiSvg } from '../services/krokiService';
import { generateDiagramWithAi } from '../services/diagramAiService';
import { PROVIDERS } from '../constants';
import type { UserKeys, UserCustomModels } from '../types';

export type DiagramCategory =
  | 'all'
  | 'math'
  | 'statistics'
  | 'machine_learning'
  | 'deep_learning'
  | 'genai_agents'
  | 'software_arch'
  | 'database'
  | 'networking'
  | 'business_dashboards';

export interface CategoryItem {
  id: DiagramCategory;
  name: string;
  icon: string;
  badge: string;
}

export interface DiagramTemplate {
  id: string;
  name: string;
  category: DiagramCategory;
  engine: string;
  code: string;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'all', name: 'All Categories', icon: '✨', badge: 'All' },
  { id: 'math', name: 'Mathematics & Calculus', icon: '📐', badge: 'Math' },
  { id: 'statistics', name: 'Statistical Inference', icon: '📊', badge: 'Stats' },
  { id: 'machine_learning', name: 'Classical Machine Learning', icon: '🤖', badge: 'ML' },
  { id: 'deep_learning', name: 'Deep Learning & Vision', icon: '🧠', badge: 'DL' },
  { id: 'genai_agents', name: 'GenAI, LLMs & Agents', icon: '🔮', badge: 'AI' },
  { id: 'software_arch', name: 'Software Architecture & UML', icon: '🏗️', badge: 'UML' },
  { id: 'database', name: 'Database & Schema', icon: '🗄️', badge: 'DB' },
  { id: 'networking', name: 'Networks & Protocols', icon: '🌐', badge: 'Net' },
  { id: 'business_dashboards', name: 'Business & Dashboards', icon: '📈', badge: 'BI' }
];

export const TEMPLATES: DiagramTemplate[] = [
  // ─── 1. MATHEMATICS & CALCULUS ──────────────────────────────────────────
  {
    id: 'functionplot-activations',
    name: 'Neural Activations (Sigmoid, ReLU, Tanh)',
    category: 'math',
    engine: 'functionplot',
    code: `{
  "title": "Neural Activation Functions Comparison",
  "domain": [-5, 5],
  "xLabel": "Input Activation x",
  "yLabel": "Output f(x)",
  "functions": [
    {"fn": "sigmoid(x)", "color": "#38bdf8", "label": "Sigmoid σ(x)"},
    {"fn": "relu(x)", "color": "#10b981", "label": "ReLU max(0,x)"},
    {"fn": "tanh(x)", "color": "#f43f5e", "label": "Tanh(x)", "dashed": true}
  ]
}`
  },
  {
    id: 'functionplot-convex-loss',
    name: 'Convex Loss Landscape & Gradient Descent',
    category: 'math',
    engine: 'functionplot',
    code: `{
  "title": "Convex Loss Curve f(x) = x^2 - 4x + 6",
  "domain": [-1, 5],
  "xLabel": "Parameter θ (Weight)",
  "yLabel": "Cost J(θ)",
  "functions": [
    {"fn": "x^2 - 4*x + 6", "color": "#38bdf8", "label": "Cost Function J(θ)"},
    {"fn": "4*x - 10", "color": "#fbbf24", "label": "Tangent Slope at θ=4", "dashed": true}
  ],
  "points": [
    {"x": 2, "y": 2, "label": "Global Minimum (θ=2, J=2)"},
    {"x": 4, "y": 6, "label": "Initial Step (θ=4)"}
  ]
}`
  },
  {
    id: 'functionplot-polynomial',
    name: 'Cubic Polynomial & Extrema (f(x) = x^3 - 3x)',
    category: 'math',
    engine: 'functionplot',
    code: `{
  "title": "Cubic Curve f(x) = x^3 - 3x + 1",
  "domain": [-3, 3],
  "xLabel": "x",
  "yLabel": "f(x)",
  "fn": "x^3 - 3*x + 1",
  "points": [
    {"x": -1, "y": 3, "label": "Local Max (-1, 3)"},
    {"x": 1, "y": -1, "label": "Local Min (1, -1)"}
  ]
}`
  },
  {
    id: 'functionplot-fourier-harmonic',
    name: 'Fourier Harmonic Wave (sin(x) + 0.5*sin(3x))',
    category: 'math',
    engine: 'functionplot',
    code: `{
  "title": "Composite Harmonic Wave Synthesis",
  "domain": [-6.28, 6.28],
  "xLabel": "Time t (radians)",
  "yLabel": "Amplitude A(t)",
  "functions": [
    {"fn": "sin(x) + 0.5*sin(3*x)", "color": "#a855f7", "label": "Composite Wave"},
    {"fn": "sin(x)", "color": "#38bdf8", "label": "Fundamental Harmonic", "dashed": true}
  ]
}`
  },
  {
    id: 'matrix-venn-ai-ml-dl',
    name: 'AI ⊃ ML ⊃ Deep Learning Set Containment Venn',
    category: 'math',
    engine: 'matrix',
    code: `{
  "title": "Artificial Intelligence, ML & Deep Learning Set Hierarchy",
  "type": "venn"
}`
  },
  {
    id: 'functionplot-exponential-decay',
    name: 'Exponential Growth & Decay Curves',
    category: 'math',
    engine: 'functionplot',
    code: `{
  "title": "Exponential Dynamics (e^0.5x vs e^-0.5x)",
  "domain": [-3, 3],
  "xLabel": "Time t",
  "yLabel": "Quantity N(t)",
  "functions": [
    {"fn": "exp(0.5*x)", "color": "#10b981", "label": "Growth e^(0.5x)"},
    {"fn": "exp(-0.5*x)", "color": "#f43f5e", "label": "Decay e^(-0.5x)"}
  ]
}`
  },

  // ─── 2. STATISTICAL INFERENCE & PROBABILITY ─────────────────────────────
  {
    id: 'functionplot-normal',
    name: 'Normal Distribution N(0,1) & Rejection α=0.05',
    category: 'statistics',
    engine: 'functionplot',
    code: `{
  "title": "Standard Normal Distribution N(0, 1)",
  "fn": "(1 / sqrt(2 * PI)) * exp(-0.5 * x^2)",
  "domain": [-4, 4],
  "xLabel": "Z-score",
  "yLabel": "Probability Density f(z)",
  "rejection": {
    "critical": 1.96,
    "tail": "both",
    "alpha": 0.05,
    "label": "Rejection Region (α = 0.05)"
  },
  "points": [
    {"x": 0, "y": 0.3989, "label": "Peak μ = 0 (f = 0.3989)"}
  ]
}`
  },
  {
    id: 'functionplot-t-dist',
    name: "Student's t-Distribution (df=3 vs df=30 vs Normal)",
    category: 'statistics',
    engine: 'functionplot',
    code: `{
  "title": "Student's t-Distribution vs Standard Normal",
  "domain": [-4, 4],
  "xLabel": "t-statistic / Z-score",
  "yLabel": "Density f(t)",
  "functions": [
    {"fn": "t_dist(x, 3)", "color": "#f43f5e", "label": "t (df = 3, Heavy Tails)"},
    {"fn": "t_dist(x, 30)", "color": "#fbbf24", "label": "t (df = 30)"},
    {"fn": "(1/sqrt(2*PI))*exp(-0.5*x^2)", "color": "#38bdf8", "label": "Normal N(0,1)", "dashed": true}
  ]
}`
  },
  {
    id: 'functionplot-chisquare',
    name: 'Chi-Square Distribution χ² (k=3, 5, 9)',
    category: 'statistics',
    engine: 'functionplot',
    code: `{
  "title": "Chi-Square Probability Density Curves",
  "domain": [0, 20],
  "xLabel": "χ² Value",
  "yLabel": "Density f(χ²)",
  "functions": [
    {"fn": "chi2_dist(x, 3)", "color": "#f43f5e", "label": "k = 3 (Right Skewed)"},
    {"fn": "chi2_dist(x, 5)", "color": "#fbbf24", "label": "k = 5"},
    {"fn": "chi2_dist(x, 9)", "color": "#10b981", "label": "k = 9 (Approaching Normal)"}
  ]
}`
  },
  {
    id: 'functionplot-right-tail',
    name: 'One-Tailed Upper Rejection Region (α=0.05)',
    category: 'statistics',
    engine: 'functionplot',
    code: `{
  "title": "Right-Tailed Hypothesis Test (Z >= +1.645)",
  "fn": "(1 / sqrt(2 * PI)) * exp(-0.5 * x^2)",
  "domain": [-4, 4],
  "xLabel": "Z-score",
  "yLabel": "Density f(z)",
  "rejection": {
    "critical": 1.645,
    "tail": "right",
    "alpha": 0.05,
    "label": "One-Tailed Rejection (Z >= 1.645)"
  }
}`
  },
  {
    id: 'echarts-boxplot',
    name: 'ECharts 5-Number Summary Boxplot',
    category: 'statistics',
    engine: 'echarts',
    code: `{
  "title": { "text": "Statistical Sample Distributions (Boxplot)" },
  "xAxis": { "data": ["Group A (Control)", "Group B (Treatment)", "Group C (Optimized)"] },
  "series": [
    {
      "name": "Distribution",
      "type": "scatter",
      "data": [[0, 15], [0, 22], [0, 30], [1, 28], [1, 35], [1, 42], [2, 45], [2, 58], [2, 65]]
    }
  ]
}`
  },
  {
    id: 'chartjs-pr-curve',
    name: 'Precision-Recall Curve vs F1 Iso-Curves',
    category: 'statistics',
    engine: 'chartjs',
    code: `{
  "type": "line",
  "title": "Precision-Recall Curve (AP = 0.91) vs Random Baseline",
  "data": {
    "datasets": [
      {
        "label": "Neural Classifier (AP = 0.91)",
        "borderColor": "#38bdf8",
        "data": [{"x": 0, "y": 1}, {"x": 0.2, "y": 0.96}, {"x": 0.5, "y": 0.92}, {"x": 0.8, "y": 0.85}, {"x": 1, "y": 0.45}]
      },
      {
        "label": "Random Baseline (P = 0.30)",
        "borderColor": "#64748b",
        "data": [{"x": 0, "y": 0.30}, {"x": 1, "y": 0.30}]
      }
    ]
  }
}`
  },

  // ─── 3. CLASSICAL MACHINE LEARNING ─────────────────────────────────────
  {
    id: 'nomnoml-decision-tree',
    name: 'Decision Tree Classifier (Gini Impurity Splits)',
    category: 'machine_learning',
    engine: 'nomnoml',
    code: `[<frame>Decision Tree Classifier (Gini Impurity)
  [Root: Age <= 35?] -> [Income <= 50k?]
  [Root: Age <= 35?] -> [Credit Score >= 700?]
  [Income <= 50k?] -> [<choice>Loan Denied (Gini: 0.0)]
  [Income <= 50k?] -> [<choice>Approved (Gini: 0.12)]
  [Credit Score >= 700?] -> [<choice>Approved (Gini: 0.0)]
  [Credit Score >= 700?] -> [<choice>Manual Review (Gini: 0.42)]
]`
  },
  {
    id: 'nomnoml-dendrogram',
    name: 'Hierarchical Clustering Dendrogram (Agglomerative)',
    category: 'machine_learning',
    engine: 'nomnoml',
    code: `[<frame>Agglomerative Hierarchical Dendrogram
  [P1: Customer 1] - [Cluster A (d=0.8)]
  [P2: Customer 2] - [Cluster A (d=0.8)]
  [Cluster A (d=0.8)] - [Sub-Cluster AB (d=2.1)]
  [P3: Customer 3] - [Sub-Cluster AB (d=2.1)]
  [P4: Customer 4] - [Cluster C (d=1.2)]
  [P5: Customer 5] - [Cluster C (d=1.2)]
  [Sub-Cluster AB (d=2.1)] - [Root Cluster (d=4.5)]
  [Cluster C (d=1.2)] - [Root Cluster (d=4.5)]
]`
  },
  {
    id: 'functionplot-svm',
    name: 'Support Vector Machine (SVM Max-Margin & Support Vectors)',
    category: 'machine_learning',
    engine: 'functionplot',
    code: `{
  "title": "SVM Maximum Margin Hyperplane (w^T x + b = 0)",
  "domain": [-2, 8],
  "xLabel": "Feature X1",
  "yLabel": "Feature X2",
  "functions": [
    {"fn": "1.2*x - 1", "color": "#ffffff", "label": "Separating Hyperplane w^T x + b = 0"},
    {"fn": "1.2*x + 0.8", "color": "#38bdf8", "label": "Positive Margin (+1)", "dashed": true},
    {"fn": "1.2*x - 2.8", "color": "#f43f5e", "label": "Negative Margin (-1)", "dashed": true}
  ],
  "points": [
    {"x": 1, "y": 2.0, "color": "#38bdf8", "label": "Support Vector (+1)"},
    {"x": 3, "y": 4.4, "color": "#38bdf8", "label": "Support Vector (+1)"},
    {"x": 4, "y": 2.0, "color": "#f43f5e", "label": "Support Vector (-1)"},
    {"x": 1, "y": 4.0, "color": "#38bdf8"},
    {"x": 5, "y": 1.0, "color": "#f43f5e"},
    {"x": 6, "y": 2.5, "color": "#f43f5e"}
  ]
}`
  },
  {
    id: 'echarts-knn',
    name: 'K-Nearest Neighbors (KNN Classification Voting)',
    category: 'machine_learning',
    engine: 'echarts',
    code: `{
  "title": { "text": "K-Nearest Neighbors (k=3 vs k=5 Voting Space)" },
  "series": [
    { "name": "Class A (Blue)", "itemStyle": {"color": "#38bdf8"}, "data": [[1.2, 2.5], [1.8, 3.2], [2.1, 2.8], [2.5, 3.8], [1.5, 4.1]] },
    { "name": "Class B (Red)", "itemStyle": {"color": "#f43f5e"}, "data": [[4.5, 1.8], [5.2, 2.6], [5.8, 1.5], [6.1, 3.0], [4.8, 3.5]] },
    { "name": "Query Point x_q (Unknown)", "itemStyle": {"color": "#fbbf24"}, "data": [[3.2, 2.7]] }
  ]
}`
  },
  {
    id: 'echarts-pca',
    name: 'Principal Component Analysis (PCA Eigenvectors)',
    category: 'machine_learning',
    engine: 'echarts',
    code: `{
  "title": { "text": "PCA Dimensionality Reduction (PC1 & PC2 Eigenvectors)" },
  "series": [
    { "name": "Sample Data Cloud", "itemStyle": {"color": "#64748b"}, "data": [[1, 1.2], [2, 1.9], [3, 3.1], [4, 3.8], [5, 5.2], [6, 6.1], [7, 6.9]] },
    { "name": "PC1 (Max Variance 88%)", "itemStyle": {"color": "#38bdf8"}, "data": [[0, 0], [7.5, 7.5]] },
    { "name": "PC2 (Orthogonal 12%)", "itemStyle": {"color": "#f43f5e"}, "data": [[3.5, 3.5], [1.5, 5.5]] }
  ]
}`
  },
  {
    id: 'functionplot-decision',
    name: '2D Linear Decision Boundary (w^T x + b = 0)',
    category: 'machine_learning',
    engine: 'functionplot',
    code: `{
  "title": "Linear Separating Hyperplane (w^T x + b = 0)",
  "fn": "1.2 * x - 1",
  "domain": [-2, 8],
  "xLabel": "Feature X1",
  "yLabel": "Feature X2",
  "points": [
    {"x": 1, "y": 4, "class": "Class A (+1)", "color": "#38bdf8", "label": "Class A (+1)"},
    {"x": 2, "y": 5, "class": "Class A (+1)", "color": "#38bdf8"},
    {"x": 3, "y": 7, "class": "Class A (+1)", "color": "#38bdf8"},
    {"x": 4, "y": 1, "class": "Class B (-1)", "color": "#f43f5e", "label": "Class B (-1)"},
    {"x": 5, "y": 2, "class": "Class B (-1)", "color": "#f43f5e"},
    {"x": 6, "y": 3, "class": "Class B (-1)", "color": "#f43f5e"}
  ]
}`
  },
  {
    id: 'echarts-kmeans',
    name: 'ECharts K-Means 3-Cluster Scatter Plot',
    category: 'machine_learning',
    engine: 'echarts',
    code: `{
  "title": { "text": "K-Means Multi-Cluster Partitioning (k=3)" },
  "series": [
    { "name": "Cluster 1", "itemStyle": {"color": "#38bdf8"}, "data": [[1, 2], [1.5, 2.8], [2, 1.8], [2.2, 3.1]] },
    { "name": "Cluster 2", "itemStyle": {"color": "#10b981"}, "data": [[5, 6], [5.5, 6.8], [6, 5.8], [6.2, 7.1]] },
    { "name": "Cluster 3", "itemStyle": {"color": "#f43f5e"}, "data": [[2, 7], [2.5, 7.8], [3, 6.8], [3.2, 8.1]] }
  ]
}`
  },
  {
    id: 'echarts-confusion-matrix',
    name: 'ECharts Confusion Matrix Heatmap',
    category: 'machine_learning',
    engine: 'echarts',
    code: `{
  "title": { "text": "Multi-Class Model Confusion Matrix (Accuracy 88%)" },
  "type": "heatmap",
  "xAxis": { "data": ["Pred: Cat", "Pred: Dog", "Pred: Bird"] },
  "yAxis": { "data": ["Actual: Cat", "Actual: Dog", "Actual: Bird"] },
  "series": [
    {
      "data": [
        [0, 0, 92], [0, 1, 5], [0, 2, 3],
        [1, 0, 7], [1, 1, 86], [1, 2, 7],
        [2, 0, 4], [2, 1, 8], [2, 2, 88]
      ]
    }
  ]
}`
  },
  {
    id: 'chartjs-roc-auc',
    name: 'Chart.js ROC-AUC Classifier Performance',
    category: 'machine_learning',
    engine: 'chartjs',
    code: `{
  "type": "line",
  "title": "ROC Curve: XGBoost (AUC = 0.94) vs Random (AUC = 0.50)",
  "data": {
    "datasets": [
      {
        "label": "XGBoost Classifier (AUC = 0.94)",
        "borderColor": "#10b981",
        "data": [{"x": 0, "y": 0}, {"x": 0.05, "y": 0.70}, {"x": 0.15, "y": 0.88}, {"x": 0.30, "y": 0.95}, {"x": 1, "y": 1}]
      },
      {
        "label": "Random Guess Baseline",
        "borderColor": "#64748b",
        "data": [{"x": 0, "y": 0}, {"x": 0.5, "y": 0.5}, {"x": 1, "y": 1}]
      }
    ]
  }
}`
  },
  {
    id: 'functionplot-logistic',
    name: 'Logistic Regression Probability S-Curve',
    category: 'machine_learning',
    engine: 'functionplot',
    code: `{
  "title": "Logistic Regression Probability P(Y=1|z)",
  "domain": [-6, 6],
  "xLabel": "Log-Odds Score z = w^T x",
  "yLabel": "Probability P(Y=1)",
  "fn": "1 / (1 + exp(-x))",
  "points": [
    {"x": 0, "y": 0.5, "label": "Decision Threshold (z=0, P=0.5)"}
  ]
}`
  },

  // ─── 4. DEEP LEARNING & COMPUTER VISION ─────────────────────────────────
  {
    id: 'cytoscape-ann-deep',
    name: 'Deep Artificial Neural Network (3-Layer Topology)',
    category: 'deep_learning',
    engine: 'cytoscape',
    code: `{
  "title": "Deep Neural Network (Input -> 2 Hidden -> Output)",
  "layers": [
    { "name": "Input Layer", "nodes": ["x₁ (Feature)", "x₂ (Feature)", "x₃ (Feature)"], "color": "#38bdf8" },
    { "name": "Hidden 1 (ReLU)", "nodes": ["h₁₁", "h₁₂", "h₁₃", "h₁₄"], "color": "#10b981" },
    { "name": "Hidden 2 (ReLU)", "nodes": ["h₂₁", "h₂₂", "h₂₃"], "color": "#fbbf24" },
    { "name": "Output Layer", "nodes": ["ŷ (Softmax Probability)"], "color": "#f43f5e" }
  ]
}`
  },
  {
    id: 'matrix-convolution',
    name: '2D Convolution Kernel & Feature Map Sliding Window',
    category: 'deep_learning',
    engine: 'matrix',
    code: `{
  "title": "2D Convolution Operation (3x3 Kernel on 5x5 Feature Map)",
  "type": "convolution",
  "inputMatrix": [
    [1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0]
  ],
  "kernelMatrix": [
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1]
  ],
  "outputMatrix": [
    [4, 3, 4],
    [2, 4, 3],
    [2, 3, 4]
  ]
}`
  },
  {
    id: 'matrix-bounding-box',
    name: 'Object Detection Bounding Box & Segmentation Overlay',
    category: 'deep_learning',
    engine: 'matrix',
    code: `{
  "title": "Computer Vision Bounding Box Multi-Class Detection",
  "type": "bounding_box",
  "boxes": [
    { "label": "Autonomous Vehicle (98.4%)", "x": 60, "y": 80, "width": 240, "height": 160, "color": "#38bdf8" },
    { "label": "Pedestrian (92.1%)", "x": 340, "y": 90, "width": 110, "height": 180, "color": "#10b981" },
    { "label": "Traffic Light (96.5%)", "x": 490, "y": 50, "width": 80, "height": 130, "color": "#f43f5e" }
  ]
}`
  },
  {
    id: 'chartjs-loss-curves',
    name: 'Training Loss vs Validation Loss Across Epochs',
    category: 'deep_learning',
    engine: 'chartjs',
    code: `{
  "type": "line",
  "title": "Model Loss vs Overfitting Check Across 20 Epochs",
  "data": {
    "datasets": [
      {
        "label": "Training Loss",
        "borderColor": "#38bdf8",
        "data": [{"x": 1, "y": 2.4}, {"x": 4, "y": 1.2}, {"x": 8, "y": 0.6}, {"x": 12, "y": 0.35}, {"x": 16, "y": 0.20}, {"x": 20, "y": 0.12}]
      },
      {
        "label": "Validation Loss",
        "borderColor": "#f43f5e",
        "data": [{"x": 1, "y": 2.5}, {"x": 4, "y": 1.35}, {"x": 8, "y": 0.75}, {"x": 12, "y": 0.62}, {"x": 16, "y": 0.68}, {"x": 20, "y": 0.85}]
      }
    ]
  }
}`
  },
  {
    id: 'mermaid-resnet',
    name: 'Residual Skip Connection Block (ResNet Architecture)',
    category: 'deep_learning',
    engine: 'mermaid',
    code: `graph TD
  In[Input Activation x] --> Conv1[Weight Layer 3x3 Conv, ReLU]
  Conv1 --> Conv2[Weight Layer 3x3 Conv]
  In -->|Identity Shortcut Skip Connection| Add((+))
  Conv2 --> Add
  Add --> Out[Output ReLU Activation: F(x) + x]`
  },
  {
    id: 'cytoscape-transformer-arch',
    name: 'Transformer Encoder-Decoder Deep Architecture',
    category: 'deep_learning',
    engine: 'cytoscape',
    code: `{
  "title": "Transformer Attention Architecture (Vaswani et al.)",
  "layers": [
    { "name": "Input / Target Tokens", "nodes": ["Source Tokens", "Positional Encoding", "Target Tokens", "Target Pos Encoding"], "color": "#38bdf8" },
    { "name": "Encoder Block", "nodes": ["Multi-Head Self Attention", "Add & LayerNorm (Enc 1)", "Feed-Forward Network", "Add & LayerNorm (Enc 2)"], "color": "#10b981" },
    { "name": "Decoder Block", "nodes": ["Masked Self-Attention", "Cross Multi-Head Attention", "Add & LayerNorm (Dec)", "Decoder FFN"], "color": "#fbbf24" },
    { "name": "Output Probabilities", "nodes": ["Linear Projection", "Softmax Probabilities ŷ"], "color": "#f43f5e" }
  ]
}`
  },
  {
    id: 'mermaid-diffusion-process',
    name: 'Diffusion Generative Process (Forward Noise -> Reverse U-Net)',
    category: 'deep_learning',
    engine: 'mermaid',
    code: `flowchart LR
  subgraph ForwardNoise[Forward Markov Diffusion q(x_t | x_t-1)]
    X0[Clean Sample x_0] -->|Add Gaussian Noise β_1| X1[Noisy x_1]
    X1 -->|Add Noise β_t| XT[Pure Gaussian Noise x_T ~ N(0,I)]
  end
  subgraph ReverseDenoising[Reverse Generative Process p_θ(x_t-1 | x_t)]
    XT -->|Denoising U-Net ε_θ(x_t, t)| UNet[U-Net Denoiser with Cross-Attention]
    UNet -->|Predict Noise Residual| XRec[Reconstructed x_0]
    Prompt[Conditioning Text / Class Embedding] -.-> UNet
  end`
  },
  {
    id: 'cytoscape-gan-minimax',
    name: 'Generative Adversarial Network (GAN Minimax Game)',
    category: 'deep_learning',
    engine: 'cytoscape',
    code: `{
  "title": "Generative Adversarial Network (G vs D Minimax Optimization)",
  "layers": [
    { "name": "Latent & Real Space", "nodes": ["Latent Vector z ~ N(0,I)", "Real Training Dataset x ~ p_data"], "color": "#a855f7" },
    { "name": "Generator Model", "nodes": ["Transposed Conv Layers", "Generated Fake Image G(z)"], "color": "#38bdf8" },
    { "name": "Discriminator Model", "nodes": ["Feature Extractor Conv", "Discriminator D(x) Score"], "color": "#fbbf24" },
    { "name": "Adversarial Loss", "nodes": ["BCE Loss min_G max_D V(D,G)", "G Loss Backpropagation", "D Loss Backpropagation"], "color": "#f43f5e" }
  ]
}`
  },
  {
    id: 'cytoscape-vae-reparam',
    name: 'Variational Autoencoder (VAE Reparameterization Trick)',
    category: 'deep_learning',
    engine: 'cytoscape',
    code: `{
  "title": "Variational Autoencoder (Encoder -> μ, σ -> Reparameterize -> Decoder)",
  "layers": [
    { "name": "Input Space", "nodes": ["Input Image x (784D)", "Encoder Hidden Layer"], "color": "#38bdf8" },
    { "name": "Latent Parameters", "nodes": ["Mean Vector μ(x)", "Log Variance log σ²(x)", "Noise ε ~ N(0, I)"], "color": "#10b981" },
    { "name": "Bottleneck Sampling", "nodes": ["Latent Code z = μ + σ ⊙ ε (20D)"], "color": "#fbbf24" },
    { "name": "Decoder Reconstruction", "nodes": ["Decoder Hidden Layer", "Reconstructed x̂", "Loss = BCE(x, x̂) + KL(q||p)"], "color": "#f43f5e" }
  ]
}`
  },
  {
    id: 'mermaid-gnn-message-passing',
    name: 'Graph Neural Network (GNN Message Passing & Aggregation)',
    category: 'deep_learning',
    engine: 'mermaid',
    code: `graph TD
  subgraph NeighborGraph[Graph Neighborhood N(v)]
    U1[Neighbor Node u₁ (h_u1)] -->|Message M(h_u1)| AGG[Aggregation ⨁]
    U2[Neighbor Node u₂ (h_u2)] -->|Message M(h_u2)| AGG
    U3[Neighbor Node u₃ (h_u3)] -->|Message M(h_u3)| AGG
  end
  subgraph NodeUpdate[Target Node v Representation Update]
    AGG -->|Aggregated Context a_v^(k)| UPDATE[Update Function γ: W_k · concat(h_v, a_v)]
    V_old[Self Feature h_v^(k-1)] --> UPDATE
    UPDATE --> V_new[New Node Embedding h_v^(k) = σ(W_k [h_v, a_v])]
  end
  V_new --> Task[Downstream Node / Link / Graph Prediction]`
  },
  {
    id: 'cytoscape-cnn-pipeline',
    name: 'Convolutional Neural Network (CNN Feature Hierarchy)',
    category: 'deep_learning',
    engine: 'cytoscape',
    code: `{
  "title": "CNN Hierarchy (Conv2D -> MaxPool -> Conv2D -> Flatten -> Softmax)",
  "layers": [
    { "name": "Input Image", "nodes": ["RGB Input (32x32x3)"], "color": "#38bdf8" },
    { "name": "Conv Layer 1", "nodes": ["3x3 Filters (x32)", "ReLU Activations", "2x2 MaxPool (16x16)"], "color": "#10b981" },
    { "name": "Conv Layer 2", "nodes": ["3x3 Filters (x64)", "ReLU Activations", "2x2 MaxPool (8x8)"], "color": "#fbbf24" },
    { "name": "Dense Classifier", "nodes": ["Flatten (4096D)", "Dense FC (128D, Dropout)", "Softmax (10 Classes)"], "color": "#f43f5e" }
  ]
}`
  },
  {
    id: 'cytoscape-lstm-cell',
    name: 'Long Short-Term Memory (LSTM Gated Cell Anatomy)',
    category: 'deep_learning',
    engine: 'cytoscape',
    code: `{
  "title": "LSTM Cell (Forget Gate f_t, Input Gate i_t, Candidate C̃_t, Output Gate o_t)",
  "layers": [
    { "name": "Inputs", "nodes": ["Input Token x_t", "Previous Hidden h_t-1", "Previous Cell State C_t-1"], "color": "#38bdf8" },
    { "name": "Gating Mechanism", "nodes": ["Forget Gate f_t = σ(W_f [h,x])", "Input Gate i_t = σ(W_i [h,x])", "Candidate C̃_t = tanh(W_c [h,x])", "Output Gate o_t = σ(W_o [h,x])"], "color": "#10b981" },
    { "name": "State Update", "nodes": ["Cell State C_t = f_t · C_t-1 + i_t · C̃_t"], "color": "#fbbf24" },
    { "name": "Cell Outputs", "nodes": ["New Hidden State h_t = o_t · tanh(C_t)", "Output Projection y_t"], "color": "#f43f5e" }
  ]
}`
  },
  {
    id: 'mermaid-rl-actor-critic',
    name: 'Reinforcement Learning Policy Gradient (Actor-Critic PPO)',
    category: 'deep_learning',
    engine: 'mermaid',
    code: `graph LR
  subgraph Agent[Actor-Critic Agent]
    State[State s_t] --> Actor[Actor Policy Network π_θ(a|s)]
    State --> Critic[Critic Value Network V_φ(s)]
    Actor --> Action[Action a_t sampled from π_θ]
    Critic --> Value[Expected Value V(s_t)]
  end
  subgraph Environment[Environment Interaction]
    Action --> Env[Gym / Physics Environment]
    Env --> Reward[Reward r_t]
    Env --> NextState[Next State s_t+1]
  end
  Reward --> Advantage[Advantage A_t = r + γ V(s_t+1) - V(s_t)]
  Value --> Advantage
  Advantage -->|Policy Loss Update| Actor
  Advantage -->|Value TD Error Loss| Critic`
  },

  // ─── 5. GENERATIVE AI, LLMS & AGENTS ─────────────────────────────────────
  {
    id: 'cytoscape-multi-agent',
    name: 'Multi-Agent Network Collaboration Topology',
    category: 'genai_agents',
    engine: 'cytoscape',
    code: `{
  "title": "Autonomous Multi-Agent System (Supervisor & Workers)",
  "nodes": [
    { "id": "1", "label": "🧠 Supervisor Agent", "color": "#a855f7", "x": 320, "y": 110 },
    { "id": "2", "label": "🔍 Search / RAG Agent", "color": "#38bdf8", "x": 170, "y": 240 },
    { "id": "3", "label": "💻 Code Generator", "color": "#10b981", "x": 320, "y": 290 },
    { "id": "4", "label": "⚖️ Critic / Evaluator", "color": "#f43f5e", "x": 470, "y": 240 }
  ],
  "edges": [
    { "source": "1", "target": "2", "label": "Dispatch Query" },
    { "source": "1", "target": "3", "label": "Dispatch Spec" },
    { "source": "2", "target": "4", "label": "Grounding Docs" },
    { "source": "3", "target": "4", "label": "Draft Code" },
    { "source": "4", "target": "1", "label": "Validated Result" }
  ]
}`
  },
  {
    id: 'mermaid-agent-loop',
    name: 'Autonomous Agent Cyclic Loop (Perceive -> Plan -> Act -> Reflect)',
    category: 'genai_agents',
    engine: 'mermaid',
    code: `stateDiagram-v2
  [*] --> Perceive : User Environment Input
  Perceive --> Plan : LLM Reasoning & Goal Decomposition
  Plan --> Act : Tool Execution & API Calls
  Act --> Reflect : Environment State Feedback
  Reflect --> Plan : Needs Step Iteration
  Reflect --> [*] : Task Completed Successfully`
  },
  {
    id: 'echarts-attention-heatmap',
    name: 'Self-Attention Weight Matrix Heatmap (8x8 Tokens)',
    category: 'genai_agents',
    engine: 'echarts',
    code: `{
  "title": { "text": "Transformer Self-Attention Matrix (Query-Key Dot Product)" },
  "type": "heatmap",
  "xAxis": { "data": ["The", "quick", "brown", "fox", "jumps", "over", "lazy", "dog"] },
  "yAxis": { "data": ["The", "quick", "brown", "fox", "jumps", "over", "lazy", "dog"] },
  "series": [
    {
      "data": [
        [0, 0, 95], [0, 1, 15], [0, 2, 10], [0, 3, 75], [0, 4, 12], [0, 5, 8], [0, 6, 5], [0, 7, 10],
        [1, 0, 20], [1, 1, 90], [1, 2, 45], [1, 3, 85], [1, 4, 10], [1, 5, 5], [1, 6, 8], [1, 7, 12],
        [2, 0, 10], [2, 1, 40], [2, 2, 92], [2, 3, 88], [2, 4, 15], [2, 5, 10], [2, 6, 5], [2, 7, 8],
        [3, 0, 80], [3, 1, 85], [3, 2, 90], [3, 3, 98], [3, 4, 70], [3, 5, 25], [3, 6, 10], [3, 7, 15],
        [4, 0, 15], [4, 1, 10], [4, 2, 12], [4, 3, 70], [4, 4, 95], [4, 5, 85], [4, 6, 20], [4, 7, 30],
        [5, 0, 10], [5, 1, 8], [5, 2, 10], [5, 3, 30], [5, 4, 88], [5, 5, 96], [5, 6, 40], [5, 7, 50],
        [6, 0, 5], [6, 1, 8], [6, 2, 5], [6, 3, 12], [6, 4, 25], [6, 5, 45], [6, 6, 92], [6, 7, 85],
        [7, 0, 15], [7, 1, 10], [7, 2, 8], [7, 3, 20], [7, 4, 35], [7, 5, 55], [7, 6, 88], [7, 7, 96]
      ]
    }
  ]
}`
  },
  {
    id: 'mermaid-rag-pipeline',
    name: 'RAG Pipeline Flow (Prompt -> Embedding -> Vector DB -> LLM)',
    category: 'genai_agents',
    engine: 'mermaid',
    code: `flowchart LR
  subgraph Ingestion[Data Ingestion]
    Doc[Course Notes PDF] --> Chunk[Text Chunking]
    Chunk --> Embed[Embedding Model]
    Embed --> VDB[(Milvus Vector DB)]
  end
  subgraph QueryPhase[Inference Retrieval]
    Q[Student Query] --> QEmbed[Query Embedding]
    QEmbed --> Sim[Cosine Top-K Search]
    VDB -.-> Sim
    Sim --> Ctx[Grounded Context]
    Ctx --> LLM[DeepSeek / Gemini LLM]
    LLM --> Ans[Exam Answer with Diagrams]
  end`
  },
  {
    id: 'mermaid-tool-calling',
    name: 'LLM Tool Calling & API Function Dispatch Tree',
    category: 'genai_agents',
    engine: 'mermaid',
    code: `graph TD
  User[Student Question] --> Router[LLM Decision Router]
  Router -->|Math Calculation| T1[Tool: Python Code Lab]
  Router -->|Course Syllabus| T2[Tool: Vector Notes Retriever]
  Router -->|Exam Diagram| T3[Tool: Kroki & SVG Studio]
  T1 --> Aggregate[Response Synthesis]
  T2 --> Aggregate
  T3 --> Aggregate
  Aggregate --> Final[Verified Mentor Answer]`
  },

  // ─── 4. SOFTWARE ARCHITECTURE & UML ─────────────────────────────────────
  {
    id: 'mermaid-flowchart',
    name: 'Mermaid.js Microservices Architecture Flow',
    category: 'software_arch',
    engine: 'mermaid',
    code: `graph TD
  A[Client Web App] -->|HTTP POST| B[Vercel Serverless API]
  B -->|Query| C[Ollama Cloud / Gemini API]
  B -->|Render SVG| D[Kroki Diagram Engine]
  C --> B
  D --> B
  B -->|JSON Response| A`
  },
  {
    id: 'mermaid-sequence',
    name: 'Mermaid.js OAuth 2.0 Auth Sequence',
    category: 'software_arch',
    engine: 'mermaid',
    code: `sequenceDiagram
    autonumber
    actor User
    participant App as React Frontend
    participant API as Vercel API Gateway
    participant Auth as OAuth Provider
    participant DB as Postgres DB

    User->>App: Clicks Login with Google
    App->>Auth: Request Authorization Code
    Auth-->>App: Returns Auth Code
    App->>API: POST /api/auth/token {code}
    API->>Auth: Exchange Code for Access Token
    Auth-->>API: Returns Valid JWT Token
    API->>DB: Upsert User Profile
    API-->>App: Set Secure Session Cookie
    App-->>User: Redirect to Dashboard`
  },
  {
    id: 'mermaid-class',
    name: 'Mermaid.js Object-Oriented Class Diagram',
    category: 'software_arch',
    engine: 'mermaid',
    code: `classDiagram
    class User {
        +String username
        +String role
        +login()
        +logout()
    }
    class ChatSession {
        +String id
        +String title
        +List~Message~ messages
        +addMessage()
    }
    class Message {
        +String sender
        +String content
        +Date timestamp
    }
    User "1" -- "*" ChatSession : manages
    ChatSession "1" -- "*" Message : holds`
  },
  {
    id: 'mermaid-state',
    name: 'Mermaid.js Lifecycle State Machine',
    category: 'software_arch',
    engine: 'mermaid',
    code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Loading : Submit Request
    Loading --> Streaming : Tokens Arriving
    Streaming --> Success : Stream Finished
    Streaming --> Error : Network Drop
    Loading --> Error : Timeout
    Error --> Idle : Retry
    Success --> Idle : New Session`
  },
  {
    id: 'plantuml-component',
    name: 'PlantUML Cloud Component Architecture',
    category: 'software_arch',
    engine: 'plantuml',
    code: `@startuml
package "Client Tier" {
  [React Vite SPA] as Client
}
package "Cloud Backend" {
  [API Gateway] as Gateway
  [Auth Service] as Auth
  [Inference Engine] as LLM
}
database "PostgreSQL" {
  [User Sessions] as DB
}
Client --> Gateway : HTTPS / JSON
Gateway --> Auth : Verify JWT
Gateway --> LLM : Stream Prompt
Gateway --> DB : Persist History
@enduml`
  },
  {
    id: 'nomnoml-uml-class',
    name: 'Nomnoml UML Class Inheritance & Association',
    category: 'software_arch',
    engine: 'nomnoml',
    code: `[<abstract>NeuralModel
  |weights: Tensor
  |forward(x): Tensor
  |backward(grad): void
]

[DenseLayer|units: int|forward(x): Tensor] -:> [NeuralModel]
[ConvLayer|filters: int|forward(x): Tensor] -:> [NeuralModel]

[Optimizer|lr: float|step(): void] --> [NeuralModel]`
  },
  {
    id: 'nomnoml-microservice',
    name: 'Nomnoml Microservice Component Dependency Map',
    category: 'software_arch',
    engine: 'nomnoml',
    code: `[<frame>Exam Mentor System
  [Frontend Client] -> [<actor>Student]
  [Frontend Client] -> [API Gateway]
  [API Gateway] -> [Auth Service]
  [API Gateway] -> [Inference Engine]
  [Inference Engine] -> [Kroki Visualizer]
  [Inference Engine] -> [<database>Vector DB]
]`
  },
  {
    id: 'blockdiag',
    name: 'BlockDiag High-Availability Topology',
    category: 'software_arch',
    engine: 'blockdiag',
    code: `blockdiag {
  Client -> DNS -> Load_Balancer;
  Load_Balancer -> App_Node_1 -> Redis_Cluster;
  Load_Balancer -> App_Node_2 -> Redis_Cluster;
  App_Node_1 -> Primary_DB;
  App_Node_2 -> Primary_DB;
}`
  },

  // ─── 5. DATABASE & SCHEMA ───────────────────────────────────────────────
  {
    id: 'mermaid-erd',
    name: "Mermaid.js Crow's Foot Relational Schema",
    category: 'database',
    engine: 'mermaid',
    code: `erDiagram
    USERS ||--o{ ORDERS : places
    USERS {
        int id PK
        string email
        string fullName
    }
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS {
        int id PK
        int user_id FK
        decimal totalAmount
        string status
    }
    PRODUCTS ||--o{ ORDER_ITEMS : includes
    PRODUCTS {
        int id PK
        string sku
        decimal price
        int stock
    }`
  },
  {
    id: 'erd-kroki',
    name: 'Kroki ERD Syntax Data Schema',
    category: 'database',
    engine: 'erd',
    code: `[Users]
  *id {label: "int, PK"}
  +email {label: "varchar(255)"}
  name {label: "varchar(100)"}

[Sessions]
  *id {label: "uuid, PK"}
  +user_id {label: "int, FK"}
  created_at {label: "timestamp"}

Users 1--* Sessions`
  },

  // ─── 6. NETWORKS & PROTOCOLS ────────────────────────────────────────────
  {
    id: 'cytoscape-mesh-network',
    name: 'Cytoscape Mesh Network Routing & Dijkstra Graph',
    category: 'networking',
    engine: 'cytoscape',
    code: `{
  "title": "Packet Routing Mesh Topology (Dijkstra Shortest Path)",
  "nodes": [
    { "id": "A", "label": "Router A (Source)", "color": "#38bdf8", "x": 120, "y": 190 },
    { "id": "B", "label": "Router B", "color": "#10b981", "x": 260, "y": 110 },
    { "id": "C", "label": "Router C", "color": "#10b981", "x": 260, "y": 270 },
    { "id": "D", "label": "Router D", "color": "#fbbf24", "x": 400, "y": 110 },
    { "id": "E", "label": "Router E (Dest)", "color": "#f43f5e", "x": 520, "y": 190 }
  ],
  "edges": [
    { "source": "A", "target": "B", "label": "Cost: 2" },
    { "source": "A", "target": "C", "label": "Cost: 4" },
    { "source": "B", "target": "D", "label": "Cost: 3" },
    { "source": "C", "target": "D", "label": "Cost: 1" },
    { "source": "D", "target": "E", "label": "Cost: 2" }
  ]
}`
  },
  {
    id: 'graphviz-topology',
    name: 'Graphviz DOT Shortest Path Network',
    category: 'networking',
    engine: 'graphviz',
    code: `digraph NetworkTopology {
  rankdir=LR;
  node [shape=box, style="filled,rounded", fillcolor="#0f172a", fontcolor="#38bdf8", color="#0284c7"];
  edge [color="#64748b", fontcolor="#94a3b8", fontsize=10];

  Router_A -> Router_B [label="cost: 4"];
  Router_A -> Router_C [label="cost: 2"];
  Router_C -> Router_B [label="cost: 1"];
  Router_B -> Router_D [label="cost: 5"];
  Router_C -> Router_D [label="cost: 8"];
  Router_B -> Router_E [label="cost: 3"];
  Router_D -> Router_E [label="cost: 1"];
}`
  },
  {
    id: 'wavedrom',
    name: 'WaveDrom SPI Digital Clock & Data Waveform',
    category: 'networking',
    engine: 'wavedrom',
    code: `{signal: [
  {name: "SCLK",  wave: "p......"},
  {name: "MOSI",  wave: "x.==.x.", data: ["0xAF", "0x55", "0xFF"]},
  {name: "MISO",  wave: "x..==.x", data: ["0x00", "0x3C"]},
  {name: "CS_N",  wave: "1.0...1"}
]}`
  },

  // ─── 7. BUSINESS ANALYTICS & DASHBOARDS ─────────────────────────────────
  {
    id: 'apexcharts-timeseries',
    name: 'ApexCharts Real-Time Gradient Area Metric',
    category: 'business_dashboards',
    engine: 'apexcharts',
    code: `{
  "title": { "text": "Platform API Traffic & Token Throughput" },
  "xaxis": { "categories": ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"] },
  "series": [
    { "name": "API Requests (k/hr)", "data": [31, 40, 28, 95, 120, 145, 80] },
    { "name": "Active Students", "data": [11, 32, 45, 82, 94, 110, 60] }
  ]
}`
  },
  {
    id: 'chartjs-doughnut',
    name: 'Chart.js Exam Syllabus Weightage Donut',
    category: 'business_dashboards',
    engine: 'chartjs',
    code: `{
  "type": "doughnut",
  "title": "Semester Exam Marks Distribution (100 Total)",
  "data": {
    "labels": ["Unit I: Estimation", "Unit II: CI", "Unit III: Tests", "Unit IV: Bayes"],
    "datasets": [
      {
        "data": [25, 25, 25, 25],
        "backgroundColor": ["#38bdf8", "#10b981", "#fbbf24", "#f43f5e"]
      }
    ]
  }
}`
  },
  {
    id: 'mermaid-gantt',
    name: 'Mermaid.js Semester Exam Study Roadmap',
    category: 'business_dashboards',
    engine: 'mermaid',
    code: `gantt
    title OU M.Sc Data Science Exam Preparation Roadmap
    dateFormat  YYYY-MM-DD
    section Core Math & Stats
    Stat Inference Unit I & II :done, des1, 2026-08-01, 2026-08-07
    Testing of Hypotheses Unit III:active, des2, 2026-08-08, 2026-08-14
    section Applied DS
    Optimization Simplex & Duality: des3, 2026-08-15, 2026-08-21
    Computer Networks & OSI Model : des4, 2026-08-22, 2026-08-28`
  }
];

export interface DiagramStudioViewProps {
  userKeys?: UserKeys;
  selectedProvider?: string;
  selectedModel?: string;
  customModels?: UserCustomModels;
  onProviderChange?: (provider: string) => void;
  onModelChange?: (model: string) => void;
}

export interface CopilotMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  engine?: string;
  explanation?: string;
  timestamp: number;
  modelUsed?: string;
}

const DEFAULT_QUICK_CHIPS = [
  '🌳 Decision tree for loan eligibility with Gini splits',
  '🧠 Transformer Encoder-Decoder Architecture with Self & Cross Attention',
  '🔮 Diffusion Process: Forward Noise q(x_t|x_t-1) -> Reverse U-Net Denoiser',
  '🎨 GAN Minimax Architecture: Latent z -> Generator -> Discriminator',
  '🔍 RAG Pipeline: PDF -> Chunking -> Milvus -> Gemini',
  '⚖️ SVM separating hyperplane with margins and support vectors',
  '🧠 Deep ANN with Input -> 2 Hidden ReLU -> Output Softmax',
  '🔄 Autonomous Agent Loop: Perceive -> Plan -> Act -> Reflect',
  '📉 Training vs Validation Loss Curve with Overfitting at Epoch 12',
  '🧬 Agglomerative Hierarchical Clustering Dendrogram for 5 Customers',
  '📸 2D Convolution 3x3 Kernel on 5x5 Feature Map'
];

export const DiagramStudioView: React.FC<DiagramStudioViewProps> = ({
  userKeys = {} as UserKeys,
  selectedProvider,
  selectedModel,
  customModels = {},
  onProviderChange,
  onModelChange
}) => {
  // Studio & Display Modes
  const [studioMode, setStudioMode] = useState<'quick_deck' | 'copilot' | 'standard'>('quick_deck');
  const [isDeckCollapsed, setIsDeckCollapsed] = useState<boolean>(false);

  // Core Diagram State
  const [selectedCategory, setSelectedCategory] = useState<DiagramCategory>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<DiagramTemplate>(TEMPLATES[0]);
  const [diagramSource, setDiagramSource] = useState<string>(TEMPLATES[0].code);
  const [activeEngine, setActiveEngine] = useState<string>(TEMPLATES[0].engine);
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dropdown Menus
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState<boolean>(false);
  const [isDiagramMenuOpen, setIsDiagramMenuOpen] = useState<boolean>(false);
  const [isProviderMenuOpen, setIsProviderMenuOpen] = useState<boolean>(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState<boolean>(false);

  // Search Filter State for Provider and Model Menus
  const [providerSearchQuery, setProviderSearchQuery] = useState<string>('');
  const [modelSearchQuery, setModelSearchQuery] = useState<string>('');

  // AI Prompt Studio State - Synchronized with global PROVIDERS & Model Manager
  const [selectedProviderId, setSelectedProviderId] = useState<string>(() => {
    return selectedProvider || localStorage.getItem('chatterbot_diagram_provider') || 'openrouter';
  });

  const activeProvider = useMemo(() => {
    return PROVIDERS.find(p => p.id === selectedProviderId || p.name === selectedProviderId) || PROVIDERS[0];
  }, [selectedProviderId]);

  // Derived available models including user custom models from Model Manager
  const availableModels = useMemo(() => {
    const defaultModels = activeProvider.models;
    const providerCustomModels = customModels ? (customModels[activeProvider.id] || customModels[activeProvider.name]) : undefined;
    if (Array.isArray(providerCustomModels) && providerCustomModels.length > 0) {
      const enabledCustom = providerCustomModels
        .filter(m => m.enabled)
        .map(m => ({ value: m.id, name: `${m.name || m.id} [Custom]` }));
      const customIds = new Set(enabledCustom.map(m => m.value));
      return [...enabledCustom, ...defaultModels.filter(m => !customIds.has(m.value))];
    }
    return defaultModels;
  }, [activeProvider, customModels]);

  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    if (selectedModel) return selectedModel;
    const saved = localStorage.getItem('chatterbot_diagram_model');
    if (saved) return saved;
    return activeProvider.models[0]?.value || 'openrouter/free';
  });

  // Sync with prop changes if passed from App
  useEffect(() => {
    if (selectedProvider && selectedProvider !== selectedProviderId) {
      setSelectedProviderId(selectedProvider);
    }
  }, [selectedProvider]);

  useEffect(() => {
    if (selectedModel && selectedModel !== selectedModelId) {
      setSelectedModelId(selectedModel);
    }
  }, [selectedModel]);

  const filteredProviders = useMemo(() => {
    if (!providerSearchQuery.trim()) return PROVIDERS;
    return PROVIDERS.filter(p => p.name.toLowerCase().includes(providerSearchQuery.toLowerCase()));
  }, [providerSearchQuery]);

  const filteredModels = useMemo(() => {
    if (!modelSearchQuery.trim()) return availableModels;
    return availableModels.filter(m =>
      m.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
      m.value.toLowerCase().includes(modelSearchQuery.toLowerCase())
    );
  }, [availableModels, modelSearchQuery]);

  const currentModelName = useMemo(() => {
    const found = availableModels.find(m => m.value === selectedModelId);
    return found?.name || selectedModelId;
  }, [availableModels, selectedModelId]);

  const handleSelectProvider = (provId: string) => {
    setSelectedProviderId(provId);
    localStorage.setItem('chatterbot_diagram_provider', provId);
    if (onProviderChange) onProviderChange(provId);

    const targetGroup = PROVIDERS.find(p => p.id === provId || p.name === provId) || PROVIDERS[0];
    const pCustom = customModels ? (customModels[targetGroup.id] || customModels[targetGroup.name]) : undefined;
    const enabledCustom = Array.isArray(pCustom) ? pCustom.filter(m => m.enabled) : [];
    
    let newModelId = targetGroup.models[0]?.value || '';
    if (enabledCustom.length > 0) {
      newModelId = enabledCustom[0].id;
    }
    setSelectedModelId(newModelId);
    localStorage.setItem('chatterbot_diagram_model', newModelId);
    if (onModelChange) onModelChange(newModelId);

    setIsProviderMenuOpen(false);
    setProviderSearchQuery('');
  };

  const handleSelectModel = (modelValue: string) => {
    setSelectedModelId(modelValue);
    localStorage.setItem('chatterbot_diagram_model', modelValue);
    if (onModelChange) onModelChange(modelValue);
    setIsModelMenuOpen(false);
    setModelSearchQuery('');
  };

  const [aiPromptInput, setAiPromptInput] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileActiveTab, setMobileActiveTab] = useState<'editor' | 'canvas'>('editor');

  // Recent Prompts History
  const [recentPrompts, setRecentPrompts] = useState<string[]>([
    '🌳 Decision tree for loan eligibility with Gini splits',
    '⚖️ SVM separating hyperplane with margins and support vectors',
    '🔍 RAG Pipeline: PDF -> Chunking -> Milvus -> Gemini'
  ]);

  // Multi-Turn Copilot Message Thread
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessageItem[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: 'Welcome to the AI Diagram Copilot! Ask me to generate or modify any Machine Learning, Neural Architecture, Mathematical Curve, or System Diagram.',
      timestamp: Date.now(),
      modelUsed: 'Prof. Joe Diagram Engine'
    }
  ]);

  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const diagramMenuRef = useRef<HTMLDivElement>(null);
  const providerMenuRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const copilotEndRef = useRef<HTMLDivElement>(null);

  // Filter templates based on selected category
  const filteredTemplates = TEMPLATES.filter(
    t => selectedCategory === 'all' || t.category === selectedCategory
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
      if (diagramMenuRef.current && !diagramMenuRef.current.contains(e.target as Node)) {
        setIsDiagramMenuOpen(false);
      }
      if (providerMenuRef.current && !providerMenuRef.current.contains(e.target as Node)) {
        setIsProviderMenuOpen(false);
      }
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll copilot messages
  useEffect(() => {
    if (studioMode === 'copilot') {
      copilotEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [copilotMessages, studioMode]);

  const handleRender = async (sourceOverride?: string, engineOverride?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    const codeToRender = sourceOverride !== undefined ? sourceOverride : diagramSource;
    const engineToUse = engineOverride !== undefined ? engineOverride : activeEngine;

    try {
      const svg = await fetchKrokiSvg(engineToUse, codeToRender);
      setRenderedSvg(svg);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to render diagram on engine');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRender();
  }, [selectedTemplate.id]);

  // AI Generation Handler (Shared across Quick Deck and Copilot)
  const handleExecuteAiGenerate = async (promptToRun?: string) => {
    const query = (promptToRun || aiPromptInput).trim();
    if (!query || isAiGenerating) return;

    setIsAiGenerating(true);
    setAiError(null);
    setAiPromptInput('');

    // Push user message to Copilot thread
    const userMsgId = `user-${Date.now()}`;
    const newCopilotThread: CopilotMessageItem[] = [
      ...copilotMessages,
      {
        id: userMsgId,
        role: 'user',
        content: query,
        timestamp: Date.now()
      }
    ];
    setCopilotMessages(newCopilotThread);

    // Update recent prompts
    setRecentPrompts(prev => [query, ...prev.filter(p => p !== query)].slice(0, 6));

    try {
      const result = await generateDiagramWithAi(
        query,
        selectedProviderId,
        selectedModelId,
        userKeys,
        diagramSource,
        activeEngine,
        newCopilotThread.map(m => ({ role: m.role, content: m.code ? `${m.content}\n\`\`\`${m.engine || 'mermaid'}\n${m.code}\n\`\`\`` : m.content }))
      );

      // Apply code and engine
      setDiagramSource(result.code);
      setActiveEngine(result.engine);

      // Add assistant response to thread
      const assistantMsgId = `assistant-${Date.now()}`;
      setCopilotMessages(prev => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: result.explanation || `Generated ${result.engine.toUpperCase()} diagram for "${query}"`,
          code: result.code,
          engine: result.engine,
          explanation: result.explanation,
          timestamp: Date.now(),
          modelUsed: result.modelUsed
        }
      ]);

      // Trigger instant rendering
      await handleRender(result.code, result.engine);
    } catch (err: any) {
      const errorStr = err?.message || 'Failed to generate diagram with AI. Please check API Key configuration.';
      setAiError(errorStr);
      setCopilotMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error generating diagram: ${errorStr}`,
          timestamp: Date.now(),
          modelUsed: selectedModelId
        }
      ]);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSvg = () => {
    if (!renderedSvg) return;
    const blob = new Blob([renderedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagram-${activeEngine}-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportImage = (format: 'png' | 'jpeg') => {
    if (!renderedSvg) return;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(renderedSvg, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');
      if (!svgEl) return;

      let width = parseFloat(svgEl.getAttribute('width') || '0');
      let height = parseFloat(svgEl.getAttribute('height') || '0');

      if (!width || !height) {
        const viewBox = svgEl.getAttribute('viewBox');
        if (viewBox) {
          const parts = viewBox.split(/[\s,]+/).map(Number);
          if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
            width = parts[2];
            height = parts[3];
          }
        }
      }

      if (!width || isNaN(width)) width = 800;
      if (!height || isNaN(height)) height = 600;

      svgEl.setAttribute('width', `${width}px`);
      svgEl.setAttribute('height', `${height}px`);
      const cleanSvg = new XMLSerializer().serializeToString(svgEl);

      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanSvg)}`;
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2; // 2x High-DPI
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (format === 'jpeg') {
          ctx.fillStyle = '#0b1329';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const imgUrl = canvas.toDataURL(mimeType, 0.95);

        const a = document.createElement('a');
        a.href = imgUrl;
        a.download = `diagram-${activeEngine}-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      img.src = dataUrl;
    } catch (err) {
      console.error('Failed to export image:', err);
    }
  };

  const activeCategoryObj = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  return (
    <div className="diagram-studio-container">
      {/* ─── 1. TOP HEADER & STUDIO MODE PILL SWITCHER ─── */}
      <div className="studio-header" style={{ overflow: 'visible', zIndex: 100 }}>
        <div className="studio-title-area">
          <div className="studio-icon-badge">
            <Layers size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Kroki & Math Diagram Studio
              </h2>
              <span className="engine-active-pill">
                9 ENGINES ACTIVE
              </span>
            </div>
            <p className="subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Two-tier visual builder with 48+ ML, Neural, Math & System Architecture models
            </p>
          </div>
        </div>

        {/* Studio Mode Switcher Pills */}
        <div className="studio-mode-pillbar">
          <button
            type="button"
            onClick={() => setStudioMode('quick_deck')}
            className={`studio-mode-btn ${studioMode === 'quick_deck' ? 'active-quick' : ''}`}
            title="Fast 1-Click AI Prompt Deck above Canvas"
          >
            <Sparkles size={14} />
            <span>⚡ Quick AI Deck</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode('copilot')}
            className={`studio-mode-btn ${studioMode === 'copilot' ? 'active-copilot' : ''}`}
            title="3-Column Multi-Turn Conversational Copilot"
          >
            <Bot size={14} />
            <span>💬 AI Copilot Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode('standard')}
            className={`studio-mode-btn ${studioMode === 'standard' ? 'active-standard' : ''}`}
            title="Standard Manual Code & Template Editor"
          >
            <Code2 size={14} />
            <span>📐 Standard</span>
          </button>
        </div>

        {/* Template Controls */}
        <div className="studio-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'visible', zIndex: 100 }}>
          {/* Category Dropdown */}
          <div className="relative inline-block" ref={categoryMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setIsCategoryMenuOpen(!isCategoryMenuOpen);
                setIsDiagramMenuOpen(false);
              }}
              className="custom-dropdown-pill"
              title="Filter by Domain / Subject Category"
              style={{ height: '38px', padding: '0 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>{activeCategoryObj.icon}</span>
              <span style={{ fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeCategoryObj.name}
              </span>
              <ChevronDown size={14} className="text-slate-400" style={{ flexShrink: 0 }} />
            </button>

            {isCategoryMenuOpen && (
              <div className="custom-dropdown-menu diagram-menu top-downward-menu" style={{ minWidth: '280px', width: '280px', maxHeight: '380px', overflowY: 'auto' }}>
                <div className="dropdown-header">DIAGRAM CATEGORIES</div>
                {CATEGORIES.map(c => {
                  const isSelected = c.id === selectedCategory;
                  const count = c.id === 'all' ? TEMPLATES.length : TEMPLATES.filter(t => t.category === c.id).length;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(c.id);
                        setIsCategoryMenuOpen(false);
                        const nextTemplates = TEMPLATES.filter(t => c.id === 'all' || t.category === c.id);
                        if (nextTemplates.length > 0) {
                          setSelectedTemplate(nextTemplates[0]);
                          setDiagramSource(nextTemplates[0].code);
                          setActiveEngine(nextTemplates[0].engine);
                        }
                      }}
                      className={`dropdown-item flex items-center justify-between gap-3 w-full ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="flex items-center gap-2" style={{ overflow: 'hidden' }}>
                        <span>{c.icon}</span>
                        <span className="truncate" style={{ fontSize: '0.82rem' }}>{c.name}</span>
                      </div>
                      <span className="category-count-badge">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Template Dropdown */}
          <div className="relative inline-block" ref={diagramMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setIsDiagramMenuOpen(!isDiagramMenuOpen);
                setIsCategoryMenuOpen(false);
              }}
              className="custom-dropdown-pill"
              title="Select Specific Diagram Template"
              style={{ height: '38px', padding: '0 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '11px', fontWeight: 700 }}>[{activeEngine}]</span>
              <span style={{ fontWeight: 600, maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedTemplate.name}
              </span>
              <ChevronDown size={14} className="text-slate-400" style={{ flexShrink: 0 }} />
            </button>

            {isDiagramMenuOpen && (
              <div className="custom-dropdown-menu diagram-menu top-downward-menu" style={{ minWidth: '380px', width: '380px', maxHeight: '420px', overflowY: 'auto' }}>
                <div className="dropdown-header">
                  TEMPLATES ({filteredTemplates.length}) — {activeCategoryObj.name.toUpperCase()}
                </div>
                {filteredTemplates.map(t => {
                  const isSelected = t.id === selectedTemplate.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(t);
                        setDiagramSource(t.code);
                        setActiveEngine(t.engine);
                        setIsDiagramMenuOpen(false);
                      }}
                      className={`dropdown-item flex items-center justify-between gap-2 w-full ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="flex items-center gap-2 truncate" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '10.5px', fontWeight: 700 }}>[{t.engine}]</span>
                        <span className="truncate" style={{ fontSize: '0.82rem' }}>{t.name}</span>
                      </div>
                      {isSelected && <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Render Diagram Button */}
          <button
            type="button"
            onClick={() => handleRender()}
            disabled={isLoading}
            className="kroki-render-btn"
            title="Render Diagram from source code"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Rendering...' : 'Render Diagram'}</span>
          </button>

          {/* Unified AI Provider Picker */}
          <div className="relative inline-block" ref={providerMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setIsProviderMenuOpen(!isProviderMenuOpen);
                setIsModelMenuOpen(false);
                setIsCategoryMenuOpen(false);
                setIsDiagramMenuOpen(false);
              }}
              className="custom-dropdown-pill"
              title="Select AI Provider"
              style={{ height: '38px', padding: '0 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '7px' }}
            >
              <span style={{ color: '#38bdf8', fontSize: '12px' }}>⚡</span>
              <span style={{ fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeProvider.name}
              </span>
              <ChevronDown size={14} className="text-slate-400" style={{ flexShrink: 0 }} />
            </button>
            {isProviderMenuOpen && (
              <div className="custom-dropdown-menu diagram-menu top-downward-menu dropdown-align-left" style={{ minWidth: '240px', width: '240px', maxHeight: '420px', overflowY: 'auto' }}>
                <div className="dropdown-header">SELECT AI PROVIDER ({PROVIDERS.length})</div>
                <div style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '4px 8px' }}>
                    <Search size={12} className="text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter providers..."
                      value={providerSearchQuery}
                      onChange={e => setProviderSearchQuery(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.78rem', width: '100%' }}
                    />
                  </div>
                </div>
                {filteredProviders.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProvider(p.id)}
                    className={`dropdown-item flex items-center justify-between gap-2 w-full ${p.id === selectedProviderId ? 'selected' : ''}`}
                  >
                    <span style={{ fontSize: '0.82rem' }}>{p.name}</span>
                    {p.id === selectedProviderId && <span style={{ color: '#38bdf8', fontSize: '0.8rem' }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Unified AI Model Picker */}
          <div className="relative inline-block" ref={modelMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setIsModelMenuOpen(!isModelMenuOpen);
                setIsProviderMenuOpen(false);
                setIsCategoryMenuOpen(false);
                setIsDiagramMenuOpen(false);
              }}
              className="custom-dropdown-pill"
              title="Select AI Model for Code Generation & Copilot"
              style={{ height: '38px', padding: '0 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '7px' }}
            >
              <span style={{ color: '#c084fc', fontSize: '12px' }}>🤖</span>
              <span style={{ fontWeight: 600, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentModelName}
              </span>
              <ChevronDown size={14} className="text-slate-400" style={{ flexShrink: 0 }} />
            </button>
            {isModelMenuOpen && (
              <div className="custom-dropdown-menu diagram-menu top-downward-menu dropdown-align-left" style={{ minWidth: '310px', width: '310px', maxHeight: '420px', overflowY: 'auto' }}>
                <div className="dropdown-header">AVAILABLE MODELS ({activeProvider.name})</div>
                <div style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '4px 8px' }}>
                    <Search size={12} className="text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search models..."
                      value={modelSearchQuery}
                      onChange={e => setModelSearchQuery(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.78rem', width: '100%' }}
                    />
                  </div>
                </div>
                {filteredModels.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => handleSelectModel(m.value)}
                    className={`dropdown-item flex items-center justify-between gap-2 w-full ${m.value === selectedModelId ? 'selected' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <span className="truncate" style={{ fontSize: '0.82rem' }}>{m.name}</span>
                    </div>
                    {m.value === selectedModelId && <span style={{ color: '#38bdf8', fontSize: '0.8rem', flexShrink: 0 }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs (Only visible on screens <= 1024px) */}
      <div className="diagram-mobile-tab-nav">
        <button
          type="button"
          onClick={() => setMobileActiveTab('editor')}
          className={`diagram-mobile-tab-btn ${mobileActiveTab === 'editor' ? 'active' : ''}`}
        >
          <Code2 size={15} />
          <span>Prompt & Code Editor</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab('canvas')}
          className={`diagram-mobile-tab-btn ${mobileActiveTab === 'canvas' ? 'active' : ''}`}
        >
          <ImageIcon size={15} />
          <span>Rendered Diagram Canvas</span>
        </button>
      </div>

      {/* ─── 2. MODE 1: COLLAPSIBLE TOP AI PROMPT DECK ─── */}
      {studioMode === 'quick_deck' && (
        <div className={`ai-prompt-deck diagram-pane-editor ${mobileActiveTab === 'editor' ? 'mobile-active' : 'mobile-hidden'}`}>
          <div className="prompt-deck-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', display: 'flex' }}>
                <Bot size={16} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Diagram Prompt Deck
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>| Natural language prompt to visual code</span>
            </div>

            {/* Active Model Indicator & Collapse Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(51, 65, 85, 0.7)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Active AI Model (Change via toolbar above)"
              >
                <span style={{ color: '#38bdf8' }}>⚡</span>
                <span style={{ color: '#e2e8f0' }}>{activeProvider.name}</span>
                <span style={{ color: '#64748b' }}>•</span>
                <span style={{ color: '#c084fc', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentModelName}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsDeckCollapsed(!isDeckCollapsed)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex' }}
                title={isDeckCollapsed ? 'Expand Deck' : 'Collapse Deck'}
              >
                {isDeckCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>
          </div>

          {!isDeckCollapsed && (
            <>
              {/* Input Prompt Bar */}
              <div className="deck-input-row">
                <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
                  <input
                    type="text"
                    value={aiPromptInput}
                    onChange={e => setAiPromptInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleExecuteAiGenerate();
                    }}
                    placeholder="e.g. Draw a Support Vector Machine with separating line and 3 labeled support vectors..."
                    className="deck-text-input"
                  />
                  {aiPromptInput && (
                    <button
                      type="button"
                      onClick={() => setAiPromptInput('')}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleExecuteAiGenerate()}
                  disabled={isAiGenerating || !aiPromptInput.trim()}
                  className="deck-generate-btn"
                >
                  {isAiGenerating ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Generating Code...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>✨ Generate & Apply</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Template Chips & Recent History */}
              <div className="deck-chips-group">
                {recentPrompts.length > 0 && (
                  <div className="deck-chip-row">
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px', flexShrink: 0 }}>
                      🕒 Recent:
                    </span>
                    {recentPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleExecuteAiGenerate(p)}
                        disabled={isAiGenerating}
                        className="deck-chip-recent"
                        title={p}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                <div className="deck-chip-row">
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px', flexShrink: 0 }}>
                    Suggested:
                  </span>
                  {DEFAULT_QUICK_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleExecuteAiGenerate(chip)}
                      disabled={isAiGenerating}
                      className="deck-chip-pill"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {aiError && (
            <div style={{ marginTop: '8px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(153, 27, 27, 0.4)', border: '1px solid rgba(220, 38, 38, 0.6)', color: '#fecaca', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>⚠️ {aiError}</span>
              <button type="button" onClick={() => setAiError(null)} style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>✕</button>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(153, 27, 27, 0.4)', border: '1px solid rgba(220, 38, 38, 0.6)', color: '#fecaca', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ─── 3. WORKSPACE GRIDS ─── */}
      {studioMode === 'copilot' ? (
        /* ─── MODE 2: 3-COLUMN COPILOT WORKSPACE ─── */
        <div className="copilot-3col-grid">
          {/* Column 1: AI Copilot Chat Thread */}
          <div className={`copilot-chat-panel diagram-pane-editor ${mobileActiveTab === 'editor' ? 'mobile-active' : 'mobile-hidden'}`}>
            <div className="copilot-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '4px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', display: 'flex' }}>
                  <Bot size={15} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e9d5ff' }}>AI Copilot Thread</span>
              </div>
              <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                {currentModelName}
              </span>
            </div>

            <div className="copilot-messages-list">
              {copilotMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`copilot-msg-bubble ${msg.role === 'user' ? 'copilot-msg-user' : 'copilot-msg-assistant'}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600 }}>
                    <span>{msg.role === 'user' ? '👤 YOU' : `🤖 ${msg.modelUsed || 'COPILOT'}`}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>

                  {msg.code && (
                    <div className="copilot-code-preview">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.66rem', fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                          [{msg.engine || 'CODE'}]
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(msg.code!, msg.id)}
                            style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600, background: 'rgba(30, 41, 59, 0.9)', color: '#cbd5e1', border: '1px solid rgba(51, 65, 85, 0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {copiedId === msg.id ? <Check size={10} style={{ color: '#34d399' }} /> : <Copy size={10} />}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDiagramSource(msg.code!);
                              if (msg.engine) setActiveEngine(msg.engine);
                              handleRender(msg.code!, msg.engine);
                            }}
                            style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', border: '1px solid rgba(6, 182, 212, 0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Sparkles size={10} />
                            <span>⚡ Apply</span>
                          </button>
                        </div>
                      </div>
                      <pre style={{ margin: 0, fontSize: '0.72rem', fontFamily: 'monospace', color: '#e2e8f0', maxHeight: '100px', overflowY: 'auto', padding: '6px', background: '#090d16', borderRadius: '6px' }}>
                        {msg.code}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
              <div ref={copilotEndRef} />
            </div>

            <div className="copilot-input-bar">
              <input
                type="text"
                value={aiPromptInput}
                onChange={e => setAiPromptInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleExecuteAiGenerate();
                }}
                placeholder="Ask copilot to modify or create..."
                className="copilot-text-input"
              />
              <button
                type="button"
                onClick={() => handleExecuteAiGenerate()}
                disabled={isAiGenerating || !aiPromptInput.trim()}
                className="copilot-send-btn"
                title="Send prompt to Copilot"
              >
                {isAiGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>

          {/* Column 2: Code Editor Pane */}
          <div
            className={`editor-card card-box diagram-pane-editor ${mobileActiveTab === 'editor' ? 'mobile-active' : 'mobile-hidden'}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-secondary, #0f172a)',
              border: '1px solid var(--border-color, #1e293b)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color, #1e293b)',
                background: 'rgba(15, 23, 42, 0.6)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code2 size={15} className="text-cyan-400" />
                <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#f8fafc' }}>Source Editor</span>
                <span className="engine-active-pill">{activeEngine.toUpperCase()}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(diagramSource, 'main-editor')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                {copiedId === 'main-editor' ? <Check size={12} style={{ color: '#34d399' }} /> : <Copy size={12} />}
                <span>{copiedId === 'main-editor' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <textarea
              value={diagramSource}
              onChange={e => setDiagramSource(e.target.value)}
              className="scrollbar-thin"
              placeholder="Enter diagram source code..."
              spellCheck={false}
              style={{
                flex: 1,
                padding: '14px',
                background: 'transparent',
                color: '#f8fafc',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                border: 'none',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.5
              }}
            />
          </div>

          {/* Column 3: Vector SVG Preview Pane */}
          <div
            className={`preview-card card-box diagram-pane-canvas ${mobileActiveTab === 'canvas' ? 'mobile-active' : 'mobile-hidden'}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-secondary, #0f172a)',
              border: '1px solid var(--border-color, #1e293b)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color, #1e293b)',
                background: 'rgba(15, 23, 42, 0.6)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={15} className="text-cyan-400" />
                <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#f8fafc' }}>Live Vector Preview</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  disabled={!renderedSvg}
                  className="export-pill-btn export-btn-svg"
                  title="Export Clean Scalable Vector SVG"
                >
                  <Download size={12} style={{ color: '#38bdf8' }} />
                  <span>SVG</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportImage('png')}
                  disabled={!renderedSvg}
                  className="export-pill-btn export-btn-png"
                  title="Export High-Resolution PNG (Retina 2x)"
                >
                  <ImageIcon size={12} style={{ color: '#34d399' }} />
                  <span>PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportImage('jpeg')}
                  disabled={!renderedSvg}
                  className="export-pill-btn export-btn-jpeg"
                  title="Export High-Resolution JPEG Image"
                >
                  <FileImage size={12} style={{ color: '#fbbf24' }} />
                  <span>JPEG</span>
                </button>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
                position: 'relative',
                background: 'rgba(2, 6, 23, 0.5)'
              }}
            >
              {isLoading && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(3, 7, 18, 0.8)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    zIndex: 10
                  }}
                >
                  <RefreshCw size={24} className="animate-spin text-cyan-400" />
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Rendering vector graphic...</span>
                </div>
              )}

              {renderedSvg ? (
                <div
                  style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '520px' }}
                  dangerouslySetInnerHTML={{ __html: renderedSvg }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                  Click "Render Diagram" to compile vector graphic
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ─── MODES 1 & 3: 50/50 SPLIT EDITOR & LIVE PREVIEW ─── */
        <div
          className="diagram-studio-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '20px',
            alignItems: 'stretch'
          }}
        >
          {/* Left Side: Code Editor */}
          <div
            className={`editor-card card-box diagram-pane-editor ${mobileActiveTab === 'editor' ? 'mobile-active' : 'mobile-hidden'}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-secondary, #0f172a)',
              border: '1px solid var(--border-color, #1e293b)',
              borderRadius: '16px',
              overflow: 'hidden',
              height: '560px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color, #1e293b)',
                background: 'rgba(15, 23, 42, 0.6)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code2 size={16} className="text-cyan-400" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                  Source Code ({activeEngine.toUpperCase()})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleCopyCode(diagramSource, 'split-editor')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(51, 65, 85, 0.7)',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedId === 'split-editor' ? <Check size={12} style={{ color: '#34d399' }} /> : <Copy size={12} />}
                  <span>{copiedId === 'split-editor' ? 'Copied' : 'Copy'}</span>
                </button>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Edit code or JSON</span>
              </div>
            </div>

            <textarea
              value={diagramSource}
              onChange={e => setDiagramSource(e.target.value)}
              placeholder="Enter diagram source code..."
              spellCheck={false}
              style={{
                flex: 1,
                width: '100%',
                padding: '16px',
                background: 'transparent',
                color: '#f8fafc',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                border: 'none',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.5
              }}
            />
          </div>

          {/* Right Side: Live SVG Preview */}
          <div
            className={`preview-card card-box diagram-pane-canvas ${mobileActiveTab === 'canvas' ? 'mobile-active' : 'mobile-hidden'}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-secondary, #0f172a)',
              border: '1px solid var(--border-color, #1e293b)',
              borderRadius: '16px',
              overflow: 'hidden',
              height: '560px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color, #1e293b)',
                background: 'rgba(15, 23, 42, 0.6)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} className="text-cyan-400" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                  Live Vector SVG Preview
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  disabled={!renderedSvg}
                  className="export-pill-btn export-btn-svg"
                  title="Export Clean Scalable Vector SVG"
                >
                  <Download size={13} style={{ color: '#38bdf8' }} />
                  <span>SVG</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportImage('png')}
                  disabled={!renderedSvg}
                  className="export-pill-btn export-btn-png"
                  title="Export High-Resolution PNG (Retina 2x)"
                >
                  <ImageIcon size={13} style={{ color: '#34d399' }} />
                  <span>PNG</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportImage('jpeg')}
                  disabled={!renderedSvg}
                  className="export-pill-btn export-btn-jpeg"
                  title="Export High-Resolution JPEG Image"
                >
                  <FileImage size={13} style={{ color: '#fbbf24' }} />
                  <span>JPEG</span>
                </button>
              </div>
            </div>

            <div
              className="svg-display-area"
              style={{
                flex: 1,
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
                position: 'relative',
                background: 'rgba(2, 6, 23, 0.5)'
              }}
            >
              {isLoading && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(3, 7, 18, 0.8)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    zIndex: 10
                  }}
                >
                  <RefreshCw size={28} className="animate-spin text-cyan-400" />
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Rendering vector graphic...</span>
                </div>
              )}

              {renderedSvg ? (
                <div
                  style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  dangerouslySetInnerHTML={{ __html: renderedSvg }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  Click "Render Diagram" to compile vector graphic
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
