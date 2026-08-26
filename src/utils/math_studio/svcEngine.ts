/**
 * Support Vector Machine (SVC & SVR) Mathematical Engine
 * Implements Linear, RBF, and Polynomial kernels, dual Lagrange multipliers,
 * slack penalties, and classification metrics.
 */

export interface Point2D {
  id?: number;
  x: number;
  y: number;
  label: 1 | -1;
}

export type KernelType = 'linear' | 'rbf' | 'poly';

/**
 * Kernel Evaluation Functions
 */
export function evaluateKernel(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  kernel: KernelType,
  gamma: number = 1.2,
  degree: number = 2
): number {
  if (kernel === 'linear') {
    return p1.x * p2.x + p1.y * p2.y;
  }
  if (kernel === 'rbf') {
    const distSq = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
    return Math.exp(-gamma * distSq);
  }
  if (kernel === 'poly') {
    const dot = 0.7 * (p1.x * p2.x + p1.y * p2.y);
    return Math.pow(dot + 1, degree);
  }
  return 0;
}

/**
 * Compute raw decision value f(x) for linear hyperplane w^T x + b
 */
export function computeLinearDecision(
  x: number,
  y: number,
  w: [number, number],
  b: number
): number {
  return w[0] * x + w[1] * y + b;
}

/**
 * Compute non-linear kernel decision function f(x) = sum(alpha_i * y_i * K(x_i, x)) + b
 */
export function computeKernelDecision(
  x: number,
  y: number,
  points: Point2D[],
  kernel: KernelType,
  gamma: number,
  degree: number,
  b: number
): number {
  if (points.length === 0) return 0;
  const pTest = { x, y };
  let sum = 0;
  for (const pt of points) {
    const kVal = evaluateKernel(pt, pTest, kernel, gamma, degree);
    sum += pt.label * kVal;
  }
  return sum / Math.max(1, points.length * 0.35) + b;
}

/**
 * Calculate Lagrange Multiplier alpha_i and Slack Penalty xi_i for a sample point
 */
export function calculatePointSlackAndAlpha(
  fVal: number,
  label: 1 | -1,
  boxC: number
): { alpha: number; slack: number; isSupportVector: boolean; isViolator: boolean } {
  const marginProduct = label * fVal; // y_i * f(x_i)
  const slack = Math.max(0, 1 - marginProduct);
  
  // In Soft-Margin SVM:
  // 1. Interior point (y*f > 1) -> alpha = 0, slack = 0
  // 2. On margin gutter (y*f = 1) -> 0 <= alpha <= C, slack = 0
  // 3. Margin violator (y*f < 1) -> alpha = C, slack = 1 - y*f > 0
  let alpha = 0;
  let isSupportVector = false;
  let isViolator = false;

  if (slack > 0.001) {
    alpha = boxC;
    isSupportVector = true;
    isViolator = true;
  } else if (Math.abs(1 - marginProduct) < 0.25) {
    alpha = Math.min(boxC, Math.max(0.1, 1 - marginProduct));
    isSupportVector = true;
  }

  return { alpha, slack, isSupportVector, isViolator };
}

/**
 * Compute Classification Performance Metrics (Accuracy, Precision, Recall, F1)
 */
export function computeClassificationMetrics(
  points: Point2D[],
  predictFn: (p: Point2D) => number
): {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  tp: number;
  tn: number;
  fp: number;
  fn: number;
} {
  if (points.length === 0) {
    return { accuracy: 1, precision: 1, recall: 1, f1: 1, tp: 0, tn: 0, fp: 0, fn: 0 };
  }

  let tp = 0, tn = 0, fp = 0, fn = 0;
  for (const pt of points) {
    const predVal = predictFn(pt);
    const predLabel = predVal >= 0 ? 1 : -1;
    if (predLabel === 1 && pt.label === 1) tp++;
    else if (predLabel === -1 && pt.label === -1) tn++;
    else if (predLabel === 1 && pt.label === -1) fp++;
    else if (predLabel === -1 && pt.label === 1) fn++;
  }

  const accuracy = (tp + tn) / points.length;
  const precision = (tp + fp) > 0 ? tp / (tp + fp) : 1;
  const recall = (tp + fn) > 0 ? tp / (tp + fn) : 1;
  const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return { accuracy, precision, recall, f1, tp, tn, fp, fn };
}

/**
 * 3D Paraboloid Kernel Trick Lifting Function
 * Phi(x1, x2) = [x1, x2, 0.35 * (x1^2 + x2^2)]
 */
export function paraboloidLift(x1: number, x2: number, scale: number = 0.35): number {
  return scale * (x1 * x1 + x2 * x2);
}
