/**
 * Logistic Regression & Multi-Class Softmax Engine
 * Implements Sigmoid, Multi-Class Softmax normalization, and Binary/Categorical Cross-Entropy Loss.
 */

/**
 * Standard Sigmoid (Logistic) Function
 * sigma(z) = 1 / (1 + exp(-z))
 */
export function sigmoid(z: number): number {
  if (z >= 40) return 1.0;
  if (z <= -40) return 0.0;
  return 1.0 / (1.0 + Math.exp(-z));
}

/**
 * Multi-Class Softmax Function with numerical stability subtraction (max trick)
 * p_k = exp(z_k - max(z)) / sum(exp(z_j - max(z)))
 */
export function softmax(logits: number[]): number[] {
  if (logits.length === 0) return [];
  const maxLogit = Math.max(...logits);
  const expValues = logits.map(z => Math.exp(z - maxLogit));
  const sumExp = expValues.reduce((acc, v) => acc + v, 0);
  return expValues.map(v => v / sumExp);
}

/**
 * Binary Cross-Entropy Loss
 * L(y, p) = -(y * ln(p) + (1 - y) * ln(1 - p))
 */
export function binaryCrossEntropy(y: 0 | 1, p: number): number {
  const eps = 1e-15;
  const clampedP = Math.max(eps, Math.min(1 - eps, p));
  return -(y * Math.log(clampedP) + (1 - y) * Math.log(1 - clampedP));
}

/**
 * Categorical Cross-Entropy Loss
 * L(y_true, p_pred) = -ln(p_pred[targetIndex])
 */
export function categoricalCrossEntropy(targetIndex: number, probabilities: number[]): number {
  const eps = 1e-15;
  if (targetIndex < 0 || targetIndex >= probabilities.length) return 0;
  const p = Math.max(eps, probabilities[targetIndex]);
  return -Math.log(p);
}

/**
 * 2D 3-Class Softmax Territory Classifier
 */
export function classifySoftmax3Class(
  x: number,
  y: number,
  classPrototypes: Array<{ x: number; y: number; weight: number }>
): { logits: number[]; probabilities: number[]; predictedClass: number } {
  // Linear logits based on distance/dot-product to prototypes
  const logits = classPrototypes.map(proto => {
    return proto.weight * (proto.x * x + proto.y * y);
  });
  const probabilities = softmax(logits);
  let maxIdx = 0;
  for (let i = 1; i < probabilities.length; i++) {
    if (probabilities[i] > probabilities[maxIdx]) maxIdx = i;
  }
  return { logits, probabilities, predictedClass: maxIdx };
}

/**
 * Rectified Linear Unit (ReLU)
 */
export function relu(z: number): number {
  return Math.max(0, z);
}

export function reluDeriv(z: number): number {
  return z > 0 ? 1 : 0;
}

/**
 * Leaky ReLU
 */
export function leakyRelu(z: number, alpha: number = 0.01): number {
  return z > 0 ? z : alpha * z;
}

export function leakyReluDeriv(z: number, alpha: number = 0.01): number {
  return z > 0 ? 1 : alpha;
}

/**
 * Hyperbolic Tangent (tanh)
 */
export function tanhActivation(z: number): number {
  return Math.tanh(z);
}

export function tanhDeriv(z: number): number {
  const t = Math.tanh(z);
  return 1 - t * t;
}

/**
 * Gaussian Error Linear Unit (GELU - Hendrycks & Gimpel)
 * GELU(z) = 0.5 * z * (1 + tanh(sqrt(2/pi) * (z + 0.044715 * z^3)))
 */
export function gelu(z: number): number {
  const sqrt2OverPi = Math.sqrt(2 / Math.PI);
  const inner = sqrt2OverPi * (z + 0.044715 * z * z * z);
  return 0.5 * z * (1 + Math.tanh(inner));
}

export function geluDeriv(z: number): number {
  const sqrt2OverPi = Math.sqrt(2 / Math.PI);
  const inner = sqrt2OverPi * (z + 0.044715 * z * z * z);
  const tanhVal = Math.tanh(inner);
  const sechSq = 1 - tanhVal * tanhVal;
  const dInner = sqrt2OverPi * (1 + 3 * 0.044715 * z * z);
  return 0.5 * (1 + tanhVal) + 0.5 * z * sechSq * dInner;
}

export type NeuralActivationType = 'relu' | 'sigmoid' | 'tanh' | 'leaky_relu' | 'gelu';

/**
 * Universal Activation Evaluator
 */
export function evaluateActivation(z: number, type: NeuralActivationType): number {
  switch (type) {
    case 'relu': return relu(z);
    case 'sigmoid': return sigmoid(z);
    case 'tanh': return tanhActivation(z);
    case 'leaky_relu': return leakyRelu(z);
    case 'gelu': return gelu(z);
    default: return z;
  }
}

/**
 * Universal Activation Derivative Evaluator
 */
export function evaluateActivationDeriv(z: number, type: NeuralActivationType): number {
  switch (type) {
    case 'relu': return reluDeriv(z);
    case 'sigmoid': {
      const s = sigmoid(z);
      return s * (1 - s);
    }
    case 'tanh': return tanhDeriv(z);
    case 'leaky_relu': return leakyReluDeriv(z);
    case 'gelu': return geluDeriv(z);
    default: return 1;
  }
}

/**
 * Compute Dense Feedforward Layer: a = activation(W * x + b)
 */
export function computeForwardLayer(
  inputs: number[],
  weights: number[][], // weights[outNeuronIdx][inNeuronIdx]
  biases: number[],
  activation: NeuralActivationType
): { preActivations: number[]; activations: number[] } {
  const numOutputs = weights.length;
  const preActivations: number[] = new Array(numOutputs);
  const activations: number[] = new Array(numOutputs);

  for (let j = 0; j < numOutputs; j++) {
    let dot = biases[j] || 0;
    const row = weights[j];
    for (let i = 0; i < inputs.length; i++) {
      dot += (row[i] || 0) * inputs[i];
    }
    preActivations[j] = dot;
    activations[j] = evaluateActivation(dot, activation);
  }

  return { preActivations, activations };
}

/**
 * Mean Squared Error (MSE) Loss
 */
export function computeMseLoss(predictions: number[], targets: number[]): number {
  if (predictions.length === 0 || predictions.length !== targets.length) return 0;
  let sumSq = 0;
  for (let i = 0; i < predictions.length; i++) {
    sumSq += (predictions[i] - targets[i]) ** 2;
  }
  return sumSq / predictions.length;
}

