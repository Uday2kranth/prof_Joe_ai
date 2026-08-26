import { describe, it, expect } from 'vitest';
import {
  relu,
  reluDeriv,
  leakyRelu,
  leakyReluDeriv,
  tanhActivation,
  tanhDeriv,
  gelu,
  geluDeriv,
  sigmoid,
  softmax,
  computeForwardLayer,
  computeMseLoss,
  binaryCrossEntropy,
  evaluateActivation,
  evaluateActivationDeriv
} from '../../utils/math_studio/logisticSoftmax';

describe('Deep Learning & Neural Network Pure Math Engine Tests', () => {
  describe('Activation Functions Ground-Truth Values', () => {
    it('should evaluate ReLU correctly for positive and negative values', () => {
      expect(relu(2.5)).toBe(2.5);
      expect(relu(-3.0)).toBe(0);
      expect(relu(0)).toBe(0);
      expect(reluDeriv(2.5)).toBe(1);
      expect(reluDeriv(-3.0)).toBe(0);
    });

    it('should evaluate Leaky ReLU with custom alpha slope', () => {
      expect(leakyRelu(2.0, 0.05)).toBe(2.0);
      expect(leakyRelu(-4.0, 0.05)).toBeCloseTo(-0.20, 5);
      expect(leakyReluDeriv(2.0, 0.05)).toBe(1);
      expect(leakyReluDeriv(-4.0, 0.05)).toBe(0.05);
    });

    it('should evaluate tanh and its analytical derivative (1 - tanh^2)', () => {
      expect(tanhActivation(0)).toBe(0);
      expect(tanhActivation(1.0)).toBeCloseTo(0.761594, 5);
      expect(tanhDeriv(0)).toBe(1.0); // 1 - 0^2 = 1
      expect(tanhDeriv(1.0)).toBeCloseTo(1 - Math.tanh(1.0) ** 2, 6);
    });

    it('should evaluate GELU activation and show non-monotonic inflection', () => {
      // GELU(0) = 0
      expect(gelu(0)).toBe(0);
      // GELU(1) ≈ 0.8413
      expect(gelu(1.0)).toBeCloseTo(0.84119, 4);
      // GELU(-1) ≈ -0.1587
      expect(gelu(-1.0)).toBeCloseTo(-0.1588, 3);
      // Derivative at 0 ≈ 0.5
      expect(geluDeriv(0)).toBeCloseTo(0.5, 4);
    });

    it('should match numerical finite-difference derivatives within 1e-4 tolerance', () => {
      const h = 1e-5;
      const testPoints = [-1.5, -0.5, 0.3, 1.2, 2.0];
      const activations: Array<'sigmoid' | 'tanh' | 'gelu'> = ['sigmoid', 'tanh', 'gelu'];

      for (const act of activations) {
        for (const z of testPoints) {
          const numerical = (evaluateActivation(z + h, act) - evaluateActivation(z - h, act)) / (2 * h);
          const analytical = evaluateActivationDeriv(z, act);
          expect(analytical).toBeCloseTo(numerical, 3);
        }
      }
    });
  });

  describe('Feedforward Dense Layer & Loss Functions', () => {
    it('should accurately compute Dense layer pre-activations and activations (a = f(Wx + b))', () => {
      // 2 inputs, 2 output neurons
      const inputs = [1.0, 2.0];
      const weights = [
        [0.5, -0.5], // Neuron 0: 0.5*1.0 + (-0.5)*2.0 + 0.5 = -0.5 + 0.5 = 0.0
        [1.0, 0.5],  // Neuron 1: 1.0*1.0 + 0.5*2.0 + 1.0 = 1.0 + 1.0 + 1.0 = 3.0
      ];
      const biases = [0.5, 1.0];

      const { preActivations, activations } = computeForwardLayer(inputs, weights, biases, 'relu');

      expect(preActivations[0]).toBeCloseTo(0.0, 5);
      expect(preActivations[1]).toBeCloseTo(3.0, 5);
      expect(activations[0]).toBe(0.0); // relu(0) = 0
      expect(activations[1]).toBe(3.0); // relu(3) = 3
    });

    it('should compute MSE Loss correctly', () => {
      const preds = [0.8, 0.2, 0.9];
      const targets = [1.0, 0.0, 1.0];
      // ( (0.2)^2 + (0.2)^2 + (0.1)^2 ) / 3 = (0.04 + 0.04 + 0.01) / 3 = 0.09 / 3 = 0.03
      expect(computeMseLoss(preds, targets)).toBeCloseTo(0.03, 5);
    });

    it('should compute Binary Cross Entropy Loss correctly', () => {
      // y=1, p=0.8 -> -ln(0.8) ≈ 0.22314
      expect(binaryCrossEntropy(1, 0.8)).toBeCloseTo(0.22314, 4);
      // y=0, p=0.1 -> -ln(0.9) ≈ 0.10536
      expect(binaryCrossEntropy(0, 0.1)).toBeCloseTo(0.10536, 4);
    });
  });
});
