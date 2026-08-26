import { describe, it, expect } from 'vitest';
import {
  sigmoid,
  softmax,
  binaryCrossEntropy,
  categoricalCrossEntropy,
  classifySoftmax3Class
} from '../../utils/math_studio/logisticSoftmax';

describe('Logistic Regression & Multi-Class Softmax Engine', () => {
  describe('Pillar 1: Textbook Mathematical Oracles', () => {
    it('should evaluate Sigmoid at z = 0 equal to exactly 0.5', () => {
      expect(sigmoid(0)).toBe(0.5);
    });

    it('should evaluate Sigmoid standard reference values', () => {
      // sigma(2) = 1 / (1 + e^-2) ~= 0.880797
      expect(sigmoid(2)).toBeCloseTo(0.880797, 5);
      // sigma(-2) = 1 / (1 + e^2) ~= 0.119203
      expect(sigmoid(-2)).toBeCloseTo(0.119203, 5);
    });

    it('should compute zero loss for perfect confident predictions', () => {
      expect(binaryCrossEntropy(1, 1.0)).toBeCloseTo(0, 5);
      expect(binaryCrossEntropy(0, 0.0)).toBeCloseTo(0, 5);
      expect(categoricalCrossEntropy(0, [1.0, 0.0, 0.0])).toBeCloseTo(0, 5);
    });

    it('should compute high loss for wrong confident predictions', () => {
      // Predicting p=0.01 when y=1 -> -ln(0.01) ~= 4.605
      expect(binaryCrossEntropy(1, 0.01)).toBeCloseTo(4.605, 2);
    });
  });

  describe('Pillar 2: Mathematical Probability Invariants', () => {
    it('should satisfy Sigmoid symmetry invariant: sigma(-z) = 1 - sigma(z)', () => {
      const zVals = [-5, -2.5, -1, 0, 1, 2.5, 5];
      for (const z of zVals) {
        expect(sigmoid(-z) + sigmoid(z)).toBeCloseTo(1.0, 8);
      }
    });

    it('should satisfy Probability Axiom: Softmax probabilities sum to exactly 1.0', () => {
      const logitSets = [
        [1.0, 2.0, 3.0],
        [-10, 0, 10],
        [100, 200, 300], // Numerical stability test
        [0.1, 0.1, 0.1],
      ];

      for (const logits of logitSets) {
        const probs = softmax(logits);
        const sum = probs.reduce((acc, v) => acc + v, 0);
        expect(sum).toBeCloseTo(1.0, 6);
        for (const p of probs) {
          expect(p).toBeGreaterThan(0);
          expect(p).toBeLessThanOrEqual(1.0);
        }
      }
    });

    it('should classify 3-class territory with partition of unity', () => {
      const protos = [
        { x: -1, y: 1, weight: 2.0 },
        { x: 1, y: 1, weight: 2.0 },
        { x: 0, y: -1, weight: 2.0 },
      ];

      const res = classifySoftmax3Class(0, 0, protos);
      const sumProb = res.probabilities.reduce((a, b) => a + b, 0);
      expect(sumProb).toBeCloseTo(1.0, 5);
    });
  });

  describe('Pillar 3: Chaos & Numerical Stability Stress Cases', () => {
    it('should prevent overflow on huge positive and negative logits (max trick)', () => {
      const hugeLogits = [1000, 1001, 1002];
      const probs = softmax(hugeLogits);
      expect(probs[0]).not.toBeNaN();
      expect(probs[2]).toBeGreaterThan(probs[1]);
    });
  });
});
